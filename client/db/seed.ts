import { pool } from './pool';

/**
 * Seed the database with sample data: 8 restaurants and 2026 visits
 * (Jan–Sep) so the spending charts have a real series without a long
 * tail. Visit counts vary by month — some quiet (0–1), some habitual
 * (4–6) — so the per-restaurant charts aren't a flat 0–2 line.
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
  { name: 'Night Owl Diner', cuisine: 'Diner', address: '9 Oak Ave', rating: 4.1 },
  { name: 'Bangkok Street', cuisine: 'Thai', address: '220 Lotus Rd', rating: 4.4 },
  { name: 'Smoke & Oak', cuisine: 'BBQ', address: '14 Pit Lane', rating: 4.3 },
];

const visits: { restaurantIndex: number; date: string; amountSpent: number; notes: string }[] = [
  // 2026 — weekly-ish, Green Bowl joins in spring
  { restaurantIndex: 5, date: '2026-01-02', amountSpent: 19.0, notes: 'New Year’s hangover special.' },
  { restaurantIndex: 0, date: '2026-01-05', amountSpent: 24.0, notes: 'Hangover burger.' },
  { restaurantIndex: 6, date: '2026-01-07', amountSpent: 24.5, notes: 'Green curry, extra spice.' },
  { restaurantIndex: 3, date: '2026-01-09', amountSpent: 15.5, notes: 'Breakfast burritos.' },
  { restaurantIndex: 2, date: '2026-01-17', amountSpent: 54.0, notes: 'Date night pasta.' },
  { restaurantIndex: 5, date: '2026-01-20', amountSpent: 13.75, notes: 'Grilled cheese and tomato soup.' },
  { restaurantIndex: 0, date: '2026-01-24', amountSpent: 36.25, notes: 'Double smash + shake.' },
  { restaurantIndex: 6, date: '2026-01-27', amountSpent: 31.0, notes: 'Boat noodles. Worth the wait.' },
  { restaurantIndex: 3, date: '2026-01-30', amountSpent: 21.0, notes: 'Lunch tacos.' },
  { restaurantIndex: 1, date: '2026-02-03', amountSpent: 88.0, notes: 'Omakase. Worth every penny.' },
  { restaurantIndex: 0, date: '2026-02-08', amountSpent: 22.75, notes: 'Quick burger.' },
  { restaurantIndex: 6, date: '2026-02-11', amountSpent: 22.0, notes: 'Mango sticky rice after the curry.' },
  { restaurantIndex: 3, date: '2026-02-14', amountSpent: 33.5, notes: 'Valentine’s taco platter.' },
  { restaurantIndex: 5, date: '2026-02-17', amountSpent: 17.25, notes: 'Chicken fried steak.' },
  { restaurantIndex: 2, date: '2026-02-21', amountSpent: 67.0, notes: 'Truffle risotto night.' },
  { restaurantIndex: 0, date: '2026-02-27', amountSpent: 31.0, notes: 'Friday burgers.' },
  { restaurantIndex: 3, date: '2026-03-04', amountSpent: 17.25, notes: 'Street corn and tacos.' },
  { restaurantIndex: 4, date: '2026-03-07', amountSpent: 14.5, notes: 'Trying the grain bowl.' },
  { restaurantIndex: 6, date: '2026-03-09', amountSpent: 28.75, notes: 'Panang and a Thai iced tea.' },
  { restaurantIndex: 0, date: '2026-03-12', amountSpent: 27.5, notes: 'Patty melt.' },
  { restaurantIndex: 5, date: '2026-03-15', amountSpent: 14.0, notes: 'Waffle and bacon.' },
  { restaurantIndex: 2, date: '2026-03-19', amountSpent: 58.75, notes: 'Carbonara and wine.' },
  { restaurantIndex: 4, date: '2026-03-22', amountSpent: 16.0, notes: 'Kale caesar to go.' },
  { restaurantIndex: 3, date: '2026-03-28', amountSpent: 24.5, notes: 'Carnitas plate.' },
  { restaurantIndex: 1, date: '2026-04-02', amountSpent: 102.5, notes: 'Spring omakase.' },
  { restaurantIndex: 4, date: '2026-04-06', amountSpent: 13.75, notes: 'Desk lunch bowl.' },
  { restaurantIndex: 6, date: '2026-04-08', amountSpent: 26.5, notes: 'Larb and sticky rice.' },
  { restaurantIndex: 0, date: '2026-04-11', amountSpent: 38.0, notes: 'Bacon burger, extra pickles.' },
  { restaurantIndex: 5, date: '2026-04-14', amountSpent: 12.5, notes: 'Chili and a biscuit.' },
  { restaurantIndex: 3, date: '2026-04-16', amountSpent: 19.0, notes: 'Taco Tuesday.' },
  { restaurantIndex: 2, date: '2026-04-25', amountSpent: 73.25, notes: 'Osso buco special.' },
  { restaurantIndex: 4, date: '2026-04-29', amountSpent: 18.5, notes: 'Friend joined for bowls.' },
  { restaurantIndex: 0, date: '2026-05-03', amountSpent: 21.25, notes: 'Lunch special.' },
  { restaurantIndex: 7, date: '2026-05-06', amountSpent: 36.0, notes: 'First brisket plate. Smoky.' },
  { restaurantIndex: 3, date: '2026-05-09', amountSpent: 26.75, notes: 'Fajitas for two, split.' },
  { restaurantIndex: 4, date: '2026-05-13', amountSpent: 15.0, notes: 'Smoothie + bowl.' },
  { restaurantIndex: 1, date: '2026-05-16', amountSpent: 79.0, notes: 'Chirashi instead of omakase.' },
  { restaurantIndex: 6, date: '2026-05-19', amountSpent: 23.25, notes: 'Drunken noodles.' },
  { restaurantIndex: 2, date: '2026-05-23', amountSpent: 61.5, notes: 'Margherita and burrata.' },
  { restaurantIndex: 5, date: '2026-05-26', amountSpent: 16.75, notes: 'Reuben, extra kraut.' },
  { restaurantIndex: 0, date: '2026-05-30', amountSpent: 44.0, notes: 'Memorial Day burgers.' },
  { restaurantIndex: 3, date: '2026-06-05', amountSpent: 20.5, notes: 'Fish tacos.' },
  { restaurantIndex: 7, date: '2026-06-07', amountSpent: 42.5, notes: 'Ribs and slaw.' },
  { restaurantIndex: 4, date: '2026-06-08', amountSpent: 17.25, notes: 'Summer salad bowl.' },
  { restaurantIndex: 0, date: '2026-06-14', amountSpent: 29.75, notes: 'Father’s Day burger.' },
  { restaurantIndex: 6, date: '2026-06-17', amountSpent: 29.0, notes: 'Massaman with a friend.' },
  { restaurantIndex: 2, date: '2026-06-20', amountSpent: 55.0, notes: 'Pesto gnocchi.' },
  { restaurantIndex: 5, date: '2026-06-23', amountSpent: 15.5, notes: 'Breakfast for dinner.' },
  { restaurantIndex: 3, date: '2026-06-26', amountSpent: 32.0, notes: 'Nachos and margarita.' },
  { restaurantIndex: 4, date: '2026-06-29', amountSpent: 14.0, notes: 'Quick lunch.' },
  { restaurantIndex: 1, date: '2026-07-03', amountSpent: 126.0, notes: 'Omakase with sake pairing.' },
  { restaurantIndex: 7, date: '2026-07-06', amountSpent: 38.75, notes: 'Pulled pork sandwich, two sides.' },
  { restaurantIndex: 0, date: '2026-07-11', amountSpent: 33.5, notes: 'Outdoor patio burgers.' },
  { restaurantIndex: 6, date: '2026-07-14', amountSpent: 25.5, notes: 'Tom yum, sweating.' },
  { restaurantIndex: 3, date: '2026-07-18', amountSpent: 23.25, notes: 'Elote and tacos.' },
  { restaurantIndex: 4, date: '2026-07-21', amountSpent: 19.5, notes: 'Cold noodle bowl.' },
  { restaurantIndex: 5, date: '2026-07-23', amountSpent: 18.25, notes: 'Milkshake and fries at 1am.' },
  { restaurantIndex: 2, date: '2026-07-26', amountSpent: 69.0, notes: 'Clams and linguine.' },
  { restaurantIndex: 7, date: '2026-07-30', amountSpent: 51.0, notes: 'Family platter, I paid.' },
  { restaurantIndex: 0, date: '2026-08-02', amountSpent: 26.0, notes: 'Weeknight burger.' },
  { restaurantIndex: 3, date: '2026-08-08', amountSpent: 18.0, notes: 'Tacos after the game.' },
  { restaurantIndex: 6, date: '2026-08-10', amountSpent: 21.75, notes: 'Pad see ew to go.' },
  { restaurantIndex: 4, date: '2026-08-12', amountSpent: 16.75, notes: 'Harvest bowl.' },
  { restaurantIndex: 1, date: '2026-08-15', amountSpent: 91.5, notes: 'Late-summer omakase.' },
  { restaurantIndex: 5, date: '2026-08-18', amountSpent: 14.5, notes: 'Western omelet.' },
  { restaurantIndex: 2, date: '2026-08-22', amountSpent: 64.25, notes: 'Cacio e pepe.' },
  { restaurantIndex: 7, date: '2026-08-25', amountSpent: 33.0, notes: 'Burnt ends. No leftovers.' },
  { restaurantIndex: 0, date: '2026-08-29', amountSpent: 39.0, notes: 'Labor Day weekend burgers.' },
  { restaurantIndex: 3, date: '2026-09-02', amountSpent: 21.5, notes: 'Back-to-routine tacos.' },
  { restaurantIndex: 4, date: '2026-09-04', amountSpent: 15.25, notes: 'Monday grain bowl.' },
  { restaurantIndex: 6, date: '2026-09-05', amountSpent: 27.5, notes: 'Friday night curry.' },
  { restaurantIndex: 5, date: '2026-09-06', amountSpent: 16.0, notes: 'Pancakes before work. Don’t ask.' },

  // Clusters — some months are a habit, not a one-off
  // The Rusty Spoon, Jan 2026
  { restaurantIndex: 0, date: '2026-01-12', amountSpent: 25.0, notes: 'Resolution already over.' },
  { restaurantIndex: 0, date: '2026-01-18', amountSpent: 29.5, notes: 'Bacon burger, no bun.' },
  // The Rusty Spoon, Apr 2026
  { restaurantIndex: 0, date: '2026-04-04', amountSpent: 23.0, notes: 'Weeknight smash.' },
  { restaurantIndex: 0, date: '2026-04-18', amountSpent: 31.75, notes: 'Crew came. I paid one.' },
  { restaurantIndex: 0, date: '2026-04-26', amountSpent: 20.5, notes: 'Lunch burger, extra pickles.' },

  // Sakura House — rare, then a spring cluster
  { restaurantIndex: 1, date: '2026-04-12', amountSpent: 95.0, notes: 'Birthday omakase.' },
  { restaurantIndex: 1, date: '2026-04-28', amountSpent: 48.0, notes: 'Just sushi this time. Still not cheap.' },

  // Bella Napoli, Feb 2026
  { restaurantIndex: 2, date: '2026-02-07', amountSpent: 52.0, notes: 'Cacio e pepe, weeknight.' },
  { restaurantIndex: 2, date: '2026-02-14', amountSpent: 81.0, notes: 'Valentine’s tasting menu.' },
  { restaurantIndex: 2, date: '2026-02-25', amountSpent: 44.25, notes: 'Margherita and a salad.' },
  // Bella Napoli, Aug 2026
  { restaurantIndex: 2, date: '2026-08-08', amountSpent: 59.0, notes: 'Clams again. Couldn’t help it.' },
  { restaurantIndex: 2, date: '2026-08-16', amountSpent: 50.5, notes: 'Pesto gnocchi, outdoor table.' },

  // El Fuego, Mar 2026
  { restaurantIndex: 3, date: '2026-03-03', amountSpent: 16.0, notes: 'Taco Tuesday, obviously.' },
  { restaurantIndex: 3, date: '2026-03-10', amountSpent: 19.5, notes: 'Carnitas, extra salsa.' },
  { restaurantIndex: 3, date: '2026-03-17', amountSpent: 28.0, notes: 'St. Patrick’s… tacos. Don’t ask.' },
  { restaurantIndex: 3, date: '2026-03-24', amountSpent: 14.75, notes: 'Breakfast burrito.' },
  // El Fuego, Jul 2026
  { restaurantIndex: 3, date: '2026-07-02', amountSpent: 21.0, notes: 'Fish tacos, patio.' },
  { restaurantIndex: 3, date: '2026-07-09', amountSpent: 17.5, notes: 'Al pastor, extra pineapple.' },
  { restaurantIndex: 3, date: '2026-07-16', amountSpent: 24.0, notes: 'Fajitas, split with a friend.' },
  { restaurantIndex: 3, date: '2026-07-28', amountSpent: 19.25, notes: 'Nachos after softball.' },

  // Green Bowl — desk-lunch months
  { restaurantIndex: 4, date: '2026-04-02', amountSpent: 14.25, notes: 'Grain bowl. Again.' },
  { restaurantIndex: 4, date: '2026-04-09', amountSpent: 15.5, notes: 'Kale caesar at the desk.' },
  { restaurantIndex: 4, date: '2026-04-15', amountSpent: 13.0, notes: 'Trying the noodle bowl.' },
  { restaurantIndex: 4, date: '2026-04-22', amountSpent: 16.75, notes: 'Friend joined. I still got the small.' },
  { restaurantIndex: 4, date: '2026-06-03', amountSpent: 14.5, notes: 'Summer salad, extra seeds.' },
  { restaurantIndex: 4, date: '2026-06-12', amountSpent: 18.0, notes: 'Smoothie + bowl, hot day.' },
  { restaurantIndex: 4, date: '2026-06-18', amountSpent: 15.25, notes: 'Cold soba bowl.' },
  { restaurantIndex: 4, date: '2026-08-05', amountSpent: 16.0, notes: 'Harvest bowl, early.' },
  { restaurantIndex: 4, date: '2026-08-19', amountSpent: 17.5, notes: 'Desk lunch. No notes.' },

  // Night Owl Diner, Jan 2026
  { restaurantIndex: 5, date: '2026-01-06', amountSpent: 17.0, notes: 'Still hungover. Hash browns.' },
  { restaurantIndex: 5, date: '2026-01-14', amountSpent: 14.5, notes: 'Chili and a biscuit.' },
  { restaurantIndex: 5, date: '2026-01-28', amountSpent: 13.0, notes: 'Waffle. No shame.' },
  // Night Owl Diner, Jul 2026
  { restaurantIndex: 5, date: '2026-07-04', amountSpent: 19.5, notes: 'Open on the 4th. Milkshake.' },
  { restaurantIndex: 5, date: '2026-07-12', amountSpent: 15.75, notes: 'Reuben after the fireworks leftover haze.' },
  { restaurantIndex: 5, date: '2026-07-29', amountSpent: 16.25, notes: 'Western omelet, 1am.' },

  // Bangkok Street, Jan 2026
  { restaurantIndex: 6, date: '2026-01-04', amountSpent: 26.0, notes: 'Pad thai, extra lime.' },
  { restaurantIndex: 6, date: '2026-01-13', amountSpent: 29.5, notes: 'Green curry, still too mild.' },
  { restaurantIndex: 6, date: '2026-01-22', amountSpent: 23.75, notes: 'Drunken noodles to go.' },
  // Bangkok Street, May 2026
  { restaurantIndex: 6, date: '2026-05-05', amountSpent: 24.0, notes: 'Larb and sticky rice.' },
  { restaurantIndex: 6, date: '2026-05-12', amountSpent: 32.5, notes: 'Boat noodles. Line was long.' },
  { restaurantIndex: 6, date: '2026-05-27', amountSpent: 21.0, notes: 'Mango sticky rice, no curry.' },
  // Bangkok Street, Aug 2026
  { restaurantIndex: 6, date: '2026-08-04', amountSpent: 27.25, notes: 'Panang, extra spice this time.' },
  { restaurantIndex: 6, date: '2026-08-20', amountSpent: 25.0, notes: 'Tom yum. Sweating again.' },

  // Smoke & Oak, May 2026
  { restaurantIndex: 7, date: '2026-05-16', amountSpent: 41.0, notes: 'Brisket again. Weekend.' },
  { restaurantIndex: 7, date: '2026-05-24', amountSpent: 28.5, notes: 'Pulled pork sandwich, one side.' },
  // Smoke & Oak, Jul 2026
  { restaurantIndex: 7, date: '2026-07-04', amountSpent: 54.0, notes: 'Fourth of July platter.' },
  { restaurantIndex: 7, date: '2026-07-11', amountSpent: 36.25, notes: 'Ribs. I finished them.' },
  { restaurantIndex: 7, date: '2026-07-19', amountSpent: 44.5, notes: 'Burnt ends and slaw.' },
  // Smoke & Oak, Aug 2026
  { restaurantIndex: 7, date: '2026-08-09', amountSpent: 31.0, notes: 'Sandwich and beans.' },
  { restaurantIndex: 7, date: '2026-08-20', amountSpent: 39.75, notes: 'Family platter, split three ways.' },
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
