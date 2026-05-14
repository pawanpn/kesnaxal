import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const locales = ["en", "ne", "ja"];

function flatSeed(rows) {
  return rows.map((r) => ({ ...r, content_json: r.content_json || {} }));
}

function addLocale(rows, section, key, getText) {
  locales.forEach((locale) => {
    rows.push({ section, content_key: key, locale, content_text: getText(locale), content_json: {}, status: "published" });
  });
}

function addSimple(rows, section, key, value) {
  locales.forEach((locale) => {
    rows.push({ section, content_key: key, locale, content_text: value, content_json: {}, status: "published" });
  });
}

function addLC(rows, section, key, lc) {
  addLocale(rows, section, key, (l) => lc[l] || lc.en || "");
}

function generateSeedData(siteConfig) {
  const rows = [];
  const { school, contact, footer } = siteConfig;

  // School
  addSimple(rows, "school", "name", school.name);
  addSimple(rows, "school", "shortName", school.shortName);
  addSimple(rows, "school", "motto", school.motto);
  addSimple(rows, "school", "established", String(school.established));
  addSimple(rows, "school", "history", school.history);
  addSimple(rows, "school", "principal_name", school.principal.name);
  addSimple(rows, "school", "principal_message", school.principal.message);

  // Contact
  addSimple(rows, "contact", "address", contact.address);
  addSimple(rows, "contact", "phone", contact.phone);
  addSimple(rows, "contact", "phone2", contact.phone2);
  addSimple(rows, "contact", "email", contact.email);
  addSimple(rows, "contact", "admissionsEmail", contact.admissionsEmail);
  addSimple(rows, "contact", "mapEmbedUrl", contact.mapEmbedUrl);

  // Hero
  siteConfig.hero.slides.forEach((slide, i) => {
    addLC(rows, "hero", `slide_${i}_title`, slide.title);
    addLC(rows, "hero", `slide_${i}_subtitle`, slide.subtitle);
    addSimple(rows, "hero", `slide_${i}_image`, slide.image);
  });

  // Events
  siteConfig.upcomingEvents.forEach((event) => {
    const id = `event_${event.id}`;
    addLC(rows, "events", `${id}_title`, event.title);
    addLC(rows, "events", `${id}_description`, event.description);
    addLC(rows, "events", `${id}_location`, event.location);
    addSimple(rows, "events", `${id}_date`, event.date);
    addSimple(rows, "events", `${id}_time`, event.time);
    addSimple(rows, "events", `${id}_image`, event.image);
  });

  // News
  siteConfig.newsArticles.forEach((article) => {
    const id = `article_${article.id}`;
    addLC(rows, "news", `${id}_title`, article.title);
    addLC(rows, "news", `${id}_excerpt`, article.excerpt);
    addLC(rows, "news", `${id}_content`, article.content);
    addSimple(rows, "news", `${id}_author`, article.author);
    addSimple(rows, "news", `${id}_date`, article.date);
    addSimple(rows, "news", `${id}_image`, article.image);
    addSimple(rows, "news", `${id}_category`, article.category);
    addSimple(rows, "news", `${id}_slug`, article.slug);
    addSimple(rows, "news", `${id}_tags`, JSON.stringify(article.tags));
  });

  // Testimonials
  siteConfig.testimonials.forEach((t) => {
    const id = `testimonial_${t.id}`;
    addLC(rows, "testimonials", `${id}_text`, t.text);
    addSimple(rows, "testimonials", `${id}_name`, t.name);
    addSimple(rows, "testimonials", `${id}_role`, t.role);
    addSimple(rows, "testimonials", `${id}_image`, t.image);
  });

  // Footer
  addLC(rows, "footer", "about", footer.about);

  // Academic Levels
  siteConfig.academicLevels.forEach((level) => {
    const id = `level_${level.id}`;
    addSimple(rows, "academics", `${id}_title`, level.title);
    addSimple(rows, "academics", `${id}_grades`, level.grades);
    addSimple(rows, "academics", `${id}_desc`, level.desc);
    addSimple(rows, "academics", `${id}_image`, level.image);
    if (level.subjects) addSimple(rows, "academics", `${id}_subjects`, JSON.stringify(level.subjects));
    if (level.streams) addSimple(rows, "academics", `${id}_streams`, JSON.stringify(level.streams));
  });

  // Faculty
  siteConfig.faculty.forEach((m, i) => {
    const id = `faculty_${i}`;
    addSimple(rows, "faculty", `${id}_name`, m.name);
    addSimple(rows, "faculty", `${id}_role`, m.role);
    addSimple(rows, "faculty", `${id}_dept`, m.dept);
  });

  // Staff
  siteConfig.staff.forEach((m) => {
    const id = `staff_${m.id}`;
    addSimple(rows, "staff", `${id}_name`, m.name);
    addSimple(rows, "staff", `${id}_designation`, m.designation);
    if (m.department) addSimple(rows, "staff", `${id}_department`, m.department);
    addSimple(rows, "staff", `${id}_photo`, m.photo);
  });

  // Jobs
  siteConfig.jobVacancies.forEach((job) => {
    const id = `job_${job.id}`;
    addLC(rows, "careers", `${id}_title`, job.title);
    addLC(rows, "careers", `${id}_category`, job.category);
    addLC(rows, "careers", `${id}_level`, job.level);
    addLC(rows, "careers", `${id}_experience`, job.experience);
    addLC(rows, "careers", `${id}_salary`, job.salary);
    addLC(rows, "careers", `${id}_workstation`, job.workstation);
    addSimple(rows, "careers", `${id}_vacancies`, String(job.vacancies));
    addSimple(rows, "careers", `${id}_addedOn`, job.addedOn);
    addSimple(rows, "careers", `${id}_expiresOn`, job.expiresOn);
    addSimple(rows, "careers", `${id}_isActive`, String(job.isActive));
    job.responsibilities.forEach((resp, ri) => addLC(rows, "careers", `${id}_resp_${ri}`, resp));
  });

  // Calendar
  siteConfig.calendarEvents.forEach((event) => {
    const id = `calendar_${event.id}`;
    addLC(rows, "calendar", `${id}_title`, event.title);
    if (event.description) addLC(rows, "calendar", `${id}_description`, event.description);
    addSimple(rows, "calendar", `${id}_date`, event.date);
    addSimple(rows, "calendar", `${id}_type`, event.type);
  });

  // Gallery
  addSimple(rows, "gallery", "categories", JSON.stringify(siteConfig.gallery.categories));
  siteConfig.gallery.images.forEach((img, i) => {
    addSimple(rows, "gallery", `image_${i}_src`, img.src);
    addSimple(rows, "gallery", `image_${i}_alt`, img.alt);
    addSimple(rows, "gallery", `image_${i}_category`, img.category);
    addSimple(rows, "gallery", `image_${i}_width`, String(img.width));
    addSimple(rows, "gallery", `image_${i}_height`, String(img.height));
  });

  return flatSeed(rows);
}

async function main() {
  console.log("Loading siteConfig...");
  const { siteConfig } = await import("../src/constants/siteConfig.ts");

  console.log("Generating seed data...");
  const rows = generateSeedData(siteConfig);
  console.log(`Generated ${rows.length} rows`);

  console.log("Upserting to Supabase...");
  // Insert in batches of 100 to avoid payload limits
  const batchSize = 100;
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("site_content").upsert(batch, {
      onConflict: "section,content_key,locale",
      ignoreDuplicates: false,
    });
    if (error) {
      console.error("Batch error:", error.message);
      process.exit(1);
    }
    total += batch.length;
    console.log(`  Inserted ${total}/${rows.length}`);
  }

  console.log(`Done! Seeded ${rows.length} rows successfully.`);
}

main();
