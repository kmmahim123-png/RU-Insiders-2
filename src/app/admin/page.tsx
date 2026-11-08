'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  LogOut,
  ShoppingBag,
  MapPin,
  Newspaper,
  GraduationCap,
  Trophy,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Eye,
  Bell,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Flame,
  Heart,
  Edit3,
  Camera,
  Database,
  Copy,
} from 'lucide-react';
import {
  Product,
  Order,
  ClubInfo,
  ClubApplication,
  InsideRuArticle,
  AlumniProfile,
  SiteSettings,
  MapSpotCustomData,
  DetailBlock,
  ProductVariant,
} from '@/types';
import { RU_CAMPUS_PLACES } from '@/lib/ruCampusSvg';
import { RAJSHAHI_PDF_REGIONS } from '@/lib/rajshahiPdfRegions';
import { DIVISION_DISTRICT_META } from '@/lib/divisionSpotsData';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'PRODUCT_MANAGER' | 'CLUB_ADMIN' | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [clubId, setClubId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Super Admin / Shared state
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'map' | 'articles' | 'alumni' | 'clubs' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mapSpots, setMapSpots] = useState<Record<string, MapSpotCustomData>>({});
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [clubApplications, setClubApplications] = useState<ClubApplication[]>([]);
  const [articles, setArticles] = useState<InsideRuArticle[]>([]);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Password Verification (Single Input Auto Role Detection)
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) return;

    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_PASSWORD', password: password.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setRole(data.role);
        setRoleTitle(data.roleTitle);
        sessionStorage.setItem('ru_admin_pass', password.trim());

        if (data.role === 'SUPER_ADMIN' && data.fullDb) {
          const db = data.fullDb;
          setProducts(db.products || []);
          setOrders(db.orders || []);
          setMapSpots(db.mapSpots || {});
          setClubs(db.clubs || []);
          setClubApplications(db.clubApplications || []);
          setArticles(db.articles || []);
          setAlumni(db.alumni || []);
          setSettings(db.settings || null);
          setActiveTab('products');
        } else if (data.role === 'PRODUCT_MANAGER') {
          setProducts(data.products || []);
          setOrders(data.orders || []);
          setActiveTab('orders');
        } else if (data.role === 'CLUB_ADMIN') {
          setClubId(data.clubId);
          setClubApplications(data.applications || []);
        }
      } else {
        setLoginError(data.error || 'পাসওয়ার্ড সঠিক নয়!');
      }
    } catch (err: any) {
      setLoginError(err.message || 'সার্ভার যোগাযোগে সমস্যা');
    } finally {
      setLoggingIn(false);
    }
  };

  // Re-login check from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('ru_admin_pass');
    if (saved) {
      setPassword(saved);
      fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_PASSWORD', password: saved }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setRole(data.role);
            setRoleTitle(data.roleTitle);
            if (data.role === 'SUPER_ADMIN' && data.fullDb) {
              const db = data.fullDb;
              setProducts(db.products || []);
              setOrders(db.orders || []);
              setMapSpots(db.mapSpots || {});
              setClubs(db.clubs || []);
              setClubApplications(db.clubApplications || []);
              setArticles(db.articles || []);
              setAlumni(db.alumni || []);
              setSettings(db.settings || null);
            } else if (data.role === 'PRODUCT_MANAGER') {
              setProducts(data.products || []);
              setOrders(data.orders || []);
              setActiveTab('orders');
            } else if (data.role === 'CLUB_ADMIN') {
              setClubId(data.clubId);
              setClubApplications(data.applications || []);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('ru_admin_pass');
    setRole(null);
    setPassword('');
    setRoleTitle('');
    setClubId(null);
  };

  // CSV Exporter Helper
  const exportToCsv = (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string | number)[]) =>
      row
        .map((val) => {
          const str = String(val == null ? '' : val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',');

    const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // ============================================================================
  // EDIT PRODUCT MODAL STATE
  // ============================================================================
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product>({
    id: '',
    nameBn: '',
    category: 'হুডি ও শীতকালীন পোশাক',
    productType: 'apparel',
    price: 850,
    images: ['/mockups/hoodie-front.jpg'],
    shortSummary: '',
    detailSections: [{ id: 'sec-1', title: 'বিবরণ ও ফেব্রিক কোয়ালিটি', content: '' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    weightOptions: [],
    inStock: true,
    featured: false,
    createdAt: new Date().toISOString(),
  });
  const [sendProdPush, setSendProdPush] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Article Modal State
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editArticle, setEditArticle] = useState<InsideRuArticle>({
    id: '',
    title: '',
    category: 'ব্রেকিং নিউজ',
    authorName: 'সেন্ট্রাল ডেস্ক',
    department: 'RU Insiders অফিশিয়াল',
    whatsappNumber: '8801700000000',
    images: ['/campus/paris-road-rain.jpg'],
    summary: '',
    detailSections: [{ id: 'sec-1', title: 'বিস্তারিত সংবাদ ও বিবরণ', content: '' }],
    likes: 25,
    status: 'Published',
    isBreaking: true,
    createdAt: new Date().toISOString(),
  });
  const [sendArticlePush, setSendArticlePush] = useState(false);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');

  const handleOpenAddArticle = (isBreaking: boolean = false) => {
    setEditArticle({
      id: `art-${Date.now()}`,
      title: '',
      category: isBreaking ? 'ব্রেকিং নিউজ' : 'ক্যাম্পাস নিউজ',
      authorName: 'সেন্ট্রাল ডেস্ক',
      department: 'RU Insiders',
      whatsappNumber: settings?.whatsappNumber || '8801700000000',
      images: ['/campus/paris-road-rain.jpg'],
      summary: '',
      detailSections: [{ id: 'sec-1', title: 'মূল বিবরণ ও সংবাদ', content: '' }],
      likes: Math.floor(15 + Math.random() * 20),
      status: 'Published',
      isBreaking: isBreaking,
      createdAt: new Date().toISOString(),
    });
    setSendArticlePush(true);
    setShowArticleModal(true);
  };

  const handleOpenEditArticle = (art: InsideRuArticle) => {
    setEditArticle({
      ...art,
      detailSections: art.detailSections?.length
        ? [...art.detailSections]
        : [{ id: 'sec-1', title: 'মূল বিবরণ', content: '' }],
      images: art.images?.length ? [...art.images] : ['/campus/paris-road-rain.jpg'],
    });
    setSendArticlePush(false);
    setShowArticleModal(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editArticle.title.trim()) {
      alert('অনুগ্রহ করে নিউজের শিরোনাম লিখুন');
      return;
    }

    const currentPass = password.trim() || sessionStorage.getItem('ru_admin_pass') || '';
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_ARTICLE',
          password: currentPass,
          payload: { article: editArticle, sendChromePush: sendArticlePush },
        }),
      });
      const data = await res.json();
      if (data.ok && data.articles) {
        setArticles(data.articles);
        if (data.settings) setSettings(data.settings);
        setShowArticleModal(false);
        showToast('✓ নিউজ ও ছবি সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!');
      } else {
        alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে। পাসওয়ার্ড বা তথ্যে সমস্যা থাকতে পারে।');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে সমস্যা: ' + err.message);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই নিউজ বা লেখাটি মুছে ফেলতে চান?')) return;
    const currentPass = password.trim() || sessionStorage.getItem('ru_admin_pass') || '';
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_ARTICLE',
          password: currentPass,
          payload: { articleId: id },
        }),
      });
      const data = await res.json();
      if (data.ok && data.articles) {
        setArticles(data.articles);
        showToast('✓ নিউজ মুছে ফেলা হয়েছে');
      } else {
        alert(data.error || 'মুছে ফেলা সম্ভব হয়নি');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleOpenAddProduct = () => {
    setEditProduct({
      id: `prod-${Date.now()}`,
      nameBn: '',
      category: settings?.categories?.[0] || 'হুডি ও শীতকালীন পোশাক',
      productType: 'apparel',
      price: 850,
      images: ['/mockups/hoodie-front.jpg'],
      shortSummary: '',
      detailSections: [{ id: 'sec-1', title: 'বিবরণ ও ফেব্রিক কোয়ালিটি', content: '' }],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      weightOptions: [],
      inStock: true,
      featured: false,
      createdAt: new Date().toISOString(),
    });
    setSendProdPush(true);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditProduct({ ...prod });
    setSendProdPush(false);
    setShowProductModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'map' | 'article') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.ok && data.urls?.length) {
        if (target === 'product') {
          setEditProduct((prev) => ({
            ...prev,
            images: [...prev.images.filter((img) => img !== '/mockups/hoodie-front.jpg'), ...data.urls],
          }));
        } else if (target === 'map') {
          setEditMapSpot((prev) => ({
            ...prev,
            images: [...prev.images, ...data.urls],
          }));
        } else if (target === 'article') {
          setEditArticle((prev) => ({
            ...prev,
            images: [...prev.images.filter((img) => img !== '/campus/paris-road-rain.jpg'), ...data.urls],
          }));
        }
        showToast('✓ ছবি সফলভাবে আপলোড হয়েছে!');
      } else {
        alert(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert(err.message || 'আপলোড সমস্যা');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct.nameBn.trim()) {
      alert('পণ্যের নাম লিখুন');
      return;
    }

    const currentPass = password.trim() || (typeof window !== 'undefined' ? sessionStorage.getItem('ru_admin_pass') || '' : '');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_PRODUCT',
          password: currentPass,
          payload: { product: editProduct, sendChromePush: sendProdPush },
        }),
      });
      const data = await res.json();
      if (data.ok && data.products) {
        setProducts(data.products);
        setShowProductModal(false);
        showToast('✓ পণ্য সফলভাবে সংরক্ষিত হয়েছে!');
      } else {
        alert(data.error || 'পণ্য সংরক্ষণ করা সম্ভব হয়নি');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) return;
    const currentPass = password.trim() || (typeof window !== 'undefined' ? sessionStorage.getItem('ru_admin_pass') || '' : '');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_PRODUCT',
          password: currentPass,
          payload: { productId: id },
        }),
      });
      const data = await res.json();
      if (data.ok && data.products) {
        setProducts(data.products);
        showToast('✓ পণ্য মুছে ফেলা হয়েছে');
      } else {
        alert(data.error || 'পণ্য মুছতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const currentPass = password.trim() || (typeof window !== 'undefined' ? sessionStorage.getItem('ru_admin_pass') || '' : '');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          password: currentPass,
          payload: { orderId, status: newStatus },
        }),
      });
      const data = await res.json();
      if (data.ok && data.orders) {
        setOrders(data.orders);
        showToast(`✓ অর্ডার স্ট্যাটাস "${newStatus}" আপডেট হয়েছে`);
      } else {
        alert(data.error || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
    }
  };

  // ============================================================================
  // MAP MANAGER STATE (Super Admin)
  // ============================================================================
  const [selectedMapStage, setSelectedMapStage] = useState<'ru_campus' | 'rajshahi_district' | 'division'>('ru_campus');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('paris_road');
  const [editMapSpot, setEditMapSpot] = useState<MapSpotCustomData>({
    spotId: 'paris_road',
    stage: 'ru_campus',
    nameBn: 'ঐতিহাসিক প্যারিস রোড (গগনশিরীষ বৃক্ষবীথি)',
    subtitleBn: 'রাজশাহী বিশ্ববিদ্যালয়ের প্রধান আকর্ষণ ও সবুজ সুড়ঙ্গ পথ',
    images: ['/campus/paris-road-rain.jpg'],
    detailSections: [{ id: 'sec-1', title: 'প্যারিস রোডের ইতিহাস', content: '' }],
  });

  const handleSelectSpotForEdit = (spotId: string) => {
    setSelectedSpotId(spotId);
    const existing = mapSpots[spotId];
    if (existing) {
      setEditMapSpot({ ...existing });
    } else {
      let defaultName = spotId;
      let defaultSub = '';
      let defaultImg = '/campus/paris-road-rain.jpg';

      if (selectedMapStage === 'ru_campus') {
        const found = RU_CAMPUS_PLACES.find((p) => p.id === spotId);
        if (found) {
          defaultName = found.nameBn;
          defaultSub = found.descriptionBn;
          defaultImg = found.imageUrl;
        }
      } else if (selectedMapStage === 'rajshahi_district') {
        const found = RAJSHAHI_PDF_REGIONS.find((r) => r.id === spotId);
        if (found) {
          defaultName = found.nameBn;
          defaultSub = found.descriptionBn;
          defaultImg = found.imageUrl;
        }
      } else {
        const found = DIVISION_DISTRICT_META.find((d) => d.id === spotId);
        if (found) {
          defaultName = found.nameBn;
          defaultSub = 'রাজশাহী বিভাগের জেলা';
        }
      }

      setEditMapSpot({
        spotId,
        stage: selectedMapStage,
        nameBn: defaultName,
        subtitleBn: defaultSub,
        images: [defaultImg],
        detailSections: [{ id: 'sec-1', title: `${defaultName} পরিচিতি ও ইতিহাস`, content: '' }],
      });
    }
  };

  const getActivePass = () =>
    password.trim() || (typeof window !== 'undefined' ? sessionStorage.getItem('ru_admin_pass') || '' : '');

  const handleSaveMapSpot = async () => {
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_MAP_SPOT',
          password: currentPass,
          payload: { spot: editMapSpot },
        }),
      });
      const data = await res.json();
      if (data.ok && data.mapSpots) {
        setMapSpots(data.mapSpots);
        showToast('✓ ম্যাপ স্পট তথ্য ও ছবি সফলভাবে সংরক্ষিত হয়েছে!');
      } else {
        alert(data.error || 'ম্যাপ স্পট তথ্য সংরক্ষণ করা যায়নি');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    }
  };

  // ============================================================================
  // CLUB APPLICATION APPROVAL / REJECTION
  // ============================================================================
  const handleUpdateClubApp = async (appId: string, newStatus: 'Approved' | 'Rejected') => {
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_CLUB_APP',
          password: currentPass,
          payload: { appId, status: newStatus },
        }),
      });
      const data = await res.json();
      if (data.ok && data.applications) {
        setClubApplications(data.applications);
        showToast(`✓ আবেদন স্ট্যাটাস "${newStatus}" করা হয়েছে`);
      } else {
        alert(data.error || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    }
  };

  // Article approval (Super Admin)
  const handleApproveArticle = async (articleId: string, status: 'Published' | 'Pending') => {
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_ARTICLE',
          password: currentPass,
          payload: { articleId, status },
        }),
      });
      const data = await res.json();
      if (data.ok && data.articles) {
        setArticles(data.articles);
        showToast(`✓ লেখা স্ট্যাটাস আপডেট হয়েছে`);
      } else {
        alert(data.error || 'লেখা স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    }
  };

  // Alumni approval (Super Admin)
  const handleApproveAlumni = async (alumniId: string, approved: boolean) => {
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_ALUMNI',
          password: currentPass,
          payload: { alumniId, approved },
        }),
      });
      const data = await res.json();
      if (data.ok && data.alumni) {
        setAlumni(data.alumni);
        showToast('✓ অ্যালামনাই অনুমোদন স্ট্যাটাস আপডেট হয়েছে');
      } else {
        alert(data.error || 'অ্যালামনাই অনুমোদন ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    }
  };

  const handleDeleteAlumni = async (alumniId: string) => {
    if (!confirm('আপনি কি এই অ্যালামনাই প্রোফাইলটি মুছে ফেলতে চান?')) return;
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_ALUMNI',
          password: currentPass,
          payload: { alumniId },
        }),
      });
      const data = await res.json();
      if (data.ok && data.alumni) {
        setAlumni(data.alumni);
        showToast('✓ অ্যালামনাই প্রোফাইল মুছে ফেলা হয়েছে');
      } else {
        alert(data.error || 'অ্যালামনাই মুছতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার ত্রুটি: ' + err.message);
    }
  };

  // Settings & Passwords Save (Super Admin)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    // Check duplicate club passwords
    const clubPasses = clubs.map((c) => c.password.trim());
    const uniquePasses = new Set(clubPasses);
    if (uniquePasses.size !== clubPasses.length) {
      alert('ভুল! দুটি ক্লাবের পাসওয়ার্ড একই হতে পারবে না। প্রতিটি ক্লাবের আলাদা পাসওয়ার্ড দিন।');
      return;
    }

    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          password: currentPass,
          payload: { settings, clubs },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✓ সেটিংস ও পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!');
      } else {
        alert(data.error || 'সেটিংস আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    }
  };

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastLink, setBroadcastLink] = useState('/shop');
  const [broadcastPush, setBroadcastPush] = useState(true);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_BROADCAST',
          password: currentPass,
          payload: {
            title: broadcastTitle.trim(),
            message: broadcastMsg.trim(),
            link: broadcastLink.trim(),
            sendChromePush: broadcastPush,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✓ নোটিফিকেশন ব্রডকাস্ট পাঠানো হয়েছে!');
        setBroadcastTitle('');
        setBroadcastMsg('');
      } else {
        alert(data.error || 'ব্রডকাস্ট পাঠাতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    }
  };

  // Supabase Status & Cloud Sync State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    online: boolean;
    tableReady: boolean;
    synced: boolean;
    lastUpdated?: string | null;
    error?: string | null;
  } | null>(null);
  const [checkingSupabase, setCheckingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);

  const handleCheckSupabase = async () => {
    setCheckingSupabase(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECK_SUPABASE' }),
      });
      const data = await res.json();
      if (data.ok && data.status) {
        setSupabaseStatus(data.status);
      }
    } catch (err: any) {
      alert('Supabase স্ট্যাটাস চেক ত্রুটি: ' + err.message);
    } finally {
      setCheckingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncingSupabase(true);
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC_SUPABASE',
          password: currentPass,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✓ সফলভাবে Supabase ক্লাউড ডেটাবেজে সম্পূর্ণ তথ্য সিঙ্ক হয়েছে!');
        handleCheckSupabase();
      } else {
        alert(data.error || 'সিঙ্ক ব্যর্থ হয়েছে। Supabase-এ app_state টেবিল তৈরি আছে কিনা নিশ্চিত করুন।');
      }
    } catch (err: any) {
      alert('সার্ভার যোগাযোগে ত্রুটি: ' + err.message);
    } finally {
      setSyncingSupabase(false);
    }
  };

  // ============================================================================
  // VIEW: SINGLE PASSWORD LOGIN SCREEN (Auto Role Detection)
  // ============================================================================
  if (!role) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              স্মার্ট অ্যাডমিন ও ক্লাব পোর্টাল
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              সুপার অ্যাডমিন, প্রোডাক্ট ম্যানেজার কিংবা ক্লাবের যেকোনো পাসওয়ার্ড টাইপ করুন। সিস্টেম স্বয়ংক্রিয়ভাবে আপনার রোল শনাক্ত করবে।
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-bold text-red-700 rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>একক পাসওয়ার্ড লিখুন:</span>
                <span className="text-[10px] text-slate-400 font-semibold">Single Smart Box</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="পাসওয়ার্ড দিন (যেমন: ru-admin-2026)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50"
            >
              {loggingIn ? 'রোল যাচাই হচ্ছে...' : 'লগইন করুন →'}
            </button>
          </form>

          {/* Helper Credentials Hint */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-left space-y-1">
            <p className="font-bold text-slate-600">ডিফল্ট পাসওয়ার্ডসমূহ:</p>
            <p>• সুপার অ্যাডমিন: <code className="text-blue-700 font-mono">ru-admin-2026</code></p>
            <p>• প্রোডাক্ট ম্যানেজার: <code className="text-emerald-700 font-mono">ru-shop-2026</code></p>
            <p>• ক্লাবসমূহ: <code className="text-amber-700 font-mono">rucs-2026</code>, <code className="text-amber-700 font-mono">rudeu-2026</code>, <code className="text-amber-700 font-mono">badhan-2026</code> ইত্যাদি</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LOGGED-IN DASHBOARD VIEW
  // ============================================================================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Role Info & Logout */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
            {role === 'SUPER_ADMIN' ? '👑' : role === 'PRODUCT_MANAGER' ? '🛍️' : '🏆'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {role}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">{roleTitle}</h1>
            </div>
            <p className="text-xs text-slate-500">RU Insiders অফিসিয়াল কন্ট্রোল প্যানেল</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
        >
          <LogOut className="w-4 h-4" /> লগআউট
        </button>
      </div>

      {/* ============================================================================ */}
      {/* ROLE: CLUB ADMIN (Only Membership Applications + 1-Click CSV Export) */}
      {/* ============================================================================ */}
      {role === 'CLUB_ADMIN' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  ক্লাব মেম্বারশিপ আবেদনসমূহ ({clubApplications.length}টি)
                </h2>
                <p className="text-xs text-slate-500">
                  আবেদনকারীদের তথ্য যাচাই করে অনুমোদন বা বাতিল করুন।
                </p>
              </div>

              <button
                onClick={() => {
                  const header = ['ID', 'নাম', 'ইমেইল', 'বিভাগ', 'সেশন', 'রোল', 'মোবাইল', 'ব্লাড গ্রুপ', 'কারণ', 'স্ট্যাটাস', 'তারিখ'];
                  const rows = clubApplications.map((app) => [
                    app.id,
                    app.studentName,
                    app.email,
                    app.department,
                    app.session,
                    app.rollNumber,
                    app.phone,
                    app.bloodGroup,
                    app.reason,
                    app.status,
                    app.createdAt,
                  ]);
                  exportToCsv(`club-applications-${clubId}-${Date.now()}.csv`, [header, ...rows]);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> 1-Click Export to CSV (Excel)
              </button>
            </div>

            {clubApplications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                এখনও কোনো মেম্বারশিপ আবেদন জমা পড়েনি।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                      <th className="p-3">শিক্ষার্থীর নাম</th>
                      <th className="p-3">বিভাগ ও সেশন</th>
                      <th className="p-3">রোল</th>
                      <th className="p-3">মোবাইল ও ইমেইল</th>
                      <th className="p-3">রক্তের গ্রুপ</th>
                      <th className="p-3">কারণ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {clubApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="p-3 font-bold text-slate-900">{app.studentName}</td>
                        <td className="p-3">
                          {app.department} ({app.session})
                        </td>
                        <td className="p-3 font-mono">{app.rollNumber}</td>
                        <td className="p-3">
                          <span className="font-bold block">{app.phone}</span>
                          <span className="text-[10px] text-slate-400">{app.email}</span>
                        </td>
                        <td className="p-3 font-bold text-rose-600">{app.bloodGroup}</td>
                        <td className="p-3 max-w-xs truncate" title={app.reason}>
                          {app.reason}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateClubApp(app.id, 'Approved')}
                              className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateClubApp(app.id, 'Rejected')}
                              className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* ROLE: PRODUCT MANAGER & SUPER ADMIN TABS */}
      {/* ============================================================================ */}
      {(role === 'SUPER_ADMIN' || role === 'PRODUCT_MANAGER') && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>পণ্যসমূহ ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>অর্ডারসমূহ ({orders.length})</span>
            </button>

            {role === 'SUPER_ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'map'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>ম্যাপ ম্যানেজার</span>
                </button>

                <button
                  onClick={() => setActiveTab('articles')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'articles'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>Inside RU লেখা ({articles.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('alumni')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'alumni'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>অ্যালামনাই ({alumni.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('clubs')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'clubs'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>ক্লাব আবেদন ({clubApplications.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>সেটিংস ও পাসওয়ার্ড</span>
                </button>
              </>
            )}
          </div>

          {/* ============================================================================ */}
          {/* TAB 1: PRODUCTS MANAGER */}
          {/* ============================================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">পণ্য তালিকা ও ক্যাটালগ</h2>
                  <p className="text-xs text-slate-500">হুডি, ড্রপ শোল্ডার, খেজুরের গুড়, নাড়ু ও অন্যান্য মার্চেন্ডাইজ</p>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> নতুন পণ্য যোগ করুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden border">
                        <img
                          src={prod.images[0] || '/mockups/hoodie-front.jpg'}
                          alt={prod.nameBn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {prod.category}
                        </span>
                        <span className="text-xs font-black text-slate-900">৳{prod.price}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{prod.nameBn}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{prod.shortSummary}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        এডিট / ছবি যোগ
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 2: ORDERS MANAGER */}
          {/* ============================================================================ */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    ক্যাশ অন ডেলিভারি অর্ডারসমূহ ({orders.length}টি)
                  </h2>
                  <p className="text-xs text-slate-500">গ্রাহকের অর্ডার ও ডেলিভারি স্ট্যাটাস নিয়ন্ত্রণ</p>
                </div>

                <button
                  onClick={() => {
                    const header = ['Order ID', 'গ্রাহক', 'ফোন', 'জোন', 'ঠিকানা', 'আইটেম', 'সাবটোটাল', 'ডেলিভারি', 'মোট', 'স্ট্যাটাস', 'তারিখ'];
                    const rows = orders.map((o) => [
                      o.orderId,
                      o.customerName,
                      o.phone,
                      o.deliveryZone,
                      o.addressDetails,
                      o.items.map((i) => `${i.nameBn}(${i.selectedOption})x${i.quantity}`).join('; '),
                      o.subtotal,
                      o.deliveryCharge,
                      o.totalAmount,
                      o.status,
                      o.createdAt,
                    ]);
                    exportToCsv(`ru-insiders-orders-${Date.now()}.csv`, [header, ...rows]);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export Orders to CSV
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">কোনো অর্ডার নেই।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">গ্রাহক ও ফোন</th>
                        <th className="p-3">ডেলিভারি এলাকা ও ঠিকানা</th>
                        <th className="p-3">পণ্য ও পরিমাণ</th>
                        <th className="p-3 text-right">মোট (COD)</th>
                        <th className="p-3 text-center">স্ট্যাটাস</th>
                        <th className="p-3 text-right">পদক্ষেপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {orders.map((order) => (
                        <tr key={order.orderId}>
                          <td className="p-3 font-mono font-bold text-blue-700">{order.orderId}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{order.customerName}</span>
                            <span className="text-[11px] text-slate-500">{order.phone}</span>
                          </td>
                          <td className="p-3 max-w-xs">
                            <span className="font-bold text-slate-800 block">
                              {order.deliveryZone === 'campus'
                                ? 'রাবি ক্যাম্পাস'
                                : order.deliveryZone === 'city'
                                ? 'সিটি কর্পোরেশন'
                                : 'কুরিয়ার'}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {order.addressDetails}
                            </span>
                          </td>
                          <td className="p-3">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="text-[11px]">
                                • {i.nameBn} ({i.selectedOption}) x{i.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">৳{order.totalAmount}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'Out for Delivery'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'Confirmed'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order.orderId, e.target.value as Order['status'])
                              }
                              className="text-[11px] font-bold border border-slate-200 rounded-lg p-1 bg-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 3: MAP MANAGER (Multi-Image & Multi-Section) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'map' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  ৩-ধাপের মানচিত্র কন্টেন্ট ও ইমেজ ম্যানেজার
                </h2>
                <p className="text-xs text-slate-500">
                  যেকোনো স্পট নির্বাচন করে একাধিক ছবি এবং আনলিমিটেড টাইটেল ও বিস্তারিত প্যারাগ্রাফ ব্লক যোগ করুন।
                </p>
              </div>

              {/* Stage selector */}
              <div className="flex gap-2">
                {[
                  { id: 'ru_campus' as const, label: '১. রাবি ক্যাম্পাস (৪২ স্পট)' },
                  { id: 'rajshahi_district' as const, label: '২. রাজশাহী জেলা (২২ অঞ্চল)' },
                  { id: 'division' as const, label: '৩. রাজশাহী বিভাগ (৮ জেলা)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedMapStage(s.id);
                      if (s.id === 'ru_campus') handleSelectSpotForEdit('paris_road');
                      else if (s.id === 'rajshahi_district') handleSelectSpotForEdit('pdf_ru');
                      else handleSelectSpotForEdit('rajshahi');
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition ${
                      selectedMapStage === s.id
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Spot Dropdown Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">স্থান / অঞ্চল নির্বাচন করুন:</label>
                <select
                  value={selectedSpotId}
                  onChange={(e) => handleSelectSpotForEdit(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold bg-white"
                >
                  {selectedMapStage === 'ru_campus' &&
                    RU_CAMPUS_PLACES.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.rankNo} - {p.nameBn}
                      </option>
                    ))}
                  {selectedMapStage === 'rajshahi_district' &&
                    RAJSHAHI_PDF_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        #{r.rankNo} - {r.nameBn}
                      </option>
                    ))}
                  {selectedMapStage === 'division' &&
                    DIVISION_DISTRICT_META.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.rankBn} - {d.nameBn}
                      </option>
                    ))}
                </select>
              </div>

              {/* Spot Edit Fields */}
              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">স্থানের শিরোনাম (বাংলা)</label>
                    <input
                      type="text"
                      value={editMapSpot.nameBn}
                      onChange={(e) => setEditMapSpot({ ...editMapSpot, nameBn: e.target.value })}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">সাব-টাইটেল / সংক্ষিপ্ত পরিচিতি</label>
                    <input
                      type="text"
                      value={editMapSpot.subtitleBn}
                      onChange={(e) => setEditMapSpot({ ...editMapSpot, subtitleBn: e.target.value })}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                {/* Multiple Images Upload & URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      ফটোগ্যালারি ({editMapSpot.images.length}টি ছবি):
                    </label>
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> ডিভাইস থেকে ছবি আপলোড
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'map')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {editMapSpot.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border bg-white group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditMapSpot((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unlimited Title + Details Blocks */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800">
                      বিস্তারিত বিবরণ সেকশনসমূহ (Title + Details):
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditMapSpot((prev) => ({
                          ...prev,
                          detailSections: [
                            ...prev.detailSections,
                            { id: `sec-${Date.now()}`, title: 'নতুন অনুচ্ছেদ', content: '' },
                          ],
                        }))
                      }
                      className="text-xs text-blue-700 font-bold hover:underline"
                    >
                      + নতুন সেকশন যোগ করুন
                    </button>
                  </div>

                  {editMapSpot.detailSections.map((sec, idx) => (
                    <div key={sec.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="সেকশনের শিরোনাম"
                          value={sec.title}
                          onChange={(e) => {
                            const updated = [...editMapSpot.detailSections];
                            updated[idx].title = e.target.value;
                            setEditMapSpot({ ...editMapSpot, detailSections: updated });
                          }}
                          className="flex-1 text-xs font-bold border border-slate-200 rounded-lg p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editMapSpot.detailSections.filter((_, i) => i !== idx);
                            setEditMapSpot({ ...editMapSpot, detailSections: updated });
                          }}
                          className="text-red-500 hover:text-red-700 p-1 text-xs"
                        >
                          মুছুন
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="বিস্তারিত অনুচ্ছেদ..."
                        value={sec.content}
                        onChange={(e) => {
                          const updated = [...editMapSpot.detailSections];
                          updated[idx].content = e.target.value;
                          setEditMapSpot({ ...editMapSpot, detailSections: updated });
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSaveMapSpot}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
                >
                  ম্যাপ স্পট পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 4: INSIDE RU ARTICLES & BREAKING NEWS MANAGEMENT */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Header & Quick Action Buttons */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-blue-600" />
                    <span>Inside RU নিউজ, সাহিত্য ও ব্রেকিং নিউজ ব্যবস্থাপনা</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ক্যাম্পাস নিউজ, ব্রেকিং নিউজ, গল্প, সাহিত্য ও চারুকলার লেখা ও ছবি আপলোড এবং এডিট করুন ({articles.length}টি কনটেন্ট)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenAddArticle(true)}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
                    <span>🔥 নতুন ব্রেকিং নিউজ যোগ করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAddArticle(false)}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ সাধারণ নিউজ বা লেখা যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'all', label: `সকল লেখা (${articles.length})` },
                  { id: 'breaking', label: `🔥 ব্রেকিং নিউজ (${articles.filter(a => a.isBreaking || a.category === 'ব্রেকিং নিউজ').length})` },
                  { id: 'ক্যাম্পাস নিউজ', label: 'ক্যাম্পাস নিউজ' },
                  { id: 'গল্প ও স্মৃতিচারণ', label: 'গল্প ও স্মৃতিচারণ' },
                  { id: 'চারুকলা ও সাহিত্য', label: 'চারুকলা ও সাহিত্য' },
                  { id: 'সাহিত্য ও কবিতা', label: 'সাহিত্য ও কবিতা' },
                  { id: 'গবেষণা ও পেপার', label: 'গবেষণা ও পেপার' },
                ].map((cat) => {
                  const isActive = articleCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setArticleCategoryFilter(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Articles List Cards */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
                {(() => {
                  const filtered = articles.filter((a) => {
                    if (articleCategoryFilter === 'all') return true;
                    if (articleCategoryFilter === 'breaking') return a.isBreaking || a.category === 'ব্রেকিং নিউজ';
                    return a.category === articleCategoryFilter;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        এই ক্যাটাগরিতে এখনো কোনো আর্টিকেল বা নিউজ নেই। উপরের বাটনে চাপ দিয়ে নতুন তৈরি করুন।
                      </div>
                    );
                  }

                  return filtered.map((art) => (
                    <div key={art.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={art.images?.[0] || '/campus/paris-road-rain.jpg'}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                          {art.images && art.images.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.2 rounded font-bold">
                              +{art.images.length - 1}
                            </span>
                          )}
                        </div>

                        {/* Text Info */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                art.isBreaking || art.category === 'ব্রেকিং নিউজ'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {art.isBreaking ? '🔥 ব্রেকিং নিউজ' : art.category}
                            </span>

                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                art.status === 'Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {art.status === 'Published' ? '✓ প্রকাশিত (Live)' : '⏳ ড্রাফট / পেন্ডিং'}
                            </span>

                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-rose-500" />
                              <span>{art.likes ?? 0}</span>
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
                            {art.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-1">
                            লেখক: <span className="font-bold text-slate-700">{art.authorName}</span> ({art.department})
                            {art.summary ? ` • ${art.summary}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditArticle(art)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                          title="এডিট ও ছবি যোগ করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>এডিট ও ছবি</span>
                        </button>

                        {art.status !== 'Published' ? (
                          <button
                            type="button"
                            onClick={() => handleApproveArticle(art.id, 'Published')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            পাবলিশ করুন
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApproveArticle(art.id, 'Pending')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
                          >
                            আনপাবলিশ
                          </button>
                        )}

                        <Link
                          href={`/inside-ru/${art.id}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                          title="সরাসরি পেজে দেখুন"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 5: ALUMNI DIRECTORY APPROVAL */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'alumni' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900">
                অ্যালামনাই প্রোফাইল অনুমোদন ({alumni.length}টি)
              </h2>

              <div className="divide-y divide-slate-100">
                {alumni.map((alum) => (
                  <div key={alum.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{alum.name}</h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            alum.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alum.approved ? 'অনুমোদিত' : 'অপেক্ষমান'}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 font-semibold">{alum.currentRole} • {alum.organization}</p>
                      <p className="text-xs text-slate-500">{alum.department} ({alum.batch}) • {alum.country}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveAlumni(alum.id, !alum.approved)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          alum.approved
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {alum.approved ? 'আন-ভেরিফাই' : 'অনুমোদন দিন'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 6: ALL CLUB APPLICATIONS (Super Admin View) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'clubs' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">
                  সকল ক্লাবের মেম্বারশিপ আবেদন ({clubApplications.length}টি)
                </h2>
                <button
                  onClick={() => {
                    const header = ['Club ID', 'ক্লাব', 'নাম', 'বিভাগ', 'সেশন', 'রোল', 'মোবাইল', 'রক্তের গ্রুপ', 'স্ট্যাটাস'];
                    const rows = clubApplications.map((a) => [
                      a.clubId,
                      a.clubName,
                      a.studentName,
                      a.department,
                      a.session,
                      a.rollNumber,
                      a.phone,
                      a.bloodGroup,
                      a.status,
                    ]);
                    exportToCsv(`all-club-applications-${Date.now()}.csv`, [header, ...rows]);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  <Download className="w-4 h-4 inline mr-1" /> Export All to CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 font-extrabold text-slate-800">
                      <th className="p-2.5">ক্লাব</th>
                      <th className="p-2.5">শিক্ষার্থীর নাম</th>
                      <th className="p-2.5">বিভাগ ও রোল</th>
                      <th className="p-2.5">ফোন</th>
                      <th className="p-2.5">স্ট্যাটাস</th>
                      <th className="p-2.5 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {clubApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="p-2.5 font-bold text-blue-700">{app.clubName}</td>
                        <td className="p-2.5 font-bold text-slate-900">{app.studentName}</td>
                        <td className="p-2.5">{app.department} ({app.rollNumber})</td>
                        <td className="p-2.5">{app.phone}</td>
                        <td className="p-2.5 font-bold">{app.status}</td>
                        <td className="p-2.5 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateClubApp(app.id, 'Approved')}
                            className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateClubApp(app.id, 'Rejected')}
                            className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px]"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 7: SETTINGS & PASSWORD MANAGER (Super Admin) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'settings' && settings && (
            <div className="space-y-6">
              {/* Broadcast Chrome Notification */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span>লাইভ ব্রডকাস্ট নোটিফিকেশন পাঠান</span>
                </h3>
                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="নোটিফিকেশন টাইটেল (যেমন: 🔥 উইন্টার হুডি প্রি-অর্ডার শুরু হয়েছে!)"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="মেসেজ বিবরণ"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastPush}
                        onChange={(e) => setBroadcastPush(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>[✓] 🔔 Chrome ব্রাউজারে সবাইকে পুশ নোটিফিকেশন পাঠান</span>
                    </label>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      ব্রডকাস্ট পাঠান
                    </button>
                  </div>
                </form>
              </div>

              {/* Supabase Cloud Database Status & 1-Click Sync */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-600" />
                      <span>Supabase ক্লাউড ডেটাবেজ স্ট্যাটাস (Vercel Production)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Vercel সার্ভারলেস ডিপ্লয়মেন্টে পারসিস্টেন্ট ক্লাউড স্টোরেজের জন্য Supabase ইন্টিগ্রেশন
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCheckSupabase}
                      disabled={checkingSupabase}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingSupabase ? 'animate-spin' : ''}`} />
                      <span>{checkingSupabase ? 'চেক হচ্ছে...' : 'স্ট্যাটাস যাচাই'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncSupabase}
                      disabled={syncingSupabase}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{syncingSupabase ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউডে সম্পূর্ণ ডেটা সিঙ্ক করুন'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Result Display */}
                {supabaseStatus && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      supabaseStatus.tableReady && supabaseStatus.synced
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : supabaseStatus.online && !supabaseStatus.tableReady
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            supabaseStatus.tableReady && supabaseStatus.synced
                              ? 'bg-emerald-500 animate-pulse'
                              : supabaseStatus.online && !supabaseStatus.tableReady
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span>
                          {supabaseStatus.tableReady && supabaseStatus.synced
                            ? '✓ Supabase ক্লাউড ডেটাবেজ সম্পূর্ণ সক্রিয় ও লাইভ সিঙ্কড!'
                            : supabaseStatus.online && !supabaseStatus.tableReady
                            ? '⚠️ Supabase প্রজেক্ট অনলাইনে আছে, কিন্তু app_state টেবিল তৈরি করা হয়নি'
                            : '✕ Supabase সংযোগে সমস্যা'}
                        </span>
                      </div>
                      {supabaseStatus.lastUpdated && (
                        <span className="text-[11px] opacity-80">
                          সর্বশেষ আপডেট: {new Date(supabaseStatus.lastUpdated).toLocaleTimeString('bn-BD')}
                        </span>
                      )}
                    </div>

                    {supabaseStatus.error && (
                      <p className="text-[11px] font-medium opacity-90">{supabaseStatus.error}</p>
                    )}

                    {!supabaseStatus.tableReady && (
                      <div className="pt-2 border-t border-amber-200/60 space-y-2">
                        <p className="font-bold text-[11px]">
                          💡 Supabase ড্যাশবোর্ডে গিয়ে এই ৩ লাইনের SQL রান করুন (SQL Editor):
                        </p>
                        <div className="relative bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                          <pre>{`CREATE TABLE IF NOT EXISTS public.app_state (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all" ON public.app_state FOR ALL USING (true) WITH CHECK (true);`}</pre>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.app_state (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all" ON public.app_state FOR ALL USING (true) WITH CHECK (true);`);
                              showToast('✓ SQL কোড ক্লিপবোর্ডে কপি হয়েছে!');
                            }}
                            className="absolute top-2 right-2 px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <Copy className="w-3 h-3" />
                            <span>কপি করুন</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Delivery Charges, WhatsApp & Passwords */}
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    ডেলিভারি চার্জ ও অফিসিয়াল তথ্য
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ক্যাম্পাস ডেলিভারি চার্জ (৳)</label>
                    <input
                      type="number"
                      value={settings.deliveryCharges.campus}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          deliveryCharges: { ...settings.deliveryCharges, campus: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">রাজশাহী সিটি ডেলিভারি (৳)</label>
                    <input
                      type="number"
                      value={settings.deliveryCharges.city}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          deliveryCharges: { ...settings.deliveryCharges, city: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">সারা বাংলাদেশ কুরিয়ার (৳)</label>
                    <input
                      type="number"
                      value={settings.deliveryCharges.nationwide}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          deliveryCharges: { ...settings.deliveryCharges, nationwide: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">অফিসিয়াল WhatsApp নাম্বার (৮৮০ সহ)</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                {/* Breaking News Ticker Manager */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-red-600" />
                        <span>হোমপেজ ব্রেকিং নিউজ টিকার তালিকা (Ticker Headlines)</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        এখানে থাকা প্রতিটি শিরোনাম হোমপেজের লাল টিকারে পর্যায়ক্রমে দেখাবে
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentNews = settings.breakingNews || [];
                        setSettings({
                          ...settings,
                          breakingNews: [...currentNews, '🔥 নতুন ব্রেকিং নিউজ শিরোনাম লিখুন...'],
                        });
                      }}
                      className="text-xs text-blue-700 font-bold hover:underline"
                    >
                      + নতুন টিকার যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(settings.breakingNews || []).map((headline, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={headline}
                          onChange={(e) => {
                            const updated = [...(settings.breakingNews || [])];
                            updated[hIdx] = e.target.value;
                            setSettings({ ...settings, breakingNews: updated });
                          }}
                          className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (settings.breakingNews || []).filter((_, i) => i !== hIdx);
                            setSettings({ ...settings, breakingNews: updated });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 text-xs"
                          title="টিকার মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Password Management */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    রোলভিত্তিক স্মার্ট পাসওয়ার্ড ব্যবস্থাপনা
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">প্রোডাক্ট ম্যানেজার পাসওয়ার্ড</label>
                      <input
                        type="text"
                        value={settings.productManagerPassword}
                        onChange={(e) => setSettings({ ...settings, productManagerPassword: e.target.value })}
                        className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">সুপার অ্যাডমিন পাসওয়ার্ড</label>
                      <input
                        type="text"
                        value={settings.superAdminPassword}
                        onChange={(e) => setSettings({ ...settings, superAdminPassword: e.target.value })}
                        className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-red-700"
                      />
                    </div>
                  </div>

                  {/* Individual Club Passwords with Conflict Validation */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      প্রতিটি ক্লাবের স্বতন্ত্র পাসওয়ার্ড:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {clubs.map((club, idx) => (
                        <div key={club.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-[10px] font-bold text-blue-700 block">{club.shortName}</span>
                          <input
                            type="text"
                            value={club.password}
                            onChange={(e) => {
                              const updated = [...clubs];
                              updated[idx].password = e.target.value;
                              setClubs(updated);
                            }}
                            className="w-full text-xs border border-slate-200 rounded-lg p-1.5 font-mono font-bold mt-1 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition"
                >
                  সেটিংস ও পাসওয়ার্ড আপডেট নিশ্চিত করুন
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ============================================================================ */}
      {/* PRODUCT ADD / EDIT MODAL */}
      {/* ============================================================================ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editProduct.id ? 'পণ্য সম্পাদনা / নতুন ছবি যোগ' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={editProduct.nameBn}
                    onChange={(e) => setEditProduct({ ...editProduct, nameBn: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">পণ্যের ধরন (Type) *</label>
                  <select
                    value={editProduct.productType}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, productType: e.target.value as any })
                    }
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold bg-white"
                  >
                    <option value="apparel">পোশাক (Apparel: সাইজ S, M, L, XL, XXL)</option>
                    <option value="food_weight">খাবার / গুড় (Food: ওজন অনুযায়ী দাম)</option>
                    <option value="standard">সাধারণ মার্চেন্ডাইজ / গিফট (Standard)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Weight Options if food_weight */}
              {editProduct.productType === 'food_weight' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">ওজন অনুযায়ী দাম (Weight Options):</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditProduct((prev) => ({
                          ...prev,
                          weightOptions: [
                            ...(prev.weightOptions || []),
                            { label: '১ কেজি', price: prev.price },
                          ],
                        }))
                      }
                      className="text-xs text-blue-700 font-bold hover:underline"
                    >
                      + অপশন যোগ করুন
                    </button>
                  </div>
                  {editProduct.weightOptions?.map((w, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="যেমন: ১ কেজি পাটালি গুড়"
                        value={w.label}
                        onChange={(e) => {
                          const updated = [...(editProduct.weightOptions || [])];
                          updated[idx].label = e.target.value;
                          setEditProduct({ ...editProduct, weightOptions: updated });
                        }}
                        className="flex-1 text-xs border rounded-lg p-2"
                      />
                      <input
                        type="number"
                        placeholder="দাম"
                        value={w.price}
                        onChange={(e) => {
                          const updated = [...(editProduct.weightOptions || [])];
                          updated[idx].price = Number(e.target.value);
                          setEditProduct({ ...editProduct, weightOptions: updated });
                        }}
                        className="w-24 text-xs border rounded-lg p-2 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editProduct.weightOptions?.filter((_, i) => i !== idx);
                          setEditProduct({ ...editProduct, weightOptions: updated });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Multiple Images Upload & URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    পণ্যের ছবি ({editProduct.images.length}টি ছবি):
                  </label>
                  <label className="cursor-pointer px-3 py-1 rounded-lg bg-blue-700 text-white text-xs font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> ছবি আপলোড করুন
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'product')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {editProduct.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border bg-white group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditProduct((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  value={editProduct.shortSummary}
                  onChange={(e) => setEditProduct({ ...editProduct, shortSummary: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              {/* Detail Sections (Title + Content) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    বিস্তারিত অনুচ্ছেদসমূহ (Multiple Title + Details):
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditProduct((prev) => ({
                        ...prev,
                        detailSections: [
                          ...prev.detailSections,
                          { id: `sec-${Date.now()}`, title: 'নতুন অনুচ্ছেদ', content: '' },
                        ],
                      }))
                    }
                    className="text-xs text-blue-700 font-bold hover:underline"
                  >
                    + নতুন সেকশন যোগ করুন
                  </button>
                </div>

                {editProduct.detailSections.map((sec, idx) => (
                  <div key={sec.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="সেকশন শিরোনাম"
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...editProduct.detailSections];
                          updated[idx].title = e.target.value;
                          setEditProduct({ ...editProduct, detailSections: updated });
                        }}
                        className="flex-1 text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editProduct.detailSections.filter((_, i) => i !== idx);
                          setEditProduct({ ...editProduct, detailSections: updated });
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        মুছুন
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="বিস্তারিত বিবরণ..."
                      value={sec.content}
                      onChange={(e) => {
                        const updated = [...editProduct.detailSections];
                        updated[idx].content = e.target.value;
                        setEditProduct({ ...editProduct, detailSections: updated });
                      }}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Push Notification Checkbox */}
              <div className="pt-2 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendProdPush}
                    onChange={(e) => setSendProdPush(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>[✓] 🔔 Chrome ব্রাউজারে সবাইকে নোটিফিকেশন পাঠান</span>
                </label>

                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProduct.inStock}
                    onChange={(e) => setEditProduct({ ...editProduct, inStock: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>স্টকে আছে</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-md transition"
              >
                পণ্য সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================================ */}
      {/* ARTICLE & BREAKING NEWS ADD / EDIT MODAL */}
      {/* ============================================================================ */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowArticleModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold"
            >
              ✕
            </button>

            <div>
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  editArticle.isBreaking
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {editArticle.isBreaking ? '🔥 ব্রেকিং নিউজ মোড' : '📰 সাধারণ প্রকাশনা'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                {editArticle.isBreaking ? 'ব্রেকিং নিউজ তৈরি বা সম্পাদনা' : 'নিউজ বা লেখা সম্পাদনা'}
              </h2>
              <p className="text-xs text-slate-500">
                শিরোনাম, ছবি, অনুচ্ছেদ এবং লাইক সংখ্যা নির্ধারণ করে প্রকাশ করুন
              </p>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">নিউজের বাংলা শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="আকর্ষণীয় ও সুস্পষ্ট শিরোনাম লিখুন..."
                  value={editArticle.title}
                  onChange={(e) => setEditArticle({ ...editArticle, title: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              {/* Category & Likes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্যাটাগরি নির্বাচন</label>
                  <select
                    value={editArticle.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setEditArticle({
                        ...editArticle,
                        category: cat,
                        isBreaking: cat === 'ব্রেকিং নিউজ' ? true : editArticle.isBreaking,
                      });
                    }}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="ব্রেকিং নিউজ">🔥 ব্রেকিং নিউজ</option>
                    <option value="ক্যাম্পাস নিউজ">📰 ক্যাম্পাস নিউজ</option>
                    <option value="গল্প ও স্মৃতিচারণ">📖 গল্প ও স্মৃতিচারণ</option>
                    <option value="চারুকলা ও সাহিত্য">🎨 চারুকলা ও সাহিত্য</option>
                    <option value="সাহিত্য ও কবিতা">✍️ সাহিত্য ও কবিতা</option>
                    <option value="গবেষণা ও পেপার">🔬 গবেষণা ও পেপার</option>
                    <option value="কৃতি শিক্ষার্থী ও ট্যালেন্ট">🌟 কৃতি শিক্ষার্থী ও ট্যালেন্ট</option>
                    <option value="ক্যাম্পাস গান ও সুর">🎵 ক্যাম্পাস গান ও সুর</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    <span>❤️ লাইক সংখ্যা (Admin Editable)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editArticle.likes ?? 0}
                    onChange={(e) => setEditArticle({ ...editArticle, likes: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold text-red-600"
                  />
                </div>
              </div>

              {/* Author details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">লেখক / প্রতিবেদকের নাম</label>
                  <input
                    type="text"
                    required
                    value={editArticle.authorName}
                    onChange={(e) => setEditArticle({ ...editArticle, authorName: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">বিভাগ / সংগঠন</label>
                  <input
                    type="text"
                    required
                    value={editArticle.department}
                    onChange={(e) => setEditArticle({ ...editArticle, department: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">WhatsApp নাম্বার</label>
                  <input
                    type="text"
                    value={editArticle.whatsappNumber || ''}
                    onChange={(e) => setEditArticle({ ...editArticle, whatsappNumber: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Short Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">সংক্ষিপ্ত সারসংক্ষেপ (Summary)</label>
                <textarea
                  rows={2}
                  placeholder="নিউজের সংক্ষিপ্ত সারসংক্ষেপ..."
                  value={editArticle.summary}
                  onChange={(e) => setEditArticle({ ...editArticle, summary: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              {/* Multiple Images Upload & Gallery */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>ছবির গ্যালারি (Multiple Images):</span>
                  </label>
                  <label className="cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingImage ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => handleFileUpload(e, 'article')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Current Images List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {editArticle.images.map((imgUrl, imgIdx) => (
                    <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      <img src={imgUrl} alt={`Image ${imgIdx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editArticle.images.filter((_, i) => i !== imgIdx);
                          setEditArticle({ ...editArticle, images: updated.length ? updated : ['/campus/paris-road-rain.jpg'] });
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition shadow"
                        title="ছবি মুছুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multiple Detail Sections (Title + Content) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    বিস্তারিত অনুচ্ছেদসমূহ (Multiple Sections):
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditArticle((prev) => ({
                        ...prev,
                        detailSections: [
                          ...(prev.detailSections || []),
                          { id: `sec-${Date.now()}`, title: 'নতুন অনুচ্ছেদ', content: '' },
                        ],
                      }))
                    }
                    className="text-xs text-blue-700 font-bold hover:underline"
                  >
                    + নতুন অনুচ্ছেদ যোগ করুন
                  </button>
                </div>

                {(editArticle.detailSections || []).map((sec, idx) => (
                  <div key={sec.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="অনুচ্ছেদের শিরোনাম (যেমন: পেছনের গল্প)"
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...(editArticle.detailSections || [])];
                          updated[idx].title = e.target.value;
                          setEditArticle({ ...editArticle, detailSections: updated });
                        }}
                        className="flex-1 text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white"
                      />
                      {(editArticle.detailSections?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editArticle.detailSections || []).filter((_, i) => i !== idx);
                            setEditArticle({ ...editArticle, detailSections: updated });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="বিস্তারিত লেখা ও বিবরণ..."
                      value={sec.content}
                      onChange={(e) => {
                        const updated = [...(editArticle.detailSections || [])];
                        updated[idx].content = e.target.value;
                        setEditArticle({ ...editArticle, detailSections: updated });
                      }}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Breaking News & Push Flags */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editArticle.isBreaking}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditArticle({
                        ...editArticle,
                        isBreaking: checked,
                        category: checked ? 'ব্রেকিং নিউজ' : editArticle.category,
                      });
                    }}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-red-700 font-extrabold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                    <span>🔥 হোমপেজ ব্রেকিং নিউজ টিকারে যুক্ত করুন</span>
                  </span>
                </label>

                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendArticlePush}
                    onChange={(e) => setSendArticlePush(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>🔔 Chrome পুশ নোটিফিকেশন পাঠান</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-sm shadow-md transition"
              >
                ✓ নিউজ ও ছবি সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
