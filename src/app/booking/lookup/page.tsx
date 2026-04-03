"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft, Search, Calendar, Clock, MapPin, User, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"

type AppointmentData = {
  booking_code: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  total_price: number
  customer_name: string
  customer_phone: string
  masseuse_name: string | null
  service_name: string
  room_name: string
}

function LookupContent() {
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('code') || ""

  const [searchQuery, setSearchQuery] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<AppointmentData | null>(null)

  useEffect(() => {
    if (initialCode) {
      fetchBooking(initialCode)
    }
  }, [initialCode])

  const fetchBooking = async (query: string) => {
    if (!query || !query.trim()) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const isPhone = /^[0-9-]{9,12}$/.test(query.trim())
      
      let dbQuery = supabase
        .from('appointments')
        .select(`
          booking_code, appointment_date, start_time, end_time, status, total_price,
          customers!inner(name, phone),
          masseuses(name),
          services!inner(name),
          rooms!inner(name)
        `)

      if (isPhone) {
        dbQuery = dbQuery.eq('customers.phone', query.trim())
      } else {
        dbQuery = dbQuery.ilike('booking_code', `%${query.trim()}%`)
      }

      const { data, error: sbError } = await dbQuery
        .order('appointment_date', { ascending: false })
        .limit(1)
        .single()

      if (sbError || !data) {
        setError("ไม่พบข้อมูลการจอง กรุณาตรวจสอบรหัสการจองหรือเบอร์โทรศัพท์อีกครั้ง")
      } else {
        const d = data as any; // Bypass strict TS checks for complex joined returns
        setResult({
          booking_code: d.booking_code,
          appointment_date: d.appointment_date,
          start_time: d.start_time,
          end_time: d.end_time,
          status: d.status,
          total_price: d.total_price,
          customer_name: d.customers?.name,
          customer_phone: d.customers?.phone,
          masseuse_name: d.masseuses?.name || null,
          service_name: d.services?.name,
          room_name: d.rooms?.name
        })
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooking(searchQuery)
  }

  const handleCancel = async () => {
    if (!result || result.status !== 'confirmed') return
  
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?')) return
  
    setLoading(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('booking_code', result.booking_code)
  
      if (error) throw error
  
      // Update local state
      setResult({ ...result, status: 'cancelled' })
      alert('ยกเลิกการจองสำเร็จ')
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการยกเลิกการจอง')
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'confirmed': return <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">✅ ยืนยันแล้ว</span>
      case 'in_progress': return <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium">💆‍♀️ กำลังให้บริการ</span>
      case 'completed': return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">🎉 เสร็จสิ้น</span>
      case 'cancelled': return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">❌ ยกเลิกแล้ว</span>
      case 'no_show': return <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">⚠️ ไม่มาตามนัด</span>
      default: return <span>{status}</span>
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text heading-thai">ค้นหาข้อมูลการจอง</h1>
          <p className="text-text-light font-prompt text-sm mt-1">ใช้รหัสการจอง (Booking Code) หรือเบอร์โทรศัพท์</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="เช่น BK-20261012-A8B9 หรือ 0812345678"
              className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-prompt bg-white/50 text-text"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !searchQuery.trim()}
            className="btn-primary sm:w-auto w-full py-4 text-center font-prompt"
          >
            {loading ? "กำลังค้นหา..." : "ค้นหาคิว"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-prompt">
            {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/5 animate-fade-in-up font-prompt relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          
          <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">รหัสการจอง</p>
              <div className="text-2xl font-bold text-primary font-mono tracking-wide">{result.booking_code}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-2">สถานะ</p>
              {getStatusDisplay(result.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-text-light mb-0.5">ชื่อลูกค้า</p>
                  <p className="font-semibold text-text">{result.customer_name}</p>
                  <p className="text-xs text-gray-400">{result.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-gray-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-text-light mb-0.5">บริการที่เลือก</p>
                  <p className="font-semibold text-text">{result.service_name}</p>
                  <p className="text-xs font-medium text-primary mt-1">ราคา ฿{result.total_price}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-gray-50 rounded-lg"><Calendar className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-text-light mb-0.5">วันเวลาที่จอง</p>
                  <p className="font-semibold text-text">
                    {format(new Date(result.appointment_date), 'dd MMMM yyyy', { locale: th })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {result.start_time.slice(0,5)} - {result.end_time.slice(0,5)} น.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-gray-50 rounded-lg"><MapPin className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-text-light mb-0.5">สถานที่</p>
                  <p className="font-medium text-text">{result.room_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    พนักงาน: {result.masseuse_name || 'สุ่มอัตโนมัติ/รอจัดสรร'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {result.status === 'confirmed' && (
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-center">
                <button 
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-prompt text-sm font-medium transition-colors border border-red-200"
                >
                  {loading ? 'กำลังดำเนินการ...' : 'ยกเลิกการจองนี้'}
                </button>
              </div>
              <p className="text-xs text-center text-gray-500">
                หากต้องการเลื่อนคิว กรุณาติดต่อเบอร์ร้านโดยตรงที่ 095-891-1135<br/>
                หรือยกเลิกคิวนี้แล้วจองเข้าระบบใหม่
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BookingLookupPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center font-prompt py-12 text-primary">กำลังโหลดดข้อมูล...</div>}>
        <LookupContent />
      </Suspense>
    </div>
  )
}
