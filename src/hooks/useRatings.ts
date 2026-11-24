import { useContext } from 'react';
import {
  RatingsContext,
  type RatingsContextValue,
} from '../app/RatingsProvider.tsx';

export function useRatings(): RatingsContextValue {
  const ctx = useContext(RatingsContext);
  if (!ctx) {
    throw new Error(
      'useRatings muss innerhalb von RatingsProvider verwendet werden.',
    );
  }
  return ctx;
}
