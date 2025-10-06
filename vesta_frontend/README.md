# VESTA Frontend - Netlify Deployment

This is the frontend application for VESTA, an AI-powered feedback prioritization system, configured for deployment on Netlify.

## Features

- **Modern React UI** with TypeScript
- **Dark/Light Theme** support with smooth transitions
- **Real-time Charts** using Recharts
- **Responsive Design** with Tailwind CSS
- **Static Export** for optimal Netlify performance
- **Environment Configuration** for backend API integration

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.local` and update the `NEXT_PUBLIC_API_URL` to point to your backend
   - Default: `https://vesta-agent.onrender.com`

3. **Build for Production**
   ```bash
   npm run build
   npm run export
   ```

4. **Deploy to Netlify**
   - Connect this repository to Netlify
   - Build command: `npm run build && npm run export`
   - Publish directory: `out`

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Netlify Settings

- **Build Command**: `npm run build && npm run export`
- **Publish Directory**: `out`
- **Node Version**: 18

## Project Structure

```
vesta_frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Main page
│   └── not-found/        # 404 page
├── components/           # React components
│   ├── ThemeProvider.tsx
│   ├── Toggle.tsx
│   ├── FeedbackTable.tsx
│   ├── Charts.tsx
│   └── ReportPreview.tsx
├── public/               # Static assets
├── styles/               # CSS files
├── package.json          # Dependencies
├── next.config.ts        # Next.js config
├── tailwind.config.js    # Tailwind config
├── tsconfig.json         # TypeScript config
├── netlify.toml         # Netlify configuration
└── README.md            # This file
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Export static files
npm run export
```

## Deployment Notes

- The application is configured for static export
- All API calls are made to the backend specified in `NEXT_PUBLIC_API_URL`
- The application uses client-side rendering for dynamic content
- Theme preference is stored in localStorage

## Troubleshooting

1. **Build Errors**: Ensure all dependencies are installed
2. **API Issues**: Verify the `NEXT_PUBLIC_API_URL` is correct
3. **Theme Issues**: Clear browser localStorage if theme doesn't persist

## License

This project is part of the VESTA AI Feedback System.