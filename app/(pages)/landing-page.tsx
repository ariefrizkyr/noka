import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Footer } from "@/components/ui/footer";

export default async function LandingPage() {
  // SSR: Check session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function handleLogout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b px-8 py-6">
        <div className="text-primary text-2xl font-bold">Noka</div>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline">Go to App</Button>
              </Link>
              <form action={handleLogout}>
                <Button type="submit" variant="destructive">
                  Logout
                </Button>
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
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 max-w-2xl text-4xl font-extrabold sm:text-5xl">
          More Control. Less Stress.
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xl text-lg sm:text-xl">
          Noka is a personal finance tracker that helps you track your income,
          expenses, and savings.
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="px-8 py-6 text-lg">
            Try Now
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
