# Technical Stack

## Core Technologies

### Application Framework

- **Framework:** Next.js
- **Version:** 15.4+
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
- **Client:** @supabase/supabase-js ^2.49.7
- **SSR Support:** @supabase/ssr ^0.6.1

## Frontend Stack

### JavaScript Framework

- **Framework:** React
- **Version:** 19.0.0
- **Runtime:** Node.js with React Server Components

### Import Strategy

- **Strategy:** ES6 modules
- **Package Manager:** npm
- **Node Version:** 20+ LTS recommended

### CSS Framework

- **Framework:** TailwindCSS
- **Version:** 4.x
- **PostCSS:** @tailwindcss/postcss
- **Utilities:** tailwind-merge ^3.3.0, class-variance-authority ^0.7.1
- **Animations:** tw-animate-css ^1.3.0

### UI Components

- **Library:** shadcn/ui (full implementation)
- **Base Components:** Radix UI primitives (comprehensive set)
- **Styling:** Default shadcn/ui theme
- **Command Palette:** cmdk ^1.1.1
- **Notifications:** Sonner ^2.0.3
- **Theming:** next-themes ^0.4.6

## Form Handling & Validation

### Forms

- **Library:** React Hook Form ^7.56.4
- **Resolvers:** @hookform/resolvers ^5.0.1
- **Validation:** Zod ^3.25.7
- **Input Components:** input-otp ^1.4.2 for amount inputs

### Data Visualization

- **Charts:** Recharts ^2.15.3
- **Date Handling:** date-fns ^4.1.0

## Assets & Media

### Icons

- **Library:** Lucide React
- **Version:** ^0.511.0
- **Implementation:** React components

### Carousel & Media

- **Carousel:** Embla Carousel React ^8.6.0
- **Emoji Picker:** emoji-picker-react ^4.12.3
- **Drag & Drop:** @hello-pangea/dnd ^18.0.1

## Security & Validation

### Security

- **CSRF Protection:** csrf ^3.1.0
- **HTML Sanitization:** DOMPurify ^3.2.6
- **Data Validation:** validator ^13.15.15

## Development Tools

### Code Quality

- **Linting:** ESLint 9 with Next.js config
- **Formatting:** Prettier ^3.6.2
- **Prettier Plugin:** prettier-plugin-tailwindcss ^0.6.13
- **CSS Processing:** LightningCSS ^1.28.0

### Testing

- **Framework:** Jest ^30.0.3
- **TypeScript Support:** ts-jest ^29.4.0
- **Test Utils:** @jest/globals, jsdom ^26.1.0
- **API Testing:** Supertest ^7.1.1

### Environment

- **Environment Variables:** dotenv ^17.0.0
- **Supabase CLI:** supabase ^2.26.9

## Infrastructure

### Application Hosting

- **Platform:** Vercel
- **Deployment:** Git-based continuous deployment
- **Region:** Auto-selected based on user proximity

### Database & Backend

- **Provider:** Supabase
- **Database:** Managed PostgreSQL with comprehensive schema
- **Storage:** Supabase Storage with CDN
- **Authentication:** Multi-provider auth via Supabase Auth (Email + Google SSO)
- **Real-time:** WebSocket connections via Supabase

### Performance

- **Build Optimization:** Next.js built-in optimizations
- **Development:** Turbopack for faster builds
- **Static Assets:** Vercel CDN
- **Image Optimization:** Next.js Image component

## Deployment

### CI/CD Pipeline

- **Platform:** Vercel (automatic)
- **Trigger:** Push to main/production branches
- **Preview Deployments:** Automatic for pull requests
- **Environment Variables:** Managed via Vercel dashboard

### Environments

- **Production:** main branch (automatic deployment)
- **Preview:** Pull request based
- **Development:** Local with Supabase local development

### Scripts

- **Development:** `npm run dev` (with Turbopack)
- **Build:** `npm run build`
- **Linting:** `npm run lint` / `npm run lint:fix`
- **Testing:** `npm run test` / `npm run test:watch` / `npm run test:coverage`
- **Database:** `supabase db reset` (local migrations)
