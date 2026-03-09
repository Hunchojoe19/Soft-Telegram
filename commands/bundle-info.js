const { getBundleById, getNetworkProvider } = require('../models/wallets');

module.exports = function(bot) {
  // Command to get details about a specific bundle
  bot.onText(/\/bundle (.+)/, (msg, match) => {
    const { chat: { id } } = msg;
    const input = match[1].trim();
    
    // Parse input (format: "provider_code bundle_id")
    const parts = input.split(' ');
    if (parts.length !== 2) {
      bot.sendMessage(id, "Invalid format. Use: /bundle provider_code bundle_id\nExample: /bundle MTN mtn_1");
      return;
    }
    
    const providerCode = parts[0].toUpperCase();
    const bundleId = parts[1];
    
    // Get bundle details
    const bundle = getBundleById(providerCode, bundleId);
    if (!bundle) {
      bot.sendMessage(id, `Bundle not found. Use /bundles ${providerCode} to see available bundles.`);
      return;
    }
    
    const provider = getNetworkProvider(providerCode);
    
    let message = `Bundle Details:\n\n`;
    message += `Provider: ${provider.name}\n`;
    message += `Bundle: ${bundle.name}\n`;
    message += `Price: $${bundle.price.toFixed(2)}\n`;
    message += `Validity: ${bundle.validity}\n\n`;
    message += `To purchase this bundle, use /data command.`;
    
    bot.sendMessage(id, message);
  });
};