export const ARCHETYPES = [
  {
    key: "course_creator",
    name: "Course Creator",
    priority: "Trust → Conversion → Loyalty",
    desc: "You build knowledge empires. Every post is a lesson. Every lesson is leverage.",
  },
  {
    key: "product_brand",
    name: "Product Brand",
    priority: "Reach → Conversion → Velocity",
    desc: "You stack product. Volume is your moat. Scale or irrelevance.",
  },
  {
    key: "service_provider",
    name: "Service Provider",
    priority: "Trust → Loyalty → Revenue Efficiency",
    desc: "You build client relationships. Reputation compounds. Word of mouth is your engine.",
  },
  {
    key: "content_monetizer",
    name: "Content Monetizer",
    priority: "Reach → Velocity → Loyalty",
    desc: "You monetize attention. Algorithm is your battlefield. Consistency is your weapon.",
  },
  {
    key: "community_builder",
    name: "Community Builder",
    priority: "Loyalty → Trust → Reach",
    desc: "You own the room. Community is your castle. Belonging is the product.",
  },
] as const;

export type ArchetypeKey = (typeof ARCHETYPES)[number]["key"];
