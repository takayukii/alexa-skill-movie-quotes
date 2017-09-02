const fs = require('fs');

const content = fs.readFileSync(`./${process.argv[2]}`, 'utf8');
const lines = content.split('\n');

const dialogues = [];
let dialogue = {
  scene: '',
  phrases: []
};
for (let line of lines) {
  if (!line.trim()) {
    dialogues.push(dialogue);
    dialogue = {
      scene: '',
      phrases: []
    };
    continue;
  }
  const sceneMatches = /^- (.+)$/.exec(line);
  if (dialogue.phrases.length === 0 && sceneMatches && sceneMatches.length > 1) {
    dialogue.scene = sceneMatches[1].trim();
  } else {
    line = line.trim().replace(/\[.*\]/ig, '');
    const phraseMatches = /^(.+)$/.exec(line);
    if (phraseMatches && phraseMatches.length > 1) {
      const phrase = phraseMatches[1].trim();
      const phrases = [];
      let temp = '';
      for (let i = 0; i < phrase.length; i ++) {
        temp += phrase[i];
        if ((phrase[i] === ' ' && ['.', '!', '?', ':'].includes(phrase[i - 1])) || i === phrase.length - 1) {
          if (temp.length < 10) {
            continue;
          }
          phrases.push(temp.trim());
          temp = '';
        }
      }
      dialogue.phrases = dialogue.phrases.concat(phrases.map(p => ({ phrase: p })));
    }
  }
}
dialogues.push(dialogue);

console.log(JSON.stringify(dialogues));
