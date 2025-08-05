"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, Shield } from "lucide-react";

interface FamilySetupStepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function FamilySetupStep({
  onNext,
  onPrevious,
  isFirstStep,
  // isLastStep,
}: FamilySetupStepProps) {
  const [familyName, setFamilyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!familyName.trim()) return;

    try {
      setIsLoading(true);
      setError("");

      // Create the family
      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: familyName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create family");
      }

      const result = await response.json();
      const familyId = result.data?.id;

      if (!familyId) {
        throw new Error("Family creation succeeded but no ID returned");
      }

      // Store the family ID in sessionStorage for use in account/category setup
      sessionStorage.setItem("onboardingFamilyId", familyId);

      // Mark step 2 as completed (family setup is step 2 in family flow)
      const stepResponse = await fetch("/api/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 2,
          completed: true,
        }),
      });

      if (!stepResponse.ok) {
        const errorData = await stepResponse.json();
        throw new Error(errorData.message || "Failed to update step progress");
      }

      onNext();
    } catch (error) {
      console.error("Error creating family:", error);
      setError(error instanceof Error ? error.message : "Failed to create family");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFamilyName(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Users className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create Your Family</h2>
        <p className="mx-auto max-w-md text-gray-600">
          Give your family a name to start collaborating on your financial goals together.
        </p>
      </div>

      {/* Family Name Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="familyName" className="text-sm font-medium text-gray-700">
            Family Name
          </Label>
          <Input
            id="familyName"
            type="text"
            placeholder="Enter your family name (e.g., The Smith Family)"
            value={familyName}
            onChange={handleInputChange}
            className={`mt-2 ${error ? "border-red-500 focus:border-red-500" : ""}`}
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Preview Card */}
        {familyName.trim() && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    {familyName.trim()}
                  </p>
                  <p className="text-sm text-green-700">
                    You'll be the family administrator with full access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Family Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          What you can do as a family:
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Invite Members</h4>
                  <p className="text-sm text-gray-600">Add family members to collaborate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Home className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Joint Accounts</h4>
                  <p className="text-sm text-gray-600">Manage shared bank accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Shared Budgets</h4>
                  <p className="text-sm text-gray-600">Set family-wide spending goals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Member Contributions</h4>
                  <p className="text-sm text-gray-600">Track individual contributions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <Card className="border-dashed bg-gray-50">
        <CardContent className="p-4">
          <h4 className="mb-2 font-medium text-gray-900">
            Your Role as Family Administrator
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• You'll have full control over family settings and member management</li>
            <li>• You can create joint accounts and shared categories</li>
            <li>• You can invite family members and manage their roles</li>
            <li>• Your personal finances remain private and separate</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!familyName.trim() || isLoading}
        >
          {isLoading ? "Creating Family..." : "Create Family"}
        </Button>
      </div>
    </div>
  );
}