'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  Download,
  Share2,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Eye,
  Smartphone,
  Facebook,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  LogOut,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product, Order, Merchant } from '@/types';

export default function MerchantPortalPage() {
  // Auth state
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    category: 'পোশাক ও ফ্যাশন',
    address: 'রাবি ক্যাম্পাস, মতিহার, রাজশাহী',
    payoutPhone: '',
    payoutMethod: 'bkash' as 'bkash' | 'nagad' | 'bank',
    facebookPixelId: '',
  });

  // Dashboard Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'marketing' | 'download'>('overview');
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedPixel, setCopiedPixel] = useState(false);

  // Product Add / Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Product Form State
  const [prodForm, setProdForm] = useState({
    nameBn: '',
    category: 'হুডি ও শীতকালীন পোশাক',
    productType: 'apparel' as 'apparel' | 'food_weight' | 'standard',
    price: 450,
    images: [] as string[],
    shortSummary: '',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    customImageUrl: '',
  });

  // PWA Install prompt state
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Listen for beforeinstallprompt event for PWA
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Restore merchant session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ru_merchant_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          setMerchant(parsed);
          loadMerchantData(parsed.id);
        }
      }
    } catch {}
  }, []);

  // Load merchant's specific products and orders from server
  const loadMerchantData = async (merchantId: string) => {
    try {
      const res = await fetch('/api/store');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products.filter((p: Product) => p.merchantId === merchantId));
      }
      // Note: Orders contain merchant items
      if (data.orders) {
        setOrders(data.orders.filter((o: Order) => (o.items || []).some((it) => it.merchantId === merchantId)));
      }
    } catch (err) {
      console.error('Failed to load merchant data', err);
    }
  };

  // 1. Direct Merchant Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MERCHANT_LOGIN',
          payload: {
            identifier: loginIdentifier,
            password: loginPassword,
          },
        }),
      });
      const data = await res.json();

      if (data.ok && data.merchant) {
        setMerchant(data.merchant);
        setProducts(data.products || []);
        setOrders(data.orders || []);
        localStorage.setItem('ru_merchant_session', JSON.stringify(data.merchant));
      } else {
        setAuthError(data.error || 'লগইন ব্যর্থ হয়েছে! মোবাইল নম্বর ও পাসওয়ার্ড যাচাই করুন।');
      }
    } catch {
      setAuthError('সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Merchant Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MERCHANT_REGISTER',
          payload: regForm,
        }),
      });
      const data = await res.json();

      if (data.ok && data.merchant) {
        setMerchant(data.merchant);
        setProducts([]);
        setOrders([]);
        localStorage.setItem('ru_merchant_session', JSON.stringify(data.merchant));
      } else {
        setAuthError(data.error || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি। সব তথ্য সঠিকভাবে পূরণ করুন।');
      }
    } catch {
      setAuthError('সার্ভার এরর! ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Logout
  const handleLogout = () => {
    setMerchant(null);
    setProducts([]);
    setOrders([]);
    localStorage.removeItem('ru_merchant_session');
  };

  // 4. Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.urls?.length) {
        setProdForm((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
      } else {
        alert(data.error || 'ছবি আপলোড ব্যর্থ হয়েছে');
      }
    } catch {
      alert('ছবি আপলোড করা যায়নি');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 5. Save Product Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    if (!prodForm.nameBn.trim()) {
      alert('পণ্যের নাম বাংলায় লিখুন');
      return;
    }

    const finalImages =
      prodForm.images.length > 0
        ? prodForm.images
        : prodForm.customImageUrl
        ? [prodForm.customImageUrl]
        : ['/mockups/hoodie-front.jpg'];

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : `prod-m-${Date.now()}`,
      nameBn: prodForm.nameBn.trim(),
      category: prodForm.category,
      productType: prodForm.productType,
      price: Number(prodForm.price) || 0,
      images: finalImages,
      shortSummary: prodForm.shortSummary.trim() || `${merchant.shopName} এর প্রিমিয়াম পণ্য।`,
      detailSections: [
        {
          id: 'desc',
          title: 'পণ্যের বিবরণ ও বৈশিষ্ট্য',
          content: prodForm.shortSummary.trim() || 'উচ্চমানের প্রস্তুতকৃত পণ্য। শতভাগ নির্ভেজাল কোয়ালিটি নিশ্চিত।',
        },
        {
          id: 'merchant-info',
          title: 'মার্চেন্ট ও বিক্রেতার তথ্য',
          content: `বিক্রেতা: ${merchant.shopName} (${merchant.ownerName})। মোবাইল: ${merchant.phone}। ঠিকানা: ${merchant.address || 'রাবি ক্যাম্পাস'}।`,
        },
      ],
      sizes: prodForm.productType === 'apparel' ? prodForm.sizes : undefined,
      inStock: prodForm.inStock,
      featured: false,
      merchantId: merchant.id,
      merchantName: merchant.shopName,
      facebookPixelId: merchant.facebookPixelId,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_PRODUCT',
          password: merchant.password,
          payload: { product: newProd },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        resetProdForm();
        loadMerchantData(merchant.id);
        alert('পণ্যটি সফলভাবে শপে যুক্ত ও আপডেট হয়েছে!');
      } else {
        alert(data.error || 'পণ্য সংরক্ষণ করা সম্ভব হয়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    }
  };

  // 6. Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!merchant || !confirm('আপনি কি নিশ্চিত যে পণ্যটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_PRODUCT',
          password: merchant.password,
          payload: { productId },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        alert('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
      } else {
        alert(data.error || 'পণ্য মোছা সম্ভব হয়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    }
  };

  // 7. Update Facebook Pixel ID
  const handleUpdatePixel = async (pixelId: string) => {
    if (!merchant) return;

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MERCHANT_UPDATE_PROFILE',
          password: merchant.password,
          payload: {
            merchantId: merchant.id,
            updates: { facebookPixelId: pixelId.trim() },
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.merchant) {
        setMerchant(data.merchant);
        localStorage.setItem('ru_merchant_session', JSON.stringify(data.merchant));
        alert('Facebook Pixel ID সফলভাবে সংরক্ষিত হয়েছে!');
      }
    } catch {
      alert('Pixel ID আপডেট করা যায়নি');
    }
  };

  // 8. Download Sales & Inventory Report (CSV Export)
  const downloadReportCsv = () => {
    if (!merchant) return;

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Items', 'Quantity', 'Amount (BDT)', 'Status'];
    const rows = orders.map((order) => {
      const myItems = (order.items || []).filter((it) => it.merchantId === merchant.id);
      const itemsList = myItems.map((it) => `${it.nameBn} (${it.selectedOption})`).join('; ');
      const totalQty = myItems.reduce((acc, it) => acc + it.quantity, 0);
      const myAmount = myItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

      return [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString('bn-BD'),
        `"${order.customerName}"`,
        order.phone,
        `"${itemsList}"`,
        totalQty,
        myAmount,
        order.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RU-Merchant-${merchant.shopName.replace(/\s+/g, '_')}-Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 9. Trigger Standalone App Install Prompt
  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      alert(
        'অ্যাপটি আপনার ডিভাইসে ইনস্টল করতে ব্রাউজারের থ্রি-ডট মেন্যু (⋮) থেকে "Add to Home screen" বা "Install App" অপশনে ট্যাপ করুন।'
      );
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    resetProdForm();
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      nameBn: prod.nameBn,
      category: prod.category,
      productType: prod.productType,
      price: prod.price,
      images: prod.images || [],
      shortSummary: prod.shortSummary || '',
      inStock: prod.inStock,
      sizes: prod.sizes || ['M', 'L', 'XL', 'XXL'],
      customImageUrl: '',
    });
    setShowProductModal(true);
  };

  const resetProdForm = () => {
    setProdForm({
      nameBn: '',
      category: 'হুডি ও শীতকালীন পোশাক',
      productType: 'apparel',
      price: 450,
      images: [],
      shortSummary: '',
      inStock: true,
      sizes: ['M', 'L', 'XL', 'XXL'],
      customImageUrl: '',
    });
  };

  // Calculations
  const totalMerchantSales = orders.reduce((sum, order) => {
    const myItems = (order.items || []).filter((it) => it.merchantId === merchant?.id);
    return sum + myItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner Navigation */}
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition shadow-sm"
              title="ওয়েবসাইট হোমপেজ"
            >
              <Store className="w-5 h-5 text-amber-300" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                  RU INSIDERS ভেন্ডর হাব
                </span>
                <span className="text-xs text-emerald-200 hidden sm:inline">• মাল্টি-ভেন্ডর সেলার ড্যাশবোর্ড</span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>মার্চেন্ট স্টুডিও</span>
                {merchant && <span className="text-amber-300 font-bold text-xs sm:text-sm">({merchant.shopName})</span>}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {merchant ? (
              <>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                  title="মার্চেন্ট অ্যাপ ইনস্টল করুন"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span className="hidden md:inline">মার্চেন্ট অ্যাপ ডাউনলোড</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-red-500/80 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-white/20 transition"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">লগআউট</span>
                </button>
              </>
            ) : (
              <Link
                href="/admin"
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>অ্যাডমিন পোর্টাল</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* ========================================================================= */}
        {/* 1. NOT LOGGED IN: LOGIN OR REGISTER VIEW */}
        {/* ========================================================================= */}
        {!merchant ? (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-inner">
                <Store className="w-8 h-8 text-emerald-700" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                রাবি ক্যাম্পাসে নিজের পণ্য বিক্রি শুরু করুন
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                উদ্যোক্তা, শিক্ষার্থী বা স্থানীয় কারিগর—আপনার হুডি, টি-শার্ট, খাঁটি খেজুরের গুড় কিংবা খাবার সরাসরি রাবি শিক্ষার্থীদের কাছে পৌঁছে দিন।
              </p>

              {/* Mode Toggle Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-2xl max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                    authMode === 'login' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  মার্চেন্ট লগইন
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                    authMode === 'register' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  নতুন মার্চেন্ট রেজিস্ট্রেশন
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* A. Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর অথবা ইমেইল</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 01711223344 বা email@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">গোপন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    required
                    placeholder="আপনার মার্চেন্ট পাসওয়ার্ড"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                  <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                </button>

                {/* Demo Quick Fill */}
                <div className="pt-4 border-t border-slate-100 space-y-2 text-center">
                  <p className="text-[11px] font-bold text-slate-400">টেস্টিং ডেমো অ্যাকাউন্ট:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('01711223344');
                        setLoginPassword('merchant-2026');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                    >
                      🛍️ মতিহার ক্রাফটস (অটো-ফিল)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('01822334455');
                        setLoginPassword('merchant-2026');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                    >
                      🍯 বরেন্দ্র খাঁটি গুড় (অটো-ফিল)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* B. Registration Form */
              <form onSubmit={handleRegister} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">দোকান / ব্র্যান্ডের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মতিহার ফ্যাশন"
                      value={regForm.shopName}
                      onChange={(e) => setRegForm({ ...regForm, shopName: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">মালিক / স্বত্বাধিকারীর নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="আপনার পূর্ণ নাম"
                      value={regForm.ownerName}
                      onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর (লগইন আইডি) *</label>
                    <input
                      type="text"
                      required
                      placeholder="017XXXXXXXX"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">গোপন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      placeholder="কমপক্ষে ৬ সংখ্যার পাসওয়ার্ড"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">পণ্যের ধরণ / ক্যাটাগরি</label>
                    <select
                      value={regForm.category}
                      onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold bg-white"
                    >
                      <option value="পোশাক ও ফ্যাশন">পোশাক ও ফ্যাশন (হুডি, টি-শার্ট)</option>
                      <option value="ঐতিহ্যবাহী খাবার ও গুড়">ঐতিহ্যবাহী খাবার ও গুড়</option>
                      <option value="বই ও স্টেশনারি">বই ও স্টেশনারি</option>
                      <option value="ক্যাম্পাস গিফট ও স্যুভেনির">ক্যাম্পাস গিফট ও স্যুভেনির</option>
                      <option value="ইলেকট্রনিক্স ও গ্যাজেট">ইলেকট্রনিক্স ও গ্যাজেট</option>
                      <option value="অন্যান্য পণ্য">অন্যান্য পণ্য</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">টাকা তোলার মাধ্যম (Payout)</label>
                    <div className="flex gap-2">
                      <select
                        value={regForm.payoutMethod}
                        onChange={(e) => setRegForm({ ...regForm, payoutMethod: e.target.value as any })}
                        className="text-xs p-3 border border-slate-200 rounded-2xl font-bold bg-white"
                      >
                        <option value="bkash">বিকাশ</option>
                        <option value="nagad">নগদ</option>
                        <option value="bank">ব্যাংক</option>
                      </select>
                      <input
                        type="text"
                        placeholder="পেমেন্ট রিসিভ নাম্বার"
                        value={regForm.payoutPhone}
                        onChange={(e) => setRegForm({ ...regForm, payoutPhone: e.target.value })}
                        className="flex-1 text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Facebook Pixel ID (যদি থাকে - পরবর্তীতেও দেয়া যাবে)</label>
                  <input
                    type="text"
                    placeholder="যেমন: 123456789012345 (বিজ্ঞাপন ট্র্যাকিং এর জন্য)"
                    value={regForm.facebookPixelId}
                    onChange={(e) => setRegForm({ ...regForm, facebookPixelId: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>মার্চেন্ট অ্যাকাউন্ট তৈরি করুন</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. LOGGED IN: MERCHANT DASHBOARD */
          /* ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Merchant Top Header Card */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      ভেরিফাইড মার্চেন্ট
                    </span>
                    <span className="text-xs text-emerald-200/80">• ০% প্ল্যাটফর্ম ফি (১০০% টাকা মার্চেন্টের)</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {merchant.shopName}
                  </h2>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>স্বত্বাধিকারী: {merchant.ownerName}</span>
                    <span>•</span>
                    <span>ফোন: {merchant.phone}</span>
                    <span>•</span>
                    <span>পেমেন্ট: {(merchant.payoutMethod || 'bkash').toUpperCase()} ({merchant.payoutPhone || merchant.phone})</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg cursor-pointer transition transform active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>নতুন পণ্য যোগ করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadReportCsv}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <Download className="w-4 h-4 text-emerald-300" />
                    <span>রিপোর্ট ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>মোট পণ্য</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{products.length}টি</p>
                <p className="text-[11px] text-emerald-600 font-bold">শপে প্রদর্শিত হচ্ছে</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>মোট অর্ডার</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{orders.length}টি</p>
                <p className="text-[11px] text-slate-500 font-bold">আপনার পণ্যের অর্ডার</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>মোট বিক্রয় মূল্য</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700">৳{totalMerchantSales.toLocaleString('bn-BD')}</p>
                <p className="text-[11px] text-emerald-600 font-bold">১০০% ক্যাশ অন ডেলিভারি</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Meta Pixel স্ট্যাটাস</span>
                  <Facebook className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {merchant.facebookPixelId ? 'সক্রিয় (Active)' : 'যুক্ত করা হয়নি'}
                </p>
                <p className="text-[11px] text-blue-600 font-bold">
                  {merchant.facebookPixelId ? `ID: ${merchant.facebookPixelId}` : 'মার্কেটিং সেটআপ করুন'}
                </p>
              </div>
            </div>

            {/* Dashboard Tabs Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none text-xs sm:text-sm font-extrabold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>ওভারভিউ ও পণ্যসমূহ ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>গ্রাহকদের অর্ডার ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('marketing')}
                className={`py-2 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 ${
                  activeTab === 'marketing'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Facebook className="w-4 h-4 text-blue-500" />
                <span>ফেসবুক মার্কেটিং ও পিক্সেল</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('download')}
                className={`py-2 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 ${
                  activeTab === 'download'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>মার্চেন্ট অ্যাপ ও ডেটা ডাউনলোড</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: OVERVIEW & PRODUCTS LIST */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">
                    আপনার তালিকাভুক্ত পণ্যসমূহ ({products.length}টি)
                  </h3>
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন পণ্য যোগ করুন</span>
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">এখনও কোনো পণ্য যোগ করা হয়নি</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      আপনার প্রথম পণ্যটি যোগ করে রাবি শপে বিক্রি শুরু করতে উপরের বাটনে ক্লিক করুন।
                    </p>
                    <button
                      type="button"
                      onClick={openAddProductModal}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition"
                    >
                      পণ্য যোগ করুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                            <img
                              src={prod.images[0] || '/mockups/hoodie-front.jpg'}
                              alt={prod.nameBn}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                              {prod.category}
                            </span>
                            <span
                              className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-md ${
                                prod.inStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                              }`}
                            >
                              {prod.inStock ? 'স্টকে আছে' : 'স্টক শেষ'}
                            </span>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <h4 className="text-sm font-black text-slate-900 line-clamp-1">{prod.nameBn}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{prod.shortSummary}</p>
                            <p className="text-base font-black text-emerald-700 pt-1">৳{prod.price}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Link
                            href={`/shop`}
                            target="_blank"
                            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            title="শপে দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>শপে দেখুন</span>
                          </Link>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(prod)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                              title="পণ্য মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: ORDERS MANAGEMENT */}
            {/* ========================================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">
                    আপনার পণ্যের জন্য আসা অর্ডারসমূহ ({orders.length}টি)
                  </h3>
                  <button
                    type="button"
                    onClick={downloadReportCsv}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV ডাউনলোড</span>
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400">গ্রাহকরা আপনার পণ্য অর্ডার করলেই এখানে বিস্তারিত প্রদর্শিত হবে।</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => {
                      const myItems = (ord.items || []).filter((it) => it.merchantId === merchant.id);
                      const mySubtotal = myItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

                      return (
                        <div
                          key={ord.orderId}
                          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900">{ord.orderId}</span>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    ord.status === 'Delivered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.status === 'Confirmed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {new Date(ord.createdAt).toLocaleString('bn-BD')} • গ্রাহক: {ord.customerName} ({ord.phone})
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/88${ord.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `আসসালামু আলাইকুম ${ord.customerName}! RU Insiders এর ${merchant.shopName} থেকে আপনার অর্ডার #${ord.orderId} নিশ্চিত করার জন্য যোগাযোগ করছি।`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp মেসেজ</span>
                              </a>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2">
                            {myItems.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-800">
                                <div className="flex items-center gap-2">
                                  <img src={item.image} alt="Item" className="w-8 h-8 rounded-lg object-cover" />
                                  <span>
                                    {item.nameBn} ({item.selectedOption}) × {item.quantity}
                                  </span>
                                </div>
                                <span>৳{item.unitPrice * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">ডেলিভারি ঠিকানা: {ord.addressDetails} ({ord.deliveryZone})</span>
                            <span className="font-black text-emerald-700 text-sm">আপনার মোট: ৳{mySubtotal}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: FACEBOOK MARKETING & META PIXEL */}
            {/* ========================================================================= */}
            {activeTab === 'marketing' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <Facebook className="w-4 h-4 fill-blue-600" />
                    <span>Meta Pixel & Dynamic Product Ads Integration</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    ফেসবুক বিজ্ঞাপন ও পিক্সেল ট্র্যাকিং কনফিগারেশন
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xl">
                    আপনার পণ্যের জন্য ফেসবুক বিজ্ঞাপন (Facebook Ads) চালাতে নিজস্ব Pixel ID বসান। গ্রাহকের ভিজিট, কার্টে যোগ এবং সেলস সরাসরি আপনার অ্যাডস ম্যানেজারে রিপোর্ট হবে।
                  </p>
                </div>

                {/* Pixel ID Input Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-900 block">
                    আপনার Facebook Pixel ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="যেমন: 123456789012345"
                      defaultValue={merchant.facebookPixelId || ''}
                      id="fb-pixel-input"
                      className="flex-1 text-xs sm:text-sm p-3 border border-slate-200 rounded-2xl font-bold bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = (document.getElementById('fb-pixel-input') as HTMLInputElement)?.value;
                        handleUpdatePixel(val || '');
                      }}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow transition cursor-pointer"
                    >
                      সেভ করুন
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    পিক্সেল আইডি সেভ করলে আপনার পণ্যে গ্রাহকের প্রতিটি ক্লিক ও অর্ডারে Meta Conversions ইভেন্ট ফায়ার হবে।
                  </p>
                </div>

                {/* Automated Meta Events Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-500">
                    স্বয়ংক্রিয়ভাবে ট্র্যাক হওয়া Meta ইভেন্টসমূহ:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { event: 'PageView', desc: 'গ্রাহক আপনার মার্চেন্ট পেজ বা শপে ভিজিট করলে' },
                      { event: 'ViewContent', desc: 'গ্রাহক আপনার নির্দিষ্ট পণ্যে ক্লিক করে বিবরণ দেখলে' },
                      { event: 'AddToCart', desc: 'আপনার পণ্য শপিং ব্যাগে যুক্ত করলে' },
                      { event: 'InitiateCheckout', desc: 'গ্রাহক অর্ডার ফর্ম পূরণ শুরু করলে' },
                      { event: 'Purchase', desc: 'অর্ডার সম্পন্ন হলে মোট টাকার ভ্যালু সহ' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.event}</p>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Catalog Feed URL */}
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span>Facebook Catalog & Instagram Shop ফিড লিংক:</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/api/store?merchant=${merchant.id}` : ''}
                      className="flex-1 text-xs p-2.5 bg-white border border-blue-200 rounded-xl font-mono text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(`${window.location.origin}/api/store?merchant=${merchant.id}`);
                          setCopiedFeed(true);
                          setTimeout(() => setCopiedFeed(false), 2000);
                        }
                      }}
                      className="px-3.5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      {copiedFeed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFeed ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    এই লিংকটি ফেসবুক ক্যাটালগ ম্যানেজারে ডাটা সোর্স হিসেবে বসিয়ে অটোমেটিক ডাইনামিক অ্যাডস চালাতে পারবেন।
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: APP & REPORT DOWNLOAD */}
            {/* ========================================================================= */}
            {activeTab === 'download' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span>মার্চেন্ট ড্যাশবোর্ড অ্যাপ ও ডেটা ডাউনলোড</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার সুবিধার্থে মার্চেন্ট ড্যাশবোর্ডকে স্বতন্ত্র অ্যাপ হিসেবে ইনস্টল করুন এবং প্রয়োজনীয় বিক্রয় রিপোর্ট ডাউনলোড করুন।
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Standalone PWA App Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        মার্চেন্ট মোবাইল / ডেস্কটপ অ্যাপ ইনস্টল
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        ব্রাউজারের ঝামেলা ছাড়াই ফোন বা কম্পিউটারের হোমস্ক্রিনে একটি ক্লিক করলেই আপনার মার্চেন্ট স্টুডিও ওপেন হবে।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleInstallApp}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isAppInstalled ? 'অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে' : 'মার্চেন্ট অ্যাপ ইনস্টল করুন'}</span>
                    </button>
                  </div>

                  {/* Excel / CSV Report Card */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Download className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        সেলস ও ইনভেন্টরি স্টেটমেন্ট (CSV / Excel)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        আপনার দোকানের সকল বিক্রয়, অর্ডার ও পণ্যের বিস্তারিত রেকর্ড স্প্রেডশিট বা এক্সেল ফরম্যাটে ডাউনলোড করে সংরক্ষণ করুন।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={downloadReportCsv}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>এক্সেল / CSV রিপোর্ট ডাউনলোড</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. PRODUCT ADD / EDIT MODAL */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
                </h3>
                <p className="text-xs text-slate-500">দোকান: {merchant?.shopName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">পণ্যের নাম (বাংলায়) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রিমিয়াম আরইউ ক্রেস্ট হুডি (নেভি ব্লু)"
                  value={prodForm.nameBn}
                  onChange={(e) => setProdForm({ ...prodForm, nameBn: e.target.value })}
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-2xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold bg-white"
                  >
                    <option value="হুডি ও শীতকালীন পোশাক">হুডি ও শীতকালীন পোশাক</option>
                    <option value="ড্রপ শোল্ডার ও টি-শার্ট">ড্রপ শোল্ডার ও টি-শার্ট</option>
                    <option value="স্পোর্টস জার্সি">স্পোর্টস জার্সি</option>
                    <option value="খেজুরের গুড় ও ঐতিহ্যবাহী খাবার">খেজুরের গুড় ও ঐতিহ্যবাহী খাবার</option>
                    <option value="নাড়ু ও হোমমেড ফুড">নাড়ু ও হোমমেড ফুড</option>
                    <option value="ক্যাম্পাস গিফট ও স্যুভেনির">ক্যাম্পাস গিফট ও স্যুভেনির</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Image Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>পণ্যের ছবি আপলোড</span>
                  {uploadingImage && <span className="text-emerald-600 text-[11px] animate-pulse">আপলোড হচ্ছে...</span>}
                </label>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>গ্যালারি থেকে ছবি আপলোড</span>
                  </button>
                </div>

                {/* Image Previews */}
                {prodForm.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {prodForm.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={img} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setProdForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="কাপড়ের মান, ডেলিভারি বা পণ্যের বিশেষত্ব সম্পর্কে সংক্ষেপে লিখুন..."
                  value={prodForm.shortSummary}
                  onChange={(e) => setProdForm({ ...prodForm, shortSummary: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stock-toggle"
                  checked={prodForm.inStock}
                  onChange={(e) => setProdForm({ ...prodForm, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="stock-toggle" className="text-xs font-bold text-slate-700">
                  পণ্যটি বর্তমানে স্টকে আছে (গ্রাহকরা অর্ডার করতে পারবেন)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition cursor-pointer"
                >
                  {editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
