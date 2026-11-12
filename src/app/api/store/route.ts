import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { supabase, checkSupabaseStatus } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await readDb();
  const merchantParam = req.nextUrl.searchParams.get('merchant');
  const formatParam = req.nextUrl.searchParams.get('format');

  // Enrich product pixel IDs from their owning merchant dynamically
  const enrichedProducts = db.products.map((p) => {
    const owner = (db.merchants || []).find((m) => m.id === p.merchantId);
    const resolvedPixel = owner?.facebookPixelId || p.facebookPixelId || '';
    return resolvedPixel ? { ...p, facebookPixelId: resolvedPixel } : p;
  });

  const filteredProducts = merchantParam
    ? enrichedProducts.filter((p) => p.merchantId === merchantParam)
    : enrichedProducts;

  // Support Meta Commerce Manager / Google Merchant CSV Feed export (?format=csv)
  if (formatParam === 'csv') {
    const origin = req.nextUrl.origin || 'https://ruinsider-2.vercel.app';
    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand',
      'google_product_category',
    ];
    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;
    const rows = filteredProducts.map((p) => [
      escapeCsv(p.id),
      escapeCsv(p.nameBn),
      escapeCsv(p.shortSummary || p.nameBn),
      p.inStock ? 'in stock' : 'out of stock',
      'new',
      `${p.price} BDT`,
      `${origin}/shop/${p.id}`,
      p.images?.[0]?.startsWith('http') ? p.images[0] : `${origin}${p.images?.[0] || '/logo.png'}`,
      escapeCsv(p.merchantName || 'Rabian'),
      escapeCsv(p.category || 'Apparel & Accessories'),
    ]);
    const csvBody = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return new NextResponse(csvBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rabian-${merchantParam || 'all'}-catalog.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  // Never leak passwords to public client
  const safeClubs = db.clubs.map(({ password, ...rest }) => rest);

  // Compute active breaking news strictly from published breaking articles + clean settings announcements
  const publishedBreakingArticles = db.articles.filter(
    (a) => a.status === 'Published' && (a.category === 'ব্রেকিং নিউজ' || a.category === '🔥 ব্রেকিং নিউজ' || a.isBreaking)
  );

  // 1. Articles with breaking status
  const articleBreakingItems = publishedBreakingArticles.map((a) => ({
    id: `art-${a.id}`,
    title: a.title,
    imageUrl: a.images?.[0] || '/campus/paris-road-rain.jpg',
    link: `/inside-ru/${a.id}`,
    articleId: a.id,
    createdAt: a.createdAt,
    isActive: true,
  }));

  // 2. Custom rich breaking items from settings
  const customBreakingItems = (db.settings.breakingNewsItems || []).filter((it) => it.isActive !== false);

  // 3. Clean settings announcements to ignore any unpublished article titles
  const cleanCustomAnnouncements = (db.settings.breakingNews || []).filter((headline) => {
    const matchingArticle = db.articles.find((a) => headline.includes(a.title));
    if (matchingArticle && matchingArticle.status !== 'Published') {
      return false;
    }
    return true;
  });

  const stringFallbackItems = cleanCustomAnnouncements.map((hl, idx) => ({
    id: `txt-${idx}`,
    title: hl.replace(/^[🔥🚨\s]+/, ''),
    imageUrl: '/campus/paris-road-rain.jpg',
    link: '/inside-ru',
    createdAt: new Date().toISOString(),
    isActive: true,
  }));

  // Combine and deduplicate
  const allBreakingItems = [
    ...articleBreakingItems,
    ...customBreakingItems,
    ...stringFallbackItems,
  ];

  const seenTitles = new Set<string>();
  const activeBreakingItems = allBreakingItems.filter((item) => {
    const key = (item.title || '').trim().toLowerCase();
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  const activeBreakingNews = activeBreakingItems.map((item) => `🔥 ${item.title}`);

  // Safe merchants view for public catalog
  const publicMerchants = (db.merchants || [])
    .filter((m) => m.status === 'active')
    .map(({ password, payoutPhone, steadfastApiKey, steadfastSecretKey, ...rest }) => rest);

  return NextResponse.json(
    {
      settings: {
        whatsappNumber: db.settings.whatsappNumber,
        deliveryWhatsAppGroupUrl: db.settings.deliveryWhatsAppGroupUrl || '',
        deliveryCharges: db.settings.deliveryCharges,
        categories: db.settings.categories,
        breakingNews: activeBreakingNews,
        breakingNewsItems: activeBreakingItems,
        defaultFacebookPixelId: db.settings.defaultFacebookPixelId || '',
        aiStatus: {
          configured: Boolean(
            db.settings.aiConfig?.openRouterKey1 ||
            db.settings.aiConfig?.openRouterKey2 ||
            db.settings.aiConfig?.geminiApiKey
          ),
          mcpEnabled: db.settings.aiConfig?.mcpEnabled !== false,
        },
      },
      products: filteredProducts,
      merchants: publicMerchants,
      mapSpots: db.mapSpots,
      clubs: safeClubs,
      departments: db.departments || {},
      bloodDonors: (db.bloodDonors || []).map((d) => ({
        ...d,
        phone: d.isPublicPhone !== false ? d.phone : '',
      })),
      marathons: db.marathons || [],
      articles: db.articles.filter((a) => a.status === 'Published'),
      alumni: db.alumni.filter((al) => al.approved),
      notifications: db.notifications,
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, payload } = body;
    const db = await readDb();

    // 1. Single Password Box Role Detection
    if (action === 'VERIFY_PASSWORD') {
      const cleanPass = (password || '').trim();
      if (cleanPass === db.settings.superAdminPassword) {
        return NextResponse.json({
          ok: true,
          role: 'SUPER_ADMIN',
          roleTitle: 'সুপার অ্যাডমিন (সম্পূর্ণ নিয়ন্ত্রণ)',
          fullDb: db,
        });
      }
      if (cleanPass === db.settings.productManagerPassword) {
        return NextResponse.json({
          ok: true,
          role: 'PRODUCT_MANAGER',
          roleTitle: 'প্রোডাক্ট ও অর্ডার ম্যানেজার',
          products: db.products,
          orders: db.orders,
          categories: db.settings.categories,
          deliveryCharges: db.settings.deliveryCharges,
        });
      }
      const matchedMerchant = (db.merchants || []).find((m) => m.password === cleanPass);
      if (matchedMerchant) {
        return NextResponse.json({
          ok: true,
          role: 'MERCHANT',
          merchantId: matchedMerchant.id,
          roleTitle: `${matchedMerchant.shopName} — মার্চেন্ট ড্যাশবোর্ড`,
          merchant: matchedMerchant,
          products: db.products.filter((p) => p.merchantId === matchedMerchant.id),
          orders: db.orders.filter((o) => (o.items || []).some((it) => it.merchantId === matchedMerchant.id)),
        });
      }
      const matchedClub = db.clubs.find((c) => c.password === cleanPass);
      if (matchedClub) {
        return NextResponse.json({
          ok: true,
          role: 'CLUB_ADMIN',
          clubId: matchedClub.id,
          roleTitle: `${matchedClub.nameBn} — ক্লাব পোর্টাল`,
          clubInfo: matchedClub,
          applications: db.clubApplications.filter((app) => app.clubId === matchedClub.id),
        });
      }
      return NextResponse.json({ ok: false, error: 'পাসওয়ার্ড সঠিক নয়! আবার চেষ্টা করুন।' }, { status: 401 });
    }

    // 2. Customer Order Creation with Server-Side Price Validation
    if (action === 'CREATE_ORDER') {
      const { customerName, phone, deliveryZone, addressDetails, items, accessToken, customerEmail } = payload;
      if (!customerName || !phone || !addressDetails || !items || items.length === 0) {
        return NextResponse.json({ ok: false, error: 'সব প্রয়োজনীয় তথ্য পূরণ করুন' }, { status: 400 });
      }

      let verifiedEmail = typeof customerEmail === 'string' ? customerEmail.trim().toLowerCase() : '';
      let verifiedUid = '';
      if (accessToken) {
        try {
          const { data: userData } = await supabase.auth.getUser(String(accessToken));
          if (userData?.user) {
            verifiedEmail = (userData.user.email || verifiedEmail).trim().toLowerCase();
            verifiedUid = userData.user.id;
          }
        } catch {}
      }

      let calculatedSubtotal = 0;

      const validatedItems = items.map((item: any) => {
        const product = db.products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`পণ্য আইডি ${item.productId} পাওয়া যায়নি`);
        let unitPrice = product.price;
        if (product.productType === 'food_weight' && product.weightOptions?.length) {
          const foundOpt = product.weightOptions.find((w) => w.label === item.selectedOption);
          if (foundOpt) unitPrice = foundOpt.price;
        }
        const qty = Math.max(1, Number(item.quantity || 1));
        calculatedSubtotal += unitPrice * qty;
        return {
          productId: product.id,
          nameBn: product.nameBn,
          image: product.images[0] || '/mockups/hoodie-front.jpg',
          selectedOption: item.selectedOption || (product.sizes?.[0] ?? 'Standard'),
          unitPrice,
          quantity: qty,
          merchantId: product.merchantId || '',
          merchantName: product.merchantName || '',
        };
      });

      const deliveryCharge =
        deliveryZone === 'campus'
          ? (db.settings.deliveryCharges.campus ?? 0)
          : deliveryZone === 'city'
          ? (db.settings.deliveryCharges.city ?? 40)
          : (db.settings.deliveryCharges.nationwide ?? 100);

      const newOrder = {
        orderId: `RUI-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: customerName.trim(),
        phone: phone.trim(),
        ...(verifiedEmail ? { customerEmail: verifiedEmail } : {}),
        ...(verifiedUid ? { customerUid: verifiedUid } : {}),
        deliveryZone,
        addressDetails: addressDetails.trim(),
        items: validatedItems,
        subtotal: calculatedSubtotal,
        deliveryCharge,
        totalAmount: calculatedSubtotal + deliveryCharge,
        status: 'intake' as const,
        statusHistory: [
          {
            status: 'intake',
            timestamp: new Date().toISOString(),
            note: 'কাস্টমার অর্ডার সাবমিট করেছেন (১. ইনটেক)',
            actor: 'customer',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      await writeDb((state) => {
        const updatedMerchants = (state.merchants || []).map((m) => {
          const merchantItems = validatedItems.filter((it: any) => it.merchantId === m.id);
          if (merchantItems.length > 0) {
            const addedAmount = merchantItems.reduce((acc: number, it: any) => acc + (it.unitPrice * it.quantity), 0);
            return {
              ...m,
              totalSales: (m.totalSales || 0) + addedAmount,
              totalOrders: (m.totalOrders || 0) + 1,
            };
          }
          return m;
        });
        return {
          ...state,
          orders: [newOrder, ...state.orders],
          merchants: updatedMerchants,
        };
      });

      return NextResponse.json({ ok: true, order: newOrder });
    }

    // 3. Order Tracking (by phone or order ID)
    if (action === 'TRACK_ORDER') {
      const q = (payload?.query || '').trim().toLowerCase();
      if (!q) {
        return NextResponse.json({ ok: true, orders: [] });
      }
      const cleanDigits = q.replace(/\D/g, '');
      const matched = db.orders.filter((o) => {
        const orderIdMatch = o.orderId.toLowerCase().includes(q);
        const phoneMatch = cleanDigits.length >= 4 && o.phone.replace(/\D/g, '').includes(cleanDigits);
        return orderIdMatch || phoneMatch;
      });
      return NextResponse.json({ ok: true, orders: matched });
    }

    // 3.5. Customer Google-Authenticated Purchase History
    if (action === 'MY_ORDERS') {
      const accessToken = String(payload?.accessToken || '').trim();
      if (!accessToken) {
        return NextResponse.json({ ok: false, error: 'Google অ্যাকাউন্ট দিয়ে লগইন করুন।' }, { status: 401 });
      }
      const { data: userData, error: authErr } = await supabase.auth.getUser(accessToken);
      if (authErr || !userData?.user) {
        return NextResponse.json({ ok: false, error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে, পুনরায় Google দিয়ে লগইন করুন।' }, { status: 401 });
      }
      const email = (userData.user.email || '').trim().toLowerCase();
      const uid = userData.user.id;
      const matched = db.orders.filter(
        (o) =>
          (uid && o.customerUid === uid) ||
          (email && o.customerEmail?.trim().toLowerCase() === email)
      );
      return NextResponse.json({ ok: true, email, orders: matched });
    }

    // 4. Club Membership Application
    if (action === 'APPLY_CLUB') {
      const newApp = {
        id: `APP-${Date.now()}`,
        ...payload,
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
      };
      await writeDb((state) => ({
        ...state,
        clubApplications: [newApp, ...state.clubApplications],
      }));
      return NextResponse.json({ ok: true, application: newApp });
    }

    // 5. Student Submission for Inside RU
    if (action === 'SUBMIT_ARTICLE') {
      const newArticle = {
        id: `art-${Date.now()}`,
        ...payload,
        likes: 1,
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
      };
      await writeDb((state) => ({
        ...state,
        articles: [newArticle, ...state.articles],
      }));
      return NextResponse.json({ ok: true, article: newArticle });
    }

    // 6. Alumni Registration
    if (action === 'REGISTER_ALUMNI') {
      const newAlumni = {
        id: `alum-${Date.now()}`,
        ...payload,
        approved: false,
      };
      await writeDb((state) => ({
        ...state,
        alumni: [newAlumni, ...state.alumni],
      }));
      return NextResponse.json({ ok: true, alumni: newAlumni });
    }

    // 6.5. Public Blood Donor Registration & Donation Date Update
    if (action === 'REGISTER_BLOOD_DONOR') {
      const {
        nameBn,
        bloodGroup,
        phone,
        departmentBn,
        hallBn,
        isRuStudent,
        studentRoll,
        lastDonationDate,
        totalDonations,
        note,
      } = payload || {};
      if (!nameBn || !bloodGroup || !phone || !String(hallBn || '').trim()) {
        return NextResponse.json(
          { ok: false, error: 'নাম, রক্তের গ্রুপ, মোবাইল নম্বর এবং আবাসনের স্থান আবশ্যক।' },
          { status: 400 }
        );
      }
      const cleanRoll = String(studentRoll || '').trim();
      const verifiedMode = Boolean(isRuStudent);
      if (verifiedMode && !cleanRoll) {
        return NextResponse.json(
          { ok: false, error: 'ভেরিফাইড রাবি শিক্ষার্থী হিসেবে আপনার রোল / আইডি নম্বর লিখুন।' },
          { status: 400 }
        );
      }
      const newDonor = {
        id: `bd-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        nameBn: String(nameBn).trim(),
        bloodGroup: String(bloodGroup).trim().toUpperCase() as any,
        phone: String(phone).trim(),
        departmentBn: String(departmentBn || (verifiedMode ? 'রাজশাহী বিশ্ববিদ্যালয়' : 'সাধারণ রক্তদাতা')).trim(),
        hallBn: String(hallBn || '').trim(),
        isRuStudent: verifiedMode,
        studentRoll: verifiedMode ? cleanRoll : '',
        isVerified: verifiedMode && Boolean(cleanRoll),
        lastDonationDate: String(lastDonationDate || '').trim(),
        totalDonations: Number(totalDonations || 0),
        isPublicPhone: true,
        note: String(note || '').trim(),
        createdAt: new Date().toISOString(),
      };
      const updatedDb = await writeDb((state) => ({
        ...state,
        bloodDonors: [newDonor, ...(state.bloodDonors || [])],
      }));
      return NextResponse.json({ ok: true, donor: newDonor, bloodDonors: updatedDb.bloodDonors });
    }

    if (action === 'UPDATE_BLOOD_DONATION') {
      const { phone, donorId, lastDonationDate } = payload || {};
      const cleanPhoneDigits = String(phone || '').replace(/\D/g, '');
      const cleanDate = String(lastDonationDate || new Date().toISOString().slice(0, 10)).trim();
      if (!donorId && cleanPhoneDigits.length < 8) {
        return NextResponse.json({ ok: false, error: 'সঠিক মোবাইল নম্বর বা দাতা আইডি দিন।' }, { status: 400 });
      }
      let matched = false;
      const updatedDb = await writeDb((state) => ({
        ...state,
        bloodDonors: (state.bloodDonors || []).map((d) => {
          const isMatch =
            (donorId && d.id === donorId) ||
            (cleanPhoneDigits.length >= 8 && d.phone.replace(/\D/g, '').endsWith(cleanPhoneDigits.slice(-10)));
          if (isMatch) {
            matched = true;
            return {
              ...d,
              lastDonationDate: cleanDate,
              totalDonations: (d.totalDonations || 0) + 1,
            };
          }
          return d;
        }),
      }));
      if (!matched) {
        return NextResponse.json({ ok: false, error: 'এই নম্বরে কোনো রক্তদাতা খুঁজে পাওয়া যায়নি।' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, bloodDonors: updatedDb.bloodDonors });
    }

    // 6.5 Marathon Participant Registration (Public Form)
    if (action === 'REGISTER_MARATHON') {
      const {
        marathonId,
        name,
        phone,
        email,
        department,
        studentId,
        session,
        gender,
        tShirtSize,
        bloodGroup,
        emergencyContact,
      } = payload || {};

      if (!marathonId || !name || !phone || !department || !studentId || !emergencyContact) {
        return NextResponse.json(
          { ok: false, error: 'সব প্রয়োজনীয় তথ্য (নাম, ফোন, বিভাগ, রোল/আইডি, জরুরি নম্বর) সঠিকভাবে দিন!' },
          { status: 400 }
        );
      }

      const marathon = (db.marathons || []).find((m) => m.id === marathonId);
      if (!marathon) {
        return NextResponse.json({ ok: false, error: 'ম্যারাথন ইভেন্টটি পাওয়া যায়নি।' }, { status: 404 });
      }

      if (marathon.isOpen === false) {
        return NextResponse.json(
          { ok: false, error: 'দুঃখিত, এই ম্যারাথনের অনলাইন আবেদন বর্তমানে বন্ধ রয়েছে।' },
          { status: 400 }
        );
      }

      if (marathon.deadline && new Date(marathon.deadline).getTime() < Date.now()) {
        return NextResponse.json(
          { ok: false, error: 'দুঃখিত, আবেদনের নির্ধারিত সময়সীমা (Deadline) অতিক্রান্ত হয়েছে।' },
          { status: 400 }
        );
      }

      const existingRegistrations = (db.marathonRegistrations || []).filter(
        (r) => r.marathonId === marathonId
      );
      if (marathon.maxParticipants && existingRegistrations.length >= marathon.maxParticipants) {
        return NextResponse.json(
          { ok: false, error: 'দুঃখিত, ম্যারাথনের সকল আসন পূর্ণ হয়ে গেছে।' },
          { status: 400 }
        );
      }

      const bibNumber = `RBN-${String(existingRegistrations.length + 1).padStart(3, '0')}`;
      const newRegistration = {
        id: `mreg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        marathonId,
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email || '').trim(),
        department: String(department).trim(),
        studentId: String(studentId).trim(),
        session: String(session || '').trim(),
        gender: gender || 'male',
        tShirtSize: tShirtSize || 'L',
        bloodGroup: String(bloodGroup || '').trim(),
        emergencyContact: String(emergencyContact).trim(),
        status: 'confirmed' as const,
        bibNumber,
        createdAt: new Date().toISOString(),
      };

      const updatedDb = await writeDb((state) => ({
        ...state,
        marathonRegistrations: [newRegistration, ...(state.marathonRegistrations || [])],
      }));

      return NextResponse.json({
        ok: true,
        registration: newRegistration,
        marathonRegistrations: updatedDb.marathonRegistrations,
      });
    }

    // 7. Notification Subscribe
    if (action === 'SUBSCRIBE_NOTIFICATION') {
      const contact = (payload?.contact || '').trim();
      if (contact) {
        await writeDb((state) => ({
          ...state,
          subscribers: [{ contact, createdAt: new Date().toISOString() }, ...state.subscribers],
        }));
      }
      return NextResponse.json({ ok: true });
    }

    // 7.5. Toggle Article Like (Persistent Like Engine)
    if (action === 'TOGGLE_LIKE') {
      const { articleId, increment } = payload || {};
      if (!articleId) {
        return NextResponse.json({ ok: false, error: 'Article ID required' }, { status: 400 });
      }
      const updatedDb = await writeDb((state) => ({
        ...state,
        articles: state.articles.map((a) => {
          if (a.id === articleId) {
            const currentLikes = typeof a.likes === 'number' ? a.likes : 0;
            const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);
            return { ...a, likes: newLikes };
          }
          return a;
        }),
      }));
      const found = updatedDb.articles.find((a) => a.id === articleId);
      return NextResponse.json({ ok: true, likes: found?.likes ?? 0 });
    }

    // 7.6. Check Supabase Health Status
    if (action === 'CHECK_SUPABASE') {
      const status = await checkSupabaseStatus();
      return NextResponse.json({ ok: true, status });
    }

    // 7.7. Merchant Public Registration
    if (action === 'MERCHANT_REGISTER') {
      const { shopName, ownerName, phone, email, password: merchantPassword, category, address, payoutPhone, payoutMethod, facebookPixelId } = payload || {};
      if (!shopName || !ownerName || !phone || !merchantPassword) {
        return NextResponse.json({ ok: false, error: 'দোকানের নাম, মালিকের নাম, মোবাইল নম্বর ও পাসওয়ার্ড আবশ্যক।' }, { status: 400 });
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const existingPhone = (db.merchants || []).find((m) => m.phone.replace(/\D/g, '') === cleanPhone);
      if (existingPhone) {
        return NextResponse.json({ ok: false, error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি মার্চেন্ট অ্যাকাউন্ট তৈরি করা আছে।' }, { status: 400 });
      }

      const trimmedPass = merchantPassword.trim();
      const duplicatePass =
        trimmedPass === db.settings.superAdminPassword ||
        trimmedPass === db.settings.productManagerPassword ||
        (db.merchants || []).some((m) => m.password === trimmedPass);
      if (duplicatePass) {
        return NextResponse.json({ ok: false, error: 'নিরাপত্তার জন্য একটি স্বতন্ত্র (আলাদা) গোপন পাসওয়ার্ড ব্যবহার করুন।' }, { status: 400 });
      }

      const newMerchant = {
        id: `m-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        password: merchantPassword.trim(),
        status: 'active' as const, // auto-active so merchants can immediately start selling
        category: category || 'সাধারণ মার্চেন্ট',
        address: address || '',
        payoutPhone: payoutPhone || phone,
        payoutMethod: payoutMethod || 'bkash',
        facebookPixelId: facebookPixelId || '',
        commissionRate: 0,
        totalSales: 0,
        totalOrders: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedDb = await writeDb((state) => ({
        ...state,
        merchants: [newMerchant, ...(state.merchants || [])],
      }));

      return NextResponse.json({ ok: true, merchant: newMerchant });
    }

    // 7.8. Merchant Direct Login (supports merchant credentials OR Super Admin password for master hub access & download)
    if (action === 'MERCHANT_LOGIN') {
      const { identifier, password: merchantPass } = payload || {};
      const cleanId = (identifier || '').trim().toLowerCase();
      const cleanP = (merchantPass || '').trim();

      // Allow Super Admin password to open Master Merchant Studio + App Download
      if (cleanP && cleanP === db.settings.superAdminPassword) {
        return NextResponse.json({
          ok: true,
          isAdminSession: true,
          merchant: {
            id: 'admin-master',
            shopName: 'Rabian মাস্টার মার্চেন্ট',
            ownerName: 'সুপার অ্যাডমিন',
            phone: db.settings.whatsappNumber || '8801700000000',
            email: '',
            password: cleanP,
            status: 'active' as const,
            category: 'কেন্দ্রীয় স্টোর',
            address: 'রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস',
            payoutPhone: db.settings.whatsappNumber || '',
            payoutMethod: 'bkash' as const,
            facebookPixelId: db.settings.defaultFacebookPixelId || '',
            deliveryWhatsAppGroupUrl: db.settings.deliveryWhatsAppGroupUrl || '',
            steadfastApiKey: db.settings.steadfastApiKey || '',
            steadfastSecretKey: db.settings.steadfastSecretKey || '',
            commissionRate: 0,
            totalSales: 0,
            totalOrders: db.orders.length,
            createdAt: new Date().toISOString(),
          },
          products: db.products,
          orders: db.orders,
        });
      }

      const cleanDigits = cleanId.replace(/\D/g, '');
      const foundMerchant = (db.merchants || []).find((m) => {
        if (m.password !== cleanP) return false;
        const mDigits = (m.phone || '').replace(/\D/g, '');
        const mEmail = (m.email || '').trim().toLowerCase();
        // Require exact identifier match when provided (allow empty identifier only if password matches uniquely)
        if (!cleanId) {
          const samePassCount = (db.merchants || []).filter((x) => x.password === cleanP).length;
          return samePassCount === 1;
        }
        if (cleanDigits.length >= 10 && (mDigits === cleanDigits || mDigits.endsWith(cleanDigits.slice(-10)))) {
          return true;
        }
        if (mEmail && mEmail === cleanId) {
          return true;
        }
        if ((m.shopName || '').trim().toLowerCase() === cleanId) {
          return true;
        }
        return false;
      });

      if (!foundMerchant) {
        return NextResponse.json({ ok: false, error: 'মার্চেন্ট ফোন/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' }, { status: 401 });
      }

      const merchantProducts = db.products.filter((p) => p.merchantId === foundMerchant.id);
      const merchantOrders = db.orders.filter((o) => (o.items || []).some((it) => it.merchantId === foundMerchant.id));

      return NextResponse.json({
        ok: true,
        merchant: foundMerchant,
        products: merchantProducts,
        orders: merchantOrders,
      });
    }

    // 8. Role-Protected Actions
    const cleanPass = (password || '').trim();
    const targetMerchantId = (body.merchantId || payload?.merchantId || '').trim();
    const isSuper = cleanPass === db.settings.superAdminPassword;
    const isProdMgr = cleanPass === db.settings.productManagerPassword;
    const matchedClub = db.clubs.find((c) => c.password === cleanPass);
    const matchedMerchant = targetMerchantId
      ? (db.merchants || []).find((m) => m.id === targetMerchantId && m.password === cleanPass)
      : (db.merchants || []).find((m) => m.password === cleanPass);

    // Product & Order Manager + Super Admin + Merchant Actions
    if (action === 'SAVE_PRODUCT' && (isSuper || isProdMgr || matchedMerchant)) {
      const prod = { ...payload.product };
      const sendPush = Boolean(payload.sendChromePush);

      // If called by merchant, strictly enforce their ownership (never overwrite another merchant's product)
      if (matchedMerchant) {
        const existingTarget = db.products.find((p) => p.id === prod.id);
        if (existingTarget && existingTarget.merchantId !== matchedMerchant.id) {
          return NextResponse.json({ ok: false, error: 'অন্য মার্চেন্টের পণ্য সম্পাদনার অনুমতি নেই।' }, { status: 403 });
        }
        prod.merchantId = matchedMerchant.id;
        prod.merchantName = matchedMerchant.shopName;
        if (matchedMerchant.facebookPixelId && !prod.facebookPixelId) {
          prod.facebookPixelId = matchedMerchant.facebookPixelId;
        }
      }

      const updatedDb = await writeDb((state) => {
        const exists = state.products.some((p) => p.id === prod.id);
        const products = exists
          ? state.products.map((p) => (p.id === prod.id ? prod : p))
          : [prod, ...state.products];

        const notifications = sendPush
          ? [
              {
                id: `notif-${Date.now()}`,
                title: `🛍️ নতুন পণ্য: ${prod.nameBn}`,
                message: `মাত্র ৳${prod.price} টাকায় অর্ডার করুন!`,
                link: `/shop`,
                sendChromePush: true,
                createdAt: new Date().toISOString(),
              },
              ...state.notifications,
            ]
          : state.notifications;

        return { ...state, products, notifications };
      });
      return NextResponse.json({ ok: true, products: updatedDb.products, notifications: updatedDb.notifications });
    }

    if (action === 'DELETE_PRODUCT' && (isSuper || isProdMgr || matchedMerchant)) {
      const targetProd = db.products.find((p) => p.id === payload.productId);
      if (matchedMerchant && targetProd?.merchantId !== matchedMerchant.id) {
        return NextResponse.json({ ok: false, error: 'অন্য মার্চেন্টের পণ্য মোছার অনুমতি নেই।' }, { status: 403 });
      }
      const updatedDb = await writeDb((state) => ({
        ...state,
        products: state.products.filter((p) => p.id !== payload.productId),
      }));
      return NextResponse.json({ ok: true, products: updatedDb.products });
    }

    if (action === 'MERCHANT_UPDATE_PROFILE' && (matchedMerchant || isSuper)) {
      const merchantId = matchedMerchant ? matchedMerchant.id : payload.merchantId;
      const updates = payload.updates || {};

      // If Super Admin updates Master Hub profile settings directly from /merchant
      if (isSuper && merchantId === 'admin-master') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          settings: {
            ...state.settings,
            ...(updates.facebookPixelId !== undefined ? { defaultFacebookPixelId: updates.facebookPixelId } : {}),
            ...(updates.deliveryWhatsAppGroupUrl !== undefined ? { deliveryWhatsAppGroupUrl: updates.deliveryWhatsAppGroupUrl } : {}),
            ...(updates.steadfastApiKey !== undefined ? { steadfastApiKey: updates.steadfastApiKey } : {}),
            ...(updates.steadfastSecretKey !== undefined ? { steadfastSecretKey: updates.steadfastSecretKey } : {}),
          },
        }));
        return NextResponse.json({
          ok: true,
          merchant: {
            id: 'admin-master',
            shopName: 'Rabian মাস্টার মার্চেন্ট',
            ownerName: 'সুপার অ্যাডমিন',
            phone: updatedDb.settings.whatsappNumber || '8801700000000',
            email: '',
            password: cleanPass,
            status: 'active' as const,
            category: 'কেন্দ্রীয় স্টোর',
            address: 'রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস',
            payoutPhone: updatedDb.settings.whatsappNumber || '',
            payoutMethod: 'bkash' as const,
            facebookPixelId: updatedDb.settings.defaultFacebookPixelId || '',
            deliveryWhatsAppGroupUrl: updatedDb.settings.deliveryWhatsAppGroupUrl || '',
            steadfastApiKey: updatedDb.settings.steadfastApiKey || '',
            steadfastSecretKey: updatedDb.settings.steadfastSecretKey || '',
            commissionRate: 0,
            totalSales: 0,
            totalOrders: updatedDb.orders.length,
            createdAt: new Date().toISOString(),
          },
        });
      }

      const updatedDb = await writeDb((state) => ({
        ...state,
        merchants: (state.merchants || []).map((m) =>
          m.id === merchantId ? { ...m, ...updates } : m
        ),
      }));
      const found = (updatedDb.merchants || []).find((m) => m.id === merchantId);
      return NextResponse.json({ ok: true, merchant: found });
    }

    if (action === 'UPDATE_ORDER_STATUS' && (isSuper || isProdMgr || matchedMerchant)) {
      const {
        orderId,
        status,
        cancellationReason,
        assignedRiderName,
        assignedRiderPhone,
        dispatchedVia,
        note,
      } = payload || {};

      if (!orderId || !status) {
        return NextResponse.json({ ok: false, error: 'অর্ডার আইডি এবং স্ট্যাটাস প্রয়োজন।' }, { status: 400 });
      }

      const targetOrder = db.orders.find((o) => o.orderId === orderId);
      if (!targetOrder) {
        return NextResponse.json({ ok: false, error: 'অর্ডারটি পাওয়া যায়নি।' }, { status: 404 });
      }

      if (matchedMerchant) {
        const hasAccess = (targetOrder.items || []).some((it) => it.merchantId === matchedMerchant.id);
        if (!hasAccess) {
          return NextResponse.json({ ok: false, error: 'এই অর্ডারের স্ট্যাটাস পরিবর্তনের অনুমতি আপনার নেই।' }, { status: 403 });
        }
      }

      const actorName = matchedMerchant
        ? `${matchedMerchant.shopName} (মার্চেন্ট)`
        : isSuper
        ? 'সুপার অ্যাডমিন'
        : 'প্রোডাক্ট ম্যানেজার';

      const isCancelling = status === 'cancelled' || status === 'Cancelled';

      const updatedDb = await writeDb((state) => ({
        ...state,
        orders: state.orders.map((o) => {
          if (o.orderId === orderId) {
            const currentHistory = o.statusHistory || [];
            return {
              ...o,
              status,
              ...(isCancelling
                ? {
                    cancellationReason: cancellationReason || 'অর্ডার বাতিল করা হয়েছে',
                    cancelledBy: actorName,
                    cancelledAt: new Date().toISOString(),
                  }
                : {}),
              ...(assignedRiderName !== undefined ? { assignedRiderName } : {}),
              ...(assignedRiderPhone !== undefined ? { assignedRiderPhone } : {}),
              ...(dispatchedVia !== undefined ? { dispatchedVia } : {}),
              statusHistory: [
                ...currentHistory,
                {
                  status,
                  timestamp: new Date().toISOString(),
                  note: note || (isCancelling ? `বাতিলের কারণ: ${cancellationReason || 'উল্লেখ করা হয়নি'}` : undefined),
                  actor: actorName,
                },
              ],
            };
          }
          return o;
        }),
      }));

      const returnedOrders = matchedMerchant
        ? updatedDb.orders.filter((o) => (o.items || []).some((it) => it.merchantId === matchedMerchant.id))
        : updatedDb.orders;

      return NextResponse.json({ ok: true, orders: returnedOrders });
    }

    // Club Application Status Update
    if (action === 'UPDATE_CLUB_APP' && (isSuper || matchedClub)) {
      const updatedDb = await writeDb((state) => ({
        ...state,
        clubApplications: state.clubApplications.map((app) =>
          app.id === payload.appId ? { ...app, status: payload.status } : app
        ),
      }));
      const filtered = isSuper
        ? updatedDb.clubApplications
        : updatedDb.clubApplications.filter((a) => a.clubId === matchedClub!.id);
      return NextResponse.json({ ok: true, applications: filtered });
    }

    // Club Information & Activity Photos Update (Super Admin OR Matching Club Admin)
    if (action === 'SAVE_CLUB_INFO' && (isSuper || matchedClub)) {
      const clubData = payload.club;
      const targetClubId = isSuper ? clubData.id : matchedClub!.id;
      const updatedDb = await writeDb((state) => {
        let found = false;
        const clubs = state.clubs.map((c) => {
          if (c.id === targetClubId || c.id === `club-${targetClubId}` || `club-${c.id}` === targetClubId) {
            found = true;
            return {
              ...c,
              nameBn: clubData.nameBn || c.nameBn,
              descriptionBn: clubData.descriptionBn !== undefined ? clubData.descriptionBn : c.descriptionBn,
              mottoBn: clubData.mottoBn !== undefined ? clubData.mottoBn : c.mottoBn,
              roomLocationBn: clubData.roomLocationBn !== undefined ? clubData.roomLocationBn : c.roomLocationBn,
              contactEmail: clubData.contactEmail !== undefined ? clubData.contactEmail : c.contactEmail,
              facebookUrl: clubData.facebookUrl !== undefined ? clubData.facebookUrl : c.facebookUrl,
              images: clubData.images || c.images || [],
              whatTheyDo: clubData.whatTheyDo || c.whatTheyDo,
            };
          }
          return c;
        });
        if (!found && isSuper && clubData.id) {
          clubs.push({
            id: clubData.id,
            shortName: clubData.shortName || clubData.id.toUpperCase(),
            nameBn: clubData.nameBn || clubData.id,
            categoryBn: clubData.categoryBn || 'ক্লাব ও সংগঠন',
            descriptionBn: clubData.descriptionBn || '',
            mottoBn: clubData.mottoBn || '',
            roomLocationBn: clubData.roomLocationBn || '',
            contactEmail: clubData.contactEmail || '',
            facebookUrl: clubData.facebookUrl || '',
            images: clubData.images || [],
            whatTheyDo: clubData.whatTheyDo || [],
            password: `${clubData.id}-2026`,
          });
        }
        return { ...state, clubs };
      });
      const safeClubs = updatedDb.clubs.map(({ password, ...rest }) => rest);
      return NextResponse.json({ ok: true, clubs: safeClubs });
    }

    // Super Admin Exclusive Controls
    if (isSuper) {
      if (action === 'SAVE_DEPARTMENT_INFO') {
        const deptData = payload.department;
        const updatedDb = await writeDb((state) => {
          const departments = { ...(state.departments || {}) };
          departments[deptData.departmentId] = deptData;
          return { ...state, departments };
        });
        return NextResponse.json({ ok: true, departments: updatedDb.departments });
      }

      if (action === 'SAVE_MAP_SPOT') {
        const spot = payload.spot;
        const updatedDb = await writeDb((state) => ({
          ...state,
          mapSpots: { ...state.mapSpots, [spot.spotId]: spot },
        }));
        return NextResponse.json({ ok: true, mapSpots: updatedDb.mapSpots });
      }

      if (action === 'UPDATE_SETTINGS') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          settings: { ...state.settings, ...payload.settings },
          clubs: payload.clubs || state.clubs,
        }));
        return NextResponse.json({ ok: true, settings: updatedDb.settings, clubs: updatedDb.clubs });
      }

      if (action === 'SAVE_ARTICLE') {
        const article = payload.article;
        const sendPush = Boolean(payload.sendChromePush);
        const updatedDb = await writeDb((state) => {
          const exists = state.articles.some((a) => a.id === article.id);
          const articles = exists
            ? state.articles.map((a) => (a.id === article.id ? article : a))
            : [article, ...state.articles];

          // Clean out previous headline for this article title
          let breakingNews = (state.settings.breakingNews || []).filter(
            (b) => !b.includes(article.title)
          );
          let breakingNewsItems = (state.settings.breakingNewsItems || []).filter(
            (b) => b.articleId !== article.id && !b.title.includes(article.title)
          );

          // ONLY add to breakingNews if it is Published!
          const isBreakingArticle =
            article.category === 'ব্রেকিং নিউজ' ||
            article.category === '🔥 ব্রেকিং নিউজ' ||
            Boolean(article.isBreaking);
          if (article.status === 'Published' && isBreakingArticle) {
            const headline = `🔥 ${article.title}`;
            breakingNews = [headline, ...breakingNews];
            breakingNewsItems = [
              {
                id: `art-${article.id}`,
                title: article.title,
                imageUrl: article.images?.[0] || '/campus/paris-road-rain.jpg',
                link: `/inside-ru/${article.id}`,
                articleId: article.id,
                createdAt: article.createdAt || new Date().toISOString(),
                isActive: true,
              },
              ...breakingNewsItems,
            ];
          }

          const notifications = sendPush && article.status === 'Published'
            ? [
                {
                  id: `notif-${Date.now()}`,
                  title: article.category === 'ব্রেকিং নিউজ' ? `🔥 ব্রেকিং নিউজ: ${article.title}` : `📰 ${article.title}`,
                  message: `${article.authorName} (${article.category})`,
                  link: `/inside-ru/${article.id}`,
                  sendChromePush: true,
                  createdAt: new Date().toISOString(),
                },
                ...state.notifications,
              ]
            : state.notifications;

          return { ...state, articles, settings: { ...state.settings, breakingNews, breakingNewsItems }, notifications };
        });
        return NextResponse.json({
          ok: true,
          articles: updatedDb.articles,
          settings: updatedDb.settings,
          notifications: updatedDb.notifications,
        });
      }

      if (action === 'APPROVE_ARTICLE') {
        const updatedDb = await writeDb((state) => {
          const target = state.articles.find((a) => a.id === payload.articleId);
          const newStatus = payload.status || 'Published';
          const articles = state.articles.map((a) =>
            a.id === payload.articleId ? { ...a, status: newStatus } : a
          );

          let breakingNews = [...(state.settings.breakingNews || [])];
          let breakingNewsItems = [...(state.settings.breakingNewsItems || [])];
          if (target) {
            // Remove old headline first
            breakingNews = breakingNews.filter((b) => !b.includes(target.title));
            breakingNewsItems = breakingNewsItems.filter((b) => b.articleId !== target.id && !b.title.includes(target.title));
            // Only add if newStatus is Published and is breaking
            const targetIsBreaking =
              target.category === 'ব্রেকিং নিউজ' ||
              target.category === '🔥 ব্রেকিং নিউজ' ||
              Boolean(target.isBreaking);
            if (newStatus === 'Published' && targetIsBreaking) {
              breakingNews = [`🔥 ${target.title}`, ...breakingNews];
              breakingNewsItems = [
                {
                  id: `art-${target.id}`,
                  title: target.title,
                  imageUrl: target.images?.[0] || '/campus/paris-road-rain.jpg',
                  link: `/inside-ru/${target.id}`,
                  articleId: target.id,
                  createdAt: target.createdAt || new Date().toISOString(),
                  isActive: true,
                },
                ...breakingNewsItems,
              ];
            }
          }

          return { ...state, articles, settings: { ...state.settings, breakingNews, breakingNewsItems } };
        });
        return NextResponse.json({ ok: true, articles: updatedDb.articles, settings: updatedDb.settings });
      }

      if (action === 'DELETE_ARTICLE') {
        const updatedDb = await writeDb((state) => {
          const target = state.articles.find((a) => a.id === payload.articleId);
          const articles = state.articles.filter((a) => a.id !== payload.articleId);
          let breakingNews = [...(state.settings.breakingNews || [])];
          let breakingNewsItems = [...(state.settings.breakingNewsItems || [])];
          if (target) {
            breakingNews = breakingNews.filter((b) => !b.includes(target.title));
            breakingNewsItems = breakingNewsItems.filter((b) => b.articleId !== target.id && !b.title.includes(target.title));
          }
          return { ...state, articles, settings: { ...state.settings, breakingNews, breakingNewsItems } };
        });
        return NextResponse.json({ ok: true, articles: updatedDb.articles, settings: updatedDb.settings });
      }

      // Breaking News Item Custom Management
      if (action === 'SAVE_BREAKING_NEWS_ITEM') {
        const item = payload.item;
        const updatedDb = await writeDb((state) => {
          const current = state.settings.breakingNewsItems || [];
          const exists = current.some((it) => it.id === item.id);
          const breakingNewsItems = exists
            ? current.map((it) => (it.id === item.id ? item : it))
            : [item, ...current];
          return {
            ...state,
            settings: { ...state.settings, breakingNewsItems },
          };
        });
        return NextResponse.json({ ok: true, settings: updatedDb.settings });
      }

      if (action === 'DELETE_BREAKING_NEWS_ITEM') {
        const { id } = payload;
        const updatedDb = await writeDb((state) => {
          const current = state.settings.breakingNewsItems || [];
          const breakingNewsItems = current.filter((it) => it.id !== id);
          return {
            ...state,
            settings: { ...state.settings, breakingNewsItems },
          };
        });
        return NextResponse.json({ ok: true, settings: updatedDb.settings });
      }

      // Admin Merchant Management
      if (action === 'ADMIN_APPROVE_MERCHANT') {
        const { merchantId, status } = payload;
        const updatedDb = await writeDb((state) => ({
          ...state,
          merchants: (state.merchants || []).map((m) =>
            m.id === merchantId ? { ...m, status: status || 'active' } : m
          ),
        }));
        return NextResponse.json({ ok: true, merchants: updatedDb.merchants });
      }

      if (action === 'ADMIN_UPDATE_MERCHANT') {
        const { merchant } = payload;
        const updatedDb = await writeDb((state) => ({
          ...state,
          merchants: (state.merchants || []).map((m) =>
            m.id === merchant.id ? { ...m, ...merchant } : m
          ),
        }));
        return NextResponse.json({ ok: true, merchants: updatedDb.merchants });
      }

      if (action === 'ADMIN_DELETE_MERCHANT') {
        const { merchantId } = payload;
        const updatedDb = await writeDb((state) => ({
          ...state,
          merchants: (state.merchants || []).filter((m) => m.id !== merchantId),
        }));
        return NextResponse.json({ ok: true, merchants: updatedDb.merchants });
      }

      if (action === 'APPROVE_ALUMNI') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          alumni: state.alumni.map((al) =>
            al.id === payload.alumniId ? { ...al, approved: payload.approved } : al
          ),
        }));
        return NextResponse.json({ ok: true, alumni: updatedDb.alumni });
      }

      if (action === 'DELETE_ALUMNI') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          alumni: state.alumni.filter((al) => al.id !== payload.alumniId),
        }));
        return NextResponse.json({ ok: true, alumni: updatedDb.alumni });
      }

      if (action === 'SAVE_BLOOD_DONOR') {
        const donor = payload?.donor;
        if (!donor?.nameBn || !donor?.bloodGroup || !donor?.phone) {
          return NextResponse.json({ ok: false, error: 'রক্তদাতার নাম, গ্রুপ ও ফোন প্রয়োজন।' }, { status: 400 });
        }
        const cleanDonor = {
          ...donor,
          id: donor.id || `bd-${Date.now()}`,
          isPublicPhone: donor.isPublicPhone !== false,
          createdAt: donor.createdAt || new Date().toISOString(),
        };
        const updatedDb = await writeDb((state) => {
          const list = state.bloodDonors || [];
          const exists = list.some((d) => d.id === cleanDonor.id);
          return {
            ...state,
            bloodDonors: exists ? list.map((d) => (d.id === cleanDonor.id ? cleanDonor : d)) : [cleanDonor, ...list],
          };
        });
        return NextResponse.json({ ok: true, bloodDonors: updatedDb.bloodDonors });
      }

      if (action === 'DELETE_BLOOD_DONOR') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          bloodDonors: (state.bloodDonors || []).filter((d) => d.id !== payload?.donorId),
        }));
        return NextResponse.json({ ok: true, bloodDonors: updatedDb.bloodDonors });
      }

      // Marathon Management (Super Admin)
      if (action === 'SAVE_MARATHON') {
        const marathonData = payload?.marathon;
        if (!marathonData || !marathonData.title) {
          return NextResponse.json({ ok: false, error: 'ম্যারাথনের সঠিক শিরোনাম দিন।' }, { status: 400 });
        }
        const updatedDb = await writeDb((state) => {
          const list = [...(state.marathons || [])];
          const idx = list.findIndex((m) => m.id === marathonData.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...marathonData };
          } else {
            list.unshift({
              ...marathonData,
              id: marathonData.id || `marathon_${Date.now()}`,
              createdAt: new Date().toISOString(),
            });
          }
          return { ...state, marathons: list };
        });
        return NextResponse.json({ ok: true, marathons: updatedDb.marathons });
      }

      if (action === 'TOGGLE_MARATHON_REGISTRATION') {
        const { marathonId, isOpen } = payload || {};
        const updatedDb = await writeDb((state) => ({
          ...state,
          marathons: (state.marathons || []).map((m) =>
            m.id === marathonId ? { ...m, isOpen: Boolean(isOpen) } : m
          ),
        }));
        return NextResponse.json({ ok: true, marathons: updatedDb.marathons });
      }

      if (action === 'DELETE_MARATHON') {
        const { marathonId } = payload || {};
        const updatedDb = await writeDb((state) => ({
          ...state,
          marathons: (state.marathons || []).filter((m) => m.id !== marathonId),
          marathonRegistrations: (state.marathonRegistrations || []).filter(
            (r) => r.marathonId !== marathonId
          ),
        }));
        return NextResponse.json({
          ok: true,
          marathons: updatedDb.marathons,
          marathonRegistrations: updatedDb.marathonRegistrations,
        });
      }

      if (action === 'DELETE_MARATHON_REGISTRATION') {
        const { registrationId } = payload || {};
        const updatedDb = await writeDb((state) => ({
          ...state,
          marathonRegistrations: (state.marathonRegistrations || []).filter(
            (r) => r.id !== registrationId
          ),
        }));
        return NextResponse.json({ ok: true, marathonRegistrations: updatedDb.marathonRegistrations });
      }

      if (action === 'SAVE_AI_CONFIG') {
        const aiConfig = payload?.aiConfig;
        const updatedDb = await writeDb((state) => ({
          ...state,
          settings: {
            ...state.settings,
            aiConfig: {
              ...(state.settings.aiConfig || {}),
              ...(aiConfig || {}),
            },
          },
        }));
        return NextResponse.json({ ok: true, settings: updatedDb.settings });
      }

      if (action === 'SEND_BROADCAST') {
        const notif = {
          id: `notif-${Date.now()}`,
          title: payload.title,
          message: payload.message,
          link: payload.link || '/',
          sendChromePush: Boolean(payload.sendChromePush),
          createdAt: new Date().toISOString(),
        };
        const updatedDb = await writeDb((state) => ({
          ...state,
          notifications: [notif, ...state.notifications],
        }));
        return NextResponse.json({ ok: true, notifications: updatedDb.notifications });
      }

      if (action === 'SYNC_SUPABASE') {
        const full = await readDb();
        const { error } = await supabase.from('app_state').upsert(
          {
            key: 'main',
            data: full,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
        if (error) {
          return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ ok: true, message: 'সফলভাবে Supabase ক্লাউড ডেটাবেজে সম্পূর্ণ তথ্য সিঙ্ক হয়েছে!' });
      }
    }

    return NextResponse.json({ ok: false, error: 'অনুমতি নেই বা অজানা অ্যাকশন' }, { status: 403 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
