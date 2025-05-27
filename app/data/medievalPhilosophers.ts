import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Medieval era (c. 500 – 1400 CE).
 * Ordered chronologically by approximate birth year.
 */
export const medievalPhilosophers: PhilosopherData[] = [
  {
    id: "boethius",
    name: "Anicius Manlius Severinus Boethius",
    era: "Medieval",
    birth: "c. 477", // c. 477 CE
    death: "c. 524", // c. 524 CE
    domainSummaries: {
      ethics:
        "Boethius's *Consolation of Philosophy*, written while imprisoned, explores themes of fortune, happiness, and divine providence. True happiness, he argues, is not found in worldly goods or fortune, which are fickle, but in God, who is the supreme good. He blends Stoic acceptance of fate with Neoplatonic ideas of ascent towards the good. Ethical conduct involves cultivating virtue and wisdom to understand one's true nature and ultimate end, finding inner peace despite external suffering. The work emphasizes reason's power to overcome adversity and discern eternal truths.",
      aesthetics:
        "While Boethius did not develop a specific aesthetic theory, his *De Institutione Musica* was a foundational text on music theory throughout the Middle Ages. He discussed the mathematical proportions underlying musical harmony (Pythagorean influence), classifying music into *musica mundana* (harmony of the spheres), *musica humana* (harmony of body and soul), and *musica instrumentalis* (audible music). This suggests an aesthetic appreciation for order, proportion, and the reflection of cosmic harmony in art, aligning with classical and Neoplatonic ideals of beauty as rational and structural.",
      logic:
        "Boethius played a crucial role in transmitting Aristotelian logic to the Latin West. He translated Aristotle's *Categories* and *On Interpretation* and wrote commentaries on them, as well as on Porphyry's *Isagoge*. His works on topical reasoning, categorical syllogisms, and hypothetical syllogisms became standard textbooks for centuries, forming the basis of the *logica vetus* (old logic). His aim was to make the entirety of Plato and Aristotle available in Latin, preserving logical tools essential for philosophical and theological inquiry in the early Middle Ages.",
      politics:
        "Boethius was a Roman senator and magister officiorum under Theodoric the Great. His political philosophy, implicitly in *Consolation*, critiques tyranny and unjust rule, lamenting the corruption that led to his downfall. He valued justice, wisdom in governance, and the pursuit of the common good, reflecting classical Roman ideals. His personal tragedy underscores the precariousness of serving in a volatile political climate and the philosopher's duty to maintain integrity even in the face of political persecution. His work implicitly defends a state governed by reason and virtue.",
      metaphysics:
        "In *Consolation of Philosophy* and his theological tractates, Boethius grapples with metaphysical questions like divine foreknowledge and free will, the nature of eternity, and the problem of evil. He argues that God's eternal present (seeing all time at once) is compatible with human free will. God is the ultimate source of being and goodness. He also engaged with the problem of universals, leaning towards an Aristotelian understanding where universals exist in particular things, though his precise stance influenced later debates. His work blends Platonic, Aristotelian, and Stoic metaphysics within a Christian framework.",
    },
    tags: [
      "Early Medieval",
      "Neoplatonism",
      "Stoicism",
      "Consolation of Philosophy",
      "Logica Vetus",
      "Problem of Evil",
      "Free Will",
    ],
    influences: ["plato", "aristotle", "cicero", "plotinus", "porphyry"],
  },
  // ... more philosophers (truncated for brevity)
]
