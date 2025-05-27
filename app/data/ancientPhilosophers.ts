import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Ancient era (c. 600 BCE – 500 CE).
 * Ordered chronologically by approximate birth year.
 */
export const ancientPhilosophers: PhilosopherData[] = [
  {
    id: "thales",
    name: "Thales of Miletus",
    era: "Ancient",
    birth: "c. -624",
    death: "c. -546",
    domainSummaries: {
      ethics:
        'Direct ethical doctrines from Thales are scarce, primarily transmitted through anecdotes and maxims like "Know thyself" and "Nothing in excess" (though attribution varies). These sayings emphasize self-awareness and moderation, foundational concepts in Greek ethics.',
      aesthetics:
        "No specific aesthetic theory is attributed to Thales, as his primary philosophical contributions lay in natural philosophy and cosmology.",
      logic:
        "Thales is credited with introducing deductive reasoning to geometry, famously proving several theorems, including what is now known as Thales' Theorem.",
      politics:
        "Thales's political contributions are known more through historical accounts of his counsel than systematic theory.",
      metaphysics:
        "Thales is renowned for his metaphysical claim that the fundamental principle or substance (archē) of all things is water.",
    },
    tags: ["Pre-Socratic", "Milesian School", "Monism", "Naturalism", "Water Arche", "Rationalism"],
    influences: [],
  },
  {
    id: "socrates",
    name: "Socrates",
    era: "Ancient",
    birth: -470,
    death: -399,
    domainSummaries: {
      ethics:
        "Socrates revolutionized ethics by shifting focus from cosmology to human conduct, famously asserting that 'the unexamined life is not worth living.'",
      aesthetics:
        "Socrates, as portrayed by Plato and Xenophon, did not develop a systematic aesthetic theory but often discussed art and beauty in relation to utility and moral goodness.",
      logic:
        "While Socrates did not formalize logic, his method of inquiry, the Socratic method or elenchus, was a crucial precursor to logical reasoning.",
      politics:
        "Socrates was critical of Athenian democracy, particularly its tendency towards amateurism and the potential for mob rule.",
      metaphysics:
        "Socrates's primary focus was ethics, but his quest for universal definitions of virtues had metaphysical implications.",
    },
    tags: ["Classical Greek", "Socratic Method", "Virtue Ethics", "Irony", "Know Thyself", "Elenchus"],
    influences: ["anaxagoras", "parmenides", "zeno-of-elea"],
  },
  {
    id: "plato",
    name: "Plato",
    era: "Ancient",
    birth: "c. -428",
    death: "c. -348",
    domainSummaries: {
      ethics:
        "Plato's ethics, deeply influenced by Socrates, centers on the pursuit of the Good and the idea that virtue is knowledge.",
      aesthetics:
        "Plato had a complex and often critical view of art, particularly in the *Republic*, where he famously argues that art is an imitation (mimesis) twice removed from the truth of the Forms.",
      logic:
        "While Plato did not develop a system of formal logic like his student Aristotle, he significantly advanced logical inquiry through his dialectical method.",
      politics:
        "Plato's political philosophy, most famously articulated in the *Republic*, proposes an ideal state (Kallipolis) ruled by philosopher-kings.",
      metaphysics:
        "Plato's metaphysics is dominated by his Theory of Forms (or Ideas). He posited a dualistic reality: the sensible world of appearances and an intelligible world of eternal, unchanging Forms.",
    },
    tags: ["Classical Greek", "Platonism", "Theory of Forms", "Idealism", "Dualism", "Philosopher-King", "Academy"],
    influences: ["socrates", "pythagoras", "heraclitus", "parmenides"],
  },
  {
    id: "aristotle",
    name: "Aristotle",
    era: "Ancient",
    birth: -384,
    death: -322,
    domainSummaries: {
      ethics:
        "Aristotle's ethics, primarily in the *Nicomachean Ethics*, focuses on eudaimonia (flourishing or living well) as the highest human good.",
      aesthetics:
        "Aristotle's aesthetic theory, mainly in his *Poetics*, views art, particularly tragedy, as a form of mimesis (imitation) that is natural and pleasurable to humans.",
      logic:
        "Aristotle is considered the father of formal logic. His collection of logical works, known as the *Organon*, laid the foundation for Western logic.",
      politics:
        "In his *Politics*, Aristotle famously states that 'man is by nature a political animal (zōon politikon),' meaning humans naturally thrive in a polis.",
      metaphysics: "Aristotle's *Metaphysics* investigates 'being qua being'—the fundamental principles of reality.",
    },
    tags: [
      "Classical Greek",
      "Aristotelianism",
      "Empiricism",
      "Logic",
      "Syllogism",
      "Hylomorphism",
      "Teleology",
      "Virtue Ethics",
      "Golden Mean",
      "Lyceum",
    ],
    influences: ["plato", "socrates"],
  },
]
