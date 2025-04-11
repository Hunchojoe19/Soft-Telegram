const { ensureUserAccount, addTransaction } = require('../models/accounts');

module.exports = function(bot) {
  bot.onText(/\/withdraw/, (msg) => {
    const { chat: { id } } = msg;
    const account = ensureUserAccount(id);
    
    bot.sendMessage(id, "Please enter the amount to withdraw:", {
      reply_markup: {
        force_reply: true
      }
    }).then(askAmount => {
      bot.onReplyToMessage(askAmount.chat.id, askAmount.message_id, amountMsg => {
        const amount = parseFloat(amountMsg.text.trim());
        
        if (isNaN(amount) || amount <= 0) {
          bot.sendMessage(id, "Invalid amount. Please try again with a valid number.");
          return;
        }
        
        if (amount > account.balance) {
          bot.sendMessage(id, "Insufficient funds. Please try again with a smaller amount.");
          return;
        }
        
        // Process withdrawal
        account.balance -= amount;
        
        // Record transaction
        addTransaction(id, {
          type: 'withdrawal',
          amount
        });
        
        // Ask for payment method
        const paymentOptions = [
          [{ text: 'Bank Transfer', callback_data: 'bank_transfer' }],
          [{ text: 'PayPal', callback_data: 'paypal' }],
          [{ text: 'Crypto', callback_data: 'crypto' }]
        ];
        
        bot.sendMessage(id, `Withdrawal of $${amount.toFixed(2)} initiated. Please select your preferred payment method:`, {
          reply_markup: {
            inline_keyboard: paymentOptions
          }
        });
      });
    });
  });
};