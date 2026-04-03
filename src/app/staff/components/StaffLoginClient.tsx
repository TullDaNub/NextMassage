"use client"

import { useState } from "react"
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function StaffLoginClient() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', pin })
      })

      const data = await res.json()

      if (data.success) {
        router.refresh() // Refresh the page to load authenticated view
      } else {
        setError(data.error || "เกิดข้อผิดพลาดรบกวนลองอีกครั้ง")
      }
    } catch (err) {
      setError("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-text heading-thai">Staff Portal</h1>
        </div>

        <div className="glass rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-light font-prompt mb-2">
                รหัส PIN พนักงาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="ใส่รหัส PIN"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-prompt bg-white/50 text-text"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-prompt">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !pin}
              className="btn-primary w-full py-4 text-center font-prompt"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "ยืนยัน"}
            </button>
          </form>
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors font-prompt text-sm">
            <ArrowLeft className="w-4 h-4" />
            กลับสู่หน้าหลัก (ลูกค้า)
          </Link>
        </div>
      </div>
    </div>
  )
}
