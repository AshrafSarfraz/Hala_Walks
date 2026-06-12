// redux_toolkit/selectcountry/countrySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CountryState {
  countryName: 'Qatar' | 'Bahrain';
}

const initialState: CountryState = { countryName: 'Qatar' }; // ✅ default Qatar

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {
    switchCountryName: (state, action: PayloadAction<CountryState['countryName']>) => {
      state.countryName = action.payload;
    },
  },
});

export const { switchCountryName } = countrySlice.actions;
export default countrySlice.reducer;
