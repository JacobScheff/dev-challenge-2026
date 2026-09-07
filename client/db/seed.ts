import { pool } from './pool';

/**
 * Seed the database with sample data: 5 restaurants and a year of visits
 * so the spending charts have a real series to draw.
 *
 * Run with: npm run seed
 *
 * Clears existing rows first so re-seeding gives you a clean, predictable set.
 */

const restaurants = [
  { name: 'The Rusty Spoon', cuisine: 'American', address: '12 Main St', rating: 4.5 },
  { name: 'Sakura House', cuisine: 'Japanese', address: '88 Cherry Ln', rating: 4.8 },
  { name: 'Bella Napoli', cuisine: 'Italian', address: '301 Olive Ave', rating: 4.2 },
  { name: 'El Fuego', cuisine: 'Mexican', address: '47 Sol Blvd', rating: 4.6 },
  { name: 'Green Bowl', cuisine: 'Vegetarian', address: '5 Garden Way', rating: 3.9 },
];

const visits: { restaurantIndex: number; date: string; amountSpent: number; notes: string }[] = [
  // 2025 — habit forming
  { restaurantIndex: 0, date: '2025-10-04', amountSpent: 28.5, notes: 'Lunch burger and fries.' },
  { restaurantIndex: 3, date: '2025-10-11', amountSpent: 16.25, notes: 'Two tacos after work.' },
  { restaurantIndex: 2, date: '2025-10-18', amountSpent: 62.0, notes: 'Anniversary pasta.' },
  { restaurantIndex: 0, date: '2025-10-26', amountSpent: 34.75, notes: 'Burger night with the crew.' },
  { restaurantIndex: 3, date: '2025-11-02', amountSpent: 22.0, notes: 'Burrito bowl.' },
  { restaurantIndex: 1, date: '2025-11-08', amountSpent: 94.0, notes: 'First omakase. Hooked.' },
  { restaurantIndex: 0, date: '2025-11-15', amountSpent: 19.5, notes: 'Solo cheeseburger.' },
  { restaurantIndex: 3, date: '2025-11-21', amountSpent: 18.75, notes: 'Tacos to go.' },
  { restaurantIndex: 2, date: '2025-11-29', amountSpent: 71.5, notes: 'Family dinner, extra garlic bread.' },
  { restaurantIndex: 0, date: '2025-12-06', amountSpent: 41.0, notes: 'Holiday burger crawl stop.' },
  { restaurantIndex: 3, date: '2025-12-12', amountSpent: 29.5, notes: 'Posole and chips.' },
  { restaurantIndex: 1, date: '2025-12-20', amountSpent: 118.0, notes: 'Year-end omakase.' },
  { restaurantIndex: 2, date: '2025-12-28', amountSpent: 84.25, notes: 'New Year pasta tasting.' },

  // 2026 — weekly-ish, Green Bowl joins in spring
  { restaurantIndex: 0, date: '2026-01-05', amountSpent: 24.0, notes: 'Hangover burger.' },
  { restaurantIndex: 3, date: '2026-01-09', amountSpent: 15.5, notes: 'Breakfast burritos.' },
  { restaurantIndex: 2, date: '2026-01-17', amountSpent: 54.0, notes: 'Date night pasta.' },
  { restaurantIndex: 0, date: '2026-01-24', amountSpent: 36.25, notes: 'Double smash + shake.' },
  { restaurantIndex: 3, date: '2026-01-30', amountSpent: 21.0, notes: 'Lunch tacos.' },
  { restaurantIndex: 1, date: '2026-02-03', amountSpent: 88.0, notes: 'Omakase. Worth every penny.' },
  { restaurantIndex: 0, date: '2026-02-08', amountSpent: 22.75, notes: 'Quick burger.' },
  { restaurantIndex: 3, date: '2026-02-14', amountSpent: 33.5, notes: 'Valentine’s taco platter.' },
  { restaurantIndex: 2, date: '2026-02-21', amountSpent: 67.0, notes: 'Truffle risotto night.' },
  { restaurantIndex: 0, date: '2026-02-27', amountSpent: 31.0, notes: 'Friday burgers.' },
  { restaurantIndex: 3, date: '2026-03-04', amountSpent: 17.25, notes: 'Street corn and tacos.' },
  { restaurantIndex: 4, date: '2026-03-07', amountSpent: 14.5, notes: 'Trying the grain bowl.' },
  { restaurantIndex: 0, date: '2026-03-12', amountSpent: 27.5, notes: 'Patty melt.' },
  { restaurantIndex: 2, date: '2026-03-19', amountSpent: 58.75, notes: 'Carbonara and wine.' },
  { restaurantIndex: 4, date: '2026-03-22', amountSpent: 16.0, notes: 'Kale caesar to go.' },
  { restaurantIndex: 3, date: '2026-03-28', amountSpent: 24.5, notes: 'Carnitas plate.' },
  { restaurantIndex: 1, date: '2026-04-02', amountSpent: 102.5, notes: 'Spring omakase.' },
  { restaurantIndex: 4, date: '2026-04-06', amountSpent: 13.75, notes: 'Desk lunch bowl.' },
  { restaurantIndex: 0, date: '2026-04-11', amountSpent: 38.0, notes: 'Bacon burger, extra pickles.' },
  { restaurantIndex: 3, date: '2026-04-16', amountSpent: 19.0, notes: 'Taco Tuesday.' },
  { restaurantIndex: 2, date: '2026-04-25', amountSpent: 73.25, notes: 'Osso buco special.' },
  { restaurantIndex: 4, date: '2026-04-29', amountSpent: 18.5, notes: 'Friend joined for bowls.' },
  { restaurantIndex: 0, date: '2026-05-03', amountSpent: 21.25, notes: 'Lunch special.' },
  { restaurantIndex: 3, date: '2026-05-09', amountSpent: 26.75, notes: 'Fajitas for two, split.' },
  { restaurantIndex: 4, date: '2026-05-13', amountSpent: 15.0, notes: 'Smoothie + bowl.' },
  { restaurantIndex: 1, date: '2026-05-16', amountSpent: 79.0, notes: 'Chirashi instead of omakase.' },
  { restaurantIndex: 2, date: '2026-05-23', amountSpent: 61.5, notes: 'Margherita and burrata.' },
  { restaurantIndex: 0, date: '2026-05-30', amountSpent: 44.0, notes: 'Memorial Day burgers.' },
  { restaurantIndex: 3, date: '2026-06-05', amountSpent: 20.5, notes: 'Fish tacos.' },
  { restaurantIndex: 4, date: '2026-06-08', amountSpent: 17.25, notes: 'Summer salad bowl.' },
  { restaurantIndex: 0, date: '2026-06-14', amountSpent: 29.75, notes: 'Father’s Day burger.' },
  { restaurantIndex: 2, date: '2026-06-20', amountSpent: 55.0, notes: 'Pesto gnocchi.' },
  { restaurantIndex: 3, date: '2026-06-26', amountSpent: 32.0, notes: 'Nachos and margarita.' },
  { restaurantIndex: 4, date: '2026-06-29', amountSpent: 14.0, notes: 'Quick lunch.' },
  { restaurantIndex: 1, date: '2026-07-03', amountSpent: 126.0, notes: 'Omakase with sake pairing.' },
  { restaurantIndex: 0, date: '2026-07-11', amountSpent: 33.5, notes: 'Outdoor patio burgers.' },
  { restaurantIndex: 3, date: '2026-07-18', amountSpent: 23.25, notes: 'Elote and tacos.' },
  { restaurantIndex: 4, date: '2026-07-21', amountSpent: 19.5, notes: 'Cold noodle bowl.' },
  { restaurantIndex: 2, date: '2026-07-26', amountSpent: 69.0, notes: 'Clams and linguine.' },
  { restaurantIndex: 0, date: '2026-08-02', amountSpent: 26.0, notes: 'Weeknight burger.' },
  { restaurantIndex: 3, date: '2026-08-08', amountSpent: 18.0, notes: 'Tacos after the game.' },
  { restaurantIndex: 4, date: '2026-08-12', amountSpent: 16.75, notes: 'Harvest bowl.' },
  { restaurantIndex: 1, date: '2026-08-15', amountSpent: 91.5, notes: 'Late-summer omakase.' },
  { restaurantIndex: 2, date: '2026-08-22', amountSpent: 64.25, notes: 'Cacio e pepe.' },
  { restaurantIndex: 0, date: '2026-08-29', amountSpent: 39.0, notes: 'Labor Day weekend burgers.' },
  { restaurantIndex: 3, date: '2026-09-02', amountSpent: 21.5, notes: 'Back-to-routine tacos.' },
  { restaurantIndex: 4, date: '2026-09-04', amountSpent: 15.25, notes: 'Monday grain bowl.' },
];

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Wipe and reset identity so ids are stable between seeds.
    await client.query('TRUNCATE visits, restaurants RESTART IDENTITY CASCADE');

    const restaurantIds: number[] = [];
    for (const r of restaurants) {
      const { rows } = await client.query(
        `INSERT INTO restaurants (name, cuisine, address, rating)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [r.name, r.cuisine, r.address, r.rating]
      );
      restaurantIds.push(rows[0].id);
    }

    for (const v of visits) {
      await client.query(
        `INSERT INTO visits ("restaurantId", date, "amountSpent", notes)
         VALUES ($1, $2, $3, $4)`,
        [restaurantIds[v.restaurantIndex], v.date, v.amountSpent, v.notes]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${restaurants.length} restaurants and ${visits.length} visits.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    pool.end().finally(() => process.exit(1));
  });
