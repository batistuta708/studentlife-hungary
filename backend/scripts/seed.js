/**
 * Seeds the database with representative sample data across every collection, so a
 * fresh deployment (or a new developer's local setup) isn't staring at an empty site.
 *
 * Usage:
 *   node scripts/seed.js          # seed (skips collections that already have data)
 *   node scripts/seed.js --reset  # wipes every collection first, then seeds fresh
 *
 * Deliberately NOT run automatically on server start — seeding production by accident
 * because a deploy script ran `npm run dev` once would be a bad time.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const {
  User,
  Category,
  Article,
  Job,
  Accommodation,
  University,
  Scholarship,
} = require("../src/models");

const RESET = process.argv.includes("--reset");

// A random password each run, rather than a static hardcoded default — a fixed
// well-known "ChangeMe123!"-style password is exactly the kind of thing that ends up
// documented somewhere public and then never actually gets changed on every deployment
// that runs this script.
function generateTempPassword() {
  return crypto.randomBytes(9).toString("base64url"); // 12 chars, URL-safe, no ambiguous symbols
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding.");

  if (RESET) {
    console.log("Resetting collections...");
    await Promise.all(
      [User, Category, Article, Job, Accommodation, University, Scholarship].map((m) => m.deleteMany({}))
    );
  }

  // --- Admin + editor accounts ---
  let admin = await User.findOne({ email: "admin@studentlifehungary.com" });
  if (!admin) {
    const tempPassword = generateTempPassword();
    admin = await User.create({
      name: "Site Admin",
      email: "admin@studentlifehungary.com",
      password: tempPassword,
      role: "admin",
      isEmailVerified: true,
    });
    console.log(`Created admin user: admin@studentlifehungary.com / ${tempPassword}`);
    console.log("This password is shown only once — save it now, then change it after logging in.");
  }

  let editor = await User.findOne({ email: "editor@studentlifehungary.com" });
  if (!editor) {
    const editorTempPassword = generateTempPassword();
    editor = await User.create({
      name: "Content Editor",
      email: "editor@studentlifehungary.com",
      password: editorTempPassword,
      role: "editor",
      isEmailVerified: true,
    });
    console.log(`Created editor user: editor@studentlifehungary.com / ${editorTempPassword}`);
  }

  // --- Categories ---
  const categoryDefs = [
    { name: "Visa & Permits", appliesTo: "article" },
    { name: "Housing Tips", appliesTo: "article" },
    { name: "Student Life", appliesTo: "article" },
    { name: "Hospitality", appliesTo: "job" },
    { name: "Tutoring", appliesTo: "job" },
  ];
  const categories = {};
  for (const def of categoryDefs) {
    let cat = await Category.findOne({ name: def.name });
    if (!cat) cat = await Category.create(def);
    categories[def.name] = cat;
  }

  // --- Universities ---
 // --- Universities ---
  // Data verified against each university's own site and reputable sources (Wikipedia,
  // THE/QS rankings pages) — founding years, student counts, and specializations are
  // real, not placeholder figures.
  const universityDefs = [
    {
      name: "Eötvös Loránd University",
      description:
        "One of Hungary's oldest and most prestigious research universities, founded in 1635 and based in Budapest. ELTE is consistently ranked among the top Hungarian institutions across law, sciences, humanities, and informatics.",
      city: "Budapest",
      website: "https://www.elte.hu/en/",
      foundedYear: 1635,
      type: "public",
      fieldsOfStudy: ["Law", "Sciences", "Humanities", "IT", "Social Sciences"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "Hungarian"],
      scholarshipsAvailable: true,
    },
    {
      name: "University of Szeged",
      description:
        "A leading research university in southern Hungary, home to a Nobel Prize-winning research legacy (Albert Szent-Györgyi's discovery of vitamin C) and particularly strong medicine, pharmacy, and natural sciences programs.",
      city: "Szeged",
      website: "https://u-szeged.hu/english",
      foundedYear: 1581,
      type: "public",
      fieldsOfStudy: ["Medicine", "Pharmacy", "Sciences", "Law", "Economics"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "Hungarian"],
      scholarshipsAvailable: true,
    },
    {
      name: "University of Debrecen",
      description:
        "Hungary's second-largest university and one of the most popular destinations for international students, with especially strong medicine, engineering, and agricultural science faculties.",
      city: "Debrecen",
      website: "https://unideb.hu/en",
      foundedYear: 1538,
      type: "public",
      fieldsOfStudy: ["Medicine", "Engineering", "Agriculture", "Sciences"],
      degreeLevels: ["bachelor", "master", "exchange"],
      languagesOfInstruction: ["English"],
      scholarshipsAvailable: true,
    },
    {
      name: "Budapest University of Technology and Economics",
      description:
        "Hungary's leading technical university, founded in 1782 and one of the oldest institutes of technology in the world. BME issues roughly 70% of Hungary's engineering degrees and hosts around 3,000 international students from over 100 countries.",
      city: "Budapest",
      website: "https://www.bme.hu/",
      foundedYear: 1782,
      type: "public",
      fieldsOfStudy: ["Civil Engineering", "Architecture", "Electrical Engineering", "Mechanical Engineering", "Computer Science"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "Hungarian", "German"],
      scholarshipsAvailable: true,
    },
    {
      name: "Semmelweis University",
      description:
        "Hungary's oldest and most prestigious medical school, founded in 1769. Semmelweis is one of the most internationally diverse universities in the country, with students from around 130 countries and English-language medical programs dating back to 1987.",
      city: "Budapest",
      website: "https://semmelweis.hu/english/",
      foundedYear: 1769,
      type: "public",
      fieldsOfStudy: ["Medicine", "Dentistry", "Pharmacy", "Health Sciences"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "German", "Hungarian"],
      scholarshipsAvailable: true,
    },
    {
      name: "Corvinus University of Budapest",
      description:
        "Hungary's leading university for business, economics, and social sciences, with roots dating to 1920. Corvinus is the only Hungarian member of the CEMS global business education alliance and hosts the largest number of incoming Erasmus students in the country.",
      city: "Budapest",
      website: "https://www.uni-corvinus.hu/",
      foundedYear: 1920,
      type: "public",
      fieldsOfStudy: ["Business Administration", "Economics", "Social Sciences", "International Relations"],
      degreeLevels: ["bachelor", "master", "phd", "exchange"],
      languagesOfInstruction: ["English", "Hungarian", "French", "German"],
      scholarshipsAvailable: true,
    },
    {
      name: "University of Pécs",
      description:
        "The oldest university in Hungary, founded in 1367 by King Louis I. Now one of the country's largest institutions with over 100 English-language programs and one of Hungary's most internationalized student bodies, drawing students from 140+ countries.",
      city: "Pécs",
      website: "https://international.pte.hu/",
      foundedYear: 1367,
      type: "public",
      fieldsOfStudy: ["Medicine", "Law", "Humanities", "Business and Economics", "Engineering and IT"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "German", "Hungarian"],
      scholarshipsAvailable: true,
    },
  ];
  const universities = [];
  for (const def of universityDefs) {
    let uni = await University.findOne({ name: def.name });
    if (!uni) uni = await University.create(def);
    universities.push(uni);
  }

  // --- Articles ---
  const articleDefs = [
    {
      title: "Complete Guide to Getting a Hungarian Student Visa",
      excerpt: "Everything you need to know about the D-visa application process for non-EU students.",
      content: "<p>Applying for a Hungarian student visa involves several steps...</p>",
      coverImage: { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Passport and visa documents" },
      categories: [categories["Visa & Permits"]._id],
      tags: ["visa", "immigration", "non-eu"],
      status: "published",
      publishedAt: new Date(),
      isFeatured: true,
    },
    {
      title: "Finding Affordable Student Housing in Budapest",
      excerpt: "A practical guide to dorms, shared apartments, and everything in between.",
      content: "<p>Budapest offers several housing options for international students...</p>",
      coverImage: { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Budapest apartment building" },
      categories: [categories["Housing Tips"]._id],
      tags: ["housing", "budapest", "budget"],
      status: "published",
      publishedAt: new Date(),
      isFeatured: true,
    },
    {
      title: "Opening a Bank Account as a Foreign Student",
      excerpt: "Step-by-step instructions for setting up Hungarian banking as an international student.",
      content: "<p>Most Hungarian banks require a residence permit and proof of enrollment...</p>",
      coverImage: { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Bank card and documents" },
      categories: [categories["Student Life"]._id],
      tags: ["banking", "finance"],
      status: "published",
      publishedAt: new Date(),
    },
  ];
  for (const def of articleDefs) {
    const exists = await Article.findOne({ title: def.title });
    if (!exists) await Article.create({ ...def, author: editor._id });
  }

  // --- Jobs ---
  const jobDefs = [
    {
      title: "Barista at Cafe Frei",
      company: { name: "Cafe Frei" },
      description: "Part-time barista position near ELTE campus, flexible hours around classes.",
      location: { city: "Budapest" },
      employmentType: "part-time",
      category: categories["Hospitality"]._id,
      status: "approved",
    },
    {
      title: "English Tutor for High School Students",
      company: { name: "Private Family" },
      description: "Weekly English conversation practice for two teenagers.",
      location: { city: "Debrecen" },
      employmentType: "freelance",
      category: categories["Tutoring"]._id,
      status: "approved",
    },
  ];
  for (const def of jobDefs) {
    const exists = await Job.findOne({ title: def.title });
    if (!exists) await Job.create({ ...def, postedBy: admin._id });
  }

  // --- Accommodation ---
  const accommodationDefs = [
    {
      title: "Cozy Studio near ELTE Campus",
      description: "Fully furnished studio apartment, 10 minutes walk from ELTE main building.",
      type: "studio",
      location: { address: "Váci út 1", city: "Budapest", nearestUniversity: universities[0]._id },
      price: { amount: 180000, currency: "HUF" },
      capacity: { availableRooms: 1 },
      images: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Studio apartment interior" }],
      status: "approved",
    },
    {
      title: "Shared Apartment — 1 Room Available",
      description: "Room in a 3-bedroom shared apartment, all utilities included.",
      type: "shared-apartment",
      location: { address: "Rákóczi út 15", city: "Szeged", nearestUniversity: universities[1]._id },
      price: { amount: 95000, currency: "HUF", utilitiesIncluded: true },
      capacity: { availableRooms: 1, roommates: 2 },
      images: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Shared apartment living room" }],
      status: "approved",
    },
  ];
  for (const def of accommodationDefs) {
    const exists = await Accommodation.findOne({ title: def.title });
    if (!exists) await Accommodation.create({ ...def, listedBy: admin._id });
  }

  // --- Scholarships ---
  const scholarshipDefs = [
    {
      title: "Stipendium Hungaricum Scholarship",
      provider: "Tempus Public Foundation",
      description: "Full-ride scholarship covering tuition, accommodation, and a monthly stipend.",
      coverageType: "full-ride",
      amount: { isFullyFunded: true },
      eligibleDegreeLevels: ["bachelor", "master", "phd"],
      applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      applicationUrl: "https://stipendiumhungaricum.hu",
      status: "open",
      isFeatured: true,
    },
  ];
  for (const def of scholarshipDefs) {
    const exists = await Scholarship.findOne({ title: def.title });
    if (!exists) await Scholarship.create({ ...def, postedBy: admin._id });
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
