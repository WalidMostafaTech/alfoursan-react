import api from "./api";

// import { dummyData } from "./data";
// export const getDevices = async (searchParams) => {
//   console.log("✅ Using dummyData instead of API",dummyData, searchParams);
//   return dummyData;
// };

export const getDevices = async ({ queryKey }) => {
  const [_key, params] = queryKey;
  const { full } = params || {};
  const { data } = await api.get(`/data${full ? "?full=1" : ""}`);
  return data?.data;
};

export const getDeviceSettings = async (id) => {
  const { data } = await api.get(`/settings?device_id=${id}`);
  return data?.data;
};

export const updateDialogCar = async (id, formData) => {
  const { data } = await api.post(`/update-car/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data?.data;
};

export const sendCommand = async (payload) => {
  const { data } = await api.post(`/commands`, payload);
  return data?.data;
};

export const deleteCommand = async (id) => {
  const { data } = await api.post(`/delete/commands`, { id });
  return data?.data;
};

export const updateDialogAlert = async (id, formData) => {
  const { data } = await api.post(`/update-alerts/${id}`, formData);
  return data?.data;
};

export const getMaintenances = async (id) => {
  const { data } = await api.get(`/listMaintenances?id=${id}`);
  return data?.data;
};

export const createMaintenances = async (formData) => {
  const { data } = await api.post(`/maintenance`, formData);
  return data?.data;
};

export const deleteMaintenances = async (id) => {
  const { data } = await api.delete(`/maintenance/${id}`);
  return data?.data;
};

export const sendScheduledTask = async (id, formData) => {
  const { data } = await api.post(`/scheduled-task/${id}`, formData);
  return data?.data;
};

export const createShareLink = async (params) => {
  const { data } = await api.post(`/share-link`, params);
  return data?.data;
};

export const getSupport = async () => {
  const { data } = await api.get(`/contact-text`);
  return data?.data;
};

export const getReplay = async ({ serial_number, from_time, to_time }) => {
  const { data } = await api.get(`/replay`, {
    params: { serial_number, from_time, to_time },
  });
  return data;
};

// ✅ تتبع جهاز واحد (صفحة التتبع الجديدة)
export const getTrackingDevice = async (deviceId) => {
  const { data } = await api.get(
    `/tenant-dashboard/tenant/devices/tracking-getDevice`,
    {
      params: { deviceId },
    },
  );
  return data;
};

// ✅ Outside share tracking (same route but JSON)
export const getOutsideTracking = async (id) => {
  const { data } = await api.get(window.location.href, {
    // const { data } = await api.get("http://test.alfursantracking.localhost/outSide/tracking/" + id, {
    params: { is_json: 1 },
  });
  return data;
};

export const getDevicesForCarReplay = async () => {
  const { data } = await api.get(`/devices-list`);
  return data?.data;
};