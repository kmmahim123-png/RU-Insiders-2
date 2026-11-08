import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await readDb();
  // Never leak passwords to public client
  const safeClubs = db.clubs.map(({ password, ...rest }) => rest);
  return NextResponse.json(
    {
      settings: {
        whatsappNumber: db.settings.whatsappNumber,
        deliveryCharges: db.settings.deliveryCharges,
        categories: db.settings.categories,
        breakingNews: db.settings.breakingNews,
      },
      products: db.products,
      mapSpots: db.mapSpots,
      clubs: safeClubs,
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
      const matchedClub = db.clubs.find((c) => c.password === cleanPass);
      if (matchedClub) {
        return NextResponse.json({
          ok: true,
          role: 'CLUB_ADMIN',
          clubId: matchedClub.id,
          roleTitle: `${matchedClub.nameBn} — ক্লাব পোর্টাল`,
          applications: db.clubApplications.filter((app) => app.clubId === matchedClub.id),
        });
      }
      return NextResponse.json({ ok: false, error: 'পাসওয়ার্ড সঠিক নয়! আবার চেষ্টা করুন।' }, { status: 401 });
    }

    // 2. Customer Order Creation with Server-Side Price Validation
    if (action === 'CREATE_ORDER') {
      const { customerName, phone, deliveryZone, addressDetails, items } = payload;
      if (!customerName || !phone || !addressDetails || !items || items.length === 0) {
        return NextResponse.json({ ok: false, error: 'সব প্রয়োজনীয় তথ্য পূরণ করুন' }, { status: 400 });
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
        deliveryZone,
        addressDetails: addressDetails.trim(),
        items: validatedItems,
        subtotal: calculatedSubtotal,
        deliveryCharge,
        totalAmount: calculatedSubtotal + deliveryCharge,
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
      };

      await writeDb((state) => ({
        ...state,
        orders: [newOrder, ...state.orders],
      }));

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

    // 8. Role-Protected Actions
    const isSuper = password === db.settings.superAdminPassword;
    const isProdMgr = password === db.settings.productManagerPassword;
    const matchedClub = db.clubs.find((c) => c.password === password);

    // Product & Order Manager + Super Admin Actions
    if (action === 'SAVE_PRODUCT' && (isSuper || isProdMgr)) {
      const prod = payload.product;
      const sendPush = Boolean(payload.sendChromePush);
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
                message: `মাত্র ৳${prod.price} টাকায় প্রি-অর্ডার করুন!`,
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

    if (action === 'DELETE_PRODUCT' && (isSuper || isProdMgr)) {
      const updatedDb = await writeDb((state) => ({
        ...state,
        products: state.products.filter((p) => p.id !== payload.productId),
      }));
      return NextResponse.json({ ok: true, products: updatedDb.products });
    }

    if (action === 'UPDATE_ORDER_STATUS' && (isSuper || isProdMgr)) {
      const updatedDb = await writeDb((state) => ({
        ...state,
        orders: state.orders.map((o) => (o.orderId === payload.orderId ? { ...o, status: payload.status } : o)),
      }));
      return NextResponse.json({ ok: true, orders: updatedDb.orders });
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

    // Super Admin Exclusive Controls
    if (isSuper) {
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

          const notifications = sendPush
            ? [
                {
                  id: `notif-${Date.now()}`,
                  title: `📰 ${article.title}`,
                  message: `${article.authorName} (${article.category})`,
                  link: `/inside-ru`,
                  sendChromePush: true,
                  createdAt: new Date().toISOString(),
                },
                ...state.notifications,
              ]
            : state.notifications;

          return { ...state, articles, notifications };
        });
        return NextResponse.json({ ok: true, articles: updatedDb.articles, notifications: updatedDb.notifications });
      }

      if (action === 'APPROVE_ARTICLE') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          articles: state.articles.map((a) =>
            a.id === payload.articleId ? { ...a, status: payload.status || 'Published' } : a
          ),
        }));
        return NextResponse.json({ ok: true, articles: updatedDb.articles });
      }

      if (action === 'DELETE_ARTICLE') {
        const updatedDb = await writeDb((state) => ({
          ...state,
          articles: state.articles.filter((a) => a.id !== payload.articleId),
        }));
        return NextResponse.json({ ok: true, articles: updatedDb.articles });
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
    }

    return NextResponse.json({ ok: false, error: 'অনুমতি নেই বা অজানা অ্যাকশন' }, { status: 403 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
