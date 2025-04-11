function handleDefaultMessage(bot, msg) {
  const { chat: { id } } = msg;
  
  bot.sendMessage(id, 
    "I'm your payment assistant! Use these commands:\n" +
    "/balance - Check your balance\n" +
    "/transfer - Send money\n" +
    "/withdraw - Withdraw funds\n" +
    "/history - View transactions"
  );
}

module.exports = {
  handleDefaultMessage
};