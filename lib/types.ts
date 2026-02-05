export type SignalType =
  | "Funding"
  | "Geo Expansion"
  | "CMO Hire"
  | "Brand Campaign"
  | "Partnership"
  | "Event Marketing"
  | "Sports Adjacent"
  | "Media Rights";

export type Signal = {
  id: string;
  type: SignalType;
  score: number;
  weight: number;
  occurredAt: string;
  evidence: string;
  url: string;
};

export type Sponsorship = {
  id: string;
  rightsHolder: string;
  sport: string;
  league: string;
  region: string;
  status: "Active" | "Past" | "Rumored";
  source: string;
  startDate?: string;
  endDate?: string;
};

export type Company = {
  id: string;
  name: string;
  domain: string;
  hq: string;
  region: string;
  industry: string;
  description: string;
  score: number;
  rightsFit: string[];
  signals: Signal[];
  sponsorships: Sponsorship[];
  rationale?: string[];
  marketingObjectives?: string[];
  businessObjectives?: string[];
  rightsholderRationale?: { holder: string; reason: string }[];
};


export type ScoreTier = "High" | "Medium" | "Low";

export type PipelineStage = "Target" | "Contacted" | "Outcome";

export type PipelineItem = {
  companyId: string;
  stage: PipelineStage;
  notes: string;
  updatedAt: string;
};
