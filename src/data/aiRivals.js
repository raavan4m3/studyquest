export const AI_RIVALS = [
  {
    id: 'nova',
    name: 'Nova',
    icon: '🚀',
    color: '#ff6b9d',
    messages: {
      ahead: ["You're doing great! Keep pushing!", "Almost there, don't stop now!", "Focus is key—you've got this!"],
      behind: ["I'm pulling ahead! Let's pick up the pace!", "Need to catch up? Let's study together!", "Don't let me win that easily!"],
      tied: ["Great minds study alike!", "We're neck and neck!", "Let's see who blinks first!"],
      encouragement: ["You can do it!", "Every minute counts!", "Stay focused!"],
    },
  },
  {
    id: 'focusfox',
    name: 'FocusFox',
    icon: '🦊',
    color: '#ff9f43',
    messages: {
      ahead: ["Sharp focus today! Impressive!", "Keep that concentration going!", "You're in the zone!"],
      behind: ["I've got my eye on the prize! Study harder!", "Behind already? Let's go!", "Time to lock in!"],
      tied: ["We're evenly matched today!", "Great minds think alike!", "This is fun!"],
      encouragement: ["Stay sharp!", "You've got this!", "One more minute!"],
    },
  },
  {
    id: 'zenbot',
    name: 'ZenBot',
    icon: '🧘',
    color: '#a29bfe',
    messages: {
      ahead: ["Your focus is admirable.", "Balance in all things—well done.", "Peace and productivity!"],
      behind: ["I remain focused. Will you?", "Do not be distracted.", "The path requires discipline."],
      tied: ["We move in harmony.", "Balance is achieved.", "Together we grow."],
      encouragement: ["Breathe and focus.", "Each moment is an opportunity.", "Find your center."],
    },
  },
  {
    id: 'studybot',
    name: 'StudyBot',
    icon: '🤖',
    color: '#00b894',
    messages: {
      ahead: ["Calculating: You're winning. Fact.", "Optimal performance detected!", "Efficiency rating: Excellent!"],
      behind: ["ERROR: Behind schedule. Boost required!", "Warning: Rival ahead. Increase study rate!", "System recommends: More focus!"],
      tied: ["STATUS: Par. Acceptable.", "Synchronized studying detected.", "Proceed as planned."],
      encouragement: ["Calculating effort... 100%.", "Continue operation.", "Study mode: Engaged."],
    },
  },
];

export function getRivalMessage(rivalId, userSeconds, rivalSeconds, type) {
  const rival = AI_RIVALS.find(r => r.id === rivalId) || AI_RIVALS[0];
  const diff = userSeconds - rivalSeconds;
  let category;
  if (Math.abs(diff) < 120) category = 'tied';
  else if (diff > 0) category = 'ahead';
  else category = 'behind';

  if (type === 'encouragement') category = 'encouragement';

  const msgs = rival.messages[category];
  return msgs[Math.floor(Math.random() * msgs.length)];
}
