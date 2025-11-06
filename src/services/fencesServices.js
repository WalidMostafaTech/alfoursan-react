import api from "./api";

export const getFences = async () => {
  const { data } = await api.get(`/fences`);
  return data?.data;
};

export const showFences = async (id) => {
  const { data } = await api.get(`/fences/${id}`);
  return data?.data;
};

export const addFences = async (formData) => {
  const { data } = await api.post(`/fences`, formData);
  return data?.data;
};

export const updateFence = async (id, formData) => {
  const { data } = await api.put(`/fences/${id}`, formData);
  return data?.data;
};

export const copyFence = async (id, formData) => {
  const { data } = await api.post(`/fences/${id}/copy`, formData);
  return data?.data;
};

export const deleteFences = async (id) => {
  const { data } = await api.delete(`/fences/${id}`);
  return data?.data;
};

export const destroyFences = async (ids) => {
  const { data } = await api.post(`/fences/bulk-destroy`, { ids });
  return data?.data;
};

export const getFenceDevices = async (id, status = "all") => {
  const { data } = await api.get(`/fences/${id}/devices`, {
    params: { status },
  });
  return data;
};
export const addDeviceToFence = async (id, device_ids) => {
  const { data } = await api.post(`/fences/${id}/devices/sync`, {
    device_ids,
  });
  return data?.data;
};

export const removeDeviceFromFence = async (id, device_ids) => {
  const { data } = await api.post(`/fences/${id}/devices/unsync`, {
    device_ids,
  });
  return data?.data;
};
