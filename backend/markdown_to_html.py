import markdown

def convert_markdown_to_html(md_text: str) -> str:
    """
    Convert markdown text to HTML.
    """
    html = markdown.markdown(md_text, extensions=['extra', 'smarty'])
    return html
