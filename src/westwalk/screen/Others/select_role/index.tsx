// import ScreenHeader from '../../../components/header/ScreenHeader';
// import React from 'react';
// import {
//   View,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView,
//   StyleSheet,
// } from 'react-native';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {useNavigation} from '@react-navigation/native';
// import {useSelector} from 'react-redux';
// import Ionicons from '@react-native-vector-icons/ionicons';
// import {Text} from '../../../components/Text';
// import {RootState} from '../../../redux/store';
// import {Colors} from '../../../theme/Colors';
// import {Fonts} from '../../../theme/Fonts';
// export default function RoleSelectionScreen() {
//   const navigation = useNavigation<any>();
//   const insets = useSafeAreaInsets();
//   const ar = useSelector((s: RootState) => s.language.language === 'ar');
//   const roles = [
//     {
//       name: ar ? 'موظف ويست ووك' : 'West Walk Employee',
//       route: 'StaffLogin',
//       icon: 'person-outline',
//     },
//     {
//       name: ar ? 'مستأجر ويست ووك' : 'West Walk Tenant',
//       route: 'TenantsLogin',
//       icon: 'home-outline',
//     },
//     {
//       name: ar ? 'موظف مؤسسة' : 'Organization Employee',
//       route: 'CorEmp_Login',
//       icon: 'business-outline',
//     },
//   ] as const;
//   return (
//     <View style={styles.root}>
//       <ScreenHeader
//         title={ar ? 'اختر دورك' : 'Select your role'}
//         onBackPress={() => navigation.navigate('WelcomeScreen')}
//       />
//       <ScrollView
//         contentContainerStyle={{
//           padding: 24,
//           paddingBottom: insets.bottom + 24,
//         }}>
//         {/* <Text style={[styles.welcome, {textAlign: ar ? 'right' : 'left'}]}>
//           {ar ? 'مرحبًا بك في عائلة ويست ووك' : 'Welcome to\nWestwalk Family'}
//         </Text> */}
//         <Text style={[styles.subtitle, {textAlign: ar ? 'right' : 'left'}]}>
//           {ar ? 'اختر دورك للمتابعة' : 'Select your role to continue.'}
//         </Text>
//         {roles.map(r => (
//           <TouchableOpacity
//             accessibilityRole="button"
//             key={r.route}
//             onPress={() => navigation.navigate(r.route)}
//             style={[styles.role, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
//             <View style={styles.icon}>
//               <Ionicons name={r.icon} size={24} color={Colors.PrimaryColor} />
//             </View>
//             <Text style={styles.label}>{r.name}</Text>
//             <Ionicons
//               name={ar ? 'chevron-back' : 'chevron-forward'}
//               size={18}
//               color={Colors.Grey}
//             />
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   root: {flex: 1, backgroundColor: Colors.White},
//   header: {
//     backgroundColor: Colors.PrimaryColor,
//     paddingHorizontal: 16,
//     paddingBottom: 18,
//   },
//   brand: {
//     color: Colors.White,
//     fontSize: 24,
//     fontFamily: Fonts.F_Bold,
//     marginTop: 12,
//   },
//   welcome: {
//     fontSize: 26,
//     lineHeight: 33,
//     fontFamily: Fonts.F_Bold,
//     color: Colors.PrimaryColor,
//     marginTop: 28,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: Colors.textSecondary,
//     marginTop: 12,
//     marginBottom: 32,
//   },
//   role: {
//     minHeight: 76,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: 16,
//     alignItems: 'center',
//     gap: 12,
//     padding: 14,
//     marginBottom: 14,
//   },
//   icon: {
//     width: 44,
//     height: 44,
//     borderRadius: 14,
//     backgroundColor: Colors.accentSoft,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   label: {fontSize: 16, fontFamily: Fonts.F_Medium, flex: 1},
// });




import ScreenHeader from '../../../components/header/ScreenHeader';
import React from 'react';
import {View, TouchableOpacity, ScrollView, StyleSheet, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../components/Text';
import {RootState} from '../../../redux/store';
import {Colors} from '../../../theme/Colors';
import {Fonts} from '../../../theme/Fonts';
import { West_Icon } from '../../../theme/Images';

// Apne logo ka sahi path yahan lagayein


export default function RoleSelectionScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const align = {textAlign: ar ? 'right' : 'left'} as const;

  const roles = [
    {
      name: ar ? 'موظف ويست ووك' : 'West Walk Employee',
      desc: ar ? 'لموظفي ويست ووك والفرق الداخلية' : 'For West Walk staff and internal teams',
      route: 'StaffLogin',
      icon: 'person-outline',
    },
    {
      name: ar ? 'مستأجر ويست ووك' : 'West Walk Tenant',
      desc: ar ? 'للمستأجرين وأصحاب المحلات' : 'For tenants and shop owners',
      route: 'TenantsLogin',
      icon: 'home-outline',
    },
    {
      name: ar ? 'موظف مؤسسة' : 'Organization Employee',
      desc: ar ? 'لموظفي الشركات الشريكة' : 'For employees of partner organizations',
      route: 'CorEmp_Login',
      icon: 'business-outline',
    },
  ] as const;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={ar ? 'اختر دورك' : 'Select your role'}
        onBackPress={() => navigation.navigate('WelcomeScreen')}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 24},
        ]}>
        {/* Logo + welcome */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image source={West_Icon} style={styles.logo} />
          </View>
          <Text style={styles.welcome}>
            {ar ? 'مرحبًا بك في ويست ووك' : 'Welcome to West Walk'}
          </Text>
          <Text style={styles.subtitle}>
            {ar ? 'اختر دورك للمتابعة' : 'Select your role to continue'}
          </Text>
        </View>

        {/* Roles */}
        {roles.map(r => (
          <TouchableOpacity
            accessibilityRole="button"
            key={r.route}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(r.route)}
            style={[styles.role, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
            <View style={styles.icon}>
              <Ionicons name={r.icon} size={24} color={Colors.PrimaryColor} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.label, align]}>{r.name}</Text>
              <Text style={[styles.desc, align]}>{r.desc}</Text>
            </View>
            <Ionicons
              name={ar ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={Colors.Grey}
            />
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          {ar ? 'تحتاج مساعدة؟ تواصل مع الإدارة' : 'Need help? Contact the management office'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.White},
  content: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24},
  hero: {alignItems: 'center',  marginBottom: 32, },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop:-50
  },
  logo: {width: 80, height: 80, resizeMode: 'contain'},
  welcome: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  role: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: Colors.White,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 0,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {flex: 1},
  label: {fontSize: 16, fontFamily: Fonts.F_Medium},
  desc: {fontSize: 12, color: Colors.textSecondary, marginTop: 3},
  footer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});