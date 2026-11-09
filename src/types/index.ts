export interface DetailBlock {
  id: string;
  title: string;
  content: string;
}

export interface ProductVariant {
  label: string; // e.g., "M", "L", "XL" or "৫০০ গ্রাম", "১ কেজি"
  price: number;
}

export interface Product {
  id: string;
  nameBn: string;
  category: string; // e.g. "হুডি ও পোশাক", "খেজুরের গুড় ও খাবার", "গিফট ও অন্যান্য"
  productType: 'apparel' | 'food_weight' | 'standard';
  price: number;
  images: string[]; // একাধিক ছবি
  shortSummary: string;
  detailSections: DetailBlock[]; // একাধিক টাইটেল ও বিস্তারিত বিবরণ
  sizes?: string[]; // পোশাকের জন্য: ['S', 'M', 'L', 'XL', 'XXL']
  weightOptions?: ProductVariant[]; // গুড়/নাড়ু ইত্যাদির জন্য ওজন অনুযায়ী দাম
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export interface MapSpotCustomData {
  spotId: string; // e.g.: 'paris_road', 'pdf_ru', 'rajshahi'
  stage: 'ru_campus' | 'rajshahi_district' | 'division';
  nameBn: string;
  subtitleBn: string;
  images: string[]; // একাধিক ছবি
  detailSections: DetailBlock[]; // একাধিক টাইটেল ও বিস্তারিত
}

export interface OrderItem {
  productId: string;
  nameBn: string;
  image: string;
  selectedOption: string; // সাইজ বা ওজন
  unitPrice: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  phone: string;
  deliveryZone: 'campus' | 'city' | 'nationwide';
  addressDetails: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface ClubInfo {
  id: string;
  shortName: string;
  nameBn: string;
  categoryBn: string;
  descriptionBn: string;
  mottoBn?: string;
  roomLocationBn?: string;
  contactEmail?: string;
  facebookUrl?: string;
  images?: string[]; // কার্যক্রমের ছবি
  whatTheyDo?: string[];
  password: string; // প্রতিটি ক্লাবের আলাদা পাসওয়ার্ড
}

export interface CustomDepartmentData {
  departmentId: string;
  nameBn?: string;
  overviewBn?: string;
  locationBuildingBn?: string;
  seatCount?: number;
  degreeOfferedBn?: string;
  images: string[]; // অনুষদ ও ভবনের একাধিক ছবি
  detailSections?: DetailBlock[];
}

export interface ClubApplication {
  id: string;
  clubId: string;
  clubName: string;
  studentName: string;
  email: string;
  department: string;
  session: string;
  rollNumber: string;
  phone: string;
  bloodGroup: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface InsideRuArticle {
  id: string;
  title: string;
  category:
    | 'ব্রেকিং নিউজ'
    | 'ক্যাম্পাস নিউজ'
    | 'গল্প ও স্মৃতিচারণ'
    | 'চারুকলা ও সাহিত্য'
    | 'সাহিত্য ও কবিতা'
    | 'গবেষণা ও পেপার'
    | 'কৃতি শিক্ষার্থী ও ট্যালেন্ট'
    | 'ক্যাম্পাস গান ও সুর'
    | string;
  authorName: string;
  department: string;
  whatsappNumber?: string; // লেখকের বা নির্দিষ্ট যোগাযোগের WhatsApp নাম্বার
  images: string[];
  summary: string;
  detailSections: DetailBlock[];
  likes: number;
  status: 'Published' | 'Pending';
  isBreaking?: boolean;
  createdAt: string;
}

export interface AlumniProfile {
  id: string;
  name: string;
  faculty: string;
  department: string;
  batch: string;
  currentRole: string;
  organization: string;
  country: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  approved: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string;
  sendChromePush: boolean;
  createdAt: string;
}

export interface SiteSettings {
  superAdminPassword: string;
  productManagerPassword: string;
  whatsappNumber: string; // মেইন অফিশিয়াল WhatsApp নাম্বার (যেমন: 8801700000000)
  deliveryCharges: {
    campus: number;
    city: number;
    nationwide: number;
  };
  categories: string[];
  breakingNews: string[];
}
