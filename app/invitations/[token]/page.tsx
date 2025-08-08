"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Users, Shield, User, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InvitationDetails {
  id: string;
  token: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "declined";
  expires_at: string;
  created_at: string;
  family: {
    id: string;
    name: string;
  };
}

interface ValidationResponse {
  valid: boolean;
  invitation?: InvitationDetails;
  error?: "not_found" | "expired" | "already_processed";
  message?: string;
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isInitialized } = useAuth();
  const token = params.token as string;
  const action = searchParams.get("action") as "accept" | "decline" | null;

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateInvitationAndAuth = async () => {
      if (!token) return;

      try {
        // Step 1: Validate token (no auth required)
        const validationResponse = await fetch(
          `/api/invitations/${token}/validate`,
        );
        if (!validationResponse.ok) {
          throw new Error("Failed to validate invitation");
        }

        const validationData: { data: ValidationResponse } =
          await validationResponse.json();

        if (!validationData.data.valid) {
          setError(validationData.data.message || "Invalid invitation");
          setLoading(false);
          return;
        }

        const invitation = validationData.data.invitation!;

        // If user is authenticated, validate that their email matches the invitation email
        if (isInitialized && user) {
          if (invitation.email !== user.email) {
            setError("Invalid or expired invitation");
            setLoading(false);
            return;
          }
        }

        setInvitation(invitation);

        // If user returned from auth with an action, execute it immediately
        // But only if auth is initialized and user is available
        if (action && isInitialized) {
          // Clear the action from URL first
          const url = new URL(window.location.href);
          url.searchParams.delete("action");
          window.history.replaceState({}, "", url.toString());

          // Execute the action immediately (handleAcceptDirectly and handleDeclineDirectly will check auth)
          if (action === "accept") {
            handleAcceptDirectly();
          } else if (action === "decline") {
            handleDeclineDirectly();
          }
          return; // Don't show the invitation page, just process the action
        }

        // Just show the invitation - no auth check needed for viewing
        setLoading(false);
      } catch (error) {
        console.error("Error validating invitation:", error);
        setError("Failed to load invitation details");
        setLoading(false);
      }
    };

    validateInvitationAndAuth();
  }, [token, router, action, isInitialized, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthAndRedirect = async (
    action?: "accept" | "decline",
  ): Promise<boolean> => {
    // Wait for auth to be initialized
    if (!isInitialized) {
      return false;
    }

    if (!user) {
      // Not authenticated - redirect to login with action preserved
      const redirectUrl = action
        ? `/invitations/${token}?action=${action}`
        : `/invitations/${token}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return false;
    }

    return true; // User is authenticated
  };

  const handleAcceptDirectly = async () => {
    if (!invitation) return;

    // Check if user is authenticated first
    if (!isInitialized) {
      // Still initializing, wait
      return;
    }

    if (!user) {
      console.log(
        "handleAcceptDirectly: User not authenticated, redirecting to login",
      );
      const redirectUrl = `/invitations/${token}?action=accept`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

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
      toast.success(
        `Successfully joined ${data.data.family_name || invitation.family.name}!`,
      );

      // Store invitation context for onboarding
      sessionStorage.setItem("acceptedFamilyId", invitation.family.id);
      sessionStorage.setItem("acceptedFamilyName", invitation.family.name);

      // Check onboarding status to determine redirect
      try {
        const onboardingResponse = await fetch("/api/onboarding");
        if (onboardingResponse.ok) {
          const onboardingResult = await onboardingResponse.json();
          const redirectUrl = onboardingResult.data?.onboarding_completed
            ? "/dashboard"
            : "/onboarding";

          setTimeout(() => {
            router.push(redirectUrl);
          }, 2000);
        } else {
          // Default to dashboard if onboarding check fails
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (onboardingError) {
        console.error("Error checking onboarding status:", onboardingError);
        // Default to dashboard if onboarding check fails
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation",
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineDirectly = async () => {
    if (!invitation) return;

    // Check if user is authenticated first
    if (!isInitialized) {
      // Still initializing, wait
      return;
    }

    if (!user) {
      const redirectUrl = `/invitations/${token}?action=decline`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

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
      toast.success(
        `Declined invitation to ${data.data.family_name || invitation.family.name}`,
      );

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to decline invitation",
      );
    } finally {
      setDeclining(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    // Check authentication first
    const isAuthenticated = await checkAuthAndRedirect("accept");
    if (!isAuthenticated) return;

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
      toast.success(
        `Successfully joined ${data.data.family_name || invitation.family.name}!`,
      );

      // Store invitation context for onboarding
      sessionStorage.setItem("acceptedFamilyId", invitation.family.id);
      sessionStorage.setItem("acceptedFamilyName", invitation.family.name);

      // Check onboarding status to determine redirect
      try {
        const onboardingResponse = await fetch("/api/onboarding");
        if (onboardingResponse.ok) {
          const onboardingResult = await onboardingResponse.json();
          const redirectUrl = onboardingResult.data?.onboarding_completed
            ? "/dashboard"
            : "/onboarding";

          setTimeout(() => {
            router.push(redirectUrl);
          }, 2000);
        } else {
          // Default to dashboard if onboarding check fails
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (onboardingError) {
        console.error("Error checking onboarding status:", onboardingError);
        // Default to dashboard if onboarding check fails
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation",
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    // Check authentication first
    const isAuthenticated = await checkAuthAndRedirect("decline");
    if (!isAuthenticated) return;

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
      toast.success(
        `Declined invitation to ${data.data.family_name || invitation.family.name}`,
      );

      // Redirect to dashboard after declining
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to decline invitation",
      );
    } finally {
      setDeclining(false);
    }
  };

  if (loading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
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

  // Since validation is now done in the useEffect, we only show the invitation if it's valid and pending
  // The validation API already handles expired and processed invitations

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-blue-500" />
          <CardTitle>Family Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a family on Noka
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Family Info */}
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">
              {invitation.family.name}
            </h3>
            <div className="flex items-center justify-center gap-2">
              {invitation.role === "admin" ? (
                <Shield className="h-4 w-4 text-blue-600" />
              ) : (
                <User className="h-4 w-4 text-gray-500" />
              )}
              <Badge
                variant={invitation.role === "admin" ? "default" : "secondary"}
              >
                {invitation.role}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Invitation Details */}
          <div className="space-y-2 text-center">
            {/* Only show email if user is authenticated (privacy protection) */}
            {isInitialized && user && (
              <p className="text-sm text-gray-600">
                Invited to:{" "}
                <span className="font-medium">{invitation.email}</span>
              </p>
            )}
            <p className="text-sm text-gray-600">
              Sent {formatDistanceToNow(new Date(invitation.created_at))} ago
            </p>
            <p className="text-sm text-gray-600">
              Expires{" "}
              {formatDistanceToNow(new Date(invitation.expires_at), {
                addSuffix: true,
              })}
            </p>
          </div>

          <Separator />

          {/* Role Description */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {invitation.role === "admin"
                ? "As an admin, you'll be able to manage family members, accounts, and settings."
                : "As a member, you'll be able to view and manage shared family finances."}
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
