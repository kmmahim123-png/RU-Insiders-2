# 🏛️ RU Insiders 2 (রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল প্ল্যাটফর্ম)

রাজশাহী বিশ্ববিদ্যালয় অফিসিয়াল মার্চেন্ডাইজ স্টোর ও ক্যাম্পাস পোর্টাল (RU Insiders)।

## 🚀 Features
- 🛍️ **মাল্টি-প্রোডাক্ট স্টোর (`/shop`):** হুডি, ড্রপ শোল্ডার, স্পোর্টস জার্সি, রাজশাহীর খাঁটি খেজুরের গুড় ও নারিকেল নাড়ু।
- 📦 **১০০% ক্যাশ অন ডেলিভারি (COD):** মতিহার ক্যাম্পাসে ফ্রি হোম ডেলিভারি ও ডিজিটাল ক্যাশ মেমো।
- 🗺️ **৩-স্তরের ইন্টারঅ্যাক্টিভ এক্সপ্লোরার ম্যাপ (`/map`):** রাবি ক্যাম্পাস (৪২টি স্থান), রাজশাহী জেলা (২২টি অঞ্চল) ও রাজশাহী বিভাগ (৮টি জেলা) এবং ডাউনলোডযোগ্য শেয়ার কার্ড।
- 📰 **Inside RU জার্নাল (`/inside-ru`):** ক্যাম্পাস নিউজ, গল্প, সাহিত্য ও গবেষণা প্রকাশনা।
- 🎓 **অ্যাকাডেমিক ও অ্যালামনাই ডিরেক্টরি (`/academics`):** ৫৯টি বিভাগ, আসন সংখ্যা, ক্যারিয়ার গাইডলাইন ও ভেরিফাইড অ্যালামনাই।
- 🏆 **ক্লাব পোর্টাল (`/clubs`):** শীর্ষ ৮টি ক্লাবে ১-ক্লিক মেম্বারশিপ আবেদন।
- 🔐 **স্মার্ট অ্যাডমিন পোর্টাল (`/admin`):** সিঙ্গেল পাসওয়ার্ড স্বয়ংক্রিয় রোল ভেরিফিকেশন (Super Admin, Product Manager, Club Admins)।
- 🔔 **ক্রোম ওয়েব পুশ নোটিফিকেশন:** ব্রাউজার ব্যাকগ্রাউন্ড পুশ সাপোর্ট।

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Cloud Database / BaaS:** Supabase
- **Deployment:** Vercel

## 📦 Local Development

```bash
# Clone the repository
git clone https://github.com/kmmahim123-png/RU-Insiders-2.git
cd RU-Insiders-2

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

1. Push this repository to GitHub: `https://github.com/kmmahim123-png/RU-Insiders-2`
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
4. Deploy!
