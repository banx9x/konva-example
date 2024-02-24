import { useContext } from 'react';
import { KonvaContext } from './KonvaContext';

export const useKonva = () => {
  const { state, dispatch } = useContext(KonvaContext);

  return {
    ...state,
  };
};
