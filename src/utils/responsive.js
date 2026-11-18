import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions based on standard mobile screen (e.g. Pixel 4 / iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

export const scale = (size) => (SCREEN_WIDTH / baseWidth) * size;
export const verticalScale = (size) => (SCREEN_HEIGHT / baseHeight) * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const dimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 360,
  isTablet: SCREEN_WIDTH >= 768,
};
