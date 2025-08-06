"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Loader2, 
  Users, 
  Shield, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InvitationDetails {
  id: string;
  token: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  expires_at: string;
  created_at: string;
  families: {
    name: string;
  };
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        // Check if user is logged in by attempting to fetch user invitations
        const response = await fetch("/api/invitations");
        if (!response.ok) {
          if (response.status === 401) {
            // User is not logged in, redirect to login with redirect back
            router.push(`/auth/login?redirect=/invitations/${token}`);
            return;
          }
          throw new Error("Failed to verify authentication");
        }

        const data = await response.json();
        const userInvitations = data.data;

        // Find the invitation matching this token
        const matchedInvitation = userInvitations.find(
          (inv: InvitationDetails) => inv.token === token || inv.id === token
        );

        if (!matchedInvitation) {
          setError("Invitation not found or has expired");
        } else {
          setInvitation(matchedInvitation);
        }
      } catch (error) {
        console.error("Error fetching invitation details:", error);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitationDetails();
    }
  }, [token, router]);

  const handleAccept = async () => {
    if (!invitation) return;

    setAccepting(true);
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      const data = await response.json();
      toast.success(`Successfully joined ${data.data.family_name}!`);
      
      // Redirect to dashboard after successful acceptance
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    setDeclining(true);
    try {
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to decline invitation");
      }

      const data = await response.json();
      toast.success(`Declined invitation to ${data.data.family_name}`);
      
      // Redirect to dashboard after declining
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to decline invitation");
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation may have expired or already been processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation has expired
  const isExpired = new Date(invitation.expires_at) <= new Date();
  const isAlreadyProcessed = invitation.status !== 'pending';

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation to join {invitation.families.name} has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Expired {formatDistanceToNow(new Date(invitation.expires_at))} ago
            </p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAlreadyProcessed) {
    const isAccepted = invitation.status === 'accepted';
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {isAccepted ? (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle>
              Invitation {isAccepted ? 'Accepted' : 'Declined'}
            </CardTitle>
            <CardDescription>
              You have already {isAccepted ? 'accepted' : 'declined'} this invitation to join {invitation.families.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Family Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a family on Noka
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Family Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{invitation.families.name}</h3>
            <div className="flex items-center justify-center gap-2">
              {invitation.role === 'admin' ? (
                <Shield className="h-4 w-4 text-blue-600" />
              ) : (
                <User className="h-4 w-4 text-gray-500" />
              )}
              <Badge variant={invitation.role === 'admin' ? 'default' : 'secondary'}>
                {invitation.role}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Invitation Details */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Invited to: <span className="font-medium">{invitation.email}</span>
            </p>
            <p className="text-sm text-gray-600">
              Sent {formatDistanceToNow(new Date(invitation.created_at))} ago
            </p>
            <p className="text-sm text-gray-600">
              Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
            </p>
          </div>

          <Separator />

          {/* Role Description */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {invitation.role === 'admin'
                ? "As an admin, you'll be able to manage family members, accounts, and settings."
                : "As a member, you'll be able to view and manage shared family finances."
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
              disabled={declining || accepting}
            >
              {declining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                "Decline"
              )}
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1"
              disabled={accepting || declining}
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}