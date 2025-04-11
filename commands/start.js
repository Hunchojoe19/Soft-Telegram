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
      "/history - View your transaction history"
    );
  });
};