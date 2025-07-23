# Technical Stack

> Last Updated: 2025-01-23
> Version: 1.0.0

## Core Technologies

### Application Framework

- **Framework:** Next.js
- **Version:** 15.4.2
- **Language:** TypeScript 5.x
- **Router:** App Router
- **Build Tool:** Turbopack (development)

### Backend & Database

- **Backend-as-a-Service:** Supabase
- **Database:** PostgreSQL (Supabase managed)
- **Authentication:** Supabase Auth with Google SSO
- **Storage:** Supabase Storage
- **Real-time:** Supabase Real-time subscriptions
- **Edge Functions:** Supabase Edge Functions
- **Client:** @supabase/supabase-js
- **SSR Support:** @supabase/ssr

## Frontend Stack

### JavaScript Framework

- **Framework:** React
- **Version:** 19.0.0
- **Runtime:** Node.js with React Server Components

### Import Strategy

- **Strategy:** ES6 modules
- **Package Manager:** npm
- **Node Version:** 20+ LTS

### CSS Framework

- **Framework:** TailwindCSS
- **Version:** 4.x
- **PostCSS:** @tailwindcss/postcss
- **Utilities:** tailwind-merge, class-variance-authority
- **Animations:** Custom CSS transitions

### UI Components

- **Library:** shadcn/ui (full implementation)
- **Base Components:** Radix UI primitives
- **Styling:** Default shadcn/ui theme
- **Command Palette:** cmdk
- **Notifications:** Sonner
- **Theming:** next-themes

## Form Handling & Validation

### Forms

- **Library:** React Hook Form
- **Resolvers:** @hookform/resolvers
- **Validation:** Zod schema validation
- **Input Components:** Custom secure input components

### Data Visualization

- **Charts:** Recharts for financial data visualization
- **Date Handling:** date-fns for date manipulation

## Assets & Media

### Icons

- **Library:** Lucide React
- **Implementation:** React components

### Carousel & Media

- **Carousel:** Embla Carousel React
- **Currency Input:** Custom currency input components

## Security & Validation

### Security

- **CSRF Protection:** Custom CSRF implementation
- **HTML Sanitization:** DOMPurify integration
- **Rate Limiting:** Custom rate limiting middleware
- **Input Validation:** Zod-based validation with sanitization
- **Session Management:** Custom session manager with Supabase Auth

## Development Tools

### Code Quality

- **Linting:** ESLint 9 with Next.js config
- **Formatting:** Prettier with Tailwind plugin
- **CSS Processing:** Tailwind CSS 4.x

### Testing

- **Framework:** Jest with ts-jest
- **Test Utils:** Custom database testing utilities
- **API Testing:** Supertest integration
- **Coverage:** Jest coverage reporting
- **Setup:** Global setup/teardown for database tests

### Environment

- **Environment Variables:** Built-in Next.js env support
- **Supabase CLI:** Local development and migration management

## Infrastructure

### Application Hosting

- **Platform:** Vercel
- **Deployment:** Git-based continuous deployment
- **Region:** Auto-selected based on user proximity

### Database & Backend

- **Provider:** Supabase
- **Database:** Managed PostgreSQL with migrations
- **Storage:** Supabase Storage with CDN
- **Authentication:** Multi-provider auth via Supabase Auth (Google SSO)
- **Real-time:** WebSocket connections via Supabase

### Performance

- **Build Optimization:** Next.js built-in optimizations with Turbopack
- **Development:** Turbopack for faster builds
- **Static Assets:** Vercel CDN
- **Image Optimization:** Next.js Image component

## Deployment

### CI/CD Pipeline

- **Platform:** Vercel (automatic)
- **Trigger:** Push to main branch
- **Preview Deployments:** Automatic for pull requests
- **Environment Variables:** Managed via Vercel dashboard

### Environments

- **Production:** main branch (automatic deployment)
- **Preview:** Pull request based
- **Development:** Local with Supabase local development

### Scripts

- **Development:** `npm run dev` (with Turbopack)
- **Build:** `npm run build`
- **Linting:** `npm run lint`
- **Testing:** `npm run test` / `npm run test:watch` / `npm run test:coverage`
- **Database:** `npx supabase db push` / `npx supabase db reset`