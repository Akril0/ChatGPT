const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const response = async (text, userId) => {
  return await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: text,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    user: '' + userId,
  });
};

const token = '6174338641:AAHNmpOIQA1FyU19DmKory7SWqIIhPOEOIw';

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const messageText = msg.text;
  if (messageText === '/start') {
    await bot.sendMessage(chatId, 'Write your question');
  } else {
    const awaitMessageId = (
      await bot.sendMessage(chatId, '⌛Your message is being in processed', {
        reply_to_message_id: messageId,
      })
    ).message_id;

    response(messageText, chatId)
      .then((respone) => {
        bot.deleteMessage(chatId, awaitMessageId).catch((er) => {
          console.log(er);
        });
        bot.sendMessage(chatId, respone.data.choices[0].text, {
          reply_to_message_id: messageId,
        });
      })
      .catch((er) => {
        bot.deleteMessage(chatId, awaitMessageId).catch((er) => {
          console.log(er);
        });
        bot.sendMessage(chatId, er.data.error.message, {
          reply_to_message_id: messageId,
        });
      });
  }
});
