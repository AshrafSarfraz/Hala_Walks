import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../Themes/Colors";

export const getStyles = (language: string) =>
    StyleSheet.create({
      safe: {flex: 1, backgroundColor: Colors.dargBg, paddingBottom:20},
      profileCard: {alignItems: 'center', paddingTop: 32},
      avatarWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 10,
      },
      avatarImg: {width: '100%', height: '100%'},
      avatarFallback: {
        flex: 1,
        backgroundColor: Colors.lightRed,
        justifyContent: 'center',
        alignItems: 'center',
      },
      avatarInitials: {fontSize: 36, fontWeight: '700', color: '#fff'},
      profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.White,
        marginBottom: 6,
        textAlign: language === 'ar' ? 'right' : 'left',
      },
      phonePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.White,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 6,
      },
      phoneText: {fontSize: 13, color: Colors.grey},
      sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.White,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginHorizontal: 18,
        marginTop: 20,
        marginBottom: 6,
        textAlign: language === 'ar' ? 'right' : 'left', // ✅
      },
      card: {
        backgroundColor: Colors.White,
        marginHorizontal: 14,
        borderRadius: 14,
        overflow: 'hidden',
      },
      menuRow: {
        flexDirection: language === 'ar' ? 'row-reverse' : 'row', // ✅
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      },
      iconBubble: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
      },
      menuLabel: {
        flex: 1,
        fontSize: 15,
        color: '#1C1C1E',
        textAlign: language === 'ar' ? 'right' : 'left', // ✅
      },
      rightLabel: {fontSize: 13, color: Colors.btnRed, fontWeight: '500'},
      switchRow: {
        flexDirection: language === 'ar' ? 'row-reverse' : 'row', // ✅
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      },
      switchLabel: {
        fontSize: 15,
        color: '#1C1C1E',
        fontWeight: '500',
        textAlign: language === 'ar' ? 'right' : 'left', // ✅
      },
      switchSub: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        textAlign: language === 'ar' ? 'right' : 'left', // ✅
      },
      logoutRow: {
        flexDirection: language === 'ar' ? 'row-reverse' : 'row', // ✅
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      },
      logoutTxt: {
        flex: 1,
        fontSize: 15,
        color: '#DC2626',
        fontWeight: '600',
        textAlign: language === 'ar' ? 'right' : 'left', // ✅
      },
      divider: {height: 0.5, backgroundColor: '#E5E5EA', marginLeft: language === 'ar' ? 0 : 66, marginRight: language === 'ar' ? 66 : 0},
      version: {textAlign: 'center', marginTop: 28, fontSize: 12, color: '#C7C7CC'},
      imageOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      closeBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 24,
        right: language === 'ar' ? undefined : 20, // ✅
        left: language === 'ar' ? 20 : undefined,  // ✅
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      viewerName: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 62 : 28,
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
      },
      fullImage: {
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
      },
      viewerEditBtn: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 52 : 32,
        flexDirection: language === 'ar' ? 'row-reverse' : 'row', // ✅
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 24,
      },
      viewerEditTxt: {color: '#fff', fontSize: 15, fontWeight: '600'},
      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
      },
      overlayBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 36,
        alignItems: 'center',
        gap: 12,
      },
      overlayText: {fontSize: 14, color: '#1C1C1E', fontWeight: '500'},
    });