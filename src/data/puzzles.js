export const PUZZLES = [
  {
    id: 1,
    type: 'meta',
    question: 'Tap the green button.',
    options: [
      { text: 'RED', color: 'green', isCorrect: true },
      { text: 'GREEN', color: 'red', isCorrect: false },
      { text: 'BLUE', color: 'blue', isCorrect: false }
    ],
    timeLimit: 7
  },
  {
    id: 2,
    type: 'logic',
    question: 'Some months have 31 days. How many have 28?',
    options: [
      { text: '1', isCorrect: false },
      { text: '12', isCorrect: true },
      { text: '6', isCorrect: false },
      { text: 'Depends on leap year', isCorrect: false }
    ],
    timeLimit: 10
  },
  {
    id: 3,
    type: 'trick',
    question: "Don't press the button.",
    options: [
      { text: 'PRESS ME', isCorrect: false }
    ],
    timeLimit: 5,
    requiresWait: true
  },
  {
    id: 4,
    type: 'math',
    question: 'What is half of 2 plus 2?',
    options: [
      { text: '2', isCorrect: false },
      { text: '3', isCorrect: true },
      { text: '4', isCorrect: false },
      { text: '1', isCorrect: false }
    ],
    timeLimit: 10
  },
  {
    id: 5,
    type: 'observation',
    question: 'Which of these is not a real planet?',
    options: [
      { text: 'Mars', isCorrect: false },
      { text: 'Pluto', isCorrect: true },
      { text: 'Saturn', isCorrect: false },
      { text: 'Neptune', isCorrect: false }
    ],
    timeLimit: 10
  },
  {
    id: 6,
    type: 'reverse_logic',
    question: 'Choose the WRONG answer.',
    options: [
      { text: '2 + 2 = 4', isCorrect: false },
      { text: 'Fire is hot', isCorrect: false },
      { text: 'Ice is cold', isCorrect: false },
      { text: 'Water is dry', isCorrect: true }
    ],
    timeLimit: 7
  },
  {
    id: 7,
    type: 'visual',
    question: 'Tap the word "BLUE" (not the color).',
    options: [
      { text: 'RED', color: 'blue', isCorrect: false },
      { text: 'BLUE', color: 'green', isCorrect: true },
      { text: 'GREEN', color: 'red', isCorrect: false }
    ],
    timeLimit: 5
  },
  {
    id: 8,
    type: 'trick',
    question: 'How many letters are in the alphabet?',
    options: [
      { text: '26', isCorrect: false },
      { text: '24', isCorrect: false },
      { text: '11', isCorrect: true },
      { text: '21', isCorrect: false }
    ],
    timeLimit: 10
  },
  {
    id: 9,
    type: 'reaction',
    question: 'Quick! Tap the smallest number.',
    options: [
      { text: '100', isCorrect: false },
      { text: '10', isCorrect: false },
      { text: '-5', isCorrect: true },
      { text: '0', isCorrect: false }
    ],
    timeLimit: 4
  },
  {
    id: 10,
    type: 'meta',
    question: 'The answer is hiding...',
    options: [
      { text: 'Where?', isCorrect: false },
      { text: 'Here?', isCorrect: false },
      { text: 'Behind you?', isCorrect: false },
      { text: ' ', isCorrect: true, color: 'transparent' } // Invisible button trick
    ],
    timeLimit: 10
  },
  {
    id: 11,
    type: 'logic',
    question: 'If you are running in a race and you pass the person in second place, what place are you in?',
    options: [
      { text: 'First', isCorrect: false },
      { text: 'Second', isCorrect: true },
      { text: 'Third', isCorrect: false },
      { text: 'Last', isCorrect: false }
    ],
    timeLimit: 12
  },
  {
    id: 12,
    type: 'trick',
    question: "Mary's father has 5 daughters: Nana, Nene, Nini, Nono. What is the name of the 5th?",
    options: [
      { text: 'Nunu', isCorrect: false },
      { text: 'Mary', isCorrect: true },
      { text: 'None', isCorrect: false },
      { text: 'Nina', isCorrect: false }
    ],
    timeLimit: 12
  },
  {
    id: 13,
    type: 'meta',
    question: 'Do not tap the correct answer.',
    options: [
      { text: 'Wrong', isCorrect: true },
      { text: 'Correct Answer', isCorrect: false }
    ],
    timeLimit: 7
  },
  {
    id: 14,
    type: 'math',
    question: 'Which is heavier: a ton of bricks or a ton of feathers?',
    options: [
      { text: 'Bricks', isCorrect: false },
      { text: 'Feathers', isCorrect: false },
      { text: 'Neither', isCorrect: true }
    ],
    timeLimit: 7
  },
  {
    id: 15,
    type: 'reaction',
    question: 'Tap the shape with three sides.',
    options: [
      { text: '⬛', isCorrect: false },
      { text: '🔴', isCorrect: false },
      { text: '⭐', isCorrect: false },
      { text: '🔺', isCorrect: true }
    ],
    timeLimit: 3
  },
  {
    id: 16,
    type: 'trick',
    question: 'A plane crashes on the border of US and Canada. Where do they bury the survivors?',
    options: [
      { text: 'US', isCorrect: false },
      { text: 'Canada', isCorrect: false },
      { text: 'Nowhere', isCorrect: true },
      { text: 'The Border', isCorrect: false }
    ],
    timeLimit: 10
  },
  {
    id: 17,
    type: 'meta',
    question: 'Tap the button that is upside down.',
    options: [
      { text: 'Button', isCorrect: false },
      { text: 'uoʇʇnB', isCorrect: true },
      { text: 'Button', isCorrect: false }
    ],
    timeLimit: 5
  },
  {
    id: 18,
    type: 'logic',
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    options: [
      { text: 'A ghost', isCorrect: false },
      { text: 'An echo', isCorrect: true },
      { text: 'A shadow', isCorrect: false },
      { text: 'A tree', isCorrect: false }
    ],
    timeLimit: 15
  },
  {
    id: 19,
    type: 'visual',
    question: `Count the number of F's in: "Finished files are the result of years of scientific study combined with the experience of years."`,
    options: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: false },
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: true }
    ],
    timeLimit: 15
  },
  {
    id: 20,
    type: 'trick',
    question: 'Before Mt. Everest was discovered, what was the highest mountain in the world?',
    options: [
      { text: 'Mt. Kilimanjaro', isCorrect: false },
      { text: 'Mt. Everest', isCorrect: true },
      { text: 'K2', isCorrect: false },
      { text: 'The Alps', isCorrect: false }
    ],
    timeLimit: 10
  }
];
