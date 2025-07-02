import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Noka (&ldquo;Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Noka is a personal finance tracking application that helps users manage their financial accounts, track transactions, categorize expenses, and gain insights into their spending habits. The service is provided through our web and mobile applications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Account Creation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Account Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Financial Data</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Data Accuracy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for ensuring the accuracy of financial data you provide to the service. While we strive to provide accurate analysis and insights, you should not rely solely on our service for financial decisions.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Data Usage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By using our service, you grant us permission to access, process, and analyze your financial data solely for the purpose of providing our services to you.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may not use our service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any fraudulent or illegal activities</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Share your account access with unauthorized third parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain high availability of our service but cannot guarantee uninterrupted access. We may temporarily suspend or permanently discontinue the service with reasonable notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, Noka shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, your right to use the service will cease immediately, and we may delete your account and data in accordance with our data retention policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@noka.com" className="text-primary hover:underline">
                legal@noka.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
} 