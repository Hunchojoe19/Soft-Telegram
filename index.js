require('dotenv').config();
const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const startCommand = require('./commands/start');
const balanceCommand = require('./commands/balance');
const transferCommand = require('./commands/transfer');
const withdrawCommand = require('./commands/withdraw');
const historyCommand = require('./commands/history');

const { handleCallbackQuery } = require('./utils/callbacks');
const { handleDefaultMessage } = require('./utils/messages');



// const {TELEGRAM_TOKEN, SERVER_URL} = process.env;
// const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const SERVER_URL = process.env.SERVER_URL;
const app = express()
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });


if (SERVER_URL) {
  bot.setWebHook(`${SERVER_URL}/bot${TELEGRAM_TOKEN}`);
  
  app.use(express.json());
  
  app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  
  app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000);
  });
}

startCommand(bot);
balanceCommand(bot);
transferCommand(bot);
withdrawCommand(bot);
historyCommand(bot);

// Handle callback queries (for payment method selection)
bot.on('callback_query', (callbackQuery) => {
  handleCallbackQuery(bot, callbackQuery);
});

// Handle other messages
bot.on('message', (msg) => {
  const { text, reply_to_message } = msg;
  
  // Skip processing commands and replies (already handled in command modules)
  if (text && text.startsWith('/') || reply_to_message) {
    return;
  }
  
  handleDefaultMessage(bot, msg);
});
