// src/redux/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  [key: string]: any; // to allow additional fields
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleItemInCart: (state, action: PayloadAction<CartItem>) => {
      const itemExists = state.items.find(item => item.id === action.payload.id);

      if (itemExists) {
        // Remove item if it already exists
        state.items = state.items.filter(item => item.id !== action.payload.id);
      } else {
        // Add item if it doesn't exist
        state.items.push(action.payload);
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { toggleItemInCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
