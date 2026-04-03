"use client"

import { useState } from "react"
import { useBookingStore } from "@/store/booking"
import { supabase } from "@/lib/supabase/client"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Loader2 } from "lucide-react"

export function BookingConfirmation({ onSuccess }: { onSuccess: (code: string) => void }) {
  const { 
    selectedService, 
    selectedRoom, 
    selectedDate, 
    selectedTime, 
    selectedMasseuse,
    isAutoAssignMasseuse,
    customerName,
    customerPhone,
    setCustomerDetails,
    prevStep
  } = useBookingStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName || !customerPhone) {
      setError("กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน")
      return
    }

    if (!selectedService || !selectedRoom || !selectedDate || !selectedTime) {
      setError("ข้อมูลการจองไม่ครบถ้วน กรุณาย้อนกลับไปตรวจสอบ")
      return
    }

    setLoading(true)
    setError(null)

    // Generate Booking Code (e.g. BK-20261012-A8B9)
    const dateStrShort = format(new Date(), 'yyyyMMdd')
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const bookingCode = `BK-${dateStrShort}-${randomStr}`

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    // Calculate end time
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const startTime = new Date()
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000)
    const endTimeStr = format(endTime, 'HH:mm:00')
    const startTimeStr = `${selectedTime}:00`

    // 1. Create Customer or Find Existing
    let finalCustomerId = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerPhone)
      .single()

    if (existingCustomer) {
      finalCustomerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: cError } = await supabase
        .from('customers')
        .insert({ name: customerName, phone: customerPhone })
        .select()
        .single()
        
      if (cError) {
        setLoading(false)
        setError("ไม่สามารถบันทึกข้อมูลลูกค้าได้ กรุณาลองใหม่")
        return
      }
      finalCustomerId = newCustomer.id
    }

    // 2. Determine actual masseuse ID if auto-assigned (already handled in previous step conceptually, 
    // but we use the selectedMasseuse ID which was picked)
    const actualMasseuseId = selectedMasseuse?.id

    // 3. Create Appointment
    const { error: bookingError } = await supabase
      .from('appointments')
      .insert({
        booking_code: bookingCode,
        customer_id: finalCustomerId,
        masseuse_id: actualMasseuseId,
        service_id: selectedService.id,
        room_id: selectedRoom.id,
        appointment_date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        total_price: selectedService.price,
        status: 'confirmed'
      })

    if (bookingError) {
      setLoading(false)
      // Check if it's the GiST constraint violation (exclusion constraint)
      if (bookingError.code === '23P01') {
         setError("ขออภัย! ช่วงเวลาหรือพนักงานนี้เพิ่งถูกจองไปเมื่อสักครู่ กรุณาเลือกเวลาอื่นการทำรายการใหม่")
      } else {
         setError(`เกิดข้อผิดพลาดในการจอง: ${bookingError.message || 'ไม่ทราบสาเหตุ'}`)
      }
      return
    }

    // 4. Send LINE Notification (fire and forget, don't wait or block on failure)
    try {
      const timeRange = `${startTimeStr.slice(0,5)} - ${endTimeStr.slice(0,5)}`
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_code: bookingCode,
          customer_name: customerName,
          customer_phone: customerPhone,
          service_name: selectedService.name,
          appointment_date: dateStr,
          time_range: timeRange
        })
      })
    } catch (e) {
      console.error('Failed to notify LINE:', e)
    }

    // Success
    setLoading(false)
    onSuccess(bookingCode)
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text heading-thai mb-2">5. ยืนยันการจอง</h2>
        <p className="text-text-light font-prompt text-sm">ตรวจสอบรายละเอียดและกรอกข้อมูลการติดต่อของคุณ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Summary Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-text heading-thai mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            สรุปรายการจอง
          </h3>
          
          <div className="space-y-5 font-prompt">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">บริการนวด</p>
                <p className="font-semibold text-text">{selectedService?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm mb-1">ระยะเวลา</p>
                <p className="font-semibold text-text">{selectedService?.duration_minutes} นาที</p>
              </div>
            </div>

            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">วันรับบริการ</p>
                <p className="font-semibold text-text capitalize">
                  {selectedDate ? format(selectedDate, 'dd MMM yyyy', { locale: th }) : '-'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm mb-1">เวลา</p>
                <p className="font-bold text-primary text-lg">{selectedTime} น.</p>
              </div>
            </div>

            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">ห้องนวด</p>
                <p className="font-medium text-text">{selectedRoom?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedRoom?.type === 'air_con' ? 'ห้องแอร์' : 'ห้องพัดลม'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm mb-1">พนักงานนวด</p>
                <p className="font-medium text-text">{isAutoAssignMasseuse ? 'สุ่มอัตโนมัติ' : selectedMasseuse?.name}</p>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4">
              <p className="text-gray-500 font-medium">ราคาสุทธิ</p>
              <p className="font-bold text-3xl text-text">฿{selectedService?.price}</p>
            </div>
          </div>
        </div>

        {/* Customer Form */}
        <div>
          <form id="booking-form" onSubmit={handleConfirm} className="space-y-5 flex flex-col h-full">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5 font-prompt">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                placeholder="สมมุติ รักษาดี"
                value={customerName}
                onChange={(e) => setCustomerDetails(e.target.value, customerPhone)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-prompt"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text mb-1.5 font-prompt">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                pattern="0[0-9]{9}"
                placeholder="0812345678"
                value={customerPhone}
                onChange={(e) => setCustomerDetails(customerName, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-prompt"
              />
              <p className="text-xs text-gray-400 mt-1.5 font-prompt">ไม่ต้องใส่ขีด (-) รองรับเบอร์มือถือไทย 10 หลัก</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-prompt border border-red-100 flex items-start gap-3 mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="mt-auto pt-8">
              <button 
                type="submit" 
                form="booking-form"
                disabled={loading || !customerName || !customerPhone}
                className="w-full btn-primary font-prompt text-lg py-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    ยืนยันการจองคิว
                  </>
                )}
              </button>
              
              <div className="mt-4 flex justify-center">
                <button 
                  type="button" 
                  onClick={prevStep} 
                  disabled={loading}
                  className="text-text-light font-prompt text-sm hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  ย้อนกลับไปแก้ไขข้อมูล
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
