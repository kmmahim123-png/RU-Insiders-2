import React from 'react';
import type { Metadata } from 'next';
import BloodBankSection from '@/components/BloodBankSection';

export const metadata: Metadata = {
  title: 'রাবি ব্লাড ব্যাংক ও জরুরি রক্তদাতা সন্ধান | RU Blood Bank | রাবিয়ান',
  description: 'রাজশাহী বিশ্ববিদ্যালয় ও রাজশাহীর জরুরি প্রয়োজনে ৯০+ দিন সম্পন্ন উপযুক্ত রক্তদাতাদের মোবাইল নম্বর, রক্তের গ্রুপ (A+, B+, O+, AB+) ও সরাসরি কল করার প্ল্যাটফর্ম।',
  keywords: [
    'রক্ত রাজশাহী',
    'rokto rajshahi',
    'রাবি ব্লাড ব্যাংক',
    'ru blood bank',
    'rajshahi blood bank',
    'জরুরি রক্তদাতা রাজশাহী',
    'রাবি রক্তদান',
    'blood donor rajshahi',
    'rabian blood',
  ],
  alternates: {
    canonical: 'https://rabian.site/blood',
  },
  openGraph: {
    title: 'রাবি ব্লাড ব্যাংক ও জরুরি রক্তদাতা সন্ধান | রাবিয়ান',
    description: 'রাজশাহী বিশ্ববিদ্যালয় ও রাজশাহীর জরুরি প্রয়োজনে ৯০+ দিন এভেইলেবল রক্তদাতাদের নম্বর ও রক্তের গ্রুপ।',
    url: 'https://rabian.site/blood',
    images: ['/og-image.png'],
  },
};

export default function BloodDonationPage() {
  return <BloodBankSection />;
}
