# AI Assistant Guidelines for Synthora.ai

## Project Overview

This is a Next.js 15 AI chat application with TypeScript, Tailwind CSS, MongoDB, and Clerk authentication. The app provides a ChatGPT-like interface with multiple AI model support.

## Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom theme system
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for user management
- **UI Components**: Radix UI + shadcn/ui components
- **AI Integration**: OpenRouter API with multiple providers

## Do

- ✅ Use strict TypeScript with proper type annotations
- ✅ Use shadcn components or other UI components library (e.g. MagicUI, Aceternity UI) instead of hard coding custom div components
- ✅ Follow React functional component patterns
- ✅ Make sure all the code can be run in production build
- ✅ Remember to implement proper loading states

## Don't

- ❌ Never use `any` type, ESLint will block it, so use proper typing or `unknown`
- ❌ Don't ignore TypeScript errors or warnings

## Key Components

### Message Component

- Handles both user and assistant messages
- Supports markdown rendering with `react-markdown`
- Includes copy functionality and model display
- Uses `aiModels` mapping for model icons

### CodeBlock Component

- Syntax highlighting with Prism.js
- Copy-to-clipboard functionality
- Language label display
- Dark mode support

### Sidebar Component

- Chat history management
- Theme-aware logo switching
- User authentication integration
- Responsive design with expand/collapse

## File Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `context/` - Global state management
- `models/` - Mongoose schemas
- `config/` - Database configuration
- `public/assets/` - Static assets and icons

## Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret
- `OPENROUTER_API_KEY` - OpenRouter API key
- `MONGODB_URI` - MongoDB connection string

## AI Integration

- Supports multiple AI providers via OpenRouter
- Models: GPT-5, Claude Sonnet 4, Gemini 2.5 Pro, Grok-4
- JSON response format with reasoning steps
- Proper error handling for AI responses
- Typing animation for better UX
