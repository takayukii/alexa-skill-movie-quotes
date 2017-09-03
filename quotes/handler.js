'use strict';

const Alexa = require('alexa-sdk');
const stringSimilarity = require('string-similarity');
const {createHandlers} = require('./lib/listen-repeat-handlers');

const MSG_RE_PROMPT = 'Hello! Can you hear me?';
const MSG_THANK_YOU = 'Thank you very much. See you at next time!';

const STATE = {
  'Big Hero 6': 'big-hero-6.json',
  'Zootopia': 'zootopia.json',
  'Friends season 1 episode 1': 'friends-1-1.json'
};

const handlers = [
  {
    'LaunchRequest': function () {
      this.emit('AskTitle');
    },
    'AskTitle': function () {
      console.log('handlers AskTitle');
      const titles = Object.keys(STATE).map((key) => (`${key}.<break time='500ms'/>`));
      const message = `Welcome to Quotes practice. You can choose quotes from following titles.<break time='500ms'/> ${titles.join(' ')}`;
      this.emit(':ask', message, MSG_RE_PROMPT);
    },
    'TitleIntent': function () {
      console.log('handlers TitleIntent');
      const title = this.event.request.intent.slots.Title.value;
      const episode = this.event.request.intent.slots.Episode.value;
      const actualTitle = episode ? `${title} episode ${episode}` : title;
      console.log('actualTitle', actualTitle);
      const titles = Object.keys(STATE);
      for (const t of titles) {
        const similarity = stringSimilarity.compareTwoStrings(t.toLowerCase(), actualTitle);
        console.log('similarity', t.toLowerCase(), similarity);
        if (similarity * 100 > 70) {
          this.handler.state = STATE[t];
          return this.emitWithState('Start');
        }
      }
      this.emit('AskTitle');
    },
    'AMAZON.StopIntent': function () {
      this.emit(':tell', MSG_THANK_YOU);
    },
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', MSG_THANK_YOU);
    },
    'Unhandled': function () {
      console.log('handlers Unhandled');
      this.emit('AskTitle');
    }
  }
];

Object.keys(STATE).forEach((key) => {
  const LIST_OF_DIALOGUES = require(`${__dirname}/resources/${STATE[key]}`);
  handlers.push(createHandlers(STATE[key], LIST_OF_DIALOGUES));
});

module.exports.quotes = (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(...handlers);
  alexa.execute();
};

module.exports.STATE = STATE;

