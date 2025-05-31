"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const reason = params.get("reason");
  const message = params.get("message");

  let displayMessage = "Sorry, we couldn't sign you in. Please try again or return to the login page.";
  if (reason === "missing_code") {
    displayMessage = "Missing authentication code. Please try signing in again.";
  } else if (reason === "exchange_failed" && message) {
    displayMessage = decodeURIComponent(message);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{displayMessage}</AlertDescription>
        </Alert>
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">Go to Login</Button>
        </Link>
      </div>
    </div>
  );
} 