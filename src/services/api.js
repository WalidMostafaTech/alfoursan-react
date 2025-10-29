import axios from "axios";

// const BASE_URL = "https://alfursantracking.com/api/v1/tenant/monitor";
// const BASE_URL =
//   "https://alfursan-alarb-for-rent-car.alfursantracking.com/monitor-api/monitor";
const BASE_URL =
  "https://alfursan-alarb-for-rent-car.alfursantracking.com/monitor-api/monitor";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer 143|Rz9e1TqeSeeEKWTMAJozDFokvhp0YNzCE2EdFNfffdc4d58f}`,
  },
});

export default api;
