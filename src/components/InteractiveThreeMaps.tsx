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
} from 'lucide-react';
import { RU_CAMPUS_PLACES, RU_CAMPUS_VIEWBOX, RuPlaceSvgData } from '@/lib/ruCampusSvg';
import { RAJSHAHI_PDF_REGIONS, RAJSHAHI_PDF_MAP_VIEWBOX, RajshahiPdfRegionData } from '@/lib/rajshahiPdfRegions';
import { RAJSHAHI_DISTRICT_SVGS, RAJSHAHI_VIEWBOX } from '@/lib/rajshahiDistrictsSvg';
import { DIVISION_DISTRICT_META, DIVISION_SPOTS, DivisionSpotItem } from '@/lib/divisionSpotsData';
import { MapSpotCustomData, DetailBlock } from '@/types';
import CampusMapExplorer from '@/components/CampusMapExplorer';

// RU Campus groupings
const RU_CATEGORIES = [
  {
    title: 'একাডেমিক ভবন ও অনুষদসমূহ',
    ids: [
      'agri_faculty',
      'fine_arts',
      'science_complex',
      'first_science',
      'second_science',
      'fourth_science',
      'central_library',
      'admin_building',
      'varendra_research',
    ],
  },
  {
    title: 'আবাসিক হলসমূহ (ছাত্র ও ছাত্রী হল)',
    ids: [
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
    ],
  },
  {
    title: 'ঐতিহাসিক চত্বর, গেট ও দর্শনীয় স্থান',
    ids: [
      'paris_road',
      'shaheed_minar',
      'tukitaki_chottor',
      'shabash_bd',
      'tscc',
      'juberi_bhavan',
      'ru_stadium',
      'main_gate',
      'kazla_gate',
      'binodpur_gate',
      'ruet_junction',
      'botanical_garden',
      'moti_lake_north',
      'moti_lake_south',
      'ibn_sina_medical',
      'ru_press',
      'ru_central_mosque',
      'teachers_quarters',
      'badminton_gym',
      'charukola_gate',
    ],
  },
];

export default function InteractiveThreeMaps() {
  // 1 -> 2 -> 3 tab order (Default: RU Campus)
  const [stage, setStage] = useState<'ru_campus' | 'rajshahi_district' | 'division'>('ru_campus');

  // Selected item states
  const [selectedRuId, setSelectedRuId] = useState<string>('paris_road');
  const [selectedPdfId, setSelectedPdfId] = useState<string>('pdf_ru');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajshahi');

  // Visited states
  const [visitedRuIds, setVisitedRuIds] = useState<string[]>([]);
  const [visitedPdfIds, setVisitedPdfIds] = useState<string[]>([]);
  const [visitedDivSpotIds, setVisitedDivSpotIds] = useState<string[]>([]);

  // Search filter
  const [ruSearch, setRuSearch] = useState('');

  // Custom data loaded from DB (multiple images & multiple title+details blocks)
  const [customSpotsMap, setCustomSpotsMap] = useState<Record<string, MapSpotCustomData>>({});

  // Full-page detail view (NO floating modal)
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

  // Certificate / Share card modal & mandatory name lock
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

  // Dedicated Full-Page Spot Details Handler (No Floating Modal)
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
  const totalDivisionPercent = Math.round((visitedDivSpotIds.length / DIVISION_SPOTS.length) * 100);

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
        : `রাজশাহী বিভাগ ও ${
            DIVISION_DISTRICT_META.find((d) => d.id === selectedDistrictId)?.nameBn || 'জেলা'
          } ভ্রমণ সনদ`;
    ctx.fillText(mapTitle, 540, 195);

    // Explorer Name
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(explorerName.trim(), 540, 305);

    // Metric Box
    const activePct =
      stage === 'ru_campus' ? ruPercent : stage === 'rajshahi_district' ? pdfPercent : currentDistrictPercent;
    const activeCountText =
      stage === 'ru_campus'
        ? `${visitedRuIds.length} / ৪২টি ক্যাম্পাস স্পট সম্পন্ন`
        : stage === 'rajshahi_district'
        ? `${visitedPdfIds.length} / ২২টি অঞ্চল সম্পন্ন`
        : `${currentDistrictVisitedCount} / ${currentDistrictSpots.length}টি দর্শনীয় স্থান সম্পন্ন`;

    ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
    ctx.fillRect(190, 360, 700, 220);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(190, 360, 700, 220);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText(`${activePct}% ভ্রমণ সম্পন্ন`, 540, 480);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(activeCountText, 540, 545);

    // Highlights
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('আমার ঘুরে দেখা উল্লেখযোগ্য স্থানসমূহ:', 540, 670);

    const visitedNames: string[] =
      stage === 'ru_campus'
        ? RU_CAMPUS_PLACES.filter((p) => visitedRuIds.includes(p.id)).map((p) => `✓ ${p.shortBn}`)
        : stage === 'rajshahi_district'
        ? RAJSHAHI_PDF_REGIONS.filter((r) => visitedPdfIds.includes(r.id)).map((r) => `✓ ${r.nameBn}`)
        : currentDistrictSpots.filter((s) => visitedDivSpotIds.includes(s.id)).map((s) => `✓ ${s.nameBn}`);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '24px sans-serif';
    if (visitedNames.length === 0) {
      ctx.fillText('এখনও কোনো স্থান টিক দেওয়া হয়নি', 540, 740);
    } else {
      visitedNames.slice(0, 10).forEach((name, idx) => {
        ctx.fillText(name, 540, 735 + idx * 42);
      });
    }

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText('ruinsiders.vercel.app • রাজশাহী বিশ্ববিদ্যালয় অফিশিয়াল ক্যাম্পাস পোর্টাল', 540, 1255);

    const link = document.createElement('a');
    link.download = `ru-insiders-explorer-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ============================================================================
  // 1. DEDICATED FULL-PAGE DETAILS VIEW (No Floating Modal)
  // ============================================================================
  if (fullPageDetail) {
    const isCurrentlyVisited =
      visitedRuIds.includes(fullPageDetail.spotId) ||
      visitedPdfIds.includes(fullPageDetail.spotId) ||
      visitedDivSpotIds.includes(fullPageDetail.spotId);

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Top Action Bar with Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setFullPageDetail(null)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> ← ম্যাপে ফিরে যান
          </button>

          <button
            onClick={fullPageDetail.onToggleVisit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition ${
              isCurrentlyVisited
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCurrentlyVisited ? '✓ আমি এই জায়গা ঘুরেছি (সম্পন্ন)' : 'আমি এই জায়গা ঘুরেছি (টিক দিন)'}
          </button>
        </div>

        {/* Spot Title Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            সম্পূর্ণ চিত্রশালা ও বিবরণ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{fullPageDetail.nameBn}</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">{fullPageDetail.subtitleBn}</p>
        </div>

        {/* Multi-Image Gallery */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={fullPageDetail.images[activeGalleryIdx] || fullPageDetail.images[0]}
              alt={fullPageDetail.nameBn}
              className="w-full h-full object-cover"
            />
          </div>

          {fullPageDetail.images.length > 1 && (
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" /> এই স্থানের আরও ছবি ({fullPageDetail.images.length}টি ছবি):
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {fullPageDetail.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIdx(idx)}
                    className={`aspect-[16/10] rounded-xl overflow-hidden border-2 transition ${
                      activeGalleryIdx === idx
                        ? 'border-blue-600 ring-2 ring-blue-300'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Unlimited Title + Details Blocks */}
        <div className="space-y-4">
          {fullPageDetail.detailSections.map((sec, idx) => (
            <div key={sec.id || idx} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-3">
                {sec.title}
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

  // Active Spot Selected Data for Summary Cards
  const activeRuPlace = RU_CAMPUS_PLACES.find((p) => p.id === selectedRuId) || RU_CAMPUS_PLACES[0];
  const activePdfRegion = RAJSHAHI_PDF_REGIONS.find((r) => r.id === selectedPdfId) || RAJSHAHI_PDF_REGIONS[0];
  const activeDistrictMeta = DIVISION_DISTRICT_META.find((d) => d.id === selectedDistrictId) || DIVISION_DISTRICT_META[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Page Title & Certificate Call to Action */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              ইন্টারঅ্যাক্টিভ এক্সপ্লোরার
            </span>
            <span className="text-xs text-slate-500 font-semibold">• ৩টি স্তরের ডিজিটাল মানচিত্র</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            রাজশাহী বিশ্ববিদ্যালয় ও বিভাগীয় পর্যটন মানচিত্র
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            আপনি কতটুকু ঘুরলেন? যে স্থানগুলো ভ্রমণ করেছেন সেগুলোতে টিক দিয়ে ভ্রমণ সনদ ও শেয়ার কার্ড ডাউনলোড করুন।
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md flex items-center gap-2 shrink-0 transition"
        >
          <Trophy className="w-5 h-5 text-slate-950" />
          <span>ভ্রমণ সনদ ও শেয়ার কার্ড →</span>
        </button>
      </div>

      {/* Tabs in Exact Priority Order: 1 -> 2 -> 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setStage('ru_campus')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
            stage === 'ru_campus'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <span>🎓 ১. রাবি ক্যাম্পাস (৩ডি ক্যাম্পাস ম্যাপ)</span>
        </button>

        <button
          onClick={() => setStage('rajshahi_district')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
            stage === 'rajshahi_district'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <span>🏙️ ২. রাজশাহী জেলা ({visitedPdfIds.length}/২২)</span>
        </button>

        <button
          onClick={() => setStage('division')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition ${
            stage === 'division'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          <span>🗺️ ৩. রাজশাহী বিভাগ ({visitedDivSpotIds.length}/{DIVISION_SPOTS.length})</span>
        </button>
      </div>

      {/* ============================================================================ */}
      {/* STAGE 1: RU CAMPUS (3D / 2D MASTERPLAN EXPLORER) */}
      {/* ============================================================================ */}
      {stage === 'ru_campus' && (
        <div className="w-full">
          <CampusMapExplorer />
        </div>
      )}

      {/* ============================================================================ */}
      {/* STAGE 2: RAJSHAHI DISTRICT (22 REGIONS) */}
      {/* ============================================================================ */}
      {stage === 'rajshahi_district' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Progress & Region Chips */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>রাজশাহী জেলা পরিক্রমা (২২ অঞ্চল)</span>
                <span className="text-emerald-600 font-extrabold">{pdfPercent}% সম্পন্ন</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pdfPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                ২২টি পুলিশি অঞ্চল ও দর্শনীয় এলাকার মধ্যে {visitedPdfIds.length}টি সম্পন্ন হয়েছে।
              </p>
            </div>

            {/* Selected Region Preview Card */}
            {activePdfRegion && (
              <div className="bg-white rounded-2xl border-2 border-amber-400 p-4 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={customSpotsMap[activePdfRegion.id]?.images?.[0] || activePdfRegion.imageUrl}
                      alt={activePdfRegion.nameBn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      অঞ্চল #{activePdfRegion.rankNo}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 truncate mt-1">
                      {activePdfRegion.nameBn}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {activePdfRegion.descriptionBn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => togglePdfRegion(activePdfRegion.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      visitedPdfIds.includes(activePdfRegion.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {visitedPdfIds.includes(activePdfRegion.id) ? 'ঘুরেছি ✓' : 'আমি ঘুরেছি'}
                  </button>

                  <button
                    onClick={() =>
                      openSpotFullPage(
                        activePdfRegion.id,
                        activePdfRegion.nameBn,
                        activePdfRegion.nameEn,
                        activePdfRegion.imageUrl,
                        activePdfRegion.descriptionBn,
                        visitedPdfIds.includes(activePdfRegion.id),
                        () => togglePdfRegion(activePdfRegion.id)
                      )
                    }
                    className="py-2 px-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> বিস্তারিত ও ছবি
                  </button>
                </div>
              </div>
            )}

            {/* Region List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2 max-h-[520px] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                সকল ২২টি অঞ্চল তালিকা
              </h4>
              <div className="space-y-1.5">
                {RAJSHAHI_PDF_REGIONS.map((region) => {
                  const isSelected = selectedPdfId === region.id;
                  const isVisited = visitedPdfIds.includes(region.id);
                  return (
                    <div
                      key={region.id}
                      onClick={() => setSelectedPdfId(region.id)}
                      className={`p-2.5 rounded-xl text-left border cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300'
                          : isVisited
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {region.rankNo}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {region.nameBn}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePdfRegion(region.id);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                          isVisited
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Base Map + 22 Vector Polygons */}
          <div className="lg:col-span-7 bg-[#022c22] rounded-3xl border border-emerald-900 shadow-xl overflow-hidden p-3 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 text-xs text-emerald-200 font-semibold border-b border-emerald-900">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4" /> রাজশাহী জেলা ২২-অঞ্চল ভেক্টর ম্যাপ
              </span>
              <span>পদ্মা তীরবর্তী অঞ্চলসহ ২২টি সীমানা</span>
            </div>

            <div className="w-full aspect-[1/1] relative my-auto rounded-2xl overflow-hidden border border-emerald-950 bg-slate-900">
              {/* Detailed Background Map Image */}
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
                  if (isVisited) {
                    fillColor = '#059669';
                  }

                  return (
                    <g
                      key={region.id}
                      onClick={() => setSelectedPdfId(region.id)}
                      className="cursor-pointer transition-all duration-300"
                    >
                      <path
                        d={region.d}
                        fill={fillColor}
                        fillOpacity={isVisited ? 0.75 : 0.45}
                        stroke={isSelected ? '#facc15' : '#ffffff'}
                        strokeWidth={isSelected ? 6 : 2}
                        className={isSelected ? 'glow-selected-polygon' : 'hover:fill-opacity-80'}
                      />
                      {/* Region Rank Label */}
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
                        pointerEvents="none"
                      >
                        {region.rankNo}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px] text-emerald-300 border-t border-emerald-900 mt-2">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#059669]" /> ঘোরার পর এলাকা সবুজ হয়ে যাবে
              </span>
              <span className="text-amber-300 font-bold">সিলেক্ট করলে উজ্জ্বল হলুদ গ্লো (#facc15)</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* STAGE 3: RAJSHAHI DIVISION (8 DISTRICTS) */}
      {/* ============================================================================ */}
      {stage === 'division' && (
        <div className="space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: 8 District Vector Map */}
            <div className="lg:col-span-6 bg-[#022c22] rounded-3xl border border-emerald-900 shadow-xl p-4 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between pb-3 text-xs text-emerald-200 font-semibold border-b border-emerald-900">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-4 h-4" /> রাজশাহী বিভাগ ৮-জেলা ভেক্টর ম্যাপ
                </span>
                <span>জেলায় ক্লিক করে সিলেক্ট করুন</span>
              </div>

              <div className="w-full aspect-[245/220] relative my-auto">
                <svg
                  viewBox={RAJSHAHI_VIEWBOX}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {RAJSHAHI_DISTRICT_SVGS.map((district) => {
                    const isSelected = selectedDistrictId === district.id;
                    const distSpots = DIVISION_SPOTS.filter((s) => s.districtId === district.id);
                    const visitedCount = distSpots.filter((s) => visitedDivSpotIds.includes(s.id)).length;
                    const isAllVisited = distSpots.length > 0 && visitedCount === distSpots.length;

                    let fillColor = '#1e293b';
                    if (isAllVisited) fillColor = '#059669';
                    else if (visitedCount > 0) fillColor = '#065f46';

                    return (
                      <g
                        key={district.id}
                        onClick={() => setSelectedDistrictId(district.id)}
                        className="cursor-pointer transition-all duration-300"
                      >
                        <path
                          d={district.d}
                          fill={fillColor}
                          fillOpacity={0.9}
                          stroke={isSelected ? '#facc15' : '#ffffff'}
                          strokeWidth={isSelected ? 2.5 : 0.8}
                          className={isSelected ? 'glow-selected-polygon' : 'hover:fill-opacity-100'}
                        />
                        <text
                          x={district.label.x}
                          y={district.label.y}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {district.nameBn}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between pt-3 text-[11px] text-emerald-300 border-t border-emerald-900 mt-2">
                <span>সিলেক্টেড জেলা: {activeDistrictMeta.nameBn}</span>
                <span className="text-amber-300 font-bold">মোট পর্যটন অগ্রগতি: {totalDivisionPercent}%</span>
              </div>
            </div>

            {/* Right: Tourist Spot Cards for the Selected District */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {activeDistrictMeta.nameBn}র দর্শনীয় স্থানসমূহ
                  </h3>
                  <p className="text-xs text-slate-500">
                    ঘুরে দেখা স্থানগুলো টিক দিয়ে মার্ক করুন ({currentDistrictVisitedCount}/{currentDistrictSpots.length})
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {currentDistrictPercent}% ভ্রমণ
                </span>
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {currentDistrictSpots.map((spot) => {
                  const isVisited = visitedDivSpotIds.includes(spot.id);
                  return (
                    <div
                      key={spot.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={customSpotsMap[spot.id]?.images?.[0] || spot.imageUrl}
                            alt={spot.nameBn}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            স্পট #{spot.rankNo}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 truncate mt-1">
                            {spot.nameBn}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">📍 {spot.locationBn}</p>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {spot.summaryBn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => toggleDivSpot(spot.id)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isVisited
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isVisited ? 'ঘুরেছি ✓' : 'আমি ঘুরেছি'}
                        </button>

                        <button
                          onClick={() =>
                            openSpotFullPage(
                              spot.id,
                              spot.nameBn,
                              spot.locationBn,
                              spot.imageUrl,
                              spot.summaryBn,
                              isVisited,
                              () => toggleDivSpot(spot.id)
                            )
                          }
                          className="py-2 px-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> বিস্তারিত ও ছবি
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
      {/* 2. SHAREABLE CERTIFICATE MODAL WITH MANDATORY NAME INPUT LOCK */}
      {/* ============================================================================ */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">ভ্রমণ সনদ ও শেয়ার কার্ড</h3>
                  <p className="text-xs text-slate-500">আপনার অর্জিত স্কোর সামাজিক মাধ্যমে শেয়ার করুন</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Certificate Preview Box */}
            <div className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-2xl p-6 text-white text-center border-2 border-amber-400 space-y-3">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                RU Insiders Official Explorer Card
              </span>
              <h4 className="text-lg font-extrabold text-white">
                {stage === 'ru_campus'
                  ? 'রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস পরিক্রমা'
                  : stage === 'rajshahi_district'
                  ? 'রাজশাহী জেলা ভ্রমণ সনদ'
                  : 'রাজশাহী বিভাগ ও পর্যটন পরিক্রমা'}
              </h4>
              <p className="text-2xl font-black text-amber-400">
                {stage === 'ru_campus'
                  ? `${ruPercent}% স্থান ভ্রমণ সম্পন্ন`
                  : stage === 'rajshahi_district'
                  ? `${pdfPercent}% অঞ্চল ভ্রমণ সম্পন্ন`
                  : `${currentDistrictPercent}% দর্শনীয় স্থান সম্পন্ন`}
              </p>
              <p className="text-xs text-emerald-200">
                সনদে আপনার নাম: <span className="font-bold underline">{explorerName.trim() || '(নাম লিখুন)'}</span>
              </p>
            </div>

            {/* Mandatory Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>আপনার নাম লিখুন (বাধ্যতামূলক):</span>
                {!explorerName.trim() && (
                  <span className="text-rose-600 text-[11px] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> নাম না লিখলে লক থাকবে
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="যেমন: মাহিম আহমেদ / রাবি শিক্ষার্থী"
                value={explorerName}
                onChange={(e) => setExplorerName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-amber-500 font-bold text-slate-900"
              />
            </div>

            {/* Download Button (Strictly Locked until name is entered) */}
            <button
              onClick={handleDownloadCertificate}
              disabled={!explorerName.trim()}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                explorerName.trim()
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {explorerName.trim() ? (
                <>
                  <Download className="w-4 h-4" /> হাই-রেজুলুশন সনদ ডাউনলোড করুন (PNG)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> ডাউনলোড করতে আগে আপনার নাম লিখুন
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
