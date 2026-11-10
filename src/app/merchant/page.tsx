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
  Truck,
  Phone,
  Send,
  Settings,
  XCircle,
  Clock,
} from 'lucide-react';
import { Product, Order, Merchant } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'overview' | 'logistics' | 'marketing' | 'download'>('orders');
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedPixel, setCopiedPixel] = useState(false);
  const [fbAdProductId, setFbAdProductId] = useState('');
  const [fbAdCampaign, setFbAdCampaign] = useState('ru_winter_sale');
  const [copiedAdLink, setCopiedAdLink] = useState(false);
  const [centralRiderGroupUrl, setCentralRiderGroupUrl] = useState<string>('https://chat.whatsapp.com/');

  // Orders Workflow & Dispatch State
  const [orderFilterStatus, setOrderFilterStatus] = useState<'intake' | 'ready' | 'with_rider' | 'delivered' | 'cancelled'>('intake');
  const [workflowViewMode, setWorkflowViewMode] = useState<'folder' | 'board'>('folder');
  const [workflowNotice, setWorkflowNotice] = useState<{ text: string; targetStage: 'intake' | 'ready' | 'with_rider' | 'delivered' | 'cancelled' } | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [riderNameInput, setRiderNameInput] = useState('');
  const [riderPhoneInput, setRiderPhoneInput] = useState('');
  const [copiedRiderMsg, setCopiedRiderMsg] = useState(false);

  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Steadfast State
  const [steadfastLoadingOrder, setSteadfastLoadingOrder] = useState<string | null>(null);
  const [steadfastBalance, setSteadfastBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [logisticsForm, setLogisticsForm] = useState({
    deliveryWhatsAppGroupUrl: '',
    steadfastApiKey: '',
    steadfastSecretKey: '',
  });

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
          setLogisticsForm({
            deliveryWhatsAppGroupUrl: parsed.deliveryWhatsAppGroupUrl || '',
            steadfastApiKey: parsed.steadfastApiKey || '',
            steadfastSecretKey: parsed.steadfastSecretKey || '',
          });
          loadMerchantData(parsed.id, parsed.phone || parsed.email, parsed.password);
        }
      } else {
        fetch('/api/store')
          .then((r) => r.json())
          .then((d) => {
            if (d.settings?.deliveryWhatsAppGroupUrl) {
              setCentralRiderGroupUrl(d.settings.deliveryWhatsAppGroupUrl);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  // Load merchant's specific products and orders from server
  const loadMerchantData = async (merchantId: string, identifier?: string, password?: string) => {
    try {
      // Load public site settings (central WhatsApp group link)
      const pubRes = await fetch('/api/store');
      const pubData = await pubRes.json();
      if (pubData.settings?.deliveryWhatsAppGroupUrl) {
        setCentralRiderGroupUrl(pubData.settings.deliveryWhatsAppGroupUrl);
      }

      if (password) {
        const loginRes = await fetch('/api/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'MERCHANT_LOGIN',
            payload: { identifier: identifier || '', password },
          }),
        });
        const data = await loginRes.json();
        if (data.ok && data.merchant) {
          setMerchant(data.merchant);
          setProducts(data.products || []);
          setOrders(data.orders || []);
          setLogisticsForm({
            deliveryWhatsAppGroupUrl: data.merchant.deliveryWhatsAppGroupUrl || '',
            steadfastApiKey: data.merchant.steadfastApiKey || '',
            steadfastSecretKey: data.merchant.steadfastSecretKey || '',
          });
          localStorage.setItem('ru_merchant_session', JSON.stringify(data.merchant));
          return;
        }
      }

      if (pubData.products) {
        setProducts(pubData.products.filter((p: Product) => p.merchantId === merchantId));
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
        setLogisticsForm({
          deliveryWhatsAppGroupUrl: data.merchant.deliveryWhatsAppGroupUrl || '',
          steadfastApiKey: data.merchant.steadfastApiKey || '',
          steadfastSecretKey: data.merchant.steadfastSecretKey || '',
        });
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
          merchantId: merchant.id,
          payload: { product: newProd },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        resetProdForm();
        loadMerchantData(merchant.id, merchant.phone, merchant.password);
        alert('পণ্যটি সফলভাবে শপে যুক্ত ও আপডেট হয়েছে!');
      } else {
        alert(data.error || 'পণ্য সংরক্ষণ করা সম্ভব হয়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    }
  };

  // Workflow Status Helper
  const normalizeStage = (status: string): 'intake' | 'ready' | 'with_rider' | 'delivered' | 'cancelled' => {
    switch (status) {
      case 'intake':
      case 'Pending':
        return 'intake';
      case 'ready':
      case 'Confirmed':
        return 'ready';
      case 'with_rider':
      case 'Out for Delivery':
        return 'with_rider';
      case 'delivered':
      case 'Delivered':
        return 'delivered';
      case 'cancelled':
      case 'Cancelled':
        return 'cancelled';
      default:
        return 'intake';
    }
  };

  // Update Order Workflow Status (1 intake -> 2 ready -> 3 with_rider -> 4 delivered -> 5 cancelled from ANY stage)
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: 'intake' | 'ready' | 'with_rider' | 'delivered' | 'cancelled',
    extra?: {
      cancellationReason?: string;
      assignedRiderName?: string;
      assignedRiderPhone?: string;
      dispatchedVia?: 'whatsapp_group' | 'steadfast' | 'manual';
      note?: string;
    }
  ) => {
    if (!merchant) return;
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          password: merchant.password,
          merchantId: merchant.id,
          payload: {
            orderId,
            status,
            ...extra,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.orders) {
        setOrders(data.orders);
        const stageLabels: Record<string, string> = {
          intake: '১. ইনটেক',
          ready: '২. রেডি হলো',
          with_rider: '৩. রাইডারকে দিলাম',
          delivered: '৪. ডেলিভারড',
          cancelled: '৫. ক্যান্সেল',
        };
        setWorkflowNotice({
          text: `অর্ডার #${orderId} সফলভাবে "${stageLabels[status]}" ধাপে স্থানান্তর হয়েছে।`,
          targetStage: status,
        });
      } else {
        alert(data.error || 'অর্ডার স্ট্যাটাস আপডেট করা যায়নি');
      }
    } catch {
      alert('সার্ভারের সাথে যোগাযোগ করা যায়নি');
    }
  };

  // Send Order to Steadfast Courier API
  const handleSendToSteadfast = async (order: Order) => {
    if (!merchant) return;
    if (!confirm(`আপনি কি অর্ডার #${order.orderId} (${order.customerName}) Steadfast Courier-এ পাঠাতে চান?`)) return;

    setSteadfastLoadingOrder(order.orderId);
    try {
      const res = await fetch('/api/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ORDER',
          password: merchant.password,
          orderId: order.orderId,
          merchantId: merchant.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`✅ Steadfast-এ সফলভাবে পাঠানো হয়েছে!\nট্র্যাকিং কোড: ${data.consignment?.tracking_code}`);
        loadMerchantData(merchant.id, merchant.phone, merchant.password);
      } else {
        alert(`❌ ব্যর্থ: ${data.error || 'Steadfast API ত্রুটি'}`);
      }
    } catch {
      alert('Steadfast API সংযোগে সমস্যা হয়েছে।');
    } finally {
      setSteadfastLoadingOrder(null);
    }
  };

  // Sync Status from Steadfast Courier
  const handleCheckSteadfastStatus = async (order: Order) => {
    if (!merchant || !order.steadfastTrackingCode) return;
    setSteadfastLoadingOrder(order.orderId);
    try {
      const res = await fetch('/api/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_STATUS',
          password: merchant.password,
          orderId: order.orderId,
          merchantId: merchant.id,
          trackingCode: order.steadfastTrackingCode,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`📦 Steadfast লাইভ স্ট্যাটাস (${order.steadfastTrackingCode}): ${data.deliveryStatus}`);
        loadMerchantData(merchant.id, merchant.phone, merchant.password);
      } else {
        alert(data.error || 'স্ট্যাটাস চেক করা যায়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    } finally {
      setSteadfastLoadingOrder(null);
    }
  };

  // Check Steadfast Balance
  const handleCheckSteadfastBalance = async () => {
    if (!merchant) return;
    setCheckingBalance(true);
    try {
      const res = await fetch('/api/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_BALANCE',
          password: merchant.password,
          merchantId: merchant.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSteadfastBalance(data.balance);
        alert(`✅ Steadfast সংযোগ সচল! বর্তমান ব্যালেন্স: ৳${data.balance} (${data.source})`);
      } else {
        alert(data.error || 'Steadfast API কানেক্ট করা যায়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    } finally {
      setCheckingBalance(false);
    }
  };

  // Save Merchant Courier & Rider Settings
  const handleSaveLogisticsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
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
            updates: {
              deliveryWhatsAppGroupUrl: logisticsForm.deliveryWhatsAppGroupUrl.trim(),
              steadfastApiKey: logisticsForm.steadfastApiKey.trim(),
              steadfastSecretKey: logisticsForm.steadfastSecretKey.trim(),
            },
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.merchant) {
        setMerchant(data.merchant);
        localStorage.setItem('ru_merchant_session', JSON.stringify(data.merchant));
        alert('✅ কুরিয়ার (Steadfast) ও রাইডার WhatsApp গ্রুপ সেটিংস সেভ হয়েছে!');
      } else {
        alert(data.error || 'সেটিংস সেভ করা যায়নি');
      }
    } catch {
      alert('সার্ভার সমস্যা');
    }
  };

  // Build formatted WhatsApp Rider Group Broadcast text
  const buildRiderGroupMessage = (ord: Order) => {
    const myItems = merchant?.id === 'admin-master'
      ? (ord.items || [])
      : (ord.items || []).filter((it) => it.merchantId === merchant?.id);
    const itemsText = myItems.map((it) => `• ${it.nameBn} (${it.selectedOption}) × ${it.quantity}`).join('\n');
    const zoneBn =
      ord.deliveryZone === 'campus'
        ? 'মতিহার ক্যাম্পাস'
        : ord.deliveryZone === 'city'
        ? 'রাজশাহী সিটি'
        : 'কুরিয়ার/সারাদেশ';
    return `🛵 *নতুন ডেলিভারি রিকোয়েস্ট!* (RU Insiders)\n📦 অর্ডার আইডি: #${ord.orderId}\n🏪 মার্চেন্ট শপ: ${merchant?.shopName}\n📍 পিকআপ ঠিকানা: ${merchant?.address || 'রাবি ক্যাম্পাস'} (${merchant?.phone})\n---------------------------------\n👤 কাস্টমারের নাম: ${ord.customerName}\n📞 কাস্টমার ফোন: ${ord.phone}\n📍 ডেলিভারি ঠিকানা: ${ord.addressDetails} (${zoneBn})\n💰 কালেকশন / COD: ৳${ord.totalAmount}\n🛍️ পণ্যসমূহ:\n${itemsText}\n---------------------------------\nযেই রাইডার ভাই ডেলিভারি করতে আগ্রহী, দ্রুত এই মেসেজে রিপ্লাই দিয়ে অর্ডারটি পিকআপ করুন!`;
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
          merchantId: merchant.id,
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
      const myItems = merchant.id === 'admin-master'
        ? (order.items || [])
        : (order.items || []).filter((it) => it.merchantId === merchant.id);
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
    const myItems = merchant?.id === 'admin-master'
      ? (order.items || [])
      : (order.items || []).filter((it) => it.merchantId === merchant?.id);
    return sum + myItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  }, 0);

  const WORKFLOW_STAGES = [
    {
      id: 'intake' as const,
      step: '১',
      title: 'ইনটেক',
      subtitle: 'নতুন অর্ডার জমা হয়েছে',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      activeRing: 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-300/60',
      colHeaderBg: 'bg-amber-50 border-amber-200 text-amber-950',
    },
    {
      id: 'ready' as const,
      step: '২',
      title: 'রেডি হলো',
      subtitle: 'প্যাকিং ও ডিসপ্যাচ প্রস্তুত',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      activeRing: 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-300/60',
      colHeaderBg: 'bg-blue-50 border-blue-200 text-blue-950',
    },
    {
      id: 'with_rider' as const,
      step: '৩',
      title: 'রাইডারকে দিলাম',
      subtitle: 'রাইডার / কুরিয়ারের পথে',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      activeRing: 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300/60',
      colHeaderBg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
    },
    {
      id: 'delivered' as const,
      step: '৪',
      title: 'ডেলিভারড',
      subtitle: 'ডেলিভারি সম্পন্ন হয়েছে',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeRing: 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-300/60',
      colHeaderBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    },
    {
      id: 'cancelled' as const,
      step: '৫',
      title: 'ক্যান্সেল',
      subtitle: 'বাতিলকৃত অর্ডার',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      activeRing: 'border-red-500 bg-red-50/70 ring-2 ring-red-300/60',
      colHeaderBg: 'bg-red-50 border-red-200 text-red-950',
    },
  ];

  // Reusable order card for both Folder View & 5-Column Kanban Workflow View
  const renderOrderCard = (ord: Order, compact = false) => {
    if (!merchant) return null;
    const myItems =
      merchant.id === 'admin-master'
        ? (ord.items || [])
        : (ord.items || []).filter((it) => it.merchantId === merchant.id);
    const mySubtotal = myItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const stage = normalizeStage(ord.status);

    return (
      <div
        key={ord.orderId}
        className={`bg-white rounded-2xl sm:rounded-3xl ${compact ? 'p-3.5' : 'p-5'} border-2 shadow-xs space-y-3 ${
          stage === 'cancelled'
            ? 'border-red-200 bg-red-50/20'
            : stage === 'delivered'
            ? 'border-emerald-200'
            : 'border-slate-200'
        }`}
      >
        {/* Order Head & Direct Customer Contact */}
        <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm text-slate-900 font-mono">{ord.orderId}</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 truncate">
              <strong className="text-slate-900">{ord.customerName}</strong> • {ord.phone}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${ord.phone}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
              title="সরাসরি কল"
            >
              <Phone className="w-3 h-3" />
              <span>কল</span>
            </a>
            <a
              href={`https://wa.me/88${ord.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `আসসালামু আলাইকুম ${ord.customerName}! আমি RU Insiders এর ${merchant.shopName} থেকে আপনার অর্ডার #${ord.orderId} নিয়ে যোগাযোগ করছি।`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
              title="কাস্টমারকে সরাসরি WhatsApp"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WA</span>
            </a>
          </div>
        </div>

        {/* Scoped Merchant Items */}
        <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 text-xs">
          {myItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 font-bold text-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <img src={item.image} alt={item.nameBn} className="w-7 h-7 rounded-lg object-cover border shrink-0" />
                <span className="truncate">
                  {item.nameBn} ({item.selectedOption}) × {item.quantity}
                </span>
              </div>
              <span className="shrink-0">৳{item.unitPrice * item.quantity}</span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-1 text-[11px]">
            <span className="text-slate-600 truncate max-w-full">
              📍 {ord.addressDetails} ({ord.deliveryZone === 'campus' ? 'ক্যাম্পাস' : ord.deliveryZone === 'city' ? 'সিটি' : 'সারাদেশ'})
            </span>
            <span className="font-black text-emerald-700">আপনার মূল্য: ৳{mySubtotal}</span>
          </div>
        </div>

        {/* Steadfast / Rider Badge */}
        {(ord.steadfastTrackingCode || ord.assignedRiderName) && (
          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
            {ord.steadfastTrackingCode ? (
              <>
                <span className="font-bold text-indigo-950 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Steadfast: <code className="font-mono bg-white px-1.5 py-0.5 rounded">{ord.steadfastTrackingCode}</code></span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCheckSteadfastStatus(ord)}
                  disabled={steadfastLoadingOrder === ord.orderId}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                >
                  {steadfastLoadingOrder === ord.orderId ? '...' : '🔄 সিঙ্ক'}
                </button>
              </>
            ) : (
              <span className="font-bold text-indigo-950">
                🛵 রাইডার: {ord.assignedRiderName} {ord.assignedRiderPhone ? `(${ord.assignedRiderPhone})` : ''}
              </span>
            )}
          </div>
        )}

        {/* Cancellation Note */}
        {stage === 'cancelled' && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-900 space-y-0.5">
            <p className="font-black flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>কারণ: {ord.cancellationReason || 'উল্লেখ করা হয়নি'}</span>
            </p>
            {ord.cancelledBy && <p className="text-[10px] text-red-700">বাতিলকারী: {ord.cancelledBy}</p>}
          </div>
        )}

        {/* Stage Transition Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {stage === 'intake' && (
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus(ord.orderId, 'ready', { note: '১. ইনটেক থেকে ২. রেডি ধাপে পাঠানো হয়েছে' })}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>২. রেডিতে পাঠান ➔</span>
              </button>
            )}

            {stage === 'ready' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDispatchModalOrder(ord);
                    setRiderNameInput('');
                    setRiderPhoneInput('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>🛵 রাইডার গ্রুপ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToSteadfast(ord)}
                  disabled={steadfastLoadingOrder === ord.orderId}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Truck className="w-3 h-3" />
                  <span>{steadfastLoadingOrder === ord.orderId ? '...' : '📦 Steadfast'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateOrderStatus(ord.orderId, 'with_rider', {
                      assignedRiderName: 'সরাসরি রাইডার হ্যান্ডওভার',
                      dispatchedVia: 'manual',
                      note: '২. রেডি থেকে ৩. রাইডার ধাপে স্থানান্তর',
                    })
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <span>৩. রাইডারে দিন ➔</span>
                </button>
              </>
            )}

            {stage === 'with_rider' && (
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus(ord.orderId, 'delivered', { note: '৩. রাইডার থেকে ৪. ডেলিভারি সম্পন্ন' })}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>৪. ডেলিভারড হয়েছে ✓</span>
              </button>
            )}
          </div>

          {/* Cancel allowed from ANY stage (intake, ready, with_rider, delivered) */}
          {stage !== 'cancelled' && (
            <button
              type="button"
              onClick={() => {
                setCancelModalOrder(ord);
                setCancelReasonInput('');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <XCircle className="w-3 h-3" />
              <span>ক্যান্সেল</span>
            </button>
          )}
        </div>
      </div>
    );
  };

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
                  <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর / ইমেইল (অ্যাডমিন হলে ফাঁকা রাখতে পারেন)</label>
                  <input
                    type="text"
                    placeholder="যেমন: 01711223344 (বা অ্যাডমিন হলে ফাঁকা রাখুন)"
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
                        setLoginPassword('motihar-2026');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      🛍️ মতিহার ক্রাফটস (আলাদা লগইন)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('01822334455');
                        setLoginPassword('varendra-2026');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      🍯 বরেন্দ্র খাঁটি গুড় (আলাদা লগইন)
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
                onClick={() => setActiveTab('orders')}
                className={`py-2.5 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>অর্ডার ওয়ার্কফ্লো ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-2.5 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>আমার পণ্যসমূহ ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('logistics')}
                className={`py-2 px-4 rounded-xl shrink-0 transition flex items-center gap-1.5 ${
                  activeTab === 'logistics'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-4 h-4 text-indigo-500" />
                <span>রাইডার গ্রুপ ও Steadfast API</span>
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
            {/* TAB 2: 5-STAGE ORDER WORKFLOW (1 INTAKE -> 2 READY -> 3 RIDER -> 4 DELIVERED -> 5 CANCEL) */}
            {/* ========================================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      ৫-ধাপের অর্ডার ওয়ার্কফ্লো ({orders.length}টি অর্ডার)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      নতুন অর্ডার প্রথমে <strong>১. ইনটেক</strong>-এ আসে → ক্লিক করলেই <strong>২. রেডি</strong> → <strong>৩. রাইডার</strong> → <strong>৪. ডেলিভারড</strong> ধাপে চলে যাবে (যেকোনো ধাপ থেকে <strong>৫. ক্যান্সেল</strong> করা যাবে)।
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setWorkflowViewMode('folder')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          workflowViewMode === 'folder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        📂 ধাপ অনুযায়ী
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkflowViewMode('board')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          workflowViewMode === 'board' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        📊 ৫-কলাম বোর্ড
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadMerchantData(merchant.id, merchant.phone, merchant.password)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>রিফ্রেশ</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadReportCsv}
                      className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Live Transition Feedback Banner */}
                {workflowNotice && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-xs animate-in fade-in duration-150">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{workflowNotice.text}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {workflowViewMode === 'folder' && workflowNotice.targetStage !== orderFilterStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderFilterStatus(workflowNotice.targetStage);
                            setWorkflowNotice(null);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition cursor-pointer"
                        >
                          ওই ধাপ খুলুন ➔
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setWorkflowNotice(null)}
                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                        aria-label="Close notice"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {workflowViewMode === 'folder' ? (
                  <>
                    {/* 5 Separated Stage Boxes Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {WORKFLOW_STAGES.map((st) => {
                        const count = orders.filter((o) => normalizeStage(o.status) === st.id).length;
                        const active = orderFilterStatus === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setOrderFilterStatus(st.id)}
                            className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                              active ? st.activeRing : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${st.badgeColor}`}>
                                ধাপ {st.step}
                              </span>
                              <span className="text-base sm:text-lg font-black text-slate-900">{count}</span>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-black text-slate-900">{st.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{st.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Stage Bucket Contents */}
                    {(() => {
                      const activeStageObj = WORKFLOW_STAGES.find((s) => s.id === orderFilterStatus) || WORKFLOW_STAGES[0];
                      const bucketOrders = orders.filter((o) => normalizeStage(o.status) === activeStageObj.id);
                      return bucketOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                          <p className="text-sm font-bold text-slate-700">
                            &ldquo;{activeStageObj.step}. {activeStageObj.title}&rdquo; ধাপে কোনো অর্ডার নেই
                          </p>
                          <p className="text-xs text-slate-400">
                            গ্রাহকরা আপনার পণ্য অর্ডার করলে প্রথমে ইনটেকে আসবে এবং ধাপে ধাপে এখানে স্থানান্তর হবে।
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bucketOrders.map((ord) => renderOrderCard(ord, false))}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  /* 5-Column Side-by-Side Kanban Pipeline Board */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-start">
                    {WORKFLOW_STAGES.map((st) => {
                      const stageOrders = orders.filter((o) => normalizeStage(o.status) === st.id);
                      return (
                        <div
                          key={st.id}
                          className="rounded-3xl bg-slate-100/70 border border-slate-200 overflow-hidden flex flex-col min-h-[260px]"
                        >
                          <div className={`px-3.5 py-2.5 border-b flex items-center justify-between ${st.colHeaderBg}`}>
                            <div>
                              <p className="text-xs font-black">
                                {st.step}. {st.title}
                              </p>
                              <p className="text-[10px] opacity-80">{st.subtitle}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 font-black text-xs shadow-xs">
                              {stageOrders.length}
                            </span>
                          </div>
                          <div className="p-2.5 space-y-2.5 flex-1">
                            {stageOrders.length === 0 ? (
                              <p className="text-[11px] text-slate-400 text-center py-8 font-bold">খালি</p>
                            ) : (
                              stageOrders.map((ord) => renderOrderCard(ord, true))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2.5: LOGISTICS — WHATSAPP RIDER GROUP & STEADFAST COURIER API */}
            {/* ========================================================================= */}
            {activeTab === 'logistics' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                    <Truck className="w-4 h-4" />
                    <span>Campus Rider Group & Steadfast Courier Integration</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    ডেলিভারি রাইডার হোয়াটসঅ্যাপ গ্রুপ ও Steadfast API সেটিংস
                  </h3>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    মতিহার ক্যাম্পাসে দ্রুত ডেলিভারির জন্য রাইডারদের অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ যুক্ত করুন অথবা সারাদেশে কুরিয়ার করতে সরাসরি Steadfast Courier-এর API Key সেট করুন।
                  </p>
                </div>

                <form onSubmit={handleSaveLogisticsSettings} className="space-y-5">
                  {/* Rider WhatsApp Group Section */}
                  <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>ডেলিভারি রাইডার হোয়াটসঅ্যাপ গ্রুপ লিংক</span>
                      </h4>
                      {centralRiderGroupUrl && centralRiderGroupUrl !== 'https://chat.whatsapp.com/' && (
                        <a
                          href={centralRiderGroupUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-emerald-700 underline flex items-center gap-1"
                        >
                          অফিশিয়াল গ্রুপ দেখুন <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="যেমন: https://chat.whatsapp.com/আপনার-গ্রুপ-লিংক (ফাঁকা রাখলে কেন্দ্রীয় গ্রুপ ব্যবহার হবে)"
                      value={logisticsForm.deliveryWhatsAppGroupUrl}
                      onChange={(e) => setLogisticsForm({ ...logisticsForm, deliveryWhatsAppGroupUrl: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 border border-emerald-200 rounded-2xl bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-emerald-800">
                      💡 অর্ডার রেডি হলে <strong>&ldquo;🛵 রাইডার WhatsApp গ্রুপে দিন&rdquo;</strong> বাটনে ক্লিক করলে অটোমেটিক রাইডার মেসেজ তৈরি হয়ে কপি ও গ্রুপ ওপেন হবে — যে রাইডার ভাই আগ্রহী সে মেসেজে রিপ্লাই দিয়ে প্রোডাক্ট পিকআপ করবে!
                    </p>
                  </div>

                  {/* Steadfast API Section */}
                  <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        <span>Steadfast Courier API Credentials (portal.packzy.com)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleCheckSteadfastBalance}
                        disabled={checkingBalance}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {checkingBalance ? 'যাচাই হচ্ছে...' : '💰 ব্যালেন্স ও কানেকশন চেক'}
                      </button>
                    </div>

                    {steadfastBalance !== null && (
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs font-black text-indigo-800">
                        ✅ কানেকশন সফল! আপনার Steadfast বর্তমান ব্যালেন্স: ৳{steadfastBalance}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">Steadfast Api-Key:</label>
                        <input
                          type="text"
                          placeholder="আপনার Steadfast Api-Key লিখুন"
                          value={logisticsForm.steadfastApiKey}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, steadfastApiKey: e.target.value })}
                          className="w-full text-xs p-3 border border-indigo-200 rounded-2xl bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">Steadfast Secret-Key:</label>
                        <input
                          type="password"
                          placeholder="আপনার Steadfast Secret-Key লিখুন"
                          value={logisticsForm.steadfastSecretKey}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, steadfastSecretKey: e.target.value })}
                          className="w-full text-xs p-3 border border-indigo-200 rounded-2xl bg-white font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-indigo-800">
                      নোট: নিজস্ব API Key না বসালে, অর্ডার পাঠানোর সময় অ্যাডমিনের কেন্দ্রীয় Steadfast অ্যাকাউন্ট (যদি সেট থাকে) ব্যবহারের সুযোগ থাকবে।
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    সেটিংস সংরক্ষণ করুন
                  </button>
                </form>
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

                {/* Product Catalog Feed URL (JSON & Meta CSV) */}
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span>Facebook Catalog & Instagram Shop ফিড লিংক (CSV & JSON):</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/api/store?${merchant.id === 'admin-master' ? '' : `merchant=${merchant.id}&`}format=csv`
                          : ''
                      }
                      className="flex-1 text-xs p-2.5 bg-white border border-blue-200 rounded-xl font-mono text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const feedUrl = `${window.location.origin}/api/store?${merchant.id === 'admin-master' ? '' : `merchant=${merchant.id}&`}format=csv`;
                          navigator.clipboard.writeText(feedUrl);
                          setCopiedFeed(true);
                          setTimeout(() => setCopiedFeed(false), 2000);
                        }
                      }}
                      className="px-3.5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedFeed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFeed ? 'CSV ফিড কপি হয়েছে' : 'CSV ফিড কপি'}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-blue-700">
                      এই CSV লিংকটি Meta Commerce Manager → Data Sources-এ Scheduled Feed হিসেবে বসিয়ে ডাইনামিক অ্যাডস চালাতে পারবেন।
                    </p>
                    {merchant.facebookPixelId && (
                      <button
                        type="button"
                        onClick={() => {
                          trackMetaEvent('PageView', { source: 'merchant_studio_test' }, [merchant.facebookPixelId]);
                          alert(`✅ Meta Pixel (${merchant.facebookPixelId}) টেস্ট PageView ইভেন্ট ফায়ার করা হয়েছে! Meta Pixel Helper এক্সটেনশনে যাচাই করতে পারবেন।`);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-[11px] font-bold transition cursor-pointer"
                      >
                        ⚡ টেস্ট Pixel ইভেন্ট পাঠান
                      </button>
                    )}
                  </div>
                </div>

                {/* Facebook Ad Landing URL & UTM Campaign Builder */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                  <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Facebook Ads ডাইরেক্ট প্রোডাক্ট ল্যান্ডিং লিংক ও UTM জেনারেটর:</span>
                  </h4>
                  <p className="text-[11px] text-indigo-800">
                    ফেসবুকে বুস্ট বা অ্যাডস চালানোর জন্য যেকোনো পণ্যের ডাইরেক্ট লিংক ও UTM ট্যাগ তৈরি করুন (অটো Open Graph প্রিভিউ ও পিক্সেল ট্র্যাকিংসহ)।
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <select
                      value={fbAdProductId || products[0]?.id || ''}
                      onChange={(e) => setFbAdProductId(e.target.value)}
                      className="text-xs p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-800"
                    >
                      {products.length === 0 ? (
                        <option value="">প্রথমে একটি পণ্য যোগ করুন</option>
                      ) : (
                        products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameBn} (৳{p.price})
                          </option>
                        ))
                      )}
                    </select>
                    <input
                      type="text"
                      placeholder="Campaign নাম (যেমন: winter_promo)"
                      value={fbAdCampaign}
                      onChange={(e) => setFbAdCampaign(e.target.value)}
                      className="text-xs p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  {products.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={
                          typeof window !== 'undefined'
                            ? `${window.location.origin}/shop/${fbAdProductId || products[0]?.id}?utm_source=facebook&utm_medium=paid_social&utm_campaign=${encodeURIComponent(
                                fbAdCampaign.trim() || 'ru_promo'
                              )}`
                            : ''
                        }
                        className="flex-1 text-xs p-2.5 bg-white border border-indigo-200 rounded-xl font-mono text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            const adUrl = `${window.location.origin}/shop/${fbAdProductId || products[0]?.id}?utm_source=facebook&utm_medium=paid_social&utm_campaign=${encodeURIComponent(
                              fbAdCampaign.trim() || 'ru_promo'
                            )}`;
                            navigator.clipboard.writeText(adUrl);
                            setCopiedAdLink(true);
                            setTimeout(() => setCopiedAdLink(false), 2000);
                          }
                        }}
                        className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedAdLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAdLink ? 'লিংক কপি হয়েছে' : 'অ্যাড লিংক কপি'}</span>
                      </button>
                    </div>
                  )}
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
                        মার্চেন্ট মোবাইল / ডেস্কটপ স্বতন্ত্র অ্যাপ ইনস্টল
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        এটি মেইন শপ অ্যাপ থেকে সম্পূর্ণ আলাদা <strong>&ldquo;RU Merchant&rdquo;</strong> ড্যাশবোর্ড অ্যাপ! শুধুমাত্র আপনার পাসওয়ার্ড দিয়ে লগইন করলেই ডাউনলোড ও ইনস্টল অপশন চালু হয়।
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleInstallApp}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isAppInstalled ? 'মার্চেন্ট অ্যাপ ইনস্টল করা আছে' : 'স্বতন্ত্র মার্চেন্ট অ্যাপ ইনস্টল করুন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const targetUrl = typeof window !== 'undefined' ? `${window.location.origin}/merchant` : 'https://ruinsider-2.vercel.app/merchant';
                          const htmlLauncher = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>RU Merchant Hub - ${merchant.shopName}</title><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#064e3b;color:#fff;"><h2>RU Merchant Hub লোড হচ্ছে...</h2><p>স্বয়ংক্রিয়ভাবে চালু না হলে <a href="${targetUrl}" style="color:#fbbf24;">এখানে ক্লিক করুন</a>।</p><script>window.location.replace("${targetUrl}");</script></body></html>`;
                          const blob = new Blob([htmlLauncher], { type: 'text/html;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `RU-Merchant-${merchant.shopName.replace(/\s+/g, '_')}.html`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>ড্যাশবোর্ড লঞ্চার ফাইল ডাউনলোড (.html)</span>
                      </button>
                    </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="text-xs font-bold text-slate-700">পণ্যের ধরন</label>
                  <select
                    value={prodForm.productType}
                    onChange={(e) => setProdForm({ ...prodForm, productType: e.target.value as any })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-2xl font-bold bg-white"
                  >
                    <option value="apparel">পোশাক (সাইজ: M/L/XL/XXL)</option>
                    <option value="food_weight">খাবার / ওজন ভিত্তিক</option>
                    <option value="standard">সাধারণ / ফ্রি সাইজ</option>
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

      {/* ===================================================================== */}
      {/* RIDER WHATSAPP GROUP DISPATCH MODAL                                   */}
      {/* ===================================================================== */}
      {dispatchModalOrder && merchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <span>🛵 ডেলিভারি রাইডার WhatsApp গ্রুপে পোস্ট করুন</span>
                </h3>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  অর্ডার #{dispatchModalOrder.orderId} • আগ্রহী রাইডার ভাই এই মেসেজ দেখে পিকআপ করবেন
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">রাইডার গ্রুপে পাঠানোর রেডি মেসেজ:</label>
                <textarea
                  readOnly
                  rows={8}
                  value={buildRiderGroupMessage(dispatchModalOrder)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">আগ্রহী রাইডারের নাম (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    placeholder="যেমন: রাসেল ভাই (রাইডার)"
                    value={riderNameInput}
                    onChange={(e) => setRiderNameInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">রাইডারের ফোন (ঐচ্ছিক):</label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={riderPhoneInput}
                    onChange={(e) => setRiderPhoneInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(buildRiderGroupMessage(dispatchModalOrder));
                    setCopiedRiderMsg(true);
                    setTimeout(() => setCopiedRiderMsg(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedRiderMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRiderMsg ? 'মেসেজ কপি হয়েছে!' : 'মেসেজ কপি করুন'}</span>
                </button>

                {(merchant.deliveryWhatsAppGroupUrl || centralRiderGroupUrl) && (
                  <a
                    href={merchant.deliveryWhatsAppGroupUrl || centralRiderGroupUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      navigator.clipboard.writeText(buildRiderGroupMessage(dispatchModalOrder));
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>কপি ও WhatsApp গ্রুপ ওপেন করুন</span>
                  </a>
                )}

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(buildRiderGroupMessage(dispatchModalOrder))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp-এ সরাসরি শেয়ার</span>
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleUpdateOrderStatus(dispatchModalOrder.orderId, 'with_rider', {
                    assignedRiderName: riderNameInput.trim() || 'WhatsApp Rider Group',
                    assignedRiderPhone: riderPhoneInput.trim(),
                    dispatchedVia: 'whatsapp_group',
                    note: 'ডেলিভারি রাইডার গ্রুপের মাধ্যমে রাইডারকে হস্তান্তর করা হয়েছে',
                  });
                  setDispatchModalOrder(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow transition cursor-pointer"
              >
                ✅ ৩. রাইডারকে দিলাম (মার্ক করুন)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CANCEL ORDER MODAL (ALLOWED FROM ANY STAGE)                           */}
      {/* ===================================================================== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-red-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-red-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">❌ অর্ডার ক্যান্সেল করুন</h3>
                <p className="text-[11px] text-red-100 mt-0.5">
                  অর্ডার #{cancelModalOrder.orderId} ({cancelModalOrder.customerName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 font-medium">
                নোট: যেকোনো ধাপ থেকেই অর্ডার ক্যান্সেল করা যাবে। সাধারণত কাস্টমার হোয়াটসঅ্যাপে মেসেজ করে জানালে বা প্রোডাক্ট সংক্রান্ত জরুরি প্রয়োজনে মার্চেন্ট/অ্যাডমিন অর্ডার ক্যান্সেল করবেন।
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">ক্যান্সেলের কারণ লিখুন:</label>
                <textarea
                  rows={3}
                  placeholder="যেমন: কাস্টমার হোয়াটসঅ্যাপে মেসেজ দিয়ে বাতিল করার অনুরোধ করেছেন / স্টক শেষ..."
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleUpdateOrderStatus(cancelModalOrder.orderId, 'cancelled', {
                      cancellationReason: cancelReasonInput.trim() || 'কাস্টমারের অনুরোধ / মার্চেন্ট কর্তৃক বাতিল',
                    });
                    setCancelModalOrder(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow transition cursor-pointer"
                >
                  নিশ্চিত ক্যান্সেল করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
