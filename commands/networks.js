const { getAllNetworkProviders, getNetworkProvider } = require('../models/wallets');

module.exports = function(bot) {
  // Command to list all available network providers
  bot.onText(/\/networks/, (msg) => {
    const { chat: { id } } = msg;
    
    const providers = getAllNetworkProviders();
    let message = "Available Network Providers:\n\n";
    
    Object.keys(providers).forEach(key => {
      message += `• ${providers[key].name} (${key})\n`;
    });
    
    message += "\nTo see data bundles for a specific provider, use /bundles [PROVIDER_CODE]";
    
    bot.sendMessage(id, message);
  });
  
  // Command to list bundles for a specific provider
  bot.onText(/\/bundles (.+)/, (msg, match) => {
    const { chat: { id } } = msg;
    const providerCode = match[1].trim().toUpperCase();
    
    const provider = getNetworkProvider(providerCode);
    if (!provider) {
      bot.sendMessage(id, `Invalid network provider code. Use /networks to see available providers.`);
      return;
    }
    
    let message = `Data Bundles for ${provider.name}:\n\n`;
    
    provider.bundles.forEach(bundle => {
      message += `• ${bundle.name}\n`;
      message += `  Price: $${bundle.price.toFixed(2)}\n`;
      message += `  Validity: ${bundle.validity}\n`;
      message += `  ID: ${bundle.id}\n\n`;
    });
    
    message += "To purchase a bundle, use /data command.";
    
    bot.sendMessage(id, message);
  });
};