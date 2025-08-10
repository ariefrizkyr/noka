import { Resend } from "resend";
import { render } from "@react-email/components";
import { FamilyInvitationEmail } from "./templates/family-invitation";

interface InvitationEmailData {
  id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  expires_at: string;
  families?: {
    name: string;
  };
  family_name?: string;
}

interface InviterInfo {
  email: string;
  full_name: string | null;
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send family invitation email using Resend API
 */
export async function sendInvitationEmail(
  invitation: InvitationEmailData,
  inviter?: InviterInfo,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const familyName =
    invitation.families?.name || invitation.family_name || "Unknown Family";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // Render the React email template to HTML
    const emailHtml = await render(
      FamilyInvitationEmail({
        familyName,
        inviterName: inviter?.full_name || undefined,
        inviterEmail: inviter?.email || "unknown@example.com",
        recipientEmail: invitation.email,
        role: invitation.role,
        invitationToken: invitation.token,
        expiresAt: invitation.expires_at,
        appUrl,
      }),
    );

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Noka <noka-noreply@prototypolab.com>",
      to: [invitation.email],
      subject: `You're invited to join ${familyName} on Noka`,
      html: emailHtml,
      // Add plain text fallback
      text: `You've been invited to join ${familyName} on Noka by ${inviter?.full_name || inviter?.email || "a family member"}. Visit ${appUrl}/invitations/${invitation.token} to accept your invitation. This invitation expires on ${new Date(invitation.expires_at).toLocaleDateString()}.`,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully:", data?.id);
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
}

/**
 * Get invitation email template for preview/testing
 */
export async function getInvitationEmailTemplate(
  invitation: InvitationEmailData,
  inviter?: InviterInfo,
): Promise<{ subject: string; html: string; text: string }> {
  const familyName =
    invitation.families?.name || invitation.family_name || "Unknown Family";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const subject = `You're invited to join ${familyName} on Noka`;

  // Render the React email template to HTML
  const html = await render(
    FamilyInvitationEmail({
      familyName,
      inviterName: inviter?.full_name || undefined,
      inviterEmail: inviter?.email || "unknown@example.com",
      recipientEmail: invitation.email,
      role: invitation.role,
      invitationToken: invitation.token,
      expiresAt: invitation.expires_at,
      appUrl,
    }),
  );

  const text = `
    You've been invited to join ${familyName} on Noka
    
    ${inviter?.full_name || inviter?.email || "Someone"} has invited you to join their family on Noka.
    
    Family: ${familyName}
    Your Role: ${invitation.role === "admin" ? "Admin" : "Member"}
    
    To accept this invitation, visit: ${appUrl}/invitations/${invitation.token}
    
    This invitation expires on ${new Date(invitation.expires_at).toLocaleDateString()}.
  `;

  return { subject, html, text };
}

/**
 * Check if Resend is properly configured
 */
export function isEmailServiceConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Get email service status for debugging
 */
export function getEmailServiceStatus(): {
  configured: boolean;
  apiKeyPresent: boolean;
  appUrl: string;
} {
  return {
    configured: isEmailServiceConfigured(),
    apiKeyPresent: Boolean(process.env.RESEND_API_KEY),
    appUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };
}
