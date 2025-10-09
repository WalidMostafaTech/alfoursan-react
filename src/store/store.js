import { configureStore } from "@reduxjs/toolkit";
import detailsModalReducer from "./detailsModalSlice";
import mapTypeSlice from "./mapTypeSlice";

export const store = configureStore({
  reducer: {
    detailsModal: detailsModalReducer,
    mapType: mapTypeSlice,
  },
});
