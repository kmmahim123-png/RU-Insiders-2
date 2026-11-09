// Complete Directory of Rajshahi University Clubs, Student Organizations & Online Membership System

export interface RuClub {
  id: string;
  nameBn: string;
  nameEn: string;
  shortName: string;
  category: 'career' | 'debate' | 'science' | 'photo' | 'blood' | 'cultural' | 'service' | 'film' | 'tech';
  categoryBn: string;
  establishedYear: number;
  mottoBn: string;
  logoUrl: string;
  coverImageUrl: string;
  images?: string[]; // কার্যক্রম ও উৎসবের ছবি
  memberCount: string;
  roomLocationBn: string;
  presidentOrSecretaryBn: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  descriptionBn: string;
  whatTheyDo: string[];
  whereTheyWent: {
    platforms: string[];
    achievementsBn: string;
    notablePlacementsBn: string;
  };
  benefitsBn: string[];
}

export interface ClubMembershipApplication {
  id: string;
  clubId: string;
  clubNameBn: string;
  studentName: string;
  department: string;
  session: string;
  rollNumber: string;
  phone: string;
  email: string;
  bloodGroup: string;
  whyJoin: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const RU_CLUBS: RuClub[] = [
  {
    id: 'club-rucs',
    nameBn: 'রাজশাহী ইউনিভার্সিটি ক্যারিয়ার ক্লাব (RUCS)',
    nameEn: 'Rajshahi University Career Club',
    shortName: 'RUCS',
    category: 'career',
    categoryBn: 'ক্যারিয়ার ও করপোরেট লিডারশিপ',
    establishedYear: 2013,
    mottoBn: 'Build Skills • Excel Career • Lead Future',
    logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৮৫০+ সক্রিয় সদস্য',
    roomLocationBn: 'কক্ষ নং-২০৪, শহীদ সুখরঞ্জন সমাদ্দার ছাত্র-শিক্ষক সাংস্কৃতিক কেন্দ্র (TSCC)',
    presidentOrSecretaryBn: 'সভাপতি: আসিফ মাহমুদ | সাধারণ সম্পাদক: সুমাইয়া তাসনিম',
    contactEmail: 'careerclub.ru@gmail.com',
    contactPhone: '০১৭২২-৯৯৮৮০০',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষার্থীদের করপোরেট দুনিয়া, সফট স্কিলস, জব ফেয়ার ও বৈশ্বিক ক্যারিয়ারের জন্য প্রস্তুতকারী অন্যতম সক্রিয় ক্লাব। এটি শিক্ষার্থীদের সিভির মানোন্নয়ন ও বহুজাতিক কোম্পানিতে সরাসরি প্লেসমেন্টে সহায়তা করে।',
    whatTheyDo: [
      'বার্ষিক জাতীয় রাজশাহী বিশ্ববিদ্যালয় জব ফেয়ার (Job Fair)',
      'সিভি রাইটিং, লিংকডইন প্রোফাইল ব্র্যান্ডিং ও মক ইন্টারভিউ হ্যাকস',
      'করপোরেট কেস কম্পিটিশন ও বিজনেস স্ট্র্যাটেজি হ্যাকাথন',
      'আইইএলটিএস, জিআরই ও বিদেশে ফুল স্কলারশিপ মেন্টরশিপ সেশন',
      'দেশের শীর্ষ সিইও এবং এইচআর প্রধানদের সাথে ফায়ারসাইড চ্যাট'
    ],
    whereTheyWent: {
      platforms: ['Unilever Bangladesh', 'British American Tobacco (BAT)', 'Marico & Nestle', 'শীর্ষ বহুজাতিক ব্যাংক ও সফটওয়্যার ফার্ম'],
      achievementsBn: 'ক্লাবের সাবেক সদস্যরা বিসিএস প্রশাসন, বাংলাদেশ ব্যাংক সহকারী পরিচালক ও জাতীয় করপোরেট কেস প্রতিযোগিতায় চ্যাম্পিয়ন হয়েছে।',
      notablePlacementsBn: 'ক্লাব থেকে সরাসরি ইউনিলিভার ফিউচার লিডার্স প্রোগ্রাম, গ্রামীণফোন ম্যানেজমেন্ট ট্রেইনি ও এআই স্টার্টআপে যোগ দিয়েছেন।'
    },
    benefitsBn: [
      'করপোরেট লিডারদের সাথে সরাসরি নেটওয়ার্কিং সুযোগ',
      'ফ্রি প্রিমিয়াম সিভি রিভিউ ও ইন্টারভিউ ট্রেইনিং',
      'ক্লাবের এক্সক্লুসিভ সার্টিফিকেট ও স্কিল ডেভেলপমেন্ট বুটক্যাম্প'
    ]
  },
  {
    id: 'club-rudeu',
    nameBn: 'রাজশাহী ইউনিভার্সিটি ডিবেটিং অর্গানাইজেশন (RUDEU) / গোল্ডেন ডিবেটিং ক্লাব',
    nameEn: 'Rajshahi University Debating Organization',
    shortName: 'RUDEU',
    category: 'debate',
    categoryBn: 'বিতর্ক ও পাবলিক স্পিকিং',
    establishedYear: 2001,
    mottoBn: 'যুক্তির মুক্ত আলোয় উদ্ভাসিত হোক বিবেক',
    logoUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৬০০+ বিতার্কিক',
    roomLocationBn: 'কক্ষ নং-১০৮, রবীন্দ্র কলা ভবন ও টিএসসিসি',
    presidentOrSecretaryBn: 'সভাপতি: মির্জা তাসলিম উদ্দিন | সাধারণ সম্পাদক: ফারহানা হক',
    contactEmail: 'rudeu.debating@gmail.com',
    contactPhone: '০১৮১৬-৪৪৫৫৬৬',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'উত্তরবঙ্গের যুক্তিযুদ্ধের প্রধান দুর্গ। সংসদীয়, সনাতনী ও বারোয়ারি বিতর্কে জাতীয় চ্যাম্পিয়নশিপ অর্জনকারী রাজশাহী বিশ্ববিদ্যালয়ের কেন্দ্রীয় বিতর্ক সংগঠন।',
    whatTheyDo: [
      'জাতীয় আন্তঃবিশ্ববিদ্যালয় বিতর্ক উৎসব',
      'ব্রিটিশ পার্লামেন্টারি (BP) ডিবেট ও এশিয়ান পার্লামেন্টারি বিতর্ক কর্মশালা',
      'ক্যাম্পাস সাপ্তাহিক বিতর্ক পাঠচক্র ও তাৎক্ষণিক পাবলিক স্পিকিং সেশন',
      'বিদ্যালয় ও কলেজ শিক্ষার্থীদের জন্য বিতর্ক প্রশিক্ষণ ক্যাম্প'
    ],
    whereTheyWent: {
      platforms: ['ওয়ার্ল্ড ইউনিভার্সিটি ডিবেটিং চ্যাম্পিয়নশিপ (WUDC)', 'এশিয়ান ব্রিটিশ পার্লামেন্টারি ডিবেট', 'বিটিভি জাতীয় বিতর্ক উৎসব'],
      achievementsBn: 'বিটিভি জাতীয় আন্তঃবিশ্ববিদ্যালয় বিতর্ক প্রতিযোগিতায় একাধিকবার চ্যাম্পিয়ন এবং আন্তর্জাতিক বিতর্ক টুর্নামেন্টে বাংলাদেশের প্রতিনিধিত্ব।',
      notablePlacementsBn: 'ক্লাবের সাবেক বিতার্কিকরা বর্তমানে সহকারী জজ, বিসিএস ম্যাজিস্ট্রেট, টিভি টকশো সঞ্চালক ও আন্তর্জাতিক মানবাধিকার আইনজীবী।'
    },
    benefitsBn: [
      'আত্মবিশ্বাস ও পাবলিক স্পিকিং ভীতি দূরীকরণ',
      'রাজনীতি, অর্থনীতি, আন্তর্জাতিক সম্পর্ক ও সমাজ নিয়ে যুক্তিপূর্ণ বিশ্লেষণ দক্ষতা',
      'জাতীয় পর্যায়ের টুর্নামেন্টে রাজশাহী বিশ্ববিদ্যালয়ের প্রতিনিধিত্বের সুযোগ'
    ]
  },
  {
    id: 'club-rupo',
    nameBn: 'রাজশাহী ইউনিভার্সিটি ফটোগ্রাফিক অর্গানাইজেশন (RUPO)',
    nameEn: 'Rajshahi University Photographic Organization',
    shortName: 'RUPO',
    category: 'photo',
    categoryBn: 'ফটোগ্রাফি ও ভিজ্যুয়াল আর্টস',
    establishedYear: 1998,
    mottoBn: 'দৃষ্টি যখন শিল্প, আলো যখন গল্প',
    logoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৪৫০+ আলোকচিত্রী',
    roomLocationBn: 'টিএসসিসি প্রাঙ্গণ ও চারুকলা ক্যাফেটেরিয়া',
    presidentOrSecretaryBn: 'সভাপতি: নাবিল হাসান | সাধারণ সম্পাদক: সৈকত চন্দ্র রায়',
    contactEmail: 'rupo.photo@gmail.com',
    contactPhone: '০১৭৫১-৩৩৪৪৫৫',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'মতিহারের সৌন্দর্য, বরেন্দ্র অঞ্চলের জীবনযাত্রা এবং আন্তর্জাতিক স্তরের শৈল্পিক আলোকচিত্র সৃষ্টির ঐতিহাসিক প্ল্যাটফর্ম।',
    whatTheyDo: [
      'আন্তর্জাতিক ও জাতীয় আলোকচিত্র প্রদর্শনী (Frame in Frame)',
      'পদ্মার চর, প্যারিস রোড ও উত্তরবঙ্গের গ্রামীণ জনপদে নিয়মিত ফটোওয়াক',
      'বেসিক থেকে অ্যাডভান্সড ক্যামেরা ম্যানুয়াল কন্ট্রোল ও কালার গ্রেডিং ওয়ার্কশপ',
      'ডকুমেন্টারি ও ওয়াইল্ডলাইফ ফটোগ্রাফি মাস্টারক্লাস'
    ],
    whereTheyWent: {
      platforms: ['ন্যাশনাল জিওগ্রাফিক ইউকে ও ফ্রান্স এক্সিবিশন', 'সনি ওয়ার্ল্ড ফটোগ্রাফি অ্যাওয়ার্ডস', 'ঢাকা আলিয়ঁস ফ্রঁসেজ গ্যালারি'],
      achievementsBn: 'ক্লাবের সদস্যদের তোলা ছবি ন্যাশনাল জিওগ্রাফিক, গার্ডিয়ান ও বিবিসি ট্রাভেলে প্রকাশিত হয়েছে।',
      notablePlacementsBn: 'সাবেক সদস্যরা আন্তর্জাতিক বার্তা সংস্থা এএফপি, রয়টার্স ও প্রথম আলোর শীর্ষ ফটোসাংবাদিক হিসেবে কর্মরত।'
    },
    benefitsBn: [
      'ক্যামেরা টেকনিক ও সৃজনশীল ফ্রেম নির্বাচনের হাতে-কলমে প্রশিক্ষণ',
      'জাতীয় ও আন্তর্জাতিক প্রদর্শনীতে নিজের ছবি প্রদর্শনীর সুযোগ',
      'প্রফেশনাল ফটো এডিটিং ও পোর্টফোলিও তৈরি'
    ]
  },
  {
    id: 'club-rustc',
    nameBn: 'রাজশাহী ইউনিভার্সিটি সায়েন্স ক্লাব (RUSTC)',
    nameEn: 'Rajshahi University Science Club',
    shortName: 'RUSTC',
    category: 'science',
    categoryBn: 'বিজ্ঞান, রোবোটিক্স ও মহাকাশ গবেষণা',
    establishedYear: 2015,
    mottoBn: 'বিজ্ঞানমনস্ক প্রজন্ম • গবেষণামূলক উদ্ভাবন',
    logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৭৫০+ গবেষক ও শিক্ষার্থী',
    roomLocationBn: 'বিজ্ঞান ভবন-১, গ্রাউন্ড ফ্লোর',
    presidentOrSecretaryBn: 'সভাপতি: তানভীর আহমেদ | সাধারণ সম্পাদক: সুরাইয়া পারভীন',
    contactEmail: 'rustc.official@gmail.com',
    contactPhone: '০১৯১১-৮৮৭৭৬৬',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'বিজ্ঞান ও প্রযুক্তির উদ্ভাবনী চর্চা, নাসা স্পেস অ্যাপস চ্যালেঞ্জ, রোবোটিক্স প্রকল্প ও বিজ্ঞান গবেষণার শীর্ষ ক্লাব।',
    whatTheyDo: [
      'জাতীয় সায়েন্স ফিয়েস্টা (National Science Fiesta)',
      'স্কুল-কলেজ সায়েন্স অলিম্পিয়াড ও মহাকাশ টেলিস্কোপ ক্যাম্প',
      'ড্রোন প্রযুক্তি, আইওটি ও রোবোটিক্স প্রজেক্ট শোকেসিং',
      'গবেষণাপত্র (Research Paper) রাইটিং ও ডাটা অ্যানালাইসিস সেশন'
    ],
    whereTheyWent: {
      platforms: ['নাসা স্পেস অ্যাপস চ্যালেঞ্জ গ্লোবাল রানার-আপ', 'আন্তর্জাতিক বিজ্ঞান ও উদ্ভাবন মেলা (তুর্কি/জাপান)', 'জাতীয় বিজ্ঞান ও প্রযুক্তি জাদুঘর'],
      achievementsBn: 'কৃত্রিম বুদ্ধিমত্তা ও স্যাটেলাইট ডাটাভিত্তিক প্রজেক্টের জন্য আন্তর্জাতিক বিজ্ঞান মেলায় স্বর্ণপদক জয়।',
      notablePlacementsBn: 'সদস্যরা বর্তমানে ম্যাক্স প্লাঙ্ক ইনস্টিটিউট, এমআইটি ল্যাব ও বাংলাদেশ পরমাণু শক্তি কমিশনে গবেষক।'
    },
    benefitsBn: [
      'রোবোটিক্স ও সায়েন্টিফিক প্রজেক্ট ল্যাব অ্যাক্সেস',
      'আন্তর্জাতিক গবেষণা পেপার লেখার পরামর্শ ও সহায়তা',
      'বিজ্ঞান ও প্রযুক্তি ফেলোশিপের সুযোগ'
    ]
  },
  {
    id: 'club-badhan',
    nameBn: 'বাঁধন (Badhan) — রাজশাহী বিশ্ববিদ্যালয় জোন',
    nameEn: 'Badhan (Voluntary Blood Donors Organization)',
    shortName: 'BADHAN',
    category: 'blood',
    categoryBn: 'স্বেচ্ছায় রক্তদান ও মানবিক সেবা',
    establishedYear: 1998,
    mottoBn: 'একের রক্ত অন্যের জীবন, রক্তই হোক আত্মার বাঁধন',
    logoUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    memberCount: '১২০০+ নিবন্ধিত রক্তদাতা',
    roomLocationBn: 'টিএসসিসি কেন্দ্রীয় কার্যালয় ও সকল হল ইউনিট',
    presidentOrSecretaryBn: 'সভাপতি: মো. আরিফুল ইসলাম | সাধারণ সম্পাদক: মেহেদী হাসান',
    contactEmail: 'badhan.ruzone@gmail.com',
    contactPhone: '০১৭৩১-০০৯৯৮৮ (২৪ ঘণ্টা হটলাইন)',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'উত্তরবঙ্গের মুমূর্ষু রোগীদের বিনামূল্যে জরুরি রক্ত সরবরাহ এবং প্রতিটি আবাসিক হলে শিক্ষার্থীদের বিনামূল্যে রক্তের গ্রুপ নির্ণয়কারী সবচেয়ে বৃহৎ মানবিক রক্তদান পরিবার।',
    whatTheyDo: [
      'রাজশাহী মেডিকেল কলেজ ও অন্যান্য হাসপাতালে ২৪ ঘণ্টা বিনামূল্যে রক্ত সরবরাহ',
      'ক্যাম্পাসে প্রতি মাসে ফ্রি ব্লাড গ্রুপিং ও থ্যালাসেমিয়া সচেতনতা ক্যাম্পেইন',
      'জরুরি রক্তদাতা ডাটাবেজ পরিচালনা ও রক্তদাতা মোটিভেশন',
      'বন্যার্ত ও প্রাকৃতিক দুর্যোগপীড়িত এলাকায় জরুরি চিকিৎসা সামগ্রী ও ত্রাণ বিতরণ'
    ],
    whereTheyWent: {
      platforms: ['জাতীয় রক্তদান পুরস্কার', 'স্বাস্থ্য অধিদপ্তর মানবিক স্মারক', 'রেড ক্রিসেন্ট বাংলাদেশ'],
      achievementsBn: 'গত এক বছরে উত্তরবঙ্গে ১৭,০০০+ ব্যাগ রক্ত সফলভাবে সরবরাহ করে জাতীয় পর্যায়ে শ্রেষ্ঠ রক্তদান ইউনিটের স্বীকৃতি।',
      notablePlacementsBn: 'সাবেক কর্মীরা দেশ-বিদেশে চিকিৎসক, সমাজসেবক, সরকারি কর্মকর্তা ও উন্নয়ন সংস্থার শীর্ষ পদে নেতৃত্ব দিচ্ছেন।'
    },
    benefitsBn: [
      'নিঃস্বার্থ মানবসেবা ও যেকোনো জরুরি মুহূর্তে নিজের বা পরিবারের জন্য তাৎক্ষণিক রক্ত সহায়তা',
      'ক্যাম্পাসজুড়ে বিশাল ভ্রাতৃত্ব ও মানবিক বন্ধন',
      'জরুরি প্রাথমিক চিকিৎসা ও স্বাস্থ্য সচেতনতা সার্টিফিকেট'
    ]
  },
  {
    id: 'club-rucc',
    nameBn: 'রাজশাহী ইউনিভার্সিটি কালচারাল ক্লাব (RUCC) ও আবৃত্তি সংসদ',
    nameEn: 'Rajshahi University Cultural Club',
    shortName: 'RUCC',
    category: 'cultural',
    categoryBn: 'সংস্কৃতি, সঙ্গীত ও আবৃত্তি',
    establishedYear: 2005,
    mottoBn: 'শিল্পের শক্তিতে জাগুক বাংলাদেশ',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৫০০+ শিল্পী ও বাচিকশিল্পী',
    roomLocationBn: 'মুক্তমঞ্চ ও টিএসসিসি অডিটোরিয়াম',
    presidentOrSecretaryBn: 'সভাপতি: স্বস্তিকা সেন | সাধারণ সম্পাদক: রিয়াজুল ইসলাম',
    contactEmail: 'rucc.cultural@gmail.com',
    contactPhone: '০১৭২২-৫৫৬৬৭৭',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'বসন্ত উৎসব, পয়লা বৈশাখ, রবীন্দ্র-নজরুল জন্মজয়ন্তী ও প্যারিস রোডের সাংস্কৃতিক মুক্তমঞ্চে রাবির ঐতিহ্যবাহী শিল্প সাধনার প্রাণকেন্দ্র।',
    whatTheyDo: [
      'বার্ষিক বসন্ত বরণ ও বর্ষবরণ সাংস্কৃতিক উৎসব',
      'প্রমিত বাংলা উচ্চারণ ও কবিতা আবৃত্তি কর্মশালা',
      'লোকসঙ্গীত, রবীন্দ্রসঙ্গীত ও আধুনিক গানের প্রশিক্ষণ',
      'ক্যাম্পাস ওপেন-মাইক ও সাংস্কৃতিক আড্ডা'
    ],
    whereTheyWent: {
      platforms: ['জাতীয় শিল্পকলা একাডেমি ঢাকা', 'আন্তর্জাতিক রবীন্দ্র উৎসব কোলকাতা', 'বাংলাদেশ বেতার ও বিটিভি'],
      achievementsBn: 'জাতীয় আবৃত্তি সম্মেলনে শ্রেষ্ঠ বৃন্দ আবৃত্তি প্রযোজনা হিসেবে পুরস্কার লাভ।',
      notablePlacementsBn: 'সাবেক শিল্পীরা জাতীয় মিডিয়া ব্যক্তিত্ব, কণ্ঠশিল্পী, নাট্যপরিচালক ও বেতারের গ্রেড-১ শিল্পী।'
    },
    benefitsBn: [
      'উচ্চারণ শুদ্ধিকরণ ও কণ্ঠশীলন প্রশিক্ষণ',
      'জাতীয় মঞ্চে গান, নাটক ও আবৃত্তি পরিবেশনের সুযোগ',
      'সাংস্কৃতিক মেলবন্ধন ও সৃষ্টিশীল নেতৃত্ব'
    ]
  },
  {
    id: 'club-tech',
    nameBn: 'রাবি কোডিং ও টেক কমিউনিটি (RU Coding Community)',
    nameEn: 'RU Coding & Tech Community',
    shortName: 'RUCTC',
    category: 'tech',
    categoryBn: 'প্রোগ্রামিং, হ্যাকাথন ও ওয়েব ৩.০',
    establishedYear: 2017,
    mottoBn: 'Code Your Dreams • Build Global Solutions',
    logoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৬৫০+ প্রোগ্রামার',
    roomLocationBn: 'প্রকৌশল ভবন কম্পিউটার ল্যাব',
    presidentOrSecretaryBn: 'সভাপতি: ফাহিম মাহমুদ | সাধারণ সম্পাদক: জুবায়ের হাসান',
    contactEmail: 'ructc.tech@gmail.com',
    contactPhone: '০১৭৪১-২২৩৩৪৪',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'কম্পিটিটিভ প্রোগ্রামিং (Codeforces, LeetCode), ওপেন সোর্স কন্ট্রিবিউশন, অ্যাপ ও ফুলস্ট্যাক ওয়েব ডেভেলপমেন্টের একঝাঁক প্রতিভাবান কোডারদের প্ল্যাটফর্ম।',
    whatTheyDo: [
      'আন্তঃবিশ্ববিদ্যালয় প্রোগ্রামিং কনটেস্ট ও স্পিড কোডিং হ্যাকাথন',
      'পাইথন, রিয়্যাক্ট ও নেক্সটজেএস আধুনিক ওয়েব ডেভেলপমেন্ট বুটক্যাম্প',
      'গিটহাব ওপেন সোর্স কন্ট্রিবিউশন গাইড ও ফ্রিল্যান্সিং ক্যারিয়ার রোডম্যাপ',
      'গুগল সামার অব কোড (GSoC) মেন্টরশিপ প্রোগ্রাম'
    ],
    whereTheyWent: {
      platforms: ['ICPC Dhaka Regional Contest', 'National Mobile Application Hackathon', 'Google Summer of Code (GSoC)'],
      achievementsBn: 'আইসিপিসি রিজিওনাল কনটেস্টে রাজশাহী বিশ্ববিদ্যালয়ের শীর্ষ র‍্যাঙ্ক ও জাতীয় হ্যাকাথনে ১ম স্থান অর্জন।',
      notablePlacementsBn: 'সদস্যরা বর্তমানে গুগল, মেটা, শোফফাই ও ব্রেনস্টেশনে সফটওয়্যার আর্কিটেক্ট।'
    },
    benefitsBn: [
      'সরাসরি প্রজেক্ট ভিত্তিক কোডিং শিক্ষা ও গিটহাব পোর্টফোলিও বিল্ড',
      'হাই-পেয়িং রিমোট জব ও টেক ইন্টার্নশিপ সহায়তা',
      'অ্যালগরিদম ও ডেটা স্ট্রাকচার প্রবলেম সলভিং স্কিল'
    ]
  },
  {
    id: 'club-rover',
    nameBn: 'বাংলাদেশ রোভার স্কাউট ও বিএনসিসি (রাবি উইং)',
    nameEn: 'RU Rover Scout & BNCC Contingent',
    shortName: 'RU-SCOUT',
    category: 'service',
    categoryBn: 'শৃঙ্খলা, জাতীয় সেবা ও ক্যাডেট কোর',
    establishedYear: 1974,
    mottoBn: 'সেবা • শৃঙ্খলা • দেশপ্রেম',
    logoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=1200&q=80',
    memberCount: '৫০০+ ক্যাডেট ও রোভার',
    roomLocationBn: 'শহীদ হবিবুর রহমান হল সংলগ্ন বিএনসিসি প্যারেড গ্রাউন্ড',
    presidentOrSecretaryBn: 'কন্টিনজেন্ট কমান্ডার: মেজর ড. সাজ্জাদ হোসেন | সিনিয়র রোভার মেট: তৌফিক হাসান',
    contactEmail: 'bncc.ru@gmail.com',
    contactPhone: '০১৭৩৩-৭৭৮৮৯৯',
    facebookUrl: 'https://facebook.com',
    descriptionBn: 'বিশ্ববিদ্যালয়ের সমাবর্তন, জাতীয় দিবসসমূহ ও ক্যাম্পাসের শৃঙ্খলা বজায় রাখার পাশাপাশি সামরিক প্রশিক্ষণ, দুর্যোগ উদ্ধার ও নেতৃত্বের শ্রেষ্ঠ পাঠশালা।',
    whatTheyDo: [
      'ক্যাম্পাস প্যারেড, শৃঙ্খলা রক্ষা ও প্রটোকল দায়িত্ব পালন',
      'জাতীয় ও আন্তর্জাতিক জাম্বুরি ও যুব ক্যাম্পে অংশগ্রহণ',
      'অস্ত্র প্রশিক্ষণ, ফায়ার ফাইটিং ও দুর্যোগকালীন রেসকিউ অপারেশন',
      'স্বেচ্ছাসেবী বৃক্ষরোপণ ও সমাজকল্যাণমূলক অভিযান'
    ],
    whereTheyWent: {
      platforms: ['জাতীয় প্যারেড স্কয়ার বিজয় দিবস প্যারেড', 'ইন্ডিয়া ইয়ুথ এক্সচেঞ্জ প্রোগ্রাম (YEP)', 'রাষ্ট্রপতি রোভার স্কাউট অ্যাওয়ার্ড'],
      achievementsBn: 'বাংলাদেশ সেনাবাহিনীর সাথে সম্মিলিত কুচকাওয়াজে শ্রেষ্ঠ বিশ্ববিদ্যালয় প্লাটুনের সম্মাননা এবং একাধিক প্রেসিডেন্ট রোভার স্কাউট অ্যাওয়ার্ড।',
      notablePlacementsBn: 'সাবেক ক্যাডেটরা বাংলাদেশ সেনাবাহিনী, নৌবাহিনী, বিমানবাহিনী এবং বিসিএস পুলিশ ক্যাডারে গর্বের সাথে দেশসেবায় নিয়োজিত।'
    },
    benefitsBn: [
      'সামরিক অফিসার ও বিসিএস ভাইভায় বিশেষ অগ্রাধিকার ও গ্রহণযোগ্যতা',
      'দৃঢ় আত্মশৃঙ্খলা, ফিটনেস ও নিখুঁত সময় সচেতনতা',
      'রাষ্ট্রপতি পদক ও জাতীয় সম্মাননা অর্জনের সুযোগ'
    ]
  }
];

// Local storage key for membership applications
export const CLUB_APPLICATIONS_STORAGE_KEY = 'ru_insiders_club_applications_v1';

export function getClubApplications(): ClubMembershipApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLUB_APPLICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveClubApplication(app: Omit<ClubMembershipApplication, 'id' | 'appliedAt' | 'status'>): ClubMembershipApplication {
  const newApp: ClubMembershipApplication = {
    ...app,
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    appliedAt: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
    status: 'pending'
  };

  if (typeof window === 'undefined') return newApp;

  try {
    const current = getClubApplications();
    const updated = [newApp, ...current];
    localStorage.setItem(CLUB_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  return newApp;
}

export function updateClubApplicationStatus(id: string, status: 'approved' | 'rejected' | 'pending'): ClubMembershipApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getClubApplications();
    const updated = current.map((a) => (a.id === id ? { ...a, status } : a));
    localStorage.setItem(CLUB_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}
