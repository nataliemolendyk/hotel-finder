const APIFY_API_KEY = typeof APIFY_API_KEY_ENV !== 'undefined'
  ? APIFY_API_KEY_ENV
  : 'YOUR_API_TOKEN_HERE';

//  AIRPORTS TO SEARCH
const AIRPORTS = [
  { airportCode: 'SFO', search: 'San Francisco' },
  { airportCode: 'LAX', search: 'Los Angeles' },
  { airportCode: 'JFK', search: 'New York' },
  { airportCode: 'ORD', search: 'Chicago' },
  { airportCode: 'ATL', search: 'Atlanta' },
  { airportCode: 'MIA', search: 'Miami' },
];

//  SHARED SEARCH PARAMETERS (applied to every airport above)
function getDefaultDates() {
  const today = new Date();
  const checkInDate = new Date(today);
  checkInDate.setDate(today.getDate() + 14); // 2 weeks from today
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkInDate.getDate() + 3); // 3-night stay

  const toYMD = (d) => d.toISOString().split('T')[0];
  return { checkIn: toYMD(checkInDate), checkOut: toYMD(checkOutDate) };
}

const { checkIn, checkOut } = getDefaultDates();

const SEARCH_DEFAULTS = {
  checkIn,
  checkOut,
  adults: 2,
  rooms: 1,
  maxItems: 5, // per airport — with 6 airports that's up to 30 hotels total
  currency: 'USD',
  language: 'en-us',
};

const SEARCH_CONFIGS = AIRPORTS.map((airport) => ({
  ...SEARCH_DEFAULTS,
  search: airport.search,
  airportCode: airport.airportCode,
}));