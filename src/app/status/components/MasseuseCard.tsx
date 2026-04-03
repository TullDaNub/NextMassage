"use client"

import { useEffect, useState } from "react"
import { Database } from "@/types/database.types"
import { differenceInSeconds } from "date-fns"
import { Play, Square, Coffee, Clock, BedDouble, UserX, CheckCircle2 } from "lucide-react"

type Masseuse = Database['public']['Tables']['masseuses']['Row']

interface MasseuseCardProps {
  masseuse: Masseuse
  onStatusChange: (status: string, duration?: number) => void
}

export function MasseuseCard({ masseuse, onStatusChange }: MasseuseCardProps) {
  const [remainingTime, setRemainingTime] = useState<{ m: number; s: number } | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (masseuse.status === 'in_session' && masseuse.session_started_at && masseuse.current_service_duration_min) {
      const start = new Date(masseuse.session_started_at)
      const durationSeconds = masseuse.current_service_duration_min * 60

      const updateTimer = () => {
        const now = new Date()
        const diffSeconds = durationSeconds - differenceInSeconds(now, start)

        if (diffSeconds <= 0) {
          setRemainingTime({ m: 0, s: 0 })
          setProgress(100)
          clearInterval(interval)
          // Auto complete could be triggered here if desired
        } else {
          setRemainingTime({
            m: Math.floor(diffSeconds / 60),
            s: diffSeconds % 60
          })
          const prog = ((durationSeconds - diffSeconds) / durationSeconds) * 100
          setProgress(Math.min(100, Math.max(0, prog)))
        }
      }

      updateTimer() // run immediately
      interval = setInterval(updateTimer, 1000)
    } else {
      setRemainingTime(null)
      setProgress(0)
    }

    return () => clearInterval(interval)
  }, [masseuse.status, masseuse.session_started_at, masseuse.current_service_duration_min])

  // Helpers for UI
  const getStatusColor = () => {
    switch(masseuse.status) {
      case 'available': return 'border-status-green bg-green-50/30'
      case 'queued': return 'border-status-yellow bg-yellow-50/30'
      case 'in_session': return 'border-status-red bg-red-50/30 shadow-status-red/10 shadow-lg'
      case 'break': return 'border-status-blue bg-blue-50/30'
      case 'off_duty': return 'border-gray-300 bg-gray-50/50 opacity-70'
      default: return 'border-gray-200 bg-white'
    }
  }

  const getStatusLabel = () => {
    switch(masseuse.status) {
      case 'available': return <span className="text-status-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> ว่างรับแขก</span>
      case 'queued': return <span className="text-status-yellow flex items-center gap-1"><Clock className="w-3 h-3"/> รอคิว</span>
      case 'in_session': return <span className="text-status-red flex items-center gap-1 animate-pulse"><BedDouble className="w-3 h-3"/> กำลังนวด</span>
      case 'break': return <span className="text-status-blue flex items-center gap-1"><Coffee className="w-3 h-3"/> พักเบรก</span>
      case 'off_duty': return <span className="text-gray-500 flex items-center gap-1"><UserX className="w-3 h-3"/> ปิดกะ</span>
      default: return '-'
    }
  }

  // Quick Action menus based on current status
  const getActions = () => {
    if (masseuse.status === 'off_duty') {
      return (
        <button onClick={() => onStatusChange('available')} className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-prompt hover:bg-gray-700 transition-colors">
          เข้ากะทำงาน
        </button>
      )
    }

    if (masseuse.status === 'in_session') {
      return (
        <button onClick={() => onStatusChange('available')} className="w-full py-2 flex items-center justify-center gap-1 bg-white border border-gray-200 text-status-green rounded-lg text-sm font-prompt hover:bg-green-50 transition-colors">
          <Square className="w-4 h-4" /> จบการทำงาน
        </button>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-2 mt-4 font-prompt">
        {masseuse.status !== 'available' && (
          <button onClick={() => onStatusChange('available')} className="py-2 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors">
            ว่างรับแขก
          </button>
        )}
        
        {masseuse.status !== 'queued' && (
          <button onClick={() => onStatusChange('queued')} className="py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200 transition-colors">
            จ่ายคิวให้
          </button>
        )}
        
        <div className="col-span-2 flex gap-2">
          {masseuse.status === 'queued' ? (
            <button onClick={() => {
              // Simple prompt for duration, in real app could be a proper modal
              const minStr = window.prompt("ระยะเวลาแพ็คเกจ (นาที)", "60")
              if (minStr && !isNaN(parseInt(minStr))) {
                onStatusChange('in_session', parseInt(minStr))
              }
            }} 
            className="flex-1 py-2 flex items-center justify-center gap-1 bg-status-red text-white rounded-lg text-xs hover:bg-red-600 transition-colors shadow-sm">
              <Play className="w-3 h-3" fill="currentColor" /> เริ่มนวด
            </button>
          ) : (
            <>
              {masseuse.status !== 'break' && (
                <button onClick={() => onStatusChange('break')} className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors">
                  พักเบรก
                </button>
              )}
              <button onClick={() => onStatusChange('off_duty')} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 transition-colors">
                ปิดกะ
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-2 p-5 flex flex-col transition-all bg-white relative overflow-hidden ${getStatusColor()}`}>
      
      {/* Background Progress Bar for In Session */}
      {masseuse.status === 'in_session' && (
        <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
          <div 
            className="h-full bg-status-red transition-all duration-1000 ease-linear" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-white shadow-sm border
            ${masseuse.status === 'in_session' ? 'border-status-red text-status-red' : 'border-gray-200 text-gray-700'}`}>
            {masseuse.nickname || masseuse.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-lg heading-thai text-text leading-tight">{masseuse.name}</h3>
            <div className="text-xs font-semibold uppercase tracking-wider mt-1 rounded-full w-fit">
              {getStatusLabel()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {masseuse.status === 'in_session' && remainingTime && (
          <div className="my-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-red-100/50 flex flex-col items-center justify-center relative">
            <span className="text-[10px] text-red-400 font-prompt uppercase tracking-widest mb-1">Time Remaining</span>
            <div className="text-4xl font-black text-status-red font-mono tracking-tighter tabular-nums drop-shadow-sm">
              {String(remainingTime.m).padStart(2, '0')}:{String(remainingTime.s).padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {getActions()}
      </div>
    </div>
  )
}
