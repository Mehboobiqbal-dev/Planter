// ── file: /app/auth/reset-password/page.tsx ──
import React, { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading reset form…</p>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
