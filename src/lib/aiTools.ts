import { readDb, writeDb, DatabaseSchema } from '@/lib/db';
import { calculateDonorEligibility } from '@/lib/bloodUtils';
import { RU_DEPARTMENTS } from '@/lib/ruAcademicData';
import { RU_CAMPUS_PLACES } from '@/lib/ruCampusSvg';
import { RAJSHAHI_PDF_REGIONS } from '@/lib/rajshahiPdfRegions';
import { DIVISION_SPOTS } from '@/lib/divisionSpotsData';

export interface AiToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const AI_MCP_TOOLS: AiToolDefinition[] = [
  {
    name: 'check_blood_donors',
    description:
      'Search registered blood donors by blood group (A+, A-, B+, B-, O+, O-, AB+, AB-) or hall/department, calculate exact 90-day (3-month) eligibility from lastDonationDate, and return total eligible count, pending count, and donor phone numbers.',
    parameters: {
      type: 'object',
      properties: {
        bloodGroup: {
          type: 'string',
          description: 'Optional blood group filter like "B+", "O+", "A-", "AB+". Leave empty to summarize all groups.',
        },
        hallOrDept: {
          type: 'string',
          description: 'Optional department or residential hall filter.',
        },
        onlyEligible: {
          type: 'boolean',
          description: 'If true, only list eligible (90+ days) donors while still returning counts.',
        },
      },
    },
  },
  {
    name: 'find_department_and_teachers',
    description:
      'Search Rajshahi University departments and faculty teachers directory by department name, department code (CSE, BBA, Bangla, etc.), or teacher name. Returns department details and teachers with designation, phone number, email, room, and research area.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Department name, code, or teacher name to search for.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_products',
    description:
      'Search RU Insiders merchandise store products (hoodies, t-shirts, jerseys, khejurer gur, naru, souvenirs, merchant products) with live prices, sizes/weight options, stock status, and merchant names.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Product name, keyword, or category.',
        },
      },
    },
  },
  {
    name: 'create_shop_order',
    description:
      'Place a real Cash-on-Delivery order into the store intake workflow. ONLY call this after collecting customerName, valid phone, deliveryZone ("campus", "city", or "nationwide"), addressDetails, and at least one valid productId + selectedOption + quantity.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: 'Customer full name' },
        phone: { type: 'string', description: 'Customer mobile number (e.g. 017XXXXXXXX)' },
        deliveryZone: {
          type: 'string',
          enum: ['campus', 'city', 'nationwide'],
          description: '"campus" for RU Motihar/halls (free delivery), "city" for Rajshahi city, "nationwide" for courier',
        },
        addressDetails: { type: 'string', description: 'Hall & room number or full delivery address' },
        items: {
          type: 'array',
          description: 'Items to order',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              selectedOption: { type: 'string', description: 'Size (M/L/XL) or weight option or Standard' },
              quantity: { type: 'number' },
            },
            required: ['productId', 'quantity'],
          },
        },
      },
      required: ['customerName', 'phone', 'deliveryZone', 'addressDetails', 'items'],
    },
  },
  {
    name: 'track_shop_order',
    description:
      'Track an existing customer order by Order ID (e.g. RUI-123456) or customer phone number. Shows live 5-stage workflow status, rider info, and Steadfast tracking code.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Order ID or phone number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_campus_and_maps',
    description:
      'Search Rajshahi University campus places, Rajshahi district locations, division sightseeing spots, campus clubs, and published news articles.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Place, landmark, club, or news keyword' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_website_training_knowledge',
    description:
      'Retrieve custom admin-trained Q&A documents, website rules, delivery charges, and official WhatsApp contact info.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Optional topic keyword to filter training documents' },
      },
    },
  },
];

function normalizeBloodGroup(raw?: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace('POSITIVE', '+')
    .replace('NEGATIVE', '-')
    .replace('VE', '');
}

function stageLabelBn(status: string): string {
  switch (status) {
    case 'intake':
    case 'Pending':
      return '১. ইনটেক (নতুন অর্ডার)';
    case 'ready':
    case 'Confirmed':
      return '২. অর্ডার রেডি হলো';
    case 'with_rider':
    case 'Out for Delivery':
      return '৩. রাইডারকে দিলাম';
    case 'delivered':
    case 'Delivered':
      return '৪. ডেলিভারড সম্পন্ন';
    case 'cancelled':
    case 'Cancelled':
      return '৫. ক্যান্সেল';
    default:
      return status;
  }
}

export async function executeAiTool(name: string, rawArgs: any = {}): Promise<any> {
  const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {};
  const db = await readDb();

  switch (name) {
    case 'check_blood_donors': {
      const targetGroup = normalizeBloodGroup(args.bloodGroup);
      const filterPlace = (args.hallOrDept || '').trim().toLowerCase();
      const now = new Date();
      const donors = db.bloodDonors || [];

      const matched = donors.filter((d) => {
        if (targetGroup && d.bloodGroup.toUpperCase() !== targetGroup) return false;
        if (
          filterPlace &&
          !d.departmentBn.toLowerCase().includes(filterPlace) &&
          !(d.hallBn || '').toLowerCase().includes(filterPlace)
        ) {
          return false;
        }
        return true;
      });

      const enriched = matched.map((d) => {
        const elig = calculateDonorEligibility(d, now);
        return {
          id: d.id,
          nameBn: d.nameBn,
          bloodGroup: d.bloodGroup,
          phone: d.isPublicPhone !== false ? d.phone : 'অ্যাডমিন মাধ্যমে যোগাযোগ করুন',
          departmentBn: d.departmentBn,
          hallBn: d.hallBn || '',
          lastDonationDate: d.lastDonationDate || 'আগে দেননি / উল্লেখ নেই',
          daysSinceLastDonation: elig.daysSinceLastDonation,
          daysRemaining: elig.daysRemaining,
          isEligible: elig.isEligible,
          statusLabelBn: elig.statusLabelBn,
          note: d.note || '',
        };
      });

      const eligibleDonors = enriched.filter((d) => d.isEligible);
      const waitingDonors = enriched.filter((d) => !d.isEligible);

      // Summary counts across all blood groups if no single group requested
      const groupSummary: Record<string, { total: number; eligible: number }> = {};
      if (!targetGroup) {
        for (const d of enriched) {
          if (!groupSummary[d.bloodGroup]) groupSummary[d.bloodGroup] = { total: 0, eligible: 0 };
          groupSummary[d.bloodGroup].total += 1;
          if (d.isEligible) groupSummary[d.bloodGroup].eligible += 1;
        }
      }

      return {
        checkedAtDate: now.toISOString().slice(0, 10),
        eligibilityRuleDays: 90,
        requestedBloodGroup: targetGroup || 'সকল গ্রুপ',
        totalMatchedCount: enriched.length,
        eligibleCount: eligibleDonors.length,
        waitingCount: waitingDonors.length,
        ...(Object.keys(groupSummary).length > 0 ? { groupSummary } : {}),
        eligibleDonors: eligibleDonors.slice(0, 25),
        waitingDonors: args.onlyEligible ? [] : waitingDonors.slice(0, 10),
      };
    }

    case 'find_department_and_teachers': {
      const q = (args.query || '').trim().toLowerCase();
      const customDepts = db.departments || {};

      const combined = RU_DEPARTMENTS.map((d) => {
        const custom = customDepts[d.id];
        return {
          id: d.id,
          code: d.code,
          nameBn: custom?.nameBn || d.nameBn,
          nameEn: d.nameEn,
          facultyBn: d.facultyBn,
          locationBuildingBn: custom?.locationBuildingBn || d.locationBuildingBn,
          seatCount: custom?.seatCount || d.seatCount,
          degreeOfferedBn: custom?.degreeOfferedBn || d.degreeOfferedBn,
          overviewBn: custom?.overviewBn || d.overviewBn,
          teachers: custom?.teachers || [],
        };
      });

      const matches = combined.filter((d) => {
        if (!q) return true;
        const deptHit =
          d.nameBn.toLowerCase().includes(q) ||
          d.nameEn.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.facultyBn.toLowerCase().includes(q);
        const teacherHit = d.teachers.some(
          (t) =>
            t.nameBn.toLowerCase().includes(q) ||
            (t.designationBn || '').toLowerCase().includes(q) ||
            (t.researchAreaBn || '').toLowerCase().includes(q)
        );
        return deptHit || teacherHit;
      });

      return {
        totalMatches: matches.length,
        departments: matches.slice(0, 6).map((d) => ({
          ...d,
          teacherCount: d.teachers.length,
        })),
      };
    }

    case 'search_products': {
      const q = (args.query || '').trim().toLowerCase();
      const matched = (db.products || []).filter((p) => {
        if (!q) return true;
        return (
          p.nameBn.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortSummary.toLowerCase().includes(q) ||
          (p.merchantName || '').toLowerCase().includes(q)
        );
      });

      return {
        total: matched.length,
        deliveryCharges: db.settings.deliveryCharges,
        products: matched.slice(0, 12).map((p) => ({
          id: p.id,
          nameBn: p.nameBn,
          category: p.category,
          productType: p.productType,
          price: p.price,
          sizes: p.sizes || [],
          weightOptions: p.weightOptions || [],
          inStock: p.inStock,
          merchantName: p.merchantName || 'RU Insiders',
          shortSummary: p.shortSummary,
          link: `/shop/${p.id}`,
        })),
      };
    }

    case 'create_shop_order': {
      const customerName = (args.customerName || '').trim();
      const phone = (args.phone || '').trim();
      const deliveryZone = (args.deliveryZone || 'campus') as 'campus' | 'city' | 'nationwide';
      const addressDetails = (args.addressDetails || '').trim();
      const items = Array.isArray(args.items) ? args.items : [];

      if (!customerName || !phone || !addressDetails || items.length === 0) {
        return {
          ok: false,
          error: 'অর্ডার তৈরি করতে নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও অন্তত একটি পণ্য প্রয়োজন।',
        };
      }

      let subtotal = 0;
      const validatedItems: any[] = [];
      for (const it of items) {
        const prod = db.products.find((p) => p.id === it.productId);
        if (!prod) {
          return { ok: false, error: `পণ্য আইডি "${it.productId}" পাওয়া যায়নি।` };
        }
        if (!prod.inStock) {
          return { ok: false, error: `"${prod.nameBn}" বর্তমানে স্টকে নেই।` };
        }
        const chosenOpt =
          it.selectedOption ||
          (prod.productType === 'apparel'
            ? prod.sizes?.[0] || 'L'
            : prod.productType === 'food_weight'
            ? prod.weightOptions?.[0]?.label || 'Standard'
            : 'Standard');
        let unitPrice = prod.price;
        if (prod.productType === 'food_weight' && prod.weightOptions?.length) {
          const optMatch = prod.weightOptions.find((w) => w.label === chosenOpt);
          if (optMatch) unitPrice = optMatch.price;
        }
        const qty = Math.max(1, Number(it.quantity || 1));
        subtotal += unitPrice * qty;
        validatedItems.push({
          productId: prod.id,
          nameBn: prod.nameBn,
          image: prod.images?.[0] || '/mockups/hoodie-front.jpg',
          selectedOption: chosenOpt,
          unitPrice,
          quantity: qty,
          merchantId: prod.merchantId || '',
          merchantName: prod.merchantName || '',
        });
      }

      const deliveryCharge =
        deliveryZone === 'campus'
          ? db.settings.deliveryCharges.campus ?? 0
          : deliveryZone === 'city'
          ? db.settings.deliveryCharges.city ?? 40
          : db.settings.deliveryCharges.nationwide ?? 100;

      const newOrder = {
        orderId: `RUI-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName,
        phone,
        deliveryZone,
        addressDetails,
        items: validatedItems,
        subtotal,
        deliveryCharge,
        totalAmount: subtotal + deliveryCharge,
        status: 'intake' as const,
        statusHistory: [
          {
            status: 'intake',
            timestamp: new Date().toISOString(),
            note: 'AI অ্যাসিস্ট্যান্ট চ্যাটের মাধ্যমে অর্ডার জমা (১. ইনটেক)',
            actor: 'ai_agent',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      await writeDb((state) => {
        const updatedMerchants = (state.merchants || []).map((m) => {
          const mItems = validatedItems.filter((x) => x.merchantId === m.id);
          if (mItems.length > 0) {
            const added = mItems.reduce((s, x) => s + x.unitPrice * x.quantity, 0);
            return {
              ...m,
              totalSales: (m.totalSales || 0) + added,
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

      return {
        ok: true,
        orderId: newOrder.orderId,
        subtotal,
        deliveryCharge,
        totalAmount: newOrder.totalAmount,
        status: '১. ইনটেক',
        trackUrl: `/track?query=${newOrder.orderId}`,
      };
    }

    case 'track_shop_order': {
      const q = (args.query || '').trim().toLowerCase();
      const digits = q.replace(/\D/g, '');
      const matched = (db.orders || []).filter((o) => {
        const idHit = o.orderId.toLowerCase().includes(q);
        const phoneHit = digits.length >= 4 && o.phone.replace(/\D/g, '').includes(digits);
        return idHit || phoneHit;
      });
      return {
        totalFound: matched.length,
        cancellationPolicy: 'কাস্টমার নিজে সরাসরি ক্যান্সেল করতে পারবেন না; বাতিল বা পরিবর্তনের জন্য অফিসিয়াল WhatsApp-এ মেসেজ করতে হবে।',
        orders: matched.slice(0, 5).map((o) => ({
          orderId: o.orderId,
          customerName: o.customerName,
          totalAmount: o.totalAmount,
          stageBn: stageLabelBn(o.status),
          steadfastTrackingCode: o.steadfastTrackingCode || null,
          assignedRiderName: o.assignedRiderName || null,
          cancellationReason: o.cancellationReason || null,
          createdAt: o.createdAt,
        })),
      };
    }

    case 'search_campus_and_maps': {
      const q = (args.query || '').trim().toLowerCase();
      const ruSpots = RU_CAMPUS_PLACES.filter(
        (p) => !q || p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.descriptionBn.toLowerCase().includes(q)
      ).slice(0, 5);
      const distSpots = RAJSHAHI_PDF_REGIONS.filter(
        (p) => !q || p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.descriptionBn.toLowerCase().includes(q)
      ).slice(0, 4);
      const divSpots = DIVISION_SPOTS.filter(
        (p) => !q || p.nameBn.toLowerCase().includes(q) || p.locationBn.toLowerCase().includes(q) || p.summaryBn.toLowerCase().includes(q)
      ).slice(0, 5);
      const news = (db.articles || [])
        .filter((a) => a.status === 'Published' && (!q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)))
        .slice(0, 4)
        .map((a) => ({ id: a.id, title: a.title, category: a.category, summary: a.summary, link: `/inside-ru/${a.id}` }));
      const clubs = (db.clubs || [])
        .filter((c) => !q || c.nameBn.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q))
        .slice(0, 4)
        .map((c) => ({ shortName: c.shortName, nameBn: c.nameBn, descriptionBn: c.descriptionBn, roomLocationBn: c.roomLocationBn }));

      return {
        ruCampusSpots: ruSpots.map((s) => ({ nameBn: s.nameBn, descriptionBn: s.descriptionBn })),
        rajshahiSpots: distSpots.map((s) => ({ nameBn: s.nameBn, descriptionBn: s.descriptionBn })),
        divisionSpots: divSpots.map((s) => ({ nameBn: s.nameBn, locationBn: s.locationBn, summaryBn: s.summaryBn })),
        articles: news,
        clubs,
      };
    }

    case 'get_website_training_knowledge': {
      const topic = (args.topic || '').trim().toLowerCase();
      const docs = db.settings.aiConfig?.trainingDocs || [];
      const filteredDocs = topic
        ? docs.filter(
            (d) =>
              d.title.toLowerCase().includes(topic) ||
              d.category.toLowerCase().includes(topic) ||
              d.content.toLowerCase().includes(topic)
          )
        : docs;

      return {
        officialWhatsapp: db.settings.whatsappNumber,
        deliveryCharges: db.settings.deliveryCharges,
        categories: db.settings.categories,
        trainingDocs: filteredDocs.length > 0 ? filteredDocs : docs,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/** Build a compact live snapshot from current website data so any AI model answers accurately without manual training. */
export function buildLiveWebsiteSnapshot(db: DatabaseSchema): string {
  const now = new Date();
  const productsLines = (db.products || [])
    .slice(0, 20)
    .map(
      (p) =>
        `- [${p.id}] ${p.nameBn} (${p.category}): ৳${p.price} | ${p.inStock ? 'স্টকে আছে' : 'স্টক শেষ'}${
          p.sizes?.length ? ` | সাইজ: ${p.sizes.join('/')}` : ''
        }${p.weightOptions?.length ? ` | ওজন: ${p.weightOptions.join('/')}` : ''}${
          p.merchantName ? ` | শপ: ${p.merchantName}` : ''
        }`
    )
    .join('\n');

  const donors = db.bloodDonors || [];
  const groupCounts: Record<string, { total: number; eligible: number }> = {};
  const eligibleDonorLines: string[] = [];
  for (const d of donors) {
    const elig = calculateDonorEligibility(d, now);
    if (!groupCounts[d.bloodGroup]) groupCounts[d.bloodGroup] = { total: 0, eligible: 0 };
    groupCounts[d.bloodGroup].total += 1;
    if (elig.isEligible) {
      groupCounts[d.bloodGroup].eligible += 1;
      if (eligibleDonorLines.length < 20) {
        const phoneText = d.isPublicPhone !== false ? d.phone : 'অ্যাডমিন মাধ্যমে';
        eligibleDonorLines.push(
          `- ${d.bloodGroup} | ${d.nameBn} (${d.departmentBn}${d.hallBn ? `, ${d.hallBn}` : ''}) | ফোন: ${phoneText} | ${elig.statusLabelBn}`
        );
      }
    }
  }
  const bloodSummaryText = Object.entries(groupCounts)
    .map(([g, c]) => `${g}: ${c.eligible}/${c.total} জন যোগ্য`)
    .join(', ');

  const deptWithTeachersLines = Object.values(db.departments || {})
    .filter((d) => Array.isArray(d.teachers) && d.teachers.length > 0)
    .slice(0, 12)
    .map((d) => {
      const base = RU_DEPARTMENTS.find((r) => r.id === d.departmentId);
      const tList = (d.teachers || [])
        .map((t) => `${t.nameBn} (${t.designationBn}${t.phone ? `, ফোন: ${t.phone}` : ''}${t.roomBn ? `, ${t.roomBn}` : ''})`)
        .join('; ');
      return `- ${d.nameBn || base?.nameBn || d.departmentId}: ${tList}`;
    })
    .join('\n');

  const newsLines = (db.articles || [])
    .filter((a) => a.status === 'Published')
    .slice(0, 5)
    .map((a) => `- [${a.category}] ${a.title} (${a.summary.slice(0, 90)})`)
    .join('\n');

  const clubNames = (db.clubs || [])
    .slice(0, 12)
    .map((c) => `${c.shortName} (${c.nameBn})`)
    .join(', ');

  return `
=== ওয়েবসাইটের লাইভ ডাটাবেজ স্ন্যাপশট (স্বয়ংক্রিয়ভাবে সাইট থেকে সংগৃহীত) ===
১. শপ পণ্য তালিকা (মোট ${(db.products || []).length}টি):
${productsLines || '(কোনো পণ্য নেই)'}

২. রাবি ব্লাড ব্যাংক (৯০-দিন / ৩ মাস নিয়ম — মোট ${donors.length} জন নিবন্ধিত):
গ্রুপ সারসংক্ষেপ: ${bloodSummaryText || 'কোনো ডোনার নেই'}
বর্তমানে ৯০+ দিন পূর্ণ হয়ে রক্তদানে যোগ্য তালিকা:
${eligibleDonorLines.join('\n') || '(এই মুহূর্তে ৯০+ দিন যোগ্য কেউ নেই)'}

৩. বিভাগ ও শিক্ষকমণ্ডলী (মোট ${RU_DEPARTMENTS.length}টি বিভাগ — বিস্তারিত জানতে find_department_and_teachers টুল ব্যবহার করুন):
${deptWithTeachersLines || '(এখনো কোনো বিভাগে কাস্টম স্যার যোগ করা হয়নি — সাধারণ বিভাগ তথ্যের জন্য find_department_and_teachers টুল কল করুন)'}

৪. সর্বশেষ ব্রেকিং ও ক্যাম্পাস নিউজ:
${newsLines || '(কোনো প্রকাশিত নিউজ নেই)'}

৫. ক্যাম্পাস ক্লাবসমূহ: ${clubNames || 'RUCS, RUDEU, RUSC, RUPS, বাঁধন'}
৬. ম্যাপ গাইড: RU ক্যাম্পাসের ${RU_CAMPUS_PLACES.length}টি, রাজশাহী জেলার ${RAJSHAHI_PDF_REGIONS.length}টি ও বিভাগের ${DIVISION_SPOTS.length}টি স্পট রয়েছে।
`.trim();
}
