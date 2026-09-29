import {createSlice} from '@reduxjs/toolkit';
import {languageData} from '../../i18n/translations';

interface LanguageState {
  language: 'en' | 'ar';
}

const initialState: LanguageState = {
  language: 'en',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    switchLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const {switchLanguage} = languageSlice.actions;
export default languageSlice.reducer;
export {languageData};
