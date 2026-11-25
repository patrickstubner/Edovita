import { useContext } from 'react';
import { PlanContext, type PlanContextValue } from '../app/PlanProvider.tsx';

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error('usePlan muss innerhalb von PlanProvider genutzt werden.');
  }
  return ctx;
}
