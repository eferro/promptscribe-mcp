# Promptscribe MCP

Promptscribe MCP is a React + TypeScript application for creating, organizing and sharing AI prompt templates. Users authenticate with Supabase and can manage private or public templates through a streamlined dashboard.

## Features

- Supabase authentication with sign up, sign in and password recovery
- Dashboard to create, edit, view and delete prompt templates
- Text search and tag filtering for quick template discovery
- Public template gallery for sharing with other users
- Responsive UI built with shadcn-ui and Tailwind CSS

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) and npm

### Installation
```sh
git clone <REPOSITORY_URL>
cd promptscribe-mcp
npm install
```

### Development Server
```sh
npm run dev
```
This starts Vite with hot module replacement at `http://localhost:5173`.

### Production Build
```sh
npm run build
npm run preview
```

### Environment Variables
Create a `.env.local` file based on `.env.example` and provide your Supabase credentials:
```sh
VITE_SUPABASE_URL=https://fdtotoxhicqhoulckkgj.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
The `VITE_` prefix exposes the variables to the client in Vite.

### Tests
```sh
npm test
```

## Project Structure
```
src/
  api/             # Supabase API wrapper
  components/      # Reusable UI components
  hooks/           # Custom React hooks
  integrations/    # Third-party integrations
  pages/           # Application pages (Dashboard, Index, NotFound)
  services/        # Auth and template services
  types/           # TypeScript type definitions
public/            # Static assets
supabase/          # Supabase migrations and seed files
```

## Technologies
- React + Vite
- TypeScript
- shadcn-ui
- Tailwind CSS
- Supabase
- React Query
- Vitest & Testing Library
