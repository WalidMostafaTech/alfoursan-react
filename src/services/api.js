import axios from "axios";

const BASE_URL = window.API_BASE_URL;

export const getDevices = async (searchType, searchKey) => {
  const params = {};

  if (searchKey && searchType) {
    params.search_key = searchKey;
    params.search_type = searchType;
  }

  const { data } = await axios.get(`${BASE_URL}`, { params });
  return data.data;
};
