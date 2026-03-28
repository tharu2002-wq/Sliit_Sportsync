import { useEffect, useState } from "react";
import { NAV_LINKS } from "../../constants/landingContent";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { scrollToSection } from "../../utils/scroll";

export function LandingNavbar({ bannerOffset = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <header
      style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 24px rgba(0,80,200,0.08)" : "none",
        transition: "all 0.4s ease",
      }}
      className={cn("fixed left-0 right-0 z-50", bannerOffset ? "top-14" : "top-0")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <span className="text-sm font-black text-white">S</span>
          </div>
          <div>
            <span className="text-lg font-black leading-none tracking-tight text-blue-700">SLIIT</span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">SportSync</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Button
              key={l}
              variant="navLink"
              size="nav"
              onClick={() => scrollTo(l.toLowerCase())}
              className={cn(!scrolled && "!text-white hover:!text-blue-100")}
            >
              {l}
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" size="sm" to="/login">
            Login
          </Button>
          <Button variant="primary" size="sm" to="/register">
            Register as Student
          </Button>
        </div>

        <Button
          variant="iconGhost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <div className="mb-1 h-0.5 w-5 bg-gray-700" />
          <div className="mb-1 h-0.5 w-5 bg-gray-700" />
          <div className="h-0.5 w-5 bg-gray-700" />
        </Button>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="flex flex-col gap-4 border-t border-gray-100 bg-white px-6 py-4 md:hidden"
        >
          {NAV_LINKS.map((l) => (
            <Button key={l} variant="navText" size="navMobile" onClick={() => scrollTo(l.toLowerCase())}>
              {l}
            </Button>
          ))}
          <Button variant="outline" size="sm" fullWidth to="/login">
            Login
          </Button>
          <Button variant="primary" size="sm" fullWidth to="/register">
            Register as Student
          </Button>
        </div>
      )}
    </header>
  );
}
