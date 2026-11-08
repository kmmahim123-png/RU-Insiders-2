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
  // 1 -> 2 -> 3 tab order (Default: RU Campus)
  const [stage, setStage] = useState<'ru_campus' | 'rajshahi_district' | 'division'>('ru_campus');

  // Selected item states
  const [selectedRuId, setSelectedRuId] = useState<string>('paris_road');
  const [selectedPdfId, setSelectedPdfId] = useState<string>('pdf_ru');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajshahi');

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
    gate?: string;
    isVisited: boolean;
    onToggleVisit: () => void;
  } | null>(null);

  // Custom data loaded from DB
  const [customSpotsMap, setCustomSpotsMap] = useState<Record<string, MapSpotCustomData>>({});

  // Full-page detail view (NO cramped floating popup)
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

  // Certificate / Share card modal
  const [showShareModal, setShowShareModal] = useState(false);
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
      .then((r) => r.json())
      .then((data) => {
        if (data.mapSpots) setCustomSpotsMap(data.mapSpots);
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

  // Dedicated Full-Page Spot Details Handler (Never cramped popup)
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

  // Progress metrics
  const ruPercent = Math.round((visitedRuIds.length / RU_CAMPUS_PLACES.length) * 100);
  const pdfPercent = Math.round((visitedPdfIds.length / RAJSHAHI_PDF_REGIONS.length) * 100);
  const currentDistrictSpots = DIVISION_SPOTS.filter((s) => s.districtId === selectedDistrictId);
  const currentDistrictVisitedCount = currentDistrictSpots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
  const currentDistrictPercent =
    currentDistrictSpots.length > 0
      ? Math.round((currentDistrictVisitedCount / currentDistrictSpots.length) * 100)
      : 0;

  // Active stage metrics
  const activeMetrics =
    stage === 'ru_campus'
      ? {
          title: 'রাবি ক্যাম্পাস পরিক্রমা',
          countText: `${visitedRuIds.length} / ৪২টি স্থান`,
          percent: ruPercent,
          rankLabel:
            ruPercent >= 80 ? '🏆 ক্যাম্পাস মাস্টার এক্সপ্লোরার' : ruPercent >= 40 ? '🌿 মতিহার পরিব্রাজক' : '🚶 প্যারিস রোড পথিক',
        }
      : stage === 'rajshahi_district'
      ? {
          title: 'রাজশাহী জেলা পরিক্রমা',
          countText: `${visitedPdfIds.length} / ২২টি অঞ্চল`,
          percent: pdfPercent,
          rankLabel: pdfPercent >= 70 ? '👑 বরেন্দ্র হেরিটেজ অভিযাত্রী' : '🌊 পদ্মা পাড়ের পরিব্রাজক',
        }
      : {
          title: 'রাজশাহী বিভাগ পরিক্রমা',
          countText: `${visitedDivSpotIds.length} / ${DIVISION_SPOTS.length}টি স্পট`,
          percent: Math.round((visitedDivSpotIds.length / DIVISION_SPOTS.length) * 100),
          rankLabel: '🗺️ উত্তরবঙ্গ ভ্রমণ চ্যাম্পিয়ন',
        };

  // Certificate / Share card generation
  const handleDownloadCertificate = () => {
    if (!explorerName.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, '#022c22');
    grad.addColorStop(0.5, '#064e3b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Golden Border
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1000, 1270);

    // Title
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RU INSIDERS • OFFICIAL EXPLORER CARD', 540, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    const mapTitle =
      stage === 'ru_campus'
        ? 'রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস পরিক্রমা (৪২টি স্থান)'
        : stage === 'rajshahi_district'
        ? 'রাজশাহী জেলা ভ্রমণ সনদ (২২টি অঞ্চল)'
        : 'রাজশাহী বিভাগ ভ্রমণ সনদ';
    ctx.fillText(mapTitle, 540, 195);

    // Explorer Name
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(explorerName.trim(), 540, 305);

    // Metric Box
    ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
    ctx.fillRect(190, 360, 700, 220);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(190, 360, 700, 220);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText(`${activeMetrics.percent}% ভ্রমণ সম্পন্ন`, 540, 480);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(activeMetrics.countText, 540, 545);

    // Highlights
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('আমার ঘুরে দেখা উল্লেখযোগ্য স্থানসমূহ:', 540, 670);

    const visitedNames: string[] =
      stage === 'ru_campus'
        ? RU_CAMPUS_PLACES.filter((p) => visitedRuIds.includes(p.id)).map((p) => `✓ ${p.shortBn}`)
        : stage === 'rajshahi_district'
        ? RAJSHAHI_PDF_REGIONS.filter((r) => visitedPdfIds.includes(r.id)).map((r) => `✓ ${r.nameBn}`)
        : DIVISION_SPOTS.filter((s) => visitedDivSpotIds.includes(s.id)).map((s) => `✓ ${s.nameBn}`);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '24px sans-serif';
    if (visitedNames.length === 0) {
      ctx.fillText('এখনও কোনো স্থান টিক দেওয়া হয়নি', 540, 740);
    } else {
      visitedNames.slice(0, 10).forEach((name, idx) => {
        const x = idx < 5 ? 320 : 760;
        const y = 730 + (idx % 5) * 60;
        ctx.fillText(name, x, y);
      });
    }

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText(`ইস্যু তারিখ: ${new Date().toLocaleDateString('bn-BD')} • ruinsider.com`, 540, 1220);

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

          {/* Image Gallery */}
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

        {/* Detail Sections */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>স্থানটির ইতিহাস, তথ্য ও তাৎপর্য</span>
          </h2>

          <div className="space-y-5">
            {fullPageDetail.detailSections.map((sec, idx) => (
              <div key={sec.id || idx} className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{sec.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN VIEWPORT: UNIFIED 3-STAGE INTERACTIVE MAP
  // ============================================================================
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-5 relative">
      {/* 1. Unified Progress & Trophy Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-emerald-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-sm">
              {activeMetrics.rankLabel}
            </span>
            <span className="text-emerald-200 text-xs font-bold">
              {activeMetrics.title}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-300" />
            <span>রাবি ক্যাম্পাস ও রাজশাহী ইন্টারঅ্যাক্টিভ ভেক্টর ম্যাপ</span>
          </h2>

          {/* Unified Progress Bar */}
          <div className="space-y-1 max-w-md pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
              <span>ভ্রমণ অগ্রগতি: {activeMetrics.countText}</span>
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

        <button
          onClick={() => setShowShareModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 transition"
        >
          <Trophy className="w-4 h-4 text-slate-950" />
          <span>ভ্রমণ সনদ ও শেয়ার কার্ড →</span>
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
          <span>🗺️ ৩. রাজশাহী বিভাগ ({visitedDivSpotIds.length}/{DIVISION_SPOTS.length} স্পট)</span>
        </button>
      </div>

      {/* ============================================================================ */}
      {/* STAGE 1: RU CAMPUS 42 CONTIGUOUS TERRITORIES & ROAD NETWORK (Unseen RU Map) */}
      {/* ============================================================================ */}
      {stage === 'ru_campus' && (
        <div className="relative bg-[#f6f4ec] rounded-3xl border border-stone-300 shadow-xl overflow-hidden p-2 sm:p-4">
          {/* Canvas Sub-Header */}
          <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-stone-300/80 text-xs px-2 gap-2">
            <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>রাবি ক্যাম্পাসের ৪২টি টেরিটরি ও সড়ক নেটওয়ার্ক • যেকোনো স্থানে স্পর্শ করে বিস্তারিত ও ছবি দেখুন</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRuMapZoom((z) => Math.min(z + 0.2, 2.2))}
                className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm"
                title="বড় করুন"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRuMapZoom((z) => Math.max(z - 0.2, 0.8))}
                className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm"
                title="ছোট করুন"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRuMapZoom(1)}
                className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm"
                title="রিসেট ভিউ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
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
              {/* Internal Road Borders */}
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
              {/* Internal Road Fill */}
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
                      className="cursor-pointer group transition-all duration-200"
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

              {/* Legend */}
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
        <div className="relative bg-[#022c22] rounded-3xl border border-emerald-900 shadow-xl overflow-hidden p-3 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 text-xs text-emerald-200 font-semibold border-b border-emerald-900">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" /> রাজশাহী জেলা ২২-অঞ্চল ভেক্টর ম্যাপ • যেকোনো অঞ্চলে স্পর্শ করে তথ্য দেখুন
            </span>
            <span>পদ্মা তীরবর্তী অঞ্চলসহ ২২টি সীমানা ({visitedPdfIds.length}/২২ সম্পন্ন)</span>
          </div>

          <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[480px] max-h-[75vh] relative rounded-2xl overflow-hidden border border-emerald-950 bg-slate-900 my-auto">
            {/* Background Map Image */}
            <img
              src="/campus/rajshahi-district-detailed-map.jpg"
              alt="Rajshahi District Map"
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
            />

            {/* Vector Overlay Polygons */}
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
                    {/* Rank Circle */}
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
      {/* STAGE 3: RAJSHAHI DIVISION 8 DISTRICTS & 32 SPOTS */}
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
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
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
              <span>{DIVISION_DISTRICT_META.find((d) => d.id === selectedDistrictId)?.nameBn || 'রাজশাহী'} জেলার দর্শনীয় স্থান</span>
            </div>

            <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[480px] max-h-[75vh] relative rounded-2xl overflow-hidden border border-emerald-950 bg-slate-900 my-auto">
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
                      onClick={() => {
                        setSelectedDistrictId(distSvg.id);
                        const firstSpot = distSpots[0];
                        if (firstSpot) {
                          const distName = distMeta?.nameBn || distSvg.nameBn;
                          setActiveDrawer({
                            id: firstSpot.id,
                            stage: 'division',
                            nameBn: firstSpot.nameBn,
                            nameEn: distName,
                            rankNo: firstSpot.rankNo,
                            categoryBn: `${distName} দর্শনীয় স্থান`,
                            imageUrl: firstSpot.imageUrl,
                            desc: firstSpot.summaryBn,
                            isVisited: visitedDivSpotIds.includes(firstSpot.id),
                            onToggleVisit: () => toggleDivSpot(firstSpot.id),
                          });
                        }
                      }}
                      className="cursor-pointer transition-all duration-300 group"
                    >
                      <path
                        d={distSvg.d}
                        fill={isFullyVisited ? '#059669' : isSelected ? '#15803d' : '#0f172a'}
                        fillOpacity={isSelected ? 0.9 : 0.65}
                        stroke={isSelected ? '#facc15' : '#10b981'}
                        strokeWidth={isSelected ? 4 : 1.5}
                        className="group-hover:fill-emerald-800 transition-colors"
                      />
                      <text
                        x={distSvg.label.x}
                        y={distSvg.label.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                        stroke="#022c22"
                        strokeWidth="1.5"
                        paintOrder="stroke fill"
                        className="pointer-events-none"
                      >
                        {distSvg.nameBn}
                      </text>
                    </g>
                  );
                })}
              </svg>
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
            {/* Drag handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold transition"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Spot Thumbnail Photo */}
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

              {/* Spot Details & Information */}
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

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {/* Visit Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      activeDrawer.onToggleVisit();
                      setActiveDrawer((prev) => (prev ? { ...prev, isVisited: !prev.isVisited } : null));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
                      activeDrawer.isVisited
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{activeDrawer.isVisited ? '✓ এই স্থানটি ঘুরেছি' : 'এখানে ঘুরেছি? টিক দিন'}</span>
                  </button>

                  {/* Dedicated Full Page View Link */}
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
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
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

      {/* Certificate / Share Card Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                🏆
              </span>
              <h3 className="text-xl font-black text-slate-900 pt-1">
                অফিসিয়াল ভ্রমণ সনদ ও শেয়ার কার্ড
              </h3>
              <p className="text-xs text-slate-500">
                আপনার নাম লিখে ডিজিটাল ভ্রমণ সনদ তৈরি করুন এবং সোশ্যাল মিডিয়ায় শেয়ার করুন
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">আপনার পূর্ণ নাম লিখুন *</label>
                <input
                  type="text"
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>বর্তমান অগ্রগতি:</span>
                <span className="text-emerald-700 font-extrabold">
                  {activeMetrics.countText} ({activeMetrics.percent}%)
                </span>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <button
                type="button"
                onClick={handleDownloadCertificate}
                disabled={!explorerName.trim()}
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-md ${
                  explorerName.trim()
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>ডিজিটাল সনদ ডাউনলোড করুন (PNG)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
