import {Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';

// Surface palette for the dark settings screen
const CARD = '#191B20';
const HAIRLINE = '#2A2D34';
const TEXT = '#F5F6F8';
const MUTED = '#8B919C'; 
const SUBTLE = '#ABB2BF';
const ICON_TINT = 'rgba(220, 38, 38, 0.12)'; // soft red wash behind icons

// Row geometry — divider inset = paddingHorizontal + icon width + gap
const ROW_PAD_H = 16;
const ICON_SIZE = 34;
const ROW_GAP = 14;
const DIVIDER_INSET = ROW_PAD_H + ICON_SIZE + ROW_GAP;

export const getStyles = (language: string) => {
  const isAr = language === 'ar';
  const rowDir = isAr ? 'row-reverse' : 'row';
  const textAlign = isAr ? 'right' : 'left';

  return StyleSheet.create({
    safe: {flex: 1, backgroundColor: Colors.darkgrey},

    // ── Sections ─────────────────────────────
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: MUTED,
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 8,
      textAlign,
    },
    sectionSpacer: {height: 24},
    card: {
      backgroundColor: CARD,
      marginHorizontal: 14,
      borderRadius: 14,
      overflow: 'hidden',
    },

    // ── Rows ─────────────────────────────────
    menuRow: {
      flexDirection: rowDir,
      alignItems: 'center',
      minHeight: 56,
      paddingHorizontal: ROW_PAD_H,
      paddingVertical: 10,
      gap: ROW_GAP,
    },
    switchRow: {
      flexDirection: rowDir,
      alignItems: 'center',
      minHeight: 64,
      paddingHorizontal: ROW_PAD_H,
      paddingVertical: 12,
      gap: ROW_GAP,
    },
    rowText: {flex: 1},
    iconBubble: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      borderRadius: 10,
      backgroundColor: ICON_TINT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuLabel: {flex: 1, fontSize: 15, color: TEXT, textAlign},
    rightLabel: {fontSize: 13, color: Colors.btnRed, fontWeight: '500'},
    switchLabel: {fontSize: 15, color: TEXT, fontWeight: '500', textAlign},
    switchSub: {
      fontSize: 12,
      lineHeight: 17,
      color: SUBTLE,
      marginTop: 2,
      textAlign,
    },

    // Fixed slot so the row doesn't jump when Switch ↔ spinner swaps
    switchSlot: {width: 44, alignItems: 'center', justifyContent: 'center'},
    switch: {transform: [{scaleX: 0.8}, {scaleY: 0.8}]},

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: HAIRLINE,
      marginLeft: isAr ? 0 : DIVIDER_INSET,
      marginRight: isAr ? DIVIDER_INSET : 0,
    },

    // ── Logout ───────────────────────────────
    logoutRow: {
      flexDirection: rowDir,
      alignItems: 'center',
      minHeight: 56,
      paddingHorizontal: ROW_PAD_H,
      paddingVertical: 10,
      gap: ROW_GAP,
    },
    logoutTxt: {
      flex: 1,
      fontSize: 15,
      color: '#EF4444',
      fontWeight: '600',
      textAlign,
    },
    version: {
      textAlign: 'center',
      marginTop: 28,
      fontSize: 12,
      color: MUTED,
    },

    // ── Message permission sheet ─────────────
    sheetBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: CARD,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#3A3E47',
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: TEXT,
      marginBottom: 6,
      textAlign,
    },
    sheetSub: {
      fontSize: 13,
      lineHeight: 18,
      color: SUBTLE,
      marginBottom: 10,
      textAlign,
    },
    sheetOption: {
      minHeight: 52,
      flexDirection: rowDir,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: HAIRLINE,
    },
    sheetOptionLast: {borderBottomWidth: 0},
    sheetOptionTxt: {fontSize: 16, color: TEXT},

    // ── Full image viewer ────────────────────
    imageOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtn: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 56 : 24,
      right: isAr ? undefined : 20,
      left: isAr ? 20 : undefined,
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
      flexDirection: rowDir,
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 24,
    },
    viewerEditTxt: {color: '#fff', fontSize: 15, fontWeight: '600'},

    // ── Logout overlay ───────────────────────
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99,
    },
    overlayBox: {
      backgroundColor: CARD,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 36,
      alignItems: 'center',
      gap: 12,
    },
    overlayText: {fontSize: 14, color: TEXT, fontWeight: '500'},
  });
};
