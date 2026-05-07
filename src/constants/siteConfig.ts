import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  school: {
    name: "Kathmandu English School",
    shortName: "KES",
    motto: "Learning is Endless",
    established: 1995,
    history:
      "Founded in 1995, Kathmandu English School has been a beacon of quality education in Nepal. We are committed to nurturing young minds with a blend of academic excellence, cultural values, and modern pedagogy.",
    principal: {
      name: "Mr. Dinesh Khatiwada",
      message:
        "At KES, we believe every child has limitless potential. Our goal is to provide a nurturing environment where students discover their unique talents and grow into responsible global citizens.",
    },
  },

  contact: {
    address: "Naxal, Sanogaucharan, Mandev Marga, Kathmandu, Nepal",
    phone: "+977-1-4514369",
    phone2: "+977-1-4514370",
    email: "info@kes.edu.np",
    admissionsEmail: "admissions@kes.edu.np",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.125123456!2d85.331123!3d27.712345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNaxal%2C%20Kathmandu!5e0!3m2!1sen!2snp!4v1700000000000",
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
      { label: "Staff", href: "/staff" },
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

  upcomingEvents: [
    {
      id: 1,
      title: "Annual Sports Meet 2083",
      date: "2026-06-15",
      time: "9:00 AM - 4:00 PM",
      location: "School Football Ground",
      image: "/images/events/event1.jpg",
      description:
        "Join us for three days of thrilling athletic competition. Students from Grade 3 to 12 will compete in track & field, team sports, and fun relays.",
    },
    {
      id: 2,
      title: "Science & Tech Exhibition",
      date: "2026-07-05",
      time: "10:00 AM - 3:00 PM",
      location: "School Auditorium",
      image: "/images/events/event2.jpg",
      description:
        "Students showcase innovative science projects, robotics demos, and tech prototypes. Parents and community members are welcome to attend.",
    },
    {
      id: 3,
      title: "Parent Orientation Day",
      date: "2026-05-28",
      time: "11:00 AM - 1:00 PM",
      location: "Main Assembly Hall",
      image: "/images/events/event3.jpg",
      description:
        "New parents are invited to meet the faculty, tour the campus, and learn about our curriculum, policies, and co-curricular programs.",
    },
    {
      id: 4,
      title: "Cultural Fest & Food Fair",
      date: "2026-08-12",
      time: "10:00 AM - 5:00 PM",
      location: "School Premises",
      image: "/images/events/event4.jpg",
      description:
        "Celebrate Nepal's rich diversity with cultural dances, music performances, food stalls, and art exhibitions by our talented students.",
    },
  ],

  newsArticles: [
    {
      id: 1,
      slug: "kes-tops-national-science-olympiad-2026",
      title: "KES Students Top National Science Olympiad 2026",
      excerpt:
        "Three KES students secured top positions at the National Science Olympiad, bringing home gold and silver medals in a nationwide competition.",
      content: `
Kathmandu English School is proud to announce that three of our students have secured top positions at the National Science Olympiad 2026 held in Kathmandu.

**Gold Medal: Aryan Karki (Grade 10)**  
Aryan demonstrated exceptional knowledge in Physics and Chemistry, scoring 98 out of 100 in the final round. His project on "Renewable Energy Solutions for Rural Nepal" was highly praised by the jury.

**Silver Medals: Sneha Pandey (Grade 9) and Roshan Tamang (Grade 10)**  
Sneha and Roshan both earned silver medals with their innovative approaches to Biology and Environmental Science respectively.

The Olympiad, organized by the Nepal Science Foundation, saw participation from over 200 schools across the country. Our students underwent weeks of rigorous preparation under the guidance of our dedicated Science faculty.

"We are immensely proud of our students," said Principal Mr. Bishnu Prasad Sharma. "This achievement reflects the hard work of our students and the quality of education we strive to provide at KES."

The winners will now represent Nepal at the International Science Olympiad in Tokyo, Japan, later this year. The school has announced a special scholarship fund for the winners to support their advanced studies.
      `,
      author: "KES Media Team",
      date: "2026-05-05",
      image: "/images/news/news1.jpg",
      category: "Achievement",
      tags: ["science", "olympiad", "achievement", "national"],
    },
    {
      id: 2,
      slug: "new-computer-lab-inauguration-ceremony",
      title: "State-of-the-Art Computer Lab Inaugurated by Education Minister",
      excerpt:
        "The Education Minister inaugurated our newly upgraded computer lab featuring 40 high-tech workstations and interactive learning tools.",
      content: `
A new chapter in digital learning began at Kathmandu English School as the Honorable Education Minister inaugurated our state-of-the-art computer laboratory on Chaitra 20, 2083.

The lab features:
- **40 Apple M3 iMac workstations** with 24-inch displays
- **High-speed fiber internet** (1 Gbps dedicated line)
- **Interactive smart boards** for collaborative learning
- **3D printer and robotics kits** for STEM education
- **Licensed software** for coding, design, and office applications

Speaking at the ceremony, the Education Minister praised KES for its commitment to technology-integrated education. "Schools like KES are setting the benchmark for 21st-century learning in Nepal," he said.

The Chairman of KES, in his welcome speech, emphasized that the lab will be open to students from all grades, with dedicated coding and robotics clubs starting from the next academic session.

Teachers have already completed a 2-week training program on leveraging the new technology for enhanced classroom delivery. Students will have supervised access during school hours and after-school club sessions.
      `,
      author: "KES Media Team",
      date: "2026-04-20",
      image: "/images/news/news2.jpg",
      category: "Infrastructure",
      tags: ["computer-lab", "technology", "inauguration", "infrastructure"],
    },
    {
      id: 3,
      slug: "kes-launches-scholarship-program-for-underprivileged",
      title: "KES Launches 'Udaan' Scholarship Program for Underprivileged Students",
      excerpt:
        "Twenty full scholarships announced for meritorious students from economically disadvantaged backgrounds across all seven provinces.",
      content: `
Kathmandu English School has launched the "Udaan Scholarship Program" — a comprehensive initiative to provide quality education to meritorious students from economically disadvantaged backgrounds.

**Key Highlights:**
- **20 Full Scholarships** awarded annually — 2 from each province plus 6 for Kathmandu Valley
- Coverage includes tuition fees, books, uniform, meals, and transportation
- **Special focus on girl child education** — 50% seats reserved for female students

The scholarship is merit-based and targets students entering Grade 6 and Grade 11. Selection will be through a transparent entrance examination followed by a family income verification process.

"Our mission has always been to make quality education accessible," said the Chairman. "The Udaan program is our commitment to giving back to the community and nurturing talent that would otherwise go undiscovered."

Applications for the 2083 academic session are now open. Interested candidates can apply online through the school website or collect forms from the school reception. The last date for submission is Asar 30, 2083.

The school has also partnered with local municipalities in all seven provinces to identify and encourage talented students to apply.
      `,
      author: "KES Admin",
      date: "2026-04-10",
      image: "/images/news/news3.jpg",
      category: "Announcement",
      tags: ["scholarship", "community", "announcement", "accessibility"],
    },
    {
      id: 4,
      slug: "kes-wins-inter-school-debate-championship",
      title: "KES Debate Team Clinches Inter-School Championship Trophy",
      excerpt:
        "Our debate team won the prestigious Kathmandu Valley Inter-School Debate Championship, defeating 32 schools in eloquent argumentation.",
      content: `
The Kathmandu English School Debate Team has emerged victorious at the Kathmandu Valley Inter-School Debate Championship 2083, competing against 32 schools from across the valley.

The championship, organized by the Nepal Debating Society, spanned three rounds over two days. Our team, comprising **Srijana Adhikari (Grade 11)** — Best Speaker, **Kushal Basnet (Grade 10)**, and **Anisha Rai (Grade 10)**, demonstrated exceptional research, articulation, and rebuttal skills.

**Final Round Topic:** "Artificial Intelligence Will Do More Harm Than Good in Education"

KES argued *against* the motion, presenting compelling arguments about AI's potential to personalize learning, assist teachers, and bridge educational gaps in developing nations like Nepal.

The judging panel, which included university professors and legal professionals, commended the team for their "well-researched arguments, calm demeanor under pressure, and impressive teamwork."

The victory qualifies KES to represent Kathmandu Valley at the National Inter-School Debate Championship in Pokhara later this year. The school has announced an intensive coaching camp for the team to prepare for the national level.
      `,
      author: "KES Media Team",
      date: "2026-03-28",
      image: "/images/news/news4.jpg",
      category: "Achievement",
      tags: ["debate", "competition", "achievement", "trophy"],
    },
    {
      id: 5,
      slug: "kes-hosts-international-exchange-students",
      title: "KES Hosts International Exchange Students from Japan",
      excerpt:
        "Fifteen students from Tokyo's Sakura High School spent two weeks at KES as part of our cultural exchange program.",
      content: `
Kathmandu English School welcomed 15 students and 2 teachers from Tokyo's Sakura High School for a two-week cultural exchange program from Baisakh 1-15, 2083.

The exchange program, now in its third year, included:

- **Joint classroom sessions** where Japanese and Nepali students collaborated on projects about sustainable development
- **Cultural workshops** — origami, calligraphy, and ikebana by Japanese students; Nepali folk dance, art, and momo-making by KES students
- **Field trips** to Bhaktapur Durbar Square, Swayambhunath, and Nagarkot
- **Homestay program** where Japanese students lived with KES host families, experiencing authentic Nepali hospitality

"It was an incredible experience," said Ayumi Tanaka, a Grade 10 student from Sakura High School. "I learned so much about Nepali culture, and the KES students were so warm and welcoming."

The program concluded with a joint cultural performance where students from both schools performed together. Plans are already underway for KES students to visit Tokyo next year.

"Our exchange programs help students develop a global perspective," said the Principal. "In today's interconnected world, cultural intelligence is as important as academic knowledge."
      `,
      author: "KES Media Team",
      date: "2026-03-15",
      image: "/images/news/news5.jpg",
      category: "Event",
      tags: ["exchange", "international", "culture", "japan"],
    },
    {
      id: 6,
      slug: "kes-implements-mental-health-wellness-program",
      title: "KES Launches Comprehensive Mental Health & Wellness Program",
      excerpt:
        "A full-time school counselor and weekly wellness sessions introduced to support student mental health and emotional well-being.",
      content: `
Recognizing the importance of mental health in overall student development, Kathmandu English School has launched a comprehensive Mental Health & Wellness Program starting the current academic session.

**Program Components:**

1. **Full-time School Counselor** — A licensed psychologist available for one-on-one counseling sessions for students and parents
2. **Weekly Wellness Sessions** — 40-minute sessions integrated into the timetable covering stress management, mindfulness, emotional intelligence, and peer pressure
3. **Peer Support Network** — Trained student volunteers (Grade 10-12) who provide peer listening and support under counselor supervision
4. **Parent Workshops** — Monthly sessions on adolescent psychology, screen time management, and recognizing mental health red flags
5. **Anti-Bullying Policy** — A clear reporting mechanism and zero-tolerance policy with restorative justice approach

"Academic excellence means little without emotional well-being," said the school counselor, Ms. Sunita Rai. "We want our students to feel safe, heard, and supported."

The initiative has been widely appreciated by parents. "My son was struggling with exam anxiety, and the counseling sessions have made a remarkable difference," shared a Grade 10 parent.

KES is one of the first schools in Nepal to implement a structured mental health curriculum at the school level.
      `,
      author: "KES Admin",
      date: "2026-03-01",
      image: "/images/news/news6.jpg",
      category: "Announcement",
      tags: ["mental-health", "wellness", "counseling", "student-support"],
    },
  ],

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
      { src: "https://picsum.photos/seed/school1/800/600", alt: "Annual Day Celebration", category: "Events", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/library/600/800", alt: "School Library", category: "Infrastructure", width: 600, height: 800 },
      { src: "https://picsum.photos/seed/sports1/800/600", alt: "Football Match", category: "Sports", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/science/800/600", alt: "Science Exhibition", category: "Events", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/computer/600/800", alt: "Computer Lab", category: "Infrastructure", width: 600, height: 800 },
      { src: "https://picsum.photos/seed/basketball/800/600", alt: "Basketball Tournament", category: "Sports", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/cultural/800/600", alt: "Cultural Program", category: "Events", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/auditorium/800/600", alt: "School Auditorium", category: "Infrastructure", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/swimming/600/800", alt: "Swimming Pool", category: "Sports", width: 600, height: 800 },
      { src: "https://picsum.photos/seed/art/800/600", alt: "Art Exhibition", category: "Events", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/playground/800/600", alt: "School Playground", category: "Infrastructure", width: 800, height: 600 },
      { src: "https://picsum.photos/seed/cricket/800/600", alt: "Cricket Tournament", category: "Sports", width: 800, height: 600 },
    ],
  },

  academicLevels: [
    {
      id: "primary",
      title: "Primary Level",
      grades: "Nursery - Grade 5",
      desc: "Our primary program focuses on building strong foundations in literacy, numeracy, and social skills through play-based and experiential learning methods. We follow a child-centric approach where every child learns at their own pace.",
      image: "/images/primary.jpg",
      subjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Computer", "Arts & Crafts", "Physical Education"],
    },
    {
      id: "secondary",
      title: "Secondary Level",
      grades: "Grade 6 - 10",
      desc: "The secondary curriculum deepens conceptual understanding and analytical skills. Students are prepared for the Secondary Education Examination (SEE) with rigorous academics and co-curricular enrichment.",
      image: "/images/secondary.jpg",
      subjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Computer Science", "Health & Physical Education", "Optional Subjects"],
    },
    {
      id: "higher",
      title: "Higher Secondary",
      grades: "Grade 11 - 12",
      desc: "Our 10+2 program offers Science and Management streams under NEB affiliation. Students receive advanced preparation for university entrance exams and career counseling.",
      image: "/images/higher.jpg",
      streams: [
        { name: "Science", subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Computer Science"] },
        { name: "Management", subjects: ["Accountancy", "Economics", "Business Studies", "Mathematics", "English", "Computer Science"] },
      ],
    },
  ],

  faculty: [
    { name: "Mr. Bishnu Prasad Sharma", role: "Principal", dept: "Administration" },
    { name: "Mrs. Anju Thapa", role: "Vice Principal", dept: "Academics" },
    { name: "Mr. Rajan Koirala", role: "HOD", dept: "Science" },
    { name: "Mrs. Sunita Rai", role: "HOD", dept: "English" },
    { name: "Mr. Dhiraj Poudel", role: "HOD", dept: "Mathematics" },
    { name: "Mrs. Menuka Acharya", role: "HOD", dept: "Nepali" },
    { name: "Mr. Sagar Bista", role: "HOD", dept: "Computer Science" },
    { name: "Mrs. Rajani Shrestha", role: "HOD", dept: "Social Studies" },
  ],

  footer: {
    about:
      "Kathmandu English School is a premier educational institution in Nepal, committed to academic excellence and holistic development since 1995.",
    quickLinks: [
      { label: "About Us", href: "/about" },
      { label: "Admissions", href: "/admissions" },
      { label: "Academics", href: "/academics" },
      { label: "Our Team", href: "/staff" },
      { label: "Results", href: "/results" },
      { label: "Gallery", href: "/gallery" },
      { label: "News", href: "/news" },
      { label: "Contact Us", href: "/contact" },
    ],
  },

  staff: [
    {
      id: 1,
      name: "Mr. Dinesh Khatiwada",
      designation: "Principal",
      photo: "https://picsum.photos/seed/principal/300/300",
      department: "Administration",
    },
    {
      id: 2,
      name: "Mrs. Anju Thapa",
      designation: "Vice Principal",
      photo: "https://picsum.photos/seed/vp/300/300",
      department: "Academics",
    },
    {
      id: 3,
      name: "Mr. Rajan Koirala",
      designation: "Head of Department",
      photo: "https://picsum.photos/seed/science/300/300",
      department: "Science",
    },
    {
      id: 4,
      name: "Mrs. Sunita Rai",
      designation: "Head of Department",
      photo: "https://picsum.photos/seed/english/300/300",
      department: "English",
    },
    {
      id: 5,
      name: "Mr. Dhiraj Poudel",
      designation: "Head of Department",
      photo: "https://picsum.photos/seed/math/300/300",
      department: "Mathematics",
    },
    {
      id: 6,
      name: "Mrs. Menuka Acharya",
      designation: "Head of Department",
      photo: "https://picsum.photos/seed/nepali/300/300",
      department: "Nepali",
    },
    {
      id: 7,
      name: "Mr. Sagar Bista",
      designation: "Head of Department",
      photo: "https://picsum.photos/seed/computer/300/300",
      department: "Computer Science",
    },
    {
      id: 8,
      name: "Mrs. Rajani Shrestha",
      designation: "Head of Department",
      photo: "https://picsum.photos/seed/social/300/300",
      department: "Social Studies",
    },
  ],
};
