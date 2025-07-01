"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CSRFToken } from "@/components/security/csrf-token"
import { SecureEmailInput } from "@/components/security/secure-input"

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [securityWarning, setSecurityWarning] = useState<string | null>(null)
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  })

  const handleMaliciousInput = (patterns: string[]) => {
    setSecurityWarning('Invalid characters detected. Please check your input.')
    toast.error('Invalid characters detected in input')
    console.warn('Malicious patterns detected:', patterns)
  }

  async function onSubmit(values: ResetPasswordValues) {
    setIsLoading(true)
    setSecurityWarning(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password/confirm`
    })
    setIsLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Password reset email sent! Please check your inbox.")
    router.replace("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {securityWarning && (
          <Alert className="mb-4">
            <AlertDescription>{securityWarning}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CSRFToken />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <SecureEmailInput 
                      autoComplete="email" 
                      disabled={isLoading}
                      onMaliciousDetected={handleMaliciousInput}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </form>
        </Form>
        <div className="flex justify-between mt-4 text-sm">
          <a href="/auth/login" className="text-primary hover:underline">Login</a>
        </div>
      </div>
    </div>
  )
} 