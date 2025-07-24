import {StyleSheet} from 'react-native'
import { Colors } from '../../../Themes/Colors';
import { Fonts } from '../../../Themes/Fonts';

export const getStyles =(language: string)=> StyleSheet.create({
    MainContainer: {
      backgroundColor: Colors.White,
      padding: 10,
      paddingHorizontal:'5%',
      paddingTop:'22%',
      flexGrow: 1,
    },
    H_Logo: {
      width: '70%',
      height:130,
      alignSelf: 'center',
    },
    Welcome_Txt: {
      fontSize: 24,
      fontFamily:Fonts.SF_Bold,
      color:Colors.Green,
      lineHeight:28,
      alignSelf: 'center',
    },
    SignUp_Txt: {
      fontSize: 16,
      color: Colors.Black2,
      fontFamily:Fonts.SF_Medium,
      alignSelf: 'center',
      lineHeight:20,
      marginTop:'1%'
     
    },
    InputContainer: {
      marginTop:'8%',
    },
    Input_Field: {
      alignItems: 'flex-start',
      height:60,
      backgroundColor:Colors.White4,
      borderWidth:2,
      borderColor:Colors.grey1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 14,
    },
    Active_Input_Field:{
       borderWidth:2,
       borderColor:Colors.Green,
       backgroundColor:Colors.White
    },
    PhoneInput_Field:{
      flexDirection: language==='en'?'row':'row-reverse',
      alignItems: 'center',
      height:60,
      backgroundColor:Colors.White4,
      borderWidth:2,
      borderColor:Colors.grey1,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 6,
      marginBottom: 14,
      zIndex:10
    },
    User_Input: {
      flex: 1,
      width:"100%",
      fontSize: 14,
      color: Colors.Black2,
      lineHeight:18,
      textAlign:language==='en'?'left':'right'
    },
    PhoneNumber_Input:{
      textAlign:language==='en'?'left':'right',
      fontSize: 14,
      color: Colors.Black2,
      paddingHorizontal:"3%",
      borderLeftWidth:language==='en'?1:0,
      borderRightWidth:language==='en'?0:1,
      borderColor:Colors.Grey9,
      width:200,
      height:59,

    },
    SignUp_Btn:{
     marginVertical:'10%',
    },
    DropdownContainer: {
      backgroundColor: Colors.White,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRightWidth: 1,
      borderColor: Colors.Grey9,
      alignItems: "center",
      justifyContent: "center"
    },
    DropdownText: {
      fontSize: 16,
      color: Colors.Black2
    },
    CombinedText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: "bold",
      color: Colors.Black2
    },
    Error:{
      marginVertical: 5,
      marginBottom:15,
      fontSize: 12,
      fontWeight: 'bold',
      color:'red'
    },
    Partner_Btn:{
      width:'100%',

    },
    Partner_Txt:{
      fontSize: 14,
      color:Colors.Green,
      textAlign:'center',
      paddingVertical:10,
      fontWeight:'bold',
    }
  
    

    
  });
  

  