"use client"

import { useBookingStore } from "@/store/booking"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export function BookingSuccess({ bookingCode }: { bookingCode: string }) {
  const { resetBooking, customerName, selectedDate, selectedTime, selectedService } = useBookingStore()

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 animate-fade-in-up text-center max-w-lg mx-auto">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
        <CheckCircle2 className="w-12 h-12 text-status-green" />
      </div>

      <h2 className="text-3xl font-bold text-text heading-thai mb-3">จองคิวสำเร็จ!</h2>
      <p className="text-text-light font-prompt text-lg mb-8">
        ขอบคุณคุณ <span className="font-semibold">{customerName}</span><br/>
        เราได้รับข้อมูลการจองของท่านเรียบร้อยแล้ว
      </p>

      {/* Ticket */}
      <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 relative mb-10 overflow-hidden">
        {/* Ticket cutouts */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-background rounded-full -translate-y-1/2 border-r-2 border-gray-300"></div>
        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-background rounded-full -translate-y-1/2 border-l-2 border-gray-300"></div>

        <p className="text-gray-500 font-prompt text-sm mb-1 uppercase tracking-widest">Booking Reference</p>
        <p className="text-4xl font-black text-primary tracking-wider mb-6 font-mono">{bookingCode}</p>
        
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm inline-block">
            <QRCodeSVG 
              value={`${window.location.origin}/booking/lookup?code=${bookingCode}`} 
              size={120} 
              level={"H"}
              includeMargin={true}
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-400 font-prompt leading-relaxed">
          กรุณาบันทึกภาพหน้าจอนี้ หรือจดรหัสการจองไว้<br/>
          เพื่อแจ้งพนักงานต้อนรับเมื่อมาถึงร้าน (กรุณามาก่อนเวลา 15 นาที)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-4">
        <Link 
          href="/" 
          onClick={() => {
            setTimeout(() => resetBooking(), 100)
          }}
          className="flex-1 btn-outline bg-white flex items-center justify-center"
        >
          กลับหน้าหลัก
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          พิมพ์ใบเสร็จ
        </button>
      </div>
    </div>
  )
}
