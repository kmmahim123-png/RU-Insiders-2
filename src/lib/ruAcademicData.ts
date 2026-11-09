// Complete Data for Rajshahi University Faculties, Departments, Seats, Careers & Alumni Directory

export interface RuAlumnus {
  id: string;
  name: string;
  departmentId: string;
  departmentBn: string;
  session: string;
  rollNumber?: string;
  currentRole: string;
  currentOrganization: string;
  location: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  whatsappNumber?: string;
  linkedInUrl?: string;
  imageUrl: string;
  bioBn?: string;
  achievementBn?: string;
}

export interface RuDepartment {
  id: string;
  nameBn: string;
  nameEn: string;
  code: string;
  facultyId: string;
  facultyBn: string;
  establishedYear: number;
  seatCount: number;
  degreeOfferedBn: string;
  degreesEn: string;
  locationBuildingBn: string;
  overviewBn: string;
  careerInBangladesh: {
    sectors: string[];
    popularRoles: string[];
    descriptionBn: string;
  };
  careerAbroad: {
    studyFields: string[];
    targetCountries: string[];
    descriptionBn: string;
  };
  sampleAlumni: RuAlumnus[];
  images?: string[]; // অনুষদ ভবন, ক্লাসরুম ও ল্যাবরেটরির ছবি
}

export interface RuFaculty {
  id: string;
  nameBn: string;
  nameEn: string;
  deanNameBn: string;
  departmentCount: number;
  iconName: string;
}

export const RU_FACULTIES: RuFaculty[] = [
  { id: 'arts', nameBn: 'কলা অনুষদ', nameEn: 'Faculty of Arts', deanNameBn: 'ডিন অফিস, শহীদুল্লাহ কলা ভবন', departmentCount: 12, iconName: 'BookOpen' },
  { id: 'law', nameBn: 'আইন অনুষদ', nameEn: 'Faculty of Law', deanNameBn: 'ডিন অফিস, রবীন্দ্র কলা ভবন', departmentCount: 2, iconName: 'Scale' },
  { id: 'science', nameBn: 'বিজ্ঞান অনুষদ', nameEn: 'Faculty of Science', deanNameBn: 'ডিন অফিস, বিজ্ঞান ভবন-১', departmentCount: 8, iconName: 'Atom' },
  { id: 'business', nameBn: 'ব্যবসায় প্রশাসন অনুষদ', nameEn: 'Faculty of Business Studies', deanNameBn: 'ডিন অফিস, সিরাজী ভবন', departmentCount: 5, iconName: 'Briefcase' },
  { id: 'social_science', nameBn: 'সামাজিক বিজ্ঞান অনুষদ', nameEn: 'Faculty of Social Sciences', deanNameBn: 'ডিন অফিস, মমতাজউদ্দীন কলা ভবন', departmentCount: 9, iconName: 'Users' },
  { id: 'life_earth_science', nameBn: 'জীব ও ভূবিজ্ঞান অনুষদ', nameEn: 'Faculty of Life & Earth Sciences', deanNameBn: 'ডিন অফিস, বিজ্ঞান ভবন-৩', departmentCount: 8, iconName: 'Dna' },
  { id: 'engineering', nameBn: 'প্রকৌশল অনুষদ', nameEn: 'Faculty of Engineering', deanNameBn: 'ডিন অফিস, প্রকৌশল ভবন', departmentCount: 6, iconName: 'Cpu' },
  { id: 'fine_arts', nameBn: 'চারুকলা অনুষদ', nameEn: 'Faculty of Fine Arts', deanNameBn: 'ডিন অফিস, চারুকলা প্রাঙ্গণ', departmentCount: 3, iconName: 'Palette' },
  { id: 'agriculture', nameBn: 'কৃষি অনুষদ', nameEn: 'Faculty of Agriculture', deanNameBn: 'ডিন অফিস, কৃষি ভবন', departmentCount: 4, iconName: 'Sprout' },
  { id: 'fisheries', nameBn: 'মৎস্য অনুষদ', nameEn: 'Faculty of Fisheries', deanNameBn: 'ডিন অফিস, মৎস্য ভবন', departmentCount: 1, iconName: 'Fish' },
  { id: 'vet_science', nameBn: 'ভেটেরিনারি ও এনিমেল সায়েন্স অনুষদ', nameEn: 'Faculty of Veterinary & Animal Sciences', deanNameBn: 'ডিন অফিস, ভেটেরিনারি কমপ্লেক্স', departmentCount: 1, iconName: 'Stethoscope' },
  { id: 'geosciences', nameBn: 'ভূ-বিজ্ঞান অনুষদ', nameEn: 'Faculty of Geosciences', deanNameBn: 'ডিন অফিস, ভূ-বিজ্ঞান ভবন', departmentCount: 2, iconName: 'Globe' },
];

export const RU_DEPARTMENTS: RuDepartment[] = [
  // ==========================================
  // FACULTY OF ENGINEERING
  // ==========================================
  {
    id: 'dept-cse',
    nameBn: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
    nameEn: 'Computer Science & Engineering',
    code: 'CSE',
    facultyId: 'engineering',
    facultyBn: 'প্রকৌশল অনুষদ',
    establishedYear: 1988,
    seatCount: 50,
    degreeOfferedBn: 'বি.এস-সি. ইঞ্জিনিয়ারিং (CSE), এম.এস-সি. ইঞ্জিনিয়ারিং',
    degreesEn: 'B.Sc. Engg. in CSE, M.Sc. Engg.',
    locationBuildingBn: 'প্রকৌশল অনুষদ ভবন (চতুর্থ তলা)',
    overviewBn: 'রাজশাহী বিশ্ববিদ্যালয়ের অন্যতম শীর্ষ ও মর্যাদাপূর্ণ বিভাগ। আন্তর্জাতিক প্রোগ্রামিং প্রতিযোগিতা (ICPC), সফটওয়্যার ডেভেলপমেন্ট, এআই ও সাইবার সিকিউরিটি গবেষণায় এই বিভাগের শিক্ষার্থীরা দেশে-বিদেশে শীর্ষস্থান ধরে রেখেছে।',
    careerInBangladesh: {
      sectors: ['সফটওয়্যার ইন্ডাস্ট্রি', 'ফিনটেক ও মোবাইল ব্যাংকিং (bKash, Nagad)', 'সরকারি ব্যাংক ও আইটি অফিসার', 'টেলিকম ও ক্লাউড সার্ভিস', 'বিসিএস (টেলিকম/প্রশাসন/শিক্ষা)'],
      popularRoles: ['Software Engineer', 'Full Stack Developer', 'Data Scientist / AI Specialist', 'Cybersecurity Analyst', 'DevOps / Cloud Architect'],
      descriptionBn: 'বাংলাদেশে বর্তমানে সফটওয়্যার ইন্ডাস্ট্রিতে সর্বোচ্চ বেতনের চাকরির ক্ষেত্র তৈরি করেছে এই বিভাগ। গ্র্যাজুয়েশনের আগেই ৯০%+ শিক্ষার্থী দেশীয় ও আন্তর্জাতিক সফটওয়্যার ফার্মে যোগ দেয়।'
    },
    careerAbroad: {
      studyFields: ['Artificial Intelligence & Machine Learning', 'Computer Systems & Distributed Computing', 'Data Engineering & Cybersecurity', 'Human-Computer Interaction (HCI)'],
      targetCountries: ['মার্কিন যুক্তরাষ্ট্র (USA)', 'জার্মানি', 'কানাডা', 'সুইডেন', 'জাপান', 'অস্ট্রেলিয়া'],
      descriptionBn: 'গুগল, মেটা (ফেসবুক), মাইক্রোসফট, আমাজন এবং অ্যাপল-এ রাবি সিএসই বিভাগের অসংখ্য গ্র্যাজুয়েট উচ্চ পদে কর্মরত। বিশ্বের শীর্ষ বিশ্ববিদ্যালয়ে ফুল-ফান্ডেড এমএস ও পিএইচডি স্কলারশিপে এই বিভাগ শীর্ষে।'
    },
    sampleAlumni: [
      {
        id: 'alm-cse-01',
        name: 'তানভীর হাসান তানিম',
        departmentId: 'dept-cse',
        departmentBn: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
        session: '২০১২-২০১৩',
        rollNumber: '1310543120',
        currentRole: 'Senior Staff Software Engineer',
        currentOrganization: 'Google LLC',
        location: 'Mountain View, California, USA',
        email: 'tanvir.cse@alumni.ru.ac.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+16504501234',
        linkedInUrl: 'https://linkedin.com',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'গুগল ক্লাউড প্ল্যাটফর্মের মূল আর্কিটেক্ট টিমে অবদান রেখেছেন।'
      },
      {
        id: 'alm-cse-02',
        name: 'সাবিহা নাজনীন শম্পা',
        departmentId: 'dept-cse',
        departmentBn: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
        session: '২০১৪-২০১৫',
        rollNumber: '1510543105',
        currentRole: 'Lead AI & Machine Learning Scientist',
        currentOrganization: 'bKash Limited',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭২২-০০১১২২',
        email: 'sabiha.nazneen@bkash.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801722001122',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'বাংলাদেশের ফিনটেক ফ্রড ডিটেকশন এআই মডেল তৈরিতে অগ্রণী ভূমিকা।'
      }
    ]
  },
  {
    id: 'dept-ice',
    nameBn: 'ইনফরমেশন অ্যান্ড কমিউনিকেশন ইঞ্জিনিয়ারিং (ICE)',
    nameEn: 'Information & Communication Engineering',
    code: 'ICE',
    facultyId: 'engineering',
    facultyBn: 'প্রকৌশল অনুষদ',
    establishedYear: 2000,
    seatCount: 50,
    degreeOfferedBn: 'বি.এস-সি. ইঞ্জিনিয়ারিং (ICE), এম.এস-সি. ইঞ্জিনিয়ারিং',
    degreesEn: 'B.Sc. Engg. in ICE, M.Sc. Engg.',
    locationBuildingBn: 'প্রকৌশল অনুষদ ভবন (তৃতীয় তলা)',
    overviewBn: 'টেলিযোগাযোগ, ফাইভ-জি/সিক্স-জি নেটওয়ার্ক, ওয়্যারলেস কমিউনিকেশন, ক্লাউড সিকিউরিটি ও স্যাটেলাইট কমিউনিকেশনের আধুনিক প্রকৌশল বিভাগ।',
    careerInBangladesh: {
      sectors: ['টেলিকমিউনিকেশন (গ্রামীণফোন, রবি, বাংলালিংক)', 'স্যাটেলাইট ও মহাকাশ গবেষণা', 'আইটি নেটওয়ার্ক ও ডাটা সেন্টার', 'বাংলাদেশ সাবমেরিন ক্যাবল কোম্পানি', 'বিসিএস রেলওয়ে ও টেলিকম ক্যাডার'],
      popularRoles: ['Telecommunication Engineer', 'Network Security Specialist', 'Cloud Systems Architect', 'RF & Transmission Engineer'],
      descriptionBn: 'টেলিকম ও নেটওয়ার্কিং সেক্টরে শীর্ষ চাহিদা রয়েছে। বঙ্গবন্ধু স্যাটেলাইট গ্রাউন্ড স্টেশন ও জাতীয় ফাইবার অপটিক নেটওয়ার্কে এই বিভাগের গ্র্যাজুয়েটরা দায়িত্বশীল পদে আছেন।'
    },
    careerAbroad: {
      studyFields: ['5G/6G & Wireless Networks', 'Quantum Communication & Cryptography', 'Optical Networks & Photonics'],
      targetCountries: ['দক্ষিণ কোরিয়া', 'জার্মানি', 'যুক্তরাষ্ট্র', 'ফিনল্যান্ড', 'কানাডা'],
      descriptionBn: 'স্যামসাং আরঅ্যান্ডডি, এরিকসন, নোকিয়া ও কোয়ালকম-এ রিসার্চার হিসেবে সুযোগ।'
    },
    sampleAlumni: [
      {
        id: 'alm-ice-01',
        name: 'ইঞ্জিনিয়ার মুবাশ্বিরুল ইসলাম',
        departmentId: 'dept-ice',
        departmentBn: 'ইনফরমেশন অ্যান্ড কমিউনিকেশন ইঞ্জিনিয়ারিং',
        session: '২০১০-২০১১',
        currentRole: 'Principal Core Network Architect',
        currentOrganization: 'Grameenphone Ltd (Telenor Group)',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৮১৮-৩৩৪৪৭৭',
        email: 'mubashir.ice@grameenphone.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801818334477',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'বাংলাদেশে 5G ট্রায়াল কোর নেটওয়ার্ক ডিজাইনিংয়ের সমন্বয়ক।'
      }
    ]
  },
  {
    id: 'dept-eee',
    nameBn: 'ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং (EEE)',
    nameEn: 'Electrical & Electronic Engineering',
    code: 'EEE',
    facultyId: 'engineering',
    facultyBn: 'প্রকৌশল অনুষদ',
    establishedYear: 2015,
    seatCount: 50,
    degreeOfferedBn: 'বি.এস-সি. ইঞ্জিনিয়ারিং (EEE)',
    degreesEn: 'B.Sc. Engg. in EEE',
    locationBuildingBn: 'প্রকৌশল অনুষদ ভবন (দ্বিতীয় তলা)',
    overviewBn: 'বিদ্যুৎ উৎপাদন, স্মার্ট গ্রিড, নবায়নযোগ্য শক্তি, সেমিকন্ডাক্টর মাইক্রোচিপ ডিজাইন ও ভিএলএসআই প্রযুক্তির শীর্ষ প্রকৌশল বিভাগ।',
    careerInBangladesh: {
      sectors: ['পাওয়ার গ্রিড কোম্পানি (PGCB)', 'রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্র', 'ডেসকো/নেসকো/ডিপিডিসি', 'সেমিকন্ডাক্টর ডিজাইন ফার্ম (Ultrasoic, NeuralSemi)', 'ওয়ালটন ও ইলেকট্রনিক্স ম্যানুফ্যাকচারিং'],
      popularRoles: ['Power Systems Engineer', 'VLSI Design Engineer', 'Automation & Robotics Engineer', 'Substation Protection Specialist'],
      descriptionBn: 'বিদ্যুৎ খাতের মেগা প্রজেক্ট এবং নবজাত সেমিকন্ডাক্টর চিপ ডিজাইন শিল্পে প্রচুর কর্মসংস্থান সৃষ্টি হচ্ছে।'
    },
    careerAbroad: {
      studyFields: ['Semiconductor Physics & Nanotechnology', 'Smart Renewable Energy Grids', 'Autonomous Vehicle Electronics'],
      targetCountries: ['তাইওয়ান (TSMC ল্যাব)', 'আমেরিকা (ইন্টেল/এনভিডিয়া)', 'জার্মানি', 'জাপান'],
      descriptionBn: 'বিশ্বখ্যাত চিপ মেকার প্রতিষ্ঠান ও অটোমোবাইল ইন্ডাস্ট্রিতে ব্যাপক চাহিদা।'
    },
    sampleAlumni: [
      {
        id: 'alm-eee-01',
        name: 'রাশেদুল করিম সৌরভ',
        departmentId: 'dept-eee',
        departmentBn: 'ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং',
        session: '২০১৬-২০১৭',
        currentRole: 'Senior Protection & Automation Engineer',
        currentOrganization: 'Power Grid Company of Bangladesh (PGCB)',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭৫১-৮৮৯৯০০',
        email: 'rashedul.eee@pgcb.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801751889900',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'জাতীয় গ্রিড অটোমেশন ও ফল্ট অ্যানালাইসিসে জাতীয় প্রশংসাপত্র প্রাপ্ত।'
      }
    ]
  },
  {
    id: 'dept-acce',
    nameBn: 'অ্যাপ্লাইড কেমিস্ট্রি অ্যান্ড কেমিক্যাল ইঞ্জিনিয়ারিং (ACCE)',
    nameEn: 'Applied Chemistry & Chemical Engineering',
    code: 'ACCE',
    facultyId: 'engineering',
    facultyBn: 'প্রকৌশল অনুষদ',
    establishedYear: 1967,
    seatCount: 60,
    degreeOfferedBn: 'বি.এস-সি. ইঞ্জিনিয়ারিং (ACCE), এম.এস-সি. ইঞ্জিনিয়ারিং',
    degreesEn: 'B.Sc. Engg., M.Sc. Engg.',
    locationBuildingBn: 'বিজ্ঞান ভবন-২ (পশ্চিম উইং)',
    overviewBn: 'কেমিক্যাল প্রসেস প্ল্যান্ট, পেট্রোকেমিক্যাল, পলিমার, ওষুধ উৎপাদন ও টেক্সটাইল ডাইং কেমিক্যালের অন্যতম প্রাচীন ও ঐতিহ্যবাহী বিভাগ।',
    careerInBangladesh: {
      sectors: ['পেট্রোবাংলা ও ইস্টার্ন রিফাইনারি', 'ফার্মাসিউটিক্যাল কাঁচামাল প্ল্যান্ট', 'সিমেন্ট ও সার কারখানা (BCIC)', 'বিসিএসআইআর (BCSIR)', 'পেইন্টস ও টেক্সটাইল কেমিক্যাল'],
      popularRoles: ['Process Engineer', 'Chemical Plant Manager', 'Quality Assurance Director', 'R&D Formulation Chemist'],
      descriptionBn: 'বাংলাদেশের ভারি শিল্প, সার কারখানা ও ওষুধ শিল্পের উৎপাদন প্রক্রিয়ায় এই বিভাগের গ্র্যাজুয়েটরা নেতৃত্ব দিচ্ছেন।'
    },
    careerAbroad: {
      studyFields: ['Polymer Science & Biomaterials', 'Catalysis & Green Energy', 'Petroleum Engineering'],
      targetCountries: ['কানাডা', 'যুক্তরাষ্ট্র', 'দক্ষিণ কোরিয়া', 'সৌদি আরব (Aramco)'],
      descriptionBn: 'বিশ্বের শীর্ষ তেল কোম্পানি ও মেটেরিয়ালস সায়েন্স ল্যাবে উচ্চ বেতনের চাকরি।'
    },
    sampleAlumni: [
      {
        id: 'alm-acce-01',
        name: 'ড. ফারহানা হক',
        departmentId: 'dept-acce',
        departmentBn: 'অ্যাপ্লাইড কেমিস্ট্রি অ্যান্ড কেমিক্যাল ইঞ্জিনিয়ারিং',
        session: '২০০৮-২০০৯',
        currentRole: 'Principal Formulation Scientist',
        currentOrganization: 'Incepta Pharmaceuticals Ltd',
        location: 'সাভার, ঢাকা',
        email: 'farhana.acce@inceptapharma.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801912556677',
        imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'লাইফ-সেভিং বায়োসিমিলার ইনজেকশন ফর্মুলেশন গবেষণায় পেটেন্ট।'
      }
    ]
  },
  {
    id: 'dept-ce',
    nameBn: 'সিভিল ইঞ্জিনিয়ারিং (CE)',
    nameEn: 'Civil Engineering',
    code: 'CE',
    facultyId: 'engineering',
    facultyBn: 'প্রকৌশল অনুষদ',
    establishedYear: 2016,
    seatCount: 50,
    degreeOfferedBn: 'বি.এস-সি. ইঞ্জিনিয়ারিং (Civil)',
    degreesEn: 'B.Sc. Engg. in Civil',
    locationBuildingBn: 'প্রকৌশল অনুষদ ভবন (গ্রাউন্ড ফ্লোর)',
    overviewBn: 'মেগা স্ট্রাকচারাল ডিজাইন, ব্রিজ ও হাইওয়ে ইঞ্জিনিয়ারিং, ভূগর্ভস্থ টানেল, পরিবেশ ও জলসম্পদ ব্যবস্থাপনার শীর্ষ বিভাগ।',
    careerInBangladesh: {
      sectors: ['সড়ক ও জনপথ অধিদপ্তর (RHD)', 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED)', 'পদ্মা সেতু ও মেট্রোরেল অথরিটি', 'রিয়েল এস্টেট ও কনসাল্টিং ফার্ম', 'বাংলাদেশ পানি উন্নয়ন বোর্ড (BWDB)'],
      popularRoles: ['Structural Design Engineer', 'Project Manager (Construction)', 'Geotechnical Engineer', 'Transportation Planner'],
      descriptionBn: 'বাংলাদেশের মেগা অবকাঠামো উন্নয়ন ও বিসিএস পাবলিক ওয়ার্কস ক্যাডারে সরাসরি চাহিদাসম্পন্ন।'
    },
    careerAbroad: {
      studyFields: ['Earthquake Engineering & Seismic Design', 'Smart Cities & Transportation Infrastructure', 'Water Resources Management'],
      targetCountries: ['কানাডা', 'অস্ট্রেলিয়া', 'সিঙ্গাপুর', 'যুক্তরাজ্য'],
      descriptionBn: 'গ্লোবাল কনস্ট্রাকশন ও কনসালট্যান্সি ফার্মে প্রফেশনাল ইঞ্জিনিয়ার (PE) হিসেবে কাজ করার সুযোগ।'
    },
    sampleAlumni: [
      {
        id: 'alm-ce-01',
        name: 'ইঞ্জিনিয়ার রেজওয়ান আহমেদ',
        departmentId: 'dept-ce',
        departmentBn: 'সিভিল ইঞ্জিনিয়ারিং',
        session: '২০১৬-২০১৭',
        currentRole: 'Assistant Project Director (Structures)',
        currentOrganization: 'Dhaka Mass Transit Company Ltd (MRT-5)',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭২২-৪৪৩৩৫৫',
        email: 'rezwan.ce@dmtcl.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801722443355',
        imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'মেট্রোরেল আন্ডারগ্রাউন্ড টানেল ভায়াডাক্ট ডিজাইনে প্রকৌশল দলের অংশ।'
      }
    ]
  },

  // ==========================================
  // FACULTY OF SCIENCE
  // ==========================================
  {
    id: 'dept-pharmacy',
    nameBn: 'ফার্মেসি বিভাগ (Pharmacy)',
    nameEn: 'Department of Pharmacy',
    code: 'PHR',
    facultyId: 'science',
    facultyBn: 'বিজ্ঞান অনুষদ',
    establishedYear: 1980,
    seatCount: 50,
    degreeOfferedBn: 'বি.ফার্ম. (অনার্স), এম.ফার্ম.',
    degreesEn: 'B.Pharm (Hons), M.Pharm',
    locationBuildingBn: 'ফার্মেসি ভবন (বিজ্ঞান কমপ্লেক্স)',
    overviewBn: 'ঔষধ উদ্ভাবন, ড্রাগ ডেভেলপমেন্ট ও ক্লিনিক্যাল ফার্মাসিউটিক্যাল গবেষণায় রাজশাহী বিশ্ববিদ্যালয়ের অন্যতম নন্দিত ও প্রিমিয়ার বিভাগ।',
    careerInBangladesh: {
      sectors: ['শীর্ষ ওষুধ প্রস্তুতকারী কোম্পানি (Square, Beximco, Incepta, Renata)', 'ঔষধ প্রশাসন অধিদপ্তর (DGDA)', 'ক্লিনিক্যাল ফার্মাসিস্ট (Square Hospital, Evercare)', 'বিসিএস ড্রাগ ক্যাডার', 'বিশ্ববিদ্যালয় শিক্ষকতা ও গবেষণা'],
      popularRoles: ['Production Officer / Plant Manager', 'Quality Control & QA Lead', 'Regulatory Affairs Specialist', 'Hospital Clinical Pharmacist', 'Product Management Executive'],
      descriptionBn: 'বাংলাদেশের শতভাগ ফার্মাসিউটিক্যালস এক্সপোর্ট কোম্পানিতে রাবি ফার্মেসি গ্র্যাজুয়েটরা কি-পজিশনে দায়িত্ব পালন করছেন।'
    },
    careerAbroad: {
      studyFields: ['Molecular Pharmacology & Toxicology', 'Drug Delivery Systems & Nanomedicine', 'Clinical Pharmacy & Translational Medicine'],
      targetCountries: ['মার্কিন যুক্তরাষ্ট্র (FDA স্বীকৃত ল্যাব)', 'যুক্তরাজ্য', 'কানাডা', 'জার্মানি', 'অস্ট্রেলিয়া'],
      descriptionBn: 'আমেরিকান ও ইউরোপিয়ান ফার্মাসিউটিক্যাল জায়ান্ট (Pfizer, Moderna, Novartis)-এ পোস্ট-ডক্টোরাল রিসার্চ ও উচ্চ বেতনের চাকরি।'
    },
    sampleAlumni: [
      {
        id: 'alm-pharm-01',
        name: 'ড. নাজমুল হুদা বাবু',
        departmentId: 'dept-pharmacy',
        departmentBn: 'ফার্মেসি বিভাগ',
        session: '২০০৫-২০০৬',
        currentRole: 'Director of Global Regulatory Affairs',
        currentOrganization: 'Square Pharmaceuticals PLC',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭১১-৫৬৭৮৯০',
        email: 'nazmul.phr@squaregroup.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801711567890',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'ইউরোপীয় ইউনিয়ন ও ইউএস-এফডিএ সার্টিফিকেশন অর্জনে নেতৃত্ব।'
      }
    ]
  },
  {
    id: 'dept-physics',
    nameBn: 'পদার্থবিজ্ঞান বিভাগ (Physics)',
    nameEn: 'Department of Physics',
    code: 'PHY',
    facultyId: 'science',
    facultyBn: 'বিজ্ঞান অনুষদ',
    establishedYear: 1958,
    seatCount: 55,
    degreeOfferedBn: 'বি.এস-সি. (অনার্স), এম.এস-সি., এম.ফিল., পিএইচ.ডি.',
    degreesEn: 'B.Sc. (Hons), M.Sc., Ph.D.',
    locationBuildingBn: 'বিজ্ঞান ভবন-১ (প্রথম ও দ্বিতীয় তলা)',
    overviewBn: 'রাবির গৌরবময় বিজ্ঞান গবেষণার ভিত্তি। নিউক্লিয়ার ফিজিক্স, মেটেরিয়ালস সাইন্স, কোয়ান্টাম মেকানিক্স ও অ্যাস্ট্রোফিজিক্সে আন্তর্জাতিক মানের গবেষণাগার বিদ্যমান।',
    careerInBangladesh: {
      sectors: ['বাংলাদেশ পরমাণু শক্তি কমিশন (BAEC)', 'মহাকাশ গবেষণা ও দূর অনুধাবন প্রতিষ্ঠান (SPARSO)', 'রূপপুর নিউক্লিয়ার পাওয়ার প্ল্যান্ট', 'বিসিএস শিক্ষা ও প্রশাসন ক্যাডার', 'আবহাওয়া অধিদপ্তর ও পেট্রোবাংলা'],
      popularRoles: ['Scientific Officer (Nuclear Energy)', 'Medical Physicist (Radiotherapy)', 'Data & Mathematical Modeling Analyst', 'College/University Faculty'],
      descriptionBn: 'দেশের পারমাণবিক বিদ্যুৎ কেন্দ্র ও আন্তর্জাতিক গবেষণা প্রতিষ্ঠানে সরাসরি বৈজ্ঞানিক কর্মকর্তা হিসেবে নিয়োগ।'
    },
    careerAbroad: {
      studyFields: ['High Energy Particle Physics (CERN ল্যাব)', 'Condensed Matter & Superconductivity', 'Astrophysics & Space Science'],
      targetCountries: ['সুইজারল্যান্ড (CERN)', 'যুক্তরাষ্ট্র', 'জার্মানি (Max Planck Institute)', 'জাপান'],
      descriptionBn: 'নাসা ও বিশ্বের শীর্ষ তাত্ত্বিক পদার্থবিজ্ঞান কেন্দ্রে রাবি অ্যালামনাইদের সরাসরি পদচারণা রয়েছে।'
    },
    sampleAlumni: [
      {
        id: 'alm-phy-01',
        name: 'ড. মো. আসাদুজ্জামান',
        departmentId: 'dept-physics',
        departmentBn: 'পদার্থবিজ্ঞান বিভাগ',
        session: '২০০২-২০০৩',
        currentRole: 'Principal Scientific Officer & Reactor Specialist',
        currentOrganization: 'Bangladesh Atomic Energy Commission (BAEC)',
        location: 'ঢাকা, বাংলাদেশ',
        email: 'asad.phy@baec.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801819223344',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'রূপপুর পারমাণবিক বিদ্যুৎকেন্দ্রের সেফটি অডিট কোর দলের সদস্য।'
      }
    ]
  },
  {
    id: 'dept-chemistry',
    nameBn: 'রসায়ন বিভাগ (Chemistry)',
    nameEn: 'Department of Chemistry',
    code: 'CHE',
    facultyId: 'science',
    facultyBn: 'বিজ্ঞান অনুষদ',
    establishedYear: 1958,
    seatCount: 55,
    degreeOfferedBn: 'বি.এস-সি. (অনার্স), এম.এস-সি., পিএইচ.ডি.',
    degreesEn: 'B.Sc. (Hons), M.Sc., Ph.D.',
    locationBuildingBn: 'বিজ্ঞান ভবন-২ (প্রথম তলা)',
    overviewBn: 'জৈব রসায়ন, অজৈব ন্যানোম্যাটেরিয়ালস ও পলিমার সংশ্লেষণের অন্যতম পুরোধা বিভাগ।',
    careerInBangladesh: {
      sectors: ['ওষুধ শিল্প ও ডায়াগনস্টিকস', 'বিএসটিআই (BSTI) কেমিক্যাল অ্যানালিস্ট', 'বিসিএস ক্যাডার', 'বিসিএসআইআর বিজ্ঞানী', 'প্যাকেজিং ও ফুড প্রসেসিং ইন্ডাস্ট্রি'],
      popularRoles: ['Analytical Chemist', 'Quality Assurance Auditor', 'Drug Synthesis Specialist', 'Government Analyst (Narcotics & Crime Lab)'],
      descriptionBn: 'সরকারি রাসায়নিক পরীক্ষাগার ও ফার্মাসিউটিক্যাল আরঅ্যান্ডডিতে অপরিহার্য চাহিদা।'
    },
    careerAbroad: {
      studyFields: ['Organic Synthesis & Medicinal Chemistry', 'Battery Chemistry & Renewable Storage', 'Nanomaterials Chemistry'],
      targetCountries: ['জার্মানি', 'যুক্তরাষ্ট্র', 'কোরিয়া', 'সুইজারল্যান্ড'],
      descriptionBn: 'উচ্চশিক্ষায় শতভাগ ফান্ডেড পিএইচডি স্কলারশিপ সুবিধা।'
    },
    sampleAlumni: [
      {
        id: 'alm-chem-01',
        name: 'সোহেল রানা',
        departmentId: 'dept-chemistry',
        departmentBn: 'রসায়ন বিভাগ',
        session: '২০১১-২০১২',
        currentRole: 'Head of Quality Assurance',
        currentOrganization: 'Beximco Pharmaceuticals Ltd',
        location: 'টঙ্গী, গাজীপুর',
        phone: '০১৭৩৩-৪৪৩৩৫৫',
        email: 'sohel.chem@beximco.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801733443355',
        imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'ইউএস এফডিএ পরিদর্শন টিমের প্রধান প্রযুক্তিগত উপস্থাপক।'
      }
    ]
  },
  {
    id: 'dept-stat',
    nameBn: 'পরিসংখ্যান বিভাগ (Statistics)',
    nameEn: 'Department of Statistics',
    code: 'STAT',
    facultyId: 'science',
    facultyBn: 'বিজ্ঞান অনুষদ',
    establishedYear: 1961,
    seatCount: 80,
    degreeOfferedBn: 'বি.এস-সি. (অনার্স), এম.এস-সি., এম.ফিল.',
    degreesEn: 'B.Sc. (Hons), M.Sc.',
    locationBuildingBn: 'বিজ্ঞান ভবন-১ (তৃতীয় তলা)',
    overviewBn: 'ডাটা সায়েন্স, মেশিন লার্নিং, বায়োস্ট্যাটিস্টিকস ও কোয়ান্টিটেটিভ ইকোনমিক মডেলিংয়ের অগ্রদূত বিভাগ।',
    careerInBangladesh: {
      sectors: ['ডাটা সায়েন্স ও এআই প্রতিষ্ঠান', 'বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS)', 'আন্তর্জাতিক স্বাস্থ্য গবেষণা কেন্দ্র (ICDDR,B)', 'সরকারি ও বেসরকারি ব্যাংক', 'টেলিকম ও মার্কেট রিসার্চ এজেন্সি'],
      popularRoles: ['Data Scientist / Biostatistician', 'Quantitative Risk Analyst', 'Statistical Officer (BCS Statistics Cadre)', 'Big Data & ML Engineer'],
      descriptionBn: 'বর্তমান বিশ্বের সবচেয়ে চাহিদাসম্পন্ন পেশা ডাটা সায়েন্টিস্ট ও বিগ ডাটা অ্যানালিস্ট তৈরিতে দেশের শীর্ষ বিভাগ।'
    },
    careerAbroad: {
      studyFields: ['Machine Learning & AI Theory', 'Biostatistics & Genomic Data Analysis', 'Financial Econometrics & Actuarial Science'],
      targetCountries: ['আমেরিকা', 'কানাডা', 'অস্ট্রেলিয়া', 'নেদারল্যান্ডস'],
      descriptionBn: 'ওয়াল স্ট্রিট, বিশ্ব স্বাস্থ্য সংস্থা (WHO) ও সিলিকন ভ্যালিতে প্রচুর অ্যালামনাই।'
    },
    sampleAlumni: [
      {
        id: 'alm-stat-01',
        name: 'তৌহিদুল ইসলাম তপু',
        departmentId: 'dept-stat',
        departmentBn: 'পরিসংখ্যান বিভাগ',
        session: '২০১২-২০১৩',
        currentRole: 'Lead Data Scientist',
        currentOrganization: 'ShopUp / Vポン Technology',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭৫২-৯৯৮৮৭৭',
        email: 'touhid.stat@alumni.ru.ac.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801752998877',
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'ই-কমার্স ক্রেডিট স্কোরিং এআই অ্যালগরিদম তৈরির নেতৃত্ব।'
      }
    ]
  },

  // ==========================================
  // FACULTY OF LAW
  // ==========================================
  {
    id: 'dept-law',
    nameBn: 'আইন বিভাগ (Law)',
    nameEn: 'Department of Law',
    code: 'LAW',
    facultyId: 'law',
    facultyBn: 'আইন অনুষদ',
    establishedYear: 1953,
    seatCount: 110,
    degreeOfferedBn: 'এলএল.বি. (অনার্স), এলএল.এম., পিএইচ.ডি.',
    degreesEn: 'LL.B. (Hons), LL.M., Ph.D.',
    locationBuildingBn: 'রবীন্দ্র কলা ভবন (দক্ষিণ উইং)',
    overviewBn: 'বাংলাদেশের আইন অঙ্গনের এক জীবন্ত ইতিহাস। দেশের সর্বোচ্চ আদালত সুপ্রিম কোর্ট, জুডিশিয়ারি এবং আইন মন্ত্রণালয়ে রাবি আইন বিভাগের গ্র্যাজুয়েটরা যুগ যুগ ধরে শীর্ষ ভূমিকা রেখে আসছেন।',
    careerInBangladesh: {
      sectors: ['বাংলাদেশ জুডিশিয়াল সার্ভিস (BJS) - সহকারী জজ/ম্যাজিস্ট্রেট', 'বাংলাদেশ সুপ্রিম কোর্ট আইনজীবী', 'করপোরেট লিগ্যাল অ্যাডভাইজার (টেলিকম, ব্যাংক, এমএনসি)', 'জাতীয় মানবাধিকার কমিশন ও আইন মন্ত্রণালয়', 'বিসিএস প্রশাসন ও পুলিশ ক্যাডার'],
      popularRoles: ['Assistant Judge / Senior Judicial Magistrate', 'Supreme Court Advocate', 'Chief Legal Officer (CLO)', 'Legal Compliance Consultant', 'Law Professor & Researcher'],
      descriptionBn: 'বিজেএস (BJS) সহকারী জজ পরীক্ষায় প্রতি বছরই রাবি আইন বিভাগের সর্বোচ্চ সংখ্যক শিক্ষার্থী মেধা তালিকায় স্থান পায়।'
    },
    careerAbroad: {
      studyFields: ['International Human Rights Law', 'Corporate & Cyber Commercial Law', 'Maritime Law & Arbitration'],
      targetCountries: ['যুক্তরাজ্য (Bar-at-Law / LL.M)', 'আমেরিকা (Harvard/Columbia LLM)', 'নেদারল্যান্ডস (হেগ আন্তর্জাতিক আদালত)', 'কানাডা'],
      descriptionBn: 'ব্যারিস্টার-অ্যাট-ল ডিগ্রি এবং আন্তর্জাতিক আদালতে লিগ্যাল রিপ্রেজেন্টেটিভ হিসেবে ক্যারিয়ার।'
    },
    sampleAlumni: [
      {
        id: 'alm-law-01',
        name: 'ব্যারিস্টার নাজমুল আহসান লিংকন',
        departmentId: 'dept-law',
        departmentBn: 'আইন বিভাগ',
        session: '২০০৬-২০০৭',
        currentRole: 'Advocate, Supreme Court of Bangladesh & Barrister-at-Law (Lincoln\'s Inn)',
        currentOrganization: 'Ahsan & Associates Legal Chambers',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৮১৬-৭৭৮৮৯৯',
        email: 'nazmul.barrister@supremecourt.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801816778899',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'সংবিধান ও করপোরেট আইনে শীর্ষ আইনজীবী, সুপ্রিম কোর্টের বিশিষ্ট প্র্যাকটিশনার।'
      },
      {
        id: 'alm-law-02',
        name: 'ফারজানা ইয়াসমিন ইতি',
        departmentId: 'dept-law',
        departmentBn: 'আইন বিভাগ',
        session: '২০১৫-২০১৬',
        currentRole: 'Senior Judicial Magistrate',
        currentOrganization: 'Bangladesh Judicial Service (BJS)',
        location: 'রাজশাহী জেলা জজ আদালত',
        phone: '০১৭৬৬-১১২২৩৩',
        email: 'farzana.judge@bjs.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801766112233',
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
        achievementBn: '১৪তম বিজেএস পরীক্ষায় মেধা তালিকায় ৫ম স্থান অর্জনকারী।'
      }
    ]
  },
  {
    id: 'dept-lla',
    nameBn: 'আইন ও ভূমি প্রশাসন বিভাগ (LLA)',
    nameEn: 'Department of Law & Land Administration',
    code: 'LLA',
    facultyId: 'law',
    facultyBn: 'আইন অনুষদ',
    establishedYear: 2015,
    seatCount: 60,
    degreeOfferedBn: 'এলএল.বি. (অনার্স) ইন এলএলএ, এলএল.এম.',
    degreesEn: 'LL.B. (Hons) in LLA, LL.M.',
    locationBuildingBn: 'রবীন্দ্র কলা ভবন (চতুর্থ তলা)',
    overviewBn: 'ভূমি আইন, ভূমি রেকর্ড ও জরিপ, রিয়েল এস্টেট প্রপার্টি আইন এবং জুডিশিয়াল প্র্যাকটিসের বিশেষায়িত আইন বিভাগ।',
    careerInBangladesh: {
      sectors: ['বাংলাদেশ জুডিশিয়াল সার্ভিস (BJS)', 'সহকারী কমিশনার (ভূমি) ও বিসিএস প্রশাসন', 'ভূমি মন্ত্রণালয় ও ভূমি রেকর্ড অধিদপ্তর', 'রিয়েল এস্টেট করপোরেট লিগ্যাল সেল', 'সুপ্রিম কোর্ট প্র্যাকটিস'],
      popularRoles: ['Judicial Magistrate', 'Land Legal Counsel', 'Property Acquisition Specialist', 'Corporate Real Estate Attorney'],
      descriptionBn: 'ভূমি বিরোধ নিষ্পত্তি ও দেওয়ানি আইন পরিচালনায় দেশের একমাত্র বিশেষায়িত অনুষদীয় প্রোগ্রাম।'
    },
    careerAbroad: {
      studyFields: ['Environmental & Property Law', 'Urban Planning & Land Governance', 'International Real Estate Law'],
      targetCountries: ['অস্ট্রেলিয়া', 'যুক্তরাজ্য', 'কানাডা'],
      descriptionBn: 'আন্তর্জাতিক ল্যান্ড গভর্নেন্স প্রজেক্টে কনসালট্যান্ট হিসেবে কাজের সুযোগ।'
    },
    sampleAlumni: [
      {
        id: 'alm-lla-01',
        name: 'সৈকত হোসেন আকাশ',
        departmentId: 'dept-lla',
        departmentBn: 'আইন ও ভূমি প্রশাসন বিভাগ',
        session: '২০১৬-২০১৭',
        currentRole: 'Assistant Judge',
        currentOrganization: 'Bangladesh Judicial Service Commission',
        location: 'বগুড়া জেলা জজ আদালত',
        phone: '০১৯১১-২২৩৩৪৪',
        email: 'saikat.judge@bjs.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801911223344',
        imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        achievementBn: '১৫তম বিজেএস পরীক্ষায় প্রথমবারেই সহকারী জজ পদে নির্বাচিত।'
      }
    ]
  },

  // ==========================================
  // FACULTY OF BUSINESS STUDIES
  // ==========================================
  {
    id: 'dept-ais',
    nameBn: 'হিসাববিজ্ঞান ও তথ্য ব্যবস্থা (AIS)',
    nameEn: 'Accounting & Information Systems',
    code: 'AIS',
    facultyId: 'business',
    facultyBn: 'ব্যবসায় প্রশাসন অনুষদ',
    establishedYear: 1972,
    seatCount: 110,
    degreeOfferedBn: 'বিবিএ (অনার্স), এমবিএ, পিএইচ.ডি.',
    degreesEn: 'BBA (Hons), MBA, Ph.D.',
    locationBuildingBn: 'সিরাজী ভবন (দ্বিতীয় ও তৃতীয় তলা)',
    overviewBn: 'চার্টার্ড অ্যাকাউন্ট্যান্সি, কর্পোরেট ট্যাক্সেশন, অডিট ও ফিন্যান্সিয়াল অ্যানালিটিক্সে রাজশাহী বিশ্ববিদ্যালয়ের প্রধানতম ফ্ল্যাগশিপ বিভাগ।',
    careerInBangladesh: {
      sectors: ['বিগ ফোর ও জাতীয় সিএ ফার্ম (CA, CMA, ACCA)', 'বহুজাতিক কোম্পানি (Unilever, BAT, Nestlé)', 'বাংলাদেশ ব্যাংক ও বাণিজ্যিক ব্যাংকসমূহ', 'বিসিএস অডিট ও একাউন্টস ক্যাডার, কর ক্যাডার', 'করপোরেট ইন্টারনাল অডিট ও ফাইন্যান্স'],
      popularRoles: ['Chartered Accountant (CA)', 'Chief Financial Officer (CFO)', 'Audit Director', 'Taxation & Regulatory Lead', 'Financial Controller'],
      descriptionBn: 'দেশের শীর্ষ শিল্পগোষ্ঠী ও করপোরেট প্রতিষ্ঠানে সিএফও ও প্রধান অডিটর পদে সবচেয়ে বেশি রয়েছে এই বিভাগের অ্যালামনাই।'
    },
    careerAbroad: {
      studyFields: ['Professional Accounting (CPA, ACCA)', 'Forensic Accounting & Fraud Examination', 'Corporate Governance & FinTech'],
      targetCountries: ['যুক্তরাজ্য', 'কানাডা (CPA Canada)', 'যুক্তরাষ্ট্র', 'দুবাই ও মধ্যপ্রাচ্য'],
      descriptionBn: 'গ্লোবাল অডিট ফার্ম (PwC, EY, KPMG, Deloitte)-এ সরাসরি আন্তর্জাতিক প্লেসমেন্ট।'
    },
    sampleAlumni: [
      {
        id: 'alm-ais-01',
        name: 'আহমেদ ফারুক এফসিএ (FCA)',
        departmentId: 'dept-ais',
        departmentBn: 'হিসাববিজ্ঞান ও তথ্য ব্যবস্থা',
        session: '২০০৪-২০০৫',
        currentRole: 'Partner & Head of Audit',
        currentOrganization: 'Hoda Vasi Chowdhury & Co (Chartered Accountants)',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭২২-৯৯০০১১',
        email: 'faruk.ais@hodavasi.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801722990011',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'আইসিএবি (ICAB) কাউন্সিল মেম্বার ও শীর্ষ চার্টার্ড অ্যাকাউন্ট্যান্ট।'
      }
    ]
  },
  {
    id: 'dept-finance',
    nameBn: 'ফাইন্যান্স বিভাগ (Finance)',
    nameEn: 'Department of Finance',
    code: 'FIN',
    facultyId: 'business',
    facultyBn: 'ব্যবসায় প্রশাসন অনুষদ',
    establishedYear: 1981,
    seatCount: 100,
    degreeOfferedBn: 'বিবিএ (অনার্স), এমবিএ',
    degreesEn: 'BBA (Hons), MBA',
    locationBuildingBn: 'সিরাজী ভবন (চতুর্থ তলা)',
    overviewBn: 'কর্পোরেট ফিন্যান্স, ক্যাপিটাল মার্কেট, ইনভেস্টমেন্ট ব্যাংকিং ও ফিন্যান্সিয়াল ডেরিভেটিভস গবেষণায় অগ্রগামী বিভাগ।',
    careerInBangladesh: {
      sectors: ['বাংলাদেশ ব্যাংক (সহকারী পরিচালক)', 'বাণিজ্যিক ও মার্চেন্ট ব্যাংকসমূহ', 'স্টক এক্সচেঞ্জ (DSE/CSE) ব্রোকারেজ ও ইনভেস্টমেন্ট ফার্ম', 'বহুজাতিক আর্থিক প্রতিষ্ঠান (Standard Chartered, HSBC)', 'বিসিএস শুল্ক ও আবগারি / সাধারণ ক্যাডার'],
      popularRoles: ['Investment Banker', 'Equity Research Analyst', 'Treasury & Risk Manager', 'Asset Portfolio Strategist'],
      descriptionBn: 'বাংলাদেশ ব্যাংকের এডি (AD) পরীক্ষা ও কর্পোরেট ব্যাংকিংয়ে এই বিভাগের শিক্ষার্থীরা শীর্ষ সাফল্য অর্জন করে।'
    },
    careerAbroad: {
      studyFields: ['Quantitative Finance & Financial Engineering', 'Chartered Financial Analyst (CFA)', 'FinTech & Blockchain Economics'],
      targetCountries: ['আমেরিকা', 'যুক্তরাজ্য (লন্ডন ফিন্যান্স হাব)', 'সিঙ্গাপুর', 'কানাডা'],
      descriptionBn: 'ওয়াল স্ট্রিট ও আন্তর্জাতিক ইনভেস্টমেন্ট ফার্মগুলোতে উচ্চ বেতনের ক্যারিয়ার।'
    },
    sampleAlumni: [
      {
        id: 'alm-fin-01',
        name: 'মাহমুদুল হাসান শোভন',
        departmentId: 'dept-finance',
        departmentBn: 'ফাইন্যান্স বিভাগ',
        session: '২০১১-২০১২',
        currentRole: 'Vice President & Head of Treasury',
        currentOrganization: 'Eastern Bank PLC (EBL)',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭৫১-১১২২৩৩',
        email: 'mahmud.fin@ebl.com.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801751112233',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'বাংলাদেশ ব্যাংক প্রাইমারি ডিলার কমিটির বিশিষ্ট ট্রেজারি ব্যক্তিত্ব।'
      }
    ]
  },
  {
    id: 'dept-marketing',
    nameBn: 'মার্কেটিং বিভাগ (Marketing)',
    nameEn: 'Department of Marketing',
    code: 'MKT',
    facultyId: 'business',
    facultyBn: 'ব্যবসায় প্রশাসন অনুষদ',
    establishedYear: 1972,
    seatCount: 100,
    degreeOfferedBn: 'বিবিএ (অনার্স), এমবিএ',
    degreesEn: 'BBA (Hons), MBA',
    locationBuildingBn: 'সিরাজী ভবন (প্রথম তলা)',
    overviewBn: 'ব্র্যান্ড বিল্ডিং, ডিজিটাল মার্কেটিং, ভোক্তা আচরণ ও আন্তর্জাতিক বাণিজ্য গবেষণার শীর্ষ বিভাগ।',
    careerInBangladesh: {
      sectors: ['বহুজাতিক এফএমসিজি (Unilever, Marico, Reckitt, Nestle)', 'টেলিকম ও ফিনটেক ব্র্যান্ডিং সেল', 'বিজ্ঞাপনী ও মিডিয়া এজেন্সি (Grey, Ogilvy)', 'ই-কমার্স প্রতিষ্ঠান (Daraz, Chaldal)', 'বিসিএস ক্যাডার'],
      popularRoles: ['Brand Manager', 'Head of Digital Marketing', 'Trade Marketing & Distribution Lead', 'Creative Strategist'],
      descriptionBn: 'বাংলাদেশের বিজ্ঞাপন ও কর্পোরেট ব্র্যান্ডিং দুনিয়ায় রাবি মার্কেটিংয়ের গ্র্যাজুয়েটদের শক্ত প্রভাব রয়েছে।'
    },
    careerAbroad: {
      studyFields: ['Digital Marketing Analytics & Consumer Psychology', 'Global Brand Leadership', 'E-Commerce Strategy'],
      targetCountries: ['যুক্তরাজ্য', 'অস্ট্রেলিয়া', 'ইউরোপ', 'কানাডা'],
      descriptionBn: 'গ্লোবাল কর্পোরেশনে কান্ট্রি ব্র্যান্ড হেড হিসেবে নিয়োগ।'
    },
    sampleAlumni: [
      {
        id: 'alm-mkt-01',
        name: 'তানজিলা রশীদ চৌধুরী',
        departmentId: 'dept-marketing',
        departmentBn: 'মার্কেটিং বিভাগ',
        session: '২০১০-২০১১',
        currentRole: 'Senior Brand Manager (Personal Care)',
        currentOrganization: 'Unilever Bangladesh Ltd',
        location: 'ঢাকা, বাংলাদেশ',
        email: 'tanjila.mkt@unilever.com',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801712998877',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'জাতীয় '
      }
    ]
  },

  // ==========================================
  // FACULTY OF ARTS
  // ==========================================
  {
    id: 'dept-english',
    nameBn: 'ইংরেজি বিভাগ (English)',
    nameEn: 'Department of English',
    code: 'ENG',
    facultyId: 'arts',
    facultyBn: 'কলা অনুষদ',
    establishedYear: 1953,
    seatCount: 100,
    degreeOfferedBn: 'বি.এ. (অনার্স), এম.এ., পিএইচ.ডি.',
    degreesEn: 'B.A. (Hons), M.A., Ph.D.',
    locationBuildingBn: 'শহীদুল্লাহ কলা ভবন (দ্বিতীয় তলা)',
    overviewBn: 'রাজশাহী বিশ্ববিদ্যালয়ের অন্যতম মর্যাদাপূর্ণ ও ঐতিহ্যবাহী বিভাগ। ক্লাসিক্যাল ও মডার্ন লিটারেচার, ফলিত ভাষাবিজ্ঞান (ELT) ও ক্রিয়েটিভ রাইটিংয়ে সমৃদ্ধ।',
    careerInBangladesh: {
      sectors: ['বিসিএস (পররাষ্ট্র, প্রশাসন, পুলিশ, শিক্ষা)', 'আন্তর্জাতিক গণমাধ্যম ও জাতীয় ইংরেজি দৈনিক (The Daily Star, TBS)', 'বহুজাতিক করপোরেট কমিউনিকেশনস', 'বিশ্ববিদ্যালয় ও ক্যাডেট কলেজ শিক্ষকতা', 'আইইএলটিএস/টফেল কর্পোরেট ট্রেইনার'],
      popularRoles: ['Foreign Affairs Officer (Diplomat)', 'Corporate Communications Lead', 'Senior Feature Editor', 'ELT Curriculum Developer', 'University Professor'],
      descriptionBn: 'বিসিএস পররাষ্ট্র ও প্রশাসন ক্যাডারে প্রতি বছরই এই বিভাগের শিক্ষার্থীদের আধিক্য থাকে।'
    },
    careerAbroad: {
      studyFields: ['Applied Linguistics & TESOL', 'Comparative Literature & Postcolonial Studies', 'Creative Writing & Cultural Studies'],
      targetCountries: ['যুক্তরাজ্য (অক্সফোর্ড/কেমব্রিজ ফেলোশিপ)', 'যুক্তরাষ্ট্র (ফুলব্রাইট স্কলারশিপ)', 'কানাডা', 'অস্ট্রেলিয়া'],
      descriptionBn: 'বিশ্ববিদ্যালয়গুলোতে গ্র্যাজুয়েট টিচিং অ্যাসিস্ট্যান্টশিপ (GTA) ও ফুল-ফান্ডেড স্কলারশিপ সুযোগ।'
    },
    sampleAlumni: [
      {
        id: 'alm-eng-01',
        name: 'সাকিব মাহমুদ খান',
        departmentId: 'dept-english',
        departmentBn: 'ইংরেজি বিভাগ',
        session: '২০০৭-২০০৮',
        currentRole: 'First Secretary & Diplomat',
        currentOrganization: 'Ministry of Foreign Affairs (BCS Foreign Service)',
        location: 'লন্ডন দূতাবাস, যুক্তরাজ্য',
        email: 'sakib.eng@mofa.gov.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+447911122334',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        achievementBn: '৩৫তম বিসিএসে পররাষ্ট্র ক্যাডারে মেধা তালিকায় শীর্ষস্থান।'
      }
    ]
  },
  {
    id: 'dept-bangla',
    nameBn: 'বাংলা বিভাগ (Bangla)',
    nameEn: 'Department of Bangla',
    code: 'BAN',
    facultyId: 'arts',
    facultyBn: 'কলা অনুষদ',
    establishedYear: 1954,
    seatCount: 100,
    degreeOfferedBn: 'বি.এ. (অনার্স), এম.এ., পিএইচ.ডি.',
    degreesEn: 'B.A. (Hons), M.A., Ph.D.',
    locationBuildingBn: 'শহীদুল্লাহ কলা ভবন (প্রথম তলা)',
    overviewBn: 'ড. মুহম্মদ শহীদুল্লাহর স্মৃতিবিজড়িত রাজশাহী বিশ্ববিদ্যালয়ের অন্যতম গৌরবময় প্রতিষ্ঠান। বাংলা ভাষা ও সাহিত্যের তাত্ত্বিক ও গবেষণামূলক চর্চায় আন্তর্জাতিকভাবে স্বীকৃত।',
    careerInBangladesh: {
      sectors: ['বিসিএস প্রশাসন ও সাধারণ ক্যাডার', 'বাংলা একাডেমি ও নজরুল ইনস্টিটিউট', 'জাতীয় সংবাদপত্র ও টিভি চ্যানেল', 'প্রকাশনা সংস্থা ও সাহিত্য সম্পাদনা', 'বিসিএস সাধারণ শিক্ষা ও কলেজ-বিশ্ববিদ্যালয় শিক্ষকতা'],
      popularRoles: ['BCS Administration Officer', 'Literary Editor / Columnist', 'Senior Script Writer & Content Director', 'Bangla Language Specialist (Govt.)'],
      descriptionBn: 'সাহিত্য, সংস্কৃতি, প্রশাসন ও প্রকাশনা জগতের শীর্ষস্থানে এই বিভাগের গ্র্যাজুয়েটরা প্রতিষ্ঠিত।'
    },
    careerAbroad: {
      studyFields: ['South Asian Studies & Bengali Linguistics', 'Folklore & Cultural Anthropology', 'Translation Studies'],
      targetCountries: ['যুক্তরাষ্ট্র', 'ভারত (বিশ্বভারতী)', 'জাপান (টোকিও বিশ্ববিদ্যালয়)', 'যুক্তরাজ্য'],
      descriptionBn: 'বিদেশের বিভিন্ন বিশ্ববিদ্যালয়ে বাংলা ভাষা ও দক্ষিণ এশিয়া স্টাডিজ বিভাগে শিক্ষকতা ও গবেষণা।'
    },
    sampleAlumni: [
      {
        id: 'alm-ban-01',
        name: 'ড. রফিকুল আলম সরকার',
        departmentId: 'dept-bangla',
        departmentBn: 'বাংলা বিভাগ',
        session: '২০০৩-২০০৪',
        currentRole: 'উপপরিচালক ও ভাষা গবেষক',
        currentOrganization: 'বাংলা একাডেমি, ঢাকা',
        location: 'ঢাকা, বাংলাদেশ',
        phone: '০১৭৩১-৫৫৬৬৭৭',
        email: 'rafiq.bangla@banglaacademy.org.bd',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801731556677',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'প্রমিত বাংলা ভাষার ব্যাকরণ ও অভিধান প্রণয়ন টিমের সদস্য।'
      }
    ]
  },

  // ==========================================
  // FACULTY OF SOCIAL SCIENCES
  // ==========================================
  {
    id: 'dept-economics',
    nameBn: 'অর্থনীতি বিভাগ (Economics)',
    nameEn: 'Department of Economics',
    code: 'ECON',
    facultyId: 'social_science',
    facultyBn: 'সামাজিক বিজ্ঞান অনুষদ',
    establishedYear: 1954,
    seatCount: 100,
    degreeOfferedBn: 'বি.এস.এস. (অনার্স), এম.এস.এস.',
    degreesEn: 'B.S.S. (Hons), M.S.S.',
    locationBuildingBn: 'মমতাজউদ্দীন কলা ভবন (দ্বিতীয় তলা)',
    overviewBn: 'সামষ্টিক অর্থনীতি, উন্নয়ন অর্থনীতি, পলিসি অ্যানালাইসিস ও ইকোনোমেট্রিক্সের অন্যতম সেরা বিদ্যাপীঠ।',
    careerInBangladesh: {
      sectors: ['বাংলাদেশ ব্যাংক (রিসার্চ অফিসার ও এডি)', 'বিশ্বব্যাংক ও এশীয় উন্নয়ন ব্যাংক (ADB) বাংলাদেশ মিশন', 'পলিসি রিসার্চ ইনস্টিটিউট (PRI) ও বিআইডিএস (BIDS)', 'বিসিএস প্রশাসন ও অর্থনৈতিক ক্যাডার', 'বাণিজ্যিক ব্যাংক ও বহুজাতিক সংস্থা'],
      popularRoles: ['Economic Policy Analyst', 'Macroeconomic Researcher', 'Central Bank Research Officer', 'Financial Economist'],
      descriptionBn: 'জাতীয় বাজেট প্রণয়ন, অর্থনৈতিক নীতিনির্ধারণ ও ব্যাংকিং গবেষণায় এই বিভাগের শিক্ষার্থীদের প্রভাব অপরিসীম।'
    },
    careerAbroad: {
      studyFields: ['Development Economics & Impact Evaluation', 'Macroeconomics & Monetary Policy', 'Behavioral Economics'],
      targetCountries: ['যুক্তরাষ্ট্র', 'যুক্তরাজ্য', 'কানাডা', 'অস্ট্রেলিয়া'],
      descriptionBn: 'আইএমএফ (IMF), ওয়ার্ল্ড ব্যাংক হেডকোয়ার্টার্স ও আন্তর্জাতিক বিশ্ববিদ্যালয়ে সম্মানজনক পদে অধিষ্ঠিত।'
    },
    sampleAlumni: [
      {
        id: 'alm-econ-01',
        name: 'ড. আশরাফুল ইসলাম চৌধুরী',
        departmentId: 'dept-economics',
        departmentBn: 'অর্থনীতি বিভাগ',
        session: '২০০৫-২০০৬',
        currentRole: 'Senior Economist & Country Specialist',
        currentOrganization: 'World Bank Group',
        location: 'ওয়াশিংটন ডিসি, যুক্তরাষ্ট্র',
        email: 'ashraf.econ@worldbank.org',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+12025550199',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'উন্নয়নশীল দেশের ক্ষুদ্রঋণ ও দারিদ্র্য বিমোচন বিষয়ক পলিসি পেপারের প্রণেতা।'
      }
    ]
  },
  {
    id: 'dept-mcj',
    nameBn: 'গণযোগাযোগ ও সাংবাদিকতা (MCJ)',
    nameEn: 'Mass Communication & Journalism',
    code: 'MCJ',
    facultyId: 'social_science',
    facultyBn: 'সামাজিক বিজ্ঞান অনুষদ',
    establishedYear: 1992,
    seatCount: 50,
    degreeOfferedBn: 'বি.এস.এস. (অনার্স), এম.এস.এস.',
    degreesEn: 'B.S.S. (Hons), M.S.S.',
    locationBuildingBn: 'শহীদুল্লাহ কলা ভবন (চতুর্থ তলা)',
    overviewBn: 'বাংলাদেশের মিডিয়া জগতের অগ্রদূত তৈরির কারখানা। ইনভেস্টিগেটিভ জার্নালিজম, ব্রডকাস্ট মিডিয়া, ডিজিটাল পিআর ও চলচ্চিত্র নির্মাণের অন্যতম আধুনিক বিভাগ।',
    careerInBangladesh: {
      sectors: ['শীর্ষ জাতীয় দৈনিক ও টিভি চ্যানেল (প্রথম আলো, দ্য ডেইলি স্টার, ৭১ টিভি, চ্যানেল আই)', 'আন্তর্জাতিক বার্তা সংস্থা (BBC, Reuters, AFP, Al Jazeera)', 'কর্পোরেট পিআর ও কমিউনিকেশনস হেড', 'তথ্য মন্ত্রণালয় ও বিসিএস তথ্য ক্যাডার', 'ডিজিটাল মিডিয়া ও অডিও-ভিজ্যুয়াল প্রযোজনা'],
      popularRoles: ['Chief Reporter / Investigative Journalist', 'News Presenter / Special Correspondent', 'Head of Corporate Affairs / PR Director', 'Digital Content Director'],
      descriptionBn: 'বাংলাদেশের প্রিন্ট ও ইলেকট্রনিক মিডিয়ার শীর্ষ সাংবাদিক ও বার্তাপ্রধানদের তালিকায় রাবি এমসিজের গ্র্যাজুয়েটদের জয়জয়কার।'
    },
    careerAbroad: {
      studyFields: ['Digital Journalism & New Media Technologies', 'Strategic Corporate Communications', 'Documentary Filmmaking'],
      targetCountries: ['যুক্তরাজ্য (BBC হেডকোয়ার্টার্স)', 'যুক্তরাষ্ট্র', 'জার্মানি (Deutsche Welle)', 'সুইডেন'],
      descriptionBn: 'আন্তর্জাতিক প্রেস ক্লাবে ফেলোশিপ ও পুলিৎজার সমমানের বৈশ্বিক সাংবাদিকতা প্ল্যাটফর্মে কাজ করার সুযোগ।'
    },
    sampleAlumni: [
      {
        id: 'alm-mcj-01',
        name: 'তানজিমুল হক হিমেল',
        departmentId: 'dept-mcj',
        departmentBn: 'গণযোগাযোগ ও সাংবাদিকতা',
        session: '২০০৯-২০১০',
        currentRole: 'Senior Special Correspondent & Investigative Lead',
        currentOrganization: 'বিবিসি নিউজ বাংলা (BBC News)',
        location: 'ঢাকা ও লন্ডন',
        phone: '০১৭২১-৯৯৮৮৭৭',
        email: 'tanzimul.mcj@bbc.co.uk',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+8801721998877',
        imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'জাতীয় ও আন্তর্জাতিক অনুসন্ধানী সাংবাদিকতায় মর্যাদাপূর্ণ পুরস্কার প্রাপ্ত।'
      }
    ]
  },
  {
    id: 'dept-geb',
    nameBn: 'জেনেটিক ইঞ্জিনিয়ারিং ও বায়োটেকনোলজি (GEB)',
    nameEn: 'Genetic Engineering & Biotechnology',
    code: 'GEB',
    facultyId: 'life_earth_science',
    facultyBn: 'জীব ও ভূবিজ্ঞান অনুষদ',
    establishedYear: 2004,
    seatCount: 25,
    degreeOfferedBn: 'বি.এস-সি. (অনার্স), এম.এস-সি.',
    degreesEn: 'B.Sc. (Hons), M.Sc.',
    locationBuildingBn: 'বিজ্ঞান ভবন-৩ (চতুর্থ তলা)',
    overviewBn: 'জিন প্রকৌশল, ডিএনএ রিকম্বিন্যান্ট প্রযুক্তি, ক্যানসার বায়োলজি ও ভ্যাকসিন উদ্ভাবনের ভবিষ্যৎমুখী সুপার-স্পেশালাইজড বিভাগ।',
    careerInBangladesh: {
      sectors: ['আন্তর্জাতিক উদরাময় গবেষণা কেন্দ্র (ICDDR,B)', 'ন্যাশনাল ইনস্টিটিউট অব বায়োটেকনোলজি (NIB)', 'ওষুধ শিল্পের বায়োটেক ইউনিট (Incepta, Square Vaccine)', 'ফরেনসিক ডিএনএ ল্যাবরেটরি (সিআইডি)', 'বিসিএস ক্যাডার ও বিশ্ববিদ্যালয় শিক্ষকতা'],
      popularRoles: ['Molecular Biologist / Geneticist', 'Forensic DNA Analyst', 'Vaccine Development Scientist', 'Bioinformatics Specialist'],
      descriptionBn: 'ক্যান্সার থেরাপি, স্টেম সেল রিসার্চ ও জেনেটিক ডায়াগনস্টিক্সে ভবিষ্যৎ ক্যারিয়ারের সোনালী ক্ষেত্র।'
    },
    careerAbroad: {
      studyFields: ['CRISPR-Cas9 & Gene Editing Therapy', 'Cancer Immunotherapy & Virology', 'Synthetic Biology & Bioinformatics'],
      targetCountries: ['আমেরিকা (Harvard, Johns Hopkins ল্যাব)', 'যুক্তরাজ্য', 'জার্মানি', 'জাপান'],
      descriptionBn: 'বিশ্বের শীর্ষ ১০০ বিশ্ববিদ্যালয়ের প্রায় সবটিতেই রাবি জিইবি বিভাগের শিক্ষার্থীরা ফুল স্কলারশিপে গবেষণা করছেন।'
    },
    sampleAlumni: [
      {
        id: 'alm-geb-01',
        name: 'ড. ফারহানা আফরোজ সোনিয়া',
        departmentId: 'dept-geb',
        departmentBn: 'জেনেটিক ইঞ্জিনিয়ারিং ও বায়োটেকনোলজি',
        session: '২০০৭-২০০৮',
        currentRole: 'Senior Cancer Genomics Research Fellow',
        currentOrganization: 'Johns Hopkins School of Medicine',
        location: 'বাল্টিমোর, মেরিল্যান্ড, যুক্তরাষ্ট্র',
        email: 'farhana.geb@jhmi.edu',
        facebookUrl: 'https://facebook.com',
        whatsappNumber: '+14105550188',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        achievementBn: 'স্তন ক্যানসারের জিন মিউটেশন বিষয়ক আন্তর্জাতিক গবেষণাপত্রের প্রধান গবেষক।'
      }
    ]
  }
];

// Local storage key for custom alumni added by admin
export const ALUMNI_STORAGE_KEY = 'ru_insiders_custom_alumni_v1';

export function getAllAlumni(): RuAlumnus[] {
  const baseAlumni = RU_DEPARTMENTS.flatMap((d) => d.sampleAlumni);
  if (typeof window === 'undefined') return baseAlumni;
  try {
    const raw = localStorage.getItem(ALUMNI_STORAGE_KEY);
    if (!raw) return baseAlumni;
    const custom = JSON.parse(raw);
    if (Array.isArray(custom)) {
      return [...custom, ...baseAlumni];
    }
    return baseAlumni;
  } catch (e) {
    return baseAlumni;
  }
}

export function saveAlumnus(alumnus: RuAlumnus): RuAlumnus[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALUMNI_STORAGE_KEY);
    const custom: RuAlumnus[] = raw ? JSON.parse(raw) : [];
    const index = custom.findIndex((a) => a.id === alumnus.id);
    let updated: RuAlumnus[];
    if (index >= 0) {
      updated = [...custom];
      updated[index] = alumnus;
    } else {
      updated = [alumnus, ...custom];
    }
    localStorage.setItem(ALUMNI_STORAGE_KEY, JSON.stringify(updated));
    return getAllAlumni();
  } catch (e) {
    return getAllAlumni();
  }
}

export function deleteAlumnus(id: string): RuAlumnus[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALUMNI_STORAGE_KEY);
    const custom: RuAlumnus[] = raw ? JSON.parse(raw) : [];
    const updated = custom.filter((a) => a.id !== id);
    localStorage.setItem(ALUMNI_STORAGE_KEY, JSON.stringify(updated));
    return getAllAlumni();
  } catch (e) {
    return getAllAlumni();
  }
}
