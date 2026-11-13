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
  Building,
  Check,
  X,
  Store,
  DollarSign,
  Bot,
  HeartPulse,
  Phone,
  Mail,
  UserPlus,
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
  CustomDepartmentData,
  Merchant,
  BreakingNewsItem,
  BloodDonor,
  FacultyMember,
  MarathonEvent,
  MarathonRegistration,
} from '@/types';
import { RU_CAMPUS_PLACES } from '@/lib/ruCampusSvg';
import { RAJSHAHI_PDF_REGIONS } from '@/lib/rajshahiPdfRegions';
import { DIVISION_DISTRICT_META } from '@/lib/divisionSpotsData';
import { RU_DEPARTMENTS, RU_FACULTIES, RuDepartment } from '@/lib/ruAcademicData';
import { RU_CLUBS, RuClub } from '@/lib/ruClubsData';
import AdminBloodTab from '@/components/admin/AdminBloodTab';
import AdminMarathonTab from '@/components/admin/AdminMarathonTab';
import AdminAiStudioTab from '@/components/admin/AdminAiStudioTab';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'PRODUCT_MANAGER' | 'CLUB_ADMIN' | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [clubId, setClubId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Super Admin / Shared state
  const [activeTab, setActiveTab] = useState<
    'products' | 'orders' | 'map' | 'articles' | 'departments' | 'alumni' | 'clubs' | 'merchants' | 'blood' | 'marathon' | 'ai' | 'settings'
  >('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [marathons, setMarathons] = useState<MarathonEvent[]>([]);
  const [marathonRegistrations, setMarathonRegistrations] = useState<MarathonRegistration[]>([]);
  const [mapSpots, setMapSpots] = useState<Record<string, MapSpotCustomData>>({});
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [departments, setDepartments] = useState<Record<string, CustomDepartmentData>>({});
  const [clubApplications, setClubApplications] = useState<ClubApplication[]>([]);
  const [articles, setArticles] = useState<InsideRuArticle[]>([]);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Department Management State
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-cse');
  const [editDept, setEditDept] = useState<CustomDepartmentData>({
    departmentId: 'dept-cse',
    nameBn: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
    overviewBn: '',
    locationBuildingBn: '',
    seatCount: 50,
    degreeOfferedBn: 'বি.এস-সি. ইঞ্জিনিয়ারিং (CSE), এম.এস-সি. ইঞ্জিনিয়ারিং',
    images: [],
    teachers: [],
  });

  // Club Management State
  const [selectedClubToEditId, setSelectedClubToEditId] = useState<string>('rucs');
  const [editClub, setEditClub] = useState<ClubInfo>({
    id: 'rucs',
    shortName: 'RUCS',
    nameBn: 'রাবি ক্যারিয়ার ক্লাব (RUCS)',
    categoryBn: 'ক্যারিয়ার ও দক্ষতা',
    descriptionBn: '',
    mottoBn: 'Build Skills • Excel Career • Lead Future',
    roomLocationBn: 'কক্ষ নং-২০৪, TSCC',
    contactEmail: 'careerclub.ru@gmail.com',
    facebookUrl: 'https://facebook.com',
    images: [],
    password: 'rucs-2026',
  });

  // Breaking News State
  const [newBreakingTitle, setNewBreakingTitle] = useState('');
  const [newBreakingImage, setNewBreakingImage] = useState('/campus/paris-road-rain.jpg');
  const [newBreakingLink, setNewBreakingLink] = useState('/inside-ru');
  const [uploadingBreakingImg, setUploadingBreakingImg] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const safeParseApiResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (res.status === 413 || text.toLowerCase().includes('request entity too large') || text.toLowerCase().includes('payload too large')) {
        throw new Error('অনুরোধের সাইজ অতিরিক্ত বড় (৪.৫ MB লিমিট পার করেছে)। ছবির সাইজ বা সংখ্যা কমিয়ে চেষ্টা করুন।');
      }
      throw new Error(`সার্ভার ত্রুটি (${res.status}): ${text.slice(0, 100)}`);
    }
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
      const data = await safeParseApiResponse(res);
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
          setDepartments(db.departments || {});
          setClubApplications(db.clubApplications || []);
          setArticles(db.articles || []);
          setAlumni(db.alumni || []);
          setMerchants(db.merchants || []);
          setBloodDonors(db.bloodDonors || []);
          setMarathons(db.marathons || []);
          setMarathonRegistrations(db.marathonRegistrations || []);
          setSettings(db.settings || null);
          setActiveTab('products');
          if (RU_DEPARTMENTS.length > 0) {
            const firstD = RU_DEPARTMENTS[0];
            const customD = db.departments?.[firstD.id];
            setEditDept({
              departmentId: firstD.id,
              nameBn: customD?.nameBn || firstD.nameBn,
              overviewBn: customD?.overviewBn !== undefined ? customD.overviewBn : firstD.overviewBn,
              locationBuildingBn: customD?.locationBuildingBn !== undefined ? customD.locationBuildingBn : firstD.locationBuildingBn,
              seatCount: customD?.seatCount !== undefined ? customD.seatCount : firstD.seatCount,
              degreeOfferedBn: customD?.degreeOfferedBn !== undefined ? customD.degreeOfferedBn : firstD.degreeOfferedBn,
              images: customD?.images?.length ? customD.images : (firstD.images || ['/campus/ru-admin.jpg', '/campus/paris-road-rain.jpg']),
              teachers: customD?.teachers || [],
            });
          }
          if (db.clubs?.length > 0) {
            setEditClub(db.clubs[0]);
            setSelectedClubToEditId(db.clubs[0].id);
          }
        } else if (data.role === 'MERCHANT') {
          localStorage.setItem('ru_merchant_session', JSON.stringify(data.merchant));
          window.location.href = '/merchant';
          return;
        } else if (data.role === 'PRODUCT_MANAGER') {
          setProducts(data.products || []);
          setOrders(data.orders || []);
          setActiveTab('orders');
        } else if (data.role === 'CLUB_ADMIN') {
          setClubId(data.clubId);
          setClubApplications(data.applications || []);
          if (data.clubInfo) {
            setEditClub(data.clubInfo);
            setSelectedClubToEditId(data.clubId);
          }
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
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          if (data.ok) {
            setRole(data.role);
            setRoleTitle(data.roleTitle);
            if (data.role === 'SUPER_ADMIN' && data.fullDb) {
              const db = data.fullDb;
              setProducts(db.products || []);
              setOrders(db.orders || []);
              setMapSpots(db.mapSpots || {});
              setClubs(db.clubs || []);
              setDepartments(db.departments || {});
              setClubApplications(db.clubApplications || []);
              setArticles(db.articles || []);
              setAlumni(db.alumni || []);
              setMerchants(db.merchants || []);
              setBloodDonors(db.bloodDonors || []);
              setMarathons(db.marathons || []);
              setMarathonRegistrations(db.marathonRegistrations || []);
              setSettings(db.settings || null);
              if (RU_DEPARTMENTS.length > 0) {
                const firstD = RU_DEPARTMENTS[0];
                const customD = db.departments?.[firstD.id];
                setEditDept({
                  departmentId: firstD.id,
                  nameBn: customD?.nameBn || firstD.nameBn,
                  overviewBn: customD?.overviewBn !== undefined ? customD.overviewBn : firstD.overviewBn,
                  locationBuildingBn: customD?.locationBuildingBn !== undefined ? customD.locationBuildingBn : firstD.locationBuildingBn,
                  seatCount: customD?.seatCount !== undefined ? customD.seatCount : firstD.seatCount,
                  degreeOfferedBn: customD?.degreeOfferedBn !== undefined ? customD.degreeOfferedBn : firstD.degreeOfferedBn,
                  images: customD?.images?.length ? customD.images : (firstD.images || ['/campus/ru-admin.jpg', '/campus/paris-road-rain.jpg']),
                  teachers: customD?.teachers || [],
                });
              }
              if (db.clubs?.length > 0) {
                setEditClub(db.clubs[0]);
                setSelectedClubToEditId(db.clubs[0].id);
              }
            } else if (data.role === 'PRODUCT_MANAGER') {
              setProducts(data.products || []);
              setOrders(data.orders || []);
              setActiveTab('orders');
            } else if (data.role === 'CLUB_ADMIN') {
              setClubId(data.clubId);
              setClubApplications(data.applications || []);
              if (data.clubInfo) {
                setEditClub(data.clubInfo);
                setSelectedClubToEditId(data.clubId);
              }
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
    department: 'Rabian অফিশিয়াল',
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
      department: 'Rabian',
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

    const currentPass = getActivePass();
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
      const data = await safeParseApiResponse(res);
      if (data.ok && data.articles) {
        setArticles(data.articles);
        if (data.settings) setSettings(data.settings);
        setShowArticleModal(false);
        showToast('✓ নিউজ ও ছবি সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ru_breaking_updated'));
        }
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
      const data = await safeParseApiResponse(res);
      if (data.ok && data.articles) {
        setArticles(data.articles);
        if (data.settings) setSettings(data.settings);
        showToast('✓ নিউজ মুছে ফেলা হয়েছে');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ru_breaking_updated'));
        }
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

  const compressImageFile = async (file: File, maxWidth = 800, quality = 0.65): Promise<File> => {
    if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
      return file;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          // Scale down proportionally for both dimensions
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              // If blob is still > 120KB, compress further to 600px
              if (blob.size > 120 * 1024) {
                const c2 = document.createElement('canvas');
                const scale = Math.min(600 / width, 1);
                c2.width = Math.round(width * scale);
                c2.height = Math.round(height * scale);
                const ctx2 = c2.getContext('2d');
                if (ctx2) {
                  ctx2.imageSmoothingEnabled = true;
                  ctx2.imageSmoothingQuality = 'medium';
                  ctx2.drawImage(img, 0, 0, c2.width, c2.height);
                  c2.toBlob(
                    (b2) => {
                      if (!b2) return resolve(file);
                      const f2 = new File([b2], file.name.replace(/\.[^.]+$/, '.webp'), {
                        type: 'image/webp',
                        lastModified: Date.now(),
                      });
                      resolve(f2);
                    },
                    'image/webp',
                    0.55
                  );
                  return;
                }
              }
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'product' | 'map' | 'article' | 'department' | 'club'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      showToast('ছবি দ্রুত অপ্টিমাইজ ও আপলোড হচ্ছে...');
      const compressedFiles = await Promise.all(
        Array.from(files).map((f) => compressImageFile(f))
      );

      const formData = new FormData();
      compressedFiles.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await safeParseApiResponse(res);

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
        } else if (target === 'department') {
          setEditDept((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...data.urls],
          }));
        } else if (target === 'club') {
          setEditClub((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...data.urls],
          }));
        }
        showToast('✓ ছবি সফলভাবে অপ্টিমাইজ ও আপলোড হয়েছে!');
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

    const currentPass = getActivePass();
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
      const data = await safeParseApiResponse(res);

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
      const data = await safeParseApiResponse(res);
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
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status'], cancellationReason?: string) => {
    const currentPass = password.trim() || (typeof window !== 'undefined' ? sessionStorage.getItem('ru_admin_pass') || '' : '');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          password: currentPass,
          payload: { orderId, status: newStatus, ...(cancellationReason ? { cancellationReason } : {}) },
        }),
      });
      const data = await safeParseApiResponse(res);
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
      const data = await safeParseApiResponse(res);
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
  // CLUB APPLICATION APPROVAL / REJECTION & CLUB INFO MANAGER
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
      const data = await safeParseApiResponse(res);
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

  const handleSelectClub = (cId: string) => {
    setSelectedClubToEditId(cId);
    const found = clubs.find((c) => c.id === cId || c.id === cId.replace('club-', '') || `club-${c.id}` === cId);
    const base = RU_CLUBS.find((c) => c.id === cId || c.id === `club-${cId}` || c.id.replace('club-', '') === cId);
    setEditClub({
      id: cId,
      shortName: found?.shortName || base?.shortName || cId.toUpperCase(),
      nameBn: found?.nameBn || base?.nameBn || '',
      categoryBn: found?.categoryBn || base?.categoryBn || 'ক্লাব ও সাংস্কৃতিক সংগঠন',
      descriptionBn: found?.descriptionBn !== undefined ? found.descriptionBn : base?.descriptionBn || '',
      mottoBn: found?.mottoBn !== undefined ? found.mottoBn : base?.mottoBn || '',
      roomLocationBn: found?.roomLocationBn !== undefined ? found.roomLocationBn : base?.roomLocationBn || '',
      contactEmail: found?.contactEmail !== undefined ? found.contactEmail : base?.contactEmail || '',
      facebookUrl: found?.facebookUrl !== undefined ? found.facebookUrl : base?.facebookUrl || '',
      images: found?.images?.length ? found.images : (base?.images || [base?.coverImageUrl || '/campus/ru-spot.jpg']),
      password: found?.password || `${cId}-2026`,
    });
  };

  const handleSaveClub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_CLUB_INFO',
          password: currentPass,
          payload: { club: editClub },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.clubs) {
        setClubs(data.clubs);
        showToast('✓ ক্লাবের তথ্য ও কার্যক্রমের ছবি সফলভাবে সংরক্ষিত হয়েছে!');
      } else {
        alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
    }
  };

  // ============================================================================
  // FACULTY & DEPARTMENT MANAGER
  // ============================================================================
  const handleSelectDept = (deptId: string) => {
    setSelectedDeptId(deptId);
    const base = RU_DEPARTMENTS.find((d) => d.id === deptId);
    const custom = departments[deptId];
    setEditDept({
      departmentId: deptId,
      nameBn: custom?.nameBn || base?.nameBn || '',
      overviewBn: custom?.overviewBn !== undefined ? custom.overviewBn : base?.overviewBn || '',
      locationBuildingBn: custom?.locationBuildingBn !== undefined ? custom.locationBuildingBn : base?.locationBuildingBn || '',
      seatCount: custom?.seatCount !== undefined ? custom.seatCount : base?.seatCount || 50,
      degreeOfferedBn: custom?.degreeOfferedBn !== undefined ? custom.degreeOfferedBn : base?.degreeOfferedBn || '',
      images: custom?.images?.length ? custom.images : (base?.images || ['/campus/ru-admin.jpg', '/campus/paris-road-rain.jpg']),
      teachers: custom?.teachers || [],
    });
  };

  const handleSaveDepartment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_DEPARTMENT_INFO',
          password: currentPass,
          payload: { department: editDept },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.departments) {
        setDepartments(data.departments);
        showToast('✓ অনুষদ ও বিভাগের তথ্য এবং ছবি সফলভাবে সংরক্ষিত হয়েছে!');
      } else {
        alert(data.error || 'অনুষদের তথ্য সংরক্ষণ করা যায়নি');
      }
    } catch (err: any) {
      alert('সার্ভার সমস্যা: ' + err.message);
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
      const data = await safeParseApiResponse(res);
      if (data.ok && data.articles) {
        setArticles(data.articles);
        if (data.settings) setSettings(data.settings);
        showToast(`✓ লেখা স্ট্যাটাস আপডেট হয়েছে`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ru_breaking_updated'));
        }
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
      const data = await safeParseApiResponse(res);
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
      const data = await safeParseApiResponse(res);
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

  // Merchant Management Handlers
  const handleApproveMerchant = async (merchantId: string, status: 'active' | 'pending' | 'suspended') => {
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_APPROVE_MERCHANT',
          password: currentPass,
          payload: { merchantId, status },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.merchants) {
        setMerchants(data.merchants);
        showToast(`✓ মার্চেন্ট স্ট্যাটাস '${status === 'active' ? 'অনুমোদিত' : status}' করা হয়েছে`);
      }
    } catch (err: any) {
      alert('সমস্যা: ' + err.message);
    }
  };

  const handleDeleteMerchant = async (merchantId: string) => {
    if (!confirm('আপনি কি এই মার্চেন্ট অ্যাকাউন্টটি মুছে ফেলতে চান?')) return;
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_MERCHANT',
          password: currentPass,
          payload: { merchantId },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.merchants) {
        setMerchants(data.merchants);
        showToast('✓ মার্চেন্ট সফলভাবে মুছে ফেলা হয়েছে');
      }
    } catch (err: any) {
      alert('সমস্যা: ' + err.message);
    }
  };

  // Breaking News Image Upload Handler
  const handleUploadBreakingImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBreakingImg(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.urls?.[0]) {
        setNewBreakingImage(data.urls[0]);
        showToast('✓ ছবি সফলভাবে আপলোড হয়েছে!');
      } else {
        alert(data.error || 'ছবি আপলোড করা যায়নি');
      }
    } catch (err: any) {
      alert('আপলোড সমস্যা: ' + err.message);
    } finally {
      setUploadingBreakingImg(false);
    }
  };

  const handleAddBreakingItem = async () => {
    if (!newBreakingTitle.trim()) {
      alert('ব্রেকিং নিউজের শিরোনাম লিখুন');
      return;
    }
    const currentPass = getActivePass();
    const item: BreakingNewsItem = {
      id: `bn-custom-${Date.now()}`,
      title: newBreakingTitle.trim(),
      imageUrl: newBreakingImage.trim() || '/campus/paris-road-rain.jpg',
      link: newBreakingLink.trim() || '/inside-ru',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_BREAKING_NEWS_ITEM',
          password: currentPass,
          payload: { item },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.settings) {
        setSettings(data.settings);
        setNewBreakingTitle('');
        setNewBreakingImage('/campus/paris-road-rain.jpg');
        showToast('✓ ব্রেকিং নিউজ ব্যানারে যুক্ত হয়েছে!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ru_breaking_updated'));
        }
      }
    } catch (err: any) {
      alert('সমস্যা: ' + err.message);
    }
  };

  const handleDeleteBreakingItem = async (id: string) => {
    const currentPass = getActivePass();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_BREAKING_NEWS_ITEM',
          password: currentPass,
          payload: { id },
        }),
      });
      const data = await safeParseApiResponse(res);
      if (data.ok && data.settings) {
        setSettings(data.settings);
        showToast('✓ ব্রেকিং নিউজ মুছে ফেলা হয়েছে');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ru_breaking_updated'));
        }
      }
    } catch (err: any) {
      alert('সমস্যা: ' + err.message);
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
      const data = await safeParseApiResponse(res);
      if (data.ok) {
        if (data.settings) setSettings(data.settings);
        showToast('✓ সেটিংস ও পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ru_breaking_updated'));
        }
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
      const data = await safeParseApiResponse(res);
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
      const data = await safeParseApiResponse(res);
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
      const data = await safeParseApiResponse(res);
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
  // VIEW: SINGLE PASSWORD LOGIN SCREEN (Auto Role Detection, Mobile Ergonomic)
  // ============================================================================
  if (!role) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-20 pb-36 sm:pb-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
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
                  className="w-full pl-9 pr-4 py-3 text-base sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Mobile 1-Tap Quick Password Autofill Pills */}
            <div className="pt-1">
              <p className="text-[11px] font-bold text-slate-500 mb-1.5">মোবাইলে দ্রুত লগইনের জন্য চাপুন:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPassword('ru-admin-2026')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition"
                >
                  👑 সুপার অ্যাডমিন
                </button>
                <button
                  type="button"
                  onClick={() => setPassword('ru-shop-2026')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition"
                >
                  🛍️ শপ ম্যানেজার
                </button>
                <button
                  type="button"
                  onClick={() => setPassword('rucs-2026')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold border border-amber-200 transition"
                >
                  🏆 ক্লাব RUCS
                </button>
                <button
                  type="button"
                  onClick={() => setPassword('badhan-2026')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition"
                >
                  🩸 বাঁধন (Badhan)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 min-h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 active:scale-[0.99]"
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-36 sm:pb-20 space-y-6">
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
            <p className="text-xs text-slate-500">Rabian অফিসিয়াল কন্ট্রোল প্যানেল</p>
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
      {/* ROLE: CLUB ADMIN (Club Profile & Photo Gallery + Membership Applications) */}
      {/* ============================================================================ */}
      {role === 'CLUB_ADMIN' && (
        <div className="space-y-6">
          {/* Club Info & Photo Gallery Editing Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] tracking-wider uppercase inline-block mb-1">
                  ক্লাব প্রোফাইল ও অ্যাক্টিভিটি গ্যালারি
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {editClub.nameBn || roleTitle || 'ক্লাব তথ্য ও কার্যক্রম'}
                </h2>
                <p className="text-xs text-slate-500">
                  ক্লাবের পরিচিতি, রুমের অবস্থান, ফেসবুক পেজ লিংক ও কার্যক্রমের আকর্ষণীয় ছবি যুক্ত করুন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveClub()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Check className="w-4 h-4" /> ক্লাবের তথ্য ও ছবি সংরক্ষণ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ক্লাবের নাম (বাংলা)</label>
                <input
                  type="text"
                  value={editClub.nameBn}
                  onChange={(e) => setEditClub({ ...editClub, nameBn: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                  placeholder="যেমন: রাবি ক্যারিয়ার ক্লাব (RUCS)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">স্লোগান / মটো (Motto)</label>
                <input
                  type="text"
                  value={editClub.mottoBn || ''}
                  onChange={(e) => setEditClub({ ...editClub, mottoBn: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  placeholder="যেমন: Build Skills • Excel Career • Lead Future"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">রুম বা অফিসের অবস্থান</label>
                <input
                  type="text"
                  value={editClub.roomLocationBn || ''}
                  onChange={(e) => setEditClub({ ...editClub, roomLocationBn: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  placeholder="যেমন: কক্ষ নং-২০৪, শহীদ সুখরঞ্জন সমাদ্দার ছাত্র-শিক্ষক সাংস্কৃতিক কেন্দ্র (TSCC)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">অফিশিয়াল ইমেইল বা যোগাযোগ</label>
                <input
                  type="email"
                  value={editClub.contactEmail || ''}
                  onChange={(e) => setEditClub({ ...editClub, contactEmail: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-mono"
                  placeholder="careerclub.ru@gmail.com"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">ফেসবুক পেজ বা গ্রুপ লিংক</label>
                <input
                  type="url"
                  value={editClub.facebookUrl || ''}
                  onChange={(e) => setEditClub({ ...editClub, facebookUrl: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-mono"
                  placeholder="https://facebook.com/groups/..."
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">ক্লাবের পরিচিতি ও বিস্তারিত বিবরণ</label>
                <textarea
                  rows={4}
                  value={editClub.descriptionBn || ''}
                  onChange={(e) => setEditClub({ ...editClub, descriptionBn: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                  placeholder="ক্লাবের লক্ষ্য, নিয়মিত কার্যক্রম এবং অর্জনসমূহ সম্পর্কে লিখুন..."
                />
              </div>
            </div>

            {/* Club Photos Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    কার্যক্রম ও উৎসবের ছবিসমূহ ({editClub.images?.length || 0}টি)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    সেমিনার, ওয়ার্কশপ, বার্ষিক উৎসব বা অ্যাওয়ার্ড প্রদানের ছবি আপলোড করুন। ছবি স্বয়ংক্রিয়ভাবে কম্প্রেস হয়ে দ্রুত লোড হবে।
                  </p>
                </div>
                <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition">
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ নতুন ছবি যোগ করুন</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => handleFileUpload(e, 'club')}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                {editClub.images && editClub.images.length > 0 ? (
                  editClub.images.map((img, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={img} alt="Club" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditClub((prev) => ({
                            ...prev,
                            images: prev.images?.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full opacity-90 group-hover:opacity-100 transition shadow"
                        title="ছবি মুছুন"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 italic">এখনও কোনো ছবি আপলোড করা হয়নি। উপরের বাটন দিয়ে ছবি যোগ করুন।</p>
                )}
              </div>
            </div>
          </div>

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
                  onClick={() => {
                    setActiveTab('departments');
                    if (!editDept.nameBn && RU_DEPARTMENTS[0]) {
                      handleSelectDept(RU_DEPARTMENTS[0].id);
                    }
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'departments'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>🎓 অনুষদ ও বিভাগ</span>
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
                  onClick={() => {
                    setActiveTab('clubs');
                    if (!editClub.nameBn && RU_CLUBS[0]) {
                      handleSelectClub(RU_CLUBS[0].id);
                    }
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'clubs'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>🏆 ক্লাব ও আবেদন ({clubApplications.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('merchants')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'merchants'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>মার্চেন্ট হাব ({merchants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('blood')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'blood'
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50'
                  }`}
                >
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>🩸 রক্তদান ({bloodDonors.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('marathon')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'marathon'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>🏃‍♂️ ম্যারাথন ({marathonRegistrations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 ${
                    activeTab === 'ai'
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  <Bot className="w-4 h-4 text-indigo-500" />
                  <span>🤖 AI ও MCP স্টুডিও</span>
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
                    exportToCsv(`rabian-orders-${Date.now()}.csv`, [header, ...rows]);
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
                                order.status === 'delivered' || order.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'with_rider' || order.status === 'Out for Delivery'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : order.status === 'ready' || order.status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'cancelled' || order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status === 'intake' || order.status === 'Pending'
                                ? '১. ইনটেক'
                                : order.status === 'ready' || order.status === 'Confirmed'
                                ? '২. রেডি'
                                : order.status === 'with_rider' || order.status === 'Out for Delivery'
                                ? '৩. রাইডারের কাছে'
                                : order.status === 'delivered' || order.status === 'Delivered'
                                ? '৪. ডেলিভারড'
                                : '৫. ক্যান্সেল'}
                            </span>
                            {order.steadfastTrackingCode && (
                              <span className="block text-[9px] font-mono text-indigo-700 mt-1">
                                📦 {order.steadfastTrackingCode}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-y-1.5">
                            <select
                              value={
                                order.status === 'Pending'
                                  ? 'intake'
                                  : order.status === 'Confirmed'
                                  ? 'ready'
                                  : order.status === 'Out for Delivery'
                                  ? 'with_rider'
                                  : order.status === 'Delivered'
                                  ? 'delivered'
                                  : order.status === 'Cancelled'
                                  ? 'cancelled'
                                  : order.status
                              }
                              onChange={(e) => {
                                const nextSt = e.target.value as Order['status'];
                                let reason = '';
                                if (nextSt === 'cancelled') {
                                  reason = prompt('অর্ডার বাতিলের কারণ লিখুন (ঐচ্ছিক):') || 'অ্যাডমিন কর্তৃক বাতিল';
                                }
                                handleUpdateOrderStatus(order.orderId, nextSt, reason);
                              }}
                              className="text-[11px] font-bold border border-slate-200 rounded-lg p-1 bg-white block ml-auto"
                            >
                              <option value="intake">১. ইনটেক</option>
                              <option value="ready">২. রেডি</option>
                              <option value="with_rider">৩. রাইডারকে দিলাম</option>
                              <option value="delivered">৪. ডেলিভারড</option>
                              <option value="cancelled">৫. ক্যান্সেল</option>
                            </select>

                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const msg = `🛵 ডেলিভারি রিকোয়েস্ট! #${order.orderId}\nগ্রাহক: ${order.customerName} (${order.phone})\nঠিকানা: ${order.addressDetails}\nমোট (COD): ৳${order.totalAmount}\nআইটেম: ${order.items.map((i) => `${i.nameBn}x${i.quantity}`).join(', ')}`;
                                  navigator.clipboard.writeText(msg);
                                  if (settings?.deliveryWhatsAppGroupUrl && settings.deliveryWhatsAppGroupUrl !== 'https://chat.whatsapp.com/') {
                                    window.open(settings.deliveryWhatsAppGroupUrl, '_blank');
                                  }
                                  showToast('✅ রাইডার গ্রুপ মেসেজ কপি হয়েছে!');
                                }}
                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold"
                                title="রাইডার WhatsApp গ্রুপ মেসেজ কপি করুন"
                              >
                                🛵 রাইডার গ্রুপ
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const currentPass = password.trim() || (typeof window !== 'undefined' ? sessionStorage.getItem('ru_admin_pass') || '' : '');
                                  const res = await fetch('/api/steadfast', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'CREATE_ORDER',
                                      password: currentPass,
                                      orderId: order.orderId,
                                    }),
                                  });
                                  const d = await res.json();
                                  if (d.ok) {
                                    showToast(`✅ Steadfast বুকিং সফল! কোড: ${d.consignment?.tracking_code}`);
                                    if (d.order) {
                                      setOrders((prev) => prev.map((o) => (o.orderId === order.orderId ? d.order : o)));
                                    }
                                  } else {
                                    alert(d.error || 'Steadfast API ত্রুটি');
                                  }
                                }}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded text-[10px] font-bold"
                                title="Steadfast Courier-এ পাঠান"
                              >
                                📦 Steadfast
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
          {/* TAB: DEPARTMENT & FACULTY MANAGER (Super Admin) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'departments' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] tracking-wider uppercase inline-block mb-1">
                    অনুষদ ও বিভাগ কনফিগারেশন
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    রাজশাহী বিশ্ববিদ্যালয়ের অনুষদ ও বিভাগসমূহ ({RU_DEPARTMENTS.length}টি)
                  </h2>
                  <p className="text-xs text-slate-500">
                    যেকোনো অনুষদ বা বিভাগ নির্বাচন করে তার বিবরণ, আসন সংখ্যা, ভবন অবস্থান ও ছবিসমূহ এডিট ও আপডেট করুন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveDepartment()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Check className="w-4 h-4" /> অনুষদের তথ্য ও ছবি সংরক্ষণ করুন
                </button>
              </div>

              {/* Department Dropdown Selector */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>অনুষদ ও বিভাগ নির্বাচন করুন:</span>
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => handleSelectDept(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {RU_FACULTIES.map((fac) => {
                    const deptsInFac = RU_DEPARTMENTS.filter((d) => d.facultyBn === fac.nameBn);
                    return (
                      <optgroup key={fac.id} label={`🏛️ ${fac.nameBn}`}>
                        {deptsInFac.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nameBn} {departments[dept.id] ? '✓ (কাস্টমাইজড)' : ''}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">বিভাগের নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={editDept.nameBn}
                    onChange={(e) => setEditDept({ ...editDept, nameBn: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">আসন সংখ্যা (Seat Count)</label>
                  <input
                    type="number"
                    value={editDept.seatCount || 50}
                    onChange={(e) => setEditDept({ ...editDept, seatCount: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 font-black"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">ভবন ও অবস্থান (Location & Building)</label>
                  <input
                    type="text"
                    value={editDept.locationBuildingBn || ''}
                    onChange={(e) => setEditDept({ ...editDept, locationBuildingBn: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                    placeholder="যেমন: প্রকৌশল অনুষদ ভবন (চতুর্থ তলা)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">প্রদত্ত ডিগ্রি (Degree)</label>
                  <input
                    type="text"
                    value={editDept.degreeOfferedBn || ''}
                    onChange={(e) => setEditDept({ ...editDept, degreeOfferedBn: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5"
                    placeholder="যেমন: বি.এস-সি. ইঞ্জিনিয়ারিং (CSE)"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700">অনুষদ বা বিভাগের একাডেমিক পরিচিতি ও সংক্ষিপ্ত বিবরণ</label>
                  <textarea
                    rows={4}
                    value={editDept.overviewBn || ''}
                    onChange={(e) => setEditDept({ ...editDept, overviewBn: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-2.5 leading-relaxed"
                    placeholder="বিভাগের ল্যাব সুবিধা, সেমিনার লাইব্রেরি, পাঠ্যক্রম ও অর্জনসমূহ সম্পর্কে লিখুন..."
                  />
                </div>
              </div>

              {/* Department Photo Gallery Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900">
                      অনুষদ ও ক্লাসরুমের ছবিসমূহ ({editDept.images?.length || 0}টি)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ভবনের সামনের ছবি, কম্পিউটার/সায়েন্স ল্যাব বা ক্লাসরুমের ছবি আপলোড করুন। ওয়েবসাইট কার্ডে এবং পপআপে এগুলো গ্যালারি হিসেবে প্রদর্শিত হবে।
                    </p>
                  </div>
                  <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>+ ছবি যোগ করুন</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => handleFileUpload(e, 'department')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  {editDept.images && editDept.images.length > 0 ? (
                    editDept.images.map((img, idx) => (
                      <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={img} alt="Dept" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditDept((prev) => ({
                              ...prev,
                              images: prev.images?.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full opacity-90 group-hover:opacity-100 transition shadow"
                          title="ছবি মুছুন"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-3 italic">এখনও কোনো ছবি আপলোড করা হয়নি। উপরের বাটন দিয়ে ছবি যোগ করুন।</p>
                  )}
                </div>
              </div>

              {/* Department Faculty / Teachers Directory Editor */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-900">
                      বিভাগের সম্মানিত শিক্ষকমণ্ডলী / স্যারদের তথ্য ও নম্বর ({editDept.teachers?.length || 0} জন)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      স্যারদের নাম, পদবি, মোবাইল নম্বর, ইমেইল ও রুম নম্বর যোগ করলে ওয়েবসাইট ও AI অ্যাসিস্ট্যান্ট থেকে খুঁজে পাওয়া যাবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextTeacher: FacultyMember = {
                        id: `t-${Date.now()}`,
                        nameBn: '',
                        designationBn: 'প্রফেসর',
                        phone: '',
                        email: '',
                        roomBn: '',
                        researchAreaBn: '',
                      };
                      setEditDept((prev) => ({
                        ...prev,
                        teachers: [...(prev.teachers || []), nextTeacher],
                      }));
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ শিক্ষক / স্যার যোগ করুন</span>
                  </button>
                </div>

                {(editDept.teachers || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    এই বিভাগে এখনো কোনো স্যারের তথ্য যোগ করা হয়নি। উপরের বাটনে ক্লিক করে যোগ করুন।
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {(editDept.teachers || []).map((teacher, tIdx) => {
                      const updateTeacher = (patch: Partial<FacultyMember>) => {
                        setEditDept((prev) => ({
                          ...prev,
                          teachers: (prev.teachers || []).map((item, i) =>
                            i === tIdx ? { ...item, ...patch } : item
                          ),
                        }));
                      };
                      return (
                        <div key={teacher.id || tIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-blue-700">শিক্ষক #{tIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditDept((prev) => ({
                                  ...prev,
                                  teachers: (prev.teachers || []).filter((_, i) => i !== tIdx),
                                }))
                              }
                              className="p-1 text-red-500 hover:bg-red-100 rounded-lg"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="স্যার / ম্যাডামের নাম * (যেমন: ড. মো. ..."
                              value={teacher.nameBn}
                              onChange={(e) => updateTeacher({ nameBn: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl p-2 bg-white font-bold"
                            />
                            <input
                              type="text"
                              placeholder="পদবি (যেমন: প্রফেসর / চেয়ারম্যান)"
                              value={teacher.designationBn}
                              onChange={(e) => updateTeacher({ designationBn: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl p-2 bg-white"
                            />
                            <div className="relative">
                              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                              <input
                                type="text"
                                placeholder="মোবাইল নম্বর"
                                value={teacher.phone || ''}
                                onChange={(e) => updateTeacher({ phone: e.target.value })}
                                className="w-full text-xs border border-slate-200 rounded-xl p-2 pl-8 bg-white font-semibold"
                              />
                            </div>
                            <div className="relative">
                              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                              <input
                                type="email"
                                placeholder="ইমেইল (ru.ac.bd)"
                                value={teacher.email || ''}
                                onChange={(e) => updateTeacher({ email: e.target.value })}
                                className="w-full text-xs border border-slate-200 rounded-xl p-2 pl-8 bg-white"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="অফিস / রুম নম্বর"
                              value={teacher.roomBn || ''}
                              onChange={(e) => updateTeacher({ roomBn: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl p-2 bg-white"
                            />
                            <input
                              type="text"
                              placeholder="গবেষণার বিষয় (ঐচ্ছিক)"
                              value={teacher.researchAreaBn || ''}
                              onChange={(e) => updateTeacher({ researchAreaBn: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl p-2 bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveDepartment()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Check className="w-4 h-4" /> বিভাগ, শিক্ষক ও ছবির তথ্য সংরক্ষণ করুন
                  </button>
                </div>
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
          {/* TAB 6: ALL CLUBS & APPLICATIONS (Super Admin View) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'clubs' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Super Admin Club Management Section */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md inline-block">
                      ক্লাব তথ্য ও গ্যালারি এডিটর
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      ক্লাব নির্বাচন করে তথ্য ও ছবি আপডেট করুন:
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveClub()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> নির্বাচিত ক্লাবের তথ্য সংরক্ষণ করুন
                  </button>
                </div>

                <select
                  value={selectedClubToEditId}
                  onChange={(e) => handleSelectClub(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-xl p-2.5"
                >
                  {RU_CLUBS.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏆 {c.nameBn} ({c.shortName})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">স্লোগান / Motto</label>
                    <input
                      type="text"
                      value={editClub.mottoBn || ''}
                      onChange={(e) => setEditClub({ ...editClub, mottoBn: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white"
                      placeholder="স্লোগান লিখুন"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">রুম বা অফিসের অবস্থান</label>
                    <input
                      type="text"
                      value={editClub.roomLocationBn || ''}
                      onChange={(e) => setEditClub({ ...editClub, roomLocationBn: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white"
                      placeholder="যেমন: কক্ষ নং-২০৪, TSCC"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">অফিশিয়াল ইমেইল</label>
                    <input
                      type="email"
                      value={editClub.contactEmail || ''}
                      onChange={(e) => setEditClub({ ...editClub, contactEmail: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white font-mono"
                      placeholder="club@gmail.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">ফেসবুক লিংক</label>
                    <input
                      type="url"
                      value={editClub.facebookUrl || ''}
                      onChange={(e) => setEditClub({ ...editClub, facebookUrl: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white font-mono"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">ক্লাবের পরিচিতি ও বর্ণনা</label>
                    <textarea
                      rows={3}
                      value={editClub.descriptionBn || ''}
                      onChange={(e) => setEditClub({ ...editClub, descriptionBn: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                {/* Club Photos */}
                <div className="pt-2 border-t border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      কার্যক্রম ও ইভেন্টের ছবিসমূহ ({editClub.images?.length || 0}টি):
                    </label>
                    <label className="cursor-pointer px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>+ ছবি আপলোড</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={(e) => handleFileUpload(e, 'club')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editClub.images && editClub.images.length > 0 ? (
                      editClub.images.map((img, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={img} alt="Club" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setEditClub((prev) => ({
                                ...prev,
                                images: prev.images?.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-80 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">কোনো ছবি নেই</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Club Applications Table */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
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
          </div>
        )}

          {/* ============================================================================ */}
          {/* TAB: MERCHANTS HUB & MULTI-VENDOR MANAGEMENT (Super Admin) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'merchants' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                      মাল্টি-ভেন্ডর সিস্টেম
                    </span>
                    <span className="text-xs text-slate-500">• ০% প্ল্যাটফর্ম ফি (১০০% টাকা মার্চেন্টের)</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    মার্চেন্ট তালিকা ও অনুমোদন হাব ({merchants.length}টি দোকান)
                  </h2>
                  <p className="text-xs text-slate-500">
                    রাবি শপে যুক্ত মার্চেন্টদের অনুমোদন, পণ্য ও পিক্সেল স্ট্যাটাস নিয়ন্ত্রণ করুন
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = typeof window !== 'undefined' ? `${window.location.origin}/merchant` : 'https://rabian.site/merchant';
                      const htmlLauncher = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>RU Merchant Hub App</title><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#064e3b;color:#fff;"><h2>RU Merchant Hub লোড হচ্ছে...</h2><p>অটোমেটিক চালু না হলে <a href="${targetUrl}" style="color:#fbbf24;">এখানে ক্লিক করুন</a>।</p><script>window.location.replace("${targetUrl}");</script></body></html>`;
                      const blob = new Blob([htmlLauncher], { type: 'text/html;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'RU-Merchant-Dashboard-App.html';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      showToast('✅ স্বতন্ত্র মার্চেন্ট ড্যাশবোর্ড লঞ্চার (.html) ডাউনলোড হয়েছে!');
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>মার্চেন্ট অ্যাপ ডাউনলোড (.html)</span>
                  </button>

                  <Link
                    href="/merchant"
                    target="_blank"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <Store className="w-4 h-4 text-amber-300" />
                    <span>মার্চেন্ট পোর্টাল ওপেন করুন ↗</span>
                  </Link>
                </div>
              </div>

              {merchants.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl">
                  কোনো মার্চেন্ট অ্যাকাউন্ট পাওয়া যায়নি।
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {merchants.map((m) => {
                    const merchantProds = products.filter((p) => p.merchantId === m.id);
                    return (
                      <div key={m.id} className="py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-extrabold text-slate-900">{m.shopName}</h3>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  m.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : m.status === 'suspended'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {m.status === 'active' ? 'সক্রিয় (Active)' : m.status === 'suspended' ? 'স্থগিত' : 'অপেক্ষমান'}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                                {m.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              মালিক: <span className="font-bold">{m.ownerName}</span> • মোবাইল: <span className="font-bold">{m.phone}</span> • পাসওয়ার্ড: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-700 font-bold">{m.password || 'N/A'}</code>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              পেআউট: {m.payoutMethod?.toUpperCase()} ({m.payoutPhone || m.phone}) • মেটা পিক্সেল: {m.facebookPixelId || 'নেই'} • মোট পণ্য: {merchantProds.length}টি • মোট বিক্রি: ৳{m.totalSales || 0}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleApproveMerchant(m.id, m.status === 'active' ? 'suspended' : 'active')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                m.status === 'active'
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {m.status === 'active' ? 'স্থগিত করুন' : 'অনুমোদন দিন'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMerchant(m.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition border border-red-200"
                              title="মার্চেন্ট মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================================ */}
          {/* TAB 6.5: BLOOD BANK DONOR MANAGER (Super Admin) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'blood' && (
            <AdminBloodTab
              bloodDonors={bloodDonors}
              password={getActivePass()}
              safeParseApiResponse={safeParseApiResponse}
              onUpdated={(donors) => setBloodDonors(donors)}
              showToast={showToast}
            />
          )}

          {/* ============================================================================ */}
          {/* TAB 6.6: MONTHLY CAMPUS MARATHON MANAGER (Super Admin) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'marathon' && (
            <AdminMarathonTab
              marathons={marathons}
              registrations={marathonRegistrations}
              password={getActivePass()}
              safeParseApiResponse={safeParseApiResponse}
              onMarathonsUpdated={(updated) => setMarathons(updated)}
              onRegistrationsUpdated={(updated) => setMarathonRegistrations(updated)}
              showToast={showToast}
            />
          )}

          {/* ============================================================================ */}
          {/* TAB 6.8: AI AGENT (3-SLOT FAILOVER) & MCP STUDIO (Super Admin) */}
          {/* ============================================================================ */}
          {role === 'SUPER_ADMIN' && activeTab === 'ai' && (
            <AdminAiStudioTab
              initialAiConfig={settings?.aiConfig}
              password={getActivePass()}
              safeParseApiResponse={safeParseApiResponse}
              onSaved={(aiConfig) =>
                setSettings((prev) => (prev ? { ...prev, aiConfig } : prev))
              }
              showToast={showToast}
            />
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
                        <p className="font-bold text-[11px] text-amber-900">
                          💡 Supabase ড্যাশবোর্ডে গিয়ে SQL Editor-এ নিচের সম্পূর্ণ স্ক্রিপ্টটি ১-ক্লিকে রান করুন:
                        </p>
                        <div className="relative bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                          <pre>{`-- ১. রিয়েল-টাইম ক্লাউড সিঙ্ক টেবিল তৈরি
CREATE TABLE IF NOT EXISTS public.app_state (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON public.app_state;
CREATE POLICY "Allow anon all" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

-- ২. ছবির জন্য পাবলিক স্টোরেজ বাকেট তৈরি
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Allow public read uploads" ON storage.objects;
CREATE POLICY "Allow public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');`}</pre>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`-- ১. রিয়েল-টাইম ক্লাউড সিঙ্ক টেবিল তৈরি
CREATE TABLE IF NOT EXISTS public.app_state (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON public.app_state;
CREATE POLICY "Allow anon all" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

-- ২. ছবির জন্য পাবলিক স্টোরেজ বাকেট তৈরি
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Allow public read uploads" ON storage.objects;
CREATE POLICY "Allow public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');`);
                              showToast('✓ সম্পূর্ণ SQL কোড ক্লিপবোর্ডে কপি হয়েছে!');
                            }}
                            className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm transition active:scale-95"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>১-ক্লিকে কপি করুন</span>
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

                {/* Upgraded Rich Breaking News Banner Manager */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                      <span>ব্রেকিং নিউজ ব্যানার ও লাইভ ছবি কন্ট্রোল (Breaking News Studio)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      ওয়েবসাইটের শীর্ষে থাকা লাল ব্রেকিং নিউজ ব্যানারে ছবি সহ তাজা খবর প্রকাশ ও নিয়ন্ত্রণ করুন
                    </p>
                  </div>

                  {/* Add New Breaking News Form */}
                  <div className="bg-red-50/70 p-4 sm:p-5 rounded-2xl border border-red-200/80 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md inline-block">
                      + নতুন ব্রেকিং নিউজ প্রকাশ করুন
                    </span>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">শিরোনাম (Title) *</label>
                      <input
                        type="text"
                        placeholder="যেমন: রাবি ক্যাম্পাসে অফিশিয়াল উইন্টার হুডির প্রি-অর্ডার শুরু..."
                        value={newBreakingTitle}
                        onChange={(e) => setNewBreakingTitle(e.target.value)}
                        className="w-full text-xs sm:text-sm p-3 border border-red-200 rounded-xl font-bold bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>ব্যানার ছবি (Picture)</span>
                          {uploadingBreakingImg && <span className="text-red-600 text-[10px] animate-pulse">আপলোড হচ্ছে...</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer bg-white border border-red-300 hover:bg-red-100 text-red-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>ছবি আপলোড</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadBreakingImage}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="বা ছবির লিংক পেস্ট করুন"
                            value={newBreakingImage}
                            onChange={(e) => setNewBreakingImage(e.target.value)}
                            className="flex-1 text-xs p-2 border border-red-200 rounded-xl font-medium bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">ক্লিক লিংক (Link URL)</label>
                        <input
                          type="text"
                          placeholder="/inside-ru বা /shop"
                          value={newBreakingLink}
                          onChange={(e) => setNewBreakingLink(e.target.value)}
                          className="w-full text-xs p-2 border border-red-200 rounded-xl font-medium bg-white"
                        />
                      </div>
                    </div>

                    {/* Preview of Breaking Banner */}
                    {newBreakingTitle && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center gap-2 shadow-sm">
                        <span className="bg-white text-red-700 font-black text-[10px] px-2 py-0.5 rounded shadow">
                          ব্রেকিং নিউজ প্রিভিউ
                        </span>
                        {newBreakingImage && (
                          <img src={newBreakingImage} alt="Preview" className="w-9 h-6 object-cover rounded border border-white/50" />
                        )}
                        <p className="text-xs font-bold truncate flex-1">{newBreakingTitle}</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddBreakingItem}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      <span>ব্রেকিং নিউজ প্রকাশ করুন</span>
                    </button>
                  </div>

                  {/* List of Active Rich Breaking News Items */}
                  {(settings.breakingNewsItems || []).length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        বর্তমান সক্রিয় ব্রেকিং নিউজসমূহ ({(settings.breakingNewsItems || []).length}টি):
                      </h5>
                      <div className="space-y-2">
                        {(settings.breakingNewsItems || []).map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt="News"
                                  className="w-12 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              )}
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                                <p className="text-[10px] text-slate-400 truncate">লিংক: {item.link || '/inside-ru'}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteBreakingItem(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition border border-red-200 shrink-0"
                              title="ব্রেকিং নিউজ মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Backward-compatible Text Headlines */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">অতিরিক্ত টেক্সট হেডলাইনসমূহ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentNews = settings.breakingNews || [];
                          setSettings({
                            ...settings,
                            breakingNews: [...currentNews, '🔥 নতুন হেডলাইন লিখুন...'],
                          });
                        }}
                        className="text-[11px] text-blue-700 font-bold hover:underline"
                      >
                        + টেক্সট যোগ করুন
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
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logistics & Steadfast Courier & Delivery Rider WhatsApp Group */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>🛵 ডেলিভারি রাইডার WhatsApp গ্রুপ ও Steadfast Courier API সেটিংস</span>
                  </h4>

                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <label className="text-xs font-bold text-emerald-950 block">
                      অফিশিয়াল ডেলিভারি রাইডার WhatsApp গ্রুপ লিংক (সব মার্চেন্ট ও অ্যাডমিনের জন্য):
                    </label>
                    <input
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={settings.deliveryWhatsAppGroupUrl || ''}
                      onChange={(e) => setSettings({ ...settings, deliveryWhatsAppGroupUrl: e.target.value })}
                      className="w-full text-xs sm:text-sm border border-emerald-200 rounded-xl p-2.5 bg-white font-semibold"
                    />
                    <p className="text-[11px] text-emerald-800">
                      এই গ্রুপে সমস্ত রাইডাররা যুক্ত থাকবে — অর্ডার রেডি হলে মার্চেন্ট এখানে পোস্ট করলে আগ্রহী রাইডার ডেলিভারি করবে।
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                    <label className="text-xs font-bold text-blue-950 block">
                      কেন্দ্রীয় Meta / Facebook Pixel ID (সকল স্টোরফ্রন্ট পেজে ফায়ার হবে):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: 987654321098765"
                      value={settings.defaultFacebookPixelId || ''}
                      onChange={(e) => setSettings({ ...settings, defaultFacebookPixelId: e.target.value })}
                      className="w-full text-xs sm:text-sm border border-blue-200 rounded-xl p-2.5 bg-white font-mono font-bold"
                    />
                    <p className="text-[11px] text-blue-800">
                      এখানে পিক্সেল আইডি বসালে ওয়েবসাইটের প্রতিটি ভিজিট (PageView), ViewContent, AddToCart, InitiateCheckout এবং Purchase ইভেন্ট স্বয়ংক্রিয়ভাবে ট্র্যাক হবে (এবং প্রতিটি মার্চেন্টের নিজস্ব পিক্সেলও পাশাপাশি ফায়ার হবে)।
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-black text-indigo-950">কেন্দ্রীয় Steadfast Courier API Credentials (portal.packzy.com):</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Steadfast Api-Key</label>
                        <input
                          type="text"
                          placeholder="Central Api-Key"
                          value={settings.steadfastApiKey || ''}
                          onChange={(e) => setSettings({ ...settings, steadfastApiKey: e.target.value })}
                          className="w-full text-xs border border-indigo-200 rounded-xl p-2.5 bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Steadfast Secret-Key</label>
                        <input
                          type="password"
                          placeholder="Central Secret-Key"
                          value={settings.steadfastSecretKey || ''}
                          onChange={(e) => setSettings({ ...settings, steadfastSecretKey: e.target.value })}
                          className="w-full text-xs border border-indigo-200 rounded-xl p-2.5 bg-white font-mono"
                        />
                      </div>
                    </div>
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

              {/* Live Breaking News Preview in Modal */}
              {(editArticle.isBreaking || editArticle.category === 'ব্রেকিং নিউজ') && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1.5">
                  <p className="text-[11px] font-black text-red-700 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-red-600" />
                    <span>ব্রেকিং নিউজ ব্যানার প্রিভিউ (ওয়েবসাইটের শীর্ষে দেখাবে):</span>
                  </p>
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center gap-2.5 shadow-xs">
                    <span className="bg-white text-red-700 font-black text-[10px] px-2 py-0.5 rounded shadow">
                      ব্রেকিং নিউজ
                    </span>
                    {editArticle.images?.[0] && (
                      <img
                        src={editArticle.images[0]}
                        alt="Thumb"
                        className="w-10 h-7 object-cover rounded border border-white/50"
                      />
                    )}
                    <p className="text-xs font-bold truncate flex-1">{editArticle.title || 'শিরোনাম লিখুন...'}</p>
                  </div>
                </div>
              )}

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
