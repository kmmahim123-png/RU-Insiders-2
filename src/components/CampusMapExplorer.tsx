'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  Share2, 
  Download, 
  Camera, 
  Eye, 
  Layers, 
  Sparkles, 
  Trophy, 
  X,
  Compass,
  Check,
  Facebook,
  RotateCcw
} from 'lucide-react';

export interface CampusLandmark {
  id: string;
  name: string;
  nameBn: string;
  category: 'historical' | 'academic' | 'hall' | 'nature' | 'gate';
  categoryBn: string;
  x: number; // মানচিত্রে শতকরা অবস্থান (0-100)
  y: number;
  image: string;
  description: string;
  funFact: string;
}

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 'paris-road',
    name: 'Paris Road',
    nameBn: 'প্যারিস রোড',
    category: 'historical',
    categoryBn: 'ঐতিহাসিক ও আড্ডা',
    x: 35,
    y: 42,
    image: '/campus/paris-road-rain.jpg',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের প্রাণকেন্দ্র—উঁচু গগনশিরীষ গাছে ছাওয়া বিখ্যাত সুরম্য পিচঢালা পথ।',
    funFact: '১৯৬৬ সালে তৎকালীন উপাচার্য এই সুউচ্চ গগনশিরীষ গাছগুলো রোপণ করেছিলেন।'
  },
  {
    id: 'ru-admin',
    name: 'Administrative Building',
    nameBn: 'প্রশাসন ভবন ও গোল চত্বর',
    category: 'academic',
    categoryBn: 'একাডেমিক ও প্রশাসনিক',
    x: 38,
    y: 55,
    image: '/campus/ru-admin.jpg',
    description: 'ঐতিহাসিক নীল রঙের প্রশাসন ভবন এবং এর সামনের বিশাল দৃষ্টিনন্দন বৃত্তাকার সবুজ চত্বর।',
    funFact: 'রাবির প্রধান প্রশাসনিক কেন্দ্র এবং ক্যাম্পাসের সবচেয়ে বেশি ছবি তোলা স্থাপত্য।'
  },
  {
    id: 'shabash-bangladesh',
    name: 'Shabash Bangladesh',
    nameBn: 'সাবাশ বাংলাদেশ চত্বর',
    category: 'historical',
    categoryBn: 'ঐতিহাসিক ও আড্ডা',
    x: 48,
    y: 46,
    image: '/campus/ru-roundabout.jpg',
    description: 'শিল্পী নিতুন কুণ্ডুর অমর সৃষ্টি—মুক্তিযুদ্ধের বীর শহীদদের স্মরণে নির্মিত ঐতিহাসিক ভাস্কর্য।',
    funFact: 'কবি সুকান্ত ভট্টাচার্যের কবিতার পঙক্তি নিয়ে এই স্মৃতিস্তম্ভের নামকরণ করা হয়।'
  },
  {
    id: 'shaheed-minar',
    name: 'Central Shaheed Minar',
    nameBn: 'কেন্দ্রীয় শহীদ মিনার ও মুক্তমঞ্চ',
    category: 'historical',
    categoryBn: 'ঐতিহাসিক ও আড্ডা',
    x: 43,
    y: 50,
    image: '/campus/ru-spot.jpg',
    description: 'মতিহারের সাংস্কৃতিক প্রাণকেন্দ্র, উন্মুক্ত নাট্যমঞ্চ ও অমর একুশে উদযাপনের মূল কেন্দ্র।',
    funFact: 'এখানে সারাবছর বিভিন্ন নাট্যদল, ব্যান্ড ও সাংস্কৃতিক সংগঠনের জমজমাট পরিবেশনা চলে।'
  },
  {
    id: 'tukitaki',
    name: 'Tukitaki Chattar',
    nameBn: 'টুকিটাকি চত্বর',
    category: 'historical',
    categoryBn: 'ঐতিহাসিক ও আড্ডা',
    x: 46,
    y: 48,
    image: '/campus/ru-spot.jpg',
    description: 'রাবিয়ানদের আড্ডা, চা, বিতর্ক ও সৃজনশীল বন্ধুত্বের ঐতিহাসিক স্মৃতিবিজড়িত মিলনস্থল।',
    funFact: 'রাবির এমন কোনো শিক্ষার্থী নেই যার টুকিটাকির চায়ের কাপে ঝড় তোলার গল্প নেই!'
  },
  {
    id: 'central-library',
    name: 'Central Library',
    nameBn: 'কেন্দ্রীয় লাইব্রেরি',
    category: 'academic',
    categoryBn: 'একাডেমিক ও প্রশাসনিক',
    x: 41,
    y: 46,
    image: '/campus/ru-admin.jpg',
    description: 'বাংলাদেশের অন্যতম বৃহত্তম গ্রন্থাগার, যা শিক্ষার্থীদের গবেষণা ও জ্ঞানচর্চার বাতিঘর।',
    funFact: 'এখানে সংরক্ষিত রয়েছে সাড়ে চার লাখেরও বেশি বই এবং দুর্লভ পাণ্ডুলিপি।'
  },
  {
    id: 'central-stadium',
    name: 'Central Stadium & Gym',
    nameBn: 'কেন্দ্রীয় স্টেডিয়াম ও জিমনেসিয়াম',
    category: 'nature',
    categoryBn: 'খেলার মাঠ ও প্রকৃতি',
    x: 48,
    y: 38,
    image: '/campus/ru-master-plan-3d.jpg',
    description: 'আন্তঃবিভাগ ফুটবল, ক্রিকেট প্রতিযোগিতা ও ক্রীড়াপ্রেমীদের পদচারণায় মুখরিত স্টেডিয়াম।',
    funFact: 'ক্যাম্পাসের সব বড় বড় টুর্নামেন্টের ফাইনাল ম্যাচ এই বিশাল মাঠে অনুষ্ঠিত হয়।'
  },
  {
    id: 'jubilee-lake',
    name: 'Juberi Lake & Guest House',
    nameBn: 'জুবেরী হ্রদ ও পার্ক',
    category: 'nature',
    categoryBn: 'খেলার মাঠ ও প্রকৃতি',
    x: 18,
    y: 42,
    image: '/campus/paris-road-rain.jpg',
    description: 'ক্যাম্পাসের শান্ত-স্নিগ্ধ লেক ও মনোরম পার্ক, যেখানে অতিথি পাখিদের আনাগোনা থাকে।',
    funFact: 'বিকেলের পড়ন্ত রোদে লেকের পানিতে প্যারিস রোডের গাছের প্রতিচ্ছবি অপূর্ব লাগে।'
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden',
    nameBn: 'বোটানিক্যাল গার্ডেন',
    category: 'nature',
    categoryBn: 'খেলার মাঠ ও প্রকৃতি',
    x: 27,
    y: 22,
    image: '/campus/ru-roundabout.jpg',
    description: 'বিরল ভেষজ, বনজ ও ফুলের গাছপালায় ঘেরা ক্যাম্পাসের জীববৈচিত্র্য সংরক্ষণ কেন্দ্র।',
    funFact: 'উদ্ভিদবিজ্ঞান বিভাগের শত শত দুর্লভ উদ্ভিদের গবেষণাগার এটি।'
  },
  {
    id: 'rabindra-arts',
    name: 'Rabindra Arts Building',
    nameBn: 'রবীন্দ্র কলা ভবন',
    category: 'academic',
    categoryBn: 'একাডেমিক ও প্রশাসনিক',
    x: 30,
    y: 48,
    image: '/campus/ru-admin.jpg',
    description: 'কলা অনুষদের প্রধান ভবন, যেখানে বাংলা, ইংরেজি ও ইতিহাস বিভাগ অবস্থিত।',
    funFact: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের স্মরণে এই সুবিশাল একাডেমিক ভবনের নামকরণ।'
  },
  {
    id: 'science-buildings',
    name: '1st & 2nd Science Buildings',
    nameBn: 'বিজ্ঞান অনুষদ চত্বর (১ম, ২য় ও ৩য় ভবন)',
    category: 'academic',
    categoryBn: 'একাডেমিক ও প্রশাসনিক',
    x: 33,
    y: 36,
    image: '/campus/ru-admin.jpg',
    description: 'পদার্থ, রসায়ন, গণিত ও পরিসংখ্যান বিভাগের আধুনিক ল্যাবরেটরি কমপ্লেক্স।',
    funFact: 'দেশের অন্যতম সেরা বৈজ্ঞানিক গবেষণাকর্ম এই ল্যাবগুলো থেকে প্রকাশিত হয়।'
  },
  {
    id: 'begum-rokeya-hall',
    name: 'Begum Rokeya Hall',
    nameBn: 'বেগম রোকেয়া হল',
    category: 'hall',
    categoryBn: 'আবাসিক হল',
    x: 23,
    y: 30,
    image: '/campus/paris-road-rain.jpg',
    description: 'নারী শিক্ষার অগ্রদূত বেগম রোকেয়ার নামাঙ্কিত ক্যাম্পাসের ঐতিহ্যবাহী ছাত্রীনিবাস।',
    funFact: 'রাবির প্রথম আবাসিক ছাত্রী হল হিসেবে এর রয়েছে সুদীর্ঘ ইতিহাস।'
  },
  {
    id: 'mannujan-hall',
    name: 'Mannujan Hall',
    nameBn: 'মন্নুজান হল',
    category: 'hall',
    categoryBn: 'আবাসিক হল',
    x: 23,
    y: 45,
    image: '/campus/paris-road-rain.jpg',
    description: 'প্যারিস রোডের কাছাকাছি অবস্থিত অন্যতম প্রাচীন ও ছায়াঘেরা ছাত্রীনিবাস।',
    funFact: 'হলের সামনের ফুলের বাগান ও শান্ত পরিবেশ ক্যাম্পাসের অন্যতম আকর্ষণ।'
  },
  {
    id: 'zoha-hall',
    name: 'Shaheed Shamsuzzoha Hall',
    nameBn: 'শহীদ শামসুজ্জোহা হল',
    category: 'hall',
    categoryBn: 'আবাসিক হল',
    x: 58,
    y: 25,
    image: '/campus/ru-spot.jpg',
    description: '১৯৬৯-এর গণঅভ্যুত্থানের প্রথম শহীদ বুদ্ধিজীবী ড. জোহার স্মৃতিধন্য গৌরবময় হল।',
    funFact: '"আমার কোনো ছাত্রের গায়ে গুলি লাগার আগে আমার বুকে গুলি লাগবে"—ড. জোহার ঐতিহাসিক অমর বাণী।'
  },
  {
    id: 'habibur-rahman-hall',
    name: 'Shahid Habibur Rahman Hall',
    nameBn: 'শহীদ হবিবুর রহমান হল',
    category: 'hall',
    categoryBn: 'আবাসিক হল',
    x: 40,
    y: 20,
    image: '/campus/ru-master-plan-3d.jpg',
    description: 'স্টেডিয়ামের উত্তর পাশে অবস্থিত ক্যাম্পাসের অন্যতম সুবিশাল আবাসিক হল।',
    funFact: 'মুক্তিযুদ্ধে শহীদ রাবির প্রথিতযশা গণিত শিক্ষক হবিবুর রহমানের স্মরণে এর নামকরণ।'
  },
  {
    id: 'motihar-hall',
    name: 'Motihar Hall',
    nameBn: 'মতিহার হল',
    category: 'hall',
    categoryBn: 'আবাসিক হল',
    x: 49,
    y: 50,
    image: '/campus/ru-admin.jpg',
    description: 'মতিহারের মাটির সাথে নিবিড় সম্পর্কযুক্ত অন্যতম প্রাণবন্ত ছাত্রাবাস।',
    funFact: 'প্রশাসন ভবনের দক্ষিণ চত্বর সংলগ্ন হওয়ায় শিক্ষার্থীদের অন্যতম আড্ডাস্থল।'
  },
  {
    id: 'main-gate',
    name: 'RU Main Gate (Kazla)',
    nameBn: 'বিশ্ববিদ্যালয় প্রধান ফটক (কাজলা)',
    category: 'gate',
    categoryBn: 'ফটক ও প্রবেশদ্বার',
    x: 37,
    y: 65,
    image: '/campus/ru-gate.jpg',
    description: 'ঢাকা-রাজশাহী মহাসড়কের পাশে অবস্থিত মতিহার ক্যাম্পাসের সুদৃশ্য প্রধান তোরণ।',
    funFact: 'এই ফটক দিয়ে ক্যাম্পাসে ঢুকলেই শুরু হয় মনোমুগ্ধকর প্যারিস রোড।'
  },
  {
    id: 'boddhobhumi',
    name: 'Boddhobhumi Memorial',
    nameBn: 'বধ্যভূমি স্মৃতিস্তম্ভ',
    category: 'historical',
    categoryBn: 'ঐতিহাসিক ও আড্ডা',
    x: 75,
    y: 35,
    image: '/campus/ru-roundabout.jpg',
    description: 'একাত্তরের মহান মুক্তিযুদ্ধে শহীদ বীর সন্তানদের স্মরণে নির্মিত সুবিশাল স্মৃতিসৌধ।',
    funFact: 'এর সুউচ্চ মিনার এবং রক্তবর্ণ স্মৃতিস্তম্ভ ক্যাম্পাসের পূর্বাঞ্চলকে আলোকিত করে রাখে।'
  }
];

export default function CampusMapExplorer() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visitedLandmarks, setVisitedLandmarks] = useState<string[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<CampusLandmark | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ru_visited_landmarks_v1');
      if (saved) setVisitedLandmarks(JSON.parse(saved));
      const savedName = localStorage.getItem('ru_explorer_user_name');
      if (savedName) setUserName(savedName);
    } catch (e) {}
  }, []);

  const toggleVisited = (id: string) => {
    const next = visitedLandmarks.includes(id)
      ? visitedLandmarks.filter(x => x !== id)
      : [...visitedLandmarks, id];
    setVisitedLandmarks(next);
    try {
      localStorage.setItem('ru_visited_landmarks_v1', JSON.stringify(next));
    } catch (e) {}
  };

  const filteredLandmarks = useMemo(() => {
    if (activeCategory === 'all') return CAMPUS_LANDMARKS;
    return CAMPUS_LANDMARKS.filter(l => l.category === activeCategory);
  }, [activeCategory]);

  const percentage = Math.round((visitedLandmarks.length / CAMPUS_LANDMARKS.length) * 100);

  return (
    <div className="relative w-full rounded-3xl bg-slate-900 text-white p-4 sm:p-6 shadow-2xl border border-emerald-500/30 space-y-4">
      {/* হেডার ও মোড বাটন */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-amber-400 flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-300" />
            <span>রাজশাহী বিশ্ববিদ্যালয় ৩ডি ক্যাম্পাস ম্যাপ এক্সপ্লোরার</span>
          </h2>
          <p className="text-xs text-slate-400">মতিহারের সবুজ প্রাঙ্গণ ও ঐতিহাসিক চত্বর ঘুরে দেখুন</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(v => (v === '3d' ? '2d' : '3d'))}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold hover:bg-slate-700 transition"
          >
            {viewMode === '3d' ? '🗺️ ২ডি ভিউ' : '🏢 ৩ডি ভিউ'}
          </button>
          <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
            {percentage}% সম্পন্ন ({visitedLandmarks.length}/{CAMPUS_LANDMARKS.length})
          </span>
        </div>
      </div>

      {/* প্রধান ম্যাপ ভিউপোর্ট */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
        <img
          src={viewMode === '3d' ? '/campus/ru-master-plan-3d.jpg' : '/campus/ru-campus-index-map.png'}
          alt="রাজশাহী বিশ্ববিদ্যালয় মাস্টারপ্ল্যান"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* মানচিত্রে ইন্টারঅ্যাক্টিভ পিন মার্কার */}
        {filteredLandmarks.map((spot) => {
          const isVisited = visitedLandmarks.includes(spot.id);
          return (
            <div
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group/pin"
            >
              <div className={`p-1.5 sm:p-2 rounded-full border-2 transition-all duration-300 shadow-lg ${
                isVisited
                  ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30'
                  : 'bg-amber-400 border-slate-950 ring-4 ring-amber-400/30 animate-bounce'
              }`}>
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-950" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] whitespace-nowrap text-white font-bold opacity-0 group-hover/pin:opacity-100 transition shadow pointer-events-none">
                {spot.nameBn} {isVisited ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* স্পট কার্ড ও টিক টগল */}
      {selectedSpot && (
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={selectedSpot.image} alt={selectedSpot.nameBn} className="w-16 h-16 rounded-xl object-cover" />
            <div>
              <h4 className="font-bold text-sm text-white">{selectedSpot.nameBn}</h4>
              <p className="text-xs text-slate-400">{selectedSpot.description}</p>
            </div>
          </div>
          <button
            onClick={() => toggleVisited(selectedSpot.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              visitedLandmarks.includes(selectedSpot.id)
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{visitedLandmarks.includes(selectedSpot.id) ? '✓ ঘুরেছি' : 'ঘুরেছি (টিক দিন)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
