import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Medieval era (c. 500 – 1400 CE).
 * Ordered chronologically by approximate birth year.
 */
export const medievalPhilosophers: PhilosopherData[] = [
  {
    id: "augustine",
    name: "Augustine of Hippo",
    era: "Medieval",
    birth: 354,
    death: 430,
    domainSummaries: {
      ethics:
        "Augustine's ethics are deeply rooted in Christian theology, emphasizing love (caritas) for God as the supreme good and the foundation of all virtue.",
      aesthetics:
        "Augustine's aesthetics, influenced by Neoplatonism and Christian doctrine, found beauty in order, unity, and proportion, reflecting God's creation.",
      logic:
        "Augustine was well-versed in classical rhetoric and logic, which he initially pursued for worldly success.",
      politics:
        "Augustine's political philosophy, most famously articulated in *City of God*, distinguishes between the 'City of God' and the 'Earthly City'.",
      metaphysics:
        "Augustine's metaphysics integrates Christian doctrine with Neoplatonic thought. God is the supreme, immutable, and transcendent Being.",
    },
    tags: [
      "Christian Philosophy",
      "Neoplatonism",
      "Theology",
      "Original Sin",
      "Free Will",
      "Grace",
      "City of God",
      "Divine Illumination",
    ],
    influences: ["plato", "plotinus", "cicero", "ambrose-of-milan", "manichaeism"],
  },
  {
    id: "thomas-aquinas",
    name: "Thomas Aquinas",
    era: "Medieval",
    birth: 1225,
    death: 1274,
    domainSummaries: {
      ethics:
        "Aquinas developed a comprehensive ethical theory grounded in natural law. He argued that humans have an innate orientation to the good as part of God's design.",
      aesthetics:
        "In the context of theology, Aquinas defined beauty as that which pleases upon being seen (*id quod visum placet*).",
      logic:
        "Aquinas inherited the logical tradition of Aristotle. In the Scholastic method, he would pose questions and use rigorous dialectical reasoning.",
      politics:
        "Aquinas's political philosophy integrates Aristotelian politics with Christian doctrine. He viewed government as natural and necessary for the common good.",
      metaphysics:
        "Central to Aquinas's metaphysics is the synthesis of Aristotelian philosophy with Christian theology.",
    },
    tags: [
      "Scholasticism",
      "Thomism",
      "Natural Law",
      "Aristotelianism",
      "Faith-Reason Harmony",
      "Five Ways",
      "Angelic Doctor",
    ],
    influences: [
      "aristotle",
      "augustine",
      "boethius",
      "pseudo-dionysius",
      "averroes",
      "avicenna",
      "maimonides",
      "albertus-magnus",
    ],
  },
]
