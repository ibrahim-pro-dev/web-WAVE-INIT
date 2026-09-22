const PLANS = [
  { id: 'basic', name: 'Basic', price: 999, duration: '1 Month', perks: ['Gym floor access', 'Locker facility', 'Cardio zone', '1 group class / week'] },
  { id: 'pro', name: 'Pro', price: 1499, duration: '1 Month', perks: ['Everything in Basic', 'All group classes', 'Personalized diet chart', 'Steam & sauna access', 'Monthly fitness assessment'], popular: true },
  { id: 'elite', name: 'Elite', price: 2499, duration: '1 Month', perks: ['Everything in Pro', '6 personal training sessions', 'Custom workout plan', 'Priority trainer support', 'Free FitGym merch'] }
];

module.exports = PLANS;