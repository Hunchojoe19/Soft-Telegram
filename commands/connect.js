const { connectWallet, disconnectWallet, hasConnectedWallet, getUserWallet } = require('../models/wallets');

module.exports = function(bot) {
  // Handle /connect command
  bot.onText(/\/connect/, (msg) => {
    const { chat: { id } } = msg;
    
    // Check if user already has a connected wallet
    if (hasConnectedWallet(id)) {
      const wallet = getUserWallet(id);
      const walletTypeName = getWalletTypeName(wallet.type);
      
      bot.sendMessage(id, 
        `You already have a connected wallet:\n\nType: ${walletTypeName}\nAddress/ID: ${wallet.address}\n\nTo disconnect and connect a new wallet, use /disconnect first.`
      );
      return;
    }
    
    // Offer wallet connection options
    const walletOptions = [
      [{ text: 'Crypto Wallet', callback_data: 'wallet_crypto' }],
      [{ text: 'Bank Account', callback_data: 'wallet_bank' }],
      [{ text: 'Mobile Money', callback_data: 'wallet_mobile' }]
    ];
    
    bot.sendMessage(id, "Please select a wallet type to connect:", {
      reply_markup: {
        inline_keyboard: walletOptions
      }
    });
  });
  
  // Handle /disconnect command
  bot.onText(/\/disconnect/, (msg) => {
    const { chat: { id } } = msg;
    
    if (!hasConnectedWallet(id)) {
      bot.sendMessage(id, "You don't have any connected wallets.");
      return;
    }
    
    // Disconnect wallet
    const wallet = getUserWallet(id);
    const walletTypeName = getWalletTypeName(wallet.type);
    
    // Remove wallet
    disconnectWallet(id);
    
    bot.sendMessage(id, `Your ${walletTypeName} has been disconnected. You can connect a new wallet using /connect.`);
  });
  
  // Helper function to get wallet type name
  function getWalletTypeName(type) {
    return type === 'crypto' ? 'Cryptocurrency Wallet' : 
           type === 'bank' ? 'Bank Account' : 'Mobile Money';
  }
};