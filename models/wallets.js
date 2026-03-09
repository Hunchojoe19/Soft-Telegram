// Store user wallet connections (using global to ensure persistence)
global.userWallets = global.userWallets || {};
global.userPhoneNumbers = global.userPhoneNumbers || {};

// Available network providers
const networkProviders = {
  MTN: {
    name: 'MTN',
    bundles: [
      { id: 'mtn_1', name: '1GB Daily', price: 300, validity: '1 day' },
      { id: 'mtn_2', name: '3GB Weekly', price: 1000, validity: '7 days' },
      { id: 'mtn_3', name: '10GB Monthly', price: 2500, validity: '30 days' }
    ]
  },
  AIRTEL: {
    name: 'Airtel',
    bundles: [
      { id: 'airtel_1', name: '1.5GB Daily', price: 300, validity: '1 day' },
      { id: 'airtel_2', name: '4GB Weekly', price: 1000, validity: '7 days' },
      { id: 'airtel_3', name: '15GB Monthly', price: 2500, validity: '30 days' }
    ]
  },
  GLO: {
    name: 'Glo',
    bundles: [
      { id: 'glo_1', name: '1GB Daily', price: 250, validity: '1 day' },
      { id: 'glo_2', name: '3.5GB Weekly', price: 950, validity: '7 days' },
      { id: 'glo_3', name: '12GB Monthly', price: 2400, validity: '30 days' }
    ]
  },
  ETISALAT: {
    name: '9Mobile',
    bundles: [
      { id: '9mobile_1', name: '1GB Daily', price: 350, validity: '1 day' },
      { id: '9mobile_2', name: '3GB Weekly', price: 1050, validity: '7 days' },
      { id: '9mobile_3', name: '11GB Monthly', price: 2600, validity: '30 days' }
    ]
  }
};

// Connect wallet for a user
function connectWallet(userId, walletType, walletAddress) {
  global.userWallets[userId] = {
    type: walletType,
    address: walletAddress,
    connected: true,
    connectedAt: new Date().toISOString()
  };
  return global.userWallets[userId];
}

// Disconnect wallet for a user
function disconnectWallet(userId) {
  if (global.userWallets[userId]) {
    delete global.userWallets[userId];
    return true;
  }
  return false;
}

// Check if user has a connected wallet
function hasConnectedWallet(userId) {
  return global.userWallets[userId] && global.userWallets[userId].connected;
}

// Get user wallet
function getUserWallet(userId) {
  return global.userWallets[userId];
}

// Save user phone number
function saveUserPhoneNumber(userId, phoneNumber, provider) {
  if (!global.userPhoneNumbers[userId]) {
    global.userPhoneNumbers[userId] = [];
  }
  
  // Check if this number already exists
  const existingIndex = global.userPhoneNumbers[userId].findIndex(
    entry => entry.number === phoneNumber
  );
  
  if (existingIndex >= 0) {
    // Update existing entry
    global.userPhoneNumbers[userId][existingIndex].provider = provider;
    return global.userPhoneNumbers[userId][existingIndex];
  } else {
    // Add new entry
    const newEntry = {
      number: phoneNumber,
      provider,
      addedAt: new Date().toISOString()
    };
    global.userPhoneNumbers[userId].push(newEntry);
    return newEntry;
  }
}

// Delete user phone number
function deleteUserPhoneNumber(userId, phoneNumber) {
  if (!global.userPhoneNumbers[userId]) {
    return false;
  }
  
  const initialLength = global.userPhoneNumbers[userId].length;
  global.userPhoneNumbers[userId] = global.userPhoneNumbers[userId].filter(
    entry => entry.number !== phoneNumber
  );
  
  return global.userPhoneNumbers[userId].length < initialLength;
}

// Get user phone numbers
function getUserPhoneNumbers(userId) {
  return global.userPhoneNumbers[userId] || [];
}

// Get network provider details
function getNetworkProvider(providerId) {
  return networkProviders[providerId];
}

// Get all network providers
function getAllNetworkProviders() {
  return networkProviders;
}

// Get bundle by ID - Fixed to properly find bundles
function getBundleById(providerId, bundleId) {
    // console.log("Provider ID:", providerId); // Debug log
    console.log("Bundle ID:", bundleId); // Debug log
  const provider = networkProviders[providerId];
  if (!provider) return null;
  
  // Find the bundle with the matching ID
  console.log("Bundles here:", provider.bundles.find(bundle => bundle.id)); // Debug log
  return provider.bundles.find(bundle => bundle.id === bundleId);
}

module.exports = {
  connectWallet,
  disconnectWallet,
  hasConnectedWallet,
  getUserWallet,
  saveUserPhoneNumber,
  deleteUserPhoneNumber,
  getUserPhoneNumbers,
  getNetworkProvider,
  getAllNetworkProviders,
  getBundleById
};