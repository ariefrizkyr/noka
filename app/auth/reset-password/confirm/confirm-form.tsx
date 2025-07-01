"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CSRFToken } from "@/components/security/csrf-token"
import { SecurePasswordInput } from "@/components/security/secure-input"

const confirmSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type ConfirmValues = z.infer<typeof confirmSchema>

export default function ConfirmResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [securityWarning, setSecurityWarning] = useState<string | null>(null)
  const form = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { password: "" },
  })

  const handleMaliciousInput = (patterns: string[]) => {
    setSecurityWarning('Invalid characters detected. Please check your input.')
    toast.error('Invalid characters detected in input')
    console.warn('Malicious patterns detected:', patterns)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        toast.error("Session expired or invalid. Please request a new password reset.")
        router.replace("/auth/login")
      } else {
        setIsSessionReady(true)
      }
    })
  }, [router])

  async function onSubmit(values: ConfirmValues) {
    setIsLoading(true)
    setSecurityWarning(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })
    setIsLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Password updated successfully!")
    router.replace("/auth/login")
  }

  if (!isSessionReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
          <h1 className="text-2xl font-bold mb-6 text-center">Verifying session...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
        <h1 className="text-2xl font-bold mb-6 text-center">Set New Password</h1>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <SecurePasswordInput 
                      autoComplete="new-password" 
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
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
} 