exports.getDashboard = async (req, res) => {
  try {
    const stats = {
      totalUsers: 10000,
      activeUsers: 7500,
      totalMatches: 5000,
      totalRevenue: 125000,
    };
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    res.json({ users: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
