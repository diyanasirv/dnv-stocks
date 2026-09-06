import React from 'react';

export const PRODUCT_SPECIFIC_REVIEWS = {
  egg_boiler: [
    { id: 'eb-11', name: 'Muhammed Shamil', rating: 5, comment: 'Works great.', date: 'Today' },
    { id: 'eb-12', name: 'Fathima Rihana', rating: 5, comment: 'Hostelil use cheyyan super convenient aanu.', date: 'Today' },
    { id: 'eb-13', name: 'Arjun Nair', rating: 4, comment: 'Small and useful. Fits nicely in my kitchen.', date: 'Today' },
    { id: 'eb-14', name: 'Aiswarya Menon', rating: 5, comment: 'I used it this morning and the eggs came out perfectly. Much easier than using a vessel.', date: 'Today' },
    { id: 'eb-15', name: 'Nihal Basheer', rating: 5, comment: 'Daily breakfast easy aayi.', date: 'Today' },
    { id: 'eb-16', name: 'Sreedevi Krishnan', rating: 5, comment: 'Soft boil setting is really good. Exactly the way I like my eggs.', date: 'Today' },
    { id: 'eb-17', name: 'Vishnu Prasad', rating: 4, comment: 'Simple to use and does the job well.', date: 'Today' },
    { id: 'eb-18', name: 'Hiba Fathima', rating: 5, comment: 'Roomil vechu egg boil cheyyan ithu valare helpful aanu.', date: 'Today' },
    { id: 'eb-19', name: 'Rakesh Kumar', rating: 5, comment: 'Seven eggs at once is perfect for our family breakfast.', date: '1 day ago' },
    { id: 'eb-20', name: 'Meera Suresh', rating: 4, comment: 'Good one.', date: '1 day ago' }
  ],
  drainer: [
    { id: 'dr-11', name: 'Muhammed Riyas', rating: 5, comment: 'Kitchenil daily use cheyyunnu. Very handy.', date: 'Today' },
    { id: 'dr-12', name: 'Anjali Nair', rating: 5, comment: 'Three sizes kittunnathu kond different things wash cheyyan easy aanu.', date: 'Today' },
    { id: 'dr-13', name: 'Karthik S', rating: 4, comment: 'Useful set for the kitchen.', date: 'Today' },
    { id: 'dr-14', name: 'Fathima Shirin', rating: 5, comment: 'Vegetables wash cheythu drain cheyyan nalla convenient aanu. Cabinetilum space kurachu mathi.', date: 'Today' },
    { id: 'dr-15', name: 'Arun Raj', rating: 5, comment: 'Rice washinginu especially useful.', date: 'Today' }
  ]
};

export const DEFAULT_REVIEWS = [
  { id: 'gen-1', name: 'Rajesh Sharma', rating: 5, comment: 'Excellent product! Exceeded my expectations completely.', date: '2 days ago' },
  { id: 'gen-2', name: 'Suman Lata', rating: 5, comment: 'Fast delivery and premium packaging. Highly recommended!', date: '3 days ago' },
  { id: 'gen-3', name: 'Alok Gupta', rating: 4, comment: 'Great value for money. Very satisfied with the purchase.', date: '5 days ago' }
];

export function getReviewData(product) {
  if (!product) return { reviews: [], count: 0, avgRating: '4.8' };
  const name = (product.name || '').toLowerCase();
  // Prefer admin-provided reviews stored in localStorage: product_reviews_<id>
  try {
    const key = `product_reviews_${product.id}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const count = parsed.length;
        const avgRating = (parsed.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / count).toFixed(1);
        return { reviews: parsed, count, avgRating };
      }
    }
  } catch (e) {
    // ignore parse errors and fall back to defaults
  }

  let reviews = DEFAULT_REVIEWS;
  if (name.includes('egg') || name.includes('boiler')) {
    reviews = PRODUCT_SPECIFIC_REVIEWS.egg_boiler;
  } else if (name.includes('drain') || name.includes('strainer') || name.includes('3 piece')) {
    reviews = PRODUCT_SPECIFIC_REVIEWS.drainer;
  }

  const count = reviews.length;
  const avgRating = count > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)
    : '4.8';

  return { reviews, count, avgRating };
}

export default function ProductReviews({ selectedProduct, currentReviewData }) {
  if (!selectedProduct) return null;

  return (
    <div>
      <h5 className="fw-bold mb-3">Customer Reviews for {selectedProduct.name} ({currentReviewData.count})</h5>
      <div className="d-flex flex-column gap-3">
        {currentReviewData.reviews.map((rev) => {
          let displayName = (
            rev.name || rev.fullName || rev.full_name || rev.author || rev.reviewer || rev.customer_name || rev.customer || rev.username || rev.title || ''
          );
          if (!displayName) {
            const rawComment = (rev.comment || rev.review || rev.text || rev.body || '').toString().trim();
            displayName = rawComment ? rawComment.substring(0, 24) + (rawComment.length > 24 ? '...' : '') : 'Anonymous';
          }
          const rating = Number(rev.rating ?? rev.rate ?? rev.stars ?? rev.score) || 5;
          const comment = rev.comment || rev.review || rev.text || rev.body || '';

          return (
            <div key={rev.id} className="p-3 bg-light rounded border">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="small">{displayName}</strong>
                <span className="text-muted fs-7">{rev.date}</span>
              </div>
              <div className="text-warning small mb-1">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
              <p className="m-0 text-dark small">{comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
