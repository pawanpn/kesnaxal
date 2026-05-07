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
  mobile: string;
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
  title: string;
  subtitle: string;
}

// ── Events ──

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
}

// ── News ──

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  tags: string[];
}

// ── Testimonials ──

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  text: string;
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
  title: string;
  date: string;
  content: string;
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
  about: string;
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
}
