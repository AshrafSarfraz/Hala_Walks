import {Platform} from 'react-native';
const family = (ios: string, android: string) =>
  Platform.select({ios, android});
export const Fonts = {
  F_Bold: family('SFProRounded-Bold', 'SF-Pro-Rounded-Bold'),
  F_Regular: family('SFProRounded-Regular', 'SF-Pro-Rounded-Regular'),
  F_Medium: family('SFProRounded-Medium', 'SF-Pro-Rounded-Medium'),
  F_Light: family('SFProRounded-Light', 'SF-Pro-Rounded-Light'),
  SF_Bold: family('SFProRounded-Bold', 'SF-Pro-Rounded-Bold'),
  SF_SemiBold: family('SFProRounded-Semibold', 'SF-Pro-Rounded-Semibold'),
  SF_Regular: family('SFProRounded-Regular', 'SF-Pro-Rounded-Regular'),
  SF_Medium: family('SFProRounded-Medium', 'SF-Pro-Rounded-Medium'),
};
