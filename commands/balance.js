const { ensureUserAccount } = require('../models/accounts');

module.exports = function(bot) {
  bot.onText(/\/balance/, (msg) => {
    const { chat: { id } } = msg;
    const account = ensureUserAccount(id);
    
    bot.sendMessage(id, `Your current balance: $${account.balance.toFixed(2)}`);
  });
};