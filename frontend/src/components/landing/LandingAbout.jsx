import { FadeIn } from "../ui/FadeIn";

const ABOUT_TAGS = ["Multi-campus Support", "Real-time Updates", "Secure & Verified", "Mobile Friendly"];
const SPORT_ICONS = ["🏏", "⚽", "🏸", "🏊", "🎾", "🏋️"];

export function LandingAbout() {
  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              About the System
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              The Central Hub for
              <br />
              <span className="text-blue-600">SLIIT Athletics</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              SLIIT SportSync is the official sport event management system designed exclusively for the Sri Lanka
              Institute of Information Technology community. It digitises every aspect of campus sports — from player
              registration and team formation to live event management and results archiving.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Whether you&apos;re a competitive athlete, a casual player, a team captain, or a sports coordinator,
              SportSync gives you the tools to participate, organise, and celebrate sport at SLIIT.
            </p>
            <div className="flex flex-wrap gap-3">
              {ABOUT_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-100"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl rotate-3 opacity-10" />
              <div
                className="relative rounded-3xl overflow-hidden border border-blue-100 shadow-2xl shadow-blue-100"
                style={{
                  background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0ea5e9 100%)",
                  minHeight: 380,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-5xl mb-6">
                    🏅
                  </div>
                  <h3 className="text-white text-2xl font-black mb-3">Built for SLIIT</h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed">
                    Tailored to the unique needs of Sri Lanka&apos;s leading IT university — supporting students across
                    all faculties and campuses in their sporting journey.
                  </p>
                  <div className="mt-8 flex gap-4">
                    {SPORT_ICONS.map((e) => (
                      <div
                        key={e}
                        className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl"
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
