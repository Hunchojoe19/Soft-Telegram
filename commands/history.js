const { ensureUserAccount } = require('../models/accounts');

module.exports = function(bot) {
  bot.onText(/\/history/, (msg) => {
    const { chat: { id } } = msg;
    const account = ensureUserAccount(id);
    
    if (account.transactions.length === 0) {
      bot.sendMessage(id, "You don't have any transactions yet.");
      return;
    }
    
    let historyText = "Your transaction history:\n\n";
    
    account.transactions.slice(-10).forEach((tx, index) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      
      if (tx.type === 'transfer') {
        historyText += `${index + 1}. [${date}] Transferred $${tx.amount.toFixed(2)} to user ${tx.recipient}\n`;
      } else if (tx.type === 'withdrawal') {
        historyText += `${index + 1}. [${date}] Withdrew $${tx.amount.toFixed(2)}\n`;
      }
    });
    
    bot.sendMessage(id, historyText);
  });
};