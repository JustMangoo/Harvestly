// src/services/careProfiles.js
// Predefined care profiles for common plants. Values align with DB constraints.
// sun_level: 'shade' | 'partial shade' | 'direct sun'
// humidity_level: 'high' | 'moderate' | 'low'

const PROFILES = [
  {
    official_name: "Monstera deliciosa",
    description: "Large tropical plant with split leaves",
    sun_level: "partial shade",
    difficulty: "moderate",
    water_amount_ml: 300,
    humidity_level: "high",
    soil_temperature: 20,
    soil_type: "well-draining",
    season: "all year",
    life_expectation: "perennial",
  },
  {
    official_name: "Spathiphyllum wallisii",
    aka: "Peace Lily",
    description: "Air-purifying plant with elegant white flowers",
    sun_level: "shade",
    difficulty: "easy",
    water_amount_ml: 200,
    humidity_level: "moderate",
    soil_temperature: 20,
    soil_type: "rich potting",
    season: "all year",
    life_expectation: "perennial",
  },
  {
    official_name: "Sansevieria trifasciata",
    aka: "Snake Plant",
    description: "Architectural succulent with upright leaves",
    sun_level: "partial shade",
    difficulty: "easy",
    water_amount_ml: 150,
    humidity_level: "low",
    soil_temperature: 18,
    soil_type: "sandy mix",
    season: "all year",
    life_expectation: "perennial",
  },
  {
    official_name: "Ficus lyrata",
    aka: "Fiddle Leaf Fig",
    description: "Indoor tree with violin-shaped leaves",
    sun_level: "partial shade",
    difficulty: "moderate",
    water_amount_ml: 500,
    humidity_level: "moderate",
    soil_temperature: 21,
    soil_type: "well-draining",
    season: "spring-summer",
    life_expectation: "perennial",
  },
  {
    official_name: "Nephrolepis exaltata",
    aka: "Boston Fern",
    description: "Lush fern that loves humidity",
    sun_level: "shade",
    difficulty: "moderate",
    water_amount_ml: 300,
    humidity_level: "high",
    soil_temperature: 19,
    soil_type: "peaty",
    season: "spring",
    life_expectation: "perennial",
  },
  {
    official_name: "Helianthus annuus",
    aka: "Sunflower",
    description: "Annual with bright blooms",
    sun_level: "direct sun",
    difficulty: "easy",
    water_amount_ml: 600,
    humidity_level: "moderate",
    soil_temperature: 22,
    soil_type: "loamy",
    season: "summer",
    life_expectation: "annual",
  },
];

export function listCareProfiles() {
  return PROFILES;
}

export function searchCareProfiles(query, limit = 10) {
  if (!query) return [];
  const q = query.toLowerCase();
  return PROFILES.filter((p) =>
    [p.official_name, p.aka, p.description]
      .filter(Boolean)
      .some((t) => String(t).toLowerCase().includes(q))
  ).slice(0, limit);
}

export function getProfileByOfficialName(name) {
  return PROFILES.find(
    (p) => p.official_name.toLowerCase() === String(name).toLowerCase()
  );
}

export function toInitialValuesFromProfile(profile) {
  if (!profile) return {};
  return {
    official_name: profile.official_name,
    description: profile.description || "",
    sun_level: profile.sun_level || "",
    difficulty: profile.difficulty || "",
    water_amount_ml: profile.water_amount_ml ?? "",
    humidity_level: profile.humidity_level || "",
    soil_temperature: profile.soil_temperature ?? "",
    soil_type: profile.soil_type || "",
    season: profile.season || "",
    life_expectation: profile.life_expectation || "",
  };
}
