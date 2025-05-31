This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google SSO Authentication

This project supports Google Single Sign-On (SSO) for both registration and login, in addition to traditional email/password authentication.

### For Users
- On the login and registration pages, click the **Continue with Google** button for one-click sign-in.
- If you are a new user, your account will be created automatically after authenticating with Google.
- If you are an existing user, you will be logged in and redirected to your dashboard.
- If authentication fails, you will see a clear error message and a link to return to the login page.

### For Developers
- Google SSO is powered by Supabase Auth and Google Cloud OAuth.
- To enable Google SSO:
  1. Set up a Google OAuth 2.0 Client in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  2. Add the client ID and secret to your Supabase project's Auth Providers (Google) section.
  3. Set the redirect URI to `${NEXT_PUBLIC_SITE_URL}/auth/callback` in both Google Cloud and Supabase.
  4. Ensure your `.env` contains the correct `NEXT_PUBLIC_SITE_URL`.
- The SSO button uses shadcn/ui for accessibility and branding compliance.
- Error and loading states are handled automatically in the UI.

### Error Handling & Troubleshooting
- If there is an error during authentication (e.g., missing code, exchange failure), users are redirected to `/auth/auth-code-error` with a descriptive message.
- Common issues:
  - **Misconfigured redirect URI:** Ensure the URI matches exactly in both Google Cloud and Supabase.
  - **Invalid client credentials:** Double-check your client ID and secret.
  - **Network issues:** Retry or check your connection.
- For more details, see `scripts/google-sso.txt` and the Supabase/Google OAuth documentation links in that file.
