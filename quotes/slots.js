'use strict';

const {STATE} = require('./handler');

const paths = Object.keys(STATE).map(key => `./resources/${STATE[key]}`);
console.log('LIST_OF_LISTEN_REPEATS');
const phrasesSet = new Set();
for (const path of paths) {
  const LIST_OF_DIALOGUES = require(path);
  for (const dialogue of LIST_OF_DIALOGUES) {
    for (const quote of dialogue['phrases']) {
      const phrase = quote['phrase'].toLowerCase().replace(/"/g, '');
      const chars = phrase.split();
      while (chars.length > 140) {
        let i;
        for (i = chars.length - 1; chars[i] !== ' '; i--) {}
        chars.splice(0, i);
      }
      phrasesSet.add(chars.join());
    }
  }
}
for (const item of phrasesSet) {
  console.log(item);
}
console.log();
