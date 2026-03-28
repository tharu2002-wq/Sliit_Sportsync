import { MODULES } from "../../constants/landingContent";
import { FadeIn } from "../ui/FadeIn";

export function LandingModules() {
  return (
    <section id="modules" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Module Highlights
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Powerful Modules,
            <br />
            <span className="text-blue-600">Seamlessly Integrated</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {MODULES.map((m, i) => (
            <FadeIn key={m.title} delay={i * 0.1}>
              <div className="group relative overflow-hidden rounded-3xl border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 bg-white">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-8">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-white/20 flex items-center justify-center text-3xl flex-shrink-0 transition-colors duration-300">
                      {m.icon}
                    </div>
                    <div>
                      <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 group-hover:text-blue-200 mb-2 transition-colors">
                        {m.tag}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-white mb-2 transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-gray-500 group-hover:text-white/80 text-sm leading-relaxed transition-colors">
                        {m.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
