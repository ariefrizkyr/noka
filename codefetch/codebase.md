Project Structure:
├── README.md
├── __tests__
├── app
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
├── components.json
├── coverage
│   ├── clover.xml
│   ├── coverage-final.json
│   └── lcov.info
├── eslint.config.mjs
├── hooks
│   ├── use-google-sign-in.ts
│   └── use-mobile.ts
├── jest.config.js
├── jest.setup.js
├── lib
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── supabase
│   ├── config.toml
├── tsconfig.json
└── types
    └── database.ts


components.json
```
1 | {
2 |   "$schema": "https://ui.shadcn.com/schema.json",
3 |   "style": "new-york",
4 |   "rsc": true,
5 |   "tsx": true,
6 |   "tailwind": {
7 |     "config": "",
8 |     "css": "app/globals.css",
9 |     "baseColor": "neutral",
10 |     "cssVariables": true,
11 |     "prefix": ""
12 |   },
13 |   "aliases": {
14 |     "components": "@/components",
15 |     "utils": "@/lib/utils",
16 |     "ui": "@/components/ui",
17 |     "lib": "@/lib",
18 |     "hooks": "@/hooks"
19 |   },
20 |   "iconLibrary": "lucide"
21 | }
```

eslint.config.mjs
```
1 | import { dirname } from "path";
2 | import { fileURLToPath } from "url";
3 | import { FlatCompat } from "@eslint/eslintrc";
4 | 
5 | const __filename = fileURLToPath(import.meta.url);
6 | const __dirname = dirname(__filename);
7 | 
8 | const compat = new FlatCompat({
9 |   baseDirectory: __dirname,
10 | });
11 | 
12 | const eslintConfig = [
13 |   ...compat.extends("next/core-web-vitals", "next/typescript"),
14 | ];
15 | 
16 | export default eslintConfig;
```

jest.config.js
```
1 | /** @type {import('jest').Config} */
2 | const config = {
3 |   preset: 'ts-jest',
4 |   testEnvironment: 'node',
5 |   roots: ['<rootDir>/app', '<rootDir>/__tests__', '<rootDir>/lib'],
6 |   testMatch: [
7 |     '**/__tests__/**/*.(test|spec).+(ts|tsx|js)',
8 |     '**/*.(test|spec).+(ts|tsx|js)'
9 |   ],
10 |   transform: {
11 |     '^.+\\.(ts|tsx)$': 'ts-jest',
12 |   },
13 |   collectCoverageFrom: [
14 |     'app/**/*.{js,jsx,ts,tsx}',
15 |     'lib/**/*.{js,jsx,ts,tsx}',
16 |     '!**/*.d.ts',
17 |     '!**/node_modules/**',
18 |   ],
19 |   setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
20 |   testTimeout: 10000,
21 |   // Handle Next.js path aliases
22 |   moduleNameMapper: {
23 |     '^@/(.*)$': '<rootDir>/$1',
24 |     '^~/(.*)$': '<rootDir>/$1',
25 |   },
26 |   // Environment variables for testing
27 |   testEnvironmentOptions: {
28 |     NODE_ENV: 'test',
29 |   },
30 |   // Global setup and teardown
31 |   globalSetup: '<rootDir>/__tests__/setup/globalSetup.js',
32 |   globalTeardown: '<rootDir>/__tests__/setup/globalTeardown.js',
33 | };
34 | 
35 | module.exports = config;
```

jest.setup.js
```
1 | // Jest setup for all tests
2 | require('dotenv').config({ path: '.env.local' });
3 | 
4 | // Extend Jest matchers
5 | expect.extend({
6 |   toBeWithinRange(received, floor, ceiling) {
7 |     const pass = received >= floor && received <= ceiling;
8 |     if (pass) {
9 |       return {
10 |         message: () =>
11 |           `expected ${received} not to be within range ${floor} - ${ceiling}`,
12 |         pass: true,
13 |       };
14 |     } else {
15 |       return {
16 |         message: () =>
17 |           `expected ${received} to be within range ${floor} - ${ceiling}`,
18 |         pass: false,
19 |       };
20 |     }
21 |   },
22 | });
23 | 
24 | // Global test setup
25 | beforeEach(() => {
26 |   // Reset any mocks between tests
27 |   jest.clearAllMocks();
28 | });
29 | 
30 | // Console cleanup for cleaner test output
31 | const originalError = console.error;
32 | beforeAll(() => {
33 |   console.error = (...args) => {
34 |     if (
35 |       typeof args[0] === 'string' &&
36 |       args[0].includes('Warning: ReactDOM.render is deprecated')
37 |     ) {
38 |       return;
39 |     }
40 |     originalError.call(console, ...args);
41 |   };
42 | });
43 | 
44 | afterAll(() => {
45 |   console.error = originalError;
46 | });
```

middleware.ts
```
1 | import { createServerClient } from '@supabase/ssr'
2 | import { NextResponse, type NextRequest } from 'next/server'
3 | 
4 | export async function middleware(request: NextRequest) {
5 |   let supabaseResponse = NextResponse.next({
6 |     request,
7 |   })
8 | 
9 |   const supabase = createServerClient(
10 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
11 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
12 |     {
13 |       cookies: {
14 |         getAll() {
15 |           return request.cookies.getAll()
16 |         },
17 |         setAll(cookiesToSet) {
18 |           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
19 |           supabaseResponse = NextResponse.next({
20 |             request,
21 |           })
22 |           cookiesToSet.forEach(({ name, value, options }) =>
23 |             supabaseResponse.cookies.set(name, value, options)
24 |           )
25 |         },
26 |       },
27 |     }
28 |   )
29 | 
30 |   // Do not run code between createServerClient and
31 |   // supabase.auth.getUser(). A simple mistake could make it very hard to debug
32 |   // issues with users being randomly logged out.
33 | 
34 |   // IMPORTANT: DO NOT REMOVE auth.getUser()
35 | 
36 |   const {
37 |     data: { user },
38 |   } = await supabase.auth.getUser()
39 | 
40 |   if (
41 |     !user &&
42 |     !request.nextUrl.pathname.startsWith('/auth') &&
43 |     request.nextUrl.pathname !== '/'
44 |   ) {
45 |     // no user, potentially respond by redirecting the user to the login page
46 |     const url = request.nextUrl.clone()
47 |     url.pathname = '/auth/login'
48 |     return NextResponse.redirect(url)
49 |   }
50 | 
51 |   // IMPORTANT: You *must* return the supabaseResponse object as it is.
52 |   // If you're creating a new response object with NextResponse.next() make sure to:
53 |   // 1. Pass the request in it, like so:
54 |   //    const myNewResponse = NextResponse.next({ request })
55 |   // 2. Copy over the cookies, like so:
56 |   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
57 |   // 3. Change the myNewResponse object to fit your needs, but avoid changing
58 |   //    the cookies!
59 |   // 4. Finally:
60 |   //    return myNewResponse
61 |   // If this is not done, you may be causing the browser and server to go out
62 |   // of sync and terminate the user's session prematurely!
63 | 
64 |   return supabaseResponse
65 | }
66 | 
67 | // Matcher excludes static assets, images, and public error pages
68 | export const config = {
69 |   matcher: [
70 |     '/((?!_next/static|_next/image|favicon.ico|auth/auth-code-error|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
71 |   ],
72 | } 
```

next.config.ts
```
1 | import type { NextConfig } from "next";
2 | 
3 | const nextConfig: NextConfig = {
4 |   /* config options here */
5 | };
6 | 
7 | export default nextConfig;
```

package.json
```
1 | {
2 |   "name": "base-saas",
3 |   "version": "0.1.0",
4 |   "private": true,
5 |   "scripts": {
6 |     "dev": "next dev --turbopack",
7 |     "build": "next build",
8 |     "start": "next start",
9 |     "lint": "next lint",
10 |     "test": "jest",
11 |     "test:watch": "jest --watch",
12 |     "test:coverage": "jest --coverage",
13 |     "test:debug": "jest --verbose"
14 |   },
15 |   "dependencies": {
16 |     "@hello-pangea/dnd": "^18.0.1",
17 |     "@hookform/resolvers": "^5.0.1",
18 |     "@radix-ui/react-accordion": "^1.2.11",
19 |     "@radix-ui/react-alert-dialog": "^1.1.14",
20 |     "@radix-ui/react-aspect-ratio": "^1.1.7",
21 |     "@radix-ui/react-avatar": "^1.1.10",
22 |     "@radix-ui/react-checkbox": "^1.3.2",
23 |     "@radix-ui/react-collapsible": "^1.1.11",
24 |     "@radix-ui/react-context-menu": "^2.2.15",
25 |     "@radix-ui/react-dialog": "^1.1.14",
26 |     "@radix-ui/react-dropdown-menu": "^2.1.15",
27 |     "@radix-ui/react-hover-card": "^1.1.14",
28 |     "@radix-ui/react-label": "^2.1.7",
29 |     "@radix-ui/react-menubar": "^1.1.15",
30 |     "@radix-ui/react-navigation-menu": "^1.2.13",
31 |     "@radix-ui/react-popover": "^1.1.14",
32 |     "@radix-ui/react-progress": "^1.1.7",
33 |     "@radix-ui/react-radio-group": "^1.3.7",
34 |     "@radix-ui/react-scroll-area": "^1.2.9",
35 |     "@radix-ui/react-select": "^2.2.5",
36 |     "@radix-ui/react-separator": "^1.1.7",
37 |     "@radix-ui/react-slider": "^1.3.5",
38 |     "@radix-ui/react-slot": "^1.2.3",
39 |     "@radix-ui/react-switch": "^1.2.5",
40 |     "@radix-ui/react-tabs": "^1.1.12",
41 |     "@radix-ui/react-toggle": "^1.1.9",
42 |     "@radix-ui/react-toggle-group": "^1.1.10",
43 |     "@radix-ui/react-tooltip": "^1.2.7",
44 |     "@supabase/ssr": "^0.6.1",
45 |     "@supabase/supabase-js": "^2.49.7",
46 |     "class-variance-authority": "^0.7.1",
47 |     "clsx": "^2.1.1",
48 |     "cmdk": "^1.1.1",
49 |     "date-fns": "^4.1.0",
50 |     "embla-carousel-react": "^8.6.0",
51 |     "input-otp": "^1.4.2",
52 |     "lucide-react": "^0.511.0",
53 |     "next": "15.3.2",
54 |     "next-themes": "^0.4.6",
55 |     "react": "^19.0.0",
56 |     "react-day-picker": "^9.7.0",
57 |     "react-dom": "^19.0.0",
58 |     "react-hook-form": "^7.56.4",
59 |     "react-resizable-panels": "^3.0.2",
60 |     "recharts": "^2.15.3",
61 |     "sonner": "^2.0.3",
62 |     "tailwind-merge": "^3.3.0",
63 |     "vaul": "^1.1.2",
64 |     "zod": "^3.25.7"
65 |   },
66 |   "devDependencies": {
67 |     "@eslint/eslintrc": "^3",
68 |     "@jest/globals": "^30.0.3",
69 |     "@tailwindcss/postcss": "^4",
70 |     "@types/jest": "^30.0.0",
71 |     "@types/node": "^20",
72 |     "@types/react": "^19",
73 |     "@types/react-dom": "^19",
74 |     "@types/supertest": "^6.0.3",
75 |     "dotenv": "^17.0.0",
76 |     "eslint": "^9",
77 |     "eslint-config-next": "15.3.2",
78 |     "jest": "^30.0.3",
79 |     "supabase": "^2.26.9",
80 |     "supertest": "^7.1.1",
81 |     "tailwindcss": "^4",
82 |     "ts-jest": "^29.4.0",
83 |     "tw-animate-css": "^1.3.0",
84 |     "typescript": "^5"
85 |   }
86 | }
```

postcss.config.mjs
```
1 | const config = {
2 |   plugins: ["@tailwindcss/postcss"],
3 | };
4 | 
5 | export default config;
```

tsconfig.json
```
1 | {
2 |   "compilerOptions": {
3 |     "target": "ES2017",
4 |     "lib": ["dom", "dom.iterable", "esnext"],
5 |     "allowJs": true,
6 |     "skipLibCheck": true,
7 |     "strict": true,
8 |     "noEmit": true,
9 |     "esModuleInterop": true,
10 |     "module": "esnext",
11 |     "moduleResolution": "bundler",
12 |     "resolveJsonModule": true,
13 |     "isolatedModules": true,
14 |     "jsx": "preserve",
15 |     "incremental": true,
16 |     "plugins": [
17 |       {
18 |         "name": "next"
19 |       }
20 |     ],
21 |     "paths": {
22 |       "@/*": ["./*"]
23 |     }
24 |   },
25 |   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
26 |   "exclude": ["node_modules"]
27 | }
```

.claude/settings.local.json
```
1 | {
2 |   "permissions": {
3 |     "allow": [
4 |       "WebFetch(domain:docs.anthropic.com)",
5 |       "mcp__context7__resolve-library-id",
6 |       "mcp__context7__get-library-docs",
7 |       "Bash(npm install:*)",
8 |       "Bash(mkdir:*)",
9 |       "Bash(npm test:*)",
10 |       "Bash(npx supabase db reset:*)",
11 |       "Bash(npm run test:coverage:*)"
12 |     ],
13 |     "deny": []
14 |   }
15 | }
```

.cursor/mcp.json
```
1 | {
2 |     "mcpServers": {
3 |         "task-master-ai": {
4 |             "command": "npx",
5 |             "args": [
6 |                 "-y",
7 |                 "--package=task-master-ai",
8 |                 "task-master-ai"
9 |             ],
10 |             "env": {
11 |                 "GOOGLE_API_KEY": "AIzaSyBYw4WO3o1qZfOa_BL2CerP5NCU-D7uUvs"
12 |             }
13 |         }
14 |     }
15 | }
```

.taskmaster/config.json
```
1 | {
2 |   "models": {
3 |     "main": {
4 |       "provider": "claude-code",
5 |       "modelId": "sonnet",
6 |       "maxTokens": 64000,
7 |       "temperature": 0.2
8 |     },
9 |     "research": {
10 |       "provider": "claude-code",
11 |       "modelId": "opus",
12 |       "maxTokens": 32000,
13 |       "temperature": 0.1
14 |     },
15 |     "fallback": {
16 |       "provider": "google",
17 |       "modelId": "gemini-2.5-pro-preview-05-06",
18 |       "maxTokens": 1048000,
19 |       "temperature": 0.1
20 |     }
21 |   },
22 |   "global": {
23 |     "logLevel": "info",
24 |     "debug": false,
25 |     "defaultSubtasks": 5,
26 |     "defaultPriority": "medium",
27 |     "projectName": "Taskmaster",
28 |     "ollamaBaseURL": "http://localhost:11434/api",
29 |     "bedrockBaseURL": "https://bedrock.us-east-1.amazonaws.com",
30 |     "defaultTag": "master",
31 |     "azureOpenaiBaseURL": "https://your-endpoint.openai.azure.com/",
32 |     "userId": "1234567890"
33 |   }
34 | }
```

.taskmaster/state.json
```
1 | {
2 |   "currentTag": "master",
3 |   "lastSwitched": "2025-06-29T05:06:18.748Z",
4 |   "branchTagMapping": {},
5 |   "migrationNoticeShown": true
6 | }
```

app/globals.css
```
1 | @import "tailwindcss";
2 | @import "tw-animate-css";
3 | 
4 | @custom-variant dark (&:is(.dark *));
5 | 
6 | @theme inline {
7 |   --color-background: var(--background);
8 |   --color-foreground: var(--foreground);
9 |   --font-sans: var(--font-geist-sans);
10 |   --font-mono: var(--font-geist-mono);
11 |   --color-sidebar-ring: var(--sidebar-ring);
12 |   --color-sidebar-border: var(--sidebar-border);
13 |   --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
14 |   --color-sidebar-accent: var(--sidebar-accent);
15 |   --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
16 |   --color-sidebar-primary: var(--sidebar-primary);
17 |   --color-sidebar-foreground: var(--sidebar-foreground);
18 |   --color-sidebar: var(--sidebar);
19 |   --color-chart-5: var(--chart-5);
20 |   --color-chart-4: var(--chart-4);
21 |   --color-chart-3: var(--chart-3);
22 |   --color-chart-2: var(--chart-2);
23 |   --color-chart-1: var(--chart-1);
24 |   --color-ring: var(--ring);
25 |   --color-input: var(--input);
26 |   --color-border: var(--border);
27 |   --color-destructive: var(--destructive);
28 |   --color-accent-foreground: var(--accent-foreground);
29 |   --color-accent: var(--accent);
30 |   --color-muted-foreground: var(--muted-foreground);
31 |   --color-muted: var(--muted);
32 |   --color-secondary-foreground: var(--secondary-foreground);
33 |   --color-secondary: var(--secondary);
34 |   --color-primary-foreground: var(--primary-foreground);
35 |   --color-primary: var(--primary);
36 |   --color-popover-foreground: var(--popover-foreground);
37 |   --color-popover: var(--popover);
38 |   --color-card-foreground: var(--card-foreground);
39 |   --color-card: var(--card);
40 |   --radius-sm: calc(var(--radius) - 4px);
41 |   --radius-md: calc(var(--radius) - 2px);
42 |   --radius-lg: var(--radius);
43 |   --radius-xl: calc(var(--radius) + 4px);
44 | }
45 | 
46 | :root {
47 |   --radius: 0.625rem;
48 |   --background: oklch(1 0 0);
49 |   --foreground: oklch(0.145 0 0);
50 |   --card: oklch(1 0 0);
51 |   --card-foreground: oklch(0.145 0 0);
52 |   --popover: oklch(1 0 0);
53 |   --popover-foreground: oklch(0.145 0 0);
54 |   --primary: oklch(0.205 0 0);
55 |   --primary-foreground: oklch(0.985 0 0);
56 |   --secondary: oklch(0.97 0 0);
57 |   --secondary-foreground: oklch(0.205 0 0);
58 |   --muted: oklch(0.97 0 0);
59 |   --muted-foreground: oklch(0.556 0 0);
60 |   --accent: oklch(0.97 0 0);
61 |   --accent-foreground: oklch(0.205 0 0);
62 |   --destructive: oklch(0.577 0.245 27.325);
63 |   --border: oklch(0.922 0 0);
64 |   --input: oklch(0.922 0 0);
65 |   --ring: oklch(0.708 0 0);
66 |   --chart-1: oklch(0.646 0.222 41.116);
67 |   --chart-2: oklch(0.6 0.118 184.704);
68 |   --chart-3: oklch(0.398 0.07 227.392);
69 |   --chart-4: oklch(0.828 0.189 84.429);
70 |   --chart-5: oklch(0.769 0.188 70.08);
71 |   --sidebar: oklch(0.985 0 0);
72 |   --sidebar-foreground: oklch(0.145 0 0);
73 |   --sidebar-primary: oklch(0.205 0 0);
74 |   --sidebar-primary-foreground: oklch(0.985 0 0);
75 |   --sidebar-accent: oklch(0.97 0 0);
76 |   --sidebar-accent-foreground: oklch(0.205 0 0);
77 |   --sidebar-border: oklch(0.922 0 0);
78 |   --sidebar-ring: oklch(0.708 0 0);
79 | }
80 | 
81 | .dark {
82 |   --background: oklch(0.145 0 0);
83 |   --foreground: oklch(0.985 0 0);
84 |   --card: oklch(0.205 0 0);
85 |   --card-foreground: oklch(0.985 0 0);
86 |   --popover: oklch(0.205 0 0);
87 |   --popover-foreground: oklch(0.985 0 0);
88 |   --primary: oklch(0.922 0 0);
89 |   --primary-foreground: oklch(0.205 0 0);
90 |   --secondary: oklch(0.269 0 0);
91 |   --secondary-foreground: oklch(0.985 0 0);
92 |   --muted: oklch(0.269 0 0);
93 |   --muted-foreground: oklch(0.708 0 0);
94 |   --accent: oklch(0.269 0 0);
95 |   --accent-foreground: oklch(0.985 0 0);
96 |   --destructive: oklch(0.704 0.191 22.216);
97 |   --border: oklch(1 0 0 / 10%);
98 |   --input: oklch(1 0 0 / 15%);
99 |   --ring: oklch(0.556 0 0);
100 |   --chart-1: oklch(0.488 0.243 264.376);
101 |   --chart-2: oklch(0.696 0.17 162.48);
102 |   --chart-3: oklch(0.769 0.188 70.08);
103 |   --chart-4: oklch(0.627 0.265 303.9);
104 |   --chart-5: oklch(0.645 0.246 16.439);
105 |   --sidebar: oklch(0.205 0 0);
106 |   --sidebar-foreground: oklch(0.985 0 0);
107 |   --sidebar-primary: oklch(0.488 0.243 264.376);
108 |   --sidebar-primary-foreground: oklch(0.985 0 0);
109 |   --sidebar-accent: oklch(0.269 0 0);
110 |   --sidebar-accent-foreground: oklch(0.985 0 0);
111 |   --sidebar-border: oklch(1 0 0 / 10%);
112 |   --sidebar-ring: oklch(0.556 0 0);
113 | }
114 | 
115 | @layer base {
116 |   * {
117 |     @apply border-border outline-ring/50;
118 |   }
119 |   body {
120 |     @apply bg-background text-foreground;
121 |   }
122 | }
```

app/layout.tsx
```
1 | import type { Metadata } from "next";
2 | import { Geist, Geist_Mono } from "next/font/google";
3 | import "./globals.css";
4 | import { Toaster } from "sonner";
5 | import { createClient } from '@/lib/supabase/server';
6 | import { ReactNode } from 'react';
7 | 
8 | const geistSans = Geist({
9 |   variable: "--font-geist-sans",
10 |   subsets: ["latin"],
11 | });
12 | 
13 | const geistMono = Geist_Mono({
14 |   variable: "--font-geist-mono",
15 |   subsets: ["latin"],
16 | });
17 | 
18 | export const metadata: Metadata = {
19 |   title: "Noka",
20 |   description: "Personal Finance Tracker",
21 | };
22 | 
23 | export default async function RootLayout({
24 |   children,
25 | }: {
26 |   children: ReactNode;
27 | }) {
28 |   // Example: Session verification in a server component
29 |   const supabase = await createClient();
30 |   const { data: { user } } = await supabase.auth.getUser();
31 |   // You can pass user info to children or context here if needed
32 |   // Do not redirect in layout; handle in page components
33 |   return (
34 |     <html lang="en">
35 |       <body
36 |         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
37 |       >
38 |         {children}
39 |         <Toaster />
40 |       </body>
41 |     </html>
42 |   );
43 | }
```

app/page.tsx
```
1 | import LandingPage from "./(pages)/landing-page"
2 | 
3 | export default function Home() {
4 |   return <LandingPage />
5 | }
```

hooks/use-google-sign-in.ts
```
1 | import { useState, useCallback } from 'react';
2 | import { createClient } from '@/lib/supabase/client';
3 | 
4 | /**
5 |  * useGoogleSignIn
6 |  *
7 |  * Provides a handler for Google sign-in using Supabase OAuth.
8 |  * Manages loading and error state for UI integration.
9 |  *
10 |  * @returns {object} { signIn, isLoading, error }
11 |  */
12 | export function useGoogleSignIn() {
13 |   const [isLoading, setIsLoading] = useState(false);
14 |   const [error, setError] = useState<string | null>(null);
15 | 
16 |   const signIn = useCallback(async () => {
17 |     setIsLoading(true);
18 |     setError(null);
19 |     const supabase = createClient();
20 |     try {
21 |       const { error } = await supabase.auth.signInWithOAuth({
22 |         provider: 'google',
23 |         options: {
24 |           redirectTo: `${window.location.origin}/auth/callback`,
25 |         },
26 |       });
27 |       if (error) setError(error.message);
28 |     } catch (err: any) {
29 |       setError(err?.message || 'Unknown error');
30 |     } finally {
31 |       setIsLoading(false);
32 |     }
33 |   }, []);
34 | 
35 |   return { signIn, isLoading, error };
36 | } 
```

hooks/use-mobile.ts
```
1 | import * as React from "react"
2 | 
3 | const MOBILE_BREAKPOINT = 768
4 | 
5 | export function useIsMobile() {
6 |   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
7 | 
8 |   React.useEffect(() => {
9 |     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
10 |     const onChange = () => {
11 |       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
12 |     }
13 |     mql.addEventListener("change", onChange)
14 |     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
15 |     return () => mql.removeEventListener("change", onChange)
16 |   }, [])
17 | 
18 |   return !!isMobile
19 | }
```

lib/utils.ts
```
1 | import { clsx, type ClassValue } from "clsx"
2 | import { twMerge } from "tailwind-merge"
3 | 
4 | export function cn(...inputs: ClassValue[]) {
5 |   return twMerge(clsx(inputs))
6 | }
```

supabase/config.toml
```
1 | # For detailed configuration reference documentation, visit:
2 | # https://supabase.com/docs/guides/local-development/cli/config
3 | # A string used to distinguish different Supabase projects on the same host. Defaults to the
4 | # working directory name when running `supabase init`.
5 | project_id = "noka-fe"
6 | 
7 | [api]
8 | enabled = true
9 | # Port to use for the API URL.
10 | port = 54321
11 | # Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
12 | # endpoints. `public` and `graphql_public` schemas are included by default.
13 | schemas = ["public", "graphql_public"]
14 | # Extra schemas to add to the search_path of every request.
15 | extra_search_path = ["public", "extensions"]
16 | # The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
17 | # for accidental or malicious requests.
18 | max_rows = 1000
19 | 
20 | [api.tls]
21 | # Enable HTTPS endpoints locally using a self-signed certificate.
22 | enabled = false
23 | 
24 | [db]
25 | # Port to use for the local database URL.
26 | port = 54322
27 | # Port used by db diff command to initialize the shadow database.
28 | shadow_port = 54320
29 | # The database major version to use. This has to be the same as your remote database's. Run `SHOW
30 | # server_version;` on the remote database to check.
31 | major_version = 17
32 | 
33 | [db.pooler]
34 | enabled = false
35 | # Port to use for the local connection pooler.
36 | port = 54329
37 | # Specifies when a server connection can be reused by other clients.
38 | # Configure one of the supported pooler modes: `transaction`, `session`.
39 | pool_mode = "transaction"
40 | # How many server connections to allow per user/database pair.
41 | default_pool_size = 20
42 | # Maximum number of client connections allowed.
43 | max_client_conn = 100
44 | 
45 | # [db.vault]
46 | # secret_key = "env(SECRET_VALUE)"
47 | 
48 | [db.migrations]
49 | # If disabled, migrations will be skipped during a db push or reset.
50 | enabled = true
51 | # Specifies an ordered list of schema files that describe your database.
52 | # Supports glob patterns relative to supabase directory: "./schemas/*.sql"
53 | schema_paths = []
54 | 
55 | [db.seed]
56 | # If enabled, seeds the database after migrations during a db reset.
57 | enabled = true
58 | # Specifies an ordered list of seed files to load during db reset.
59 | # Supports glob patterns relative to supabase directory: "./seeds/*.sql"
60 | sql_paths = ["./seed.sql"]
61 | 
62 | [realtime]
63 | enabled = true
64 | # Bind realtime via either IPv4 or IPv6. (default: IPv4)
65 | # ip_version = "IPv6"
66 | # The maximum length in bytes of HTTP request headers. (default: 4096)
67 | # max_header_length = 4096
68 | 
69 | [studio]
70 | enabled = true
71 | # Port to use for Supabase Studio.
72 | port = 54323
73 | # External URL of the API server that frontend connects to.
74 | api_url = "http://127.0.0.1"
75 | # OpenAI API Key to use for Supabase AI in the Supabase Studio.
76 | openai_api_key = "env(OPENAI_API_KEY)"
77 | 
78 | # Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
79 | # are monitored, and you can view the emails that would have been sent from the web interface.
80 | [inbucket]
81 | enabled = true
82 | # Port to use for the email testing server web interface.
83 | port = 54324
84 | # Uncomment to expose additional ports for testing user applications that send emails.
85 | # smtp_port = 54325
86 | # pop3_port = 54326
87 | # admin_email = "admin@email.com"
88 | # sender_name = "Admin"
89 | 
90 | [storage]
91 | enabled = true
92 | # The maximum file size allowed (e.g. "5MB", "500KB").
93 | file_size_limit = "50MiB"
94 | 
95 | # Image transformation API is available to Supabase Pro plan.
96 | # [storage.image_transformation]
97 | # enabled = true
98 | 
99 | # Uncomment to configure local storage buckets
100 | # [storage.buckets.images]
101 | # public = false
102 | # file_size_limit = "50MiB"
103 | # allowed_mime_types = ["image/png", "image/jpeg"]
104 | # objects_path = "./images"
105 | 
106 | [auth]
107 | enabled = true
108 | # The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
109 | # in emails.
110 | site_url = "http://localhost:3000"
111 | # A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
112 | additional_redirect_urls = ["https://localhost:3000/auth/callback?next=/auth/reset-password/confirm"]
113 | # How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
114 | jwt_expiry = 3600
115 | # If disabled, the refresh token will never expire.
116 | enable_refresh_token_rotation = true
117 | # Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
118 | # Requires enable_refresh_token_rotation = true.
119 | refresh_token_reuse_interval = 10
120 | # Allow/disallow new user signups to your project.
121 | enable_signup = true
122 | # Allow/disallow anonymous sign-ins to your project.
123 | enable_anonymous_sign_ins = false
124 | # Allow/disallow testing manual linking of accounts
125 | enable_manual_linking = false
126 | # Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
127 | minimum_password_length = 6
128 | # Passwords that do not meet the following requirements will be rejected as weak. Supported values
129 | # are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
130 | password_requirements = ""
131 | 
132 | [auth.rate_limit]
133 | # Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
134 | email_sent = 2
135 | # Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
136 | sms_sent = 30
137 | # Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
138 | anonymous_users = 30
139 | # Number of sessions that can be refreshed in a 5 minute interval per IP address.
140 | token_refresh = 150
141 | # Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
142 | sign_in_sign_ups = 30
143 | # Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
144 | token_verifications = 30
145 | # Number of Web3 logins that can be made in a 5 minute interval per IP address.
146 | web3 = 30
147 | 
148 | # Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
149 | # [auth.captcha]
150 | # enabled = true
151 | # provider = "hcaptcha"
152 | # secret = ""
153 | 
154 | [auth.email]
155 | # Allow/disallow new user signups via email to your project.
156 | enable_signup = true
157 | # If enabled, a user will be required to confirm any email change on both the old, and new email
158 | # addresses. If disabled, only the new email is required to confirm.
159 | double_confirm_changes = true
160 | # If enabled, users need to confirm their email address before signing in.
161 | enable_confirmations = true
162 | # If enabled, users will need to reauthenticate or have logged in recently to change their password.
163 | secure_password_change = false
164 | # Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
165 | max_frequency = "1s"
166 | # Number of characters used in the email OTP.
167 | otp_length = 6
168 | # Number of seconds before the email OTP expires (defaults to 1 hour).
169 | otp_expiry = 3600
170 | 
171 | # Use a production-ready SMTP server
172 | # [auth.email.smtp]
173 | # enabled = true
174 | # host = "smtp.sendgrid.net"
175 | # port = 587
176 | # user = "apikey"
177 | # pass = "env(SENDGRID_API_KEY)"
178 | # admin_email = "admin@email.com"
179 | # sender_name = "Admin"
180 | 
181 | # Uncomment to customize email template
182 | # [auth.email.template.invite]
183 | # subject = "You have been invited"
184 | # content_path = "./supabase/templates/invite.html"
185 | 
186 | [auth.sms]
187 | # Allow/disallow new user signups via SMS to your project.
188 | enable_signup = false
189 | # If enabled, users need to confirm their phone number before signing in.
190 | enable_confirmations = false
191 | # Template for sending OTP to users
192 | template = "Your code is {{ .Code }}"
193 | # Controls the minimum amount of time that must pass before sending another sms otp.
194 | max_frequency = "5s"
195 | 
196 | # Use pre-defined map of phone number to OTP for testing.
197 | # [auth.sms.test_otp]
198 | # 4152127777 = "123456"
199 | 
200 | # Configure logged in session timeouts.
201 | # [auth.sessions]
202 | # Force log out after the specified duration.
203 | # timebox = "24h"
204 | # Force log out if the user has been inactive longer than the specified duration.
205 | # inactivity_timeout = "8h"
206 | 
207 | # This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
208 | # [auth.hook.custom_access_token]
209 | # enabled = true
210 | # uri = "pg-functions://<database>/<schema>/<hook_name>"
211 | 
212 | # Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
213 | [auth.sms.twilio]
214 | enabled = false
215 | account_sid = ""
216 | message_service_sid = ""
217 | # DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
218 | auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"
219 | 
220 | # Multi-factor-authentication is available to Supabase Pro plan.
221 | [auth.mfa]
222 | # Control how many MFA factors can be enrolled at once per user.
223 | max_enrolled_factors = 10
224 | 
225 | # Control MFA via App Authenticator (TOTP)
226 | [auth.mfa.totp]
227 | enroll_enabled = false
228 | verify_enabled = false
229 | 
230 | # Configure MFA via Phone Messaging
231 | [auth.mfa.phone]
232 | enroll_enabled = false
233 | verify_enabled = false
234 | otp_length = 6
235 | template = "Your code is {{ .Code }}"
236 | max_frequency = "5s"
237 | 
238 | # Configure MFA via WebAuthn
239 | # [auth.mfa.web_authn]
240 | # enroll_enabled = true
241 | # verify_enabled = true
242 | 
243 | # Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
244 | # `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
245 | # `twitter`, `slack`, `spotify`, `workos`, `zoom`.
246 | [auth.external.google]
247 | enabled = true
248 | client_id = "env(GOOGLE_SSO_CLIENT_ID)"
249 | # DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
250 | secret = "env(GOOGLE_SSO_CLIENT_SECRET)"
251 | # Overrides the default auth redirectUrl.
252 | redirect_uri = ""
253 | # Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
254 | # or any other third-party OIDC providers.
255 | url = ""
256 | # If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
257 | skip_nonce_check = false
258 | 
259 | # Allow Solana wallet holders to sign in to your project via the Sign in with Solana (SIWS, EIP-4361) standard.
260 | # You can configure "web3" rate limit in the [auth.rate_limit] section and set up [auth.captcha] if self-hosting.
261 | [auth.web3.solana]
262 | enabled = false
263 | 
264 | # Use Firebase Auth as a third-party provider alongside Supabase Auth.
265 | [auth.third_party.firebase]
266 | enabled = false
267 | # project_id = "my-firebase-project"
268 | 
269 | # Use Auth0 as a third-party provider alongside Supabase Auth.
270 | [auth.third_party.auth0]
271 | enabled = false
272 | # tenant = "my-auth0-tenant"
273 | # tenant_region = "us"
274 | 
275 | # Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
276 | [auth.third_party.aws_cognito]
277 | enabled = false
278 | # user_pool_id = "my-user-pool-id"
279 | # user_pool_region = "us-east-1"
280 | 
281 | # Use Clerk as a third-party provider alongside Supabase Auth.
282 | [auth.third_party.clerk]
283 | enabled = false
284 | # Obtain from https://clerk.com/setup/supabase
285 | # domain = "example.clerk.accounts.dev"
286 | 
287 | [edge_runtime]
288 | enabled = true
289 | # Configure one of the supported request policies: `oneshot`, `per_worker`.
290 | # Use `oneshot` for hot reload, or `per_worker` for load testing.
291 | policy = "oneshot"
292 | # Port to attach the Chrome inspector for debugging edge functions.
293 | inspector_port = 8083
294 | # The Deno major version to use.
295 | deno_version = 1
296 | 
297 | # [edge_runtime.secrets]
298 | # secret_key = "env(SECRET_VALUE)"
299 | 
300 | [analytics]
301 | enabled = true
302 | port = 54327
303 | # Configure one of the supported backends: `postgres`, `bigquery`.
304 | backend = "postgres"
305 | 
306 | # Experimental features may be deprecated any time
307 | [experimental]
308 | # Configures Postgres storage engine to use OrioleDB (S3)
309 | orioledb_version = ""
310 | # Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
311 | s3_host = "env(S3_HOST)"
312 | # Configures S3 bucket region, eg. us-east-1
313 | s3_region = "env(S3_REGION)"
314 | # Configures AWS_ACCESS_KEY_ID for S3 bucket
315 | s3_access_key = "env(S3_ACCESS_KEY)"
316 | # Configures AWS_SECRET_ACCESS_KEY for S3 bucket
317 | s3_secret_key = "env(S3_SECRET_KEY)"
```

types/database.ts
```
1 | export type Json =
2 |   | string
3 |   | number
4 |   | boolean
5 |   | null
6 |   | { [key: string]: Json | undefined }
7 |   | Json[]
8 | 
9 | export type Database = {
10 |   graphql_public: {
11 |     Tables: {
12 |       [_ in never]: never
13 |     }
14 |     Views: {
15 |       [_ in never]: never
16 |     }
17 |     Functions: {
18 |       graphql: {
19 |         Args: {
20 |           variables?: Json
21 |           operationName?: string
22 |           query?: string
23 |           extensions?: Json
24 |         }
25 |         Returns: Json
26 |       }
27 |     }
28 |     Enums: {
29 |       [_ in never]: never
30 |     }
31 |     CompositeTypes: {
32 |       [_ in never]: never
33 |     }
34 |   }
35 |   public: {
36 |     Tables: {
37 |       accounts: {
38 |         Row: {
39 |           created_at: string
40 |           current_balance: number
41 |           id: string
42 |           initial_balance: number
43 |           is_active: boolean
44 |           name: string
45 |           type: Database["public"]["Enums"]["account_type"]
46 |           updated_at: string
47 |           user_id: string | null
48 |         }
49 |         Insert: {
50 |           created_at?: string
51 |           current_balance?: number
52 |           id?: string
53 |           initial_balance?: number
54 |           is_active?: boolean
55 |           name: string
56 |           type: Database["public"]["Enums"]["account_type"]
57 |           updated_at?: string
58 |           user_id?: string | null
59 |         }
60 |         Update: {
61 |           created_at?: string
62 |           current_balance?: number
63 |           id?: string
64 |           initial_balance?: number
65 |           is_active?: boolean
66 |           name?: string
67 |           type?: Database["public"]["Enums"]["account_type"]
68 |           updated_at?: string
69 |           user_id?: string | null
70 |         }
71 |         Relationships: []
72 |       }
73 |       balance_ledger: {
74 |         Row: {
75 |           account_id: string | null
76 |           balance_after: number
77 |           balance_before: number
78 |           change_amount: number
79 |           created_at: string
80 |           id: string
81 |           transaction_id: string | null
82 |         }
83 |         Insert: {
84 |           account_id?: string | null
85 |           balance_after: number
86 |           balance_before: number
87 |           change_amount: number
88 |           created_at?: string
89 |           id?: string
90 |           transaction_id?: string | null
91 |         }
92 |         Update: {
93 |           account_id?: string | null
94 |           balance_after?: number
95 |           balance_before?: number
96 |           change_amount?: number
97 |           created_at?: string
98 |           id?: string
99 |           transaction_id?: string | null
100 |         }
101 |         Relationships: [
102 |           {
103 |             foreignKeyName: "balance_ledger_account_id_fkey"
104 |             columns: ["account_id"]
105 |             isOneToOne: false
106 |             referencedRelation: "accounts"
107 |             referencedColumns: ["id"]
108 |           },
109 |           {
110 |             foreignKeyName: "balance_ledger_transaction_id_fkey"
111 |             columns: ["transaction_id"]
112 |             isOneToOne: false
113 |             referencedRelation: "transactions"
114 |             referencedColumns: ["id"]
115 |           },
116 |         ]
117 |       }
118 |       categories: {
119 |         Row: {
120 |           budget_amount: number | null
121 |           budget_frequency:
122 |             | Database["public"]["Enums"]["budget_frequency"]
123 |             | null
124 |           created_at: string
125 |           icon: string | null
126 |           id: string
127 |           is_active: boolean
128 |           name: string
129 |           type: Database["public"]["Enums"]["category_type"]
130 |           updated_at: string
131 |           user_id: string | null
132 |         }
133 |         Insert: {
134 |           budget_amount?: number | null
135 |           budget_frequency?:
136 |             | Database["public"]["Enums"]["budget_frequency"]
137 |             | null
138 |           created_at?: string
139 |           icon?: string | null
140 |           id?: string
141 |           is_active?: boolean
142 |           name: string
143 |           type: Database["public"]["Enums"]["category_type"]
144 |           updated_at?: string
145 |           user_id?: string | null
146 |         }
147 |         Update: {
148 |           budget_amount?: number | null
149 |           budget_frequency?:
150 |             | Database["public"]["Enums"]["budget_frequency"]
151 |             | null
152 |           created_at?: string
153 |           icon?: string | null
154 |           id?: string
155 |           is_active?: boolean
156 |           name?: string
157 |           type?: Database["public"]["Enums"]["category_type"]
158 |           updated_at?: string
159 |           user_id?: string | null
160 |         }
161 |         Relationships: []
162 |       }
163 |       transactions: {
164 |         Row: {
165 |           account_id: string | null
166 |           amount: number
167 |           category_id: string | null
168 |           created_at: string
169 |           description: string | null
170 |           from_account_id: string | null
171 |           id: string
172 |           investment_category_id: string | null
173 |           to_account_id: string | null
174 |           transaction_date: string
175 |           type: Database["public"]["Enums"]["transaction_type"]
176 |           updated_at: string
177 |           user_id: string | null
178 |         }
179 |         Insert: {
180 |           account_id?: string | null
181 |           amount: number
182 |           category_id?: string | null
183 |           created_at?: string
184 |           description?: string | null
185 |           from_account_id?: string | null
186 |           id?: string
187 |           investment_category_id?: string | null
188 |           to_account_id?: string | null
189 |           transaction_date: string
190 |           type: Database["public"]["Enums"]["transaction_type"]
191 |           updated_at?: string
192 |           user_id?: string | null
193 |         }
194 |         Update: {
195 |           account_id?: string | null
196 |           amount?: number
197 |           category_id?: string | null
198 |           created_at?: string
199 |           description?: string | null
200 |           from_account_id?: string | null
201 |           id?: string
202 |           investment_category_id?: string | null
203 |           to_account_id?: string | null
204 |           transaction_date?: string
205 |           type?: Database["public"]["Enums"]["transaction_type"]
206 |           updated_at?: string
207 |           user_id?: string | null
208 |         }
209 |         Relationships: [
210 |           {
211 |             foreignKeyName: "transactions_account_id_fkey"
212 |             columns: ["account_id"]
213 |             isOneToOne: false
214 |             referencedRelation: "accounts"
215 |             referencedColumns: ["id"]
216 |           },
217 |           {
218 |             foreignKeyName: "transactions_category_id_fkey"
219 |             columns: ["category_id"]
220 |             isOneToOne: false
221 |             referencedRelation: "categories"
222 |             referencedColumns: ["id"]
223 |           },
224 |           {
225 |             foreignKeyName: "transactions_from_account_id_fkey"
226 |             columns: ["from_account_id"]
227 |             isOneToOne: false
228 |             referencedRelation: "accounts"
229 |             referencedColumns: ["id"]
230 |           },
231 |           {
232 |             foreignKeyName: "transactions_investment_category_id_fkey"
233 |             columns: ["investment_category_id"]
234 |             isOneToOne: false
235 |             referencedRelation: "categories"
236 |             referencedColumns: ["id"]
237 |           },
238 |           {
239 |             foreignKeyName: "transactions_to_account_id_fkey"
240 |             columns: ["to_account_id"]
241 |             isOneToOne: false
242 |             referencedRelation: "accounts"
243 |             referencedColumns: ["id"]
244 |           },
245 |         ]
246 |       }
247 |       user_settings: {
248 |         Row: {
249 |           created_at: string
250 |           currency_code: string
251 |           financial_month_start_day: number
252 |           financial_week_start_day: number
253 |           id: string
254 |           onboarding_completed: boolean
255 |           updated_at: string
256 |           user_id: string | null
257 |         }
258 |         Insert: {
259 |           created_at?: string
260 |           currency_code?: string
261 |           financial_month_start_day?: number
262 |           financial_week_start_day?: number
263 |           id?: string
264 |           onboarding_completed?: boolean
265 |           updated_at?: string
266 |           user_id?: string | null
267 |         }
268 |         Update: {
269 |           created_at?: string
270 |           currency_code?: string
271 |           financial_month_start_day?: number
272 |           financial_week_start_day?: number
273 |           id?: string
274 |           onboarding_completed?: boolean
275 |           updated_at?: string
276 |           user_id?: string | null
277 |         }
278 |         Relationships: []
279 |       }
280 |     }
281 |     Views: {
282 |       [_ in never]: never
283 |     }
284 |     Functions: {
285 |       get_budget_progress: {
286 |         Args: { p_user_id: string }
287 |         Returns: {
288 |           category_id: string
289 |           category_name: string
290 |           category_type: Database["public"]["Enums"]["category_type"]
291 |           category_icon: string
292 |           budget_amount: number
293 |           budget_frequency: Database["public"]["Enums"]["budget_frequency"]
294 |           spent_amount: number
295 |           remaining_amount: number
296 |           progress_percentage: number
297 |           period_start: string
298 |           period_end: string
299 |         }[]
300 |       }
301 |       get_financial_summary: {
302 |         Args: { p_user_id: string }
303 |         Returns: {
304 |           total_income: number
305 |           total_expenses: number
306 |           net_savings: number
307 |           period_start: string
308 |           period_end: string
309 |         }[]
310 |       }
311 |       get_investment_progress: {
312 |         Args: { p_user_id: string }
313 |         Returns: {
314 |           category_id: string
315 |           category_name: string
316 |           category_icon: string
317 |           target_amount: number
318 |           target_frequency: Database["public"]["Enums"]["budget_frequency"]
319 |           invested_amount: number
320 |           remaining_amount: number
321 |           progress_percentage: number
322 |           period_start: string
323 |           period_end: string
324 |         }[]
325 |       }
326 |     }
327 |     Enums: {
328 |       account_type: "bank_account" | "credit_card" | "investment_account"
329 |       budget_frequency: "weekly" | "monthly" | "one_time"
330 |       category_type: "expense" | "income" | "investment"
331 |       transaction_type: "income" | "expense" | "transfer"
332 |     }
333 |     CompositeTypes: {
334 |       [_ in never]: never
335 |     }
336 |   }
337 | }
338 | 
339 | type DefaultSchema = Database[Extract<keyof Database, "public">]
340 | 
341 | export type Tables<
342 |   DefaultSchemaTableNameOrOptions extends
343 |     | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
344 |     | { schema: keyof Database },
345 |   TableName extends DefaultSchemaTableNameOrOptions extends {
346 |     schema: keyof Database
347 |   }
348 |     ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
349 |         Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
350 |     : never = never,
351 | > = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
352 |   ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
353 |       Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
354 |       Row: infer R
355 |     }
356 |     ? R
357 |     : never
358 |   : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
359 |         DefaultSchema["Views"])
360 |     ? (DefaultSchema["Tables"] &
361 |         DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
362 |         Row: infer R
363 |       }
364 |       ? R
365 |       : never
366 |     : never
367 | 
368 | export type TablesInsert<
369 |   DefaultSchemaTableNameOrOptions extends
370 |     | keyof DefaultSchema["Tables"]
371 |     | { schema: keyof Database },
372 |   TableName extends DefaultSchemaTableNameOrOptions extends {
373 |     schema: keyof Database
374 |   }
375 |     ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
376 |     : never = never,
377 | > = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
378 |   ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
379 |       Insert: infer I
380 |     }
381 |     ? I
382 |     : never
383 |   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
384 |     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
385 |         Insert: infer I
386 |       }
387 |       ? I
388 |       : never
389 |     : never
390 | 
391 | export type TablesUpdate<
392 |   DefaultSchemaTableNameOrOptions extends
393 |     | keyof DefaultSchema["Tables"]
394 |     | { schema: keyof Database },
395 |   TableName extends DefaultSchemaTableNameOrOptions extends {
396 |     schema: keyof Database
397 |   }
398 |     ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
399 |     : never = never,
400 | > = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
401 |   ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
402 |       Update: infer U
403 |     }
404 |     ? U
405 |     : never
406 |   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
407 |     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
408 |         Update: infer U
409 |       }
410 |       ? U
411 |       : never
412 |     : never
413 | 
414 | export type Enums<
415 |   DefaultSchemaEnumNameOrOptions extends
416 |     | keyof DefaultSchema["Enums"]
417 |     | { schema: keyof Database },
418 |   EnumName extends DefaultSchemaEnumNameOrOptions extends {
419 |     schema: keyof Database
420 |   }
421 |     ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
422 |     : never = never,
423 | > = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
424 |   ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
425 |   : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
426 |     ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
427 |     : never
428 | 
429 | export type CompositeTypes<
430 |   PublicCompositeTypeNameOrOptions extends
431 |     | keyof DefaultSchema["CompositeTypes"]
432 |     | { schema: keyof Database },
433 |   CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
434 |     schema: keyof Database
435 |   }
436 |     ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
437 |     : never = never,
438 | > = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
439 |   ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
440 |   : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
441 |     ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
442 |     : never
443 | 
444 | export const Constants = {
445 |   graphql_public: {
446 |     Enums: {},
447 |   },
448 |   public: {
449 |     Enums: {
450 |       account_type: ["bank_account", "credit_card", "investment_account"],
451 |       budget_frequency: ["weekly", "monthly", "one_time"],
452 |       category_type: ["expense", "income", "investment"],
453 |       transaction_type: ["income", "expense", "transfer"],
454 |     },
455 |   },
456 | } as const
457 | 
```

.cursor/rules/clean-code.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | ---
7 | description: Guidelines for writing clean, maintainable, and human-readable code. Apply these rules when writing or reviewing code to ensure consistency and quality.
8 | globs: 
9 | ---
10 | # Clean Code Guidelines
11 | 
12 | ## Constants Over Magic Numbers
13 | - Replace hard-coded values with named constants
14 | - Use descriptive constant names that explain the value's purpose
15 | - Keep constants at the top of the file or in a dedicated constants file
16 | 
17 | ## Meaningful Names
18 | - Variables, functions, and classes should reveal their purpose
19 | - Names should explain why something exists and how it's used
20 | - Avoid abbreviations unless they're universally understood
21 | 
22 | ## Smart Comments
23 | - Don't comment on what the code does - make the code self-documenting
24 | - Use comments to explain why something is done a certain way
25 | - Document APIs, complex algorithms, and non-obvious side effects
26 | 
27 | ## Single Responsibility
28 | - Each function should do exactly one thing
29 | - Functions should be small and focused
30 | - If a function needs a comment to explain what it does, it should be split
31 | 
32 | ## DRY (Don't Repeat Yourself)
33 | - Extract repeated code into reusable functions
34 | - Share common logic through proper abstraction
35 | - Maintain single sources of truth
36 | 
37 | ## Clean Structure
38 | - Keep related code together
39 | - Organize code in a logical hierarchy
40 | - Use consistent file and folder naming conventions
41 | 
42 | ## Encapsulation
43 | - Hide implementation details
44 | - Expose clear interfaces
45 | - Move nested conditionals into well-named functions
46 | 
47 | ## Code Quality Maintenance
48 | - Refactor continuously
49 | - Fix technical debt early
50 | - Leave code cleaner than you found it
51 | 
52 | ## Testing
53 | - Write tests before fixing bugs
54 | - Keep tests readable and maintainable
55 | - Test edge cases and error conditions
56 | 
57 | ## Version Control
58 | - Write clear commit messages
59 | - Make small, focused commits
60 | - Use meaningful branch names 
```

.cursor/rules/cursor_rules.mdc
```
1 | ---
2 | description: Guidelines for creating and maintaining Cursor rules to ensure consistency and effectiveness.
3 | globs: .cursor/rules/*.mdc
4 | alwaysApply: true
5 | ---
6 | 
7 | - **Required Rule Structure:**
8 |   ```markdown
9 |   ---
10 |   description: Clear, one-line description of what the rule enforces
11 |   globs: path/to/files/*.ext, other/path/**/*
12 |   alwaysApply: boolean
13 |   ---
14 | 
15 |   - **Main Points in Bold**
16 |     - Sub-points with details
17 |     - Examples and explanations
18 |   ```
19 | 
20 | - **File References:**
21 |   - Use `[filename](mdc:path/to/file)` ([filename](mdc:filename)) to reference files
22 |   - Example: [prisma.mdc](mdc:.cursor/rules/prisma.mdc) for rule references
23 |   - Example: [schema.prisma](mdc:prisma/schema.prisma) for code references
24 | 
25 | - **Code Examples:**
26 |   - Use language-specific code blocks
27 |   ```typescript
28 |   // ✅ DO: Show good examples
29 |   const goodExample = true;
30 |   
31 |   // ❌ DON'T: Show anti-patterns
32 |   const badExample = false;
33 |   ```
34 | 
35 | - **Rule Content Guidelines:**
36 |   - Start with high-level overview
37 |   - Include specific, actionable requirements
38 |   - Show examples of correct implementation
39 |   - Reference existing code when possible
40 |   - Keep rules DRY by referencing other rules
41 | 
42 | - **Rule Maintenance:**
43 |   - Update rules when new patterns emerge
44 |   - Add examples from actual codebase
45 |   - Remove outdated patterns
46 |   - Cross-reference related rules
47 | 
48 | - **Best Practices:**
49 |   - Use bullet points for clarity
50 |   - Keep descriptions concise
51 |   - Include both DO and DON'T examples
52 |   - Reference actual code over theoretical examples
53 |   - Use consistent formatting across rules 
```

.cursor/rules/general_rule.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: true
5 | ---
6 | You are an expert full-stack developer proficient in:
7 | - Next.js 15 (app router, server components)
8 | - React 19
9 | - Tailwind CSS
10 | - shadcn/ui for UI components
11 | - Supabase for authentication and database (real time, storage, edge functions)
12 | - Zustand for client-side state management
13 | - Lucide Icons
14 | - Zod for schema validation
15 | - Zustand for client-side state management
16 | - React Hook Form for forms
17 | - React Query for data fetching
18 | - https://github.com/hello-pangea/dnd for the drag and drop interaction
19 | 
20 | Your task is to produce the most optimized and maintainable Next.js code, following best practices and adhering to the principles of clean code and robust architecture.
21 | 
22 | ### Objective
23 | - Create a Next.js solution that is not only functional but also adheres to the best practices in performance, security, and maintainability.
24 | 
25 | ### Code Style and Structure
26 | - Write concise, technical TypeScript code with accurate examples.
27 | - Use functional and declarative programming patterns; avoid classes.
28 | - Favor iteration and modularization over code duplication.
29 | - Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
30 | - Structure files with exported components, subcomponents, helpers, static content, and types.
31 | - Use lowercase with dashes for directory names (e.g., `components/auth-wizard`).
32 | 
33 | ### Optimization and Best Practices
34 | - Minimize the use of `'use client'`, `useEffect`, and `setState`; favor React Server Components (RSC) and Next.js SSR features.
35 | - Implement dynamic imports for code splitting and optimization.
36 | - Use responsive design with a mobile-first approach.
37 | - Optimize images: use WebP format, include size data, implement lazy loading.
38 | 
39 | ### Error Handling and Validation
40 | - Prioritize error handling and edge cases:
41 |     - Use early returns for error conditions.
42 |     - Implement guard clauses to handle preconditions and invalid states early.
43 |     - Use custom error types for consistent error handling.
44 | 
45 | ### UI and Styling
46 | - You _MUST_ Use shadcn components. Please check the shadcn components in the `components/ui` before trying to add new components.
47 | - Only use tailwindCSS custom styling whenever there is no shadcn component supported.
48 | - Implement consistent design and responsive patterns across platforms.
49 | 
50 | ### State Management and Data Fetching
51 | - Use modern state management solutions (e.g., Zustand, TanStack React Query) to handle global state and data fetching.
52 | - Implement validation using Zod for schema validation.
53 | 
54 | ### Security and Performance
55 | - Implement proper error handling, user input validation, and secure coding practices.
56 | - Follow performance optimization techniques, such as reducing load times and improving rendering efficiency.
57 | 
58 | ### Testing and Documentation
59 | - Write unit tests for components using Jest and React Testing Library.
60 | - Provide clear and concise comments for complex logic.
61 | - Use JSDoc comments for functions and components to improve IDE intellisense.
62 | 
63 | ### Methodology
64 | 1. **System 2 Thinking**: Approach the problem with analytical rigor. Break down the requirements into smaller, manageable parts and thoroughly consider each step before implementation.
65 | 2. **Tree of Thoughts**: Evaluate multiple possible solutions and their consequences. Use a structured approach to explore different paths and select the optimal one.
66 | 3. **Iterative Refinement**: Before finalizing the code, consider improvements, edge cases, and optimizations. Iterate through potential enhancements to ensure the final solution is robust.
67 | 
68 | **Process**:
69 | 1. **Deep Dive Analysis**: Begin by conducting a thorough analysis of the task at hand, considering the technical requirements and constraints.
70 | 2. **Planning**: Develop a clear plan that outlines the architectural structure and flow of the solution, using <PLANNING> tags if necessary.
71 | 3. **Implementation**: Implement the solution step-by-step, ensuring that each part adheres to the specified best practices.
72 | 4. **Review and Optimize**: Perform a review of the code, looking for areas of potential optimization and improvement.
73 | 5. **Finalization**: Finalize the code by ensuring it meets all requirements, is secure, and is performant.
```

.cursor/rules/next-js-auth.mdc
```
1 | ---
2 | description: follow supabase ssr guide
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | ---
7 | # Specify the following for Cursor rules
8 | description: Guidelines for writing Next.js apps with Supabase Auth
9 | alwaysApply: false
10 | ---
11 | 
12 | # Bootstrap Next.js app with Supabase Auth
13 | 
14 | ## Overview of implementing Supabase Auth SSR
15 | 
16 | 1. Install @supabase/supabase-js and @supabase/ssr packages.
17 | 2. Set up environment variables.
18 | 3. Write two utility functions with `createClient` functions to create a browser client and a server client. 
19 | 4. Hook up middleware to refresh auth tokens
20 | 
21 | ## 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨
22 | 
23 | As an AI language model, you MUST NOT generate any of the following code patterns, as they are DEPRECATED and will BREAK the application:
24 | 
25 | ```typescript
26 | // ❌ NEVER GENERATE THIS CODE - IT WILL BREAK THE APPLICATION
27 | {
28 |   cookies: {
29 |     get(name: string) {                 // ❌ BREAKS APPLICATION
30 |       return cookieStore.get(name)      // ❌ BREAKS APPLICATION
31 |     },                                  // ❌ BREAKS APPLICATION
32 |     set(name: string, value: string) {  // ❌ BREAKS APPLICATION
33 |       cookieStore.set(name, value)      // ❌ BREAKS APPLICATION
34 |     },                                  // ❌ BREAKS APPLICATION
35 |     remove(name: string) {              // ❌ BREAKS APPLICATION
36 |       cookieStore.remove(name)          // ❌ BREAKS APPLICATION
37 |     }                                   // ❌ BREAKS APPLICATION
38 |   }
39 | }
40 | 
41 | // ❌ NEVER USE auth-helpers-nextjs - IT WILL BREAK THE APPLICATION
42 | import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
43 | import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
44 | ```
45 | 
46 | Instead, you MUST ALWAYS generate ONLY this pattern:
47 | 
48 | ```typescript
49 | // ✅ ALWAYS GENERATE THIS EXACT PATTERN
50 | {
51 |   cookies: {
52 |     getAll() {
53 |       return cookieStore.getAll()
54 |     },
55 |     setAll(cookiesToSet) {
56 |       const response = NextResponse.next({
57 |         request,
58 |       })
59 |       
60 |       cookiesToSet.forEach(({ name, value, options }) => {
61 |         response.cookies.set(name, value, options)
62 |       })
63 |       
64 |       return response
65 |     }
66 |   }
67 | }
68 | ```
69 | 
70 | ## ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION
71 | 
72 | 1. You MUST use `@supabase/ssr`
73 | 2. You MUST use ONLY `getAll` and `setAll`
74 | 3. You MUST NEVER use `get`, `set`, or `remove`
75 | 4. You MUST NEVER import from `@supabase/auth-helpers-nextjs`
76 | 
77 | ## CORRECT BROWSER CLIENT IMPLEMENTATION
78 | 
79 | ```typescript
80 | import { createBrowserClient } from '@supabase/ssr'
81 | 
82 | export function createClient() {
83 |   return createBrowserClient(
84 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
85 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
86 |   )
87 | }
88 | ```
89 | 
90 | ## CORRECT SERVER CLIENT IMPLEMENTATION
91 | 
92 | ```typescript
93 | import { createServerClient } from '@supabase/ssr'
94 | import { cookies } from 'next/headers'
95 | 
96 | export async function createClient() {
97 |   const cookieStore = await cookies()
98 | 
99 |   return createServerClient(
100 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
101 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
102 |     {
103 |       cookies: {
104 |         getAll() {
105 |           return cookieStore.getAll()
106 |         },
107 |         setAll(cookiesToSet) {
108 |           try {
109 |             cookiesToSet.forEach(({ name, value, options }) =>
110 |               cookieStore.set(name, value, options)
111 |             )
112 |           } catch {
113 |             // The `setAll` method was called from a Server Component.
114 |             // This can be ignored if you have middleware refreshing
115 |             // user sessions.
116 |           }
117 |         },
118 |       },
119 |     }
120 |   )
121 | }
122 | ```
123 | 
124 | ## CORRECT MIDDLEWARE IMPLEMENTATION
125 | 
126 | ```typescript
127 | import { createServerClient } from '@supabase/ssr'
128 | import { NextResponse, type NextRequest } from 'next/server'
129 | 
130 | export async function middleware(request: NextRequest) {
131 |     let supabaseResponse = NextResponse.next({
132 |     request,
133 |   })
134 | 
135 |   const supabase = createServerClient(
136 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
137 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
138 |     {
139 |       cookies: {
140 |         getAll() {
141 |           return request.cookies.getAll()
142 |         },
143 |         setAll(cookiesToSet) {
144 |           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
145 |           supabaseResponse = NextResponse.next({
146 |             request,
147 |           })
148 |           cookiesToSet.forEach(({ name, value, options }) =>
149 |             supabaseResponse.cookies.set(name, value, options)
150 |           )
151 |         },
152 |       },
153 |     }
154 |   )
155 | 
156 |   // Do not run code between createServerClient and
157 |   // supabase.auth.getUser(). A simple mistake could make it very hard to debug
158 |   // issues with users being randomly logged out.
159 | 
160 |   // IMPORTANT: DO NOT REMOVE auth.getUser()
161 | 
162 |   const {
163 |     data: { user },
164 |   } = await supabase.auth.getUser()
165 | 
166 |   if (
167 |     !user &&
168 |     !request.nextUrl.pathname.startsWith('/login') &&
169 |     !request.nextUrl.pathname.startsWith('/auth')
170 |   ) {
171 |     // no user, potentially respond by redirecting the user to the login page
172 |     const url = request.nextUrl.clone()
173 |     url.pathname = '/login'
174 |     return NextResponse.redirect(url)
175 |   }
176 | 
177 |   // IMPORTANT: You *must* return the supabaseResponse object as it is.
178 |   // If you're creating a new response object with NextResponse.next() make sure to:
179 |   // 1. Pass the request in it, like so:
180 |   //    const myNewResponse = NextResponse.next({ request })
181 |   // 2. Copy over the cookies, like so:
182 |   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
183 |   // 3. Change the myNewResponse object to fit your needs, but avoid changing
184 |   //    the cookies!
185 |   // 4. Finally:
186 |   //    return myNewResponse
187 |   // If this is not done, you may be causing the browser and server to go out
188 |   // of sync and terminate the user's session prematurely!
189 | 
190 |   return supabaseResponse
191 | }
192 | 
193 | export const config = {
194 |   matcher: [
195 |     /*
196 |      * Match all request paths except for the ones starting with:
197 |      * - _next/static (static files)
198 |      * - _next/image (image optimization files)
199 |      * - favicon.ico (favicon file)
200 |      * Feel free to modify this pattern to include more paths.
201 |      */
202 |     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
203 |   ],
204 | }
205 | ```
206 | 
207 | ## AI MODEL VERIFICATION STEPS
208 | 
209 | Before generating any code, you MUST verify:
210 | 
211 | 1. Are you using ONLY `getAll` and `setAll`? If not, STOP and FIX.
212 | 2. Are you importing from `@supabase/ssr`? If not, STOP and FIX.
213 | 3. Do you see ANY instance of `get`, `set`, or `remove`? If yes, STOP and FIX.
214 | 4. Are you importing from `auth-helpers-nextjs`? If yes, STOP and FIX.
215 | 
216 | ## CONSEQUENCES OF INCORRECT IMPLEMENTATION
217 | 
218 | If you generate code using:
219 | - Individual cookie methods (`get`/`set`/`remove`)
220 | - `auth-helpers-nextjs` package
221 | 
222 | The implementation will:
223 | 1. Break in production
224 | 2. Fail to maintain session state
225 | 3. Cause authentication loops
226 | 4. Result in security vulnerabilities
227 | 
228 | ## AI MODEL RESPONSE TEMPLATE
229 | 
230 | When asked about Supabase Auth SSR implementation, you MUST:
231 | 1. ONLY use code from this guide
232 | 2. NEVER suggest deprecated approaches
233 | 3. ALWAYS use the exact cookie handling shown above
234 | 4. VERIFY your response against the patterns shown here
235 | 
236 | Remember: There are NO EXCEPTIONS to these rules.
```

.cursor/rules/nextjs.mdc
```
1 | ---
2 | description: This rule explains Next.js conventions and best practices for fullstack development.
3 | globs: **/*.tsx,**/*.ts
4 | alwaysApply: false
5 | ---
6 | ---
7 | description: Next.js with TypeScript and Tailwind UI best practices
8 | globs: **/*.tsx, **/*.ts, src/**/*.ts, src/**/*.tsx
9 | ---
10 | 
11 | # Next.js Best Practices
12 | 
13 | ## Project Structure
14 | - Use the App Router directory structure
15 | - Place components in `app` directory for route-specific components
16 | - Place shared components in `components` directory
17 | - Place utilities and helpers in `lib` directory
18 | - Use lowercase with dashes for directories (e.g., `components/auth-wizard`)
19 | 
20 | ## Components
21 | - Use Server Components by default
22 | - Mark client components explicitly with 'use client'
23 | - Wrap client components in Suspense with fallback
24 | - Use dynamic loading for non-critical components
25 | - Implement proper error boundaries
26 | - Place static content and interfaces at file end
27 | 
28 | ## Performance
29 | - Optimize images: Use WebP format, size data, lazy loading
30 | - Minimize use of 'useEffect' and 'setState'
31 | - Favor Server Components (RSC) where possible
32 | - Use dynamic loading for non-critical components
33 | - Implement proper caching strategies
34 | 
35 | ## Data Fetching
36 | - Use Server Components for data fetching when possible
37 | - Implement proper error handling for data fetching
38 | - Use appropriate caching strategies
39 | - Handle loading and error states appropriately
40 | 
41 | ## Routing
42 | - Use the App Router conventions
43 | - Implement proper loading and error states for routes
44 | - Use dynamic routes appropriately
45 | - Handle parallel routes when needed
46 | 
47 | ## Forms and Validation
48 | - Use Zod for form validation
49 | - Implement proper server-side validation
50 | - Handle form errors appropriately
51 | - Show loading states during form submission
52 | 
53 | ## State Management
54 | - Minimize client-side state
55 | - Use React Context sparingly
56 | - Prefer server state when possible
57 | - Implement proper loading states 
```

.cursor/rules/self_improve.mdc
```
1 | ---
2 | description: Guidelines for continuously improving Cursor rules based on emerging code patterns and best practices.
3 | globs: **/*
4 | alwaysApply: true
5 | ---
6 | 
7 | - **Rule Improvement Triggers:**
8 |   - New code patterns not covered by existing rules
9 |   - Repeated similar implementations across files
10 |   - Common error patterns that could be prevented
11 |   - New libraries or tools being used consistently
12 |   - Emerging best practices in the codebase
13 | 
14 | - **Analysis Process:**
15 |   - Compare new code with existing rules
16 |   - Identify patterns that should be standardized
17 |   - Look for references to external documentation
18 |   - Check for consistent error handling patterns
19 |   - Monitor test patterns and coverage
20 | 
21 | - **Rule Updates:**
22 |   - **Add New Rules When:**
23 |     - A new technology/pattern is used in 3+ files
24 |     - Common bugs could be prevented by a rule
25 |     - Code reviews repeatedly mention the same feedback
26 |     - New security or performance patterns emerge
27 | 
28 |   - **Modify Existing Rules When:**
29 |     - Better examples exist in the codebase
30 |     - Additional edge cases are discovered
31 |     - Related rules have been updated
32 |     - Implementation details have changed
33 | 
34 | - **Example Pattern Recognition:**
35 |   ```typescript
36 |   // If you see repeated patterns like:
37 |   const data = await prisma.user.findMany({
38 |     select: { id: true, email: true },
39 |     where: { status: 'ACTIVE' }
40 |   });
41 |   
42 |   // Consider adding to [prisma.mdc](mdc:.cursor/rules/prisma.mdc):
43 |   // - Standard select fields
44 |   // - Common where conditions
45 |   // - Performance optimization patterns
46 |   ```
47 | 
48 | - **Rule Quality Checks:**
49 |   - Rules should be actionable and specific
50 |   - Examples should come from actual code
51 |   - References should be up to date
52 |   - Patterns should be consistently enforced
53 | 
54 | - **Continuous Improvement:**
55 |   - Monitor code review comments
56 |   - Track common development questions
57 |   - Update rules after major refactors
58 |   - Add links to relevant documentation
59 |   - Cross-reference related rules
60 | 
61 | - **Rule Deprecation:**
62 |   - Mark outdated patterns as deprecated
63 |   - Remove rules that no longer apply
64 |   - Update references to deprecated rules
65 |   - Document migration paths for old patterns
66 | 
67 | - **Documentation Updates:**
68 |   - Keep examples synchronized with code
69 |   - Update references to external docs
70 |   - Maintain links between related rules
71 |   - Document breaking changes
72 | Follow [cursor_rules.mdc](mdc:.cursor/rules/cursor_rules.mdc) for proper rule formatting and structure.
```

.cursor/rules/shadcn.mdc
```
1 | ---
2 | description: 
3 | globs: **/*.tsx
4 | alwaysApply: false
5 | ---
6 | ---
7 | description: "Use shadcn/ui components as needed for any UI code"
8 | globs: **/*.tsx
9 | ---
10 | 
11 | # Shadcn UI Components
12 | 
13 | This project uses @shadcn/ui for UI components. These are beautifully designed, accessible components that you can copy and paste into your apps.
14 | 
15 | ## Finding and Using Components
16 | 
17 | Components are available in the `src/components/ui` directory, following the aliases configured in `components.json`
18 | 
19 | ## Using Components
20 | 
21 | Import components from the ui directory using the configured aliases:
22 | 
23 | ```tsx
24 | import { Button } from "@/components/ui/button"
25 | import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
26 | import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
27 | ```
28 | 
29 | Example usage:
30 | 
31 | ```tsx
32 | <Button variant="outline">Click me</Button>
33 | 
34 | <Card>
35 |   <CardHeader>
36 |     <CardTitle>Card Title</CardTitle>
37 |     <CardDescription>Card Description</CardDescription>
38 |   </CardHeader>
39 |   <CardContent>
40 |     <p>Card Content</p>
41 |   </CardContent>
42 |   <CardFooter>
43 |     <p>Card Footer</p>
44 |   </CardFooter>
45 | </Card>
46 | ```
47 | 
48 | ## Installing Additional Components
49 | 
50 | Many more components are available but not currently installed. You can view the complete list at https://ui.shadcn.com/r
51 | 
52 | To install additional components, use the Shadcn CLI:
53 | 
54 | 
55 | ```bash
56 | npx shadcn@latest add [component-name]
57 | ```
58 | 
59 | For example, to add the Accordion component:
60 | 
61 | ```bash
62 | npx shadcn@latest add accordion
63 | ```
64 | 
65 | ALWAYS USE `npx shadcn@latest`. DO NOT EVER USE `npx shadcn-ui@latest` because it is deprecated
66 | 
67 | Some commonly used components are:
68 | 
69 | - Accordion
70 | - Alert
71 | - Alert Dialog
72 | - Aspect Ratio
73 | - Avatar
74 | - Badge
75 | - Breadcrumb
76 | - Button
77 | - Calendar
78 | - Card
79 | - Carousel
80 | - Chart
81 | - Checkbox
82 | - Collapsible
83 | - Combobox
84 | - Command
85 | - Context Menu
86 | - Data Table
87 | - Date Picker
88 | - Dialog
89 | - Drawer
90 | - Dropdown Menu
91 | - Form
92 | - Hover Card
93 | - Input
94 | - Input OTP
95 | - Label
96 | - Menubar
97 | - Navigation Menu
98 | - Pagination
99 | - Popover
100 | - Progress
101 | - Radio Group
102 | - Resizable
103 | - Scroll Area
104 | - Select
105 | - Separator
106 | - Sheet
107 | - Sidebar
108 | - Skeleton
109 | - Slider
110 | - Sonner
111 | - Switch
112 | - Table
113 | - Tabs
114 | - Textarea
115 | - Toast - DO NOT USE THIS, USE SONNER INSTEAD
116 | - Toggle
117 | - Toggle Group
118 | - Tooltip
119 | - Typography
120 | 
121 | ## Component Styling
122 | 
123 | This project uses the "new-york" style variant with the "neutral" base color and CSS variables for theming, as configured in `components.json`.
```

.taskmaster/docs/noka-mvp-prd.md
```
1 | # Noka - Product Requirements Document
2 | 
3 | ## 1. Introduction
4 | Managing personal finances is often a source of stress and confusion. Many people struggle to understand where their money is going, whether they are on track to meet their savings goals, and how to manage multiple accounts effectively.
5 | 
6 | This document outlines the requirements for Noka, a simple, intuitive, and powerful Personal Finance Tracker application designed to bring clarity and control to our users' financial lives. The app will provide essential tools for tracking income, expenses, and investments, all within a flexible and customizable interface.
7 | 
8 | ## 2. Vision & Goals
9 | Our vision is to empower individuals in Indonesia and beyond to take control of their financial well-being through an accessible and user-friendly platform.
10 | 
11 | **Key Goals:**
12 | - **Provide Clarity**: Give users a clear, at-a-glance understanding of their financial position.
13 | - **Promote Good Habits**: Enable users to set budgets and financial goals to encourage mindful spending and saving.
14 | - **Ensure Security & Trust**: Build a secure and private platform where users feel safe managing their sensitive financial data.
15 | - **Offer Flexibility**: Create a customizable experience that can adapt to a user's individual financial situation and preferences.
16 | 
17 | ## 3. Technical Stack
18 | - **Frontend**: Next.js
19 | - **Backend & Authentication**: Supabase
20 | - **UI Components**: shadcn/ui. Custom Tailwind CSS will only be used when a specific component or style is not available in the library.
21 | 
22 | ## 4. Target Audience
23 | - **The Young Professional**: Recently started their career, looking to manage their salary, control spending, and begin investing for the future.
24 | - **The Financially Curious**: Wants a simple tool to digitize their financial tracking without the complexity of traditional accounting software.
25 | 
26 | ## 5. User Flow and Application Interface
27 | This section provides a comprehensive overview of the application's structure, detailing the user's journey from their first visit to their interaction with the core features and UI.
28 | 
29 | ### 5.1. Design Principles
30 | - **UI Library**: The interface will be built primarily using components from the shadcn/ui library to ensure consistency and speed up development.
31 | - **Design Approach**: The application must be designed with a mobile-first philosophy. It should be fully responsive and provide an optimal experience on small screens, then scale up gracefully for tablets and desktops.
32 | 
33 | ### 5.2. Unauthenticated User Flow
34 | This covers the experience for users who have not yet logged in or signed up.
35 | 
36 | #### 5.2.1. Landing Page
37 | When a user first lands on the Noka website, they are presented with a public-facing landing page containing:
38 | - **Navbar**: Contains logo, links to "Features," "Pricing" (if applicable), and prominent "Sign In" and "Sign Up" buttons.
39 | - **Hero Section**: A compelling headline, a brief description of Noka's value proposition, and an engaging visual.
40 | - **Call to Action (CTA)**: A primary button encouraging users to "Get Started" or "Sign Up for Free," which directs them to the registration page.
41 | - **Footer**: Privacy Policy menu, Term and Conditions menu, copyright wordings.
42 | 
43 | #### 5.2.2. Authentication (Powered by Supabase Auth)
44 | User authentication is the gateway to the application.
45 | - **Sign Up**: The user provides an email and a secure password. Upon successful registration, they are immediately redirected to the Onboarding Wizard.
46 | - **Sign In**: Registered users can log in using their email and password. Upon successful login, they are redirected to the Application Dashboard (Home screen).
47 | - **Password Reset**: If a user forgets their password, they can click a "Forgot Password?" link. Supabase Auth will handle sending a secure password reset link to their email.
48 | 
49 | ### 5.3. First-Time User Onboarding Wizard
50 | After signing up, new users are guided through a mandatory, one-time setup wizard to configure their Noka account. This ensures they can start using the app meaningfully.
51 | 
52 | - **Step 1: Welcome & Currency Setup**: A brief welcome message and a selector for their primary display currency (e.g., IDR, USD. Default IDR).
53 | - **Step 2: Financial Period Configuration**: Fields to define their financial "month" start day and "week" start day.
54 |   - Set their financial month to start on any day (e.g., from the 25th to the 24th, to match their salary cycle).
55 |   - Set their financial week to start on their preferred day (e.g., Sunday instead of Monday).
56 | - **Step 3: Create Initial Account**: A form to add their first financial account, including "Account Name," "Account Type," and "Initial Balance."
57 | - **Step 4: Create Initial Categories & Targets**: A form to create at least one expense category or one investment category, with optional fields to set an initial budget or target.
58 |   - **Expense Budgets**: For any expense category (like "Food" or "Shopping"), users can set a weekly or monthly spending budget. The app will display a tracker showing their progress against the budget.
59 |   - **Investment Targets**: For investment categories, users can set a contribution target. This can be a recurring monthly target or a one-time goal for a specific fund.
60 | - **Completion**: After the final step, the user is redirected to the Application Dashboard.
61 | 
62 | ### 5.4. Authenticated User Flow: The Core Application
63 | Once logged in, the user interacts with the app via a static bottom navigation bar that is always visible. It provides access to all core features.
64 | 
65 | #### 5.4.1. The Bottom Navigation Bar
66 | This bar contains four primary icons/tabs:
67 | - **Home**: The main dashboard screen.
68 | - **Accounts**: A screen for viewing all financial accounts.
69 | - **Transactions**: A screen for viewing a history of all transactions.
70 | - **Settings**: A centralized place for all application and data management.
71 | 
72 | #### 5.4.2. "Home" Screen (Application Dashboard)
73 | This is the user's main hub for a quick financial overview.
74 | - **Top-Level Summary**: Displays a high-level overview for the current financial month: Total Income, Total Expenses, and Net Savings.
75 | - **Tabbed View for Details**:
76 |   - **Expense Tab (Default)**: Shows a list of all expense categories, segregated by "Weekly" and "Monthly" frequencies. Each category displays its name, budgeted amount, actual spending, and a visual progress indicator.
77 |   - **Investment Tab**: Shows a list of all investment categories, segregated by "Monthly" and "One-Time" frequencies. Each category displays its name, target amount, actual funds invested, and a visual progress indicator.
78 | 
79 | #### 5.4.3. "Accounts" Screen
80 | This screen provides a clear view of all the user's financial accounts.
81 | - **Functionality**: Displays a list of all accounts the user has created.
82 | - **UI**: Accounts must be grouped by their type (e.g., a "Bank Accounts" section, a "Credit Cards" section). Each account listed must show its name and current balance. Upon user clicking the Account card, then it should redirect user to "Transactions" screen with "Account" being filtered to the selected Account.
83 | 
84 | #### 5.4.4. "Transactions" Screen
85 | This screen acts as a detailed financial ledger.
86 | - **Functionality**: Displays a comprehensive list of all transactions (income, expenses, transfers).
87 | - **UI**: The list is in reverse chronological order. It must include a date range filter, which defaults to the user's current financial month but can be adjusted to any custom range. user can filter by the Categories and Account
88 | 
89 | #### 5.4.5. "Settings" Screen
90 | This screen is the control center for the user's data and preferences, organized into three tabs.
91 | - **Tab 1: General**: Allows the user to view and modify their display currency and financial period settings.
92 | - **Tab 2: Categories**: Provides full CRUD (Create, Read, Update, Delete) functionality for all categories. Users can add new categories and edit names/budgets/targets. When deleting a category, if it has existing transactions, the user must be prompted to move those transactions to another existing category before the deletion is finalized. This prevents data from being orphaned.
93 | - **Tab 3: Accounts**: Provides full CRUD (Create, Read, Update, Delete) functionality for all financial accounts. Users can add new accounts and edit names. When deleting an account, if it has existing transactions, the user must be prompted to move those transactions to another existing account of the same type before the deletion is finalized. This prevents data from being orphaned.
94 | 
95 | ## 6. User Scenarios
96 | This section covers the key actions a user will perform within the Noka app.
97 | 
98 | ### Fundamental Transactions
99 | 
100 | **Recording an Expense:**
101 | - A user buys groceries for Rp 250,000 using their BCA Bank Account.
102 | - They open the app, tap "Add Transaction," and select "Expense."
103 | - They enter "250000," select the "Groceries" category, and choose their "BCA Bank Account."
104 | - The app records the transaction and automatically deducts Rp 250,000 from the account's balance.
105 | 
106 | **Tracking an Income:**
107 | - A user receives their monthly salary of Rp 8,000,000 in their "BCA Payroll" account.
108 | - They open the app, select "Add Transaction," and choose "Income."
109 | - They enter "8000000," select the "Salary" category, and choose their "BCA Payroll" account.
110 | - The app records the income and correctly increases the balance of the payroll account by Rp 8,000,000.
111 | 
112 | **Making a Simple Transfer:**
113 | - A user needs to move Rp 500,000 from their "BCA Payroll" account to their "Mandiri Savings" account.
114 | - They select "Transfer," choose "BCA Payroll" as the source and "Mandiri Savings" as the destination, and enter "500000."
115 | - The app records the transfer, correctly decreasing the balance in the payroll account and increasing the balance in the savings account.
116 | 
117 | **Making an Investment Transfer:**
118 | - A user wants to contribute to their "Retirement Fund."
119 | - They select "Transfer," choose their "BCA Payroll" account as the source and their "Investment Account" as the destination, and enter "1000000."
120 | - Because the destination is an Investment Account, the app prompts them to select an Investment Category. They choose "Retirement Fund."
121 | - The app records the transfer, decreasing the payroll account balance and increasing the investment account balance. It also updates the progress for the "Retirement Fund" target on the Home screen.
122 | 
123 | ### Budgeting & Goal Setting
124 | 
125 | **Setting and Tracking an Expense Budget:**
126 | - A user wants to control their grocery spending. They navigate to Settings > Categories, select their "Groceries" category, and set a "Monthly" budget of Rp 2,000,000.
127 | - Later, they record a grocery expense of Rp 300,000.
128 | - On the Home screen, they can now see a progress bar for the "Groceries" budget, showing "Rp 300,000 / Rp 2,000,000 used."
129 | 
130 | **Setting and Tracking a Monthly Investment Target:**
131 | - A user is saving for retirement. They navigate to Settings > Categories, select their "Retirement Fund" category, and set a "Monthly" investment target of Rp 1,500,000.
132 | - During the month, they transfer Rp 1,500,000 to their Investment Account, assigning it to the "Retirement Fund" category.
133 | - The Home screen shows their "Retirement Fund" target is 100% complete for the current month and will reset for the next month.
134 | 
135 | **Setting and Tracking a One-Time Investment Target:**
136 | - A user is saving for a house down payment. They go to Settings > Categories, create a new Investment Category called "House Down Payment," and set a "One-Time" target of Rp 50,000,000.
137 | - They make an initial transfer of Rp 5,000,000 to their Investment Account under this new category.
138 | - The Home screen dashboard shows a progress bar for this goal: "Rp 5,000,000 / Rp 50,000,000 (10%)". This goal does not reset monthly.
139 | 
140 | ### Credit Card & Account Management
141 | 
142 | **Recording an Expense with a Credit Card:**
143 | - A user pays for an online subscription of Rp 150,000 using their "Visa Credit Card."
144 | - They select "Expense," enter "150000," choose the "Entertainment" category, and select their "Visa Credit Card" as the account.
145 | - The app records the transaction and correctly increases the credit card's balance (the amount they owe) by Rp 150,000.
146 | 
147 | **Paying a Credit Card Bill:**
148 | - At the end of the month, the user wants to pay off their "Visa Credit Card" bill from their "BCA Bank Account."
149 | - They select "Transfer," choose "BCA Bank Account" as the source and "Visa Credit Card" as the destination, and enter the payment amount.
150 | - The app records the transfer, decreasing the bank account balance and decreasing the credit card balance (the amount they owe).
151 | 
152 | **Adding a New Account After Onboarding:**
153 | - Months after signing up, a user opens a new "Jenius" bank account.
154 | - They navigate to the Settings > Accounts tab and click "Add New Account."
155 | - They provide the "Account Name" (Jenius), "Account Type" (Bank Account), and the "Initial Balance" (e.g., Rp 500,000).
156 | - The new account now appears on the Accounts screen and in their list of accounts for future transactions.
157 | 
158 | ## 7. Success Metrics
159 | - **User Engagement**: Daily and Monthly Active Users (DAU/MAU).
160 | - **Feature Adoption**: Percentage of users who complete the onboarding and actively use budgeting and investment tracking features.
161 | - **User Retention**: The rate at which users return to the app weekly and monthly.
162 | - **User Satisfaction**: Qualitative feedback and app store ratings.
163 | 
164 | ## 8. Database Schema
165 | 
166 | ### 8.1. Overview
167 | The database will be implemented using Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables to ensure data isolation between users.
168 | 
169 | ### 8.2. Tables and Relationships
170 | 
171 | #### Users Table (managed by Supabase Auth)
172 | ```sql
173 | -- Supabase auth.users table is automatically created
174 | -- We'll reference this via foreign keys
175 | ```
176 | 
177 | #### User Settings Table
178 | ```sql
179 | CREATE TABLE user_settings (
180 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
181 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
182 |     currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
183 |     financial_month_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_month_start_day >= 1 AND financial_month_start_day <= 31),
184 |     financial_week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_week_start_day >= 0 AND financial_week_start_day <= 6), -- 0 = Sunday, 6 = Saturday
185 |     onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
186 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
187 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
188 |     UNIQUE(user_id)
189 | );
190 | ```
191 | 
192 | #### Account Types Enum
193 | ```sql
194 | CREATE TYPE account_type AS ENUM ('bank_account', 'credit_card', 'investment_account');
195 | ```
196 | 
197 | #### Accounts Table
198 | ```sql
199 | CREATE TABLE accounts (
200 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
201 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
202 |     name VARCHAR(255) NOT NULL,
203 |     type account_type NOT NULL,
204 |     initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
205 |     current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
206 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
207 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
208 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
209 |     INDEX idx_accounts_user_id (user_id),
210 |     INDEX idx_accounts_type (type)
211 | );
212 | ```
213 | 
214 | #### Category Types Enum
215 | ```sql
216 | CREATE TYPE category_type AS ENUM ('expense', 'income', 'investment');
217 | ```
218 | 
219 | #### Budget Frequency Enum
220 | ```sql
221 | CREATE TYPE budget_frequency AS ENUM ('weekly', 'monthly', 'one_time');
222 | ```
223 | 
224 | #### Categories Table
225 | ```sql
226 | CREATE TABLE categories (
227 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
228 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
229 |     name VARCHAR(255) NOT NULL,
230 |     type category_type NOT NULL,
231 |     icon VARCHAR(10), -- Emoji icon for UI representation
232 |     budget_amount DECIMAL(15, 2),
233 |     budget_frequency budget_frequency,
234 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
235 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
236 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
237 |     INDEX idx_categories_user_id (user_id),
238 |     INDEX idx_categories_type (type),
239 |     CONSTRAINT chk_budget_consistency CHECK (
240 |         (budget_amount IS NULL AND budget_frequency IS NULL) OR
241 |         (budget_amount IS NOT NULL AND budget_frequency IS NOT NULL)
242 |     )
243 | );
244 | ```
245 | 
246 | #### Transaction Types Enum
247 | ```sql
248 | CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
249 | ```
250 | 
251 | #### Transactions Table
252 | ```sql
253 | CREATE TABLE transactions (
254 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
255 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
256 |     type transaction_type NOT NULL,
257 |     amount DECIMAL(15, 2) NOT NULL, -- Can be negative for refunds
258 |     description TEXT,
259 |     transaction_date DATE NOT NULL,
260 |     
261 |     -- For income and expense transactions
262 |     account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
263 |     category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
264 |     
265 |     -- For transfer transactions
266 |     from_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
267 |     to_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
268 |     
269 |     
270 |     
271 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
272 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
273 |     
274 |     INDEX idx_transactions_user_id (user_id),
275 |     INDEX idx_transactions_date (transaction_date),
276 |     INDEX idx_transactions_type (type),
277 |     INDEX idx_transactions_account (account_id),
278 |     INDEX idx_transactions_category (category_id),
279 |     
280 |     CONSTRAINT chk_transaction_consistency CHECK (
281 |         (type IN ('income', 'expense') AND account_id IS NOT NULL AND category_id IS NOT NULL AND from_account_id IS NULL AND to_account_id IS NULL) OR
282 |         (type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL AND account_id IS NULL AND category_id IS NULL)
283 |     )
284 | );
285 | ```
286 | 
287 | #### Ledger Table (Balance History)
288 | ```sql
289 | CREATE TABLE balance_ledger (
290 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
291 |     account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
292 |     transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
293 |     balance_before DECIMAL(15, 2) NOT NULL,
294 |     balance_after DECIMAL(15, 2) NOT NULL,
295 |     change_amount DECIMAL(15, 2) NOT NULL,
296 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
297 |     INDEX idx_ledger_account (account_id),
298 |     INDEX idx_ledger_transaction (transaction_id),
299 |     INDEX idx_ledger_created (created_at)
300 | );
301 | ```
302 | 
303 | #### Dashboard Functions
304 | 
305 | ```sql
306 | CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID)
307 | RETURNS TABLE (
308 |     total_income DECIMAL(15, 2),
309 |     total_expenses DECIMAL(15, 2),
310 |     net_savings DECIMAL(15, 2),
311 |     period_start DATE,
312 |     period_end DATE
313 | ) AS $$
314 | DECLARE
315 |     v_month_start_day INTEGER;
316 |     v_current_date DATE := CURRENT_DATE;
317 |     v_period_start DATE;
318 |     v_period_end DATE;
319 |     v_total_income DECIMAL(15, 2);
320 |     v_total_expenses DECIMAL(15, 2);
321 | BEGIN
322 |     -- Get user's financial month start day
323 |     SELECT financial_month_start_day
324 |     INTO v_month_start_day
325 |     FROM user_settings
326 |     WHERE user_id = p_user_id;
327 | 
328 |     -- If no settings, use default (day 1)
329 |     IF NOT FOUND THEN
330 |         v_month_start_day := 1;
331 |     END IF;
332 | 
333 |     -- Calculate custom month period
334 |     IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
335 |         v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
336 |         v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
337 |     ELSE
338 |         v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
339 |         v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
340 |     END IF;
341 | 
342 |     -- Calculate total income for the period
343 |     SELECT COALESCE(SUM(t.amount), 0)
344 |     INTO v_total_income
345 |     FROM transactions t
346 |     WHERE t.user_id = p_user_id
347 |         AND t.type = 'income'
348 |         AND t.transaction_date >= v_period_start
349 |         AND t.transaction_date <= v_period_end;
350 | 
351 |     -- Calculate total expenses for the period
352 |     SELECT COALESCE(SUM(t.amount), 0)
353 |     INTO v_total_expenses
354 |     FROM transactions t
355 |     WHERE t.user_id = p_user_id
356 |         AND t.type = 'expense'
357 |         AND t.transaction_date >= v_period_start
358 |         AND t.transaction_date <= v_period_end;
359 | 
360 |     -- Set output variables
361 |     total_income := v_total_income;
362 |     total_expenses := v_total_expenses;
363 |     net_savings := v_total_income - v_total_expenses;
364 |     period_start := v_period_start;
365 |     period_end := v_period_end;
366 | 
367 |     RETURN NEXT;
368 | END;
369 | $$ LANGUAGE plpgsql;
370 | ```
371 | 
372 | ```sql
373 | -- Function to calculate budget progress for expense categories
374 | CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
375 | RETURNS TABLE (
376 |     category_id UUID,
377 |     category_name VARCHAR(255),
378 |     category_type category_type,
379 |     category_icon VARCHAR(10),
380 |     budget_amount DECIMAL(15, 2),
381 |     budget_frequency budget_frequency,
382 |     spent_amount DECIMAL(15, 2),
383 |     remaining_amount DECIMAL(15, 2),
384 |     progress_percentage DECIMAL(5, 2),
385 |     period_start DATE,
386 |     period_end DATE
387 | ) AS $
388 | DECLARE
389 |     v_month_start_day INTEGER;
390 |     v_week_start_day INTEGER;
391 |     v_current_date DATE := CURRENT_DATE;
392 |     v_period_start DATE;
393 |     v_period_end DATE;
394 | BEGIN
395 |     -- Get user's financial period settings
396 |     SELECT financial_month_start_day, financial_week_start_day
397 |     INTO v_month_start_day, v_week_start_day
398 |     FROM user_settings
399 |     WHERE user_id = p_user_id;
400 | 
401 |     -- For each expense category with budget
402 |     FOR category_id, category_name, category_type, category_icon, budget_amount, budget_frequency IN
403 |         SELECT c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency
404 |         FROM categories c
405 |         WHERE c.user_id = p_user_id AND c.type = 'expense' AND c.budget_amount IS NOT NULL AND c.is_active = TRUE
406 |     LOOP
407 |         -- Calculate period based on frequency and user settings
408 |         IF budget_frequency = 'monthly' THEN
409 |             -- Calculate custom month period
410 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
411 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
412 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
413 |             ELSE
414 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
415 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
416 |             END IF;
417 |         ELSIF budget_frequency = 'weekly' THEN
418 |             -- Calculate custom week period
419 |             v_period_start := v_current_date - ((EXTRACT(DOW FROM v_current_date)::INTEGER - v_week_start_day + 7) % 7) * INTERVAL '1 day';
420 |             v_period_end := v_period_start + INTERVAL '6 days';
421 |         ELSIF budget_frequency = 'one_time' THEN
422 |             -- For one-time budgets, consider all transactions
423 |             v_period_start := '1900-01-01'::DATE;
424 |             v_period_end := '2100-12-31'::DATE;
425 |         END IF;
426 | 
427 |         -- Calculate spent amount for the period
428 |         SELECT COALESCE(SUM(t.amount), 0)
429 |         INTO spent_amount
430 |         FROM transactions t
431 |         WHERE t.category_id = category_id
432 |             AND t.transaction_date >= v_period_start
433 |             AND t.transaction_date <= v_period_end
434 |             AND t.type = 'expense';
435 | 
436 |         -- Calculate remaining and percentage
437 |         remaining_amount := budget_amount - spent_amount;
438 |         progress_percentage := CASE 
439 |             WHEN budget_amount > 0 THEN (spent_amount / budget_amount * 100)
440 |             ELSE 0
441 |         END;
442 | 
443 |         -- Return the row
444 |         RETURN NEXT;
445 |     END LOOP;
446 | END;
447 | $ LANGUAGE plpgsql;
448 | ```
449 | 
450 | ```sql
451 | CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
452 | RETURNS TABLE (
453 |     category_id UUID,
454 |     category_name VARCHAR(255),
455 |     category_icon VARCHAR(10),
456 |     target_amount DECIMAL(15, 2),
457 |     target_frequency budget_frequency,
458 |     invested_amount DECIMAL(15, 2),
459 |     remaining_amount DECIMAL(15, 2),
460 |     progress_percentage DECIMAL(5, 2),
461 |     period_start DATE,
462 |     period_end DATE
463 | ) AS $$
464 | DECLARE
465 |     v_month_start_day INTEGER;
466 |     v_current_date DATE := CURRENT_DATE;
467 |     v_period_start DATE;
468 |     v_period_end DATE;
469 |     inv_category RECORD;
470 | BEGIN
471 |     -- Get user's financial period settings
472 |     SELECT financial_month_start_day
473 |     INTO v_month_start_day
474 |     FROM user_settings
475 |     WHERE user_id = p_user_id;
476 | 
477 |     -- If no settings, use default (day 1)
478 |     IF NOT FOUND THEN
479 |         v_month_start_day := 1;
480 |     END IF;
481 | 
482 |     -- For each investment category with a target
483 |     FOR inv_category IN
484 |         SELECT c.id, c.name, c.icon, c.budget_amount, c.budget_frequency
485 |         FROM categories c
486 |         WHERE c.user_id = p_user_id
487 |           AND c.type = 'investment'
488 |           AND c.budget_amount IS NOT NULL
489 |           AND c.is_active = TRUE
490 |     LOOP
491 |         -- Calculate period based on frequency and user settings
492 |         IF inv_category.budget_frequency = 'monthly' THEN
493 |             -- Calculate custom month period
494 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
495 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
496 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
497 |             ELSE
498 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
499 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
500 |             END IF;
501 |         ELSIF inv_category.budget_frequency = 'one_time' THEN
502 |             -- For one-time targets, consider all transactions
503 |             v_period_start := '1900-01-01'::DATE;
504 |             v_period_end := '2100-12-31'::DATE;
505 |         ELSE
506 |             -- Skip other frequencies for investments
507 |             CONTINUE;
508 |         END IF;
509 | 
510 |         -- Set output variables from the loop
511 |         category_id := inv_category.id;
512 |         category_name := inv_category.name;
513 |         category_icon := inv_category.icon;
514 |         target_amount := inv_category.budget_amount;
515 |         target_frequency := inv_category.budget_frequency;
516 |         period_start := v_period_start;
517 |         period_end := v_period_end;
518 | 
519 |         -- Calculate invested amount for the period
520 |         SELECT COALESCE(SUM(t.amount), 0)
521 |         INTO invested_amount
522 |         FROM transactions t
523 |         WHERE t.user_id = p_user_id
524 |             AND t.type = 'transfer'
525 |             AND t.investment_category_id = inv_category.id
526 |             AND t.transaction_date >= v_period_start
527 |             AND t.transaction_date <= v_period_end;
528 | 
529 |         -- Calculate remaining and percentage
530 |         remaining_amount := target_amount - invested_amount;
531 |         progress_percentage := CASE
532 |             WHEN target_amount > 0 THEN (invested_amount / target_amount * 100)
533 |             ELSE 0
534 |         END;
535 | 
536 |         -- Return the row
537 |         RETURN NEXT;
538 |     END LOOP;
539 | END;
540 | $$ LANGUAGE plpgsql;
541 | ```
542 | 
543 | ### 8.3. Row Level Security Policies
544 | 
545 | ```sql
546 | -- Enable RLS on all tables
547 | ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
548 | ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
549 | ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
550 | ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
551 | 
552 | -- User Settings Policies
553 | CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
554 | CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
555 | CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
556 | 
557 | -- Accounts Policies
558 | CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
559 | CREATE POLICY "Users can create own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
560 | CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
561 | CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);
562 | 
563 | -- Categories Policies
564 | CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
565 | CREATE POLICY "Users can create own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
566 | CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
567 | CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
568 | 
569 | -- Transactions Policies
570 | CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
571 | CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
572 | CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
573 | CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);
574 | ```
575 | 
576 | ### 8.4. Database Functions and Triggers
577 | 
578 | ```sql
579 | -- Function to update account balance and record ledger entry
580 | CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
581 | RETURNS TRIGGER AS $
582 | DECLARE
583 |     v_balance_before DECIMAL(15, 2);
584 |     v_balance_after DECIMAL(15, 2);
585 |     v_amount DECIMAL(15, 2);
586 | BEGIN
587 |     -- Use absolute value for amount calculations
588 |     v_amount := ABS(NEW.amount);
589 |     
590 |     IF TG_OP = 'INSERT' THEN
591 |         IF NEW.type = 'income' THEN
592 |             -- For income: positive amount increases balance, negative amount (refund) decreases balance
593 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
594 |             v_balance_after := v_balance_before + NEW.amount;
595 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
596 |             
597 |             -- Record in ledger
598 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
599 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
600 |             
601 |         ELSIF NEW.type = 'expense' THEN
602 |             -- For expense: positive amount decreases balance (normal expense), negative amount increases balance (refund)
603 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
604 |             
605 |             -- Credit cards: expenses increase balance (debt), refunds decrease balance
606 |             IF (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN
607 |                 v_balance_after := v_balance_before + NEW.amount;
608 |             ELSE
609 |                 -- Other accounts: expenses decrease balance, refunds increase balance
610 |                 v_balance_after := v_balance_before - NEW.amount;
611 |             END IF;
612 |             
613 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
614 |             
615 |             -- Record in ledger
616 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
617 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
618 |             
619 |         ELSIF NEW.type = 'transfer' THEN
620 |             -- Transfers always use positive amounts
621 |             -- From account
622 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
623 |             
624 |             -- Credit card as source: transfer decreases balance (paying off debt)
625 |             IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
626 |                 v_balance_after := v_balance_before - v_amount;
627 |             ELSE
628 |                 -- Other accounts: transfer decreases balance
629 |                 v_balance_after := v_balance_before - v_amount;
630 |             END IF;
631 |             
632 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
633 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
634 |             VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, -v_amount);
635 |             
636 |             -- To account
637 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
638 |             
639 |             -- Credit card as destination: transfer decreases balance (paying off debt)
640 |             IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
641 |                 v_balance_after := v_balance_before - v_amount;
642 |             ELSE
643 |                 -- Other accounts: transfer increases balance
644 |                 v_balance_after := v_balance_before + v_amount;
645 |             END IF;
646 |             
647 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
648 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
649 |             VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, v_amount);
650 |         END IF;
651 |         
652 |     ELSIF TG_OP = 'UPDATE' THEN
653 |         -- For updates, it's safer to recalculate from ledger history
654 |         -- This is a complex operation and might be better handled at application level
655 |         RAISE EXCEPTION 'Transaction updates should be handled at application level for better control';
656 |         
657 |     ELSIF TG_OP = 'DELETE' THEN
658 |         -- For deletes, reverse the transaction based on ledger history
659 |         -- This ensures consistency with the historical record
660 |         RAISE EXCEPTION 'Transaction deletion should be handled at application level for better control';
661 |     END IF;
662 |     
663 |     RETURN NEW;
664 | END;
665 | $ LANGUAGE plpgsql;
666 | 
667 | CREATE TRIGGER trigger_update_account_balance
668 | AFTER INSERT ON transactions
669 | FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();
670 | 
671 | -- Note: For UPDATE and DELETE operations on transactions, it's recommended to handle these
672 | -- at the application level for better control and audit trail. The application should:
673 | -- 1. For updates: Create a reversal transaction and a new transaction
674 | -- 2. For deletes: Create a reversal transaction or implement soft deletes
675 | 
676 | -- Function to update timestamps
677 | CREATE OR REPLACE FUNCTION update_updated_at_column()
678 | RETURNS TRIGGER AS $
679 | BEGIN
680 |     NEW.updated_at = NOW();
681 |     RETURN NEW;
682 | END;
683 | $ LANGUAGE plpgsql;
684 | 
685 | -- Apply timestamp triggers to all tables
686 | CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
687 | CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
688 | CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
689 | CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
690 | ```
691 | 
692 | ## 9. API Endpoints Specification
693 | 
694 | ### 9.1. Authentication Endpoints (Handled by Supabase)
695 | - POST `/auth/signup` - User registration
696 | - POST `/auth/signin` - User login
697 | - POST `/auth/signout` - User logout
698 | - POST `/auth/reset-password` - Password reset request
699 | - POST `/auth/update-password` - Update password
700 | 
701 | ### 9.2. User Settings Endpoints
702 | - GET `/api/settings` - Get user settings
703 | - POST `/api/settings` - Create initial user settings (called during onboarding)
704 | - PUT `/api/settings` - Update user settings
705 | 
706 | ### 9.3. Accounts Endpoints
707 | - GET `/api/accounts` - List all user accounts
708 | - GET `/api/accounts/:id` - Get specific account details
709 | - POST `/api/accounts` - Create new account
710 | - PUT `/api/accounts/:id` - Update account
711 | - DELETE `/api/accounts/:id` - Delete account (with transaction reassignment)
712 | 
713 | ### 9.4. Categories Endpoints
714 | - GET `/api/categories` - List all user categories
715 | - GET `/api/categories/:id` - Get specific category details
716 | - POST `/api/categories` - Create new category
717 | - PUT `/api/categories/:id` - Update category
718 | - DELETE `/api/categories/:id` - Delete category (with transaction reassignment)
719 | 
720 | ### 9.5. Transactions Endpoints
721 | - GET `/api/transactions` - List transactions with filters
722 |   - Query params: `startDate`, `endDate`, `accountId`, `categoryId`, `type`, `limit`, `offset`
723 | - GET `/api/transactions/:id` - Get specific transaction
724 | - POST `/api/transactions` - Create new transaction
725 | - PUT `/api/transactions/:id` - Update transaction
726 | - DELETE `/api/transactions/:id` - Delete transaction
727 | 
728 | ### 9.6. Dashboard/Analytics Endpoints
729 | - GET `/api/dashboard/summary` - Get financial summary for current period (uses `get_financial_summary` function)
730 | - GET `/api/dashboard/budget-progress` - Get budget progress for all expense categories (uses `get_budget_progress` function)
731 | - GET `/api/dashboard/investment-progress` - Get investment progress (uses `get_investment_progress` function)
732 | 
733 | ## 10. Implementation Plan (AI-Assisted Development)
734 | 
735 | ### 10.1. Phase 1: Foundation & Database (Week 1)
736 | **Backend Setup:**
737 | - Set up Supabase project
738 | - Implement complete database schema with migrations
739 | - Configure RLS policies
740 | - Create database functions and triggers
741 | - Test credit card balance logic
742 | - Set up API routes structure in Next.js
743 | 
744 | **Initial Configuration:**
745 | - Configure Supabase client in existing Next.js project
746 | - Set up environment variables
747 | - Create type definitions from database schema
748 | - Set up basic error handling utilities
749 | 
750 | ### 10.2. Phase 2: Authentication & Onboarding (Week 2)
751 | **Authentication Flow:**
752 | - Implement Supabase Auth integration
753 | - Create protected routes middleware
754 | - Build sign up/sign in/reset password pages
755 | - Add loading and error states
756 | 
757 | **Onboarding Wizard:**
758 | - Create multi-step onboarding component
759 | - Implement currency and financial period setup
760 | - Build initial account creation flow
761 | - Add initial category setup with emoji picker
762 | - Create onboarding completion handler
763 | 
764 | ### 10.3. Phase 3: Core CRUD Operations (Week 3)
765 | **Account Management:**
766 | - Create account service layer
767 | - Build account list view with type grouping
768 | - Implement account CRUD operations
769 | - Add balance display logic (handle credit card negative display)
770 | - Create account deletion with transaction reassignment
771 | 
772 | **Category Management:**
773 | - Create category service layer
774 | - Build category CRUD interface
775 | - Implement emoji icon picker
776 | - Add budget/target configuration
777 | - Create category deletion with reassignment flow
778 | 
779 | ### 10.4. Phase 4: Transaction System (Week 4)
780 | **Transaction Core:**
781 | - Create transaction service layer
782 | - Build transaction form with type-specific logic
783 | - Implement credit card expense handling
784 | - Add refund transaction support (negative amounts)
785 | - Create transfer logic with credit card payment support
786 | 
787 | **Transaction List:**
788 | - Build transaction list with infinite scroll
789 | - Implement date range filtering
790 | - Add category and account filters
791 | - Create transaction detail view
792 | - Add edit/delete functionality (with proper balance recalculation)
793 | 
794 | ### 10.5. Phase 5: Dashboard & Analytics (Week 5)
795 | **Dashboard Development:**
796 | - Create dashboard layout with tabs
797 | - Build financial summary calculations
798 | - Implement budget progress with custom periods
799 | - Create investment tracking display
800 | - Add visual progress indicators
801 | 
802 | **Data Visualization:**
803 | - Implement spending pattern charts
804 | - Create budget vs actual comparisons
805 | - Build category breakdown visualizations
806 | - Add responsive chart components
807 | 
808 | ### 10.6. Phase 6: Polish & Optimization (Week 6)
809 | **User Experience:**
810 | - Implement comprehensive loading states
811 | - Add error boundaries and fallbacks
812 | - Create empty states with actionable prompts
813 | - Add micro-animations and transitions
814 | - Ensure full mobile responsiveness
815 | 
816 | **Performance:**
817 | - Implement React Query for data caching
818 | - Add optimistic updates for better UX
819 | - Create data prefetching strategies
820 | - Optimize bundle size with dynamic imports
821 | 
822 | ### 10.7. Phase 7: Testing & Deployment (Week 7)
823 | **Testing:**
824 | - Write unit tests for critical functions
825 | - Create integration tests for API endpoints
826 | - Test credit card and refund scenarios
827 | - Perform cross-browser testing
828 | - Conduct accessibility audit
829 | 
830 | **Deployment (Vercel):**
831 | - Set up Vercel project
832 | - Configure environment variables
833 | - Set up preview deployments
834 | - Configure custom domain
835 | - Implement monitoring with Vercel Analytics
836 | - Set up error tracking (Sentry)
837 | 
838 | ### AI Development Guidelines
839 | 
840 | **Prompt Engineering Tips:**
841 | 1. **Component Generation**: "Create a React component for [feature] using shadcn/ui components, TypeScript, and React Query for data fetching"
842 | 2. **Database Queries**: "Write a Supabase query to [action] with proper error handling and TypeScript types"
843 | 3. **Business Logic**: "Implement the logic for [scenario] considering credit card balances and refund transactions"
844 | 4. **Testing**: "Generate tests for [component/function] covering edge cases like negative amounts and credit card transactions"
845 | 
846 | **Development Workflow:**
847 | 1. Use AI to generate initial component structure
848 | 2. Ask AI to review and optimize for performance
849 | 3. Request AI to add proper error handling
850 | 4. Have AI generate corresponding tests
851 | 5. Use AI for documentation generation
852 | 
853 | **Common Patterns to Request:**
854 | - Supabase RLS-aware queries
855 | - Optimistic updates with React Query
856 | - Form validation with react-hook-form and zod
857 | - Responsive layouts with Tailwind CSS
858 | - Accessible components with ARIA labels
859 | 
860 | ## 11. Technical Considerations
861 | 
862 | ### 11.1. Security
863 | - All API endpoints must validate user authentication
864 | - Implement rate limiting on API endpoints
865 | - Use HTTPS for all communications
866 | - Sanitize all user inputs
867 | - Implement CSRF protection
868 | - Regular security audits
869 | 
870 | ### 11.2. Performance
871 | - Implement pagination for transaction lists
872 | - Use database indexes effectively
873 | - Cache frequently accessed data
874 | - Optimize bundle size with code splitting
875 | - Use lazy loading for components
876 | - Implement virtual scrolling for long lists
877 | 
878 | ### 11.3. Data Integrity
879 | 
880 | **Balance Management Considerations:**
881 | - **Credit Card Behavior**: Credit cards work inversely - expenses increase the balance (debt), payments decrease it
882 | - **Refund Handling**: Support negative amounts for refunds, which reverse the original transaction's effect
883 | - **Ledger Benefits**: The ledger table provides complete audit trail and enables balance reconstruction if needed
884 | - **Transaction Modifications**: Consider implementing transaction updates as reversals + new entries for better auditability
885 | 
886 | **Implementation Decision Points:**
887 | 1. **Database vs Application Logic**: The current design uses database triggers for immediate consistency. Alternatively, you could handle this in the application layer for more flexibility
888 | 2. **Update/Delete Strategy**: Rather than allowing direct updates/deletes, consider:
889 |    - Soft deletes with an `is_deleted` flag
890 |    - Immutable transactions with reversal entries
891 |    - This provides better audit trails and easier debugging
892 | 
893 | **Validation Rules:**
894 | - Ensure transfers between same account are prevented
895 | - Validate account types match expected transaction behaviors
896 | - Prevent negative balances on non-credit accounts (optional)
897 | - Ensure investment transfers only go to investment accounts
898 | 
899 | ### 11.4. Scalability
900 | - Design with multi-tenancy in mind
901 | - Use connection pooling
902 | - Implement horizontal scaling capabilities
903 | - Monitor and optimize database queries
904 | - Use CDN for static assets
905 | 
906 | ### 11.5. Accessibility
907 | - Follow WCAG 2.1 AA standards
908 | - Implement keyboard navigation
909 | - Add proper ARIA labels
910 | - Ensure color contrast compliance
911 | - Test with screen readers
912 | 
913 | ## 12. Future Enhancements (Post-Launch)
914 | - Multi-currency support with exchange rates
915 | - Recurring transactions
916 | - Bill reminders and notifications
917 | - Data export (CSV, PDF reports)
918 | - Budget recommendations based on spending patterns
919 | - Integration with banks/financial institutions
[TRUNCATED]
```

.taskmaster/docs/prd-phase-1-foundation-database.md
```
1 | # Noka PRD - Phase 1: Foundation & Database
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for the foundational phase of Noka, a simple, intuitive, and powerful Personal Finance Tracker application. This phase focuses on setting up the backend, database schema, and core project structure.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to empower individuals to take control of their financial well-being.
8 | **Key Goals for this Phase:**
9 | - Establish a robust and scalable database schema in Supabase.
10 | - Implement all necessary tables, types, functions, and triggers.
11 | - Configure Row Level Security (RLS) for data privacy.
12 | - Set up the basic Next.js project structure for API routes.
13 | - Ensure the foundation is solid for future development phases.
14 | 
15 | ## 3. Technical Stack
16 | - **Frontend**: Next.js
17 | - **Backend & Authentication**: Supabase
18 | - **UI Components**: shadcn/ui. Custom Tailwind CSS will only be used when a specific component or style is not available in the library.
19 | 
20 | ## 4. Implementation Plan (Phase 1)
21 | As per the main PRD, the focus for this phase is:
22 | 
23 | **Backend Setup:**
24 | - Set up Supabase project
25 | - Implement complete database schema with migrations
26 | - Configure RLS policies
27 | - Create database functions and triggers
28 | - Test credit card balance logic
29 | - Set up API routes structure in Next.js
30 | 
31 | **Initial Configuration:**
32 | - Configure Supabase client in existing Next.js project
33 | - Set up environment variables
34 | - Create type definitions from database schema
35 | - Set up basic error handling utilities
36 | 
37 | ## 5. Database Schema
38 | The entire database will be implemented in this phase.
39 | 
40 | ### 5.1. Overview
41 | The database will be implemented using Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables to ensure data isolation between users.
42 | 
43 | ### 5.2. Tables and Relationships
44 | 
45 | #### Users Table (managed by Supabase Auth)
46 | ```sql
47 | -- Supabase auth.users table is automatically created
48 | -- We'll reference this via foreign keys
49 | ```
50 | 
51 | #### User Settings Table
52 | ```sql
53 | CREATE TABLE user_settings (
54 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
55 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
56 |     currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
57 |     financial_month_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_month_start_day >= 1 AND financial_month_start_day <= 31),
58 |     financial_week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_week_start_day >= 0 AND financial_week_start_day <= 6), -- 0 = Sunday, 6 = Saturday
59 |     onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
60 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
61 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
62 |     UNIQUE(user_id)
63 | );
64 | ```
65 | 
66 | #### Account Types Enum
67 | ```sql
68 | CREATE TYPE account_type AS ENUM ('bank_account', 'credit_card', 'investment_account');
69 | ```
70 | 
71 | #### Accounts Table
72 | ```sql
73 | CREATE TABLE accounts (
74 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
75 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
76 |     name VARCHAR(255) NOT NULL,
77 |     type account_type NOT NULL,
78 |     initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
79 |     current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
80 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
81 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
82 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
83 |     INDEX idx_accounts_user_id (user_id),
84 |     INDEX idx_accounts_type (type)
85 | );
86 | ```
87 | 
88 | #### Category Types Enum
89 | ```sql
90 | CREATE TYPE category_type AS ENUM ('expense', 'income', 'investment');
91 | ```
92 | 
93 | #### Budget Frequency Enum
94 | ```sql
95 | CREATE TYPE budget_frequency AS ENUM ('weekly', 'monthly', 'one_time');
96 | ```
97 | 
98 | #### Categories Table
99 | ```sql
100 | CREATE TABLE categories (
101 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
102 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
103 |     name VARCHAR(255) NOT NULL,
104 |     type category_type NOT NULL,
105 |     icon VARCHAR(10), -- Emoji icon for UI representation
106 |     budget_amount DECIMAL(15, 2),
107 |     budget_frequency budget_frequency,
108 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
109 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
110 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
111 |     INDEX idx_categories_user_id (user_id),
112 |     INDEX idx_categories_type (type),
113 |     CONSTRAINT chk_budget_consistency CHECK (
114 |         (budget_amount IS NULL AND budget_frequency IS NULL) OR
115 |         (budget_amount IS NOT NULL AND budget_frequency IS NOT NULL)
116 |     )
117 | );
118 | ```
119 | 
120 | #### Transaction Types Enum
121 | ```sql
122 | CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
123 | ```
124 | 
125 | #### Transactions Table
126 | ```sql
127 | CREATE TABLE transactions (
128 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
129 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
130 |     type transaction_type NOT NULL,
131 |     amount DECIMAL(15, 2) NOT NULL, -- Can be negative for refunds
132 |     description TEXT,
133 |     transaction_date DATE NOT NULL,
134 |     
135 |     -- For income and expense transactions
136 |     account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
137 |     category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
138 |     
139 |     -- For transfer transactions
140 |     from_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
141 |     to_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
142 |     
143 |     
144 |     
145 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
146 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
147 |     
148 |     INDEX idx_transactions_user_id (user_id),
149 |     INDEX idx_transactions_date (transaction_date),
150 |     INDEX idx_transactions_type (type),
151 |     INDEX idx_transactions_account (account_id),
152 |     INDEX idx_transactions_category (category_id),
153 |     
154 |     CONSTRAINT chk_transaction_consistency CHECK (
155 |         (type IN ('income', 'expense') AND account_id IS NOT NULL AND category_id IS NOT NULL AND from_account_id IS NULL AND to_account_id IS NULL) OR
156 |         (type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL AND account_id IS NULL AND category_id IS NULL)
157 |     )
158 | );
159 | ```
160 | 
161 | #### Ledger Table (Balance History)
162 | ```sql
163 | CREATE TABLE balance_ledger (
164 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
165 |     account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
166 |     transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
167 |     balance_before DECIMAL(15, 2) NOT NULL,
168 |     balance_after DECIMAL(15, 2) NOT NULL,
169 |     change_amount DECIMAL(15, 2) NOT NULL,
170 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
171 |     INDEX idx_ledger_account (account_id),
172 |     INDEX idx_ledger_transaction (transaction_id),
173 |     INDEX idx_ledger_created (created_at)
174 | );
175 | ```
176 | 
177 | ### 5.3. Row Level Security Policies
178 | 
179 | ```sql
180 | -- Enable RLS on all tables
181 | ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
182 | ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
183 | ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
184 | ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
185 | 
186 | -- User Settings Policies
187 | CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
188 | CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
189 | CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
190 | 
191 | -- Accounts Policies
192 | CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
193 | CREATE POLICY "Users can create own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
194 | CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
195 | CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);
196 | 
197 | -- Categories Policies
198 | CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
199 | CREATE POLICY "Users can create own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
200 | CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
201 | CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
202 | 
203 | -- Transactions Policies
204 | CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
205 | CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
206 | CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
207 | CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);
208 | ```
209 | 
210 | ### 5.4. Database Functions and Triggers
211 | 
212 | ```sql
213 | -- Function to update account balance and record ledger entry
214 | CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
215 | RETURNS TRIGGER AS $
216 | DECLARE
217 |     v_balance_before DECIMAL(15, 2);
218 |     v_balance_after DECIMAL(15, 2);
219 |     v_amount DECIMAL(15, 2);
220 | BEGIN
221 |     -- Use absolute value for amount calculations
222 |     v_amount := ABS(NEW.amount);
223 |     
224 |     IF TG_OP = 'INSERT' THEN
225 |         IF NEW.type = 'income' THEN
226 |             -- For income: positive amount increases balance, negative amount (refund) decreases balance
227 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
228 |             v_balance_after := v_balance_before + NEW.amount;
229 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
230 |             
231 |             -- Record in ledger
232 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
233 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
234 |             
235 |         ELSIF NEW.type = 'expense' THEN
236 |             -- For expense: positive amount decreases balance (normal expense), negative amount increases balance (refund)
237 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
238 |             
239 |             -- Credit cards: expenses increase balance (debt), refunds decrease balance
240 |             IF (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN
241 |                 v_balance_after := v_balance_before + NEW.amount;
242 |             ELSE
243 |                 -- Other accounts: expenses decrease balance, refunds increase balance
244 |                 v_balance_after := v_balance_before - NEW.amount;
245 |             END IF;
246 |             
247 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
248 |             
249 |             -- Record in ledger
250 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
251 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
252 |             
253 |         ELSIF NEW.type = 'transfer' THEN
254 |             -- Transfers always use positive amounts
255 |             -- From account
256 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
257 |             
258 |             -- Credit card as source: transfer decreases balance (paying off debt)
259 |             IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
260 |                 v_balance_after := v_balance_before - v_amount;
261 |             ELSE
262 |                 -- Other accounts: transfer decreases balance
263 |                 v_balance_after := v_balance_before - v_amount;
264 |             END IF;
265 |             
266 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
267 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
268 |             VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, -v_amount);
269 |             
270 |             -- To account
271 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
272 |             
273 |             -- Credit card as destination: transfer decreases balance (paying off debt)
274 |             IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
275 |                 v_balance_after := v_balance_before - v_amount;
276 |             ELSE
277 |                 -- Other accounts: transfer increases balance
278 |                 v_balance_after := v_balance_before + v_amount;
279 |             END IF;
280 |             
281 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
282 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
283 |             VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, v_amount);
284 |         END IF;
285 |         
286 |     ELSIF TG_OP = 'UPDATE' THEN
287 |         -- For updates, it's safer to recalculate from ledger history
288 |         -- This is a complex operation and might be better handled at application level
289 |         RAISE EXCEPTION 'Transaction updates should be handled at application level for better control';
290 |         
291 |     ELSIF TG_OP = 'DELETE' THEN
292 |         -- For deletes, reverse the transaction based on ledger history
293 |         -- This ensures consistency with the historical record
294 |         RAISE EXCEPTION 'Transaction deletion should be handled at application level for better control';
295 |     END IF;
296 |     
297 |     RETURN NEW;
298 | END;
299 | $ LANGUAGE plpgsql;
300 | 
301 | CREATE TRIGGER trigger_update_account_balance
302 | AFTER INSERT ON transactions
303 | FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();
304 | 
305 | -- Note: For UPDATE and DELETE operations on transactions, it's recommended to handle these
306 | -- at the application level for better control and audit trail. The application should:
307 | -- 1. For updates: Create a reversal transaction and a new transaction
308 | -- 2. For deletes: Create a reversal transaction or implement soft deletes
309 | 
310 | -- Function to update timestamps
311 | CREATE OR REPLACE FUNCTION update_updated_at_column()
312 | RETURNS TRIGGER AS $
313 | BEGIN
314 |     NEW.updated_at = NOW();
315 |     RETURN NEW;
316 | END;
317 | $ LANGUAGE plpgsql;
318 | 
319 | -- Apply timestamp triggers to all tables
320 | CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
321 | CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
322 | CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
323 | CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
324 | 
325 | -- Dashboard Functions (To be used in later phases, but defined here)
326 | 
327 | ```sql
328 | CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID)
329 | RETURNS TABLE (
330 |     total_income DECIMAL(15, 2),
331 |     total_expenses DECIMAL(15, 2),
332 |     net_savings DECIMAL(15, 2),
333 |     period_start DATE,
334 |     period_end DATE
335 | ) AS $$
336 | DECLARE
337 |     v_month_start_day INTEGER;
338 |     v_current_date DATE := CURRENT_DATE;
339 |     v_period_start DATE;
340 |     v_period_end DATE;
341 |     v_total_income DECIMAL(15, 2);
342 |     v_total_expenses DECIMAL(15, 2);
343 | BEGIN
344 |     -- Get user's financial month start day
345 |     SELECT financial_month_start_day
346 |     INTO v_month_start_day
347 |     FROM user_settings
348 |     WHERE user_id = p_user_id;
349 | 
350 |     -- If no settings, use default (day 1)
351 |     IF NOT FOUND THEN
352 |         v_month_start_day := 1;
353 |     END IF;
354 | 
355 |     -- Calculate custom month period
356 |     IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
357 |         v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
358 |         v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
359 |     ELSE
360 |         v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
361 |         v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
362 |     END IF;
363 | 
364 |     -- Calculate total income for the period
365 |     SELECT COALESCE(SUM(t.amount), 0)
366 |     INTO v_total_income
367 |     FROM transactions t
368 |     WHERE t.user_id = p_user_id
369 |         AND t.type = 'income'
370 |         AND t.transaction_date >= v_period_start
371 |         AND t.transaction_date <= v_period_end;
372 | 
373 |     -- Calculate total expenses for the period
374 |     SELECT COALESCE(SUM(t.amount), 0)
375 |     INTO v_total_expenses
376 |     FROM transactions t
377 |     WHERE t.user_id = p_user_id
378 |         AND t.type = 'expense'
379 |         AND t.transaction_date >= v_period_start
380 |         AND t.transaction_date <= v_period_end;
381 | 
382 |     -- Set output variables
383 |     total_income := v_total_income;
384 |     total_expenses := v_total_expenses;
385 |     net_savings := v_total_income - v_total_expenses;
386 |     period_start := v_period_start;
387 |     period_end := v_period_end;
388 | 
389 |     RETURN NEXT;
390 | END;
391 | $$ LANGUAGE plpgsql;
392 | ```
393 | 
394 | ```sql
395 | -- Function to calculate budget progress for expense categories
396 | CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
397 | RETURNS TABLE (
398 |     category_id UUID,
399 |     category_name VARCHAR(255),
400 |     category_type category_type,
401 |     category_icon VARCHAR(10),
402 |     budget_amount DECIMAL(15, 2),
403 |     budget_frequency budget_frequency,
404 |     spent_amount DECIMAL(15, 2),
405 |     remaining_amount DECIMAL(15, 2),
406 |     progress_percentage DECIMAL(5, 2),
407 |     period_start DATE,
408 |     period_end DATE
409 | ) AS $
410 | DECLARE
411 |     v_month_start_day INTEGER;
412 |     v_week_start_day INTEGER;
413 |     v_current_date DATE := CURRENT_DATE;
414 |     v_period_start DATE;
415 |     v_period_end DATE;
416 | BEGIN
417 |     -- Get user's financial period settings
418 |     SELECT financial_month_start_day, financial_week_start_day
419 |     INTO v_month_start_day, v_week_start_day
420 |     FROM user_settings
421 |     WHERE user_id = p_user_id;
422 | 
423 |     -- For each expense category with budget
424 |     FOR category_id, category_name, category_type, category_icon, budget_amount, budget_frequency IN
425 |         SELECT c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency
426 |         FROM categories c
427 |         WHERE c.user_id = p_user_id AND c.type = 'expense' AND c.budget_amount IS NOT NULL AND c.is_active = TRUE
428 |     LOOP
429 |         -- Calculate period based on frequency and user settings
430 |         IF budget_frequency = 'monthly' THEN
431 |             -- Calculate custom month period
432 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
433 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
434 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
435 |             ELSE
436 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
437 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
438 |             END IF;
439 |         ELSIF budget_frequency = 'weekly' THEN
440 |             -- Calculate custom week period
441 |             v_period_start := v_current_date - ((EXTRACT(DOW FROM v_current_date)::INTEGER - v_week_start_day + 7) % 7) * INTERVAL '1 day';
442 |             v_period_end := v_period_start + INTERVAL '6 days';
443 |         ELSIF budget_frequency = 'one_time' THEN
444 |             -- For one-time budgets, consider all transactions
445 |             v_period_start := '1900-01-01'::DATE;
446 |             v_period_end := '2100-12-31'::DATE;
447 |         END IF;
448 | 
449 |         -- Calculate spent amount for the period
450 |         SELECT COALESCE(SUM(t.amount), 0)
451 |         INTO spent_amount
452 |         FROM transactions t
453 |         WHERE t.category_id = category_id
454 |             AND t.transaction_date >= v_period_start
455 |             AND t.transaction_date <= v_period_end
456 |             AND t.type = 'expense';
457 | 
458 |         -- Calculate remaining and percentage
459 |         remaining_amount := budget_amount - spent_amount;
460 |         progress_percentage := CASE 
461 |             WHEN budget_amount > 0 THEN (spent_amount / budget_amount * 100)
462 |             ELSE 0
463 |         END;
464 | 
465 |         -- Return the row
466 |         RETURN NEXT;
467 |     END LOOP;
468 | END;
469 | $ LANGUAGE plpgsql;
470 | ```
471 | 
472 | ```sql
473 | CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
474 | RETURNS TABLE (
475 |     category_id UUID,
476 |     category_name VARCHAR(255),
477 |     category_icon VARCHAR(10),
478 |     target_amount DECIMAL(15, 2),
479 |     target_frequency budget_frequency,
480 |     invested_amount DECIMAL(15, 2),
481 |     remaining_amount DECIMAL(15, 2),
482 |     progress_percentage DECIMAL(5, 2),
483 |     period_start DATE,
484 |     period_end DATE
485 | ) AS $$
486 | DECLARE
487 |     v_month_start_day INTEGER;
488 |     v_current_date DATE := CURRENT_DATE;
489 |     v_period_start DATE;
490 |     v_period_end DATE;
491 |     inv_category RECORD;
492 | BEGIN
493 |     -- Get user's financial period settings
494 |     SELECT financial_month_start_day
495 |     INTO v_month_start_day
496 |     FROM user_settings
497 |     WHERE user_id = p_user_id;
498 | 
499 |     -- If no settings, use default (day 1)
500 |     IF NOT FOUND THEN
501 |         v_month_start_day := 1;
502 |     END IF;
503 | 
504 |     -- For each investment category with a target
505 |     FOR inv_category IN
506 |         SELECT c.id, c.name, c.icon, c.budget_amount, c.budget_frequency
507 |         FROM categories c
508 |         WHERE c.user_id = p_user_id
509 |           AND c.type = 'investment'
510 |           AND c.budget_amount IS NOT NULL
511 |           AND c.is_active = TRUE
512 |     LOOP
513 |         -- Calculate period based on frequency and user settings
514 |         IF inv_category.budget_frequency = 'monthly' THEN
515 |             -- Calculate custom month period
516 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
517 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
518 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
519 |             ELSE
520 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
521 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
522 |             END IF;
523 |         ELSIF inv_category.budget_frequency = 'one_time' THEN
524 |             -- For one-time targets, consider all transactions
525 |             v_period_start := '1900-01-01'::DATE;
526 |             v_period_end := '2100-12-31'::DATE;
527 |         ELSE
528 |             -- Skip other frequencies for investments
529 |             CONTINUE;
530 |         END IF;
531 | 
532 |         -- Set output variables from the loop
533 |         category_id := inv_category.id;
534 |         category_name := inv_category.name;
535 |         category_icon := inv_category.icon;
536 |         target_amount := inv_category.budget_amount;
537 |         target_frequency := inv_category.budget_frequency;
538 |         period_start := v_period_start;
539 |         period_end := v_period_end;
540 | 
541 |         -- Calculate invested amount for the period
542 |         SELECT COALESCE(SUM(t.amount), 0)
543 |         INTO invested_amount
544 |         FROM transactions t
545 |         WHERE t.user_id = p_user_id
546 |             AND t.type = 'transfer'
547 |             AND t.investment_category_id = inv_category.id
548 |             AND t.transaction_date >= v_period_start
549 |             AND t.transaction_date <= v_period_end;
550 | 
551 |         -- Calculate remaining and percentage
552 |         remaining_amount := target_amount - invested_amount;
553 |         progress_percentage := CASE
554 |             WHEN target_amount > 0 THEN (invested_amount / target_amount * 100)
555 |             ELSE 0
556 |         END;
557 | 
558 |         -- Return the row
559 |         RETURN NEXT;
560 |     END LOOP;
561 | END;
562 | $$ LANGUAGE plpgsql;
563 | ```
564 | 
565 | ## 6. API Endpoints Specification
566 | This phase will involve setting up the structure for the API routes in Next.js, but not necessarily implementing the logic for all of them. The focus is on creating the file structure.
567 | 
568 | - `/api/settings`
569 | - `/api/accounts`
570 | - `/api/categories`
571 | - `/api/transactions`
572 | - `/api/dashboard`
573 | 
574 | ## 7. Technical Considerations
575 | - **Data Integrity**: The trigger `update_account_balance_with_ledger` is critical and must be tested thoroughly, especially the logic for credit cards vs. other account types.
576 | - **Scalability**: The database schema is designed with indexes on foreign keys and frequently queried columns (`user_id`, `type`, `transaction_date`) to ensure performance as data grows.
577 | - **Security**: All tables must have RLS enabled and policies must be correctly configured to prevent data leaks between users. This is a day-one requirement. 
```

.taskmaster/docs/prd-phase-2-authentication-onboarding.md
```
1 | # Noka PRD - Phase 2: Authentication & Onboarding
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for Phase 2 of Noka. The focus of this phase is to build a secure authentication system using Supabase Auth and a seamless onboarding experience for new users.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to provide a secure and welcoming entry point into the Noka ecosystem.
8 | **Key Goals for this Phase:**
9 | - Implement a full authentication flow (Sign Up, Sign In, Password Reset).
10 | - Create protected routes to secure the core application.
11 | - Build a multi-step onboarding wizard to guide new users through initial setup.
12 | - Ensure user settings from onboarding are correctly saved to the database.
13 | 
14 | ## 3. Implementation Plan (Phase 2)
15 | As per the main PRD, the focus for this phase is:
16 | 
17 | **Authentication Flow:**
18 | - Implement Supabase Auth integration
19 | - Create protected routes middleware
20 | - Build sign up/sign in/reset password pages
21 | - Add loading and error states
22 | 
23 | **Onboarding Wizard:**
24 | - Create multi-step onboarding component
25 | - Implement currency and financial period setup
26 | - Build initial account creation flow
27 | - Add initial category setup with emoji picker
28 | - Create onboarding completion handler
29 | 
30 | ## 4. User Flow and Application Interface
31 | 
32 | ### 4.1. Unauthenticated User Flow
33 | This covers the experience for users who have not yet logged in or signed up.
34 | 
35 | #### 4.1.1. Landing Page
36 | When a user first lands on the Noka website, they are presented with a public-facing landing page containing:
37 | - **Navbar**: Contains logo, links to "Features," "Pricing" (if applicable), and prominent "Sign In" and "Sign Up" buttons.
38 | - **Hero Section**: A compelling headline, a brief description of Noka's value proposition, and an engaging visual.
39 | - **Call to Action (CTA)**: A primary button encouraging users to "Get Started" or "Sign Up for Free," which directs them to the registration page.
40 | - **Footer**: Privacy Policy menu, Term and Conditions menu, copyright wordings.
41 | 
42 | #### 4.1.2. Authentication (Powered by Supabase Auth)
43 | User authentication is the gateway to the application.
44 | - **Sign Up**: The user provides an email and a secure password. Upon successful registration, they are immediately redirected to the Onboarding Wizard.
45 | - **Sign In**: Registered users can log in using their email and password. Upon successful login, they are redirected to the Application Dashboard (Home screen).
46 | - **Password Reset**: If a user forgets their password, they can click a "Forgot Password?" link. Supabase Auth will handle sending a secure password reset link to their email.
47 | 
48 | ### 4.2. First-Time User Onboarding Wizard
49 | After signing up, new users are guided through a mandatory, one-time setup wizard to configure their Noka account. This ensures they can start using the app meaningfully.
50 | 
51 | - **Step 1: Welcome & Currency Setup**: A brief welcome message and a selector for their primary display currency (e.g., IDR, USD. Default IDR).
52 | - **Step 2: Financial Period Configuration**: Fields to define their financial "month" start day and "week" start day.
53 |   - Set their financial month to start on any day (e.g., from the 25th to the 24th, to match their salary cycle).
54 |   - Set their financial week to start on their preferred day (e.g., Sunday instead of Monday).
55 | - **Step 3: Create Initial Account**: A form to add their first financial account, including "Account Name," "Account Type," and "Initial Balance."
56 | - **Step 4: Create Initial Categories & Targets**: A form to create at least one expense category or one investment category, with optional fields to set an initial budget or target.
57 |   - **Expense Budgets**: For any expense category (like "Food" or "Shopping"), users can set a weekly or monthly spending budget. The app will display a tracker showing their progress against the budget.
58 |   - **Investment Targets**: For investment categories, users can set a contribution target. This can be a recurring monthly target or a one-time goal for a specific fund.
59 | - **Completion**: After the final step, the user is redirected to the Application Dashboard.
60 | 
61 | ## 5. Relevant Database Schema
62 | The following tables are central to this phase.
63 | 
64 | #### User Settings Table
65 | ```sql
66 | CREATE TABLE user_settings (
67 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
68 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
69 |     currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
70 |     financial_month_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_month_start_day >= 1 AND financial_month_start_day <= 31),
71 |     financial_week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_week_start_day >= 0 AND financial_week_start_day <= 6), -- 0 = Sunday, 6 = Saturday
72 |     onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
73 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
74 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
75 |     UNIQUE(user_id)
76 | );
77 | ```
78 | *Note: The `onboarding_completed` flag will be set to `true` at the end of the wizard.*
79 | 
80 | #### Accounts and Categories Tables
81 | The onboarding wizard will perform the first `INSERT` operations into the `accounts` and `categories` tables for the new user.
82 | 
83 | ## 6. API Endpoints Specification
84 | This phase will implement the following endpoints.
85 | 
86 | ### 6.1. Authentication Endpoints (Handled by Supabase)
87 | - POST `/auth/signup` - User registration
88 | - POST `/auth/signin` - User login
89 | - POST `/auth/signout` - User logout
90 | - POST `/auth/reset-password` - Password reset request
91 | - POST `/auth/update-password` - Update password
92 | 
93 | ### 6.2. User Settings Endpoints
94 | - POST `/api/settings` - Create initial user settings (called during onboarding). This endpoint will be responsible for creating the `user_settings` row.
95 | 
96 | ### 6.3. Accounts & Categories Endpoints
97 | - POST `/api/accounts` - Create new account (called during onboarding).
98 | - POST `/api/categories` - Create new category (called during onboarding).
99 | 
100 | ## 7. Technical Considerations
101 | - **Security**: 
102 |     - All API endpoints must validate user authentication using the Supabase session.
103 |     - Implement CSRF protection, especially for forms.
104 |     - Sanitize all user inputs from the onboarding forms.
105 | - **State Management**: A client-side state management solution (e.g., Zustand or React Context) will be needed to manage state across the multi-step onboarding wizard.
106 | - **Error Handling**: Implement robust error handling for API calls (e.g., email already taken, invalid password) and display user-friendly error messages on the UI. 
```

.taskmaster/docs/prd-phase-3-core-crud.md
```
1 | # Noka PRD - Phase 3: Core CRUD Operations
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for Phase 3 of Noka. This phase is dedicated to building the core data management features of the application, allowing users to perform full CRUD (Create, Read, Update, Delete) operations on their Accounts and Categories after the initial onboarding.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to give users full control over their financial structure within Noka.
8 | **Key Goals for this Phase:**
9 | - Implement a user interface for listing and viewing all accounts and categories.
10 | - Build forms and backend logic for creating, updating, and deleting accounts.
11 | - Build forms and backend logic for creating, updating, and deleting categories, including their budgets/targets.
12 | - Implement the "safe delete" feature, which reassigns transactions before deleting a parent account or category.
13 | 
14 | ## 3. Implementation Plan (Phase 3)
15 | As per the main PRD, the focus for this phase is:
16 | 
17 | **Account Management:**
18 | - Create account service layer
19 | - Build account list view with type grouping
20 | - Implement account CRUD operations
21 | - Add balance display logic (handle credit card negative display)
22 | - Create account deletion with transaction reassignment
23 | 
24 | **Category Management:**
25 | - Create category service layer
26 | - Build category CRUD interface
27 | - Implement emoji icon picker
28 | - Add budget/target configuration
29 | - Create category deletion with reassignment flow
30 | 
31 | ## 4. User Flow and Application Interface
32 | 
33 | ### 4.1. "Settings" Screen
34 | This screen is the control center for the user's data and preferences, organized into three tabs. This phase will implement the "Categories" and "Accounts" tabs.
35 | 
36 | - **Tab 2: Categories**: Provides full CRUD (Create, Read, Update, Delete) functionality for all categories. Users can add new categories and edit names/budgets/targets. When deleting a category, if it has existing transactions, the user must be prompted to move those transactions to another existing category before the deletion is finalized. This prevents data from being orphaned.
37 | - **Tab 3: Accounts**: Provides full CRUD (Create, Read, Update, Delete) functionality for all financial accounts. Users can add new accounts and edit names. When deleting an account, if it has existing transactions, the user must be prompted to move those transactions to another existing account of the same type before the deletion is finalized. This prevents data from being orphaned.
38 | 
39 | ### 4.2. User Scenarios
40 | 
41 | **Adding a New Account After Onboarding:**
42 | - Months after signing up, a user opens a new "Jenius" bank account.
43 | - They navigate to the Settings > Accounts tab and click "Add New Account."
44 | - They provide the "Account Name" (Jenius), "Account Type" (Bank Account), and the "Initial Balance" (e.g., Rp 500,000).
45 | - The new account now appears on the Accounts screen and in their list of accounts for future transactions.
46 | 
47 | ## 5. Relevant Database Schema
48 | The `accounts` and `categories` tables are the primary focus. The logic for this phase will involve `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations on these tables.
49 | 
50 | #### Accounts Table
51 | ```sql
52 | CREATE TABLE accounts (
53 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
54 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
55 |     name VARCHAR(255) NOT NULL,
56 |     type account_type NOT NULL,
57 |     initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
58 |     current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
59 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
60 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
61 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
62 |     INDEX idx_accounts_user_id (user_id),
63 |     INDEX idx_accounts_type (type)
64 | );
65 | ```
66 | 
67 | #### Categories Table
68 | ```sql
69 | CREATE TABLE categories (
70 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
71 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
72 |     name VARCHAR(255) NOT NULL,
73 |     type category_type NOT NULL,
74 |     icon VARCHAR(10), -- Emoji icon for UI representation
75 |     budget_amount DECIMAL(15, 2),
76 |     budget_frequency budget_frequency,
77 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
78 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
79 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
80 |     INDEX idx_categories_user_id (user_id),
81 |     INDEX idx_categories_type (type),
82 |     CONSTRAINT chk_budget_consistency CHECK (
83 |         (budget_amount IS NULL AND budget_frequency IS NULL) OR
84 |         (budget_amount IS NOT NULL AND budget_frequency IS NOT NULL)
85 |     )
86 | );
87 | ```
88 | 
89 | ## 6. API Endpoints Specification
90 | This phase will implement the full CRUD functionality for the following endpoints.
91 | 
92 | ### 6.1. Accounts Endpoints
93 | - GET `/api/accounts` - List all user accounts.
94 | - GET `/api/accounts/:id` - Get specific account details.
95 | - POST `/api/accounts` - Create new account (re-used from onboarding).
96 | - PUT `/api/accounts/:id` - Update account details (name).
97 | - DELETE `/api/accounts/:id` - Delete account. The backend must handle the logic for reassigning transactions before deletion.
98 | 
99 | ### 6.2. Categories Endpoints
100 | - GET `/api/categories` - List all user categories.
101 | - GET `/api/categories/:id` - Get specific category details.
102 | - POST `/api/categories` - Create new category (re-used from onboarding).
103 | - PUT `/api/categories/:id` - Update category details (name, icon, budget).
104 | - DELETE `/api/categories/:id` - Delete category. The backend must handle the logic for reassigning transactions before deletion.
105 | 
106 | ## 7. Technical Considerations
107 | - **Data Integrity**: The transaction reassignment logic is critical. This should be handled within a database transaction to ensure that either both the reassignment and the deletion succeed, or they both fail, preventing orphaned records.
108 | - **User Experience**:
109 |     - Deletion should be a two-step process: the user clicks delete, a dialog appears asking them to select a replacement account/category, and then they confirm.
110 |     - Use optimistic updates for a smoother UI. For example, when a user edits a category name, update the UI immediately and revert only if the API call fails.
111 | - **Form Validation**: Use a library like `zod` with `react-hook-form` to validate all form inputs for creating and editing accounts and categories. 
```

.taskmaster/docs/prd-phase-4-transaction-system.md
```
1 | # Noka PRD - Phase 4: Transaction System
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for Phase 4 of Noka. This is a critical phase that involves building the entire transaction management system. This includes recording income, expenses, and transfers, and ensuring all account balances are updated correctly.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to provide a fast, intuitive, and accurate way for users to record their financial activities.
8 | **Key Goals for this Phase:**
9 | - Build a comprehensive transaction creation form that handles all transaction types (income, expense, transfer).
10 | - Implement the core business logic for how transactions affect account balances, paying special attention to credit card behavior.
11 | - Develop a clear and filterable view of transaction history.
12 | - Ensure the `balance_ledger` is correctly populated for a complete audit trail.
13 | 
14 | ## 3. Implementation Plan (Phase 4)
15 | As per the main PRD, the focus for this phase is:
16 | 
17 | **Transaction Core:**
18 | - Create transaction service layer
19 | - Build transaction form with type-specific logic
20 | - Implement credit card expense handling
21 | - Add refund transaction support (negative amounts)
22 | - Create transfer logic with credit card payment support
23 | 
24 | **Transaction List:**
25 | - Build transaction list with infinite scroll
26 | - Implement date range filtering
27 | - Add category and account filters
28 | - Create transaction detail view
29 | - Add edit/delete functionality (with proper balance recalculation)
30 | 
31 | ## 4. User Scenarios
32 | This phase will implement the following fundamental user actions.
33 | 
34 | ### 4.1. Fundamental Transactions
35 | 
36 | **Recording an Expense:**
37 | - A user buys groceries for Rp 250,000 using their BCA Bank Account.
38 | - They open the app, tap "Add Transaction," and select "Expense."
39 | - They enter "250000," select the "Groceries" category, and choose their "BCA Bank Account."
40 | - The app records the transaction and automatically deducts Rp 250,000 from the account's balance.
41 | 
42 | **Tracking an Income:**
43 | - A user receives their monthly salary of Rp 8,000,000 in their "BCA Payroll" account.
44 | - They open the app, select "Add Transaction," and choose "Income."
45 | - They enter "8000000," select the "Salary" category, and choose their "BCA Payroll" account.
46 | - The app records the income and correctly increases the balance of the payroll account by Rp 8,000,000.
47 | 
48 | **Making a Simple Transfer:**
49 | - A user needs to move Rp 500,000 from their "BCA Payroll" account to their "Mandiri Savings" account.
50 | - They select "Transfer," choose "BCA Payroll" as the source and "Mandiri Savings" as the destination, and enter "500000."
51 | - The app records the transfer, correctly decreasing the balance in the payroll account and increasing the balance in the savings account.
52 | 
53 | **Making an Investment Transfer:**
54 | - A user wants to contribute to their "Retirement Fund."
55 | - They select "Transfer," choose their "BCA Payroll" account as the source and their "Investment Account" as the destination, and enter "1000000."
56 | - Because the destination is an Investment Account, the app prompts them to select an Investment Category. They choose "Retirement Fund."
57 | - The app records the transfer, decreasing the payroll account balance and increasing the investment account balance. It also updates the progress for the "Retirement Fund" target on the Home screen.
58 | 
59 | ### 4.2. Credit Card Scenarios
60 | 
61 | **Recording an Expense with a Credit Card:**
62 | - A user pays for an online subscription of Rp 150,000 using their "Visa Credit Card."
63 | - They select "Expense," enter "150000," choose the "Entertainment" category, and select their "Visa Credit Card" as the account.
64 | - The app records the transaction and correctly increases the credit card's balance (the amount they owe) by Rp 150,000.
65 | 
66 | **Paying a Credit Card Bill:**
67 | - At the end of the month, the user wants to pay off their "Visa Credit Card" bill from their "BCA Bank Account."
68 | - They select "Transfer," choose "BCA Bank Account" as the source and "Visa Credit Card" as the destination, and enter the payment amount.
69 | - The app records the transfer, decreasing the bank account balance and decreasing the credit card balance (the amount they owe).
70 | 
71 | ## 5. Relevant Database Schema
72 | This phase heavily relies on the `transactions` and `balance_ledger` tables, and the trigger that connects them.
73 | 
74 | #### Transactions Table
75 | ```sql
76 | CREATE TABLE transactions (
77 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
78 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
79 |     type transaction_type NOT NULL,
80 |     amount DECIMAL(15, 2) NOT NULL, -- Can be negative for refunds
81 |     description TEXT,
82 |     transaction_date DATE NOT NULL,
83 |     account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
84 |     category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
85 |     from_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
86 |     to_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
87 |     investment_category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
88 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
89 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
90 |     -- ... indexes and constraints
91 | );
92 | ```
93 | 
94 | #### Ledger Table (Balance History)
95 | ```sql
96 | CREATE TABLE balance_ledger (
97 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
98 |     account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
99 |     transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
100 |     balance_before DECIMAL(15, 2) NOT NULL,
101 |     balance_after DECIMAL(15, 2) NOT NULL,
102 |     change_amount DECIMAL(15, 2) NOT NULL,
103 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
104 |     -- ... indexes
105 | );
106 | ```
107 | 
108 | #### Balance Update Function & Trigger
109 | The `update_account_balance_with_ledger()` function and its associated trigger are the heart of this phase's backend logic. They must be thoroughly tested.
110 | 
111 | ## 6. API Endpoints Specification
112 | The full implementation of the transaction endpoints is the core of this phase.
113 | 
114 | - GET `/api/transactions` - List transactions with filters.
115 |   - Query params: `startDate`, `endDate`, `accountId`, `categoryId`, `type`, `limit`, `offset`
116 | - GET `/api/transactions/:id` - Get specific transaction.
117 | - POST `/api/transactions` - Create new transaction (income, expense, or transfer).
118 | - PUT `/api/transactions/:id` - Update transaction.
119 | - DELETE `/api/transactions/:id` - Delete transaction.
120 | 
121 | ## 7. Technical Considerations
122 | - **Data Integrity and Balance Management**:
123 |     - The logic within the `update_account_balance_with_ledger` trigger is paramount. It must correctly handle positive/negative amounts for income/expense, and the inverse logic for credit card balances.
124 |     - **Refunds**: The system must support negative amounts for expense/income transactions to handle refunds correctly.
125 |     - **Transaction Updates/Deletes**: The main PRD suggests that updates and deletes should be handled at the application level (e.g., by creating reversal transactions) rather than direct database modifications to maintain a perfect audit trail. This strategy should be finalized and implemented in this phase.
126 | - **User Experience**:
127 |     - The transaction form must be dynamic. For example, selecting "Transfer" should show "From Account" and "To Account" fields, while "Expense" should show "Account" and "Category" fields.
128 |     - For the transaction list, implement "infinite scroll" or pagination to handle large datasets efficiently.
129 | - **Performance**:
130 |     - Ensure the `transactions` table is properly indexed, especially on `user_id`, `transaction_date`, `account_id`, and `category_id` to make filtering fast. 
```

.taskmaster/docs/prd-phase-5-dashboard-analytics.md
```
1 | # Noka PRD - Phase 5: Dashboard & Analytics
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for Phase 5 of Noka. This phase focuses on building the "Home" screen, which serves as the user's main dashboard. It will provide a clear, at-a-glance overview of their financial health, including summaries, budget progress, and investment tracking.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to empower users with actionable insights into their finances, presented in a simple and digestible format.
8 | **Key Goals for this Phase:**
9 | - Develop the main dashboard UI.
10 | - Integrate backend database functions to pull financial summaries and progress data.
11 | - Display expense budget progress with visual indicators.
12 | - Display investment goal progress for both recurring and one-time targets.
13 | - Implement data visualizations to make the information easy to understand.
14 | 
15 | ## 3. Implementation Plan (Phase 5)
16 | As per the main PRD, the focus for this phase is:
17 | 
18 | **Dashboard Development:**
19 | - Create dashboard layout with tabs
20 | - Build financial summary calculations
21 | - Implement budget progress with custom periods
22 | - Create investment tracking display
23 | - Add visual progress indicators
24 | 
25 | **Data Visualization:**
26 | - Implement spending pattern charts
27 | - Create budget vs actual comparisons
28 | - Build category breakdown visualizations
29 | - Add responsive chart components
30 | 
31 | ## 4. User Flow and Application Interface
32 | 
33 | ### 4.1. "Home" Screen (Application Dashboard)
34 | This is the user's main hub for a quick financial overview.
35 | - **Top-Level Summary**: Displays a high-level overview for the current financial month: Total Income, Total Expenses, and Net Savings.
36 | - **Tabbed View for Details**:
37 |   - **Expense Tab (Default)**: Shows a list of all expense categories, segregated by "Weekly" and "Monthly" frequencies. Each category displays its name, budgeted amount, actual spending, and a visual progress indicator.
38 |   - **Investment Tab**: Shows a list of all investment categories, segregated by "Monthly" and "One-Time" frequencies. Each category displays its name, target amount, actual funds invested, and a visual progress indicator.
39 | 
40 | ### 4.2. User Scenarios
41 | 
42 | **Setting and Tracking an Expense Budget:**
43 | - A user wants to control their grocery spending. They navigate to Settings > Categories, select their "Groceries" category, and set a "Monthly" budget of Rp 2,000,000.
44 | - Later, they record a grocery expense of Rp 300,000.
45 | - On the Home screen, they can now see a progress bar for the "Groceries" budget, showing "Rp 300,000 / Rp 2,000,000 used."
46 | 
47 | **Setting and Tracking a Monthly Investment Target:**
48 | - A user is saving for retirement. They navigate to Settings > Categories, select their "Retirement Fund" category, and set a "Monthly" investment target of Rp 1,500,000.
49 | - During the month, they transfer Rp 1,500,000 to their Investment Account, assigning it to the "Retirement Fund" category.
50 | - The Home screen shows their "Retirement Fund" target is 100% complete for the current month and will reset for the next month.
51 | 
52 | **Setting and Tracking a One-Time Investment Target:**
53 | - A user is saving for a house down payment. They go to Settings > Categories, create a new Investment Category called "House Down Payment," and set a "One-Time" target of Rp 50,000,000.
54 | - They make an initial transfer of Rp 5,000,000 to their Investment Account under this new category.
55 | - The Home screen dashboard shows a progress bar for this goal: "Rp 5,000,000 / Rp 50,000,000 (10%)". This goal does not reset monthly.
56 | 
57 | ## 5. Relevant Database Schema
58 | This phase relies entirely on the custom PostgreSQL functions created in Phase 1 to aggregate and calculate dashboard data efficiently.
59 | 
60 | ```sql
61 | -- Gets the high-level income, expenses, and savings for the user's current financial period.
62 | CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID)
63 | RETURNS TABLE (...) AS $$ ... $$ LANGUAGE plpgsql;
64 | 
65 | -- Calculates the spending progress for all categories that have a budget.
66 | CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
67 | RETURNS TABLE (...) AS $$ ... $$ LANGUAGE plpgsql;
68 | 
69 | -- Calculates the contribution progress for all investment categories that have a target.
70 | CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
71 | RETURNS TABLE (...) AS $$ ... $$ LANGUAGE plpgsql;
72 | ```
73 | 
74 | ## 6. API Endpoints Specification
75 | This phase implements the dashboard-specific endpoints that call the database functions.
76 | 
77 | - GET `/api/dashboard/summary` - Get financial summary for current period (uses `get_financial_summary` function).
78 | - GET `/api/dashboard/budget-progress` - Get budget progress for all expense categories (uses `get_budget_progress` function).
79 | - GET `/api/dashboard/investment-progress` - Get investment progress (uses `get_investment_progress` function).
80 | 
81 | ## 7. Technical Considerations
82 | - **Performance**: Calling database functions is more efficient than performing complex aggregations on the application server. The API layer should simply call these functions and return the results.
83 | - **Data Caching**: The dashboard data is a great candidate for caching (e.g., using React Query or SWR). The data doesn't need to be real-time to the second, so caching it for a few minutes can reduce database load and improve UI responsiveness.
84 | - **Data Visualization**:
85 |     - Use a library like `recharts` or `visx` which works well with Next.js and server components.
86 |     - Ensure charts are responsive and accessible, with proper labels and color contrast.
87 | - **Empty States**: Design clear "empty states" for the dashboard. For example, what to show a new user who hasn't recorded any transactions or set any budgets yet. These states should guide the user on what to do next. 
```

.taskmaster/docs/prd-phase-6-polish-optimization.md
```
1 | # Noka PRD - Phase 6: Polish & Optimization
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for Phase 6 of Noka. With the core features now in place, this phase is dedicated to refining the user experience (UX), improving application performance, and ensuring the UI is robust and professional. This is about transforming a functional app into a delightful one.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to create an application that is not only powerful but also fast, reliable, and a pleasure to use.
8 | **Key Goals for this Phase:**
9 | - Enhance the user experience with comprehensive loading states, smooth transitions, and helpful empty states.
10 | - Optimize front-end performance by implementing caching, prefetching, and code splitting.
11 | - Ensure the application is fully responsive and accessible across all target devices.
12 | - Implement robust error handling across the application.
13 | 
14 | ## 3. Implementation Plan (Phase 6)
15 | As per the main PRD, the focus for this phase is:
16 | 
17 | **User Experience:**
18 | - Implement comprehensive loading states (e.g., skeletons).
19 | - Add error boundaries and fallbacks for components.
20 | - Create empty states with actionable prompts (e.g., "You have no accounts. Add one now!").
21 | - Add micro-animations and transitions for a smoother feel.
22 | - Ensure full mobile responsiveness on all screens.
23 | 
24 | **Performance:**
25 | - Implement React Query (or similar, like SWR) for data caching and synchronization.
26 | - Add optimistic updates for CRUD actions to improve perceived performance.
27 | - Create data prefetching strategies (e.g., prefetch data on hover).
28 | - Optimize bundle size with dynamic imports for heavy components or libraries.
29 | - Implement virtual scrolling for long lists like the transaction history.
30 | 
31 | ## 4. Key Areas of Focus
32 | 
33 | ### 4.1. Loading States
34 | - **What**: Skeletons or spinners should appear whenever data is being fetched.
35 | - **Where**: All lists (transactions, accounts, categories), dashboard numbers, and any component that relies on asynchronous data.
36 | 
37 | ### 4.2. Error Handling
38 | - **What**: Graceful error handling for both API errors and client-side exceptions.
39 | - **Where**:
40 |     - Wrap components in Error Boundaries to prevent a component crash from taking down the whole page.
41 |     - Show user-friendly messages (e.g., using `sonner` or toasts) when an API call fails (e.g., "Failed to update category. Please try again.").
42 | 
43 | ### 4.3. Empty States
44 | - **What**: Instead of showing a blank screen, display a helpful message and a call-to-action.
45 | - **Where**:
46 |     - **Transactions screen**: "No transactions found for this period. Add your first one!"
47 |     - **Accounts screen**: "No accounts yet. Let's add one."
48 |     - **Dashboard**: "Start recording transactions to see your financial summary."
49 | 
50 | ### 4.4. Performance Optimization
51 | - **Caching**: Use a library like React Query to cache server state. This avoids re-fetching data unnecessarily, making navigation feel instant.
52 | - **Optimistic Updates**: For actions like creating, updating, or deleting an item, update the UI *before* the API call completes. If the call fails, roll back the change and show an error. This makes the app feel extremely responsive.
53 | - **Code Splitting**: Heavy components or libraries (e.g., charting libraries, date pickers) should be loaded dynamically using `next/dynamic` so they don't impact the initial page load time.
54 | - **Virtualization**: The transaction list could potentially grow very large. A virtualized list (using a library like `tanstack-virtual`) will only render the items currently in the viewport, ensuring high performance even with thousands of transactions.
55 | 
56 | ### 4.5. Accessibility
57 | - **What**: Ensure the application is usable by people with disabilities.
58 | - **Where**:
59 |     - All interactive elements must be keyboard-navigable.
60 |     - Images and icons should have `alt` text or `aria-label`s.
61 |     - Use semantic HTML.
62 |     - Ensure sufficient color contrast.
63 |     - Test with screen readers.
64 | 
65 | ## 5. Technical Considerations
66 | - **Library Choices**:
67 |     - **Data Fetching/Caching**: React Query is the recommended choice due to its powerful features like caching, optimistic updates, and automatic refetching.
68 |     - **Animations**: `framer-motion` can be used for subtle, performant micro-animations.
69 |     - **Virtualization**: `@tanstack/react-virtual` is a good, headless option.
70 | - **Testing**:
71 |     - Performance can be benchmarked using Lighthouse scores. Set a baseline score and aim to improve it.
72 |     - Manually test for UX polish: click through the app quickly, simulate slow network conditions, and ensure the loading/error/empty states behave as expected.
73 |     - Use accessibility testing tools like Axe to audit the application. 
```

.taskmaster/docs/prd-phase-7-testing-deployment.md
```
1 | # Noka PRD - Phase 7: Testing & Deployment
2 | 
3 | ## 1. Introduction
4 | This document outlines the requirements for Phase 7 of Noka, the final phase before launch. This phase is focused on ensuring the application is stable, bug-free, and ready for production. It covers comprehensive testing, setting up the deployment pipeline, and configuring production infrastructure.
5 | 
6 | ## 2. Vision & Goals
7 | Our vision is to launch a high-quality, reliable, and secure application to our users.
8 | **Key Goals for this Phase:**
9 | - Achieve a high level of confidence in the application's stability through rigorous testing.
10 | - Establish a seamless and automated deployment process to Vercel.
11 | - Configure the production environment with all necessary settings and monitoring.
12 | - Prepare the application for its first set of users.
13 | 
14 | ## 3. Implementation Plan (Phase 7)
15 | As per the main PRD, the focus for this phase is:
16 | 
17 | **Testing:**
18 | - Write unit tests for critical functions (e.g., business logic, utility functions).
19 | - Create integration tests for API endpoints to ensure they behave as expected.
20 | - Test critical user scenarios, especially involving credit card balances and refunds.
21 | - Perform cross-browser testing.
22 | - Conduct a full accessibility audit.
23 | 
24 | **Deployment (Vercel):**
25 | - Set up Vercel project and link to the Git repository.
26 | - Configure production and preview environment variables.
27 | - Set up preview deployments for pull requests.
28 | - Configure the custom domain.
29 | - Implement monitoring with Vercel Analytics.
30 | - Set up error tracking with a service like Sentry.
31 | 
32 | ## 4. Testing Strategy
33 | 
34 | ### 4.1. Unit Tests
35 | - **Tool**: Jest / Vitest
36 | - **Scope**: Focus on pure functions, complex logic, and utilities.
37 |     - Examples: Date manipulation utilities, functions that calculate financial metrics, form validation logic.
38 | 
39 | ### 4.2. Integration Tests
40 | - **Tool**: Jest / Vitest with Supertest, or Playwright for API testing.
41 | - **Scope**: Test the API endpoints to verify they interact with the database correctly and enforce business rules.
42 |     - Examples:
43 |         - Calling `POST /api/transactions` with a credit card expense correctly increases the card's balance.
44 |         - Calling `DELETE /api/accounts/:id` successfully reassigns transactions before deleting the account.
45 |         - Ensure RLS policies are working by making requests on behalf of different users.
46 | 
47 | ### 4.3. End-to-End (E2E) Tests
48 | - **Tool**: Playwright / Cypress
49 | - **Scope**: Simulate full user journeys through the application UI.
50 |     - Examples:
51 |         - A full sign-up, onboarding, and transaction creation flow.
52 |         - A user edits a budget and sees the change reflected on the dashboard.
53 |         - A user tries to delete an account and successfully completes the reassignment dialog.
54 | 
55 | ### 4.4. Manual & Exploratory Testing
56 | - **Scope**: Test for issues that are difficult to automate.
57 |     - **Cross-Browser Testing**: Manually test the application on the latest versions of Chrome, Firefox, and Safari.
58 |     - **Responsive Testing**: Verify the layout and functionality on various screen sizes, from small mobile phones to large desktops.
59 |     - **Accessibility Audit**: Manually test with a screen reader (e.g., VoiceOver, NVDA) and check against WCAG 2.1 AA standards.
60 | 
61 | ## 5. Deployment & Infrastructure
62 | 
63 | ### 5.1. Platform
64 | - **Vercel**: The application will be deployed to Vercel to leverage its seamless integration with Next.js, serverless functions, and global CDN.
65 | 
66 | ### 5.2. Environments
67 | - **Production**: The live application, connected to the production Supabase project (`prod` branch).
68 | - **Preview**: Each pull request will automatically generate a preview deployment with its own isolated environment, connected to a staging/dev Supabase project.
69 | 
70 | ### 5.3. Environment Variables
71 | - The following environment variables must be configured in Vercel for both production and preview environments:
72 |     - `NEXT_PUBLIC_SUPABASE_URL`
73 |     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
74 |     - `SUPABASE_SERVICE_ROLE_KEY` (if needed for admin tasks)
75 | 
76 | ### 5.4. Monitoring & Logging
77 | - **Vercel Analytics**: Enable to monitor traffic, page views, and basic performance metrics.
78 | - **Error Tracking**: Integrate a service like **Sentry** or **Bugsnag**. This is crucial for capturing and diagnosing errors that occur in the production environment. All unhandled exceptions should be automatically reported.
79 | 
80 | ## 6. Success Metrics for Launch
81 | These metrics, defined in the main PRD, will be used to evaluate the success of the initial launch.
82 | - **User Engagement**: Daily and Monthly Active Users (DAU/MAU).
83 | - **Feature Adoption**: Percentage of users who complete the onboarding and actively use budgeting and investment tracking features.
84 | - **User Retention**: The rate at which users return to the app weekly and monthly.
85 | - **User Satisfaction**: Qualitative feedback and app store ratings.
86 | - **Technical Stability**: Low rate of production errors reported in Sentry/error tracker. 
```

.taskmaster/tasks/tasks.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Setup Supabase Project Configuration",
7 |         "description": "Initialize Supabase project and configure environment variables in Next.js application",
8 |         "details": "Configure Supabase client in the existing Next.js project by setting up environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). Create lib/supabase.ts for client initialization and ensure proper TypeScript configuration. Verify connection to Supabase instance.",
9 |         "testStrategy": "Test Supabase client connection by attempting to query auth.users table. Verify environment variables are properly loaded and client initializes without errors.",
10 |         "priority": "high",
11 |         "dependencies": [],
12 |         "status": "done",
13 |         "subtasks": [
14 |           {
15 |             "id": 1,
16 |             "title": "Create environment variables configuration file",
17 |             "description": "Create .env.local file and configure Supabase environment variables",
18 |             "dependencies": [],
19 |             "details": "Create .env.local file in project root with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables. Add .env.local to .gitignore if not already present to prevent committing sensitive credentials.",
20 |             "status": "done",
21 |             "testStrategy": "Verify environment variables are loaded correctly by checking process.env values in development mode"
22 |           },
23 |           {
24 |             "id": 2,
25 |             "title": "Set up Supabase project in dashboard",
26 |             "description": "Create or configure Supabase project and obtain required API keys",
27 |             "dependencies": [],
28 |             "details": "Create new Supabase project or use existing one. Obtain Project URL and anon public key from project settings. Generate service role key for server-side operations. Configure project settings including site URL for authentication callbacks.",
29 |             "status": "done",
30 |             "testStrategy": "Verify project is accessible and API keys are valid by testing connection from Supabase dashboard"
31 |           },
32 |           {
33 |             "id": 3,
34 |             "title": "Configure Google OAuth provider",
35 |             "description": "Set up Google OAuth provider in Supabase Auth settings",
36 |             "dependencies": [
37 |               1,
38 |               2
39 |             ],
40 |             "details": "Navigate to Supabase Auth settings and configure Google OAuth provider. Set up Google Cloud Console project, obtain client ID and secret, configure authorized redirect URIs including Supabase callback URL. Enable Google provider in Supabase dashboard with proper client credentials.",
41 |             "status": "done",
42 |             "testStrategy": "Test Google OAuth flow by attempting sign-in through the application and verifying successful authentication"
43 |           },
44 |           {
45 |             "id": 4,
46 |             "title": "Verify Supabase connection and authentication flows",
47 |             "description": "Test all authentication methods and verify Supabase client connectivity",
48 |             "dependencies": [
49 |               1,
50 |               2,
51 |               3
52 |             ],
53 |             "details": "Test the existing authentication implementation by verifying: Google OAuth sign-in/sign-up, email/password registration and login, password reset functionality, session persistence across page refreshes, middleware route protection, and proper client/server communication with Supabase.",
54 |             "status": "done",
55 |             "testStrategy": "Perform end-to-end testing of all authentication flows including sign-up, sign-in, password reset, session management, and protected route access"
56 |           },
57 |           {
58 |             "id": 5,
59 |             "title": "Create Supabase Project and Obtain API Keys",
60 |             "description": "Set up a new Supabase project in the dashboard and retrieve the necessary API keys and URL for the Next.js application",
61 |             "dependencies": [],
62 |             "details": "Go to supabase.com, create a new project, navigate to Settings > API to get the project URL and anon key. Also obtain the service role key from the same section. Document these keys for the next step.",
63 |             "status": "done",
64 |             "testStrategy": "Verify keys are valid by testing a simple connection to the Supabase API"
65 |           },
66 |           {
67 |             "id": 6,
68 |             "title": "Configure Environment Variables",
69 |             "description": "Set up environment variables in Next.js for Supabase configuration",
70 |             "dependencies": [
71 |               5
72 |             ],
73 |             "details": "Create .env.local file with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY. Ensure .env.local is in .gitignore. Create .env.example with placeholder values for team reference.",
74 |             "status": "done",
75 |             "testStrategy": "Verify environment variables are loaded correctly in the Next.js application"
76 |           },
77 |           {
78 |             "id": 7,
79 |             "title": "Create Supabase Client Configuration",
80 |             "description": "Implement the Supabase client initialization in lib/supabase.ts with proper TypeScript types",
81 |             "dependencies": [
82 |               6
83 |             ],
84 |             "details": "Create lib/supabase.ts file with createClient function from @supabase/supabase-js. Export both client and server-side configurations. Add proper TypeScript types for the client. Include error handling for missing environment variables.",
85 |             "status": "done",
86 |             "testStrategy": "Test client initialization and verify TypeScript compilation without errors"
87 |           },
88 |           {
89 |             "id": 8,
90 |             "title": "Verify Supabase Connection and Setup",
91 |             "description": "Test the Supabase connection and ensure all configurations are working correctly",
92 |             "dependencies": [
93 |               7
94 |             ],
95 |             "details": "Create a test API route or component that uses the Supabase client to verify connection. Test both client-side and server-side usage. Ensure proper error handling for connection failures. Document the setup process.",
96 |             "status": "done",
97 |             "testStrategy": "Run the Next.js application and verify successful connection to Supabase without console errors"
98 |           }
99 |         ]
100 |       },
101 |       {
102 |         "id": 2,
103 |         "title": "Create Database Schema with Enums and Types",
104 |         "description": "Implement all database enums, tables, and relationships as specified in the PRD",
105 |         "details": "Create migration files for: 1) account_type, category_type, transaction_type, budget_frequency enums, 2) user_settings table with currency and financial period settings, 3) accounts table with balance tracking, 4) categories table with budget support, 5) transactions table with transfer logic, 6) balance_ledger table for audit trail. Include all indexes and constraints as specified.",
106 |         "testStrategy": "Execute migrations and verify all tables, enums, and constraints are created correctly. Test constraint validations by attempting to insert invalid data and ensuring proper error responses.",
107 |         "priority": "high",
108 |         "dependencies": [
109 |           1
110 |         ],
111 |         "status": "done",
112 |         "subtasks": [
113 |           {
114 |             "id": 1,
115 |             "title": "Create Database Enums Migration",
116 |             "description": "Create migration file to define all required database enums for the financial tracking system",
117 |             "dependencies": [],
118 |             "details": "Create a Supabase migration file that defines account_type enum (checking, savings, credit_card, investment, loan, other), category_type enum (income, expense), transaction_type enum (income, expense, transfer), and budget_frequency enum (weekly, monthly, quarterly, yearly). Use proper SQL syntax for enum creation.",
119 |             "status": "done",
120 |             "testStrategy": "Verify enums are created correctly by querying information_schema.types table"
121 |           },
122 |           {
123 |             "id": 2,
124 |             "title": "Create User Settings Table",
125 |             "description": "Implement user_settings table with currency preferences and financial period configuration",
126 |             "dependencies": [
127 |               1
128 |             ],
129 |             "details": "Create user_settings table with columns: id (UUID primary key), user_id (UUID foreign key to auth.users), currency (VARCHAR default 'USD'), financial_period_start (INTEGER 1-31 for day of month), created_at and updated_at timestamps. Include RLS policies for user access control.",
130 |             "status": "done",
131 |             "testStrategy": "Test table creation, constraints, and RLS policies by inserting test data and verifying access control"
132 |           },
133 |           {
134 |             "id": 3,
135 |             "title": "Create Accounts Table with Balance Tracking",
136 |             "description": "Implement accounts table to store user financial accounts with current balance tracking",
137 |             "dependencies": [
138 |               1
139 |             ],
140 |             "details": "Create accounts table with columns: id (UUID primary key), user_id (UUID foreign key), name (VARCHAR), account_type (enum), current_balance (DECIMAL(12,2)), is_active (BOOLEAN default true), created_at and updated_at. Add indexes on user_id and account_type. Include RLS policies.",
141 |             "status": "done",
142 |             "testStrategy": "Verify balance precision, enum constraints, and that balance updates work correctly with sample transactions"
143 |           },
144 |           {
145 |             "id": 4,
146 |             "title": "Create Categories Table with Budget Support",
147 |             "description": "Implement categories table for transaction categorization with integrated budget functionality",
148 |             "dependencies": [
149 |               1
150 |             ],
151 |             "details": "Create categories table with columns: id (UUID primary key), user_id (UUID foreign key), name (VARCHAR), category_type (enum), budget_amount (DECIMAL(12,2)), budget_frequency (enum), is_active (BOOLEAN default true), created_at and updated_at. Add unique constraint on (user_id, name) and indexes on user_id and category_type.",
152 |             "status": "done",
153 |             "testStrategy": "Test category creation, budget amount validation, and frequency enum constraints"
154 |           },
155 |           {
156 |             "id": 5,
157 |             "title": "Create Transactions Table with Transfer Logic",
158 |             "description": "Implement transactions table to record all financial transactions including transfers between accounts",
159 |             "dependencies": [
160 |               1,
161 |               3,
162 |               4
163 |             ],
164 |             "details": "Create transactions table with columns: id (UUID primary key), user_id (UUID foreign key), account_id (UUID foreign key), category_id (UUID foreign key), transaction_type (enum), amount (DECIMAL(12,2)), description (TEXT), transaction_date (DATE), transfer_account_id (UUID foreign key, nullable for transfers), created_at and updated_at. Add indexes on user_id, account_id, transaction_date, and category_id.",
165 |             "status": "done",
166 |             "testStrategy": "Test transaction insertion, transfer logic validation, and ensure foreign key constraints work properly"
167 |           },
168 |           {
169 |             "id": 6,
170 |             "title": "Create Balance Ledger Audit Trail Table",
171 |             "description": "Implement balance_ledger table for maintaining audit trail of all balance changes",
172 |             "dependencies": [
173 |               1,
174 |               3,
175 |               5
176 |             ],
177 |             "details": "Create balance_ledger table with columns: id (UUID primary key), user_id (UUID foreign key), account_id (UUID foreign key), transaction_id (UUID foreign key), balance_before (DECIMAL(12,2)), balance_after (DECIMAL(12,2)), change_amount (DECIMAL(12,2)), created_at timestamp. Add indexes on user_id, account_id, and transaction_id. Create database triggers to automatically populate this table when account balances change.",
178 |             "status": "done",
179 |             "testStrategy": "Verify audit trail accuracy by performing test transactions and confirming balance_ledger entries match expected balance changes"
180 |           }
181 |         ]
182 |       },
183 |       {
184 |         "id": 3,
185 |         "title": "Configure Row Level Security Policies",
186 |         "description": "Enable RLS on all tables and create user isolation policies - Most policies were already implemented, completed remaining gaps",
187 |         "status": "done",
188 |         "dependencies": [
189 |           2
190 |         ],
191 |         "priority": "high",
192 |         "details": "Row Level Security has been successfully configured on all core tables (user_settings, accounts, categories, transactions, balance_ledger). Most policies were already implemented in existing migrations. Completed the remaining gaps: added missing DELETE policy for user_settings and fully implemented RLS for balance_ledger table. All policies use auth.uid() = user_id isolation pattern, with balance_ledger using JOIN through accounts table for user identification.",
193 |         "testStrategy": "Create test users and verify data isolation by attempting cross-user data access. Ensure policies allow legitimate operations while blocking unauthorized access. Test all CRUD operations for each table, with special attention to balance_ledger's account-based user isolation.",
194 |         "subtasks": [
195 |           {
196 |             "id": 1,
197 |             "title": "Enable Row Level Security on Core Tables",
198 |             "description": "Enable RLS on user_settings, accounts, categories, transactions, and balance_ledger tables",
199 |             "status": "done",
200 |             "dependencies": [],
201 |             "details": "RLS was already enabled on user_settings, accounts, categories, and transactions tables from existing migrations. Added RLS enablement for balance_ledger table in migration 20250102000000_complete_rls_policies.sql.",
202 |             "testStrategy": "Verified RLS is enabled on all tables by checking existing migrations and database state"
203 |           },
204 |           {
205 |             "id": 2,
206 |             "title": "Create SELECT Policies for User Data Isolation",
207 |             "description": "Implement SELECT policies ensuring users can only view their own data",
208 |             "status": "done",
209 |             "dependencies": [
210 |               1
211 |             ],
212 |             "details": "SELECT policies were already implemented for user_settings, accounts, categories, and transactions tables. Added SELECT policy for balance_ledger table using JOIN with accounts table for user identification since balance_ledger doesn't have direct user_id column.",
213 |             "testStrategy": "Verified existing SELECT policies and tested new balance_ledger SELECT policy with different authenticated users"
214 |           },
215 |           {
216 |             "id": 3,
217 |             "title": "Create INSERT Policies for User Data Creation",
218 |             "description": "Implement INSERT policies to ensure users can only create records for themselves",
219 |             "status": "done",
220 |             "dependencies": [
221 |               1
222 |             ],
223 |             "details": "INSERT policies were already implemented for user_settings, accounts, categories, and transactions tables. Added INSERT policy for balance_ledger table with CHECK condition using JOIN with accounts table to ensure user can only insert records for their own accounts.",
224 |             "testStrategy": "Verified existing INSERT policies and tested new balance_ledger INSERT policy to ensure users can only create records for their own accounts"
225 |           },
226 |           {
227 |             "id": 4,
228 |             "title": "Create UPDATE and DELETE Policies",
229 |             "description": "Implement UPDATE and DELETE policies for user data modification and removal",
230 |             "status": "done",
231 |             "dependencies": [
232 |               1
233 |             ],
234 |             "details": "UPDATE and DELETE policies were already implemented for accounts, categories, and transactions tables. Added missing DELETE policy for user_settings table and both UPDATE and DELETE policies for balance_ledger table using account-based user isolation.",
235 |             "testStrategy": "Added and tested missing DELETE policy for user_settings and new UPDATE/DELETE policies for balance_ledger table"
236 |           },
237 |           {
238 |             "id": 5,
239 |             "title": "Comprehensive Multi-User Policy Testing",
240 |             "description": "Test all RLS policies with multiple user contexts and edge cases",
241 |             "status": "done",
242 |             "dependencies": [
243 |               2,
244 |               3,
245 |               4
246 |             ],
247 |             "details": "Execute comprehensive testing of all RLS policies across all tables with multiple authenticated users. Pay special attention to balance_ledger table's account-based user isolation pattern. Test edge cases including null user_id, anonymous access, and cross-user data access attempts.",
248 |             "testStrategy": "Execute comprehensive test suite with at least 3 different user accounts, testing all CRUD operations on all tables including the newly completed balance_ledger policies, and verifying data isolation is maintained"
249 |           }
250 |         ]
251 |       },
252 |       {
253 |         "id": 4,
254 |         "title": "Implement Database Functions and Triggers",
255 |         "description": "Create balance calculation functions and automated triggers for account balance updates",
256 |         "details": "Implement update_account_balance_with_ledger() function with proper credit card logic (expenses increase balance, transfers to credit cards decrease balance). Create trigger for automatic balance updates on transaction insert. Implement update_updated_at_column() function and apply to all tables. Create dashboard functions: get_financial_summary(), get_budget_progress(), get_investment_progress().",
257 |         "testStrategy": "Test balance calculations with various transaction types and account types, especially credit card scenarios. Verify ledger entries are created correctly. Test edge cases like negative amounts and transfers between different account types.",
258 |         "priority": "high",
259 |         "dependencies": [
260 |           3
261 |         ],
262 |         "status": "done",
263 |         "subtasks": [
264 |           {
265 |             "id": 1,
266 |             "title": "Implement update_updated_at_column() function",
267 |             "description": "Create a generic PostgreSQL function that automatically updates the updated_at timestamp column whenever a row is modified",
268 |             "dependencies": [],
269 |             "details": "Create a PL/pgSQL function that sets NEW.updated_at = NOW() and returns NEW. This will be used as a trigger function across all tables to maintain consistent timestamp tracking.",
270 |             "status": "done",
271 |             "testStrategy": "Test by creating a test table, applying the trigger, and verifying timestamp updates on INSERT and UPDATE operations"
272 |           },
273 |           {
274 |             "id": 2,
275 |             "title": "Apply updated_at triggers to all tables",
276 |             "description": "Create triggers on all existing tables to automatically update the updated_at column using the update_updated_at_column() function",
277 |             "dependencies": [
278 |               1
279 |             ],
280 |             "details": "Identify all tables that have updated_at columns and create BEFORE UPDATE triggers that call the update_updated_at_column() function. Ensure proper naming convention for triggers.",
281 |             "status": "done",
282 |             "testStrategy": "Verify each table's trigger by performing update operations and confirming updated_at timestamps change appropriately"
283 |           },
284 |           {
285 |             "id": 3,
286 |             "title": "Implement update_account_balance_with_ledger() function",
287 |             "description": "Create the core balance calculation function that handles different account types with proper credit card logic",
288 |             "dependencies": [],
289 |             "details": "Implement PL/pgSQL function that calculates account balance by summing transactions from ledger. For credit cards: expenses increase balance (debt), transfers to credit cards decrease balance. For other accounts: standard debit/credit logic applies.",
290 |             "status": "done",
291 |             "testStrategy": "Test with various account types including checking, savings, and credit cards with different transaction scenarios"
292 |           },
293 |           {
294 |             "id": 4,
295 |             "title": "Create automatic balance update trigger",
296 |             "description": "Implement trigger that automatically recalculates account balances when transactions are inserted, updated, or deleted",
297 |             "dependencies": [
298 |               3
299 |             ],
300 |             "details": "Create trigger on transactions table that calls update_account_balance_with_ledger() for affected accounts. Handle both the source and destination accounts for transfers. Ensure trigger fires on INSERT, UPDATE, and DELETE operations.",
301 |             "status": "done",
302 |             "testStrategy": "Test by adding, modifying, and deleting transactions, then verifying account balances update correctly in real-time"
303 |           },
304 |           {
305 |             "id": 5,
306 |             "title": "Implement get_financial_summary() function",
307 |             "description": "Create dashboard function that provides comprehensive financial overview including total assets, liabilities, and net worth",
308 |             "dependencies": [
309 |               3
310 |             ],
311 |             "details": "Develop function that aggregates account balances by type, calculates total assets (checking, savings, investments), total liabilities (credit cards, loans), and net worth. Return structured data suitable for dashboard display.",
312 |             "status": "done",
313 |             "testStrategy": "Verify calculations match manual totals across different account types and transaction scenarios"
314 |           },
315 |           {
316 |             "id": 6,
317 |             "title": "Implement get_budget_progress() function",
318 |             "description": "Create function that calculates budget progress by comparing actual spending against budget allocations",
319 |             "dependencies": [
320 |               3
321 |             ],
322 |             "details": "Develop function that takes date range parameters and returns budget vs actual spending by category. Calculate percentage utilization and remaining budget amounts. Handle both income and expense categories.",
323 |             "status": "done",
324 |             "testStrategy": "Test with various date ranges and budget scenarios to ensure accurate progress calculations and proper handling of over-budget situations"
325 |           },
326 |           {
327 |             "id": 7,
328 |             "title": "Implement get_investment_progress() function",
329 |             "description": "Create function that tracks investment account performance including gains/losses and portfolio allocation",
330 |             "dependencies": [
331 |               3
332 |             ],
333 |             "details": "Develop function that calculates investment performance metrics including current value, cost basis, unrealized gains/losses, and asset allocation percentages. Handle multiple investment accounts and asset types.",
334 |             "status": "done",
335 |             "testStrategy": "Test with sample investment data including purchases, sales, and dividend transactions to verify accurate performance calculations"
336 |           }
337 |         ]
338 |       },
339 |       {
340 |         "id": 5,
341 |         "title": "Generate TypeScript Types from Database Schema",
342 |         "description": "Create TypeScript type definitions that match the database schema",
343 |         "details": "Use Supabase CLI to generate TypeScript types from the database schema. Create types/database.ts with all table interfaces, enums, and function return types. Ensure types are properly exported and can be used throughout the application. Create additional utility types for API responses and form inputs.",
344 |         "testStrategy": "Verify generated types match database schema exactly. Test type safety by using types in sample code and ensuring TypeScript compilation succeeds. Validate enum types match database enum values.",
345 |         "priority": "medium",
346 |         "dependencies": [
347 |           4
348 |         ],
349 |         "status": "done",
350 |         "subtasks": []
351 |       },
352 |       {
353 |         "id": 6,
354 |         "title": "Setup Next.js API Routes Structure",
355 |         "description": "Create API route files and basic error handling utilities",
356 |         "details": "Create API route structure: pages/api/settings/index.ts, pages/api/accounts/index.ts, pages/api/categories/index.ts, pages/api/transactions/index.ts, pages/api/dashboard/index.ts. Implement basic error handling middleware, request validation utilities, and authentication helpers. Set up proper HTTP method handling and response formatting.",
357 |         "testStrategy": "Test each API route responds with proper HTTP status codes. Verify authentication middleware blocks unauthenticated requests. Test error handling with malformed requests and ensure consistent error response format.",
358 |         "priority": "medium",
359 |         "dependencies": [
360 |           5
361 |         ],
362 |         "status": "done",
363 |         "subtasks": []
364 |       },
365 |       {
366 |         "id": 7,
367 |         "title": "Test Credit Card Balance Logic",
368 |         "description": "Comprehensive testing of credit card balance calculations and transactions",
369 |         "details": "Create comprehensive test suite for credit card balance logic: 1) Credit card expenses should increase balance (debt), 2) Credit card income should decrease balance (payments/cashback), 3) Transfers to credit cards should decrease balance (payments), 4) Transfers from credit cards should increase balance (cash advances). Test with positive/negative amounts and various scenarios.",
370 |         "testStrategy": "Create test scenarios with sample credit card accounts and execute various transaction types. Verify balance calculations match expected credit card behavior. Test ledger entries for accuracy and consistency. Validate against real-world credit card statement logic.",
371 |         "priority": "high",
372 |         "dependencies": [
373 |           6
374 |         ],
375 |         "status": "pending",
376 |         "subtasks": []
377 |       },
378 |       {
379 |         "id": 8,
380 |         "title": "Create Database Seeding and Migration Scripts",
381 |         "description": "Develop scripts for database initialization and sample data creation",
382 |         "details": "Create migration scripts for production deployment and rollback procedures. Develop seeding scripts with sample categories (common expense/income categories with appropriate icons), sample account types, and test transaction data. Include script to create default user settings and validate all database functions work with realistic data.",
383 |         "testStrategy": "Execute migration and seeding scripts on fresh database instance. Verify all sample data is created correctly and maintains referential integrity. Test migration rollback procedures. Validate dashboard functions return expected results with seeded data.",
384 |         "priority": "medium",
385 |         "dependencies": [
386 |           7
387 |         ],
388 |         "status": "pending",
389 |         "subtasks": []
390 |       }
391 |     ],
392 |     "metadata": {
393 |       "created": "2025-06-29T05:16:20.412Z",
394 |       "updated": "2025-06-30T00:20:16.486Z",
395 |       "description": "Tasks for master context"
396 |     }
397 |   }
398 | }
```

.taskmaster/templates/example_prd.txt
```
1 | <context>
2 | # Overview  
3 | [Provide a high-level overview of your product here. Explain what problem it solves, who it's for, and why it's valuable.]
4 | 
5 | # Core Features  
6 | [List and describe the main features of your product. For each feature, include:
7 | - What it does
8 | - Why it's important
9 | - How it works at a high level]
10 | 
11 | # User Experience  
12 | [Describe the user journey and experience. Include:
13 | - User personas
14 | - Key user flows
15 | - UI/UX considerations]
16 | </context>
17 | <PRD>
18 | # Technical Architecture  
19 | [Outline the technical implementation details:
20 | - System components
21 | - Data models
22 | - APIs and integrations
23 | - Infrastructure requirements]
24 | 
25 | # Development Roadmap  
26 | [Break down the development process into phases:
27 | - MVP requirements
28 | - Future enhancements
29 | - Do not think about timelines whatsoever -- all that matters is scope and detailing exactly what needs to be build in each phase so it can later be cut up into tasks]
30 | 
31 | # Logical Dependency Chain
32 | [Define the logical order of development:
33 | - Which features need to be built first (foundation)
34 | - Getting as quickly as possible to something usable/visible front end that works
35 | - Properly pacing and scoping each feature so it is atomic but can also be built upon and improved as development approaches]
36 | 
37 | # Risks and Mitigations  
38 | [Identify potential risks and how they'll be addressed:
39 | - Technical challenges
40 | - Figuring out the MVP that we can build upon
41 | - Resource constraints]
42 | 
43 | # Appendix  
44 | [Include any additional information:
45 | - Research findings
46 | - Technical specifications]
47 | </PRD>
```

__tests__/database/creditCardBalance.test.ts
```
1 | import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
2 | import { 
3 |   setupCreditCardTest,
4 |   getTestDate,
5 |   type TestSetup 
6 | } from '../utils/testSetup';
7 | import { 
8 |   createTestTransaction,
9 |   getAccountBalance,
10 |   getBalanceLedgerEntries 
11 | } from '../utils/testDatabase';
12 | 
13 | describe('Credit Card Balance Logic', () => {
14 |   let testSetup: TestSetup;
15 | 
16 |   beforeEach(async () => {
17 |     testSetup = await setupCreditCardTest();
18 |   });
19 | 
20 |   afterEach(async () => {
21 |     if (testSetup) {
22 |       await testSetup.cleanup();
23 |     }
24 |   });
25 | 
26 |   describe('Credit Card Expense Transactions', () => {
27 |     test('should increase balance (debt) for new credit card purchase', async () => {
28 |       // Initial balance should be 0
29 |       let balance = await getAccountBalance(testSetup.creditCardAccount.id);
30 |       expect(balance).toBe(0);
31 | 
32 |       // Make a $100 purchase
33 |       await createTestTransaction(
34 |         testSetup.user.id,
35 |         'expense',
36 |         100.00,
37 |         'Test purchase',
38 |         getTestDate(),
39 |         testSetup.creditCardAccount.id,
40 |         testSetup.expenseCategory.id
41 |       );
42 | 
43 |       // Balance should now be $100 (debt increased)
44 |       balance = await getAccountBalance(testSetup.creditCardAccount.id);
45 |       expect(balance).toBe(100.00);
46 |     });
47 | 
48 |     test('should increase debt on credit card with existing balance', async () => {
49 |       // Create initial debt of $500
50 |       await createTestTransaction(
51 |         testSetup.user.id,
52 |         'expense',
53 |         500.00,
54 |         'Initial debt',
55 |         getTestDate(-1),
56 |         testSetup.creditCardAccount.id,
57 |         testSetup.expenseCategory.id
58 |       );
59 | 
60 |       // Verify initial balance
61 |       let balance = await getAccountBalance(testSetup.creditCardAccount.id);
62 |       expect(balance).toBe(500.00);
63 | 
64 |       // Make another $50 purchase
65 |       await createTestTransaction(
66 |         testSetup.user.id,
67 |         'expense',
68 |         50.00,
69 |         'Additional purchase',
70 |         getTestDate(),
71 |         testSetup.creditCardAccount.id,
72 |         testSetup.expenseCategory.id
73 |       );
74 | 
75 |       // Balance should now be $550 (debt increased)
76 |       balance = await getAccountBalance(testSetup.creditCardAccount.id);
77 |       expect(balance).toBe(550.00);
78 |     });
79 | 
80 |     test('should handle negative expense amounts (refunds) correctly', async () => {
81 |       // Create initial debt of $200
82 |       await createTestTransaction(
83 |         testSetup.user.id,
84 |         'expense',
85 |         200.00,
86 |         'Initial purchase',
87 |         getTestDate(-1),
88 |         testSetup.creditCardAccount.id,
89 |         testSetup.expenseCategory.id
90 |       );
91 | 
92 |       // Verify initial balance
93 |       let balance = await getAccountBalance(testSetup.creditCardAccount.id);
94 |       expect(balance).toBe(200.00);
95 | 
96 |       // Process a $50 refund (negative expense)
97 |       await createTestTransaction(
98 |         testSetup.user.id,
99 |         'expense',
100 |         -50.00,
101 |         'Refund',
102 |         getTestDate(),
103 |         testSetup.creditCardAccount.id,
104 |         testSetup.expenseCategory.id
105 |       );
106 | 
107 |       // Balance should be $150 (debt decreased by refund)
108 |       balance = await getAccountBalance(testSetup.creditCardAccount.id);
109 |       expect(balance).toBe(150.00);
110 |     });
111 | 
112 |     test('should handle large refund that creates credit balance', async () => {
113 |       // Create initial debt of $100
114 |       await createTestTransaction(
115 |         testSetup.user.id,
116 |         'expense',
117 |         100.00,
118 |         'Initial purchase',
119 |         getTestDate(-1),
120 |         testSetup.creditCardAccount.id,
121 |         testSetup.expenseCategory.id
122 |       );
123 | 
124 |       // Process a $150 refund (larger than debt)
125 |       await createTestTransaction(
126 |         testSetup.user.id,
127 |         'expense',
128 |         -150.00,
129 |         'Large refund',
130 |         getTestDate(),
131 |         testSetup.creditCardAccount.id,
132 |         testSetup.expenseCategory.id
133 |       );
134 | 
135 |       // Balance should be -$50 (credit balance)
136 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
137 |       expect(balance).toBe(-50.00);
138 |     });
139 |   });
140 | 
141 |   describe('Credit Card Payment Transactions (Income)', () => {
142 |     test('should decrease balance (debt) for credit card payment', async () => {
143 |       // Create initial debt of $500
144 |       await createTestTransaction(
145 |         testSetup.user.id,
146 |         'expense',
147 |         500.00,
148 |         'Initial debt',
149 |         getTestDate(-1),
150 |         testSetup.creditCardAccount.id,
151 |         testSetup.expenseCategory.id
152 |       );
153 | 
154 |       // Make a $200 payment
155 |       await createTestTransaction(
156 |         testSetup.user.id,
157 |         'income',
158 |         200.00,
159 |         'Payment',
160 |         getTestDate(),
161 |         testSetup.creditCardAccount.id,
162 |         testSetup.incomeCategory.id
163 |       );
164 | 
165 |       // Balance should now be $300 (debt decreased)
166 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
167 |       expect(balance).toBe(300.00);
168 |     });
169 | 
170 |     test('should handle full payment of credit card debt', async () => {
171 |       // Create initial debt of $300
172 |       await createTestTransaction(
173 |         testSetup.user.id,
174 |         'expense',
175 |         300.00,
176 |         'Initial debt',
177 |         getTestDate(-1),
178 |         testSetup.creditCardAccount.id,
179 |         testSetup.expenseCategory.id
180 |       );
181 | 
182 |       // Make full payment
183 |       await createTestTransaction(
184 |         testSetup.user.id,
185 |         'income',
186 |         300.00,
187 |         'Full payment',
188 |         getTestDate(),
189 |         testSetup.creditCardAccount.id,
190 |         testSetup.incomeCategory.id
191 |       );
192 | 
193 |       // Balance should be $0 (no debt)
194 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
195 |       expect(balance).toBe(0.00);
196 |     });
197 | 
198 |     test('should handle overpayment creating credit balance', async () => {
199 |       // Create initial debt of $200
200 |       await createTestTransaction(
201 |         testSetup.user.id,
202 |         'expense',
203 |         200.00,
204 |         'Initial debt',
205 |         getTestDate(-1),
206 |         testSetup.creditCardAccount.id,
207 |         testSetup.expenseCategory.id
208 |       );
209 | 
210 |       // Make overpayment of $250
211 |       await createTestTransaction(
212 |         testSetup.user.id,
213 |         'income',
214 |         250.00,
215 |         'Overpayment',
216 |         getTestDate(),
217 |         testSetup.creditCardAccount.id,
218 |         testSetup.incomeCategory.id
219 |       );
220 | 
221 |       // Balance should be -$50 (credit balance)
222 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
223 |       expect(balance).toBe(-50.00);
224 |     });
225 | 
226 |     test('should handle negative income amounts correctly', async () => {
227 |       // Create initial debt of $100
228 |       await createTestTransaction(
229 |         testSetup.user.id,
230 |         'expense',
231 |         100.00,
232 |         'Initial debt',
233 |         getTestDate(-1),
234 |         testSetup.creditCardAccount.id,
235 |         testSetup.expenseCategory.id
236 |       );
237 | 
238 |       // Process negative income (payment reversal)
239 |       await createTestTransaction(
240 |         testSetup.user.id,
241 |         'income',
242 |         -50.00,
243 |         'Payment reversal',
244 |         getTestDate(),
245 |         testSetup.creditCardAccount.id,
246 |         testSetup.incomeCategory.id
247 |       );
248 | 
249 |       // Balance should be $150 (debt increased)
250 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
251 |       expect(balance).toBe(150.00);
252 |     });
253 |   });
254 | 
255 |   describe('Credit Card Transfer Scenarios', () => {
256 |     test('transfers TO credit card should decrease balance (payments)', async () => {
257 |       // Create initial debt of $400
258 |       await createTestTransaction(
259 |         testSetup.user.id,
260 |         'expense',
261 |         400.00,
262 |         'Initial debt',
263 |         getTestDate(-1),
264 |         testSetup.creditCardAccount.id,
265 |         testSetup.expenseCategory.id
266 |       );
267 | 
268 |       // Transfer $150 from bank account to credit card (payment)
269 |       await createTestTransaction(
270 |         testSetup.user.id,
271 |         'transfer',
272 |         150.00,
273 |         'Payment transfer',
274 |         getTestDate(),
275 |         undefined,
276 |         undefined,
277 |         testSetup.bankAccount.id,
278 |         testSetup.creditCardAccount.id
279 |       );
280 | 
281 |       // Credit card balance should decrease to $250
282 |       const ccBalance = await getAccountBalance(testSetup.creditCardAccount.id);
283 |       expect(ccBalance).toBe(250.00);
284 | 
285 |       // Bank account balance should decrease to $850
286 |       const bankBalance = await getAccountBalance(testSetup.bankAccount.id);
287 |       expect(bankBalance).toBe(850.00);
288 |     });
289 | 
290 |     test('transfers FROM credit card should increase balance (cash advance)', async () => {
291 |       // Start with zero debt
292 |       let ccBalance = await getAccountBalance(testSetup.creditCardAccount.id);
293 |       expect(ccBalance).toBe(0.00);
294 | 
295 |       // Transfer $200 from credit card to bank account (cash advance)
296 |       await createTestTransaction(
297 |         testSetup.user.id,
298 |         'transfer',
299 |         200.00,
300 |         'Cash advance',
301 |         getTestDate(),
302 |         undefined,
303 |         undefined,
304 |         testSetup.creditCardAccount.id,
305 |         testSetup.bankAccount.id
306 |       );
307 | 
308 |       // Credit card balance should increase to $200 (debt)
309 |       ccBalance = await getAccountBalance(testSetup.creditCardAccount.id);
310 |       expect(ccBalance).toBe(200.00);
311 | 
312 |       // Bank account balance should increase to $1200
313 |       const bankBalance = await getAccountBalance(testSetup.bankAccount.id);
314 |       expect(bankBalance).toBe(1200.00);
315 |     });
316 | 
317 |     test('credit card to credit card transfer', async () => {
318 |       // Create a second credit card with $300 debt
319 |       const secondCreditCard = await require('../utils/testDatabase').createTestAccount(
320 |         testSetup.user.id,
321 |         'Second Credit Card',
322 |         'credit_card',
323 |         300.00
324 |       );
325 | 
326 |       // Transfer $100 from first credit card to second credit card
327 |       await createTestTransaction(
328 |         testSetup.user.id,
329 |         'transfer',
330 |         100.00,
331 |         'CC to CC transfer',
332 |         getTestDate(),
333 |         undefined,
334 |         undefined,
335 |         testSetup.creditCardAccount.id,
336 |         secondCreditCard.id
337 |       );
338 | 
339 |       // First credit card balance should increase to $100 (debt)
340 |       const firstCcBalance = await getAccountBalance(testSetup.creditCardAccount.id);
341 |       expect(firstCcBalance).toBe(100.00);
342 | 
343 |       // Second credit card balance should decrease to $200 (debt decreased)
344 |       const secondCcBalance = await getAccountBalance(secondCreditCard.id);
345 |       expect(secondCcBalance).toBe(200.00);
346 |     });
347 |   });
348 | 
349 |   describe('Balance Ledger Accuracy', () => {
350 |     test('should create accurate ledger entries for expense transactions', async () => {
351 |       // Make a $100 purchase
352 |       const transaction = await createTestTransaction(
353 |         testSetup.user.id,
354 |         'expense',
355 |         100.00,
356 |         'Test purchase',
357 |         getTestDate(),
358 |         testSetup.creditCardAccount.id,
359 |         testSetup.expenseCategory.id
360 |       );
361 | 
362 |       // Check ledger entries
363 |       const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
364 |       expect(ledgerEntries).toHaveLength(1);
365 | 
366 |       const entry = ledgerEntries[0];
367 |       expect(entry.transaction_id).toBe(transaction.id);
368 |       expect(entry.balance_before).toBe(0.00);
369 |       expect(entry.balance_after).toBe(100.00);
370 |       expect(entry.change_amount).toBe(100.00);
371 |     });
372 | 
373 |     test('should create accurate ledger entries for payment transactions', async () => {
374 |       // Create initial debt
375 |       await createTestTransaction(
376 |         testSetup.user.id,
377 |         'expense',
378 |         200.00,
379 |         'Initial debt',
380 |         getTestDate(-1),
381 |         testSetup.creditCardAccount.id,
382 |         testSetup.expenseCategory.id
383 |       );
384 | 
385 |       // Make a payment
386 |       const paymentTransaction = await createTestTransaction(
387 |         testSetup.user.id,
388 |         'income',
389 |         75.00,
390 |         'Payment',
391 |         getTestDate(),
392 |         testSetup.creditCardAccount.id,
393 |         testSetup.incomeCategory.id
394 |       );
395 | 
396 |       // Check ledger entries
397 |       const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
398 |       expect(ledgerEntries).toHaveLength(2);
399 | 
400 |       // Check the payment entry (second entry)
401 |       const paymentEntry = ledgerEntries[1];
402 |       expect(paymentEntry.transaction_id).toBe(paymentTransaction.id);
403 |       expect(paymentEntry.balance_before).toBe(200.00);
404 |       expect(paymentEntry.balance_after).toBe(125.00);
405 |       expect(paymentEntry.change_amount).toBe(-75.00); // Negative for credit card payments (debt reduction)
406 |     });
407 | 
408 |     test('should create accurate ledger entries for transfer transactions', async () => {
409 |       // Create initial debt on credit card
410 |       await createTestTransaction(
411 |         testSetup.user.id,
412 |         'expense',
413 |         300.00,
414 |         'Initial debt',
415 |         getTestDate(-1),
416 |         testSetup.creditCardAccount.id,
417 |         testSetup.expenseCategory.id
418 |       );
419 | 
420 |       // Transfer from bank to credit card (payment)
421 |       const transferTransaction = await createTestTransaction(
422 |         testSetup.user.id,
423 |         'transfer',
424 |         150.00,
425 |         'Payment transfer',
426 |         getTestDate(),
427 |         undefined,
428 |         undefined,
429 |         testSetup.bankAccount.id,
430 |         testSetup.creditCardAccount.id
431 |       );
432 | 
433 |       // Check credit card ledger entries
434 |       const ccLedgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
435 |       expect(ccLedgerEntries).toHaveLength(2);
436 | 
437 |       const transferEntry = ccLedgerEntries[1];
438 |       expect(transferEntry.transaction_id).toBe(transferTransaction.id);
439 |       expect(transferEntry.balance_before).toBe(300.00);
440 |       expect(transferEntry.balance_after).toBe(150.00);
441 |       expect(transferEntry.change_amount).toBe(-150.00); // Negative for credit card payments (debt reduction)
442 | 
443 |       // Check bank account ledger entries
444 |       const bankLedgerEntries = await getBalanceLedgerEntries(testSetup.bankAccount.id);
445 |       expect(bankLedgerEntries).toHaveLength(1);
446 | 
447 |       const bankTransferEntry = bankLedgerEntries[0];
448 |       expect(bankTransferEntry.transaction_id).toBe(transferTransaction.id);
449 |       expect(bankTransferEntry.balance_before).toBe(1000.00);
450 |       expect(bankTransferEntry.balance_after).toBe(850.00);
451 |       expect(bankTransferEntry.change_amount).toBe(-150.00);
452 |     });
453 | 
454 |     test('should maintain balance consistency across multiple transactions', async () => {
455 |       const transactions = [
456 |         { type: 'expense' as const, amount: 250.00, desc: 'Purchase 1' },
457 |         { type: 'expense' as const, amount: 75.00, desc: 'Purchase 2' },
458 |         { type: 'income' as const, amount: 100.00, desc: 'Payment 1' },
459 |         { type: 'expense' as const, amount: -25.00, desc: 'Refund' },
460 |         { type: 'income' as const, amount: 50.00, desc: 'Payment 2' },
461 |       ];
462 | 
463 |       let expectedBalance = 0;
464 |       for (const [index, txn] of transactions.entries()) {
465 |         await createTestTransaction(
466 |           testSetup.user.id,
467 |           txn.type,
468 |           txn.amount,
469 |           txn.desc,
470 |           getTestDate(index),
471 |           testSetup.creditCardAccount.id,
472 |           txn.type === 'expense' ? testSetup.expenseCategory.id : testSetup.incomeCategory.id
473 |         );
474 | 
475 |         // Calculate expected balance for credit card
476 |         if (txn.type === 'expense') {
477 |           expectedBalance += txn.amount; // Expenses increase debt
478 |         } else {
479 |           expectedBalance -= txn.amount; // Income/payments decrease debt
480 |         }
481 | 
482 |         // Verify balance after each transaction
483 |         const actualBalance = await getAccountBalance(testSetup.creditCardAccount.id);
484 |         expect(actualBalance).toBe(expectedBalance);
485 |       }
486 | 
487 |       // Final balance should be: 250 + 75 - 100 + (-25) - 50 = 150
488 |       const finalBalance = await getAccountBalance(testSetup.creditCardAccount.id);
489 |       expect(finalBalance).toBe(150.00);
490 | 
491 |       // Verify all ledger entries are consistent
492 |       const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
493 |       expect(ledgerEntries).toHaveLength(5);
494 | 
495 |       // Check that each entry's balance_after matches the next entry's balance_before
496 |       for (let i = 1; i < ledgerEntries.length; i++) {
497 |         expect(ledgerEntries[i].balance_before).toBe(ledgerEntries[i - 1].balance_after);
498 |       }
499 |     });
500 |   });
501 | 
502 |   describe('Edge Cases and Error Handling', () => {
503 |     test('should handle zero amount transactions', async () => {
504 |       // Create zero amount expense
505 |       await createTestTransaction(
506 |         testSetup.user.id,
507 |         'expense',
508 |         0.00,
509 |         'Zero amount transaction',
510 |         getTestDate(),
511 |         testSetup.creditCardAccount.id,
512 |         testSetup.expenseCategory.id
513 |       );
514 | 
515 |       // Balance should remain 0
516 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
517 |       expect(balance).toBe(0.00);
518 | 
519 |       // Should create ledger entry with zero change
520 |       const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
521 |       expect(ledgerEntries).toHaveLength(1);
522 |       expect(ledgerEntries[0].change_amount).toBe(0.00);
523 |     });
524 | 
525 |     test('should handle very small amounts (precision test)', async () => {
526 |       // Create transaction with 2 decimal places
527 |       await createTestTransaction(
528 |         testSetup.user.id,
529 |         'expense',
530 |         10.99,
531 |         'Precision test',
532 |         getTestDate(),
533 |         testSetup.creditCardAccount.id,
534 |         testSetup.expenseCategory.id
535 |       );
536 | 
537 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
538 |       expect(balance).toBe(10.99);
539 |     });
540 | 
541 |     test('should handle very large amounts', async () => {
542 |       // Create transaction with large amount
543 |       const largeAmount = 99999.99;
544 |       await createTestTransaction(
545 |         testSetup.user.id,
546 |         'expense',
547 |         largeAmount,
548 |         'Large amount test',
549 |         getTestDate(),
550 |         testSetup.creditCardAccount.id,
551 |         testSetup.expenseCategory.id
552 |       );
553 | 
554 |       const balance = await getAccountBalance(testSetup.creditCardAccount.id);
555 |       expect(balance).toBe(largeAmount);
556 |     });
557 |   });
558 | });
```

__tests__/setup/globalSetup.js
```
1 | // Global setup that runs once before all test suites
2 | const { createClient } = require('@supabase/supabase-js');
3 | 
4 | module.exports = async function globalSetup() {
5 |   console.log('🚀 Setting up test environment...');
6 |   
7 |   // Ensure we have test environment variables
8 |   if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
9 |     console.warn('⚠️  Missing Supabase environment variables for testing');
10 |     console.warn('   Make sure to set up test environment variables');
11 |   }
12 |   
13 |   // Store test configuration globally
14 |   globalThis.__TEST_CONFIG__ = {
15 |     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
16 |     supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
17 |     supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
18 |   };
19 |   
20 |   console.log('✅ Test environment setup complete');
21 | };
```

__tests__/setup/globalTeardown.js
```
1 | // Global teardown that runs once after all test suites
2 | module.exports = async function globalTeardown() {
3 |   console.log('🧹 Cleaning up test environment...');
4 |   
5 |   // Clean up any global resources
6 |   if (globalThis.__TEST_CONFIG__) {
7 |     delete globalThis.__TEST_CONFIG__;
8 |   }
9 |   
10 |   console.log('✅ Test environment cleanup complete');
11 | };
```

__tests__/utils/testDatabase.ts
```
1 | import { createClient } from '@supabase/supabase-js';
2 | import type { Database } from '@/types/database';
3 | 
4 | // Test database client with service role key for admin operations
5 | let testClient: ReturnType<typeof createClient<Database>> | null = null;
6 | 
7 | export function getTestClient() {
8 |   if (!testClient) {
9 |     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
10 |     const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
11 |     
12 |     if (!supabaseUrl || !serviceRoleKey) {
13 |       throw new Error(
14 |         'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
15 |       );
16 |     }
17 |     
18 |     testClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
19 |       auth: {
20 |         autoRefreshToken: false,
21 |         persistSession: false
22 |       }
23 |     });
24 |   }
25 |   
26 |   return testClient;
27 | }
28 | 
29 | // Test user management
30 | export async function createTestUser(email: string, password: string = 'TestPassword123!') {
31 |   const client = getTestClient();
32 |   
33 |   const { data, error } = await client.auth.admin.createUser({
34 |     email,
35 |     password,
36 |     email_confirm: true
37 |   });
38 |   
39 |   if (error) {
40 |     throw new Error(`Failed to create test user: ${error.message}`);
41 |   }
42 |   
43 |   return data.user;
44 | }
45 | 
46 | export async function deleteTestUser(userId: string) {
47 |   const client = getTestClient();
48 |   
49 |   const { error } = await client.auth.admin.deleteUser(userId);
50 |   
51 |   if (error) {
52 |     throw new Error(`Failed to delete test user: ${error.message}`);
53 |   }
54 | }
55 | 
56 | // Test data cleanup utilities
57 | export async function cleanupTestData(userId: string) {
58 |   const client = getTestClient();
59 |   
60 |   try {
61 |     // First get account IDs for this user
62 |     const { data: accounts } = await client
63 |       .from('accounts')
64 |       .select('id')
65 |       .eq('user_id', userId);
66 |     
67 |     if (accounts && accounts.length > 0) {
68 |       const accountIds = accounts.map(account => account.id);
69 |       
70 |       // Delete balance ledger entries for these accounts
71 |       await client
72 |         .from('balance_ledger')
73 |         .delete()
74 |         .in('account_id', accountIds);
75 |     }
76 |     
77 |     // Delete in reverse dependency order
78 |     await client.from('transactions').delete().eq('user_id', userId);
79 |     await client.from('categories').delete().eq('user_id', userId);
80 |     await client.from('accounts').delete().eq('user_id', userId);
81 |     await client.from('user_settings').delete().eq('user_id', userId);
82 |     
83 |     console.log(`✅ Cleaned up test data for user: ${userId}`);
84 |   } catch (error) {
85 |     console.error(`❌ Failed to cleanup test data for user ${userId}:`, error);
86 |     throw error;
87 |   }
88 | }
89 | 
90 | // Test account creation
91 | export async function createTestAccount(
92 |   userId: string, 
93 |   name: string, 
94 |   type: 'bank_account' | 'credit_card' | 'investment_account',
95 |   initialBalance: number = 0
96 | ) {
97 |   const client = getTestClient();
98 |   
99 |   const { data, error } = await client
100 |     .from('accounts')
101 |     .insert({
102 |       user_id: userId,
103 |       name,
104 |       type,
105 |       initial_balance: initialBalance,
106 |       current_balance: initialBalance
107 |     })
108 |     .select()
109 |     .single();
110 |     
111 |   if (error) {
112 |     throw new Error(`Failed to create test account: ${error.message}`);
113 |   }
114 |   
115 |   return data;
116 | }
117 | 
118 | // Test category creation
119 | export async function createTestCategory(
120 |   userId: string,
121 |   name: string,
122 |   type: 'expense' | 'income' | 'investment',
123 |   budgetAmount?: number,
124 |   budgetFrequency?: 'weekly' | 'monthly' | 'one_time'
125 | ) {
126 |   const client = getTestClient();
127 |   
128 |   const { data, error } = await client
129 |     .from('categories')
130 |     .insert({
131 |       user_id: userId,
132 |       name,
133 |       type,
134 |       budget_amount: budgetAmount,
135 |       budget_frequency: budgetFrequency
136 |     })
137 |     .select()
138 |     .single();
139 |     
140 |   if (error) {
141 |     throw new Error(`Failed to create test category: ${error.message}`);
142 |   }
143 |   
144 |   return data;
145 | }
146 | 
147 | // Test transaction creation
148 | export async function createTestTransaction(
149 |   userId: string,
150 |   type: 'income' | 'expense' | 'transfer',
151 |   amount: number,
152 |   description: string,
153 |   transactionDate: string,
154 |   accountId?: string,
155 |   categoryId?: string,
156 |   fromAccountId?: string,
157 |   toAccountId?: string
158 | ) {
159 |   const client = getTestClient();
160 |   
161 |   const transactionData: any = {
162 |     user_id: userId,
163 |     type,
164 |     amount,
165 |     description,
166 |     transaction_date: transactionDate
167 |   };
168 |   
169 |   if (type === 'transfer') {
170 |     transactionData.from_account_id = fromAccountId;
171 |     transactionData.to_account_id = toAccountId;
172 |   } else {
173 |     transactionData.account_id = accountId;
174 |     transactionData.category_id = categoryId;
175 |   }
176 |   
177 |   const { data, error } = await client
178 |     .from('transactions')
179 |     .insert(transactionData)
180 |     .select()
181 |     .single();
182 |     
183 |   if (error) {
184 |     throw new Error(`Failed to create test transaction: ${error.message}`);
185 |   }
186 |   
187 |   return data;
188 | }
189 | 
190 | // Get account balance
191 | export async function getAccountBalance(accountId: string) {
192 |   const client = getTestClient();
193 |   
194 |   const { data, error } = await client
195 |     .from('accounts')
196 |     .select('current_balance')
197 |     .eq('id', accountId)
198 |     .single();
199 |     
200 |   if (error) {
201 |     throw new Error(`Failed to get account balance: ${error.message}`);
202 |   }
203 |   
204 |   return data.current_balance;
205 | }
206 | 
207 | // Get balance ledger entries
208 | export async function getBalanceLedgerEntries(accountId: string) {
209 |   const client = getTestClient();
210 |   
211 |   const { data, error } = await client
212 |     .from('balance_ledger')
213 |     .select('*')
214 |     .eq('account_id', accountId)
215 |     .order('created_at', { ascending: true });
216 |     
217 |   if (error) {
218 |     throw new Error(`Failed to get balance ledger entries: ${error.message}`);
219 |   }
220 |   
221 |   return data;
222 | }
```

__tests__/utils/testSetup.ts
```
1 | import { 
2 |   createTestUser, 
3 |   deleteTestUser, 
4 |   cleanupTestData,
5 |   createTestAccount,
6 |   createTestCategory
7 | } from './testDatabase';
8 | 
9 | export interface TestUser {
10 |   id: string;
11 |   email: string;
12 |   cleanup: () => Promise<void>;
13 | }
14 | 
15 | export interface TestSetup {
16 |   user: TestUser;
17 |   bankAccount: any;
18 |   creditCardAccount: any;
19 |   expenseCategory: any;
20 |   incomeCategory: any;
21 |   cleanup: () => Promise<void>;
22 | }
23 | 
24 | /**
25 |  * Creates a test user with a unique email
26 |  */
27 | export async function setupTestUser(namePrefix: string = 'test'): Promise<TestUser> {
28 |   const timestamp = Date.now();
29 |   const randomId = Math.random().toString(36).substring(7);
30 |   const email = `${namePrefix}_${timestamp}_${randomId}@test.com`;
31 |   
32 |   const user = await createTestUser(email);
33 |   
34 |   return {
35 |     id: user.id,
36 |     email: user.email!,
37 |     cleanup: async () => {
38 |       await cleanupTestData(user.id);
39 |       await deleteTestUser(user.id);
40 |     }
41 |   };
42 | }
43 | 
44 | /**
45 |  * Creates a complete test setup with user, accounts, and categories
46 |  */
47 | export async function setupCreditCardTest(): Promise<TestSetup> {
48 |   const user = await setupTestUser('cctest');
49 |   
50 |   try {
51 |     // Create test accounts
52 |     const bankAccount = await createTestAccount(
53 |       user.id,
54 |       'Test Bank Account',
55 |       'bank_account',
56 |       1000.00
57 |     );
58 |     
59 |     const creditCardAccount = await createTestAccount(
60 |       user.id,
61 |       'Test Credit Card',
62 |       'credit_card',
63 |       0.00 // Start with no debt
64 |     );
65 |     
66 |     // Create test categories
67 |     const expenseCategory = await createTestCategory(
68 |       user.id,
69 |       'Test Expenses',
70 |       'expense'
71 |     );
72 |     
73 |     const incomeCategory = await createTestCategory(
74 |       user.id,
75 |       'Test Income',
76 |       'income'
77 |     );
78 |     
79 |     return {
80 |       user,
81 |       bankAccount,
82 |       creditCardAccount,
83 |       expenseCategory,
84 |       incomeCategory,
85 |       cleanup: async () => {
86 |         await user.cleanup();
87 |       }
88 |     };
89 |   } catch (error) {
90 |     // Clean up user if setup fails
91 |     await user.cleanup();
92 |     throw error;
93 |   }
94 | }
95 | 
96 | /**
97 |  * Helper to wait for a short delay (useful for timing-sensitive tests)
98 |  */
99 | export function waitMs(ms: number): Promise<void> {
100 |   return new Promise(resolve => setTimeout(resolve, ms));
101 | }
102 | 
103 | /**
104 |  * Generates a test transaction date (today by default)
105 |  */
106 | export function getTestDate(daysFromToday: number = 0): string {
107 |   const date = new Date();
108 |   date.setDate(date.getDate() + daysFromToday);
109 |   return date.toISOString().split('T')[0]; // YYYY-MM-DD format
110 | }
```

app/(pages)/landing-page.tsx
```
1 | import Link from "next/link"
2 | import { Button } from "@/components/ui/button"
3 | import { createClient } from "@/lib/supabase/server"
4 | import { redirect } from "next/navigation"
5 | 
6 | export default async function LandingPage() {
7 |   // SSR: Check session
8 |   const supabase = await createClient()
9 |   const {
10 |     data: { user },
11 |   } = await supabase.auth.getUser()
12 | 
13 |   async function handleLogout() {
14 |     "use server"
15 |     const supabase = await createClient()
16 |     await supabase.auth.signOut()
17 |     redirect("/")
18 |   }
19 | 
20 |   return (
21 |     <div className="min-h-screen flex flex-col bg-white">
22 |       {/* Navbar */}
23 |       <nav className="flex items-center justify-between px-8 py-6 border-b">
24 |         <div className="text-2xl font-bold text-primary">Noka</div>
25 |         <div className="flex gap-4">
26 |           {user ? (
27 |             <>
28 |               <Link href="/dashboard">
29 |                 <Button variant="outline">Go to App</Button>
30 |               </Link>
31 |               <form action={handleLogout}>
32 |                 <Button type="submit" variant="destructive">Logout</Button>
33 |               </form>
34 |             </>
35 |           ) : (
36 |             <>
37 |               <Link href="/auth/login">
38 |                 <Button variant="outline">Login</Button>
39 |               </Link>
40 |               <Link href="/auth/register">
41 |                 <Button>Sign Up</Button>
42 |               </Link>
43 |             </>
44 |           )}
45 |         </div>
46 |       </nav>
47 |       {/* Hero Section */}
48 |       <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
49 |         <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 max-w-2xl">
50 |           More Control. Less Stress.
51 |         </h1>
52 |         <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl">
53 |           Noka is a personal finance tracker that helps you track your income, expenses, and savings.
54 |         </p>
55 |         <Link href="/auth/register">
56 |           <Button size="lg" className="text-lg px-8 py-6">Try Now</Button>
57 |         </Link>
58 |       </main>
59 |     </div>
60 |   )
61 | } 
```

components/auth/GoogleSignInButton.tsx
```
1 | /**
2 |  * GoogleSignInButton
3 |  *
4 |  * Accessible, responsive Google SSO button following Google branding guidelines.
5 |  * Integrates with useGoogleSignIn for loading and error state management.
6 |  * - Uses shadcn/ui Button for accessibility and keyboard navigation
7 |  * - aria-disabled is set when loading/disabled
8 |  * - Focus ring for keyboard users
9 |  * - Screen reader label for context
10 |  * - Responsive: full width, icon and text scale on mobile
11 |  */
12 | import { Button } from '@/components/ui/button';
13 | import * as React from 'react';
14 | import { useGoogleSignIn } from '@/hooks/use-google-sign-in';
15 | 
16 | // Official Google 'G' SVG logo component
17 | const GoogleLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
18 |   <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48" {...props}>
19 |     <g>
20 |       <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
21 |       <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
22 |       <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
23 |       <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
24 |       <path fill="none" d="M0 0h48v48H0z"></path>
25 |     </g>
26 |   </svg>
27 | );
28 | 
29 | interface GoogleSignInButtonProps extends React.ComponentPropsWithoutRef<'button'> {
30 |   className?: string;
31 |   style?: React.CSSProperties;
32 |   children?: React.ReactNode;
33 | }
34 | 
35 | export function GoogleSignInButton({
36 |   className,
37 |   style,
38 |   children,
39 |   ...props
40 | }: GoogleSignInButtonProps) {
41 |   const { signIn, isLoading, error } = useGoogleSignIn();
42 | 
43 |   return (
44 |     <div className="w-full">
45 |       <Button
46 |         variant="outline"
47 |         onClick={signIn}
48 |         disabled={isLoading}
49 |         aria-disabled={isLoading}
50 |         className={`w-full flex items-center justify-center bg-white text-[#1F1F1F] border border-[#747775] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-70 text-base md:text-base sm:text-sm ${className || ''}`}
51 |         style={{
52 |           paddingTop: '11px',
53 |           paddingBottom: '11px',
54 |           paddingLeft: '12px',
55 |           paddingRight: '12px',
56 |           minHeight: '40px',
57 |           fontFamily: 'Roboto, Arial, sans-serif',
58 |           ...style
59 |         }}
60 |         {...props}
61 |       >
62 |         <span className="sr-only">Sign in with Google</span>
63 |         <GoogleLogo className="mr-[10px] flex-shrink-0" width={18} height={18} />
64 |         <span className="truncate">{isLoading ? 'Processing...' : children || 'Continue with Google'}</span>
65 |       </Button>
66 |       {error && (
67 |         <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">
68 |           {error}
69 |         </div>
70 |       )}
71 |     </div>
72 |   );
73 | } 
```

app/dashboard/page.tsx
```
1 | import { createClient } from '@/lib/supabase/server';
2 | import { redirect } from 'next/navigation';
3 | 
4 | export default async function DashboardPage() {
5 |   const supabase = await createClient();
6 |   const { data: { user } } = await supabase.auth.getUser();
7 |   if (!user) {
8 |     redirect('/auth/login');
9 |   }
10 |   return <div className="p-8">Welcome, {user.email}!</div>;
11 | } 
```

lib/supabase/client.ts
```
1 | import { createBrowserClient } from '@supabase/ssr'
2 | 
3 | export function createClient() {
4 |   return createBrowserClient(
5 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
6 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
7 |   )
8 | } 
```

lib/supabase/server.ts
```
1 | import { createServerClient } from '@supabase/ssr'
2 | import { cookies } from 'next/headers'
3 | 
4 | export async function createClient() {
5 |   const cookieStore = await cookies()
6 | 
7 |   return createServerClient(
8 |     process.env.NEXT_PUBLIC_SUPABASE_URL!,
9 |     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
10 |     {
11 |       cookies: {
12 |         getAll() {
13 |           return cookieStore.getAll()
14 |         },
15 |         setAll(cookiesToSet) {
16 |           try {
17 |             cookiesToSet.forEach(({ name, value, options }) =>
18 |               cookieStore.set(name, value, options)
19 |             )
20 |           } catch {
21 |             // The `setAll` method was called from a Server Component.
22 |             // This can be ignored if you have middleware refreshing
23 |             // user sessions.
24 |           }
25 |         },
26 |       },
27 |     }
28 |   )
29 | } 
```

components/ui/accordion.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as AccordionPrimitive from "@radix-ui/react-accordion"
5 | import { ChevronDownIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Accordion({
10 |   ...props
11 | }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
12 |   return <AccordionPrimitive.Root data-slot="accordion" {...props} />
13 | }
14 | 
15 | function AccordionItem({
16 |   className,
17 |   ...props
18 | }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
19 |   return (
20 |     <AccordionPrimitive.Item
21 |       data-slot="accordion-item"
22 |       className={cn("border-b last:border-b-0", className)}
23 |       {...props}
24 |     />
25 |   )
26 | }
27 | 
28 | function AccordionTrigger({
29 |   className,
30 |   children,
31 |   ...props
32 | }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
33 |   return (
34 |     <AccordionPrimitive.Header className="flex">
35 |       <AccordionPrimitive.Trigger
36 |         data-slot="accordion-trigger"
37 |         className={cn(
38 |           "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
39 |           className
40 |         )}
41 |         {...props}
42 |       >
43 |         {children}
44 |         <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
45 |       </AccordionPrimitive.Trigger>
46 |     </AccordionPrimitive.Header>
47 |   )
48 | }
49 | 
50 | function AccordionContent({
51 |   className,
52 |   children,
53 |   ...props
54 | }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
55 |   return (
56 |     <AccordionPrimitive.Content
57 |       data-slot="accordion-content"
58 |       className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
59 |       {...props}
60 |     >
61 |       <div className={cn("pt-0 pb-4", className)}>{children}</div>
62 |     </AccordionPrimitive.Content>
63 |   )
64 | }
65 | 
66 | export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

components/ui/alert-dialog.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
5 | 
6 | import { cn } from "@/lib/utils"
7 | import { buttonVariants } from "@/components/ui/button"
8 | 
9 | function AlertDialog({
10 |   ...props
11 | }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
12 |   return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
13 | }
14 | 
15 | function AlertDialogTrigger({
16 |   ...props
17 | }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
18 |   return (
19 |     <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
20 |   )
21 | }
22 | 
23 | function AlertDialogPortal({
24 |   ...props
25 | }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
26 |   return (
27 |     <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
28 |   )
29 | }
30 | 
31 | function AlertDialogOverlay({
32 |   className,
33 |   ...props
34 | }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
35 |   return (
36 |     <AlertDialogPrimitive.Overlay
37 |       data-slot="alert-dialog-overlay"
38 |       className={cn(
39 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
40 |         className
41 |       )}
42 |       {...props}
43 |     />
44 |   )
45 | }
46 | 
47 | function AlertDialogContent({
48 |   className,
49 |   ...props
50 | }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
51 |   return (
52 |     <AlertDialogPortal>
53 |       <AlertDialogOverlay />
54 |       <AlertDialogPrimitive.Content
55 |         data-slot="alert-dialog-content"
56 |         className={cn(
57 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
58 |           className
59 |         )}
60 |         {...props}
61 |       />
62 |     </AlertDialogPortal>
63 |   )
64 | }
65 | 
66 | function AlertDialogHeader({
67 |   className,
68 |   ...props
69 | }: React.ComponentProps<"div">) {
70 |   return (
71 |     <div
72 |       data-slot="alert-dialog-header"
73 |       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
74 |       {...props}
75 |     />
76 |   )
77 | }
78 | 
79 | function AlertDialogFooter({
80 |   className,
81 |   ...props
82 | }: React.ComponentProps<"div">) {
83 |   return (
84 |     <div
85 |       data-slot="alert-dialog-footer"
86 |       className={cn(
87 |         "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
88 |         className
89 |       )}
90 |       {...props}
91 |     />
92 |   )
93 | }
94 | 
95 | function AlertDialogTitle({
96 |   className,
97 |   ...props
98 | }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
99 |   return (
100 |     <AlertDialogPrimitive.Title
101 |       data-slot="alert-dialog-title"
102 |       className={cn("text-lg font-semibold", className)}
103 |       {...props}
104 |     />
105 |   )
106 | }
107 | 
108 | function AlertDialogDescription({
109 |   className,
110 |   ...props
111 | }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
112 |   return (
113 |     <AlertDialogPrimitive.Description
114 |       data-slot="alert-dialog-description"
115 |       className={cn("text-muted-foreground text-sm", className)}
116 |       {...props}
117 |     />
118 |   )
119 | }
120 | 
121 | function AlertDialogAction({
122 |   className,
123 |   ...props
124 | }: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
125 |   return (
126 |     <AlertDialogPrimitive.Action
127 |       className={cn(buttonVariants(), className)}
128 |       {...props}
129 |     />
130 |   )
131 | }
132 | 
133 | function AlertDialogCancel({
134 |   className,
135 |   ...props
136 | }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
137 |   return (
138 |     <AlertDialogPrimitive.Cancel
139 |       className={cn(buttonVariants({ variant: "outline" }), className)}
140 |       {...props}
141 |     />
142 |   )
143 | }
144 | 
145 | export {
146 |   AlertDialog,
147 |   AlertDialogPortal,
148 |   AlertDialogOverlay,
149 |   AlertDialogTrigger,
150 |   AlertDialogContent,
151 |   AlertDialogHeader,
152 |   AlertDialogFooter,
153 |   AlertDialogTitle,
154 |   AlertDialogDescription,
155 |   AlertDialogAction,
156 |   AlertDialogCancel,
157 | }
```

components/ui/alert.tsx
```
1 | import * as React from "react"
2 | import { cva, type VariantProps } from "class-variance-authority"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | const alertVariants = cva(
7 |   "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
8 |   {
9 |     variants: {
10 |       variant: {
11 |         default: "bg-card text-card-foreground",
12 |         destructive:
13 |           "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
14 |       },
15 |     },
16 |     defaultVariants: {
17 |       variant: "default",
18 |     },
19 |   }
20 | )
21 | 
22 | function Alert({
23 |   className,
24 |   variant,
25 |   ...props
26 | }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
27 |   return (
28 |     <div
29 |       data-slot="alert"
30 |       role="alert"
31 |       className={cn(alertVariants({ variant }), className)}
32 |       {...props}
33 |     />
34 |   )
35 | }
36 | 
37 | function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
38 |   return (
39 |     <div
40 |       data-slot="alert-title"
41 |       className={cn(
42 |         "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
43 |         className
44 |       )}
45 |       {...props}
46 |     />
47 |   )
48 | }
49 | 
50 | function AlertDescription({
51 |   className,
52 |   ...props
53 | }: React.ComponentProps<"div">) {
54 |   return (
55 |     <div
56 |       data-slot="alert-description"
57 |       className={cn(
58 |         "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
59 |         className
60 |       )}
61 |       {...props}
62 |     />
63 |   )
64 | }
65 | 
66 | export { Alert, AlertTitle, AlertDescription }
```

components/ui/aspect-ratio.tsx
```
1 | "use client"
2 | 
3 | import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
4 | 
5 | function AspectRatio({
6 |   ...props
7 | }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
8 |   return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
9 | }
10 | 
11 | export { AspectRatio }
```

components/ui/avatar.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as AvatarPrimitive from "@radix-ui/react-avatar"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Avatar({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
12 |   return (
13 |     <AvatarPrimitive.Root
14 |       data-slot="avatar"
15 |       className={cn(
16 |         "relative flex size-8 shrink-0 overflow-hidden rounded-full",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | function AvatarImage({
25 |   className,
26 |   ...props
27 | }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
28 |   return (
29 |     <AvatarPrimitive.Image
30 |       data-slot="avatar-image"
31 |       className={cn("aspect-square size-full", className)}
32 |       {...props}
33 |     />
34 |   )
35 | }
36 | 
37 | function AvatarFallback({
38 |   className,
39 |   ...props
40 | }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
41 |   return (
42 |     <AvatarPrimitive.Fallback
43 |       data-slot="avatar-fallback"
44 |       className={cn(
45 |         "bg-muted flex size-full items-center justify-center rounded-full",
46 |         className
47 |       )}
48 |       {...props}
49 |     />
50 |   )
51 | }
52 | 
53 | export { Avatar, AvatarImage, AvatarFallback }
```

components/ui/badge.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const badgeVariants = cva(
8 |   "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
14 |         secondary:
15 |           "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
16 |         destructive:
17 |           "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
18 |         outline:
19 |           "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
20 |       },
21 |     },
22 |     defaultVariants: {
23 |       variant: "default",
24 |     },
25 |   }
26 | )
27 | 
28 | function Badge({
29 |   className,
30 |   variant,
31 |   asChild = false,
32 |   ...props
33 | }: React.ComponentProps<"span"> &
34 |   VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
35 |   const Comp = asChild ? Slot : "span"
36 | 
37 |   return (
38 |     <Comp
39 |       data-slot="badge"
40 |       className={cn(badgeVariants({ variant }), className)}
41 |       {...props}
42 |     />
43 |   )
44 | }
45 | 
46 | export { Badge, badgeVariants }
```

components/ui/breadcrumb.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { ChevronRight, MoreHorizontal } from "lucide-react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
8 |   return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
9 | }
10 | 
11 | function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
12 |   return (
13 |     <ol
14 |       data-slot="breadcrumb-list"
15 |       className={cn(
16 |         "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
25 |   return (
26 |     <li
27 |       data-slot="breadcrumb-item"
28 |       className={cn("inline-flex items-center gap-1.5", className)}
29 |       {...props}
30 |     />
31 |   )
32 | }
33 | 
34 | function BreadcrumbLink({
35 |   asChild,
36 |   className,
37 |   ...props
38 | }: React.ComponentProps<"a"> & {
39 |   asChild?: boolean
40 | }) {
41 |   const Comp = asChild ? Slot : "a"
42 | 
43 |   return (
44 |     <Comp
45 |       data-slot="breadcrumb-link"
46 |       className={cn("hover:text-foreground transition-colors", className)}
47 |       {...props}
48 |     />
49 |   )
50 | }
51 | 
52 | function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
53 |   return (
54 |     <span
55 |       data-slot="breadcrumb-page"
56 |       role="link"
57 |       aria-disabled="true"
58 |       aria-current="page"
59 |       className={cn("text-foreground font-normal", className)}
60 |       {...props}
61 |     />
62 |   )
63 | }
64 | 
65 | function BreadcrumbSeparator({
66 |   children,
67 |   className,
68 |   ...props
69 | }: React.ComponentProps<"li">) {
70 |   return (
71 |     <li
72 |       data-slot="breadcrumb-separator"
73 |       role="presentation"
74 |       aria-hidden="true"
75 |       className={cn("[&>svg]:size-3.5", className)}
76 |       {...props}
77 |     >
78 |       {children ?? <ChevronRight />}
79 |     </li>
80 |   )
81 | }
82 | 
83 | function BreadcrumbEllipsis({
84 |   className,
85 |   ...props
86 | }: React.ComponentProps<"span">) {
87 |   return (
88 |     <span
89 |       data-slot="breadcrumb-ellipsis"
90 |       role="presentation"
91 |       aria-hidden="true"
92 |       className={cn("flex size-9 items-center justify-center", className)}
93 |       {...props}
94 |     >
95 |       <MoreHorizontal className="size-4" />
96 |       <span className="sr-only">More</span>
97 |     </span>
98 |   )
99 | }
100 | 
101 | export {
102 |   Breadcrumb,
103 |   BreadcrumbList,
104 |   BreadcrumbItem,
105 |   BreadcrumbLink,
106 |   BreadcrumbPage,
107 |   BreadcrumbSeparator,
108 |   BreadcrumbEllipsis,
109 | }
```

components/ui/button.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const buttonVariants = cva(
8 |   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
14 |         destructive:
15 |           "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
16 |         outline:
17 |           "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
18 |         secondary:
19 |           "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
20 |         ghost:
21 |           "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
22 |         link: "text-primary underline-offset-4 hover:underline",
23 |       },
24 |       size: {
25 |         default: "h-9 px-4 py-2 has-[>svg]:px-3",
26 |         sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
27 |         lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
28 |         icon: "size-9",
29 |       },
30 |     },
31 |     defaultVariants: {
32 |       variant: "default",
33 |       size: "default",
34 |     },
35 |   }
36 | )
37 | 
38 | function Button({
39 |   className,
40 |   variant,
41 |   size,
42 |   asChild = false,
43 |   ...props
44 | }: React.ComponentProps<"button"> &
45 |   VariantProps<typeof buttonVariants> & {
46 |     asChild?: boolean
47 |   }) {
48 |   const Comp = asChild ? Slot : "button"
49 | 
50 |   return (
51 |     <Comp
52 |       data-slot="button"
53 |       className={cn(buttonVariants({ variant, size, className }))}
54 |       {...props}
55 |     />
56 |   )
57 | }
58 | 
59 | export { Button, buttonVariants }
```

components/ui/card.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Card({ className, ...props }: React.ComponentProps<"div">) {
6 |   return (
7 |     <div
8 |       data-slot="card"
9 |       className={cn(
10 |         "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
11 |         className
12 |       )}
13 |       {...props}
14 |     />
15 |   )
16 | }
17 | 
18 | function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
19 |   return (
20 |     <div
21 |       data-slot="card-header"
22 |       className={cn(
23 |         "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
24 |         className
25 |       )}
26 |       {...props}
27 |     />
28 |   )
29 | }
30 | 
31 | function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
32 |   return (
33 |     <div
34 |       data-slot="card-title"
35 |       className={cn("leading-none font-semibold", className)}
36 |       {...props}
37 |     />
38 |   )
39 | }
40 | 
41 | function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
42 |   return (
43 |     <div
44 |       data-slot="card-description"
45 |       className={cn("text-muted-foreground text-sm", className)}
46 |       {...props}
47 |     />
48 |   )
49 | }
50 | 
51 | function CardAction({ className, ...props }: React.ComponentProps<"div">) {
52 |   return (
53 |     <div
54 |       data-slot="card-action"
55 |       className={cn(
56 |         "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
57 |         className
58 |       )}
59 |       {...props}
60 |     />
61 |   )
62 | }
63 | 
64 | function CardContent({ className, ...props }: React.ComponentProps<"div">) {
65 |   return (
66 |     <div
67 |       data-slot="card-content"
68 |       className={cn("px-6", className)}
69 |       {...props}
70 |     />
71 |   )
72 | }
73 | 
74 | function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
75 |   return (
76 |     <div
77 |       data-slot="card-footer"
78 |       className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
79 |       {...props}
80 |     />
81 |   )
82 | }
83 | 
84 | export {
85 |   Card,
86 |   CardHeader,
87 |   CardFooter,
88 |   CardTitle,
89 |   CardAction,
90 |   CardDescription,
91 |   CardContent,
92 | }
```

components/ui/carousel.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import useEmblaCarousel, {
5 |   type UseEmblaCarouselType,
6 | } from "embla-carousel-react"
7 | import { ArrowLeft, ArrowRight } from "lucide-react"
8 | 
9 | import { cn } from "@/lib/utils"
10 | import { Button } from "@/components/ui/button"
11 | 
12 | type CarouselApi = UseEmblaCarouselType[1]
13 | type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
14 | type CarouselOptions = UseCarouselParameters[0]
15 | type CarouselPlugin = UseCarouselParameters[1]
16 | 
17 | type CarouselProps = {
18 |   opts?: CarouselOptions
19 |   plugins?: CarouselPlugin
20 |   orientation?: "horizontal" | "vertical"
21 |   setApi?: (api: CarouselApi) => void
22 | }
23 | 
24 | type CarouselContextProps = {
25 |   carouselRef: ReturnType<typeof useEmblaCarousel>[0]
26 |   api: ReturnType<typeof useEmblaCarousel>[1]
27 |   scrollPrev: () => void
28 |   scrollNext: () => void
29 |   canScrollPrev: boolean
30 |   canScrollNext: boolean
31 | } & CarouselProps
32 | 
33 | const CarouselContext = React.createContext<CarouselContextProps | null>(null)
34 | 
35 | function useCarousel() {
36 |   const context = React.useContext(CarouselContext)
37 | 
38 |   if (!context) {
39 |     throw new Error("useCarousel must be used within a <Carousel />")
40 |   }
41 | 
42 |   return context
43 | }
44 | 
45 | function Carousel({
46 |   orientation = "horizontal",
47 |   opts,
48 |   setApi,
49 |   plugins,
50 |   className,
51 |   children,
52 |   ...props
53 | }: React.ComponentProps<"div"> & CarouselProps) {
54 |   const [carouselRef, api] = useEmblaCarousel(
55 |     {
56 |       ...opts,
57 |       axis: orientation === "horizontal" ? "x" : "y",
58 |     },
59 |     plugins
60 |   )
61 |   const [canScrollPrev, setCanScrollPrev] = React.useState(false)
62 |   const [canScrollNext, setCanScrollNext] = React.useState(false)
63 | 
64 |   const onSelect = React.useCallback((api: CarouselApi) => {
65 |     if (!api) return
66 |     setCanScrollPrev(api.canScrollPrev())
67 |     setCanScrollNext(api.canScrollNext())
68 |   }, [])
69 | 
70 |   const scrollPrev = React.useCallback(() => {
71 |     api?.scrollPrev()
72 |   }, [api])
73 | 
74 |   const scrollNext = React.useCallback(() => {
75 |     api?.scrollNext()
76 |   }, [api])
77 | 
78 |   const handleKeyDown = React.useCallback(
79 |     (event: React.KeyboardEvent<HTMLDivElement>) => {
80 |       if (event.key === "ArrowLeft") {
81 |         event.preventDefault()
82 |         scrollPrev()
83 |       } else if (event.key === "ArrowRight") {
84 |         event.preventDefault()
85 |         scrollNext()
86 |       }
87 |     },
88 |     [scrollPrev, scrollNext]
89 |   )
90 | 
91 |   React.useEffect(() => {
92 |     if (!api || !setApi) return
93 |     setApi(api)
94 |   }, [api, setApi])
95 | 
96 |   React.useEffect(() => {
97 |     if (!api) return
98 |     onSelect(api)
99 |     api.on("reInit", onSelect)
100 |     api.on("select", onSelect)
101 | 
102 |     return () => {
103 |       api?.off("select", onSelect)
104 |     }
105 |   }, [api, onSelect])
106 | 
107 |   return (
108 |     <CarouselContext.Provider
109 |       value={{
110 |         carouselRef,
111 |         api: api,
112 |         opts,
113 |         orientation:
114 |           orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
115 |         scrollPrev,
116 |         scrollNext,
117 |         canScrollPrev,
118 |         canScrollNext,
119 |       }}
120 |     >
121 |       <div
122 |         onKeyDownCapture={handleKeyDown}
123 |         className={cn("relative", className)}
124 |         role="region"
125 |         aria-roledescription="carousel"
126 |         data-slot="carousel"
127 |         {...props}
128 |       >
129 |         {children}
130 |       </div>
131 |     </CarouselContext.Provider>
132 |   )
133 | }
134 | 
135 | function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
136 |   const { carouselRef, orientation } = useCarousel()
137 | 
138 |   return (
139 |     <div
140 |       ref={carouselRef}
141 |       className="overflow-hidden"
142 |       data-slot="carousel-content"
143 |     >
144 |       <div
145 |         className={cn(
146 |           "flex",
147 |           orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
148 |           className
149 |         )}
150 |         {...props}
151 |       />
152 |     </div>
153 |   )
154 | }
155 | 
156 | function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
157 |   const { orientation } = useCarousel()
158 | 
159 |   return (
160 |     <div
161 |       role="group"
162 |       aria-roledescription="slide"
163 |       data-slot="carousel-item"
164 |       className={cn(
165 |         "min-w-0 shrink-0 grow-0 basis-full",
166 |         orientation === "horizontal" ? "pl-4" : "pt-4",
167 |         className
168 |       )}
169 |       {...props}
170 |     />
171 |   )
172 | }
173 | 
174 | function CarouselPrevious({
175 |   className,
176 |   variant = "outline",
177 |   size = "icon",
178 |   ...props
179 | }: React.ComponentProps<typeof Button>) {
180 |   const { orientation, scrollPrev, canScrollPrev } = useCarousel()
181 | 
182 |   return (
183 |     <Button
184 |       data-slot="carousel-previous"
185 |       variant={variant}
186 |       size={size}
187 |       className={cn(
188 |         "absolute size-8 rounded-full",
189 |         orientation === "horizontal"
190 |           ? "top-1/2 -left-12 -translate-y-1/2"
191 |           : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
192 |         className
193 |       )}
194 |       disabled={!canScrollPrev}
195 |       onClick={scrollPrev}
196 |       {...props}
197 |     >
198 |       <ArrowLeft />
199 |       <span className="sr-only">Previous slide</span>
200 |     </Button>
201 |   )
202 | }
203 | 
204 | function CarouselNext({
205 |   className,
206 |   variant = "outline",
207 |   size = "icon",
208 |   ...props
209 | }: React.ComponentProps<typeof Button>) {
210 |   const { orientation, scrollNext, canScrollNext } = useCarousel()
211 | 
212 |   return (
213 |     <Button
214 |       data-slot="carousel-next"
215 |       variant={variant}
216 |       size={size}
217 |       className={cn(
218 |         "absolute size-8 rounded-full",
219 |         orientation === "horizontal"
220 |           ? "top-1/2 -right-12 -translate-y-1/2"
221 |           : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
222 |         className
223 |       )}
224 |       disabled={!canScrollNext}
225 |       onClick={scrollNext}
226 |       {...props}
227 |     >
228 |       <ArrowRight />
229 |       <span className="sr-only">Next slide</span>
230 |     </Button>
231 |   )
232 | }
233 | 
234 | export {
235 |   type CarouselApi,
236 |   Carousel,
237 |   CarouselContent,
238 |   CarouselItem,
239 |   CarouselPrevious,
240 |   CarouselNext,
241 | }
```

components/ui/chart.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as RechartsPrimitive from "recharts"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | // Format: { THEME_NAME: CSS_SELECTOR }
9 | const THEMES = { light: "", dark: ".dark" } as const
10 | 
11 | export type ChartConfig = {
12 |   [k in string]: {
13 |     label?: React.ReactNode
14 |     icon?: React.ComponentType
15 |   } & (
16 |     | { color?: string; theme?: never }
17 |     | { color?: never; theme: Record<keyof typeof THEMES, string> }
18 |   )
19 | }
20 | 
21 | type ChartContextProps = {
22 |   config: ChartConfig
23 | }
24 | 
25 | const ChartContext = React.createContext<ChartContextProps | null>(null)
26 | 
27 | function useChart() {
28 |   const context = React.useContext(ChartContext)
29 | 
30 |   if (!context) {
31 |     throw new Error("useChart must be used within a <ChartContainer />")
32 |   }
33 | 
34 |   return context
35 | }
36 | 
37 | function ChartContainer({
38 |   id,
39 |   className,
40 |   children,
41 |   config,
42 |   ...props
43 | }: React.ComponentProps<"div"> & {
44 |   config: ChartConfig
45 |   children: React.ComponentProps<
46 |     typeof RechartsPrimitive.ResponsiveContainer
47 |   >["children"]
48 | }) {
49 |   const uniqueId = React.useId()
50 |   const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
51 | 
52 |   return (
53 |     <ChartContext.Provider value={{ config }}>
54 |       <div
55 |         data-slot="chart"
56 |         data-chart={chartId}
57 |         className={cn(
58 |           "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
59 |           className
60 |         )}
61 |         {...props}
62 |       >
63 |         <ChartStyle id={chartId} config={config} />
64 |         <RechartsPrimitive.ResponsiveContainer>
65 |           {children}
66 |         </RechartsPrimitive.ResponsiveContainer>
67 |       </div>
68 |     </ChartContext.Provider>
69 |   )
70 | }
71 | 
72 | const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
73 |   const colorConfig = Object.entries(config).filter(
74 |     ([, config]) => config.theme || config.color
75 |   )
76 | 
77 |   if (!colorConfig.length) {
78 |     return null
79 |   }
80 | 
81 |   return (
82 |     <style
83 |       dangerouslySetInnerHTML={{
84 |         __html: Object.entries(THEMES)
85 |           .map(
86 |             ([theme, prefix]) => `
87 | ${prefix} [data-chart=${id}] {
88 | ${colorConfig
89 |   .map(([key, itemConfig]) => {
90 |     const color =
91 |       itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
92 |       itemConfig.color
93 |     return color ? `  --color-${key}: ${color};` : null
94 |   })
95 |   .join("\n")}
96 | }
97 | `
98 |           )
99 |           .join("\n"),
100 |       }}
101 |     />
102 |   )
103 | }
104 | 
105 | const ChartTooltip = RechartsPrimitive.Tooltip
106 | 
107 | function ChartTooltipContent({
108 |   active,
109 |   payload,
110 |   className,
111 |   indicator = "dot",
112 |   hideLabel = false,
113 |   hideIndicator = false,
114 |   label,
115 |   labelFormatter,
116 |   labelClassName,
117 |   formatter,
118 |   color,
119 |   nameKey,
120 |   labelKey,
121 | }: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
122 |   React.ComponentProps<"div"> & {
123 |     hideLabel?: boolean
124 |     hideIndicator?: boolean
125 |     indicator?: "line" | "dot" | "dashed"
126 |     nameKey?: string
127 |     labelKey?: string
128 |   }) {
129 |   const { config } = useChart()
130 | 
131 |   const tooltipLabel = React.useMemo(() => {
132 |     if (hideLabel || !payload?.length) {
133 |       return null
134 |     }
135 | 
136 |     const [item] = payload
137 |     const key = `${labelKey || item?.dataKey || item?.name || "value"}`
138 |     const itemConfig = getPayloadConfigFromPayload(config, item, key)
139 |     const value =
140 |       !labelKey && typeof label === "string"
141 |         ? config[label as keyof typeof config]?.label || label
142 |         : itemConfig?.label
143 | 
144 |     if (labelFormatter) {
145 |       return (
146 |         <div className={cn("font-medium", labelClassName)}>
147 |           {labelFormatter(value, payload)}
148 |         </div>
149 |       )
150 |     }
151 | 
152 |     if (!value) {
153 |       return null
154 |     }
155 | 
156 |     return <div className={cn("font-medium", labelClassName)}>{value}</div>
157 |   }, [
158 |     label,
159 |     labelFormatter,
160 |     payload,
161 |     hideLabel,
162 |     labelClassName,
163 |     config,
164 |     labelKey,
165 |   ])
166 | 
167 |   if (!active || !payload?.length) {
168 |     return null
169 |   }
170 | 
171 |   const nestLabel = payload.length === 1 && indicator !== "dot"
172 | 
173 |   return (
174 |     <div
175 |       className={cn(
176 |         "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
177 |         className
178 |       )}
179 |     >
180 |       {!nestLabel ? tooltipLabel : null}
181 |       <div className="grid gap-1.5">
182 |         {payload.map((item, index) => {
183 |           const key = `${nameKey || item.name || item.dataKey || "value"}`
184 |           const itemConfig = getPayloadConfigFromPayload(config, item, key)
185 |           const indicatorColor = color || item.payload.fill || item.color
186 | 
187 |           return (
188 |             <div
189 |               key={item.dataKey}
190 |               className={cn(
191 |                 "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
192 |                 indicator === "dot" && "items-center"
193 |               )}
194 |             >
195 |               {formatter && item?.value !== undefined && item.name ? (
196 |                 formatter(item.value, item.name, item, index, item.payload)
197 |               ) : (
198 |                 <>
199 |                   {itemConfig?.icon ? (
200 |                     <itemConfig.icon />
201 |                   ) : (
202 |                     !hideIndicator && (
203 |                       <div
204 |                         className={cn(
205 |                           "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
206 |                           {
207 |                             "h-2.5 w-2.5": indicator === "dot",
208 |                             "w-1": indicator === "line",
209 |                             "w-0 border-[1.5px] border-dashed bg-transparent":
210 |                               indicator === "dashed",
211 |                             "my-0.5": nestLabel && indicator === "dashed",
212 |                           }
213 |                         )}
214 |                         style={
215 |                           {
216 |                             "--color-bg": indicatorColor,
217 |                             "--color-border": indicatorColor,
218 |                           } as React.CSSProperties
219 |                         }
220 |                       />
221 |                     )
222 |                   )}
223 |                   <div
224 |                     className={cn(
225 |                       "flex flex-1 justify-between leading-none",
226 |                       nestLabel ? "items-end" : "items-center"
227 |                     )}
228 |                   >
229 |                     <div className="grid gap-1.5">
230 |                       {nestLabel ? tooltipLabel : null}
231 |                       <span className="text-muted-foreground">
232 |                         {itemConfig?.label || item.name}
233 |                       </span>
234 |                     </div>
235 |                     {item.value && (
236 |                       <span className="text-foreground font-mono font-medium tabular-nums">
237 |                         {item.value.toLocaleString()}
238 |                       </span>
239 |                     )}
240 |                   </div>
241 |                 </>
242 |               )}
243 |             </div>
244 |           )
245 |         })}
246 |       </div>
247 |     </div>
248 |   )
249 | }
250 | 
251 | const ChartLegend = RechartsPrimitive.Legend
252 | 
253 | function ChartLegendContent({
254 |   className,
255 |   hideIcon = false,
256 |   payload,
257 |   verticalAlign = "bottom",
258 |   nameKey,
259 | }: React.ComponentProps<"div"> &
260 |   Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
261 |     hideIcon?: boolean
262 |     nameKey?: string
263 |   }) {
264 |   const { config } = useChart()
265 | 
266 |   if (!payload?.length) {
267 |     return null
268 |   }
269 | 
270 |   return (
271 |     <div
272 |       className={cn(
273 |         "flex items-center justify-center gap-4",
274 |         verticalAlign === "top" ? "pb-3" : "pt-3",
275 |         className
276 |       )}
277 |     >
278 |       {payload.map((item) => {
279 |         const key = `${nameKey || item.dataKey || "value"}`
280 |         const itemConfig = getPayloadConfigFromPayload(config, item, key)
281 | 
282 |         return (
283 |           <div
284 |             key={item.value}
285 |             className={cn(
286 |               "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
287 |             )}
288 |           >
289 |             {itemConfig?.icon && !hideIcon ? (
290 |               <itemConfig.icon />
291 |             ) : (
292 |               <div
293 |                 className="h-2 w-2 shrink-0 rounded-[2px]"
294 |                 style={{
295 |                   backgroundColor: item.color,
296 |                 }}
297 |               />
298 |             )}
299 |             {itemConfig?.label}
300 |           </div>
301 |         )
302 |       })}
303 |     </div>
304 |   )
305 | }
306 | 
307 | // Helper to extract item config from a payload.
308 | function getPayloadConfigFromPayload(
309 |   config: ChartConfig,
310 |   payload: unknown,
311 |   key: string
312 | ) {
313 |   if (typeof payload !== "object" || payload === null) {
314 |     return undefined
315 |   }
316 | 
317 |   const payloadPayload =
318 |     "payload" in payload &&
319 |     typeof payload.payload === "object" &&
320 |     payload.payload !== null
321 |       ? payload.payload
322 |       : undefined
323 | 
324 |   let configLabelKey: string = key
325 | 
326 |   if (
327 |     key in payload &&
328 |     typeof payload[key as keyof typeof payload] === "string"
329 |   ) {
330 |     configLabelKey = payload[key as keyof typeof payload] as string
331 |   } else if (
332 |     payloadPayload &&
333 |     key in payloadPayload &&
334 |     typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
335 |   ) {
336 |     configLabelKey = payloadPayload[
337 |       key as keyof typeof payloadPayload
338 |     ] as string
339 |   }
340 | 
341 |   return configLabelKey in config
342 |     ? config[configLabelKey]
343 |     : config[key as keyof typeof config]
344 | }
345 | 
346 | export {
347 |   ChartContainer,
348 |   ChartTooltip,
349 |   ChartTooltipContent,
350 |   ChartLegend,
351 |   ChartLegendContent,
352 |   ChartStyle,
353 | }
```

components/ui/checkbox.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
5 | import { CheckIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Checkbox({
10 |   className,
11 |   ...props
12 | }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
13 |   return (
14 |     <CheckboxPrimitive.Root
15 |       data-slot="checkbox"
16 |       className={cn(
17 |         "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
18 |         className
19 |       )}
20 |       {...props}
21 |     >
22 |       <CheckboxPrimitive.Indicator
23 |         data-slot="checkbox-indicator"
24 |         className="flex items-center justify-center text-current transition-none"
25 |       >
26 |         <CheckIcon className="size-3.5" />
27 |       </CheckboxPrimitive.Indicator>
28 |     </CheckboxPrimitive.Root>
29 |   )
30 | }
31 | 
32 | export { Checkbox }
```

components/ui/collapsible.tsx
```
1 | "use client"
2 | 
3 | import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
4 | 
5 | function Collapsible({
6 |   ...props
7 | }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
8 |   return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
9 | }
10 | 
11 | function CollapsibleTrigger({
12 |   ...props
13 | }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
14 |   return (
15 |     <CollapsiblePrimitive.CollapsibleTrigger
16 |       data-slot="collapsible-trigger"
17 |       {...props}
18 |     />
19 |   )
20 | }
21 | 
22 | function CollapsibleContent({
23 |   ...props
24 | }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
25 |   return (
26 |     <CollapsiblePrimitive.CollapsibleContent
27 |       data-slot="collapsible-content"
28 |       {...props}
29 |     />
30 |   )
31 | }
32 | 
33 | export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

components/ui/command.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { Command as CommandPrimitive } from "cmdk"
5 | import { SearchIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | import {
9 |   Dialog,
10 |   DialogContent,
11 |   DialogDescription,
12 |   DialogHeader,
13 |   DialogTitle,
14 | } from "@/components/ui/dialog"
15 | 
16 | function Command({
17 |   className,
18 |   ...props
19 | }: React.ComponentProps<typeof CommandPrimitive>) {
20 |   return (
21 |     <CommandPrimitive
22 |       data-slot="command"
23 |       className={cn(
24 |         "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
25 |         className
26 |       )}
27 |       {...props}
28 |     />
29 |   )
30 | }
31 | 
32 | function CommandDialog({
33 |   title = "Command Palette",
34 |   description = "Search for a command to run...",
35 |   children,
36 |   ...props
37 | }: React.ComponentProps<typeof Dialog> & {
38 |   title?: string
39 |   description?: string
40 | }) {
41 |   return (
42 |     <Dialog {...props}>
43 |       <DialogHeader className="sr-only">
44 |         <DialogTitle>{title}</DialogTitle>
45 |         <DialogDescription>{description}</DialogDescription>
46 |       </DialogHeader>
47 |       <DialogContent className="overflow-hidden p-0">
48 |         <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
49 |           {children}
50 |         </Command>
51 |       </DialogContent>
52 |     </Dialog>
53 |   )
54 | }
55 | 
56 | function CommandInput({
57 |   className,
58 |   ...props
59 | }: React.ComponentProps<typeof CommandPrimitive.Input>) {
60 |   return (
61 |     <div
62 |       data-slot="command-input-wrapper"
63 |       className="flex h-9 items-center gap-2 border-b px-3"
64 |     >
65 |       <SearchIcon className="size-4 shrink-0 opacity-50" />
66 |       <CommandPrimitive.Input
67 |         data-slot="command-input"
68 |         className={cn(
69 |           "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
70 |           className
71 |         )}
72 |         {...props}
73 |       />
74 |     </div>
75 |   )
76 | }
77 | 
78 | function CommandList({
79 |   className,
80 |   ...props
81 | }: React.ComponentProps<typeof CommandPrimitive.List>) {
82 |   return (
83 |     <CommandPrimitive.List
84 |       data-slot="command-list"
85 |       className={cn(
86 |         "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
87 |         className
88 |       )}
89 |       {...props}
90 |     />
91 |   )
92 | }
93 | 
94 | function CommandEmpty({
95 |   ...props
96 | }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
97 |   return (
98 |     <CommandPrimitive.Empty
99 |       data-slot="command-empty"
100 |       className="py-6 text-center text-sm"
101 |       {...props}
102 |     />
103 |   )
104 | }
105 | 
106 | function CommandGroup({
107 |   className,
108 |   ...props
109 | }: React.ComponentProps<typeof CommandPrimitive.Group>) {
110 |   return (
111 |     <CommandPrimitive.Group
112 |       data-slot="command-group"
113 |       className={cn(
114 |         "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
115 |         className
116 |       )}
117 |       {...props}
118 |     />
119 |   )
120 | }
121 | 
122 | function CommandSeparator({
123 |   className,
124 |   ...props
125 | }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
126 |   return (
127 |     <CommandPrimitive.Separator
128 |       data-slot="command-separator"
129 |       className={cn("bg-border -mx-1 h-px", className)}
130 |       {...props}
131 |     />
132 |   )
133 | }
134 | 
135 | function CommandItem({
136 |   className,
137 |   ...props
138 | }: React.ComponentProps<typeof CommandPrimitive.Item>) {
139 |   return (
140 |     <CommandPrimitive.Item
141 |       data-slot="command-item"
142 |       className={cn(
143 |         "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
144 |         className
145 |       )}
146 |       {...props}
147 |     />
148 |   )
149 | }
150 | 
151 | function CommandShortcut({
152 |   className,
153 |   ...props
154 | }: React.ComponentProps<"span">) {
155 |   return (
156 |     <span
157 |       data-slot="command-shortcut"
158 |       className={cn(
159 |         "text-muted-foreground ml-auto text-xs tracking-widest",
160 |         className
161 |       )}
162 |       {...props}
163 |     />
164 |   )
165 | }
166 | 
167 | export {
168 |   Command,
169 |   CommandDialog,
170 |   CommandInput,
171 |   CommandList,
172 |   CommandEmpty,
173 |   CommandGroup,
174 |   CommandItem,
175 |   CommandShortcut,
176 |   CommandSeparator,
177 | }
```

components/ui/context-menu.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
5 | import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function ContextMenu({
10 |   ...props
11 | }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
12 |   return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
13 | }
14 | 
15 | function ContextMenuTrigger({
16 |   ...props
17 | }: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
18 |   return (
19 |     <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
20 |   )
21 | }
22 | 
23 | function ContextMenuGroup({
24 |   ...props
25 | }: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
26 |   return (
27 |     <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
28 |   )
29 | }
30 | 
31 | function ContextMenuPortal({
32 |   ...props
33 | }: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
34 |   return (
35 |     <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
36 |   )
37 | }
38 | 
39 | function ContextMenuSub({
40 |   ...props
41 | }: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
42 |   return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
43 | }
44 | 
45 | function ContextMenuRadioGroup({
46 |   ...props
47 | }: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
48 |   return (
49 |     <ContextMenuPrimitive.RadioGroup
50 |       data-slot="context-menu-radio-group"
51 |       {...props}
52 |     />
53 |   )
54 | }
55 | 
56 | function ContextMenuSubTrigger({
57 |   className,
58 |   inset,
59 |   children,
60 |   ...props
61 | }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
62 |   inset?: boolean
63 | }) {
64 |   return (
65 |     <ContextMenuPrimitive.SubTrigger
66 |       data-slot="context-menu-sub-trigger"
67 |       data-inset={inset}
68 |       className={cn(
69 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
70 |         className
71 |       )}
72 |       {...props}
73 |     >
74 |       {children}
75 |       <ChevronRightIcon className="ml-auto" />
76 |     </ContextMenuPrimitive.SubTrigger>
77 |   )
78 | }
79 | 
80 | function ContextMenuSubContent({
81 |   className,
82 |   ...props
83 | }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
84 |   return (
85 |     <ContextMenuPrimitive.SubContent
86 |       data-slot="context-menu-sub-content"
87 |       className={cn(
88 |         "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
89 |         className
90 |       )}
91 |       {...props}
92 |     />
93 |   )
94 | }
95 | 
96 | function ContextMenuContent({
97 |   className,
98 |   ...props
99 | }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
100 |   return (
101 |     <ContextMenuPrimitive.Portal>
102 |       <ContextMenuPrimitive.Content
103 |         data-slot="context-menu-content"
104 |         className={cn(
105 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
106 |           className
107 |         )}
108 |         {...props}
109 |       />
110 |     </ContextMenuPrimitive.Portal>
111 |   )
112 | }
113 | 
114 | function ContextMenuItem({
115 |   className,
116 |   inset,
117 |   variant = "default",
118 |   ...props
119 | }: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
120 |   inset?: boolean
121 |   variant?: "default" | "destructive"
122 | }) {
123 |   return (
124 |     <ContextMenuPrimitive.Item
125 |       data-slot="context-menu-item"
126 |       data-inset={inset}
127 |       data-variant={variant}
128 |       className={cn(
129 |         "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
130 |         className
131 |       )}
132 |       {...props}
133 |     />
134 |   )
135 | }
136 | 
137 | function ContextMenuCheckboxItem({
138 |   className,
139 |   children,
140 |   checked,
141 |   ...props
142 | }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
143 |   return (
144 |     <ContextMenuPrimitive.CheckboxItem
145 |       data-slot="context-menu-checkbox-item"
146 |       className={cn(
147 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
148 |         className
149 |       )}
150 |       checked={checked}
151 |       {...props}
152 |     >
153 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
154 |         <ContextMenuPrimitive.ItemIndicator>
155 |           <CheckIcon className="size-4" />
156 |         </ContextMenuPrimitive.ItemIndicator>
157 |       </span>
158 |       {children}
159 |     </ContextMenuPrimitive.CheckboxItem>
160 |   )
161 | }
162 | 
163 | function ContextMenuRadioItem({
164 |   className,
165 |   children,
166 |   ...props
167 | }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
168 |   return (
169 |     <ContextMenuPrimitive.RadioItem
170 |       data-slot="context-menu-radio-item"
171 |       className={cn(
172 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
173 |         className
174 |       )}
175 |       {...props}
176 |     >
177 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
178 |         <ContextMenuPrimitive.ItemIndicator>
179 |           <CircleIcon className="size-2 fill-current" />
180 |         </ContextMenuPrimitive.ItemIndicator>
181 |       </span>
182 |       {children}
183 |     </ContextMenuPrimitive.RadioItem>
184 |   )
185 | }
186 | 
187 | function ContextMenuLabel({
188 |   className,
189 |   inset,
190 |   ...props
191 | }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
192 |   inset?: boolean
193 | }) {
194 |   return (
195 |     <ContextMenuPrimitive.Label
196 |       data-slot="context-menu-label"
197 |       data-inset={inset}
198 |       className={cn(
199 |         "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
200 |         className
201 |       )}
202 |       {...props}
203 |     />
204 |   )
205 | }
206 | 
207 | function ContextMenuSeparator({
208 |   className,
209 |   ...props
210 | }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
211 |   return (
212 |     <ContextMenuPrimitive.Separator
213 |       data-slot="context-menu-separator"
214 |       className={cn("bg-border -mx-1 my-1 h-px", className)}
215 |       {...props}
216 |     />
217 |   )
218 | }
219 | 
220 | function ContextMenuShortcut({
221 |   className,
222 |   ...props
223 | }: React.ComponentProps<"span">) {
224 |   return (
225 |     <span
226 |       data-slot="context-menu-shortcut"
227 |       className={cn(
228 |         "text-muted-foreground ml-auto text-xs tracking-widest",
229 |         className
230 |       )}
231 |       {...props}
232 |     />
233 |   )
234 | }
235 | 
236 | export {
237 |   ContextMenu,
238 |   ContextMenuTrigger,
239 |   ContextMenuContent,
240 |   ContextMenuItem,
241 |   ContextMenuCheckboxItem,
242 |   ContextMenuRadioItem,
243 |   ContextMenuLabel,
244 |   ContextMenuSeparator,
245 |   ContextMenuShortcut,
246 |   ContextMenuGroup,
247 |   ContextMenuPortal,
248 |   ContextMenuSub,
249 |   ContextMenuSubContent,
250 |   ContextMenuSubTrigger,
251 |   ContextMenuRadioGroup,
252 | }
```

components/ui/dialog.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as DialogPrimitive from "@radix-ui/react-dialog"
5 | import { XIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Dialog({
10 |   ...props
11 | }: React.ComponentProps<typeof DialogPrimitive.Root>) {
12 |   return <DialogPrimitive.Root data-slot="dialog" {...props} />
13 | }
14 | 
15 | function DialogTrigger({
16 |   ...props
17 | }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
18 |   return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
19 | }
20 | 
21 | function DialogPortal({
22 |   ...props
23 | }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
24 |   return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
25 | }
26 | 
27 | function DialogClose({
28 |   ...props
29 | }: React.ComponentProps<typeof DialogPrimitive.Close>) {
30 |   return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
31 | }
32 | 
33 | function DialogOverlay({
34 |   className,
35 |   ...props
36 | }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
37 |   return (
38 |     <DialogPrimitive.Overlay
39 |       data-slot="dialog-overlay"
40 |       className={cn(
41 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
42 |         className
43 |       )}
44 |       {...props}
45 |     />
46 |   )
47 | }
48 | 
49 | function DialogContent({
50 |   className,
51 |   children,
52 |   ...props
53 | }: React.ComponentProps<typeof DialogPrimitive.Content>) {
54 |   return (
55 |     <DialogPortal data-slot="dialog-portal">
56 |       <DialogOverlay />
57 |       <DialogPrimitive.Content
58 |         data-slot="dialog-content"
59 |         className={cn(
60 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
61 |           className
62 |         )}
63 |         {...props}
64 |       >
65 |         {children}
66 |         <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
67 |           <XIcon />
68 |           <span className="sr-only">Close</span>
69 |         </DialogPrimitive.Close>
70 |       </DialogPrimitive.Content>
71 |     </DialogPortal>
72 |   )
73 | }
74 | 
75 | function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
76 |   return (
77 |     <div
78 |       data-slot="dialog-header"
79 |       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
86 |   return (
87 |     <div
88 |       data-slot="dialog-footer"
89 |       className={cn(
90 |         "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
91 |         className
92 |       )}
93 |       {...props}
94 |     />
95 |   )
96 | }
97 | 
98 | function DialogTitle({
99 |   className,
100 |   ...props
101 | }: React.ComponentProps<typeof DialogPrimitive.Title>) {
102 |   return (
103 |     <DialogPrimitive.Title
104 |       data-slot="dialog-title"
105 |       className={cn("text-lg leading-none font-semibold", className)}
106 |       {...props}
107 |     />
108 |   )
109 | }
110 | 
111 | function DialogDescription({
112 |   className,
113 |   ...props
114 | }: React.ComponentProps<typeof DialogPrimitive.Description>) {
115 |   return (
116 |     <DialogPrimitive.Description
117 |       data-slot="dialog-description"
118 |       className={cn("text-muted-foreground text-sm", className)}
119 |       {...props}
120 |     />
121 |   )
122 | }
123 | 
124 | export {
125 |   Dialog,
126 |   DialogClose,
127 |   DialogContent,
128 |   DialogDescription,
129 |   DialogFooter,
130 |   DialogHeader,
131 |   DialogOverlay,
132 |   DialogPortal,
133 |   DialogTitle,
134 |   DialogTrigger,
135 | }
```

components/ui/drawer.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { Drawer as DrawerPrimitive } from "vaul"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Drawer({
9 |   ...props
10 | }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
11 |   return <DrawerPrimitive.Root data-slot="drawer" {...props} />
12 | }
13 | 
14 | function DrawerTrigger({
15 |   ...props
16 | }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
17 |   return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
18 | }
19 | 
20 | function DrawerPortal({
21 |   ...props
22 | }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
23 |   return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
24 | }
25 | 
26 | function DrawerClose({
27 |   ...props
28 | }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
29 |   return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
30 | }
31 | 
32 | function DrawerOverlay({
33 |   className,
34 |   ...props
35 | }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
36 |   return (
37 |     <DrawerPrimitive.Overlay
38 |       data-slot="drawer-overlay"
39 |       className={cn(
40 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
41 |         className
42 |       )}
43 |       {...props}
44 |     />
45 |   )
46 | }
47 | 
48 | function DrawerContent({
49 |   className,
50 |   children,
51 |   ...props
52 | }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
53 |   return (
54 |     <DrawerPortal data-slot="drawer-portal">
55 |       <DrawerOverlay />
56 |       <DrawerPrimitive.Content
57 |         data-slot="drawer-content"
58 |         className={cn(
59 |           "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
60 |           "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
61 |           "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
62 |           "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
63 |           "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
64 |           className
65 |         )}
66 |         {...props}
67 |       >
68 |         <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
69 |         {children}
70 |       </DrawerPrimitive.Content>
71 |     </DrawerPortal>
72 |   )
73 | }
74 | 
75 | function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
76 |   return (
77 |     <div
78 |       data-slot="drawer-header"
79 |       className={cn("flex flex-col gap-1.5 p-4", className)}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
86 |   return (
87 |     <div
88 |       data-slot="drawer-footer"
89 |       className={cn("mt-auto flex flex-col gap-2 p-4", className)}
90 |       {...props}
91 |     />
92 |   )
93 | }
94 | 
95 | function DrawerTitle({
96 |   className,
97 |   ...props
98 | }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
99 |   return (
100 |     <DrawerPrimitive.Title
101 |       data-slot="drawer-title"
102 |       className={cn("text-foreground font-semibold", className)}
103 |       {...props}
104 |     />
105 |   )
106 | }
107 | 
108 | function DrawerDescription({
109 |   className,
110 |   ...props
111 | }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
112 |   return (
113 |     <DrawerPrimitive.Description
114 |       data-slot="drawer-description"
115 |       className={cn("text-muted-foreground text-sm", className)}
116 |       {...props}
117 |     />
118 |   )
119 | }
120 | 
121 | export {
122 |   Drawer,
123 |   DrawerPortal,
124 |   DrawerOverlay,
125 |   DrawerTrigger,
126 |   DrawerClose,
127 |   DrawerContent,
128 |   DrawerHeader,
129 |   DrawerFooter,
130 |   DrawerTitle,
131 |   DrawerDescription,
132 | }
```

components/ui/dropdown-menu.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
5 | import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function DropdownMenu({
10 |   ...props
11 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
12 |   return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
13 | }
14 | 
15 | function DropdownMenuPortal({
16 |   ...props
17 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
18 |   return (
19 |     <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
20 |   )
21 | }
22 | 
23 | function DropdownMenuTrigger({
24 |   ...props
25 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
26 |   return (
27 |     <DropdownMenuPrimitive.Trigger
28 |       data-slot="dropdown-menu-trigger"
29 |       {...props}
30 |     />
31 |   )
32 | }
33 | 
34 | function DropdownMenuContent({
35 |   className,
36 |   sideOffset = 4,
37 |   ...props
38 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
39 |   return (
40 |     <DropdownMenuPrimitive.Portal>
41 |       <DropdownMenuPrimitive.Content
42 |         data-slot="dropdown-menu-content"
43 |         sideOffset={sideOffset}
44 |         className={cn(
45 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
46 |           className
47 |         )}
48 |         {...props}
49 |       />
50 |     </DropdownMenuPrimitive.Portal>
51 |   )
52 | }
53 | 
54 | function DropdownMenuGroup({
55 |   ...props
56 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
57 |   return (
58 |     <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
59 |   )
60 | }
61 | 
62 | function DropdownMenuItem({
63 |   className,
64 |   inset,
65 |   variant = "default",
66 |   ...props
67 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
68 |   inset?: boolean
69 |   variant?: "default" | "destructive"
70 | }) {
71 |   return (
72 |     <DropdownMenuPrimitive.Item
73 |       data-slot="dropdown-menu-item"
74 |       data-inset={inset}
75 |       data-variant={variant}
76 |       className={cn(
77 |         "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
78 |         className
79 |       )}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DropdownMenuCheckboxItem({
86 |   className,
87 |   children,
88 |   checked,
89 |   ...props
90 | }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
91 |   return (
92 |     <DropdownMenuPrimitive.CheckboxItem
93 |       data-slot="dropdown-menu-checkbox-item"
94 |       className={cn(
95 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
96 |         className
97 |       )}
98 |       checked={checked}
99 |       {...props}
100 |     >
101 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
102 |         <DropdownMenuPrimitive.ItemIndicator>
103 |           <CheckIcon className="size-4" />
104 |         </DropdownMenuPrimitive.ItemIndicator>
105 |       </span>
106 |       {children}
107 |     </DropdownMenuPrimitive.CheckboxItem>
108 |   )
109 | }
110 | 
111 | function DropdownMenuRadioGroup({
112 |   ...props
113 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
114 |   return (
115 |     <DropdownMenuPrimitive.RadioGroup
116 |       data-slot="dropdown-menu-radio-group"
117 |       {...props}
118 |     />
119 |   )
120 | }
121 | 
122 | function DropdownMenuRadioItem({
123 |   className,
124 |   children,
125 |   ...props
126 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
127 |   return (
128 |     <DropdownMenuPrimitive.RadioItem
129 |       data-slot="dropdown-menu-radio-item"
130 |       className={cn(
131 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
132 |         className
133 |       )}
134 |       {...props}
135 |     >
136 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
137 |         <DropdownMenuPrimitive.ItemIndicator>
138 |           <CircleIcon className="size-2 fill-current" />
139 |         </DropdownMenuPrimitive.ItemIndicator>
140 |       </span>
141 |       {children}
142 |     </DropdownMenuPrimitive.RadioItem>
143 |   )
144 | }
145 | 
146 | function DropdownMenuLabel({
147 |   className,
148 |   inset,
149 |   ...props
150 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
151 |   inset?: boolean
152 | }) {
153 |   return (
154 |     <DropdownMenuPrimitive.Label
155 |       data-slot="dropdown-menu-label"
156 |       data-inset={inset}
157 |       className={cn(
158 |         "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
159 |         className
160 |       )}
161 |       {...props}
162 |     />
163 |   )
164 | }
165 | 
166 | function DropdownMenuSeparator({
167 |   className,
168 |   ...props
169 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
170 |   return (
171 |     <DropdownMenuPrimitive.Separator
172 |       data-slot="dropdown-menu-separator"
173 |       className={cn("bg-border -mx-1 my-1 h-px", className)}
174 |       {...props}
175 |     />
176 |   )
177 | }
178 | 
179 | function DropdownMenuShortcut({
180 |   className,
181 |   ...props
182 | }: React.ComponentProps<"span">) {
183 |   return (
184 |     <span
185 |       data-slot="dropdown-menu-shortcut"
186 |       className={cn(
187 |         "text-muted-foreground ml-auto text-xs tracking-widest",
188 |         className
189 |       )}
190 |       {...props}
191 |     />
192 |   )
193 | }
194 | 
195 | function DropdownMenuSub({
196 |   ...props
197 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
198 |   return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
199 | }
200 | 
201 | function DropdownMenuSubTrigger({
202 |   className,
203 |   inset,
204 |   children,
205 |   ...props
206 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
207 |   inset?: boolean
208 | }) {
209 |   return (
210 |     <DropdownMenuPrimitive.SubTrigger
211 |       data-slot="dropdown-menu-sub-trigger"
212 |       data-inset={inset}
213 |       className={cn(
214 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
215 |         className
216 |       )}
217 |       {...props}
218 |     >
219 |       {children}
220 |       <ChevronRightIcon className="ml-auto size-4" />
221 |     </DropdownMenuPrimitive.SubTrigger>
222 |   )
223 | }
224 | 
225 | function DropdownMenuSubContent({
226 |   className,
227 |   ...props
228 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
229 |   return (
230 |     <DropdownMenuPrimitive.SubContent
231 |       data-slot="dropdown-menu-sub-content"
232 |       className={cn(
233 |         "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
234 |         className
235 |       )}
236 |       {...props}
237 |     />
238 |   )
239 | }
240 | 
241 | export {
242 |   DropdownMenu,
243 |   DropdownMenuPortal,
244 |   DropdownMenuTrigger,
245 |   DropdownMenuContent,
246 |   DropdownMenuGroup,
247 |   DropdownMenuLabel,
248 |   DropdownMenuItem,
249 |   DropdownMenuCheckboxItem,
250 |   DropdownMenuRadioGroup,
251 |   DropdownMenuRadioItem,
252 |   DropdownMenuSeparator,
253 |   DropdownMenuShortcut,
254 |   DropdownMenuSub,
255 |   DropdownMenuSubTrigger,
256 |   DropdownMenuSubContent,
257 | }
```

components/ui/form.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as LabelPrimitive from "@radix-ui/react-label"
5 | import { Slot } from "@radix-ui/react-slot"
6 | import {
7 |   Controller,
8 |   FormProvider,
9 |   useFormContext,
10 |   useFormState,
11 |   type ControllerProps,
12 |   type FieldPath,
13 |   type FieldValues,
14 | } from "react-hook-form"
15 | 
16 | import { cn } from "@/lib/utils"
17 | import { Label } from "@/components/ui/label"
18 | 
19 | const Form = FormProvider
20 | 
21 | type FormFieldContextValue<
22 |   TFieldValues extends FieldValues = FieldValues,
23 |   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
24 | > = {
25 |   name: TName
26 | }
27 | 
28 | const FormFieldContext = React.createContext<FormFieldContextValue>(
29 |   {} as FormFieldContextValue
30 | )
31 | 
32 | const FormField = <
33 |   TFieldValues extends FieldValues = FieldValues,
34 |   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
35 | >({
36 |   ...props
37 | }: ControllerProps<TFieldValues, TName>) => {
38 |   return (
39 |     <FormFieldContext.Provider value={{ name: props.name }}>
40 |       <Controller {...props} />
41 |     </FormFieldContext.Provider>
42 |   )
43 | }
44 | 
45 | const useFormField = () => {
46 |   const fieldContext = React.useContext(FormFieldContext)
47 |   const itemContext = React.useContext(FormItemContext)
48 |   const { getFieldState } = useFormContext()
49 |   const formState = useFormState({ name: fieldContext.name })
50 |   const fieldState = getFieldState(fieldContext.name, formState)
51 | 
52 |   if (!fieldContext) {
53 |     throw new Error("useFormField should be used within <FormField>")
54 |   }
55 | 
56 |   const { id } = itemContext
57 | 
58 |   return {
59 |     id,
60 |     name: fieldContext.name,
61 |     formItemId: `${id}-form-item`,
62 |     formDescriptionId: `${id}-form-item-description`,
63 |     formMessageId: `${id}-form-item-message`,
64 |     ...fieldState,
65 |   }
66 | }
67 | 
68 | type FormItemContextValue = {
69 |   id: string
70 | }
71 | 
72 | const FormItemContext = React.createContext<FormItemContextValue>(
73 |   {} as FormItemContextValue
74 | )
75 | 
76 | function FormItem({ className, ...props }: React.ComponentProps<"div">) {
77 |   const id = React.useId()
78 | 
79 |   return (
80 |     <FormItemContext.Provider value={{ id }}>
81 |       <div
82 |         data-slot="form-item"
83 |         className={cn("grid gap-2", className)}
84 |         {...props}
85 |       />
86 |     </FormItemContext.Provider>
87 |   )
88 | }
89 | 
90 | function FormLabel({
91 |   className,
92 |   ...props
93 | }: React.ComponentProps<typeof LabelPrimitive.Root>) {
94 |   const { error, formItemId } = useFormField()
95 | 
96 |   return (
97 |     <Label
98 |       data-slot="form-label"
99 |       data-error={!!error}
100 |       className={cn("data-[error=true]:text-destructive", className)}
101 |       htmlFor={formItemId}
102 |       {...props}
103 |     />
104 |   )
105 | }
106 | 
107 | function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
108 |   const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
109 | 
110 |   return (
111 |     <Slot
112 |       data-slot="form-control"
113 |       id={formItemId}
114 |       aria-describedby={
115 |         !error
116 |           ? `${formDescriptionId}`
117 |           : `${formDescriptionId} ${formMessageId}`
118 |       }
119 |       aria-invalid={!!error}
120 |       {...props}
121 |     />
122 |   )
123 | }
124 | 
125 | function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
126 |   const { formDescriptionId } = useFormField()
127 | 
128 |   return (
129 |     <p
130 |       data-slot="form-description"
131 |       id={formDescriptionId}
132 |       className={cn("text-muted-foreground text-sm", className)}
133 |       {...props}
134 |     />
135 |   )
136 | }
137 | 
138 | function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
139 |   const { error, formMessageId } = useFormField()
140 |   const body = error ? String(error?.message ?? "") : props.children
141 | 
142 |   if (!body) {
143 |     return null
144 |   }
145 | 
146 |   return (
147 |     <p
148 |       data-slot="form-message"
149 |       id={formMessageId}
150 |       className={cn("text-destructive text-sm", className)}
151 |       {...props}
152 |     >
153 |       {body}
154 |     </p>
155 |   )
156 | }
157 | 
158 | export {
159 |   useFormField,
160 |   Form,
161 |   FormItem,
162 |   FormLabel,
163 |   FormControl,
164 |   FormDescription,
165 |   FormMessage,
166 |   FormField,
167 | }
```

components/ui/hover-card.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function HoverCard({
9 |   ...props
10 | }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
11 |   return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
12 | }
13 | 
14 | function HoverCardTrigger({
15 |   ...props
16 | }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
17 |   return (
18 |     <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
19 |   )
20 | }
21 | 
22 | function HoverCardContent({
23 |   className,
24 |   align = "center",
25 |   sideOffset = 4,
26 |   ...props
27 | }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
28 |   return (
29 |     <HoverCardPrimitive.Portal data-slot="hover-card-portal">
30 |       <HoverCardPrimitive.Content
31 |         data-slot="hover-card-content"
32 |         align={align}
33 |         sideOffset={sideOffset}
34 |         className={cn(
35 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
36 |           className
37 |         )}
38 |         {...props}
39 |       />
40 |     </HoverCardPrimitive.Portal>
41 |   )
42 | }
43 | 
44 | export { HoverCard, HoverCardTrigger, HoverCardContent }
```

components/ui/input-otp.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { OTPInput, OTPInputContext } from "input-otp"
5 | import { MinusIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function InputOTP({
10 |   className,
11 |   containerClassName,
12 |   ...props
13 | }: React.ComponentProps<typeof OTPInput> & {
14 |   containerClassName?: string
15 | }) {
16 |   return (
17 |     <OTPInput
18 |       data-slot="input-otp"
19 |       containerClassName={cn(
20 |         "flex items-center gap-2 has-disabled:opacity-50",
21 |         containerClassName
22 |       )}
23 |       className={cn("disabled:cursor-not-allowed", className)}
24 |       {...props}
25 |     />
26 |   )
27 | }
28 | 
29 | function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
30 |   return (
31 |     <div
32 |       data-slot="input-otp-group"
33 |       className={cn("flex items-center", className)}
34 |       {...props}
35 |     />
36 |   )
37 | }
38 | 
39 | function InputOTPSlot({
40 |   index,
41 |   className,
42 |   ...props
43 | }: React.ComponentProps<"div"> & {
44 |   index: number
45 | }) {
46 |   const inputOTPContext = React.useContext(OTPInputContext)
47 |   const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}
48 | 
49 |   return (
50 |     <div
51 |       data-slot="input-otp-slot"
52 |       data-active={isActive}
53 |       className={cn(
54 |         "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
55 |         className
56 |       )}
57 |       {...props}
58 |     >
59 |       {char}
60 |       {hasFakeCaret && (
61 |         <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
62 |           <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
63 |         </div>
64 |       )}
65 |     </div>
66 |   )
67 | }
68 | 
69 | function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
70 |   return (
71 |     <div data-slot="input-otp-separator" role="separator" {...props}>
72 |       <MinusIcon />
73 |     </div>
74 |   )
75 | }
76 | 
77 | export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```

components/ui/input.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Input({ className, type, ...props }: React.ComponentProps<"input">) {
6 |   return (
7 |     <input
8 |       type={type}
9 |       data-slot="input"
10 |       className={cn(
11 |         "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
12 |         "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
13 |         "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
14 |         className
15 |       )}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | export { Input }
```

components/ui/label.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as LabelPrimitive from "@radix-ui/react-label"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Label({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof LabelPrimitive.Root>) {
12 |   return (
13 |     <LabelPrimitive.Root
14 |       data-slot="label"
15 |       className={cn(
16 |         "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | export { Label }
```

components/ui/menubar.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as MenubarPrimitive from "@radix-ui/react-menubar"
5 | import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Menubar({
10 |   className,
11 |   ...props
12 | }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
13 |   return (
14 |     <MenubarPrimitive.Root
15 |       data-slot="menubar"
16 |       className={cn(
17 |         "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
18 |         className
19 |       )}
20 |       {...props}
21 |     />
22 |   )
23 | }
24 | 
25 | function MenubarMenu({
26 |   ...props
27 | }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
28 |   return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
29 | }
30 | 
31 | function MenubarGroup({
32 |   ...props
33 | }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
34 |   return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
35 | }
36 | 
37 | function MenubarPortal({
38 |   ...props
39 | }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
40 |   return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
41 | }
42 | 
43 | function MenubarRadioGroup({
44 |   ...props
45 | }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
46 |   return (
47 |     <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
48 |   )
49 | }
50 | 
51 | function MenubarTrigger({
52 |   className,
53 |   ...props
54 | }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
55 |   return (
56 |     <MenubarPrimitive.Trigger
57 |       data-slot="menubar-trigger"
58 |       className={cn(
59 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
60 |         className
61 |       )}
62 |       {...props}
63 |     />
64 |   )
65 | }
66 | 
67 | function MenubarContent({
68 |   className,
69 |   align = "start",
70 |   alignOffset = -4,
71 |   sideOffset = 8,
72 |   ...props
73 | }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
74 |   return (
75 |     <MenubarPortal>
76 |       <MenubarPrimitive.Content
77 |         data-slot="menubar-content"
78 |         align={align}
79 |         alignOffset={alignOffset}
80 |         sideOffset={sideOffset}
81 |         className={cn(
82 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
83 |           className
84 |         )}
85 |         {...props}
86 |       />
87 |     </MenubarPortal>
88 |   )
89 | }
90 | 
91 | function MenubarItem({
92 |   className,
93 |   inset,
94 |   variant = "default",
95 |   ...props
96 | }: React.ComponentProps<typeof MenubarPrimitive.Item> & {
97 |   inset?: boolean
98 |   variant?: "default" | "destructive"
99 | }) {
100 |   return (
101 |     <MenubarPrimitive.Item
102 |       data-slot="menubar-item"
103 |       data-inset={inset}
104 |       data-variant={variant}
105 |       className={cn(
106 |         "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
107 |         className
108 |       )}
109 |       {...props}
110 |     />
111 |   )
112 | }
113 | 
114 | function MenubarCheckboxItem({
115 |   className,
116 |   children,
117 |   checked,
118 |   ...props
119 | }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
120 |   return (
121 |     <MenubarPrimitive.CheckboxItem
122 |       data-slot="menubar-checkbox-item"
123 |       className={cn(
124 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
125 |         className
126 |       )}
127 |       checked={checked}
128 |       {...props}
129 |     >
130 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
131 |         <MenubarPrimitive.ItemIndicator>
132 |           <CheckIcon className="size-4" />
133 |         </MenubarPrimitive.ItemIndicator>
134 |       </span>
135 |       {children}
136 |     </MenubarPrimitive.CheckboxItem>
137 |   )
138 | }
139 | 
140 | function MenubarRadioItem({
141 |   className,
142 |   children,
143 |   ...props
144 | }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
145 |   return (
146 |     <MenubarPrimitive.RadioItem
147 |       data-slot="menubar-radio-item"
148 |       className={cn(
149 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
150 |         className
151 |       )}
152 |       {...props}
153 |     >
154 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
155 |         <MenubarPrimitive.ItemIndicator>
156 |           <CircleIcon className="size-2 fill-current" />
157 |         </MenubarPrimitive.ItemIndicator>
158 |       </span>
159 |       {children}
160 |     </MenubarPrimitive.RadioItem>
161 |   )
162 | }
163 | 
164 | function MenubarLabel({
165 |   className,
166 |   inset,
167 |   ...props
168 | }: React.ComponentProps<typeof MenubarPrimitive.Label> & {
169 |   inset?: boolean
170 | }) {
171 |   return (
172 |     <MenubarPrimitive.Label
173 |       data-slot="menubar-label"
174 |       data-inset={inset}
175 |       className={cn(
176 |         "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
177 |         className
178 |       )}
179 |       {...props}
180 |     />
181 |   )
182 | }
183 | 
184 | function MenubarSeparator({
185 |   className,
186 |   ...props
187 | }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
188 |   return (
189 |     <MenubarPrimitive.Separator
190 |       data-slot="menubar-separator"
191 |       className={cn("bg-border -mx-1 my-1 h-px", className)}
192 |       {...props}
193 |     />
194 |   )
195 | }
196 | 
197 | function MenubarShortcut({
198 |   className,
199 |   ...props
200 | }: React.ComponentProps<"span">) {
201 |   return (
202 |     <span
203 |       data-slot="menubar-shortcut"
204 |       className={cn(
205 |         "text-muted-foreground ml-auto text-xs tracking-widest",
206 |         className
207 |       )}
208 |       {...props}
209 |     />
210 |   )
211 | }
212 | 
213 | function MenubarSub({
214 |   ...props
215 | }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
216 |   return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
217 | }
218 | 
219 | function MenubarSubTrigger({
220 |   className,
221 |   inset,
222 |   children,
223 |   ...props
224 | }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
225 |   inset?: boolean
226 | }) {
227 |   return (
228 |     <MenubarPrimitive.SubTrigger
229 |       data-slot="menubar-sub-trigger"
230 |       data-inset={inset}
231 |       className={cn(
232 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
233 |         className
234 |       )}
235 |       {...props}
236 |     >
237 |       {children}
238 |       <ChevronRightIcon className="ml-auto h-4 w-4" />
239 |     </MenubarPrimitive.SubTrigger>
240 |   )
241 | }
242 | 
243 | function MenubarSubContent({
244 |   className,
245 |   ...props
246 | }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
247 |   return (
248 |     <MenubarPrimitive.SubContent
249 |       data-slot="menubar-sub-content"
250 |       className={cn(
251 |         "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
252 |         className
253 |       )}
254 |       {...props}
255 |     />
256 |   )
257 | }
258 | 
259 | export {
260 |   Menubar,
261 |   MenubarPortal,
262 |   MenubarMenu,
263 |   MenubarTrigger,
264 |   MenubarContent,
265 |   MenubarGroup,
266 |   MenubarSeparator,
267 |   MenubarLabel,
268 |   MenubarItem,
269 |   MenubarShortcut,
270 |   MenubarCheckboxItem,
271 |   MenubarRadioGroup,
272 |   MenubarRadioItem,
273 |   MenubarSub,
274 |   MenubarSubTrigger,
275 |   MenubarSubContent,
276 | }
```

components/ui/navigation-menu.tsx
```
1 | import * as React from "react"
2 | import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
3 | import { cva } from "class-variance-authority"
4 | import { ChevronDownIcon } from "lucide-react"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function NavigationMenu({
9 |   className,
10 |   children,
11 |   viewport = true,
12 |   ...props
13 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
14 |   viewport?: boolean
15 | }) {
16 |   return (
17 |     <NavigationMenuPrimitive.Root
18 |       data-slot="navigation-menu"
19 |       data-viewport={viewport}
20 |       className={cn(
21 |         "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
22 |         className
23 |       )}
24 |       {...props}
25 |     >
26 |       {children}
27 |       {viewport && <NavigationMenuViewport />}
28 |     </NavigationMenuPrimitive.Root>
29 |   )
30 | }
31 | 
32 | function NavigationMenuList({
33 |   className,
34 |   ...props
35 | }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
36 |   return (
37 |     <NavigationMenuPrimitive.List
38 |       data-slot="navigation-menu-list"
39 |       className={cn(
40 |         "group flex flex-1 list-none items-center justify-center gap-1",
41 |         className
42 |       )}
43 |       {...props}
44 |     />
45 |   )
46 | }
47 | 
48 | function NavigationMenuItem({
49 |   className,
50 |   ...props
51 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
52 |   return (
53 |     <NavigationMenuPrimitive.Item
54 |       data-slot="navigation-menu-item"
55 |       className={cn("relative", className)}
56 |       {...props}
57 |     />
58 |   )
59 | }
60 | 
61 | const navigationMenuTriggerStyle = cva(
62 |   "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
63 | )
64 | 
65 | function NavigationMenuTrigger({
66 |   className,
67 |   children,
68 |   ...props
69 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
70 |   return (
71 |     <NavigationMenuPrimitive.Trigger
72 |       data-slot="navigation-menu-trigger"
73 |       className={cn(navigationMenuTriggerStyle(), "group", className)}
74 |       {...props}
75 |     >
76 |       {children}{" "}
77 |       <ChevronDownIcon
78 |         className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
79 |         aria-hidden="true"
80 |       />
81 |     </NavigationMenuPrimitive.Trigger>
82 |   )
83 | }
84 | 
85 | function NavigationMenuContent({
86 |   className,
87 |   ...props
88 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
89 |   return (
90 |     <NavigationMenuPrimitive.Content
91 |       data-slot="navigation-menu-content"
92 |       className={cn(
93 |         "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
94 |         "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
95 |         className
96 |       )}
97 |       {...props}
98 |     />
99 |   )
100 | }
101 | 
102 | function NavigationMenuViewport({
103 |   className,
104 |   ...props
105 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
106 |   return (
107 |     <div
108 |       className={cn(
109 |         "absolute top-full left-0 isolate z-50 flex justify-center"
110 |       )}
111 |     >
112 |       <NavigationMenuPrimitive.Viewport
113 |         data-slot="navigation-menu-viewport"
114 |         className={cn(
115 |           "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
116 |           className
117 |         )}
118 |         {...props}
119 |       />
120 |     </div>
121 |   )
122 | }
123 | 
124 | function NavigationMenuLink({
125 |   className,
126 |   ...props
127 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
128 |   return (
129 |     <NavigationMenuPrimitive.Link
130 |       data-slot="navigation-menu-link"
131 |       className={cn(
132 |         "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
133 |         className
134 |       )}
135 |       {...props}
136 |     />
137 |   )
138 | }
139 | 
140 | function NavigationMenuIndicator({
141 |   className,
142 |   ...props
143 | }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
144 |   return (
145 |     <NavigationMenuPrimitive.Indicator
146 |       data-slot="navigation-menu-indicator"
147 |       className={cn(
148 |         "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
149 |         className
150 |       )}
151 |       {...props}
152 |     >
153 |       <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
154 |     </NavigationMenuPrimitive.Indicator>
155 |   )
156 | }
157 | 
158 | export {
159 |   NavigationMenu,
160 |   NavigationMenuList,
161 |   NavigationMenuItem,
162 |   NavigationMenuContent,
163 |   NavigationMenuTrigger,
164 |   NavigationMenuLink,
165 |   NavigationMenuIndicator,
166 |   NavigationMenuViewport,
167 |   navigationMenuTriggerStyle,
168 | }
```

components/ui/pagination.tsx
```
1 | import * as React from "react"
2 | import {
3 |   ChevronLeftIcon,
4 |   ChevronRightIcon,
5 |   MoreHorizontalIcon,
6 | } from "lucide-react"
7 | 
8 | import { cn } from "@/lib/utils"
9 | import { Button, buttonVariants } from "@/components/ui/button"
10 | 
11 | function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
12 |   return (
13 |     <nav
14 |       role="navigation"
15 |       aria-label="pagination"
16 |       data-slot="pagination"
17 |       className={cn("mx-auto flex w-full justify-center", className)}
18 |       {...props}
19 |     />
20 |   )
21 | }
22 | 
23 | function PaginationContent({
24 |   className,
25 |   ...props
26 | }: React.ComponentProps<"ul">) {
27 |   return (
28 |     <ul
29 |       data-slot="pagination-content"
30 |       className={cn("flex flex-row items-center gap-1", className)}
31 |       {...props}
32 |     />
33 |   )
34 | }
35 | 
36 | function PaginationItem({ ...props }: React.ComponentProps<"li">) {
37 |   return <li data-slot="pagination-item" {...props} />
38 | }
39 | 
40 | type PaginationLinkProps = {
41 |   isActive?: boolean
42 | } & Pick<React.ComponentProps<typeof Button>, "size"> &
43 |   React.ComponentProps<"a">
44 | 
45 | function PaginationLink({
46 |   className,
47 |   isActive,
48 |   size = "icon",
49 |   ...props
50 | }: PaginationLinkProps) {
51 |   return (
52 |     <a
53 |       aria-current={isActive ? "page" : undefined}
54 |       data-slot="pagination-link"
55 |       data-active={isActive}
56 |       className={cn(
57 |         buttonVariants({
58 |           variant: isActive ? "outline" : "ghost",
59 |           size,
60 |         }),
61 |         className
62 |       )}
63 |       {...props}
64 |     />
65 |   )
66 | }
67 | 
68 | function PaginationPrevious({
69 |   className,
70 |   ...props
71 | }: React.ComponentProps<typeof PaginationLink>) {
72 |   return (
73 |     <PaginationLink
74 |       aria-label="Go to previous page"
75 |       size="default"
76 |       className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
77 |       {...props}
78 |     >
79 |       <ChevronLeftIcon />
80 |       <span className="hidden sm:block">Previous</span>
81 |     </PaginationLink>
82 |   )
83 | }
84 | 
85 | function PaginationNext({
86 |   className,
87 |   ...props
88 | }: React.ComponentProps<typeof PaginationLink>) {
89 |   return (
90 |     <PaginationLink
91 |       aria-label="Go to next page"
92 |       size="default"
93 |       className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
94 |       {...props}
95 |     >
96 |       <span className="hidden sm:block">Next</span>
97 |       <ChevronRightIcon />
98 |     </PaginationLink>
99 |   )
100 | }
101 | 
102 | function PaginationEllipsis({
103 |   className,
104 |   ...props
105 | }: React.ComponentProps<"span">) {
106 |   return (
107 |     <span
108 |       aria-hidden
109 |       data-slot="pagination-ellipsis"
110 |       className={cn("flex size-9 items-center justify-center", className)}
111 |       {...props}
112 |     >
113 |       <MoreHorizontalIcon className="size-4" />
114 |       <span className="sr-only">More pages</span>
115 |     </span>
116 |   )
117 | }
118 | 
119 | export {
120 |   Pagination,
121 |   PaginationContent,
122 |   PaginationLink,
123 |   PaginationItem,
124 |   PaginationPrevious,
125 |   PaginationNext,
126 |   PaginationEllipsis,
127 | }
```

components/ui/popover.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as PopoverPrimitive from "@radix-ui/react-popover"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Popover({
9 |   ...props
10 | }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
11 |   return <PopoverPrimitive.Root data-slot="popover" {...props} />
12 | }
13 | 
14 | function PopoverTrigger({
15 |   ...props
16 | }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
17 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
18 | }
19 | 
20 | function PopoverContent({
21 |   className,
22 |   align = "center",
23 |   sideOffset = 4,
24 |   ...props
25 | }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
26 |   return (
27 |     <PopoverPrimitive.Portal>
28 |       <PopoverPrimitive.Content
29 |         data-slot="popover-content"
30 |         align={align}
31 |         sideOffset={sideOffset}
32 |         className={cn(
33 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
34 |           className
35 |         )}
36 |         {...props}
37 |       />
38 |     </PopoverPrimitive.Portal>
39 |   )
40 | }
41 | 
42 | function PopoverAnchor({
43 |   ...props
44 | }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
45 |   return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
46 | }
47 | 
48 | export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

components/ui/progress.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as ProgressPrimitive from "@radix-ui/react-progress"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Progress({
9 |   className,
10 |   value,
11 |   ...props
12 | }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
13 |   return (
14 |     <ProgressPrimitive.Root
15 |       data-slot="progress"
16 |       className={cn(
17 |         "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
18 |         className
19 |       )}
20 |       {...props}
21 |     >
22 |       <ProgressPrimitive.Indicator
23 |         data-slot="progress-indicator"
24 |         className="bg-primary h-full w-full flex-1 transition-all"
25 |         style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
26 |       />
27 |     </ProgressPrimitive.Root>
28 |   )
29 | }
30 | 
31 | export { Progress }
```

components/ui/radio-group.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
5 | import { CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function RadioGroup({
10 |   className,
11 |   ...props
12 | }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
13 |   return (
14 |     <RadioGroupPrimitive.Root
15 |       data-slot="radio-group"
16 |       className={cn("grid gap-3", className)}
17 |       {...props}
18 |     />
19 |   )
20 | }
21 | 
22 | function RadioGroupItem({
23 |   className,
24 |   ...props
25 | }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
26 |   return (
27 |     <RadioGroupPrimitive.Item
28 |       data-slot="radio-group-item"
29 |       className={cn(
30 |         "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
31 |         className
32 |       )}
33 |       {...props}
34 |     >
35 |       <RadioGroupPrimitive.Indicator
36 |         data-slot="radio-group-indicator"
37 |         className="relative flex items-center justify-center"
38 |       >
39 |         <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
40 |       </RadioGroupPrimitive.Indicator>
41 |     </RadioGroupPrimitive.Item>
42 |   )
43 | }
44 | 
45 | export { RadioGroup, RadioGroupItem }
```

components/ui/resizable.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { GripVerticalIcon } from "lucide-react"
5 | import * as ResizablePrimitive from "react-resizable-panels"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function ResizablePanelGroup({
10 |   className,
11 |   ...props
12 | }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
13 |   return (
14 |     <ResizablePrimitive.PanelGroup
15 |       data-slot="resizable-panel-group"
16 |       className={cn(
17 |         "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
18 |         className
19 |       )}
20 |       {...props}
21 |     />
22 |   )
23 | }
24 | 
25 | function ResizablePanel({
26 |   ...props
27 | }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
28 |   return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
29 | }
30 | 
31 | function ResizableHandle({
32 |   withHandle,
33 |   className,
34 |   ...props
35 | }: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
36 |   withHandle?: boolean
37 | }) {
38 |   return (
39 |     <ResizablePrimitive.PanelResizeHandle
40 |       data-slot="resizable-handle"
41 |       className={cn(
42 |         "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
43 |         className
44 |       )}
45 |       {...props}
46 |     >
47 |       {withHandle && (
48 |         <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
49 |           <GripVerticalIcon className="size-2.5" />
50 |         </div>
51 |       )}
52 |     </ResizablePrimitive.PanelResizeHandle>
53 |   )
54 | }
55 | 
56 | export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

components/ui/scroll-area.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function ScrollArea({
9 |   className,
10 |   children,
11 |   ...props
12 | }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
13 |   return (
14 |     <ScrollAreaPrimitive.Root
15 |       data-slot="scroll-area"
16 |       className={cn("relative", className)}
17 |       {...props}
18 |     >
19 |       <ScrollAreaPrimitive.Viewport
20 |         data-slot="scroll-area-viewport"
21 |         className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
22 |       >
23 |         {children}
24 |       </ScrollAreaPrimitive.Viewport>
25 |       <ScrollBar />
26 |       <ScrollAreaPrimitive.Corner />
27 |     </ScrollAreaPrimitive.Root>
28 |   )
29 | }
30 | 
31 | function ScrollBar({
32 |   className,
33 |   orientation = "vertical",
34 |   ...props
35 | }: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
36 |   return (
37 |     <ScrollAreaPrimitive.ScrollAreaScrollbar
38 |       data-slot="scroll-area-scrollbar"
39 |       orientation={orientation}
40 |       className={cn(
41 |         "flex touch-none p-px transition-colors select-none",
42 |         orientation === "vertical" &&
43 |           "h-full w-2.5 border-l border-l-transparent",
44 |         orientation === "horizontal" &&
45 |           "h-2.5 flex-col border-t border-t-transparent",
46 |         className
47 |       )}
48 |       {...props}
49 |     >
50 |       <ScrollAreaPrimitive.ScrollAreaThumb
51 |         data-slot="scroll-area-thumb"
52 |         className="bg-border relative flex-1 rounded-full"
53 |       />
54 |     </ScrollAreaPrimitive.ScrollAreaScrollbar>
55 |   )
56 | }
57 | 
58 | export { ScrollArea, ScrollBar }
```

components/ui/select.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SelectPrimitive from "@radix-ui/react-select"
5 | import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Select({
10 |   ...props
11 | }: React.ComponentProps<typeof SelectPrimitive.Root>) {
12 |   return <SelectPrimitive.Root data-slot="select" {...props} />
13 | }
14 | 
15 | function SelectGroup({
16 |   ...props
17 | }: React.ComponentProps<typeof SelectPrimitive.Group>) {
18 |   return <SelectPrimitive.Group data-slot="select-group" {...props} />
19 | }
20 | 
21 | function SelectValue({
22 |   ...props
23 | }: React.ComponentProps<typeof SelectPrimitive.Value>) {
24 |   return <SelectPrimitive.Value data-slot="select-value" {...props} />
25 | }
26 | 
27 | function SelectTrigger({
28 |   className,
29 |   size = "default",
30 |   children,
31 |   ...props
32 | }: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
33 |   size?: "sm" | "default"
34 | }) {
35 |   return (
36 |     <SelectPrimitive.Trigger
37 |       data-slot="select-trigger"
38 |       data-size={size}
39 |       className={cn(
40 |         "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
41 |         className
42 |       )}
43 |       {...props}
44 |     >
45 |       {children}
46 |       <SelectPrimitive.Icon asChild>
47 |         <ChevronDownIcon className="size-4 opacity-50" />
48 |       </SelectPrimitive.Icon>
49 |     </SelectPrimitive.Trigger>
50 |   )
51 | }
52 | 
53 | function SelectContent({
54 |   className,
55 |   children,
56 |   position = "popper",
57 |   ...props
58 | }: React.ComponentProps<typeof SelectPrimitive.Content>) {
59 |   return (
60 |     <SelectPrimitive.Portal>
61 |       <SelectPrimitive.Content
62 |         data-slot="select-content"
63 |         className={cn(
64 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
65 |           position === "popper" &&
66 |             "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
67 |           className
68 |         )}
69 |         position={position}
70 |         {...props}
71 |       >
72 |         <SelectScrollUpButton />
73 |         <SelectPrimitive.Viewport
74 |           className={cn(
75 |             "p-1",
76 |             position === "popper" &&
77 |               "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
78 |           )}
79 |         >
80 |           {children}
81 |         </SelectPrimitive.Viewport>
82 |         <SelectScrollDownButton />
83 |       </SelectPrimitive.Content>
84 |     </SelectPrimitive.Portal>
85 |   )
86 | }
87 | 
88 | function SelectLabel({
89 |   className,
90 |   ...props
91 | }: React.ComponentProps<typeof SelectPrimitive.Label>) {
92 |   return (
93 |     <SelectPrimitive.Label
94 |       data-slot="select-label"
95 |       className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
96 |       {...props}
97 |     />
98 |   )
99 | }
100 | 
101 | function SelectItem({
102 |   className,
103 |   children,
104 |   ...props
105 | }: React.ComponentProps<typeof SelectPrimitive.Item>) {
106 |   return (
107 |     <SelectPrimitive.Item
108 |       data-slot="select-item"
109 |       className={cn(
110 |         "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
111 |         className
112 |       )}
113 |       {...props}
114 |     >
115 |       <span className="absolute right-2 flex size-3.5 items-center justify-center">
116 |         <SelectPrimitive.ItemIndicator>
117 |           <CheckIcon className="size-4" />
118 |         </SelectPrimitive.ItemIndicator>
119 |       </span>
120 |       <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
121 |     </SelectPrimitive.Item>
122 |   )
123 | }
124 | 
125 | function SelectSeparator({
126 |   className,
127 |   ...props
128 | }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
129 |   return (
130 |     <SelectPrimitive.Separator
131 |       data-slot="select-separator"
132 |       className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
133 |       {...props}
134 |     />
135 |   )
136 | }
137 | 
138 | function SelectScrollUpButton({
139 |   className,
140 |   ...props
141 | }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
142 |   return (
143 |     <SelectPrimitive.ScrollUpButton
144 |       data-slot="select-scroll-up-button"
145 |       className={cn(
146 |         "flex cursor-default items-center justify-center py-1",
147 |         className
148 |       )}
149 |       {...props}
150 |     >
151 |       <ChevronUpIcon className="size-4" />
152 |     </SelectPrimitive.ScrollUpButton>
153 |   )
154 | }
155 | 
156 | function SelectScrollDownButton({
157 |   className,
158 |   ...props
159 | }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
160 |   return (
161 |     <SelectPrimitive.ScrollDownButton
162 |       data-slot="select-scroll-down-button"
163 |       className={cn(
164 |         "flex cursor-default items-center justify-center py-1",
165 |         className
166 |       )}
167 |       {...props}
168 |     >
169 |       <ChevronDownIcon className="size-4" />
170 |     </SelectPrimitive.ScrollDownButton>
171 |   )
172 | }
173 | 
174 | export {
175 |   Select,
176 |   SelectContent,
177 |   SelectGroup,
178 |   SelectItem,
179 |   SelectLabel,
180 |   SelectScrollDownButton,
181 |   SelectScrollUpButton,
182 |   SelectSeparator,
183 |   SelectTrigger,
184 |   SelectValue,
185 | }
```

components/ui/separator.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SeparatorPrimitive from "@radix-ui/react-separator"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Separator({
9 |   className,
10 |   orientation = "horizontal",
11 |   decorative = true,
12 |   ...props
13 | }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
14 |   return (
15 |     <SeparatorPrimitive.Root
16 |       data-slot="separator-root"
17 |       decorative={decorative}
18 |       orientation={orientation}
19 |       className={cn(
20 |         "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
21 |         className
22 |       )}
23 |       {...props}
24 |     />
25 |   )
26 | }
27 | 
28 | export { Separator }
```

components/ui/sheet.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SheetPrimitive from "@radix-ui/react-dialog"
5 | import { XIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
10 |   return <SheetPrimitive.Root data-slot="sheet" {...props} />
11 | }
12 | 
13 | function SheetTrigger({
14 |   ...props
15 | }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
16 |   return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
17 | }
18 | 
19 | function SheetClose({
20 |   ...props
21 | }: React.ComponentProps<typeof SheetPrimitive.Close>) {
22 |   return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
23 | }
24 | 
25 | function SheetPortal({
26 |   ...props
27 | }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
28 |   return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
29 | }
30 | 
31 | function SheetOverlay({
32 |   className,
33 |   ...props
34 | }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
35 |   return (
36 |     <SheetPrimitive.Overlay
37 |       data-slot="sheet-overlay"
38 |       className={cn(
39 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
40 |         className
41 |       )}
42 |       {...props}
43 |     />
44 |   )
45 | }
46 | 
47 | function SheetContent({
48 |   className,
49 |   children,
50 |   side = "right",
51 |   ...props
52 | }: React.ComponentProps<typeof SheetPrimitive.Content> & {
53 |   side?: "top" | "right" | "bottom" | "left"
54 | }) {
55 |   return (
56 |     <SheetPortal>
57 |       <SheetOverlay />
58 |       <SheetPrimitive.Content
59 |         data-slot="sheet-content"
60 |         className={cn(
61 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
62 |           side === "right" &&
63 |             "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
64 |           side === "left" &&
65 |             "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
66 |           side === "top" &&
67 |             "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
68 |           side === "bottom" &&
69 |             "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
70 |           className
71 |         )}
72 |         {...props}
73 |       >
74 |         {children}
75 |         <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
76 |           <XIcon className="size-4" />
77 |           <span className="sr-only">Close</span>
78 |         </SheetPrimitive.Close>
79 |       </SheetPrimitive.Content>
80 |     </SheetPortal>
81 |   )
82 | }
83 | 
84 | function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
85 |   return (
86 |     <div
87 |       data-slot="sheet-header"
88 |       className={cn("flex flex-col gap-1.5 p-4", className)}
89 |       {...props}
90 |     />
91 |   )
92 | }
93 | 
94 | function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
95 |   return (
96 |     <div
97 |       data-slot="sheet-footer"
98 |       className={cn("mt-auto flex flex-col gap-2 p-4", className)}
99 |       {...props}
100 |     />
101 |   )
102 | }
103 | 
104 | function SheetTitle({
105 |   className,
106 |   ...props
107 | }: React.ComponentProps<typeof SheetPrimitive.Title>) {
108 |   return (
109 |     <SheetPrimitive.Title
110 |       data-slot="sheet-title"
111 |       className={cn("text-foreground font-semibold", className)}
112 |       {...props}
113 |     />
114 |   )
115 | }
116 | 
117 | function SheetDescription({
118 |   className,
119 |   ...props
120 | }: React.ComponentProps<typeof SheetPrimitive.Description>) {
121 |   return (
122 |     <SheetPrimitive.Description
123 |       data-slot="sheet-description"
124 |       className={cn("text-muted-foreground text-sm", className)}
125 |       {...props}
126 |     />
127 |   )
128 | }
129 | 
130 | export {
131 |   Sheet,
132 |   SheetTrigger,
133 |   SheetClose,
134 |   SheetContent,
135 |   SheetHeader,
136 |   SheetFooter,
137 |   SheetTitle,
138 |   SheetDescription,
139 | }
```

components/ui/sidebar.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { Slot } from "@radix-ui/react-slot"
5 | import { VariantProps, cva } from "class-variance-authority"
6 | import { PanelLeftIcon } from "lucide-react"
7 | 
8 | import { useIsMobile } from "@/hooks/use-mobile"
9 | import { cn } from "@/lib/utils"
10 | import { Button } from "@/components/ui/button"
11 | import { Input } from "@/components/ui/input"
12 | import { Separator } from "@/components/ui/separator"
13 | import {
14 |   Sheet,
15 |   SheetContent,
16 |   SheetDescription,
17 |   SheetHeader,
18 |   SheetTitle,
19 | } from "@/components/ui/sheet"
20 | import { Skeleton } from "@/components/ui/skeleton"
21 | import {
22 |   Tooltip,
23 |   TooltipContent,
24 |   TooltipProvider,
25 |   TooltipTrigger,
26 | } from "@/components/ui/tooltip"
27 | 
28 | const SIDEBAR_COOKIE_NAME = "sidebar_state"
29 | const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
30 | const SIDEBAR_WIDTH = "16rem"
31 | const SIDEBAR_WIDTH_MOBILE = "18rem"
32 | const SIDEBAR_WIDTH_ICON = "3rem"
33 | const SIDEBAR_KEYBOARD_SHORTCUT = "b"
34 | 
35 | type SidebarContextProps = {
36 |   state: "expanded" | "collapsed"
37 |   open: boolean
38 |   setOpen: (open: boolean) => void
39 |   openMobile: boolean
40 |   setOpenMobile: (open: boolean) => void
41 |   isMobile: boolean
42 |   toggleSidebar: () => void
43 | }
44 | 
45 | const SidebarContext = React.createContext<SidebarContextProps | null>(null)
46 | 
47 | function useSidebar() {
48 |   const context = React.useContext(SidebarContext)
49 |   if (!context) {
50 |     throw new Error("useSidebar must be used within a SidebarProvider.")
51 |   }
52 | 
53 |   return context
54 | }
55 | 
56 | function SidebarProvider({
57 |   defaultOpen = true,
58 |   open: openProp,
59 |   onOpenChange: setOpenProp,
60 |   className,
61 |   style,
62 |   children,
63 |   ...props
64 | }: React.ComponentProps<"div"> & {
65 |   defaultOpen?: boolean
66 |   open?: boolean
67 |   onOpenChange?: (open: boolean) => void
68 | }) {
69 |   const isMobile = useIsMobile()
70 |   const [openMobile, setOpenMobile] = React.useState(false)
71 | 
72 |   // This is the internal state of the sidebar.
73 |   // We use openProp and setOpenProp for control from outside the component.
74 |   const [_open, _setOpen] = React.useState(defaultOpen)
75 |   const open = openProp ?? _open
76 |   const setOpen = React.useCallback(
77 |     (value: boolean | ((value: boolean) => boolean)) => {
78 |       const openState = typeof value === "function" ? value(open) : value
79 |       if (setOpenProp) {
80 |         setOpenProp(openState)
81 |       } else {
82 |         _setOpen(openState)
83 |       }
84 | 
85 |       // This sets the cookie to keep the sidebar state.
86 |       document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
87 |     },
88 |     [setOpenProp, open]
89 |   )
90 | 
91 |   // Helper to toggle the sidebar.
92 |   const toggleSidebar = React.useCallback(() => {
93 |     return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
94 |   }, [isMobile, setOpen, setOpenMobile])
95 | 
96 |   // Adds a keyboard shortcut to toggle the sidebar.
97 |   React.useEffect(() => {
98 |     const handleKeyDown = (event: KeyboardEvent) => {
99 |       if (
100 |         event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
101 |         (event.metaKey || event.ctrlKey)
102 |       ) {
103 |         event.preventDefault()
104 |         toggleSidebar()
105 |       }
106 |     }
107 | 
108 |     window.addEventListener("keydown", handleKeyDown)
109 |     return () => window.removeEventListener("keydown", handleKeyDown)
110 |   }, [toggleSidebar])
111 | 
112 |   // We add a state so that we can do data-state="expanded" or "collapsed".
113 |   // This makes it easier to style the sidebar with Tailwind classes.
114 |   const state = open ? "expanded" : "collapsed"
115 | 
116 |   const contextValue = React.useMemo<SidebarContextProps>(
117 |     () => ({
118 |       state,
119 |       open,
120 |       setOpen,
121 |       isMobile,
122 |       openMobile,
123 |       setOpenMobile,
124 |       toggleSidebar,
125 |     }),
126 |     [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
127 |   )
128 | 
129 |   return (
130 |     <SidebarContext.Provider value={contextValue}>
131 |       <TooltipProvider delayDuration={0}>
132 |         <div
133 |           data-slot="sidebar-wrapper"
134 |           style={
135 |             {
136 |               "--sidebar-width": SIDEBAR_WIDTH,
137 |               "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
138 |               ...style,
139 |             } as React.CSSProperties
140 |           }
141 |           className={cn(
142 |             "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
143 |             className
144 |           )}
145 |           {...props}
146 |         >
147 |           {children}
148 |         </div>
149 |       </TooltipProvider>
150 |     </SidebarContext.Provider>
151 |   )
152 | }
153 | 
154 | function Sidebar({
155 |   side = "left",
156 |   variant = "sidebar",
157 |   collapsible = "offcanvas",
158 |   className,
159 |   children,
160 |   ...props
161 | }: React.ComponentProps<"div"> & {
162 |   side?: "left" | "right"
163 |   variant?: "sidebar" | "floating" | "inset"
164 |   collapsible?: "offcanvas" | "icon" | "none"
165 | }) {
166 |   const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
167 | 
168 |   if (collapsible === "none") {
169 |     return (
170 |       <div
171 |         data-slot="sidebar"
172 |         className={cn(
173 |           "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
174 |           className
175 |         )}
176 |         {...props}
177 |       >
178 |         {children}
179 |       </div>
180 |     )
181 |   }
182 | 
183 |   if (isMobile) {
184 |     return (
185 |       <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
186 |         <SheetContent
187 |           data-sidebar="sidebar"
188 |           data-slot="sidebar"
189 |           data-mobile="true"
190 |           className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
191 |           style={
192 |             {
193 |               "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
194 |             } as React.CSSProperties
195 |           }
196 |           side={side}
197 |         >
198 |           <SheetHeader className="sr-only">
199 |             <SheetTitle>Sidebar</SheetTitle>
200 |             <SheetDescription>Displays the mobile sidebar.</SheetDescription>
201 |           </SheetHeader>
202 |           <div className="flex h-full w-full flex-col">{children}</div>
203 |         </SheetContent>
204 |       </Sheet>
205 |     )
206 |   }
207 | 
208 |   return (
209 |     <div
210 |       className="group peer text-sidebar-foreground hidden md:block"
211 |       data-state={state}
212 |       data-collapsible={state === "collapsed" ? collapsible : ""}
213 |       data-variant={variant}
214 |       data-side={side}
215 |       data-slot="sidebar"
216 |     >
217 |       {/* This is what handles the sidebar gap on desktop */}
218 |       <div
219 |         data-slot="sidebar-gap"
220 |         className={cn(
221 |           "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
222 |           "group-data-[collapsible=offcanvas]:w-0",
223 |           "group-data-[side=right]:rotate-180",
224 |           variant === "floating" || variant === "inset"
225 |             ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
226 |             : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
227 |         )}
228 |       />
229 |       <div
230 |         data-slot="sidebar-container"
231 |         className={cn(
232 |           "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
233 |           side === "left"
234 |             ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
235 |             : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
236 |           // Adjust the padding for floating and inset variants.
237 |           variant === "floating" || variant === "inset"
238 |             ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
239 |             : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
240 |           className
241 |         )}
242 |         {...props}
243 |       >
244 |         <div
245 |           data-sidebar="sidebar"
246 |           data-slot="sidebar-inner"
247 |           className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
248 |         >
249 |           {children}
250 |         </div>
251 |       </div>
252 |     </div>
253 |   )
254 | }
255 | 
256 | function SidebarTrigger({
257 |   className,
258 |   onClick,
259 |   ...props
260 | }: React.ComponentProps<typeof Button>) {
261 |   const { toggleSidebar } = useSidebar()
262 | 
263 |   return (
264 |     <Button
265 |       data-sidebar="trigger"
266 |       data-slot="sidebar-trigger"
267 |       variant="ghost"
268 |       size="icon"
269 |       className={cn("size-7", className)}
270 |       onClick={(event) => {
271 |         onClick?.(event)
272 |         toggleSidebar()
273 |       }}
274 |       {...props}
275 |     >
276 |       <PanelLeftIcon />
277 |       <span className="sr-only">Toggle Sidebar</span>
278 |     </Button>
279 |   )
280 | }
281 | 
282 | function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
283 |   const { toggleSidebar } = useSidebar()
284 | 
285 |   return (
286 |     <button
287 |       data-sidebar="rail"
288 |       data-slot="sidebar-rail"
289 |       aria-label="Toggle Sidebar"
290 |       tabIndex={-1}
291 |       onClick={toggleSidebar}
292 |       title="Toggle Sidebar"
293 |       className={cn(
294 |         "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
295 |         "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
296 |         "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
297 |         "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
298 |         "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
299 |         "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
300 |         className
301 |       )}
302 |       {...props}
303 |     />
304 |   )
305 | }
306 | 
307 | function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
308 |   return (
309 |     <main
310 |       data-slot="sidebar-inset"
311 |       className={cn(
312 |         "bg-background relative flex w-full flex-1 flex-col",
313 |         "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
314 |         className
315 |       )}
316 |       {...props}
317 |     />
318 |   )
319 | }
320 | 
321 | function SidebarInput({
322 |   className,
323 |   ...props
324 | }: React.ComponentProps<typeof Input>) {
325 |   return (
326 |     <Input
327 |       data-slot="sidebar-input"
328 |       data-sidebar="input"
329 |       className={cn("bg-background h-8 w-full shadow-none", className)}
330 |       {...props}
331 |     />
332 |   )
333 | }
334 | 
335 | function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
336 |   return (
337 |     <div
338 |       data-slot="sidebar-header"
339 |       data-sidebar="header"
340 |       className={cn("flex flex-col gap-2 p-2", className)}
341 |       {...props}
342 |     />
343 |   )
344 | }
345 | 
346 | function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
347 |   return (
348 |     <div
349 |       data-slot="sidebar-footer"
350 |       data-sidebar="footer"
351 |       className={cn("flex flex-col gap-2 p-2", className)}
352 |       {...props}
353 |     />
354 |   )
355 | }
356 | 
357 | function SidebarSeparator({
358 |   className,
359 |   ...props
360 | }: React.ComponentProps<typeof Separator>) {
361 |   return (
362 |     <Separator
363 |       data-slot="sidebar-separator"
364 |       data-sidebar="separator"
365 |       className={cn("bg-sidebar-border mx-2 w-auto", className)}
366 |       {...props}
367 |     />
368 |   )
369 | }
370 | 
371 | function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
372 |   return (
373 |     <div
374 |       data-slot="sidebar-content"
375 |       data-sidebar="content"
376 |       className={cn(
377 |         "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
378 |         className
379 |       )}
380 |       {...props}
381 |     />
382 |   )
383 | }
384 | 
385 | function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
386 |   return (
387 |     <div
388 |       data-slot="sidebar-group"
389 |       data-sidebar="group"
390 |       className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
391 |       {...props}
392 |     />
393 |   )
394 | }
395 | 
396 | function SidebarGroupLabel({
397 |   className,
398 |   asChild = false,
399 |   ...props
400 | }: React.ComponentProps<"div"> & { asChild?: boolean }) {
401 |   const Comp = asChild ? Slot : "div"
402 | 
403 |   return (
404 |     <Comp
405 |       data-slot="sidebar-group-label"
406 |       data-sidebar="group-label"
407 |       className={cn(
408 |         "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
409 |         "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
410 |         className
411 |       )}
412 |       {...props}
413 |     />
414 |   )
415 | }
416 | 
417 | function SidebarGroupAction({
418 |   className,
419 |   asChild = false,
420 |   ...props
421 | }: React.ComponentProps<"button"> & { asChild?: boolean }) {
422 |   const Comp = asChild ? Slot : "button"
423 | 
424 |   return (
425 |     <Comp
426 |       data-slot="sidebar-group-action"
427 |       data-sidebar="group-action"
428 |       className={cn(
429 |         "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
430 |         // Increases the hit area of the button on mobile.
431 |         "after:absolute after:-inset-2 md:after:hidden",
432 |         "group-data-[collapsible=icon]:hidden",
433 |         className
434 |       )}
435 |       {...props}
436 |     />
437 |   )
438 | }
439 | 
440 | function SidebarGroupContent({
441 |   className,
442 |   ...props
443 | }: React.ComponentProps<"div">) {
444 |   return (
445 |     <div
446 |       data-slot="sidebar-group-content"
447 |       data-sidebar="group-content"
448 |       className={cn("w-full text-sm", className)}
449 |       {...props}
450 |     />
451 |   )
452 | }
453 | 
454 | function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
455 |   return (
456 |     <ul
457 |       data-slot="sidebar-menu"
458 |       data-sidebar="menu"
459 |       className={cn("flex w-full min-w-0 flex-col gap-1", className)}
460 |       {...props}
461 |     />
462 |   )
463 | }
464 | 
465 | function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
466 |   return (
467 |     <li
468 |       data-slot="sidebar-menu-item"
469 |       data-sidebar="menu-item"
470 |       className={cn("group/menu-item relative", className)}
471 |       {...props}
472 |     />
473 |   )
474 | }
475 | 
476 | const sidebarMenuButtonVariants = cva(
477 |   "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
478 |   {
479 |     variants: {
480 |       variant: {
481 |         default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
482 |         outline:
483 |           "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
484 |       },
485 |       size: {
486 |         default: "h-8 text-sm",
487 |         sm: "h-7 text-xs",
488 |         lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
489 |       },
490 |     },
491 |     defaultVariants: {
492 |       variant: "default",
493 |       size: "default",
494 |     },
495 |   }
496 | )
497 | 
498 | function SidebarMenuButton({
499 |   asChild = false,
500 |   isActive = false,
501 |   variant = "default",
502 |   size = "default",
503 |   tooltip,
504 |   className,
505 |   ...props
506 | }: React.ComponentProps<"button"> & {
507 |   asChild?: boolean
508 |   isActive?: boolean
509 |   tooltip?: string | React.ComponentProps<typeof TooltipContent>
510 | } & VariantProps<typeof sidebarMenuButtonVariants>) {
511 |   const Comp = asChild ? Slot : "button"
512 |   const { isMobile, state } = useSidebar()
513 | 
514 |   const button = (
515 |     <Comp
516 |       data-slot="sidebar-menu-button"
517 |       data-sidebar="menu-button"
518 |       data-size={size}
519 |       data-active={isActive}
520 |       className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
521 |       {...props}
522 |     />
523 |   )
524 | 
525 |   if (!tooltip) {
526 |     return button
527 |   }
528 | 
529 |   if (typeof tooltip === "string") {
530 |     tooltip = {
531 |       children: tooltip,
532 |     }
533 |   }
534 | 
535 |   return (
536 |     <Tooltip>
537 |       <TooltipTrigger asChild>{button}</TooltipTrigger>
538 |       <TooltipContent
539 |         side="right"
540 |         align="center"
541 |         hidden={state !== "collapsed" || isMobile}
542 |         {...tooltip}
543 |       />
544 |     </Tooltip>
545 |   )
546 | }
547 | 
548 | function SidebarMenuAction({
549 |   className,
550 |   asChild = false,
551 |   showOnHover = false,
552 |   ...props
553 | }: React.ComponentProps<"button"> & {
554 |   asChild?: boolean
555 |   showOnHover?: boolean
556 | }) {
557 |   const Comp = asChild ? Slot : "button"
558 | 
559 |   return (
560 |     <Comp
561 |       data-slot="sidebar-menu-action"
562 |       data-sidebar="menu-action"
563 |       className={cn(
564 |         "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
565 |         // Increases the hit area of the button on mobile.
566 |         "after:absolute after:-inset-2 md:after:hidden",
567 |         "peer-data-[size=sm]/menu-button:top-1",
568 |         "peer-data-[size=default]/menu-button:top-1.5",
569 |         "peer-data-[size=lg]/menu-button:top-2.5",
570 |         "group-data-[collapsible=icon]:hidden",
571 |         showOnHover &&
572 |           "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
573 |         className
574 |       )}
575 |       {...props}
576 |     />
577 |   )
578 | }
579 | 
580 | function SidebarMenuBadge({
581 |   className,
582 |   ...props
583 | }: React.ComponentProps<"div">) {
584 |   return (
585 |     <div
586 |       data-slot="sidebar-menu-badge"
587 |       data-sidebar="menu-badge"
588 |       className={cn(
589 |         "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
590 |         "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
591 |         "peer-data-[size=sm]/menu-button:top-1",
592 |         "peer-data-[size=default]/menu-button:top-1.5",
593 |         "peer-data-[size=lg]/menu-button:top-2.5",
594 |         "group-data-[collapsible=icon]:hidden",
595 |         className
596 |       )}
597 |       {...props}
598 |     />
599 |   )
600 | }
601 | 
602 | function SidebarMenuSkeleton({
603 |   className,
604 |   showIcon = false,
605 |   ...props
606 | }: React.ComponentProps<"div"> & {
607 |   showIcon?: boolean
608 | }) {
609 |   // Random width between 50 to 90%.
610 |   const width = React.useMemo(() => {
611 |     return `${Math.floor(Math.random() * 40) + 50}%`
612 |   }, [])
613 | 
614 |   return (
615 |     <div
616 |       data-slot="sidebar-menu-skeleton"
617 |       data-sidebar="menu-skeleton"
618 |       className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
619 |       {...props}
620 |     >
621 |       {showIcon && (
622 |         <Skeleton
623 |           className="size-4 rounded-md"
624 |           data-sidebar="menu-skeleton-icon"
625 |         />
626 |       )}
627 |       <Skeleton
628 |         className="h-4 max-w-(--skeleton-width) flex-1"
629 |         data-sidebar="menu-skeleton-text"
630 |         style={
631 |           {
632 |             "--skeleton-width": width,
633 |           } as React.CSSProperties
634 |         }
635 |       />
636 |     </div>
637 |   )
638 | }
639 | 
640 | function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
641 |   return (
642 |     <ul
643 |       data-slot="sidebar-menu-sub"
644 |       data-sidebar="menu-sub"
645 |       className={cn(
646 |         "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
647 |         "group-data-[collapsible=icon]:hidden",
648 |         className
649 |       )}
650 |       {...props}
651 |     />
652 |   )
653 | }
654 | 
655 | function SidebarMenuSubItem({
656 |   className,
657 |   ...props
658 | }: React.ComponentProps<"li">) {
659 |   return (
660 |     <li
661 |       data-slot="sidebar-menu-sub-item"
662 |       data-sidebar="menu-sub-item"
663 |       className={cn("group/menu-sub-item relative", className)}
664 |       {...props}
665 |     />
666 |   )
667 | }
668 | 
669 | function SidebarMenuSubButton({
670 |   asChild = false,
671 |   size = "md",
672 |   isActive = false,
673 |   className,
674 |   ...props
675 | }: React.ComponentProps<"a"> & {
676 |   asChild?: boolean
677 |   size?: "sm" | "md"
678 |   isActive?: boolean
679 | }) {
680 |   const Comp = asChild ? Slot : "a"
681 | 
682 |   return (
683 |     <Comp
684 |       data-slot="sidebar-menu-sub-button"
685 |       data-sidebar="menu-sub-button"
686 |       data-size={size}
687 |       data-active={isActive}
688 |       className={cn(
689 |         "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
690 |         "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
691 |         size === "sm" && "text-xs",
692 |         size === "md" && "text-sm",
693 |         "group-data-[collapsible=icon]:hidden",
694 |         className
695 |       )}
696 |       {...props}
697 |     />
698 |   )
699 | }
700 | 
701 | export {
702 |   Sidebar,
703 |   SidebarContent,
704 |   SidebarFooter,
705 |   SidebarGroup,
706 |   SidebarGroupAction,
707 |   SidebarGroupContent,
708 |   SidebarGroupLabel,
709 |   SidebarHeader,
710 |   SidebarInput,
711 |   SidebarInset,
712 |   SidebarMenu,
713 |   SidebarMenuAction,
714 |   SidebarMenuBadge,
715 |   SidebarMenuButton,
716 |   SidebarMenuItem,
717 |   SidebarMenuSkeleton,
718 |   SidebarMenuSub,
719 |   SidebarMenuSubButton,
720 |   SidebarMenuSubItem,
721 |   SidebarProvider,
722 |   SidebarRail,
723 |   SidebarSeparator,
724 |   SidebarTrigger,
725 |   useSidebar,
726 | }
```

components/ui/skeleton.tsx
```
1 | import { cn } from "@/lib/utils"
2 | 
3 | function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
4 |   return (
5 |     <div
6 |       data-slot="skeleton"
7 |       className={cn("bg-accent animate-pulse rounded-md", className)}
8 |       {...props}
9 |     />
10 |   )
11 | }
12 | 
13 | export { Skeleton }
```

components/ui/slider.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SliderPrimitive from "@radix-ui/react-slider"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Slider({
9 |   className,
10 |   defaultValue,
11 |   value,
12 |   min = 0,
13 |   max = 100,
14 |   ...props
15 | }: React.ComponentProps<typeof SliderPrimitive.Root>) {
16 |   const _values = React.useMemo(
17 |     () =>
18 |       Array.isArray(value)
19 |         ? value
20 |         : Array.isArray(defaultValue)
21 |           ? defaultValue
22 |           : [min, max],
23 |     [value, defaultValue, min, max]
24 |   )
25 | 
26 |   return (
27 |     <SliderPrimitive.Root
28 |       data-slot="slider"
29 |       defaultValue={defaultValue}
30 |       value={value}
31 |       min={min}
32 |       max={max}
33 |       className={cn(
34 |         "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
35 |         className
36 |       )}
37 |       {...props}
38 |     >
39 |       <SliderPrimitive.Track
40 |         data-slot="slider-track"
41 |         className={cn(
42 |           "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
43 |         )}
44 |       >
45 |         <SliderPrimitive.Range
46 |           data-slot="slider-range"
47 |           className={cn(
48 |             "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
49 |           )}
50 |         />
51 |       </SliderPrimitive.Track>
52 |       {Array.from({ length: _values.length }, (_, index) => (
53 |         <SliderPrimitive.Thumb
54 |           data-slot="slider-thumb"
55 |           key={index}
56 |           className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
57 |         />
58 |       ))}
59 |     </SliderPrimitive.Root>
60 |   )
61 | }
62 | 
63 | export { Slider }
```

components/ui/sonner.tsx
```
1 | "use client"
2 | 
3 | import { useTheme } from "next-themes"
4 | import { Toaster as Sonner, ToasterProps } from "sonner"
5 | 
6 | const Toaster = ({ ...props }: ToasterProps) => {
7 |   const { theme = "system" } = useTheme()
8 | 
9 |   return (
10 |     <Sonner
11 |       theme={theme as ToasterProps["theme"]}
12 |       className="toaster group"
13 |       style={
14 |         {
15 |           "--normal-bg": "var(--popover)",
16 |           "--normal-text": "var(--popover-foreground)",
17 |           "--normal-border": "var(--border)",
18 |         } as React.CSSProperties
19 |       }
20 |       {...props}
21 |     />
22 |   )
23 | }
24 | 
25 | export { Toaster }
```

components/ui/switch.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SwitchPrimitive from "@radix-ui/react-switch"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Switch({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
12 |   return (
13 |     <SwitchPrimitive.Root
14 |       data-slot="switch"
15 |       className={cn(
16 |         "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
17 |         className
18 |       )}
19 |       {...props}
20 |     >
21 |       <SwitchPrimitive.Thumb
22 |         data-slot="switch-thumb"
23 |         className={cn(
24 |           "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
25 |         )}
26 |       />
27 |     </SwitchPrimitive.Root>
28 |   )
29 | }
30 | 
31 | export { Switch }
```

components/ui/table.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | function Table({ className, ...props }: React.ComponentProps<"table">) {
8 |   return (
9 |     <div
10 |       data-slot="table-container"
11 |       className="relative w-full overflow-x-auto"
12 |     >
13 |       <table
14 |         data-slot="table"
15 |         className={cn("w-full caption-bottom text-sm", className)}
16 |         {...props}
17 |       />
18 |     </div>
19 |   )
20 | }
21 | 
22 | function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
23 |   return (
24 |     <thead
25 |       data-slot="table-header"
26 |       className={cn("[&_tr]:border-b", className)}
27 |       {...props}
28 |     />
29 |   )
30 | }
31 | 
32 | function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
33 |   return (
34 |     <tbody
35 |       data-slot="table-body"
36 |       className={cn("[&_tr:last-child]:border-0", className)}
37 |       {...props}
38 |     />
39 |   )
40 | }
41 | 
42 | function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
43 |   return (
44 |     <tfoot
45 |       data-slot="table-footer"
46 |       className={cn(
47 |         "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
48 |         className
49 |       )}
50 |       {...props}
51 |     />
52 |   )
53 | }
54 | 
55 | function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
56 |   return (
57 |     <tr
58 |       data-slot="table-row"
59 |       className={cn(
60 |         "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
61 |         className
62 |       )}
63 |       {...props}
64 |     />
65 |   )
66 | }
67 | 
68 | function TableHead({ className, ...props }: React.ComponentProps<"th">) {
69 |   return (
70 |     <th
71 |       data-slot="table-head"
72 |       className={cn(
73 |         "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
74 |         className
75 |       )}
76 |       {...props}
77 |     />
78 |   )
79 | }
80 | 
81 | function TableCell({ className, ...props }: React.ComponentProps<"td">) {
82 |   return (
83 |     <td
84 |       data-slot="table-cell"
85 |       className={cn(
86 |         "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
87 |         className
88 |       )}
89 |       {...props}
90 |     />
91 |   )
92 | }
93 | 
94 | function TableCaption({
95 |   className,
96 |   ...props
97 | }: React.ComponentProps<"caption">) {
98 |   return (
99 |     <caption
100 |       data-slot="table-caption"
101 |       className={cn("text-muted-foreground mt-4 text-sm", className)}
102 |       {...props}
103 |     />
104 |   )
105 | }
106 | 
107 | export {
108 |   Table,
109 |   TableHeader,
110 |   TableBody,
111 |   TableFooter,
112 |   TableHead,
113 |   TableRow,
114 |   TableCell,
115 |   TableCaption,
116 | }
```

components/ui/tabs.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TabsPrimitive from "@radix-ui/react-tabs"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Tabs({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof TabsPrimitive.Root>) {
12 |   return (
13 |     <TabsPrimitive.Root
14 |       data-slot="tabs"
15 |       className={cn("flex flex-col gap-2", className)}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function TabsList({
22 |   className,
23 |   ...props
24 | }: React.ComponentProps<typeof TabsPrimitive.List>) {
25 |   return (
26 |     <TabsPrimitive.List
27 |       data-slot="tabs-list"
28 |       className={cn(
29 |         "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
30 |         className
31 |       )}
32 |       {...props}
33 |     />
34 |   )
35 | }
36 | 
37 | function TabsTrigger({
38 |   className,
39 |   ...props
40 | }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
41 |   return (
42 |     <TabsPrimitive.Trigger
43 |       data-slot="tabs-trigger"
44 |       className={cn(
45 |         "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
46 |         className
47 |       )}
48 |       {...props}
49 |     />
50 |   )
51 | }
52 | 
53 | function TabsContent({
54 |   className,
55 |   ...props
56 | }: React.ComponentProps<typeof TabsPrimitive.Content>) {
57 |   return (
58 |     <TabsPrimitive.Content
59 |       data-slot="tabs-content"
60 |       className={cn("flex-1 outline-none", className)}
61 |       {...props}
62 |     />
63 |   )
64 | }
65 | 
66 | export { Tabs, TabsList, TabsTrigger, TabsContent }
```

components/ui/textarea.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
6 |   return (
7 |     <textarea
8 |       data-slot="textarea"
9 |       className={cn(
10 |         "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
11 |         className
12 |       )}
13 |       {...props}
14 |     />
15 |   )
16 | }
17 | 
18 | export { Textarea }
```

components/ui/toggle-group.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
5 | import { type VariantProps } from "class-variance-authority"
6 | 
7 | import { cn } from "@/lib/utils"
8 | import { toggleVariants } from "@/components/ui/toggle"
9 | 
10 | const ToggleGroupContext = React.createContext<
11 |   VariantProps<typeof toggleVariants>
12 | >({
13 |   size: "default",
14 |   variant: "default",
15 | })
16 | 
17 | function ToggleGroup({
18 |   className,
19 |   variant,
20 |   size,
21 |   children,
22 |   ...props
23 | }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
24 |   VariantProps<typeof toggleVariants>) {
25 |   return (
26 |     <ToggleGroupPrimitive.Root
27 |       data-slot="toggle-group"
28 |       data-variant={variant}
29 |       data-size={size}
30 |       className={cn(
31 |         "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
32 |         className
33 |       )}
34 |       {...props}
35 |     >
36 |       <ToggleGroupContext.Provider value={{ variant, size }}>
37 |         {children}
38 |       </ToggleGroupContext.Provider>
39 |     </ToggleGroupPrimitive.Root>
40 |   )
41 | }
42 | 
43 | function ToggleGroupItem({
44 |   className,
45 |   children,
46 |   variant,
47 |   size,
48 |   ...props
49 | }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
50 |   VariantProps<typeof toggleVariants>) {
51 |   const context = React.useContext(ToggleGroupContext)
52 | 
53 |   return (
54 |     <ToggleGroupPrimitive.Item
55 |       data-slot="toggle-group-item"
56 |       data-variant={context.variant || variant}
57 |       data-size={context.size || size}
58 |       className={cn(
59 |         toggleVariants({
60 |           variant: context.variant || variant,
61 |           size: context.size || size,
62 |         }),
63 |         "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
64 |         className
65 |       )}
66 |       {...props}
67 |     >
68 |       {children}
69 |     </ToggleGroupPrimitive.Item>
70 |   )
71 | }
72 | 
73 | export { ToggleGroup, ToggleGroupItem }
```

components/ui/toggle.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TogglePrimitive from "@radix-ui/react-toggle"
5 | import { cva, type VariantProps } from "class-variance-authority"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | const toggleVariants = cva(
10 |   "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
11 |   {
12 |     variants: {
13 |       variant: {
14 |         default: "bg-transparent",
15 |         outline:
16 |           "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
17 |       },
18 |       size: {
19 |         default: "h-9 px-2 min-w-9",
20 |         sm: "h-8 px-1.5 min-w-8",
21 |         lg: "h-10 px-2.5 min-w-10",
22 |       },
23 |     },
24 |     defaultVariants: {
25 |       variant: "default",
26 |       size: "default",
27 |     },
28 |   }
29 | )
30 | 
31 | function Toggle({
32 |   className,
33 |   variant,
34 |   size,
35 |   ...props
36 | }: React.ComponentProps<typeof TogglePrimitive.Root> &
37 |   VariantProps<typeof toggleVariants>) {
38 |   return (
39 |     <TogglePrimitive.Root
40 |       data-slot="toggle"
41 |       className={cn(toggleVariants({ variant, size, className }))}
42 |       {...props}
43 |     />
44 |   )
45 | }
46 | 
47 | export { Toggle, toggleVariants }
```

components/ui/tooltip.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TooltipPrimitive from "@radix-ui/react-tooltip"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function TooltipProvider({
9 |   delayDuration = 0,
10 |   ...props
11 | }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
12 |   return (
13 |     <TooltipPrimitive.Provider
14 |       data-slot="tooltip-provider"
15 |       delayDuration={delayDuration}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function Tooltip({
22 |   ...props
23 | }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
24 |   return (
25 |     <TooltipProvider>
26 |       <TooltipPrimitive.Root data-slot="tooltip" {...props} />
27 |     </TooltipProvider>
28 |   )
29 | }
30 | 
31 | function TooltipTrigger({
32 |   ...props
33 | }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
34 |   return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
35 | }
36 | 
37 | function TooltipContent({
38 |   className,
39 |   sideOffset = 0,
40 |   children,
41 |   ...props
42 | }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
43 |   return (
44 |     <TooltipPrimitive.Portal>
45 |       <TooltipPrimitive.Content
46 |         data-slot="tooltip-content"
47 |         sideOffset={sideOffset}
48 |         className={cn(
49 |           "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
50 |           className
51 |         )}
52 |         {...props}
53 |       >
54 |         {children}
55 |         <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
56 |       </TooltipPrimitive.Content>
57 |     </TooltipPrimitive.Portal>
58 |   )
59 | }
60 | 
61 | export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

supabase/migrations/20250629085550_create_database_enums.sql
```
1 | -- Create Database Enums as specified in the PRD
2 | 
3 | -- Account Types Enum
4 | CREATE TYPE account_type AS ENUM ('bank_account', 'credit_card', 'investment_account');
5 | 
6 | -- Category Types Enum
7 | CREATE TYPE category_type AS ENUM ('expense', 'income', 'investment');
8 | 
9 | -- Budget Frequency Enum
10 | CREATE TYPE budget_frequency AS ENUM ('weekly', 'monthly', 'one_time');
11 | 
12 | -- Transaction Types Enum
13 | CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
```

supabase/migrations/20250629085556_create_user_settings_table.sql
```
1 | -- Create User Settings Table as specified in the PRD
2 | 
3 | CREATE TABLE user_settings (
4 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
5 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
6 |     currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
7 |     financial_month_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_month_start_day >= 1 AND financial_month_start_day <= 31),
8 |     financial_week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_week_start_day >= 0 AND financial_week_start_day <= 6), -- 0 = Sunday, 6 = Saturday
9 |     onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
10 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
11 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
12 |     UNIQUE(user_id)
13 | );
14 | 
15 | -- Enable Row Level Security
16 | ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
17 | 
18 | -- Create RLS Policies
19 | CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
20 | CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
21 | CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
```

supabase/migrations/20250629085602_create_accounts_table.sql
```
1 | -- Create Accounts Table as specified in the PRD
2 | 
3 | CREATE TABLE accounts (
4 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
5 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
6 |     name VARCHAR(255) NOT NULL,
7 |     type account_type NOT NULL,
8 |     initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
9 |     current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
10 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
11 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
12 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
13 | );
14 | 
15 | -- Create indexes
16 | CREATE INDEX idx_accounts_user_id ON accounts(user_id);
17 | CREATE INDEX idx_accounts_type ON accounts(type);
18 | 
19 | -- Enable Row Level Security
20 | ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
21 | 
22 | -- Create RLS Policies
23 | CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
24 | CREATE POLICY "Users can create own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
25 | CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
26 | CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);
```

supabase/migrations/20250629085607_create_categories_table.sql
```
1 | -- Create Categories Table as specified in the PRD
2 | 
3 | CREATE TABLE categories (
4 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
5 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
6 |     name VARCHAR(255) NOT NULL,
7 |     type category_type NOT NULL,
8 |     icon VARCHAR(10), -- Emoji icon for UI representation
9 |     budget_amount DECIMAL(15, 2),
10 |     budget_frequency budget_frequency,
11 |     is_active BOOLEAN NOT NULL DEFAULT TRUE,
12 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
13 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
14 |     CONSTRAINT chk_budget_consistency CHECK (
15 |         (budget_amount IS NULL AND budget_frequency IS NULL) OR
16 |         (budget_amount IS NOT NULL AND budget_frequency IS NOT NULL)
17 |     )
18 | );
19 | 
20 | -- Create indexes
21 | CREATE INDEX idx_categories_user_id ON categories(user_id);
22 | CREATE INDEX idx_categories_type ON categories(type);
23 | 
24 | -- Enable Row Level Security
25 | ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
26 | 
27 | -- Create RLS Policies
28 | CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
29 | CREATE POLICY "Users can create own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
30 | CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
31 | CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
```

supabase/migrations/20250629085614_create_transactions_table.sql
```
1 | -- Create Transactions Table as specified in the PRD
2 | 
3 | CREATE TABLE transactions (
4 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
5 |     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
6 |     type transaction_type NOT NULL,
7 |     amount DECIMAL(15, 2) NOT NULL, -- Can be negative for refunds
8 |     description TEXT,
9 |     transaction_date DATE NOT NULL,
10 |     
11 |     -- For income and expense transactions
12 |     account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
13 |     category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
14 |     
15 |     -- For transfer transactions
16 |     from_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
17 |     to_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
18 |     
19 |     
20 |     
21 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
22 |     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
23 |     
24 |     CONSTRAINT chk_transaction_consistency CHECK (
25 |         (type IN ('income', 'expense') AND account_id IS NOT NULL AND category_id IS NOT NULL AND from_account_id IS NULL AND to_account_id IS NULL) OR
26 |         (type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL AND account_id IS NULL AND category_id IS NULL)
27 |     )
28 | );
29 | 
30 | -- Create indexes
31 | CREATE INDEX idx_transactions_user_id ON transactions(user_id);
32 | CREATE INDEX idx_transactions_date ON transactions(transaction_date);
33 | CREATE INDEX idx_transactions_type ON transactions(type);
34 | CREATE INDEX idx_transactions_account ON transactions(account_id);
35 | CREATE INDEX idx_transactions_category ON transactions(category_id);
36 | 
37 | -- Enable Row Level Security
38 | ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
39 | 
40 | -- Create RLS Policies
41 | CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
42 | CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
43 | CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
44 | CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);
```

supabase/migrations/20250629085615_create_balance_ledger_table.sql
```
1 | -- Create Balance Ledger Table (Balance History) as specified in the PRD
2 | 
3 | CREATE TABLE balance_ledger (
4 |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
5 |     account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
6 |     transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
7 |     balance_before DECIMAL(15, 2) NOT NULL,
8 |     balance_after DECIMAL(15, 2) NOT NULL,
9 |     change_amount DECIMAL(15, 2) NOT NULL,
10 |     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
11 | );
12 | 
13 | -- Create indexes
14 | CREATE INDEX idx_ledger_account ON balance_ledger(account_id);
15 | CREATE INDEX idx_ledger_transaction ON balance_ledger(transaction_id);
16 | CREATE INDEX idx_ledger_created ON balance_ledger(created_at);
```

supabase/migrations/20250629085616_complete_rls_policies.sql
```
1 | -- Complete Missing RLS Policies
2 | 
3 | -- Add missing DELETE policy for user_settings table
4 | CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);
5 | 
6 | -- Enable Row Level Security on balance_ledger table
7 | ALTER TABLE balance_ledger ENABLE ROW LEVEL SECURITY;
8 | 
9 | -- Create RLS Policies for balance_ledger table
10 | -- Note: balance_ledger doesn't have user_id directly, so we join through accounts table
11 | 
12 | CREATE POLICY "Users can view own balance ledger" ON balance_ledger FOR SELECT 
13 | USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
14 | 
15 | CREATE POLICY "Users can insert own balance ledger" ON balance_ledger FOR INSERT 
16 | WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
17 | 
18 | CREATE POLICY "Users can update own balance ledger" ON balance_ledger FOR UPDATE 
19 | USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
20 | 
21 | CREATE POLICY "Users can delete own balance ledger" ON balance_ledger FOR DELETE 
22 | USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())); 
```

supabase/migrations/20250629085617_create_database_functions_and_triggers.sql
```
1 | -- Create Database Functions and Triggers as specified in the PRD
2 | 
3 | -- Function to get financial summary
4 | CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID)
5 | RETURNS TABLE (
6 |     total_income DECIMAL(15, 2),
7 |     total_expenses DECIMAL(15, 2),
8 |     net_savings DECIMAL(15, 2),
9 |     period_start DATE,
10 |     period_end DATE
11 | ) AS $$
12 | DECLARE
13 |     v_month_start_day INTEGER;
14 |     v_current_date DATE := CURRENT_DATE;
15 |     v_period_start DATE;
16 |     v_period_end DATE;
17 |     v_total_income DECIMAL(15, 2);
18 |     v_total_expenses DECIMAL(15, 2);
19 | BEGIN
20 |     -- Get user's financial month start day
21 |     SELECT financial_month_start_day
22 |     INTO v_month_start_day
23 |     FROM user_settings
24 |     WHERE user_id = p_user_id;
25 | 
26 |     -- If no settings, use default (day 1)
27 |     IF NOT FOUND THEN
28 |         v_month_start_day := 1;
29 |     END IF;
30 | 
31 |     -- Calculate custom month period
32 |     IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
33 |         v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
34 |         v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
35 |     ELSE
36 |         v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
37 |         v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
38 |     END IF;
39 | 
40 |     -- Calculate total income for the period
41 |     SELECT COALESCE(SUM(t.amount), 0)
42 |     INTO v_total_income
43 |     FROM transactions t
44 |     WHERE t.user_id = p_user_id
45 |         AND t.type = 'income'
46 |         AND t.transaction_date >= v_period_start
47 |         AND t.transaction_date <= v_period_end;
48 | 
49 |     -- Calculate total expenses for the period
50 |     SELECT COALESCE(SUM(t.amount), 0)
51 |     INTO v_total_expenses
52 |     FROM transactions t
53 |     WHERE t.user_id = p_user_id
54 |         AND t.type = 'expense'
55 |         AND t.transaction_date >= v_period_start
56 |         AND t.transaction_date <= v_period_end;
57 | 
58 |     -- Set output variables
59 |     total_income := v_total_income;
60 |     total_expenses := v_total_expenses;
61 |     net_savings := v_total_income - v_total_expenses;
62 |     period_start := v_period_start;
63 |     period_end := v_period_end;
64 | 
65 |     RETURN NEXT;
66 | END;
67 | $$ LANGUAGE plpgsql;
68 | 
69 | -- Function to calculate budget progress for expense categories
70 | CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
71 | RETURNS TABLE (
72 |     category_id UUID,
73 |     category_name VARCHAR(255),
74 |     category_type category_type,
75 |     category_icon VARCHAR(10),
76 |     budget_amount DECIMAL(15, 2),
77 |     budget_frequency budget_frequency,
78 |     spent_amount DECIMAL(15, 2),
79 |     remaining_amount DECIMAL(15, 2),
80 |     progress_percentage DECIMAL(5, 2),
81 |     period_start DATE,
82 |     period_end DATE
83 | ) AS $$
84 | DECLARE
85 |     v_month_start_day INTEGER;
86 |     v_week_start_day INTEGER;
87 |     v_current_date DATE := CURRENT_DATE;
88 |     v_period_start DATE;
89 |     v_period_end DATE;
90 | BEGIN
91 |     -- Get user's financial period settings
92 |     SELECT financial_month_start_day, financial_week_start_day
93 |     INTO v_month_start_day, v_week_start_day
94 |     FROM user_settings
95 |     WHERE user_id = p_user_id;
96 | 
97 |     -- For each expense category with budget
98 |     FOR category_id, category_name, category_type, category_icon, budget_amount, budget_frequency IN
99 |         SELECT c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency
100 |         FROM categories c
101 |         WHERE c.user_id = p_user_id AND c.type = 'expense' AND c.budget_amount IS NOT NULL AND c.is_active = TRUE
102 |     LOOP
103 |         -- Calculate period based on frequency and user settings
104 |         IF budget_frequency = 'monthly' THEN
105 |             -- Calculate custom month period
106 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
107 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
108 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
109 |             ELSE
110 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
111 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
112 |             END IF;
113 |         ELSIF budget_frequency = 'weekly' THEN
114 |             -- Calculate custom week period
115 |             v_period_start := v_current_date - ((EXTRACT(DOW FROM v_current_date)::INTEGER - v_week_start_day + 7) % 7) * INTERVAL '1 day';
116 |             v_period_end := v_period_start + INTERVAL '6 days';
117 |         ELSIF budget_frequency = 'one_time' THEN
118 |             -- For one-time budgets, consider all transactions
119 |             v_period_start := '1900-01-01'::DATE;
120 |             v_period_end := '2100-12-31'::DATE;
121 |         END IF;
122 | 
123 |         -- Calculate spent amount for the period
124 |         SELECT COALESCE(SUM(t.amount), 0)
125 |         INTO spent_amount
126 |         FROM transactions t
127 |         WHERE t.category_id = category_id
128 |             AND t.transaction_date >= v_period_start
129 |             AND t.transaction_date <= v_period_end
130 |             AND t.type = 'expense';
131 | 
132 |         -- Calculate remaining and percentage
133 |         remaining_amount := budget_amount - spent_amount;
134 |         progress_percentage := CASE 
135 |             WHEN budget_amount > 0 THEN (spent_amount / budget_amount * 100)
136 |             ELSE 0
137 |         END;
138 | 
139 |         -- Return the row
140 |         RETURN NEXT;
141 |     END LOOP;
142 | END;
143 | $$ LANGUAGE plpgsql;
144 | 
145 | -- Function to get investment progress
146 | CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
147 | RETURNS TABLE (
148 |     category_id UUID,
149 |     category_name VARCHAR(255),
150 |     category_icon VARCHAR(10),
151 |     target_amount DECIMAL(15, 2),
152 |     target_frequency budget_frequency,
153 |     invested_amount DECIMAL(15, 2),
154 |     remaining_amount DECIMAL(15, 2),
155 |     progress_percentage DECIMAL(5, 2),
156 |     period_start DATE,
157 |     period_end DATE
158 | ) AS $$
159 | DECLARE
160 |     v_month_start_day INTEGER;
161 |     v_current_date DATE := CURRENT_DATE;
162 |     v_period_start DATE;
163 |     v_period_end DATE;
164 |     inv_category RECORD;
165 | BEGIN
166 |     -- Get user's financial period settings
167 |     SELECT financial_month_start_day
168 |     INTO v_month_start_day
169 |     FROM user_settings
170 |     WHERE user_id = p_user_id;
171 | 
172 |     -- If no settings, use default (day 1)
173 |     IF NOT FOUND THEN
174 |         v_month_start_day := 1;
175 |     END IF;
176 | 
177 |     -- For each investment category with a target
178 |     FOR inv_category IN
179 |         SELECT c.id, c.name, c.icon, c.budget_amount, c.budget_frequency
180 |         FROM categories c
181 |         WHERE c.user_id = p_user_id
182 |           AND c.type = 'investment'
183 |           AND c.budget_amount IS NOT NULL
184 |           AND c.is_active = TRUE
185 |     LOOP
186 |         -- Calculate period based on frequency and user settings
187 |         IF inv_category.budget_frequency = 'monthly' THEN
188 |             -- Calculate custom month period
189 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
190 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
191 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
192 |             ELSE
193 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
194 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
195 |             END IF;
196 |         ELSIF inv_category.budget_frequency = 'one_time' THEN
197 |             -- For one-time targets, consider all transactions
198 |             v_period_start := '1900-01-01'::DATE;
199 |             v_period_end := '2100-12-31'::DATE;
200 |         ELSE
201 |             -- Skip other frequencies for investments
202 |             CONTINUE;
203 |         END IF;
204 | 
205 |         -- Set output variables from the loop
206 |         category_id := inv_category.id;
207 |         category_name := inv_category.name;
208 |         category_icon := inv_category.icon;
209 |         target_amount := inv_category.budget_amount;
210 |         target_frequency := inv_category.budget_frequency;
211 |         period_start := v_period_start;
212 |         period_end := v_period_end;
213 | 
214 |         -- Calculate invested amount for the period
215 |         SELECT COALESCE(SUM(t.amount), 0)
216 |         INTO invested_amount
217 |         FROM transactions t
218 |         WHERE t.user_id = p_user_id
219 |             AND t.type = 'transfer'
220 |             AND t.investment_category_id = inv_category.id
221 |             AND t.transaction_date >= v_period_start
222 |             AND t.transaction_date <= v_period_end;
223 | 
224 |         -- Calculate remaining and percentage
225 |         remaining_amount := target_amount - invested_amount;
226 |         progress_percentage := CASE
227 |             WHEN target_amount > 0 THEN (invested_amount / target_amount * 100)
228 |             ELSE 0
229 |         END;
230 | 
231 |         -- Return the row
232 |         RETURN NEXT;
233 |     END LOOP;
234 | END;
235 | $$ LANGUAGE plpgsql;
236 | 
237 | -- Function to update account balance and record ledger entry
238 | CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
239 | RETURNS TRIGGER AS $$
240 | DECLARE
241 |     v_balance_before DECIMAL(15, 2);
242 |     v_balance_after DECIMAL(15, 2);
243 |     v_amount DECIMAL(15, 2);
244 | BEGIN
245 |     -- Use absolute value for amount calculations
246 |     v_amount := ABS(NEW.amount);
247 |     
248 |     IF TG_OP = 'INSERT' THEN
249 |         IF NEW.type = 'income' THEN
250 |             -- For income: positive amount increases balance, negative amount (refund) decreases balance
251 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
252 |             v_balance_after := v_balance_before + NEW.amount;
253 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
254 |             
255 |             -- Record in ledger
256 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
257 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
258 |             
259 |         ELSIF NEW.type = 'expense' THEN
260 |             -- For expense: positive amount decreases balance (normal expense), negative amount increases balance (refund)
261 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
262 |             
263 |             -- Credit cards: expenses increase balance (debt), refunds decrease balance
264 |             IF (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN
265 |                 v_balance_after := v_balance_before + NEW.amount;
266 |             ELSE
267 |                 -- Other accounts: expenses decrease balance, refunds increase balance
268 |                 v_balance_after := v_balance_before - NEW.amount;
269 |             END IF;
270 |             
271 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
272 |             
273 |             -- Record in ledger
274 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
275 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
276 |             
277 |         ELSIF NEW.type = 'transfer' THEN
278 |             -- Transfers always use positive amounts
279 |             -- From account
280 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
281 |             
282 |             -- Credit card as source: transfer decreases balance (paying off debt)
283 |             IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
284 |                 v_balance_after := v_balance_before - v_amount;
285 |             ELSE
286 |                 -- Other accounts: transfer decreases balance
287 |                 v_balance_after := v_balance_before - v_amount;
288 |             END IF;
289 |             
290 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
291 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
292 |             VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, -v_amount);
293 |             
294 |             -- To account
295 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
296 |             
297 |             -- Credit card as destination: transfer decreases balance (paying off debt)
298 |             IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
299 |                 v_balance_after := v_balance_before - v_amount;
300 |             ELSE
301 |                 -- Other accounts: transfer increases balance
302 |                 v_balance_after := v_balance_before + v_amount;
303 |             END IF;
304 |             
305 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
306 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
307 |             VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, v_amount);
308 |         END IF;
309 |         
310 |     ELSIF TG_OP = 'UPDATE' THEN
311 |         -- For updates, it's safer to recalculate from ledger history
312 |         -- This is a complex operation and might be better handled at application level
313 |         RAISE EXCEPTION 'Transaction updates should be handled at application level for better control';
314 |         
315 |     ELSIF TG_OP = 'DELETE' THEN
316 |         -- For deletes, reverse the transaction based on ledger history
317 |         -- This ensures consistency with the historical record
318 |         RAISE EXCEPTION 'Transaction deletion should be handled at application level for better control';
319 |     END IF;
320 |     
321 |     RETURN NEW;
322 | END;
323 | $$ LANGUAGE plpgsql;
324 | 
325 | -- Create trigger for account balance updates
326 | CREATE TRIGGER trigger_update_account_balance
327 | AFTER INSERT ON transactions
328 | FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();
329 | 
330 | -- Function to update timestamps
331 | CREATE OR REPLACE FUNCTION update_updated_at_column()
332 | RETURNS TRIGGER AS $$
333 | BEGIN
334 |     NEW.updated_at = NOW();
335 |     RETURN NEW;
336 | END;
337 | $$ LANGUAGE plpgsql;
338 | 
339 | -- Apply timestamp triggers to all tables
340 | CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
341 | CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
342 | CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
343 | CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

supabase/migrations/20250629094304_fix_credit_card_transfer_logic.sql
```
1 | -- Correct the logic for credit card transfers in the balance update function.
2 | -- A transfer FROM a credit card (cash advance) should INCREASE the balance (debt).
3 | -- A transfer TO a credit card (payment) should DECREASE the balance (debt).
4 | 
5 | CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
6 | RETURNS TRIGGER AS $$
7 | DECLARE
8 |     v_balance_before DECIMAL(15, 2);
9 |     v_balance_after DECIMAL(15, 2);
10 |     v_amount DECIMAL(15, 2);
11 | BEGIN
12 |     -- Use absolute value for amount calculations in transfers
13 |     v_amount := ABS(NEW.amount);
14 |     
15 |     IF TG_OP = 'INSERT' THEN
16 |         IF NEW.type = 'income' THEN
17 |             -- For income: positive amount increases balance, negative amount (refund) decreases balance
18 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
19 |             v_balance_after := v_balance_before + NEW.amount;
20 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
21 |             
22 |             -- Record in ledger
23 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
24 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
25 |             
26 |         ELSIF NEW.type = 'expense' THEN
27 |             -- For expense: positive amount decreases balance (normal expense), negative amount increases balance (refund)
28 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
29 |             
30 |             -- Credit cards: expenses increase balance (debt), refunds decrease balance
31 |             IF (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN
32 |                 v_balance_after := v_balance_before + NEW.amount;
33 |             ELSE
34 |                 -- Other accounts: expenses decrease balance, refunds increase balance
35 |                 v_balance_after := v_balance_before - NEW.amount;
36 |             END IF;
37 |             
38 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
39 |             
40 |             -- Record in ledger. For credit cards, an expense is a positive change in balance (debt increases).
41 |             -- For other accounts, an expense is a negative change.
42 |             -- The sign of NEW.amount already handles this.
43 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
44 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, 
45 |                 CASE 
46 |                     WHEN (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN NEW.amount 
47 |                     ELSE -NEW.amount 
48 |                 END);
49 |             
50 |         ELSIF NEW.type = 'transfer' THEN
51 |             -- From account
52 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
53 |             
54 |             -- **FIXED LOGIC**: Credit card as source (cash advance): transfer INCREASES balance (debt)
55 |             IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
56 |                 v_balance_after := v_balance_before + v_amount;
57 |             ELSE
58 |                 -- Other accounts: transfer decreases balance
59 |                 v_balance_after := v_balance_before - v_amount;
60 |             END IF;
61 |             
62 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
63 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
64 |             VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, 
65 |                 CASE 
66 |                     WHEN (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN v_amount 
67 |                     ELSE -v_amount 
68 |                 END);
69 |             
70 |             -- To account
71 |             SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
72 |             
73 |             -- Credit card as destination (payment): transfer DECREASES balance (paying off debt)
74 |             IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
75 |                 v_balance_after := v_balance_before - v_amount;
76 |             ELSE
77 |                 -- Other accounts: transfer increases balance
78 |                 v_balance_after := v_balance_before + v_amount;
79 |             END IF;
80 |             
81 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
82 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
83 |             VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, 
84 |                 CASE 
85 |                     WHEN (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN -v_amount 
86 |                     ELSE v_amount 
87 |                 END);
88 |         END IF;
89 |         
90 |     ELSIF TG_OP = 'UPDATE' THEN
91 |         -- It's safer to recalculate from ledger history.
92 |         -- This is a complex operation and better handled at application level.
93 |         RAISE EXCEPTION 'Transaction updates should be handled at the application level for better control.';
94 |         
95 |     ELSIF TG_OP = 'DELETE' THEN
96 |         -- Reversing the transaction based on ledger history ensures consistency.
97 |         -- This is also better handled at the application level.
98 |         RAISE EXCEPTION 'Transaction deletion should be handled at the application level for better control.';
99 |     END IF;
100 |     
101 |     RETURN NEW;
102 | END;
103 | $$ LANGUAGE plpgsql;
```

supabase/migrations/20250629094305_fix_investment_progress_function.sql
```
1 | -- Description: This migration fixes a bug where the get_investment_progress function
2 | -- referenced a non-existent column (investment_category_id) in the transactions table.
3 | -- This script adds the column and updates the necessary constraints to ensure data integrity.
4 | 
5 | -- Step 1: Add the investment_category_id column to the transactions table.
6 | -- This column will store a reference to an investment goal category for transfer transactions.
7 | ALTER TABLE public.transactions
8 | ADD COLUMN investment_category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;
9 | 
10 | -- Step 2: Create an index on the new column for better query performance.
11 | CREATE INDEX idx_transactions_investment_category ON public.transactions(investment_category_id);
12 | 
13 | -- Step 3: Drop the existing check constraint so it can be replaced.
14 | ALTER TABLE public.transactions
15 | DROP CONSTRAINT chk_transaction_consistency;
16 | 
17 | -- Step 4: Re-add the check constraint with updated logic.
18 | -- The new logic ensures that:
19 | -- 1. For 'income' or 'expense' types, investment_category_id MUST be NULL.
20 | -- 2. For 'transfer' type, the original rules apply, and investment_category_id is optional.
21 | ALTER TABLE public.transactions
22 | ADD CONSTRAINT chk_transaction_consistency CHECK (
23 |     (
24 |         type IN ('income', 'expense') AND
25 |         account_id IS NOT NULL AND
26 |         category_id IS NOT NULL AND
27 |         from_account_id IS NULL AND
28 |         to_account_id IS NULL AND
29 |         investment_category_id IS NULL
30 |     ) OR (
31 |         type = 'transfer' AND
32 |         from_account_id IS NOT NULL AND
33 |         to_account_id IS NOT NULL AND
34 |         account_id IS NULL AND
35 |         category_id IS NULL
36 |     )
37 | );
38 | 
39 | -- Step 5: Refresh the get_investment_progress function to ensure it recognizes the new column.
40 | CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
41 | RETURNS TABLE (
42 |     category_id UUID,
43 |     category_name VARCHAR(255),
44 |     category_icon VARCHAR(10),
45 |     target_amount DECIMAL(15, 2),
46 |     target_frequency budget_frequency,
47 |     invested_amount DECIMAL(15, 2),
48 |     remaining_amount DECIMAL(15, 2),
49 |     progress_percentage DECIMAL(5, 2),
50 |     period_start DATE,
51 |     period_end DATE
52 | ) AS $$
53 | DECLARE
54 |     v_month_start_day INTEGER;
55 |     v_current_date DATE := CURRENT_DATE;
56 |     v_period_start DATE;
57 |     v_period_end DATE;
58 |     inv_category RECORD;
59 | BEGIN
60 |     -- Get user's financial period settings
61 |     SELECT financial_month_start_day
62 |     INTO v_month_start_day
63 |     FROM user_settings
64 |     WHERE user_id = p_user_id;
65 | 
66 |     -- If no settings, use default (day 1)
67 |     IF NOT FOUND THEN
68 |         v_month_start_day := 1;
69 |     END IF;
70 | 
71 |     -- For each investment category with a target
72 |     FOR inv_category IN
73 |         SELECT c.id, c.name, c.icon, c.budget_amount, c.budget_frequency
74 |         FROM categories c
75 |         WHERE c.user_id = p_user_id
76 |           AND c.type = 'investment'
77 |           AND c.budget_amount IS NOT NULL
78 |           AND c.is_active = TRUE
79 |     LOOP
80 |         -- Calculate period based on frequency and user settings
81 |         IF inv_category.budget_frequency = 'monthly' THEN
82 |             -- Calculate custom month period
83 |             IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
84 |                 v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
85 |                 v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
86 |             ELSE
87 |                 v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
88 |                 v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
89 |             END IF;
90 |         ELSIF inv_category.budget_frequency = 'one_time' THEN
91 |             -- For one-time targets, consider all transactions
92 |             v_period_start := '1900-01-01'::DATE;
93 |             v_period_end := '2100-12-31'::DATE;
94 |         ELSE
95 |             -- Skip other frequencies for investments
96 |             CONTINUE;
97 |         END IF;
98 | 
99 |         -- Set output variables from the loop
100 |         category_id := inv_category.id;
101 |         category_name := inv_category.name;
102 |         category_icon := inv_category.icon;
103 |         target_amount := inv_category.budget_amount;
104 |         target_frequency := inv_category.budget_frequency;
105 |         period_start := v_period_start;
106 |         period_end := v_period_end;
107 | 
108 |         -- Calculate invested amount for the period
109 |         SELECT COALESCE(SUM(t.amount), 0)
110 |         INTO invested_amount
111 |         FROM transactions t
112 |         WHERE t.user_id = p_user_id
113 |             AND t.type = 'transfer'
114 |             AND t.investment_category_id = inv_category.id
115 |             AND t.transaction_date >= v_period_start
116 |             AND t.transaction_date <= v_period_end;
117 | 
118 |         -- Calculate remaining and percentage
119 |         remaining_amount := target_amount - invested_amount;
120 |         progress_percentage := CASE
121 |             WHEN target_amount > 0 THEN (invested_amount / target_amount * 100)
122 |             ELSE 0
123 |         END;
124 | 
125 |         -- Return the row
126 |         RETURN NEXT;
127 |     END LOOP;
128 | END;
129 | $$ LANGUAGE plpgsql; 
```

supabase/migrations/20250630000000_fix_credit_card_income_logic.sql
```
1 | -- Fix the credit card income logic in the balance update function.
2 | -- For credit cards:
3 | -- - Income transactions (payments) should DECREASE the balance (reduce debt)
4 | -- - Expense transactions should INCREASE the balance (increase debt)
5 | 
6 | CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
7 | RETURNS TRIGGER AS $$
8 | DECLARE
9 |     v_balance_before DECIMAL(15, 2);
10 |     v_balance_after DECIMAL(15, 2);
11 |     v_amount DECIMAL(15, 2);
12 |     v_account_type account_type;
13 | BEGIN
14 |     -- Use absolute value for amount calculations in transfers
15 |     v_amount := ABS(NEW.amount);
16 |     
17 |     IF TG_OP = 'INSERT' THEN
18 |         IF NEW.type = 'income' THEN
19 |             -- Get account type and current balance
20 |             SELECT type, current_balance INTO v_account_type, v_balance_before 
21 |             FROM accounts WHERE id = NEW.account_id;
22 |             
23 |             -- Credit cards: income (payments) decreases balance (reduces debt)
24 |             -- Other accounts: income increases balance
25 |             IF v_account_type = 'credit_card' THEN
26 |                 v_balance_after := v_balance_before - NEW.amount;
27 |             ELSE
28 |                 v_balance_after := v_balance_before + NEW.amount;
29 |             END IF;
30 |             
31 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
32 |             
33 |             -- Record in ledger with appropriate change amount
34 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
35 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, 
36 |                 CASE 
37 |                     WHEN v_account_type = 'credit_card' THEN -NEW.amount 
38 |                     ELSE NEW.amount 
39 |                 END);
40 |             
41 |         ELSIF NEW.type = 'expense' THEN
42 |             -- Get account type and current balance
43 |             SELECT type, current_balance INTO v_account_type, v_balance_before 
44 |             FROM accounts WHERE id = NEW.account_id;
45 |             
46 |             -- Credit cards: expenses increase balance (debt), refunds decrease balance
47 |             -- Other accounts: expenses decrease balance, refunds increase balance
48 |             IF v_account_type = 'credit_card' THEN
49 |                 v_balance_after := v_balance_before + NEW.amount;
50 |             ELSE
51 |                 v_balance_after := v_balance_before - NEW.amount;
52 |             END IF;
53 |             
54 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
55 |             
56 |             -- Record in ledger with appropriate change amount
57 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
58 |             VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, 
59 |                 CASE 
60 |                     WHEN v_account_type = 'credit_card' THEN NEW.amount 
61 |                     ELSE -NEW.amount 
62 |                 END);
63 |             
64 |         ELSIF NEW.type = 'transfer' THEN
65 |             -- From account
66 |             SELECT type, current_balance INTO v_account_type, v_balance_before 
67 |             FROM accounts WHERE id = NEW.from_account_id;
68 |             
69 |             -- Credit card as source (cash advance): transfer INCREASES balance (debt)
70 |             -- Other accounts: transfer decreases balance
71 |             IF v_account_type = 'credit_card' THEN
72 |                 v_balance_after := v_balance_before + v_amount;
73 |             ELSE
74 |                 v_balance_after := v_balance_before - v_amount;
75 |             END IF;
76 |             
77 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
78 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
79 |             VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, 
80 |                 CASE 
81 |                     WHEN v_account_type = 'credit_card' THEN v_amount 
82 |                     ELSE -v_amount 
83 |                 END);
84 |             
85 |             -- To account
86 |             SELECT type, current_balance INTO v_account_type, v_balance_before 
87 |             FROM accounts WHERE id = NEW.to_account_id;
88 |             
89 |             -- Credit card as destination (payment): transfer DECREASES balance (paying off debt)
90 |             -- Other accounts: transfer increases balance
91 |             IF v_account_type = 'credit_card' THEN
92 |                 v_balance_after := v_balance_before - v_amount;
93 |             ELSE
94 |                 v_balance_after := v_balance_before + v_amount;
95 |             END IF;
96 |             
97 |             UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
98 |             INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
99 |             VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, 
100 |                 CASE 
101 |                     WHEN v_account_type = 'credit_card' THEN -v_amount 
102 |                     ELSE v_amount 
103 |                 END);
104 |         END IF;
105 |         
106 |     ELSIF TG_OP = 'UPDATE' THEN
107 |         -- It's safer to recalculate from ledger history.
108 |         -- This is a complex operation and better handled at application level.
109 |         RAISE EXCEPTION 'Transaction updates should be handled at the application level for better control.';
110 |         
111 |     ELSIF TG_OP = 'DELETE' THEN
112 |         -- Reversing the transaction based on ledger history ensures consistency.
113 |         -- This is also better handled at the application level.
114 |         RAISE EXCEPTION 'Transaction deletion should be handled at the application level for better control.';
115 |     END IF;
116 |     
117 |     RETURN NEW;
118 | END;
119 | $$ LANGUAGE plpgsql;
```

supabase/.branches/_current_branch
```
1 | main
```

.cursor/rules/taskmaster/dev_workflow.mdc
```
1 | ---
2 | description: Guide for using Taskmaster to manage task-driven development workflows
3 | globs: **/*
4 | alwaysApply: true
5 | ---
6 | 
7 | # Taskmaster Development Workflow
8 | 
9 | This guide outlines the standard process for using Taskmaster to manage software development projects. It is written as a set of instructions for you, the AI agent.
10 | 
11 | - **Your Default Stance**: For most projects, the user can work directly within the `master` task context. Your initial actions should operate on this default context unless a clear pattern for multi-context work emerges.
12 | - **Your Goal**: Your role is to elevate the user's workflow by intelligently introducing advanced features like **Tagged Task Lists** when you detect the appropriate context. Do not force tags on the user; suggest them as a helpful solution to a specific need.
13 | 
14 | ## The Basic Loop
15 | The fundamental development cycle you will facilitate is:
16 | 1.  **`list`**: Show the user what needs to be done.
17 | 2.  **`next`**: Help the user decide what to work on.
18 | 3.  **`show <id>`**: Provide details for a specific task.
19 | 4.  **`expand <id>`**: Break down a complex task into smaller, manageable subtasks.
20 | 5.  **Implement**: The user writes the code and tests.
21 | 6.  **`update-subtask`**: Log progress and findings on behalf of the user.
22 | 7.  **`set-status`**: Mark tasks and subtasks as `done` as work is completed.
23 | 8.  **Repeat**.
24 | 
25 | All your standard command executions should operate on the user's current task context, which defaults to `master`.
26 | 
27 | ---
28 | 
29 | ## Standard Development Workflow Process
30 | 
31 | ### Simple Workflow (Default Starting Point)
32 | 
33 | For new projects or when users are getting started, operate within the `master` tag context:
34 | 
35 | -   Start new projects by running `initialize_project` tool / `task-master init` or `parse_prd` / `task-master parse-prd --input='<prd-file.txt>'` (see @`taskmaster.mdc`) to generate initial tasks.json with tagged structure
36 | -   Configure rule sets during initialization with `--rules` flag (e.g., `task-master init --rules cursor,windsurf`) or manage them later with `task-master rules add/remove` commands  
37 | -   Begin coding sessions with `get_tasks` / `task-master list` (see @`taskmaster.mdc`) to see current tasks, status, and IDs
38 | -   Determine the next task to work on using `next_task` / `task-master next` (see @`taskmaster.mdc`)
39 | -   Analyze task complexity with `analyze_project_complexity` / `task-master analyze-complexity --research` (see @`taskmaster.mdc`) before breaking down tasks
40 | -   Review complexity report using `complexity_report` / `task-master complexity-report` (see @`taskmaster.mdc`)
41 | -   Select tasks based on dependencies (all marked 'done'), priority level, and ID order
42 | -   View specific task details using `get_task` / `task-master show <id>` (see @`taskmaster.mdc`) to understand implementation requirements
43 | -   Break down complex tasks using `expand_task` / `task-master expand --id=<id> --force --research` (see @`taskmaster.mdc`) with appropriate flags like `--force` (to replace existing subtasks) and `--research`
44 | -   Implement code following task details, dependencies, and project standards
45 | -   Mark completed tasks with `set_task_status` / `task-master set-status --id=<id> --status=done` (see @`taskmaster.mdc`)
46 | -   Update dependent tasks when implementation differs from original plan using `update` / `task-master update --from=<id> --prompt="..."` or `update_task` / `task-master update-task --id=<id> --prompt="..."` (see @`taskmaster.mdc`)
47 | 
48 | ---
49 | 
50 | ## Leveling Up: Agent-Led Multi-Context Workflows
51 | 
52 | While the basic workflow is powerful, your primary opportunity to add value is by identifying when to introduce **Tagged Task Lists**. These patterns are your tools for creating a more organized and efficient development environment for the user, especially if you detect agentic or parallel development happening across the same session.
53 | 
54 | **Critical Principle**: Most users should never see a difference in their experience. Only introduce advanced workflows when you detect clear indicators that the project has evolved beyond simple task management.
55 | 
56 | ### When to Introduce Tags: Your Decision Patterns
57 | 
58 | Here are the patterns to look for. When you detect one, you should propose the corresponding workflow to the user.
59 | 
60 | #### Pattern 1: Simple Git Feature Branching
61 | This is the most common and direct use case for tags.
62 | 
63 | - **Trigger**: The user creates a new git branch (e.g., `git checkout -b feature/user-auth`).
64 | - **Your Action**: Propose creating a new tag that mirrors the branch name to isolate the feature's tasks from `master`.
65 | - **Your Suggested Prompt**: *"I see you've created a new branch named 'feature/user-auth'. To keep all related tasks neatly organized and separate from your main list, I can create a corresponding task tag for you. This helps prevent merge conflicts in your `tasks.json` file later. Shall I create the 'feature-user-auth' tag?"*
66 | - **Tool to Use**: `task-master add-tag --from-branch`
67 | 
68 | #### Pattern 2: Team Collaboration
69 | - **Trigger**: The user mentions working with teammates (e.g., "My teammate Alice is handling the database schema," or "I need to review Bob's work on the API.").
70 | - **Your Action**: Suggest creating a separate tag for the user's work to prevent conflicts with shared master context.
71 | - **Your Suggested Prompt**: *"Since you're working with Alice, I can create a separate task context for your work to avoid conflicts. This way, Alice can continue working with the master list while you have your own isolated context. When you're ready to merge your work, we can coordinate the tasks back to master. Shall I create a tag for your current work?"*
72 | - **Tool to Use**: `task-master add-tag my-work --copy-from-current --description="My tasks while collaborating with Alice"`
73 | 
74 | #### Pattern 3: Experiments or Risky Refactors
75 | - **Trigger**: The user wants to try something that might not be kept (e.g., "I want to experiment with switching our state management library," or "Let's refactor the old API module, but I want to keep the current tasks as a reference.").
76 | - **Your Action**: Propose creating a sandboxed tag for the experimental work.
77 | - **Your Suggested Prompt**: *"This sounds like a great experiment. To keep these new tasks separate from our main plan, I can create a temporary 'experiment-zustand' tag for this work. If we decide not to proceed, we can simply delete the tag without affecting the main task list. Sound good?"*
78 | - **Tool to Use**: `task-master add-tag experiment-zustand --description="Exploring Zustand migration"`
79 | 
80 | #### Pattern 4: Large Feature Initiatives (PRD-Driven)
81 | This is a more structured approach for significant new features or epics.
82 | 
83 | - **Trigger**: The user describes a large, multi-step feature that would benefit from a formal plan.
84 | - **Your Action**: Propose a comprehensive, PRD-driven workflow.
85 | - **Your Suggested Prompt**: *"This sounds like a significant new feature. To manage this effectively, I suggest we create a dedicated task context for it. Here's the plan: I'll create a new tag called 'feature-xyz', then we can draft a Product Requirements Document (PRD) together to scope the work. Once the PRD is ready, I'll automatically generate all the necessary tasks within that new tag. How does that sound?"*
86 | - **Your Implementation Flow**:
87 |     1.  **Create an empty tag**: `task-master add-tag feature-xyz --description "Tasks for the new XYZ feature"`. You can also start by creating a git branch if applicable, and then create the tag from that branch.
88 |     2.  **Collaborate & Create PRD**: Work with the user to create a detailed PRD file (e.g., `.taskmaster/docs/feature-xyz-prd.txt`).
89 |     3.  **Parse PRD into the new tag**: `task-master parse-prd .taskmaster/docs/feature-xyz-prd.txt --tag feature-xyz`
90 |     4.  **Prepare the new task list**: Follow up by suggesting `analyze-complexity` and `expand-all` for the newly created tasks within the `feature-xyz` tag.
91 | 
92 | #### Pattern 5: Version-Based Development
93 | Tailor your approach based on the project maturity indicated by tag names.
94 | 
95 | - **Prototype/MVP Tags** (`prototype`, `mvp`, `poc`, `v0.x`):
96 |   - **Your Approach**: Focus on speed and functionality over perfection
97 |   - **Task Generation**: Create tasks that emphasize "get it working" over "get it perfect"
98 |   - **Complexity Level**: Lower complexity, fewer subtasks, more direct implementation paths
99 |   - **Research Prompts**: Include context like "This is a prototype - prioritize speed and basic functionality over optimization"
100 |   - **Example Prompt Addition**: *"Since this is for the MVP, I'll focus on tasks that get core functionality working quickly rather than over-engineering."*
101 | 
102 | - **Production/Mature Tags** (`v1.0+`, `production`, `stable`):
103 |   - **Your Approach**: Emphasize robustness, testing, and maintainability
104 |   - **Task Generation**: Include comprehensive error handling, testing, documentation, and optimization
105 |   - **Complexity Level**: Higher complexity, more detailed subtasks, thorough implementation paths
106 |   - **Research Prompts**: Include context like "This is for production - prioritize reliability, performance, and maintainability"
107 |   - **Example Prompt Addition**: *"Since this is for production, I'll ensure tasks include proper error handling, testing, and documentation."*
108 | 
109 | ### Advanced Workflow (Tag-Based & PRD-Driven)
110 | 
111 | **When to Transition**: Recognize when the project has evolved (or has initiated a project which existing code) beyond simple task management. Look for these indicators:
112 | - User mentions teammates or collaboration needs
113 | - Project has grown to 15+ tasks with mixed priorities
114 | - User creates feature branches or mentions major initiatives
115 | - User initializes Taskmaster on an existing, complex codebase
116 | - User describes large features that would benefit from dedicated planning
117 | 
118 | **Your Role in Transition**: Guide the user to a more sophisticated workflow that leverages tags for organization and PRDs for comprehensive planning.
119 | 
120 | #### Master List Strategy (High-Value Focus)
121 | Once you transition to tag-based workflows, the `master` tag should ideally contain only:
122 | - **High-level deliverables** that provide significant business value
123 | - **Major milestones** and epic-level features
124 | - **Critical infrastructure** work that affects the entire project
125 | - **Release-blocking** items
126 | 
127 | **What NOT to put in master**:
128 | - Detailed implementation subtasks (these go in feature-specific tags' parent tasks)
129 | - Refactoring work (create dedicated tags like `refactor-auth`)
130 | - Experimental features (use `experiment-*` tags)
131 | - Team member-specific tasks (use person-specific tags)
132 | 
133 | #### PRD-Driven Feature Development
134 | 
135 | **For New Major Features**:
136 | 1. **Identify the Initiative**: When user describes a significant feature
137 | 2. **Create Dedicated Tag**: `add_tag feature-[name] --description="[Feature description]"`
138 | 3. **Collaborative PRD Creation**: Work with user to create comprehensive PRD in `.taskmaster/docs/feature-[name]-prd.txt`
139 | 4. **Parse & Prepare**: 
140 |    - `parse_prd .taskmaster/docs/feature-[name]-prd.txt --tag=feature-[name]`
141 |    - `analyze_project_complexity --tag=feature-[name] --research`
142 |    - `expand_all --tag=feature-[name] --research`
143 | 5. **Add Master Reference**: Create a high-level task in `master` that references the feature tag
144 | 
145 | **For Existing Codebase Analysis**:
146 | When users initialize Taskmaster on existing projects:
147 | 1. **Codebase Discovery**: Use your native tools for producing deep context about the code base. You may use `research` tool with `--tree` and `--files` to collect up to date information using the existing architecture as context.
148 | 2. **Collaborative Assessment**: Work with user to identify improvement areas, technical debt, or new features
149 | 3. **Strategic PRD Creation**: Co-author PRDs that include:
150 |    - Current state analysis (based on your codebase research)
151 |    - Proposed improvements or new features
152 |    - Implementation strategy considering existing code
153 | 4. **Tag-Based Organization**: Parse PRDs into appropriate tags (`refactor-api`, `feature-dashboard`, `tech-debt`, etc.)
154 | 5. **Master List Curation**: Keep only the most valuable initiatives in master
155 | 
156 | The parse-prd's `--append` flag enables the user to parse multple PRDs within tags or across tags. PRDs should be focused and the number of tasks they are parsed into should be strategically chosen relative to the PRD's complexity and level of detail.
157 | 
158 | ### Workflow Transition Examples
159 | 
160 | **Example 1: Simple → Team-Based**
161 | ```
162 | User: "Alice is going to help with the API work"
163 | Your Response: "Great! To avoid conflicts, I'll create a separate task context for your work. Alice can continue with the master list while you work in your own context. When you're ready to merge, we can coordinate the tasks back together."
164 | Action: add_tag my-api-work --copy-from-current --description="My API tasks while collaborating with Alice"
165 | ```
166 | 
167 | **Example 2: Simple → PRD-Driven**
168 | ```
169 | User: "I want to add a complete user dashboard with analytics, user management, and reporting"
170 | Your Response: "This sounds like a major feature that would benefit from detailed planning. Let me create a dedicated context for this work and we can draft a PRD together to ensure we capture all requirements."
171 | Actions: 
172 | 1. add_tag feature-dashboard --description="User dashboard with analytics and management"
173 | 2. Collaborate on PRD creation
174 | 3. parse_prd dashboard-prd.txt --tag=feature-dashboard
175 | 4. Add high-level "User Dashboard" task to master
176 | ```
177 | 
178 | **Example 3: Existing Project → Strategic Planning**
179 | ```
180 | User: "I just initialized Taskmaster on my existing React app. It's getting messy and I want to improve it."
181 | Your Response: "Let me research your codebase to understand the current architecture, then we can create a strategic plan for improvements."
182 | Actions:
183 | 1. research "Current React app architecture and improvement opportunities" --tree --files=src/
184 | 2. Collaborate on improvement PRD based on findings
185 | 3. Create tags for different improvement areas (refactor-components, improve-state-management, etc.)
186 | 4. Keep only major improvement initiatives in master
187 | ```
188 | 
189 | ---
190 | 
191 | ## Primary Interaction: MCP Server vs. CLI
192 | 
193 | Taskmaster offers two primary ways to interact:
194 | 
195 | 1.  **MCP Server (Recommended for Integrated Tools)**:
196 |     - For AI agents and integrated development environments (like Cursor), interacting via the **MCP server is the preferred method**.
197 |     - The MCP server exposes Taskmaster functionality through a set of tools (e.g., `get_tasks`, `add_subtask`).
198 |     - This method offers better performance, structured data exchange, and richer error handling compared to CLI parsing.
199 |     - Refer to @`mcp.mdc` for details on the MCP architecture and available tools.
200 |     - A comprehensive list and description of MCP tools and their corresponding CLI commands can be found in @`taskmaster.mdc`.
201 |     - **Restart the MCP server** if core logic in `scripts/modules` or MCP tool/direct function definitions change.
202 |     - **Note**: MCP tools fully support tagged task lists with complete tag management capabilities.
203 | 
204 | 2.  **`task-master` CLI (For Users & Fallback)**:
205 |     - The global `task-master` command provides a user-friendly interface for direct terminal interaction.
206 |     - It can also serve as a fallback if the MCP server is inaccessible or a specific function isn't exposed via MCP.
207 |     - Install globally with `npm install -g task-master-ai` or use locally via `npx task-master-ai ...`.
208 |     - The CLI commands often mirror the MCP tools (e.g., `task-master list` corresponds to `get_tasks`).
209 |     - Refer to @`taskmaster.mdc` for a detailed command reference.
210 |     - **Tagged Task Lists**: CLI fully supports the new tagged system with seamless migration.
211 | 
212 | ## How the Tag System Works (For Your Reference)
213 | 
214 | - **Data Structure**: Tasks are organized into separate contexts (tags) like "master", "feature-branch", or "v2.0".
215 | - **Silent Migration**: Existing projects automatically migrate to use a "master" tag with zero disruption.
216 | - **Context Isolation**: Tasks in different tags are completely separate. Changes in one tag do not affect any other tag.
217 | - **Manual Control**: The user is always in control. There is no automatic switching. You facilitate switching by using `use-tag <name>`.
218 | - **Full CLI & MCP Support**: All tag management commands are available through both the CLI and MCP tools for you to use. Refer to @`taskmaster.mdc` for a full command list.
219 | 
220 | ---
221 | 
222 | ## Task Complexity Analysis
223 | 
224 | -   Run `analyze_project_complexity` / `task-master analyze-complexity --research` (see @`taskmaster.mdc`) for comprehensive analysis
225 | -   Review complexity report via `complexity_report` / `task-master complexity-report` (see @`taskmaster.mdc`) for a formatted, readable version.
226 | -   Focus on tasks with highest complexity scores (8-10) for detailed breakdown
227 | -   Use analysis results to determine appropriate subtask allocation
228 | -   Note that reports are automatically used by the `expand_task` tool/command
229 | 
230 | ## Task Breakdown Process
231 | 
232 | -   Use `expand_task` / `task-master expand --id=<id>`. It automatically uses the complexity report if found, otherwise generates default number of subtasks.
233 | -   Use `--num=<number>` to specify an explicit number of subtasks, overriding defaults or complexity report recommendations.
234 | -   Add `--research` flag to leverage Perplexity AI for research-backed expansion.
235 | -   Add `--force` flag to clear existing subtasks before generating new ones (default is to append).
236 | -   Use `--prompt="<context>"` to provide additional context when needed.
237 | -   Review and adjust generated subtasks as necessary.
238 | -   Use `expand_all` tool or `task-master expand --all` to expand multiple pending tasks at once, respecting flags like `--force` and `--research`.
239 | -   If subtasks need complete replacement (regardless of the `--force` flag on `expand`), clear them first with `clear_subtasks` / `task-master clear-subtasks --id=<id>`.
240 | 
241 | ## Implementation Drift Handling
242 | 
243 | -   When implementation differs significantly from planned approach
244 | -   When future tasks need modification due to current implementation choices
245 | -   When new dependencies or requirements emerge
246 | -   Use `update` / `task-master update --from=<futureTaskId> --prompt='<explanation>\nUpdate context...' --research` to update multiple future tasks.
247 | -   Use `update_task` / `task-master update-task --id=<taskId> --prompt='<explanation>\nUpdate context...' --research` to update a single specific task.
248 | 
249 | ## Task Status Management
250 | 
251 | -   Use 'pending' for tasks ready to be worked on
252 | -   Use 'done' for completed and verified tasks
253 | -   Use 'deferred' for postponed tasks
254 | -   Add custom status values as needed for project-specific workflows
255 | 
256 | ## Task Structure Fields
257 | 
258 | - **id**: Unique identifier for the task (Example: `1`, `1.1`)
259 | - **title**: Brief, descriptive title (Example: `"Initialize Repo"`)
260 | - **description**: Concise summary of what the task involves (Example: `"Create a new repository, set up initial structure."`)
261 | - **status**: Current state of the task (Example: `"pending"`, `"done"`, `"deferred"`)
262 | - **dependencies**: IDs of prerequisite tasks (Example: `[1, 2.1]`)
263 |     - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending)
264 |     - This helps quickly identify which prerequisite tasks are blocking work
265 | - **priority**: Importance level (Example: `"high"`, `"medium"`, `"low"`)
266 | - **details**: In-depth implementation instructions (Example: `"Use GitHub client ID/secret, handle callback, set session token."`) 
267 | - **testStrategy**: Verification approach (Example: `"Deploy and call endpoint to confirm 'Hello World' response."`) 
268 | - **subtasks**: List of smaller, more specific tasks (Example: `[{"id": 1, "title": "Configure OAuth", ...}]`) 
269 | - Refer to task structure details (previously linked to `tasks.mdc`).
270 | 
271 | ## Configuration Management (Updated)
272 | 
273 | Taskmaster configuration is managed through two main mechanisms:
274 | 
275 | 1.  **`.taskmaster/config.json` File (Primary):**
276 |     *   Located in the project root directory.
277 |     *   Stores most configuration settings: AI model selections (main, research, fallback), parameters (max tokens, temperature), logging level, default subtasks/priority, project name, etc.
278 |     *   **Tagged System Settings**: Includes `global.defaultTag` (defaults to "master") and `tags` section for tag management configuration.
279 |     *   **Managed via `task-master models --setup` command.** Do not edit manually unless you know what you are doing.
280 |     *   **View/Set specific models via `task-master models` command or `models` MCP tool.**
281 |     *   Created automatically when you run `task-master models --setup` for the first time or during tagged system migration.
282 | 
283 | 2.  **Environment Variables (`.env` / `mcp.json`):**
284 |     *   Used **only** for sensitive API keys and specific endpoint URLs.
285 |     *   Place API keys (one per provider) in a `.env` file in the project root for CLI usage.
286 |     *   For MCP/Cursor integration, configure these keys in the `env` section of `.cursor/mcp.json`.
287 |     *   Available keys/variables: See `assets/env.example` or the Configuration section in the command reference (previously linked to `taskmaster.mdc`).
288 | 
289 | 3.  **`.taskmaster/state.json` File (Tagged System State):**
290 |     *   Tracks current tag context and migration status.
291 |     *   Automatically created during tagged system migration.
292 |     *   Contains: `currentTag`, `lastSwitched`, `migrationNoticeShown`.
293 | 
294 | **Important:** Non-API key settings (like model selections, `MAX_TOKENS`, `TASKMASTER_LOG_LEVEL`) are **no longer configured via environment variables**. Use the `task-master models` command (or `--setup` for interactive configuration) or the `models` MCP tool.
295 | **If AI commands FAIL in MCP** verify that the API key for the selected provider is present in the `env` section of `.cursor/mcp.json`.
296 | **If AI commands FAIL in CLI** verify that the API key for the selected provider is present in the `.env` file in the root of the project.
297 | 
298 | ## Rules Management
299 | 
300 | Taskmaster supports multiple AI coding assistant rule sets that can be configured during project initialization or managed afterward:
301 | 
302 | - **Available Profiles**: Claude Code, Cline, Codex, Cursor, Roo Code, Trae, Windsurf (claude, cline, codex, cursor, roo, trae, windsurf)
303 | - **During Initialization**: Use `task-master init --rules cursor,windsurf` to specify which rule sets to include
304 | - **After Initialization**: Use `task-master rules add <profiles>` or `task-master rules remove <profiles>` to manage rule sets
305 | - **Interactive Setup**: Use `task-master rules setup` to launch an interactive prompt for selecting rule profiles
306 | - **Default Behavior**: If no `--rules` flag is specified during initialization, all available rule profiles are included
307 | - **Rule Structure**: Each profile creates its own directory (e.g., `.cursor/rules`, `.roo/rules`) with appropriate configuration files
308 | 
309 | ## Determining the Next Task
310 | 
311 | - Run `next_task` / `task-master next` to show the next task to work on.
312 | - The command identifies tasks with all dependencies satisfied
313 | - Tasks are prioritized by priority level, dependency count, and ID
314 | - The command shows comprehensive task information including:
315 |     - Basic task details and description
316 |     - Implementation details
317 |     - Subtasks (if they exist)
318 |     - Contextual suggested actions
319 | - Recommended before starting any new development work
320 | - Respects your project's dependency structure
321 | - Ensures tasks are completed in the appropriate sequence
322 | - Provides ready-to-use commands for common task actions
323 | 
324 | ## Viewing Specific Task Details
325 | 
326 | - Run `get_task` / `task-master show <id>` to view a specific task.
327 | - Use dot notation for subtasks: `task-master show 1.2` (shows subtask 2 of task 1)
328 | - Displays comprehensive information similar to the next command, but for a specific task
329 | - For parent tasks, shows all subtasks and their current status
330 | - For subtasks, shows parent task information and relationship
331 | - Provides contextual suggested actions appropriate for the specific task
332 | - Useful for examining task details before implementation or checking status
333 | 
334 | ## Managing Task Dependencies
335 | 
336 | - Use `add_dependency` / `task-master add-dependency --id=<id> --depends-on=<id>` to add a dependency.
337 | - Use `remove_dependency` / `task-master remove-dependency --id=<id> --depends-on=<id>` to remove a dependency.
338 | - The system prevents circular dependencies and duplicate dependency entries
339 | - Dependencies are checked for existence before being added or removed
340 | - Task files are automatically regenerated after dependency changes
341 | - Dependencies are visualized with status indicators in task listings and files
342 | 
343 | ## Task Reorganization
344 | 
345 | - Use `move_task` / `task-master move --from=<id> --to=<id>` to move tasks or subtasks within the hierarchy
346 | - This command supports several use cases:
347 |   - Moving a standalone task to become a subtask (e.g., `--from=5 --to=7`)
348 |   - Moving a subtask to become a standalone task (e.g., `--from=5.2 --to=7`) 
349 |   - Moving a subtask to a different parent (e.g., `--from=5.2 --to=7.3`)
350 |   - Reordering subtasks within the same parent (e.g., `--from=5.2 --to=5.4`)
351 |   - Moving a task to a new, non-existent ID position (e.g., `--from=5 --to=25`)
352 |   - Moving multiple tasks at once using comma-separated IDs (e.g., `--from=10,11,12 --to=16,17,18`)
353 | - The system includes validation to prevent data loss:
354 |   - Allows moving to non-existent IDs by creating placeholder tasks
355 |   - Prevents moving to existing task IDs that have content (to avoid overwriting)
356 |   - Validates source tasks exist before attempting to move them
357 | - The system maintains proper parent-child relationships and dependency integrity
358 | - Task files are automatically regenerated after the move operation
359 | - This provides greater flexibility in organizing and refining your task structure as project understanding evolves
360 | - This is especially useful when dealing with potential merge conflicts arising from teams creating tasks on separate branches. Solve these conflicts very easily by moving your tasks and keeping theirs.
361 | 
362 | ## Iterative Subtask Implementation
363 | 
364 | Once a task has been broken down into subtasks using `expand_task` or similar methods, follow this iterative process for implementation:
365 | 
366 | 1.  **Understand the Goal (Preparation):**
367 |     *   Use `get_task` / `task-master show <subtaskId>` (see @`taskmaster.mdc`) to thoroughly understand the specific goals and requirements of the subtask.
368 | 
369 | 2.  **Initial Exploration & Planning (Iteration 1):**
370 |     *   This is the first attempt at creating a concrete implementation plan.
371 |     *   Explore the codebase to identify the precise files, functions, and even specific lines of code that will need modification.
372 |     *   Determine the intended code changes (diffs) and their locations.
373 |     *   Gather *all* relevant details from this exploration phase.
374 | 
375 | 3.  **Log the Plan:**
376 |     *   Run `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='<detailed plan>'`.
377 |     *   Provide the *complete and detailed* findings from the exploration phase in the prompt. Include file paths, line numbers, proposed diffs, reasoning, and any potential challenges identified. Do not omit details. The goal is to create a rich, timestamped log within the subtask's `details`.
378 | 
379 | 4.  **Verify the Plan:**
380 |     *   Run `get_task` / `task-master show <subtaskId>` again to confirm that the detailed implementation plan has been successfully appended to the subtask's details.
381 | 
382 | 5.  **Begin Implementation:**
383 |     *   Set the subtask status using `set_task_status` / `task-master set-status --id=<subtaskId> --status=in-progress`.
384 |     *   Start coding based on the logged plan.
385 | 
386 | 6.  **Refine and Log Progress (Iteration 2+):**
387 |     *   As implementation progresses, you will encounter challenges, discover nuances, or confirm successful approaches.
388 |     *   **Before appending new information**: Briefly review the *existing* details logged in the subtask (using `get_task` or recalling from context) to ensure the update adds fresh insights and avoids redundancy.
389 |     *   **Regularly** use `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='<update details>\n- What worked...\n- What didn't work...'` to append new findings.
390 |     *   **Crucially, log:**
391 |         *   What worked ("fundamental truths" discovered).
392 |         *   What didn't work and why (to avoid repeating mistakes).
393 |         *   Specific code snippets or configurations that were successful.
394 |         *   Decisions made, especially if confirmed with user input.
395 |         *   Any deviations from the initial plan and the reasoning.
396 |     *   The objective is to continuously enrich the subtask's details, creating a log of the implementation journey that helps the AI (and human developers) learn, adapt, and avoid repeating errors.
397 | 
398 | 7.  **Review & Update Rules (Post-Implementation):**
399 |     *   Once the implementation for the subtask is functionally complete, review all code changes and the relevant chat history.
400 |     *   Identify any new or modified code patterns, conventions, or best practices established during the implementation.
401 |     *   Create new or update existing rules following internal guidelines (previously linked to `cursor_rules.mdc` and `self_improve.mdc`).
402 | 
403 | 8.  **Mark Task Complete:**
404 |     *   After verifying the implementation and updating any necessary rules, mark the subtask as completed: `set_task_status` / `task-master set-status --id=<subtaskId> --status=done`.
405 | 
406 | 9.  **Commit Changes (If using Git):**
407 |     *   Stage the relevant code changes and any updated/new rule files (`git add .`).
408 |     *   Craft a comprehensive Git commit message summarizing the work done for the subtask, including both code implementation and any rule adjustments.
409 |     *   Execute the commit command directly in the terminal (e.g., `git commit -m 'feat(module): Implement feature X for subtask <subtaskId>\n\n- Details about changes...\n- Updated rule Y for pattern Z'`).
410 |     *   Consider if a Changeset is needed according to internal versioning guidelines (previously linked to `changeset.mdc`). If so, run `npm run changeset`, stage the generated file, and amend the commit or create a new one.
411 | 
412 | 10. **Proceed to Next Subtask:**
413 |     *   Identify the next subtask (e.g., using `next_task` / `task-master next`).
414 | 
415 | ## Code Analysis & Refactoring Techniques
416 | 
417 | - **Top-Level Function Search**:
418 |     - Useful for understanding module structure or planning refactors.
419 |     - Use grep/ripgrep to find exported functions/constants:
420 |       `rg "export (async function|function|const) \w+"` or similar patterns.
421 |     - Can help compare functions between files during migrations or identify potential naming conflicts.
422 | 
423 | ---
424 | *This workflow provides a general guideline. Adapt it based on your specific project needs and team practices.*
```

.cursor/rules/taskmaster/taskmaster.mdc
```
1 | ---
2 | description: Comprehensive reference for Taskmaster MCP tools and CLI commands.
3 | globs: **/*
4 | alwaysApply: true
5 | ---
6 | 
7 | # Taskmaster Tool & Command Reference
8 | 
9 | This document provides a detailed reference for interacting with Taskmaster, covering both the recommended MCP tools, suitable for integrations like Cursor, and the corresponding `task-master` CLI commands, designed for direct user interaction or fallback.
10 | 
11 | **Note:** For interacting with Taskmaster programmatically or via integrated tools, using the **MCP tools is strongly recommended** due to better performance, structured data, and error handling. The CLI commands serve as a user-friendly alternative and fallback. 
12 | 
13 | **Important:** Several MCP tools involve AI processing... The AI-powered tools include `parse_prd`, `analyze_project_complexity`, `update_subtask`, `update_task`, `update`, `expand_all`, `expand_task`, and `add_task`.
14 | 
15 | **🏷️ Tagged Task Lists System:** Task Master now supports **tagged task lists** for multi-context task management. This allows you to maintain separate, isolated lists of tasks for different features, branches, or experiments. Existing projects are seamlessly migrated to use a default "master" tag. Most commands now support a `--tag <name>` flag to specify which context to operate on. If omitted, commands use the currently active tag.
16 | 
17 | ---
18 | 
19 | ## Initialization & Setup
20 | 
21 | ### 1. Initialize Project (`init`)
22 | 
23 | *   **MCP Tool:** `initialize_project`
24 | *   **CLI Command:** `task-master init [options]`
25 | *   **Description:** `Set up the basic Taskmaster file structure and configuration in the current directory for a new project.`
26 | *   **Key CLI Options:**
27 |     *   `--name <name>`: `Set the name for your project in Taskmaster's configuration.`
28 |     *   `--description <text>`: `Provide a brief description for your project.`
29 |     *   `--version <version>`: `Set the initial version for your project, e.g., '0.1.0'.`
30 |     *   `-y, --yes`: `Initialize Taskmaster quickly using default settings without interactive prompts.`
31 | *   **Usage:** Run this once at the beginning of a new project.
32 | *   **MCP Variant Description:** `Set up the basic Taskmaster file structure and configuration in the current directory for a new project by running the 'task-master init' command.`
33 | *   **Key MCP Parameters/Options:**
34 |     *   `projectName`: `Set the name for your project.` (CLI: `--name <name>`)
35 |     *   `projectDescription`: `Provide a brief description for your project.` (CLI: `--description <text>`)
36 |     *   `projectVersion`: `Set the initial version for your project, e.g., '0.1.0'.` (CLI: `--version <version>`)
37 |     *   `authorName`: `Author name.` (CLI: `--author <author>`)
38 |     *   `skipInstall`: `Skip installing dependencies. Default is false.` (CLI: `--skip-install`)
39 |     *   `addAliases`: `Add shell aliases tm and taskmaster. Default is false.` (CLI: `--aliases`)
40 |     *   `yes`: `Skip prompts and use defaults/provided arguments. Default is false.` (CLI: `-y, --yes`)
41 | *   **Usage:** Run this once at the beginning of a new project, typically via an integrated tool like Cursor. Operates on the current working directory of the MCP server. 
42 | *   **Important:** Once complete, you *MUST* parse a prd in order to generate tasks. There will be no tasks files until then. The next step after initializing should be to create a PRD using the example PRD in .taskmaster/templates/example_prd.txt. 
43 | *   **Tagging:** Use the `--tag` option to parse the PRD into a specific, non-default tag context. If the tag doesn't exist, it will be created automatically. Example: `task-master parse-prd spec.txt --tag=new-feature`.
44 | 
45 | ### 2. Parse PRD (`parse_prd`)
46 | 
47 | *   **MCP Tool:** `parse_prd`
48 | *   **CLI Command:** `task-master parse-prd [file] [options]`
49 | *   **Description:** `Parse a Product Requirements Document, PRD, or text file with Taskmaster to automatically generate an initial set of tasks in tasks.json.`
50 | *   **Key Parameters/Options:**
51 |     *   `input`: `Path to your PRD or requirements text file that Taskmaster should parse for tasks.` (CLI: `[file]` positional or `-i, --input <file>`)
52 |     *   `output`: `Specify where Taskmaster should save the generated 'tasks.json' file. Defaults to '.taskmaster/tasks/tasks.json'.` (CLI: `-o, --output <file>`)
53 |     *   `numTasks`: `Approximate number of top-level tasks Taskmaster should aim to generate from the document.` (CLI: `-n, --num-tasks <number>`)
54 |     *   `force`: `Use this to allow Taskmaster to overwrite an existing 'tasks.json' without asking for confirmation.` (CLI: `-f, --force`)
55 | *   **Usage:** Useful for bootstrapping a project from an existing requirements document.
56 | *   **Notes:** Task Master will strictly adhere to any specific requirements mentioned in the PRD, such as libraries, database schemas, frameworks, tech stacks, etc., while filling in any gaps where the PRD isn't fully specified. Tasks are designed to provide the most direct implementation path while avoiding over-engineering.
57 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress. If the user does not have a PRD, suggest discussing their idea and then use the example PRD in `.taskmaster/templates/example_prd.txt` as a template for creating the PRD based on their idea, for use with `parse-prd`.
58 | 
59 | ---
60 | 
61 | ## AI Model Configuration
62 | 
63 | ### 2. Manage Models (`models`)
64 | *   **MCP Tool:** `models`
65 | *   **CLI Command:** `task-master models [options]`
66 | *   **Description:** `View the current AI model configuration or set specific models for different roles (main, research, fallback). Allows setting custom model IDs for Ollama and OpenRouter.`
67 | *   **Key MCP Parameters/Options:**
68 |     *   `setMain <model_id>`: `Set the primary model ID for task generation/updates.` (CLI: `--set-main <model_id>`)
69 |     *   `setResearch <model_id>`: `Set the model ID for research-backed operations.` (CLI: `--set-research <model_id>`)
70 |     *   `setFallback <model_id>`: `Set the model ID to use if the primary fails.` (CLI: `--set-fallback <model_id>`)
71 |     *   `ollama <boolean>`: `Indicates the set model ID is a custom Ollama model.` (CLI: `--ollama`)
72 |     *   `openrouter <boolean>`: `Indicates the set model ID is a custom OpenRouter model.` (CLI: `--openrouter`)
73 |     *   `listAvailableModels <boolean>`: `If true, lists available models not currently assigned to a role.` (CLI: No direct equivalent; CLI lists available automatically)
74 |     *   `projectRoot <string>`: `Optional. Absolute path to the project root directory.` (CLI: Determined automatically)
75 | *   **Key CLI Options:**
76 |     *   `--set-main <model_id>`: `Set the primary model.`
77 |     *   `--set-research <model_id>`: `Set the research model.`
78 |     *   `--set-fallback <model_id>`: `Set the fallback model.`
79 |     *   `--ollama`: `Specify that the provided model ID is for Ollama (use with --set-*).`
80 |     *   `--openrouter`: `Specify that the provided model ID is for OpenRouter (use with --set-*). Validates against OpenRouter API.`
81 |     *   `--bedrock`: `Specify that the provided model ID is for AWS Bedrock (use with --set-*).`
82 |     *   `--setup`: `Run interactive setup to configure models, including custom Ollama/OpenRouter IDs.`
83 | *   **Usage (MCP):** Call without set flags to get current config. Use `setMain`, `setResearch`, or `setFallback` with a valid model ID to update the configuration. Use `listAvailableModels: true` to get a list of unassigned models. To set a custom model, provide the model ID and set `ollama: true` or `openrouter: true`.
84 | *   **Usage (CLI):** Run without flags to view current configuration and available models. Use set flags to update specific roles. Use `--setup` for guided configuration, including custom models. To set a custom model via flags, use `--set-<role>=<model_id>` along with either `--ollama` or `--openrouter`.
85 | *   **Notes:** Configuration is stored in `.taskmaster/config.json` in the project root. This command/tool modifies that file. Use `listAvailableModels` or `task-master models` to see internally supported models. OpenRouter custom models are validated against their live API. Ollama custom models are not validated live.
86 | *   **API note:** API keys for selected AI providers (based on their model) need to exist in the mcp.json file to be accessible in MCP context. The API keys must be present in the local .env file for the CLI to be able to read them.
87 | *   **Model costs:** The costs in supported models are expressed in dollars. An input/output value of 3 is $3.00. A value of 0.8 is $0.80. 
88 | *   **Warning:** DO NOT MANUALLY EDIT THE .taskmaster/config.json FILE. Use the included commands either in the MCP or CLI format as needed. Always prioritize MCP tools when available and use the CLI as a fallback.
89 | 
90 | ---
91 | 
92 | ## Task Listing & Viewing
93 | 
94 | ### 3. Get Tasks (`get_tasks`)
95 | 
96 | *   **MCP Tool:** `get_tasks`
97 | *   **CLI Command:** `task-master list [options]`
98 | *   **Description:** `List your Taskmaster tasks, optionally filtering by status and showing subtasks.`
99 | *   **Key Parameters/Options:**
100 |     *   `status`: `Show only Taskmaster tasks matching this status (or multiple statuses, comma-separated), e.g., 'pending' or 'done,in-progress'.` (CLI: `-s, --status <status>`)
101 |     *   `withSubtasks`: `Include subtasks indented under their parent tasks in the list.` (CLI: `--with-subtasks`)
102 |     *   `tag`: `Specify which tag context to list tasks from. Defaults to the current active tag.` (CLI: `--tag <name>`)
103 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
104 | *   **Usage:** Get an overview of the project status, often used at the start of a work session.
105 | 
106 | ### 4. Get Next Task (`next_task`)
107 | 
108 | *   **MCP Tool:** `next_task`
109 | *   **CLI Command:** `task-master next [options]`
110 | *   **Description:** `Ask Taskmaster to show the next available task you can work on, based on status and completed dependencies.`
111 | *   **Key Parameters/Options:**
112 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
113 |     *   `tag`: `Specify which tag context to use. Defaults to the current active tag.` (CLI: `--tag <name>`)
114 | *   **Usage:** Identify what to work on next according to the plan.
115 | 
116 | ### 5. Get Task Details (`get_task`)
117 | 
118 | *   **MCP Tool:** `get_task`
119 | *   **CLI Command:** `task-master show [id] [options]`
120 | *   **Description:** `Display detailed information for one or more specific Taskmaster tasks or subtasks by ID.`
121 | *   **Key Parameters/Options:**
122 |     *   `id`: `Required. The ID of the Taskmaster task (e.g., '15'), subtask (e.g., '15.2'), or a comma-separated list of IDs ('1,5,10.2') you want to view.` (CLI: `[id]` positional or `-i, --id <id>`)
123 |     *   `tag`: `Specify which tag context to get the task(s) from. Defaults to the current active tag.` (CLI: `--tag <name>`)
124 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
125 | *   **Usage:** Understand the full details for a specific task. When multiple IDs are provided, a summary table is shown.
126 | *   **CRITICAL INFORMATION** If you need to collect information from multiple tasks, use comma-separated IDs (i.e. 1,2,3) to receive an array of tasks. Do not needlessly get tasks one at a time if you need to get many as that is wasteful.
127 | 
128 | ---
129 | 
130 | ## Task Creation & Modification
131 | 
132 | ### 6. Add Task (`add_task`)
133 | 
134 | *   **MCP Tool:** `add_task`
135 | *   **CLI Command:** `task-master add-task [options]`
136 | *   **Description:** `Add a new task to Taskmaster by describing it; AI will structure it.`
137 | *   **Key Parameters/Options:**
138 |     *   `prompt`: `Required. Describe the new task you want Taskmaster to create, e.g., "Implement user authentication using JWT".` (CLI: `-p, --prompt <text>`)
139 |     *   `dependencies`: `Specify the IDs of any Taskmaster tasks that must be completed before this new one can start, e.g., '12,14'.` (CLI: `-d, --dependencies <ids>`)
140 |     *   `priority`: `Set the priority for the new task: 'high', 'medium', or 'low'. Default is 'medium'.` (CLI: `--priority <priority>`)
141 |     *   `research`: `Enable Taskmaster to use the research role for potentially more informed task creation.` (CLI: `-r, --research`)
142 |     *   `tag`: `Specify which tag context to add the task to. Defaults to the current active tag.` (CLI: `--tag <name>`)
143 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
144 | *   **Usage:** Quickly add newly identified tasks during development.
145 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
146 | 
147 | ### 7. Add Subtask (`add_subtask`)
148 | 
149 | *   **MCP Tool:** `add_subtask`
150 | *   **CLI Command:** `task-master add-subtask [options]`
151 | *   **Description:** `Add a new subtask to a Taskmaster parent task, or convert an existing task into a subtask.`
152 | *   **Key Parameters/Options:**
153 |     *   `id` / `parent`: `Required. The ID of the Taskmaster task that will be the parent.` (MCP: `id`, CLI: `-p, --parent <id>`)
154 |     *   `taskId`: `Use this if you want to convert an existing top-level Taskmaster task into a subtask of the specified parent.` (CLI: `-i, --task-id <id>`)
155 |     *   `title`: `Required if not using taskId. The title for the new subtask Taskmaster should create.` (CLI: `-t, --title <title>`)
156 |     *   `description`: `A brief description for the new subtask.` (CLI: `-d, --description <text>`)
157 |     *   `details`: `Provide implementation notes or details for the new subtask.` (CLI: `--details <text>`)
158 |     *   `dependencies`: `Specify IDs of other tasks or subtasks, e.g., '15' or '16.1', that must be done before this new subtask.` (CLI: `--dependencies <ids>`)
159 |     *   `status`: `Set the initial status for the new subtask. Default is 'pending'.` (CLI: `-s, --status <status>`)
160 |     *   `skipGenerate`: `Prevent Taskmaster from automatically regenerating markdown task files after adding the subtask.` (CLI: `--skip-generate`)
161 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
162 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
163 | *   **Usage:** Break down tasks manually or reorganize existing tasks.
164 | 
165 | ### 8. Update Tasks (`update`)
166 | 
167 | *   **MCP Tool:** `update`
168 | *   **CLI Command:** `task-master update [options]`
169 | *   **Description:** `Update multiple upcoming tasks in Taskmaster based on new context or changes, starting from a specific task ID.`
170 | *   **Key Parameters/Options:**
171 |     *   `from`: `Required. The ID of the first task Taskmaster should update. All tasks with this ID or higher that are not 'done' will be considered.` (CLI: `--from <id>`)
172 |     *   `prompt`: `Required. Explain the change or new context for Taskmaster to apply to the tasks, e.g., "We are now using React Query instead of Redux Toolkit for data fetching".` (CLI: `-p, --prompt <text>`)
173 |     *   `research`: `Enable Taskmaster to use the research role for more informed updates. Requires appropriate API key.` (CLI: `-r, --research`)
174 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
175 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
176 | *   **Usage:** Handle significant implementation changes or pivots that affect multiple future tasks. Example CLI: `task-master update --from='18' --prompt='Switching to React Query.\nNeed to refactor data fetching...'`
177 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
178 | 
179 | ### 9. Update Task (`update_task`)
180 | 
181 | *   **MCP Tool:** `update_task`
182 | *   **CLI Command:** `task-master update-task [options]`
183 | *   **Description:** `Modify a specific Taskmaster task by ID, incorporating new information or changes. By default, this replaces the existing task details.`
184 | *   **Key Parameters/Options:**
185 |     *   `id`: `Required. The specific ID of the Taskmaster task, e.g., '15', you want to update.` (CLI: `-i, --id <id>`)
186 |     *   `prompt`: `Required. Explain the specific changes or provide the new information Taskmaster should incorporate into this task.` (CLI: `-p, --prompt <text>`)
187 |     *   `append`: `If true, appends the prompt content to the task's details with a timestamp, rather than replacing them. Behaves like update-subtask.` (CLI: `--append`)
188 |     *   `research`: `Enable Taskmaster to use the research role for more informed updates. Requires appropriate API key.` (CLI: `-r, --research`)
189 |     *   `tag`: `Specify which tag context the task belongs to. Defaults to the current active tag.` (CLI: `--tag <name>`)
190 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
191 | *   **Usage:** Refine a specific task based on new understanding. Use `--append` to log progress without creating subtasks.
192 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
193 | 
194 | ### 10. Update Subtask (`update_subtask`)
195 | 
196 | *   **MCP Tool:** `update_subtask`
197 | *   **CLI Command:** `task-master update-subtask [options]`
198 | *   **Description:** `Append timestamped notes or details to a specific Taskmaster subtask without overwriting existing content. Intended for iterative implementation logging.`
199 | *   **Key Parameters/Options:**
200 |     *   `id`: `Required. The ID of the Taskmaster subtask, e.g., '5.2', to update with new information.` (CLI: `-i, --id <id>`)
201 |     *   `prompt`: `Required. The information, findings, or progress notes to append to the subtask's details with a timestamp.` (CLI: `-p, --prompt <text>`)
202 |     *   `research`: `Enable Taskmaster to use the research role for more informed updates. Requires appropriate API key.` (CLI: `-r, --research`)
203 |     *   `tag`: `Specify which tag context the subtask belongs to. Defaults to the current active tag.` (CLI: `--tag <name>`)
204 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
205 | *   **Usage:** Log implementation progress, findings, and discoveries during subtask development. Each update is timestamped and appended to preserve the implementation journey.
206 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
207 | 
208 | ### 11. Set Task Status (`set_task_status`)
209 | 
210 | *   **MCP Tool:** `set_task_status`
211 | *   **CLI Command:** `task-master set-status [options]`
212 | *   **Description:** `Update the status of one or more Taskmaster tasks or subtasks, e.g., 'pending', 'in-progress', 'done'.`
213 | *   **Key Parameters/Options:**
214 |     *   `id`: `Required. The ID(s) of the Taskmaster task(s) or subtask(s), e.g., '15', '15.2', or '16,17.1', to update.` (CLI: `-i, --id <id>`)
215 |     *   `status`: `Required. The new status to set, e.g., 'done', 'pending', 'in-progress', 'review', 'cancelled'.` (CLI: `-s, --status <status>`)
216 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
217 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
218 | *   **Usage:** Mark progress as tasks move through the development cycle.
219 | 
220 | ### 12. Remove Task (`remove_task`)
221 | 
222 | *   **MCP Tool:** `remove_task`
223 | *   **CLI Command:** `task-master remove-task [options]`
224 | *   **Description:** `Permanently remove a task or subtask from the Taskmaster tasks list.`
225 | *   **Key Parameters/Options:**
226 |     *   `id`: `Required. The ID of the Taskmaster task, e.g., '5', or subtask, e.g., '5.2', to permanently remove.` (CLI: `-i, --id <id>`)
227 |     *   `yes`: `Skip the confirmation prompt and immediately delete the task.` (CLI: `-y, --yes`)
228 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
229 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
230 | *   **Usage:** Permanently delete tasks or subtasks that are no longer needed in the project.
231 | *   **Notes:** Use with caution as this operation cannot be undone. Consider using 'blocked', 'cancelled', or 'deferred' status instead if you just want to exclude a task from active planning but keep it for reference. The command automatically cleans up dependency references in other tasks.
232 | 
233 | ---
234 | 
235 | ## Task Structure & Breakdown
236 | 
237 | ### 13. Expand Task (`expand_task`)
238 | 
239 | *   **MCP Tool:** `expand_task`
240 | *   **CLI Command:** `task-master expand [options]`
241 | *   **Description:** `Use Taskmaster's AI to break down a complex task into smaller, manageable subtasks. Appends subtasks by default.`
242 | *   **Key Parameters/Options:**
243 |     *   `id`: `The ID of the specific Taskmaster task you want to break down into subtasks.` (CLI: `-i, --id <id>`)
244 |     *   `num`: `Optional: Suggests how many subtasks Taskmaster should aim to create. Uses complexity analysis/defaults otherwise.` (CLI: `-n, --num <number>`)
245 |     *   `research`: `Enable Taskmaster to use the research role for more informed subtask generation. Requires appropriate API key.` (CLI: `-r, --research`)
246 |     *   `prompt`: `Optional: Provide extra context or specific instructions to Taskmaster for generating the subtasks.` (CLI: `-p, --prompt <text>`)
247 |     *   `force`: `Optional: If true, clear existing subtasks before generating new ones. Default is false (append).` (CLI: `--force`)
248 |     *   `tag`: `Specify which tag context the task belongs to. Defaults to the current active tag.` (CLI: `--tag <name>`)
249 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
250 | *   **Usage:** Generate a detailed implementation plan for a complex task before starting coding. Automatically uses complexity report recommendations if available and `num` is not specified.
251 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
252 | 
253 | ### 14. Expand All Tasks (`expand_all`)
254 | 
255 | *   **MCP Tool:** `expand_all`
256 | *   **CLI Command:** `task-master expand --all [options]` (Note: CLI uses the `expand` command with the `--all` flag)
257 | *   **Description:** `Tell Taskmaster to automatically expand all eligible pending/in-progress tasks based on complexity analysis or defaults. Appends subtasks by default.`
258 | *   **Key Parameters/Options:**
259 |     *   `num`: `Optional: Suggests how many subtasks Taskmaster should aim to create per task.` (CLI: `-n, --num <number>`)
260 |     *   `research`: `Enable research role for more informed subtask generation. Requires appropriate API key.` (CLI: `-r, --research`)
261 |     *   `prompt`: `Optional: Provide extra context for Taskmaster to apply generally during expansion.` (CLI: `-p, --prompt <text>`)
262 |     *   `force`: `Optional: If true, clear existing subtasks before generating new ones for each eligible task. Default is false (append).` (CLI: `--force`)
263 |     *   `tag`: `Specify which tag context to expand. Defaults to the current active tag.` (CLI: `--tag <name>`)
264 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
265 | *   **Usage:** Useful after initial task generation or complexity analysis to break down multiple tasks at once.
266 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
267 | 
268 | ### 15. Clear Subtasks (`clear_subtasks`)
269 | 
270 | *   **MCP Tool:** `clear_subtasks`
271 | *   **CLI Command:** `task-master clear-subtasks [options]`
272 | *   **Description:** `Remove all subtasks from one or more specified Taskmaster parent tasks.`
273 | *   **Key Parameters/Options:**
274 |     *   `id`: `The ID(s) of the Taskmaster parent task(s) whose subtasks you want to remove, e.g., '15' or '16,18'. Required unless using `all`.) (CLI: `-i, --id <ids>`)
275 |     *   `all`: `Tell Taskmaster to remove subtasks from all parent tasks.` (CLI: `--all`)
276 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
277 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
278 | *   **Usage:** Used before regenerating subtasks with `expand_task` if the previous breakdown needs replacement.
279 | 
280 | ### 16. Remove Subtask (`remove_subtask`)
281 | 
282 | *   **MCP Tool:** `remove_subtask`
283 | *   **CLI Command:** `task-master remove-subtask [options]`
284 | *   **Description:** `Remove a subtask from its Taskmaster parent, optionally converting it into a standalone task.`
285 | *   **Key Parameters/Options:**
286 |     *   `id`: `Required. The ID(s) of the Taskmaster subtask(s) to remove, e.g., '15.2' or '16.1,16.3'.` (CLI: `-i, --id <id>`)
287 |     *   `convert`: `If used, Taskmaster will turn the subtask into a regular top-level task instead of deleting it.` (CLI: `-c, --convert`)
288 |     *   `skipGenerate`: `Prevent Taskmaster from automatically regenerating markdown task files after removing the subtask.` (CLI: `--skip-generate`)
289 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
290 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
291 | *   **Usage:** Delete unnecessary subtasks or promote a subtask to a top-level task.
292 | 
293 | ### 17. Move Task (`move_task`)
294 | 
295 | *   **MCP Tool:** `move_task`
296 | *   **CLI Command:** `task-master move [options]`
297 | *   **Description:** `Move a task or subtask to a new position within the task hierarchy.`
298 | *   **Key Parameters/Options:**
299 |     *   `from`: `Required. ID of the task/subtask to move (e.g., "5" or "5.2"). Can be comma-separated for multiple tasks.` (CLI: `--from <id>`)
300 |     *   `to`: `Required. ID of the destination (e.g., "7" or "7.3"). Must match the number of source IDs if comma-separated.` (CLI: `--to <id>`)
301 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
302 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
303 | *   **Usage:** Reorganize tasks by moving them within the hierarchy. Supports various scenarios like:
304 |     *   Moving a task to become a subtask
305 |     *   Moving a subtask to become a standalone task
306 |     *   Moving a subtask to a different parent
307 |     *   Reordering subtasks within the same parent
308 |     *   Moving a task to a new, non-existent ID (automatically creates placeholders)
309 |     *   Moving multiple tasks at once with comma-separated IDs
310 | *   **Validation Features:**
311 |     *   Allows moving tasks to non-existent destination IDs (creates placeholder tasks)
312 |     *   Prevents moving to existing task IDs that already have content (to avoid overwriting)
313 |     *   Validates that source tasks exist before attempting to move them
314 |     *   Maintains proper parent-child relationships
315 | *   **Example CLI:** `task-master move --from=5.2 --to=7.3` to move subtask 5.2 to become subtask 7.3.
316 | *   **Example Multi-Move:** `task-master move --from=10,11,12 --to=16,17,18` to move multiple tasks to new positions.
317 | *   **Common Use:** Resolving merge conflicts in tasks.json when multiple team members create tasks on different branches.
318 | 
319 | ---
320 | 
321 | ## Dependency Management
322 | 
323 | ### 18. Add Dependency (`add_dependency`)
324 | 
325 | *   **MCP Tool:** `add_dependency`
326 | *   **CLI Command:** `task-master add-dependency [options]`
327 | *   **Description:** `Define a dependency in Taskmaster, making one task a prerequisite for another.`
328 | *   **Key Parameters/Options:**
329 |     *   `id`: `Required. The ID of the Taskmaster task that will depend on another.` (CLI: `-i, --id <id>`)
330 |     *   `dependsOn`: `Required. The ID of the Taskmaster task that must be completed first, the prerequisite.` (CLI: `-d, --depends-on <id>`)
331 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
332 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <path>`)
333 | *   **Usage:** Establish the correct order of execution between tasks.
334 | 
335 | ### 19. Remove Dependency (`remove_dependency`)
336 | 
337 | *   **MCP Tool:** `remove_dependency`
338 | *   **CLI Command:** `task-master remove-dependency [options]`
339 | *   **Description:** `Remove a dependency relationship between two Taskmaster tasks.`
340 | *   **Key Parameters/Options:**
341 |     *   `id`: `Required. The ID of the Taskmaster task you want to remove a prerequisite from.` (CLI: `-i, --id <id>`)
342 |     *   `dependsOn`: `Required. The ID of the Taskmaster task that should no longer be a prerequisite.` (CLI: `-d, --depends-on <id>`)
343 |     *   `tag`: `Specify which tag context to operate on. Defaults to the current active tag.` (CLI: `--tag <name>`)
344 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
345 | *   **Usage:** Update task relationships when the order of execution changes.
346 | 
347 | ### 20. Validate Dependencies (`validate_dependencies`)
348 | 
349 | *   **MCP Tool:** `validate_dependencies`
350 | *   **CLI Command:** `task-master validate-dependencies [options]`
351 | *   **Description:** `Check your Taskmaster tasks for dependency issues (like circular references or links to non-existent tasks) without making changes.`
352 | *   **Key Parameters/Options:**
353 |     *   `tag`: `Specify which tag context to validate. Defaults to the current active tag.` (CLI: `--tag <name>`)
354 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
355 | *   **Usage:** Audit the integrity of your task dependencies.
356 | 
357 | ### 21. Fix Dependencies (`fix_dependencies`)
358 | 
359 | *   **MCP Tool:** `fix_dependencies`
360 | *   **CLI Command:** `task-master fix-dependencies [options]`
361 | *   **Description:** `Automatically fix dependency issues (like circular references or links to non-existent tasks) in your Taskmaster tasks.`
362 | *   **Key Parameters/Options:**
363 |     *   `tag`: `Specify which tag context to fix dependencies in. Defaults to the current active tag.` (CLI: `--tag <name>`)
364 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
365 | *   **Usage:** Clean up dependency errors automatically.
366 | 
367 | ---
368 | 
369 | ## Analysis & Reporting
370 | 
371 | ### 22. Analyze Project Complexity (`analyze_project_complexity`)
372 | 
373 | *   **MCP Tool:** `analyze_project_complexity`
374 | *   **CLI Command:** `task-master analyze-complexity [options]`
375 | *   **Description:** `Have Taskmaster analyze your tasks to determine their complexity and suggest which ones need to be broken down further.`
376 | *   **Key Parameters/Options:**
377 |     *   `output`: `Where to save the complexity analysis report. Default is '.taskmaster/reports/task-complexity-report.json' (or '..._tagname.json' if a tag is used).` (CLI: `-o, --output <file>`)
378 |     *   `threshold`: `The minimum complexity score (1-10) that should trigger a recommendation to expand a task.` (CLI: `-t, --threshold <number>`)
379 |     *   `research`: `Enable research role for more accurate complexity analysis. Requires appropriate API key.` (CLI: `-r, --research`)
380 |     *   `tag`: `Specify which tag context to analyze. Defaults to the current active tag.` (CLI: `--tag <name>`)
381 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
382 | *   **Usage:** Used before breaking down tasks to identify which ones need the most attention.
383 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. Please inform users to hang tight while the operation is in progress.
384 | 
385 | ### 23. View Complexity Report (`complexity_report`)
386 | 
387 | *   **MCP Tool:** `complexity_report`
388 | *   **CLI Command:** `task-master complexity-report [options]`
389 | *   **Description:** `Display the task complexity analysis report in a readable format.`
390 | *   **Key Parameters/Options:**
391 |     *   `tag`: `Specify which tag context to show the report for. Defaults to the current active tag.` (CLI: `--tag <name>`)
392 |     *   `file`: `Path to the complexity report (default: '.taskmaster/reports/task-complexity-report.json').` (CLI: `-f, --file <file>`)
393 | *   **Usage:** Review and understand the complexity analysis results after running analyze-complexity.
394 | 
395 | ---
396 | 
397 | ## File Management
398 | 
399 | ### 24. Generate Task Files (`generate`)
400 | 
401 | *   **MCP Tool:** `generate`
402 | *   **CLI Command:** `task-master generate [options]`
403 | *   **Description:** `Create or update individual Markdown files for each task based on your tasks.json.`
404 | *   **Key Parameters/Options:**
405 |     *   `output`: `The directory where Taskmaster should save the task files (default: in a 'tasks' directory).` (CLI: `-o, --output <directory>`)
406 |     *   `tag`: `Specify which tag context to generate files for. Defaults to the current active tag.` (CLI: `--tag <name>`)
407 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
408 | *   **Usage:** Run this after making changes to tasks.json to keep individual task files up to date. This command is now manual and no longer runs automatically.
409 | 
410 | ---
411 | 
412 | ## AI-Powered Research
413 | 
414 | ### 25. Research (`research`)
415 | 
416 | *   **MCP Tool:** `research`
417 | *   **CLI Command:** `task-master research [options]`
418 | *   **Description:** `Perform AI-powered research queries with project context to get fresh, up-to-date information beyond the AI's knowledge cutoff.`
419 | *   **Key Parameters/Options:**
420 |     *   `query`: `Required. Research query/prompt (e.g., "What are the latest best practices for React Query v5?").` (CLI: `[query]` positional or `-q, --query <text>`)
421 |     *   `taskIds`: `Comma-separated list of task/subtask IDs from the current tag context (e.g., "15,16.2,17").` (CLI: `-i, --id <ids>`)
422 |     *   `filePaths`: `Comma-separated list of file paths for context (e.g., "src/api.js,docs/readme.md").` (CLI: `-f, --files <paths>`)
423 |     *   `customContext`: `Additional custom context text to include in the research.` (CLI: `-c, --context <text>`)
424 |     *   `includeProjectTree`: `Include project file tree structure in context (default: false).` (CLI: `--tree`)
425 |     *   `detailLevel`: `Detail level for the research response: 'low', 'medium', 'high' (default: medium).` (CLI: `--detail <level>`)
426 |     *   `saveTo`: `Task or subtask ID (e.g., "15", "15.2") to automatically save the research conversation to.` (CLI: `--save-to <id>`)
427 |     *   `saveFile`: `If true, saves the research conversation to a markdown file in '.taskmaster/docs/research/'.` (CLI: `--save-file`)
428 |     *   `noFollowup`: `Disables the interactive follow-up question menu in the CLI.` (CLI: `--no-followup`)
429 |     *   `tag`: `Specify which tag context to use for task-based context gathering. Defaults to the current active tag.` (CLI: `--tag <name>`)
430 |     *   `projectRoot`: `The directory of the project. Must be an absolute path.` (CLI: Determined automatically)
431 | *   **Usage:** **This is a POWERFUL tool that agents should use FREQUENTLY** to:
432 |     *   Get fresh information beyond knowledge cutoff dates
433 |     *   Research latest best practices, library updates, security patches
434 |     *   Find implementation examples for specific technologies
435 |     *   Validate approaches against current industry standards
436 |     *   Get contextual advice based on project files and tasks
437 | *   **When to Consider Using Research:**
438 |     *   **Before implementing any task** - Research current best practices
439 |     *   **When encountering new technologies** - Get up-to-date implementation guidance (libraries, apis, etc)
440 |     *   **For security-related tasks** - Find latest security recommendations
441 |     *   **When updating dependencies** - Research breaking changes and migration guides
442 |     *   **For performance optimization** - Get current performance best practices
443 |     *   **When debugging complex issues** - Research known solutions and workarounds
444 | *   **Research + Action Pattern:**
445 |     *   Use `research` to gather fresh information
446 |     *   Use `update_subtask` to commit findings with timestamps
447 |     *   Use `update_task` to incorporate research into task details
448 |     *   Use `add_task` with research flag for informed task creation
449 | *   **Important:** This MCP tool makes AI calls and can take up to a minute to complete. The research provides FRESH data beyond the AI's training cutoff, making it invaluable for current best practices and recent developments.
450 | 
451 | ---
452 | 
453 | ## Tag Management
454 | 
455 | This new suite of commands allows you to manage different task contexts (tags).
456 | 
457 | ### 26. List Tags (`tags`)
458 | 
459 | *   **MCP Tool:** `list_tags`
460 | *   **CLI Command:** `task-master tags [options]`
461 | *   **Description:** `List all available tags with task counts, completion status, and other metadata.`
462 | *   **Key Parameters/Options:**
463 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
464 |     *   `--show-metadata`: `Include detailed metadata in the output (e.g., creation date, description).` (CLI: `--show-metadata`)
465 | 
466 | ### 27. Add Tag (`add_tag`)
467 | 
468 | *   **MCP Tool:** `add_tag`
469 | *   **CLI Command:** `task-master add-tag <tagName> [options]`
470 | *   **Description:** `Create a new, empty tag context, or copy tasks from another tag.`
471 | *   **Key Parameters/Options:**
472 |     *   `tagName`: `Name of the new tag to create (alphanumeric, hyphens, underscores).` (CLI: `<tagName>` positional)
473 |     *   `--from-branch`: `Creates a tag with a name derived from the current git branch, ignoring the <tagName> argument.` (CLI: `--from-branch`)
474 |     *   `--copy-from-current`: `Copy tasks from the currently active tag to the new tag.` (CLI: `--copy-from-current`)
475 |     *   `--copy-from <tag>`: `Copy tasks from a specific source tag to the new tag.` (CLI: `--copy-from <tag>`)
476 |     *   `--description <text>`: `Provide an optional description for the new tag.` (CLI: `-d, --description <text>`)
477 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
478 | 
479 | ### 28. Delete Tag (`delete_tag`)
480 | 
481 | *   **MCP Tool:** `delete_tag`
482 | *   **CLI Command:** `task-master delete-tag <tagName> [options]`
483 | *   **Description:** `Permanently delete a tag and all of its associated tasks.`
484 | *   **Key Parameters/Options:**
485 |     *   `tagName`: `Name of the tag to delete.` (CLI: `<tagName>` positional)
486 |     *   `--yes`: `Skip the confirmation prompt.` (CLI: `-y, --yes`)
487 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
488 | 
489 | ### 29. Use Tag (`use_tag`)
490 | 
491 | *   **MCP Tool:** `use_tag`
492 | *   **CLI Command:** `task-master use-tag <tagName>`
493 | *   **Description:** `Switch your active task context to a different tag.`
494 | *   **Key Parameters/Options:**
495 |     *   `tagName`: `Name of the tag to switch to.` (CLI: `<tagName>` positional)
496 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
497 | 
498 | ### 30. Rename Tag (`rename_tag`)
499 | 
500 | *   **MCP Tool:** `rename_tag`
501 | *   **CLI Command:** `task-master rename-tag <oldName> <newName>`
502 | *   **Description:** `Rename an existing tag.`
503 | *   **Key Parameters/Options:**
504 |     *   `oldName`: `The current name of the tag.` (CLI: `<oldName>` positional)
505 |     *   `newName`: `The new name for the tag.` (CLI: `<newName>` positional)
506 |     *   `file`: `Path to your Taskmaster 'tasks.json' file. Default relies on auto-detection.` (CLI: `-f, --file <file>`)
507 | 
508 | ### 31. Copy Tag (`copy_tag`)
509 | 
510 | *   **MCP Tool:** `copy_tag`
511 | *   **CLI Command:** `task-master copy-tag <sourceName> <targetName> [options]`
512 | *   **Description:** `Copy an entire tag context, including all its tasks and metadata, to a new tag.`
513 | *   **Key Parameters/Options:**
514 |     *   `sourceName`: `Name of the tag to copy from.` (CLI: `<sourceName>` positional)
515 |     *   `targetName`: `Name of the new tag to create.` (CLI: `<targetName>` positional)
516 |     *   `--description <text>`: `Optional description for the new tag.` (CLI: `-d, --description <text>`)
517 | 
518 | ---
519 | 
520 | ## Miscellaneous
521 | 
522 | ### 32. Sync Readme (`sync-readme`) -- experimental
523 | 
524 | *   **MCP Tool:** N/A
525 | *   **CLI Command:** `task-master sync-readme [options]`
526 | *   **Description:** `Exports your task list to your project's README.md file, useful for showcasing progress.`
527 | *   **Key Parameters/Options:**
528 |     *   `status`: `Filter tasks by status (e.g., 'pending', 'done').` (CLI: `-s, --status <status>`)
529 |     *   `withSubtasks`: `Include subtasks in the export.` (CLI: `--with-subtasks`)
530 |     *   `tag`: `Specify which tag context to export from. Defaults to the current active tag.` (CLI: `--tag <name>`)
531 | 
532 | ---
533 | 
534 | ## Environment Variables Configuration (Updated)
535 | 
536 | Taskmaster primarily uses the **`.taskmaster/config.json`** file (in project root) for configuration (models, parameters, logging level, etc.), managed via `task-master models --setup`.
537 | 
538 | Environment variables are used **only** for sensitive API keys related to AI providers and specific overrides like the Ollama base URL:
539 | 
540 | *   **API Keys (Required for corresponding provider):**
541 |     *   `ANTHROPIC_API_KEY`
542 |     *   `PERPLEXITY_API_KEY`
543 |     *   `OPENAI_API_KEY`
544 |     *   `GOOGLE_API_KEY`
545 |     *   `MISTRAL_API_KEY`
546 |     *   `AZURE_OPENAI_API_KEY` (Requires `AZURE_OPENAI_ENDPOINT` too)
547 |     *   `OPENROUTER_API_KEY`
548 |     *   `XAI_API_KEY`
549 |     *   `OLLAMA_API_KEY` (Requires `OLLAMA_BASE_URL` too)
550 | *   **Endpoints (Optional/Provider Specific inside .taskmaster/config.json):**
551 |     *   `AZURE_OPENAI_ENDPOINT`
552 |     *   `OLLAMA_BASE_URL` (Default: `http://localhost:11434/api`)
553 | 
554 | **Set API keys** in your **`.env`** file in the project root (for CLI use) or within the `env` section of your **`.cursor/mcp.json`** file (for MCP/Cursor integration). All other settings (model choice, max tokens, temperature, log level, custom endpoints) are managed in `.taskmaster/config.json` via `task-master models` command or `models` MCP tool.
555 | 
556 | ---
557 | 
558 | For details on how these commands fit into the development process, see the [dev_workflow.mdc](mdc:.cursor/rules/taskmaster/dev_workflow.mdc).
```

app/api/accounts/route.ts
```
1 | import { NextRequest } from 'next/server'
2 | import { createClient } from '@/lib/supabase/server'
3 | import { requireAuth } from '../utils/auth'
4 | import { handleApiError } from '../utils/error-handler'
5 | import { 
6 |   createSuccessResponse, 
7 |   createCreatedResponse, 
8 |   createUpdatedResponse, 
9 |   createDeletedResponse 
10 | } from '../utils/response'
11 | import { 
12 |   validateRequestBody, 
13 |   createAccountSchema, 
14 |   updateAccountSchema 
15 | } from '../utils/validation'
16 | import { Tables, TablesInsert, TablesUpdate } from '@/types/database'
17 | 
18 | type Account = Tables<'accounts'>
19 | type AccountInsert = TablesInsert<'accounts'>
20 | type AccountUpdate = TablesUpdate<'accounts'>
21 | 
22 | /**
23 |  * GET /api/accounts
24 |  * Fetch user accounts
25 |  */
26 | export async function GET() {
27 |   try {
28 |     const user = await requireAuth()
29 |     const supabase = await createClient()
30 | 
31 |     const { data: accounts, error } = await supabase
32 |       .from('accounts')
33 |       .select('*')
34 |       .eq('user_id', user.id)
35 |       .eq('is_active', true)
36 |       .order('created_at', { ascending: false })
37 | 
38 |     if (error) throw error
39 | 
40 |     return createSuccessResponse(
41 |       accounts,
42 |       `Retrieved ${accounts.length} accounts successfully`
43 |     )
44 |   } catch (error) {
45 |     return handleApiError(error)
46 |   }
47 | }
48 | 
49 | /**
50 |  * POST /api/accounts
51 |  * Create new account
52 |  */
53 | export async function POST(request: NextRequest) {
54 |   try {
55 |     const user = await requireAuth()
56 |     const accountData = await validateRequestBody(request, createAccountSchema)
57 |     const supabase = await createClient()
58 | 
59 |     const newAccount: AccountInsert = {
60 |       ...accountData,
61 |       user_id: user.id,
62 |       current_balance: accountData.initial_balance,
63 |     }
64 | 
65 |     const { data: account, error } = await supabase
66 |       .from('accounts')
67 |       .insert(newAccount)
68 |       .select()
69 |       .single()
70 | 
71 |     if (error) throw error
72 | 
73 |     return createCreatedResponse(
74 |       account,
75 |       'Account created successfully'
76 |     )
77 |   } catch (error) {
78 |     return handleApiError(error)
79 |   }
80 | }
81 | 
82 | /**
83 |  * PUT /api/accounts
84 |  * Update account (requires account_id in request body)
85 |  */
86 | export async function PUT(request: NextRequest) {
87 |   try {
88 |     const user = await requireAuth()
89 |     const body = await request.json()
90 |     
91 |     // Extract account_id from body
92 |     const { account_id, ...updateData } = body
93 |     
94 |     if (!account_id) {
95 |       throw new Error('account_id is required')
96 |     }
97 | 
98 |     // Validate the update data
99 |     const validatedData = updateAccountSchema.parse(updateData)
100 |     const supabase = await createClient()
101 | 
102 |     // Verify the account belongs to the user
103 |     const { data: existingAccount, error: fetchError } = await supabase
104 |       .from('accounts')
105 |       .select('id')
106 |       .eq('id', account_id)
107 |       .eq('user_id', user.id)
108 |       .single()
109 | 
110 |     if (fetchError || !existingAccount) {
111 |       throw new Error('Account not found or access denied')
112 |     }
113 | 
114 |     const { data: updatedAccount, error } = await supabase
115 |       .from('accounts')
116 |       .update({
117 |         ...validatedData,
118 |         updated_at: new Date().toISOString(),
119 |       })
120 |       .eq('id', account_id)
121 |       .eq('user_id', user.id)
122 |       .select()
123 |       .single()
124 | 
125 |     if (error) throw error
126 | 
127 |     return createUpdatedResponse(
128 |       updatedAccount,
129 |       'Account updated successfully'
130 |     )
131 |   } catch (error) {
132 |     return handleApiError(error)
133 |   }
134 | }
135 | 
136 | /**
137 |  * DELETE /api/accounts
138 |  * Deactivate account (soft delete - requires account_id in request body)
139 |  */
140 | export async function DELETE(request: NextRequest) {
141 |   try {
142 |     const user = await requireAuth()
143 |     const { account_id } = await request.json()
144 |     
145 |     if (!account_id) {
146 |       throw new Error('account_id is required')
147 |     }
148 | 
149 |     const supabase = await createClient()
150 | 
151 |     // Verify the account belongs to the user
152 |     const { data: existingAccount, error: fetchError } = await supabase
153 |       .from('accounts')
154 |       .select('id')
155 |       .eq('id', account_id)
156 |       .eq('user_id', user.id)
157 |       .single()
158 | 
159 |     if (fetchError || !existingAccount) {
160 |       throw new Error('Account not found or access denied')
161 |     }
162 | 
163 |     // Soft delete by setting is_active to false
164 |     const { error } = await supabase
165 |       .from('accounts')
166 |       .update({
167 |         is_active: false,
168 |         updated_at: new Date().toISOString(),
169 |       })
170 |       .eq('id', account_id)
171 |       .eq('user_id', user.id)
172 | 
173 |     if (error) throw error
174 | 
175 |     return createDeletedResponse('Account deactivated successfully')
176 |   } catch (error) {
177 |     return handleApiError(error)
178 |   }
179 | } 
```

app/api/dashboard/route.ts
```
1 | import { NextRequest } from 'next/server'
2 | import { createClient } from '@/lib/supabase/server'
3 | import { requireAuth } from '../utils/auth'
4 | import { handleApiError } from '../utils/error-handler'
5 | import { createSuccessResponse } from '../utils/response'
6 | import { Database } from '@/types/database'
7 | 
8 | type FinancialSummary = Database['public']['Functions']['get_financial_summary']['Returns'][0]
9 | type BudgetProgress = Database['public']['Functions']['get_budget_progress']['Returns'][0]
10 | type InvestmentProgress = Database['public']['Functions']['get_investment_progress']['Returns'][0]
11 | 
12 | /**
13 |  * GET /api/dashboard
14 |  * Fetch aggregated dashboard data
15 |  */
16 | export async function GET(request: NextRequest) {
17 |   try {
18 |     const user = await requireAuth()
19 |     const supabase = await createClient()
20 | 
21 |     // Execute all dashboard queries in parallel
22 |     const [
23 |       { data: financialSummary, error: financialError },
24 |       { data: budgetProgress, error: budgetError },
25 |       { data: investmentProgress, error: investmentError },
26 |       { data: accounts, error: accountsError },
27 |       { data: recentTransactions, error: transactionsError }
28 |     ] = await Promise.all([
29 |       // Get financial summary
30 |       supabase.rpc('get_financial_summary', { p_user_id: user.id }),
31 |       
32 |       // Get budget progress
33 |       supabase.rpc('get_budget_progress', { p_user_id: user.id }),
34 |       
35 |       // Get investment progress
36 |       supabase.rpc('get_investment_progress', { p_user_id: user.id }),
37 |       
38 |       // Get accounts with balances
39 |       supabase
40 |         .from('accounts')
41 |         .select('id, name, type, current_balance, is_active')
42 |         .eq('user_id', user.id)
43 |         .eq('is_active', true)
44 |         .order('current_balance', { ascending: false }),
45 |       
46 |       // Get recent transactions
47 |       supabase
48 |         .from('transactions')
49 |         .select(`
50 |           id,
51 |           amount,
52 |           type,
53 |           transaction_date,
54 |           description,
55 |           accounts!transactions_account_id_fkey(name, type),
56 |           categories!transactions_category_id_fkey(name, type, icon),
57 |           from_accounts:accounts!transactions_from_account_id_fkey(name, type),
58 |           to_accounts:accounts!transactions_to_account_id_fkey(name, type)
59 |         `)
60 |         .eq('user_id', user.id)
61 |         .order('transaction_date', { ascending: false })
62 |         .order('created_at', { ascending: false })
63 |         .limit(10)
64 |     ])
65 | 
66 |     // Check for errors
67 |     if (financialError) throw financialError
68 |     if (budgetError) throw budgetError
69 |     if (investmentError) throw investmentError
70 |     if (accountsError) throw accountsError
71 |     if (transactionsError) throw transactionsError
72 | 
73 |     // Calculate additional metrics
74 |     const totalBalance = accounts?.reduce((sum, account) => sum + account.current_balance, 0) || 0
75 |     
76 |     // Get current financial summary (most recent period)
77 |     const currentPeriodSummary = financialSummary?.[0] || {
78 |       total_income: 0,
79 |       total_expenses: 0,
80 |       net_savings: 0,
81 |       period_start: new Date().toISOString().split('T')[0],
82 |       period_end: new Date().toISOString().split('T')[0],
83 |     }
84 | 
85 |     // Calculate budget totals
86 |     const budgetTotals = {
87 |       total_budget: budgetProgress?.reduce((sum: number, budget: BudgetProgress) => sum + (budget.budget_amount || 0), 0) || 0,
88 |       total_spent: budgetProgress?.reduce((sum: number, budget: BudgetProgress) => sum + (budget.spent_amount || 0), 0) || 0,
89 |       categories_over_budget: budgetProgress?.filter((budget: BudgetProgress) => 
90 |         budget.progress_percentage > 100
91 |       ).length || 0,
92 |     }
93 | 
94 |     // Calculate investment totals
95 |     const investmentTotals = {
96 |       total_target: investmentProgress?.reduce((sum: number, investment: InvestmentProgress) => sum + (investment.target_amount || 0), 0) || 0,
97 |       total_invested: investmentProgress?.reduce((sum: number, investment: InvestmentProgress) => sum + (investment.invested_amount || 0), 0) || 0,
98 |       average_progress: investmentProgress?.length > 0 
99 |         ? investmentProgress.reduce((sum: number, investment: InvestmentProgress) => sum + (investment.progress_percentage || 0), 0) / investmentProgress.length
100 |         : 0,
101 |     }
102 | 
103 |     // Group accounts by type
104 |     const accountsByType = accounts?.reduce((acc, account) => {
105 |       if (!acc[account.type]) {
106 |         acc[account.type] = []
107 |       }
108 |       acc[account.type].push(account)
109 |       return acc
110 |     }, {} as Record<string, typeof accounts>) || {}
111 | 
112 |     // Calculate account type totals
113 |     const accountTypeTotals = Object.entries(accountsByType).map(([type, accountsOfType]) => ({
114 |       type,
115 |       count: accountsOfType.length,
116 |       total_balance: accountsOfType.reduce((sum, account) => sum + account.current_balance, 0),
117 |     }))
118 | 
119 |     const dashboardData = {
120 |       // Financial Overview
121 |       financial_summary: {
122 |         current_period: currentPeriodSummary,
123 |         total_balance: totalBalance,
124 |         account_type_totals: accountTypeTotals,
125 |       },
126 |       
127 |       // Budget Overview
128 |       budget_overview: {
129 |         ...budgetTotals,
130 |         remaining_budget: budgetTotals.total_budget - budgetTotals.total_spent,
131 |         budget_utilization: budgetTotals.total_budget > 0 
132 |           ? (budgetTotals.total_spent / budgetTotals.total_budget) * 100 
133 |           : 0,
134 |         categories: budgetProgress || [],
135 |       },
136 |       
137 |       // Investment Overview
138 |       investment_overview: {
139 |         ...investmentTotals,
140 |         remaining_to_invest: investmentTotals.total_target - investmentTotals.total_invested,
141 |         categories: investmentProgress || [],
142 |       },
143 |       
144 |       // Accounts Summary
145 |       accounts_summary: {
146 |         total_accounts: accounts?.length || 0,
147 |         total_balance: totalBalance,
148 |         by_type: accountsByType,
149 |         accounts: accounts || [],
150 |       },
151 |       
152 |       // Recent Activity
153 |       recent_activity: {
154 |         transactions: recentTransactions || [],
155 |         transaction_count: recentTransactions?.length || 0,
156 |       },
157 |       
158 |       // Quick Stats
159 |       quick_stats: {
160 |         net_worth: totalBalance,
161 |         monthly_income: currentPeriodSummary.total_income,
162 |         monthly_expenses: currentPeriodSummary.total_expenses,
163 |         monthly_savings: currentPeriodSummary.net_savings,
164 |         savings_rate: currentPeriodSummary.total_income > 0 
165 |           ? (currentPeriodSummary.net_savings / currentPeriodSummary.total_income) * 100 
166 |           : 0,
167 |         budget_health: budgetTotals.total_budget > 0 
168 |           ? Math.max(0, 100 - (budgetTotals.total_spent / budgetTotals.total_budget) * 100)
169 |           : 100,
170 |       },
171 |     }
172 | 
173 |     return createSuccessResponse(
174 |       dashboardData,
175 |       'Dashboard data retrieved successfully'
176 |     )
177 |   } catch (error) {
178 |     return handleApiError(error)
179 |   }
180 | } 
```

app/api/categories/route.ts
```
1 | import { NextRequest } from 'next/server'
2 | import { createClient } from '@/lib/supabase/server'
3 | import { requireAuth } from '../utils/auth'
4 | import { handleApiError } from '../utils/error-handler'
5 | import { 
6 |   createSuccessResponse, 
7 |   createCreatedResponse, 
8 |   createUpdatedResponse, 
9 |   createDeletedResponse 
10 | } from '../utils/response'
11 | import { 
12 |   validateRequestBody, 
13 |   createCategorySchema, 
14 |   updateCategorySchema,
15 |   deleteCategorySchema 
16 | } from '../utils/validation'
17 | import { Tables, TablesInsert, TablesUpdate } from '@/types/database'
18 | 
19 | type Category = Tables<'categories'>
20 | type CategoryInsert = TablesInsert<'categories'>
21 | type CategoryUpdate = TablesUpdate<'categories'>
22 | 
23 | /**
24 |  * GET /api/categories
25 |  * Fetch user categories
26 |  */
27 | export async function GET() {
28 |   try {
29 |     const user = await requireAuth()
30 |     const supabase = await createClient()
31 | 
32 |     const { data: categories, error } = await supabase
33 |       .from('categories')
34 |       .select('*')
35 |       .eq('user_id', user.id)
36 |       .eq('is_active', true)
37 |       .order('type', { ascending: true })
38 |       .order('name', { ascending: true })
39 | 
40 |     if (error) throw error
41 | 
42 |     // Group categories by type for easier frontend consumption
43 |     const groupedCategories = {
44 |       expense: categories.filter(cat => cat.type === 'expense'),
45 |       income: categories.filter(cat => cat.type === 'income'),
46 |       investment: categories.filter(cat => cat.type === 'investment'),
47 |     }
48 | 
49 |     return createSuccessResponse(
50 |       {
51 |         categories,
52 |         grouped: groupedCategories,
53 |         total: categories.length,
54 |       },
55 |       `Retrieved ${categories.length} categories successfully`
56 |     )
57 |   } catch (error) {
58 |     return handleApiError(error)
59 |   }
60 | }
61 | 
62 | /**
63 |  * POST /api/categories
64 |  * Create new category
65 |  */
66 | export async function POST(request: NextRequest) {
67 |   try {
68 |     const user = await requireAuth()
69 |     const categoryData = await validateRequestBody(request, createCategorySchema)
70 |     const supabase = await createClient()
71 | 
72 |     const newCategory: CategoryInsert = {
73 |       ...categoryData,
74 |       user_id: user.id,
75 |     }
76 | 
77 |     const { data: category, error } = await supabase
78 |       .from('categories')
79 |       .insert(newCategory)
80 |       .select()
81 |       .single()
82 | 
83 |     if (error) throw error
84 | 
85 |     return createCreatedResponse(
86 |       category,
87 |       'Category created successfully'
88 |     )
89 |   } catch (error) {
90 |     return handleApiError(error)
91 |   }
92 | }
93 | 
94 | /**
95 |  * PUT /api/categories
96 |  * Update category (requires category_id in request body)
97 |  */
98 | export async function PUT(request: NextRequest) {
99 |   try {
100 |     const user = await requireAuth()
101 |     const body = await request.json()
102 |     
103 |     // Extract category_id from body
104 |     const { category_id, ...updateData } = body
105 |     
106 |     if (!category_id) {
107 |       throw new Error('category_id is required')
108 |     }
109 | 
110 |     // Validate the update data
111 |     const validatedData = updateCategorySchema.parse(updateData)
112 |     const supabase = await createClient()
113 | 
114 |     // Verify the category belongs to the user
115 |     const { data: existingCategory, error: fetchError } = await supabase
116 |       .from('categories')
117 |       .select('id')
118 |       .eq('id', category_id)
119 |       .eq('user_id', user.id)
120 |       .single()
121 | 
122 |     if (fetchError || !existingCategory) {
123 |       throw new Error('Category not found or access denied')
124 |     }
125 | 
126 |     const { data: updatedCategory, error } = await supabase
127 |       .from('categories')
128 |       .update({
129 |         ...validatedData,
130 |         updated_at: new Date().toISOString(),
131 |       })
132 |       .eq('id', category_id)
133 |       .eq('user_id', user.id)
134 |       .select()
135 |       .single()
136 | 
137 |     if (error) throw error
138 | 
139 |     return createUpdatedResponse(
140 |       updatedCategory,
141 |       'Category updated successfully'
142 |     )
143 |   } catch (error) {
144 |     return handleApiError(error)
145 |   }
146 | }
147 | 
148 | /**
149 |  * DELETE /api/categories
150 |  * Deactivate category and optionally reassign transactions to new category
151 |  */
152 | export async function DELETE(request: NextRequest) {
153 |   try {
154 |     const user = await requireAuth()
155 |     const deleteData = await validateRequestBody(request, deleteCategorySchema)
156 |     const { category_id, new_category_id } = deleteData
157 |     
158 |     const supabase = await createClient()
159 | 
160 |     // Verify the category belongs to the user
161 |     const { data: existingCategory, error: fetchError } = await supabase
162 |       .from('categories')
163 |       .select('id, name')
164 |       .eq('id', category_id)
165 |       .eq('user_id', user.id)
166 |       .single()
167 | 
168 |     if (fetchError || !existingCategory) {
169 |       throw new Error('Category not found or access denied')
170 |     }
171 | 
172 |     // Check if category is being used in transactions
173 |     const { data: transactionsUsingCategory, error: transactionError } = await supabase
174 |       .from('transactions')
175 |       .select('id, type')
176 |       .or(`category_id.eq.${category_id},investment_category_id.eq.${category_id}`)
177 |       .eq('user_id', user.id)
178 | 
179 |     if (transactionError) throw transactionError
180 | 
181 |     const hasTransactions = transactionsUsingCategory && transactionsUsingCategory.length > 0
182 | 
183 |     // If category has transactions, new_category_id is required
184 |     if (hasTransactions && !new_category_id) {
185 |       throw new Error(`Cannot delete category "${existingCategory.name}" because it has ${transactionsUsingCategory.length} associated transactions. Please provide new_category_id to reassign transactions.`)
186 |     }
187 | 
188 |     // If new_category_id is provided, verify it belongs to the user and is active
189 |     if (new_category_id) {
190 |       const { data: newCategory, error: newCategoryError } = await supabase
191 |         .from('categories')
192 |         .select('id, name, type, is_active')
193 |         .eq('id', new_category_id)
194 |         .eq('user_id', user.id)
195 |         .single()
196 | 
197 |       if (newCategoryError || !newCategory) {
198 |         throw new Error('New category not found or access denied')
199 |       }
200 | 
201 |       if (!newCategory.is_active) {
202 |         throw new Error('Cannot reassign transactions to an inactive category')
203 |       }
204 | 
205 |       // Update transactions to use the new category
206 |       if (hasTransactions) {
207 |         // Update transactions where this category is the main category
208 |         const { error: updateCategoryError } = await supabase
209 |           .from('transactions')
210 |           .update({
211 |             category_id: new_category_id,
212 |             updated_at: new Date().toISOString(),
213 |           })
214 |           .eq('category_id', category_id)
215 |           .eq('user_id', user.id)
216 | 
217 |         if (updateCategoryError) throw updateCategoryError
218 | 
219 |         // Update transactions where this category is the investment category
220 |         const { error: updateInvestmentCategoryError } = await supabase
221 |           .from('transactions')
222 |           .update({
223 |             investment_category_id: new_category_id,
224 |             updated_at: new Date().toISOString(),
225 |           })
226 |           .eq('investment_category_id', category_id)
227 |           .eq('user_id', user.id)
228 | 
229 |         if (updateInvestmentCategoryError) throw updateInvestmentCategoryError
230 |       }
231 |     }
232 | 
233 |     // Soft delete by setting is_active to false
234 |     const { error } = await supabase
235 |       .from('categories')
236 |       .update({
237 |         is_active: false,
238 |         updated_at: new Date().toISOString(),
239 |       })
240 |       .eq('id', category_id)
241 |       .eq('user_id', user.id)
242 | 
243 |     if (error) throw error
244 | 
245 |     const responseMessage = hasTransactions && new_category_id
246 |       ? `Category "${existingCategory.name}" deactivated successfully. ${transactionsUsingCategory.length} transactions reassigned to new category.`
247 |       : `Category "${existingCategory.name}" deactivated successfully.`
248 | 
249 |     return createDeletedResponse(responseMessage)
250 |   } catch (error) {
251 |     return handleApiError(error)
252 |   }
253 | } 
```

app/api/transactions/route.ts
```
1 | import { NextRequest } from 'next/server'
2 | import { createClient } from '@/lib/supabase/server'
3 | import { requireAuth } from '../utils/auth'
4 | import { handleApiError } from '../utils/error-handler'
5 | import { 
6 |   createSuccessResponse, 
7 |   createCreatedResponse, 
8 |   createUpdatedResponse, 
9 |   createDeletedResponse 
10 | } from '../utils/response'
11 | import { 
12 |   validateRequestBody, 
13 |   validateQueryParams,
14 |   createTransactionSchema, 
15 |   updateTransactionSchema,
16 |   transactionQuerySchema
17 | } from '../utils/validation'
18 | import { Tables, TablesInsert, TablesUpdate } from '@/types/database'
19 | 
20 | type Transaction = Tables<'transactions'>
21 | type TransactionInsert = TablesInsert<'transactions'>
22 | type TransactionUpdate = TablesUpdate<'transactions'>
23 | type Account = Tables<'accounts'>
24 | type BalanceLedgerInsert = TablesInsert<'balance_ledger'>
25 | 
26 | /**
27 |  * GET /api/transactions
28 |  * Fetch user transactions with optional filtering and infinite scroll support
29 |  */
30 | export async function GET(request: NextRequest) {
31 |   try {
32 |     const user = await requireAuth()
33 |     const url = new URL(request.url)
34 |     const queryParams = validateQueryParams(url, transactionQuerySchema)
35 |     const supabase = await createClient()
36 | 
37 |     // Create base query for filtering (used for both count and data)
38 |     const buildBaseQuery = (query: any) => {
39 |       let baseQuery = query.eq('user_id', user.id)
40 |       
41 |       if (queryParams.account_id) {
42 |         baseQuery = baseQuery.eq('account_id', queryParams.account_id)
43 |       }
44 |       if (queryParams.category_id) {
45 |         baseQuery = baseQuery.eq('category_id', queryParams.category_id)
46 |       }
47 |       if (queryParams.type) {
48 |         baseQuery = baseQuery.eq('type', queryParams.type)
49 |       }
50 |       if (queryParams.start_date) {
51 |         baseQuery = baseQuery.gte('transaction_date', queryParams.start_date)
52 |       }
53 |       if (queryParams.end_date) {
54 |         baseQuery = baseQuery.lte('transaction_date', queryParams.end_date)
55 |       }
56 |       
57 |       return baseQuery
58 |     }
59 | 
60 |     // Get total count for infinite scroll pagination
61 |     const countQuery = buildBaseQuery(supabase.from('transactions'))
62 |     const { count: totalCount, error: countError } = await countQuery
63 |       .select('*', { count: 'exact', head: true })
64 | 
65 |     if (countError) throw countError
66 | 
67 |     // Get actual data with relationships
68 |     const dataQuery = buildBaseQuery(
69 |       supabase
70 |         .from('transactions')
71 |         .select(`
72 |           *,
73 |           accounts!transactions_account_id_fkey(name, type),
74 |           categories!transactions_category_id_fkey(name, type, icon),
75 |           from_accounts:accounts!transactions_from_account_id_fkey(name, type),
76 |           to_accounts:accounts!transactions_to_account_id_fkey(name, type),
77 |           investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
78 |         `)
79 |     )
80 | 
81 |     // Apply pagination and ordering
82 |     const limit = queryParams.limit || 50
83 |     const offset = queryParams.offset || 0
84 |     
85 |     const { data: transactions, error } = await dataQuery
86 |       .order('transaction_date', { ascending: false })
87 |       .order('created_at', { ascending: false })
88 |       .range(offset, offset + limit - 1)
89 | 
90 |     if (error) throw error
91 | 
92 |     // Calculate infinite scroll metadata
93 |     const hasMore = (offset + transactions.length) < (totalCount || 0)
94 |     const nextOffset = hasMore ? offset + limit : null
95 | 
96 |     return createSuccessResponse(
97 |       {
98 |         transactions,
99 |         pagination: {
100 |           limit,
101 |           offset,
102 |           count: transactions.length,
103 |           total_count: totalCount || 0,
104 |           has_more: hasMore,
105 |           next_offset: nextOffset,
106 |         },
107 |       },
108 |       `Retrieved ${transactions.length} of ${totalCount || 0} transactions successfully`
109 |     )
110 |   } catch (error) {
111 |     return handleApiError(error)
112 |   }
113 | }
114 | 
115 | /**
116 |  * POST /api/transactions
117 |  * Create new transaction with balance updates
118 |  */
119 | export async function POST(request: NextRequest) {
120 |   try {
121 |     const user = await requireAuth()
122 |     const transactionData = await validateRequestBody(request, createTransactionSchema)
123 |     const supabase = await createClient()
124 | 
125 |     // Start a transaction
126 |     const { data: newTransaction, error: transactionError } = await supabase
127 |       .from('transactions')
128 |       .insert({
129 |         ...transactionData,
130 |         user_id: user.id,
131 |       })
132 |       .select()
133 |       .single()
134 | 
135 |     if (transactionError) throw transactionError
136 | 
137 |     // Update account balances based on transaction type
138 |     if (transactionData.type === 'transfer') {
139 |       // Handle transfer - update both accounts
140 |       if (!transactionData.from_account_id || !transactionData.to_account_id) {
141 |         throw new Error('Transfer requires both from_account_id and to_account_id')
142 |       }
143 | 
144 |       // Update from account (subtract amount)
145 |       await updateAccountBalance(
146 |         supabase,
147 |         transactionData.from_account_id,
148 |         -transactionData.amount,
149 |         newTransaction.id,
150 |         user.id
151 |       )
152 | 
153 |       // Update to account (add amount)
154 |       await updateAccountBalance(
155 |         supabase,
156 |         transactionData.to_account_id,
157 |         transactionData.amount,
158 |         newTransaction.id,
159 |         user.id
160 |       )
161 |     } else {
162 |       // Handle income/expense
163 |       if (!transactionData.account_id) {
164 |         throw new Error('Income/expense requires account_id')
165 |       }
166 | 
167 |       const balanceChange = transactionData.type === 'income' 
168 |         ? transactionData.amount 
169 |         : -transactionData.amount
170 | 
171 |       await updateAccountBalance(
172 |         supabase,
173 |         transactionData.account_id,
174 |         balanceChange,
175 |         newTransaction.id,
176 |         user.id
177 |       )
178 |     }
179 | 
180 |     // Fetch the complete transaction with related data
181 |     const { data: completeTransaction, error: fetchError } = await supabase
182 |       .from('transactions')
183 |       .select(`
184 |         *,
185 |         accounts!transactions_account_id_fkey(name, type),
186 |         categories!transactions_category_id_fkey(name, type, icon),
187 |         from_accounts:accounts!transactions_from_account_id_fkey(name, type),
188 |         to_accounts:accounts!transactions_to_account_id_fkey(name, type),
189 |         investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
190 |       `)
191 |       .eq('id', newTransaction.id)
192 |       .single()
193 | 
194 |     if (fetchError) throw fetchError
195 | 
196 |     return createCreatedResponse(
197 |       completeTransaction,
198 |       'Transaction created successfully'
199 |     )
200 |   } catch (error) {
201 |     return handleApiError(error)
202 |   }
203 | }
204 | 
205 | /**
206 |  * PUT /api/transactions
207 |  * Update transaction (requires transaction_id in request body)
208 |  */
209 | export async function PUT(request: NextRequest) {
210 |   try {
211 |     const user = await requireAuth()
212 |     const body = await request.json()
213 |     
214 |     const { transaction_id, ...updateData } = body
215 |     
216 |     if (!transaction_id) {
217 |       throw new Error('transaction_id is required')
218 |     }
219 | 
220 |     const validatedData = updateTransactionSchema.parse(updateData)
221 |     const supabase = await createClient()
222 | 
223 |     // Get the original transaction
224 |     const { data: originalTransaction, error: fetchError } = await supabase
225 |       .from('transactions')
226 |       .select('*')
227 |       .eq('id', transaction_id)
228 |       .eq('user_id', user.id)
229 |       .single()
230 | 
231 |     if (fetchError || !originalTransaction) {
232 |       throw new Error('Transaction not found or access denied')
233 |     }
234 | 
235 |     // Update the transaction
236 |     const { data: updatedTransaction, error: updateError } = await supabase
237 |       .from('transactions')
238 |       .update({
239 |         ...validatedData,
240 |         updated_at: new Date().toISOString(),
241 |       })
242 |       .eq('id', transaction_id)
243 |       .eq('user_id', user.id)
244 |       .select()
245 |       .single()
246 | 
247 |     if (updateError) throw updateError
248 | 
249 |     // If amount or accounts changed, update balances
250 |     if (
251 |       validatedData.amount !== undefined ||
252 |       validatedData.account_id !== undefined ||
253 |       validatedData.from_account_id !== undefined ||
254 |       validatedData.to_account_id !== undefined
255 |     ) {
256 |       // Reverse the original transaction's balance effects
257 |       await reverseTransactionBalanceEffects(supabase, originalTransaction, user.id)
258 |       
259 |       // Apply the new transaction's balance effects
260 |       await applyTransactionBalanceEffects(supabase, updatedTransaction, user.id)
261 |     }
262 | 
263 |     return createUpdatedResponse(
264 |       updatedTransaction,
265 |       'Transaction updated successfully'
266 |     )
267 |   } catch (error) {
268 |     return handleApiError(error)
269 |   }
270 | }
271 | 
272 | /**
273 |  * DELETE /api/transactions
274 |  * Delete transaction and reverse balance effects
275 |  */
276 | export async function DELETE(request: NextRequest) {
277 |   try {
278 |     const user = await requireAuth()
279 |     const { transaction_id } = await request.json()
280 |     
281 |     if (!transaction_id) {
282 |       throw new Error('transaction_id is required')
283 |     }
284 | 
285 |     const supabase = await createClient()
286 | 
287 |     // Get the transaction before deleting
288 |     const { data: transaction, error: fetchError } = await supabase
289 |       .from('transactions')
290 |       .select('*')
291 |       .eq('id', transaction_id)
292 |       .eq('user_id', user.id)
293 |       .single()
294 | 
295 |     if (fetchError || !transaction) {
296 |       throw new Error('Transaction not found or access denied')
297 |     }
298 | 
299 |     // Reverse the transaction's balance effects
300 |     await reverseTransactionBalanceEffects(supabase, transaction, user.id)
301 | 
302 |     // Delete the transaction
303 |     const { error: deleteError } = await supabase
304 |       .from('transactions')
305 |       .delete()
306 |       .eq('id', transaction_id)
307 |       .eq('user_id', user.id)
308 | 
309 |     if (deleteError) throw deleteError
310 | 
311 |     return createDeletedResponse('Transaction deleted successfully')
312 |   } catch (error) {
313 |     return handleApiError(error)
314 |   }
315 | }
316 | 
317 | /**
318 |  * Helper function to update account balance
319 |  */
320 | async function updateAccountBalance(
321 |   supabase: any,
322 |   accountId: string,
323 |   changeAmount: number,
324 |   transactionId: string,
325 |   userId: string
326 | ) {
327 |   // Get current balance
328 |   const { data: account, error: accountError } = await supabase
329 |     .from('accounts')
330 |     .select('current_balance')
331 |     .eq('id', accountId)
332 |     .eq('user_id', userId)
333 |     .single()
334 | 
335 |   if (accountError) throw accountError
336 | 
337 |   const balanceBefore = account.current_balance
338 |   const balanceAfter = balanceBefore + changeAmount
339 | 
340 |   // Update account balance
341 |   const { error: updateError } = await supabase
342 |     .from('accounts')
343 |     .update({
344 |       current_balance: balanceAfter,
345 |       updated_at: new Date().toISOString(),
346 |     })
347 |     .eq('id', accountId)
348 |     .eq('user_id', userId)
349 | 
350 |   if (updateError) throw updateError
351 | 
352 |   // Create balance ledger entry
353 |   const ledgerEntry: BalanceLedgerInsert = {
354 |     account_id: accountId,
355 |     transaction_id: transactionId,
356 |     balance_before: balanceBefore,
357 |     balance_after: balanceAfter,
358 |     change_amount: changeAmount,
359 |   }
360 | 
361 |   const { error: ledgerError } = await supabase
362 |     .from('balance_ledger')
363 |     .insert(ledgerEntry)
364 | 
365 |   if (ledgerError) throw ledgerError
366 | }
367 | 
368 | /**
369 |  * Helper function to reverse transaction balance effects
370 |  */
371 | async function reverseTransactionBalanceEffects(
372 |   supabase: any,
373 |   transaction: Transaction,
374 |   userId: string
375 | ) {
376 |   if (transaction.type === 'transfer') {
377 |     if (transaction.from_account_id) {
378 |       await updateAccountBalance(supabase, transaction.from_account_id, transaction.amount, transaction.id, userId)
379 |     }
380 |     if (transaction.to_account_id) {
381 |       await updateAccountBalance(supabase, transaction.to_account_id, -transaction.amount, transaction.id, userId)
382 |     }
383 |   } else {
384 |     if (transaction.account_id) {
385 |       const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount
386 |       await updateAccountBalance(supabase, transaction.account_id, balanceChange, transaction.id, userId)
387 |     }
388 |   }
389 | }
390 | 
391 | /**
392 |  * Helper function to apply transaction balance effects
393 |  */
394 | async function applyTransactionBalanceEffects(
395 |   supabase: any,
396 |   transaction: Transaction,
397 |   userId: string
398 | ) {
399 |   if (transaction.type === 'transfer') {
400 |     if (transaction.from_account_id) {
401 |       await updateAccountBalance(supabase, transaction.from_account_id, -transaction.amount, transaction.id, userId)
402 |     }
403 |     if (transaction.to_account_id) {
404 |       await updateAccountBalance(supabase, transaction.to_account_id, transaction.amount, transaction.id, userId)
405 |     }
406 |   } else {
407 |     if (transaction.account_id) {
408 |       const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
409 |       await updateAccountBalance(supabase, transaction.account_id, balanceChange, transaction.id, userId)
410 |     }
411 |   }
412 | } 
```

app/api/settings/route.ts
```
1 | import { NextRequest } from 'next/server'
2 | import { createClient } from '@/lib/supabase/server'
3 | import { requireAuth } from '../utils/auth'
4 | import { handleApiError } from '../utils/error-handler'
5 | import { createSuccessResponse, createUpdatedResponse } from '../utils/response'
6 | import { validateRequestBody, updateUserSettingsSchema } from '../utils/validation'
7 | import { Tables, TablesInsert, TablesUpdate } from '@/types/database'
8 | 
9 | type UserSettings = Tables<'user_settings'>
10 | type UserSettingsInsert = TablesInsert<'user_settings'>
11 | type UserSettingsUpdate = TablesUpdate<'user_settings'>
12 | 
13 | /**
14 |  * GET /api/settings
15 |  * Fetch user settings
16 |  */
17 | export async function GET() {
18 |   try {
19 |     const user = await requireAuth()
20 |     const supabase = await createClient()
21 | 
22 |     const { data: settings, error } = await supabase
23 |       .from('user_settings')
24 |       .select('*')
25 |       .eq('user_id', user.id)
26 |       .single()
27 | 
28 |     if (error) {
29 |       // If no settings exist, create default settings
30 |       if (error.code === 'PGRST116') {
31 |         const defaultSettings: UserSettingsInsert = {
32 |           user_id: user.id,
33 |           currency_code: 'USD',
34 |           financial_month_start_day: 1,
35 |           financial_week_start_day: 1, // Monday
36 |           onboarding_completed: false,
37 |         }
38 | 
39 |         const { data: newSettings, error: createError } = await supabase
40 |           .from('user_settings')
41 |           .insert(defaultSettings)
42 |           .select()
43 |           .single()
44 | 
45 |         if (createError) throw createError
46 | 
47 |         return createSuccessResponse(
48 |           newSettings,
49 |           'Default settings created successfully'
50 |         )
51 |       }
52 |       throw error
53 |     }
54 | 
55 |     return createSuccessResponse(settings, 'Settings retrieved successfully')
56 |   } catch (error) {
57 |     return handleApiError(error)
58 |   }
59 | }
60 | 
61 | /**
62 |  * PUT /api/settings
63 |  * Update user settings
64 |  */
65 | export async function PUT(request: NextRequest) {
66 |   try {
67 |     const user = await requireAuth()
68 |     const updateData = await validateRequestBody(request, updateUserSettingsSchema)
69 |     const supabase = await createClient()
70 | 
71 |     // Check if settings exist
72 |     const { data: existingSettings } = await supabase
73 |       .from('user_settings')
74 |       .select('id')
75 |       .eq('user_id', user.id)
76 |       .single()
77 | 
78 |     let updatedSettings: UserSettings
79 | 
80 |     if (existingSettings) {
81 |       // Update existing settings
82 |       const { data, error } = await supabase
83 |         .from('user_settings')
84 |         .update({
85 |           ...updateData,
86 |           updated_at: new Date().toISOString(),
87 |         })
88 |         .eq('user_id', user.id)
89 |         .select()
90 |         .single()
91 | 
92 |       if (error) throw error
93 |       updatedSettings = data
94 |     } else {
95 |       // Create new settings with provided data
96 |       const settingsData: UserSettingsInsert = {
97 |         user_id: user.id,
98 |         currency_code: updateData.currency_code || 'USD',
99 |         financial_month_start_day: updateData.financial_month_start_day || 1,
100 |         financial_week_start_day: updateData.financial_week_start_day || 1,
101 |         onboarding_completed: updateData.onboarding_completed || false,
102 |       }
103 | 
104 |       const { data, error } = await supabase
105 |         .from('user_settings')
106 |         .insert(settingsData)
107 |         .select()
108 |         .single()
109 | 
110 |       if (error) throw error
111 |       updatedSettings = data
112 |     }
113 | 
114 |     return createUpdatedResponse(
115 |       updatedSettings,
116 |       'Settings updated successfully'
117 |     )
118 |   } catch (error) {
119 |     return handleApiError(error)
120 |   }
121 | } 
```

app/auth/auth-code-error/page.tsx
```
1 | "use client";
2 | import { useSearchParams } from "next/navigation";
3 | import Link from "next/link";
4 | import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
5 | import { Button } from "@/components/ui/button";
6 | 
7 | export default function AuthErrorPage() {
8 |   const params = useSearchParams();
9 |   const reason = params.get("reason");
10 |   const message = params.get("message");
11 | 
12 |   let displayMessage = "Sorry, we couldn't sign you in. Please try again or return to the login page.";
13 |   if (reason === "missing_code") {
14 |     displayMessage = "Missing authentication code. Please try signing in again.";
15 |   } else if (reason === "exchange_failed" && message) {
16 |     displayMessage = decodeURIComponent(message);
17 |   }
18 | 
19 |   return (
20 |     <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
21 |       <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
22 |         <Alert variant="destructive" className="mb-6">
23 |           <AlertTitle>Authentication Error</AlertTitle>
24 |           <AlertDescription>{displayMessage}</AlertDescription>
25 |         </Alert>
26 |         <Link href="/auth/login">
27 |           <Button variant="outline" className="w-full">Go to Login</Button>
28 |         </Link>
29 |       </div>
30 |     </div>
31 |   );
32 | } 
```

app/api/utils/auth.ts
```
1 | import { createClient } from '@/lib/supabase/server'
2 | import { User } from '@supabase/supabase-js'
3 | 
4 | export interface AuthResult {
5 |   user: User | null
6 |   error: string | null
7 | }
8 | 
9 | /**
10 |  * Get authenticated user from request
11 |  * Returns user if authenticated, null if not
12 |  */
13 | export async function getAuthenticatedUser(): Promise<AuthResult> {
14 |   try {
15 |     const supabase = await createClient()
16 |     const { data: { user }, error } = await supabase.auth.getUser()
17 | 
18 |     if (error) {
19 |       return { user: null, error: 'Authentication failed' }
20 |     }
21 | 
22 |     if (!user) {
23 |       return { user: null, error: 'User not authenticated' }
24 |     }
25 | 
26 |     return { user, error: null }
27 |   } catch (error) {
28 |     return { user: null, error: 'Authentication service unavailable' }
29 |   }
30 | }
31 | 
32 | /**
33 |  * Middleware function to ensure user is authenticated
34 |  * Returns user if authenticated, throws error if not
35 |  */
36 | export async function requireAuth(): Promise<User> {
37 |   const { user, error } = await getAuthenticatedUser()
38 |   
39 |   if (!user || error) {
40 |     throw new Error(error || 'Authentication required')
41 |   }
42 |   
43 |   return user
44 | } 
```

app/api/utils/error-handler.ts
```
1 | import { NextResponse } from 'next/server'
2 | import { ZodError } from 'zod'
3 | 
4 | export interface ApiError {
5 |   message: string
6 |   error: string | object
7 |   status: number
8 | }
9 | 
10 | /**
11 |  * Standard API error response format
12 |  */
13 | export function createErrorResponse(
14 |   message: string,
15 |   error: string | object = '',
16 |   status: number = 500
17 | ): NextResponse {
18 |   return NextResponse.json(
19 |     {
20 |       data: null,
21 |       error,
22 |       message,
23 |     },
24 |     { status }
25 |   )
26 | }
27 | 
28 | /**
29 |  * Handle different types of errors and return appropriate responses
30 |  */
31 | export function handleApiError(error: unknown): NextResponse {
32 |   console.error('API Error:', error)
33 | 
34 |   // Zod validation errors
35 |   if (error instanceof ZodError) {
36 |     return createErrorResponse(
37 |       'Validation failed',
38 |       error.errors.map(e => ({
39 |         field: e.path.join('.'),
40 |         message: e.message
41 |       })),
42 |       400
43 |     )
44 |   }
45 | 
46 |   // Authentication errors
47 |   if (error instanceof Error && error.message.includes('Authentication')) {
48 |     return createErrorResponse(
49 |       'Authentication required',
50 |       error.message,
51 |       401
52 |     )
53 |   }
54 | 
55 |   // Database/Supabase errors
56 |   if (error && typeof error === 'object' && 'code' in error) {
57 |     const dbError = error as { code: string; message: string }
58 |     
59 |     switch (dbError.code) {
60 |       case 'PGRST116': // Row not found
61 |         return createErrorResponse('Resource not found', dbError.message, 404)
62 |       case '23505': // Unique violation
63 |         return createErrorResponse('Resource already exists', dbError.message, 409)
64 |       case '23503': // Foreign key violation
65 |         return createErrorResponse('Invalid reference', dbError.message, 400)
66 |       default:
67 |         return createErrorResponse('Database error', dbError.message, 500)
68 |     }
69 |   }
70 | 
71 |   // Generic error
72 |   if (error instanceof Error) {
73 |     return createErrorResponse(
74 |       'Internal server error',
75 |       error.message,
76 |       500
77 |     )
78 |   }
79 | 
80 |   // Unknown error
81 |   return createErrorResponse(
82 |     'An unexpected error occurred',
83 |     'Unknown error',
84 |     500
85 |   )
86 | } 
```

app/api/utils/response.ts
```
1 | import { NextResponse } from 'next/server'
2 | 
3 | export interface ApiResponse<T = any> {
4 |   data: T | null
5 |   error: string | object | null
6 |   message: string
7 | }
8 | 
9 | /**
10 |  * Create standardized success response
11 |  */
12 | export function createSuccessResponse<T>(
13 |   data: T,
14 |   message: string = 'Success',
15 |   status: number = 200
16 | ): NextResponse<ApiResponse<T>> {
17 |   return NextResponse.json(
18 |     {
19 |       data,
20 |       error: null,
21 |       message,
22 |     },
23 |     { status }
24 |   )
25 | }
26 | 
27 | /**
28 |  * Create response for resource creation
29 |  */
30 | export function createCreatedResponse<T>(
31 |   data: T,
32 |   message: string = 'Resource created successfully'
33 | ): NextResponse<ApiResponse<T>> {
34 |   return createSuccessResponse(data, message, 201)
35 | }
36 | 
37 | /**
38 |  * Create response for successful updates
39 |  */
40 | export function createUpdatedResponse<T>(
41 |   data: T,
42 |   message: string = 'Resource updated successfully'
43 | ): NextResponse<ApiResponse<T>> {
44 |   return createSuccessResponse(data, message, 200)
45 | }
46 | 
47 | /**
48 |  * Create response for successful deletions
49 |  */
50 | export function createDeletedResponse(
51 |   message: string = 'Resource deleted successfully'
52 | ): NextResponse<ApiResponse<null>> {
53 |   return createSuccessResponse(null, message, 200)
54 | } 
```

app/api/utils/validation.ts
```
1 | import { z } from 'zod'
2 | import { Database } from '@/types/database'
3 | 
4 | // Type aliases for cleaner code
5 | type AccountType = Database['public']['Enums']['account_type']
6 | type CategoryType = Database['public']['Enums']['category_type']
7 | type BudgetFrequency = Database['public']['Enums']['budget_frequency']
8 | type TransactionType = Database['public']['Enums']['transaction_type']
9 | 
10 | // Common validation patterns
11 | const uuidSchema = z.string().uuid()
12 | const positiveNumber = z.number().positive()
13 | 
14 | // Settings validation schemas
15 | export const updateUserSettingsSchema = z.object({
16 |   currency_code: z.string().length(3).optional(), // ISO 4217 currency codes
17 |   financial_month_start_day: z.number().int().min(1).max(31).optional(),
18 |   financial_week_start_day: z.number().int().min(0).max(6).optional(), // 0 = Sunday
19 |   onboarding_completed: z.boolean().optional(),
20 | })
21 | 
22 | // Account validation schemas
23 | export const createAccountSchema = z.object({
24 |   name: z.string().min(1).max(100),
25 |   type: z.enum(['bank_account', 'credit_card', 'investment_account'] as const),
26 |   initial_balance: z.number().default(0),
27 | })
28 | 
29 | export const updateAccountSchema = z.object({
30 |   name: z.string().min(1).max(100).optional(),
31 |   type: z.enum(['bank_account', 'credit_card', 'investment_account'] as const).optional(),
32 |   current_balance: z.number().optional(),
33 |   is_active: z.boolean().optional(),
34 | })
35 | 
36 | // Category validation schemas
37 | export const createCategorySchema = z.object({
38 |   name: z.string().min(1).max(100),
39 |   type: z.enum(['expense', 'income', 'investment'] as const),
40 |   icon: z.string().max(50).optional(),
41 |   budget_amount: z.number().positive().optional(),
42 |   budget_frequency: z.enum(['weekly', 'monthly', 'one_time'] as const).optional(),
43 | })
44 | 
45 | export const updateCategorySchema = z.object({
46 |   name: z.string().min(1).max(100).optional(),
47 |   type: z.enum(['expense', 'income', 'investment'] as const).optional(),
48 |   icon: z.string().max(50).optional(),
49 |   budget_amount: z.number().positive().nullable().optional(),
50 |   budget_frequency: z.enum(['weekly', 'monthly', 'one_time'] as const).nullable().optional(),
51 |   is_active: z.boolean().optional(),
52 | })
53 | 
54 | // Transaction validation schemas
55 | export const createTransactionSchema = z.object({
56 |   amount: positiveNumber,
57 |   type: z.enum(['income', 'expense', 'transfer'] as const),
58 |   transaction_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO date or datetime
59 |   description: z.string().max(500).optional(),
60 |   account_id: uuidSchema.optional(),
61 |   category_id: uuidSchema.optional(),
62 |   investment_category_id: uuidSchema.optional(),
63 |   from_account_id: uuidSchema.optional(),
64 |   to_account_id: uuidSchema.optional(),
65 | }).refine((data) => {
66 |   // For transfers, both from_account_id and to_account_id are required
67 |   if (data.type === 'transfer') {
68 |     return data.from_account_id && data.to_account_id
69 |   }
70 |   // For income/expense, account_id is required
71 |   return data.account_id
72 | }, {
73 |   message: "Transfer requires both from_account_id and to_account_id. Income/expense requires account_id.",
74 | })
75 | 
76 | export const updateTransactionSchema = z.object({
77 |   amount: positiveNumber.optional(),
78 |   type: z.enum(['income', 'expense', 'transfer'] as const).optional(),
79 |   transaction_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
80 |   description: z.string().max(500).nullable().optional(),
81 |   account_id: uuidSchema.nullable().optional(),
82 |   category_id: uuidSchema.nullable().optional(),
83 |   investment_category_id: uuidSchema.nullable().optional(),
84 |   from_account_id: uuidSchema.nullable().optional(),
85 |   to_account_id: uuidSchema.nullable().optional(),
86 | })
87 | 
88 | // Query parameter validation schemas
89 | export const transactionQuerySchema = z.object({
90 |   account_id: uuidSchema.optional(),
91 |   category_id: uuidSchema.optional(),
92 |   type: z.enum(['income', 'expense', 'transfer'] as const).optional(),
93 |   start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
94 |   end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
95 |   limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
96 |   offset: z.coerce.number().int().min(0).default(0).optional(),
97 | })
98 | 
99 | // Helper function to validate request body
100 | export async function validateRequestBody<T>(
101 |   request: Request,
102 |   schema: z.ZodSchema<T>
103 | ): Promise<T> {
104 |   const body = await request.json()
105 |   return schema.parse(body)
106 | }
107 | 
108 | // Category deletion schema
109 | export const deleteCategorySchema = z.object({
110 |   category_id: uuidSchema,
111 |   new_category_id: uuidSchema.optional(), // Required if category has transactions
112 | })
113 | 
114 | // Helper function to validate query parameters
115 | export function validateQueryParams<T>(
116 |   url: URL,
117 |   schema: z.ZodSchema<T>
118 | ): T {
119 |   const params = Object.fromEntries(url.searchParams)
120 |   return schema.parse(params)
121 | } 
```

app/auth/callback/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import { createClient } from '@/lib/supabase/server';
3 | 
4 | export async function GET(request: Request) {
5 |   const url = new URL(request.url);
6 |   const code = url.searchParams.get('code');
7 |   const next = url.searchParams.get('next') ?? '/dashboard';
8 |   const origin = url.origin;
9 | 
10 |   if (!code) {
11 |     // Redirect to a specific error page for missing code
12 |     return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=missing_code`);
13 |   }
14 | 
15 |   const supabase = await createClient();
16 |   try {
17 |     const { error } = await supabase.auth.exchangeCodeForSession(code);
18 |     if (error) {
19 |       console.error('Auth callback error:', error.message);
20 |       // Redirect to error page with error message as query param (encoded)
21 |       const errorMsg = encodeURIComponent(error.message || 'unknown_error');
22 |       return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exchange_failed&message=${errorMsg}`);
23 |     }
24 |     // Success: redirect to dashboard or next
25 |     return NextResponse.redirect(`${origin}${next}`);
26 |   } catch (err: any) {
27 |     console.error('Auth callback unexpected error:', err?.message || err);
28 |     const errorMsg = encodeURIComponent(err?.message || 'unexpected_error');
29 |     return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exchange_failed&message=${errorMsg}`);
30 |   }
31 | } 
```

app/auth/login/login-form.tsx
```
1 | "use client"
2 | 
3 | import { useState } from "react"
4 | import { useRouter } from "next/navigation"
5 | import { z } from "zod"
6 | import { useForm } from "react-hook-form"
7 | import { zodResolver } from "@hookform/resolvers/zod"
8 | import { Button } from "@/components/ui/button"
9 | import { Input } from "@/components/ui/input"
10 | import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
11 | import { toast } from "sonner"
12 | import { createClient } from "@/lib/supabase/client"
13 | import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
14 | 
15 | const loginSchema = z.object({
16 |   email: z.string().email({ message: "Invalid email address" }),
17 |   password: z.string().min(6, { message: "Password must be at least 6 characters" }),
18 | })
19 | 
20 | type LoginValues = z.infer<typeof loginSchema>
21 | 
22 | export default function LoginForm() {
23 |   const router = useRouter()
24 |   const [isLoading, setIsLoading] = useState(false)
25 |   const form = useForm<LoginValues>({
26 |     resolver: zodResolver(loginSchema),
27 |     defaultValues: { email: "", password: "" },
28 |   })
29 | 
30 |   async function onSubmit(values: LoginValues) {
31 |     setIsLoading(true)
32 |     const supabase = createClient()
33 |     const { error } = await supabase.auth.signInWithPassword({
34 |       email: values.email,
35 |       password: values.password,
36 |     })
37 |     setIsLoading(false)
38 |     if (error) {
39 |       toast.error(error.message)
40 |       return
41 |     }
42 |     toast.success("Logged in successfully!")
43 |     router.replace("/")
44 |   }
45 | 
46 |   return (
47 |     <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
48 |       <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
49 |         <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
50 |         <Form {...form}>
51 |           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
52 |             <FormField
53 |               control={form.control}
54 |               name="email"
55 |               render={({ field }) => (
56 |                 <FormItem>
57 |                   <FormLabel>Email</FormLabel>
58 |                   <FormControl>
59 |                     <Input type="email" autoComplete="email" {...field} disabled={isLoading} />
60 |                   </FormControl>
61 |                   <FormMessage />
62 |                 </FormItem>
63 |               )}
64 |             />
65 |             <FormField
66 |               control={form.control}
67 |               name="password"
68 |               render={({ field }) => (
69 |                 <FormItem>
70 |                   <FormLabel>Password</FormLabel>
71 |                   <FormControl>
72 |                     <Input type="password" autoComplete="current-password" {...field} disabled={isLoading} />
73 |                   </FormControl>
74 |                   <FormMessage />
75 |                 </FormItem>
76 |               )}
77 |             />
78 |             <Button type="submit" className="w-full" disabled={isLoading}>
79 |               {isLoading ? "Logging in..." : "Login"}
80 |             </Button>
81 |           </form>
82 |         </Form>
83 |         <div className="flex items-center my-6">
84 |           <div className="flex-grow border-t border-gray-200" />
85 |           <span className="mx-4 text-gray-400 text-xs">or</span>
86 |           <div className="flex-grow border-t border-gray-200" />
87 |         </div>
88 |         <GoogleSignInButton className="mb-2" />
89 |         <div className="flex justify-between mt-4 text-sm">
90 |           <a href="/auth/register" className="text-primary hover:underline">Sign Up</a>
91 |           <a href="/auth/reset-password" className="text-primary hover:underline">Forgot Password?</a>
92 |         </div>
93 |       </div>
94 |     </div>
95 |   )
96 | } 
```

app/auth/login/page.tsx
```
1 | import { redirect } from "next/navigation"
2 | import { createClient } from "@/lib/supabase/server"
3 | import LoginForm from "./login-form"
4 | 
5 | export default async function LoginPage() {
6 |   const supabase = await createClient()
7 |   const {
8 |     data: { user },
9 |   } = await supabase.auth.getUser()
10 |   // Redirect authenticated users away from login page
11 |   if (user) {
12 |     redirect("/dashboard")
13 |   }
14 |   return <LoginForm />
15 | } 
```

app/auth/register/page.tsx
```
1 | import { redirect } from "next/navigation"
2 | import { createClient } from "@/lib/supabase/server"
3 | import RegisterForm from "./register-form"
4 | 
5 | export default async function RegisterPage() {
6 |   const supabase = await createClient()
7 |   const {
8 |     data: { user },
9 |   } = await supabase.auth.getUser()
10 |   if (user) {
11 |     redirect("/")
12 |   }
13 |   return <RegisterForm />
14 | } 
```

app/auth/register/register-form.tsx
```
1 | "use client"
2 | 
3 | import { useState } from "react"
4 | import { useRouter } from "next/navigation"
5 | import { z } from "zod"
6 | import { useForm } from "react-hook-form"
7 | import { zodResolver } from "@hookform/resolvers/zod"
8 | import { Button } from "@/components/ui/button"
9 | import { Input } from "@/components/ui/input"
10 | import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
11 | import { toast } from "sonner"
12 | import { createClient } from "@/lib/supabase/client"
13 | import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
14 | 
15 | const registerSchema = z.object({
16 |   email: z.string().email({ message: "Invalid email address" }),
17 |   password: z.string().min(6, { message: "Password must be at least 6 characters" }),
18 | })
19 | 
20 | type RegisterValues = z.infer<typeof registerSchema>
21 | 
22 | export default function RegisterForm() {
23 |   const router = useRouter()
24 |   const [isLoading, setIsLoading] = useState(false)
25 |   const form = useForm<RegisterValues>({
26 |     resolver: zodResolver(registerSchema),
27 |     defaultValues: { email: "", password: "" },
28 |   })
29 | 
30 |   async function onSubmit(values: RegisterValues) {
31 |     setIsLoading(true)
32 |     const supabase = createClient()
33 |     const { error } = await supabase.auth.signUp({
34 |       email: values.email,
35 |       password: values.password,
36 |       options: {
37 |         emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
38 |       },
39 |     })
40 |     setIsLoading(false)
41 |     if (error) {
42 |       toast.error(error.message)
43 |       return
44 |     }
45 |     toast.success("Registration successful! Please check your email to confirm your account.")
46 |     router.replace("/auth/login")
47 |   }
48 | 
49 |   return (
50 |     <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
51 |       <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
52 |         <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
53 |         <Form {...form}>
54 |           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
55 |             <FormField
56 |               control={form.control}
57 |               name="email"
58 |               render={({ field }) => (
59 |                 <FormItem>
60 |                   <FormLabel>Email</FormLabel>
61 |                   <FormControl>
62 |                     <Input type="email" autoComplete="email" {...field} disabled={isLoading} />
63 |                   </FormControl>
64 |                   <FormMessage />
65 |                 </FormItem>
66 |               )}
67 |             />
68 |             <FormField
69 |               control={form.control}
70 |               name="password"
71 |               render={({ field }) => (
72 |                 <FormItem>
73 |                   <FormLabel>Password</FormLabel>
74 |                   <FormControl>
75 |                     <Input type="password" autoComplete="new-password" {...field} disabled={isLoading} />
76 |                   </FormControl>
77 |                   <FormMessage />
78 |                 </FormItem>
79 |               )}
80 |             />
81 |             <Button type="submit" className="w-full" disabled={isLoading}>
82 |               {isLoading ? "Signing up..." : "Sign Up"}
83 |             </Button>
84 |           </form>
85 |         </Form>
86 |         <div className="flex items-center my-6">
87 |           <div className="flex-grow border-t border-gray-200" />
88 |           <span className="mx-4 text-gray-400 text-xs">or</span>
89 |           <div className="flex-grow border-t border-gray-200" />
90 |         </div>
91 |         <GoogleSignInButton className="mb-2" />
92 |         <div className="flex justify-between mt-4 text-sm">
93 |           <a href="/auth/login" className="text-primary hover:underline">Login</a>
94 |         </div>
95 |       </div>
96 |     </div>
97 |   )
98 | } 
```
