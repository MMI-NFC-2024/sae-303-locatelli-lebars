/**
 * Calcule la distance entre deux points géographiques en utilisant la formule de Haversine
 * @param lat1 Latitude du premier point
 * @param lon1 Longitude du premier point
 * @param lat2 Latitude du second point
 * @param lon2 Longitude du second point
 * @returns Distance en kilomètres
 */
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Extrait le code département d'un code commune
 * @param code_commune Code commune numérique
 * @returns Code département (2 chiffres)
 */
export function getDeptCode(code_commune_num: number): string {
  return String(code_commune_num).padStart(5, "0").substring(0, 2);
}

/**
 * Codes des départements de Nouvelle-Aquitaine
 */
export const CODES_NA = [
  "16", "17", "19", "23", "24", "33", 
  "40", "47", "64", "79", "86", "87"
];

/**
 * Facteurs d'émission de CO2 par mode de transport (g CO2/km)
 */
export const CO2_FACTORS = {
  TGV: 1.7,
  INTERCITES: 5.3,
  TER: 24.8,
  RER: 4.75,
  "Voiture (moyenne)": 120
};
