'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  CheckCircle2,
  Trophy,
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Eye,
  Check,
  Sparkles,
  Compass,
  X,
  ExternalLink,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  GraduationCap,
  Building,
} from 'lucide-react';
import { RU_CAMPUS_PLACES, RU_CAMPUS_VIEWBOX, RuPlaceSvgData } from '@/lib/ruCampusSvg';
import { RAJSHAHI_PDF_REGIONS, RAJSHAHI_PDF_MAP_VIEWBOX, RajshahiPdfRegionData } from '@/lib/rajshahiPdfRegions';
import { RAJSHAHI_DISTRICT_SVGS, RAJSHAHI_VIEWBOX, DistrictSvgData } from '@/lib/rajshahiDistrictsSvg';
import { DIVISION_DISTRICT_META, DIVISION_SPOTS, DivisionSpotItem } from '@/lib/divisionSpotsData';

export default function InteractiveThreeMaps() {
  // Current active stage: 'division' (default as requested) | 'rajshahi_district' | 'ru_campus'
  const [stage, setStage] = useState<'division' | 'rajshahi_district' | 'ru_campus'>('division');

  // Selected item states
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajshahi');
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  const [selectedPdfId, setSelectedPdfId] = useState<string>('pdf_ru');
  const [hoveredPdfId, setHoveredPdfId] = useState<string | null>(null);
  const [pdfSearchQuery, setPdfSearchQuery] = useState<string>('');

  const [selectedRuId, setSelectedRuId] = useState<string>('paris_road');
  const [hoveredRuId, setHoveredRuId] = useState<string | null>(null);
  const [ruCategory, setRuCategory] = useState<string>('all');
  const [ruSearchQuery, setRuSearchQuery] = useState<string>('');
  const [ruMapZoom, setRuMapZoom] = useState<number>(1);

  // Visited states (saved in localStorage)
  const [visitedDivSpotIds, setVisitedDivSpotIds] = useState<string[]>([]);
  const [visitedPdfIds, setVisitedPdfIds] = useState<string[]>([]);
  const [visitedRuIds, setVisitedRuIds] = useState<string[]>([]);

  // Spot Detail Modal
  const [detailModalSpot, setDetailModalSpot] = useState<{
    id: string;
    rankNo: string;
    nameBn: string;
    districtBn: string;
    locationBn: string;
    descriptionBn: string;
    imageUrl: string;
    images?: string[];
    tags?: string[];
    isVisited: boolean;
    onToggleVisit: () => void;
  } | null>(null);
  const [activeModalImgIdx, setActiveModalImgIdx] = useState<number>(0);

  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [explorerName, setExplorerName] = useState<string>('');
  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const vDiv = JSON.parse(localStorage.getItem('ru_visited_tourist_spots_v1') || '[]');
      const vPdf = JSON.parse(localStorage.getItem('ru_visited_pdf_regions_v1') || '[]');
      const vRu = JSON.parse(localStorage.getItem('ru_visited_campus_places_v1') || '[]');
      if (Array.isArray(vDiv)) setVisitedDivSpotIds(vDiv);
      if (Array.isArray(vPdf)) setVisitedPdfIds(vPdf);
      if (Array.isArray(vRu)) setVisitedRuIds(vRu);

      const savedUser = JSON.parse(localStorage.getItem('ru_user_session') || 'null');
      if (savedUser?.name) setExplorerName(savedUser.name);
    } catch {}
  }, []);

  // Toggle visited handlers
  const toggleDivSpot = (id: string) => {
    const next = visitedDivSpotIds.includes(id)
      ? visitedDivSpotIds.filter((x) => x !== id)
      : [...visitedDivSpotIds, id];
    setVisitedDivSpotIds(next);
    try {
      localStorage.setItem('ru_visited_tourist_spots_v1', JSON.stringify(next));
    } catch {}
  };

  const togglePdfRegion = (id: string) => {
    const next = visitedPdfIds.includes(id)
      ? visitedPdfIds.filter((x) => x !== id)
      : [...visitedPdfIds, id];
    setVisitedPdfIds(next);
    try {
      localStorage.setItem('ru_visited_pdf_regions_v1', JSON.stringify(next));
    } catch {}
  };

  const toggleRuSpot = (id: string) => {
    const next = visitedRuIds.includes(id)
      ? visitedRuIds.filter((x) => x !== id)
      : [...visitedRuIds, id];
    setVisitedRuIds(next);
    try {
      localStorage.setItem('ru_visited_campus_places_v1', JSON.stringify(next));
    } catch {}
  };

  // Division Statistics
  const totalDivSpots = DIVISION_SPOTS.length || 95;
  const divVisitedCount = visitedDivSpotIds.length;
  const divPercent = Math.min(100, Math.round((divVisitedCount / totalDivSpots) * 100));

  // Per-District statistics
  const districtStats = useMemo(() => {
    const map: Record<string, { total: number; visited: number; pct: number }> = {};
    DIVISION_DISTRICT_META.forEach((dist) => {
      const spots = DIVISION_SPOTS.filter((s) => s.districtId === dist.id);
      const total = spots.length || dist.spotCount;
      const visited = spots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
      const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
      map[dist.id] = { total, visited, pct };
    });
    return map;
  }, [visitedDivSpotIds]);

  const selectedDistrictMeta = useMemo(() => {
    return DIVISION_DISTRICT_META.find((d) => d.id === selectedDistrictId) || DIVISION_DISTRICT_META[0];
  }, [selectedDistrictId]);

  const currentDistrictSpots = useMemo(() => {
    return DIVISION_SPOTS.filter((s) => s.districtId === selectedDistrictId);
  }, [selectedDistrictId]);

  const currentDistrictStats = districtStats[selectedDistrictId] || {
    total: selectedDistrictMeta.spotCount,
    visited: 0,
    pct: 0,
  };

  // District 22 regions stats
  const totalPdfRegions = RAJSHAHI_PDF_REGIONS.length || 22;
  const pdfVisitedCount = visitedPdfIds.length;
  const pdfPercent = Math.min(100, Math.round((pdfVisitedCount / totalPdfRegions) * 100));

  const filteredPdfRegions = useMemo(() => {
    if (!pdfSearchQuery.trim()) return RAJSHAHI_PDF_REGIONS;
    const q = pdfSearchQuery.toLowerCase().trim();
    return RAJSHAHI_PDF_REGIONS.filter(
      (r) => r.nameBn.toLowerCase().includes(q) || r.nameEn.toLowerCase().includes(q)
    );
  }, [pdfSearchQuery]);

  // RU Campus 42 places stats
  const totalRuPlaces = RU_CAMPUS_PLACES.length || 42;
  const ruVisitedCount = visitedRuIds.length;
  const ruPercent = Math.min(100, Math.round((ruVisitedCount / totalRuPlaces) * 100));

  const filteredRuPlaces = useMemo(() => {
    let list = RU_CAMPUS_PLACES;
    if (ruCategory !== 'all') {
      if (ruCategory === 'academic') {
        list = list.filter((p) =>
          [
            'agri_faculty',
            'fine_arts',
            'science_complex',
            'first_science',
            'second_science',
            'fourth_science',
            'central_library',
            'varendra_research',
          ].includes(p.id)
        );
      } else if (ruCategory === 'halls') {
        list = list.filter((p) =>
          [
            'rokeya_hall',
            'mannujan_hall',
            'taposhi_rabeya',
            'begum_khaleda',
            'rahamatunnesa_hall',
            'zia_hall',
            'habibur_hall',
            'motihar_hall',
            'madar_bux_hall',
            'sohrawardi_hall',
            'bangabandhu_hall',
            'shamsuzzoha_hall',
            'sher_e_bangla_hall',
          ].includes(p.id)
        );
      } else if (ruCategory === 'landmarks') {
        list = list.filter((p) =>
          [
            'paris_road',
            'shaheed_minar',
            'tukitaki_chottor',
            'shabash_bd',
            'tscc',
            'botanical_garden',
            'moti_lake_north',
            'moti_lake_south',
          ].includes(p.id)
        );
      } else if (ruCategory === 'admin_gates') {
        list = list.filter((p) =>
          [
            'admin_building',
            'juberi_bhavan',
            'main_gate',
            'kazla_gate',
            'binodpur_gate',
            'charukola_gate',
            'ruet_junction',
            'ru_stadium',
            'badminton_gym',
            'ru_central_mosque',
          ].includes(p.id)
        );
      }
    }
    if (ruSearchQuery.trim()) {
      const q = ruSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) => p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ruCategory, ruSearchQuery]);

  // Open Spot Detail Modal
  const openSpotDetailModal = (spot: {
    id: string;
    rankNo: string;
    nameBn: string;
    districtBn: string;
    locationBn: string;
    descriptionBn: string;
    imageUrl: string;
    images?: string[];
    tags?: string[];
    isVisited: boolean;
    onToggleVisit: () => void;
  }) => {
    setDetailModalSpot(spot);
    setActiveModalImgIdx(0);
  };

  // Certificate Canvas Rendering
  useEffect(() => {
    if (!showCertModal) return;
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#031710');
    grad.addColorStop(0.5, '#062d1f');
    grad.addColorStop(1, '#02130d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative Borders
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, 1150, 750);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 35, 1130, 730);

    // Header Citation
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🏛️ RU INSIDERS • OFFICIAL TOURISM & HERITAGE CITATION', 600, 95);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px sans-serif';
    ctx.fillText(
      stage === 'ru_campus'
        ? 'রাজশাহী বিশ্ববিদ্যালয় ভ্রমণ সনদ'
        : stage === 'rajshahi_district'
        ? 'রাজশাহী জেলা ঐতিহ্য ভ্রমণ সনদ'
        : 'রাজশাহী বিভাগ পর্যটন সনদ',
      600,
      160
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('OFFICIAL HERITAGE & EXPLORATION CERTIFICATE OF COMPLETION', 600, 195);

    // Citation Body
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('এই গৌরবময় সনদপত্রটি সসম্মানে প্রদান করা হলো:', 600, 260);

    // Explorer Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 48px sans-serif';
    ctx.fillText(explorerName.trim() || 'রাজশাহী অভিযাত্রী', 600, 325);

    // Golden underline
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(350, 345);
    ctx.lineTo(850, 345);
    ctx.stroke();

    // Achievement text
    const activePercent =
      stage === 'ru_campus' ? ruPercent : stage === 'rajshahi_district' ? pdfPercent : divPercent;
    const activeCount =
      stage === 'ru_campus'
        ? ruVisitedCount
        : stage === 'rajshahi_district'
        ? pdfVisitedCount
        : divVisitedCount;
    const activeTotal =
      stage === 'ru_campus'
        ? totalRuPlaces
        : stage === 'rajshahi_district'
        ? totalPdfRegions
        : totalDivSpots;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 20px sans-serif';
    ctx.fillText(
      stage === 'ru_campus'
        ? `যিনি রাজশাহী বিশ্ববিদ্যালয়ের মতিহার ক্যাম্পাসের ৪২টি স্পটের মধ্যে ${activeCount}টি স্থান সফলভাবে ভ্রমণ করেছেন।`
        : stage === 'rajshahi_district'
        ? `যিনি রাজশাহী জেলার ২২টি সুনির্দিষ্ট ঐতিহ্যবাহী অঞ্চলের মধ্যে ${activeCount}টি অঞ্চল সফলভাবে ঘুরেছেন।`
        : `যিনি রাজশাহী বিভাগের ৮টি জেলার ৯৫টি সরকারি দর্শনীয় স্থানের মধ্যে ${activeCount}টি স্থান ভ্রমণ সম্পন্ন করেছেন।`,
      600,
      410
    );

    // Stats Badges Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.roundRect(300, 460, 600, 110, 20);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 36px sans-serif';
    ctx.fillText(`${activePercent}% সম্পন্ন`, 600, 515);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`মোট অর্জিত মাইলফলক: ${activeCount} / ${activeTotal} স্থান`, 600, 545);

    // Footer & Signature
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px sans-serif';
    ctx.fillText(`ইস্যু তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, 80, 710);
    ctx.fillText('ভেরিফিকেশন আইডি: RU-INSIDERS-EXPLORER-2026', 80, 735);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('RU Insiders পর্যটন ও হেরিটেজ কাউন্সিল', 1120, 710);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('রাজশাহী বিশ্ববিদ্যালয় অফিশিয়াল ইনিশিয়েটিভ', 1120, 735);
  }, [showCertModal, stage, explorerName, ruPercent, pdfPercent, divPercent]);

  // Download Certificate PNG
  const downloadCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ru-explorer-certificate-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#0c2419] p-3 sm:p-6 shadow-2xl border-2 border-emerald-700/60 overflow-hidden space-y-4 text-slate-100 font-bengali">
      {/* ============================================================================ */}
      {/* 1. TOP HEADER & STAGE SWITCHER BAR (WITH % BADGES & CERTIFICATE BUTTON) */}
      {/* ============================================================================ */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-2 sm:p-3 rounded-2xl text-white shadow-xl border border-emerald-700/60">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bengali">
          {/* Stage 1: Division */}
          <button
            type="button"
            onClick={() => setStage('division')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow ${
              stage === 'division'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white font-black scale-[1.02]'
                : 'bg-emerald-950/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
            }`}
          >
            <Compass className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="font-bold">১. রাজশাহী বিভাগ কতটুকু ঘুরলেন</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                stage === 'division' ? 'bg-slate-950 text-amber-300' : 'bg-emerald-800 text-white'
              }`}
            >
              {divPercent}%
            </span>
          </button>

          <ChevronRight className="h-4 w-4 text-emerald-400/80 hidden sm:inline" />

          {/* Stage 2: Rajshahi District */}
          <button
            type="button"
            onClick={() => {
              setSelectedDistrictId('rajshahi');
              setStage('rajshahi_district');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow ${
              stage === 'rajshahi_district'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white font-black scale-[1.02]'
                : 'bg-emerald-950/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
            }`}
          >
            <Building className="h-4 w-4 shrink-0" />
            <span className="font-bold">২. রাজশাহী জেলা কতটুকু ঘুরলেন</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                stage === 'rajshahi_district'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-emerald-800 text-white'
              }`}
            >
              {pdfPercent}%
            </span>
          </button>

          <ChevronRight className="h-4 w-4 text-emerald-400/80 hidden sm:inline" />

          {/* Stage 3: RU Campus */}
          <button
            type="button"
            onClick={() => setStage('ru_campus')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow ${
              stage === 'ru_campus'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white font-black scale-[1.02]'
                : 'bg-emerald-950/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
            }`}
          >
            <GraduationCap className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-bold">৩. রাজশাহী বিশ্ববিদ্যালয় কতটুকু ঘুরলেন</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                stage === 'ru_campus' ? 'bg-slate-950 text-amber-300' : 'bg-emerald-800 text-white'
              }`}
            >
              {ruPercent}%
            </span>
          </button>
        </div>

        {/* Certificate Button */}
        <button
          type="button"
          onClick={() => setShowCertModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
        >
          <Trophy className="h-4 w-4 text-amber-300" />
          <span>ভ্রমণ সনদ ও শেয়ার</span>
        </button>
      </div>

      {/* ============================================================================ */}
      {/* 2. STAGE 1: RAJSHAHI DIVISION (EXACT 2-COLUMN DESIGN FROM USER SCREENSHOT) */}
      {/* ============================================================================ */}
      {stage === 'division' && (
        <div className="relative z-10 space-y-3">
          {/* 8-District Quick Selector Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-200 font-bengali uppercase tracking-wide flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-amber-400" />
                <span>বিভাগের ৮টি জেলা থেকে নির্বাচন করুন:</span>
              </span>
              <span className="text-[10px] text-emerald-300/80 font-bold font-bengali">
                (রাজশাহী সিলেক্ট করলে সরাসরি রাজশাহী জেলা ম্যাপে নিয়ে যাবে)
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {DIVISION_DISTRICT_META.map((dist, idx) => {
                const isSelected = selectedDistrictId === dist.id;
                const stats = districtStats[dist.id] || { visited: 0, total: dist.spotCount, pct: 0 };
                return (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() => {
                      setSelectedDistrictId(dist.id);
                      if (dist.id === 'rajshahi') {
                        // User can click to preview or double-click to drill into district
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-left transition-all border whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md ring-2 ring-white scale-[1.02] font-black'
                        : stats.pct > 0
                        ? 'bg-emerald-900/90 text-white border-emerald-500 hover:bg-emerald-800'
                        : 'bg-emerald-950/70 hover:bg-emerald-900 text-white border-emerald-800/80'
                    }`}
                  >
                    <span className="text-xs font-bengali">
                      {String(idx + 1).padStart(2, '0')}. {dist.nameBn}
                    </span>
                    <span className="text-[10px] font-mono font-bold opacity-80">
                      {stats.visited}/{stats.total}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-slate-950 text-amber-300' : 'bg-black/30 text-emerald-200'
                      }`}
                    >
                      {stats.pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Left Column: Interactive Vector Water Map */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-[245/220] min-h-[380px] sm:min-h-[500px] bg-[#f2eee3] rounded-[28px] p-2 sm:p-4 border-2 border-emerald-900/15 shadow-inner flex items-center justify-center overflow-hidden group">
                <svg viewBox={RAJSHAHI_VIEWBOX} className="w-full h-full object-contain select-none">
                  <defs>
                    <filter id="active-district-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#facc15" floodOpacity="0.95" />
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" floodOpacity="0.8" />
                    </filter>

                    {RAJSHAHI_DISTRICT_SVGS.map((dist) => {
                      const stats = districtStats[dist.id] || { pct: 0 };
                      const fillH = (dist.bbox.h * stats.pct) / 100;
                      const fillY = dist.bbox.maxY - fillH;
                      return (
                        <clipPath key={`clip-${dist.id}`} id={`water-clip-${dist.id}`}>
                          <rect
                            x={dist.bbox.minX - 5}
                            y={fillY}
                            width={dist.bbox.w + 10}
                            height={fillH + 10}
                            className="transition-all duration-700 ease-out"
                          />
                        </clipPath>
                      );
                    })}
                  </defs>

                  {/* Render 8 District Polygons */}
                  {RAJSHAHI_DISTRICT_SVGS.map((dist) => {
                    const isSelected = selectedDistrictId === dist.id;
                    const isHovered = hoveredDistrictId === dist.id;
                    const stats = districtStats[dist.id] || { pct: 0, visited: 0, total: 0 };

                    let baseFill = '#1e293b';
                    if (stats.pct > 0) {
                      baseFill = isSelected ? '#0e4a2c' : isHovered ? '#125c37' : '#064e3b';
                    } else if (isSelected) {
                      baseFill = '#1e293b';
                    } else if (isHovered) {
                      baseFill = '#334155';
                    }

                    return (
                      <g
                        key={dist.id}
                        onClick={() => {
                          setSelectedDistrictId(dist.id);
                          if (dist.id === 'rajshahi') {
                            setStage('rajshahi_district');
                          }
                        }}
                        onMouseEnter={() => setHoveredDistrictId(dist.id)}
                        onMouseLeave={() => setHoveredDistrictId(null)}
                        className="cursor-pointer transition-transform duration-200"
                      >
                        {/* 1. Base District Path */}
                        <path
                          d={dist.d}
                          fill={baseFill}
                          stroke={isSelected ? '#facc15' : stats.pct > 0 ? '#34d399' : '#64748b'}
                          strokeWidth={isSelected ? 2.5 : 1.2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />

                        {/* 2. Water Fill Layer (Rises from bottom as spots are checked) */}
                        {stats.pct > 0 && (
                          <path
                            d={dist.d}
                            fill="#059669"
                            clipPath={`url(#water-clip-${dist.id})`}
                            opacity="0.92"
                            className="transition-all duration-700 ease-out"
                          />
                        )}

                        {/* 3. Clean White Outline */}
                        <path
                          d={dist.d}
                          fill="none"
                          stroke={isSelected ? '#facc15' : isHovered ? '#6ee7b7' : '#ffffff'}
                          strokeWidth={isSelected ? 2.4 : 1.2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />

                        {/* 4. Active Glowing Gold Outline */}
                        {isSelected && (
                          <path
                            d={dist.d}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth={3.2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            filter="url(#active-district-glow)"
                            className="animate-pulse"
                          />
                        )}

                        {/* 5. Water Surface Dashed Ripple Line */}
                        {stats.pct > 0 && (
                          <line
                            x1={dist.bbox.minX}
                            x2={dist.bbox.maxX}
                            y1={dist.bbox.maxY - (dist.bbox.h * stats.pct) / 100}
                            y2={dist.bbox.maxY - (dist.bbox.h * stats.pct) / 100}
                            stroke="#a7f3d0"
                            strokeWidth="1.2"
                            strokeDasharray="2,2"
                            clipPath={`url(#water-clip-${dist.id})`}
                          />
                        )}

                        {/* 6. Bullseye Pin Target */}
                        <circle
                          cx={dist.pin.x}
                          cy={dist.pin.y}
                          r="3.5"
                          fill={isSelected ? '#f59e0b' : stats.pct > 0 ? '#10b981' : '#64748b'}
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          className="shadow"
                        />
                        <circle cx={dist.pin.x} cy={dist.pin.y} r="1.1" fill="#ffffff" />

                        {/* 7. Bold District Text Label with Checkmark */}
                        <text
                          x={dist.pin.x}
                          y={dist.pin.y - 4.5}
                          textAnchor="middle"
                          fill={isSelected ? '#fde047' : stats.pct > 0 ? '#ffffff' : '#cbd5e1'}
                          stroke="#0f172a"
                          strokeWidth="2.5"
                          paintOrder="stroke fill"
                          fontSize="8.5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                          className="pointer-events-none select-none"
                        >
                          {dist.nameBn} {stats.pct > 0 ? '✓' : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Switch to District Map Pill on bottom */}
                <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between text-xs font-bengali">
                  <span className="text-[11px] text-slate-700 bg-white/90 px-3 py-1 rounded-xl shadow-sm border border-slate-200">
                    ম্যাপে জেলার উপর ক্লিক করে নির্বাচন করুন
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistrictId('rajshahi');
                      setStage('rajshahi_district');
                    }}
                    className="bg-emerald-950/90 hover:bg-emerald-900 text-amber-300 px-3.5 py-1.5 rounded-xl border border-emerald-700 font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <span>২. রাজশাহী জেলা কতটুকু ঘুরলেন ➔</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: District Details & Scrollable Spot Cards */}
            <div className="lg:col-span-6 bg-[#0c2419] p-4 sm:p-5 rounded-3xl border border-emerald-700/60 text-white space-y-4 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/80">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold font-bengali">
                  <Compass className="h-4 w-4 text-amber-400" />
                  <span>বর্তমানে নির্বাচিত: {selectedDistrictMeta?.nameBn}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-bengali">
                  {currentDistrictSpots.length}টি দর্শনীয় স্থান
                </span>
              </div>

              {/* Title & Stats */}
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-white font-bengali tracking-tight">
                  ১. রাজশাহী বিভাগ কতটুকু ঘুরলেন
                </h3>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {currentDistrictStats.visited} / {currentDistrictStats.total} সম্পন্ন
                </div>
              </div>

              {/* Gradient Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                    style={{ width: `${currentDistrictStats.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-emerald-200 font-mono">
                  <span>ভ্রমণ পূর্ণতা: {currentDistrictStats.pct}%</span>
                  <span>অবশিষ্ট: {currentDistrictStats.total - currentDistrictStats.visited} স্থান</span>
                </div>
              </div>

              {/* Scrollable Spot Cards List */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                {currentDistrictSpots.map((spot) => {
                  const isVisited = visitedDivSpotIds.includes(spot.id);
                  return (
                    <div
                      key={spot.id}
                      onClick={() =>
                        openSpotDetailModal({
                          id: spot.id,
                          rankNo: spot.rankNo,
                          nameBn: spot.nameBn,
                          districtBn: selectedDistrictMeta.nameBn,
                          locationBn: spot.locationBn,
                          descriptionBn: spot.summaryBn,
                          imageUrl: spot.imageUrl,
                          tags: spot.tags,
                          isVisited,
                          onToggleVisit: () => toggleDivSpot(spot.id),
                        })
                      }
                      className={`p-3 sm:p-3.5 rounded-2xl bg-white text-slate-900 border transition-all duration-200 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between group shadow-sm hover:shadow-md cursor-pointer ${
                        isVisited
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                          : 'border-slate-200/90 hover:border-emerald-400/80'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative w-full sm:w-28 h-28 sm:h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-inner">
                        <img
                          src={spot.imageUrl}
                          alt={spot.nameBn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                          {spot.rankNo}
                        </div>
                        {isVisited && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-black text-slate-900 font-bengali group-hover:text-emerald-700 transition leading-snug">
                          {spot.nameBn}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold font-bengali">
                          <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
                          <span className="truncate">{spot.locationBn}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-bengali line-clamp-2 leading-relaxed">
                          {spot.summaryBn}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDivSpot(spot.id);
                          }}
                          className={`w-full sm:w-28 py-1.5 px-3 rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer ${
                            isVisited
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isVisited ? 'ঘোরা সম্পন্ন' : 'আমি ঘুরেছি'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSpotDetailModal({
                              id: spot.id,
                              rankNo: spot.rankNo,
                              nameBn: spot.nameBn,
                              districtBn: selectedDistrictMeta.nameBn,
                              locationBn: spot.locationBn,
                              descriptionBn: spot.summaryBn,
                              imageUrl: spot.imageUrl,
                              tags: spot.tags,
                              isVisited,
                              onToggleVisit: () => toggleDivSpot(spot.id),
                            });
                          }}
                          className="w-full sm:w-28 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-bengali flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিস্তারিত ও ছবি</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 3. STAGE 2: RAJSHAHI DISTRICT (22 REGIONS) */}
      {/* ============================================================================ */}
      {stage === 'rajshahi_district' && (
        <div className="relative z-10 space-y-3">
          {/* Quick Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black text-emerald-200 font-bengali flex items-center gap-1.5">
              <Building className="h-4 w-4 text-amber-400" />
              <span>রাজশাহী জেলার ২২টি অঞ্চল থেকে নির্বাচন করুন:</span>
            </span>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-300" />
              <input
                type="text"
                value={pdfSearchQuery}
                onChange={(e) => setPdfSearchQuery(e.target.value)}
                placeholder="অঞ্চল খুঁজুন (রুয়েট, রাবি, মেডিকেল, টি-বাঁধ...)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/30 border border-emerald-500/30 text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:ring-1 focus:ring-amber-400 font-bengali"
              />
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Left Column: 22-Region SVG Map */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-[1770/1660] min-h-[380px] sm:min-h-[500px] bg-[#f2eee3] rounded-[28px] p-2 sm:p-4 border-2 border-emerald-900/15 shadow-inner flex items-center justify-center overflow-hidden group">
                <svg viewBox={RAJSHAHI_PDF_MAP_VIEWBOX} className="w-full h-full object-contain select-none">
                  <defs>
                    <filter id="active-pdf-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#facc15" floodOpacity="0.95" />
                    </filter>
                  </defs>

                  {/* Render 22 Regions */}
                  {RAJSHAHI_PDF_REGIONS.map((region) => {
                    const isSelected = selectedPdfId === region.id;
                    const isVisited = visitedPdfIds.includes(region.id);

                    return (
                      <g
                        key={region.id}
                        onClick={() => {
                          setSelectedPdfId(region.id);
                          if (region.id === 'pdf_ru') {
                            setStage('ru_campus');
                          }
                        }}
                        onMouseEnter={() => setHoveredPdfId(region.id)}
                        onMouseLeave={() => setHoveredPdfId(null)}
                        className="cursor-pointer transition-transform duration-200"
                      >
                        <path
                          d={region.d}
                          fill={isVisited ? '#059669' : isSelected ? '#1e293b' : '#334155'}
                          stroke={isSelected ? '#facc15' : isVisited ? '#34d399' : '#ffffff'}
                          strokeWidth={isSelected ? 10 : 3}
                          strokeLinejoin="round"
                        />
                        {isSelected && (
                          <path
                            d={region.d}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth={12}
                            filter="url(#active-pdf-glow)"
                            className="animate-pulse"
                          />
                        )}
                        <text
                          x={region.center.x}
                          y={region.center.y}
                          textAnchor="middle"
                          fill={isSelected ? '#fde047' : '#ffffff'}
                          stroke="#0f172a"
                          strokeWidth="8"
                          paintOrder="stroke fill"
                          fontSize="28"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {region.nameBn} {isVisited ? '✓' : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Bottom navigation pill */}
                <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between text-xs font-bengali">
                  <button
                    type="button"
                    onClick={() => setStage('division')}
                    className="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-700 font-bold flex items-center gap-1 shadow cursor-pointer transition"
                  >
                    <span>← ১. রাজশাহী বিভাগ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('ru_campus')}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded-xl font-black flex items-center gap-1 shadow cursor-pointer transition"
                  >
                    <span>৩. রাবি ক্যাম্পাস কতটুকু ঘুরলেন ➔</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: 22 Regions List */}
            <div className="lg:col-span-6 bg-[#0c2419] p-4 sm:p-5 rounded-3xl border border-emerald-700/60 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/80">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold font-bengali">
                  <Building className="h-4 w-4 text-amber-400" />
                  <span>রাজশাহী জেলা ও মহানগর ঐতিহ্যবাহী অঞ্চলসমূহ</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-bengali">
                  {totalPdfRegions}টি অঞ্চল
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-white font-bengali tracking-tight">
                  ২. রাজশাহী জেলা কতটুকু ঘুরলেন
                </h3>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {pdfVisitedCount} / {totalPdfRegions} সম্পন্ন
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                    style={{ width: `${pdfPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-emerald-200 font-mono">
                  <span>ভ্রমণ পূর্ণতা: {pdfPercent}%</span>
                  <span>অবশিষ্ট: {totalPdfRegions - pdfVisitedCount} অঞ্চল</span>
                </div>
              </div>

              {/* Scrollable Regions */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredPdfRegions.map((region) => {
                  const isVisited = visitedPdfIds.includes(region.id);
                  const isSelected = selectedPdfId === region.id;
                  return (
                    <div
                      key={region.id}
                      onClick={() => setSelectedPdfId(region.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl bg-white text-slate-900 border transition-all duration-200 flex items-center justify-between group shadow-sm hover:shadow-md cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400 bg-amber-50/40 shadow-md'
                          : isVisited
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                          : 'border-slate-200/90 hover:border-emerald-400/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow">
                          {region.rankNo}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 font-bengali truncate">
                            {region.nameBn}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-bengali truncate">
                            {region.descriptionBn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePdfRegion(region.id);
                          }}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold font-bengali flex items-center gap-1 transition shadow-sm cursor-pointer ${
                            isVisited
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isVisited ? 'ঘুরেছি' : 'টিক দিন'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 4. STAGE 3: RU CAMPUS (GEMINI ARGON 42-SPOT VECTOR WATER MAP) */}
      {/* ============================================================================ */}
      {stage === 'ru_campus' && (
        <div className="relative z-10 space-y-3">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-emerald-200 font-bengali mr-1 flex items-center gap-1">
                <GraduationCap className="h-4 w-4 text-amber-400" />
                <span>রাবি ক্যাম্পাসের ৪২টি স্থান:</span>
              </span>

              {[
                { id: 'all', label: 'সব স্থান', count: 42 },
                { id: 'academic', label: 'একাডেমিক ভবন', count: 11 },
                { id: 'halls', label: 'আবাসিক হল', count: 18 },
                { id: 'landmarks', label: 'ল্যান্ডমার্ক ও চত্বর', count: 8 },
                { id: 'admin_gates', label: 'প্রশাসনিক ও গেট', count: 5 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRuCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bengali transition-all cursor-pointer ${
                    ruCategory === cat.id
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-300" />
              <input
                type="text"
                value={ruSearchQuery}
                onChange={(e) => setRuSearchQuery(e.target.value)}
                placeholder="ভবন বা চত্বর খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/30 border border-emerald-500/30 text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:ring-1 focus:ring-amber-400 font-bengali"
              />
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Left Column: Gemini Argon RU Campus Map */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-[16/10] min-h-[380px] sm:min-h-[500px] bg-[#f6f4ec] rounded-[28px] p-2 sm:p-4 border-2 border-emerald-900/15 shadow-inner flex items-center justify-center overflow-hidden group">
                <svg
                  viewBox={RU_CAMPUS_VIEWBOX}
                  className="w-full h-full object-contain select-none transition-transform duration-200"
                  style={{ transform: `scale(${ruMapZoom})` }}
                >
                  <defs>
                    <filter id="ru-place-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#facc15" floodOpacity="0.95" />
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

                  {/* 2. South Highway & Internal Roads */}
                  <path
                    d="M 95,692 L 395,624 L 555,598 L 785,562 L 1135,524"
                    fill="none"
                    stroke="#15803d"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.85"
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

                  {/* Pedestrian Paris Road Walkway */}
                  <path
                    d="M 105,128 L 254,128 M 254,128 L 254,250"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="5"
                    strokeDasharray="4 5"
                    strokeOpacity="0.75"
                  />

                  {/* Zoha Roundabout */}
                  <circle cx="480" cy="475" r="14" fill="#15803d" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="480" cy="475" r="6" fill="#fef08a" />

                  {/* Railway track */}
                  <line x1="55" y1="118" x2="1158" y2="118" stroke="#57534e" strokeWidth="4" strokeOpacity="0.8" />
                  <line x1="55" y1="118" x2="1158" y2="118" stroke="#f7f5ee" strokeWidth="2.2" strokeDasharray="8 8" />

                  {/* 3. 42 Campus Places */}
                  {filteredRuPlaces.map((place) => {
                    const isSelected = selectedRuId === place.id;
                    const isVisited = visitedRuIds.includes(place.id);

                    return (
                      <g
                        key={place.id}
                        onClick={() => setSelectedRuId(place.id)}
                        onMouseEnter={() => setHoveredRuId(place.id)}
                        onMouseLeave={() => setHoveredRuId(null)}
                        className="cursor-pointer transition-transform duration-200"
                      >
                        <path
                          d={place.d}
                          fill={isVisited ? '#059669' : isSelected ? '#facc15' : '#1e293b'}
                          stroke={isSelected ? '#f59e0b' : isVisited ? '#34d399' : '#ffffff'}
                          strokeWidth={isSelected ? 4 : 2}
                          strokeLinejoin="round"
                        />
                        {isSelected && (
                          <path
                            d={place.d}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth={5}
                            filter="url(#ru-place-glow)"
                            className="animate-pulse"
                          />
                        )}
                        <circle
                          cx={place.center.x}
                          cy={place.center.y}
                          r="12"
                          fill={isVisited ? '#059669' : '#1e293b'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={place.center.x}
                          y={place.center.y + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9.5"
                          fontWeight="bold"
                        >
                          {place.rankNo}
                        </text>
                        <text
                          x={place.center.x}
                          y={place.center.y + 22}
                          textAnchor="middle"
                          fill="#1e293b"
                          fontSize="10"
                          fontWeight="bold"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          paintOrder="stroke fill"
                        >
                          {place.shortBn} {isVisited ? '✓' : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Bottom navigation pill */}
                <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between text-xs font-bengali">
                  <button
                    type="button"
                    onClick={() => setStage('rajshahi_district')}
                    className="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-700 font-bold flex items-center gap-1 shadow cursor-pointer transition"
                  >
                    <span>← ২. রাজশাহী জেলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('division')}
                    className="bg-emerald-950/90 hover:bg-emerald-900 text-amber-300 px-3.5 py-1.5 rounded-xl border border-emerald-700 font-bold flex items-center gap-1 shadow cursor-pointer transition"
                  >
                    <span>১. রাজশাহী বিভাগ ➔</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: 42 Campus Places Cards */}
            <div className="lg:col-span-6 bg-[#0c2419] p-4 sm:p-5 rounded-3xl border border-emerald-700/60 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/80">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold font-bengali">
                  <GraduationCap className="h-4 w-4 text-amber-400" />
                  <span>রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস স্পটসমূহ</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-bengali">
                  {totalRuPlaces}টি স্থান
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-white font-bengali tracking-tight">
                  ৩. রাজশাহী বিশ্ববিদ্যালয় কতটুকু ঘুরলেন
                </h3>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {ruVisitedCount} / {totalRuPlaces} সম্পন্ন
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                    style={{ width: `${ruPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-emerald-200 font-mono">
                  <span>ভ্রমণ পূর্ণতা: {ruPercent}%</span>
                  <span>অবশিষ্ট: {totalRuPlaces - ruVisitedCount} স্থান</span>
                </div>
              </div>

              {/* Scrollable Campus Places */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredRuPlaces.map((place) => {
                  const isVisited = visitedRuIds.includes(place.id);
                  const isSelected = selectedRuId === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() =>
                        openSpotDetailModal({
                          id: place.id,
                          rankNo: place.rankNo,
                          nameBn: place.nameBn,
                          districtBn: 'রাজশাহী বিশ্ববিদ্যালয়',
                          locationBn: 'মতিহার ক্যাম্পাস, রাজশাহী',
                          descriptionBn: place.descriptionBn,
                          imageUrl: place.imageUrl,
                          tags: ['রাবি ক্যাম্পাস', place.shortBn],
                          isVisited,
                          onToggleVisit: () => toggleRuSpot(place.id),
                        })
                      }
                      className={`p-3 sm:p-3.5 rounded-2xl bg-white text-slate-900 border transition-all duration-200 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between group shadow-sm hover:shadow-md cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400 bg-amber-50/40 shadow-md'
                          : isVisited
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                          : 'border-slate-200/90 hover:border-emerald-400/80'
                      }`}
                    >
                      <div className="relative w-full sm:w-28 h-28 sm:h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-inner">
                        <img
                          src={place.imageUrl}
                          alt={place.nameBn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                          {place.rankNo}
                        </div>
                        {isVisited && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-black text-slate-900 font-bengali group-hover:text-emerald-700 transition leading-snug">
                          {place.nameBn}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-bengali line-clamp-2 leading-relaxed">
                          {place.descriptionBn}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRuSpot(place.id);
                          }}
                          className={`w-full sm:w-28 py-1.5 px-3 rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer ${
                            isVisited
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isVisited ? 'ঘোরা সম্পন্ন' : 'আমি ঘুরেছি'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSpotDetailModal({
                              id: place.id,
                              rankNo: place.rankNo,
                              nameBn: place.nameBn,
                              districtBn: 'রাজশাহী বিশ্ববিদ্যালয়',
                              locationBn: 'মতিহার ক্যাম্পাস, রাজশাহী',
                              descriptionBn: place.descriptionBn,
                              imageUrl: place.imageUrl,
                              tags: ['রাবি ক্যাম্পাস', place.shortBn],
                              isVisited,
                              onToggleVisit: () => toggleRuSpot(place.id),
                            });
                          }}
                          className="w-full sm:w-28 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-bengali flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিস্তারিত ও ছবি</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 5. SPOT FULL DETAIL MODAL (CAROUSEL + DESCRIPTION + GOOGLE MAPS) */}
      {/* ============================================================================ */}
      {detailModalSpot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    ক্রমিক #{detailModalSpot.rankNo}
                  </span>
                  <span className="text-xs text-emerald-200 font-semibold font-bengali">
                    {detailModalSpot.districtBn}
                  </span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-white pt-1 font-bengali">
                  {detailModalSpot.nameBn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalSpot(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md">
                <img
                  src={
                    detailModalSpot.images?.[activeModalImgIdx] ||
                    detailModalSpot.imageUrl
                  }
                  alt={detailModalSpot.nameBn}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold font-bengali">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>{detailModalSpot.locationBn}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-bengali leading-relaxed">
                  {detailModalSpot.descriptionBn}
                </p>
              </div>

              {/* Tags */}
              {detailModalSpot.tags && detailModalSpot.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {detailModalSpot.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  detailModalSpot.nameBn + ' ' + detailModalSpot.locationBn
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-bengali flex items-center gap-1.5 transition"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Google Maps এ ডিরেকশন</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  detailModalSpot.onToggleVisit();
                  setDetailModalSpot((prev) =>
                    prev ? { ...prev, isVisited: !prev.isVisited } : null
                  );
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black font-bengali flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                  detailModalSpot.isVisited
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>{detailModalSpot.isVisited ? 'ঘোরা সম্পন্ন হয়েছে' : 'আমি এই স্থান ঘুরেছি'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 6. OFFICIAL CITATION & CERTIFICATE GENERATOR MODAL */}
      {/* ============================================================================ */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 font-bengali">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-4xl w-full max-h-[95dvh] flex flex-col shadow-2xl overflow-hidden text-white">
            <div className="px-6 py-4 bg-emerald-950 border-b border-emerald-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="font-black text-base sm:text-lg text-white">
                  অফিসিয়াল ভ্রমণ সনদপত্র ও শেয়ার
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="bg-emerald-950/60 p-3 sm:p-4 rounded-2xl border border-emerald-700/50 flex flex-col sm:flex-row items-center gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <label className="text-xs font-bold text-emerald-200">সনদপত্রে আপনার নাম:</label>
                  <p className="text-[11px] text-emerald-300/70">
                    নিজের নাম লিখে সনদপত্রে প্রিন্ট করুন ও সামাজিক মাধ্যমে শেয়ার করুন।
                  </p>
                </div>
                <input
                  type="text"
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  placeholder="যেমন: তানভীর হাসান / মাহিম আহমেদ"
                  className="w-full sm:w-72 px-3 py-2 rounded-xl bg-black/50 border border-emerald-400/40 text-sm font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Canvas Preview */}
              <div className="w-full aspect-[1200/800] rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-black">
                <canvas ref={certCanvasRef} className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="px-6 py-4 bg-emerald-950 border-t border-emerald-800/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
              >
                বন্ধ করুন
              </button>

              <button
                type="button"
                onClick={downloadCertificate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>সনদপত্র ডাউনলোড করুন (PNG)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
