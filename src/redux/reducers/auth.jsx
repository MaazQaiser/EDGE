import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({
  name: 'bugs',
  initialState: {
    loading: false,
    user: [],
  },
  reducers: {
    usersLoading: (state) => {
      state.loading = true;
    },
  },
});

export const { usersLoading } = slice.actions;
export default slice.reducer;
