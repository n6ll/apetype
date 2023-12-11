let d = `all afternoon the usual line of tourists from around the world
had descended into the cramped rockcut tomb some 26 feet
underground to pay their respects They gazed at the murals on the
walls of the burial chamber and peered at Tuts gilded face the most
striking feature of his mummyshaped outer coffin lid Some visitors
read from guidebooks in a whisper others stood silently perhaps
pondering Tuts untimely death in his late teens or wondering with
a shiver if the pharaohs curse  death or misfortune falling upon
those who disturbed him was really true`;



const words = d.split(' ');
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;

function addClass(el,name) {
  el.className += ' '+name;
}
function removeClass(el,name) {
  el.className = el.className.replace(name,'');
}

function randomWord() {
  const randomIndex = Math.ceil(Math.random() * wordsCount);
  return words[randomIndex - 1];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
  document.getElementById('words').innerHTML = '';
  for (let i = 0; i < 200; i++) {
    document.getElementById('words').innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  document.getElementById('info').innerHTML = (gameTime / 1000) + '';
  window.timer = null;
}

function getWpm() {
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter(word => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
    const correctLetters = letters.filter(letter => letter.className.includes('correct'));
    return incorrectLetters.length === 0 && correctLetters.length === letters.length;
  });
  return correctWords.length / gameTime * 60000;
}

function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  const result = getWpm();
  document.getElementById('info').innerHTML = `WPM: ${result}`;
  if (result < 40) {
    document.getElementById('message').innerHTML = 'Get better';
  } else {
    document.getElementById('message').innerHTML = '';
  }
}

document.getElementById('game').addEventListener('keyup', ev => {
  const key = ev.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) {
    return;
  }

  console.log({key,expected});

  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = (new Date()).getTime();
      }
      const currentTime = (new Date()).getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = Math.round((gameTime / 1000) - sPassed);
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft + '';
    }, 1000);
  }
  if (isLetter) {
    if (currentLetter) {
        if (key === expected) {
            addClass(currentLetter, 'correct');
        } else {
            addClass(currentLetter, 'incorrect');
        }

        removeClass(currentLetter, 'current');
        if (currentLetter.nextSibling) {
            addClass(currentLetter.nextSibling, 'current');
        }
    } else {
        // Check if the word has already been marked as incorrect
        if (!currentWord.classList.contains('incorrect')) {
            // If not, create a new span for the mistyped letter
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);

            // Check if it's the last word, and the mistyped letter is the last one in the word
            if (!currentWord.nextSibling && !currentLetter.nextSibling) {
                // Stop the timer and mark the game as over
                gameOver();
                return;
            }

            // Move to the next word
            removeClass(currentWord, 'current');
            if (currentWord.nextSibling) {
                addClass(currentWord.nextSibling, 'current');
                if (currentWord.nextSibling.firstChild) {
                    addClass(currentWord.nextSibling.firstChild, 'current');
                }
            }
        }
    }
}




if (isSpace) {
  // Move to the next word
  removeClass(currentWord, 'current');
  if (currentWord.nextSibling) {
      addClass(currentWord.nextSibling, 'current');
      if (currentWord.nextSibling.firstChild) {
          addClass(currentWord.nextSibling.firstChild, 'current');
      }
  }

  // Check if the current letter is incorrect
  if (expected !== ' ' && currentLetter) {
      addClass(currentLetter, 'incorrect');
  }
}


  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      // make prev word current, last letter current
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    }
    if (currentLetter && !isFirstLetter) {
      // move back one letter, invalidate letter
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
    }
    if (!currentLetter) {
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
    }
  }

  // move lines / words
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
  }

  // move cursor
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');
  cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
  cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
});



newGame();