import { BloodDonor } from '@/types';

export interface BloodEligibilityResult {
  isEligible: boolean;
  daysSinceLastDonation: number | null; // null means never donated before
  daysRemaining: number; // 0 when eligible
  statusLabelBn: string;
}

export const ELIGIBILITY_MIN_DAYS = 90; // ৩ মাস = ৯০ দিন

/**
 * Computes live 90-day (3-month) blood donation eligibility from lastDonationDate.
 */
export function calculateDonorEligibility(
  donor: Pick<BloodDonor, 'lastDonationDate'>,
  referenceDate: Date = new Date()
): BloodEligibilityResult {
  const rawDate = (donor.lastDonationDate || '').trim();
  if (!rawDate) {
    return {
      isEligible: true,
      daysSinceLastDonation: null,
      daysRemaining: 0,
      statusLabelBn: 'যোগ্য (আগে রক্তদানের তারিখ নেই / প্রস্তুত)',
    };
  }

  const parsedMs = Date.parse(rawDate);
  if (Number.isNaN(parsedMs)) {
    return {
      isEligible: true,
      daysSinceLastDonation: null,
      daysRemaining: 0,
      statusLabelBn: 'প্রস্তুত',
    };
  }

  const diffMs = referenceDate.getTime() - parsedMs;
  const daysSince = Math.max(0, Math.floor(diffMs / 86400000));
  const isEligible = daysSince >= ELIGIBILITY_MIN_DAYS;
  const daysRemaining = isEligible ? 0 : ELIGIBILITY_MIN_DAYS - daysSince;

  return {
    isEligible,
    daysSinceLastDonation: daysSince,
    daysRemaining,
    statusLabelBn: isEligible
      ? `যোগ্য (${daysSince} দিন আগে শেষ রক্তদান — ৩ মাস পূর্ণ)`
      : `অপেক্ষমান (${daysSince} দিন আগে দিয়েছেন, আরও ${daysRemaining} দিন বাকি)`,
  };
}
