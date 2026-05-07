export const siteData = {
  school: {
    name: "Kathmandu English School",
    shortName: "KES",
    motto: "Learning is Endless",
    established: 1995,
    history:
      "Founded in 1995, Kathmandu English School has been a beacon of quality education in Nepal. We are committed to nurturing young minds with a blend of academic excellence, cultural values, and modern pedagogy.",
    principal: {
      name: "Mr. Bishnu Prasad Sharma",
      message:
        "At KES, we believe every child has limitless potential. Our goal is to provide a nurturing environment where students discover their unique talents and grow into responsible global citizens.",
    },
  },

  contact: {
    address: "Baneshwor, Kathmandu, Nepal",
    phone: "+977-1-4485123",
    mobile: "+977-9841123456",
    email: "info@kes.edu.np",
    admissionsEmail: "admissions@kes.edu.np",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d226400.44224412755!2d85.2723184742156!3d27.685313933937125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19b1f25ecea5%3A0x9e20105ac6e2dbbf!2sBaneshwor%2C%20Kathmandu!5e0!3m2!1sen!2snp!4v1700000000000",
  },

  social: {
    facebook: "https://facebook.com/kesnepal",
    twitter: "https://twitter.com/kesnepal",
    youtube: "https://youtube.com/@kesnepal",
    instagram: "https://instagram.com/kesnepal",
  },

  nav: {
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      {
        label: "Academics",
        href: "/academics",
        dropdown: [
          { label: "Primary Level", href: "/academics#primary" },
          { label: "Secondary Level", href: "/academics#secondary" },
          { label: "Higher Secondary", href: "/academics#higher" },
          { label: "Faculty & Staff", href: "/academics#faculty" },
        ],
      },
      { label: "Admissions", href: "/admissions" },
      { label: "Results", href: "/results" },
      { label: "Gallery", href: "/gallery" },
      { label: "News", href: "/news" },
      { label: "Contact", href: "/contact" },
    ],
  },

  hero: {
    slides: [
      {
        image: "/images/hero/heroslide1.jpg",
        title: "Welcome to Kathmandu English School",
        subtitle: "Shaping Future Leaders Since 1995",
      },
      {
        image: "/images/hero/heroslide2.jpg",
        title: "Academic Excellence",
        subtitle: "Nurturing Inquisitive Minds with Modern Pedagogy",
      },
      {
        image: "/images/hero/heroslide3.jpg",
        title: "Holistic Development",
        subtitle: "Sports, Arts, and Cultural Programs for All-Round Growth",
      },
    ],
  },

  testimonials: [
    {
      id: 1,
      name: "Sunita Gurung",
      role: "Parent of Grade 8 Student",
      image: "/images/testimonials/person1.jpg",
      text: "KES has transformed my daughter into a confident and curious learner. The teachers genuinely care about each child's development.",
    },
    {
      id: 2,
      name: "Rabin Shrestha",
      role: "Parent of Grade 10 Student",
      image: "/images/testimonials/person2.jpg",
      text: "The academic rigor and extracurricular balance at KES is outstanding. My son looks forward to school every single day.",
    },
    {
      id: 3,
      name: "Aayusha Karki",
      role: "Alumna, Class of 2020",
      image: "/images/testimonials/person3.jpg",
      text: "The foundation I received at KES prepared me exceptionally well for higher education. I am forever grateful.",
    },
    {
      id: 4,
      name: "Prakash Adhikari",
      role: "Parent of Grade 5 Student",
      image: "/images/testimonials/person4.jpg",
      text: "What sets KES apart is its focus on character building alongside academics. Truly a nurturing environment.",
    },
  ],

  gallery: {
    categories: ["Events", "Infrastructure", "Sports"],
    images: [
      { src: "/images/gallery/gallery_1.jpg", alt: "Annual Day", category: "Events" },
      { src: "/images/gallery/gallery_2.jpg", alt: "Library", category: "Infrastructure" },
      { src: "/images/gallery/gallery_3.jpg", alt: "Football Match", category: "Sports" },
      { src: "/images/gallery/gallery_4.jpg", alt: "Science Fair", category: "Events" },
      { src: "/images/gallery/gallery_5.jpg", alt: "Computer Lab", category: "Infrastructure" },
      { src: "/images/gallery/gallery_6.jpg", alt: "Basketball Court", category: "Sports" },
      { src: "/images/gallery/gallery_7.jpg", alt: "Cultural Program", category: "Events" },
      { src: "/images/gallery/gallery_8.jpg", alt: "Auditorium", category: "Infrastructure" },
      { src: "/images/gallery/gallery_9.jpg", alt: "Swimming Pool", category: "Sports" },
      { src: "/images/gallery/gallery_10.jpg", alt: "Art Exhibition", category: "Events" },
      { src: "/images/gallery/gallery_11.jpg", alt: "Playground", category: "Infrastructure" },
      { src: "/images/gallery/gallery_12.jpg", alt: "Cricket Ground", category: "Sports" },
    ],
  },

  footer: {
    about:
      "Kathmandu English School is a premier educational institution in Nepal, committed to academic excellence and holistic development since 1995.",
    quickLinks: [
      { label: "About Us", href: "/about" },
      { label: "Admissions", href: "/admissions" },
      { label: "Academics", href: "/academics" },
      { label: "Results", href: "/results" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
} as const;
