import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Noka</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your personal finance companion. Track expenses, manage budgets, and achieve your financial goals with ease.
            </p>
          </div>

          {/* Legal section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h4>
            <nav className="space-y-2">
              <Link 
                href="/legal/privacy-policy" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/terms-of-service" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Support section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h4>
            <nav className="space-y-2">
              <a 
                href="mailto:support@noka.com" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="mailto:hello@noka.com" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                General Inquiries
              </a>
            </nav>
          </div>

          {/* Company section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h4>
            <nav className="space-y-2">
              <Link 
                href="#about" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="#careers" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Careers
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600">
            © {currentYear} Noka. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <p className="text-sm text-gray-600">
              Made with ❤️ for better financial health
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 