function handleDefaultMessage(bot, msg) {
  const { chat: { id } } = msg;
  
  bot.sendMessage(id, 
    "I'm your payment assistant! Use these commands:\n" +
    "/balance - Check your balance\n" +
    "/transfer - Send money\n" +
    "/withdraw - Withdraw funds\n" +
    "/connect - Connect your wallet\n" +
    "/disconnect - Remove wallet\n" +
    "/data - Buy data bundles\n" +
    "/networks - View available networks\n" +
    "/bundles [PROVIDER] - View data bundles\n" +
    "/datamanager - Manage your data services\n" +
    "/history - View transactions\n"
  );
}

module.exports = {
  handleDefaultMessage
};