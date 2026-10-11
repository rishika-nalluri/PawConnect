// Rich initial datasets for PawConnect platform

export const initialProfiles = {
  petParent: {
    id: "d83921b7-4c78-4ea1-8cf3-111111111111",
    fullName: "Meera Sengupta",
    role: "PET_PARENT",
    email: "ritu@pawconnect.org",
    phone: "+91 98765 43210",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    coinsBalance: 240,
    address: "Road No. 12, Banjara Hills",
    city: "Hyderabad",
    pincode: "500034"
  },
  vet: {
    id: "a94832c8-5d89-4fa2-9de4-222222222222",
    fullName: "Dr. Anika Rao, BVSc & AH",
    role: "VET",
    email: "dr.sharma@apexvet.in",
    phone: "+91 98220 12345",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    clinicName: "Apex Canine Health Center",
    clinicAddress: "Road No. 36, Jubilee Hills, Hyderabad",
    specialization: "Canine Gastroenterology & Critical Care",
    licenseNumber: "VET-TG-2024-9102",
    yearsExperience: 11,
    verificationStatus: "VERIFIED",
    consultationFee: 650
  },
  ngo: {
    id: "b12345c9-6e90-4ba3-8ef5-333333333333",
    fullName: "PawsCare Animal Welfare Society",
    role: "NGO",
    email: "contact@pawscare.ngo",
    phone: "+91 98450 99887",
    avatarUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80",
    orgName: "PawsCare Animal Welfare Trust",
    registrationNumber: "NGO-HYD-TRUST-2019/847",
    focusArea: "Street-dog rescue, daily nutritional feeding, and ABC/ARV sterilizations",
    address: "Road No. 10, Gachibowli, Hyderabad",
    verificationStatus: "VERIFIED",
    totalDonationsReceived: 148500,
    coinsRedeemed: 18200,
    dogsFedCount: 420
  }
};

export const initialDogs = [
  {
    id: "c71a3e21-5a98-4c81-8bfe-101010101010",
    petParentId: "d83921b7-4c78-4ea1-8cf3-111111111111",
    name: "Bruno",
    breed: "Golden Retriever",
    gender: "MALE",
    dob: "2021-04-12",
    weight: 29.5,
    microchipNumber: "956000012345678",
    allergies: "Chicken protein sensitivity",
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    isActive: true
  },
  {
    id: "e82b4f32-6b09-4d92-9cfe-202020202020",
    petParentId: "d83921b7-4c78-4ea1-8cf3-111111111111",
    name: "Maya (Rescued)",
    breed: "Indian Pariah Dog (Desi)",
    gender: "FEMALE",
    dob: "2022-09-05",
    weight: 18.2,
    microchipNumber: "956000087654321",
    allergies: "None known",
    photoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    isActive: true
  },
  {
    id: "f93c5d43-7c10-5e83-0dfe-303030303030",
    petParentId: "d83921b7-4c78-4ea1-8cf3-111111111111",
    name: "Rocky (Indie Rescue)",
    breed: "Indie Pup",
    gender: "MALE",
    dob: "2023-10-15",
    weight: 12.8,
    microchipNumber: "956000034567890",
    allergies: "Seasonal dust sensitivity",
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
    isActive: true
  }
];

export const initialVaccinations = [
  {
    id: "v1",
    dogId: "c71a3e21-5a98-4c81-8bfe-101010101010",
    vaccineName: "DHPP 7-in-1 Booster (Nobivac)",
    dateGiven: "2024-04-10",
    nextDueDate: "2025-04-10",
    administeredBy: "Apex Canine Health Center",
    batchNumber: "NB-88912-K"
  },
  {
    id: "v2",
    dogId: "c71a3e21-5a98-4c81-8bfe-101010101010",
    vaccineName: "Rabies Multi-Strain (Defensor 3)",
    dateGiven: "2024-05-15",
    nextDueDate: "2025-05-15",
    administeredBy: "Apex Canine Health Center",
    batchNumber: "DEF-2024-B4"
  },
  {
    id: "v3",
    dogId: "e82b4f32-6b09-4d92-9cfe-202020202020",
    vaccineName: "Anti-Rabies Vaccine (ARV)",
    dateGiven: "2024-02-18",
    nextDueDate: "2025-02-18",
    administeredBy: "PawsCare Mobile Clinic",
    batchNumber: "PC-VAC-409"
  }
];

export const initialMedications = [
  {
    id: "m1",
    dogId: "c71a3e21-5a98-4c81-8bfe-101010101010",
    medicationName: "Proviable Forte Probiotic Paste",
    dosage: "3ml once daily with evening meal",
    schedule: "Daily - 7 Days",
    startDate: "2024-10-01",
    endDate: "2024-10-08",
    prescribedBy: "Dr. Anika Rao"
  }
];

export const initialSymptomLogs = [
  {
    id: "s1",
    dogId: "c71a3e21-5a98-4c81-8bfe-101010101010",
    loggedAt: "2024-10-04T10:30:00Z",
    appetite: "REDUCED",
    stoolConsistency: "SOFT",
    vomiting: false,
    lethargy: true,
    waterIntake: "NORMAL",
    symptomsText: "Bruno showed slight sluggishness on morning walk and ate only half of his kibble.",
    riskAssessment: {
      riskLevel: "MODERATE",
      confidenceScore: 0.88,
      explanation: "Mild gastrointestinal sluggishness detected. Reduced appetite combined with soft stools suggests mild digestive indiscretion or dietary changes.",
      recommendations: "Offer a bland diet (boiled chicken + pumpkin) for 24 hours. Keep well hydrated and monitor stool consistency.",
      modelProvider: "groq (llama-3.1-8b-instant)"
    }
  }
];

export const initialProducts = [
  {
    id: "p1",
    name: "Digestive Care Canine Probiotic Chews",
    category: "Supplements & Health",
    price: 899,
    rating: 4.9,
    reviewsCount: 142,
    stockQty: 45,
    coinEligible: true,
    maxCoinsAllowed: 150,
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80",
    description: "Veterinarian-formulated prebiotics + probiotics with pumpkin enzymes for digestive support and stool firmness."
  },
  {
    id: "p2",
    name: "Grain-Free Wild Salmon & Sweet Potato Kibble (3kg)",
    category: "Food & Nutrition",
    price: 2150,
    rating: 4.8,
    reviewsCount: 89,
    stockQty: 28,
    coinEligible: true,
    maxCoinsAllowed: 300,
    imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=500&q=80",
    description: "Hypoallergenic real salmon rich in Omega-3 fatty acids for dogs with skin sensitivity and digestive intolerance."
  },
  {
    id: "p3",
    name: "Orthopedic Ergonomic Memory Foam Dog Bed (Large)",
    category: "Accessories & Bedding",
    price: 3499,
    rating: 5.0,
    reviewsCount: 64,
    stockQty: 12,
    coinEligible: true,
    maxCoinsAllowed: 500,
    imageUrl: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=500&q=80",
    description: "Medical-grade memory foam with waterproof lining to support joints, hips, and deep restful sleep."
  },
  {
    id: "p4",
    name: "Herbal Oatmeal & Aloe Anti-Itch Shampoo (500ml)",
    category: "Grooming & Hygiene",
    price: 549,
    rating: 4.7,
    reviewsCount: 110,
    stockQty: 60,
    coinEligible: true,
    maxCoinsAllowed: 100,
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80",
    description: "Gentle pH-balanced formula enriched with organic chamomile, oatmeal, and neem for tick prevention."
  },
  {
    id: "p5",
    name: "Natural Dehydrated Lamb Crunch Treats (150g)",
    category: "Treats & Chews",
    price: 420,
    rating: 4.9,
    reviewsCount: 205,
    stockQty: 80,
    coinEligible: true,
    maxCoinsAllowed: 80,
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=80",
    description: "Single ingredient 100% pasture-raised lamb meat, slow-dehydrated without artificial preservatives."
  },
  {
    id: "p6",
    name: "Ultra-Durable Natural Rubber Fetch & Treat Ball",
    category: "Toys & Training",
    price: 399,
    rating: 4.8,
    reviewsCount: 77,
    stockQty: 50,
    coinEligible: true,
    maxCoinsAllowed: 60,
    imageUrl: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=500&q=80",
    description: "Puncture-resistant non-toxic rubber ball designed for interactive mental stimulation and dental cleaning."
  }
];

export const initialCampaigns = [
  {
    id: "c1",
    ngoId: "b12345c9-6e90-4ba3-8ef5-333333333333",
    ngoName: "PawsCare Animal Welfare Society",
    title: "Bengaluru Street Dog Winter Nutrition & Meal Drive",
    description: "Funding 500 nutritious warm meals daily (rice, chicken broth, eggs) for vulnerable street dogs in eastern Bengaluru during chilly winter months.",
    targetAmount: 75000,
    achievedAmount: 51200,
    coinsCollected: 14500,
    startDate: "2024-10-01",
    endDate: "2024-11-15",
    status: "ACTIVE",
    photoUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c2",
    ngoId: "b12345c9-6e90-4ba3-8ef5-333333333333",
    ngoName: "PawsCare Animal Welfare Society",
    title: "100 Community Dog Rabies Vaccination & Reflective Collars",
    description: "Equipping street dogs with glowing reflective collars to prevent road hit-and-runs and administering annual anti-rabies inoculations.",
    targetAmount: 40000,
    achievedAmount: 38500,
    coinsCollected: 9200,
    startDate: "2024-09-15",
    endDate: "2024-10-31",
    status: "ACTIVE",
    photoUrl: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  }
];

export const initialEvents = [
  {
    id: "ev1",
    title: "Koramangala Community Puppy Adoption Camp",
    description: "Meet 25 healthy vaccinated indie puppies looking for their forever homes. Includes free starter vet consultation and PawConnect starter kit.",
    eventType: "ADOPTION_DRIVE",
    location: "Koramangala 3rd Block Ground, 18th Main Road",
    city: "Bengaluru",
    eventDate: "2024-10-20T10:00:00Z",
    organizer: "PawsCare Animal Welfare",
    bannerUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80",
    maxParticipants: 150,
    currentRsvps: 78
  },
  {
    id: "ev2",
    title: "Free Community Anti-Rabies Vaccination Drive",
    description: "Bring your pet or guide street dogs to our mobile veterinary van for zero-cost anti-rabies booster doses administered by Dr. Anika Rao.",
    eventType: "VACCINATION_CAMP",
    location: "HSR Layout Sector 2 Amphitheatre",
    city: "Bengaluru",
    eventDate: "2024-10-27T09:00:00Z",
    organizer: "Apex Canine Health x PawsCare",
    bannerUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80",
    maxParticipants: 200,
    currentRsvps: 114
  }
];

export const initialVets = [
  {
    id: "a94832c8-5d89-4fa2-9de4-222222222222",
    fullName: "Dr. Anika Rao",
    clinicName: "Apex Canine Health Center",
    clinicAddress: "8th Cross, Koramangala 4th Block, Bengaluru",
    specialization: "Canine Gastroenterology & Internal Medicine",
    licenseNumber: "VET-KA-2024-9102",
    yearsExperience: 11,
    rating: 4.95,
    reviewsCount: 168,
    consultationFee: 650,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    availableSlots: ["Tomorrow, 10:00 AM", "Tomorrow, 02:30 PM", "Tomorrow, 05:00 PM"]
  },
  {
    id: "vet2",
    fullName: "Dr. Meera Nambiar",
    clinicName: "Companion Pet Specialty Clinic",
    clinicAddress: "100 Feet Road, Indiranagar, Bengaluru",
    specialization: "Veterinary Dermatology & Allergy Care",
    licenseNumber: "VET-KA-2021-4412",
    yearsExperience: 8,
    rating: 4.88,
    reviewsCount: 94,
    consultationFee: 700,
    avatarUrl: "https://images.unsplash.com/photo-1594824813576-782a937a544c?auto=format&fit=crop&w=300&q=80",
    availableSlots: ["Friday, 11:30 AM", "Friday, 04:00 PM"]
  }
];
