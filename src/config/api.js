// RDW API Configuration
export const RDW_API_CONFIG = {
  BASE_URL: 'https://opendata.rdw.nl/resource',
  DATASET_ID: 'm9d7-ebf2',
  API_KEY: '759opyanwhvce180c9juhnlj2', // Backup API key
  APP_TOKEN: 'LZIJnTCzGVDLh4JkpKcUjZ0JF', // App token voor hogere rate limits
};

// API Endpoints
export const RDW_ENDPOINTS = {
  VEHICLES: `${RDW_API_CONFIG.BASE_URL}/${RDW_API_CONFIG.DATASET_ID}.json`,
};

// Helper function to build query URL
export const buildRDWQuery = (kenteken) => {
  // Extended query with correct field names from RDW API
  const query = `?$select=kenteken,merk,handelsbenaming,voertuigsoort,eerste_kleur,inrichting,aantal_zitplaatsen,catalogusprijs,datum_eerste_toelating_dt,datum_tenaamstelling,vervaldatum_apk_dt,aantal_cilinders,cilinderinhoud,vermogen_massarijklaar,aanhangwagen_autonoom_geremd,aanhangwagen_middenas_geremd,wielbasis,massa_ledig_voertuig,massa_rijklaar,toegestane_maximum_massa_voertuig,laadvermogen,lengte,breedte,aantal_wielen&$where=kenteken='${kenteken.toUpperCase()}'`;
  return `${RDW_ENDPOINTS.VEHICLES}${query}`;
};

// Helper function to get headers with app token for higher rate limits
export const getRDWHeaders = () => ({
  'X-App-Token': RDW_API_CONFIG.APP_TOKEN, // Use app token for higher rate limits
  'Content-Type': 'application/json',
});
