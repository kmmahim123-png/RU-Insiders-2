const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/db.json'), 'utf8'));
const pageId = db.settings?.facebookPageId || '1548164021704400';
const token = db.settings?.facebookPageAccessToken;

async function postNews() {
  const url = `https://graph.facebook.com/v21.0/${pageId}/photos`;
  const message = `🚨 ব্রেকিং নিউজ • রাজশাহী বিশ্ববিদ্যালয় (রাবি) স্নাতক ১ম বর্ষ ভর্তি পরীক্ষা ২০২৬-২৭!

মতিহারের সবুজ ক্যাম্পাসে স্বপ্নপূরণের সুযোগ! আজ ১৫ নভেম্বর (রবিবার) দুপুর ১২:০০টা থেকে শুরু হচ্ছে অনলাইন প্রাথমিক আবেদন। চলবে ৩০ নভেম্বর ২০২৬ রাত ১১:৫৯ মিনিট পর্যন্ত।

🗓️ চূড়ান্ত ভর্তি পরীক্ষার সময়সূচি:
• 'বি' ইউনিট (বাণিজ্য শাখা): ১২ ফেব্রুয়ারি ২০২৭
• 'সি' ইউনিট (বিজ্ঞান শাখা): ১৩ ফেব্রুয়ারি ২০২৭
• 'এ' ইউনিট (মানবিক শাখা): ২০ ফেব্রুয়ারি ২০২৭

📌 এ বছর শিক্ষার্থীদের আবেদনের যোগ্যতা শিথিল করা হয়েছে (মানবিক ও বাণিজ্যে নূন্যতম ৬.৫০ এবং বিজ্ঞানে ৭.৫০)। ১০০ নম্বরের MCQ পদ্ধতিতে পরীক্ষা অনুষ্ঠিত হবে।

👉 আবেদনের বিস্তারিত শর্তাবলি, ইউনিটভিত্তিক বিভাগ ও আসন সংখ্যা এবং ভর্তি নির্দেশিকা জানতে ভিজিট করুন:
🌐 https://rabian.site/inside-ru

#RajshahiUniversity #RUAdmission #Rabian #রাবিয়ান #ভর্তিপরীক্ষা #ক্যাম্পাসনিউজ #মতিহারেরস্বপ্ন`;

  const params = new URLSearchParams({
    url: 'https://rabian.site/campus/ru-admin.jpg',
    caption: message,
    access_token: token,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();
  console.log('Post Admission News Result:', data);
  if (data.id || data.post_id) {
    console.log(`✅ Admission News Published Successfully! URL: https://facebook.com/${data.post_id || data.id}`);
  }
}

postNews().catch(console.error);
