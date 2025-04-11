function handleCallbackQuery(bot, callbackQuery) {
  const { message: { chat: { id } }, data } = callbackQuery;
  
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
    });
  }
}

module.exports = {
  handleCallbackQuery
};