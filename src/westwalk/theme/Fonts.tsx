import { Platform } from 'react-native';

export const Fonts = {
   
    F_Bold: Platform.select({
        ios: 'FilsonPro-Bold',
        android: 'FilsonProBold',
    }),
  
    F_Regular: Platform.select({
        ios: 'FilsonPro-Regular',
        android: 'FilsonProRegular',
    }),
    F_Medium: Platform.select({
        ios: 'FilsonPro-Medium',
        android: 'FilsonProMedium',
    }),
    F_Light: Platform.select({
        ios: 'FilsonPro-Light',
        android: 'FilsonProLight',
    }),
};
 // SF_Black: Platform.select({
    //     ios: 'FilsonProBold',
    //     android: 'FilsonProBold.',
    // }),
  // SF_SemiBold: Platform.select({
    //     ios: 'SFProRounded-Semibold',
    //     android: 'SF-Pro-Rounded-Semibold',
    // }),
