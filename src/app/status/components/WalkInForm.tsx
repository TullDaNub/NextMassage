"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { format } from "date-fns"
import { X } from "lucide-react"

type Service = Database['public']['Tables']['services']['Row']
type Room = Database['public']['Tables']['rooms']['Row']
type Masseuse = Database['public']['Tables']['masseuses']['Row']

export function WalkInForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [masseuses, setMasseuses] = useState<Masseuse[]>([])

  const [customerName, setCustomerName] = useState('Walk-in')
  const [customerPhone, setCustomerPhone] = useState('0000000000')
  const [selectedService, setSelectedService] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedMasseuse, setSelectedMasseuse] = useState('')

  useEffect(() => {
    async function fetchData() {
      const [sRes, rRes, mRes] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true),
        supabase.from('rooms').select('*').eq('status', 'active'),
        supabase.from('masseuses').select('*').eq('is_active', true)
      ])
      if (sRes.data) setServices(sRes.data)
      if (rRes.data) setRooms(rRes.data)
      if (mRes.data) setMasseuses(mRes.data)
      
      // Auto-select first options
      if (sRes.data?.[0]) setSelectedService(sRes.data[0].id)
      if (rRes.data?.[0]) setSelectedRoom(rRes.data[0].id)
      if (mRes.data?.[0]) setSelectedMasseuse(mRes.data[0].id)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const service = services.find(s => s.id === selectedService)
      if (!service || !selectedRoom || !selectedMasseuse) throw new Error('กรุณาเลือกข้อมูลให้ครบ')

      // Get or Create Customer
      let customerId = null
      const { data: existingCustomer } = await supabase.from('customers').select('id').eq('phone', customerPhone).single()
      
      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        const { data: newCustomer, error: cErr } = await supabase.from('customers').insert({ name: customerName, phone: customerPhone }).select().single()
        if (cErr) throw cErr
        customerId = newCustomer.id
      }

      // Time
      const now = new Date()
      const startStr = format(now, 'HH:mm:00')
      const end = new Date(now.getTime() + service.duration_minutes * 60000)
      const endStr = format(end, 'HH:mm:00')
      const dateStr = format(now, 'yyyy-MM-dd')
      const bookingCode = `WI-${format(now, 'yyMMdd')}-${Math.random().toString(36).substring(2,5).toUpperCase()}`

      // Create Appointment (set to in_progress directly since they are walk-in)
      const { error: apptErr } = await supabase.from('appointments').insert({
        booking_code: bookingCode,
        customer_id: customerId,
        service_id: selectedService,
        room_id: selectedRoom,
        masseuse_id: selectedMasseuse,
        appointment_date: dateStr,
        start_time: startStr,
        end_time: endStr,
        total_price: service.price,
        status: 'in_progress'
      })

      if (apptErr) throw apptErr

      // Update Masseuse status
      await supabase.from('masseuses').update({ 
        status: 'in_session',
        session_started_at: new Date().toISOString(),
        current_service_duration_min: service.duration_minutes
      }).eq('id', selectedMasseuse)

      onSuccess()
      onClose()
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการสร้างคิว Walk-in")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold heading-thai text-text">รับลูกค้า Walk-in</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">ชื่อลูกค้า (ตัวแทน)</label>
              <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">เบอร์ไร้ตัวตน</label>
              <input required type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">บริการ</label>
            <select required value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary text-sm">
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} นาที) - ฿{s.price}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ห้องที่ว่าง</label>
            <select required value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary text-sm">
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type === 'air_con' ? 'แอร์' : 'พัดลม'})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">พนักงานที่ว่าง</label>
            <select required value={selectedMasseuse} onChange={e => setSelectedMasseuse(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-primary text-sm">
              {masseuses.filter(m => m.status === 'available').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {masseuses.filter(m => m.status === 'available').length === 0 && (
               <p className="text-red-500 text-xs mt-1">แจ้งเตือน: ไม่มีพนักงานสถานะ "ว่าง" ในขณะนี้</p>
            )}
          </div>

          <div className="pt-4 border-t mt-6">
            <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors">
              {loading ? 'กำลังบันทึก...' : 'เปิดคิวและเริ่มบริการทันที'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
