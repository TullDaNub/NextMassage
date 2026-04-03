"use client"
import Link from "next/link";
import { CalendarDays, Clock, Heart } from "lucide-react";
import { useTranslation } from "@/store/language"

export default function Home() {
  const { t } = useTranslation()

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[150px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] px-6 py-20 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-text-light">{t('hero_desc')}</span>
        </div>

        {/* Hero Content */}
        <h1 className="heading-thai text-5xl md:text-7xl font-bold mb-6 text-text max-w-4xl tracking-tight leading-[1.1]">
          {t('hero_title')} <br />
          <span className="text-primary italic">{t('hero_subtitle')}</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-light max-w-2xl mb-12 font-prompt font-light leading-relaxed">
          เราไม่ได้ต้องการกำไรมากมายแค่ อยากให้ทุกท่านสามารถมาใช้บริการเพื่อผ่อนคลายตามกำลัง
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-md mx-auto sm:max-w-none sm:w-auto">
          <Link href="/booking" className="btn-primary flex items-center justify-center gap-2 group text-lg heading-thai">
            <CalendarDays className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            {t('book_now')}
          </Link>
          <Link href="/booking/lookup" className="btn-outline flex items-center justify-center gap-2 text-lg heading-thai bg-white/50 backdrop-blur-sm">
            <Clock className="w-5 h-5" />
            ค้นหา/จัดการการจอง
          </Link>
        </div>

        {/* Discreet Staff Portal Link */}
        <div className="absolute bottom-4 right-6 text-xs text-text-light opacity-50 hover:opacity-100 transition-opacity">
          <Link href="/staff" className="hover:text-primary transition-colors">{t('staff_portal')}</Link>
        </div>
      </div>
    </main>
  );
}
