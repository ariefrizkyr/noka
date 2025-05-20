import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  // SSR: Check session
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function handleLogout() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b">
        <div className="text-2xl font-bold text-primary">Staglink</div>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="#">
                <Button variant="outline">Go to App</Button>
              </Link>
              <form action={handleLogout}>
                <Button type="submit" variant="destructive">Logout</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 max-w-2xl">
          Streamlining end-to-end Procure to pay cycle
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl">
          Get away from mundane, risky, and non-strategic tasks to focus on growth and excellence of your financial operations.
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="text-lg px-8 py-6">Try Now</Button>
        </Link>
      </main>
    </div>
  )
} 