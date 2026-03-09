// Mock database for user accounts (using global to ensure persistence)
global.userAccounts = global.userAccounts || {};

// Helper function to ensure user has an account
function ensureUserAccount(userId) {
  if (!global.userAccounts[userId]) {
    global.userAccounts[userId] = {
      balance: 1000, // Starting with mock balance
      transactions: []
    };
  }
  return global.userAccounts[userId];
}

// Add a transaction to user's history
function addTransaction(userId, transaction) {
  const account = ensureUserAccount(userId);
  account.transactions.push({
    ...transaction,
    timestamp: new Date().toISOString()
  });
  return account;
}

module.exports = {
  userAccounts: global.userAccounts,
  ensureUserAccount,
  addTransaction
};