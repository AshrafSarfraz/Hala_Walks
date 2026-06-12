import { Platform } from 'react-native';

export const Fonts = {
    SF_Black: Platform.select({
        ios: 'SFProRounded-Black',
        android: 'SF-Pro-Rounded-Black',
    }),
    SF_Bold: Platform.select({
        ios: 'SFProRounded-Bold',
        android: 'SF-Pro-Rounded-Bold',
    }),
    SF_SemiBold: Platform.select({
        ios: 'SFProRounded-Semibold',
        android: 'SF-Pro-Rounded-Semibold',
    }),
    SF_Regular: Platform.select({
        ios: 'SFProRounded-Regular',
        android: 'SF-Pro-Rounded-Regular',
    }),
    SF_Medium: Platform.select({
        ios: 'SFProRounded-Medium',
        android: 'SF-Pro-Rounded-Medium',
    }),
    SF_Heavy: Platform.select({
        ios: 'SFProRounded-Heavy',
        android: 'SF-Pro-Rounded-Heavy',
    }),
    SF_Light: Platform.select({
        ios: 'SFProRounded-Light',
        android: 'SF-Pro-Rounded-Light',
    }),
};
