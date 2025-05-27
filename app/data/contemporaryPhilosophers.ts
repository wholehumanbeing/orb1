import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Contemporary era (c. 1900 – Present).
 * Ordered chronologically by approximate birth year.
 */
export const contemporaryPhilosophers: PhilosopherData[] = [
  {
    id: "ge_moore",
    name: "G. E. Moore (George Edward Moore)",
    era: "Contemporary",
    birth: 1873,
    death: 1958,
    domainSummaries: {
      ethics:
        "In *Principia Ethica*, Moore argued against defining 'good' in terms of natural properties (the 'naturalistic fallacy'), asserting 'good' is a simple, indefinable, non-natural property known through intuition. He advocated a form of ideal utilitarianism, where right actions are those that produce the most good, with goods including things like friendship and aesthetic appreciation. His ethical intuitionism and critique of ethical naturalism profoundly influenced 20th-century ethics.",
      aesthetics:
        "Moore valued aesthetic appreciation as one of the intrinsic goods, alongside personal affection. He believed that the contemplation of beautiful objects is valuable in itself. While he didn't develop a detailed aesthetic theory, his ethical framework placed high importance on the experience of beauty as a core component of a good life. The value of beauty, like 'good,' would be grasped intuitively.",
      logic:
        "Moore, along with Bertrand Russell, led the revolt against British idealism. His logical contributions are mainly in epistemology and ethics, emphasizing clarity and careful analysis of propositions. He famously defended common sense, arguing for the certainty of ordinary beliefs (e.g., 'Here is one hand') against skepticism. His method involved meticulous linguistic analysis to clarify philosophical problems, a hallmark of early analytic philosophy.",
      politics:
        "Moore did not focus extensively on political philosophy. His ethical framework, emphasizing intrinsic goods like friendship and aesthetic enjoyment, could imply a society that fosters these values. His defense of common sense and clarity might translate to a preference for transparent and rationally justifiable political institutions. However, his primary contributions lay in metaethics and epistemology.",
      metaphysics:
        "Moore's 'Defence of Common Sense' and 'Proof of an External World' were significant contributions to metaphysics and epistemology, arguing against idealism and skepticism. He asserted the reality of the external world and the mind-independent existence of objects based on common-sense beliefs. His approach favored a realist ontology, accepting the existence of physical objects, other minds, and time, as understood in ordinary experience.",
    },
    tags: ["Analytic Philosophy", "Ethical Intuitionism", "Naturalistic Fallacy", "Common Sense Philosophy", "Realism"],
    influences: ["immanuel_kant", "f_h_bradley"], // Reacted against Bradley's idealism. Influenced by Kant.
  },
  // ... more philosophers (truncated for brevity)
]
