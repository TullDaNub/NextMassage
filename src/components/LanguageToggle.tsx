"use client"

import { useLanguageStore } from "@/store/language"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguageStore()

  return (
    <button 
      onClick={toggleLang}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm hover:shadow text-sm font-medium transition-all"
    >
      <Globe className="w-4 h-4 text-primary" />
      <span className="text-gray-700">{lang === 'th' ? 'EN' : 'TH'}</span>
    </button>
  )
}
