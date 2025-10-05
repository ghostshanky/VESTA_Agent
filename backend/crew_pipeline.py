import os
import logging
import re
from typing import List, Dict, Any
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from backend.db import update_feedback_classification, insert_score
import json
from functools import lru_cache

logger = logging.getLogger(__name__)

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"


def extract_json_from_response(response: str) -> str:
    """Extract JSON string from LLM response, handling markdown code blocks."""
    # Try to find JSON in markdown code blocks
    json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
    if json_match:
        return json_match.group(1).strip()
    # If no code block, assume it's raw JSON
    return response.strip()


@lru_cache(maxsize=1)
def get_llm():
    if MOCK_MODE:
        return None

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set. Running in mock mode.")
        return None

    model_name = os.getenv("LLM_MODEL", "gpt-4o-mini")
    temperature = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    base_url = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")

    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        api_key=api_key,
        base_url=base_url
    )


def create_classifier_agent(llm) -> Agent:
    return Agent(
        role="Feedback Classifier",
        goal="Classify customer feedback into sentiment and theme categories",
        backstory=(
            "You are an expert at analyzing customer feedback and identifying patterns. "
            "You can quickly understand the sentiment (positive, neutral, negative) and "
            "categorize feedback into themes like 'Product/Features', 'Performance', 'UX/UI', "
            "'Pricing', 'Service', or 'Other'."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False
    )


def create_evaluator_agent(llm) -> Agent:
    return Agent(
        role="Impact Evaluator",
        goal="Evaluate the urgency and business impact of customer feedback",
        backstory=(
            "You are a product manager with deep understanding of business priorities. "
            "You can assess how urgent a feedback item is (1-10 scale) and what impact "
            "it would have on the business if addressed (1-10 scale). You provide clear "
            "justification for your scores."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False
    )


def create_prioritizer_agent(llm) -> Agent:
    return Agent(
        role="Priority Strategist",
        goal="Generate actionable priority lists for product teams",
        backstory=(
            "You are a strategic product leader who synthesizes feedback analysis into "
            "clear, actionable recommendations. You create concise reports that help teams "
            "focus on what matters most."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False
    )


def classify_feedback_mock(feedback_id: int, text: str) -> Dict[str, Any]:
    sentiments = ["positive", "neutral", "negative"]
    themes = ["Product/Features", "Performance", "UX/UI", "Pricing", "Service", "Other"]

    import hashlib
    hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)

    return {
        "feedback_id": feedback_id,
        "text": text,
        "sentiment": sentiments[hash_val % 3],
        "theme": themes[hash_val % 6],
        "summary": f"Mock summary: {text[:100]}..."
    }


def evaluate_feedback_mock(feedback_id: int, classified: Dict[str, Any]) -> Dict[str, Any]:
    import hashlib
    hash_val = int(hashlib.md5(classified["text"].encode()).hexdigest(), 16)

    urgency = (hash_val % 10) + 1
    impact = ((hash_val // 10) % 10) + 1
    priority_score = round((urgency + impact) / 2, 2)

    return {
        "feedback_id": feedback_id,
        "urgency": urgency,
        "impact": impact,
        "justification": f"Mock justification for {classified['theme']} with {classified['sentiment']} sentiment",
        "priority_score": priority_score
    }


def classify_feedback_with_llm(feedback_id: int, text: str, llm) -> Dict[str, Any]:
    agent = create_classifier_agent(llm)

    task = Task(
        description=f"""Analyze this customer feedback and classify it:

Feedback: {text}

Provide your analysis in the following JSON format:
{{
    "sentiment": "positive|neutral|negative",
    "theme": "Product/Features|Performance|UX/UI|Pricing|Service|Other",
    "summary": "A brief 1-2 sentence summary of the feedback"
}}""",
        agent=agent,
        expected_output="JSON object with sentiment, theme, and summary"
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()

    try:
        cleaned = extract_json_from_response(str(result))
        parsed = json.loads(cleaned)
        return {
            "feedback_id": feedback_id,
            "text": text,
            "sentiment": parsed["sentiment"],
            "theme": parsed["theme"],
            "summary": parsed["summary"]
        }
    except json.JSONDecodeError:
        logger.error(f"Failed to parse LLM response: {result}")
        return classify_feedback_mock(feedback_id, text)


def evaluate_feedback_with_llm(feedback_id: int, classified: Dict[str, Any], llm) -> Dict[str, Any]:
    agent = create_evaluator_agent(llm)

    task = Task(
        description=f"""Evaluate this classified customer feedback:

Feedback: {classified['text']}
Sentiment: {classified['sentiment']}
Theme: {classified['theme']}
Summary: {classified['summary']}

Provide your evaluation in the following JSON format:
{{
    "urgency": "1-10 (integer, how quickly this needs to be addressed)",
    "impact": "1-10 (integer, how much business impact addressing this would have)",
    "justification": "Clear explanation for these scores"
}}""",
        agent=agent,
        expected_output="JSON object with urgency, impact, and justification"
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()

    try:
        # Extract JSON from markdown code block if present
        response_str = str(result)
        json_str = re.search(r'```json\s*(.*?)\s*```', response_str, re.DOTALL)
        if json_str:
            parsed = json.loads(json_str.group(1))
        else:
            parsed = json.loads(response_str)

        urgency = int(parsed["urgency"])
        impact = int(parsed["impact"])
        priority_score = round((urgency + impact) / 2, 2)

        return {
            "feedback_id": feedback_id,
            "urgency": urgency,
            "impact": impact,
            "justification": parsed["justification"],
            "priority_score": priority_score
        }
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.error(f"Failed to parse LLM response: {result}, error: {e}")
        return evaluate_feedback_mock(feedback_id, classified)
        response_str = str(result)
        response_str = str(result)


def process_single_feedback(feedback_id: int, text: str) -> Dict[str, Any]:
    logger.info(f"Processing feedback {feedback_id}")

    llm = get_llm()

    classified = None
    score = None

    if llm is None or MOCK_MODE:
        logger.info("Running in mock mode")
        classified = classify_feedback_mock(feedback_id, text)
        score = evaluate_feedback_mock(feedback_id, classified)
    else:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                classified = classify_feedback_with_llm(feedback_id, text, llm)
                score = evaluate_feedback_with_llm(feedback_id, classified, llm)
                break
            except Exception as e:
                logger.error(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt == max_retries - 1:
                    logger.warning("All retries failed, using mock mode")
                    classified = classify_feedback_mock(feedback_id, text)
                    score = evaluate_feedback_mock(feedback_id, classified)

    update_feedback_classification(
        feedback_id,
        classified["sentiment"],
        classified["theme"],
        classified["summary"]
    )

    insert_score(
        feedback_id,
        score["urgency"],
        score["impact"],
        score["justification"],
        score["priority_score"]
    )

    logger.info(f"Completed processing feedback {feedback_id}")
    return {**classified, **score}


def generate_priority_report(feedback_list: List[Dict[str, Any]]) -> str:
    logger.info("Generating priority report")

    llm = get_llm()

    if not feedback_list:
        return "# Weekly Feedback Priority Report\n\nNo feedback to prioritize this week."

    sorted_feedback = sorted(
        feedback_list,
        key=lambda x: x.get("priority_score") if x.get("priority_score") is not None else 0,
        reverse=True
    )[:5]

    if llm is None or MOCK_MODE:
        report = "# Weekly Feedback Priority Report\n\n"
        report += "## Top 5 Action Items\n\n"

        for i, item in enumerate(sorted_feedback, 1):
            priority_score = item.get('priority_score') or 0
            urgency = item.get('urgency') or 0
            impact = item.get('impact') or 0
            theme = item.get('theme') or 'Unknown Theme'
            summary = item.get('summary') or item.get('text') or 'No summary'
            justification = item.get('justification') or 'No justification'

            report += f"### {i}. {theme}\n\n"
            report += f"**Priority Score:** {priority_score:.2f}\n\n"
            report += f"**Urgency:** {urgency}/10 | **Impact:** {impact}/10\n\n"
            report += f"**Feedback:** {summary}\n\n"
            report += f"**Justification:** {justification}\n\n"
            report += "---\n\n"

        return report

    feedback_summary = "\n".join([
        f"{i+1}. [{item.get('theme')}] (Priority: {(item.get('priority_score', 0) or 0):.2f}, "
        f"Urgency: {item.get('urgency', 0) or 0}, Impact: {item.get('impact', 0) or 0})\n"
        f"   Summary: {item.get('summary', item.get('text', 'No summary')) or 'No summary'}\n"
        f"   Justification: {item.get('justification', 'No justification') or 'No justification'}"
        for i, item in enumerate(sorted_feedback)
    ])

    agent = create_prioritizer_agent(llm)

    task = Task(
        description=f"""Create a concise, actionable weekly priority report based on these top 5 feedback items:

{feedback_summary}

Generate a Markdown report with:
1. A clear title
2. Top 5 action items with theme, priority scores, and recommended actions
3. Brief summary of trends or patterns

Keep it professional and actionable for a product team.""",
        agent=agent,
        expected_output="Markdown-formatted priority report"
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=True
    )

    try:
        result = crew.kickoff()
        return str(result)
    except Exception as e:
        logger.error(f"Failed to generate report with LLM: {e}")
        report = "# Weekly Feedback Priority Report\n\n"
        report += "## Top 5 Action Items\n\n"

        for i, item in enumerate(sorted_feedback, 1):
            priority_score = item.get('priority_score') or 0
            urgency = item.get('urgency') or 0
            impact = item.get('impact') or 0
            theme = item.get('theme') or 'Unknown Theme'
            summary = item.get('summary') or item.get('text') or 'No summary'
            justification = item.get('justification') or 'No justification'

            report += f"### {i}. {theme}\n\n"
            report += f"**Priority Score:** {priority_score:.2f}\n\n"
            report += f"**Urgency:** {urgency}/10 | **Impact:** {impact}/10\n\n"
            report += f"**Feedback:** {summary}\n\n"
            report += f"**Justification:** {justification}\n\n"
            report += "---\n\n"

        return report
