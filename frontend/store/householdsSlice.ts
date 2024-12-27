import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HouseholdsState {
  selectedHouseholdId: string | null;
}

const initialState: HouseholdsState = {
  selectedHouseholdId: null,
};

const householdsSlice = createSlice({
  name: 'households',
  initialState,
  reducers: {
    setSelectedHousehold: (state, action: PayloadAction<string>) => {
      state.selectedHouseholdId = action.payload;
    },
    clearSelectedHousehold: (state) => {
      state.selectedHouseholdId = null;
    },
  },
});

export const { setSelectedHousehold, clearSelectedHousehold } = householdsSlice.actions;
export default householdsSlice.reducer;
