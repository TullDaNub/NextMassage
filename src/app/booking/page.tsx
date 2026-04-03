"use client"

import { useEffect, useState } from "react"
import { useBookingStore } from "@/store/booking"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

// Step Components
import { ServiceSelection } from "./components/ServiceSelection"
import { RoomSelection } from "./components/RoomSelection"
import { DateTimeSelection } from "./components/DateTimeSelection"
import { MasseuseSelection } from "./components/MasseuseSelection"
import { BookingConfirmation } from "./components/BookingConfirmation"
import { BookingSuccess } from "./components/BookingSuccess"

export default function BookingPage() {
  const { step, setStep } = useBookingStore()
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookingCode, setBookingCode] = useState("")

  const renderStep = () => {
    if (isSuccess) return <BookingSuccess bookingCode={bookingCode} />
    
    switch (step) {
      case 1:
        return <ServiceSelection />
      case 2:
        return <RoomSelection />
      case 3:
        return <DateTimeSelection />
      case 4:
        return <MasseuseSelection />
      case 5:
        return <BookingConfirmation onSuccess={(code) => {
          setBookingCode(code)
          setIsSuccess(true)
        }} />
      default:
        return <ServiceSelection />
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Options */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text heading-thai">จองคิวนวด</h1>
          <p className="mt-2 text-text-light font-prompt text-sm select-none">
            กรุณาเลือกบริการที่ท่านต้องการ
          </p>
        </div>

        {/* Stepper Progress */}
        {!isSuccess && (
          <div className="mb-12">
            <div className="flex justify-between items-center max-w-2xl mx-auto relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
              
              {[
                { num: 1, label: "บริการ" },
                { num: 2, label: "ห้อง" },
                { num: 3, label: "วัน-เวลา" },
                { num: 4, label: "พนักงาน" },
                { num: 5, label: "ยืนยัน" }
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <button 
                    onClick={() => s.num < step ? setStep(s.num) : null}
                    disabled={s.num > step}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                      ${step === s.num ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20' 
                        : s.num < step ? 'bg-primary text-white cursor-pointer' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'}`}
                  >
                    {s.num}
                  </button>
                  <span className={`text-xs font-prompt ${step >= s.num ? 'text-text font-medium' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Container */}
        <div className="glass rounded-3xl p-6 sm:p-10 min-h-[400px]">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
