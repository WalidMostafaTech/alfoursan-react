import { configureStore } from "@reduxjs/toolkit";
import mapSlice from "./mapSlice";
import modalReducer from "./modalsSlice";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    map: mapSlice,
  },
});
