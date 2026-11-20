import { createContext, useContext } from 'react';

export type Nav = {
  route: string;
  go: (r: string) => void;
  back: () => void;
  replace: (r: string) => void;
  reset: (r: string) => void;
};
export const NavCtx = createContext<Nav>({ route: 'home', go: () => {}, back: () => {}, replace: () => {}, reset: () => {} });
export const useNav = () => useContext(NavCtx);

/** Root elemen untuk sheet/toast di dalam bingkai HP. */
export const OverlayCtx = createContext<HTMLElement | null>(null);
export const useOverlay = () => useContext(OverlayCtx);
