const { ensureUserAccount, addTransaction } = require('../models/accounts');
const { 
  connectWallet, 
  saveUserPhoneNumber,
  getAllNetworkProviders,
  getNetworkProvider,
  getBundleById
} = require('../models/wallets');

function handleCallbackQuery(bot, callbackQuery) {
  const { message: { chat: { id }, message_id }, data } = callbackQuery;
  
  // First, acknowledge the callback query to stop the loading indicator
  bot.answerCallbackQuery(callbackQuery.id).catch(err => console.error('Error answering callback query:', err));
  
  console.log('Callback data:', data); // Add logging for debugging
  
  // Handle withdrawal payment methods
  if (data === 'bank_transfer' || data === 'paypal' || data === 'crypto') {
    const methodName = data === 'bank_transfer' ? 'Bank Transfer' : 
                      data === 'paypal' ? 'PayPal' : 'Cryptocurrency';
    
    bot.sendMessage(id, `You selected ${methodName}. Please provide your ${methodName} details:`, {
      reply_markup: {
        force_reply: true
      }
    }).then(askDetails => {
      bot.onReplyToMessage(askDetails.chat.id, askDetails.message_id, detailsMsg => {
        bot.sendMessage(id, `Thank you! Your withdrawal will be processed to the provided ${methodName} account within 24 hours.`);
      });
    }).catch(err => console.error('Error sending message:', err));
  }
  
  // Handle wallet connection
  else if (data.startsWith('wallet_')) {
    const walletType = data.replace('wallet_', '');
    const walletTypeName = walletType === 'crypto' ? 'Cryptocurrency' : 
                          walletType === 'bank' ? 'Bank Account' : 'Mobile Money';
    
    // Edit the original message to show the selection
    bot.editMessageText(`You selected: ${walletTypeName}`, {
      chat_id: id,
      message_id: message_id
    }).catch(err => console.error('Error editing message:', err));
    
    // Ask for wallet details
    let promptMessage = '';
    
    if (walletType === 'crypto') {
      promptMessage = 'Please provide your wallet address:';
    } else if (walletType === 'bank') {
      promptMessage = 'Please provide your bank account details (Account number and Bank name):';
    } else {
      promptMessage = 'Please provide your mobile money number:';
    }
    
    bot.sendMessage(id, promptMessage, {
      reply_markup: {
        force_reply: true
      }
    }).then(askWalletDetails => {
      bot.onReplyToMessage(askWalletDetails.chat.id, askWalletDetails.message_id, detailsMsg => {
        // Connect the wallet
        const walletDetails = detailsMsg.text.trim();
        connectWallet(id, walletType, walletDetails);
        
        // Send confirmation with a nice message
        bot.sendMessage(id, 
          `✅ Your ${walletTypeName} has been successfully connected!\n\n` +
          `You can now use the following commands:\n` +
          `/data - Purchase data bundles\n` +
          `/disconnect - Remove this wallet\n` +
          `/balance - Check your account balance`
        );
      });
    }).catch(err => console.error('Error sending message:', err));
  }
  
  // Handle phone number selection for data purchase
  else if (data === 'number_new') {
    // Ask for a new phone number
    bot.sendMessage(id, "Please enter the phone number:", {
      reply_markup: {
        force_reply: true
      }
    }).then(askNumber => {
      bot.onReplyToMessage(askNumber.chat.id, askNumber.message_id, numberMsg => {
        const phoneNumber = numberMsg.text.trim();
        
        // Validate phone number (simple validation)
        if (!/^\d{10,15}$/.test(phoneNumber.replace(/[+\s-]/g, ''))) {
          bot.sendMessage(id, "Invalid phone number format. Please enter a valid phone number.");
          return;
        }
        
        // Show network provider options
        const providers = getAllNetworkProviders();
        const providerOptions = Object.keys(providers).map(key => {
          return [{ text: providers[key].name, callback_data: `provider_${key}_${phoneNumber}` }];
        });
        
        bot.sendMessage(id, `Please select the network provider for ${phoneNumber}:`, {
          reply_markup: {
            inline_keyboard: providerOptions
          }
        });
      });
    }).catch(err => console.error('Error sending message:', err));
  }
  
  // Handle existing number selection
  else if (data.startsWith('number_') && !data.startsWith('number_new')) {
    // Extract number and provider from callback data
    const parts = data.split('_');
    const phoneNumber = parts[1];
    const provider = parts[2];
    
    // Import the data command module to use its function
    const dataCommand = require('../commands/data')(bot);
    dataCommand.showDataBundleOptions(bot, id, phoneNumber, provider);
  }
  
  // Handle provider selection
  else if (data.startsWith('provider_')) {
    const parts = data.split('_');
    const provider = parts[1];
    const phoneNumber = parts[2];
    
    // Save the phone number with provider
    saveUserPhoneNumber(id, phoneNumber, provider);
    
    // Import the data command module to use its function
    const dataCommand = require('../commands/data')(bot);
    dataCommand.showDataBundleOptions(bot, id, phoneNumber, provider);
  }
  
  // Handle save provider selection (for /addphone command)
  else if (data.startsWith('save_provider_')) {
    const parts = data.split('_');
    const provider = parts[2];
    const phoneNumber = parts[3];
    
    // Save the phone number with provider
    saveUserPhoneNumber(id, phoneNumber, provider);
    
    const providerData = getNetworkProvider(provider);
    
    bot.sendMessage(id, 
      `✅ Phone number ${phoneNumber} has been saved as ${providerData.name}.\n\n` +
      `You can now use this number to purchase data bundles with the /data command.`
    );
  }
  
  // Handle bundle selection
  else if (data.startsWith('bundle_')) {
    const parts = data.split('_');
    // Make sure we have at least 4 parts: bundle_provider_bundleId_phoneNumber
    if (parts.length < 4) {
      bot.sendMessage(id, "Invalid bundle selection. Please try again.");
      return;
    }
    
    const provider = parts[1];
    const bundleId = parts[2];
    const phoneNumber = parts[3];
    
    console.log(`Provider: ${provider}, Bundle ID: ${bundleId}, Phone: ${phoneNumber}`); // Debug log
    
    const providerData = getNetworkProvider(provider);
    if (!providerData) {
      bot.sendMessage(id, "Invalid network provider. Please try again.");
      return;
    }
    
    const bundle = getBundleById(provider, bundleId);
    console.log('Found bundle:', bundle); // Debug log
    
    if (!bundle) {
      bot.sendMessage(id, "Sorry, the selected bundle is no longer available. Please try again.");
      return;
    }
    
    // Confirm purchase
    bot.sendMessage(id, 
      `You are about to purchase:\n\n` +
      `Network: ${providerData.name}\n` +
      `Bundle: ${bundle.name}\n` +
      `Validity: ${bundle.validity}\n` +
      `Price: $${bundle.price.toFixed(2)}\n` +
      `Phone Number: ${phoneNumber}\n\n` +
      `Confirm this purchase?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Confirm', callback_data: `confirm_${provider}_${bundleId}_${phoneNumber}` },
              { text: '❌ Cancel', callback_data: 'cancel_purchase' }
            ]
          ]
        }
      }
    );
  }
  
  // Handle purchase confirmation
  else if (data.startsWith('confirm_')) {
    const parts = data.split('_');
    if (parts.length < 4) {
      bot.sendMessage(id, "Invalid confirmation. Please try again.");
      return;
    }
    
    const provider = parts[1];
    const bundleId = parts[2];
    const phoneNumber = parts[3];
    
    console.log(`Confirming - Provider: ${provider}, Bundle ID: ${bundleId}, Phone: ${phoneNumber}`); // Debug log
    
    const providerData = getNetworkProvider(provider);
    if (!providerData) {
      bot.sendMessage(id, "Invalid network provider. Please try again.");
      return;
    }
    
    const bundle = getBundleById(provider, bundleId);
    console.log('Confirming bundle:', bundle); // Debug log
    
    if (!bundle) {
      bot.sendMessage(id, "Sorry, the selected bundle is no longer available. Please try again.");
      return;
    }
    
    // Check user balance
    const account = ensureUserAccount(id);
    
    if (account.balance < bundle.price) {
      bot.sendMessage(id, `Insufficient funds. You need $${bundle.price.toFixed(2)} but your balance is $${account.balance.toFixed(2)}. Please top up your account first.`);
      return;
    }
    
    // Process the purchase
    account.balance -= bundle.price;
    
    // Record transaction
    addTransaction(id, {
      type: 'data_purchase',
      amount: bundle.price,
      details: {
        provider: providerData.name,
        bundle: bundle.name,
        phoneNumber: phoneNumber
      }
    });
    
    // Send confirmation
    bot.sendMessage(id, 
      `✅ Data purchase successful!\n\n` +
      `Network: ${providerData.name}\n` +
      `Bundle: ${bundle.name}\n` +
      `Validity: ${bundle.validity}\n` +
      `Phone Number: ${phoneNumber}\n` +
      `Amount: $${bundle.price.toFixed(2)}\n\n` +
      `Your new balance: $${account.balance.toFixed(2)}\n\n` +
      `The data bundle will be credited to your phone number shortly.`
    );
  }
  
  // Handle purchase cancellation
  else if (data === 'cancel_purchase') {
    bot.sendMessage(id, "Purchase cancelled. You can try again with /data command.");
  }
  
  // Handle data manager callbacks
  else if (data.startsWith('datamanager_')) {
    const dataManagerCommand = data.replace('datamanager_', '');
    const dataManager = require('../commands/data-manager')(bot);
    
    if (dataManagerCommand === 'phones') {
      dataManager.showUserPhoneNumbers(bot, id);
    }
    else if (dataManagerCommand === 'providers') {
      dataManager.showNetworkProviders(bot, id);
    }
    else if (dataManagerCommand === 'addphone') {
      // Redirect to the /addphone command
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
    }
    else if (dataManagerCommand === 'purchase') {
      // Redirect to the data purchase flow
      const dataCommand = require('../commands/data')(bot);
      dataCommand.startDataPurchaseFlow(bot, id);
    }
    else if (dataManagerCommand.startsWith('provider_')) {
      const providerCode = dataManagerCommand.replace('provider_', '');
      dataManager.showProviderBundles(bot, id, providerCode);
    }
  }
  
  // Handle phone management
  else if (data.startsWith('phone_manage_')) {
    const phoneNumber = data.replace('phone_manage_', '');
    const dataManager = require('../commands/data-manager')(bot);
    dataManager.managePhoneNumber(bot, id, phoneNumber);
  }
  
  // Handle phone deletion
  else if (data.startsWith('phone_delete_')) {
    const phoneNumber = data.replace('phone_delete_', '');
    const dataManager = require('../commands/data-manager')(bot);
    dataManager.deletePhoneNumber(bot, id, phoneNumber);
  }
}

module.exports = {
  handleCallbackQuery
};