export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCategory = (cat) => {
  if (!cat) return 'Uncategorized';
  const map = {
    produce: 'Fresh Produce',
    dairy: 'Dairy and Eggs',
    bakery: 'Bakery and Bread',
    'cooked meal': 'Cooked Meal',
    prepared_meals: 'Prepared Meals',
    packaged: 'Packaged Goods',
    pantry: 'Dry Pantry Goods',
    drinks: 'Drinks',
    beverages: 'Beverages',
    meat_fish: 'Meat and Fish',
    other: 'Other Goods',
  };
  return map[cat] || cat.replace(/_/g, ' ');
};

export const formatReason = (reason) => {
  if (!reason) return '-';
  const map = {
    expired: 'Past Use-By Date',
    spoiled: 'Spoiled / Mold Detected',
    damaged_packaging: 'Damaged Packaging / Broken Seal',
    contamination_suspected: 'Suspected Contamination',
    recalled: 'Product Recall Notice',
    other: 'Other Reason',
    community_pickup: 'Community Walk-In Pickup',
    charity_partner: 'Partner Charity Delivery',
    emergency_relief: 'Emergency Hamper Distribution',
    community_kitchen: 'Community Kitchen Preparation',
  };
  return map[reason] || reason.replace(/_/g, ' ');
};

export const formatStorageLocation = (loc) => {
  const map = {
    fridge: 'Fridge (Chilled 1 to 4 C)',
    freezer: 'Freezer (-18 C)',
    pantry: 'Dry Pantry / Ambient Shelf',
  };
  return map[loc] || loc;
};

