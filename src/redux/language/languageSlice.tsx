// redux_toolkit/slices/languageSlice.ts
import { createSlice } from '@reduxjs/toolkit';

// Language data for both English and Arabic
const languageData = {
  en: {
    // login Screen
    welcome_back: "Welcome Back!",
    sign_in_message: "Sign in with your account",
    full_name: "Full name",
    phone_number: "phone number",
    login: "login",
    logout: "logout",
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
    
    next: "next",
   
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
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
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
