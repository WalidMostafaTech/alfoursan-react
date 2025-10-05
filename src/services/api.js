import axios from "axios";

const BASE_URL = window.API_BASE_URL; // ✅ جاي من index.html

export const fetchDevices = async () => {
  const { data } = await axios.get(`${BASE_URL}`);
  return data.data;
};

export const searchDevices = async ({ searchType, searchKey }) => {
  const { data } = await axios.post(`${BASE_URL}`, {
    search_key: searchKey,
    search_type: searchType,
  });
  return data.data;
};
