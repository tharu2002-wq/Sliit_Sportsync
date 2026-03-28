import { Button } from "../ui/Button";
import { FadeIn } from "../ui/FadeIn";

const CTA_BULLETS = [
  { icon: "✅", text: "Free for all SLIIT students" },
  { icon: "🔒", text: "University-verified accounts" },
  { icon: "📱", text: "Mobile-optimised platform" },
];

export function LandingCta() {
  return (
    <section
      id="news"
      className="py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
            🚀 Join SLIIT SportSync Today
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your Athletic Journey
            <br />
            Starts Here.
          </h2>
          <p className="text-blue-100/70 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Join thousands of SLIIT students already competing, connecting, and celebrating sports through SportSync.
            Register today and take your first step onto the digital arena.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
            <Button variant="ctaSolid" size="lg" to="/register">
              <span>🎓</span>
              Register as Student
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Button>
            <Button variant="ctaGhost" size="lg" to="/login">
              <span>🔐</span>
              Login to Account
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {CTA_BULLETS.map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-white/60 text-xs font-semibold">{item.text}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
