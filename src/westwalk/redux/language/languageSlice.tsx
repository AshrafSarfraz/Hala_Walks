// redux_toolkit/slices/languageSlice.ts
import { createSlice } from '@reduxjs/toolkit';

// Language data for both English and Arabic
const languageData = {
  en: {
    // login Screen
    Organization_Login:"Organization Login",
    Tenants_Login:"Tenants Login",
    Staff_Login:"Staff Login",
    Enter_credentials :"Enter your credentials to continue",
    Enter_your_ID:"Enter your ID",
    Enter_your_Password: "Enter your Password",
    Welcome_to:"Welcome to",
    WestWalk_Family:"West Walk Family",
    WestWalk_Employee:"Employees",
    WestWalk_Tenant:"Tenant",
    Organization_Emp:"Corporation",
    Select_your_role:"Select your role to continue",
    login: "Login",
    logout: "Logout",
    next: "Next",

    //Account
    Redeem_History:"Redeem History",
    Documents:"Documents",
    Account_Info:"Account Info",
    Contact_Us:"Contact Us",
    Profile:"Profile",
    Call_Now:"Call Now",
    View_Menu:"View Menu",
    Open_Map:"Open Map",
    Redeem:"Redeem",
    Wishlist:"Wishlist",
    Language_Format:"ENG",
    forget_password:"Forget Password",
    Directory:"Directory",

   // home Screen
    categories: "Categories",
    venues_collection: "Venues Collection",
    best_sellers: "Best Sellers",
    recently_added: "Recently Added",
    toggle_more: "Show More",
    toggle_less: "Hide",
    discount: " Discount ",
    description: "Description",
    region: "region",
    Found_Items:"Items Found",
    No_Items_Found:"No Item Found ",
    Detail_Screen:"Detail Screen",
    Upcoming_event:"Upcoming Events",
   
    // detail Screen
    workingHours:"workingHours",
    Maintenance_Request:"Maintenance Request",
    Back:"Back",



    welcome_back: "Welcome Back!",
    sign_in_message: "Sign in with your account",
    phone_number: "phone number",
    
    country: "country",
    agree_to: "I agree to the ",
    privacy_policy: "Privacy Policy",
    terms_of_use: "Terms of Use",
    and: "and",
  //  otp Screeb
    enter_otp: "Enter the 6-digit OTP sent to you at",
    verify_otp: "Verify OTP",
    incorrect_otp: "The OTP passcode you’ve entered is incorrect",
    no_code_received: "I haven’t received a code",
    resend: "RESEND",
   

  
    Search_for_anything :"Search for anything you need",
    confirm: "Confirm",
    hello: "Hello",
    discount_history: "Discount history",
    account: "Account",
    language: "Language",
    history: "History",
    load_more: "Load more",
    you_got: "You got",
    save: "Save",
  },


  ar: {
    Organization_Login:"تسجيل دخول المؤسسة",
    Tenants_Login:"تسجيل دخول السكان",
    Staff_Login:"تسجيل دخول الموظفين",
    Enter_credentials :"أدخل بيانات الاعتماد الخاصة بك للمتابعة",
    Enter_your_ID:"أدخل المعرف",
    Enter_your_Password: "أدخل كلمة المرور",
    Welcome_to:" مرحبًا بك في ",
    WestWalk_Family:"عائلة ويست ووك",
    WestWalk_Employee:"موظف ويست ووك",
    WestWalk_Tenant:"ساكن ويست ووك",
    Organization_Emp:"موظف مؤسسة", 
    Select_your_role:"اختر دورك للمتابعة",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    //Account
    Redeem_History:"سجل الاسترداد",
    Documents:"المستندات",
    Account_Info:" معلومات الحساب",
    Contact_Us:"اتصل بنا",
    Profile:"الملف الشخصي",
    Call_Now:"اتصل الآن",
    View_Menu:"عرض القائمة",
    Open_Map :"افتح الخريطة",
    Redeem:"استرداد",
    Wishlist:"قائمة الرغبات",
    Language_Format:"العربية",
    forget_password: "نسيت كلمة المرور",
    Directory:"دليل الهاتف",

    // Detail Screen 
    workingHours:'ساعات العمل',
    Maintenance_Request:"طلب صيانة",
    Back:"رجوع",



    phone_number: "رقم الهاتف",
    agree_to: "أوافق على ",
    privacy_policy: "سياسة الخصوصية",
    terms_of_use: "شروط الاستخدام",
    and: " و ",
    welcome_back: "مرحبًا بعودتك!",
    sign_in_message: "سجّل الدخول إلى حسابك",
    enter_otp: "أدخل رمز OTP المكون من 6 أرقام المرسل إليك على",
    incorrect_otp: "رمز OTP الذي أدخلته غير صحيح",
    no_code_received: "لم أستلم الرمز",
    resend: "إعادة الإرسال",
    verify_otp: "تحقق من OTP",
    categories: "التصنيفات",
    venues_collection: "مجموعة الأماكن",
    best_sellers: "الأكثر مبيعًا",
    recently_added: "المضافة حديثًا",
    toggle_more: "عرض المزيد",
    toggle_less: "إخفاء",
    discount: " خصم " ,
    description: "وصف:",
    country: "الدولة",
    region: "المنطقة",
    next: "التالي",
    Search_for_anything:"ابحث عن أي شيء تحتاجه",
    Found_Items:'تم العثور على العناص'   ,
    No_Items_Found:"لم يتم العثور على عناصر"  ,    
    Detail_Screen:"شاشة التفاصيل",
    Upcoming_event : "الفعاليات القادمة",


    confirm: "تأكيد",
    discount_history: "سجل الخصومات",
    account: "الحساب",
    language: "اللغة",
    history: "التاريخ",
    load_more: "تحميل المزيد",
    you_got: "لقد حصلت على",
    save: "حفظ",
  },
};

interface LanguageState {
  language: 'en' | 'ar'; // Either English or Arabic
}

const initialState: LanguageState = {
  language: 'en', // Default language is English
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    switchLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { switchLanguage } = languageSlice.actions;
export default languageSlice.reducer;
export { languageData };
