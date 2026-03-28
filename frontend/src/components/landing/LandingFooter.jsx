import { Link } from "react-router-dom";

const PLATFORM_ROUTES = [
  { label: "Register", to: "/register" },
  { label: "Login", to: "/login" },
  { label: "Events", to: "#" },
  { label: "Teams", to: "#" },
  { label: "Players", to: "#" },
  { label: "Announcements", to: "#" },
];

export function LandingFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black">S</span>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">SLIIT SportSync</p>
                <p className="text-[10px] text-gray-500 tracking-widest uppercase">Sport Event Management System</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              The official sports management platform of Sri Lanka Institute of Information Technology — empowering campus
              athletics since 2024.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {PLATFORM_ROUTES.map(({ label, to }) => (
                <li key={label}>
                  {to.startsWith("/") ? (
                    <Link to={to} className="text-sm transition-colors hover:text-blue-400">
                      {label}
                    </Link>
                  ) : (
                    <a href={to} className="text-sm transition-colors hover:text-blue-400">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>SLIIT Malabe Campus, New Kandy Rd, Malabe 10115</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:sports@sliit.lk" className="hover:text-blue-400 transition-colors">
                  sports@sliit.lk
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+94 11 2 544 801</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2024 SLIIT SportSync. All rights reserved. Sri Lanka Institute of Information Technology.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Terms of Use
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
