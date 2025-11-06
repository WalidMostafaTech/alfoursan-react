import axios from "axios";

// const BASE_URL = "https://alfursantracking.com/api/v1/tenant/monitor";
// const BASE_URL =
//   "https://alfursan-alarb-for-rent-car.alfursantracking.com/monitor-api/monitor";
const BASE_URL = window.__API_BASE_URL__;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export default api;
