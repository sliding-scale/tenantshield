/** Starter prompts shown in the empty Ask AI thread. */
export const ASK_AI_SUGGESTIONS = [
  {
    label: "Landlord won't return my deposit",
    prompt:
      "My landlord won't return my security deposit. What are my rights and what should I do next?",
  },
  {
    label: "Can my rent be raised mid-lease?",
    prompt: "Can my landlord raise my rent in the middle of my lease? What are the rules?",
  },
  {
    label: "My apartment has mold — what do I do?",
    prompt:
      "My apartment has mold and the landlord has not fixed it. What are my habitability rights and next steps?",
  },
  {
    label: "Got an eviction notice — what are my rights?",
    prompt:
      "I received an eviction notice. What are my rights and what should I do immediately?",
  },
] as const

export type AskAiSuggestion = (typeof ASK_AI_SUGGESTIONS)[number]
