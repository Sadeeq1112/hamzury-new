export const NG_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT — Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara"
] as const;

export const GENDERS = ["Female", "Male", "Prefer not to say"] as const;

export const AGE_BANDS = ["17–20", "21–25", "26–30", "31–35", "36 and above"] as const;

export const OCCUPATIONS = [
  "Student",
  "NYSC",
  "Employed",
  "Self-employed",
  "Founder / business owner",
  "Unemployed",
  "Other"
] as const;

export const EDUCATION = ["SSCE / WAEC", "ND", "HND", "Bachelor's", "Master's", "Doctorate", "Other"] as const;

export const HEARD_ABOUT = [
  "WhatsApp",
  "Instagram",
  "Facebook",
  "A friend or family",
  "School or campus",
  "An event",
  "The website",
  "Other"
] as const;

export const JUNIOR_CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3", "Other"] as const;

export const GUARDIAN_RELS = ["Mother", "Father", "Guardian", "Aunt", "Uncle", "Other"] as const;

export const JUNIOR_INTERESTS = [
  "Software",
  "Hardware / robotics",
  "Design",
  "Making content",
  "Not sure yet"
] as const;

export const PARTNER_TYPES = [
  "School",
  "Company",
  "Training organisation",
  "Technology partner",
  "Community group",
  "Government / agency",
  "Other"
] as const;

export const SPONSOR_TYPES = ["Individual", "Business", "Foundation", "Institution"] as const;

export const SPONSOR_AREAS = [
  "Junior innovation",
  "Digital skills",
  "Technology",
  "Entrepreneurship",
  "Equipment",
  "Scholarships",
  "Projects"
] as const;

export const SPONSOR_FORMS = ["Money", "Equipment", "Scholarships", "Mentoring", "Other"] as const;

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function isNgPhone(value: string) {
  const d = String(value).replace(/\D/g, "");
  if (/^0[789]\d{9}$/.test(d)) return true;
  if (/^234[789]\d{9}$/.test(d)) return true;
  return false;
}

export function ageFromDob(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(+d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}
