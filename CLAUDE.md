# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:debug` - Run tests in verbose mode

### Supabase CLI

- `supabase db reset` - Run migration locally
- _NEVER_ run `supabase db push` - keep the changes local first

## Project Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS 4.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google SSO
- **State Management**: React Context (auth-context.tsx)
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest with ts-jest

### Key Directories

- `app/` - Next.js app router pages and API routes
  - `app/api` - API routes, all the client components should utilizing the existing API routes instead of calling to the Supabase directly
- `components/` - Reusable React components
  - `components/ui/` - shadcn/ui components
  - `components/auth/` - Authentication components
  - `components/security/` - Security-related components
- `lib/` - Utility functions and configurations
  - `lib/supabase/` - Supabase client and server configurations
  - `lib/auth/` - Authentication utilities
  - `lib/security/` - Security utilities (CSRF, sanitization, validation)
- `hooks/` - Custom React hooks
- `contexts/` - React context providers
- `types/` - TypeScript type definitions
- `__tests__/` - Test files and utilities

### Database & Migration

- Supabase migrations in `supabase/migrations/`
- Database types in `types/database.ts`
- Seeding scripts in `supabase/seed.sql` and `supabase/seeds/`

### Authentication

- Supabase Auth with email/password and Google SSO
- Session management via `lib/auth/session-manager.ts`
- Auth context provider in `contexts/auth-context.tsx`
- Protected routes handled by middleware

### Security Features

- CSRF protection (`lib/security/csrf.ts`)
- Input sanitization (`lib/security/sanitization.ts`)
- Rate limiting (`lib/security/rate-limit.ts`)
- Secure input components (`components/security/secure-input.tsx`)

## Development Guidelines

### Code Style (from .cursor/rules)

- Use functional and declarative programming patterns
- Favor React Server Components over client components
- Use descriptive variable names with auxiliary verbs (`isLoading`, `hasError`)
- Structure files: exported components, subcomponents, helpers, static content, types
- Use lowercase with dashes for directory names (`auth-wizard`)
- **NEVER** create a file longer than 500 lines of code. If a file approaches this limit, refactor by splitting it into modules or helper files.

### UI Components

- When working with UI, **YOU MUST** check the existing shadcn/ui components in `components/ui/` before creating new ones
- Only use custom Tailwind CSS when shadcn components aren't available
- Follow mobile-first responsive design patterns

## Agent OS Documentation

### Product Context

- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Development Standards

- **Code Style:** @~/.agent-os/standards/code-style.md
- **Best Practices:** @~/.agent-os/standards/best-practices.md

### Project Management

- **Active Specs:** @.agent-os/specs/
- **Spec Planning:** Use `@~/.agent-os/instructions/core/create-spec.md`
- **Tasks Execution:** Use `@~/.agent-os/instructions/core/execute-tasks.md`

## Workflow Instructions

When asked to work on this codebase:

1. **First**, check @.agent-os/product/roadmap.md for current priorities
2. **Then**, follow the appropriate instruction file:
   - For new features: @.agent-os/instructions/core/create-spec.md
   - For tasks execution: @.agent-os/instructions/core/execute-tasks.md
3. **Always**, adhere to the standards in the files listed above

## Important Notes

- Product-specific files in `.agent-os/product/` override any global standards
- User's specific instructions override (or amend) instructions found in `.agent-os/specs/...`
- Always adhere to established patterns, code style, and best practices documented above.
