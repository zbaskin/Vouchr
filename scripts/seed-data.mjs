/**
 * seed-data.mjs — pure, testable data-generation logic for the ticket seed script.
 *
 * Exports:
 *   MOVIE_POOL      — array of movie objects, each with at least a `name` field
 *   generateTicket  — (ticketsID: string) => ticket input object
 *   buildMutation   — (ticket) => GraphQL mutation string
 */

// ---------------------------------------------------------------------------
// Data pool
// ---------------------------------------------------------------------------

export const MOVIE_POOL = [
  { name: 'Dune: Part Two',                          venue: 'AMC Lincoln Square 13' },
  { name: 'Oppenheimer',                             venue: 'AMC Empire 25' },
  { name: 'Barbie',                                  venue: 'Regal Union Square' },
  { name: 'Interstellar',                            venue: 'Alamo Drafthouse Brooklyn' },
  { name: 'The Batman',                              venue: 'AMC Kips Bay 15' },
  { name: 'Poor Things',                             venue: 'Landmark Sunshine Cinema' },
  { name: 'Past Lives',                              venue: 'IFC Center' },
  { name: 'Everything Everywhere All at Once',       venue: 'Village East by Angelika' },
  { name: 'Killers of the Flower Moon',              venue: 'Regal Battery Park' },
  { name: 'The Zone of Interest',                    venue: 'Landmark 57 West' },
  { name: 'American Fiction',                        venue: 'AMC Boston Common 19' },
  { name: 'Saltburn',                                venue: 'Alamo Drafthouse Lower Manhattan' },
  { name: 'Priscilla',                               venue: 'IFC Center' },
  { name: 'May December',                            venue: 'Landmark Nuart Theatre' },
  { name: 'The Holdovers',                           venue: 'AMC Loews 34th Street 14' },
  { name: 'Maestro',                                 venue: 'Regal Fenway' },
  { name: 'Ferrari',                                 venue: 'AMC Theatres 19th Street East 6' },
  { name: 'Napoleon',                                venue: 'AMC Lincoln Square 13' },
  { name: 'Spider-Man: Across the Spider-Verse',     venue: 'Regal Crossroads' },
  { name: 'The Creator',                             venue: 'AMC Metreon 16' },
  { name: 'Mission: Impossible — Dead Reckoning',    venue: 'AMC Universal CityWalk' },
  { name: 'John Wick: Chapter 4',                    venue: 'Regal Edwards Valencia' },
  { name: 'Guardians of the Galaxy Vol. 3',          venue: 'AMC Century City 15' },
  { name: 'Indiana Jones and the Dial of Destiny',   venue: 'AMC 30 at Mesquite' },
  { name: 'Elemental',                               venue: 'Regal Hollywood 24' },
  { name: 'The Marvels',                             venue: 'AMC DINE-IN Southlake Town Square 7' },
  { name: 'Wonka',                                   venue: 'AMC Burbank 16' },
  { name: 'Aquaman and the Lost Kingdom',            venue: 'Regal Pointe Orlando' },
  { name: 'M3GAN',                                   venue: 'Alamo Drafthouse Slaughter Lane' },
  { name: 'Get Out',                                 venue: 'Landmark E Street Cinema' },
  { name: 'Tár',                                     venue: 'IFC Center' },
  { name: 'Triangle of Sadness',                     venue: 'Landmark Midtown Art Cinema' },
  { name: 'The Banshees of Inisherin',               venue: 'Landmark Embarcadero Center Cinema' },
  { name: 'Aftersun',                                venue: 'IFC Center' },
  { name: 'Women Talking',                           venue: 'AMC Galleria at Tyler 10' },
];

const SEATS = [
  'A1', 'B3', 'C5', 'D7', 'E2', 'F9', 'G4', 'G7', 'H6', 'H12',
  'I8', 'J10', 'K11', 'L3', 'M15', 'N2', 'O14', 'A12', 'B8', 'C3',
];

const SHOW_TIMES = [
  '10:00:00', '12:30:00', '13:00:00', '14:45:00', '15:30:00',
  '17:00:00', '17:45:00', '19:00:00', '19:30:00', '20:15:00',
  '21:00:00', '21:30:00', '22:00:00',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a random integer in [0, n). */
function randInt(n) {
  return Math.floor(Math.random() * n);
}

/** Return a random element from an array. */
function pick(arr) {
  return arr[randInt(arr.length)];
}

/**
 * Return a random past date within the last `maxDaysBack` days,
 * formatted as YYYY-MM-DD. Never returns a future date.
 */
function randomPastDate(maxDaysBack = 1095 /* ~3 years */) {
  const msBack = randInt(maxDaysBack * 24 * 60 * 60 * 1000);
  const d = new Date(Date.now() - msBack);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Return true with the given probability (0–1). */
function chance(p) {
  return Math.random() < p;
}

// ---------------------------------------------------------------------------
// generateTicket
// ---------------------------------------------------------------------------

/**
 * Generates a single realistic ticket input object.
 *
 * @param {string} ticketsID — the collection ID (required by the schema)
 * @returns {object} a CreateTicketInput-shaped plain object
 */
export function generateTicket(ticketsID, owner) {
  const movie = pick(MOVIE_POOL);

  // Mix of fully-filled tickets and sparse ones to exercise null-safety
  const fillOptional = chance(0.80);

  return {
    name: movie.name,
    ticketsID,
    owner,
    type: 'MOVIE',
    venue: fillOptional ? movie.venue : null,
    theater: fillOptional ? String(randInt(16) + 1) : null,
    seat: fillOptional ? pick(SEATS) : null,
    eventDate: fillOptional ? randomPastDate() : null,
    eventTime: fillOptional ? pick(SHOW_TIMES) : null,
  };
}

// ---------------------------------------------------------------------------
// buildMutation
// ---------------------------------------------------------------------------

/**
 * Builds a complete GraphQL mutation string for createTicket.
 * Null/undefined optional fields are passed as null (AppSync ignores them).
 *
 * @param {object} ticket — a generateTicket() result (or compatible plain object)
 * @returns {string} the GraphQL mutation document body
 */
export function buildMutation(ticket) {
  const esc = (v) => (v == null ? 'null' : JSON.stringify(String(v)));

  const optionals = [
    ticket.venue     != null ? `venue: ${esc(ticket.venue)}`       : null,
    ticket.theater   != null ? `theater: ${esc(ticket.theater)}`   : null,
    ticket.seat      != null ? `seat: ${esc(ticket.seat)}`         : null,
    ticket.eventDate != null ? `eventDate: ${esc(ticket.eventDate)}` : null,
    ticket.eventTime != null ? `eventTime: ${esc(ticket.eventTime)}` : null,
  ].filter(Boolean);

  const optionalsStr = optionals.length > 0 ? '\n        ' + optionals.join('\n        ') : '';

  return `mutation SeedCreateTicket {
  createTicket(input: {
        name: ${esc(ticket.name)}
        ticketsID: ${esc(ticket.ticketsID)}
        owner: ${esc(ticket.owner)}
        type: ${ticket.type || 'MOVIE'}
        visibility: PRIVATE
        timeCreated: ${Math.floor(Date.now() / 1000)}${optionalsStr}
  }) {
    id
    name
    ticketsID
    type
    venue
    theater
    seat
    eventDate
    eventTime
    timeCreated
    visibility
  }
}`;
}
