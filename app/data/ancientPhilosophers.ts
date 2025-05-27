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
    birth: "c. -624", // c. 624 BCE
    death: "c. -546", // c. 546 BCE
    domainSummaries: {
      ethics:
        'Direct ethical doctrines from Thales are scarce, primarily transmitted through anecdotes and maxims like "Know thyself" and "Nothing in excess" (though attribution varies). These sayings emphasize self-awareness and moderation, foundational concepts in Greek ethics. His practical wisdom is highlighted in stories portraying his shrewdness in business and engineering. While not a systematic ethicist, Thales\'s revolutionary shift towards rational inquiry for understanding the cosmos implicitly supports an ethics grounded in reason and knowledge of the natural world, rather than reliance on divine caprice or unexamined tradition, suggesting an early framework for moral conduct tied to understanding reality.',
      aesthetics:
        "No specific aesthetic theory is attributed to Thales, as his primary philosophical contributions lay in natural philosophy and cosmology. Any aesthetic appreciation would likely have been implicit, derived from the perceived order, beauty, and intelligibility of the cosmos he sought to explain through rational principles. His endeavor to find a single underlying substance (water) for all phenomena reflects a search for unity and simplicity, qualities often associated with aesthetic value. This nascent appreciation for cosmic harmony and the beauty inherent in natural processes can be seen as a precursor to more developed Greek aesthetic thought, which often linked beauty with order and proportion.",
      logic:
        "Thales is credited with introducing deductive reasoning to geometry, famously proving several theorems, including what is now known as Thales' Theorem. This marked a significant step towards formal logical demonstration, moving beyond empirical observation to abstract proof. While not a developed system of logic like Aristotle's, his application of reason to establish universal geometric truths laid crucial groundwork for future logical and mathematical advancements. His method of inquiry, seeking singular, natural explanations for diverse phenomena (e.g., earthquakes, magnetism), also represents a foundational step in rational thought and the scientific method, prizing consistency and empirical grounding in explanation.",
      politics:
        "Thales's political contributions are known more through historical accounts of his counsel than systematic theory. Herodotus reports that Thales advised the Ionian city-states to form a political federation with a central council in Teos to better resist Lydian and later Persian power. He also supposedly dissuaded Miletus from allying with Croesus of Lydia against Cyrus of Persia, a move that proved wise. These anecdotes depict him as a pragmatic and far-sighted statesman, concerned with the collective security and autonomy of the Greek communities in Asia Minor, applying his wisdom to practical matters of governance and inter-state relations.",
      metaphysics:
        'Thales is renowned for his metaphysical claim that the fundamental principle or substance (archē) of all things is water. This assertion was revolutionary, as it sought a natural, unifying explanation for the diversity and complexity of the cosmos, moving away from purely mythological accounts of creation and existence. He observed water\'s capacity to exist in different states (solid, liquid, gas) and its necessity for life, leading him to this conclusion. Furthermore, Thales is reported to have believed that "all things are full of gods" and that magnets possess a soul (psychē) because they can move iron, suggesting a form of hylozoism or panpsychism where matter itself is endowed with life or inherent motive force.',
    },
    tags: ["Pre-Socratic", "Milesian School", "Monism", "Naturalism", "Water Arche", "Rationalism"],
    influences: [], // Traditionally considered the first Western philosopher
  },
  // ... more philosophers (truncated for brevity)
]
