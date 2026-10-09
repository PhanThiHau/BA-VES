import type { Requirement, Stakeholder } from "../types/models";

export const stakeholders: Stakeholder[] = [
  { id: "sponsor", name: "Tran Quoc Minh", role: "Project Sponsor", initials: "TM", color: "#DBEAFE", status: "interviewed", focus: "ROI and MVP scope" },
  { id: "supply", name: "Nguyen Ha Anh", role: "Supply Chain Director", initials: "HA", color: "#E0E7FF", status: "interviewed", focus: "Stockouts and inventory balancing" },
  { id: "warehouse", name: "Le Thanh Lan", role: "Warehouse Manager", initials: "LL", color: "#DDF4EE", status: "available", focus: "Picking, barcode, and returns" },
  { id: "planner", name: "Pham Duc Long", role: "Inventory Planner", initials: "DL", color: "#FEF3C7", status: "available", focus: "Forecasting and replenishment" },
  { id: "operator", name: "Vu Minh Khoa", role: "Warehouse Operator", initials: "MK", color: "#FCE7F3", status: "available", focus: "Scanning and offline operations" },
  { id: "finance", name: "Hoang Thu Trang", role: "Finance Manager", initials: "TT", color: "#F3E8FF", status: "available", focus: "Valuation and audit trail" },
];

export const requirements: Requirement[] = [
  { id: "BR-01", title: "Reduce stockouts below 5%", type: "Business", priority: "Must", status: "Validated", source: "Project Sponsor" },
  { id: "SR-04", title: "Prioritize warehouse transfer before creating a PO", type: "Stakeholder", priority: "Must", status: "Validated", source: "Supply Chain Director" },
  { id: "FR-08", title: "Generate min-max replenishment suggestions", type: "Solution", priority: "Must", status: "Draft", source: "Inventory Planner" },
  { id: "NFR-03", title: "Keep barcode operations available during network loss", type: "Solution", priority: "Should", status: "Draft", source: "Warehouse Operator" },
  { id: "TR-02", title: "Reconcile inventory before go-live", type: "Transition", priority: "Should", status: "Changed", source: "Finance Manager" },
];

export const babokScores = [
  { name: "Planning & Monitoring", short: "BAPM", score: 68 },
  { name: "Elicitation & Collaboration", short: "EC", score: 76 },
  { name: "Requirements Life Cycle", short: "RLCM", score: 62 },
  { name: "Strategy Analysis", short: "SA", score: 58 },
  { name: "Requirements Analysis", short: "RADD", score: 71 },
  { name: "Solution Evaluation", short: "SE", score: 54 },
];
