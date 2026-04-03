import Link from "next/link"
import { ShieldCheck, CalendarClock, ArrowLeft } from "lucide-react"
import { cookies } from "next/headers"
import { StaffLoginClient } from "./components/StaffLoginClient"
import { LogoutButton } from "./components/LogoutButton"

export default async function StaffPortal() {
  const cookieStore = await cookies()
  const role = cookieStore.get('staff_role')?.value

  if (!role) {
    return <StaffLoginClient />
  }

  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-text heading-thai">Staff Portal</h1>
          <p className="text-text-light font-prompt text-sm mt-2">สำหรับพนักงานและผู้ดูแลระบบเท่านั้น</p>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receptionist Link */}
          <Link 
            href="/status"
            className="group flex flex-col items-center p-8 bg-white border border-gray-200 rounded-3xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-center"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-text heading-thai mb-2">Receptionist Dashboard</h2>
            <p className="text-sm text-text-light font-prompt mb-6 px-4">
              จัดการคิวลูกค้า ดูสถานะพนักงานนวดแบบ Real-time และจ่ายงาน
            </p>
            <div className="mt-auto px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              เข้าสู่ระบบ Receptionist &rarr;
            </div>
          </Link>

          {/* Admin Link (Only visible to admin) */}
          {isAdmin ? (
            <Link 
              href="/admin"
              className="group flex flex-col items-center p-8 bg-white border border-gray-200 rounded-3xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-center"
            >
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h2 className="text-xl font-bold text-text heading-thai mb-2">Admin Dashboard</h2>
              <p className="text-sm text-text-light font-prompt mb-6 px-4">
                ดูรายงานยอดขาย สรุปคิวรายวัน และตรวจสอบรายได้
              </p>
              <div className="mt-auto px-6 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                เข้าสู่ระบบ Admin &rarr;
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-3xl text-center opacity-70">
              <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-500 heading-thai mb-2">Admin Dashboard</h2>
              <p className="text-sm text-gray-400 font-prompt px-4">
                คุณไม่มีสิทธิ์เข้าถึงส่วนนี้
              </p>
            </div>
          )}
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
