"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { MasseuseCard } from "./components/MasseuseCard"
import Link from "next/link"
import { ArrowLeft, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import { WalkInForm } from "./components/WalkInForm"

type Masseuse = Database['public']['Tables']['masseuses']['Row']

type AppointmentData = {
  id: string
  booking_code: string
  start_time: string
  end_time: string
  status: string
  customer_name: string
  masseuse_name: string | null
  service_name: string
  room_name: string
}

export default function StatusDashboard() {
  const [masseuses, setMasseuses] = useState<Masseuse[]>([])
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [showWalkInModal, setShowWalkInModal] = useState(false)

  const fetchMasseuses = async () => {
    const { data, error } = await supabase
      .from('masseuses')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (!error && data) {
      setMasseuses(data)
    }
  }

  const fetchAppointments = async () => {
    const dateStr = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, booking_code, start_time, end_time, status,
        customers!inner(name),
        masseuses(name),
        services!inner(name),
        rooms!inner(name)
      `)
      .eq('appointment_date', dateStr)
      .order('start_time')

    if (!error && data) {
      const flattened = data.map((item: any) => ({
        id: item.id,
        booking_code: item.booking_code,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status,
        customer_name: item.customers?.name,
        masseuse_name: item.masseuses?.name || null,
        service_name: item.services?.name,
        room_name: item.rooms?.name
      }))
      setAppointments(flattened)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchMasseuses()
      await fetchAppointments()
      setLoading(false)
    }
    
    fetchData()

    // Subscribe to realtime changes on masseuses table
    const masseuseChannel = supabase
      .channel('schema-db-changes-masseuses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'masseuses' },
        () => fetchMasseuses()
      )
      .subscribe()

    // Subscribe to realtime changes on appointments table
    const appointmentChannel = supabase
      .channel('schema-db-changes-appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => fetchAppointments()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(masseuseChannel)
      supabase.removeChannel(appointmentChannel)
    }
  }, [])

  // Action to change masseuse status
  const updateMasseuseStatus = async (id: string, newStatus: string, durationMin?: number) => {
    const updateData: any = { status: newStatus }
    if (newStatus === 'in_session') {
      updateData.session_started_at = new Date().toISOString()
      updateData.current_service_duration_min = durationMin || 60
    } else {
      updateData.session_started_at = null
      updateData.current_service_duration_min = null
    }

    const { error } = await supabase.from('masseuses').update(updateData).eq('id', id)
    if (error) {
      console.error('Error updating status:', error)
      alert('ไม่สามารถอัพเดทสถานะได้')
    }
  }

  // Action to change appointment status
  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
    if (error) {
      console.error('Error updating appointment status:', error)
      alert('ไม่สามารถอัพเดทสถานะคิวได้')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full mb-4"></div>
          <p className="text-primary font-prompt">กำลังโหลด Dashboard...</p>
        </div>
      </div>
    )
  }

  const statusCounts = {
    available: masseuses.filter(m => m.status === 'available').length,
    queued: masseuses.filter(m => m.status === 'queued').length,
    in_session: masseuses.filter(m => m.status === 'in_session').length,
    break: masseuses.filter(m => m.status === 'break').length,
    off_duty: masseuses.filter(m => m.status === 'off_duty').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">ยืนยันแล้ว</span>
      case 'in_progress': return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">ทำสปาอยู่</span>
      case 'completed': return <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">เสร็จสิ้น</span>
      case 'cancelled': return <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">ยกเลิก</span>
      case 'no_show': return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">ไม่มาตามนัด</span>
      default: return <span>{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-prompt">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-text heading-thai">Receptionist Dashboard</h1>
                <p className="text-sm text-text-light">Live Status Board รันแบบ Real-time</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm bg-gray-50 p-2 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-green"></span>
                <span className="text-gray-600">ว่าง ({statusCounts.available})</span>
              </div>
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-yellow"></span>
                <span className="text-gray-600">รอคิว ({statusCounts.queued})</span>
              </div>
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-red animate-pulse"></span>
                <span className="text-gray-600">กำลังนวด ({statusCounts.in_session})</span>
              </div>
            </div>

            <button 
              onClick={() => setShowWalkInModal(true)}
              className="btn-primary py-2 px-4 text-sm font-medium flex items-center gap-2 shrink-0 border border-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              รับลูกค้า Walk-in
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Masseuse Grid */}
        <div>
          <h2 className="text-xl font-bold text-text heading-thai mb-4">สถานะพนักงานนวด</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {masseuses.map((masseuse) => (
              <MasseuseCard 
                key={masseuse.id} 
                masseuse={masseuse} 
                onStatusChange={(status, duration) => updateMasseuseStatus(masseuse.id, status, duration)} 
              />
            ))}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text heading-thai leading-none">คิวลูกค้าวันนี้</h2>
          </div>
          
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium">เวลา</th>
                  <th className="p-4 font-medium">ลูกค้า/รหัสคิว</th>
                  <th className="p-4 font-medium">ห้อง/บริการ</th>
                  <th className="p-4 font-medium">พนักงาน</th>
                  <th className="p-4 font-medium text-center">สถานะ</th>
                  <th className="p-4 font-medium text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">ไม่มีคิวลูกค้าในวันนี้</td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-text">
                        {appt.start_time.slice(0,5)} - {appt.end_time.slice(0,5)}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-text">{appt.customer_name}</div>
                        <div className="text-[10px] text-gray-400 mt-1 font-mono">{appt.booking_code}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-text max-w-[150px] truncate" title={appt.service_name}>{appt.service_name}</div>
                        <div className="text-xs text-gray-500">{appt.room_name}</div>
                      </td>
                      <td className="p-4 text-text">
                        {appt.masseuse_name || <span className="text-gray-400 italic">รอจัดสรร</span>}
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(appt.status)}
                      </td>
                      <td className="p-4 text-center">
                         <select 
                            value={appt.status}
                            onChange={(e) => updateAppointmentStatus(appt.id, e.target.value)}
                            className="bg-white border text-xs border-gray-300 text-gray-700 py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="confirmed">ยืนยันแล้ว</option>
                            <option value="in_progress">ทำสปาอยู่</option>
                            <option value="completed">เสร็จสิ้น</option>
                            <option value="cancelled">ยกเลิก</option>
                            <option value="no_show">ไม่มาตามนัด</option>
                          </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {showWalkInModal && (
        <WalkInForm 
          onClose={() => setShowWalkInModal(false)} 
          onSuccess={() => {
            fetchAppointments()
          }} 
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
    </div>
  )
}
