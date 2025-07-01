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
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { CSRFToken } from "@/components/security/csrf-token"
import { SecureEmailInput, SecurePasswordInput } from "@/components/security/secure-input"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [securityWarning, setSecurityWarning] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const handleMaliciousInput = (patterns: string[]) => {
    setSecurityWarning('Invalid characters detected. Please check your input.')
    toast.error('Invalid characters detected in input')
    console.warn('Malicious patterns detected:', patterns)
  }

  async function onSubmit(values: LoginValues) {
    setIsLoading(true)
    setSecurityWarning(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    setIsLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Logged in successfully!")
    router.replace("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-background">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <SecurePasswordInput 
                      autoComplete="current-password" 
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
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-4 text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>
        <GoogleSignInButton className="mb-2" />
        <div className="flex justify-between mt-4 text-sm">
          <a href="/auth/register" className="text-primary hover:underline">Sign Up</a>
          <a href="/auth/reset-password" className="text-primary hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  )
} 