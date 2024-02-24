import { createContext, useReducer, type PropsWithChildren } from 'react';
import { reducer } from './reducer';
import { type KonvaContextObject } from './types';

export const KonvaContext = createContext<KonvaContextObject>(
  {} as KonvaContextObject,
);

const KonvaProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, {}, (initialArgs) => {
    return initialArgs;
  });

  return (
    <KonvaContext.Provider value={{ state, dispatch }}>
      {children}
    </KonvaContext.Provider>
  );
};

export default KonvaProvider;
