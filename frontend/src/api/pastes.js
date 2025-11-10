import api from "./client";

export const listPastes = async (params = {}) => {
  const { data } = await api.get("/pastes/", { params });
  return data;
};

export const getPaste = async (id) => {
  const { data } = await api.get(`/pastes/${id}/`);
  return data;
};

export const createPaste = async (payload) => {
  const { data } = await api.post("/pastes/", payload);
  return data;
};

export const updatePaste = async (id, payload) => {
  const { data } = await api.patch(`/pastes/${id}/`, payload);
  return data;
};

export const deletePaste = async (id) => {
  await api.delete(`/pastes/${id}/`);
};

export const listLanguages = async () => {
  const { data } = await api.get("/languages/");
  return data;
};

export const listStars = async () => {
  const { data } = await api.get("/stars/");
  return data;
};

export const addStar = async (pasteId) => {
  const { data } = await api.post("/stars/", { paste: pasteId });
  return data;
};
