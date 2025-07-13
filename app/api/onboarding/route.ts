import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "../utils/auth";
import { handleApiError } from "../utils/error-handler";
import {
  createSuccessResponse,
  createUpdatedResponse,
} from "../utils/response";
import { z } from "zod";

// Validation schemas
const updateStepSchema = z.object({
  step: z.number().int().min(1).max(3),
  completed: z.boolean().optional().default(true),
});

const completeOnboardingSchema = z.object({
  completed: z.boolean().default(true),
});

/**
 * GET /api/onboarding
 * Get current onboarding progress
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select(
        `
        onboarding_completed,
        onboarding_step_1_completed,
        onboarding_step_2_completed,
        onboarding_step_3_completed,
        onboarding_current_step
      `,
      )
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no settings exist, return default onboarding state
      if (error.code === "PGRST116") {
        return createSuccessResponse(
          {
            onboarding_completed: false,
            onboarding_step_1_completed: false,
            onboarding_step_2_completed: false,
            onboarding_step_3_completed: false,
            onboarding_current_step: 1,
            next_step: 1,
          },
          "Default onboarding progress returned",
        );
      }
      throw error;
    }

    // Determine next step
    let nextStep = 1;
    if (
      settings.onboarding_step_1_completed &&
      !settings.onboarding_step_2_completed
    ) {
      nextStep = 2;
    } else if (
      settings.onboarding_step_2_completed &&
      !settings.onboarding_step_3_completed
    ) {
      nextStep = 3;
    } else if (settings.onboarding_step_3_completed) {
      nextStep = 3; // All completed
    }

    return createSuccessResponse(
      {
        ...settings,
        next_step: nextStep,
      },
      "Onboarding progress retrieved successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/onboarding
 * Update onboarding step completion or complete entire onboarding
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const supabase = await createClient();

    // Check if this is a step update or complete onboarding
    if ("step" in body) {
      // Step completion update
      const { step, completed } = updateStepSchema.parse(body);

      const stepField = `onboarding_step_${step}_completed`;
      const updateData: Record<string, any> = {
        [stepField]: completed,
        updated_at: new Date().toISOString(),
      };

      // Update current step if completing
      if (completed) {
        updateData.onboarding_current_step = Math.max(step + 1, 1);
      }

      // Check if settings exist, create if not
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existingSettings) {
        // Create new settings with step completion
        const { data, error } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            currency_code: "IDR",
            financial_month_start_day: 1,
            financial_week_start_day: 1,
            onboarding_completed: false,
            [stepField]: completed,
            onboarding_current_step: completed ? Math.min(step + 1, 3) : step,
          })
          .select()
          .single();

        if (error) throw error;
        return createUpdatedResponse(
          data,
          `Step ${step} ${completed ? "completed" : "uncompleted"} successfully`,
        );
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from("user_settings")
          .update(updateData)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return createUpdatedResponse(
          data,
          `Step ${step} ${completed ? "completed" : "uncompleted"} successfully`,
        );
      }
    } else {
      // Complete entire onboarding
      const { completed } = completeOnboardingSchema.parse(body);

      const updateData = {
        onboarding_completed: completed,
        onboarding_step_1_completed: completed,
        onboarding_step_2_completed: completed,
        onboarding_step_3_completed: completed,
        onboarding_current_step: completed ? 3 : 1,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_settings")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return createUpdatedResponse(
        data,
        `Onboarding ${completed ? "completed" : "reset"} successfully`,
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
