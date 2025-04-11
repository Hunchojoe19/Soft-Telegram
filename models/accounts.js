// Mock database for user accounts
const userAccounts = {};

// Helper function to ensure user has an account
function ensureUserAccount(userId) {
  if (!userAccounts[userId]) {
    userAccounts[userId] = {
      balance: 1000, // Starting with mock balance
      transactions: []
    };
  }
  return userAccounts[userId];
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
  userAccounts,
  ensureUserAccount,
  addTransaction
};