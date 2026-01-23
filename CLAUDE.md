# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Setup
```bash
# Initial setup
cp stylo-example.env .env
npm clean-install
npm --prefix front clean-install
npm --prefix graphql clean-install

# Generate service token (required before first run)
DOTENV_CONFIG_PATH=.env NODE_OPTIONS="--require dotenv/config" npm run --prefix graphql generate-service-token --silent
```

### Local Development
```bash
# Start all services (front-end on :3000, GraphQL API on :3030)
npm run dev

# With Docker (after generating service token)
docker compose up mongodb-stylo export-stylo pandoc-api
npm run dev
```

### Testing and Quality
```bash
# Lint and format code
npm run lint
npm run lint:fix

# Run front-end tests with coverage
npm --prefix front run test

# Run GraphQL API tests
npm --prefix graphql run test

# Run end-to-end tests
npm --prefix front run test:e2e
```

### Building
```bash
# Build front-end for production
npm --prefix front run build

# Start production GraphQL API
npm --prefix graphql run start
```

## Architecture Overview

Stylo is a multi-service application for academic writing in humanities and social sciences:

### Core Services
- **Front-end** (`/front`): React/Vite SPA with Redux state management
- **GraphQL API** (`/graphql`): Node.js/Express backend with MongoDB
- **Export service**: External pandoc-based document export
- **MongoDB**: Document database for articles, users, and metadata

### Key Technologies
- **Frontend**: React 18, Redux, Monaco Editor, Vite, SCSS modules
- **Backend**: GraphQL, Express, Mongoose, Passport.js authentication
- **Database**: MongoDB 6 with Mongoose ODM
- **Real-time**: WebSockets for collaborative editing using Yjs
- **Testing**: Vitest (frontend), Node.js test runner (backend), Playwright (e2e)

### Project Structure
```
/front/              # React frontend application
  /src/components/   # React components organized by Atomic Design
    /atoms/          # Basic reusable components (Button, Input, Icon...)
    /molecules/      # Combinations of atoms (SearchBox, UserCard...)
    /organisms/      # Complex sections by domain (Header, Forms, Modals...)
    /templates/      # Layout components (AppLayout, AuthLayout...)
    /utils/          # Technical components (PrivateRoute, LoadingPage...)
  /src/pages/        # Complete page components
  /src/hooks/        # Custom React hooks and GraphQL queries
  /src/schemas/      # JSON Schema definitions for metadata forms
  /e2e/              # Playwright end-to-end tests

/graphql/            # GraphQL API backend
  /resolvers/        # GraphQL resolvers organized by entity
  /models/           # Mongoose model definitions
  /auth/             # Authentication strategies (local, OAuth)
  /migrations/       # Database migration scripts

/docs/               # User documentation (11ty static site)
/infrastructure/     # Ansible deployment scripts
```

### Component Architecture (Atomic Design)
- **Atoms**: Button, Input, Icon, Badge, Link, Checkbox, Field, Select...
- **Molecules**: SearchBox, UserCard, TagItem, Alert, Avatar, Loading...
- **Organisms**: Header, LoginForm, BaseModal, Tables, Editor components...
- **Templates**: AppLayout, AuthLayout, EditorLayout, DashboardLayout...
- **Pages**: HomePage, LoginPage, ArticlePage, WritePage...

Use barrel exports from `/components/index.js` for optimal imports:
```jsx
import { Button, Input } from '../components/atoms/index.js'
import { SearchBox, UserCard } from '../components/molecules/index.js'
import { AppLayout } from '../components/templates/index.js'
```

### Key Features
- **Article Management**: CRUD operations with versioning and collaborative editing
- **Metadata Editing**: JSON Schema-based forms for academic metadata
- **Bibliography**: BibTeX integration with Zotero import
- **Workspaces**: Multi-user collaboration spaces
- **Corpus Management**: Collections of related articles
- **Export**: Multiple format exports (HTML, PDF, XML/TEI, etc.)
- **Authentication**: Multiple providers (local, HumaNum, Zotero, Hypothesis)

### Development Notes
- The application uses a monorepo structure with separate package.json files
- Environment variables are loaded from `.env` file in project root
- Database migrations run automatically before GraphQL service starts
- Front-end development server proxies API requests to GraphQL backend
- Real-time collaborative editing uses Yjs with WebSocket synchronization