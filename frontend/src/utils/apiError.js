import axios from "axios";

/**
 * Readable message from Axios errors (matches Express `{ message }` bodies).
 */
export function getApiErrorMessage(error, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (error.code === "ECONNABORTED") return "Request timed out. Try again.";
    if (!error.response) return "Network error. Check your connection.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
