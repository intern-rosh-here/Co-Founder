exports.getPlans = (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Browse profiles', 'Limited messaging'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      features: ['Unlimited messaging', 'Priority matching', 'Video calls'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.99,
      features: ['All premium features', 'Team profiles', 'Analytics'],
    },
  ];
  res.json({ plans });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    // Stripe integration here
    res.json({ clientSecret: 'pi_test' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    res.json({ message: 'Payment confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
