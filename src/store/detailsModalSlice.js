import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  show: false,
  section: "",
  id: null,
};

const detailsModalSlice = createSlice({
  name: "detailsModal",
  initialState,
  reducers: {
    // ✅ فتح المودال مع تمرير بيانات اختيارية
    openDetailsModal: (state, action) => {
      const { section = "", id = null } = action.payload || {};
      state.show = true;
      state.section = section;
      state.id = id;
    },
    // ✅ غلق المودال
    closeDetailsModal: (state) => {
      state.show = false;
      state.section = "";
      state.id = null;
    },
    // ✅ تبديل الحالة (لو مفتوح يقفله والعكس)
    toggleModal: (state) => {
      state.show = !state.show;
      if (!state.show) {
        state.section = "";
        state.id = null;
      }
    },
  },
});

export const { openDetailsModal, closeDetailsModal, toggleModal } =
  detailsModalSlice.actions;
export default detailsModalSlice.reducer;
