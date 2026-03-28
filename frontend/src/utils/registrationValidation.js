/** Matches backend User schema `minlength: 6`. */
export const PASSWORD_MIN_LENGTH = 6;

/** SLIIT student email: 2–4 letter faculty code + exactly 8 digits + @my.sliit.lk (all lowercase when checked). */
export const MY_SLIIT_EMAIL_REGEX = /^[a-z]{2,4}\d{8}@my\.sliit\.lk$/;

/**
 * Name: required, 2–120 chars. Letters (any language), digits, spaces, and . ' - allowed.
 * @returns {string | null} Error message or null if valid.
 */
export function getNameValidationError(rawName) {
  const name = String(rawName ?? "").trim();
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 120) return "Name must be at most 120 characters";
  if (!/^[\p{L}\p{N}\s'.-]+$/u.test(name)) {
    return "Use only letters, numbers, spaces, and . ' -";
  }
  return null;
}

/**
 * Login form: any valid email (admins may use non-SLIIT addresses).
 * @returns {string | null} Error message or null if valid.
 */
export function getLoginEmailError(rawEmail) {
  const email = String(rawEmail ?? "").trim();
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * University email must match: {facultyLetters}{8digits}@my.sliit.lk
 * @returns {string | null} Error message or null if valid.
 */
export function getMySliitEmailError(rawEmail) {
  const email = String(rawEmail ?? "").trim().toLowerCase();
  if (!email) return "Email is required";
  if (!MY_SLIIT_EMAIL_REGEX.test(email)) {
    return "Email not valid. Please enter a valid SLIIT email.";
  }
  return null;
}

/**
 * Password: required, minimum {@link PASSWORD_MIN_LENGTH} characters (matches backend).
 * @returns {string | null} Error message or null if valid.
 */
export function getPasswordValidationError(rawPassword) {
  const password = String(rawPassword ?? "");
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}
