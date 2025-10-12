import { configureStore } from "@reduxjs/toolkit";
import detailsModalReducer from "./detailsModalSlice";
import mapSlice from "./mapSlice";

export const store = configureStore({
  reducer: {
    detailsModal: detailsModalReducer,
    map: mapSlice,
  },
});
