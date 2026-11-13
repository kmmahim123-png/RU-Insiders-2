/**
 * Meta Facebook Page & Messenger Automation Library for Rabian (রাবিয়ান)
 * Supports automated feed publishing, Messenger bot replies, and comment handling
 * using Meta Graph API v21.0.
 */

export interface FbPostPayload {
  message: string;
  link?: string;
  imageUrl?: string;
}

export interface FbPublishResult {
  ok: boolean;
  postId?: string;
  error?: string;
}

export interface FbSendMsgResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/** Publish a post (status update, link, or photo) to Facebook Page */
export async function publishFacebookPost(
  pageId: string,
  accessToken: string,
  payload: FbPostPayload
): Promise<FbPublishResult> {
  if (!pageId || !accessToken) {
    return { ok: false, error: 'Facebook Page ID or Access Token is missing.' };
  }

  try {
    // 1. If an image is provided, publish as photo post
    if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
      const url = `https://graph.facebook.com/v21.0/${pageId}/photos`;
      const params = new URLSearchParams({
        url: payload.imageUrl,
        caption: payload.link ? `${payload.message}\n\n👉 বিস্তারিত দেখুন: ${payload.link}` : payload.message,
        access_token: accessToken,
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = await res.json();

      if (data.id || data.post_id) {
        return { ok: true, postId: data.post_id || data.id };
      }
      return { ok: false, error: data.error?.message || 'Failed to publish photo post' };
    }

    // 2. Otherwise publish regular feed post (with optional link preview)
    const url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const params = new URLSearchParams({
      message: payload.message,
      access_token: accessToken,
    });
    if (payload.link) {
      params.append('link', payload.link);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();

    if (data.id) {
      return { ok: true, postId: data.id };
    }
    return { ok: false, error: data.error?.message || 'Failed to publish post' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error connecting to Meta Graph API' };
  }
}

/** Send direct reply to a Facebook Messenger user */
export async function sendFacebookMessengerReply(
  accessToken: string,
  recipientId: string,
  text: string
): Promise<FbSendMsgResult> {
  if (!accessToken || !recipientId) {
    return { ok: false, error: 'Access token or recipient ID missing.' };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
        messaging_type: 'RESPONSE',
      }),
    });
    const data = await res.json();

    if (data.message_id) {
      return { ok: true, messageId: data.message_id };
    }
    return { ok: false, error: data.error?.message || 'Failed to send message' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Error sending Messenger reply' };
  }
}

/** Reply directly to a Facebook post comment */
export async function replyToFacebookComment(
  accessToken: string,
  commentId: string,
  text: string
): Promise<{ ok: boolean; commentId?: string; error?: string }> {
  if (!accessToken || !commentId) {
    return { ok: false, error: 'Access token or comment ID missing.' };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${commentId}/comments`;
    const params = new URLSearchParams({
      message: text,
      access_token: accessToken,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();

    if (data.id) {
      return { ok: true, commentId: data.id };
    }
    return { ok: false, error: data.error?.message || 'Failed to reply to comment' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Error replying to comment' };
  }
}

/**
 * Intelligent Bengali AI Auto-Reply engine tailored specifically for RU students.
 * Detects student intent and provides instant actionable answers + verified rabian.site links.
 */
export function generateSmartFacebookReply(incomingText: string): string {
  const text = (incomingText || '').toLowerCase().trim();

  // 1. Bus Schedule & Timers
  if (
    text.includes('বাস') ||
    text.includes('bus') ||
    text.includes('শিডিউল') ||
    text.includes('schedule') ||
    text.includes('সময়') ||
    text.includes('টাইম') ||
    text.includes('কাটাখালী') ||
    text.includes('নওদাপাড়া') ||
    text.includes('বিনোদপুর')
  ) {
    return `🚌 আসসালামু আলাইকুম! রাজশাহী বিশ্ববিদ্যালয় পরিবহন দপ্তরের সকল রুটের বাস শিডিউল এবং পরবর্তী বাস ছাড়ার লাইভ কাউন্টডাউন টাইমার দেখতে ভিজিট করুন:\n👉 https://rabian.site/bus\n\nক্যাম্পাস থেকে শহরের বিভিন্ন রুট ও শহর থেকে ক্যাম্পাসের বাস সময়সূচি সেকেন্ডের হিসাবে লাইভ দেখা যাবে।`;
  }

  // 2. Teacher, Faculty & Staff Directory (Phonebook)
  if (
    text.includes('শিক্ষক') ||
    text.includes('স্যার') ||
    text.includes('teacher') ||
    text.includes('phone') ||
    text.includes('ফোন') ||
    text.includes('নম্বর') ||
    text.includes('নাম্বার') ||
    text.includes('ডিরেক্টরি') ||
    text.includes('cse') ||
    text.includes('ডিপার্টমেন্ট') ||
    text.includes('প্রক্টর') ||
    text.includes('রেজিস্ট্রার')
  ) {
    return `📞 আসসালামু আলাইকুম! রাজশাহী বিশ্ববিদ্যালয়ের ৫৯টি বিভাগ, হল ও প্রশাসনিক দপ্তরের ৩,৮৭৭ জন শিক্ষক ও কর্মকর্তার মোবাইল নম্বর ও ইমেইল ডিরেক্টরি এখন রাবিয়ানে যুক্ত আছে।\n\nসরাসরি নাম বা বিভাগ দিয়ে সার্চ করে ১-ট্যাপে কল দিন:\n👉 https://rabian.site/directory`;
  }

  // 3. Blood Bank & Donors
  if (
    text.includes('রক্ত') ||
    text.includes('blood') ||
    text.includes('রক্তদাতা') ||
    text.includes('donor') ||
    text.includes('a+') ||
    text.includes('b+') ||
    text.includes('o+') ||
    text.includes('ab+')
  ) {
    return `🩸 আসসালামু আলাইকুম! রক্তের জরুরি প্রয়োজনে রাবি শিক্ষার্থীদের ৯০-দিন ভেরিফাইড লাইভ ব্লাড ব্যাংক ভিজিট করুন। রক্তের গ্রুপ অনুযায়ী ফিল্টার করে সরাসরি ডোনারকে কল করতে পারবেন:\n👉 https://rabian.site/blood\n\nআপনিও রক্তদাতা হিসেবে নিবন্ধন করতে পারবেন।`;
  }

  // 4. Campus Marathon
  if (
    text.includes('ম্যারাথন') ||
    text.includes('marathon') ||
    text.includes('দৌড়') ||
    text.includes('run') ||
    text.includes('মেডেল') ||
    text.includes('টি-শার্ট') ||
    text.includes('টি শার্ট')
  ) {
    return `🏃‍♂️ আসসালামু আলাইকুম! রাবিয়ান আয়োজিত মাসিক ক্যাম্পাস ম্যারাথনের তথ্য, ৫ কিমি রুট, অফিশিয়াল রানিং টি-শার্ট ও মেডেল এবং অনলাইন রেজিস্ট্রেশন ফর্ম পেতে ভিজিট করুন:\n👉 https://rabian.site/marathon\n\nআবেদনের ডেডলাইনের লাইভ টাইমারও দেখতে পাবেন।`;
  }

  // 5. Official Merch & Shop (Hoodie, Khejur Gur)
  if (
    text.includes('হুডি') ||
    text.includes('hoodie') ||
    text.includes('জার্সি') ||
    text.includes('jersey') ||
    text.includes('গুড়') ||
    text.includes('দাম') ||
    text.includes('price') ||
    text.includes('অর্ডার') ||
    text.includes('order') ||
    text.includes('কেনার') ||
    text.includes('ডেলিভারি')
  ) {
    return `🛍️ আসসালামু আলাইকুম! রাবি অফিশিয়াল প্রিমিয়াম উইন্টার হুডি, ওডি জার্সি এবং রাজশাহীর খাঁটি খেজুরের গুড় অর্ডার করতে ভিজিট করুন:\n👉 https://rabian.site/shop\n\n✓ মতিহার ক্যাম্পাসে ১০০% ক্যাশ অন ডেলিভারি ও ফ্রি ডেলিভারি (কোনো অগ্রিম টাকা লাগবে না)।`;
  }

  // 6. Campus Map & Travel Certificate
  if (text.includes('ম্যাপ') || text.includes('map') || text.includes('সনদ') || text.includes('প্যারিস রোড')) {
    return `🗺️ আসসালামু আলাইকুম! রাবি ক্যাম্পাসের ৪২টি স্পট ও রাজশাহী জেলার ২২টি দর্শনীয় স্থান ঘুরেছেন কিনা টিক দিয়ে নিজের নাম খচিত আকর্ষণীয় ভ্রমণ সনদ ডাউনলোড করতে ভিজিট করুন:\n👉 https://rabian.site/map`;
  }

  // Default Welcoming Response
  return `আসসালামু আলাইকুম! রাবিয়ান (Rabian) — রাজশাহী বিশ্ববিদ্যালয় শিক্ষার্থীদের স্মার্ট ডিজিটাল ক্যাম্পাস প্ল্যাটফর্মে আপনাকে স্বাগতম। 🎓\n\nআমাদের প্ল্যাটফর্মে আপনি পাচ্ছেন:\n• 🚌 রাবি বাস শিডিউল ও লাইভ টাইমার: https://rabian.site/bus\n• 📞 ৩,৮৭৭ জন শিক্ষক ও কর্মকর্তা ফোনবুক: https://rabian.site/directory\n• 🩸 ৯০-দিন লাইভ ব্লাড ব্যাংক: https://rabian.site/blood\n• 🏃‍♂️ মাসিক ম্যারাথন আবেদন: https://rabian.site/marathon\n• 🛍️ ক্যাম্পাস শপ ও হুডি: https://rabian.site/shop\n\nআপনার যেকোনো তথ্যের জন্য আমাদের ওয়েবসাইটে ভিজিট করতে পারেন অথবা সরাসরি এখানে মেসেজ দিন!`;
}

/** Pre-built viral campus post generator for 1-click publishing */
export function generatePresetCampusPost(type: 'bus' | 'marathon' | 'directory' | 'merch' | 'blood'): FbPostPayload {
  switch (type) {
    case 'bus':
      return {
        message: `🚌 রাবিয়ান বাস ট্র্যাকার • আজকের বাস কখন ছাড়বে?\n\nমতিহার ক্যাম্পাস থেকে শহর এবং শহর থেকে ক্যাম্পাসের সকল রুটের (কাটাখালী, তালাইমারী, নওদাপাড়া, রেলগেট, বিনোদপুর) বাস শিডিউল ও পরবর্তী বাস ছাড়ার লাইভ কাউন্টডাউন টাইমার এখন সরাসরি রাবিয়ানে!\n\nবাসে ওঠার আগে এক নজরে সময় দেখে নিন:\n👉 https://rabian.site/bus\n\n#RajshahiUniversity #RUBus #Rabian #রাবিয়ান #ক্যাম্পাসবাস`,
        link: 'https://rabian.site/bus',
      };

    case 'directory':
      return {
        message: `📞 রাবি শিক্ষার্থীদের জন্য ৩,৮৭৭ জন শিক্ষক ও কর্মকর্তার পূর্ণাঙ্গ ফোনবুক ডিরেক্টরি!\n\nক্লাস, পরীক্ষা, থিসিস বা যেকোনো প্রয়োজনে সম্মানিত শিক্ষকবৃন্দ, চেয়ারম্যান, ডিন ও প্রশাসনিক কর্মকর্তাদের ভেরিফাইড মোবাইল নম্বর ও অফিশিয়াল ইমেইল খুঁজুন মাত্র ১ সেকেন্ডে — নাম বা ডিপার্টমেন্ট (যেমন: CSE, পদার্থ, গণিত) লিখে সরাসরি ১-ট্যাপে কল ও WhatsApp করুন।\n\nএখনই ডিরেক্টরি ব্রাউজ করুন:\n👉 https://rabian.site/directory\n\n#RajshahiUniversity #RUPhonebook #TeacherContact #Rabian`,
        link: 'https://rabian.site/directory',
      };

    case 'marathon':
      return {
        message: `🏃‍♂️ মাসিক রাবিয়ান ক্যাম্পাস রান ২০২৬ — রেজিস্ট্রেশন চলছে!\n\nপ্যারিস রোডের শান্ত নিসর্গে ৫ কিমি ক্যাম্পাস দৌড়ে অংশ নিন এবং জিতে নিন আকর্ষণীয় অফিশিয়াল রানিং টি-শার্ট ও ফিনিশার মেডেল।\n\nআবেদনের শেষ সময় পর্যন্ত লাইভ টাইমার চলছে! এখনই আপনার ফর্ম পূরণ করুন:\n👉 https://rabian.site/marathon\n\n#RUMarathon #CampusRun #ParisRoad #Rabian #রাবিয়ান`,
        link: 'https://rabian.site/marathon',
      };

    case 'merch':
      return {
        message: `🔥 রাবি অফিশিয়াল উইন্টার হুডি ও রাজশাহীর খাঁটি খেজুরের গুড়ের প্রি-অর্ডার চলছে!\n\n✓ ১০০% ক্যাশ অন ডেলিভারি (কোনো অগ্রিম টাকা দিতে হবে না)\n✓ মতিহার ক্যাম্পাসে ফ্রি ও দ্রুততম হোম ডেলিভারি\n✓ প্রিমিয়াম ফেব্রিক ও আকর্ষণীয় রাবি ডিজাইন\n\nআপনার সাইজ বুক করতে আজই অর্ডার করুন:\n👉 https://rabian.site/shop\n\n#RUHoodie #RabianShop #RajshahiUniversity #WinterCollection`,
        link: 'https://rabian.site/shop',
      };

    case 'blood':
      return {
        message: `🩸 জরুরি রক্তের প্রয়োজনে পাশে আছে রাবিয়ান ব্লাড ব্যাংক!\n\nশেষ রক্তদানের তারিখ থেকে স্বয়ংক্রিয়ভাবে ৯০ দিন (৩ মাস) হিসাব করে প্রস্তুত রক্তদাতাদের তালিকা পাওয়া যাবে সরাসরি। রক্তের গ্রুপ (A+, B+, O+, AB+) সিলেক্ট করে সরাসরি কল দিন বা নিজেই একজন গর্বিত রক্তদাতা হিসেবে নাম যুক্ত করুন:\n👉 https://rabian.site/blood\n\n#BloodDonation #RUBloodBank #Rajshahi #SaveLives #Rabian`,
        link: 'https://rabian.site/blood',
      };
  }
}
