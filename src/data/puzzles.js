export const PUZZLES = [
  {
    id: "logic_001",
    category: "logic",
    difficulty: 1,
    question: "You are running a race and you pass the person in 2nd place. What place are you in now?",
    options: ["1st place", "2nd place", "3rd place"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "Your brain assumes passing someone means you take the lead, but you actually just take their spot in 2nd.",
    timerSeconds: 15
  },
  {
    id: "math_001",
    category: "math",
    difficulty: 1,
    question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: ["10 cents", "5 cents", "1 dollar"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "The brain instinctively subtracts 1.00 from 1.10, but if the ball is 10 cents, the bat would be $1.10, making the total $1.20.",
    timerSeconds: 15
  },
  {
    id: "pattern_001",
    category: "pattern",
    difficulty: 1,
    question: "How many months have 28 days?",
    options: ["1", "12", "None"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You immediately think of February, but EVERY month has at least 28 days.",
    timerSeconds: 12
  },
  {
    id: "perception_001",
    category: "perception",
    difficulty: 2,
    question: "If you have a bowl with six apples and you take away four, how many do you have?",
    options: ["2", "4", "6"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You do the math (6 - 4 = 2) for what's left in the bowl, but the question asks how many YOU have. You took 4.",
    timerSeconds: 12
  },
  {
    id: "riddle_001",
    category: "riddle",
    difficulty: 2,
    question: "Some months have 31 days. How many have 30?",
    options: ["4", "11", "5"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You try to recall exactly which months have only 30 days, forgetting that 11 months have at least 30 days.",
    timerSeconds: 12
  },
  {
    id: "logic_002",
    category: "logic",
    difficulty: 2,
    question: "Before Mt. Everest was discovered, what was the highest mountain in the world?",
    options: ["Mt. Kilimanjaro", "Mt. Everest", "K2"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "It was always Mt. Everest, even before humans discovered it.",
    timerSeconds: 10
  },
  {
    id: "math_002",
    category: "math",
    difficulty: 3,
    question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: ["100 minutes", "5 minutes", "50 minutes"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "Your brain sees the pattern 5-5-5 and assumes 100-100-100, but each machine still takes 5 minutes to make its widget.",
    timerSeconds: 10
  },
  {
    id: "perception_002",
    category: "perception",
    difficulty: 2,
    question: "A farmer has 17 sheep and all but 9 die. How many are left?",
    options: ["8", "9", "0"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You subtract 9 from 17, but the riddle literally says 'all but 9 die'.",
    timerSeconds: 12
  },
  {
    id: "logic_003",
    category: "logic",
    difficulty: 1,
    question: "Which is heavier: a ton of bricks or a ton of feathers?",
    options: ["Bricks", "They weigh the same", "Feathers"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "Bricks feel heavier so your brain jumps to them, but a ton is a ton.",
    timerSeconds: 10
  },
  {
    id: "math_003",
    category: "math",
    difficulty: 3,
    question: "Lily pads double in size every day. If it takes 48 days for the lake to be covered, how long does it take to cover half?",
    options: ["24 days", "47 days", "12 days"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You naturally want to halve 48 to 24, but if it doubles every day, it was half full the day before (47).",
    timerSeconds: 12
  },
  {
    id: "riddle_002",
    category: "riddle",
    difficulty: 1,
    question: "Mary's father has 5 daughters: Nana, Nene, Nini, Nono. What is the name of the 5th?",
    options: ["Nunu", "Mary", "None"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You follow the vowel pattern a, e, i, o, u... but the prompt started with 'Mary's father'.",
    timerSeconds: 15
  },
  {
    id: "perception_003",
    category: "perception",
    difficulty: 2,
    question: "How many two cent stamps are in a dozen?",
    options: ["6", "12", "24"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You try to divide by 2, but a dozen of anything is always 12.",
    timerSeconds: 10
  },
  {
    id: "logic_004",
    category: "logic",
    difficulty: 2,
    question: "If a plane crashes on the border of the US and Canada, where do they bury the survivors?",
    options: ["In the US", "You don't bury survivors", "In Canada"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "Your brain focuses on the political border rule, ignoring the word 'survivors'.",
    timerSeconds: 12
  },
  {
    id: "riddle_003",
    category: "riddle",
    difficulty: 2,
    question: "I have branches, but no fruit, trunk or leaves. What am I?",
    options: ["A tree in winter", "A bank", "A dead bush"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You get stuck in the context of nature, missing the corporate definition of a branch.",
    timerSeconds: 15
  },
  {
    id: "pattern_002",
    category: "pattern",
    difficulty: 3,
    question: "If you write down all the numbers from 1 to 100, how many times do you write the digit 9?",
    options: ["10", "20", "11"],
    correctIndex: 1,
    trapIndex: 0,
    trapExplanation: "You count the 9s in the ones place (9, 19, 29...) which is 10, but forget the 90s have ten 9s in the tens place.",
    timerSeconds: 15
  },
  {
    id: "logic_005",
    category: "logic",
    difficulty: 2,
    question: "A rooster lays an egg on the peak of a barn roof. Which side does it roll down?",
    options: ["Left side", "Right side", "Neither"],
    correctIndex: 2,
    trapIndex: 0,
    trapExplanation: "Your brain tries to solve the physics problem, missing that roosters don't lay eggs.",
    timerSeconds: 10
  }
];
