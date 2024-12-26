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
    setSelectedHousehold: (state, action: PayloadAction<string | null>) => {
      state.selectedHouseholdId = action.payload;
    },
  },
});

export const { setSelectedHousehold } = householdsSlice.actions;
export default householdsSlice.reducer;
