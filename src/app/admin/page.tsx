"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { startOfToday, format, addDays, subDays } from "date-fns"
import { th } from "date-fns/locale"
import Link from "next/link"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, DollarSign, TrendingUp, Users } from "lucide-react"

import { MasseuseManager } from "./components/MasseuseManager"
import { ServiceManager } from "./components/ServiceManager"
import { RoomManager } from "./components/RoomManager"

// Types based on the join query
type AppointmentData = {
  id: string
  booking_code: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  total_price: number
  customer_name: string
  customer_phone: string
  masseuse_name: string | null
  masseuse_nickname: string | null
  service_name: string
  room_name: string
}

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'masseuses' | 'services' | 'rooms'>('overview')
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly'>('daily')

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      let query = supabase
        .from('appointments')
        .select(`
          id, booking_code, start_time, end_time, status, total_price, appointment_date,
          customers!inner(name, phone),
          masseuses(name, nickname),
          services!inner(name),
          rooms!inner(name)
        `)

      if (reportPeriod === 'daily') {
        query = query.eq('appointment_date', dateStr)
      } else {
        // Last 7 days including selectedDate
        const pastDate = format(subDays(selectedDate, 6), 'yyyy-MM-dd')
        query = query.gte('appointment_date', pastDate).lte('appointment_date', dateStr)
      }

      const { data, error } = await query.order('appointment_date').order('start_time')

      if (!error && data) {
        // Flatten the data for easier use in UI
        const flattened = data.map((item: any) => ({
          id: item.id,
          appointment_date: item.appointment_date,
          booking_code: item.booking_code,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status,
          total_price: item.total_price,
          customer_name: item.customers.name,
          customer_phone: item.customers.phone,
          masseuse_name: item.masseuses?.name || null,
          masseuse_nickname: item.masseuses?.nickname || null,
          service_name: item.services.name,
          room_name: item.rooms.name
        }))
        setAppointments(flattened)
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [selectedDate, reportPeriod])

  // Metric Calculations
  const totalRevenue = appointments
    .filter(a => a.status === 'completed' || a.status === 'confirmed' || a.status === 'in_progress')
    .reduce((sum, current) => sum + current.total_price, 0)
    
  const totalBookings = appointments.length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const cancelledCount = appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">ยืนยันแล้ว</span>
      case 'in_progress': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">กำลังบริการ</span>
      case 'completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">เสร็จสิ้น</span>
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">ยกเลิก</span>
      case 'no_show': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">ไม่มาตามนัด</span>
      default: return <span>{status}</span>
    }
  }

  // Group revenue by service type (simplified version for UI)
  const revenueByService = appointments
    .filter(a => ['confirmed', 'in_progress', 'completed'].includes(a.status))
    .reduce((acc, curr) => {
      acc[curr.service_name] = (acc[curr.service_name] || 0) + curr.total_price
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-prompt">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-4">
              <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-text heading-thai">Admin Dashboard</h1>
                <p className="text-sm text-text-light font-prompt">จัดการข้อมูลระบบและดูรายงาน</p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto custom-scrollbar">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              ภาพรวม (Overview)
            </button>
            <button 
              onClick={() => setActiveTab('masseuses')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'masseuses' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              พนักงานนวด
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'services' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              บริการนวด
            </button>
            <button 
              onClick={() => setActiveTab('rooms')}
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'rooms' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              ห้องนวด
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {activeTab === 'overview' && (
          <>
            {/* Date Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
              <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button
                  onClick={() => setReportPeriod('daily')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${reportPeriod === 'daily' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  รายวัน
                </button>
                <button
                  onClick={() => setReportPeriod('weekly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${reportPeriod === 'weekly' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  ย้อนหลัง 7 วัน
                </button>
              </div>
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> เลือกวันที่:
          </h2>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button 
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-2 hover:bg-white rounded-lg transition-colors border shadow-sm border-transparent hover:border-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold px-4 min-w-[150px] text-center">
              {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
            </span>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 hover:bg-white rounded-lg transition-colors border shadow-sm border-transparent hover:border-gray-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSelectedDate(startOfToday())}
              className="ml-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
            >
              วันนี้
            </button>
          </div>
        </div>

        {/* Essential Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-light mb-1">รายได้รวมประเมิน (บาท)</p>
              <h3 className="text-3xl font-bold text-text">
                {loading ? '...' : totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-light mb-1">จำนวนการจอง (คิว)</p>
              <h3 className="text-3xl font-bold text-text">
                {loading ? '...' : totalBookings}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-light mb-1">บริการเสร็จสิ้น</p>
              <h3 className="text-3xl font-bold text-green-600">
                {loading ? '...' : completedCount}
              </h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-light mb-1">ยกเลิก/ไม่มา</p>
              <h3 className="text-3xl font-bold text-red-500">
                {loading ? '...' : cancelledCount}
              </h3>
            </div>
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <TrendingUp className="w-6 h-6 rotate-180" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-text mb-4 border-b pb-3">สัดส่วนรายได้แยกตามบริการ</h3>
             {loading ? (
               <div className="animate-pulse flex flex-col gap-4">
                 {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg w-full"></div>)}
               </div>
             ) : Object.keys(revenueByService).length === 0 ? (
               <p className="text-gray-400 text-center py-8">ไม่มีข้อมูลรายได้</p>
             ) : (
               <div className="space-y-4">
                 {Object.entries(revenueByService).sort((a,b) => b[1] - a[1]).map(([service, amount]) => (
                   <div key={service} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <span className="text-sm font-medium truncate max-w-[150px]" title={service}>{service}</span>
                     <span className="text-primary font-bold">฿{amount.toLocaleString()}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-text leading-none">
                {reportPeriod === 'daily' 
                  ? `ตารางนัดหมาย วันที่ ${format(selectedDate, 'dd/MM/yyyy')}`
                  : `ตารางนัดหมาย 7 วันย้อนหลัง (ถึงวันที่ ${format(selectedDate, 'dd/MM/yyyy')})`}
              </h3>
            </div>
            
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                    <th className="p-4 font-medium">{reportPeriod === 'weekly' ? 'วันที่/เวลา' : 'เวลา'}</th>
                    <th className="p-4 font-medium">ลูกค้า</th>
                    <th className="p-4 font-medium">บริการ/ห้อง</th>
                    <th className="p-4 font-medium">พนักงาน</th>
                    <th className="p-4 font-medium">ยอด(฿)</th>
                    <th className="p-4 font-medium text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-primary">กำลังโหลดข้อมูล...</td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">ไม่มีการจองในช่วงเวลานี้</td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          {reportPeriod === 'weekly' && (
                            <div className="text-[10px] text-primary font-bold mb-1">{format(new Date(appt.appointment_date), 'dd/MM')}</div>
                          )}
                          <div className="font-semibold text-text">{appt.start_time.slice(0,5)}</div>
                          <div className="text-xs text-gray-500">ถึง {appt.end_time.slice(0,5)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-text">{appt.customer_name}</div>
                          <div className="text-xs text-gray-500">{appt.customer_phone}</div>
                          <div className="text-[10px] text-gray-400 mt-1 font-mono">{appt.booking_code}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-text max-w-[180px] truncate" title={appt.service_name}>{appt.service_name}</div>
                          <div className="text-xs text-gray-500">{appt.room_name}</div>
                        </td>
                        <td className="p-4">
                          {appt.masseuse_name ? (
                            <div className="text-text">{appt.masseuse_nickname || appt.masseuse_name}</div>
                          ) : (
                            <div className="text-gray-400 italic">รอจัดสรร</div>
                          )}
                        </td>
                        <td className="p-4 font-semibold">{appt.total_price}</td>
                        <td className="p-4 text-center">
                          {getStatusBadge(appt.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'masseuses' && (
          <div className="animate-fade-in-up">
            <MasseuseManager />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="animate-fade-in-up">
            <ServiceManager />
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="animate-fade-in-up">
            <RoomManager />
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
    </div>
  )
}
