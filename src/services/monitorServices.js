import api from "./api";

import { dummyData } from "./data";
export const getDevices = async (searchParams) => {
  console.log("✅ Using dummyData instead of API",dummyData, searchParams);
  return dummyData;
};

// export const getDevices = async (searchType, searchKey) => {
//   const params = {};

//   if (searchKey && searchType) {
//     params.search_key = searchKey;
//     params.search_type = searchType;
//   }

//   const { data } = await api.get("/data", { params });
//   return data.data;
// };

export const getDeviceSettings = async (id) => {
  const { data } = await api.get(`/settings?device_id=${id}`);
  return data.data;
};

export const createShareLink = async (params) => {
  const { data } = await api.post(`/share-link`, params);
  return data.data;
};
