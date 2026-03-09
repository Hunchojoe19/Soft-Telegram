const { ensureUserAccount } = require('../models/accounts');

module.exports = function(bot) {
  bot.onText(/\/start/, (msg) => {
    const { chat: { id } } = msg;
    ensureUserAccount(id);
    
    bot.sendMessage(id, 
      "Welcome to the Payment Bot! 💰\n\n" +
      "Available commands:\n" +
      "/balance - Check your account balance\n" +
      "/transfer - Transfer funds to another user\n" +
      "/withdraw - Withdraw funds from your account\n" +
      "/connect - Connect your wallet\n" +
      "/disconnect - Remove your connected wallet\n" +
      "/data - Purchase data bundles\n" +
      "/networks - View available network providers\n" +
      "/bundles [PROVIDER] - View bundles for a provider\n" +
      "/bundle [PROVIDER] [BUNDLE_ID] - View bundle details\n" +
      "/datamanager - Manage your data services\n" +
      "/history - View your transaction history\n"
    );
  });
};