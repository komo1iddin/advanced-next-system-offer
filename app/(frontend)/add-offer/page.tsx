"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AddOfferRedirectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/add-offer")
      return
    }

    if (session?.user?.role === "admin") {
      router.push("/admin/add-offer")
    } else {
      // Non-admin authenticated users should be redirected to home
      router.push("/")
    }
  }, [router, session, status])

  return (
    <div className="container mx-auto py-20 text-center">
      <p>Redirecting to the appropriate page...</p>
    </div>
  )
}

