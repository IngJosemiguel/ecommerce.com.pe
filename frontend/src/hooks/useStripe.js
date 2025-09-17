import { useContext } from 'react';
import { StripeContext } from '../contexts/StripeContext';

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};