/**
 * Smooth-scroll to a section by element id.
 */
export function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
