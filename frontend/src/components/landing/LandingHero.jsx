import { STATS } from "../../constants/landingContent";
import { Button } from "../ui/Button";
import sliitBg from "../../assets/sliitbg.jpg";

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Campus photo — fixed attachment, no repeat (parallax-style while hero is in view) */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${sliitBg})` }}
        aria-hidden="true"
      />
      {/* Blue overlay — layered for legibility (stronger on the right where sun flare is brighter) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-950/92 via-blue-900/78 to-blue-800/72"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-blue-950/55 via-transparent to-transparent"
        aria-hidden="true"
      />
      {/* Subtle texture */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
          style={{ animation: "fadeDown 0.8s ease both" }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
            SLIIT Official Sports Platform
          </span>
        </div>

        <h1
          className="mb-6 text-5xl font-black leading-[1.05] text-white md:text-7xl"
          style={{ animation: "fadeUp 0.9s ease 0.15s both", letterSpacing: "-0.02em" }}
        >
          One Platform.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #bfdbfe, #93c5fd, #7dd3fc)" }}
          >
            Every Sport.
          </span>
        </h1>

        <p
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100/90 md:text-xl"
          style={{ animation: "fadeUp 0.9s ease 0.3s both" }}
        >
          SLIIT SportSync brings together players, teams, and events under one intelligent system —
          powering the future of campus athletics.
        </p>

        <div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animation: "fadeUp 0.9s ease 0.45s both" }}
        >
          <Button variant="heroSolid" size="md" to="/register">
            Register as Student
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Button>
          <Button variant="heroGhost" size="md" to="/login">
            Login to Your Account
          </Button>
        </div>

        <div
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 md:grid-cols-4"
          style={{ animation: "fadeUp 0.9s ease 0.6s both" }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-white/10 px-6 py-5 text-center backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-100/80">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-60">
        <span className="text-xs font-medium uppercase tracking-widest text-white">Scroll</span>
        <div
          className="h-10 w-px bg-gradient-to-b from-white to-transparent"
          style={{ animation: "bounce 2s infinite" }}
        />
      </div>
    </section>
  );
}
