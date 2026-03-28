import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/landing.css";
import {
  LandingAbout,
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingModules,
  LandingNavbar,
} from "../components/landing";

function getInitialBanner(state) {
  if (state?.registered) return "registered";
  if (state?.loggedIn) return "loggedIn";
  return null;
}

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(() => getInitialBanner(location.state));

  useEffect(() => {
    if (location.state?.registered || location.state?.loggedIn) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const showBanner = banner !== null;

  return (
    <div className="overflow-x-hidden bg-white font-sans text-gray-900">
      {banner === "registered" ? (
        <div
          className="fixed inset-x-0 top-0 z-[60] border-b border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-900 shadow-sm"
          role="status"
        >
          Registration successful.
          <button
            type="button"
            className="ml-3 text-green-700 underline"
            onClick={() => setBanner(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      {banner === "loggedIn" ? (
        <div
          className="fixed inset-x-0 top-0 z-[60] border-b border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-900 shadow-sm"
          role="status"
        >
          Signed in successfully.
          <button
            type="button"
            className="ml-3 text-green-700 underline"
            onClick={() => setBanner(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <LandingNavbar bannerOffset={showBanner} />
      <LandingHero />
      <LandingAbout />
      <LandingFeatures />
      <LandingModules />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
