import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: [],
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setCompanies: (state, action) => {
        state.value = action.payload; 
      },
      addCompany: (state, action) => {
        state.value.push(action.payload);
      },
      removeCompany: (state, action) => {
        state.value = state.value.filter(company => company.id !== action.payload);
      },
  },
});

export const { setCompanies, addCompany } = companiesSlice.actions;
export default companiesSlice.reducer;
