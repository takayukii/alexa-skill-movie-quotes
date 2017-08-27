'use strict';

const Alexa = require('alexa-sdk');
const stringSimilarity = require('string-similarity');
const {shuffle} = require('./utils');

const MSG_RE_PROMPT = 'Please say that again?';
const MSG_THANK_YOU = 'Thank you. See you soon.';

function createHandlers(state, LIST_OF_DIALOGUES) {
  return Alexa.CreateStateHandler(state, {
    'Start': function () {
      console.log('LISTEN_REPEAT Start');
      shuffle(LIST_OF_DIALOGUES);
      this.attributes['dialogues'] = LIST_OF_DIALOGUES.slice(0, 5);
      this.attributes['dialogueCount'] = 0;
      this.attributes['quoteCount'] = 0;
      this.attributes['repeat'] = '';
      this.attributes['percentage'] = 0;
      this.attributes['again'] = false;
      this.attributes['againCount'] = 0;
      this.emitWithState('AskListenRepeat');
    },
    'AskListenRepeat': function () {
      console.log('LISTEN_REPEAT AskListenRepeat');
      const {dialogues, dialogueCount, quoteCount, repeat, percentage, again, againCount} = this.attributes;
      const praise = percentage > 95 ? '<emphasis level="strong">Awesome!</emphasis>' : 'Good.';
      const evaluation = `${praise} ${percentage} percent correct. `;
      if (dialogueCount === dialogues.length - 1 && quoteCount === dialogues[dialogueCount]['quotes'].length) {
        return this.emit(':tell', `${evaluation} ${MSG_THANK_YOU}`);
      }
      const scene = `Dialogue ${dialogueCount + 1}, following quotes are from ${dialogues[dialogueCount]['scene']}.<break time='500ms'/>`;
      const person = `<emphasis level="reduced">${dialogues[dialogueCount]['quotes'][quoteCount]['person']}.</emphasis><break time='300ms'/>`;
      const quote = `${dialogues[dialogueCount]['quotes'][quoteCount]['quote']}`;
      let intro = '';
      if (quoteCount === 0) {
        intro = `${scene}`;
      }
      if (quoteCount > 0) {
        intro = `${evaluation} `;
      }
      if (again === true) {
        if (repeat) {
          intro = `Hmm, ${percentage} percent correct. You said ${repeat}. `;
        } else {
          intro = `Hmm, I couldn't get what you said. `;
        }
        if (againCount === 5) {
          this.attributes['againCount'] = 0;
          if (quoteCount + 1 === dialogues[dialogueCount]['quotes'].length && dialogueCount + 1 < dialogues.length) {
            this.attributes['dialogueCount'] += 1;
            this.attributes['quoteCount'] = 0;
          } else {
            this.attributes['quoteCount'] += 1;
          }
          if (this.attributes['dialogueCount'] === dialogues.length - 1 && this.attributes['quoteCount'] === dialogues[this.attributes['dialogueCount']]['quotes'].length) {
            return this.emit(':tell', `${evaluation} ${MSG_THANK_YOU}`);
          }
          intro += `Try next one. `;
        } else {
          intro += `One more time. `;
        }
      }
      this.emit(':ask', `${intro}<break time='1s'/>${person}${quote}`, MSG_RE_PROMPT);
    },
    'ListenRepeatIntent': function () {
      console.log('LISTEN_REPEAT ListenRepeatIntent');
      console.log('slots', this.event.request.intent.slots);
      this.attributes['repeat'] = this.event.request.intent.slots.ListenRepeat.value;
      const {dialogues, dialogueCount, quoteCount, repeat} = this.attributes;

      const expectedQuote = dialogues[dialogueCount]['quotes'][quoteCount]['quote'].replace(/[^0-9|a-zA-Z| ]/ig, '').replace('  ', ' ');
      const similarity = stringSimilarity.compareTwoStrings(expectedQuote, repeat);
      const percentage = Math.floor(similarity * 100);
      this.attributes['percentage'] = percentage;

      if (percentage > 50) {
        if (quoteCount + 1 === dialogues[dialogueCount]['quotes'].length && dialogueCount + 1 < dialogues.length) {
          this.attributes['dialogueCount'] += 1;
          this.attributes['quoteCount'] = 0;
        } else {
          this.attributes['quoteCount'] += 1;
        }
        this.attributes['again'] = false;
        this.attributes['againCount'] = 0;
        this.emitWithState('AskListenRepeat');
      } else {
        this.attributes['again'] = true;
        this.attributes['againCount'] += 1;
        this.emitWithState('AskListenRepeat');
      }
    },
    'AMAZON.StopIntent': function () {
      this.emit(':tell', MSG_THANK_YOU);
    },
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', MSG_THANK_YOU);
    },
    'Unhandled': function () {
      console.log('LISTEN_REPEAT Unhandled');
      this.attributes['again'] = true;
      this.attributes['againCount'] += 1;
      this.attributes['repeat'] = undefined;
      this.attributes['percentage'] = 0;
      this.emitWithState('AskListenRepeat');
    }
  });
}

function showCustomSlotTypes() {
  const paths = [
    '../resources/big-hero-6.json'
  ];
  console.log('LIST_OF_LISTEN_REPEATS');
  const quotesSet = new Set();
  for (const path of paths) {
    const LIST_OF_DIALOGUES = require(path);
    for (const dialogue of LIST_OF_DIALOGUES) {
      for (const quote of dialogue['quotes']) {
        quotesSet.add(quote['quote']);
      }
    }
  }
  for (const item of quotesSet) {
    console.log(item);
  }
  console.log();
}

module.exports = {
  createHandlers,
  showCustomSlotTypes
};
