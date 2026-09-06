// src/reviews_local.js
// Local review list for development / quick edits.
// Paste your large review arrays here in VS Code and they will show up in the app without any server.
// Key the mapping by product id or a simple lowercase product name key.

// Example usage:
// export const LOCAL_REVIEWS = {
//   "egg_boiler": [
//     { id: 'eb-1001', name: 'Alice', rating: 5, comment: 'Perfect!', date: '2026-09-01' },
//     ...
//   ],
//   "42": [ ... ] // product id 42
// };

export const LOCAL_REVIEWS = {
  // Sample reviews for three products. Edit or replace these arrays as needed.
  "easy_boiler": [
    { id: 'eb-1001', name: 'Muhammed', rating: 5, comment: 'Boils eggs perfectly every time.', date: '2026-09-01' },
    { id: 'eb-1002', name: 'Aiswarya', rating: 5, comment: 'Super convenient and fast.', date: '2026-08-28' },
    { id: 'eb-1003', name: 'Rakesh', rating: 4, comment: 'Good build, one plate cracked after heavy use.', date: '2026-08-20' },
    { id: 'eb-1004', name: 'Leena', rating: 5, comment: 'Perfect for hostel life — compact and reliable.', date: '2026-07-30' },
    { id: 'eb-1005', name: 'Suresh', rating: 4, comment: 'Works well but takes time for hard-boil.', date: '2026-07-12' }
  ],

  "press_scrub": [
    { id: 'dr-2001', name: 'Anjali', rating: 5, comment: 'Very handy for washing vegetables.', date: '2026-09-02' },
    { id: 'dr-2002', name: 'Karthik', rating: 5, comment: 'Sturdy and stackable set — great value.', date: '2026-08-29' },
    { id: 'dr-2003', name: 'Meera', rating: 4, comment: 'Good quality, slightly small for big salads.', date: '2026-08-14' },
    { id: 'dr-2004', name: 'Vishnu', rating: 5, comment: 'Helps save time in the kitchen.', date: '2026-07-30' }
  ],

  "mixer_grinder": [
    { id: 'mg-3001', name: 'Priya', rating: 5, comment: 'Powerful motor, grinds chutney perfectly.', date: '2026-09-03' },
    { id: 'mg-3002', name: 'Ajay', rating: 4, comment: 'Good performance but noisy on high speed.', date: '2026-08-25' },
    { id: 'mg-3003', name: 'Farah', rating: 5, comment: 'Very durable and easy to clean.', date: '2026-08-10' },
    { id: 'mg-3004', name: 'Ravi', rating: 4, comment: 'Jars are a bit small for my family.', date: '2026-07-22' },
    { id: 'mg-3005', name: 'Nisha', rating: 5, comment: 'Excellent value for the price.', date: '2026-07-10' }
  ]
};
