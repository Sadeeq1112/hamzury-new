import { z } from "zod";
import { TRACK_IDS } from "./catalog";
import {
  AGE_BANDS,
  EDUCATION,
  GENDERS,
  GUARDIAN_RELS,
  HEARD_ABOUT,
  JUNIOR_CLASSES,
  JUNIOR_INTERESTS,
  NG_STATES,
  OCCUPATIONS,
  isEmail,
  isNgPhone,
  ageFromDob
} from "./lists";

const short = z.string().trim().max(200);
const long = z.string().trim().max(2000);
const phone = z
  .string()
  .trim()
  .refine(isNgPhone, "Use a Nigerian number, e.g. 0803 123 4567.");

export const applicationSchema = z
  .object({
    ref: z.string().trim().max(32).optional().nullable(),
    name: z.string().trim().min(2, "Your name.").max(120),
    email: z.string().trim().email("A valid email.").max(160),
    phone,
    location: z.string().trim().min(2, "Your city or town.").max(120),
    gender: z.enum(GENDERS),
    state: z.enum(NG_STATES),
    occupation: z.enum(OCCUPATIONS).optional().nullable(),
    education: z.enum(EDUCATION).optional().nullable(),
    heardAbout: z.enum(HEARD_ABOUT),
    route: z.enum(["junior", "ceo", "founder", "ecosystem", "siwes"]),
    track: z.string().trim().max(40).optional().nullable(),
    siwes: z.string().trim().max(20).optional().nullable(),
    level: z.enum(["needs", "ready"]).optional().nullable(),
    age: z.string().trim().max(20).optional().nullable(),
    guess: z.string().trim().max(40).optional().nullable(),
    dob: short.optional().nullable(),
    school: short.optional().nullable(),
    cls: z.enum(JUNIOR_CLASSES).optional().nullable(),
    interests: z.enum(JUNIOR_INTERESTS).optional().nullable(),
    guardianName: short.optional().nullable(),
    guardianRel: z.enum(GUARDIAN_RELS).optional().nullable(),
    guardianPhone: z.string().trim().max(30).optional().nullable(),
    guardianEmail: z.string().trim().max(160).optional().nullable().or(z.literal("")),
    emergency: z.string().trim().max(30).optional().nullable(),
    consent: z.boolean().optional().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.route === "junior") {
      if (!data.dob) ctx.addIssue({ code: "custom", path: ["dob"], message: "Date of birth is required." });
      else {
        const age = ageFromDob(data.dob);
        if (age == null || age < 13 || age > 16)
          ctx.addIssue({ code: "custom", path: ["dob"], message: "Junior Innovator is for ages 13–16." });
      }
      if (!data.school || data.school.length < 2)
        ctx.addIssue({ code: "custom", path: ["school"], message: "School is required." });
      if (!data.cls) ctx.addIssue({ code: "custom", path: ["cls"], message: "Class is required." });
      if (!data.interests) ctx.addIssue({ code: "custom", path: ["interests"], message: "Choose an interest." });
      if (!data.guardianName || data.guardianName.length < 2)
        ctx.addIssue({ code: "custom", path: ["guardianName"], message: "Guardian name is required." });
      if (!data.guardianRel) ctx.addIssue({ code: "custom", path: ["guardianRel"], message: "Relationship is required." });
      if (!data.guardianPhone || !isNgPhone(data.guardianPhone))
        ctx.addIssue({ code: "custom", path: ["guardianPhone"], message: "A reachable Nigerian number." });
      if (!data.guardianEmail || !isEmail(data.guardianEmail))
        ctx.addIssue({ code: "custom", path: ["guardianEmail"], message: "A valid email." });
      if (!data.emergency || !isNgPhone(data.emergency))
        ctx.addIssue({ code: "custom", path: ["emergency"], message: "An emergency number." });
      if (!data.consent)
        ctx.addIssue({ code: "custom", path: ["consent"], message: "Guardian consent is required." });
    } else {
      if (!data.occupation) ctx.addIssue({ code: "custom", path: ["occupation"], message: "Occupation is required." });
      if (!data.education) ctx.addIssue({ code: "custom", path: ["education"], message: "Education is required." });
      if (!data.age || !(AGE_BANDS as readonly string[]).includes(data.age))
        ctx.addIssue({ code: "custom", path: ["age"], message: "Age range is required." });
    }
    if (data.route === "ceo" && data.track && !TRACK_IDS.includes(data.track as (typeof TRACK_IDS)[number])) {
      ctx.addIssue({ code: "custom", path: ["track"], message: "Unknown track." });
    }
    if (data.route === "junior" && data.track && !["software", "hardware"].includes(data.track)) {
      ctx.addIssue({ code: "custom", path: ["track"], message: "Unknown junior route." });
    }
    if (data.route === "siwes" && data.siwes && !["1", "2", "3", "intern"].includes(data.siwes)) {
      ctx.addIssue({ code: "custom", path: ["siwes"], message: "Unknown SIWES option." });
    }
  });

export const trackUpdateSchema = z.object({
  track: z.string().trim().min(1).max(40),
  siwes: z.string().trim().max(20).optional().nullable()
});

export const enquirySchema = z
  .object({
    kind: z.enum(["partner", "sponsor"]),
    org: z.string().trim().min(2, "Name or organisation.").max(160),
    orgType: short.optional().nullable(),
    contact: short.optional().nullable(),
    phone,
    email: z.string().trim().email("A valid email.").max(160),
    does: long.optional().nullable(),
    why: long.optional().nullable(),
    bring: long.optional().nullable(),
    want: long.optional().nullable(),
    outcome: long.optional().nullable(),
    area: short.optional().nullable(),
    support: long.optional().nullable(),
    report: long.optional().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.kind === "partner") {
      if (!data.contact || data.contact.length < 2)
        ctx.addIssue({ code: "custom", path: ["contact"], message: "Contact name is required." });
      if (!data.orgType) ctx.addIssue({ code: "custom", path: ["orgType"], message: "Organisation type is required." });
      if (!data.why) ctx.addIssue({ code: "custom", path: ["why"], message: "Tell us why you want to partner." });
    } else {
      if (!data.area) ctx.addIssue({ code: "custom", path: ["area"], message: "Choose an impact area." });
      if (!data.support) ctx.addIssue({ code: "custom", path: ["support"], message: "What would you like to give?" });
    }
  });

export const statusSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  notes: z.string().trim().max(2000).optional().nullable()
});

export function zodError(err: z.ZodError) {
  return err.issues[0]?.message || "Invalid input.";
}
