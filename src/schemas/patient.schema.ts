import { z } from "zod";

export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const patientFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8-20}$/, "Enter a valid phone number (8-20 digits)"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const dob = new Date(val);
      const now = new Date();
      return !Number.isNaN(dob.getTime()) && dob < now;
    }, "Date of birth must be in the past"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a valid gender",
  }),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""])
    .optional(),
  address: z
    .string()
    .trim()
    .max(250, "Address cannot exceed 250 characters")
    .optional(),
  profileStatus: z.enum(["Active", "Incomplete", "Archived"]),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
