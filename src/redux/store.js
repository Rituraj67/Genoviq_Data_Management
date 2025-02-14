import { configureStore } from "@reduxjs/toolkit";
import  companiesReducer  from "./companiesSlice";
import companyAnalysisReducer from "./companyAnalysisSlice"


const store = configureStore({
  reducer: {
    companies: companiesReducer,
    company_analysis: companyAnalysisReducer
  },
});

export default store;
