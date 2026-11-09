import type { Content, Locale } from "@/lib/types";
import { pick, t } from "@/lib/i18n";
import { ScrollReveal } from "../ui/ScrollReveal";
import { 
  Users, Gift, Clock, GraduationCap, Book, Star, Heart, Award, 
  Shield, Zap, Monitor, Smartphone, Globe, Video, Mic, 
  UserCheck, Calendar, CheckCircle, MessageSquare, Headphones, 
  Target, Sparkles 
} from "lucide-react";

// 🌟 এখানে ২৩টি আইকন ম্যাপ করা হয়েছে
const icons: Record<string, any> = {
  "one-to-one": Users, 
  "trial": Gift, 
  "time": Clock, 
  "female": GraduationCap,
  "book": Book,
  "star": Star,
  "heart": Heart,
  "award": Award,
  "shield": Shield,
  "zap": Zap,
  "monitor": Monitor,
  "smartphone": Smartphone,
  "globe": Globe,
  "video": Video,
  "mic": Mic,
  "users": Users,
  "user-check": UserCheck,
  "calendar": Calendar,
  "check-circle": CheckCircle,
  "message": MessageSquare,
  "headphones": Headphones,
  "target": Target,
  "sparkles": Sparkles,
};

export function Features({ content, locale }: { content: Content; locale: Locale }) {
  return (
    <section 
      id="features" 
      className="relative py-24 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: content.backgrounds?.features 
          ? `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url('${content.backgrounds.features}')` 
          : 'none'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-5 relative z-10">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[#F2A007] mb-3">{t(locale, "আমাদের বৈশিষ্ট সমূহ", "Our Features")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink">{t(locale, "কেনো আমাদের বাছাই করবেন", "Why Choose Us")}</h2>
          </div>
        </ScrollReveal>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.features.map((f, i) => {
            // যদি ডাটাবেসে থাকা আইকন কী ম্যাপে না থাকে, তবে ডিফল্ট হিসেবে Users দেখাবে
            const Icon = icons[f.icon_key] ?? Users; 
            
            return (
              <ScrollReveal key={f.id} direction="up" delay={i * 0.1}>
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 h-full border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-[#FDF5E6] text-[#F2A007] flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-3">{pick(f, "title", locale)}</h3>
                  <p className="text-sm text-body leading-relaxed">{pick(f, "body", locale)}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}