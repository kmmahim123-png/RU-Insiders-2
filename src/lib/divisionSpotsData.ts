export interface DivisionSpotItem {
  id: string;
  districtId: string;
  rankNo: string;
  nameBn: string;
  locationBn: string;
  summaryBn: string;
  imageUrl: string;
}

export const DIVISION_DISTRICT_META: {
  id: string;
  rankBn: string;
  nameBn: string;
}[] = [
  { id: 'rajshahi', rankBn: '০১', nameBn: 'রাজশাহী জেলা' },
  { id: 'sirajganj', rankBn: '০২', nameBn: 'সিরাজগঞ্জ জেলা' },
  { id: 'pabna', rankBn: '০৩', nameBn: 'পাবনা জেলা' },
  { id: 'bogura', rankBn: '০৪', nameBn: 'বগুড়া জেলা' },
  { id: 'natore', rankBn: '০৫', nameBn: 'নাটোর জেলা' },
  { id: 'joypurhat', rankBn: '০৬', nameBn: 'জয়পুরহাট জেলা' },
  { id: 'chapainawabganj', rankBn: '০৭', nameBn: 'চাঁপাইনবাবগঞ্জ জেলা' },
  { id: 'naogaon', rankBn: '০৮', nameBn: 'নওগাঁ জেলা' },
];

export const DIVISION_SPOTS: DivisionSpotItem[] = [
  // ০১. রাজশাহী জেলা
  {
    id: 'div_raj_zoo',
    districtId: 'rajshahi',
    rankNo: '০১',
    nameBn: 'রাজশাহী কেন্দ্রীয় বোটানিক্যাল গার্ডেন ও চিড়িয়াখানা',
    locationBn: 'রাজপাড়া ও কোর্ট এলাকা, রাজশাহী মহানগর',
    summaryBn: 'পদ্মা নদীর তীরে অবস্থিত শহীদ এ.এইচ.এম কামারুজ্জামান কেন্দ্রীয় উদ্যান ও চিড়িয়াখানা। বিশাল কৃত্রিম লেক ও দুর্লভ বৃক্ষরাজি।',
    imageUrl: '/campus/paris-road-rain.jpg',
  },
  {
    id: 'div_raj_padma',
    districtId: 'rajshahi',
    rankNo: '০২',
    nameBn: 'পদ্মার পাড় (টি-বাঁধ, লালনশাহ মুক্তমঞ্চ ও বড়কুঠি রিভারভিউ)',
    locationBn: 'জিরো পয়েন্ট থেকে কোর্ট সড়ক বরাবর পদ্মা তীর',
    summaryBn: 'রাজশাহীর প্রাণকেন্দ্রে পদ্মা নদীর তীরবর্তী টি-বাঁধ, আই-বাঁধ, লালনশাহ মঞ্চ এবং বড়কুঠি সংলগ্ন মনোরম রিভারভিউ ওয়াকওয়ে।',
    imageUrl: '/campus/ru-spot.jpg',
  },
  {
    id: 'div_raj_varendra',
    districtId: 'rajshahi',
    rankNo: '০৩',
    nameBn: 'বরেন্দ্র গবেষণা জাদুঘর ও পুঠিয়া রাজবাড়ি',
    locationBn: 'সাহেব বাজার ও পুঠিয়া, রাজশাহী',
    summaryBn: 'বাংলাদেশের প্রাচীনতম জাদুঘর এবং পুঠিয়ার ঐতিহাসিক পাঁচআনি ও বড় আহ্নিক মন্দির কমপ্লেক্স।',
    imageUrl: '/campus/ru-admin.jpg',
  },

  // ০২. সিরাজগঞ্জ জেলা
  {
    id: 'div_sir_bridge',
    districtId: 'sirajganj',
    rankNo: '০১',
    nameBn: 'যমুনা সেতু ও ইকোপার্ক এবং চায়না বাঁধ',
    locationBn: 'সিরাজগঞ্জ সদর ও যমুনা তীর',
    summaryBn: 'যমুনা নদীর ওপর নির্মিত দীর্ঘ সেতু, ইকোপার্ক এবং সিরাজগঞ্জ হার্ড পয়েন্ট ও চায়না বাঁধ।',
    imageUrl: '/campus/ru-gate.jpg',
  },
  {
    id: 'div_sir_rabindra',
    districtId: 'sirajganj',
    rankNo: '০২',
    nameBn: 'শাহজাদপুর রবীন্দ্র কাছারি বাড়ি ও নবরত্ন মন্দির',
    locationBn: 'শাহজাদপুর ও উল্লাপাড়া, সিরাজগঞ্জ',
    summaryBn: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের স্মৃতিবিজড়িত ঐতিহাসিক কাছারি বাড়ি ও হাটিকুমরুল নবরত্ন মন্দির।',
    imageUrl: '/campus/ru-roundabout.jpg',
  },

  // ০৩. পাবনা জেলা
  {
    id: 'div_pab_hardinge',
    districtId: 'pabna',
    rankNo: '০১',
    nameBn: 'হার্ডিঞ্জ ব্রিজ, লালন শাহ সেতু ও রূপপুর চত্বর',
    locationBn: 'পাকশী, ঈশ্বরদী, পাবনা',
    summaryBn: 'পদ্মা নদীর ওপর শতবর্ষী ঐতিহাসিক লোহার রেলসেতু হার্ডিঞ্জ ব্রিজ ও পাকশী রিসোর্ট এলাকা।',
    imageUrl: '/campus/ru-gate.jpg',
  },
  {
    id: 'div_pab_tarash',
    districtId: 'pabna',
    rankNo: '০২',
    nameBn: 'তাড়াশ ভবন, জোড় বাংলা মন্দির ও সুচিত্রা সেন স্মৃতি সংগ্রহশালা',
    locationBn: 'পাবনা সদর',
    summaryBn: 'পাবনা শহরের ঐতিহাসিক জমিদার স্থাপত্য তাড়াশ ভবন ও মধ্যযুগীয় টেরাকোটা সমৃদ্ধ জোড় বাংলা মন্দির।',
    imageUrl: '/campus/ru-admin.jpg',
  },

  // ০৪. বগুড়া জেলা
  {
    id: 'div_bog_mahasthangarh',
    districtId: 'bogura',
    rankNo: '০১',
    nameBn: 'মহাস্থানগড় দুর্গনগরী, গোবিন্দ ভিটা ও বেহুলার বাসরঘর',
    locationBn: 'শিবগঞ্জ, বগুড়া',
    summaryBn: 'আড়াই হাজার বছরের প্রাচীন পুণ্ড্রনগর সভ্যতার রাজধানী মহাস্থানগড় ও প্রত্নতাত্ত্বিক জাদুঘর।',
    imageUrl: '/campus/ru-roundabout.jpg',
  },
  {
    id: 'div_bog_palace',
    districtId: 'bogura',
    rankNo: '০২',
    nameBn: 'নবাব প্যালেস (নীলকুঠি) ও খেরুয়া মসজিদ',
    locationBn: 'বগুড়া সদর ও শেরপুর',
    summaryBn: 'বগুড়ার ঐতিহ্যবাহী নবাব মোহাম্মদ আলীর প্রাসাদ ও মুঘল আমলের খেরুয়া মসজিদ।',
    imageUrl: '/campus/ru-spot.jpg',
  },

  // ০৫. নাটোর জেলা
  {
    id: 'div_nat_uttara',
    districtId: 'natore',
    rankNo: '০১',
    nameBn: 'উত্তরা গণভবন (দিঘাপতিয়া রাজবাড়ি) ও রানী ভবানী রাজবাড়ি',
    locationBn: 'নাটোর সদর',
    summaryBn: 'চারদিকে পরিখা ঘেরা সুদৃশ্য দিঘাপতিয়া রাজবাড়ি এবং অর্ধবঙ্গেশ্বরী রানী ভবানীর ঐতিহাসিক প্রাসাদ।',
    imageUrl: '/campus/ru-admin.jpg',
  },
  {
    id: 'div_nat_chalanbeel',
    districtId: 'natore',
    rankNo: '০২',
    nameBn: 'চলনবিল, হালতি বিল (পাটুল মিনি কক্সবাজার)',
    locationBn: 'সিংড়া ও নলডাঙ্গা, নাটোর',
    summaryBn: 'বর্ষায় দিগন্তজোড়া জলরাশি, ডুবন্ত সড়ক ও নৌকা ভ্রমণের অপূর্ব প্রাকৃতিক সৌন্দর্য।',
    imageUrl: '/campus/paris-road-rain.jpg',
  },

  // ০৬. জয়পুরহাট জেলা
  {
    id: 'div_joy_lockma',
    districtId: 'joypurhat',
    rankNo: '০১',
    nameBn: 'লকমা রাজবাড়ি ও নন্দাইল দীঘি',
    locationBn: 'পাঁচবিবি ও কালাই, জয়পুরহাট',
    summaryBn: 'ভারত সীমান্ত সংলগ্ন প্রাচীন লকমা চৌধুরীর ঐতিহাসিক রাজবাড়ি ও বিশাল নন্দাইল দীঘি।',
    imageUrl: '/campus/ru-admin.jpg',
  },

  // ০৭. চাঁপাইনবাবগঞ্জ জেলা
  {
    id: 'div_cha_sonamasjid',
    districtId: 'chapainawabganj',
    rankNo: '০১',
    nameBn: 'ছোট সোনা মসজিদ, তোহাখানা ও দারাসবাড়ি মসজিদ',
    locationBn: 'শিবগঞ্জ, চাঁপাইনবাবগঞ্জ',
    summaryBn: 'সুলতানি আমলের স্থাপত্যকলার রত্ন ছোট সোনা মসজিদ এবং বীরশ্রেষ্ঠ ক্যাপ্টেন মহিউদ্দিন জাহাঙ্গীরের সমাধি।',
    imageUrl: '/campus/ru-roundabout.jpg',
  },
  {
    id: 'div_cha_babudying',
    districtId: 'chapainawabganj',
    rankNo: '০২',
    nameBn: 'বাবুডাইং প্রকৃতি উদ্যান ও মহানন্দা রিভারভিউ',
    locationBn: 'ঝিলিম ও সদর, চাঁপাইনবাবগঞ্জ',
    summaryBn: 'সবুজ টিলা, ঝর্ণাধারা ও আমবাগান ঘেরা মনোরম পিকনিক স্পট বাবুডাইং।',
    imageUrl: '/campus/paris-road-rain.jpg',
  },

  // ০৮. নওগাঁ জেলা
  {
    id: 'div_nao_paharpur',
    districtId: 'naogaon',
    rankNo: '০১',
    nameBn: 'পাহাড়পুর বৌদ্ধ বিহার (সোমপুর মহাবিহার) ও কুসুম্বা মসজিদ',
    locationBn: 'বদলগাছী ও মান্দা, নওগাঁ',
    summaryBn: 'ইউনেস্কো বিশ্ব ঐতিহ্য পাহাড়পুর বৌদ্ধ বিহার এবং পাঁচ টাকার নোটে খচিত ঐতিহাসিক কুসুম্বা শাহী মসজিদ।',
    imageUrl: '/campus/ru-admin.jpg',
  },
  {
    id: 'div_nao_patisar',
    districtId: 'naogaon',
    rankNo: '০২',
    nameBn: 'পতিসর রবীন্দ্র কাছারি বাড়ি ও আলতাদীঘি জাতীয় উদ্যান',
    locationBn: 'আত্রাই ও ধামইরহাট, নওগাঁ',
    summaryBn: 'নাগর নদীর তীরে রবীন্দ্রনাথের পতিসর কাছারি বাড়ি এবং শালবন ঘেরা বিশাল আলতাদীঘি।',
    imageUrl: '/campus/paris-road-rain.jpg',
  },
];
