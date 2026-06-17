import { StyleSheet } from "react-native";
import { Colors } from "../../../Themes/Colors";
import { Fonts } from "../../../Themes/Fonts";

export const getStyles = (language: string) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dargBg,
    paddingTop:20
  },
  MainCont: {
    backgroundColor: Colors.dargBg,
    flexGrow: 1,
    paddingHorizontal: '6%',
    paddingBottom: '10%',
  },
  Header: {
    width: '100%',
    height: 50,
    marginBottom: '6%',
    justifyContent: 'center',
    alignItems: language === 'en' ? 'flex-start' : 'flex-end',
  },
  BackIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.White,
    transform: language === 'en' ? [{ scaleX: 1 }] : [{ scaleX: -1 }],
  },
  Logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginTop: '4%',
  },
  digit_Txt: {
    fontFamily: Fonts.SF_Medium,
    fontSize: 16,
    color: Colors.whiteGrey,
    alignSelf: 'center',
    lineHeight: 20,
    marginTop: '8%',
  },
  PhoneNumber: {
    fontFamily: Fonts.SF_Bold,
    fontSize: 20,
    color: Colors.White,
    alignSelf: 'center',
    lineHeight: 26,
    marginTop: '2%',
    marginBottom: '8%',
  },
  inputWrap: {
    width: '100%',
    marginTop: 4,
  },
  otpInput: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.White4,
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    letterSpacing: 8,
    textAlign: 'center',
    color: Colors.Black,
    fontFamily: Fonts.SF_Bold,
  },
  otpInputFocused: {
    borderColor: Colors.Green,
    backgroundColor: Colors.White,
  },
  otpInputFilled: {
    borderColor: Colors.Green,
    borderWidth: 2,
    backgroundColor: Colors.White,
  },
  Error: {
    fontFamily: Fonts.SF_Medium,
    fontSize: 13,
    color: Colors.Red,
    lineHeight: 18,
    marginTop: '3%',
    marginLeft: '1%',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  resendHint: {
    fontFamily: Fonts.SF_Regular,
    fontSize: 13,
    color: Colors.whiteGrey,
    lineHeight: 18,
  },
  resendLink: {
    fontFamily: Fonts.SF_Bold,
    fontSize: 13,
    color: Colors.White,
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  resendLinkDisabled: {
    color: Colors.Grey9,
    textDecorationLine: 'none',
  },
});11