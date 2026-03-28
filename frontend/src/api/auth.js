import { api } from "./client";

/**
 * @param {{ name: string; email: string; password: string; role: string }} body
 */
export async function registerRequest(body) {
  const { data } = await api.post("/auth/register", body);
  return data;
}

/**
 * @param {{ email: string; password: string }} body
 */
export async function loginRequest(body) {
  const { data } = await api.post("/auth/login", body);
  return data;
}
