import { Grid } from 'antd';

const { useBreakpoint: useAntBreakpoint } = Grid;

export function useBreakpoint() {
  const screens = useAntBreakpoint();

  return {
    ...screens,
    isMobile: !screens.md,
    isTablet: !!screens.md && !screens.lg,
    isDesktop: !!screens.lg,
  };
}
