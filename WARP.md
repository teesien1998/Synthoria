# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Synthora** is a Next.js 15 AI chat application built with React 19 and TypeScript. It features a ChatGPT-like interface with user authentication via Clerk, a collapsible sidebar, and a modern UI built with shadcn/ui components and Tailwind CSS.

## Core Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components (New York variant)
- **Authentication**: Clerk (@clerk/nextjs)
- **Icons**: Lucide React, React Icons
- **State Management**: React Context (AppContext)

### Project Structure
```
app/                    # Next.js app directory (App Router)
├── layout.tsx         # Root layout with Clerk provider
├── page.tsx           # Main chat interface
└── globals.css        # Global styles

components/            # React components
├── ui/               # shadcn/ui components (avatar, button, etc.)
├── ChatLabel.tsx     # Chat history labels
├── Message.tsx       # Chat message components
├── NavDrawer.tsx     # Mobile navigation drawer
├── PromptBox.tsx     # AI prompt input box
└── Sidebar.tsx       # Collapsible sidebar with chat history

context/
└── AppContext.tsx    # Global context for user state

lib/
└── utils.ts          # Utility functions (cn helper)

public/assets/        # Static assets and icons
└── assets.js         # Asset exports

middleware.ts         # Clerk authentication middleware
```

### Key Components

**Main Page (`app/page.tsx`)**
- Single-page application structure
- Manages sidebar expand/collapse state
- Handles message state and loading states
- Responsive design with mobile-first approach

**Sidebar (`components/Sidebar.tsx`)**
- Collapsible sidebar (15px collapsed, 280px expanded)
- Authentication-aware (shows sign-in or user profile)
- Chat history and search functionality
- New chat creation

**PromptBox (`components/PromptBox.tsx`)**
- Auto-resizing textarea with 200px max height
- Enter to send, Shift+Enter for new line
- Voice and attachment buttons (UI only)
- Loading state management

**AppContext (`context/AppContext.tsx`)**
- Provides Clerk user state globally
- Wraps the application in layout.tsx

### Authentication Flow
- Uses Clerk for authentication
- Middleware protects all routes except static files and Next.js internals
- Sidebar shows different UI for signed-in vs signed-out users
- User profile accessible through sidebar

### Styling System
- Tailwind CSS 4 with CSS variables
- shadcn/ui components with "new-york" style
- Custom utility classes via `cn()` helper
- Responsive breakpoints: mobile-first design

## Common Development Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Component Development
```bash
# Add new shadcn/ui components
npx shadcn@latest add [component-name]

# The components.json configuration:
# - Style: new-york
# - Base color: neutral
# - CSS variables: enabled
# - TypeScript: enabled
```

### File Organization
- Components use named exports for reusable components
- UI components are in `components/ui/`
- Custom components are in `components/`
- All imports use `@/` alias for absolute imports
- Assets are centralized in `public/assets/assets.js`

### State Management Pattern
- Local state with useState for component-specific state
- Context for global user authentication state
- Props drilling for component communication
- No external state management library currently

### Responsive Design
- Mobile-first approach
- Sidebar hidden on mobile, replaced with NavDrawer
- Different layouts for mobile vs desktop
- Tailwind breakpoints: `md:` for desktop styles

### Asset Management
- All assets exported from `public/assets/assets.js`
- SVG icons for UI elements
- PNG images for branding (synthora_icon, synthora_black, synthora_white)
- Centralized asset management for easy imports

## Authentication Setup

The application uses Clerk for authentication. When working with auth:
- User state is available via `useAppContext()` hook
- Middleware protects routes automatically
- Sign-in/sign-out handled by Clerk components
- User profile accessible via `useClerk()` hook

## Development Notes

### Current Implementation Status
- UI structure is complete
- Authentication integration is functional
- AI chat functionality appears to be stubbed (PromptBox logs to console)
- Message handling and API integration may need implementation
- Chat history persistence not yet implemented

### Component Dependencies
- Most components depend on Clerk for authentication state
- Sidebar and main page communicate via expand/setExpand props
- PromptBox is isolated and communicates via loading state props
- Context provides user data to consuming components
