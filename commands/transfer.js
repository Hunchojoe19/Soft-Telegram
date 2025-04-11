const { ensureUserAccount, addTransaction, userAccounts } = require('../models/accounts');

module.exports = function(bot) {
  bot.onText(/\/transfer/, (msg) => {
    const { chat: { id } } = msg;
    const account = ensureUserAccount(id);
    
    bot.sendMessage(id, "Please enter the recipient's ID:", {
      reply_markup: {
        force_reply: true
      }
    }).then(askRecipient => {
      // Step 2: Get recipient ID
      bot.onReplyToMessage(askRecipient.chat.id, askRecipient.message_id, recipientMsg => {
        const recipientId = recipientMsg.text.trim();
        
        // Step 3: Ask for amount
        bot.sendMessage(id, `Please enter the amount to transfer to ${recipientId}:`, {
          reply_markup: {
            force_reply: true
          }
        }).then(askAmount => {
          // Step 4: Get amount and process transfer
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
            
            // Process transfer
            ensureUserAccount(recipientId);
            account.balance -= amount;
            userAccounts[recipientId].balance += amount;
            
            // Record transaction
            addTransaction(id, {
              type: 'transfer',
              amount,
              recipient: recipientId
            });
            
            bot.sendMessage(id, `Successfully transferred $${amount.toFixed(2)} to ${recipientId}. Your new balance: $${account.balance.toFixed(2)}`);
            bot.sendMessage(recipientId, `You received $${amount.toFixed(2)} from ${id}. Your new balance: $${userAccounts[recipientId].balance.toFixed(2)}`);
          });
        });
      });
    });
  });
};