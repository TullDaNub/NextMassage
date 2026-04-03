"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { Plus, Edit2, CheckCircle2, XCircle } from "lucide-react"

type Masseuse = Database['public']['Tables']['masseuses']['Row']

export function MasseuseManager() {
  const [masseuses, setMasseuses] = useState<Masseuse[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [isActive, setIsActive] = useState(true)

  const fetchMasseuses = async () => {
    setLoading(true)
    const { data } = await supabase.from('masseuses').select('*').order('name')
    if (data) setMasseuses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMasseuses()
  }, [])

  const handleSave = async () => {
    if (!name) return alert("กรุณากรอกชื่อพนักงาน")
    
    setLoading(true)
    if (isEditing) {
      await supabase.from('masseuses').update({ name, nickname, is_active: isActive }).eq('id', isEditing)
    } else {
      await supabase.from('masseuses').insert([{ name, nickname, is_active: isActive }])
    }
    
    resetForm()
    await fetchMasseuses()
  }

  const handleEdit = (m: Masseuse) => {
    setIsEditing(m.id)
    setName(m.name)
    setNickname(m.nickname || '')
    setIsActive(m.is_active)
  }

  const resetForm = () => {
    setIsEditing(null)
    setName('')
    setNickname('')
    setIsActive(true)
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('masseuses').update({ is_active: !currentStatus }).eq('id', id)
    fetchMasseuses()
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
        จัดการพนักงานนวด
      </h2>

      {/* Form */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <h3 className="font-semibold mb-3 text-sm">{isEditing ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" placeholder="ชื่อจริง/ชื่อเรียก" value={name} onChange={e => setName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary"
          />
          <input 
            type="text" placeholder="ชื่อเล่น (ออปชัน)" value={nickname} onChange={e => setNickname(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            เปิดรับงาน
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1">
              <Plus className="w-4 h-4"/> {isEditing ? 'บันทึก' : 'เพิ่ม'}
            </button>
            {isEditing && (
              <button onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
                ยกเลิก
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3">ชื่อพนักงาน</th>
              <th className="p-3">ชื่อเล่น</th>
              <th className="p-3 text-center">สถานะรับงาน</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : masseuses.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-gray-500">{m.nickname || '-'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleStatus(m.id, m.is_active)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors" style={{ backgroundColor: m.is_active ? '#ecfdf5' : '#fef2f2', color: m.is_active ? '#059669' : '#dc2626' }}>
                    {m.is_active ? <><CheckCircle2 className="w-3.5 h-3.5"/> พร้อมรับงาน</> : <><XCircle className="w-3.5 h-3.5"/> พักงาน/ลา</>}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(m)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
