'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  CheckCircle2,
  Trophy,
  Search,
  ArrowLeft,
  Download,
  Lock,
  Eye,
  Check,
  Sparkles,
  Image as ImageIcon,
  ChevronRight,
  Share2,
  X,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { RU_CAMPUS_PLACES, RU_CAMPUS_VIEWBOX, RuPlaceSvgData } from '@/lib/ruCampusSvg';
import { RAJSHAHI_PDF_REGIONS, RAJSHAHI_PDF_MAP_VIEWBOX, RajshahiPdfRegionData } from '@/lib/rajshahiPdfRegions';
import { RAJSHAHI_DISTRICT_SVGS, RAJSHAHI_VIEWBOX } from '@/lib/rajshahiDistrictsSvg';
import { DIVISION_DISTRICT_META, DIVISION_SPOTS, DivisionSpotItem } from '@/lib/divisionSpotsData';
import { MapSpotCustomData, DetailBlock } from '@/types';

export default function InteractiveThreeMaps() {
  // 3-Stage Navigation: 1 (RU Campus 42) -> 2 (Rajshahi District 22) -> 3 (Rajshahi Division 95)
  const [stage, setStage] = useState<'ru_campus' | 'rajshahi_district' | 'division'>('ru_campus');

  // Selected item states
  const [selectedRuId, setSelectedRuId] = useState<string>('paris_road');
  const [selectedPdfId, setSelectedPdfId] = useState<string>('pdf_ru');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajshahi');

  // Search Filter for Campus & Division
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Visited states (saved in localStorage)
  const [visitedRuIds, setVisitedRuIds] = useState<string[]>([]);
  const [visitedPdfIds, setVisitedPdfIds] = useState<string[]>([]);
  const [visitedDivSpotIds, setVisitedDivSpotIds] = useState<string[]>([]);

  // Zoom & Pan state for Stage 1 Map
  const [ruMapZoom, setRuMapZoom] = useState(1);

  // Hover Tooltip State
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
    sub?: string;
  } | null>(null);

  // Unified Modern Bottom Sheet Drawer State (for all 3 maps)
  const [activeDrawer, setActiveDrawer] = useState<{
    id: string;
    stage: 'ru_campus' | 'rajshahi_district' | 'division';
    nameBn: string;
    nameEn?: string;
    rankNo?: string;
    categoryBn: string;
    imageUrl: string;
    desc: string;
    traffic?: string;
    isVisited: boolean;
    onToggleVisit: () => void;
  } | null>(null);

  // Custom data loaded from DB (admin edited titles, images, descriptions)
  const [customSpotsMap, setCustomSpotsMap] = useState<Record<string, MapSpotCustomData>>({});

  // Dedicated Full-Page Viewport (replaces cramped floating popup)
  const [fullPageDetail, setFullPageDetail] = useState<{
    spotId: string;
    nameBn: string;
    subtitleBn: string;
    images: string[];
    detailSections: DetailBlock[];
    isVisited: boolean;
    onToggleVisit: () => void;
  } | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  // "ম্যাপের কতটুকু ঘুরলেন দেখুন" Modal & Glowing Map Preview
  const [showShareModal, setShowShareModal] = useState(false);
  const [modalStageTab, setModalStageTab] = useState<'ru_campus' | 'rajshahi_district' | 'division'>('ru_campus');
  const [explorerName, setExplorerName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load from local storage & API
  useEffect(() => {
    try {
      const vRu = JSON.parse(localStorage.getItem('ru_visited_campus_v2') || '[]');
      const vPdf = JSON.parse(localStorage.getItem('ru_visited_district_v2') || '[]');
      const vDiv = JSON.parse(localStorage.getItem('ru_visited_division_v2') || '[]');
      setVisitedRuIds(vRu);
      setVisitedPdfIds(vPdf);
      setVisitedDivSpotIds(vDiv);

      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setExplorerName(savedUser.name);
    } catch {}

    fetch('/api/store')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.mapSpots) setCustomSpotsMap(data.mapSpots);
      })
      .catch(() => {});
  }, []);

  // Visited toggles
  const toggleRuSpot = (id: string) => {
    const next = visitedRuIds.includes(id) ? visitedRuIds.filter((x) => x !== id) : [...visitedRuIds, id];
    setVisitedRuIds(next);
    localStorage.setItem('ru_visited_campus_v2', JSON.stringify(next));
  };

  const togglePdfRegion = (id: string) => {
    const next = visitedPdfIds.includes(id) ? visitedPdfIds.filter((x) => x !== id) : [...visitedPdfIds, id];
    setVisitedPdfIds(next);
    localStorage.setItem('ru_visited_district_v2', JSON.stringify(next));
  };

  const toggleDivSpot = (id: string) => {
    const next = visitedDivSpotIds.includes(id)
      ? visitedDivSpotIds.filter((x) => x !== id)
      : [...visitedDivSpotIds, id];
    setVisitedDivSpotIds(next);
    localStorage.setItem('ru_visited_division_v2', JSON.stringify(next));
  };

  // Open Full-Page Spot Details
  const openSpotFullPage = (
    spotId: string,
    defaultName: string,
    defaultSubtitle: string,
    defaultImage: string,
    defaultDesc: string,
    isVisited: boolean,
    onToggleVisit: () => void
  ) => {
    const custom = customSpotsMap[spotId];
    const images = custom?.images?.length ? custom.images : [defaultImage];
    const detailSections: DetailBlock[] = custom?.detailSections?.length
      ? custom.detailSections
      : [
          {
            id: 'sec-1',
            title: `${defaultName} — পরিচিতি ও তাৎপর্য`,
            content: defaultDesc,
          },
        ];

    setActiveGalleryIdx(0);
    setFullPageDetail({
      spotId,
      nameBn: custom?.nameBn || defaultName,
      subtitleBn: custom?.subtitleBn || defaultSubtitle,
      images,
      detailSections,
      isVisited,
      onToggleVisit,
    });
  };

  // Progress calculations
  const ruPercent = Math.round((visitedRuIds.length / RU_CAMPUS_PLACES.length) * 100);
  const pdfPercent = Math.round((visitedPdfIds.length / RAJSHAHI_PDF_REGIONS.length) * 100);
  const divPercent = Math.round((visitedDivSpotIds.length / DIVISION_SPOTS.length) * 100);
  const totalVisited = visitedRuIds.length + visitedPdfIds.length + visitedDivSpotIds.length;
  const totalSpots = RU_CAMPUS_PLACES.length + RAJSHAHI_PDF_REGIONS.length + DIVISION_SPOTS.length; // 42 + 22 + 95 = 159
  const totalPercent = Math.round((totalVisited / totalSpots) * 100);

  const currentDistrictSpots = DIVISION_SPOTS.filter((s) => s.districtId === selectedDistrictId);
  const currentDistrictVisitedCount = currentDistrictSpots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
  const currentDistrictPercent =
    currentDistrictSpots.length > 0
      ? Math.round((currentDistrictVisitedCount / currentDistrictSpots.length) * 100)
      : 0;

  // Active Stage Title & Metrics
  const activeMetrics =
    stage === 'ru_campus'
      ? {
          title: 'রাবি ক্যাম্পাস পরিক্রমা',
          countText: `${visitedRuIds.length} / ৪২টি স্পট সম্পন্ন`,
          percent: ruPercent,
          rankLabel:
            ruPercent >= 80 ? '🏆 ক্যাম্পাস মাস্টার এক্সপ্লোরার' : ruPercent >= 40 ? '🌿 মতিহার পরিব্রাজক' : '🚶 প্যারিস রোড পথিক',
        }
      : stage === 'rajshahi_district'
      ? {
          title: 'রাজশাহী জেলা পরিক্রমা',
          countText: `${visitedPdfIds.length} / ২২টি অঞ্চল সম্পন্ন`,
          percent: pdfPercent,
          rankLabel: pdfPercent >= 70 ? '👑 বরেন্দ্র হেরিটেজ অভিযাত্রী' : '🌊 পদ্মা পাড়ের পরিব্রাজক',
        }
      : {
          title: 'রাজশাহী বিভাগ পরিক্রমা',
          countText: `${visitedDivSpotIds.length} / ৯৫টি দর্শনীয় স্থান সম্পন্ন`,
          percent: divPercent,
          rankLabel: '🗺️ উত্তরবঙ্গ ভ্রমণ চ্যাম্পিয়ন',
        };

  // High-Resolution Poster Card Generator (1080x1350)
  const handleDownloadCertificate = () => {
    if (!explorerName.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    // 1. Dark Midnight Emerald Gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, '#03170e');
    grad.addColorStop(0.4, '#064e3b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. High-Tech Golden Border with Corner Accents
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 1008, 1278);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, 988, 1258);

    // 3. Platform Branding
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RU INSIDERS • OFFICIAL EXPLORER MAP POSTER', 540, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('ব্যক্তিগত ভ্রমণ মানচিত্র ও সনদপত্র', 540, 170);

    // 4. Explorer Name in Emerald Glow
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(explorerName.trim(), 540, 270);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText('সফলভাবে ভ্রমণ করেছেন এবং ডিজিটাল মানচিত্রে অগ্রগতি সংরক্ষণ করেছেন', 540, 315);

    // 5. Glowing Score Card
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(140, 355, 800, 210);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(140, 355, 800, 210);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(`${totalPercent}% সামগ্রিক ভ্রমণ সম্পন্ন`, 540, 455);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`মোট ১৫৯টি স্পটের মধ্যে ${totalVisited}টি ঐতিহাসিক ও দর্শনীয় স্থান ভ্রমণ করা হয়েছে`, 540, 520);

    // 6. 3-Stage Progress Breakdown Pills
    const drawPill = (x: number, y: number, title: string, count: string, pct: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x, y, 240, 120);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, 240, 120);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(title, x + 120, y + 40);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`${pct}% সম্পন্ন`, x + 120, y + 78);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(count, x + 120, y + 104);
    };

    drawPill(140, 600, '🎓 রাবি ক্যাম্পাস', `${visitedRuIds.length}/৪২ স্পট`, ruPercent);
    drawPill(420, 600, '🏙️ রাজশাহী জেলা', `${visitedPdfIds.length}/২২ অঞ্চল`, pdfPercent);
    drawPill(700, 600, '🗺️ রাজশাহী বিভাগ', `${visitedDivSpotIds.length}/৯৫ স্পট`, divPercent);

    // 7. Visited Highlights
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ঘুরে দেখা উল্লেখযোগ্য স্পট ও টেরিটরিসমূহ:', 540, 780);

    const visitedList: string[] = [
      ...RU_CAMPUS_PLACES.filter((p) => visitedRuIds.includes(p.id)).map((p) => `✓ [রাবি] ${p.shortBn}`),
      ...RAJSHAHI_PDF_REGIONS.filter((r) => visitedPdfIds.includes(r.id)).map((r) => `✓ [জেলা] ${r.nameBn}`),
      ...DIVISION_SPOTS.filter((s) => visitedDivSpotIds.includes(s.id)).map((s) => `✓ [বিভাগ] ${s.nameBn}`),
    ];

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '20px sans-serif';
    if (visitedList.length === 0) {
      ctx.fillText('এখনও কোনো স্থান টিক দেওয়া হয়নি। ম্যাপে ঘুরে টিক দিন!', 540, 850);
    } else {
      visitedList.slice(0, 14).forEach((item, idx) => {
        const x = idx < 7 ? 310 : 770;
        const y = 830 + (idx % 7) * 48;
        ctx.fillText(item.length > 28 ? item.slice(0, 27) + '...' : item, x, y);
      });
    }

    // 8. Footer Meta
    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.fillText(`ইস্যুর তারিখ: ${new Date().toLocaleDateString('bn-BD')} • ruinsider.com • অফিসিয়াল ডিজিটাল ভ্রমণ রেকর্ড`, 540, 1240);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `RU_Explorer_${explorerName.trim().replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  // ============================================================================
  // FULL PAGE DEDICATED VIEW (Strict Mobile Ergonomics: No Cramped Popup)
  // ============================================================================
  if (fullPageDetail) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setFullPageDetail(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-100 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← ম্যাপে ফিরে যান</span>
        </button>

        {/* Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                অফিসিয়াল স্পট নির্দেশিকা
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {fullPageDetail.nameBn}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{fullPageDetail.subtitleBn}</p>
            </div>

            <button
              onClick={() => {
                fullPageDetail.onToggleVisit();
                setFullPageDetail({ ...fullPageDetail, isVisited: !fullPageDetail.isVisited });
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-sm ${
                fullPageDetail.isVisited
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{fullPageDetail.isVisited ? '✓ এই স্থানে ভ্রমণ করেছি' : 'এখানে ঘুরেছি? টিক দিন'}</span>
            </button>
          </div>

          {/* Multi-Image Gallery */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 relative shadow-inner">
              <img
                src={fullPageDetail.images[activeGalleryIdx] || fullPageDetail.images[0]}
                alt={fullPageDetail.nameBn}
                className="w-full h-full object-cover"
              />
            </div>

            {fullPageDetail.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {fullPageDetail.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIdx(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeGalleryIdx === idx ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unlimited Title + Details Blocks */}
        <div className="space-y-4">
          {fullPageDetail.detailSections.map((sec, idx) => (
            <div key={sec.id || idx} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{sec.title}</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Back Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => setFullPageDetail(null)}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition"
          >
            ← ম্যাপে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // Filtered spots for search
  const filteredRuPlaces = RU_CAMPUS_PLACES.filter(
    (p) =>
      p.nameBn.includes(searchQuery) ||
      p.shortBn.includes(searchQuery) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // MAIN VIEWPORT: UNIFIED 3-STAGE INTERACTIVE MAP
  // ============================================================================
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-5 relative pt-4">
      {/* 1. Unified Progress & "ম্যাপের কতটুকু ঘুরলেন দেখুন" Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-emerald-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-sm">
              {activeMetrics.rankLabel}
            </span>
            <span className="text-emerald-200 text-xs font-bold">
              {activeMetrics.title}
            </span>
            <span className="bg-emerald-900/80 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-700/50">
              মোট ১৫৯টি স্পট
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-300" />
            <span>রাবি ক্যাম্পাস ও রাজশাহী ৩-ধাপের ইন্টারঅ্যাক্টিভ ম্যাপ</span>
          </h1>

          {/* Unified Progress Bar */}
          <div className="space-y-1 max-w-md pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
              <span>চলতি ধাপের অগ্রগতি: {activeMetrics.countText}</span>
              <span className="text-amber-300 font-black">{activeMetrics.percent}% সম্পন্ন</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-3 p-0.5 overflow-hidden border border-emerald-700/60">
              <div
                className="bg-gradient-to-r from-emerald-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${activeMetrics.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* User-Requested Dedicated Button: "ম্যাপের কতটুকু ঘুরলেন দেখুন" */}
        <button
          onClick={() => {
            setModalStageTab(stage);
            setShowShareModal(true);
          }}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2.5 shrink-0 transition active:scale-95 group cursor-pointer"
        >
          <span className="w-6 h-6 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs group-hover:rotate-12 transition-transform">
            🗺️
          </span>
          <div className="text-left">
            <p className="leading-tight font-black">ম্যাপের কতটুকু ঘুরলেন দেখুন</p>
            <p className="text-[10px] text-slate-800 font-bold opacity-80">ব্যক্তিগত ভ্রমণ মানচিত্র ও পোস্টার</p>
          </div>
        </button>
      </div>

      {/* 2. Unified 3-Stage Switcher Tabs (1 -> 2 -> 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-200/90 rounded-2xl shadow-inner">
        <button
          type="button"
          onClick={() => {
            setStage('ru_campus');
            setActiveDrawer(null);
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            stage === 'ru_campus'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <span>🎓 ১. রাবি ক্যাম্পাস ({visitedRuIds.length}/৪২ স্পট)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStage('rajshahi_district');
            setActiveDrawer(null);
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            stage === 'rajshahi_district'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <span>🏙️ ২. রাজশাহী জেলা ({visitedPdfIds.length}/২২ অঞ্চল)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStage('division');
            setActiveDrawer(null);
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            stage === 'division'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <span>🗺️ ৩. রাজশাহী বিভাগ ({visitedDivSpotIds.length}/৯৫ স্পট)</span>
        </button>
      </div>

      {/* ============================================================================ */}
      {/* STAGE 1: RU CAMPUS 42 CONTIGUOUS TERRITORIES & ROAD NETWORK (Gemini Argon RU) */}
      {/* ============================================================================ */}
      {stage === 'ru_campus' && (
        <div className="relative bg-[#f6f4ec] rounded-3xl border border-stone-300 shadow-xl overflow-hidden p-2 sm:p-4 space-y-2">
          {/* Canvas Sub-Header & Search Bar */}
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-stone-300/80 text-xs px-2 gap-2">
            <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>রাবি ক্যাম্পাসের ৪২টি টেরিটরি ও সড়ক নেটওয়ার্ক • যেকোনো স্থানে স্পর্শ করে বিস্তারিত ও ছবি দেখুন</span>
            </span>

            {/* Zoom & Reset Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRuMapZoom((z) => Math.min(z + 0.2, 2.2))}
                className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm cursor-pointer"
                title="বড় করুন"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRuMapZoom((z) => Math.max(z - 0.2, 0.8))}
                className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm cursor-pointer"
                title="ছোট করুন"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRuMapZoom(1)}
                className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm cursor-pointer"
                title="রিসেট ভিউ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="px-2">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ভবন, হল বা চত্বরের নাম খুঁজুন..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SVG Canvas for RU Campus 42 Territories */}
          <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[480px] max-h-[75vh] relative select-none overflow-hidden rounded-2xl bg-[#f6f4ec]">
            <svg
              viewBox={RU_CAMPUS_VIEWBOX}
              className="w-full h-full transition-transform duration-200"
              style={{ transform: `scale(${ruMapZoom})` }}
            >
              <defs>
                <filter id="ru-territory-shadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#57534e" floodOpacity="0.18" />
                </filter>
              </defs>

              {/* 1. Base Turf & Railway Base */}
              <polygon
                points="72,118 1152,118 1110,535 552,608 106,690 68,355"
                fill="#ebe6d8"
                stroke="#d6d0c0"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <polygon
                points="155,18 655,28 635,112 145,112"
                fill="#ebe6d8"
                stroke="#d6d0c0"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* 2. Official Highway & Internal Roads */}
              {/* Rajshahi-Natore Highway */}
              <path
                d="M 95,692 L 395,624 L 555,598 L 785,562 L 1135,524"
                fill="none"
                stroke="#15803d"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.85"
              />
              {/* Internal Road Network */}
              <path
                d="
                  M 480,592 L 480,475
                  M 254,475 L 895,475
                  M 254,645 L 254,122
                  M 450,475 L 450,24
                  M 450,220 L 968,258
                  M 658,220 L 658,125
                  M 756,250 L 756,475
                  M 895,258 L 895,475
                  M 254,360 L 450,360
                  M 450,296 L 605,296
                  M 968,258 L 1030,45
                "
                fill="none"
                stroke="#cfc7b2"
                strokeWidth="13"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="
                  M 480,592 L 480,475
                  M 254,475 L 895,475
                  M 254,645 L 254,122
                  M 450,475 L 450,24
                  M 450,220 L 968,258
                  M 658,220 L 658,125
                  M 756,250 L 756,475
                  M 895,258 L 895,475
                  M 254,360 L 450,360
                  M 450,296 L 605,296
                  M 968,258 L 1030,45
                "
                fill="none"
                stroke="#15803d"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pedestrian Walkways */}
              <path
                d="M 105,128 L 254,128 M 254,128 L 254,250"
                fill="none"
                stroke="#0d9488"
                strokeWidth="5"
                strokeDasharray="4 5"
                strokeOpacity="0.75"
              />

              {/* Zoha Chattar / Roundabout */}
              <circle cx="480" cy="475" r="14" fill="#15803d" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="480" cy="475" r="6" fill="#fef08a" />

              {/* Rajshahi-Dhaka Railway line */}
              <line x1="55" y1="118" x2="1158" y2="118" stroke="#57534e" strokeWidth="4" strokeOpacity="0.8" />
              <line x1="55" y1="118" x2="1158" y2="118" stroke="#f7f5ee" strokeWidth="2.2" strokeDasharray="8 8" />

              {/* 3. 42 Contiguous Territory Polygons */}
              <g filter="url(#ru-territory-shadow)">
                {RU_CAMPUS_PLACES.map((place) => {
                  const isSelected = selectedRuId === place.id;
                  const isVisited = visitedRuIds.includes(place.id);
                  const isMatchSearch =
                    searchQuery.trim() === '' ||
                    place.nameBn.includes(searchQuery) ||
                    place.shortBn.includes(searchQuery);

                  const custom = customSpotsMap[place.id];
                  const displayName = custom?.nameBn || place.nameBn;
                  const shortName = place.shortBn || displayName;

                  let fillColor = '#ded8ca';
                  if (isVisited) fillColor = '#1f7a44';
                  else if (isSelected) fillColor = '#fef08a';

                  return (
                    <g
                      key={place.id}
                      onClick={() => {
                        setSelectedRuId(place.id);
                        setActiveDrawer({
                          id: place.id,
                          stage: 'ru_campus',
                          nameBn: displayName,
                          nameEn: place.nameEn,
                          rankNo: place.rankNo,
                          categoryBn: 'রাবি ক্যাম্পাস স্পট',
                          imageUrl: custom?.images?.[0] || place.imageUrl,
                          desc: place.descriptionBn,
                          traffic: place.id === 'paris_road' ? '🚶 পথচারী ও সাইকেল পথ' : '🛺 রিক্সা ও 🚗 কার সড়ক',
                          isVisited,
                          onToggleVisit: () => toggleRuSpot(place.id),
                        });
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                          text: displayName,
                          sub: isVisited ? '✓ ঘুরে দেখা হয়েছে' : 'ক্লিক করে তথ্য দেখুন',
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`cursor-pointer group transition-all duration-200 ${
                        !isMatchSearch ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      <path
                        d={place.d}
                        fill={fillColor}
                        stroke={isSelected ? '#f59e0b' : '#f6f4ec'}
                        strokeWidth={isSelected ? 4 : 2}
                        className="transition-colors duration-200 group-hover:brightness-95"
                      />

                      {/* Rank Pin Circle */}
                      <circle
                        cx={place.center.x}
                        cy={place.center.y}
                        r="12"
                        fill={isVisited ? '#15803d' : '#1e293b'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={place.center.x}
                        y={place.center.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {place.rankNo}
                      </text>

                      {/* Label */}
                      <text
                        x={place.center.x}
                        y={place.center.y + 19}
                        textAnchor="middle"
                        fill="#1c1917"
                        fontSize="11"
                        fontWeight="700"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        className="pointer-events-none"
                      >
                        {shortName}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Legend Bar */}
              <g transform="translate(560, 686)" className="pointer-events-none">
                <rect x="0" y="0" width="600" height="46" rx="12" fill="#ffffff" fillOpacity="0.95" stroke="#d6d3d1" strokeWidth="1.2" />
                <circle cx="20" cy="23" r="8" fill="#1f7a44" />
                <text x="36" y="27" fontSize="11" fontWeight="700" fill="#15803d">ভ্রমণ সম্পন্ন</text>

                <circle cx="140" cy="23" r="8" fill="#ded8ca" stroke="#888" strokeWidth="1" />
                <text x="156" y="27" fontSize="11" fontWeight="700" fill="#44403c">অদেখা স্থান</text>

                <rect x="250" y="15" width="22" height="15" rx="3" fill="#15803d" />
                <text x="280" y="27" fontSize="11" fontWeight="700" fill="#166534">🛺 রিক্সা ও কার সড়ক</text>

                <rect x="420" y="15" width="18" height="15" rx="3" fill="#0d9488" strokeDasharray="3 3" />
                <text x="445" y="27" fontSize="11" fontWeight="700" fill="#115e59">🚶 শুধু পথচারী</text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* STAGE 2: RAJSHAHI DISTRICT 22 REGIONS */}
      {/* ============================================================================ */}
      {stage === 'rajshahi_district' && (
        <div className="relative bg-[#022c22] rounded-3xl border border-emerald-900 shadow-xl overflow-hidden p-3 sm:p-5 flex flex-col space-y-3">
          <div className="flex flex-wrap items-center justify-between pb-3 text-xs text-emerald-200 font-semibold border-b border-emerald-900 gap-2">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" /> রাজশাহী জেলা ২২-অঞ্চল ভেক্টর ম্যাপ • যেকোনো অঞ্চলে স্পর্শ করে তথ্য দেখুন
            </span>
            <span>পদ্মা তীরবর্তী অঞ্চলসহ ২২টি সীমানা ({visitedPdfIds.length}/২২ সম্পন্ন)</span>
          </div>

          <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[480px] max-h-[75vh] relative rounded-2xl overflow-hidden border border-emerald-950 bg-slate-900 my-auto">
            <img
              src="/campus/rajshahi-district-detailed-map.jpg"
              alt="Rajshahi District Map"
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
            />

            <svg
              viewBox={RAJSHAHI_PDF_MAP_VIEWBOX}
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {RAJSHAHI_PDF_REGIONS.map((region) => {
                const isSelected = selectedPdfId === region.id;
                const isVisited = visitedPdfIds.includes(region.id);

                let fillColor = '#1e293b';
                if (isVisited) fillColor = '#059669';

                return (
                  <g
                    key={region.id}
                    onClick={() => {
                      setSelectedPdfId(region.id);
                      setActiveDrawer({
                        id: region.id,
                        stage: 'rajshahi_district',
                        nameBn: region.nameBn,
                        nameEn: region.nameEn,
                        rankNo: region.rankNo,
                        categoryBn: 'রাজশাহী জেলা অঞ্চল',
                        imageUrl: customSpotsMap[region.id]?.images?.[0] || region.imageUrl,
                        desc: region.descriptionBn,
                        isVisited,
                        onToggleVisit: () => togglePdfRegion(region.id),
                      });
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                        text: region.nameBn,
                        sub: isVisited ? '✓ ঘুরে দেখা হয়েছে' : 'ক্লিক করে তথ্য দেখুন',
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    className="cursor-pointer group transition-all duration-300"
                  >
                    <path
                      d={region.d}
                      fill={fillColor}
                      fillOpacity={isVisited ? 0.8 : 0.45}
                      stroke={isSelected ? '#facc15' : '#ffffff'}
                      strokeWidth={isSelected ? 6 : 2}
                      className={isSelected ? 'glow-selected-polygon' : 'hover:fill-opacity-80'}
                    />
                    <circle
                      cx={region.center.x}
                      cy={region.center.y}
                      r="24"
                      fill={isVisited ? '#059669' : '#0f172a'}
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                    <text
                      x={region.center.x}
                      y={region.center.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="20"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {region.rankNo}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* STAGE 3: RAJSHAHI DIVISION 8 DISTRICTS & 95 OFFICIAL SPOTS */}
      {/* ============================================================================ */}
      {stage === 'division' && (
        <div className="space-y-4">
          {/* Top 8 District Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {DIVISION_DISTRICT_META.map((meta) => {
              const isSelected = selectedDistrictId === meta.id;
              const distSpots = DIVISION_SPOTS.filter((s) => s.districtId === meta.id);
              const visitedCount = distSpots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
              return (
                <button
                  key={meta.id}
                  onClick={() => setSelectedDistrictId(meta.id)}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-slate-500">{meta.rankBn}</span>
                  <span className="text-xs font-extrabold text-slate-900 truncate mt-1">
                    {meta.nameBn}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1">
                    {visitedCount}/{distSpots.length} স্পট
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#022c22] rounded-3xl border border-emerald-900 shadow-xl p-3 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 text-xs text-emerald-200 font-semibold border-b border-emerald-900">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4" /> রাজশাহী বিভাগ ৮-জেলা ভেক্টর ম্যাপ • জেলা ও স্পট স্পর্শ করে তথ্য দেখুন
              </span>
              <span>{DIVISION_DISTRICT_META.find((d) => d.id === selectedDistrictId)?.nameBn || 'রাজশাহী'} জেলার দর্শনীয় স্থান ({currentDistrictVisitedCount}/{currentDistrictSpots.length})</span>
            </div>

            <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[420px] max-h-[65vh] relative rounded-2xl overflow-hidden border border-emerald-950 bg-slate-900 my-auto">
              <svg viewBox={RAJSHAHI_VIEWBOX} className="w-full h-full p-2">
                {RAJSHAHI_DISTRICT_SVGS.map((distSvg) => {
                  const isSelected = selectedDistrictId === distSvg.id;
                  const distMeta = DIVISION_DISTRICT_META.find((m) => m.id === distSvg.id);
                  const distSpots = DIVISION_SPOTS.filter((s) => s.districtId === distSvg.id);
                  const visitedCount = distSpots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
                  const isFullyVisited = distSpots.length > 0 && visitedCount === distSpots.length;

                  return (
                    <g
                      key={distSvg.id}
                      onClick={() => setSelectedDistrictId(distSvg.id)}
                      className="cursor-pointer group transition-all"
                    >
                      <path
                        d={distSvg.d}
                        fill={isSelected ? '#059669' : isFullyVisited ? '#047857' : '#1e293b'}
                        stroke={isSelected ? '#facc15' : '#475569'}
                        strokeWidth={isSelected ? 4 : 2}
                        className="group-hover:fill-emerald-800 transition"
                      />
                      <circle
                        cx={distSvg.pin.x}
                        cy={distSvg.pin.y}
                        r="18"
                        fill={isFullyVisited ? '#10b981' : isSelected ? '#f59e0b' : '#334155'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={distSvg.pin.x}
                        y={distSvg.pin.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {visitedCount}
                      </text>
                      <text
                        x={distSvg.label.x}
                        y={distSvg.label.y}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                        stroke="#0f172a"
                        strokeWidth="3"
                        paintOrder="stroke fill"
                        className="pointer-events-none"
                      >
                        {distMeta?.nameBn || distSvg.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* List of 95 Spots for Selected District */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>{DIVISION_DISTRICT_META.find((d) => d.id === selectedDistrictId)?.nameBn} জেলার দর্শনীয় স্থানসমূহ ({currentDistrictSpots.length}টি)</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ঘুরেছেন: {currentDistrictVisitedCount}/{currentDistrictSpots.length}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentDistrictSpots.map((spot) => {
                const isVisited = visitedDivSpotIds.includes(spot.id);
                return (
                  <div
                    key={spot.id}
                    onClick={() => {
                      setActiveDrawer({
                        id: spot.id,
                        stage: 'division',
                        nameBn: spot.nameBn,
                        categoryBn: `${DIVISION_DISTRICT_META.find((d) => d.id === spot.districtId)?.nameBn} জেলা স্পট`,
                        rankNo: spot.rankNo,
                        imageUrl: spot.imageUrl,
                        desc: spot.summaryBn,
                        traffic: spot.locationBn,
                        isVisited,
                        onToggleVisit: () => toggleDivSpot(spot.id),
                      });
                    }}
                    className={`p-3 rounded-2xl border transition flex items-start gap-3 cursor-pointer group hover:shadow-md ${
                      isVisited
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                      <img src={spot.imageUrl} alt={spot.nameBn} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      {isVisited && (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-500">#{spot.rankNo}</span>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded truncate">
                          {spot.locationBn}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                        {spot.nameBn}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {spot.summaryBn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* UNIFIED MODERN BOTTOM SHEET DRAWER (FOR ALL 3 MAPS) */}
      {/* ============================================================================ */}
      {activeDrawer && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-4 max-w-3xl mx-auto animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-emerald-600/30 shadow-2xl p-4 sm:p-6 relative">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm relative group">
                <img
                  src={activeDrawer.imageUrl}
                  alt={activeDrawer.nameBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {activeDrawer.isVisited && (
                  <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white rounded-full p-1 shadow">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {activeDrawer.categoryBn}
                  </span>
                  {activeDrawer.rankNo && (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      #{activeDrawer.rankNo}
                    </span>
                  )}
                  {activeDrawer.traffic && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {activeDrawer.traffic}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {activeDrawer.nameBn}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {activeDrawer.desc}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      activeDrawer.onToggleVisit();
                      setActiveDrawer((prev) => (prev ? { ...prev, isVisited: !prev.isVisited } : null));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      activeDrawer.isVisited
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{activeDrawer.isVisited ? '✓ এই স্থানটি ঘুরেছি' : 'এখানে ঘুরেছি? টিক দিন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const drawerData = activeDrawer;
                      setActiveDrawer(null);
                      openSpotFullPage(
                        drawerData.id,
                        drawerData.nameBn,
                        drawerData.nameEn || '',
                        drawerData.imageUrl,
                        drawerData.desc,
                        drawerData.isVisited,
                        drawerData.onToggleVisit
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>সম্পূর্ণ বিস্তারিত ও ছবি দেখুন →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {tooltip && (
        <div
          className="fixed z-40 bg-slate-950/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl pointer-events-none transition-opacity -translate-x-1/2 -translate-y-full border border-slate-700 backdrop-blur-sm"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <p>{tooltip.text}</p>
          {tooltip.sub && <p className="text-[10px] text-amber-300 font-medium">{tooltip.sub}</p>}
        </div>
      )}

      {/* ============================================================================ */}
      {/* "ম্যাপের কতটুকু ঘুরলেন দেখুন" GLOWING MAP & PROGRESS MODAL                     */}
      {/* ============================================================================ */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-800/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-4 shadow-2xl relative text-white my-auto max-h-[95vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-300 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto text-xl shadow-lg">
                🗺️
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 pt-1">
                ম্যাপের কতটুকু ঘুরলেন দেখুন
              </h2>
              <p className="text-xs text-emerald-200">
                যে স্থানগুলো আপনি ঘুরে দেখেছেন সেগুলো মানচিত্রে উজ্জ্বল ও আলোকিত (Glowing) হয়ে উঠেছে!
              </p>
            </div>

            {/* Stage Selector Tabs inside Modal */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setModalStageTab('ru_campus')}
                className={`py-2 rounded-lg transition ${
                  modalStageTab === 'ru_campus' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎓 রাবি ({visitedRuIds.length}/৪২)
              </button>
              <button
                onClick={() => setModalStageTab('rajshahi_district')}
                className={`py-2 rounded-lg transition ${
                  modalStageTab === 'rajshahi_district' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏙️ জেলা ({visitedPdfIds.length}/২২)
              </button>
              <button
                onClick={() => setModalStageTab('division')}
                className={`py-2 rounded-lg transition ${
                  modalStageTab === 'division' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ বিভাগ ({visitedDivSpotIds.length}/৯৫)
              </button>
            </div>

            {/* Glowing Visual Map Graphic Container */}
            <div className="bg-slate-950 rounded-2xl border-2 border-emerald-500/40 p-2 relative overflow-hidden shadow-inner aspect-[16/10]">
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-600/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300">উজ্জ্বল স্থান = ভ্রমণ সম্পন্ন ({
                  modalStageTab === 'ru_campus' ? visitedRuIds.length : modalStageTab === 'rajshahi_district' ? visitedPdfIds.length : visitedDivSpotIds.length
                })</span>
              </div>

              {/* Glowing SVG Map for RU Campus */}
              {modalStageTab === 'ru_campus' && (
                <svg viewBox={RU_CAMPUS_VIEWBOX} className="w-full h-full">
                  <defs>
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#34d399" floodOpacity="0.8" />
                    </filter>
                  </defs>
                  {/* Road Underlay */}
                  <path
                    d="M 95,692 L 395,624 L 555,598 L 785,562 L 1135,524"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {RU_CAMPUS_PLACES.map((place) => {
                    const isVisited = visitedRuIds.includes(place.id);
                    return (
                      <g key={place.id}>
                        <path
                          d={place.d}
                          fill={isVisited ? '#10b981' : '#1e293b'}
                          fillOpacity={isVisited ? 0.95 : 0.35}
                          stroke={isVisited ? '#34d399' : '#334155'}
                          strokeWidth={isVisited ? 3 : 1}
                          filter={isVisited ? 'url(#neon-glow)' : undefined}
                        />
                        {isVisited && (
                          <circle cx={place.center.x} cy={place.center.y} r="8" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
                        )}
                        <text
                          x={place.center.x}
                          y={place.center.y + (isVisited ? 15 : 4)}
                          textAnchor="middle"
                          fill={isVisited ? '#ffffff' : '#64748b'}
                          fontSize={isVisited ? '10' : '8'}
                          fontWeight="bold"
                        >
                          {place.shortBn}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Glowing SVG Map for District */}
              {modalStageTab === 'rajshahi_district' && (
                <svg viewBox={RAJSHAHI_PDF_MAP_VIEWBOX} className="w-full h-full">
                  {RAJSHAHI_PDF_REGIONS.map((region) => {
                    const isVisited = visitedPdfIds.includes(region.id);
                    return (
                      <g key={region.id}>
                        <path
                          d={region.d}
                          fill={isVisited ? '#10b981' : '#1e293b'}
                          fillOpacity={isVisited ? 0.85 : 0.3}
                          stroke={isVisited ? '#facc15' : '#475569'}
                          strokeWidth={isVisited ? 4 : 1.5}
                        />
                        <circle
                          cx={region.center.x}
                          cy={region.center.y}
                          r="18"
                          fill={isVisited ? '#10b981' : '#0f172a'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={region.center.x}
                          y={region.center.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#ffffff"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {region.rankNo}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Glowing SVG Map for Division */}
              {modalStageTab === 'division' && (
                <svg viewBox={RAJSHAHI_VIEWBOX} className="w-full h-full p-2">
                  {RAJSHAHI_DISTRICT_SVGS.map((dist) => {
                    const spots = DIVISION_SPOTS.filter((s) => s.districtId === dist.id);
                    const visitedCount = spots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
                    const hasVisited = visitedCount > 0;
                    return (
                      <g key={dist.id}>
                        <path
                          d={dist.d}
                          fill={hasVisited ? '#10b981' : '#1e293b'}
                          fillOpacity={hasVisited ? 0.8 : 0.35}
                          stroke={hasVisited ? '#facc15' : '#475569'}
                          strokeWidth={hasVisited ? 3 : 1.5}
                        />
                        <text
                          x={dist.label.x}
                          y={dist.label.y}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="bold"
                        >
                          {DIVISION_DISTRICT_META.find((d) => d.id === dist.id)?.nameBn} ({visitedCount}/{spots.length})
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Glowing Score Summary Box */}
            <div className="bg-emerald-950/70 border border-emerald-600/50 rounded-2xl p-3.5 text-center space-y-1">
              <p className="text-xs font-bold text-emerald-300">
                {modalStageTab === 'ru_campus'
                  ? `🎓 রাবি ক্যাম্পাসের ৪২টি স্পটের মধ্যে ${visitedRuIds.length}টি স্থান ভ্রমণ করেছেন`
                  : modalStageTab === 'rajshahi_district'
                  ? `🏙️ রাজশাহী জেলার ২২টি অঞ্চলের মধ্যে ${visitedPdfIds.length}টি অঞ্চল ভ্রমণ করেছেন`
                  : `🗺️ রাজশাহী বিভাগের ৯৫টি দর্শনীয় স্থানের মধ্যে ${visitedDivSpotIds.length}টি স্থান ভ্রমণ করেছেন`}
              </p>
              <p className="text-2xl font-black text-amber-300">
                {modalStageTab === 'ru_campus'
                  ? `${ruPercent}% সম্পূর্ণ`
                  : modalStageTab === 'rajshahi_district'
                  ? `${pdfPercent}% সম্পূর্ণ`
                  : `${divPercent}% সম্পূর্ণ`}
              </p>
              <p className="text-[11px] text-slate-300">
                সর্বমোট ১৫৯টি স্পটের মধ্যে <span className="text-amber-400 font-bold">{totalVisited}টি</span> স্থান ঘোরা সম্পন্ন হয়েছে ({totalPercent}%)
              </p>
            </div>

            {/* Name Input Box (Mandatory for Poster) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>পোস্টার ও সনদে আপনার নাম লিখুন:</span>
                {!explorerName.trim() && (
                  <span className="text-amber-400 text-[11px] font-bold">নাম লিখলে ডাউনলোড বোতাম সচল হবে</span>
                )}
              </label>
              <input
                type="text"
                value={explorerName}
                onChange={(e) => setExplorerName(e.target.value)}
                placeholder="যেমন: মাহিম আহমেদ / রাবি শিক্ষার্থী"
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadCertificate}
              disabled={!explorerName.trim()}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                explorerName.trim()
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>📥 রঙিন ভ্রমণ মানচিত্র ও পোস্টার ডাউনলোড করুন (PNG)</span>
            </button>

            {/* Hidden High-Res Render Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
