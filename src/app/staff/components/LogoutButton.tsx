"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      })
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-prompt text-red-500 hover:bg-red-50 rounded-full transition-colors mt-8 border border-red-100 bg-white"
    >
      <LogOut className="w-4 h-4" />
      ออกจากระบบ (Logout)
    </button>
  )
}
