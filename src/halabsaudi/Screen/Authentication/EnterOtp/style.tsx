
import { StyleSheet } from "react-native";
import { Colors } from "../../../Themes/Colors";
import { Fonts } from "../../../Themes/Fonts";

export const getStyles = (language: string) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop:20
  },
  MainCont: {
    backgroundColor: Colors.background,
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
    tintColor: Colors.white,
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
    color: Colors.textSecondary,
    alignSelf: 'center',
    lineHeight: 20,
    marginTop: '8%',
  },
  PhoneNumber: {
    fontFamily: Fonts.SF_Bold,
    fontSize: 20,
    color: Colors.white,
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
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: Colors.white,
    fontFamily: Fonts.SF_Bold,
  },
  otpInputFocused: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.surface,
  },
  otpInputFilled: {
    borderColor: Colors.brandGreen,
    borderWidth: 2,
    backgroundColor: Colors.surface,
  },
  Error: {
    fontFamily: Fonts.SF_Medium,
    fontSize: 13,
    color: Colors.accent,
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
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  resendLink: {
    fontFamily: Fonts.SF_Bold,
    fontSize: 13,
    color: Colors.white,
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  resendLinkDisabled: {
    color: Colors.textMuted,
    textDecorationLine: 'none',
  },
});11