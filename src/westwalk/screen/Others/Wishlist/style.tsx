import {StyleSheet} from 'react-native';
import {Fonts} from '../../../theme/Fonts';
import {Colors} from '../../../theme/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },

  // ---------- List ----------
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // ---------- Page header ----------
  pageHeader: {
    marginBottom: 18,
  },
  titleRow: {
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
  },
  countBadge: {
    minWidth: 26,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
  },
  pageSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 16,
  },

  // ---------- Empty state ----------
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: Colors.PrimaryColor,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseBtnText: {
    fontSize: 14,
    fontFamily: Fonts.F_Bold,
    color: Colors.White,
  },
});

export default styles;