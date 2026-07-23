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
    admin = await User.create({
      name: "Site Admin",
      email: "admin@studentlifehungary.com",
      password: "ChangeMe123!",
      role: "admin",
      isEmailVerified: true,
    });
    console.log("Created admin user: admin@studentlifehungary.com / ChangeMe123! — change this password immediately.");
  }

  let editor = await User.findOne({ email: "editor@studentlifehungary.com" });
  if (!editor) {
    editor = await User.create({
      name: "Content Editor",
      email: "editor@studentlifehungary.com",
      password: "ChangeMe123!",
      role: "editor",
      isEmailVerified: true,
    });
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
  const universityDefs = [
    {
      name: "Eötvös Loránd University",
      description: "One of Hungary's most prestigious research universities, based in Budapest.",
      city: "Budapest",
      fieldsOfStudy: ["Law", "Sciences", "Humanities", "IT"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "Hungarian"],
      scholarshipsAvailable: true,
    },
    {
      name: "University of Szeged",
      description: "A leading university in southern Hungary known for medicine and sciences.",
      city: "Szeged",
      fieldsOfStudy: ["Medicine", "Pharmacy", "Sciences"],
      degreeLevels: ["bachelor", "master", "phd"],
      languagesOfInstruction: ["English", "Hungarian"],
      scholarshipsAvailable: true,
    },
    {
      name: "University of Debrecen",
      description: "Hungary's second-largest university, popular with international students.",
      city: "Debrecen",
      fieldsOfStudy: ["Medicine", "Engineering", "Agriculture"],
      degreeLevels: ["bachelor", "master", "exchange"],
      languagesOfInstruction: ["English"],
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
