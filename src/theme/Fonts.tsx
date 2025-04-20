import { Platform } from 'react-native';

export const Fonts = {
   
    F_Bold: Platform.select({
        ios: 'FilsonProBold',
        android: 'FilsonProBold',
    }),
  
    F_Regular: Platform.select({
        ios: 'FilsonProRegular',
        android: 'FilsonProRegular',
    }),
    F_Medium: Platform.select({
        ios: 'FilsonProMedium',
        android: 'FilsonProMedium',
    }),
    F_Light: Platform.select({
        ios: 'FilsonProLight',
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
