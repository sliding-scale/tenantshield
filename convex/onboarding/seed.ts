import { internalMutation, internalQuery } from '../_generated/server';

type OnboardingQuestionSeed = {
  step: number;
  title: string;
  description?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
};

function toSeedRow(doc: {
  step: number;
  title: string;
  description?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}): OnboardingQuestionSeed {
  const row: OnboardingQuestionSeed = {
    step: doc.step,
    title: doc.title,
    option1: doc.option1,
    option2: doc.option2,
    option3: doc.option3,
    option4: doc.option4,
  };
  if (doc.description !== undefined) {
    row.description = doc.description;
  }
  return row;
}

/** Dev — `npx convex run onboarding/seed:exportOnboardingQuestions` (check function logs in Dashboard). */
export const exportOnboardingQuestions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query('onboardingQuestions').withIndex('by_step').collect();
    const rows = docs.sort((a, b) => a.step - b.step).map(toSeedRow);

    console.log('--- onboardingQuestions (paste into seedOnboardingQuestions rows) ---');
    console.log(JSON.stringify(rows, null, 2));
    console.log('--- end ---');

    return { count: rows.length, rows };
  },
});

/**
 * Prod — paste `rows` from dev export, then:
 * `npx convex run onboarding/seed:seedOnboardingQuestions --prod`
 */
export const seedOnboardingQuestions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('onboardingQuestions').first();
    if (existing) {
      return {
        inserted: 0,
        message: 'onboardingQuestions already has rows; skipped.',
      };
    }

    const rows: OnboardingQuestionSeed[] = [
      {
        description: 'The longer it sits, the harder it gets to resolve.',
        option1: 'Less than a week',
        option2: '1-4 weeks',
        option3: '1-3 months',
        option4: "More than 3 months — it won't go away",
        step: 1,
        title: 'How long has this issue been weighing on you?',
      },
      {
        description: 'Deposits, unpaid repairs, illegal fees, lost wages...',
        option1: 'Under $500',
        option2: '$500 - $2,000',
        option3: '$2,000 - $5,000',
        option4: 'Over $5,000 — this is serious',
        step: 2,
        title: 'How much money is on the line?',
      },
      {
        description: 'Mental load compounds daily.',
        option1: 'Once in a while',
        option2: 'Every few days',
        option3: 'Every day',
        option4: "Multiple times a day — I can't let it go",
        step: 3,
        title: 'How often do you think about this?',
      },
      {
        description: 'Sleep, work, relationships, health — pick what resonates.',
        option1: 'Not much — just annoying',
        option2: 'Some stress',
        option3: 'Losing sleep or focus at work',
        option4: 'Real toll on my health, money, or relationships',
        step: 4,
        title: 'How is this affecting your life?',
      },
      {
        description: 'Be honest with yourself.',
        option1: "It'll eventually resolve",
        option2: "I'll probably lose the money",
        option3: 'My landlord keeps crossing the line',
        option4: 'Eviction, lawsuit, or something worse',
        step: 5,
        title: "If you do nothing, what's most likely to happen?",
      },
      {
        description: 'Not a future-you. The you that goes to sleep tonight with a plan.',
        option1: 'A few dollars',
        option2: 'Worth a monthly coffee',
        option3: 'Worth a dinner out',
        option4: "I'd pay almost anything to stop this",
        step: 6,
        title:
          'If you had the exact words, statutes, and 24-hour action plan — delivered tonight — what would that be worth?',
      },
    ];

    if (rows.length === 0) {
      return {
        inserted: 0,
        message: 'No rows in seedOnboardingQuestions; paste dev export into rows first.',
      };
    }

    for (const row of rows) {
      await ctx.db.insert('onboardingQuestions', row);
    }

    return { inserted: rows.length, message: `Seeded ${rows.length} onboarding question(s).` };
  },
});
