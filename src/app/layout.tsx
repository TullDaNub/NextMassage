import type { Metadata } from "next";
import { Kanit, Sarabun } from "next/font/google";
import { Phone, MapPin, Facebook, MessageCircle } from "lucide-react";
import "./globals.css";
import { LanguageToggle } from "@/components/LanguageToggle";

const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "บ้านเรือนทองนวดเพื่อสุขภาพ | Booking",
  description: "จองคิวนวดและสปาออนไลน์ บ้านเรือนทองนวดเพื่อสุขภาพ บริการด้วยใจ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${kanit.variable} ${sarabun.variable} font-sans min-h-screen flex flex-col`}
      >
        <LanguageToggle />
        <div className="flex-1 flex flex-col">{children}</div>
        
        {/* Footer */}
        <footer className="bg-surface/80 border-t border-gray-200/10 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl heading-thai text-primary mb-4 font-medium">บ้านเรือนทองนวดเพื่อสุขภาพ</h3>
              <p className="text-text-light font-prompt text-sm leading-relaxed">
                สัมผัสประสบการณ์การพักผ่อนเหนือระดับ<br/>
                กับบริการนวดแผนไทยและสปาครบวงจร
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-lg heading-thai text-text mb-4 font-medium">ติดต่อเรา</h4>
              <div className="space-y-3 font-prompt text-sm text-text-light">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>095-891-1135</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>123 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-lg heading-thai text-text mb-4 font-medium">ติดตามเรา</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61588228934687" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-gray-200/10 hover:border-primary/50 hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@user7446839946186" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-gray-200/10 hover:border-primary/50 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-gray-200/10 hover:border-primary/50 hover:text-primary transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200/10 text-center text-xs text-text-light font-prompt opacity-60">
            &copy; {new Date().getFullYear()} บ้านเรือนทองนวดเพื่อสุขภาพ. All rights reserved. <span className="ml-1 text-primary">by Tull</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
