import defaultEventImage from "../assets/event.jpg";
import cricketImage from "../assets/cricket.jpg";
import footballImage from "../assets/football.jpeg";
import rugbyImage from "../assets/rugby.jpeg";
import volleyballImage from "../assets/volleyball.jfif";

/**
 * Card / hero image for an event from `sportType` (case-insensitive substring match).
 */
export function getEventCardImageForSport(sportType) {
  const s = String(sportType ?? "").toLowerCase();
  if (s.includes("cricket")) return cricketImage;
  if (s.includes("volleyball")) return volleyballImage;
  if (s.includes("football")) return footballImage;
  if (s.includes("rugby")) return rugbyImage;
  return defaultEventImage;
}
