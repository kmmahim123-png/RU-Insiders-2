export interface RuPlaceSvgData {
  id: string;
  rankNo: string;
  nameBn: string;
  shortBn: string;
  nameEn: string;
  cat?: string;
  d: string;
  poly: string;
  bbox: { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number };
  center: { x: number; y: number };
  imageUrl: string;
  descriptionBn: string;
}

export const RU_CAMPUS_VIEWBOX = "0 0 1200 750";

export const RU_CAMPUS_PLACES: RuPlaceSvgData[] = [
  {
    "id": "agri_faculty",
    "rankNo": "০১",
    "nameBn": "কৃষি অনুষদ",
    "shortBn": "কৃষি অনুষদ",
    "nameEn": "Agriculture Faculty",
    "cat": "academic",
    "d": "M185,36L420,36L420,104L165,104Z",
    "poly": "185,36 420,36 420,104 165,104",
    "bbox": {
      "minX": 165,
      "minY": 36,
      "maxX": 420,
      "maxY": 104,
      "w": 255,
      "h": 68
    },
    "center": {
      "x": 295,
      "y": 72
    },
    "imageUrl": "/map-spots/ru_academic_hall.jpg",
    "descriptionBn": "রেললাইনের উত্তর পাশে বিস্তৃত রাবির কৃষি ও ভেটেরিনারি সায়েন্স অনুষদ অঞ্চল।"
  },
  {
    "id": "charukola_gate",
    "rankNo": "০২",
    "nameBn": "চারুকলা গেইট চত্বর",
    "shortBn": "চারুকলা গেইট",
    "nameEn": "Charukola Gate Zone",
    "cat": "landmarks",
    "d": "M434,20L478,20L478,104L434,104Z",
    "poly": "434,20 478,20 478,104 434,104",
    "bbox": {
      "minX": 434,
      "minY": 20,
      "maxX": 478,
      "maxY": 104,
      "w": 44,
      "h": 84
    },
    "center": {
      "x": 456,
      "y": 64
    },
    "imageUrl": "/map-spots/ru_fine_arts.jpg",
    "descriptionBn": "উত্তর ক্যাম্পাসের প্রধান প্রবেশদ্বার, রেলক্রসিং এবং চারুকলা সংযোগ সড়ক অঞ্চল।"
  },
  {
    "id": "fine_arts",
    "rankNo": "০৩",
    "nameBn": "চারুকলা অনুষদ (শিল্পাচার্য জয়নুল আবেদীন ভবন)",
    "shortBn": "চারুকলা অনুষদ",
    "nameEn": "Fine Arts (Charukola)",
    "cat": "academic",
    "d": "M492,32L645,48L625,104L492,104Z",
    "poly": "492,32 645,48 625,104 492,104",
    "bbox": {
      "minX": 492,
      "minY": 32,
      "maxX": 645,
      "maxY": 104,
      "w": 153,
      "h": 72
    },
    "center": {
      "x": 562,
      "y": 72
    },
    "imageUrl": "/map-spots/ru_fine_arts.jpg",
    "descriptionBn": "শিল্পাচার্য জয়নুল আবেদীন একাডেমিক ভবন ও চারুকলা অনুষদের সবুজ চত্বর।"
  },
  {
    "id": "rokeya_hall",
    "rankNo": "০৪",
    "nameBn": "রোকেয়া হল ও শিক্ষক ডরমেটরী",
    "shortBn": "রোকেয়া হল",
    "nameEn": "Rokeya Hall",
    "cat": "female_halls",
    "d": "M105,134L242,134L242,248L92,248Z",
    "poly": "105,134 242,134 242,248 92,248",
    "bbox": {
      "minX": 92,
      "minY": 134,
      "maxX": 242,
      "maxY": 248,
      "w": 150,
      "h": 114
    },
    "center": {
      "x": 170,
      "y": 192
    },
    "imageUrl": "/uploads/ru-1794141495627-4vut1.jpg",
    "descriptionBn": "বেগম রোকেয়ার নামে নামকরণকৃত ছাত্রী আবাসিক হল ও সংলগ্ন শিক্ষক ডরমেটরি সীমানা।"
  },
  {
    "id": "botanical_garden",
    "rankNo": "০৫",
    "nameBn": "বোটানিক্যাল গার্ডেন",
    "shortBn": "বোটানিক্যাল গার্ডেন",
    "nameEn": "Botanical Garden",
    "cat": "landmarks",
    "d": "M266,134L434,134L434,198L266,198Z",
    "poly": "266,134 434,134 434,198 266,198",
    "bbox": {
      "minX": 266,
      "minY": 134,
      "maxX": 434,
      "maxY": 198,
      "w": 168,
      "h": 64
    },
    "center": {
      "x": 350,
      "y": 168
    },
    "imageUrl": "/map-spots/ru_botanical.jpg",
    "descriptionBn": "দুর্লভ উদ্ভিদ প্রজাতি, পুকুর ও সবুজ প্রকৃতিতে ঘেরা রাবি বোটানিক্যাল গার্ডেন অঞ্চল।"
  },
  {
    "id": "habibur_hall",
    "rankNo": "০৬",
    "nameBn": "শহীদ হবিবুর রহমান হল",
    "shortBn": "হবিবুর রহমান হল",
    "nameEn": "Habibur Rahman Hall",
    "cat": "male_halls",
    "d": "M466,134L554,134L554,210L466,210Z",
    "poly": "466,134 554,134 554,210 466,210",
    "bbox": {
      "minX": 466,
      "minY": 134,
      "maxX": 554,
      "maxY": 210,
      "w": 88,
      "h": 76
    },
    "center": {
      "x": 510,
      "y": 174
    },
    "imageUrl": "/uploads/ru-1794141501081-mce2s.jpg",
    "descriptionBn": "হবিবুর রহমান খেলার মাঠের উত্তর পাশে অবস্থিত বৃহৎ ছাত্র আবাসিক হল অঞ্চল।"
  },
  {
    "id": "ziaur_hall",
    "rankNo": "০৭",
    "nameBn": "শহীদ জিয়াউর রহমান হল",
    "shortBn": "জিয়াউর রহমান হল",
    "nameEn": "Ziaur Rahman Hall",
    "cat": "male_halls",
    "d": "M564,134L652,134L652,210L564,210Z",
    "poly": "564,134 652,134 652,210 564,210",
    "bbox": {
      "minX": 564,
      "minY": 134,
      "maxX": 652,
      "maxY": 210,
      "w": 88,
      "h": 76
    },
    "center": {
      "x": 608,
      "y": 174
    },
    "imageUrl": "/uploads/ru-1794141536860-sz4u9.jpg",
    "descriptionBn": "উত্তর ক্যাম্পাসে হবিবুর রহমান হলের পূর্ব পাশে অবস্থিত ছাত্র আবাসিক হল।"
  },
  {
    "id": "ru_station",
    "rankNo": "০৮",
    "nameBn": "রাবি রেলস্টেশন ও স্টেশন বাজার",
    "shortBn": "রাবি স্টেশন বাজার",
    "nameEn": "RU Station & Bazar",
    "cat": "landmarks",
    "d": "M664,128L796,128L796,174L664,174Z",
    "poly": "664,128 796,128 796,174 664,174",
    "bbox": {
      "minX": 664,
      "minY": 128,
      "maxX": 796,
      "maxY": 174,
      "w": 132,
      "h": 46
    },
    "center": {
      "x": 730,
      "y": 152
    },
    "imageUrl": "/map-spots/ru_station.jpg",
    "descriptionBn": "রাজশাহী-ঢাকা রেলপথে বিশ্ববিদ্যালয়ের নিজস্ব রেলস্টেশন ও জনপ্রিয় স্টেশন বাজার চত্বর।"
  },
  {
    "id": "madar_bux_hall",
    "rankNo": "০৯",
    "nameBn": "মাদার বখ্শ হল",
    "shortBn": "মাদার বখ্শ হল",
    "nameEn": "Madar Bux Hall",
    "cat": "male_halls",
    "d": "M664,182L742,182L742,246L664,246Z",
    "poly": "664,182 742,182 742,246 664,246",
    "bbox": {
      "minX": 664,
      "minY": 182,
      "maxX": 742,
      "maxY": 246,
      "w": 78,
      "h": 64
    },
    "center": {
      "x": 703,
      "y": 215
    },
    "imageUrl": "/uploads/ru-1794154040015-5vwji.jpg",
    "descriptionBn": "রাবির অন্যতম প্রতিষ্ঠাতা মাদার বখ্শের নামে নামকরণকৃত ছাত্র আবাসিক হল অঞ্চল।"
  },
  {
    "id": "suhrawardy_hall",
    "rankNo": "১০",
    "nameBn": "হোসেন শহীদ সোহরাওয়ার্দী হল",
    "shortBn": "সোহরাওয়ার্দী হল",
    "nameEn": "Suhrawardy Hall",
    "cat": "male_halls",
    "d": "M752,182L832,182L832,246L752,246Z",
    "poly": "752,182 832,182 832,246 752,246",
    "bbox": {
      "minX": 752,
      "minY": 182,
      "maxX": 832,
      "maxY": 246,
      "w": 80,
      "h": 64
    },
    "center": {
      "x": 792,
      "y": 215
    },
    "imageUrl": "/uploads/ru-1794154057585-c9r0v.jpg",
    "descriptionBn": "স্টেশন বাজার ও জোহা হলের মধ্যবর্তী স্থানে অবস্থিত ছাত্রদের আবাসিক হল।"
  },
  {
    "id": "shamsuzzoha_hall",
    "rankNo": "১১",
    "nameBn": "শহীদ শামসুজ্জোহা হল",
    "shortBn": "শামসুজ্জোহা হল",
    "nameEn": "Shamsuzzoha Hall",
    "cat": "male_halls",
    "d": "M842,134L958,134L958,248L842,248Z",
    "poly": "842,134 958,134 958,248 842,248",
    "bbox": {
      "minX": 842,
      "minY": 134,
      "maxX": 958,
      "maxY": 248,
      "w": 116,
      "h": 114
    },
    "center": {
      "x": 900,
      "y": 192
    },
    "imageUrl": "/uploads/ru-1794154065708-z3z4s.jpg",
    "descriptionBn": "শহীদ বুদ্ধিজীবী ড. শামসুজ্জোহার স্মৃতিবিজড়িত আবাসিক হল ও সংলগ্ন পুকুর অঞ্চল।"
  },
  {
    "id": "boddhobhumi",
    "rankNo": "১২",
    "nameBn": "বধ্যভূমি স্মৃতিস্তম্ভ ও পূর্ব প্রান্ত",
    "shortBn": "বধ্যভূমি স্মৃতিস্তম্ভ",
    "nameEn": "Boddhobhumi Memorial",
    "cat": "landmarks",
    "d": "M982,134L1148,134L1128,262L982,252Z",
    "poly": "982,134 1148,134 1128,262 982,252",
    "bbox": {
      "minX": 982,
      "minY": 134,
      "maxX": 1148,
      "maxY": 262,
      "w": 166,
      "h": 128
    },
    "center": {
      "x": 1062,
      "y": 198
    },
    "imageUrl": "/map-spots/ru_boddhobhumi.jpg",
    "descriptionBn": "১৯৭১ সালের মহান মুক্তিযুদ্ধে শহীদদের স্মরণে ক্যাম্পাসের উত্তর-পূর্ব প্রান্তে নির্মিত বধ্যভূমি স্মৃতিস্তম্ভ।"
  },
  {
    "id": "rahamatunnesa_hall",
    "rankNo": "১৩",
    "nameBn": "রহমতুন্নেসা হল",
    "shortBn": "রহমতুন্নেসা হল",
    "nameEn": "Rahamatunnesa Hall",
    "cat": "female_halls",
    "d": "M266,206L434,206L434,248L266,248Z",
    "poly": "266,206 434,206 434,248 266,248",
    "bbox": {
      "minX": 266,
      "minY": 206,
      "maxX": 434,
      "maxY": 248,
      "w": 168,
      "h": 42
    },
    "center": {
      "x": 350,
      "y": 229
    },
    "imageUrl": "/uploads/ru-1794159579684-dc2ry.webp",
    "descriptionBn": "বোটানিক্যাল গার্ডেনের দক্ষিণ সীমানায় অবস্থিত ছাত্রীদের আবাসিক হল।"
  },
  {
    "id": "taposhi_rabeya_hall",
    "rankNo": "১৪",
    "nameBn": "তাপসী রাবেয়া হল",
    "shortBn": "তাপসী রাবেয়া হল",
    "nameEn": "Taposhi Rabeya Hall",
    "cat": "female_halls",
    "d": "M266,256L356,256L356,302L266,302Z",
    "poly": "266,256 356,256 356,302 266,302",
    "bbox": {
      "minX": 266,
      "minY": 256,
      "maxX": 356,
      "maxY": 302,
      "w": 90,
      "h": 46
    },
    "center": {
      "x": 311,
      "y": 281
    },
    "imageUrl": "/uploads/ru-1794159590411-hz6vw.webp",
    "descriptionBn": "রোকেয়া হলের পূর্ব পাশে এবং রহমতুন্নেসা হলের দক্ষিণে অবস্থিত ছাত্রী হল।"
  },
  {
    "id": "khaleda_zia_hall",
    "rankNo": "১৫",
    "nameBn": "বেগম খালেদা জিয়া হল",
    "shortBn": "খালেদা জিয়া হল",
    "nameEn": "Khaleda Zia Hall",
    "cat": "female_halls",
    "d": "M266,310L356,310L356,352L266,352Z",
    "poly": "266,310 356,310 356,352 266,352",
    "bbox": {
      "minX": 266,
      "minY": 310,
      "maxX": 356,
      "maxY": 352,
      "w": 90,
      "h": 42
    },
    "center": {
      "x": 311,
      "y": 333
    },
    "imageUrl": "/uploads/1793774256208-134337096780936258_j.jpg",
    "descriptionBn": "সিরাজী ভবনের উত্তর সীমানায় অবস্থিত ছাত্রীদের আবাসিক হল।"
  },
  {
    "id": "sheikh_hasina_hall",
    "rankNo": "১৬",
    "nameBn": "শেখ হাসিনা হল",
    "shortBn": "শেখ হাসিনা হল",
    "nameEn": "Sheikh Hasina Hall",
    "cat": "female_halls",
    "d": "M366,256L434,256L434,352L366,352Z",
    "poly": "366,256 434,256 434,352 366,352",
    "bbox": {
      "minX": 366,
      "minY": 256,
      "maxX": 434,
      "maxY": 352,
      "w": 68,
      "h": 96
    },
    "center": {
      "x": 400,
      "y": 306
    },
    "imageUrl": "/uploads/1793774284198-134361855682621347_j.jpg",
    "descriptionBn": "ছাত্রী হল জোনের পূর্ব প্রান্তে বিজ্ঞান ভবন সংলগ্ন আবাসিক হল।"
  },
  {
    "id": "fazilatunnesa_hall",
    "rankNo": "১৭",
    "nameBn": "বঙ্গমাতা শেখ ফজিলাতুন্নেছা হল",
    "shortBn": "ফজিলাতুন্নেছা হল",
    "nameEn": "Fazilatunnesa Hall",
    "cat": "female_halls",
    "d": "M92,258L242,258L242,348L82,348Z",
    "poly": "92,258 242,258 242,348 82,348",
    "bbox": {
      "minX": 82,
      "minY": 258,
      "maxX": 242,
      "maxY": 348,
      "w": 160,
      "h": 90
    },
    "center": {
      "x": 166,
      "y": 304
    },
    "imageUrl": "/uploads/1793774324791-134361855682621347_j.jpg",
    "descriptionBn": "রোকেয়া হলের দক্ষিণে এবং মন্নুজান হলের উত্তরে অবস্থিত ছাত্রী আবাসিক হল।"
  },
  {
    "id": "mannujan_hall",
    "rankNo": "১৮",
    "nameBn": "মন্নুজান হল ও শেখ রাসেল স্কুল মাঠ",
    "shortBn": "মন্নুজান হল",
    "nameEn": "Mannujan Hall",
    "cat": "female_halls",
    "d": "M82,358L242,358L242,462L94,462Z",
    "poly": "82,358 242,358 242,462 94,462",
    "bbox": {
      "minX": 82,
      "minY": 358,
      "maxX": 242,
      "maxY": 462,
      "w": 160,
      "h": 104
    },
    "center": {
      "x": 166,
      "y": 412
    },
    "imageUrl": "/uploads/1793774352397-134337096780936258_j.jpg",
    "descriptionBn": "রাবির ছাত্রীদের প্রথম আবাসিক হল, শেখ রাসেল মডেল স্কুল মাঠ ও পশ্চিমপাড়া আবাসিক এলাকা।"
  },
  {
    "id": "twenty_storied",
    "rankNo": "১৯",
    "nameBn": "২০তলা একাডেমিক ভবন ও শহীদ হবিবুর রহমান মাঠ",
    "shortBn": "২০তলা ভবন ও হবিবুর মাঠ",
    "nameEn": "20-Storied Bldg & Field",
    "cat": "academic",
    "d": "M466,232L612,232L612,292L466,292Z",
    "poly": "466,232 612,232 612,292 466,292",
    "bbox": {
      "minX": 466,
      "minY": 232,
      "maxX": 612,
      "maxY": 292,
      "w": 146,
      "h": 60
    },
    "center": {
      "x": 539,
      "y": 262
    },
    "imageUrl": "/map-spots/ru_academic_hall.jpg",
    "descriptionBn": "শহীদ হবিবুর রহমান খেলার মাঠ এবং নির্মিতব্য আধুনিক ২০তলা একাডেমিক ভবন অঞ্চল।"
  },
  {
    "id": "jc_bose_bldg",
    "rankNo": "২০",
    "nameBn": "স্যার জগদীশ চন্দ্র বসু ও ড. কুদরত-ই-খুদা একাডেমিক ভবন (২য় ও ৩য় বিজ্ঞান)",
    "shortBn": "জগদীশ বসু ও কুদরত-ই-খুদা ভবন",
    "nameEn": "2nd & 3rd Science Bldg",
    "cat": "academic",
    "d": "M466,300L582,300L582,354L466,354Z",
    "poly": "466,300 582,300 582,354 466,354",
    "bbox": {
      "minX": 466,
      "minY": 300,
      "maxX": 582,
      "maxY": 354,
      "w": 116,
      "h": 54
    },
    "center": {
      "x": 524,
      "y": 328
    },
    "imageUrl": "/map-spots/ru_wazed.jpg",
    "descriptionBn": "দ্বিতীয় ও তৃতীয় বিজ্ঞান ভবন (জীববিজ্ঞান, রসায়ন ও প্রাণরসায়ন অনুষদ) কমপ্লেক্স।"
  },
  {
    "id": "wazed_bldg",
    "rankNo": "২১",
    "nameBn": "ড. এম এ ওয়াজেদ মিয়া একাডেমিক ভবন (৪র্থ বিজ্ঞান ও প্রকৌশল)",
    "shortBn": "ওয়াজেদ মিয়া ভবন",
    "nameEn": "Dr. Wazed Miah Bldg",
    "cat": "academic",
    "d": "M466,362L522,362L522,422L466,422Z",
    "poly": "466,362 522,362 522,422 466,422",
    "bbox": {
      "minX": 466,
      "minY": 362,
      "maxX": 522,
      "maxY": 422,
      "w": 56,
      "h": 60
    },
    "center": {
      "x": 494,
      "y": 392
    },
    "imageUrl": "/map-spots/ru_wazed.jpg",
    "descriptionBn": "চতুর্থ বিজ্ঞান ভবন; প্রকৌশল, সিএসই ও বিজ্ঞান অনুষদের আধুনিক ল্যাবরেটরি ও বিভাগসমূহ।"
  },
  {
    "id": "sn_bose_bldg",
    "rankNo": "২২",
    "nameBn": "সত্যেন্দ্রনাথ বসু একাডেমিক ভবন (১ম বিজ্ঞান ভবন)",
    "shortBn": "সত্যেন্দ্রনাথ বসু ভবন",
    "nameEn": "S.N. Bose 1st Science Bldg",
    "cat": "academic",
    "d": "M530,362L586,362L586,422L530,422Z",
    "poly": "530,362 586,362 586,422 530,422",
    "bbox": {
      "minX": 530,
      "minY": 362,
      "maxX": 586,
      "maxY": 422,
      "w": 56,
      "h": 60
    },
    "center": {
      "x": 558,
      "y": 392
    },
    "imageUrl": "/map-spots/ru_academic_hall.jpg",
    "descriptionBn": "প্রথম বিজ্ঞান ভবন (পদার্থবিজ্ঞান, গণিত ও পরিসংখ্যান বিভাগ)।"
  },
  {
    "id": "siraji_bldg",
    "rankNo": "২৩",
    "nameBn": "সৈয়দ ইসমাইল হোসেন সিরাজী একাডেমিক ভবন",
    "shortBn": "সিরাজী ভবন",
    "nameEn": "Siraji Academic Bldg",
    "cat": "academic",
    "d": "M274,370L352,370L352,418L274,418Z",
    "poly": "274,370 352,370 352,418 274,418",
    "bbox": {
      "minX": 274,
      "minY": 370,
      "maxX": 352,
      "maxY": 418,
      "w": 78,
      "h": 48
    },
    "center": {
      "x": 313,
      "y": 395
    },
    "imageUrl": "/map-spots/ru_kazi_nazrul.jpg",
    "descriptionBn": "শিক্ষা ও গবেষণা ইনস্টিটিউট (IER) এবং সামাজিক বিজ্ঞান ও কলা অনুষদের বিভিন্ন বিভাগ।"
  },
  {
    "id": "rabindra_bldg",
    "rankNo": "২৪",
    "nameBn": "রবীন্দ্রনাথ ঠাকুর একাডেমিক ভবন",
    "shortBn": "রবীন্দ্র ভবন",
    "nameEn": "Rabindra Tagore Bldg",
    "cat": "academic",
    "d": "M360,370L438,370L438,418L360,418Z",
    "poly": "360,370 438,370 438,418 360,418",
    "bbox": {
      "minX": 360,
      "minY": 370,
      "maxX": 438,
      "maxY": 418,
      "w": 78,
      "h": 48
    },
    "center": {
      "x": 399,
      "y": 395
    },
    "imageUrl": "/map-spots/ru_kazi_nazrul.jpg",
    "descriptionBn": "কলা, আইন ও সামাজিক বিজ্ঞান অনুষদের অন্যতম প্রধান একাডেমিক ভবন।"
  },
  {
    "id": "momtaz_bldg",
    "rankNo": "২৫",
    "nameBn": "ড. মমতাজউদ্দিন আহমদ একাডেমিক ভবন (কলা ভবন)",
    "shortBn": "মমতাজউদ্দিন ভবন",
    "nameEn": "Momtazuddin Arts Bldg",
    "cat": "academic",
    "d": "M274,426L352,426L352,464L274,464Z",
    "poly": "274,426 352,426 352,464 274,464",
    "bbox": {
      "minX": 274,
      "minY": 426,
      "maxX": 352,
      "maxY": 464,
      "w": 78,
      "h": 38
    },
    "center": {
      "x": 313,
      "y": 446
    },
    "imageUrl": "/map-spots/ru_academic_hall.jpg",
    "descriptionBn": "প্যারিস রোডের উত্তর-পশ্চিম প্রান্তে কলা অনুষদের ঐতিহাসিক মমতাজউদ্দিন ভবন।"
  },
  {
    "id": "shahidullah_bldg",
    "rankNo": "২৬",
    "nameBn": "ড. মুহম্মদ শহীদুল্লাহ একাডেমিক ভবন",
    "shortBn": "শহীদুল্লাহ ভবন",
    "nameEn": "Shahidullah Arts Bldg",
    "cat": "academic",
    "d": "M360,426L438,426L438,464L360,464Z",
    "poly": "360,426 438,426 438,464 360,464",
    "bbox": {
      "minX": 360,
      "minY": 426,
      "maxX": 438,
      "maxY": 464,
      "w": 78,
      "h": 38
    },
    "center": {
      "x": 399,
      "y": 446
    },
    "imageUrl": "/map-spots/ru_admin_senate.jpg",
    "descriptionBn": "কেন্দ্রীয় গ্রন্থাগারের পশ্চিম পাশে অবস্থিত সুপরিচিত কলা অনুষদ ভবন।"
  },
  {
    "id": "central_library",
    "rankNo": "২৭",
    "nameBn": "কেন্দ্রীয় গ্রন্থাগার, কাজী নজরুল মিলনায়তন ও সিনেট ভবন",
    "shortBn": "কেন্দ্রীয় গ্রন্থাগার",
    "nameEn": "Central Library & Auditorium",
    "cat": "academic",
    "d": "M466,430L586,430L586,466L466,466Z",
    "poly": "466,430 586,430 586,466 466,466",
    "bbox": {
      "minX": 466,
      "minY": 430,
      "maxX": 586,
      "maxY": 466,
      "w": 120,
      "h": 36
    },
    "center": {
      "x": 526,
      "y": 449
    },
    "imageUrl": "/map-spots/ru_central_library.jpg",
    "descriptionBn": "লক্ষাধিক বই সমৃদ্ধ রাবি কেন্দ্রীয় গ্রন্থাগার, কাজী নজরুল ইসলাম মিলনায়তন ও শহীদ সুখরঞ্জন সমাদ্দার টিএসসিসি।"
  },
  {
    "id": "stadium",
    "rankNo": "২৮",
    "nameBn": "শেখ কামাল স্টেডিয়াম ও ইনডোর স্টেডিয়াম",
    "shortBn": "শেখ কামাল স্টেডিয়াম",
    "nameEn": "Sheikh Kamal Stadium",
    "cat": "landmarks",
    "d": "M620,275L665,260L715,270L738,315L738,378L712,415L655,420L612,395L602,340Z",
    "poly": "620,275 665,260 715,270 738,315 738,378 712,415 655,420 612,395 602,340",
    "bbox": {
      "minX": 602,
      "minY": 260,
      "maxX": 738,
      "maxY": 420,
      "w": 136,
      "h": 160
    },
    "center": {
      "x": 672,
      "y": 342
    },
    "imageUrl": "/map-spots/ru_stadium.jpg",
    "descriptionBn": "ক্যাম্পাসের ঠিক হৃদপিণ্ডে অবস্থিত ডিম্বাকৃতির বিশাল শেখ কামাল স্টেডিয়াম এবং ইনডোর স্টেডিয়াম চত্বর।"
  },
  {
    "id": "latif_hall",
    "rankNo": "২৯",
    "nameBn": "নবাব আব্দুল লতিফ হল ও আন্তর্জাতিক ডরমেটরী",
    "shortBn": "আব্দুল লতিফ হল",
    "nameEn": "Nawab Abdul Latif Hall",
    "cat": "male_halls",
    "d": "M766,266L890,266L890,342L766,342Z",
    "poly": "766,266 890,266 890,342 766,342",
    "bbox": {
      "minX": 766,
      "minY": 266,
      "maxX": 890,
      "maxY": 342,
      "w": 124,
      "h": 76
    },
    "center": {
      "x": 828,
      "y": 304
    },
    "imageUrl": "/uploads/1793774883033-134376982312850041_j.jpg",
    "descriptionBn": "পূর্ব ক্যাম্পাসে শামসুজ্জোহা হলের দক্ষিণে ও শহীদ মীর কাইয়ুম আন্তর্জাতিক ডরমেটরি সংলগ্ন আবাসিক হল।"
  },
  {
    "id": "amer_ali_hall",
    "rankNo": "৩০",
    "nameBn": "সৈয়দ আমীর আলী হল ও পূর্বপাড়া কৃষি প্রকল্প এলাকা",
    "shortBn": "আমীর আলী হল",
    "nameEn": "Syed Amer Ali Hall",
    "cat": "male_halls",
    "d": "M900,266L1122,276L1098,412L900,412Z",
    "poly": "900,266 1122,276 1098,412 900,412",
    "bbox": {
      "minX": 900,
      "minY": 266,
      "maxX": 1122,
      "maxY": 412,
      "w": 222,
      "h": 146
    },
    "center": {
      "x": 1005,
      "y": 340
    },
    "imageUrl": "/uploads/1793774896378-134337096780936258_j.jpg",
    "descriptionBn": "সৈয়দ আমীর আলী হল, পূর্বপাড়া আবাসিক এলাকা এবং পূর্বাঞ্চলীয় কৃষি প্রকল্প মাঠ।"
  },
  {
    "id": "shah_makhdum_hall",
    "rankNo": "৩১",
    "nameBn": "শাহ্ মখদুম হল, চিকিৎসা কেন্দ্র ও আই.বি.এস",
    "shortBn": "শাহ্ মখদুম হল ও মেডিকেল",
    "nameEn": "Shah Makhdum Hall & Medical",
    "cat": "male_halls",
    "d": "M766,352L890,352L890,464L766,464Z",
    "poly": "766,352 890,352 890,464 766,464",
    "bbox": {
      "minX": 766,
      "minY": 352,
      "maxX": 890,
      "maxY": 464,
      "w": 124,
      "h": 112
    },
    "center": {
      "x": 828,
      "y": 408
    },
    "imageUrl": "/uploads/1793775027367-134361855682621347.jpg",
    "descriptionBn": "হযরত শাহ মখদুম (রহ.) ছাত্র হল, রাবি চিকিৎসা কেন্দ্র (মেডিকেল সেন্টার) ও আই.বি.এস সংলগ্ন অঞ্চল।"
  },
  {
    "id": "bangabandhu_hall",
    "rankNo": "৩২",
    "nameBn": "বঙ্গবন্ধু শেখ মুজিবুর রহমান হল",
    "shortBn": "বঙ্গবন্ধু হল",
    "nameEn": "Bangabandhu Hall",
    "cat": "male_halls",
    "d": "M596,426L668,426L668,466L596,466Z",
    "poly": "596,426 668,426 668,466 596,466",
    "bbox": {
      "minX": 596,
      "minY": 426,
      "maxX": 668,
      "maxY": 466,
      "w": 72,
      "h": 40
    },
    "center": {
      "x": 632,
      "y": 448
    },
    "imageUrl": "/uploads/1793775125422-134349740643136223.jpg",
    "descriptionBn": "শেখ কামাল স্টেডিয়ামের দক্ষিণ পাশে অবস্থিত ছাত্র আবাসিক হল।"
  },
  {
    "id": "motihar_hall",
    "rankNo": "৩৩",
    "nameBn": "মতিহার হল ও কেন্দ্রীয় মন্দির",
    "shortBn": "মতিহার হল",
    "nameEn": "Motihar Hall",
    "cat": "male_halls",
    "d": "M676,426L746,426L746,466L676,466Z",
    "poly": "676,426 746,426 746,466 676,466",
    "bbox": {
      "minX": 676,
      "minY": 426,
      "maxX": 746,
      "maxY": 466,
      "w": 70,
      "h": 40
    },
    "center": {
      "x": 711,
      "y": 448
    },
    "imageUrl": "/uploads/1793866616044-134376982312850041.jpg",
    "descriptionBn": "মতিহারের সবুজ চত্বরের নামে নামকরণকৃত ছাত্র হল ও কেন্দ্রীয় মন্দির সীমানা।"
  },
  {
    "id": "kajla_gate",
    "rankNo": "৩৪",
    "nameBn": "কাজলা গেট, জুবেরী মাঠ ও পার্কিং জোন",
    "shortBn": "কাজলা গেট ও জুবেরী মাঠ",
    "nameEn": "Kajla Gate & Zuberi Field",
    "cat": "landmarks",
    "d": "M94,484L248,484L248,642L114,682Z",
    "poly": "94,484 248,484 248,642 114,682",
    "bbox": {
      "minX": 94,
      "minY": 484,
      "maxX": 248,
      "maxY": 682,
      "w": 154,
      "h": 198
    },
    "center": {
      "x": 175,
      "y": 576
    },
    "imageUrl": "/map-spots/ru_main_gate.jpg",
    "descriptionBn": "কাজলা গেট, জুবেরী ভবন ও খেলার মাঠ, পশ্চিম পার্কিং জোন এবং শেখ রাসেল মডেল স্কুল।"
  },
  {
    "id": "paris_road",
    "rankNo": "৩৫",
    "nameBn": "ঐতিহাসিক প্যারিস রোড চত্বর",
    "shortBn": "প্যারিস রোড",
    "nameEn": "Historic Paris Road",
    "cat": "landmarks",
    "d": "M266,472L468,472L468,508L266,508Z",
    "poly": "266,472 468,472 468,508 266,508",
    "bbox": {
      "minX": 266,
      "minY": 472,
      "maxX": 468,
      "maxY": 508,
      "w": 202,
      "h": 36
    },
    "center": {
      "x": 367,
      "y": 492
    },
    "imageUrl": "/map-spots/ru_paris_road.jpg",
    "descriptionBn": "সুউচ্চ গগনশিরীষ বৃক্ষশোভিত রাবির সবচেয়ে নান্দনিক ও ঐতিহাসিক রাস্তা প্যারিস রোড।"
  },
  {
    "id": "admin_senate",
    "rankNo": "৩৬",
    "nameBn": "প্রশাসন ভবন, সিনেট ভবন ও উপাচার্য ভবন",
    "shortBn": "প্রশাসন ও উপাচার্য ভবন",
    "nameEn": "Admin & VC Residence",
    "cat": "landmarks",
    "d": "M266,516L392,516L392,618L266,640Z",
    "poly": "266,516 392,516 392,618 266,640",
    "bbox": {
      "minX": 266,
      "minY": 516,
      "maxX": 392,
      "maxY": 640,
      "w": 126,
      "h": 124
    },
    "center": {
      "x": 329,
      "y": 572
    },
    "imageUrl": "/map-spots/ru_admin_senate.jpg",
    "descriptionBn": "সৈয়দ নজরুল ইসলাম প্রশাসন ভবন, সিনেট ভবন এবং উপাচার্যের বাসভবন অঞ্চল।"
  },
  {
    "id": "shabash_bd",
    "rankNo": "৩৭",
    "nameBn": "সাবাস বাংলাদেশ ভাস্কর্য, মাঠ ও পার্কিং",
    "shortBn": "সাবাস বাংলাদেশ",
    "nameEn": "Shabash Bangladesh",
    "cat": "landmarks",
    "d": "M398,516L468,516L468,566L398,574Z",
    "poly": "398,516 468,516 468,566 398,574",
    "bbox": {
      "minX": 398,
      "minY": 516,
      "maxX": 468,
      "maxY": 574,
      "w": 70,
      "h": 58
    },
    "center": {
      "x": 433,
      "y": 544
    },
    "imageUrl": "/map-spots/ru_shabash_bd.jpg",
    "descriptionBn": "শিল্পী নিতুন কুন্ডু নির্মিত মহান মুক্তিযুদ্ধের অমর ভাস্কর্য \"সাবাস বাংলাদেশ\" ও উন্মুক্ত মাঠ।"
  },
  {
    "id": "main_gate",
    "rankNo": "৩৮",
    "nameBn": "মেইন গেট, জোহা চত্বর ও গোলচত্বর",
    "shortBn": "মেইন গেট ও জোহা চত্বর",
    "nameEn": "Main Gate & Zoha Chattar",
    "cat": "landmarks",
    "d": "M398,580L552,562L552,602L398,622Z",
    "poly": "398,580 552,562 552,602 398,622",
    "bbox": {
      "minX": 398,
      "minY": 562,
      "maxX": 552,
      "maxY": 622,
      "w": 154,
      "h": 60
    },
    "center": {
      "x": 475,
      "y": 594
    },
    "imageUrl": "/map-spots/ru_main_gate.jpg",
    "descriptionBn": "রাজশাহী বিশ্ববিদ্যালয়ের প্রধান প্রবেশদ্বার, গোলচত্বর এবং ড. শামসুজ্জোহার সমাধিস্থল সংলগ্ন জোহা চত্বর।"
  },
  {
    "id": "central_mosque",
    "rankNo": "৩৯",
    "nameBn": "কেন্দ্রীয় জামে মসজিদ ও সুবর্ণ জয়ন্তী টাওয়ার",
    "shortBn": "কেন্দ্রীয় জামে মসজিদ",
    "nameEn": "Central Mosque",
    "cat": "landmarks",
    "d": "M492,486L556,486L556,554L492,562Z",
    "poly": "492,486 556,486 556,554 492,562",
    "bbox": {
      "minX": 492,
      "minY": 486,
      "maxX": 556,
      "maxY": 562,
      "w": 64,
      "h": 76
    },
    "center": {
      "x": 524,
      "y": 524
    },
    "imageUrl": "/map-spots/ru_central_mosque.jpg",
    "descriptionBn": "মেইন গেটের উত্তর-পূর্ব পাশে অবস্থিত অনন্য স্থাপত্যশৈলীর রাবি কেন্দ্রীয় জামে মসজিদ ও সুবর্ণ জয়ন্তী টাওয়ার।"
  },
  {
    "id": "smriti_museum",
    "rankNo": "৪০",
    "nameBn": "শহীদ স্মৃতি সংগ্রহশালা",
    "shortBn": "শহীদ স্মৃতি সংগ্রহশালা",
    "nameEn": "Shaheed Smriti Museum",
    "cat": "landmarks",
    "d": "M564,486L634,486L634,578L564,588Z",
    "poly": "564,486 634,486 634,578 564,588",
    "bbox": {
      "minX": 564,
      "minY": 486,
      "maxX": 634,
      "maxY": 588,
      "w": 70,
      "h": 102
    },
    "center": {
      "x": 599,
      "y": 534
    },
    "imageUrl": "/map-spots/ru_smriti_museum.jpg",
    "descriptionBn": "বাংলাদেশের প্রথম স্থায়ী মুক্তিযুদ্ধ জাদুঘর — শহীদ স্মৃতি সংগ্রহশালা অঞ্চল।"
  },
  {
    "id": "sher_e_bangla_hall",
    "rankNo": "৪১",
    "nameBn": "শের-ই-বাংলা ফজলুল হক হল",
    "shortBn": "শের-ই-বাংলা হল",
    "nameEn": "Sher-e-Bangla Hall",
    "cat": "male_halls",
    "d": "M642,486L768,486L768,560L642,576Z",
    "poly": "642,486 768,486 768,560 642,576",
    "bbox": {
      "minX": 642,
      "minY": 486,
      "maxX": 768,
      "maxY": 576,
      "w": 126,
      "h": 90
    },
    "center": {
      "x": 705,
      "y": 528
    },
    "imageUrl": "/uploads/1793874078052-134367067615803428.jpg",
    "descriptionBn": "শহীদ স্মৃতি সংগ্রহশালার পূর্ব পাশে ও দক্ষিণ সড়কের সাথে অবস্থিত ঐতিহাসিক ছাত্র হল।"
  },
  {
    "id": "binodpur_gate",
    "rankNo": "৪২",
    "nameBn": "বিনোদপুর গেট, পুলিশ ফাঁড়ি ও আইবিএ ভবন",
    "shortBn": "বিনোদপুর গেট",
    "nameEn": "Binodpur Gate Zone",
    "cat": "landmarks",
    "d": "M776,486L894,486L894,422L1098,422L1078,522L776,558Z",
    "poly": "776,486 894,486 894,422 1098,422 1078,522 776,558",
    "bbox": {
      "minX": 776,
      "minY": 422,
      "maxX": 1098,
      "maxY": 558,
      "w": 322,
      "h": 136
    },
    "center": {
      "x": 935,
      "y": 492
    },
    "imageUrl": "/map-spots/ru_main_gate.jpg",
    "descriptionBn": "বিনোদপুর গেট, পুলিশ ফাঁড়ি, রাবি আইবিএ ভবন এবং বিনোদপুর বাজার সংযোগ অঞ্চল।"
  }
];
