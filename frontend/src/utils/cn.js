/** Merge class names; falsy values are skipped. */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
