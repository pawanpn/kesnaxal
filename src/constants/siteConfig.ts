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
      { label: "Notices", href: "/notices" },
      { label: "Team", href: "/staff" },
      { label: "Careers", href: "/careers" },
      { label: "Calendar", href: "/calendar" },
      { label: "Contact", href: "/contact" },
    ],
  },

  hero: {
    slides: [
      {
        image: "https://picsum.photos/seed/keshero1/1200/600",
        title: {
          en: "Welcome to Kathmandu English School",
          ne: "काठमाडौं इंग्लिश स्कूलमा स्वागत छ",
          ja: "カトマンズイングリッシュスクールへようこそ",
        },
        subtitle: {
          en: "Shaping Future Leaders Since 1995",
          ne: "सन् १९९५ देखि भविष्यका नेताहरूको निर्माण",
          ja: "1995年以来、未来のリーダーを育成",
        },
      },
      {
        image: "https://picsum.photos/seed/keshero2/1200/600",
        title: {
          en: "Academic Excellence",
          ne: "शैक्षिक उत्कृष्टता",
          ja: "学業の卓越性",
        },
        subtitle: {
          en: "Nurturing Inquisitive Minds with Modern Pedagogy",
          ne: "आधुनिक शिक्षण विधिद्वारा जिज्ञासु मस्तिष्कहरूको पोषण",
          ja: "現代的な教育法で探究心を育む",
        },
      },
      {
        image: "https://picsum.photos/seed/keshero3/1200/600",
        title: {
          en: "Holistic Development",
          ne: "समग्र विकास",
          ja: "全人的開発",
        },
        subtitle: {
          en: "Sports, Arts, and Cultural Programs for All-Round Growth",
          ne: "सर्वाङ्गीण विकासका लागि खेलकुद, कला र सांस्कृतिक कार्यक्रमहरू",
          ja: "全面的な成長のためのスポーツ、芸術、文化プログラム",
        },
      },
    ],
  },

  upcomingEvents: [
    {
      id: 1,
      title: {
        en: "Annual Sports Meet 2083",
        ne: "वार्षिक खेलकुद भेला २०८३",
        ja: "年次スポーツ大会2083",
      },
      date: "2026-06-15",
      time: "9:00 AM - 4:00 PM",
      location: {
        en: "School Football Ground",
        ne: "विद्यालय फुटबल मैदान",
        ja: "学校サッカーグラウンド",
      },
      image: "https://picsum.photos/seed/kesevent1/800/600",
      description: {
        en: "Join us for three days of thrilling athletic competition. Students from Grade 3 to 12 will compete in track & field, team sports, and fun relays.",
        ne: "तीन दिनसम्म चल्ने रोमाञ्चक खेलकुद प्रतियोगितामा सहभागी हुनुहोस्। कक्षा ३ देखि १२ सम्मका विद्यार्थीहरूले ट्र्याक एण्ड फिल्ड, टोली खेल र मनोरञ्जनात्मक रिलेमा प्रतिस्पर्धा गर्नेछन्।",
        ja: "3日間にわたるスリリングな体育大会にご参加ください。3年生から12年生までの生徒が陸上競技、チームスポーツ、楽しいリレーで競い合います。",
      },
    },
    {
      id: 2,
      title: {
        en: "Science & Tech Exhibition",
        ne: "विज्ञान तथा प्रविधि प्रदर्शनी",
        ja: "科学技術展示会",
      },
      date: "2026-07-05",
      time: "10:00 AM - 3:00 PM",
      location: {
        en: "School Auditorium",
        ne: "विद्यालय सभागार",
        ja: "学校講堂",
      },
      image: "https://picsum.photos/seed/kesevent2/800/600",
      description: {
        en: "Students showcase innovative science projects, robotics demos, and tech prototypes. Parents and community members are welcome to attend.",
        ne: "विद्यार्थीहरूले नवीन विज्ञान परियोजनाहरू, रोबोटिक्स प्रदर्शन र प्रविधि प्रोटोटाइपहरू प्रस्तुत गर्नेछन्। अभिभावक र समुदायका सदस्यहरूलाई उपस्थितिका लागि स्वागत छ।",
        ja: "生徒たちが革新的な科学プロジェクト、ロボット工学のデモ、技術プロトタイプを展示します。保護者や地域の皆様のご来場をお待ちしております。",
      },
    },
    {
      id: 3,
      title: {
        en: "Parent Orientation Day",
        ne: "अभिभावक अभिमुखीकरण दिवस",
        ja: "保護者オリエンテーションデー",
      },
      date: "2026-05-28",
      time: "11:00 AM - 1:00 PM",
      location: {
        en: "Main Assembly Hall",
        ne: "मुख्य सभा हल",
        ja: "メイン集会ホール",
      },
      image: "https://picsum.photos/seed/kesevent3/800/600",
      description: {
        en: "New parents are invited to meet the faculty, tour the campus, and learn about our curriculum, policies, and co-curricular programs.",
        ne: "नयाँ अभिभावकहरूलाई शिक्षकहरूसँग भेट्न, विद्यालय परिसरको भ्रमण गर्न र हाम्रो पाठ्यक्रम, नीतिहरू र सह-पाठ्यक्रम कार्यक्रमहरूबारे जान्न आमन्त्रित गरिन्छ।",
        ja: "新入生の保護者を対象に、教員との面談、キャンパスツアー、カリキュラムやポリシー、課外プログラムについての説明会を開催します。",
      },
    },
    {
      id: 4,
      title: {
        en: "Cultural Fest & Food Fair",
        ne: "सांस्कृतिक महोत्सव तथा खाना मेला",
        ja: "文化祭＆フードフェア",
      },
      date: "2026-08-12",
      time: "10:00 AM - 5:00 PM",
      location: {
        en: "School Premises",
        ne: "विद्यालय परिसर",
        ja: "学校敷地内",
      },
      image: "https://picsum.photos/seed/kesevent4/800/600",
      description: {
        en: "Celebrate Nepal's rich diversity with cultural dances, music performances, food stalls, and art exhibitions by our talented students.",
        ne: "हाम्रा प्रतिभाशाली विद्यार्थीहरूद्वारा सांस्कृतिक नृत्य, सङ्गीत प्रस्तुति, खानाका स्टल र कला प्रदर्शनीहरू सहित नेपालको समृद्ध विविधताको उत्सव मनाउनुहोस्।",
        ja: "才能あふれる生徒たちによる文化舞踊、音楽演奏、屋台、美術展示を通じて、ネパールの豊かな多様性を祝いましょう。",
      },
    },
  ],

  newsArticles: [
    {
      id: 1,
      slug: "kes-tops-national-science-olympiad-2026",
      title: {
        en: "KES Students Top National Science Olympiad 2026",
        ne: "केईएसका विद्यार्थीहरू राष्ट्रिय विज्ञान ओलम्पियाड २०२६ मा शीर्ष स्थानमा",
        ja: "KESの生徒が全国科学オリンピック2026でトップに",
      },
      excerpt: {
        en: "Three KES students secured top positions at the National Science Olympiad, bringing home gold and silver medals in a nationwide competition.",
        ne: "केईएसका तीन विद्यार्थीहरूले राष्ट्रिय विज्ञान ओलम्पियाडमा शीर्ष स्थान हासिल गर्दै राष्ट्रव्यापी प्रतियोगितामा स्वर्ण र रजत पदक घर ल्याए।",
        ja: "KESの3人の生徒が全国科学オリンピックで上位を獲得し、全国大会で金メダルと銀メダルを獲得しました。",
      },
      content: {
        en: `Kathmandu English School is proud to announce that three of our students have secured top positions at the National Science Olympiad 2026 held in Kathmandu.\n\n**Gold Medal: Aryan Karki (Grade 10)**  \nAryan demonstrated exceptional knowledge in Physics and Chemistry, scoring 98 out of 100 in the final round. His project on "Renewable Energy Solutions for Rural Nepal" was highly praised by the jury.\n\n**Silver Medals: Sneha Pandey (Grade 9) and Roshan Tamang (Grade 10)**  \nSneha and Roshan both earned silver medals with their innovative approaches to Biology and Environmental Science respectively.\n\nThe Olympiad, organized by the Nepal Science Foundation, saw participation from over 200 schools across the country. Our students underwent weeks of rigorous preparation under the guidance of our dedicated Science faculty.\n\n"We are immensely proud of our students," said Principal Mr. Dinesh Khatiwada. "This achievement reflects the hard work of our students and the quality of education we strive to provide at KES."\n\nThe winners will now represent Nepal at the International Science Olympiad in Tokyo, Japan, later this year. The school has announced a special scholarship fund for the winners to support their advanced studies.`,
        ne: `[NE — translated content pending]\n\nKathmandu English School is proud to announce that three of our students have secured top positions at the National Science Olympiad 2026 held in Kathmandu.\n\n**Gold Medal: Aryan Karki (Grade 10)**  \n**Silver Medals: Sneha Pandey (Grade 9) and Roshan Tamang (Grade 10)**\n\nThe Olympiad, organized by the Nepal Science Foundation, saw participation from over 200 schools.\n\n"We are immensely proud of our students," said Principal Mr. Dinesh Khatiwada.\n\nThe winners will now represent Nepal at the International Science Olympiad in Tokyo, Japan.`,
        ja: `[JA — translated content pending]\n\nKathmandu English School is proud to announce that three of our students have secured top positions at the National Science Olympiad 2026 held in Kathmandu.\n\n**Gold Medal: Aryan Karki (Grade 10)**  \n**Silver Medals: Sneha Pandey (Grade 9) and Roshan Tamang (Grade 10)**\n\nThe Olympiad, organized by the Nepal Science Foundation, saw participation from over 200 schools.\n\n"We are immensely proud of our students," said Principal Mr. Dinesh Khatiwada.\n\nThe winners will now represent Nepal at the International Science Olympiad in Tokyo, Japan.`,
      },
      author: "KES Media Team",
      date: "2026-05-05",
      image: "https://picsum.photos/seed/kesnews1/800/600",
      category: "Achievement",
      tags: ["science", "olympiad", "achievement", "national"],
    },
    {
      id: 2,
      slug: "new-computer-lab-inauguration-ceremony",
      title: {
        en: "State-of-the-Art Computer Lab Inaugurated by Education Minister",
        ne: "शिक्षा मन्त्रीद्वारा अत्याधुनिक कम्प्युटर प्रयोगशालाको उद्घाटन",
        ja: "教育大臣により最先端コンピューターラボが開設",
      },
      excerpt: {
        en: "The Education Minister inaugurated our newly upgraded computer lab featuring 40 high-tech workstations and interactive learning tools.",
        ne: "शिक्षा मन्त्रीले ४० वटा उच्च-प्रविधियुक्त कम्प्युटर र अन्तरक्रियात्मक सिकाइ उपकरणहरू सहितको नयाँ कम्प्युटर प्रयोगशालाको उद्घाटन गर्नुभयो।",
        ja: "教育大臣が40台のハイテクワークステーションとインタラクティブな学習ツールを備えた新コンピューターラボを開設しました。",
      },
      content: {
        en: `A new chapter in digital learning began at Kathmandu English School as the Honorable Education Minister inaugurated our state-of-the-art computer laboratory on Chaitra 20, 2083.\n\nThe lab features:\n- **40 Apple M3 iMac workstations** with 24-inch displays\n- **High-speed fiber internet** (1 Gbps dedicated line)\n- **Interactive smart boards** for collaborative learning\n- **3D printer and robotics kits** for STEM education\n- **Licensed software** for coding, design, and office applications\n\nSpeaking at the ceremony, the Education Minister praised KES for its commitment to technology-integrated education. "Schools like KES are setting the benchmark for 21st-century learning in Nepal," he said.\n\nThe Chairman of KES emphasized that the lab will be open to students from all grades, with dedicated coding and robotics clubs starting from the next academic session.\n\nTeachers have already completed a 2-week training program on leveraging the new technology for enhanced classroom delivery.`,
        ne: `[NE] A new chapter in digital learning began at KES as the Education Minister inaugurated our state-of-the-art computer laboratory.\n\nThe lab features:\n- **40 Apple M3 iMac workstations**\n- **High-speed fiber internet**\n- **Interactive smart boards**\n- **3D printer and robotics kits**\n- **Licensed software**\n\n"Schools like KES are setting the benchmark for 21st-century learning in Nepal," said the Minister.\n\nTeachers have completed a 2-week training program on the new technology.`,
        ja: `[JA] A new chapter in digital learning began at KES as the Education Minister inaugurated our state-of-the-art computer laboratory.\n\nThe lab features:\n- **40 Apple M3 iMac workstations**\n- **High-speed fiber internet**\n- **Interactive smart boards**\n- **3D printer and robotics kits**\n- **Licensed software**\n\n"Schools like KES are setting the benchmark for 21st-century learning in Nepal," said the Minister.\n\nTeachers have completed a 2-week training program on the new technology.`,
      },
      author: "KES Media Team",
      date: "2026-04-20",
      image: "https://picsum.photos/seed/kesnews2/800/600",
      category: "Infrastructure",
      tags: ["computer-lab", "technology", "inauguration", "infrastructure"],
    },
    {
      id: 3,
      slug: "kes-launches-scholarship-program-for-underprivileged",
      title: {
        en: "KES Launches 'Udaan' Scholarship Program for Underprivileged Students",
        ne: "केईएसले विपन्न विद्यार्थीहरूका लागि 'उडान' छात्रवृत्ति कार्यक्रम सुरु गर्यो",
        ja: "KESが経済的困難を抱える生徒向け「Udaan」奨学金プログラムを開始",
      },
      excerpt: {
        en: "Twenty full scholarships announced for meritorious students from economically disadvantaged backgrounds across all seven provinces.",
        ne: "सातै प्रदेशका आर्थिक रूपमा विपन्न पृष्ठभूमिका मेधावी विद्यार्थीहरूका लागि बीस पूर्ण छात्रवृत्तिहरू घोषणा।",
        ja: "全7州の経済的困難を抱える優秀な学生向けに20の全額奨学金が発表されました。",
      },
      content: {
        en: `Kathmandu English School has launched the "Udaan Scholarship Program" — a comprehensive initiative to provide quality education to meritorious students from economically disadvantaged backgrounds.\n\n**Key Highlights:**\n- **20 Full Scholarships** awarded annually — 2 from each province plus 6 for Kathmandu Valley\n- Coverage includes tuition fees, books, uniform, meals, and transportation\n- **Special focus on girl child education** — 50% seats reserved for female students\n\nThe scholarship is merit-based and targets students entering Grade 6 and Grade 11. Selection will be through a transparent entrance examination followed by a family income verification process.\n\n"Our mission has always been to make quality education accessible," said the Chairman. "The Udaan program is our commitment to giving back to the community and nurturing talent."\n\nApplications for the 2083 academic session are now open. The last date for submission is Asar 30, 2083.`,
        ne: `[NE] Kathmandu English School has launched the "Udaan Scholarship Program" for meritorious students from economically disadvantaged backgrounds.\n\n**Key Highlights:**\n- **20 Full Scholarships** awarded annually\n- Coverage includes tuition, books, uniform, meals, transportation\n- **50% seats reserved for female students**\n\nApplications for 2083 are now open. Last date: Asar 30, 2083.`,
        ja: `[JA] Kathmandu English School has launched the "Udaan Scholarship Program" for meritorious students from economically disadvantaged backgrounds.\n\n**Key Highlights:**\n- **20 Full Scholarships** awarded annually\n- Coverage includes tuition, books, uniform, meals, transportation\n- **50% seats reserved for female students**\n\nApplications for 2083 are now open. Last date: Asar 30, 2083.`,
      },
      author: "KES Admin",
      date: "2026-04-10",
      image: "https://picsum.photos/seed/kesnews3/800/600",
      category: "Announcement",
      tags: ["scholarship", "community", "announcement", "accessibility"],
    },
    {
      id: 4,
      slug: "kes-wins-inter-school-debate-championship",
      title: {
        en: "KES Debate Team Clinches Inter-School Championship Trophy",
        ne: "केईएस वादविवाद टोलीले अन्तर-विद्यालय च्याम्पियनसिप ट्रफी जित्यो",
        ja: "KESディベートチームが学校対抗選手権トロフィーを獲得",
      },
      excerpt: {
        en: "Our debate team won the prestigious Kathmandu Valley Inter-School Debate Championship, defeating 32 schools in eloquent argumentation.",
        ne: "हाम्रो वादविवाद टोलीले ३२ विद्यालयहरूलाई पराजित गर्दै प्रतिष्ठित काठमाडौं उपत्यका अन्तर-विद्यालय वादविवाद च्याम्पियनसिप जित्यो।",
        ja: "私たちのディベートチームは、32校を破り、名門カトマンズバレー学校対抗ディベート選手権で優勝しました。",
      },
      content: {
        en: `The Kathmandu English School Debate Team has emerged victorious at the Kathmandu Valley Inter-School Debate Championship 2083, competing against 32 schools.\n\nThe championship spanned three rounds over two days. Our team, comprising **Srijana Adhikari (Grade 11)** — Best Speaker, **Kushal Basnet (Grade 10)**, and **Anisha Rai (Grade 10)**, demonstrated exceptional research and rebuttal skills.\n\n**Final Round Topic:** "Artificial Intelligence Will Do More Harm Than Good in Education"\n\nKES argued against the motion, presenting compelling arguments about AI's potential to personalize learning and bridge educational gaps in developing nations like Nepal.\n\nThe judging panel commended the team for their "well-researched arguments, calm demeanor, and impressive teamwork."\n\nKES will now represent Kathmandu Valley at the National Inter-School Debate Championship in Pokhara.`,
        ne: `[NE] The KES Debate Team has emerged victorious at the Kathmandu Valley Inter-School Debate Championship 2083, competing against 32 schools.\n\nOur team: **Srijana Adhikari (Grade 11)** — Best Speaker, **Kushal Basnet (Grade 10)**, **Anisha Rai (Grade 10)**.\n\n**Final Round Topic:** "Artificial Intelligence Will Do More Harm Than Good in Education"\n\nThe team was praised for their "well-researched arguments and impressive teamwork."\n\nKES will represent Kathmandu Valley at the National Championship in Pokhara.`,
        ja: `[JA] The KES Debate Team has emerged victorious at the Kathmandu Valley Inter-School Debate Championship 2083, competing against 32 schools.\n\nOur team: **Srijana Adhikari (Grade 11)** — Best Speaker, **Kushal Basnet (Grade 10)**, **Anisha Rai (Grade 10)**.\n\n**Final Round Topic:** "Artificial Intelligence Will Do More Harm Than Good in Education"\n\nThe team was praised for their "well-researched arguments and impressive teamwork."\n\nKES will represent Kathmandu Valley at the National Championship in Pokhara.`,
      },
      author: "KES Media Team",
      date: "2026-03-28",
      image: "https://picsum.photos/seed/kesnews4/800/600",
      category: "Achievement",
      tags: ["debate", "competition", "achievement", "trophy"],
    },
    {
      id: 5,
      slug: "kes-hosts-international-exchange-students",
      title: {
        en: "KES Hosts International Exchange Students from Japan",
        ne: "केईएसले जापानबाट अन्तर्राष्ट्रिय आदानप्रदान विद्यार्थीहरूलाई आतिथ्यता प्रदान गर्यो",
        ja: "KESが日本からの国際交流学生を受け入れ",
      },
      excerpt: {
        en: "Fifteen students from Tokyo's Sakura High School spent two weeks at KES as part of our cultural exchange program.",
        ne: "टोकियोको साकुरा हाई स्कूलका पन्ध्र विद्यार्थीहरूले हाम्रो सांस्कृतिक आदानप्रदान कार्यक्रम अन्तर्गत केईएसमा दुई हप्ता बिताए।",
        ja: "東京の桜高校から15人の学生が文化交流プログラムの一環としてKESで2週間過ごしました。",
      },
      content: {
        en: `Kathmandu English School welcomed 15 students and 2 teachers from Tokyo's Sakura High School for a two-week cultural exchange program.\n\nThe exchange program, now in its third year, included:\n- **Joint classroom sessions** on sustainable development\n- **Cultural workshops** — origami, calligraphy, Nepali folk dance, momo-making\n- **Field trips** to Bhaktapur, Swayambhunath, and Nagarkot\n- **Homestay program** with KES host families\n\n"It was an incredible experience," said Ayumi Tanaka, a Grade 10 student from Sakura High School. "I learned so much about Nepali culture."\n\nPlans are already underway for KES students to visit Tokyo next year.`,
        ne: `[NE] Kathmandu English School welcomed 15 students and 2 teachers from Tokyo's Sakura High School for a two-week cultural exchange program.\n\nThe program included:\n- **Joint classroom sessions**\n- **Cultural workshops** — origami, calligraphy, Nepali folk dance\n- **Field trips** to Bhaktapur, Swayambhunath, Nagarkot\n- **Homestay program**\n\n"It was an incredible experience," said Ayumi Tanaka. "I learned so much about Nepali culture."`,
        ja: `[JA] Kathmandu English School welcomed 15 students and 2 teachers from Tokyo's Sakura High School for a two-week cultural exchange program.\n\nThe program included:\n- **Joint classroom sessions**\n- **Cultural workshops** — origami, calligraphy, Nepali folk dance\n- **Field trips** to Bhaktapur, Swayambhunath, Nagarkot\n- **Homestay program**\n\n"It was an incredible experience," said Ayumi Tanaka. "I learned so much about Nepali culture."`,
      },
      author: "KES Media Team",
      date: "2026-03-15",
      image: "https://picsum.photos/seed/kesnews5/800/600",
      category: "Event",
      tags: ["exchange", "international", "culture", "japan"],
    },
    {
      id: 6,
      slug: "kes-implements-mental-health-wellness-program",
      title: {
        en: "KES Launches Comprehensive Mental Health & Wellness Program",
        ne: "केईएसले व्यापक मानसिक स्वास्थ्य र कल्याण कार्यक्रम सुरु गर्यो",
        ja: "KESが包括的なメンタルヘルス＆ウェルネスプログラムを開始",
      },
      excerpt: {
        en: "A full-time school counselor and weekly wellness sessions introduced to support student mental health and emotional well-being.",
        ne: "विद्यार्थीहरूको मानसिक स्वास्थ्य र भावनात्मक कल्याणलाई सहयोग गर्न पूर्णकालिक विद्यालय परामर्शदाता र साप्ताहिक कल्याण सत्रहरू सुरु गरियो।",
        ja: "生徒のメンタルヘルスと情緒的幸福を支援するため、常勤のスクールカウンセラーと週次のウェルネスセッションが導入されました。",
      },
      content: {
        en: `Recognizing the importance of mental health, KES has launched a comprehensive Mental Health & Wellness Program.\n\n**Program Components:**\n1. **Full-time School Counselor** — Licensed psychologist for one-on-one sessions\n2. **Weekly Wellness Sessions** — Stress management, mindfulness, emotional intelligence\n3. **Peer Support Network** — Trained student volunteers (Grade 10-12)\n4. **Parent Workshops** — Adolescent psychology and screen time management\n5. **Anti-Bullying Policy** — Zero-tolerance with restorative justice approach\n\n"Academic excellence means little without emotional well-being," said Ms. Sunita Rai, school counselor.\n\nKES is one of the first schools in Nepal to implement a structured mental health curriculum.`,
        ne: `[NE] Recognizing the importance of mental health, KES has launched a comprehensive Mental Health & Wellness Program.\n\n**Program Components:**\n1. **Full-time School Counselor**\n2. **Weekly Wellness Sessions**\n3. **Peer Support Network**\n4. **Parent Workshops**\n5. **Anti-Bullying Policy**\n\n"Academic excellence means little without emotional well-being," said Ms. Sunita Rai.\n\nKES is one of the first schools in Nepal with a structured mental health curriculum.`,
        ja: `[JA] Recognizing the importance of mental health, KES has launched a comprehensive Mental Health & Wellness Program.\n\n**Program Components:**\n1. **Full-time School Counselor**\n2. **Weekly Wellness Sessions**\n3. **Peer Support Network**\n4. **Parent Workshops**\n5. **Anti-Bullying Policy**\n\n"Academic excellence means little without emotional well-being," said Ms. Sunita Rai.\n\nKES is one of the first schools in Nepal with a structured mental health curriculum.`,
      },
      author: "KES Admin",
      date: "2026-03-01",
      image: "https://picsum.photos/seed/kesnews6/800/600",
      category: "Announcement",
      tags: ["mental-health", "wellness", "counseling", "student-support"],
    },
  ],

  testimonials: [
    {
      id: 1,
      name: "Sunita Gurung",
      role: "Parent of Grade 8 Student",
      image: "https://picsum.photos/seed/kestest1/300/300",
      text: {
        en: "KES has transformed my daughter into a confident and curious learner. The teachers genuinely care about each child's development.",
        ne: "केईएसले मेरी छोरीलाई आत्मविश्वासी र जिज्ञासु विद्यार्थीमा रूपान्तरण गरेको छ। शिक्षकहरूले प्रत्येक बच्चाको विकासमा साँच्चै चासो राख्छन्।",
        ja: "KESは私の娘を自信に満ちた好奇心旺盛な学習者に変えました。教師たちは各児童の成長を心から気にかけています。",
      },
    },
    {
      id: 2,
      name: "Rabin Shrestha",
      role: "Parent of Grade 10 Student",
      image: "https://picsum.photos/seed/kestest2/300/300",
      text: {
        en: "The academic rigor and extracurricular balance at KES is outstanding. My son looks forward to school every single day.",
        ne: "केईएसमा शैक्षिक कठोरता र अतिरिक्त क्रियाकलापको सन्तुलन उत्कृष्ट छ। मेरो छोरो हरेक दिन विद्यालय जान उत्सुक हुन्छ।",
        ja: "KESでの学業の厳しさと課外活動のバランスは素晴らしいです。息子は毎日学校に行くのを楽しみにしています。",
      },
    },
    {
      id: 3,
      name: "Aayusha Karki",
      role: "Alumna, Class of 2020",
      image: "https://picsum.photos/seed/kestest3/300/300",
      text: {
        en: "The foundation I received at KES prepared me exceptionally well for higher education. I am forever grateful.",
        ne: "केईएसमा मैले पाएको आधारले मलाई उच्च शिक्षाका लागि असाधारण रूपमा तयार गर्यो। म सधैं आभारी छु।",
        ja: "KESで受けた基礎教育は高等教育に向けて非常に良い準備となりました。永遠に感謝しています。",
      },
    },
    {
      id: 4,
      name: "Prakash Adhikari",
      role: "Parent of Grade 5 Student",
      image: "https://picsum.photos/seed/kestest4/300/300",
      text: {
        en: "What sets KES apart is its focus on character building alongside academics. Truly a nurturing environment.",
        ne: "केईएसलाई अरूभन्दा फरक बनाउने कुरा भनेको शिक्षासँगै चरित्र निर्माणमा यसको ध्यान हो। साँच्चै पोषणकारी वातावरण।",
        ja: "KESを際立たせているのは、学業と並行した人格形成への注力です。本当に育成的な環境です。",
      },
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
      image: "https://picsum.photos/seed/kesprimary/800/600",
      subjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Computer", "Arts & Crafts", "Physical Education"],
    },
    {
      id: "secondary",
      title: "Secondary Level",
      grades: "Grade 6 - 10",
      desc: "The secondary curriculum deepens conceptual understanding and analytical skills. Students are prepared for the Secondary Education Examination (SEE) with rigorous academics and co-curricular enrichment.",
      image: "https://picsum.photos/seed/kessecond/800/600",
      subjects: ["English", "Nepali", "Mathematics", "Science", "Social Studies", "Computer Science", "Health & Physical Education", "Optional Subjects"],
    },
    {
      id: "higher",
      title: "Higher Secondary",
      grades: "Grade 11 - 12",
      desc: "Our 10+2 program offers Science and Management streams under NEB affiliation. Students receive advanced preparation for university entrance exams and career counseling.",
      image: "https://picsum.photos/seed/keshigher/800/600",
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
    about: {
      en: "Kathmandu English School is a premier educational institution in Nepal, committed to academic excellence and holistic development since 1995.",
      ne: "काठमाडौं इंग्लिश स्कूल सन् १९९५ देखि शैक्षिक उत्कृष्टता र समग्र विकासका लागि प्रतिबद्ध नेपालको एक प्रमुख शैक्षिक संस्था हो।",
      ja: "カトマンズイングリッシュスクールは1995年以来、学業の卓越性と全人的発展に尽力するネパール有数の教育機関です。",
    },
    quickLinks: [
      { label: "About Us", href: "/about" },
      { label: "Admissions", href: "/admissions" },
      { label: "Academics", href: "/academics" },
      { label: "Our Team", href: "/staff" },
      { label: "Results", href: "/results" },
      { label: "Gallery", href: "/gallery" },
      { label: "News", href: "/news" },
      { label: "Careers", href: "/careers" },
      { label: "Calendar", href: "/calendar" },
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

  jobVacancies: [
    {
      id: 1,
      title: {
        en: "Secondary Level Mathematics Teacher",
        ne: "माध्यमिक तह गणित शिक्षक",
        ja: "中等教育数学教師",
      },
      category: {
        en: "Teaching",
        ne: "शिक्षण",
        ja: "教育",
      },
      level: {
        en: "Secondary (Grade 6-10)",
        ne: "माध्यमिक (कक्षा ६-१०)",
        ja: "中等教育（6〜10年生）",
      },
      experience: {
        en: "Minimum 3 years of teaching experience in a reputed school",
        ne: "प्रतिष्ठित विद्यालयमा न्यूनतम ३ वर्षको शिक्षण अनुभव",
        ja: "評判の良い学校での最低3年の教育経験",
      },
      salary: {
        en: "Negotiable (Based on experience and qualification)",
        ne: "वार्तालापयोग्य (अनुभव र योग्यताको आधारमा)",
        ja: "応相談（経験と資格に基づく）",
      },
      vacancies: 2,
      workstation: {
        en: "Naxal, Sanogaucharan, Kathmandu",
        ne: "नक्साल, सानोगौचरण, काठमाडौं",
        ja: "ナクサル、サノガウチャラン、カトマンズ",
      },
      responsibilities: [
        {
          en: "Plan and deliver engaging Mathematics lessons for Grade 6-10 following the NEB curriculum.",
          ne: "एनईबी पाठ्यक्रम अनुसार कक्षा ६-१० का लागि आकर्षक गणित पाठ योजना बनाउने र पढाउने।",
          ja: "NEBカリキュラムに従い、6〜10年生向けの魅力的な数学の授業を計画・実施する。",
        },
        {
          en: "Prepare lesson plans, assignments, and assessment papers in line with academic standards.",
          ne: "शैक्षिक मापदण्ड अनुसार पाठ योजना, असाइनमेन्ट र मूल्याङ्कन पत्र तयार गर्ने।",
          ja: "学業基準に沿った授業計画、課題、評価用紙を作成する。",
        },
        {
          en: "Evaluate student performance through regular tests, quizzes, and examinations.",
          ne: "नियमित परीक्षण, प्रश्नोत्तरी र परीक्षाहरू मार्फत विद्यार्थी प्रदर्शनको मूल्याङ्कन गर्ने।",
          ja: "定期的なテスト、小テスト、試験を通じて生徒の成績を評価する。",
        },
        {
          en: "Provide individual attention to weak students and conduct remedial classes.",
          ne: "कमजोर विद्यार्थीहरूलाई व्यक्तिगत ध्यान दिने र उपचारात्मक कक्षाहरू सञ्चालन गर्ने।",
          ja: "成績の振るわない生徒に個別の注意を払い、補習授業を行う。",
        },
        {
          en: "Participate in parent-teacher meetings and provide feedback on student progress.",
          ne: "अभिभावक-शिक्षक बैठकहरूमा भाग लिने र विद्यार्थी प्रगतिबारे प्रतिक्रिया दिने।",
          ja: "保護者面談に参加し、生徒の進捗状況についてフィードバックを提供する。",
        },
        {
          en: "Contribute to the Mathematics department's resource development and curriculum planning.",
          ne: "गणित विभागको स्रोत विकास र पाठ्यक्रम योजनामा योगदान दिने।",
          ja: "数学科の教材開発とカリキュラム計画に貢献する。",
        },
        {
          en: "Mentor junior teachers and participate in professional development workshops.",
          ne: "कनिष्ठ शिक्षकहरूलाई मार्गदर्शन गर्ने र व्यावसायिक विकास कार्यशालाहरूमा भाग लिने।",
          ja: "若手教師を指導し、専門能力開発ワークショップに参加する。",
        },
        {
          en: "Maintain accurate student records including attendance, grades, and behavioral reports.",
          ne: "उपस्थिति, ग्रेड र व्यवहारिक प्रतिवेदन सहित सही विद्यार्थी अभिलेख राख्ने।",
          ja: "出席、成績、行動報告を含む正確な生徒記録を維持する。",
        },
      ],
      addedOn: "2026-05-01",
      expiresOn: "2026-06-15",
      isActive: true,
    },
    {
      id: 2,
      title: {
        en: "Science Teacher (Physics Specialization)",
        ne: "विज्ञान शिक्षक (भौतिकशास्त्र विशेषज्ञता)",
        ja: "理科教師（物理専攻）",
      },
      category: {
        en: "Teaching",
        ne: "शिक्षण",
        ja: "教育",
      },
      level: {
        en: "Secondary and Higher Secondary",
        ne: "माध्यमिक र उच्च माध्यमिक",
        ja: "中等教育および高等中等教育",
      },
      experience: {
        en: "Minimum 2 years of teaching Physics; fresh Master's graduates may apply",
        ne: "भौतिकशास्त्र पढाउने न्यूनतम २ वर्षको अनुभव; नयाँ स्नातकोत्तर स्नातकहरूले आवेदन दिन सक्छन्",
        ja: "物理教育の最低2年の経験；修士卒業者は応募可能",
      },
      salary: {
        en: "Negotiable (Based on experience and qualification)",
        ne: "वार्तालापयोग्य (अनुभव र योग्यताको आधारमा)",
        ja: "応相談（経験と資格に基づく）",
      },
      vacancies: 1,
      workstation: {
        en: "Naxal, Sanogaucharan, Kathmandu",
        ne: "नक्साल, सानोगौचरण, काठमाडौं",
        ja: "ナクサル、サノガウチャラン、カトマンズ",
      },
      responsibilities: [
        {
          en: "Teach Physics theory and practical sessions to Grade 9-12 students.",
          ne: "कक्षा ९-१२ का विद्यार्थीहरूलाई भौतिकशास्त्रको सिद्धान्त र प्रयोगात्मक कक्षाहरू पढाउने।",
          ja: "9〜12年生の生徒に物理の理論と実習を教える。",
        },
        {
          en: "Set up and supervise laboratory experiments ensuring safety protocols.",
          ne: "सुरक्षा प्रोटोकल सुनिश्चित गर्दै प्रयोगशाला प्रयोगहरू सेटअप र सुपरिवेक्षण गर्ने।",
          ja: "安全プロトコルを確保しながら実験室の実験を設定・監督する。",
        },
        {
          en: "Prepare students for NEB board examinations and competitive entrance exams.",
          ne: "एनईबी बोर्ड परीक्षा र प्रतिस्पर्धात्मक प्रवेश परीक्षाहरूको लागि विद्यार्थीहरूलाई तयार गर्ने।",
          ja: "NEB試験および競争力のある入学試験に向けて生徒を準備する。",
        },
        {
          en: "Develop and grade periodic assessments, assignments, and project work.",
          ne: "आवधिक मूल्याङ्कन, असाइनमेन्ट र परियोजना कार्यको विकास र अंकन गर्ने।",
          ja: "定期的な評価、課題、プロジェクト作業を作成・採点する。",
        },
        {
          en: "Organize science exhibitions, quizzes, and Olympiad preparation sessions.",
          ne: "विज्ञान प्रदर्शनी, प्रश्नोत्तरी र ओलम्पियाड तयारी सत्रहरू आयोजना गर्ने।",
          ja: "科学展示会、クイズ、オリンピック準備セッションを企画する。",
        },
        {
          en: "Stay updated with curriculum changes and integrate modern teaching methods.",
          ne: "पाठ्यक्रम परिवर्तनहरूसँग अद्यावधिक रहने र आधुनिक शिक्षण विधिहरू एकीकृत गर्ने।",
          ja: "カリキュラムの変更に対応し、最新の教授法を取り入れる。",
        },
        {
          en: "Collaborate with the Science department on curriculum development and lab inventory.",
          ne: "पाठ्यक्रम विकास र प्रयोगशाला सूचीमा विज्ञान विभागसँग सहकार्य गर्ने।",
          ja: "カリキュラム開発と実験室の在庫管理について理科部門と協力する。",
        },
      ],
      addedOn: "2026-04-20",
      expiresOn: "2026-06-30",
      isActive: true,
    },
    {
      id: 3,
      title: {
        en: "English Language Teacher",
        ne: "अंग्रेजी भाषा शिक्षक",
        ja: "英語教師",
      },
      category: {
        en: "Teaching",
        ne: "शिक्षण",
        ja: "教育",
      },
      level: {
        en: "Primary Level (Grade 1-5)",
        ne: "प्राथमिक तह (कक्षा १-५)",
        ja: "初等教育（1〜5年生）",
      },
      experience: {
        en: "Minimum 1 year of teaching English; Montessori training preferred",
        ne: "अंग्रेजी पढाउने न्यूनतम १ वर्षको अनुभव; मोन्टेसरी तालिमलाई प्राथमिकता",
        ja: "英語教育の最低1年の経験；モンテッソーリ研修優遇",
      },
      salary: {
        en: "Negotiable (Based on experience and qualification)",
        ne: "वार्तालापयोग्य (अनुभव र योग्यताको आधारमा)",
        ja: "応相談（経験と資格に基づく）",
      },
      vacancies: 2,
      workstation: {
        en: "Naxal, Sanogaucharan, Kathmandu",
        ne: "नक्साल, सानोगौचरण, काठमाडौं",
        ja: "ナクサル、サノガウチャラン、カトマンズ",
      },
      responsibilities: [
        {
          en: "Teach English language and literature using interactive and communicative methods.",
          ne: "अन्तरक्रियात्मक र सञ्चारमूलक विधिहरू प्रयोग गरी अंग्रेजी भाषा र साहित्य पढाउने।",
          ja: "インタラクティブでコミュニケーション重視の方法で英語と英文学を教える。",
        },
        {
          en: "Focus on developing reading, writing, speaking, and listening skills.",
          ne: "पठन, लेखन, बोलाइ र सुनाइ कौशलहरूको विकासमा ध्यान केन्द्रित गर्ने।",
          ja: "読む、書く、話す、聞くのスキル向上に重点を置く。",
        },
        {
          en: "Organize storytelling, drama, and English club activities for students.",
          ne: "विद्यार्थीहरूका लागि कथा वाचन, नाटक र अंग्रेजी क्लब गतिविधिहरू आयोजना गर्ने।",
          ja: "生徒向けにストーリーテリング、演劇、英語クラブ活動を企画する。",
        },
        {
          en: "Prepare and grade creative writing assignments, comprehension tests, and oral assessments.",
          ne: "सृजनात्मक लेखन असाइनमेन्ट, बोध परीक्षण र मौखिक मूल्याङ्कन तयार र अंकन गर्ने।",
          ja: "創造的な作文課題、読解テスト、口頭評価を作成・採点する。",
        },
        {
          en: "Create a positive and encouraging classroom environment for language learning.",
          ne: "भाषा सिकाइका लागि सकारात्मक र प्रोत्साहनपूर्ण कक्षाकोठा वातावरण सिर्जना गर्ने।",
          ja: "言語学習のための前向きで励みになる教室環境を作る。",
        },
        {
          en: "Communicate regularly with parents regarding student language development.",
          ne: "विद्यार्थीको भाषा विकास सम्बन्धमा अभिभावकहरूसँग नियमित सञ्चार गर्ने।",
          ja: "生徒の言語発達について保護者と定期的に連絡を取る。",
        },
      ],
      addedOn: "2026-05-05",
      expiresOn: "2026-06-20",
      isActive: true,
    },
    {
      id: 4,
      title: {
        en: "Computer Science Teacher",
        ne: "कम्प्युटर विज्ञान शिक्षक",
        ja: "コンピューターサイエンス教師",
      },
      category: {
        en: "Teaching",
        ne: "शिक्षण",
        ja: "教育",
      },
      level: {
        en: "Secondary and Higher Secondary",
        ne: "माध्यमिक र उच्च माध्यमिक",
        ja: "中等教育および高等中等教育",
      },
      experience: {
        en: "Minimum 2 years of teaching programming and computer science",
        ne: "प्रोग्रामिङ र कम्प्युटर विज्ञान पढाउने न्यूनतम २ वर्षको अनुभव",
        ja: "プログラミングとコンピューターサイエンス教育の最低2年の経験",
      },
      salary: {
        en: "Negotiable (Based on experience and qualification)",
        ne: "वार्तालापयोग्य (अनुभव र योग्यताको आधारमा)",
        ja: "応相談（経験と資格に基づく）",
      },
      vacancies: 1,
      workstation: {
        en: "Naxal, Sanogaucharan, Kathmandu",
        ne: "नक्साल, सानोगौचरण, काठमाडौं",
        ja: "ナクサル、サノガウチャラン、カトマンズ",
      },
      responsibilities: [
        {
          en: "Teach Computer Science including programming (Python, C), web development, and database concepts.",
          ne: "प्रोग्रामिङ (पाइथन, सी), वेब विकास र डाटाबेस अवधारणाहरू सहित कम्प्युटर विज्ञान पढाउने।",
          ja: "プログラミング（Python、C）、Web開発、データベース概念を含むコンピューターサイエンスを教える。",
        },
        {
          en: "Conduct practical lab sessions and guide students in project development.",
          ne: "प्रयोगात्मक प्रयोगशाला सत्रहरू सञ्चालन गर्ने र परियोजना विकासमा विद्यार्थीहरूलाई मार्गदर्शन गर्ने।",
          ja: "実習ラボセッションを実施し、プロジェクト開発で生徒を指導する。",
        },
        {
          en: "Prepare students for NEB practical and theory board examinations.",
          ne: "एनईबी प्रयोगात्मक र सिद्धान्त बोर्ड परीक्षाहरूको लागि विद्यार्थीहरूलाई तयार गर्ने।",
          ja: "NEBの実技および理論試験に向けて生徒を準備する。",
        },
        {
          en: "Manage and maintain the school's computer lab including hardware and software updates.",
          ne: "हार्डवेयर र सफ्टवेयर अद्यावधिकहरू सहित विद्यालयको कम्प्युटर प्रयोगशाला व्यवस्थापन र मर्मत गर्ने।",
          ja: "ハードウェアとソフトウェアの更新を含め、学校のコンピューターラボを管理・維持する。",
        },
        {
          en: "Organize coding clubs, hackathons, and tech awareness programs.",
          ne: "कोडिङ क्लब, ह्याकाथन र प्रविधि सचेतना कार्यक्रमहरू आयोजना गर्ने।",
          ja: "コーディングクラブ、ハッカソン、技術啓発プログラムを企画する。",
        },
        {
          en: "Mentor students for national-level IT competitions and Olympiads.",
          ne: "राष्ट्रिय स्तरको आईटी प्रतियोगिता र ओलम्पियाडहरूको लागि विद्यार्थीहरूलाई मार्गदर्शन गर्ने।",
          ja: "全国レベルのIT競技会やオリンピックに向けて生徒を指導する。",
        },
        {
          en: "Integrate ICT tools into classroom teaching and assist other teachers with technology.",
          ne: "कक्षाकोठा शिक्षणमा आईसीटी उपकरणहरू एकीकृत गर्ने र अन्य शिक्षकहरूलाई प्रविधिमा सहायता गर्ने।",
          ja: "ICTツールを授業に統合し、他の教師の技術支援を行う。",
        },
      ],
      addedOn: "2026-05-10",
      expiresOn: "2026-06-25",
      isActive: true,
    },
    {
      id: 5,
      title: {
        en: "Administrative Assistant",
        ne: "प्रशासनिक सहायक",
        ja: "事務アシスタント",
      },
      category: {
        en: "Administration",
        ne: "प्रशासन",
        ja: "管理",
      },
      level: {
        en: "Entry Level",
        ne: "प्रवेश तह",
        ja: "初級",
      },
      experience: {
        en: "Minimum 1 year of administrative experience; school experience preferred",
        ne: "न्यूनतम १ वर्षको प्रशासनिक अनुभव; विद्यालय अनुभवलाई प्राथमिकता",
        ja: "最低1年の事務経験；学校経験優遇",
      },
      salary: {
        en: "NPR 25,000-35,000 per month (Based on experience)",
        ne: "प्रति महिना रु. २५,०००-३५,००० (अनुभवको आधारमा)",
        ja: "月額25,000〜35,000ネパールルピー（経験に基づく）",
      },
      vacancies: 1,
      workstation: {
        en: "Naxal, Sanogaucharan, Kathmandu",
        ne: "नक्साल, सानोगौचरण, काठमाडौं",
        ja: "ナクサル、サノガウチャラン、カトマンズ",
      },
      responsibilities: [
        {
          en: "Manage front desk operations including visitor reception and phone calls.",
          ne: "आगन्तुक स्वागत र फोन कलहरू सहित फ्रन्ट डेस्क सञ्चालन व्यवस्थापन गर्ने।",
          ja: "来客対応や電話応対を含むフロントデスク業務を管理する。",
        },
        {
          en: "Maintain student records, attendance registers, and administrative files.",
          ne: "विद्यार्थी अभिलेख, उपस्थिति दर्ता र प्रशासनिक फाइलहरू राख्ने।",
          ja: "生徒記録、出席簿、管理ファイルを維持する。",
        },
        {
          en: "Assist the Principal and Vice Principal with correspondence, scheduling, and reporting.",
          ne: "प्रधानाध्यापक र उप-प्रधानाध्यापकलाई पत्राचार, समयतालिका र प्रतिवेदनमा सहायता गर्ने।",
          ja: "校長および副校長の通信、スケジュール管理、報告を補佐する。",
        },
        {
          en: "Coordinate with parents regarding admissions, fee payments, and general inquiries.",
          ne: "प्रवेश, शुल्क भुक्तानी र सामान्य सोधपुछ सम्बन्धमा अभिभावकहरूसँग समन्वय गर्ने।",
          ja: "入学手続き、学費支払い、一般的な問い合わせについて保護者と調整する。",
        },
        {
          en: "Manage office supplies inventory and place procurement requests.",
          ne: "कार्यालय आपूर्ति सूची व्यवस्थापन र खरिद अनुरोधहरू राख्ने।",
          ja: "事務用品の在庫を管理し、調達依頼を行う。",
        },
        {
          en: "Support during school events, examinations, and parent-teacher meetings.",
          ne: "विद्यालय कार्यक्रम, परीक्षा र अभिभावक-शिक्षक बैठकहरूमा सहयोग गर्ने।",
          ja: "学校行事、試験、保護者面談の際にサポートする。",
        },
        {
          en: "Handle data entry and maintain the school management system database.",
          ne: "डाटा प्रविष्टि ह्यान्डल गर्ने र विद्यालय व्यवस्थापन प्रणाली डाटाबेस राख्ने।",
          ja: "データ入力を処理し、学校管理システムのデータベースを維持する。",
        },
      ],
      addedOn: "2026-05-15",
      expiresOn: "2026-06-10",
      isActive: true,
    },
    {
      id: 6,
      title: {
        en: "Librarian",
        ne: "पुस्तकालयाध्यक्ष",
        ja: "図書館司書",
      },
      category: {
        en: "Support Staff",
        ne: "सहयोगी कर्मचारी",
        ja: "サポートスタッフ",
      },
      level: {
        en: "Entry Level",
        ne: "प्रवेश तह",
        ja: "初級",
      },
      experience: {
        en: "Diploma in Library Science; experience in school library preferred",
        ne: "पुस्तकालय विज्ञानमा डिप्लोमा; विद्यालय पुस्तकालय अनुभवलाई प्राथमिकता",
        ja: "図書館学のディプロマ；学校図書館経験優遇",
      },
      salary: {
        en: "NPR 20,000-30,000 per month",
        ne: "प्रति महिना रु. २०,०००-३०,०००",
        ja: "月額20,000〜30,000ネパールルピー",
      },
      vacancies: 1,
      workstation: {
        en: "Naxal, Sanogaucharan, Kathmandu",
        ne: "नक्साल, सानोगौचरण, काठमाडौं",
        ja: "ナクサル、サノガウチャラン、カトマンズ",
      },
      responsibilities: [
        {
          en: "Manage day-to-day operations of the school library including book issuance and returns.",
          ne: "पुस्तक जारी र फिर्ता सहित विद्यालय पुस्तकालयको दैनिक सञ्चालन व्यवस्थापन गर्ने।",
          ja: "図書の貸出・返却を含む学校図書館の日常業務を管理する。",
        },
        {
          en: "Maintain the library catalog using digital library management software.",
          ne: "डिजिटल पुस्तकालय व्यवस्थापन सफ्टवेयर प्रयोग गरी पुस्तकालय सूची राख्ने।",
          ja: "デジタル図書館管理ソフトウェアを使用して図書目録を維持する。",
        },
        {
          en: "Assist students and teachers in locating reference materials and research resources.",
          ne: "सन्दर्भ सामग्री र अनुसन्धान स्रोतहरू खोज्न विद्यार्थी र शिक्षकहरूलाई सहायता गर्ने।",
          ja: "生徒や教師の参考資料や研究リソースの検索を支援する。",
        },
        {
          en: "Organize reading programs, book fairs, and author visit events.",
          ne: "पठन कार्यक्रम, पुस्तक मेला र लेखक भ्रमण कार्यक्रमहरू आयोजना गर्ने।",
          ja: "読書プログラム、ブックフェア、著者訪問イベントを企画する。",
        },
        {
          en: "Procure new books, journals, and educational resources based on teacher recommendations.",
          ne: "शिक्षक सिफारिसहरूको आधारमा नयाँ पुस्तक, जर्नल र शैक्षिक स्रोतहरू खरिद गर्ने।",
          ja: "教師の推薦に基づいて新しい図書、ジャーナル、教育リソースを調達する。",
        },
        {
          en: "Ensure a quiet, welcoming, and organized library environment.",
          ne: "शान्त, स्वागतयोग्य र व्यवस्थित पुस्तकालय वातावरण सुनिश्चित गर्ने।",
          ja: "静かで居心地の良い整理整頓された図書館環境を確保する。",
        },
        {
          en: "Maintain inventory and conduct annual stock verification.",
          ne: "सूची राख्ने र वार्षिक भण्डार प्रमाणीकरण सञ्चालन गर्ने।",
          ja: "在庫を維持し、年次在庫確認を実施する。",
        },
      ],
      addedOn: "2026-04-25",
      expiresOn: "2026-06-05",
      isActive: true,
    },
  ],

  calendarEvents: [
    {
      id: 1,
      title: {
        en: "New Year's Day (Rashtriya Topi Diwas)",
        ne: "नयाँ वर्षको दिन (राष्ट्रिय टोपी दिवस)",
        ja: "元日（ラシュトリヤ・トピ・ディワス）",
      },
      type: "holiday",
      date: "2026-01-01",
      description: {
        en: "Public holiday. School remains closed.",
        ne: "सार्वजनिक बिदा। विद्यालय बन्द रहन्छ।",
        ja: "祝日。学校は休校です。",
      },
    },
    {
      id: 2,
      title: {
        en: "Winter Vacation",
        ne: "हिउँदे बिदा",
        ja: "冬休み",
      },
      type: "vacation",
      date: "2026-01-02",
      description: {
        en: "Winter vacation continues.",
        ne: "हिउँदे बिदा जारी छ।",
        ja: "冬休み継続中。",
      },
    },
    {
      id: 3,
      title: {
        en: "Winter Vacation",
        ne: "हिउँदे बिदा",
        ja: "冬休み",
      },
      type: "vacation",
      date: "2026-01-05",
      description: {
        en: "Winter vacation continues.",
        ne: "हिउँदे बिदा जारी छ।",
        ja: "冬休み継続中。",
      },
    },
    {
      id: 4,
      title: {
        en: "Winter Vacation",
        ne: "हिउँदे बिदा",
        ja: "冬休み",
      },
      type: "vacation",
      date: "2026-01-08",
      description: {
        en: "Winter vacation continues.",
        ne: "हिउँदे बिदा जारी छ।",
        ja: "冬休み継続中。",
      },
    },
    {
      id: 5,
      title: {
        en: "School Reopens After Winter Break",
        ne: "हिउँदे बिदापछि विद्यालय पुनः खुल्ने",
        ja: "冬休み明け学校再開",
      },
      type: "event",
      date: "2026-01-12",
      description: {
        en: "All students to report by 9:00 AM in full uniform.",
        ne: "सबै विद्यार्थीहरू पूर्ण पोशाकमा बिहान ९:०० बजेसम्म उपस्थित हुनुपर्नेछ।",
        ja: "全生徒は制服着用で午前9時までに登校してください。",
      },
    },
    {
      id: 6,
      title: {
        en: "Staff Meeting",
        ne: "कर्मचारी बैठक",
        ja: "職員会議",
      },
      type: "event",
      date: "2026-01-13",
      description: {
        en: "All teaching and administrative staff must attend.",
        ne: "सबै शिक्षण र प्रशासनिक कर्मचारीहरू उपस्थित हुनुपर्नेछ।",
        ja: "全教職員および事務職員の出席が必須です。",
      },
    },
    {
      id: 7,
      title: {
        en: "Martyr's Day (Shahid Diwas)",
        ne: "शहीद दिवस",
        ja: "殉教者の日（シャヒード・ディワス）",
      },
      type: "holiday",
      date: "2026-01-30",
      description: {
        en: "Public holiday commemorating Nepal's martyrs.",
        ne: "नेपालका शहीदहरूको सम्झनामा सार्वजनिक बिदा।",
        ja: "ネパールの殉教者を追悼する祝日。",
      },
    },
    {
      id: 8,
      title: {
        en: "Parent-Teacher Meeting (Grades 1-5)",
        ne: "अभिभावक-शिक्षक बैठक (कक्षा १-५)",
        ja: "保護者面談（1〜5年生）",
      },
      type: "event",
      date: "2026-02-10",
      description: {
        en: "Scheduled from 10:00 AM to 2:00 PM.",
        ne: "बिहान १०:०० देखि दिउँसो २:०० बजेसम्म तय गरिएको।",
        ja: "午前10時から午後2時まで予定されています。",
      },
    },
    {
      id: 9,
      title: {
        en: "Valentine's Day Celebration",
        ne: "प्रणय दिवस समारोह",
        ja: "バレンタインデー祝賀会",
      },
      type: "event",
      date: "2026-02-14",
      description: {
        en: "Cultural program and card exchange activities.",
        ne: "सांस्कृतिक कार्यक्रम र कार्ड आदानप्रदान गतिविधिहरू।",
        ja: "文化プログラムとカード交換アクティビティ。",
      },
    },
    {
      id: 10,
      title: {
        en: "Maha Shivaratri",
        ne: "महाशिवरात्रि",
        ja: "マハ・シヴァラトリ",
      },
      type: "holiday",
      date: "2026-02-26",
      description: {
        en: "Public holiday for the festival of Lord Shiva.",
        ne: "भगवान शिवको पर्वको लागि सार्वजनिक बिदा।",
        ja: "シヴァ神の祭日のため休校。",
      },
    },
    {
      id: 11,
      title: {
        en: "First Monthly Test (Grade 6-10)",
        ne: "पहिलो मासिक परीक्षण (कक्षा ६-१०)",
        ja: "第1回月例テスト（6〜10年生）",
      },
      type: "exam",
      date: "2026-02-27",
      description: {
        en: "First monthly assessment test begins.",
        ne: "पहिलो मासिक मूल्याङ्कन परीक्षण सुरु।",
        ja: "第1回月例評価テスト開始。",
      },
    },
    {
      id: 12,
      title: {
        en: "International Women's Day",
        ne: "अन्तर्राष्ट्रिय महिला दिवस",
        ja: "国際女性デー",
      },
      type: "event",
      date: "2026-03-08",
      description: {
        en: "Special assembly and guest speaker program.",
        ne: "विशेष सभा र अतिथि वक्ता कार्यक्रम।",
        ja: "特別集会とゲストスピーカープログラム。",
      },
    },
    {
      id: 13,
      title: {
        en: "Holi Celebration",
        ne: "होली उत्सव",
        ja: "ホーリー祭",
      },
      type: "event",
      date: "2026-03-15",
      description: {
        en: "Holi festivities. Half-day only.",
        ne: "होली पर्व। आधा दिन मात्र।",
        ja: "ホーリー祭。半日のみ。",
      },
    },
    {
      id: 14,
      title: {
        en: "Fagu Purnima (Holi)",
        ne: "फागु पूर्णिमा (होली)",
        ja: "ファグ・プルニマ（ホーリー）",
      },
      type: "holiday",
      date: "2026-03-16",
      description: {
        en: "Public holiday for Holi.",
        ne: "होलीको लागि सार्वजनिक बिदा।",
        ja: "ホーリーのため祝日。",
      },
    },
    {
      id: 15,
      title: {
        en: "Academics: New Session Begins",
        ne: "शैक्षिक: नयाँ सत्र सुरु",
        ja: "新学期開始",
      },
      type: "event",
      date: "2026-04-01",
      description: {
        en: "New Academic Session 2083 formally inaugurated.",
        ne: "नयाँ शैक्षिक सत्र २०८३ औपचारिक रूपमा उद्घाटन।",
        ja: "2083年度新学期が正式に開始されました。",
      },
    },
    {
      id: 16,
      title: {
        en: "Admissions Open for Academic Year 2083",
        ne: "शैक्षिक वर्ष २०८३ को लागि प्रवेश खुला",
        ja: "2083年度入学受付開始",
      },
      type: "event",
      date: "2026-04-15",
      description: {
        en: "Online and in-person application forms available.",
        ne: "अनलाइन र व्यक्तिगत आवेदन फारमहरू उपलब्ध।",
        ja: "オンラインおよび対面の申込書が利用可能です。",
      },
    },
    {
      id: 17,
      title: {
        en: "School Anniversary Day",
        ne: "विद्यालय वार्षिकोत्सव दिवस",
        ja: "学校創立記念日",
      },
      type: "event",
      date: "2026-04-25",
      description: {
        en: "Cultural program and awards ceremony.",
        ne: "सांस्कृतिक कार्यक्रम र पुरस्कार समारोह।",
        ja: "文化プログラムと表彰式。",
      },
    },
    {
      id: 18,
      title: {
        en: "Labour Day",
        ne: "श्रमिक दिवस",
        ja: "労働者の日",
      },
      type: "holiday",
      date: "2026-05-01",
      description: {
        en: "International Workers' Day. School closed.",
        ne: "अन्तर्राष्ट्रिय श्रमिक दिवस। विद्यालय बन्द।",
        ja: "国際労働者の日。学校休校。",
      },
    },
    {
      id: 19,
      title: {
        en: "Buddha Jayanti",
        ne: "बुद्ध जयन्ती",
        ja: "ブッダ・ジャヤンティ",
      },
      type: "holiday",
      date: "2026-05-21",
      description: {
        en: "Public holiday celebrating Lord Buddha's birth.",
        ne: "भगवान बुद्धको जन्मोत्सव मनाउने सार्वजनिक बिदा।",
        ja: "ブッダの生誕を祝う祝日。",
      },
    },
    {
      id: 20,
      title: {
        en: "First Term Examination Begins",
        ne: "पहिलो त्रैमासिक परीक्षा सुरु",
        ja: "第1学期試験開始",
      },
      type: "exam",
      date: "2026-05-25",
      description: {
        en: "First term examinations for Grade 1-12.",
        ne: "कक्षा १-१२ को लागि पहिलो त्रैमासिक परीक्षा।",
        ja: "1〜12年生の第1学期試験。",
      },
    },
    {
      id: 21,
      title: {
        en: "First Term Examination Ends",
        ne: "पहिलो त्रैमासिक परीक्षा समाप्त",
        ja: "第1学期試験終了",
      },
      type: "exam",
      date: "2026-06-05",
      description: {
        en: "Last day of first term board exams.",
        ne: "पहिलो त्रैमासिक बोर्ड परीक्षाको अन्तिम दिन।",
        ja: "第1学期試験最終日。",
      },
    },
    {
      id: 22,
      title: {
        en: "Result Declaration: First Term",
        ne: "नतिजा घोषणा: पहिलो त्रैमासिक",
        ja: "成績発表：第1学期",
      },
      type: "event",
      date: "2026-06-15",
      description: {
        en: "Results published online and on notice board.",
        ne: "नतिजा अनलाइन र सूचना पाटीमा प्रकाशित।",
        ja: "成績はオンラインおよび掲示板で公開されます。",
      },
    },
    {
      id: 23,
      title: {
        en: "Summer Vacation Begins",
        ne: "ग्रीष्म बिदा सुरु",
        ja: "夏休み開始",
      },
      type: "vacation",
      date: "2026-06-20",
      description: {
        en: "Summer break for all students and staff.",
        ne: "सबै विद्यार्थी र कर्मचारीहरूको लागि ग्रीष्म बिदा।",
        ja: "全生徒・職員の夏休み。",
      },
    },
    {
      id: 24,
      title: {
        en: "Summer Vacation",
        ne: "ग्रीष्म बिदा",
        ja: "夏休み",
      },
      type: "vacation",
      date: "2026-06-30",
      description: {
        en: "Summer vacation continues.",
        ne: "ग्रीष्म बिदा जारी छ।",
        ja: "夏休み継続中。",
      },
    },
    {
      id: 25,
      title: {
        en: "School Reopens After Summer",
        ne: "ग्रीष्म बिदापछि विद्यालय पुनः खुल्ने",
        ja: "夏休み明け学校再開",
      },
      type: "event",
      date: "2026-07-15",
      description: {
        en: "Students to report by 9:00 AM.",
        ne: "विद्यार्थीहरू बिहान ९:०० बजेसम्म उपस्थित हुनुपर्नेछ।",
        ja: "生徒は午前9時までに登校してください。",
      },
    },
    {
      id: 26,
      title: {
        en: "Inter-House Sports Competition",
        ne: "अन्तर-सदन खेलकुद प्रतियोगिता",
        ja: "ハウス対抗スポーツ大会",
      },
      type: "event",
      date: "2026-08-10",
      description: {
        en: "Annual sports events between school houses.",
        ne: "विद्यालय सदनहरू बीचको वार्षिक खेलकुद कार्यक्रम।",
        ja: "学校ハウス間の年次スポーツイベント。",
      },
    },
    {
      id: 27,
      title: {
        en: "Teej Festival",
        ne: "तीज पर्व",
        ja: "ティージ祭",
      },
      type: "holiday",
      date: "2026-08-29",
      description: {
        en: "Festival for women. School closed.",
        ne: "महिलाहरूको पर्व। विद्यालय बन्द।",
        ja: "女性のための祭日。学校休校。",
      },
    },
    {
      id: 28,
      title: {
        en: "Second Monthly Test (Grade 6-10)",
        ne: "दोस्रो मासिक परीक्षण (कक्षा ६-१०)",
        ja: "第2回月例テスト（6〜10年生）",
      },
      type: "exam",
      date: "2026-09-05",
      description: {
        en: "Second monthly assessment test.",
        ne: "दोस्रो मासिक मूल्याङ्कन परीक्षण।",
        ja: "第2回月例評価テスト。",
      },
    },
    {
      id: 29,
      title: {
        en: "Shree Krishna Janmashtami",
        ne: "श्रीकृष्ण जन्माष्टमी",
        ja: "シュリ・クリシュナ・ジャンマシュタミ",
      },
      type: "holiday",
      date: "2026-09-15",
      description: {
        en: "Festival. Half-day.",
        ne: "पर्व। आधा दिन।",
        ja: "祭日。半日。",
      },
    },
    {
      id: 30,
      title: {
        en: "Dashain Vacation Begins",
        ne: "दशैं बिदा सुरु",
        ja: "ダサイン休暇開始",
      },
      type: "vacation",
      date: "2026-10-05",
      description: {
        en: "Dashain holidays. School closed for 15 days.",
        ne: "दशैं बिदा। विद्यालय १५ दिन बन्द।",
        ja: "ダサイン休暇。学校は15日間休校。",
      },
    },
    {
      id: 31,
      title: {
        en: "School Reopens After Dashain",
        ne: "दशैंपछि विद्यालय पुनः खुल्ने",
        ja: "ダサイン明け学校再開",
      },
      type: "event",
      date: "2026-10-20",
      description: {
        en: "Students report back after Dashain holidays.",
        ne: "दशैं बिदापछि विद्यार्थीहरू फर्किनेछन्।",
        ja: "ダサイン休暇明け、生徒が登校します。",
      },
    },
    {
      id: 32,
      title: {
        en: "Tihar Vacation",
        ne: "तिहार बिदा",
        ja: "ティハール休暇",
      },
      type: "vacation",
      date: "2026-10-28",
      description: {
        en: "Tihar holidays. School closed for 5 days.",
        ne: "तिहार बिदा। विद्यालय ५ दिन बन्द।",
        ja: "ティハール休暇。学校は5日間休校。",
      },
    },
    {
      id: 33,
      title: {
        en: "School Reopens After Tihar",
        ne: "तिहारपछि विद्यालय पुनः खुल्ने",
        ja: "ティハール明け学校再開",
      },
      type: "event",
      date: "2026-11-03",
      description: {
        en: "Regular classes resume.",
        ne: "नियमित कक्षाहरू पुनः सुरु।",
        ja: "通常授業再開。",
      },
    },
    {
      id: 34,
      title: {
        en: "Annual Sports Meet",
        ne: "वार्षिक खेलकुद भेला",
        ja: "年次スポーツ大会",
      },
      type: "event",
      date: "2026-11-15",
      description: {
        en: "Three-day athletic competition for all grades.",
        ne: "सबै कक्षाका लागि तीन-दिने खेलकुद प्रतियोगिता।",
        ja: "全学年対象の3日間の体育大会。",
      },
    },
    {
      id: 35,
      title: {
        en: "Art & Science Exhibition",
        ne: "कला र विज्ञान प्रदर्शनी",
        ja: "芸術・科学展示会",
      },
      type: "event",
      date: "2026-11-28",
      description: {
        en: "Students showcase projects and models.",
        ne: "विद्यार्थीहरूले परियोजना र मोडेलहरू प्रदर्शन गर्छन्।",
        ja: "生徒がプロジェクトと模型を展示します。",
      },
    },
    {
      id: 36,
      title: {
        en: "Second Term Examination Begins",
        ne: "दोस्रो त्रैमासिक परीक्षा सुरु",
        ja: "第2学期試験開始",
      },
      type: "exam",
      date: "2026-12-05",
      description: {
        en: "Second term board examinations for all grades.",
        ne: "सबै कक्षाका लागि दोस्रो त्रैमासिक बोर्ड परीक्षा।",
        ja: "全学年の第2学期試験。",
      },
    },
    {
      id: 37,
      title: {
        en: "Second Term Examination Ends",
        ne: "दोस्रो त्रैमासिक परीक्षा समाप्त",
        ja: "第2学期試験終了",
      },
      type: "exam",
      date: "2026-12-18",
      description: {
        en: "Last day of second term exams.",
        ne: "दोस्रो त्रैमासिक परीक्षाको अन्तिम दिन।",
        ja: "第2学期試験最終日。",
      },
    },
    {
      id: 38,
      title: {
        en: "Result Declaration: Second Term",
        ne: "नतिजा घोषणा: दोस्रो त्रैमासिक",
        ja: "成績発表：第2学期",
      },
      type: "event",
      date: "2026-12-24",
      description: {
        en: "Results published. Collect report cards.",
        ne: "नतिजा प्रकाशित। रिपोर्ट कार्ड सङ्कलन गर्नुहोस्।",
        ja: "成績発表。通知表を受け取ってください。",
      },
    },
    {
      id: 39,
      title: {
        en: "Christmas Day Celebration",
        ne: "क्रिसमस दिवस समारोह",
        ja: "クリスマス祝賀会",
      },
      type: "event",
      date: "2026-12-25",
      description: {
        en: "Christmas program and carol singing.",
        ne: "क्रिसमस कार्यक्रम र क्यारोल गायन।",
        ja: "クリスマスプログラムとキャロル合唱。",
      },
    },
    {
      id: 40,
      title: {
        en: "Winter Vacation Begins",
        ne: "हिउँदे बिदा सुरु",
        ja: "冬休み開始",
      },
      type: "vacation",
      date: "2026-12-26",
      description: {
        en: "Winter holidays. School closed.",
        ne: "हिउँदे बिदा। विद्यालय बन्द।",
        ja: "冬休み。学校休校。",
      },
    },
  ],
  notices: [
    {
      id: 1,
      title: {
        en: "First Term Examination Schedule Released",
        ne: "पहिलो त्रैमासिक परीक्षा तालिका प्रकाशित",
        ja: "第1学期試験スケジュール発表",
      },
      date: "2026-05-06",
      content: {
        en: "First term examinations for Grade 1 to 12 will commence from May 25, 2026. Detailed routine is available at the school reception.",
        ne: "कक्षा १ देखि १२ सम्मको पहिलो त्रैमासिक परीक्षा २०२६ मे २५ देखि सुरु हुनेछ। विस्तृत तालिका विद्यालय रिसेप्सनमा उपलब्ध छ।",
        ja: "1年生から12年生までの第1学期試験は2026年5月25日から開始されます。詳細な日程は学校受付で入手できます。",
      },
      priority: "high" as const,
    },
    {
      id: 2,
      title: {
        en: "Admission Open for Academic Year 2083",
        ne: "शैक्षिक वर्ष २०८३ को लागि भर्ना खुल्ला",
        ja: "2083年度入学受付開始",
      },
      date: "2026-05-03",
      content: {
        en: "Online and in-person admissions are now open for Nursery to Grade 11. Early bird discounts available until Asar 15.",
        ne: "नर्सरी देखि कक्षा ११ सम्मको लागि अनलाइन र व्यक्तिगत भर्ना खुल्ला। असार १५ सम्म अग्रिम भर्ना छुट उपलब्ध।",
        ja: "ナーサリーから11年生までのオンラインおよび対面入学受付を開始しました。Asar 15まで早期割引あり。",
      },
      priority: "high" as const,
    },
    {
      id: 3,
      title: {
        en: "Summer Vacation Notice",
        ne: "ग्रीष्म बिदा सूचना",
        ja: "夏季休暇のお知らせ",
      },
      date: "2026-04-28",
      content: {
        en: "Summer vacation will be observed from Asar 1 to Asar 20, 2083. School reopens on Asar 21.",
        ne: "२०८३ असार १ देखि असार २० सम्म ग्रीष्म बिदा हुनेछ। विद्यालय असार २१ मा पुनः खुल्नेछ।",
        ja: "2083年Asar 1からAsar 20まで夏季休暇となります。学校はAsar 21に再開します。",
      },
      priority: "normal" as const,
    },
    {
      id: 4,
      title: {
        en: "Annual Sports Meet Registration Open",
        ne: "वार्षिक खेलकुद प्रतियोगिता दर्ता खुल्ला",
        ja: "年次スポーツ大会登録受付中",
      },
      date: "2026-04-20",
      content: {
        en: "Students interested in participating in the Annual Sports Meet must register with their class teachers by Baisakh 25.",
        ne: "वार्षिक खेलकुद प्रतियोगितामा भाग लिन इच्छुक विद्यार्थीहरूले वैशाख २५ भित्र कक्षा शिक्षकमा दर्ता गराउनु पर्नेछ।",
        ja: "年次スポーツ大会に参加希望の生徒はBaisakh 25までに担任教師に登録してください。",
      },
      priority: "normal" as const,
    },
    {
      id: 5,
      title: {
        en: "Parent-Teacher Meeting Scheduled",
        ne: "अभिभावक-शिक्षक बैठक तय",
        ja: "保護者面談のお知らせ",
      },
      date: "2026-04-15",
      content: {
        en: "The second Parent-Teacher Meeting for this academic year is scheduled for Jestha 10, 2083. All parents are requested to attend.",
        ne: "यस शैक्षिक वर्षको दोस्रो अभिभावक-शिक्षक बैठक २०८३ जेठ १० मा हुने तय भएको छ। सबै अभिभावकलाई उपस्थितिको लागि अनुरोध।",
        ja: "今年度第2回保護者面談は2083年Jestha 10に予定されています。保護者の皆様のご出席をお願いいたします。",
      },
      priority: "normal" as const,
    },
    {
      id: 6,
      title: {
        en: "New Computer Lab Inauguration",
        ne: "नयाँ कम्प्युटर ल्याब उद्घाटन",
        ja: "新コンピューターラボ開設",
      },
      date: "2026-03-30",
      content: {
        en: "The newly upgraded computer lab with 40 workstations will be inaugurated by the Chairman on Chaitra 20.",
        ne: "४० वर्कस्टेशन सहितको नयाँ स्तरोन्नत कम्प्युटर ल्याबको उद्घाटन अध्यक्षद्वारा चैत्र २० मा गरिनेछ।",
        ja: "40台のワークステーションを備えた新コンピューターラボがChaitra 20に理事長により開設されます。",
      },
      priority: "low" as const,
    },
    {
      id: 7,
      title: {
        en: "Holi Celebration and Early Dismissal",
        ne: "होली उत्सव र छिटो विदाई",
        ja: "ホーリー祭と早期下校のお知らせ",
      },
      date: "2026-03-10",
      content: {
        en: "Holi celebration will be organized at school on Chaitra 5. School will close at 12:00 PM. Students are advised to wear old clothes.",
        ne: "चैत्र ५ मा विद्यालयमा होली उत्सव आयोजना गरिनेछ। विद्यालय दिउँसो १२:०० बजे बन्द हुनेछ। विद्यार्थीहरूलाई पुराना कपडा लगाउन सल्लाह।",
        ja: "Chaitra 5に学校でホーリー祭が開催されます。学校は午後12時に終了します。古着の着用をお勧めします。",
      },
      priority: "low" as const,
    },
  ],
};
