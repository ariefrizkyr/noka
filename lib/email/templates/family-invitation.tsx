import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Row,
  Column,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface FamilyInvitationEmailProps {
  familyName: string;
  inviterName?: string;
  inviterEmail: string;
  recipientEmail: string;
  role: 'admin' | 'member';
  invitationToken: string;
  expiresAt: string;
  appUrl?: string;
}

export function FamilyInvitationEmail({
  familyName,
  inviterName,
  inviterEmail,
  recipientEmail,
  role,
  invitationToken,
  expiresAt,
  appUrl = 'http://localhost:3000'
}: FamilyInvitationEmailProps) {
  const inviteUrl = `${appUrl}/invitations/${invitationToken}`;
  const expiryDate = new Date(expiresAt).toLocaleDateString();
  const inviterDisplayName = inviterName || inviterEmail;
  const isAdmin = role === 'admin';

  return (
    <Html lang="en">
      <Head />
      <Preview>You've been invited to join {familyName} on Noka</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={headerTitle}>Noka</Heading>
                <Text style={headerSubtitle}>Personal & Family Finance</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={mainTitle}>You're invited to join {familyName}</Heading>
            
            <Text style={greeting}>
              {inviterDisplayName} has invited you to join their family on Noka, 
              where you can collaborate on managing your finances together.
            </Text>

            {/* Family Details Card */}
            <Section style={detailsCard}>
              <Row>
                <Column style={detailsColumn}>
                  <Text style={detailsLabel}>Family</Text>
                  <Text style={detailsValue}>{familyName}</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={detailsLabel}>Your Role</Text>
                  <Text style={{...detailsValue, ...(isAdmin ? adminRole : memberRole)}}>
                    {isAdmin ? 'Admin' : 'Member'}
                  </Text>
                </Column>
              </Row>
              <Hr style={detailsHr} />
              <Row>
                <Column>
                  <Text style={detailsLabel}>Invited Email</Text>
                  <Text style={detailsValue}>{recipientEmail}</Text>
                </Column>
              </Row>
            </Section>

            {/* Call to Action */}
            <Section style={ctaSection}>
              <Button href={inviteUrl} style={acceptButton}>
                Accept Invitation
              </Button>
            </Section>

            {/* Role Description */}
            <Section style={roleDescription}>
              <Text style={roleTitle}>What you can do as {isAdmin ? 'an admin' : 'a member'}:</Text>
              <Text style={roleDetails}>
                {isAdmin 
                  ? 'As an admin, you\'ll be able to manage family members, accounts, categories, and all family settings. You can invite new members and control access to shared financial data.'
                  : 'As a member, you\'ll be able to view and manage shared family finances, add transactions, and collaborate on budgeting and investment tracking.'
                }
              </Text>
            </Section>

            <Hr style={separator} />

            {/* Footer Information */}
            <Section style={footer}>
              <Text style={expiryText}>
                This invitation expires on {expiryDate}.
              </Text>
              
              <Text style={alternativeText}>
                If you can't click the button above, copy and paste this link into your browser:
              </Text>
              <Text style={linkText}>{inviteUrl}</Text>

              <Hr style={footerHr} />

              <Text style={footerNote}>
                This invitation was sent by {inviterDisplayName} ({inviterEmail}) through Noka.
                If you didn't expect this invitation, you can safely ignore this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '0',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#2563eb',
  borderRadius: '8px 8px 0 0',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const headerSubtitle = {
  color: '#dbeafe',
  fontSize: '14px',
  margin: '0',
};

const content = {
  padding: '32px',
};

const mainTitle = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

const detailsCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '20px',
  margin: '0 0 24px 0',
};

const detailsColumn = {
  verticalAlign: 'top' as const,
};

const detailsLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px 0',
};

const detailsValue = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const adminRole = {
  color: '#2563eb',
};

const memberRole = {
  color: '#059669',
};

const detailsHr = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '16px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const acceptButton = {
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const roleDescription = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde047',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 24px 0',
};

const roleTitle = {
  color: '#a16207',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const roleDetails = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const separator = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '24px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
};

const expiryText = {
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const alternativeText = {
  margin: '0 0 8px 0',
};

const linkText = {
  color: '#2563eb',
  wordBreak: 'break-all' as const,
  margin: '0 0 16px 0',
};

const footerHr = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '20px 0',
};

const footerNote = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
};

export default FamilyInvitationEmail;