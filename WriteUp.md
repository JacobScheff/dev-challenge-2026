# Write-up

## 1. What did you build for Part B, and why that?

The goal of the app is to track restaurant visits and how much Brennan spends, so I started Part B by adding visit logging to the website since the database already had an unused visits table. The user can add visits for each restuarnt, including the date, total spent, and any notes about that visit, such as what the user ate. Then, I added support for editing and deleting visits in case the user accidentally submits incorrect data. Since visits had editing and deletion, I incorporated those features to restaurants as well, and also slightly improved the overall UI at the same time.

Once the base functionality of the website was made, I added a way to track Brennan's spending. In the main page, there is a line chart that shows the total spending over time for each restaurant. The table below lists all of the restaurants that Brennan has been to, and the user can sort by name, total spent, or last visited. When viewing the data for a specific restaurant, there is a bar chart that shows how much the user spent for that restuarant each month. I added new restaurants and visits to the database's seeded data to verify that the UI can properly display all information in a clear format.

## 2. What did you decide, and what did you rule out?

I decided to keep using the existing visits table instead of changing the database, so I that I didn't need to add a migration. Since the visits are listed under a specific restaurant, an empty list signifies that Brennan hasn't been there yet. Creating and editing a visit uses their own routes though, since a visit is its own row in the database and the user shouldn't need the restaurant id just to fix a typo in the amount or notes. I also made the amount spent required even though the column can be empty, because a visit with no amount doesn't change how much Brennan has spent. A visit that cost nothing is still allowed, since a meal can be free.

All of the spending totals come from one summary endpoint, and the monthly chart on a restaurant page is built from that restaurant's visits, so I didn't need to add a second summary route. I ruled out adding date range filters, a page that lists every visit across all restaurants, and letting the user move a visit from one restaurant to another. I also wanted to improve the UI while ensuring that the changes aren't too large for this assignment, so I added inline editing, sorting, and a warning if you try to leave with unsaved changes.

## 3. Where did you cut corners?

If I had more time, I would add a way to filter spending by date. Since lifetime totals are abstract, Brennan may instead want to know how much he spent this month. The chart also cycles through colors for the restuarants, so it may be hard to distinguise the lines after there are a lot of restaurants. You also can't change which restaurant a visit belongs to after it's logged right now, so if the user picks the wrong place, they have to delete it and add it again under the correct restaurant.

## 4. What should we look at first?

After running the setup script and seeding the database again if the sample data is missing, open the home page. The total spent and the spending chart should already be filled in from the seeded meals, so you don't have to add any data just to see the feature. The restaurant list is sortable by clicking on the different sorting categories, and clicking on the same category again reverses the sorting direction. From there, the visit routes are the main thing to look at, including how invalid dates and amounts are rejected and how a missing restaurant comes back as not found instead of a server error. Finally, there is the summary endpoint, which the charts and the restaurant table use. The route table below has the request and response shapes.

---

## Part B: routes

| Method and path                    | What it does                                      | Success                          | Errors                                                                    |
| ---------------------------------- | ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| `POST /api/visits`                 | Log a visit                                       | `201` + visit                    | `400` on invalid body; `404` if `restaurantId` doesn't exist              |
| `GET /api/restaurants/:id/visits`  | Visits for one restaurant, newest first           | `200` + visit array (maybe `[]`) | `404` if the restaurant is missing or `:id` isn't a positive integer      |
| `PUT /api/visits/:id`              | Update date, amount, notes                        | `200` + visit                    | `400` on invalid body; `404` if missing or `:id` isn't a positive integer |
| `DELETE /api/visits/:id`           | Delete a visit                                    | `204`, no body                   | `404` if missing or `:id` isn't a positive integer                        |
| `GET /api/summary`                 | Lifetime tab, per-restaurant, and per-month spend | `200` + summary                  | —                                                                         |

Visit shape:

```json
{
  "id": 1,
  "restaurantId": 1,
  "date": "2026-09-01",
  "amountSpent": 24.5,
  "notes": "Lunch burger.",
  "createdAt": "2026-09-01T00:00:00.000Z"
}
```

**`POST /api/visits`**

```jsonc
// request
{
  "restaurantId": 1,
  "date": "2026-09-01",
  "amountSpent": 24.5,
  "notes": "Lunch burger."
}

// 201 response — same visit shape as above (notes may be null)
```

Notes are optional. The amount spent is required, including zero. The date has to be a real calendar day and cannot be in the future. The restaurant id has to be a positive integer in the body, and a well-formed id that doesn't exist comes back as not found.

**`PUT /api/visits/:id`**

```jsonc
// request — restaurantId is not accepted; delete and re-log to move a visit
{
  "date": "2026-09-02",
  "amountSpent": 18.0,
  "notes": "Corrected the total."
}

// 200 response — visit shape
```

**`GET /api/summary`**

```jsonc
// 200 after seed (8 restaurants, 100 visits, lastVisit "2026-09-06")
{
  "totalSpent": 3487.25,          // number — lifetime $
  "visitCount": 100,
  "lastVisit": "2026-09-06",      // YYYY-MM-DD, or null if no visits
  "byRestaurant": [
    {
      "id": 2,
      "name": "Sakura House",
      "totalSpent": 630.0,
      "visitCount": 7,
      "lastVisit": "2026-08-15"
    }
  ],
  "byMonth": [
    {
      "month": "2026-01",          // YYYY-MM
      "totalSpent": 412.0,
      "visitCount": 16,
      "byRestaurant": [
        {
          "id": 1,
          "name": "The Rusty Spoon",
          "totalSpent": 114.75,
          "visitCount": 4
        }
      ]
    }
  ]
}
```

Restaurants with no visits are left out of the list. The monthly totals are a continuous series from the first visit month to the last, and months with no visits still show up as zero so that the chart doesn't have jumps in time. After a fresh seed, that range is January through September 2026. The visit count and last visit above match the seed; curl the endpoint for the live dollar totals.

## Schema changes

I didn't change the database schema since Part B uses the visits table that was already there. I added more restaurants and visits to the seed data so the charts show sample data, with 8 restaurants and over a hundred visits from January through September 2026. The setup script should alread run the seed. If the database was created before that change, you can seed it again with `npm run seed` from the client folder. Re-seeding wipes existing rows so the restaurant ids stay the same, with The Rusty Spoon as the first one.

## How I verified this

I checked everything against a running site and the seeded database. I used curl for the API, including both the happy paths and the error cases below. For the rest, I tried it in the UI: logging, editing, and deleting a visit on a restaurant page, adding a restaurant from the home list, and making sure the home page and the restaurant page both update. After seeding, the home page should already show the lifetime total and a spending chart from January through September, so you shouldn't need to create data just to review the feature.

**Part A** — the contract table in CHALLENGE.md, every row including the error cases:

```bash
curl -i http://localhost:3000/api/restaurants
# 200 + JSON array (8 seeded restaurants)

curl -i http://localhost:3000/api/restaurants/1
# 200 + The Rusty Spoon

curl -i http://localhost:3000/api/restaurants/99999
# 404

curl -i http://localhost:3000/api/restaurants/abc
# 404, not 500

curl -i http://localhost:3000/api/restaurants/-1
# 404

curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Valid Spot","cuisine":"Test","address":"2 Test St","rating":4.5}'
# 201 + created restaurant (rating is a number, not a string)

curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Out Of Range","rating":6}'
# 400 — rating must be between 0 and 5

curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"rating":4}'
# 400 — name is required

curl -i -X PUT http://localhost:3000/api/restaurants/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"The Rusty Spoon","cuisine":"American","address":"12 Main St","rating":4.5}'
# 200 + updated restaurant

curl -i -X PUT http://localhost:3000/api/restaurants/99999 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Missing"}'
# 404

curl -i -X DELETE http://localhost:3000/api/restaurants/99999
# 404
```

**Part B** — the equivalent cases. The summary and visit-list curls use the seeded data as-is. Creating, updating, and deleting use a new visit so they don't depend on a specific seeded id.

```bash
curl -i http://localhost:3000/api/summary
# 200 + totals, byRestaurant, byMonth (seeded Jan–Sep 2026)

curl -i http://localhost:3000/api/restaurants/1/visits
# 200 + The Rusty Spoon's seeded visits, newest first

curl -i http://localhost:3000/api/restaurants/99999/visits
# 404 (not an empty list)

curl -i http://localhost:3000/api/restaurants/abc/visits
# 404

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01","amountSpent":24.5,"notes":"Lunch burger."}'
# 201 + visit

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01","amountSpent":0}'
# 201 — $0 is allowed

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2099-01-01","amountSpent":10}'
# 400 — date cannot be in the future

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-02-31","amountSpent":10}'
# 400 — date must be a real calendar date

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01","amountSpent":-1}'
# 400 — amountSpent cannot be negative

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01","amountSpent":10.125}'
# 400 — at most two decimal places

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01"}'
# 400 — amountSpent is required

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":"1","date":"2026-09-01","amountSpent":10}'
# 400 — restaurantId must be a positive integer

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":99999,"date":"2026-09-01","amountSpent":10}'
# 404 — restaurant not found

# Use the id from the 201 above:
curl -i -X PUT http://localhost:3000/api/visits/101 \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-09-02","amountSpent":18,"notes":"Corrected the total."}'
# 200 + updated visit

curl -i -X PUT http://localhost:3000/api/visits/99999 \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-09-02","amountSpent":18}'
# 404

curl -i -X PUT http://localhost:3000/api/visits/abc \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-09-02","amountSpent":18}'
# 404

curl -i -X DELETE http://localhost:3000/api/visits/101
# 204

curl -i -X DELETE http://localhost:3000/api/visits/99999
# 404
```

## Known issues / what I'd do next

The summary is all-time only, so I would want to add a date filter. For instance, it could show the user their spending habits for the past month instead of all-time. The line chart also only has a pre-defined set of colors, so it starts to look cluttered if there are a lot of restaurants since the colors can repeat. There is no page that lists every visit either, so the home page shows the tab and the restaurant list but not individual visits.