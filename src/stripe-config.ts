export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SfGuWMXcHfVA5w',
    priceId: 'price_1RjwMNQ9T0EyAHsiAJa7p3PS',
    name: 'Ego premium subscription',
    description: 'Get access to our premium AI models with unlimited requests, and be the first one to access our newest models and get latest updates on our AI',
    mode: 'subscription'
  }
];

export const getProductById = (id: string) => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string) => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};