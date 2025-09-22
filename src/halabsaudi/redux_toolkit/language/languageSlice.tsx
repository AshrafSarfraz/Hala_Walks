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
    privacy_policy: "privacy policy and term of condition",
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
    Location: "Location",
    best_sellers: "Best Sellers",
    recently_added: "Recently Added",
    toggle_more: "Show More",
    toggle_less: "Hide",
    discount: " Discount",
    description: "Description",
    region: "region",
    Found_Items:"Items Found",
    No_Items_Found:"No Item Found ",
    Detail_Screen:"Detail Screen",
    Show_More :"Show More ",
    Hide:"Hide",
    Avaliable_Offer:"Avaliable Offer",
    Call_Now :"Call Now",
    Working_Hours:"Working Hours",
    Redeem:"Redeem",
    Open_Map:"Open Map",
    Enter_Email:"Enter your email",
    Create_account:"Create account",
    Register_yourself:"Register yourself",
    Join_Hala_to_Get_started:"Join Hala to get started",
    // Merchant Side
    heading: 'Welcome to Hala B Saudi!',
    description1: 
  'Hala B Saudi is a platform that connects Saudi visitors with trusted local businesses.' +
  'Join us as a partner and expand your reach with exclusive benefits!' + 'Whether you own a restaurant, spa, salon, or retail store — we help promote your business to the right audience.' +
  'Get featured, receive marketing support, and track your customer engagement in real time.', 
    continue: 'Continue',
//Account 
    account: 'Account',
    redeem_history: 'Redeem History',
    discount_history: 'Discount history', // keep if used anywhere; maps same idea
    language: 'Language',
    email: 'Email',
    phone: 'Phone',
    age: 'Age',
    gender: 'Gender',
    edit: 'Edit',
    save: 'Save',
    next: "next",
    cancel: 'Cancel',                 // <-- added
    personal_details: 'Personal details', 
    Home :"Home",
    Wishlist:"Wishlist",
    Profile:"Profile",
    Close:"Close",

    Dont_have_an_account_Register:"Don’t have an account? Register",
    become_a_Partner:"Become a Partner",
    No_Account_Found:"No Account Found",
    Please_create_your_account_first :"Please create your account first.",
    Create_Account:"Create Account",
    Cancel:"Cancel",
    PIN_required: "PIN required. Please enter your PIN.",
    Pin_incorrect: "Pin is incorrect. Please enter the correct pin.",
    Already_redeemed_today: "You have already redeemed a discount for this brand today.",
    Enter_Pin: "Enter Pin",
    Where_to_Get_Redeem_PIN: "Where to Get Redeem PIN?",
    Submit: "Submit",
    km: "Km away",
    m: "m away",
    Calculating:"Calculating...",
    Passport_Txt:"Your Exculsive Passport to Global Savings !",
    Saudi_Visitor:"Saudi Visitor",
    Westwalk_Community:"Westwalk Community",
    List_of_Branch:"List of Branches",

    
    
    
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
    delete_my_account_and_data: "Delete my account and data",
    history: "History",
    load_more: "Load more",
    you_got: "You got",


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
    Location: " الموقع",
    Show_More:"عرض المزيد",
    Hide:"إخفاء",
    Avaliable_Offer :"العرض المتاح",
    Call_Now:"اتصل الآن",
    Working_Hours:"ساعات العمل",
    Redeem :"استرداد",
    Open_Map:"افتح الخريطة",
    Enter_Email:"أدخل بريدك الإلكتروني",
    Create_account:"إنشاء حساب",
    Join_Hala_to_Get_started:"انضم إلى هلا للبدء",
    Register_yourself:"سجّل نفسك",
    become_a_Partner: "كن شريكًا",
    No_Account_Found: "لم يتم العثور على حساب",
    Please_create_your_account_first: "يرجى إنشاء حسابك أولًا.",
    Create_Account: "إنشاء حساب",
    Cancel: "إلغاء",
    //Account Screen
    account: 'الحساب',
    redeem_history: 'سجل الاسترداد',
    discount_history: 'سجل الخصومات', // same meaning as redeem history
    language: 'اللغة',
    full_name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    age: 'العمر',
    gender: 'الجنس',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',                    // <-- added
    personal_details: 'البيانات الشخصية', // <-- added
    Home:   "الرئيسية",
    Wishlist:"قائمة الرغبات",
    Profile:"الملف الشخصي",
    Close :"إغلاق",
    PIN_required: "الرمز السري مطلوب. يرجى إدخال رمزك.",
    Pin_incorrect: "الرمز غير صحيح. يرجى إدخال الرمز الصحيح.",
    Already_redeemed_today: "لقد قمت بالفعل باسترداد خصم لهذه العلامة اليوم.",
    Enter_Pin: "أدخل الرمز السري",
    Where_to_Get_Redeem_PIN: "من أين أحصل على رمز الاسترداد؟",
    Submit: "إرسال",
    best_sellers: "الأكثر مبيعًا",
    recently_added: "المضافة حديثًا",
    toggle_more: "عرض المزيد",
    toggle_less: "إخفاء",
    discount: " خصم  " ,
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
    Dont_have_an_account_Register:" ليس لديك حساب؟ سجِّل الآن",
    km: "كمكم كيلومتر بعيد",
    m: "كمكم متر بعيد",
    Calculating:"جارٍ الحساب",
    Passport_Txt:"جوازك الحصري لتوفير عالمي",
    Saudi_Visitor:"زائر سعودي",
    Westwalk_Community:"مجتمع ويست ووك",
    List_of_Branch:'قائمة الفروع',





    your_phone_number: "رقم هاتفك",
    code_is_sent: "تم إرسال الكود.",
    still_didnt_get_the_code_message: "إذا لم يصلك الكود، يرجى التأكد من إدخال رقم هاتفك بشكل صحيح.",
    fill_the_code: "أدخل الكود",
    didnt_get_the_code: "لم يصلك الكود؟",
    
    
    open: "مفتوح",
    closed: "مغلق",
    get_a_discount_code: "احصل على رمز الخصم",
    open_in_maps: "افتح في الخرائط",
    your_discount_code_is: "رمز الخصم الخاص بك هو",
    single_use_1: "هذا رمز للاستخدام لمرة واحدة فقط.",
    single_use_2: "احصل على رمز جديد في كل مرة تفتح فيها التطبيق.",
    get_a_new_code: "احصل على رمز جديد",
    your_full_name: "اسمك الكامل",
  
    confirm: "تأكيد",
    hello: "مرحبا",
    delete_my_account_and_data: "حذف حسابي وبياناتي",
    history: "التاريخ",
    load_more: "تحميل المزيد",
    you_got: "لقد حصلت على",

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
