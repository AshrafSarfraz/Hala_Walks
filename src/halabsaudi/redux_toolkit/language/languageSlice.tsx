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
    discount: " Discount for the menu ",
    description: "Description",
    region: "region",
    Found_Items:"Items Found",
    No_Items_Found:"No Item Found ",
    Detail_Screen:"Detail Screen",
   
    // Merchant Side
    heading: 'Welcome to Hala B Saudi!',
    description1: 
  'Hala B Saudi is a platform that connects Saudi visitors with trusted local businesses.' +
  'Join us as a partner and expand your reach with exclusive benefits!' + 'Whether you own a restaurant, spa, salon, or retail store — we help promote your business to the right audience.' +
  'Get featured, receive marketing support, and track your customer engagement in real time.',

    
    continue: 'Continue',


    
    privacy_policy_1: "I have read and accept the",
    privacy_policy_2: "privacy policy",
    privacy_policy_3: "and agree that my personal data will be processed by you",
    terms_1: "I have read and accept the",
    terms_2: "terms of use",
    next: "next",
    your_phone_number: "your phone number",
    password: "password",
    is_this_the_correct_number: "Is this the correct number?",
    edit: "edit",
    code_is_sent: "Code is sent.",
    still_didnt_get_the_code_message: "If you still didn’t get the code, please make sure you’ve filled your phone number correctly.",
    fill_the_code: "Fill the code",
    didnt_get_the_code: "Didn’t get the code?",
    km: "Km away",
    open: "open",
    closed: "closed",
    get_a_discount_code: "Get a discount code",
    open_in_maps: "Open in maps",
    your_discount_code_is: "Your discount code is",
    single_use_1: "This is a single-use code for your use only.",
    single_use_2: "Get a new code each time you open the app.",
    get_a_new_code: "Get a new code",
    Search_for_anything :"Search for anything you need",

    confirm: "Confirm",
    hello: "Hello",
    discount_history: "Discount history",
    account: "Account",
    language: "Language",
    delete_my_account_and_data: "Delete my account and data",
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
    discount: " خصم على القائمة " ,
    description: "وصف:",
    country: "الدولة",
    region: "المنطقة",
    next: "التالي",
    Search_for_anything:"ابحث عن أي شيء تحتاجه",
    Found_Items:'تم العثور على العناص'   ,
    No_Items_Found:"لم يتم العثور على عناصر"  ,    
    Detail_Screen:"شاشة التفاصيل",
    // merchant side
    heading: 'مرحبًا بك في هلا بالسعودي!',
    description1: 
    'هلا بالسعودي هو منصة تربط الزوار السعوديين بالأعمال المحلية الموثوقة.' + 'انضم إلينا كشريك ووسّع نطاق عملك مع مزايا حصرية!' + 'سواء كنت تمتلك مطعمًا، سبا، صالونًا، أو متجرًا — نحن نساعدك على الترويج لعملك أمام الجمهور المناسب.' +
    'احصل على ظهور مميز، دعم تسويقي، وتتبع تفاعل العملاء في الوقت الفعلي.',
    continue: 'استمرار',
    
    your_phone_number: "رقم هاتفك",
    code_is_sent: "تم إرسال الكود.",
    still_didnt_get_the_code_message: "إذا لم يصلك الكود، يرجى التأكد من إدخال رقم هاتفك بشكل صحيح.",
    fill_the_code: "أدخل الكود",
    didnt_get_the_code: "لم يصلك الكود؟",
    km: "كمكم كيلومتر بعيد",
    open: "مفتوح",
    closed: "مغلق",
    get_a_discount_code: "احصل على رمز الخصم",
    open_in_maps: "افتح في الخرائط",
    your_discount_code_is: "رمز الخصم الخاص بك هو",
    single_use_1: "هذا رمز للاستخدام لمرة واحدة فقط.",
    single_use_2: "احصل على رمز جديد في كل مرة تفتح فيها التطبيق.",
    get_a_new_code: "احصل على رمز جديد",
    your_full_name: "اسمك الكامل",
    full_name: "الاسم الكامل",
    confirm: "تأكيد",
    hello: "مرحبا",
    discount_history: "سجل الخصومات",
    account: "الحساب",
    language: "اللغة",
    delete_my_account_and_data: "حذف حسابي وبياناتي",
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
