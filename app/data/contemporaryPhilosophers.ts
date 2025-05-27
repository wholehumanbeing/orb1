import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Contemporary era (c. 1900 – Present).
 * Ordered chronologically by approximate birth year.
 */
export const contemporaryPhilosophers: PhilosopherData[] = [
  {
    id: "bertrand_russell",
    name: "Bertrand Russell",
    era: "Contemporary",
    birth: 1872,
    death: 1970,
    domainSummaries: {
      ethics:
        "Russell's ethical views evolved but generally leaned towards a form of utilitarianism or consequentialism.",
      aesthetics:
        "Russell did not dedicate major works to aesthetics, but he valued clarity, precision, and logical structure.",
      logic:
        "Russell was a towering figure in modern logic. With A.N. Whitehead, he co-authored *Principia Mathematica*.",
      politics:
        "Russell was a prominent political activist and theorist. He advocated for democratic socialism and world government.",
      metaphysics:
        "Russell's early metaphysics was influenced by Platonism, but he later moved towards logical atomism.",
    },
    tags: [
      "Analytic Philosophy",
      "Logicism",
      "Principia Mathematica",
      "Theory of Descriptions",
      "Logical Atomism",
      "Pacifism",
      "Social Activism",
    ],
    influences: ["g_e_moore", "gottlob_frege", "ludwig_wittgenstein", "john_stuart_mill", "plato"],
  },
  {
    id: "ludwig_wittgenstein",
    name: "Ludwig Wittgenstein",
    era: "Contemporary",
    birth: 1889,
    death: 1951,
    domainSummaries: {
      ethics:
        "Wittgenstein wrote little directly on ethics, but his views are profound. In the *Tractatus*, ethics is transcendental and inexpressible.",
      aesthetics:
        "Wittgenstein's remarks on aesthetics are scattered but suggestive. He linked aesthetic judgment to understanding rules within a 'language-game'.",
      logic: "Wittgenstein's early work, *Tractatus Logico-Philosophicus*, proposed a 'picture theory of meaning'.",
      politics:
        "Wittgenstein did not develop a political philosophy. His focus was on language, logic, and the nature of understanding.",
      metaphysics: "In the *Tractatus*, Wittgenstein aimed to delineate the limits of what can be meaningfully said.",
    },
    tags: [
      "Analytic Philosophy",
      "Logical Atomism",
      "Picture Theory of Meaning",
      "Language-Games",
      "Meaning as Use",
      "Philosophy of Language",
      "Tractatus Logico-Philosophicus",
    ],
    influences: ["bertrand_russell", "gottlob_frege", "arthur_schopenhauer", "soren_kierkegaard"],
  },
]
