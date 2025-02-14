import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: [],
    managers:[],
    regions:[],
    employees:[],
};

const companyAnalysisSlice = createSlice({
  name: "company_analysis",
  initialState,
  reducers: {

    setManagers:(state,action)=>{
      state.managers= action.payload
    },
    addManager:(state, action)=>{
      state.managers.push(action.payload)
    },
    setRegions:(state,action)=>{
      state.regions= action.payload
    },
    addRegion:(state, action)=>{
      state.regions.push(action.payload)
    },
    setEmployees:(state,action)=>{
      state.employees= action.payload
    },
    addEmployee:(state, action)=>{
      state.employees.push(action.payload)
    },
    clearRegions:(state)=>{
      state.regions=[]
    },
    clearManagers:(state)=>{
      state.managers=[]
    },
    clearEmployees:(state)=>{
      state.employees=[]
    },

      
  },
});

export const { setManagers,addManager,setRegions,addRegion, setEmployees, addEmployee,clearEmployees,clearManagers, clearRegions} = companyAnalysisSlice.actions;
export default companyAnalysisSlice.reducer;
