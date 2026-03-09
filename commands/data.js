const { ensureUserAccount } = require('../models/accounts');
const { 
  hasConnectedWallet, 
  getUserPhoneNumbers, 
  saveUserPhoneNumber,
  getAllNetworkProviders,
  getNetworkProvider,
//   getBundleById
} = require('../models/wallets');

module.exports = function(bot) {
  // Main data command
  bot.onText(/\/data/, (msg) => {
    const { chat: { id } } = msg;
    const account = ensureUserAccount(id);
    
    // Check if user has a connected wallet
    if (!hasConnectedWallet(id)) {
      bot.sendMessage(id, 
        "You need to connect a wallet first before purchasing data bundles.\n\nUse /connect to connect your wallet."
      );
      return;
    }
    
    // Start data purchase flow
    startDataPurchaseFlow(bot, id);
  });
  
  // Command to add a phone number directly
  bot.onText(/\/addphone/, (msg) => {
    const { chat: { id } } = msg;
    
    // Ask for phone number
    bot.sendMessage(id, "Please enter the phone number you want to save:", {
      reply_markup: {
        force_reply: true
      }
    }).then(askNumber => {
      bot.onReplyToMessage(askNumber.chat.id, askNumber.message_id, numberMsg => {
        const phoneNumber = numberMsg.text.trim();
        
        // Validate phone number (simple validation)
        if (!/^\d{10,15}$/.test(phoneNumber.replace(/[+\s-]/g, ''))) {
          bot.sendMessage(id, "Invalid phone number format. Please try again with a valid number.");
          return;
        }
        
        // Show network provider options
        const providers = getAllNetworkProviders();
        const providerOptions = Object.keys(providers).map(key => {
          return [{ text: providers[key].name, callback_data: `save_provider_${key}_${phoneNumber}` }];
        });
        
        bot.sendMessage(id, `Please select the network provider for ${phoneNumber}:`, {
          reply_markup: {
            inline_keyboard: providerOptions
          }
        });
      });
    });
  });
  
  // Function to handle saving a phone number directly
  bot.onText(/\/quicksave (.+)/, (msg, match) => {
    const { chat: { id } } = msg;
    const input = match[1].trim();
    
    // Parse input (format: "phone_number network_code")
    const parts = input.split(' ');
    if (parts.length !== 2) {
      bot.sendMessage(id, "Invalid format. Use: /quicksave phone_number network_code\nExample: /quicksave 1234567890 MTN");
      return;
    }
    
    const phoneNumber = parts[0];
    const providerCode = parts[1].toUpperCase();
    
    // Validate provider
    const provider = getNetworkProvider(providerCode);
    if (!provider) {
      bot.sendMessage(id, `Invalid network provider code. Available codes: ${Object.keys(getAllNetworkProviders()).join(', ')}`);
      return;
    }
    
    // Save the phone number
    saveUserPhoneNumber(id, phoneNumber, providerCode);
    
    bot.sendMessage(id, `Phone number ${phoneNumber} saved as ${provider.name}. You can use it when purchasing data with /data command.`);
  });
  
  // Function to start data purchase flow
  function startDataPurchaseFlow(bot, userId) {
    // Get user's saved phone numbers
    const savedNumbers = getUserPhoneNumbers(userId);
    
    // Create keyboard with saved numbers + option to add new
    const numberOptions = savedNumbers.map(entry => {
      return [{ 
        text: `${entry.number} (${entry.provider})`, 
        callback_data: `number_${entry.number}_${entry.provider}` 
      }];
    });
    
    // Add option to enter a new number
    numberOptions.push([{ text: '➕ Add a new number', callback_data: 'number_new' }]);
    
    bot.sendMessage(userId, "Please select a phone number to purchase data for:", {
      reply_markup: {
        inline_keyboard: numberOptions
      }
    });
  }
  
  // Function to show data bundle options
  function showDataBundleOptions(bot, userId, phoneNumber, provider) {
    const providerData = getNetworkProvider(provider);
    
    if (!providerData) {
      bot.sendMessage(userId, "Sorry, the selected network provider is not available. Please try again.");
      return;
    }
    
    console.log(`Showing bundles for provider: ${provider}`); // Debug log
    console.log('Provider data:', providerData); // Debug log
    
    // Create bundle options
    const bundleOptions = providerData.bundles.map(bundle => {
      console.log(`Creating option for bundle: ${bundle.id}`); // Debug log
      return [{ 
        text: `${bundle.name} - $${bundle.price} (${bundle.validity})`, 
        callback_data: `bundle_${provider}_${bundle.id}_${phoneNumber}` 
      }];
    });
    
    bot.sendMessage(userId, 
      `Please select a data bundle for ${phoneNumber} (${providerData.name}):`,
      {
        reply_markup: {
          inline_keyboard: bundleOptions
        }
      }
    );
  }
  
  // Export functions to be used by other modules
  return {
    startDataPurchaseFlow,
    showDataBundleOptions
  };
};