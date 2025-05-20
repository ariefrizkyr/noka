import ConfirmResetPasswordForm from "./confirm-form"
import { Suspense } from "react"

export default function ConfirmResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmResetPasswordForm />
    </Suspense>
  )
} 