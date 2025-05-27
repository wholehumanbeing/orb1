import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Modern era (c. 1400 – 1900 CE).
 * Ordered chronologically by approximate birth year.
 */
export const modernPhilosophers: PhilosopherData[] = [
  {
    id: "rene_descartes",
    name: "René Descartes",
    era: "Modern",
    birth: 1596,
    death: 1650,
    domainSummaries: {
      ethics:
        "Descartes did not produce a systematic ethical treatise comparable to his metaphysics, but outlined a provisional morality.",
      aesthetics:
        "Descartes wrote little on aesthetics. His rationalist philosophy might imply an aesthetic preference for order and proportion.",
      logic:
        "Descartes is a foundational figure of modern rationalism. His method emphasizes deductive reasoning from self-evident first principles.",
      politics:
        "Descartes did not develop a detailed political philosophy. His focus was on establishing certainty in metaphysics and science.",
      metaphysics:
        "Descartes is famous for his substance dualism: reality consists of two distinct types of substances – mind and matter.",
    },
    tags: ["Rationalism", "Dualism", "Cogito Ergo Sum", "Foundationalism", "Methodological Doubt", "Mind-Body Problem"],
    influences: ["augustine", "anselm", "plato", "aristotle", "scholasticism"],
  },
  {
    id: "immanuel_kant",
    name: "Immanuel Kant",
    era: "Modern",
    birth: 1724,
    death: 1804,
    domainSummaries: {
      ethics:
        "Kant revolutionized ethics with his deontological approach. He introduced the Categorical Imperative, a universal moral law derived from reason.",
      aesthetics:
        "In the *Critique of Judgment*, Kant explores aesthetics and teleology. He defines beauty as arising from a disinterested pleasure.",
      logic:
        "Kant's contribution to logic is mostly in epistemology: he famously synthesized Rationalism and Empiricism.",
      politics: "Kant's political philosophy argues for republican government and international cooperation.",
      metaphysics:
        "Kant's metaphysics is a 'Copernican revolution': instead of knowledge conforming to objects, objects conform to our ways of knowing.",
    },
    tags: [
      "Transcendental Idealism",
      "Categorical Imperative",
      "Deontology",
      "Epistemology",
      "Enlightenment",
      "Critique of Pure Reason",
      "Phenomena-Noumena",
    ],
    influences: ["david_hume", "jean_jacques_rousseau", "gottfried_leibniz", "christian_wolff", "isaac_newton"],
  },
]
