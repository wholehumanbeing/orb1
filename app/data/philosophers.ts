import type { PhilosopherData, Era } from "../types/philosopher"

/**
 * Sample philosopher data structure
 * This will eventually contain ~50-75 philosophers across all eras
 */
export const philosophers: PhilosopherData[] = [
  {
    id: "socrates",
    name: "Socrates",
    era: "Ancient",
    birth: -470,
    death: -399,
    domainSummaries: {
      ethics:
        "Socrates pioneered virtue ethics, teaching that moral excellence is the highest good. He believed that virtue is knowledge – no one knowingly does wrong – and that self-examination leads to virtue. His approach to ethics was to ask probing questions (the Socratic method) to illuminate truth and goodness. The famous maxim 'know thyself' encapsulates his belief that understanding oneself is fundamental to living ethically. He emphasized that caring for one's soul is more important than material possessions or social status.",
      aesthetics:
        "In aesthetics, Socrates was skeptical of art's value, often questioning the poets in Athens. He hinted that art should promote virtue and truth, though he left no systematic theory of art. Beauty, for Socrates, was closely tied to moral goodness and the harmony of the soul. He believed that true beauty comes from within and is reflected in virtuous actions. His critique of artists focused on their lack of knowledge about what they portrayed, suggesting that art without wisdom could mislead.",
      logic:
        "Socrates didn't write formal logic, but he introduced dialectic as a method of reasoning. Through dialogue and persistent questioning, he aimed to expose contradictions in others' beliefs. This logical method laid groundwork for critical thinking and was a precursor to formal logic developed later. His elenchus (cross-examination) method sought to reveal inconsistencies in arguments and lead interlocutors to aporia (productive puzzlement). This approach emphasized the importance of clear definitions and consistent reasoning.",
      politics:
        "Politically, Socrates was wary of direct democracy after witnessing the folly of the masses (as in his trial). He believed in the importance of knowledgeable leaders, though he personally obeyed Athens' laws even when sentenced unjustly. His questioning of authority was itself a political act, emphasizing integrity over popularity. He argued that political leadership, like any craft, requires expertise and virtue. His death became a symbol of the tension between individual conscience and political authority.",
      metaphysics:
        "Metaphysically, Socrates focused on the soul. He held that the soul is immortal and that caring for one's soul through virtue is paramount. He did not propose a comprehensive cosmology, but his search for definitions (What is justice? What is piety?) was a metaphysical quest for the unchanging essences of virtues. His belief in objective moral truths suggested a reality beyond mere appearances. The Socratic paradoxes (e.g., 'I know that I know nothing') reflect deep metaphysical insights about the nature of knowledge and reality.",
    },
    tags: ["Virtue Ethics", "Dialectic", "Socratic Method", "Know Thyself", "Examined Life", "Moral Intellectualism"],
    influences: [], // Socrates is often considered the starting point, though he was influenced by earlier thinkers
  },
]

/**
 * Tag taxonomy for philosophical concepts
 * Organized by major categories to enable filtering and cross-referencing
 */
export const philosophicalTags: Record<string, string[]> = {
  schools: [
    "Platonism",
    "Aristotelianism",
    "Stoicism",
    "Epicureanism",
    "Cynicism",
    "Neoplatonism",
    "Scholasticism",
    "Rationalism",
    "Empiricism",
    "Idealism",
    "Existentialism",
    "Pragmatism",
    "Analytic Philosophy",
    "Continental Philosophy",
  ],
  concepts: [
    "Dualism",
    "Monism",
    "Materialism",
    "Idealism",
    "Realism",
    "Nominalism",
    "Determinism",
    "Free Will",
    "Teleology",
    "Causation",
    "Substance",
    "Form",
  ],
  ethics: [
    "Virtue Ethics",
    "Deontology",
    "Consequentialism",
    "Natural Law",
    "Divine Command",
    "Social Contract",
    "Utilitarianism",
    "Moral Relativism",
    "Moral Realism",
  ],
  epistemology: [
    "Rationalism",
    "Empiricism",
    "Skepticism",
    "Foundationalism",
    "Coherentism",
    "Pragmatism",
    "Phenomenology",
    "Hermeneutics",
  ],
  political: [
    "Democracy",
    "Aristocracy",
    "Monarchy",
    "Republic",
    "Anarchism",
    "Socialism",
    "Liberalism",
    "Conservatism",
    "Communitarianism",
    "Libertarianism",
  ],
}

/**
 * Helper function to get philosophers by era
 */
export function getPhilosophersByEra(era: Era): PhilosopherData[] {
  return philosophers.filter((p) => p.era === era)
}

/**
 * Helper function to get philosophers by tag
 */
export function getPhilosophersByTag(tag: string): PhilosopherData[] {
  return philosophers.filter((p) => p.tags.includes(tag))
}

/**
 * Helper function to get philosophers who influenced a given philosopher
 */
export function getInfluencers(philosopherId: string): PhilosopherData[] {
  const philosopher = philosophers.find((p) => p.id === philosopherId)
  if (!philosopher) return []

  return philosophers.filter((p) => philosopher.influences.includes(p.id))
}

/**
 * Helper function to get philosophers influenced by a given philosopher
 */
export function getInfluenced(philosopherId: string): PhilosopherData[] {
  return philosophers.filter((p) => p.influences.includes(philosopherId))
}
