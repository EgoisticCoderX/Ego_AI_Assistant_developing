import React, { useState, useEffect } from 'react';
import { Crown, Check, Loader2, CreditCard, Calendar, Star } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../../stripe-config';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Subscription {
  subscription_status: string;
  price_id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand: string;
  payment_method_last4: string;
}

const SubscriptionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isActiveSubscription = subscription && 
    ['active', 'trialing'].includes(subscription.subscription_status);

  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading subscription details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInDown">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="w-8 h-8 text-purple-600 animate-float" />
            <h1 className="text-4xl font-bold gradient-text">Premium Subscription</h1>
          </div>
          <p className="text-xl text-gray-600">Unlock the full power of EGO AI</p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-gray-200/50 animate-scaleIn">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Current Subscription</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                    isActiveSubscription 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.subscription_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                {subscription.current_period_start && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Period:</span>
                    <span className="font-medium">
                      {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                )}
                
                {subscription.cancel_at_period_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancels at period end:</span>
                    <span className="font-medium text-red-600">Yes</span>
                  </div>
                )}
              </div>
              
              {subscription.payment_method_brand && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">
                      {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50 animate-slideInLeft">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">₹0<span className="text-lg text-gray-500">/month</span></div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Access to free AI models</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Basic chat functionality</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Limited daily usage</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Community support</span>
              </li>
            </ul>
            
            <button
              disabled
              className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          {STRIPE_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden animate-slideInRight">
              <div className="absolute top-4 right-4">
                <Star className="w-6 h-6 text-yellow-300 animate-float" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <div className="text-3xl font-bold mb-4">₹3,000<span className="text-lg text-purple-200">/month</span></div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Access to premium AI models</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Unlimited requests</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Advanced image generation</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleSubscribe(product.priceId)}
                disabled={isLoading || isActiveSubscription}
                className="w-full bg-white text-purple-600 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isActiveSubscription ? (
                  <span>Already Subscribed</span>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Subscribe Now</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50 animate-fadeInUp">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Free</th>
                  <th className="text-center py-3 px-4">Premium</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">AI Models Access</td>
                  <td className="text-center py-3 px-4">Basic models only</td>
                  <td className="text-center py-3 px-4">All premium models</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Daily Usage Limit</td>
                  <td className="text-center py-3 px-4">Limited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Response Speed</td>
                  <td className="text-center py-3 px-4">Standard</td>
                  <td className="text-center py-3 px-4">Priority</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Image Generation</td>
                  <td className="text-center py-3 px-4">Basic</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Support</td>
                  <td className="text-center py-3 px-4">Community</td>
                  <td className="text-center py-3 px-4">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;