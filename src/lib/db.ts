import fs from 'fs/promises';
import path from 'path';
import { supabase } from './supabase';
import {
  Product,
  MapSpotCustomData,
  Order,
  ClubInfo,
  ClubApplication,
  InsideRuArticle,
  AlumniProfile,
  NotificationItem,
  SiteSettings,
  CustomDepartmentData,
  Merchant,
} from '@/types';

// Path resolution supporting both local development and Vercel serverless runtime
const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const DB_FILE = isVercel ? path.join('/tmp', 'data', 'db.json') : path.join(process.cwd(), 'data', 'db.json');
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export interface DatabaseSchema {
  settings: SiteSettings;
  products: Product[];
  mapSpots: Record<string, MapSpotCustomData>;
  orders: Order[];
  clubs: ClubInfo[];
  clubApplications: ClubApplication[];
  articles: InsideRuArticle[];
  alumni: AlumniProfile[];
  notifications: NotificationItem[];
  subscribers: { contact: string; createdAt: string }[];
  merchants?: Merchant[];
  departments?: Record<string, CustomDepartmentData>;
}

const INITIAL_DB: DatabaseSchema = {
  settings: {
    superAdminPassword: 'ru-admin-2026',
    productManagerPassword: 'ru-shop-2026',
    whatsappNumber: '8801700000000',
    deliveryCharges: {
      campus: 0,
      city: 40,
      nationwide: 100,
    },
    categories: [
      'হুডি ও শীতকালীন পোশাক',
      'ড্রপ শোল্ডার ও টি-শার্ট',
      'স্পোর্টস জার্সি',
      'খেজুরের গুড় ও ঐতিহ্যবাহী খাবার',
      'নাড়ু ও হোমমেড ফুড',
      'ক্যাম্পাস গিফট ও স্যুভেনির',
    ],
    breakingNews: [
      '🔥 রাবি অফিশিয়াল উইন্টার হুডি ও রাজশাহীর খাঁটি খেজুরের গুড়ের প্রি-অর্ডার চলছে! মতিহার ক্যাম্পাসে ফ্রি ডেলিভারি।',
      '🎓 রাবির ৪২টি স্পট ও রাজশাহী জেলার ২২টি অঞ্চল কতটুকু ঘুরলেন? এখনই ম্যাপে টিক দিয়ে নিজের ভ্রমণ সনদ ডাউনলোড করুন!',
      '✍️ Inside RU পোর্টালে আপনার গল্প, কবিতা বা গবেষণাপত্র জমা দিন এবং জিতে নিন আকর্ষণীয় গিফট হ্যাম্পার।',
    ],
    breakingNewsItems: [
      {
        id: 'bn-init-1',
        title: 'রাবি অফিশিয়াল উইন্টার হুডি ও রাজশাহীর খাঁটি খেজুরের গুড়ের প্রি-অর্ডার শুরু! মতিহার ক্যাম্পাসে ফ্রি ডেলিভারি',
        imageUrl: '/mockups/hoodie-front.jpg',
        link: '/shop',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'bn-init-2',
        title: 'ঐতিহাসিক প্যারিস রোড ও রাবি ক্যাম্পাসের ৪২টি স্থাপত্য স্পট এক্সপ্লোর করুন ও নিজের সনদপত্র ডাউনলোড করুন',
        imageUrl: '/campus/paris-road-rain.jpg',
        link: '/map',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'bn-init-3',
        title: 'ইনসাইড রাবি নিউজ ও সাহিত্য পোর্টাল উন্মোচিত — ক্যাম্পাসের তাজা খবর ও গবেষণাপত্র পড়ুন',
        imageUrl: '/campus/ru-spot.jpg',
        link: '/inside-ru',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ],
  },
  products: [
    {
      id: 'prod-hoodie-1',
      nameBn: 'প্রিমিয়াম আরইউ ক্রেস্ট হুডি (নেভি ব্লু)',
      category: 'হুডি ও শীতকালীন পোশাক',
      productType: 'apparel',
      price: 850,
      images: ['/mockups/hoodie-front.jpg', '/campus/paris-road-rain.jpg'],
      shortSummary: '৩২০ জিএসএম ফ্লিস কটন, বুকে রাবি ক্রেস্ট এমব্রয়ডারি করা প্রিমিয়াম শীতকালীন হুডি।',
      detailSections: [
        {
          id: 'd1',
          title: 'ফ্যাব্রিক ও কোয়ালিটি',
          content: '১০০% এক্সপোর্ট কোয়ালিটি ৩২০ জিএসএম ব্রাশড ফ্লিস ফেব্রিক। শীতের জন্য অত্যন্ত আরামদায়ক ও টেকসই।',
        },
        {
          id: 'd2',
          title: 'কাস্টমাইজেশন ও বাল্ক অর্ডার',
          content: 'ডিপার্টমেন্ট বা ব্যাচের সবার জন্য নিজের নাম ও লোগো বসাতে চাইলে নিচের WhatsApp বাটনে ক্লিক করে মেসেজ দিন।',
        },
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod-dropshoulder-1',
      nameBn: 'প্যারিস রোড মোটিফ ড্রপ শোল্ডার টি-শার্ট',
      category: 'ড্রপ শোল্ডার ও টি-শার্ট',
      productType: 'apparel',
      price: 450,
      images: ['/mockups/dropshoulder-front.jpg'],
      shortSummary: '২২০ জিএসএম কম্বড কটন ওভারসাইজড ড্রপ শোল্ডার টি-শার্ট।',
      detailSections: [
        {
          id: 'd1',
          title: 'ডিজাইন ও প্রিন্ট',
          content: 'প্যারিস রোড ও সাবাশ বাংলাদেশের নান্দনিক ডিটিএফ প্রিন্ট যা ধোয়ার পরেও নষ্ট হয় না।',
        },
      ],
      sizes: ['M', 'L', 'XL', 'XXL'],
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod-jersey-1',
      nameBn: 'রাবি আন্তঃবিভাগ স্পোর্টস জার্সি (রেড-গোল্ড এডিশন)',
      category: 'স্পোর্টস জার্সি',
      productType: 'apparel',
      price: 390,
      images: ['/mockups/jersey-front.jpg'],
      shortSummary: 'ড্রাই-ফিট ব্রিদেবল ফেব্রিক, আন্তঃবিভাগ টুর্নামেন্ট ও ফুটবল-ক্রিকেটের অফিশিয়াল জার্সি।',
      detailSections: [
        {
          id: 'j1',
          title: 'ফ্যাব্রিক টেকনোলজি',
          content: 'ড্রাই-ফিট মাইক্রো পলিয়েস্টার যা ঘাম দ্রুত শোষণ করে শরীর শীতল ও আরামদায়ক রাখে।',
        },
        {
          id: 'j2',
          title: 'নাম ও নম্বর কাস্টমাইজেশন',
          content: 'জার্সির পেছনে নিজের নাম ও প্রিয় নম্বর প্রিন্ট করতে WhatsApp বাটনে ক্লিক করে মেসেজ দিন।',
        },
      ],
      sizes: ['M', 'L', 'XL', 'XXL'],
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod-gur-1',
      nameBn: 'রাজশাহীর খাঁটি পাটালি ও ঝোলা খেজুরের গুড়',
      category: 'খেজুরের গুড় ও ঐতিহ্যবাহী খাবার',
      productType: 'food_weight',
      price: 380,
      images: ['/campus/ru-spot.jpg'],
      shortSummary: 'রাজশাহী ও চারঘাটের গাছিদের কাছ থেকে সরাসরি সংগৃহীত ১০০% কেমিক্যাল ও চিনিমুক্ত খাঁটি খেজুরের গুড়।',
      detailSections: [
        {
          id: 'g1',
          title: 'গুড়ের বিশেষত্ব ও বিশুদ্ধতা',
          content: 'কোনো প্রকার হাইড্রোজ, ফিটকিরি বা চিনি মেশানো হয়নি। ভোরবেলা রস জ্বাল দিয়ে তৈরি সুঘ্রাণযুক্ত দানা পাটালি ও লালি গুড়।',
        },
        {
          id: 'g2',
          title: 'সারা বাংলাদেশে নিরাপদ প্যাকেজিং',
          content: 'ফুড-গ্রেড এয়ারটাইট বক্সে বিশেষ প্যাকিং করে সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে পাঠানো হয়।',
        },
      ],
      weightOptions: [
        { label: '১ কেজি পাটালি গুড়', price: 380 },
        { label: '২ কেজি কম্বো প্যাক', price: 740 },
        { label: '৫ কেজি ফ্যামিলি বক্স', price: 1800 },
      ],
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod-naru-1',
      nameBn: 'হোমমেড গুড়ের নারিকেল নাড়ু ও তিলের নাড়ু',
      category: 'নাড়ু ও হোমমেড ফুড',
      productType: 'food_weight',
      price: 220,
      images: ['/campus/ru-roundabout.jpg'],
      shortSummary: 'ঘরোয়া পরিবেশে খাঁটি খেজুরের গুড় ও দেশি নারিকেল দিয়ে তৈরি সুস্বাদু নাড়ু।',
      detailSections: [
        {
          id: 'n1',
          title: 'উপাদান ও স্বাদ',
          content: 'বাছাইকৃত নারিকেল, খাঁটি খেজুরের গুড়, এলাচ ও ঘিয়ের ফ্লেভারে সম্পূর্ণ স্বাস্থ্যসম্মতভাবে তৈরি। হলের শিক্ষার্থীদের জন্য স্পেশাল স্ন্যাকস!',
        },
      ],
      weightOptions: [
        { label: '৫০০ গ্রাম জার (২০-২২ পিস)', price: 220 },
        { label: '১ কেজি ফ্যামিলি জার', price: 420 },
      ],
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod-souvenir-1',
      nameBn: 'সাবাশ বাংলাদেশ অ্যাক্রিলিক টেবিল স্যুভেনির ক্রেস্ট',
      category: 'ক্যাম্পাস গিফট ও স্যুভেনির',
      productType: 'standard',
      price: 280,
      images: ['/campus/ru-roundabout.jpg', '/campus/paris-road-rain.jpg'],
      shortSummary: 'ডেস্কটপ ও পড়ার টেবিলের জন্য নান্দনিক মেটাল গোল্ড ফিনিশ সাবাশ বাংলাদেশ স্যুভেনির।',
      detailSections: [
        {
          id: 's1',
          title: 'উপাদান ও ফিনিশিং',
          content: 'হাই-গ্রেড স্বচ্ছ অ্যাক্রিলিক বেসের ওপর লেজার এনগ্রেভড গোল্ডেন সাবাশ বাংলাদেশ মনোগ্রাম।',
        },
      ],
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString(),
    },
  ],
  mapSpots: {
    paris_road: {
      spotId: 'paris_road',
      stage: 'ru_campus',
      nameBn: 'ঐতিহাসিক প্যারিস রোড (গগনশিরীষ বৃক্ষবীথি)',
      subtitleBn: 'রাজশাহী বিশ্ববিদ্যালয়ের প্রধান আকর্ষণ ও সবুজ সুড়ঙ্গ পথ',
      images: ['/campus/paris-road-rain.jpg', '/campus/ru-admin.jpg', '/campus/ru-gate.jpg'],
      detailSections: [
        {
          id: 'pr1',
          title: 'প্যারিস রোডের ইতিহাস',
          content: '১৯৬৫ সালের দিকে অধ্যাপক কাজী আব্দুল মান্নানের উদ্যোগে কাজলা গেট থেকে শহীদুল্লাহ কলা ভবন পর্যন্ত সড়কের দুই পাশে লাগানো হয় সুউচ্চ গগনশিরীষ গাছ। ফ্রান্সের প্যারিসের সড়কের সাথে সাদৃশ্য থাকায় শিক্ষার্থীরা এর নাম দেন প্যারিস রোড।',
        },
        {
          id: 'pr2',
          title: 'বর্ষা ও কুয়াশায় প্যারিস রোড',
          content: 'বৃষ্টিভেজা প্যারিস রোড কিংবা শীতের কুয়াশাচ্ছন্ন সকালে সাইকেল চালিয়ে ক্লাসে যাওয়া প্রত্যেক রাবিয়ানের জীবনের সবচেয়ে মধুর স্মৃতি।',
        },
      ],
    },
  },
  orders: [],
  clubs: [
    { id: 'rucs', shortName: 'RUCS', nameBn: 'রাবি ক্যারিয়ার ক্লাব (RUCS)', categoryBn: 'ক্যারিয়ার ও দক্ষতা', descriptionBn: 'শিক্ষার্থীদের কর্পোরেট দক্ষতা, সিভি রাইটিং ও জব ফেয়ার আয়োজনকারী সংগঠন।', password: 'rucs-2026' },
    { id: 'rudeu', shortName: 'RUDEU', nameBn: 'রাবি ডিবেটিং ইউনিয়ন (RUDEU)', categoryBn: 'বিতর্ক ও যুক্তি', descriptionBn: 'যুক্তিনির্ভর সমাজ গঠনে জাতীয় ও আন্তর্জাতিক পর্যায়ে বিতর্ক চর্চার প্ল্যাটফর্ম।', password: 'rudeu-2026' },
    { id: 'rusc', shortName: 'RUSC', nameBn: 'রাবি সায়েন্স ক্লাব (RUSC)', categoryBn: 'বিজ্ঞান ও গবেষণা', descriptionBn: 'বিজ্ঞান অলিম্পিয়াড, প্রজেক্ট প্রদর্শনী ও গবেষণা সেমিনার আয়োজনকারী ক্লাব।', password: 'rusc-2026' },
    { id: 'rups', shortName: 'RUPS', nameBn: 'রাবি ফটোগ্রাফি সোসাইটি (RUPS)', categoryBn: 'ফটোগ্রাফি ও আর্ট', descriptionBn: 'মতিহারের প্রকৃতি ও ক্যাম্পাস জীবনের মুহূর্ত ক্যামেরায় ধারণকারীদের সংগঠন।', password: 'rups-2026' },
    { id: 'badhan', shortName: 'বাঁধন', nameBn: 'বাঁধন (স্বেচ্ছায় রক্তদাতাদের সংগঠন)', categoryBn: 'মানবসেবা', descriptionBn: 'একের রক্ত অন্যের জীবন — জরুরি মুহূর্তে বিনামূল্যে রক্তদান ও ব্লাড গ্রুপিং সংগঠন।', password: 'badhan-2026' },
    { id: 'rover', shortName: 'Rover Scout', nameBn: 'রাবি রোভার স্কাউট গ্রুপ', categoryBn: 'শৃঙ্খলা ও সেবা', descriptionBn: 'ভর্তি পরীক্ষা ও ক্যাম্পাসের যেকোনো মানবিক কাজে অগ্রণী স্বেচ্ছাসেবী দল।', password: 'rover-2026' },
    { id: 'rongobhumi', shortName: 'রঙ্গভূমি', nameBn: 'রঙ্গভূমি ও কেন্দ্রীয় সাংস্কৃতিক জোট', categoryBn: 'থিয়েটার ও সংস্কৃতি', descriptionBn: 'মঞ্চনাটক, আবৃত্তি ও সংগীত চর্চার ঐতিহ্যবাহী সাংস্কৃতিক সংগঠন।', password: 'rongobhumi-2026' },
    { id: 'ieee', shortName: 'IEEE RU', nameBn: 'IEEE Rajshahi University Student Branch', categoryBn: 'প্রযুক্তি ও রোবটিক্স', descriptionBn: 'প্রযুক্তি, রোবটিক্স, এআই ও আন্তর্জাতিক রিসার্চ পেপার প্রকাশনার স্টুডেন্ট ব্রাঞ্চ।', password: 'ieee-2026' },
  ],
  clubApplications: [],
  articles: [
    {
      id: 'art-breaking-1',
      title: 'রাবি ক্যাম্পাসে শীতকালীন অফিশিয়াল হুডি ও খাঁটি খেজুরের গুড়ের প্রি-অর্ডার শুরু',
      category: 'ব্রেকিং নিউজ',
      authorName: 'সেন্ট্রাল ডেস্ক',
      department: 'RU Insiders অফিশিয়াল',
      whatsappNumber: '8801700000000',
      images: ['/campus/paris-road-rain.jpg', '/mockups/hoodie-front.jpg'],
      summary: 'মতিহার ক্যাম্পাসের শিক্ষার্থীদের জন্য ফ্রি ডেলিভারি সহ অফিশিয়াল উইন্টার কালেকশন ও খাঁটি খেজুরের গুড় এখন পাওয়া যাচ্ছে।',
      detailSections: [
        {
          id: 'bn-1',
          title: 'অফিশিয়াল লঞ্চ ও অফার',
          content: 'রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষার্থীদের জন্য ৩২০ জিএসএম ফ্লিস কটন প্রিমিয়াম হুডি এবং চারঘাটের গাছিদের থেকে সংগৃহীত ১০০% নির্ভেজাল খেজুরের গুড়ের ডেলিভারি শুরু হয়েছে।',
        },
        {
          id: 'bn-2',
          title: 'ক্যাম্পাসে ফ্রি ডেলিভারি',
          content: 'ক্যাম্পাসের সকল আবাসিক হল এবং ডরমেটরিতে সম্পূর্ণ ফ্রি হোম ডেলিভারি প্রদান করা হচ্ছে। কোনো অগ্রিম পেমেন্ট ছাড়াই ১০০% ক্যাশ অন ডেলিভারিতে অর্ডার গ্রহণ করা হচ্ছে।',
        },
      ],
      likes: 89,
      status: 'Published',
      isBreaking: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-1',
      title: 'বৃষ্টিভেজা প্যারিস রোড ও টুকিটাকি চত্বরের সেই সোনালী বিকেল',
      category: 'গল্প ও স্মৃতিচারণ',
      authorName: 'মাহিম আহমেদ',
      department: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
      whatsappNumber: '8801700000000',
      images: ['/campus/paris-road-rain.jpg', '/campus/ru-spot.jpg'],
      summary: 'ক্লাস শেষে বন্ধুদের সাথে টুকিটাকি চত্বরের মাটির কাপে চা আর বৃষ্টিস্নাত প্যারিস রোড ধরে হেঁটে যাওয়ার অনুভূতি চির অম্লান।',
      detailSections: [
        {
          id: 'a1',
          title: 'টুকিটাকির আড্ডা',
          content: 'সকাল আটটার ক্লাস শেষে যখন সবাই ক্লান্ত হয়ে টুকিটাকি চত্বরে জড়ো হই, তখন এক কাপ আদা চা আর সিঙ্গারা যেন সমস্ত ক্লান্তি ভুলিয়ে দেয়।',
        },
        {
          id: 'a2',
          title: 'গগনশিরীষের ছায়া',
          content: 'বিকেলের রোদ যখন গগনশিরীষের পাতার ফাঁক গলে পিচঢালা পথে পড়ে, তখন মনে হয় পৃথিবীর সবচেয়ে সুন্দর ক্যাম্পাস আমাদের এই মতিহার।',
        },
      ],
      likes: 48,
      status: 'Published',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-fine-arts-1',
      title: 'চারুকলা চত্বরের রঙের উৎসব ও শিক্ষার্থীদের ক্যানভাসে মতিহার',
      category: 'চারুকলা ও সাহিত্য',
      authorName: 'অঙ্কিতা রায়',
      department: 'চারুকলা অনুষদ (চিত্রকলা বিভাগ)',
      whatsappNumber: '8801700000000',
      images: ['/campus/ru-roundabout.jpg', '/campus/ru-spot.jpg'],
      summary: 'চারুকলার সবুজ চত্বরে দিনভর তুলির আঁচড় আর মাটির গন্ধ—কীভাবে শিক্ষার্থীরা ক্যাম্পাসের রূপ ফুটিয়ে তোলে।',
      detailSections: [
        {
          id: 'fa-1',
          title: 'বসন্ত ও শরতের ক্যানভাস',
          content: 'চারুকলা অনুষদের বার্ষিক প্রদর্শনীতে শিক্ষার্থীরা রাজশাহীর পদ্মার চর, প্যারিস রোড এবং ঐতিহাসিক শহীদ মিনারের বিভিন্ন মুহূর্ত তুলে ধরেন।',
        },
      ],
      likes: 62,
      status: 'Published',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-2',
      title: 'শাবাশ বাংলাদেশ: স্বাধীনতার অমর ভাস্কর্যের ইতিহাস ও তাৎপর্য',
      category: 'ক্যাম্পাস নিউজ',
      authorName: 'রাবি প্রতিনিধি',
      department: 'ইতিহাস বিভাগ',
      whatsappNumber: '8801700000000',
      images: ['/campus/ru-roundabout.jpg'],
      summary: 'শিল্পী নিতুন কুণ্ডুর অমর সৃষ্টি শাবাশ বাংলাদেশ কীভাবে রাবি শিক্ষার্থীদের অনুপ্রেরণার কেন্দ্রবিন্দু হয়ে উঠলো।',
      detailSections: [
        {
          id: 'sb1',
          title: 'ভাস্কর্যের সৃষ্টি ও উদ্বোধন',
          content: '১৯৯১ সালে মুক্তিযুদ্ধের শহীদদের স্মরণে রাবি কেন্দ্রীয় চত্বরে উন্মোচিত হয় এই সুবিশাল ভাস্কর্য। সুকান্ত ভট্টাচার্যের কবিতার পঙ্ক্তি খচিত এই স্মারক বাঙালির আত্মত্যাগের প্রতীক।',
        },
      ],
      likes: 35,
      status: 'Published',
      createdAt: new Date().toISOString(),
    },
  ],
  alumni: [
    {
      id: 'alum-1',
      name: 'ড. তানভীর হাসান',
      faculty: 'প্রকৌশল অনুষদ',
      department: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
      batch: '৫২তম ব্যাচ',
      currentRole: 'Senior Software Engineer',
      organization: 'Google (Munich, Germany)',
      country: 'Germany (DAAD Scholar)',
      whatsapp: '8801700000000',
      email: 'tanvir.ru.alumni@gmail.com',
      linkedin: 'https://linkedin.com',
      approved: true,
    },
    {
      id: 'alum-2',
      name: 'ব্যারিস্টার ফারহানা ইয়াসমিন',
      faculty: 'আইন অনুষদ',
      department: 'আইন বিভাগ (Law)',
      batch: '৫০তম ব্যাচ',
      currentRole: 'অ্যাডভোকেট ও সহকারী অ্যাটর্নি জেনারেল',
      organization: 'বাংলাদেশ সুপ্রিম কোর্ট (হাইকোর্ট বিভাগ)',
      country: 'Bangladesh (LLM, UK Chevening)',
      whatsapp: '8801700000000',
      email: 'farhana.law@ru.ac.bd',
      approved: true,
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      title: '🍯 খাঁটি খেজুরের গুড় ও উইন্টার হুডি স্টকে এসেছে!',
      message: 'মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি এবং সারা বাংলাদেশে ক্যাশ অন ডেলিভারি চলছে।',
      link: '/shop',
      sendChromePush: true,
      createdAt: new Date().toISOString(),
    },
  ],
  subscribers: [],
  merchants: [
    {
      id: 'm-motihar-crafts',
      shopName: 'মতিহার ক্রাফটস অ্যান্ড এপারেল',
      ownerName: 'শাকিব আল হাসান',
      phone: '01711223344',
      email: 'motihar.crafts@gmail.com',
      password: 'merchant-2026',
      status: 'active',
      category: 'পোশাক ও হুডি',
      address: 'টুকিটাকি চত্বর, রাবি ক্যাম্পাস',
      payoutPhone: '01711223344',
      payoutMethod: 'bkash',
      facebookPixelId: '123456789012345',
      commissionRate: 0,
      totalSales: 18500,
      totalOrders: 24,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm-varendra-foods',
      shopName: 'বরেন্দ্র খাঁটি গুড় ও রসাল খাবার',
      ownerName: 'মো: রফিকুল ইসলাম',
      phone: '01822334455',
      email: 'varendra.foods@gmail.com',
      password: 'merchant-2026',
      status: 'active',
      category: 'ঐতিহ্যবাহী খাবার ও গুড়',
      address: 'চারঘাট ও বাঘা, রাজশাহী',
      payoutPhone: '01822334455',
      payoutMethod: 'bkash',
      facebookPixelId: '',
      commissionRate: 0,
      totalSales: 34200,
      totalOrders: 42,
      createdAt: new Date().toISOString(),
    },
  ],
  departments: {},
};

// Atomic Queue to prevent concurrent file write race conditions
let writeQueue: Promise<any> = Promise.resolve();

export function runAtomic<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export async function readDb(): Promise<DatabaseSchema> {
  // 1. Try reading from Supabase cloud database if available
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('key', 'main')
      .maybeSingle();

    if (!error && data && data.data) {
      const remoteDb = data.data as DatabaseSchema;
      // Also cache to local file for offline fallback
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(DB_FILE, JSON.stringify(remoteDb, null, 2), 'utf-8');
      } catch {}
      return remoteDb;
    }
  } catch (err) {
    // Supabase unavailable or table not created yet, silently continue to local file
  }

  // 2. Local / bundled file fallback
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    // If on Vercel and DB_FILE not in /tmp yet, try reading bundled db.json
    try {
      const bundled = await fs.readFile(BUNDLED_DB_FILE, 'utf-8');
      const parsed = JSON.parse(bundled) as DatabaseSchema;
      try {
        await fs.writeFile(DB_FILE, bundled, 'utf-8');
      } catch {}
      return parsed;
    } catch {}

    try {
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    } catch {}
    return INITIAL_DB;
  }
}

export async function writeDb(updater: (db: DatabaseSchema) => DatabaseSchema | Promise<DatabaseSchema>): Promise<DatabaseSchema> {
  return runAtomic(async () => {
    const current = await readDb();
    const updated = await updater(current);

    // 1. Write to local file (immediate, always safe)
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to write db file:', err);
    }

    // 2. Sync to Supabase cloud database
    try {
      const { error } = await supabase
        .from('app_state')
        .upsert(
          {
            key: 'main',
            data: updated,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      if (error) {
        console.warn('Supabase sync notice:', error.message);
      }
    } catch (sbErr) {
      console.warn('Supabase network notice:', sbErr);
    }

    return updated;
  });
}
