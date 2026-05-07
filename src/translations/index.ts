import type { Locale, Translations } from "@/types";

export const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ne", label: "नेपाली", flag: "🇳🇵" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

export const en: Translations = {
    nav: {
      Home: "Home", About: "About", Academics: "Academics",
      "Primary Level": "Primary Level", "Secondary Level": "Secondary Level",
      "Higher Secondary": "Higher Secondary", "Faculty & Staff": "Faculty & Staff",
      Admissions: "Admissions", Results: "Results", Gallery: "Gallery", News: "News", Contact: "Contact", Staff: "Staff",
      Careers: "Careers", Calendar: "Calendar",
    },
  hero: { motto: "Learning is Endless", enroll: "Enroll Now", learnMore: "Learn More" },
  pages: {
    home: { title: "Welcome", subtitle: "" },
    about: { title: "About Us", subtitle: "Learning is Endless" },
    academics: { title: "Academics", subtitle: "Nurturing Excellence from Foundation to Future" },
    admission: { title: "Online Admission", subtitle: "Begin your child's journey of excellence at Kathmandu English School." },
    admissions: { title: "Admissions", subtitle: "Begin your child's journey of excellence at KES" },
    contact: { title: "Contact Us", subtitle: "We'd love to hear from you" },
    gallery: { title: "School Gallery", subtitle: "A glimpse into our vibrant campus life" },
    news: { title: "News & Events", subtitle: "Stay informed about the latest happenings at KES." },
    results: { title: "Student Results", subtitle: "Enter your Symbol Number and Date of Birth to view your marksheet" },
    staff: { title: "Our Team", subtitle: "Meet the dedicated professionals behind KES" },
    careers: { title: "Career Portal", subtitle: "Join our team at Kathmandu English School" },
    calendar: { title: "School Calendar", subtitle: "Upcoming events, exams, and holidays throughout the year" },
  },
  sections: {
    NoticeBoard: "Notice Board", UpcomingEvents: "Upcoming Events", LatestNews: "Latest News",
    FeaturedStory: "Featured Story", SchoolGallery: "School Gallery", WhatPeopleSay: "What People Say",
    OurValues: "Our Core Values", OurTeam: "Our Team", RecentNews: "Recent News",
    Newsletter: "Newsletter", SubscribeCTA: "Subscribe to our newsletter.",
    ContactInfo: "Contact Information", SendMessage: "Send Us a Message",
    ResultPortal: "Student Result Portal", OnlineForm: "Online Admission Form",
  },
  common: {
    viewAll: "View All", allNewsEvents: "All News & Events", readMore: "Read More",
    readFullStory: "Read Full Story", subscribe: "Subscribe", submit: "Submit Application",
    sendMessage: "Send Message", viewResult: "View Result", printPDF: "Print / Download PDF",
    search: "Searching...", noResults: "No results found.",
  },
};

export const ne: Translations = {
  nav: {
    Home: "गृहपृष्ठ", About: "हाम्रो बारे", Academics: "शैक्षिक",
    "Primary Level": "प्राथमिक तह", "Secondary Level": "माध्यमिक तह",
    "Higher Secondary": "उच्च माध्यमिक", "Faculty & Staff": "शिक्षक र कर्मचारी",
      Admissions: "भर्ना", Results: "नतिजा", Gallery: "ग्यालरी", News: "समाचार", Contact: "सम्पर्क", Staff: "कर्मचारी",
      Careers: "करियर", Calendar: "क्यालेन्डर",
  },
  hero: { motto: "सिकाइ अनन्त छ", enroll: "भर्ना हुनुहोस्", learnMore: "थप जान्नुहोस्" },
  pages: {
    home: { title: "स्वागतम्", subtitle: "" },
    about: { title: "हाम्रो बारे", subtitle: "सिकाइ अनन्त छ" },
    academics: { title: "शैक्षिक", subtitle: "जगदेखि भविष्यसम्म उत्कृष्टताको पोषण" },
    admission: { title: "अनलाइन भर्ना", subtitle: "काठमाडौं इंग्लिस स्कूलमा तपाईंको बच्चाको उत्कृष्टताको यात्रा सुरु गर्नुहोस्।" },
    admissions: { title: "भर्ना", subtitle: "KES मा तपाईंको बच्चाको यात्रा सुरु गर्नुहोस्" },
    contact: { title: "सम्पर्क", subtitle: "हामी तपाईंबाट सुन्न चाहन्छौं" },
    gallery: { title: "ग्यालरी", subtitle: "हाम्रो जीवन्त क्याम्पस जीवनको झलक" },
    news: { title: "समाचार र कार्यक्रम", subtitle: "KES का नवीनतम घटनाहरू बारे जानकारी रहनुहोस्।" },
    results: { title: "विद्यार्थी नतिजा", subtitle: "आफ्नो अंकपत्र हेर्न प्रतीक नम्बर र जन्म मिति प्रविष्ट गर्नुहोस्" },
    staff: { title: "हाम्रो टोली", subtitle: "KES पछाडिका समर्पित पेशेवरहरूसँग भेट गर्नुहोस्" },
    careers: { title: "करियर पोर्टल", subtitle: "काठमाडौं इंग्लिस स्कूलमा हाम्रो टोलीमा सामेल हुनुहोस्" },
    calendar: { title: "स्कूल क्यालेन्डर", subtitle: "वर्षभरिका आगामी कार्यक्रम, परीक्षा र विदा" },
  },
  sections: {
    NoticeBoard: "सूचना पाटी", UpcomingEvents: "आगामी कार्यक्रम", LatestNews: "नवीनतम समाचार",
    FeaturedStory: "मुख्य समाचार", SchoolGallery: "स्कुल ग्यालरी", WhatPeopleSay: "मानिसहरू के भन्छन्",
    OurValues: "हाम्रा मूल मान्यता", OurTeam: "हाम्रो टोली", RecentNews: "हालैका समाचार",
    Newsletter: "न्यूजलेटर", SubscribeCTA: "हाम्रो न्यूजलेटरको सदस्यता लिनुहोस्।",
    ContactInfo: "सम्पर्क जानकारी", SendMessage: "हामीलाई सन्देश पठाउनुहोस्",
    ResultPortal: "विद्यार्थी नतिजा पोर्टल", OnlineForm: "अनलाइन भर्ना फारम",
  },
  common: {
    viewAll: "सबै हेर्नुहोस्", allNewsEvents: "सबै समाचार र कार्यक्रम", readMore: "थप पढ्नुहोस्",
    readFullStory: "पूरा समाचार पढ्नुहोस्", subscribe: "सदस्यता लिनुहोस्", submit: "आवेदन पेश गर्नुहोस्",
    sendMessage: "सन्देश पठाउनुहोस्", viewResult: "नतिजा हेर्नुहोस्", printPDF: "प्रिन्ट / PDF डाउनलोड",
    search: "खोज्दै...", noResults: "कुनै नतिजा फेला परेन।",
  },
};

export const ja: Translations = {
  nav: {
    Home: "ホーム", About: "学校概要", Academics: "教育課程",
    "Primary Level": "初等部", "Secondary Level": "中等部",
    "Higher Secondary": "高等部", "Faculty & Staff": "教職員",
      Admissions: "入学案内", Results: "成績", Gallery: "ギャラリー", News: "ニュース", Contact: "お問い合わせ", Staff: "教職員",
      Careers: "採用情報", Calendar: "カレンダー",
  },
  hero: { motto: "学びは終わりがない", enroll: "入学申込", learnMore: "詳細を見る" },
  pages: {
    home: { title: "ようこそ", subtitle: "" },
    about: { title: "学校概要", subtitle: "学びは終わりがない" },
    academics: { title: "教育課程", subtitle: "基礎から未来へ、卓越性を育む" },
    admission: { title: "オンライン入学", subtitle: "カトマンズ・イングリッシュ・スクールでお子様の卓越した旅を始めましょう。" },
    admissions: { title: "入学案内", subtitle: "KESでお子様の卓越した旅を始めましょう" },
    contact: { title: "お問い合わせ", subtitle: "ご連絡をお待ちしております" },
    gallery: { title: "ギャラリー", subtitle: "活気あふれるキャンパスライフの一端" },
    news: { title: "ニュース＆イベント", subtitle: "KESの最新情報をご覧ください。" },
    results: { title: "学生成績", subtitle: "受験番号と生年月日を入力して成績表を表示" },
    staff: { title: "教職員チーム", subtitle: "KESを支える献身的なプロフェッショナル" },
    careers: { title: "求人情報", subtitle: "カトマンズ・イングリッシュ・スクールで私たちのチームに参加しませんか" },
    calendar: { title: "学校カレンダー", subtitle: "年間のイベント、試験、休暇の予定" },
  },
  sections: {
    NoticeBoard: "掲示板", UpcomingEvents: "今後のイベント", LatestNews: "最新ニュース",
    FeaturedStory: "特集記事", SchoolGallery: "学校ギャラリー", WhatPeopleSay: "皆様の声",
    OurValues: "私たちの価値観", OurTeam: "教職員チーム", RecentNews: "最近のニュース",
    Newsletter: "ニュースレター", SubscribeCTA: "ニュースレターを購読して最新ニュースを受信しましょう。",
    ContactInfo: "連絡先情報", SendMessage: "メッセージを送る",
    ResultPortal: "成績ポータル", OnlineForm: "オンライン入学フォーム",
  },
  common: {
    viewAll: "すべて表示", allNewsEvents: "すべてのニュース＆イベント", readMore: "続きを読む",
    readFullStory: "全文を読む", subscribe: "購読する", submit: "申請を送信",
    sendMessage: "メッセージを送信", viewResult: "結果を見る", printPDF: "印刷 / PDF ダウンロード",
    search: "検索中...", noResults: "結果が見つかりません。",
  },
};

export const translations: Record<Locale, Translations> = { en, ne, ja };

export function t(key: string, locale: Locale): string {
  const dict = translations[locale];
  if (!dict) return key;

  return (
    dict.nav[key] ??
    dict.common[key] ??
    dict.sections[key] ??
    dict.hero[key as keyof typeof dict.hero] ??
    (dict.pages[key]?.title ?? key)
  );
}
