import {createSlice} from '@reduxjs/toolkit';

const languageData = {
  en: {
    welcome_back: 'Welcome', sign_in_message: 'Sign in with your account',
    full_name: 'Full name', phone_number: 'phone number', login: 'login',
    logout: 'Logout', country: 'country', agree_to: 'I agree to the ',
    privacy_policy: 'privacy policy and term of condition', terms_of_use: 'Terms of Use', and: 'and',
    enter_otp: 'Enter the OTP sent to your WhatsApp number', verify_otp: 'Verify OTP',
    incorrect_otp: 'The OTP passcode you have entered is incorrect',
    no_code_received: 'I have not received a code', resend_code: 'Resend code',
    resend_in: 'Resend code in', seconds_short: 's',
    categories: 'Categories', Location: 'Location', best_sellers: 'Best Sellers',
    recently_added: 'Recently Added', toggle_more: 'Show More', toggle_less: 'Hide',
    discount: ' Discount', description: 'Description', region: 'region',
    Found_Items: 'Items Found', No_Items_Found: 'No Item Found', Detail_Screen: 'Detail Screen',
    Show_More: 'Show More', Hide: 'Hide', Avaliable_Offer: 'Avaliable Offer',
    Call_Now: 'Call Now', Working_Hours: 'Working Hours', Redeem: 'Redeem',
    Open_Map: 'Open Map', Enter_Email: 'Enter your email', Create_account: 'Create account',
    Register_yourself: 'Register yourself', Join_Hala_to_Get_started: 'Join Hala to get started',
    heading: 'Welcome to Hala B Saudi!',
    description1: 'Hala B Saudi is a platform that connects Saudi visitors with trusted local businesses.',
    continue: 'Continue',
    account: 'Account', blocked_accounts: 'Blocked Accounts', redeem_history: 'Redeem History',
    discount_history: 'Discount history', language: 'Language', email: 'Email', phone: 'Phone',
    age: 'Age', gender: 'Gender', edit: 'Edit', save: 'Save', next: 'next',
    cancel: 'Cancel', personal_details: 'Personal details', Home: 'Home',
    Wishlist: 'Wishlist', Profile: 'Profile', Close: 'Close',
    Dont_have_an_account_Register: 'Do not have an account? Register',
    become_a_Partner: 'Become a Partner', No_Account_Found: 'No Account Found',
    Please_create_your_account_first: 'Please create your account first.',
    Create_Account: 'Create Account', Cancel: 'Cancel',
    PIN_required: 'PIN required. Please enter your PIN.',
    Pin_incorrect: 'Pin is incorrect. Please enter the correct pin.',
    Already_redeemed_today: 'You have already redeemed a discount for this brand today.',
    Enter_Pin: 'Enter Pin', Where_to_Get_Redeem_PIN: 'Where to Get Redeem PIN?',
    Submit: 'Submit', km: 'Km away', m: 'm away', Calculating: 'Calculating...',
    Passport_Txt: 'Your Exculsive Passport to Global Savings !',
    Saudi_Visitor: 'Saudi Visitor', Westwalk_Community: 'Westwalk Community',
    List_of_Branch: 'List of Branches', open: 'open', closed: 'closed',
    get_a_discount_code: 'Get a discount code', open_in_maps: 'Open in maps',
    your_discount_code_is: 'Your discount code is',
    single_use_1: 'This is a single-use code for your use only.',
    single_use_2: 'Get a new code each time you open the app.',
    get_a_new_code: 'Get a new code', Search_for_anything: 'Search for anything you need',
    confirm: 'Confirm', hello: 'Hello', delete_my_account_and_data: 'Delete my account and data',
    history: 'History', load_more: 'Load more', you_got: 'You got',

    // Chat
    tap_to_open: 'Tap to open menu / offer', hala_community: 'HALA COMMUNITY',
    message: 'Message', chat: 'Chat', active_now: 'Active Now',
    long_press_delete: 'Long Press to delete', new_chat: 'New chat',
    blocked_user: 'You blocked this user', cannot_reply: 'You cannot reply to this conversation',
    bio: 'BIO', birthday: 'Birthday', actions: 'Actions', send_message: 'Send Message',
    mute_notifications: 'Mute Notifications', silence_chat: 'Silence this chat',
    shared_media: 'Shared Media', photos: 'Photos', view_all_items: 'View all items',
    privacy: 'Privacy', block_user: 'Block User', block_user_desc: "They won't be able to message you",
    add_new_friend: 'Add new Friend', search_members: 'Search members',
    saved_items: 'Saved items', saved_items_desc: 'Items you save will appear here',
    manage: 'Manage', show_last_seen: 'Show Last Seen',
    last_seen_desc: 'Others can see your last active time',
    online_status: 'Online Status', online_status_desc: "Others can see when you're online",
    edit_profile: 'Edit Profile', change_photo: 'Tap to change photo',
    redemptions: 'Redemptions', close: 'Close',

    // Edit Profile
    enter_name: 'Enter your name', bio_placeholder: 'Tell something about yourself',
    select_birthday: 'Select your birthday', nothing_to_update: 'Nothing to update',
    profile_updated: 'Profile updated!',

    // ChatScreenHeader
    status_blocked: 'Blocked', status_online: 'Online', status_last_seen: 'Last seen',

    // ConversationHeader
    messages_title: 'Messages', search_messages: 'Search messages…',

    // AttachmentSheet
    share_content: 'Share Content', choose_to_send: 'Choose what you want to send',
    camera: 'Camera', camera_sub: 'Take a photo or video',
    gallery: 'Gallery', gallery_sub: 'Choose from your library',
    document: 'Document', document_sub: 'Share a PDF or file',

    // BlockUserModal
    block_title: 'Block User', unblock_title: 'Unblock User',
    block_desc_text: "Blocking {{name}} will prevent them from sending you messages. They won't be notified.",
    unblock_desc_text: '{{name}} will be able to send you messages again.',
    block_b1: 'They cannot message you', block_b2: "You won't see their messages",
    block_b3: "They won't know they're blocked",
    unblock_b1: 'They can message you again', unblock_b2: 'You can message them',
    unblock_b3: 'Previous messages stay', block_btn: 'Block', unblock_btn: 'Unblock',

    // DeleteMessageModal
    delete_message_title: 'Delete Message?', delete_undone: 'This action cannot be undone.',
    delete_for_everyone: 'Delete for Everyone', delete_for_everyone_sub: 'Removed from all devices',
    delete_for_me: 'Delete for Me', delete_for_me_sub: 'Only removed on your device',

    // MuteModal
    mute_title: 'Mute Notifications', muted_title: 'Chat Muted',
    mute_sub: 'Silence notifications for this chat only',
    muted_sub: "You won't receive notifications for this chat",
    mute_for: 'Mute for', mute_8h: '8 Hours', mute_8h_sub: 'Until later today',
    mute_1w: '1 Week', mute_1w_sub: 'Until next week',
    mute_always: 'Always', mute_always_sub: 'Until you unmute',
    mute_chat_btn: 'Mute Chat', unmute_btn: 'Unmute Notifications',
    tap_to_unmute: 'Tap to unmute',
    years_old: 'years old',

    // ChatScreen
    message_placeholder: 'Message…', editing_message_label: 'Editing message',
    reply_to_label: 'Reply to', deleted_message_text: 'This message was deleted',
    action_reply: 'Reply', action_edit: 'Edit', action_copy: 'Copy', action_delete: 'Delete',
    blocked_user_footer: 'You blocked this user.',

    // AllMediaScreen
    no_shared_media: 'No shared media', media_view: 'View', media_delete: 'Delete',
    photo_label: 'photo', photos_label: 'photos', video_label: 'video', videos_label: 'videos',

    // BlockedUsersScreen
    account_settings: 'Account Settings', blocked_users_title: 'Blocked Users',
    blocked_label: 'Blocked', unblock: 'Unblock',
    no_blocked_users: 'No blocked users',
    no_blocked_desc: 'Your blocked list is empty. Everyone can message you.',
    loading_text: 'Loading…', error_unblock: 'Could not unblock. Please try again.',
    unblock_confirm_msg: 'will be able to message you again.',
    user_label: 'user', users_label: 'users', blocked_count_label: 'blocked',

    // ConversationScreen
    you_prefix: 'You: ',
    no_conversations: 'No conversations yet',
    start_chatting: 'Start chatting with Hala community',
    find_friends: 'Find Friends',

     // RedeemHistory
     loading_history: 'Loading history…',
     no_redeem_history: 'No Redeem History',
     no_redeem_desc: "You haven't redeemed any codes yet. Start exploring offers!",
     redemption_label: 'redemption',
     redemptions_label_pl: 'redemptions',

    // StartChatScreen
    online_label: 'Online', offline_label: 'Offline',
    no_members_found: 'No members found', try_different_search: 'Try a different search term',
    finding_people: 'Finding people for you…',
    member_label: 'member', members_label: 'members',
    online_dot_label: '● Online', offline_dot_label: '● Offline',
  },

  ar: {
    welcome_back: 'مرحبًا بعودتك!', sign_in_message: 'سجّل الدخول إلى حسابك',
    full_name: 'الاسم الكامل', phone_number: 'رقم الهاتف', login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج', country: 'الدولة', agree_to: 'أوافق على ',
    privacy_policy: 'سياسة الخصوصية', terms_of_use: 'شروط الاستخدام', and: ' و ',
    enter_otp: 'أدخل رمز التحقق المرسل إلى رقم WhatsApp الخاص بك.',
    verify_otp: 'تحقق من OTP', incorrect_otp: 'رمز OTP الذي أدخلته غير صحيح',
    no_code_received: 'لم أستلم الرمز', resend_code: 'إعادة إرسال الرمز',
    resend_in: 'إعادة الإرسال خلال', seconds_short: 'ث',
    categories: 'التصنيفات', Location: 'الموقع', best_sellers: 'الأكثر مبيعًا',
    recently_added: 'المضافة حديثًا', toggle_more: 'عرض المزيد', toggle_less: 'إخفاء',
    discount: ' خصم', description: 'وصف:', region: 'المنطقة',
    Found_Items: 'تم العثور على العناصر', No_Items_Found: 'لم يتم العثور على عناصر',
    Detail_Screen: 'شاشة التفاصيل', Show_More: 'عرض المزيد', Hide: 'إخفاء',
    Avaliable_Offer: 'العرض المتاح', Call_Now: 'اتصل الآن', Working_Hours: 'ساعات العمل',
    Redeem: 'استرداد', Open_Map: 'افتح الخريطة', Enter_Email: 'أدخل بريدك الإلكتروني',
    Create_account: 'إنشاء حساب', Register_yourself: 'سجّل نفسك',
    Join_Hala_to_Get_started: 'انضم إلى هلا للبدء',
    heading: 'مرحبًا بك في هلا بالسعودي!',
    description1: 'هلا بالسعودي هو منصة تربط الزوار السعوديين بالأعمال المحلية الموثوقة.',
    continue: 'استمرار',
    account: 'الحساب', blocked_accounts: 'الحسابات المحظورة', redeem_history: 'سجل الاسترداد',
    discount_history: 'سجل الخصومات', language: 'اللغة', email: 'البريد الإلكتروني',
    phone: 'الهاتف', age: 'العمر', gender: 'الجنس', edit: 'تعديل', save: 'حفظ',
    next: 'التالي', cancel: 'إلغاء', personal_details: 'البيانات الشخصية',
    Home: 'الرئيسية', Wishlist: 'قائمة الرغبات', Profile: 'الملف الشخصي', Close: 'إغلاق',
    Dont_have_an_account_Register: 'ليس لديك حساب؟ سجِّل الآن',
    become_a_Partner: 'كن شريكًا', No_Account_Found: 'لم يتم العثور على حساب',
    Please_create_your_account_first: 'يرجى إنشاء حسابك أولًا.',
    Create_Account: 'إنشاء حساب', Cancel: 'إلغاء',
    PIN_required: 'الرمز السري مطلوب. يرجى إدخال رمزك.',
    Pin_incorrect: 'الرمز غير صحيح. يرجى إدخال الرمز الصحيح.',
    Already_redeemed_today: 'لقد قمت بالفعل باسترداد خصم لهذه العلامة اليوم.',
    Enter_Pin: 'أدخل الرمز السري', Where_to_Get_Redeem_PIN: 'من أين أحصل على رمز الاسترداد؟',
    Submit: 'إرسال', km: 'كيلومتر', m: 'متر', Calculating: 'جارٍ الحساب...',
    Passport_Txt: 'جوازك الحصري لتوفير عالمي', Saudi_Visitor: 'زائر سعودي',
    Westwalk_Community: 'مجتمع ويست ووك', List_of_Branch: 'قائمة الفروع',
    open: 'مفتوح', closed: 'مغلق', get_a_discount_code: 'احصل على رمز الخصم',
    open_in_maps: 'افتح في الخرائط', your_discount_code_is: 'رمز الخصم الخاص بك هو',
    single_use_1: 'هذا رمز للاستخدام لمرة واحدة فقط.',
    single_use_2: 'احصل على رمز جديد في كل مرة تفتح فيها التطبيق.',
    get_a_new_code: 'احصل على رمز جديد', Search_for_anything: 'ابحث عن أي شيء تحتاجه',
    confirm: 'تأكيد', hello: 'مرحبا', delete_my_account_and_data: 'حذف حسابي وبياناتي',
    history: 'التاريخ', load_more: 'تحميل المزيد', you_got: 'لقد حصلت على',

    // Chat
    tap_to_open: 'اضغط لفتح القائمة / العرض', hala_community: 'مجتمع هلا',
    message: 'رسالة', chat: 'الدردشة', active_now: 'نشط الآن',
    long_press_delete: 'اضغط مطولاً للحذف', new_chat: 'محادثة جديدة',
    blocked_user: 'لقد قمت بحظر هذا المستخدم',
    cannot_reply: 'لا يمكنك الرد على هذه المحادثة',
    bio: 'نبذة', birthday: 'تاريخ الميلاد', actions: 'الإجراءات',
    send_message: 'إرسال رسالة', mute_notifications: 'كتم الإشعارات',
    silence_chat: 'كتم هذه المحادثة', shared_media: 'الوسائط المشتركة', photos: 'الصور',
    view_all_items: 'عرض جميع العناصر', privacy: 'الخصوصية', block_user: 'حظر المستخدم',
    block_user_desc: 'لن يتمكن من مراسلتك', add_new_friend: 'إضافة صديق جديد',
    search_members: 'البحث عن الأعضاء', saved_items: 'العناصر المحفوظة',
    saved_items_desc: 'العناصر التي تحفظها ستظهر هنا', manage: 'إدارة',
    show_last_seen: 'إظهار آخر ظهور', last_seen_desc: 'يمكن للآخرين رؤية آخر وقت نشاطك',
    online_status: 'حالة الاتصال', online_status_desc: 'يمكن للآخرين رؤية عندما تكون متصلاً',
    edit_profile: 'تعديل الملف الشخصي', change_photo: 'اضغط لتغيير الصورة',
    redemptions: 'الاستردادات', close: 'إغلاق',

    // Edit Profile
    enter_name: 'أدخل اسمك', bio_placeholder: 'أخبرنا شيئاً عن نفسك',
    select_birthday: 'اختر تاريخ ميلادك', nothing_to_update: 'لا يوجد شيء للتحديث',
    profile_updated: 'تم تحديث الملف الشخصي!',

    // ChatScreenHeader
    status_blocked: 'محظور', status_online: 'متصل الآن', status_last_seen: 'آخر ظهور',

    // ConversationHeader
    messages_title: 'الرسائل', search_messages: '...ابحث في الرسائل',

    // AttachmentSheet
    share_content: 'مشاركة المحتوى', choose_to_send: 'اختر ما تريد إرساله',
    camera: 'الكاميرا', camera_sub: 'التقط صورة أو فيديو',
    gallery: 'المعرض', gallery_sub: 'اختر من مكتبتك',
    document: 'مستند', document_sub: 'شارك ملف PDF أو ملفاً',

    // BlockUserModal
    block_title: 'حظر المستخدم', unblock_title: 'إلغاء الحظر',
    block_desc_text: 'سيؤدي حظر {{name}} إلى منعه من إرسال رسائل إليك. لن يتم إشعاره.',
    unblock_desc_text: 'سيتمكن {{name}} من إرسال الرسائل إليك مجدداً.',
    block_b1: 'لن يتمكن من مراسلتك', block_b2: 'لن ترى رسائله',
    block_b3: 'لن يعرف أنه محظور',
    unblock_b1: 'يمكنه مراسلتك مجدداً', unblock_b2: 'يمكنك مراسلته',
    unblock_b3: 'الرسائل السابقة تبقى', block_btn: 'حظر', unblock_btn: 'إلغاء الحظر',

    // DeleteMessageModal
    delete_message_title: 'حذف الرسالة؟', delete_undone: 'لا يمكن التراجع عن هذا الإجراء.',
    delete_for_everyone: 'حذف للجميع', delete_for_everyone_sub: 'سيُحذف من جميع الأجهزة',
    delete_for_me: 'حذف عني فقط', delete_for_me_sub: 'سيُحذف من جهازك فقط',

    // MuteModal
    mute_title: 'كتم الإشعارات', muted_title: 'الدردشة مكتومة',
    mute_sub: 'كتم إشعارات هذه الدردشة فقط',
    muted_sub: 'لن تتلقى إشعارات لهذه الدردشة',
    mute_for: 'كتم لـ', mute_8h: '٨ ساعات', mute_8h_sub: 'حتى وقت لاحق اليوم',
    mute_1w: 'أسبوع', mute_1w_sub: 'حتى الأسبوع القادم',
    mute_always: 'دائماً', mute_always_sub: 'حتى تلغي الكتم',
    mute_chat_btn: 'كتم الدردشة', unmute_btn: 'إلغاء كتم الإشعارات',
    tap_to_unmute: 'اضغط لإلغاء الكتم',
    years_old: 'سنة',

    // ChatScreen
    message_placeholder: '...رسالة', editing_message_label: 'تعديل الرسالة',
    reply_to_label: 'رداً على', deleted_message_text: 'تم حذف هذه الرسالة',
    action_reply: 'رد', action_edit: 'تعديل', action_copy: 'نسخ', action_delete: 'حذف',
    blocked_user_footer: 'لقد قمت بحظر هذا المستخدم.',

    // AllMediaScreen
    no_shared_media: 'لا توجد وسائط مشتركة', media_view: 'عرض', media_delete: 'حذف',
    photo_label: 'صورة', photos_label: 'صور', video_label: 'فيديو', videos_label: 'فيديوهات',

    // BlockedUsersScreen
    account_settings: 'إعدادات الحساب', blocked_users_title: 'المستخدمون المحظورون',
    blocked_label: 'محظور', unblock: 'إلغاء الحظر',
    no_blocked_users: 'لا يوجد مستخدمون محظورون',
    no_blocked_desc: 'قائمة الحظر فارغة. يمكن للجميع مراسلتك.',
    loading_text: 'جارٍ التحميل...', error_unblock: 'تعذّر إلغاء الحظر. يرجى المحاولة مجدداً.',
    unblock_confirm_msg: 'سيتمكن من مراسلتك مجدداً.',
    user_label: 'مستخدم', users_label: 'مستخدمون', blocked_count_label: 'محظور',

    // ConversationScreen
    you_prefix: 'أنت: ',
    no_conversations: 'لا توجد محادثات بعد',
    start_chatting: 'ابدأ الدردشة مع مجتمع هلا',
    find_friends: 'ابحث عن أصدقاء',

    // StartChatScreen
    online_label: 'متصل', offline_label: 'غير متصل',
    no_members_found: 'لا يوجد أعضاء', try_different_search: 'جرب كلمة بحث أخرى',
    finding_people: 'جارٍ البحث عن الأشخاص...',
    member_label: 'عضو', members_label: 'أعضاء',
    online_dot_label: '● متصل', offline_dot_label: '● غير متصل',

      // RedeemHistory
      loading_history: 'جارٍ تحميل السجل...',
      no_redeem_history: 'لا يوجد سجل استرداد',
      no_redeem_desc: 'لم تقم باسترداد أي رموز بعد. ابدأ باستعراض العروض!',
      redemption_label: 'استرداد',
      redemptions_label_pl: 'استردادات',

      // Timeline
      Timeline: 'الجدول الزمني',

      //Map
      Map: 'رسم خريطة',

  },
};

interface LanguageState { language: 'en' | 'ar'; }
const initialState: LanguageState = { language: 'en' };

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    switchLanguage: (state, action) => { state.language = action.payload; },
  },
});

export const {switchLanguage} = languageSlice.actions;
export default languageSlice.reducer;
export {languageData};




// // redux_toolkit/slices/languageSlice.ts
// import {createSlice} from '@reduxjs/toolkit';

// // Language data for both English and Arabic
// const languageData = {
//   en: {
//     // login Screen
//     welcome_back: 'Welcome Back!',
//     sign_in_message: 'Sign in with your account',
//     full_name: 'Full name',
//     phone_number: 'phone number',
//     login: 'login',
//     logout: 'Logout',
//     country: 'country',
//     agree_to: 'I agree to the ',
//     privacy_policy: 'privacy policy and term of condition',
//     terms_of_use: 'Terms of Use',
//     and: 'and',
//     //  otp Screeb
//     enter_otp: 'Enter the OTP sent to your WhatsApp number',
//     verify_otp: 'Verify OTP',
//     incorrect_otp: 'The OTP passcode you’ve entered is incorrect',
//     no_code_received: 'I haven’t received a code',
//     resend_code: 'Resend code',
//     resend_in: 'Resend code in',
//     seconds_short: 's',
//     // home Screen
//     categories: 'Categories',
//     Location: 'Location',
//     best_sellers: 'Best Sellers',
//     recently_added: 'Recently Added',
//     toggle_more: 'Show More',
//     toggle_less: 'Hide',
//     discount: ' Discount',
//     description: 'Description',
//     region: 'region',
//     Found_Items: 'Items Found',
//     No_Items_Found: 'No Item Found ',
//     Detail_Screen: 'Detail Screen',
//     Show_More: 'Show More ',
//     Hide: 'Hide',
//     Avaliable_Offer: 'Avaliable Offer',
//     Call_Now: 'Call Now',
//     Working_Hours: 'Working Hours',
//     Redeem: 'Redeem',
//     Open_Map: 'Open Map',
//     Enter_Email: 'Enter your email',
//     Create_account: 'Create account',
//     Register_yourself: 'Register yourself',
//     Join_Hala_to_Get_started: 'Join Hala to get started',
//     // Merchant Side
//     heading: 'Welcome to Hala B Saudi!',
//     description1:
//       'Hala B Saudi is a platform that connects Saudi visitors with trusted local businesses.' +
//       'Join us as a partner and expand your reach with exclusive benefits!' +
//       'Whether you own a restaurant, spa, salon, or retail store — we help promote your business to the right audience.' +
//       'Get featured, receive marketing support, and track your customer engagement in real time.',
//     continue: 'Continue',
//     //Account
//     account: 'Account',
//     blocked_accounts: 'Blocked Accounts',
//     redeem_history: 'Redeem History',
//     discount_history: 'Discount history', // keep if used anywhere; maps same idea
//     language: 'Language',
//     email: 'Email',
//     phone: 'Phone',
//     age: 'Age',
//     gender: 'Gender',
//     edit: 'Edit',
//     save: 'Save',
//     next: 'next',
//     cancel: 'Cancel', // <-- added
//     personal_details: 'Personal details',
//     Home: 'Home',
//     Wishlist: 'Wishlist',
//     Profile: 'Profile',
//     Close: 'Close',
//     Dont_have_an_account_Register: 'Don’t have an account? Register',
//     become_a_Partner: 'Become a Partner',
//     No_Account_Found: 'No Account Found',
//     Please_create_your_account_first: 'Please create your account first.',
//     Create_Account: 'Create Account',
//     Cancel: 'Cancel',
//     PIN_required: 'PIN required. Please enter your PIN.',
//     Pin_incorrect: 'Pin is incorrect. Please enter the correct pin.',
//     Already_redeemed_today:
//       'You have already redeemed a discount for this brand today.',
//     Enter_Pin: 'Enter Pin',
//     Where_to_Get_Redeem_PIN: 'Where to Get Redeem PIN?',
//     Submit: 'Submit',
//     km: 'Km away',
//     m: 'm away',
//     Calculating: 'Calculating...',
//     Passport_Txt: 'Your Exculsive Passport to Global Savings !',
//     Saudi_Visitor: 'Saudi Visitor',
//     Westwalk_Community: 'Westwalk Community',
//     List_of_Branch: 'List of Branches',
//     open: 'open',
//     closed: 'closed',
//     get_a_discount_code: 'Get a discount code',
//     open_in_maps: 'Open in maps',
//     your_discount_code_is: 'Your discount code is',
//     single_use_1: 'This is a single-use code for your use only.',
//     single_use_2: 'Get a new code each time you open the app.',
//     get_a_new_code: 'Get a new code',
//     Search_for_anything: 'Search for anything you need',
//     confirm: 'Confirm',
//     hello: 'Hello',
//     delete_my_account_and_data: 'Delete my account and data',
//     history: 'History',
//     load_more: 'Load more',
//     you_got: 'You got',
//     // Chat / Conversation / Profile / Settings
//     tap_to_open: 'Tap to open menu / offer',
//     hala_community: 'HALA COMMUNITY',
//     message: 'Message',
//     chat: 'Chat',
//     active_now: 'Active Now',
//     long_press_delete: 'Long Press to delete',
//     new_chat: 'New chat',
//     blocked_user: 'You blocked this user',
//     cannot_reply: 'You cannot reply to this conversation',
//     bio: 'BIO',
//     birthday: 'Birthday',
//     actions: 'Actions',
//     send_message: 'Send Message',
//     mute_notifications: 'Mute Notifications',
//     silence_chat: 'Silence this chat',
//     shared_media: 'Shared Media',
//     photos: 'Photos',
//     view_all_items: 'View all items',
//     privacy: 'Privacy',
//     block_user: 'Block User',
//     block_user_desc: "They won't be able to message you",
//     add_new_friend: 'Add new Friend',
//     search_members: 'Search members',
//     saved_items: 'Saved items',
//     saved_items_desc: 'Items you save will appear here',
//     manage: 'Manage',
//     show_last_seen: 'Show Last Seen',
//     last_seen_desc: 'Others can see your last active time',
//     online_status: 'Online Status',
//     online_status_desc: "Others can see when you're online",
//     edit_profile: 'Edit Profile',
//     change_photo: 'Tap to change photo',
//     redemptions: 'Redemptions',
//     close: 'Close',

//     // Edit Profile
//     enter_name: 'Enter your name',
//     bio_placeholder: 'Tell something about yourself',
//     select_birthday: 'Select your birthday',
//     nothing_to_update: 'Nothing to update',
//     profile_updated: 'Profile updated!',


//     // ── ChatScreenHeader ─────────────────────────────────────────────
//     status_blocked: 'Blocked',
//     status_online: 'Online',
//     status_last_seen: 'Last seen',
 
//     // ── ConversationHeader ───────────────────────────────────────────
//     messages_title: 'Messages',
//     search_messages: 'Search messages…',
 
//     // ── AttachmentSheet ──────────────────────────────────────────────
//     share_content: 'Share Content',
//     choose_to_send: 'Choose what you want to send',
//     camera: 'Camera',
//     camera_sub: 'Take a photo or video',
//     gallery: 'Gallery',
//     gallery_sub: 'Choose from your library',
//     document: 'Document',
//     document_sub: 'Share a PDF or file',
 
//     // ── BlockUserModal ───────────────────────────────────────────────
//     block_title: 'Block User',
//     unblock_title: 'Unblock User',
//     block_desc_text: "Blocking {{name}} will prevent them from sending you messages. They won't be notified.",
//     unblock_desc_text: '{{name}} will be able to send you messages again.',
//     block_b1: 'They cannot message you',
//     block_b2: "You won't see their messages",
//     block_b3: "They won't know they're blocked",
//     unblock_b1: 'They can message you again',
//     unblock_b2: 'You can message them',
//     unblock_b3: 'Previous messages stay',
//     block_btn: 'Block',
//     unblock_btn: 'Unblock',
 
//     // ── DeleteMessageModal ───────────────────────────────────────────
//     delete_message_title: 'Delete Message?',
//     delete_undone: 'This action cannot be undone.',
//     delete_for_everyone: 'Delete for Everyone',
//     delete_for_everyone_sub: 'Removed from all devices',
//     delete_for_me: 'Delete for Me',
//     delete_for_me_sub: 'Only removed on your device',
 
//     // ── MuteModal ────────────────────────────────────────────────────
//     mute_title: 'Mute Notifications',
//     muted_title: 'Chat Muted',
//     mute_sub: 'Silence notifications for this chat only',
//     muted_sub: "You won't receive notifications for this chat",
//     mute_for: 'Mute for',
//     mute_8h: '8 Hours',
//     mute_8h_sub: 'Until later today',
//     mute_1w: '1 Week',
//     mute_1w_sub: 'Until next week',
//     mute_always: 'Always',
//     mute_always_sub: 'Until you unmute',
//     mute_chat_btn: 'Mute Chat',
//     unmute_btn: 'Unmute Notifications',


//     // ChatScreen
//     message_placeholder: 'Message…', editing_message_label: 'Editing message',
//     reply_to_label: 'Reply to', deleted_message_text: 'This message was deleted',
//     action_reply: 'Reply', action_edit: 'Edit', action_copy: 'Copy', action_delete: 'Delete',
//     blocked_user_footer: 'You blocked this user.',
 
//     // AllMediaScreen
//     no_shared_media: 'No shared media', media_view: 'View', media_delete: 'Delete',
//     photo_label: 'photo', photos_label: 'photos', video_label: 'video', videos_label: 'videos',
 
//     // BlockedUsersScreen
//     account_settings: 'Account Settings', blocked_users_title: 'Blocked Users',
//     blocked_label: 'Blocked', unblock: 'Unblock',
//     no_blocked_users: 'No blocked users',
//     no_blocked_desc: 'Your blocked list is empty. Everyone can message you.',
//     loading_text: 'Loading…', error_unblock: 'Could not unblock. Please try again.',
//     unblock_confirm_msg: 'will be able to message you again.',
//     user_label: 'user', users_label: 'users', blocked_count_label: 'blocked',
 
//     // StartChatScreen
//     online_label: 'Online', offline_label: 'Offline',
//     no_members_found: 'No members found', try_different_search: 'Try a different search term',
//     finding_people: 'Finding people for you…',
//     member_label: 'member', members_label: 'members',
//     online_dot_label: '● Online', offline_dot_label: '● Offline',

    
//   },
//   ar: {
//     login: 'تسجيل الدخول',
//     logout: 'تسجيل الخروج',
//     phone_number: 'رقم الهاتف',
//     agree_to: 'أوافق على ',
//     privacy_policy: 'سياسة الخصوصية',
//     terms_of_use: 'شروط الاستخدام',
//     and: ' و ',
//     welcome_back: 'مرحبًا بعودتك!',
//     sign_in_message: 'سجّل الدخول إلى حسابك',
//     enter_otp: 'أدخل رمز التحقق المرسل إلى رقم WhatsApp الخاص بك.',
//     incorrect_otp: 'رمز OTP الذي أدخلته غير صحيح',
//     no_code_received: 'لم أستلم الرمز',
//     resend_code: 'إعادة إرسال الرمز',
//     resend_in: 'إعادة الإرسال خلال',
//     seconds_short: 'ث',
//     verify_otp: 'تحقق من OTP',
//     categories: 'التصنيفات',
//     Location: ' الموقع',
//     Show_More: 'عرض المزيد',
//     Hide: 'إخفاء',
//     Avaliable_Offer: 'العرض المتاح',
//     Call_Now: 'اتصل الآن',
//     Working_Hours: 'ساعات العمل',
//     Redeem: 'استرداد',
//     Open_Map: 'افتح الخريطة',
//     Enter_Email: 'أدخل بريدك الإلكتروني',
//     Create_account: 'إنشاء حساب',
//     Join_Hala_to_Get_started: 'انضم إلى هلا للبدء',
//     Register_yourself: 'سجّل نفسك',
//     become_a_Partner: 'كن شريكًا',
//     No_Account_Found: 'لم يتم العثور على حساب',
//     Please_create_your_account_first: 'يرجى إنشاء حسابك أولًا.',
//     Create_Account: 'إنشاء حساب',
//     Cancel: 'إلغاء',
//     //Account Screen
//     account: 'الحساب',
//     redeem_history: 'سجل الاسترداد',
//     discount_history: 'سجل الخصومات', // same meaning as redeem history
//     language: 'اللغة',
//     full_name: 'الاسم الكامل',
//     email: 'البريد الإلكتروني',
//     phone: 'الهاتف',
//     age: 'العمر',
//     gender: 'الجنس',
//     edit: 'تعديل',
//     save: 'حفظ',
//     cancel: 'إلغاء', // <-- added
//     personal_details: 'البيانات الشخصية', // <-- added
//     Home: 'الرئيسية',
//     Wishlist: 'قائمة الرغبات',
//     Profile: 'الملف الشخصي',
//     Close: 'إغلاق',
//     PIN_required: 'الرمز السري مطلوب. يرجى إدخال رمزك.',
//     Pin_incorrect: 'الرمز غير صحيح. يرجى إدخال الرمز الصحيح.',
//     Already_redeemed_today: 'لقد قمت بالفعل باسترداد خصم لهذه العلامة اليوم.',
//     Enter_Pin: 'أدخل الرمز السري',
//     Where_to_Get_Redeem_PIN: 'من أين أحصل على رمز الاسترداد؟',
//     Submit: 'إرسال',
//     best_sellers: 'الأكثر مبيعًا',
//     recently_added: 'المضافة حديثًا',
//     toggle_more: 'عرض المزيد',
//     toggle_less: 'إخفاء',
//     discount: ' خصم  ',
//     description: 'وصف:',
//     country: 'الدولة',
//     region: 'المنطقة',
//     next: 'التالي',
//     Search_for_anything: 'ابحث عن أي شيء تحتاجه',
//     Found_Items: 'تم العثور على العناص',
//     No_Items_Found: 'لم يتم العثور على عناصر',
//     Detail_Screen: 'شاشة التفاصيل',
//     // merchant side
//     heading: 'مرحبًا بك في هلا بالسعودي!',
//     description1:
//       'هلا بالسعودي هو منصة تربط الزوار السعوديين بالأعمال المحلية الموثوقة.' +
//       'انضم إلينا كشريك ووسّع نطاق عملك مع مزايا حصرية!' +
//       'سواء كنت تمتلك مطعمًا، سبا، صالونًا، أو متجرًا — نحن نساعدك على الترويج لعملك أمام الجمهور المناسب.' +
//       'احصل على ظهور مميز، دعم تسويقي، وتتبع تفاعل العملاء في الوقت الفعلي.',
//     continue: 'استمرار',
//     Dont_have_an_account_Register: ' ليس لديك حساب؟ سجِّل الآن',
//     km: 'كمكم كيلومتر بعيد',
//     m: 'كمكم متر بعيد',
//     Calculating: 'جارٍ الحساب',
//     Passport_Txt: 'جوازك الحصري لتوفير عالمي',
//     Saudi_Visitor: 'زائر سعودي',
//     Westwalk_Community: 'مجتمع ويست ووك',
//     List_of_Branch: 'قائمة الفروع',

//     your_phone_number: 'رقم هاتفك',
//     code_is_sent: 'تم إرسال الكود.',
//     still_didnt_get_the_code_message:
//       'إذا لم يصلك الكود، يرجى التأكد من إدخال رقم هاتفك بشكل صحيح.',
//     fill_the_code: 'أدخل الكود',
//     didnt_get_the_code: 'لم يصلك الكود؟',

//     open: 'مفتوح',
//     closed: 'مغلق',
//     get_a_discount_code: 'احصل على رمز الخصم',
//     open_in_maps: 'افتح في الخرائط',
//     your_discount_code_is: 'رمز الخصم الخاص بك هو',
//     single_use_1: 'هذا رمز للاستخدام لمرة واحدة فقط.',
//     single_use_2: 'احصل على رمز جديد في كل مرة تفتح فيها التطبيق.',
//     get_a_new_code: 'احصل على رمز جديد',
//     your_full_name: 'اسمك الكامل',

//     confirm: 'تأكيد',
//     hello: 'مرحبا',
//     delete_my_account_and_data: 'حذف حسابي وبياناتي',
//     history: 'التاريخ',
//     load_more: 'تحميل المزيد',
//     you_got: 'لقد حصلت على',

//     //
//     chat: 'الدردشة',
//     blocked_accounts: 'الحسابات المحظورة',

//     // Chat / Conversation / Profile / Settings
//     tap_to_open: 'اضغط لفتح القائمة / العرض',
//     hala_community: 'مجتمع هلا',
//     message: 'رسالة',
//     active_now: 'نشط الآن',
//     long_press_delete: 'اضغط مطولاً للحذف',
//     new_chat: 'محادثة جديدة',
//     blocked_user: 'لقد قمت بحظر هذا المستخدم',
//     cannot_reply: 'لا يمكنك الرد على هذه المحادثة',
//     bio: 'نبذة',
//     birthday: 'تاريخ الميلاد',
//     actions: 'الإجراءات',
//     send_message: 'إرسال رسالة',
//     mute_notifications: 'كتم الإشعارات',
//     silence_chat: 'كتم هذه المحادثة',
//     shared_media: 'الوسائط المشتركة',
//     photos: 'الصور',
//     view_all_items: 'عرض جميع العناصر',
//     privacy: 'الخصوصية',
//     block_user: 'حظر المستخدم',
//     block_user_desc: 'لن يتمكن من مراسلتك',
//     add_new_friend: 'إضافة صديق جديد',
//     search_members: 'البحث عن الأعضاء',
//     saved_items: 'العناصر المحفوظة',
//     saved_items_desc: 'العناصر التي تحفظها ستظهر هنا',
//     manage: 'إدارة',
//     show_last_seen: 'إظهار آخر ظهور',
//     last_seen_desc: 'يمكن للآخرين رؤية آخر وقت نشاطك',
//     online_status: 'حالة الاتصال',
//     online_status_desc: 'يمكن للآخرين رؤية عندما تكون متصلاً',
//     edit_profile: 'تعديل الملف الشخصي',
//     change_photo: 'اضغط لتغيير الصورة',
//     redemptions: 'الاستردادات',
//     close: 'إغلاق',

//     // Edit Profile
//     enter_name: 'أدخل اسمك',
//     bio_placeholder: 'أخبرنا شيئاً عن نفسك',
//     select_birthday: 'اختر تاريخ ميلادك',
//     nothing_to_update: 'لا يوجد شيء للتحديث',
//     profile_updated: '!تم تحديث الملف الشخصي',

//    //  ── ChatScreenHeader ─────────────────────────────────────────────
//     status_blocked: 'محظور',
//     status_online: 'متصل الآن',
//     status_last_seen: 'آخر ظهور',
 
//     // ── ConversationHeader ───────────────────────────────────────────
//     messages_title: 'الرسائل',
//     search_messages: '...ابحث في الرسائل',
 
//     // ── AttachmentSheet ──────────────────────────────────────────────
//     share_content: 'مشاركة المحتوى',
//     choose_to_send: 'اختر ما تريد إرساله',
//     camera: 'الكاميرا',
//     camera_sub: 'التقط صورة أو فيديو',
//     gallery: 'المعرض',
//     gallery_sub: 'اختر من مكتبتك',
//     document: 'مستند',
//     document_sub: 'شارك ملف PDF أو ملفاً',
 
//     // ── BlockUserModal ───────────────────────────────────────────────
//     block_title: 'حظر المستخدم',
//     unblock_title: 'إلغاء الحظر',
//     block_desc_text: 'سيؤدي حظر {{name}} إلى منعه من إرسال رسائل إليك. لن يتم إشعاره.',
//     unblock_desc_text: 'سيتمكن {{name}} من إرسال الرسائل إليك مجدداً.',
//     block_b1: 'لن يتمكن من مراسلتك',
//     block_b2: 'لن ترى رسائله',
//     block_b3: 'لن يعرف أنه محظور',
//     unblock_b1: 'يمكنه مراسلتك مجدداً',
//     unblock_b2: 'يمكنك مراسلته',
//     unblock_b3: 'الرسائل السابقة تبقى',
//     block_btn: 'حظر',
//     unblock_btn: 'إلغاء الحظر',
 
//     // ── DeleteMessageModal ───────────────────────────────────────────
//     delete_message_title: 'حذف الرسالة؟',
//     delete_undone: 'لا يمكن التراجع عن هذا الإجراء.',
//     delete_for_everyone: 'حذف للجميع',
//     delete_for_everyone_sub: 'سيُحذف من جميع الأجهزة',
//     delete_for_me: 'حذف عني فقط',
//     delete_for_me_sub: 'سيُحذف من جهازك فقط',
 
//     // ── MuteModal ────────────────────────────────────────────────────
//     mute_title: 'كتم الإشعارات',
//     muted_title: 'الدردشة مكتومة',
//     mute_sub: 'كتم إشعارات هذه الدردشة فقط',
//     muted_sub: 'لن تتلقى إشعارات لهذه الدردشة',
//     mute_for: 'كتم لـ',
//     mute_8h: '٨ ساعات',
//     mute_8h_sub: 'حتى وقت لاحق اليوم',
//     mute_1w: 'أسبوع',
//     mute_1w_sub: 'حتى الأسبوع القادم',
//     mute_always: 'دائماً',
//     mute_always_sub: 'حتى تلغي الكتم',
//     mute_chat_btn: 'كتم الدردشة',
//     unmute_btn: 'إلغاء كتم الإشعارات',

//     // ChatScreen
//     message_placeholder: '...رسالة', editing_message_label: 'تعديل الرسالة',
//     reply_to_label: 'رداً على', deleted_message_text: 'تم حذف هذه الرسالة',
//     action_reply: 'رد', action_edit: 'تعديل', action_copy: 'نسخ', action_delete: 'حذف',
//     blocked_user_footer: 'لقد قمت بحظر هذا المستخدم.',
 
//     // AllMediaScreen
//     no_shared_media: 'لا توجد وسائط مشتركة', media_view: 'عرض', media_delete: 'حذف',
//     photo_label: 'صورة', photos_label: 'صور', video_label: 'فيديو', videos_label: 'فيديوهات',
 
//     // BlockedUsersScreen
//     account_settings: 'إعدادات الحساب', blocked_users_title: 'المستخدمون المحظورون',
//     blocked_label: 'محظور', unblock: 'إلغاء الحظر',
//     no_blocked_users: 'لا يوجد مستخدمون محظورون',
//     no_blocked_desc: 'قائمة الحظر فارغة. يمكن للجميع مراسلتك.',
//     loading_text: 'جارٍ التحميل...', error_unblock: 'تعذّر إلغاء الحظر. يرجى المحاولة مجدداً.',
//     unblock_confirm_msg: 'سيتمكن من مراسلتك مجدداً.',
//     user_label: 'مستخدم', users_label: 'مستخدمون', blocked_count_label: 'محظور',
 
//     // StartChatScreen
//     online_label: 'متصل', offline_label: 'غير متصل',
//     no_members_found: 'لا يوجد أعضاء', try_different_search: 'جرب كلمة بحث أخرى',
//     finding_people: 'جارٍ البحث عن الأشخاص...',
//     member_label: 'عضو', members_label: 'أعضاء',
//     online_dot_label: '● متصل', offline_dot_label: '● غير متصل',



//   },
// };

// interface LanguageState {
//   language: 'en' | 'ar'; // Either English or Arabic
// }

// const initialState: LanguageState = {
//   language: 'en', // Default language is English
// };

// const languageSlice = createSlice({
//   name: 'language',
//   initialState,
//   reducers: {
//     switchLanguage: (state, action) => {
//       state.language = action.payload;
//     },
//   },
// });

// export const {switchLanguage} = languageSlice.actions;
// export default languageSlice.reducer;
// export {languageData};
