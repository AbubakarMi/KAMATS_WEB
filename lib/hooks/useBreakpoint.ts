import { useState, useEffect } from 'react';

const breakpoints = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
} as const;

type BreakpointKey = keyof typeof breakpoints;

export function useBreakpoint() {
  const [screens, setScreens] = useState<Record<BreakpointKey, boolean>>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
  });

  useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mql = window.matchMedia(query);
      return { key: key as BreakpointKey, mql };
    });

    function update() {
      const next = {} as Record<BreakpointKey, boolean>;
      for (const { key, mql } of queries) {
        next[key] = mql.matches;
      }
      setScreens(next);
    }

    update();

    for (const { mql } of queries) {
      mql.addEventListener('change', update);
    }

    return () => {
      for (const { mql } of queries) {
        mql.removeEventListener('change', update);
      }
    };
  }, []);

  return {
    ...screens,
    isMobile: !screens.md,
    isTablet: screens.md && !screens.lg,
    isDesktop: screens.lg,
  };
}
