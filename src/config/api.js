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
  DEFECTS: `${RDW_API_CONFIG.BASE_URL}/a34c-vvps.json`,
  FUELS: `${RDW_API_CONFIG.BASE_URL}/8ys7-d773.json`,
  DEFECT_CODES: `${RDW_API_CONFIG.BASE_URL}/hx2c-gt7k.json`,
};

// Helper function to build query URL
export const buildRDWQuery = (kenteken) => {
  // Query without $select to get all available fields
  const query = `?$where=kenteken='${kenteken.toUpperCase()}'`;
  return `${RDW_ENDPOINTS.VEHICLES}${query}`;
};

// Helper function to build defects query URL
export const buildDefectsQuery = (kenteken) => {
  const query = `?$where=kenteken='${kenteken.toUpperCase()}'&$order=meld_datum_door_keuringsinstantie DESC&$limit=100`;
  return `${RDW_ENDPOINTS.DEFECTS}${query}`;
};

// Helper function to build fuels query URL
export const buildFuelsQuery = (kenteken) => {
  const query = `?$where=kenteken='${kenteken.toUpperCase()}'`;
  return `${RDW_ENDPOINTS.FUELS}${query}`;
};

// Helper function to build defect codes query URL
export const buildDefectCodesQuery = () => {
  return `${RDW_ENDPOINTS.DEFECT_CODES}`;
};

// Helper function to get headers with app token for higher rate limits
export const getRDWHeaders = () => ({
  'X-App-Token': RDW_API_CONFIG.APP_TOKEN, // Use app token for higher rate limits
  'Content-Type': 'application/json',
});
