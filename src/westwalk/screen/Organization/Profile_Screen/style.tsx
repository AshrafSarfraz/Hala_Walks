import {Colors} from '../../../theme/Colors';
import {Platform, StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  scrollContent: {padding: 16},
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    backgroundColor: Colors.White,
  },
  container: {
    marginTop: Platform.OS === 'ios' ? 40 : 30,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignSelf: 'center',
  },
  Profile_container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },
  staffId: {
    fontSize: 16,
    color: '#5B5B5B',
    marginTop: 4,
  },
  company: {
    fontSize: 16,
    color: '#5B5B5B',
    marginBottom: 20,
  },
  section: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    color: '#232C33',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
});
