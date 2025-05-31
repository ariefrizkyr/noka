import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import LoginForm from "./login-form"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Redirect authenticated users away from login page
  if (user) {
    redirect("/dashboard")
  }
  return <LoginForm />
} 