import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import ConfirmResetPasswordForm from "./confirm-form"

export default async function ConfirmResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect("/")
  }
  return <ConfirmResetPasswordForm />
} 