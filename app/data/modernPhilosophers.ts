import type { PhilosopherData } from "../types/philosopher"

/**
 * Data for major philosophers of the Modern era (c. 1400 – 1900 CE).
 * Ordered chronologically by approximate birth year.
 */
export const modernPhilosophers: PhilosopherData[] = [
  {
    id: "niccolo_machiavelli",
    name: "Niccolò Machiavelli",
    era: "Modern", // Renaissance
    birth: 1469,
    death: 1527,
    domainSummaries: {
      ethics:
        "Machiavelli's ethics, primarily in *The Prince* and *Discourses on Livy*, depart radically from classical and Christian virtue ethics. He prioritizes political expediency and the stability of the state over traditional moral virtues if they conflict. For a ruler, it may be necessary to act cruelly, deceptively, or immorally to maintain power and order ('the ends justify the means,' though he never used this exact phrase). He distinguishes between public and private morality, suggesting rulers are judged by different standards. Virtù (skill, strength, cunning) for Machiavelli is the quality needed to navigate fortune and secure the state.",
      aesthetics:
        "Machiavelli was a skilled writer and playwright (e.g., *La Mandragola*), demonstrating an appreciation for literary art and its power to reflect and comment on human nature. His historical analyses in *The Prince* and *Discourses* are presented with rhetorical force and clarity. While he didn't develop a formal aesthetic theory, his focus on realism and effective communication suggests an aesthetic that values verisimilitude and pragmatic impact. The 'art' he most prized was the art of statecraft.",
      logic:
        "Machiavelli's approach was empirical and historical, drawing conclusions from observed political behavior and historical examples rather than abstract logical deduction or divine principles. His 'logic' is one of practical reasoning: analyzing cause and effect in political affairs to derive general rules for effective governance. He emphasized understanding 'effectual truth' – how things are, not how they ought to be. This pragmatic, evidence-based approach to political analysis was a departure from the more idealistic or theological reasoning of earlier eras.",
      politics:
        "Machiavelli is a foundational figure in modern political science. In *The Prince*, he provides a pragmatic guide for rulers on acquiring and maintaining political power, famously advising that it is better to be feared than loved if one cannot be both. He advocates for a strong, unified state, republicanism (as seen in *Discourses on Livy*), and the importance of a citizen militia. His political thought is secular, focusing on human agency, power dynamics, and the mechanics of governance, often detached from traditional moral or religious considerations.",
      metaphysics:
        "Machiavelli's work is largely devoid of metaphysical speculation. His focus is almost exclusively on the practical realities of human behavior and political life. He operates within a naturalistic framework, where events are shaped by human virtù (prowess, skill) and fortuna (fortune, chance), rather than divine providence or transcendent principles. This secular and empirical approach to understanding the world marks a significant shift towards modern political thought, largely unconcerned with traditional metaphysical questions about ultimate reality or divine order.",
    },
    tags: ["Renaissance Humanism", "Political Realism", "Virtù", "Fortuna", "Statecraft", "Secularism"],
    influences: ["polybius", "livy", "cicero"], // Classical historians and political thinkers.
  },
  // ... more philosophers (truncated for brevity)
]
