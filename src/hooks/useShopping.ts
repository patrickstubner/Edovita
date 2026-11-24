import { useContext } from 'react';
import {
  ShoppingContext,
  type ShoppingContextValue,
} from '../app/ShoppingProvider.tsx';

export function useShopping(): ShoppingContextValue {
  const ctx = useContext(ShoppingContext);
  if (!ctx) {
    throw new Error(
      'useShopping muss innerhalb von ShoppingProvider verwendet werden.',
    );
  }
  return ctx;
}
