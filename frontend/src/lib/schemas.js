import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email')
  .email('Enter a valid email address');

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters');

const name = z.string().trim().min(2, 'Enter at least 2 characters').max(120, 'Too long');

const required = (min, label) =>
  z.string().trim().min(min, `${label} is required`).max(200, 'Too long');

const optional = z.string().trim().max(200, 'Too long').optional().or(z.literal(''));

const pincode = z
  .string()
  .trim()
  .regex(/^(\d{6})?$/, 'Enter a 6-digit pincode')
  .optional()
  .or(z.literal(''));

const years = z
  .string()
  .trim()
  .regex(/^(\d{1,2})?$/, 'Enter a whole number of years')
  .optional()
  .or(z.literal(''));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signupSchemas = {
  'pet-parent': z.object({
    full_name: name,
    email,
    password,
    city: required(2, 'City'),
    pincode,
  }),
  vet: z.object({
    full_name: name,
    email,
    password,
    license_number: required(3, 'License number'),
    council_registration_no: required(3, 'Council registration number'),
    clinic_name: optional,
    specialization: optional,
    years_experience: years,
  }),
  ngo: z.object({
    full_name: name,
    email,
    password,
    org_name: required(2, 'Organisation name'),
    registration_number: required(3, 'Registration number'),
    focus_area: optional,
    address: required(5, 'Registered address'),
  }),
};

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({
    password,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
