import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageState {
  lang: 'th' | 'en'
  toggleLang: () => void
  setLang: (lang: 'th' | 'en') => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'th',
      toggleLang: () => set((state) => ({ lang: state.lang === 'th' ? 'en' : 'th' })),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'qq-spa-lang',
    }
  )
)

// Simple dictionary
export const dict = {
  th: {
    hero_title: "สัมผัสความผ่อนคลาย",
    hero_subtitle: "เหนือระดับ",
    hero_desc: "บ้านเรือนทองนวดเพื่อสุขภาพ ยินดีต้อนรับ",
    book_now: "จองคิวรับบริการ",
    services: "บริการของเรา",
    service_health: "นวดเพื่อสุขภาพ",
    service_advance: "นวดแก้อาการ",
    service_stream: "อบสมุนไพร",
    staff_portal: "สำหรับพนักงาน",
    footer_address: "ที่อยู่ติดต่อ",
    footer_open: "เปิดบริการทุกวัน",
    header_step: "ขั้นตอนการจอง",
    // 5 Steps
    step1: "1. เลือกบริการนวด",
    step2: "2. จำนวนคนและห้อง",
    step3: "3. เลือกวันและเวลา",
    step4: "4. เลือกพนักงานนวด",
    step5: "5. ยืนยันการจอง"
  },
  en: {
    hero_title: "Experience Ultimate",
    hero_subtitle: "Relaxation",
    hero_desc: "Welcome to Baan Ruan Thong Health Massage",
    book_now: "Book an Appointment",
    services: "Our Services",
    service_health: "Health Massage",
    service_advance: "Advance Therapy",
    service_stream: "Herbal Steam",
    staff_portal: "Staff Portal",
    footer_address: "Address",
    footer_open: "Open Daily",
    header_step: "Booking Steps",
    // 5 Steps
    step1: "1. Select Service",
    step2: "2. Pax & Room",
    step3: "3. Date & Time",
    step4: "4. Select Masseuse",
    step5: "5. Confirm Booking"
  }
}

export function useTranslation() {
  const { lang } = useLanguageStore()
  const t = (key: keyof typeof dict['th']) => dict[lang][key] || key
  return { t, lang }
}
