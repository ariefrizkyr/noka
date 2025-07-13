import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "../utils/auth";
import { handleApiError } from "../utils/error-handler";
import {
  createSuccessResponse,
  createUpdatedResponse,
} from "../utils/response";
import {
  validateRequestBody,
  updateUserSettingsSchema,
} from "../utils/validation";
import { Tables, TablesInsert } from "@/types/database";

type UserSettings = Tables<"user_settings">;
type UserSettingsInsert = TablesInsert<"user_settings">;
// type UserSettingsUpdate = TablesUpdate<'user_settings'>

/**
 * GET /api/settings
 * Fetch user settings
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no settings exist, return error instead of auto-creating
      if (error.code === "PGRST116") {
        return createSuccessResponse(null, "No user settings found");
      }
      throw error;
    }

    return createSuccessResponse(settings, "Settings retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const updateData = await validateRequestBody(
      request,
      updateUserSettingsSchema,
    );
    const supabase = await createClient();

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let updatedSettings: UserSettings;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      updatedSettings = data;
    } else {
      // Create new settings with provided data
      const settingsData: UserSettingsInsert = {
        user_id: user.id,
        currency_code: updateData.currency_code || "USD",
        financial_month_start_day: updateData.financial_month_start_day || 1,
        financial_week_start_day: updateData.financial_week_start_day || 1,
        onboarding_completed: updateData.onboarding_completed || false,
      };

      const { data, error } = await supabase
        .from("user_settings")
        .insert(settingsData)
        .select()
        .single();

      if (error) throw error;
      updatedSettings = data;
    }

    return createUpdatedResponse(
      updatedSettings,
      "Settings updated successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}
