import { PLAYER_DEPARTMENTS } from "../constants/playerDepartments";
import { FACULTY_OPTIONS } from "../constants/studentProfileOptions";
import { isDigitsOnlyText } from "./eventValidation";
import { parseSportTypesInput } from "./playerFormUtils";
import { getMySliitEmailError } from "./registrationValidation";

/** Two-letter faculty code + exactly 8 digits (e.g. IT23145316). */
export const STUDENT_ID_PATTERN = /^[A-Za-z]{2}\d{8}$/;

/**
 * @returns {string | null}
 */
export function getStudentIdError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Student ID is required";
  if (!STUDENT_ID_PATTERN.test(s)) {
    return "Invalid Student ID.";
  }
  return null;
}

/**
 * SLIIT @my.sliit.lk pattern (e.g. it23145320@my.sliit.lk).
 * @returns {string | null}
 */
export function getPlayerEmailError(raw) {
  return getMySliitEmailError(raw);
}

/**
 * @returns {string | null}
 */
export function getPlayerDepartmentError(raw) {
  const d = String(raw ?? "").trim();
  if (!d) return "Department is required";
  if (!PLAYER_DEPARTMENTS.includes(d)) return "Select a valid department from the list.";
  return null;
}

const FACULTY_VALUES = FACULTY_OPTIONS.map((o) => o.value);

/**
 * Player / admin forms: faculty must match student profile options (stored in API as `department`).
 * @returns {string | null}
 */
export function getPlayerFacultyError(raw) {
  const f = String(raw ?? "").trim();
  if (!f) return "Faculty is required";
  if (!FACULTY_VALUES.includes(f)) return "Select a valid faculty from the list.";
  return null;
}

/**
 * Age must be greater than 16 (minimum 17).
 * @returns {string | null}
 */
export function getPlayerAgeError(raw) {
  const ageStr = String(raw ?? "").trim();
  if (!ageStr) return "Age is required";
  const ageNum = Number(ageStr);
  if (!Number.isInteger(ageNum) || Number.isNaN(ageNum)) return "Enter a whole number";
  if (ageNum <= 16) return "Age must be greater than 16";
  if (ageNum > 120) return "Age must be at most 120";
  return null;
}

/**
 * Optional field: each comma-separated sport must not be digits only.
 * @returns {string | null}
 */
export function getSportTypesInputError(raw) {
  const parts = parseSportTypesInput(raw);
  if (parts.length === 0) return null;
  for (const p of parts) {
    if (isDigitsOnlyText(p)) return "Each sport cannot be numbers only";
  }
  return null;
}
