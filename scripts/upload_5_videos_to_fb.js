const fs = require('fs');
const path = require('path');

const VIDEOS = [
  {
    num: 1,
    file: 'Rabian_Blood_Angle1_Emergency.mp4',
    title: '🚨 রাত ২টায় রক্তের জন্য আর অপেক্ষা নয় • রাবিয়ান ব্লাড ব্যাংক',
    description: `রাত ২টায় এক ব্যাগ রক্তের জন্য ফেসবুকে পোস্ট দিয়ে আর অপেক্ষা করতে হবে না! রাবিয়ান ওয়েবসাইটে ১ ক্লিকে পাবেন আপনার ক্যাম্পাসের রেডি ডোনার!\n\n👉 রক্তের গ্রুপ অনুযায়ী সরাসরি ডোনারদের মোবাইল নম্বর পেতে ও কল দিতে ভিজিট করুন:\n🌐 https://rabian.site/blood\n\n#BloodDonation #MidnightEmergency #Rabian #রাবিয়ান #রক্তদান #RajshahiUniversity #RU`,
  },
  {
    num: 2,
    file: 'Rabian_Blood_Angle2_Relief.mp4',
    title: '❤️ মাত্র ৫ মিনিটে রক্তের ডোনার পাওয়ার অভিজ্ঞতা • রাবিয়ান',
    description: `মাত্র ৫ মিনিটে আমার ছোট ভাইয়ের জন্য বি পজিটিভ রক্তের ডোনার পেয়েছি! রাবিয়ান প্ল্যাটফর্মের ভেরিফায়েড লিস্ট আর ডিরেক্ট কল বাটন সত্যিই জীবন বাঁচায়!\n\n👉 এক ব্যাগ রক্ত একটি পরিবারের মুখে হাসি ফিরিয়ে দিতে পারে। জরুরি রক্তের প্রয়োজনে ভিজিট করুন:\n🌐 https://rabian.site/blood\n\n#BloodDonor #LifeSaver #Rabian #রাবিয়ান #রক্তদান #RajshahiUniversity`,
  },
  {
    num: 3,
    file: 'Rabian_Blood_Angle3_CampusHero.mp4',
    title: '🦸‍♂️ ক্যাম্পাসে রক্ত দিয়ে আপনিও হতে পারেন আসল হিরো • রাবিয়ান',
    description: `ক্যাম্পাসে কারও বিপদে এক ব্যাগ রক্ত দিয়ে আপনিও হতে পারেন আসল হিরো! রাবিয়ান প্ল্যাটফর্মে ডোনার হিসেবে নিজের নাম যুক্ত করুন আজই!\n\n👉 রাবিয়ান ব্লাড ডোনার কমিউনিটিতে যোগ দিতে এখনই নিবন্ধন করুন:\n🌐 https://rabian.site/blood\n\n#CampusHero #DonateBlood #Rabian #রাবিয়ান #রক্তদাতা #RajshahiUniversity`,
  },
  {
    num: 4,
    file: 'Rabian_Blood_Angle4_CallingVs1Click.mp4',
    title: '📱 ২০ জনকে কল করার ঝামেলা শেষ • ১ ক্লিকে রক্তের সন্ধান',
    description: `রক্তের দরকার হলে ২০ জনকে ফোন দিয়ে ফোন বিজি পাওয়ার দিন শেষ! রাবিয়ান সাইটে গিয়ে রক্তের গ্রুপ সিলেক্ট করলেই ডোনারদের সরাসরি ফোন নম্বর চলে আসে!\n\n👉 আপনার কাঙ্ক্ষিত গ্রুপের প্রস্তুত রক্তদাতাকে সরাসরি ১-ট্যাপে কল দিন:\n🌐 https://rabian.site/blood\n\n#SmartCampus #DirectCall #Rabian #রাবিয়ান #রক্তেরসন্ধান #RajshahiUniversity`,
  },
  {
    num: 5,
    file: 'Rabian_Blood_Angle5_RareNegativeBlood.mp4',
    title: '🩸 রেয়ার নেগেটিভ রক্তের গ্রুপ ক্রাইসিস ও সমাধান • রাবিয়ান',
    description: `নেগেটিভ রক্তের গ্রুপের জন্য শেষ মুহূর্তে হাহাকার যে কতটা ভয়াবহ, ভুক্তভোগীরাই জানে! রাবিয়ান ডেটাবেজে রেয়ার গ্রুপের ডোনারদেরও আলাদা করে খুঁজে পাওয়া যায়!\n\n👉 আপনার রক্তের গ্রুপ কি নেগেটিভ (O-, A-, B-, AB-)? আপনার ১ ব্যাগ রক্তই হয়তো কারও বাঁচার শেষ ভরসা। রাবিয়ানে রক্তদাতা হিসেবে যুক্ত থাকুন:\n🌐 https://rabian.site/blood\n\n#NegativeBlood #RareBlood #Rabian #রাবিয়ান #নেগেটিভগ্রুপ #রক্তদান`,
  },
];

async function uploadVideoDirect(pageId, accessToken, videoInfo) {
  const filePath = path.join(
    __dirname,
    '../public/videos/blood_donation_ugc_5_angles',
    videoInfo.file
  );

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return { ok: false, error: 'File not found' };
  }

  const fileStats = fs.statSync(filePath);
  console.log(`\n⏳ Uploading Video ${videoInfo.num}/5: ${videoInfo.file} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)...`);

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'video/mp4' });

  const formData = new FormData();
  formData.append('source', blob, videoInfo.file);
  formData.append('title', videoInfo.title);
  formData.append('description', videoInfo.description);
  formData.append('access_token', accessToken);

  const url = `https://graph.facebook.com/v21.0/${pageId}/videos`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.id) {
    console.log(`✅ Video ${videoInfo.num} Published Successfully! Video ID: ${data.id}`);
    console.log(`🔗 Facebook Link: https://www.facebook.com/${pageId}/videos/${data.id}`);
    return { ok: true, videoId: data.id };
  } else {
    console.error(`❌ Upload failed for Video ${videoInfo.num}:`, data.error || data);
    return { ok: false, error: data.error?.message || 'Upload failed' };
  }
}

async function main() {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/db.json'), 'utf8'));
  const pageId = db.settings?.facebookPageId || '1548164021704400';
  const accessToken = process.argv[2] || db.settings?.facebookPageAccessToken;

  if (!accessToken) {
    console.error('❌ Error: No Access Token provided. Pass it as argument: node upload_5_videos_to_fb.js <ACCESS_TOKEN>');
    process.exit(1);
  }

  console.log(`🚀 Starting Batch Upload of 5 Blood Donation Videos to Page: ${pageId}`);

  const results = [];
  for (const v of VIDEOS) {
    const res = await uploadVideoDirect(pageId, accessToken, v);
    results.push({ ...v, result: res });
    // Small delay between uploads
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('\n================ Batch Upload Summary ================');
  results.forEach((r) => {
    if (r.result.ok) {
      console.log(`✓ Video ${r.num}: SUCCESS (ID: ${r.result.videoId})`);
    } else {
      console.log(`✗ Video ${r.num}: FAILED (${r.result.error})`);
    }
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadVideoDirect, VIDEOS };
