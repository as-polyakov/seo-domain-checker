# Verseo Frontend

React-based UI for the SEO Domain Checker application.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Start the development server (runs on http://localhost:3000):

```bash
npm run dev
```

The dev server includes a proxy to forward `/api` requests to the backend at `http://localhost:8000`.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Features

- **Domain Management** - View and manage SEO domains
- **Advanced Filtering** - Filter by status, topic, country, price, DR, and more
- **Sorting** - Sort by various metrics
- **Keyboard Shortcuts** - Quick actions (A: OK, S: Review, D: Reject, O: Open)
- **Dark Mode** - Toggle between light and dark themes
- **Preview Sidebar** - Quick evidence preview for each domain
- **Responsive Design** - Works on desktop and mobile devices

## API Integration

The frontend expects a backend API at `/api`. Update the proxy configuration in `vite.config.ts` if your backend runs on a different port.

## Customization

- Modify `tailwind.config.js` for theme customization
- Update API endpoints in the components as needed
- Add environment variables in `.env` files

