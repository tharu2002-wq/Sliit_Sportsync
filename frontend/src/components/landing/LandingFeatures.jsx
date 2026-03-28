import { FEATURES } from "../../constants/landingContent";
import { Button } from "../ui/Button";
import { FadeIn } from "../ui/FadeIn";

export function LandingFeatures() {
  return (
    <section id="features" className="py-28" style={{ background: "#f8faff" }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Key Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Everything You Need to
            <br />
            <span className="text-blue-600">Play, Lead & Win</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            A complete toolkit for students, teams, and event coordinators — all in one place.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                  <span className="group-hover:grayscale-0">{f.icon}</span>
                </div>
                <h3 className="font-black text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}

          <FadeIn delay={FEATURES.length * 0.07}>
            <div
              className="rounded-2xl p-6 flex flex-col justify-between h-full min-h-[180px]"
              style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}
            >
              <p className="text-white font-black text-lg leading-snug">Ready to get started?</p>
              <Button variant="featureInverse" size="feature" to="/register">
                Register Now →
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
