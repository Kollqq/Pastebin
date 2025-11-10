import api from "./client";

export async function register(payload) {
  const { data } = await api.post("/auth/register/", payload);
  return data;
}

export async function login({ username, password }) {
  const { data } = await api.post("/auth/token/", { username, password });
  return data;
}

export async function refresh(refreshToken) {
  const { data } = await api.post("/auth/token/refresh/", { refresh: refreshToken });
  return data;
}
