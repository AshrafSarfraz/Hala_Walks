import {Platform, StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 40 : 30,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 50,
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
    borderWidth: 1,
    borderColor: '#5B5B5B',
  },
  name: {
    marginTop: 12,
    width: '100%',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
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
    flex: 1,
    marginRight: 12,
    fontSize: 16,
    color: '#232C33',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '500',
  },
});
