import { Company, PipelineItem } from "@/lib/types";

export const rightsHolders = [
  "F1",
  "EPL",
  "ATP/WTA",
  "NBA",
  "NFL",
  "MLB",
  "NHL"
];

export const companies: Company[] = [
  {
    id: "aurora-mobility",
    name: "Aurora Mobility",
    domain: "auroramobility.com",
    hq: "San Francisco, USA",
    region: "North America",
    industry: "Automotive",
    description:
      "Premium EV manufacturer expanding into APAC with heavy brand investment and motorsport-friendly positioning.",
    score: 84,
    rightsFit: ["F1", "EPL", "NBA"],
    rationale: [
      "Series D funding indicates budget capacity for premium partnerships.",
      "APAC expansion aligns with global rights holders and live events.",
      "New CMO with sponsorship track record suggests near-term activation."
    ],
    marketingObjectives: [
      "Increase global brand awareness",
      "Build premium performance positioning",
      "Associate with innovation-led audiences"
    ],
    businessObjectives: [
      "Accelerate APAC market entry",
      "Drive direct-to-consumer adoption",
      "Support dealership growth"
    ],
    rightsholderRationale: [
      { holder: "F1", reason: "Global reach and premium tech alignment." },
      { holder: "EPL", reason: "Mass-market visibility in new regions." },
      { holder: "NBA", reason: "US growth plus global fan base." }
    ],
    signals: [
      {
        id: "am-s1",
        type: "Funding",
        score: 18,
        weight: 1.2,
        occurredAt: "2025-11-12",
        evidence: "Announced $350M Series D to scale manufacturing.",
        url: "press"
      },
      {
        id: "am-s2",
        type: "Geo Expansion",
        score: 16,
        weight: 1,
        occurredAt: "2025-12-05",
        evidence: "Opened Singapore HQ and APAC distribution hub.",
        url: "press"
      },
      {
        id: "am-s3",
        type: "CMO Hire",
        score: 20,
        weight: 1.3,
        occurredAt: "2026-01-20",
        evidence: "Hired CMO formerly leading global sports sponsorships.",
        url: "press"
      },
      {
        id: "am-s4",
        type: "Brand Campaign",
        score: 14,
        weight: 1,
        occurredAt: "2026-01-05",
        evidence: "Launched global 'Charge the Future' campaign.",
        url: "press"
      }
    ],
    sponsorships: [
      {
        id: "am-sp1",
        rightsHolder: "Formula E",
        sport: "Motorsport",
        league: "Formula E",
        region: "Global",
        status: "Active",
        source: "press",
        startDate: "2024-03-01"
      }
    ]
  },
  {
    id: "pulsepay",
    name: "PulsePay",
    domain: "pulsepay.com",
    hq: "London, UK",
    region: "Europe",
    industry: "Fintech",
    description:
      "Fast-growing payments platform targeting consumer adoption via lifestyle partnerships.",
    score: 78,
    rightsFit: ["EPL", "NBA"],
    rationale: [
      "Large Series C round supports brand investment.",
      "New CMO with EPL sponsorship experience.",
      "US market entry signals consumer brand push."
    ],
    marketingObjectives: [
      "Drive consumer adoption",
      "Increase payment brand trust",
      "Expand lifestyle relevance"
    ],
    businessObjectives: [
      "Grow US transaction volume",
      "Increase card usage frequency",
      "Expand merchant partnerships"
    ],
    rightsholderRationale: [
      { holder: "EPL", reason: "High visibility for European consumers." },
      { holder: "NBA", reason: "Strong US growth and global fans." }
    ],
    signals: [
      {
        id: "pp-s1",
        type: "Funding",
        score: 16,
        weight: 1.1,
        occurredAt: "2025-10-08",
        evidence: "Raised $220M Series C led by global growth fund.",
        url: "press"
      },
      {
        id: "pp-s2",
        type: "CMO Hire",
        score: 17,
        weight: 1.2,
        occurredAt: "2025-12-14",
        evidence: "Appointed CMO with prior EPL club sponsorship experience.",
        url: "press"
      },
      {
        id: "pp-s3",
        type: "Geo Expansion",
        score: 14,
        weight: 1,
        occurredAt: "2026-01-18",
        evidence: "Entered US market with high-profile consumer push.",
        url: "press"
      }
    ],
    sponsorships: []
  },
  {
    id: "nova-hydration",
    name: "NOVA Hydration",
    domain: "novahydration.com",
    hq: "Los Angeles, USA",
    region: "North America",
    industry: "Beverage",
    description:
      "Performance drink brand targeting endurance audiences and global sports visibility.",
    score: 88,
    rightsFit: ["F1", "EPL", "ATP/WTA"],
    rationale: [
      "Brand campaign centered on athlete-led performance.",
      "International expansion into LATAM and Middle East.",
      "Activation history in endurance events."
    ],
    marketingObjectives: [
      "Associate with elite performance",
      "Grow global distribution",
      "Increase athlete-led credibility"
    ],
    businessObjectives: [
      "Scale international sales channels",
      "Increase repeat purchases",
      "Drive retail partner expansion"
    ],
    rightsholderRationale: [
      { holder: "F1", reason: "High-performance brand alignment." },
      { holder: "EPL", reason: "Massive global fan base reach." },
      { holder: "ATP/WTA", reason: "Endurance and wellness audience fit." }
    ],
    signals: [
      {
        id: "nh-s1",
        type: "Brand Campaign",
        score: 18,
        weight: 1.2,
        occurredAt: "2025-12-02",
        evidence: "Introduced athlete-led 'Fuel the Distance' campaign.",
        url: "press"
      },
      {
        id: "nh-s2",
        type: "Geo Expansion",
        score: 15,
        weight: 1,
        occurredAt: "2025-11-10",
        evidence: "Expanded distribution into LATAM and Middle East.",
        url: "press"
      }
    ],
    sponsorships: [
      {
        id: "nh-sp1",
        rightsHolder: "WTA 250",
        sport: "Tennis",
        league: "WTA",
        region: "Europe",
        status: "Active",
        source: "press",
        startDate: "2025-06-01"
      }
    ]
  }
];

export const pipelineSeed: PipelineItem[] = [
  {
    companyId: "aurora-mobility",
    stage: "Target",
    notes: "Auto brand moving into APAC. Warm intro via partner.",
    updatedAt: "2026-02-01"
  }
];
