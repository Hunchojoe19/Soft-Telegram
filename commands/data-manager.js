const { 
  hasConnectedWallet, 
  getUserPhoneNumbers, 
  saveUserPhoneNumber,
  deleteUserPhoneNumber,
  getAllNetworkProviders,
  getNetworkProvider,
  getBundleById
} = require('../models/wallets');

module.exports = function(bot) {
  // Command to manage data-related operations
  bot.onText(/\/datamanager/, (msg) => {
    const { chat: { id } } = msg;
    
    // Check if user has a connected wallet
    if (!hasConnectedWallet(id)) {
      bot.sendMessage(id, 
        "You need to connect a wallet first before managing data.\n\nUse /connect to connect your wallet."
      );
      return;
    }
    
    // Show data management options
    const options = [
      [{ text: '📱 My Phone Numbers', callback_data: 'datamanager_phones' }],
      [{ text: '🔍 View Network Providers', callback_data: 'datamanager_providers' }],
      [{ text: '➕ Add New Phone Number', callback_data: 'datamanager_addphone' }],
      [{ text: '🛒 Purchase Data Bundle', callback_data: 'datamanager_purchase' }]
    ];
    
    bot.sendMessage(id, "Data Management Options:", {
      reply_markup: {
        inline_keyboard: options
      }
    });
  });
  
  // Function to show user's saved phone numbers
  function showUserPhoneNumbers(bot, userId) {
    const phoneNumbers = getUserPhoneNumbers(userId);
    
    if (phoneNumbers.length === 0) {
      bot.sendMessage(userId, "You don't have any saved phone numbers yet. Use the 'Add New Phone Number' option to add one.");
      return;
    }
    
    let message = "Your Saved Phone Numbers:\n\n";
    
    // Create options for each phone number
    const phoneOptions = phoneNumbers.map((entry, index) => {
      const provider = getNetworkProvider(entry.provider);
      const providerName = provider ? provider.name : entry.provider;
      
      message += `${index + 1}. ${entry.number} (${providerName})\n`;
      message += `   Added: ${new Date(entry.addedAt).toLocaleDateString()}\n\n`;
      
      return [{ 
        text: `${entry.number} (${providerName})`, 
        callback_data: `phone_manage_${entry.number}` 
      }];
    });
    
    message += "Select a phone number below to manage it:";
    
    bot.sendMessage(userId, message, {
      reply_markup: {
        inline_keyboard: phoneOptions
      }
    });
  }
  
  // Function to manage a specific phone number
  function managePhoneNumber(bot, userId, phoneNumber) {
    const phoneNumbers = getUserPhoneNumbers(userId);
    const phoneEntry = phoneNumbers.find(entry => entry.number === phoneNumber);
    
    if (!phoneEntry) {
      bot.sendMessage(userId, "Phone number not found.");
      return;
    }
    
    const provider = getNetworkProvider(phoneEntry.provider);
    const providerName = provider ? provider.name : phoneEntry.provider;
    
    const options = [
      [{ text: '🛒 Buy Data Bundle', callback_data: `number_${phoneNumber}_${phoneEntry.provider}` }],
      [{ text: '❌ Delete Number', callback_data: `phone_delete_${phoneNumber}` }],
      [{ text: '⬅️ Back to Phone Numbers', callback_data: 'datamanager_phones' }]
    ];
    
    bot.sendMessage(userId, 
      `Phone Number: ${phoneNumber}\nProvider: ${providerName}\nAdded: ${new Date(phoneEntry.addedAt).toLocaleDateString()}\n\nWhat would you like to do?`,
      {
        reply_markup: {
          inline_keyboard: options
        }
      }
    );
  }
  
  // Function to delete a phone number
  function deletePhoneNumber(bot, userId, phoneNumber) {
    const deleted = deleteUserPhoneNumber(userId, phoneNumber);
    
    if (deleted) {
      bot.sendMessage(userId, `Phone number ${phoneNumber} has been deleted.`);
    } else {
      bot.sendMessage(userId, `Failed to delete phone number ${phoneNumber}.`);
    }
    
    // Show remaining phone numbers
    showUserPhoneNumbers(bot, userId);
  }
  
  // Function to show network providers
  function showNetworkProviders(bot, userId) {
    const providers = getAllNetworkProviders();
    
    const providerOptions = Object.keys(providers).map(key => {
      return [{ text: providers[key].name, callback_data: `datamanager_provider_${key}` }];
    });
    
    bot.sendMessage(userId, "Select a network provider to view available bundles:", {
      reply_markup: {
        inline_keyboard: providerOptions
      }
    });
  }
  
  // Function to show bundles for a specific provider
  function showProviderBundles(bot, userId, providerCode) {
    const provider = getNetworkProvider(providerCode);
    
    if (!provider) {
      bot.sendMessage(userId, "Invalid network provider.");
      return;
    }
    
    let message = `Data Bundles for ${provider.name}:\n\n`;
    
    provider.bundles.forEach(bundle => {
      message += `• ${bundle.name}\n`;
      message += `  Price: $${bundle.price.toFixed(2)}\n`;
      message += `  Validity: ${bundle.validity}\n`;
      message += `  ID: ${bundle.id}\n\n`;
    });
    
    // Add back button
    const options = [
      [{ text: '⬅️ Back to Providers', callback_data: 'datamanager_providers' }]
    ];
    
    bot.sendMessage(userId, message, {
      reply_markup: {
        inline_keyboard: options
      }
    });
  }
  
  // Export functions to be used by other modules
  return {
    showUserPhoneNumbers,
    managePhoneNumber,
    deletePhoneNumber,
    showNetworkProviders,
    showProviderBundles
  };
};