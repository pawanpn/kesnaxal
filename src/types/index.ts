// ── School / Contact ──

export interface SchoolInfo {
  name: string;
  shortName: string;
  motto: string;
  established: number;
  history: string;
  principal: {
    name: string;
    message: string;
  };
}

export interface ContactInfo {
  address: string;
  phone: string;
  phone2: string;
  email: string;
  admissionsEmail: string;
  mapEmbedUrl: string;
}

export interface SocialPlatform {
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
}

// ── Navigation ──

export interface NavLink {
  label: string;
  href: string;
  dropdown?: NavSubLink[];
}

export interface NavSubLink {
  label: string;
  href: string;
}

// ── Hero ──

export interface HeroSlide {
  image: string;
  title: LocaleContent;
  subtitle: LocaleContent;
}

// ── Events ──

export interface UpcomingEvent {
  id: number;
  title: LocaleContent;
  date: string;
  time: string;
  location: LocaleContent;
  image: string;
  description: LocaleContent;
}

// ── News ──

export type LocaleContent = { en: string; ne: string; ja: string };

export interface NewsArticle {
  id: number;
  slug: string;
  title: LocaleContent;
  excerpt: LocaleContent;
  content: LocaleContent;
  author: string;
  date: string;
  image: string;
  category: string;
  tags: string[];
  status: "active" | "deactivated" | "deleted";
}

// ── Testimonials ──

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  text: LocaleContent;
}

// ── Gallery ──

export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
}

export interface GalleryCategory {
  name: string;
}

// ── Notices ──

export interface Notice {
  id: number;
  title: LocaleContent;
  date: string;
  content: LocaleContent;
  priority: "high" | "normal" | "low";
}

// ── Academic Levels ──

export interface AcademicLevel {
  id: string;
  title: string;
  grades: string;
  desc: string;
  image: string;
  subjects?: string[];
  streams?: AcademicStream[];
}

export interface AcademicStream {
  name: string;
  subjects: string[];
}

// ── Faculty ──

export interface FacultyMember {
  name: string;
  role: string;
  dept: string;
}

// ── Results ──

export interface SubjectMarks {
  name: string;
  fullMarks: number;
  passMarks: number;
  obtained: number;
}

export interface StudentResult {
  symbolNumber: string;
  studentName: string;
  class: string;
  dob: string;
  exam: string;
  subjects: SubjectMarks[];
  result: "Pass" | "Fail";
  division: string;
  percentage: number;
  rank: number;
}

// ── Footer ──

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterInfo {
  about: LocaleContent;
  quickLinks: FooterLink[];
}

// ── Values / Info Cards ──

export interface ValueCard {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// ── Admissions Info ──

export interface AdmissionsInfo {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// ── Staff ──

export interface StaffMember {
  id: number;
  name: string;
  designation: string;
  photo: string;
  department?: string;
  category?: "teaching" | "administration" | "support";
  qualification?: string;
  bio?: string;
  email?: string;
  order?: number;
  active?: boolean;
}

// ── Jobs / Careers ──

export interface JobVacancy {
  id: number;
  title: LocaleContent;
  category: LocaleContent;
  level: LocaleContent;
  experience: LocaleContent;
  salary: LocaleContent;
  vacancies: number;
  workstation: LocaleContent;
  description?: LocaleContent;
  responsibilities: LocaleContent[];
  addedOn: string;
  expiresOn: string;
  isActive: boolean;
}

// ── Calendar ──

export interface CalendarEventType {
  id: string;
  label: string;
  color: string;
}

export interface CalendarEvent {
  id: number;
  title: LocaleContent;
  type: string;
  date: string;
  description?: LocaleContent;
}

// ── Language ──

export type Locale = "en" | "ne" | "ja";

export interface Translations {
  nav: Record<string, string>;
  hero: { motto: string; enroll: string; learnMore: string };
  pages: Record<string, { title: string; subtitle?: string }>;
  sections: Record<string, string>;
  common: Record<string, string>;
  footer: Record<string, string>;
  results: Record<string, string>;
  admission: Record<string, string>;
  careers: Record<string, string>;
  calendar: Record<string, string>;
  forms: Record<string, string>;
  badges: Record<string, string>;
  applicationForm: Record<string, string>;
}

// ── Site Config (root) ──

export interface SiteConfig {
  school: SchoolInfo;
  contact: ContactInfo;
  social: SocialPlatform;
  nav: { links: NavLink[] };
  hero: { slides: HeroSlide[] };
  upcomingEvents: UpcomingEvent[];
  newsArticles: NewsArticle[];
  testimonials: Testimonial[];
  gallery: { categories: string[]; images: GalleryImage[] };
  footer: FooterInfo;
  academicLevels: AcademicLevel[];
  faculty: FacultyMember[];
  staff: StaffMember[];
  jobVacancies: JobVacancy[];
  calendarEvents: CalendarEvent[];
  notices?: Notice[];
}


