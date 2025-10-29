import { configureStore } from "@reduxjs/toolkit";
import mapSlice from "./mapSlice";
import modalsReducer from "./modalsSlice";

export const store = configureStore({
  reducer: {
    modals: modalsReducer,
    map: mapSlice,
  },
});
