import overrides from './overrides';
import palette from './palette';
import typography from './typography';

const darkThemeConfig = {
  palette,
  typography: typography(palette),
  overrides: overrides({ palette }),
};

export default darkThemeConfig;
