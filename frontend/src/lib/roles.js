// One entry per portal. The slug is the URL segment: /pet-parent/login, /vet/signup, /ngo/login.
// Field names must match the keys read by the database trigger in supabase/002_hardening.sql.

export const ROLE_LABELS = {
  PET_PARENT: 'Dog Parent',
  VET: 'Veterinarian',
  NGO: 'NGO',
};

export const PORTALS = {
  'pet-parent': {
    slug: 'pet-parent',
    role: 'PET_PARENT',
    label: 'Dog Parent',
    blurb:
      'Keep your dog’s health records in one place, get reminders, and share records with your vet only when you choose.',
    signupFields: [
      { name: 'full_name', label: 'Full name', type: 'text', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
        hint: 'At least 8 characters',
      },
      { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
      { name: 'pincode', label: 'Pincode', type: 'text', inputMode: 'numeric', optional: true },
    ],
  },
  vet: {
    slug: 'vet',
    role: 'VET',
    label: 'Veterinarian',
    blurb:
      'See a dog’s records only when its owner has granted you consent. Manage appointments, notes and prescriptions.',
    verificationNote:
      'After sign-up, your license is reviewed before you can access patient records.',
    signupFields: [
      { name: 'full_name', label: 'Full name (as on your council register)', type: 'text', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
        hint: 'At least 8 characters',
      },
      { name: 'license_number', label: 'Veterinary license number', type: 'text' },
      {
        name: 'council_registration_no',
        label: 'State veterinary council registration number',
        type: 'text',
      },
      { name: 'clinic_name', label: 'Clinic name', type: 'text', optional: true },
      { name: 'specialization', label: 'Specialisation', type: 'text', optional: true },
      { name: 'years_experience', label: 'Years of practice', type: 'text', inputMode: 'numeric', optional: true },
    ],
  },
  ngo: {
    slug: 'ngo',
    role: 'NGO',
    label: 'NGO',
    blurb:
      'Run street-dog feeding and welfare campaigns, funded through coins that pet parents donate.',
    verificationNote:
      'Your registration is reviewed before campaigns and donations go live.',
    signupFields: [
      { name: 'full_name', label: 'Contact person name', type: 'text', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
        hint: 'At least 8 characters',
      },
      { name: 'org_name', label: 'Organisation name', type: 'text' },
      {
        name: 'registration_number',
        label: 'Registration number (Trust, Society or Section 8)',
        type: 'text',
      },
      { name: 'focus_area', label: 'Focus area', type: 'text', optional: true, hint: 'For example: street dog feeding, rabies vaccination' },
      { name: 'address', label: 'Registered address', type: 'text', autoComplete: 'street-address' },
    ],
  },
};

export function getPortal(slug) {
  return PORTALS[slug] ?? null;
}
