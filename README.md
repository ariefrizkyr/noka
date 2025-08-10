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

## Email Service (Resend)

This project uses [Resend](https://resend.com) for sending transactional emails, such as family invitations. Emails are rendered using [React Email](https://react.email) for professional, responsive templates.

### Quick Setup

1. **Get Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Create a new API key at [resend.com/api-keys](https://resend.com/api-keys)
   - Copy your API key (starts with `re_`)

2. **Configure Environment Variable**
   ```bash
   # Add to your .env.local file
   RESEND_API_KEY=re_your_api_key_here
   ```

3. **Domain Setup (Production)**
   - Add and verify your sending domain in [Resend Dashboard](https://resend.com/domains)
   - Update the `from` address in `lib/email/invitation-service.ts` to use your verified domain
   - Example: `from: 'Noka <noreply@yourdomain.com>'`

### Features

- **Family Invitation Emails**: Professional HTML templates for family invitations
- **React Email Templates**: Maintainable, responsive email designs
- **Development Mode**: Console logging when API key is not configured
- **Error Handling**: Comprehensive error handling with Resend API error codes
- **Plain Text Fallback**: Automatic plain text versions for accessibility

### Email Templates

Email templates are located in `lib/email/templates/` and built using React Email components:

- `family-invitation.tsx` - Professional invitation emails with role details and branding

### Development

```bash
# Check email service status
import { getEmailServiceStatus } from '@/lib/email/invitation-service'
console.log(getEmailServiceStatus())

# Preview email template (future feature)
# Visit /api/email/preview/family-invitation
```

### Customization

1. **Styling**: Modify template styles in `lib/email/templates/family-invitation.tsx`
2. **Content**: Update email copy and structure in the template component
3. **Sender Address**: Change the `from` field in `sendInvitationEmail()` function
4. **App URL**: Set `NEXT_PUBLIC_SITE_URL` for correct invitation links

### Troubleshooting

- **No emails sent**: Check that `RESEND_API_KEY` is set correctly
- **Domain verification required**: For production, verify your sending domain in Resend
- **Rate limits**: Resend has sending limits on free tier
- **Delivery issues**: Check Resend dashboard for delivery status and logs

### API Integration

The email service is integrated into:
- Family invitation creation (`POST /api/families/[id]/members/invite`)
- Invitation resending (`POST /api/invitations/by-id/[id]/resend`)

All email sending is handled automatically when these endpoints are called.
