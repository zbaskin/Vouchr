/**
 * Unit tests for scripts/seed-data.mjs
 *
 * TDD cycle: these tests are written BEFORE the implementation.
 * Run `npm test -- --run` to confirm RED, then implement to go GREEN.
 */

import { describe, it, expect } from 'vitest';

// Dynamic import so vitest can resolve the .mjs module from the scripts/ dir.
// We cast to `any` to keep this file valid TypeScript without separate type defs.
const seedDataPromise = import('../../scripts/seed-data.mjs') as Promise<any>;

// ---------------------------------------------------------------------------
// MOVIE_POOL
// ---------------------------------------------------------------------------

describe('MOVIE_POOL', () => {
  it('has at least 30 entries', async () => {
    const { MOVIE_POOL } = await seedDataPromise;
    expect(Array.isArray(MOVIE_POOL)).toBe(true);
    expect(MOVIE_POOL.length).toBeGreaterThanOrEqual(30);
  });

  it('each entry has a name field that is a non-empty string', async () => {
    const { MOVIE_POOL } = await seedDataPromise;
    for (const entry of MOVIE_POOL) {
      expect(typeof entry.name).toBe('string');
      expect(entry.name.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// generateTicket
// ---------------------------------------------------------------------------

const MOCK_OWNER = 'abc-123-sub::testuser';

describe('generateTicket', () => {
  it('returns an object with name always set', async () => {
    const { generateTicket } = await seedDataPromise;
    const ticket = generateTicket('collection-123', MOCK_OWNER);
    expect(typeof ticket.name).toBe('string');
    expect(ticket.name.length).toBeGreaterThan(0);
  });

  it('returns an object with ticketsID always set to the provided collection id', async () => {
    const { generateTicket } = await seedDataPromise;
    const ticket = generateTicket('my-collection-id', MOCK_OWNER);
    expect(ticket.ticketsID).toBe('my-collection-id');
  });

  it('returns the owner field passed in', async () => {
    const { generateTicket } = await seedDataPromise;
    const ticket = generateTicket('col-1', MOCK_OWNER);
    expect(ticket.owner).toBe(MOCK_OWNER);
  });

  it('returns eventDate in YYYY-MM-DD format when present', async () => {
    const { generateTicket } = await seedDataPromise;
    // Run many times to hit the branch where eventDate is set
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    let sawDate = false;
    for (let i = 0; i < 100; i++) {
      const ticket = generateTicket('col-1', MOCK_OWNER);
      if (ticket.eventDate != null) {
        expect(ticket.eventDate).toMatch(ISO_DATE);
        sawDate = true;
      }
    }
    // With ~80% fill rate we should see at least one date in 100 attempts
    expect(sawDate).toBe(true);
  });

  it('returns eventTime in HH:MM:SS format when present', async () => {
    const { generateTicket } = await seedDataPromise;
    const TIME_RE = /^\d{2}:\d{2}:\d{2}$/;
    let sawTime = false;
    for (let i = 0; i < 100; i++) {
      const ticket = generateTicket('col-1', MOCK_OWNER);
      if (ticket.eventTime != null) {
        expect(ticket.eventTime).toMatch(TIME_RE);
        sawTime = true;
      }
    }
    expect(sawTime).toBe(true);
  });

  it('never returns an eventDate in the future', async () => {
    const { generateTicket } = await seedDataPromise;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    for (let i = 0; i < 200; i++) {
      const ticket = generateTicket('col-1', MOCK_OWNER);
      if (ticket.eventDate != null) {
        const d = new Date(ticket.eventDate + 'T00:00:00');
        expect(d.getTime()).toBeLessThanOrEqual(today.getTime());
      }
    }
  });

  it('returns an object with the required ticketsID field present', async () => {
    const { generateTicket } = await seedDataPromise;
    const ticket = generateTicket('test-id-456', MOCK_OWNER);
    expect(Object.prototype.hasOwnProperty.call(ticket, 'ticketsID')).toBe(true);
  });

  it('returns a type field that is a valid EventType string', async () => {
    const { generateTicket } = await seedDataPromise;
    const VALID_TYPES = new Set(['MOVIE', 'CONCERT', 'SPORT', 'FLIGHT']);
    for (let i = 0; i < 50; i++) {
      const ticket = generateTicket('col-1', MOCK_OWNER);
      expect(VALID_TYPES.has(ticket.type)).toBe(true);
    }
  });

  it('different calls can produce different tickets (not always identical)', async () => {
    const { generateTicket } = await seedDataPromise;
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) {
      names.add(generateTicket('col-1', MOCK_OWNER).name);
    }
    // With 30+ movies and random selection, 50 draws should yield >1 unique name
    expect(names.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// buildMutation
// ---------------------------------------------------------------------------

describe('buildMutation', () => {
  it('returns a string', async () => {
    const { buildMutation, generateTicket } = await seedDataPromise;
    const ticket = generateTicket('col-1', MOCK_OWNER);
    expect(typeof buildMutation(ticket)).toBe('string');
  });

  it('contains the word createTicket', async () => {
    const { buildMutation, generateTicket } = await seedDataPromise;
    const ticket = generateTicket('col-1', MOCK_OWNER);
    expect(buildMutation(ticket)).toContain('createTicket');
  });

  it('includes the ticket name in the output', async () => {
    const { buildMutation } = await seedDataPromise;
    const ticket = {
      name: 'Interstellar',
      ticketsID: 'col-1',
      owner: MOCK_OWNER,
      type: 'MOVIE',
      venue: null,
      theater: null,
      seat: null,
      eventDate: null,
      eventTime: null,
    };
    expect(buildMutation(ticket)).toContain('Interstellar');
  });

  it('includes the owner in the mutation body', async () => {
    const { buildMutation } = await seedDataPromise;
    const ticket = {
      name: 'Interstellar',
      ticketsID: 'col-1',
      owner: MOCK_OWNER,
      type: 'MOVIE',
      venue: null,
      theater: null,
      seat: null,
      eventDate: null,
      eventTime: null,
    };
    expect(buildMutation(ticket)).toContain(MOCK_OWNER);
  });

  it('handles null optional fields without throwing', async () => {
    const { buildMutation } = await seedDataPromise;
    const sparseTicket = {
      name: 'Oppenheimer',
      ticketsID: 'col-sparse',
      owner: MOCK_OWNER,
      type: 'MOVIE',
      venue: null,
      theater: null,
      seat: null,
      eventDate: null,
      eventTime: null,
    };
    expect(() => buildMutation(sparseTicket)).not.toThrow();
    const result = buildMutation(sparseTicket);
    expect(result).toContain('createTicket');
    expect(result).toContain('Oppenheimer');
  });

  it('includes the ticketsID in the mutation body', async () => {
    const { buildMutation } = await seedDataPromise;
    const ticket = {
      name: 'Dune Part Two',
      ticketsID: 'collection-abc-123',
      owner: MOCK_OWNER,
      type: 'MOVIE',
      venue: null,
      theater: null,
      seat: null,
      eventDate: null,
      eventTime: null,
    };
    expect(buildMutation(ticket)).toContain('collection-abc-123');
  });

  it('is a valid-looking GraphQL document (contains mutation keyword)', async () => {
    const { buildMutation, generateTicket } = await seedDataPromise;
    const ticket = generateTicket('col-1', MOCK_OWNER);
    expect(buildMutation(ticket)).toContain('mutation');
  });
});
