// tools/uploadReviews.js
// Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env, then:
//   node tools/uploadReviews.js <productId> path/to/reviews.json

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalize(r, i) {
  const name = (r.name || r.fullName || r.full_name || r.author || r.reviewer || r.customer_name || r.customer || r.username || r.title || '').toString().trim() || ((r.comment || r.review || '') + '').substring(0, 24) || 'Anonymous';
  const rating = Number(r.rating ?? r.rate ?? r.stars ?? r.score) || 5;
  const comment = (r.comment || r.review || r.text || r.body || '').toString().trim();
  const date = (r.date || r.created_at || r.time || '').toString().trim();
  const id = r.id || `${Date.now()}-${i}`;
  return { id, name, rating, comment, date };
}

(async () => {
  const productId = process.argv[2];
  const fileArg = process.argv[3] || 'reviews.json';
  if (!productId) {
    console.error('Usage: node tools/uploadReviews.js <productId> [reviews.json]');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let arr = null;
  try {
    arr = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse JSON file:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(arr)) {
    console.error('JSON must be an array of review objects');
    process.exit(1);
  }

  const normalized = arr.map(normalize);

  console.log(`Uploading ${normalized.length} reviews for product ${productId} ...`);

  const { error } = await supabase
    .from('product_reviews')
    .upsert([{ product_id: productId, reviews: normalized }], { returning: 'minimal' });

  if (error) {
    console.error('Upsert failed:', error.message || error);
    process.exit(1);
  }

  console.log('Upload completed successfully.');
})();
