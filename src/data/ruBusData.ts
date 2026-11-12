import ruBusJson from './ruBusData.json';

export interface RuBusRoute {
  id: string;
  active: boolean;
  type: string[]; // e.g. ['teacher'], ['boys'], ['girls'], ['teacher', 'boys', 'girls']
  dest: string;
  label: string;
  stops: string[];
  delays: number[];
}

export interface RuBusSchedule {
  from: Record<string, RuBusRoute[]>;
  to: Record<string, RuBusRoute[]>;
}

export const RU_BUS_DATA = ruBusJson as unknown as RuBusSchedule;

export const RU_BUS_TIME_SLOTS = {
  from: ['08:15', '09:10', '13:10', '16:15', '22:10'],
  to: ['08:35', '09:35', '13:30', '16:35', '22:35'],
};

export const RU_BUS_TIME_LABELS: Record<string, string> = {
  '08:15': 'সকাল ৮:১৫',
  '09:10': 'সকাল ৯:১০',
  '13:10': 'দুপুর ১:১০',
  '16:15': 'বিকাল ৪:১৫',
  '22:10': 'রাত ১০:১০',
  '08:35': 'সকাল ৮:৩৫',
  '09:35': 'সকাল ৯:৩৫',
  '13:30': 'দুপুর ১:৩০',
  '16:35': 'বিকাল ৪:৩৫',
  '22:35': 'রাত ১০:৩৫',
};

/** Convert 24-hr time 'HH:MM' plus minutes to 'HH:MM' */
export function addMins24(timeStr: string, mins: number): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/** Convert 24-hr time 'HH:MM' to Bengali 12-hr representation with AM/PM */
export function toBengali12Hour(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const isPm = h >= 12;
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  let period = 'সকাল';
  if (isPm) {
    if (h < 4 || (h === 12 && isPm)) period = 'দুপুর';
    else if (h < 7) period = 'বিকাল';
    else if (h < 8) period = 'সন্ধ্যা';
    else period = 'রাত';
  } else {
    if (h < 6) period = 'ভোর';
    else period = 'সকাল';
  }

  const bnNumbers: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };
  const toBn = (num: number) =>
    String(num).split('').map((d) => bnNumbers[d] || d).join('');

  return `${period} ${toBn(h)}:${toBn(m).padStart(2, '০')}`;
}

/** Get next upcoming bus slot & remaining seconds */
export function getNextBusDeparture(direction: 'from' | 'to' = 'from') {
  const slots = RU_BUS_TIME_SLOTS[direction];
  const now = new Date();
  const currentTotalSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  for (const slot of slots) {
    const [h, m] = slot.split(':').map(Number);
    const slotSeconds = h * 3600 + m * 60;
    if (slotSeconds > currentTotalSeconds) {
      const diffSec = slotSeconds - currentTotalSeconds;
      return {
        slot,
        label: RU_BUS_TIME_LABELS[slot] || slot,
        secondsRemaining: diffSec,
        isTomorrow: false,
      };
    }
  }

  // If all today's slots have passed, return first slot tomorrow
  const firstSlot = slots[0];
  const [h, m] = firstSlot.split(':').map(Number);
  const slotSecondsTomorrow = 24 * 3600 + (h * 3600 + m * 60);
  const diffSec = slotSecondsTomorrow - currentTotalSeconds;
  return {
    slot: firstSlot,
    label: `${RU_BUS_TIME_LABELS[firstSlot]} (আগামীকাল)`,
    secondsRemaining: diffSec,
    isTomorrow: true,
  };
}

/** Format remaining seconds into Bengali display string */
export function formatBengaliSeconds(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'বাস ছাড়ার সময় হয়েছে!';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const bn = (n: number) => {
    const digits: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return String(n).padStart(2, '0').split('').map((c) => digits[c] || c).join('');
  };

  if (hours > 0) {
    return `${bn(hours)} ঘণ্টা ${bn(minutes)} মিনিট ${bn(seconds)} সেকেন্ড`;
  }
  return `${bn(minutes)} মিনিট ${bn(seconds)} সেকেন্ড`;
}
