'use strict';

const Alexa = require('alexa-sdk');
const stringSimilarity = require('string-similarity');
const {createHandlers} = require('./lib/listen-repeat-handlers');

const MSG_RE_PROMPT = 'Please say that again?';
const MSG_THANK_YOU = 'Thank you. See you soon.';

const STATE = {
  'Big Hero 6': 'big-hero-6.json'
};

const handlers = [
  {
    'LaunchRequest': function () {
      this.emit('AskTitle');
    },
    'AskTitle': function () {
      console.log('handlers AskTitle');
      const titles = Object.keys(STATE).map((key) => (`quotes from ${key}.<break time='500ms'/>`));
      const message = `Welcome to Quotes practice. You can choose quotes from following titles.<break time='500ms'/> ${titles.join(' ')}`;
      this.emit(':ask', message, MSG_RE_PROMPT);
    },
    'TitleIntent': function () {
      console.log('handlers TitleIntent');
      const title = this.event.request.intent.slots.Title.value;
      const titles = Object.keys(STATE);
      for (const t of titles) {
        if (stringSimilarity.compareTwoStrings(t.toLowerCase(), title) * 100 > 80) {
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
