import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const STEADFAST_BASE_URL = 'https://portal.packzy.com/api/v1';

/**
 * Helper to resolve Steadfast credentials:
 * 1. Checks if the merchant associated with the order has their own keys.
 * 2. Falls back to central site settings.
 */
function resolveCredentials(db: any, orderMerchantId?: string, explicitMerchantId?: string) {
  const targetMerchantId = orderMerchantId || explicitMerchantId;
  if (targetMerchantId) {
    const merchant = (db.merchants || []).find((m: any) => m.id === targetMerchantId);
    if (merchant?.steadfastApiKey && merchant?.steadfastSecretKey) {
      return {
        apiKey: merchant.steadfastApiKey.trim(),
        secretKey: merchant.steadfastSecretKey.trim(),
        source: `মার্চেন্ট (${merchant.shopName})`,
      };
    }
  }

  if (db.settings?.steadfastApiKey && db.settings?.steadfastSecretKey) {
    return {
      apiKey: db.settings.steadfastApiKey.trim(),
      secretKey: db.settings.steadfastSecretKey.trim(),
      source: 'কেন্দ্রীয় অ্যাডমিন',
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, merchantId, note, trackingCode, password } = body;
    const db = await readDb();

    // Verify caller authentication
    const cleanPass = (password || '').trim();
    const isSuper = cleanPass === db.settings.superAdminPassword;
    const isProdMgr = cleanPass === db.settings.productManagerPassword;
    const matchedMerchant = (db.merchants || []).find((m) => m.password === cleanPass);

    if (!isSuper && !isProdMgr && !matchedMerchant) {
      return NextResponse.json({ ok: false, error: 'অনুমতি নেই। পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' }, { status: 401 });
    }

    // 1. CREATE_ORDER on Steadfast
    if (action === 'CREATE_ORDER') {
      if (!orderId) {
        return NextResponse.json({ ok: false, error: 'অর্ডার আইডি প্রয়োজন।' }, { status: 400 });
      }

      const order = db.orders.find((o) => o.orderId === orderId);
      if (!order) {
        return NextResponse.json({ ok: false, error: `অর্ডার #${orderId} খুঁজে পাওয়া যায়নি।` }, { status: 404 });
      }

      // Check merchant ownership
      if (matchedMerchant) {
        const hasAccess = (order.items || []).some((it) => it.merchantId === matchedMerchant.id);
        if (!hasAccess) {
          return NextResponse.json({ ok: false, error: 'অন্য মার্চেন্টের অর্ডার Steadfast-এ পাঠানোর অনুমতি নেই।' }, { status: 403 });
        }
      }

      const orderMerchantId = order.items?.[0]?.merchantId;
      const creds = resolveCredentials(db, orderMerchantId, matchedMerchant?.id || merchantId);

      if (!creds || !creds.apiKey || !creds.secretKey) {
        return NextResponse.json({
          ok: false,
          error: 'Steadfast Courier Api-Key এবং Secret-Key কনফিগার করা নেই। অনুগ্রহ করে মার্চেন্ট ড্যাশবোর্ড সেটিংস অথবা কেন্দ্রীয় অ্যাডমিন প্যানেলে আপনার Steadfast API Key ও Secret Key সেভ করুন।',
          hint: 'portal.packzy.com থেকে API Credentials সংগ্রহ করুন।',
        }, { status: 400 });
      }

      const payload = {
        invoice: order.orderId,
        recipient_name: order.customerName,
        recipient_phone: order.phone,
        recipient_address: `${order.addressDetails} (${order.deliveryZone === 'campus' ? 'মতিহার ক্যাম্পাস' : order.deliveryZone === 'city' ? 'রাজশাহী সিটি' : 'সারা বাংলাদেশ'})`,
        cod_amount: order.totalAmount,
        note: note || `Rabian Order ${order.orderId} - ${order.items.map((i) => `${i.nameBn} (${i.selectedOption}) x${i.quantity}`).join(', ')}`,
      };

      try {
        const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': creds.apiKey,
            'Secret-Key': creds.secretKey,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && (data.status === 200 || data.consignment)) {
          const consignment = data.consignment || {};
          const cid = consignment.consignment_id;
          const tracking = consignment.tracking_code || `STDF-${Date.now()}`;
          const sfStatus = consignment.status || 'in_review';

          // Update order in database to stage 3: 'with_rider'
          const updatedDb = await writeDb((state) => ({
            ...state,
            orders: state.orders.map((o) => {
              if (o.orderId === orderId) {
                const history = o.statusHistory || [];
                return {
                  ...o,
                  status: 'with_rider' as const,
                  steadfastConsignmentId: cid,
                  steadfastTrackingCode: tracking,
                  steadfastStatus: sfStatus,
                  dispatchedVia: 'steadfast' as const,
                  statusHistory: [
                    ...history,
                    {
                      status: 'with_rider',
                      timestamp: new Date().toISOString(),
                      note: `Steadfast কুরিয়ারে বুকিং সম্পন্ন। ট্র্যাকিং কোড: ${tracking} (${creds.source})`,
                      actor: matchedMerchant ? matchedMerchant.shopName : 'Admin',
                    },
                  ],
                };
              }
              return o;
            }),
          }));

          const updatedOrder = updatedDb.orders.find((o) => o.orderId === orderId);

          return NextResponse.json({
            ok: true,
            message: 'সফলভাবে Steadfast Courier-এ অর্ডার বুকিং সম্পন্ন হয়েছে!',
            consignment: {
              ...consignment,
              tracking_code: tracking,
              consignment_id: cid,
            },
            order: updatedOrder,
            source: creds.source,
          });
        } else {
          return NextResponse.json({
            ok: false,
            error: data.message || data.error || 'Steadfast API থেকে অর্ডার তৈরিতে ত্রুটি দেখা দিয়েছে।',
            details: data,
          }, { status: 400 });
        }
      } catch (networkErr: any) {
        return NextResponse.json({
          ok: false,
          error: `Steadfast সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি: ${networkErr.message}`,
        }, { status: 502 });
      }
    }

    // 2. CHECK_STATUS from Steadfast
    if (action === 'CHECK_STATUS') {
      const targetTracking = trackingCode || (orderId ? db.orders.find((o) => o.orderId === orderId)?.steadfastTrackingCode : null);
      if (!targetTracking) {
        return NextResponse.json({ ok: false, error: 'Steadfast ট্র্যাকিং কোড প্রয়োজন।' }, { status: 400 });
      }

      const order = orderId ? db.orders.find((o) => o.orderId === orderId) : null;
      const creds = resolveCredentials(db, order?.items?.[0]?.merchantId, matchedMerchant?.id || merchantId);

      if (!creds) {
        return NextResponse.json({ ok: false, error: 'Steadfast API Credentials পাওয়া যায়নি।' }, { status: 400 });
      }

      try {
        const res = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${encodeURIComponent(targetTracking)}`, {
          method: 'GET',
          headers: {
            'Api-Key': creds.apiKey,
            'Secret-Key': creds.secretKey,
          },
        });

        const data = await res.json();
        const sfStatus = data.delivery_status || data.status;

        // Auto advance order status to 'delivered' if Steadfast reports delivered
        if (orderId && sfStatus) {
          await writeDb((state) => ({
            ...state,
            orders: state.orders.map((o) => {
              if (o.orderId === orderId) {
                const isNowDelivered = String(sfStatus).toLowerCase() === 'delivered';
                const nextStatus = isNowDelivered ? 'delivered' : o.status;
                const history = o.statusHistory || [];
                return {
                  ...o,
                  status: nextStatus,
                  steadfastStatus: String(sfStatus),
                  ...(isNowDelivered && o.status !== 'delivered'
                    ? {
                        statusHistory: [
                          ...history,
                          {
                            status: 'delivered',
                            timestamp: new Date().toISOString(),
                            note: 'Steadfast কুরিয়ার ডেলিভারি সফল নিশ্চিত করেছে',
                            actor: 'steadfast_sync',
                          },
                        ],
                      }
                    : {}),
                };
              }
              return o;
            }),
          }));
        }

        return NextResponse.json({
          ok: true,
          trackingCode: targetTracking,
          deliveryStatus: sfStatus,
          data,
        });
      } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
      }
    }

    // 3. CHECK_BALANCE from Steadfast
    if (action === 'CHECK_BALANCE') {
      const creds = resolveCredentials(db, undefined, matchedMerchant?.id || merchantId);
      if (!creds) {
        return NextResponse.json({ ok: false, error: 'Steadfast Credentials পাওয়া যায়নি।' }, { status: 400 });
      }

      try {
        const res = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
          method: 'GET',
          headers: {
            'Api-Key': creds.apiKey,
            'Secret-Key': creds.secretKey,
          },
        });
        const data = await res.json();
        return NextResponse.json({
          ok: true,
          balance: data.current_balance ?? data.balance ?? 0,
          source: creds.source,
          data,
        });
      } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
      }
    }

    return NextResponse.json({ ok: false, error: 'অজানা অ্যাকশন।' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
