# Bulk Upload Reviews

This folder contains a small Node script to bulk-import product reviews into the `product_reviews` table using the Supabase service role key.

Prerequisites
- Node.js installed
- `@supabase/supabase-js` in your project (`npm install @supabase/supabase-js`)
- A JSON file with an array of review objects, e.g. `[ { "name": "Alice", "rating": 5, "comment": "Great!" }, ... ]`
- Supabase `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set as environment variables

Usage

```bash
# install dependency (if not already installed in project)
npm install @supabase/supabase-js

# run upload (example)
SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  node tools/uploadReviews.js <PRODUCT_ID> reviews.json
```

Notes
- This uses the service role key and should be run from a trusted environment (local machine or server). Do NOT commit the key to source control.
- The script normalizes review objects to `{ id, name, rating, comment, date }` before upserting.
- The script upserts a single row into `product_reviews` with `product_id` and `reviews` (JSONB array).
