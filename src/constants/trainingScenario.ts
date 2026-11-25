import type { ChatMessage, ConfirmationItem, ConflictItem, EvidenceItem, FindingItem, RiskItem } from "../types/models";

export const scenarioObjectives = [
  { label: "Stockout", baseline: "12%", target: "< 5%", owner: "Supply Chain Director" },
  { label: "Fill rate", baseline: "89%", target: ">= 96%", owner: "Supply Chain Director" },
  { label: "Inventory accuracy", baseline: "91%", target: ">= 98%", owner: "Warehouse Manager" },
  { label: "Holding cost", baseline: "100%", target: "Increase no more than 8%", owner: "Finance Manager" },
];

export const initialInterviewMessages: ChatMessage[] = [
  { id: 101, stakeholderId: "warehouse", sender: "learner", text: "Lan, I would like to understand how an order moves through the warehouse. From the moment a store submits demand until goods reach the dispatch staging area, what steps does your team perform?", time: "09:12", technique: "Open-ended question" },
  { id: 102, stakeholderId: "warehouse", sender: "agent", text: "Sure. POS orders do not reach us one by one; they are grouped into three waves at 8:00, 13:00, and 17:00. For each wave, the WMS creates a pick list. Operators pick and scan each item before moving it to staging. Customer returns are kept in quarantine until inspection, and their status is usually updated only at the end of the shift.", time: "09:14", evidence: true },
  { id: 103, stakeholderId: "warehouse", sender: "learner", text: "While returned goods remain in quarantine but have not been updated, could the inventory figure seen by the planning team be inaccurate?", time: "09:16", technique: "Root-cause probing" },
  { id: 104, stakeholderId: "warehouse", sender: "agent", text: "Yes, that is a common issue. The screen may show stock on hand even though those units are awaiting quality inspection and may not be saleable. Planning can promise them to a store, and the shortage is discovered only when the warehouse starts picking.", time: "09:17", evidence: true },
  { id: 105, stakeholderId: "warehouse", sender: "learner", text: "So stockouts are not caused only by weak forecasting. Delayed return-status updates also make available inventory appear higher than it physically is. Is that understanding correct?", time: "09:19", technique: "Playback and confirmation" },
  { id: 106, stakeholderId: "warehouse", sender: "agent", text: "Correct. Another issue is that Zone B often loses Wi-Fi. Operators write quantities on paper and scan them later. If another person already rescanned the transaction, the same movement can be recorded twice.", time: "09:20", evidence: true },

  { id: 201, stakeholderId: "planner", sender: "learner", text: "Long, what information do you use each morning to decide whether to transfer stock from another warehouse or purchase more?", time: "09:34", technique: "Decision analysis" },
  { id: 202, stakeholderId: "planner", sender: "agent", text: "The process is still highly manual. I export inventory and an eight-week forecast to Excel, then calculate projected stock. If a SKU falls below its minimum, I check every warehouse for surplus. I request a purchase only when the network has no suitable stock.", time: "09:36", evidence: true },
  { id: 203, stakeholderId: "planner", sender: "learner", text: "Is transfer-before-purchase an official company policy, or is it an informal practice agreed within the team?", time: "09:38", technique: "Business-rule clarification" },
  { id: 204, stakeholderId: "planner", sender: "agent", text: "It is only a verbal agreement with the Supply Chain Director. There is no written policy or system rule. Promotions make this difficult because min-max values are not updated in time, so each planner relies on personal experience.", time: "09:39", evidence: true },

  { id: 301, stakeholderId: "finance", sender: "learner", text: "Trang, when the warehouse reports an inventory adjustment, what information must Finance retain so the transaction can be audited later?", time: "10:02", technique: "Business-rule elicitation" },
  { id: 302, stakeholderId: "finance", sender: "agent", text: "At minimum, we need the creator, approver, timestamp, reason, before-and-after quantity or value, and supporting evidence where applicable. Adjustments above VND 50 million require independent approval, and creators cannot approve their own transactions.", time: "10:04", evidence: true },
  { id: 303, stakeholderId: "finance", sender: "learner", text: "I understand the control objective. However, waiting for Finance on every small amount could stop warehouse operations. Could we use value thresholds so low-risk transactions move faster?", time: "10:06", technique: "Option negotiation" },
  { id: 304, stakeholderId: "finance", sender: "agent", text: "Yes. Below VND 10 million, the system may auto-approve if a reason code is mandatory. From 10 to 50 million, the Warehouse Manager approves. Above 50 million still goes to the Finance Controller. That preserves control without delaying every transaction.", time: "10:08", evidence: true },

  { id: 401, stakeholderId: "supply", sender: "learner", text: "Ha, after a three-month pilot, which measures will tell you that the solution is successful?", time: "10:25", technique: "KPI elicitation" },
  { id: 402, stakeholderId: "supply", sender: "agent", text: "We will pilot in three southern warehouses. Stockouts must fall from 12% to below 5%, and fill rate must reach at least 96%. We cannot achieve that by overstocking; holding cost may increase by no more than 8%.", time: "10:27", evidence: true },
  { id: 403, stakeholderId: "supply", sender: "learner", text: "My understanding is that replenishment must check network surplus and prioritize transfers, recommending a purchase only when the network cannot supply the demand. Is that mandatory for the MVP?", time: "10:29", technique: "Scope confirmation" },
  { id: 404, stakeholderId: "supply", sender: "agent", text: "That is the right direction, but the system must not select transfers rigidly. The planner needs transfer cost and expected arrival date. If a transfer is both more expensive and slower than purchasing, the planner may choose another option and record the reason.", time: "10:31", evidence: true },

  { id: 501, stakeholderId: "operator", sender: "learner", text: "Khoa, what do you do if the scanner loses its connection while you are picking? Have you seen data become inaccurate after the connection returns?", time: "10:46", technique: "Contextual question" },
  { id: 502, stakeholderId: "operator", sender: "agent", text: "We write item codes and quantities on paper, then scan them later. The problem is that the scanner does not show which transactions are pending. A colleague may scan the same movement, and when the connection returns both transactions are processed.", time: "10:48", evidence: true },

  { id: 601, stakeholderId: "sponsor", sender: "learner", text: "Minh, to keep the project focused, could you confirm the constraints that the MVP must follow?", time: "11:02", technique: "Constraint clarification" },
  { id: 602, stakeholderId: "sponsor", sender: "agent", text: "There are four. Complete it within six months, keep the total budget below VND 4 billion, do not replace the current POS, and do not interrupt warehouse operations. Use the existing APIs for integration.", time: "11:04", evidence: true },
];

export const coachPrompts: Record<string, Array<{ type: "strength" | "gap" | "next"; text: string }>> = {
  warehouse: [
    { type: "strength", text: "You used playback to separate the stockout symptom from delayed status updates." },
    { type: "gap", text: "You have not clarified the return-processing SLA or ownership of quarantine status changes." },
    { type: "next", text: "Ask about damaged goods, missing documentation, and month-end count exceptions." },
  ],
  planner: [
    { type: "strength", text: "You identified a business rule that currently exists only as a verbal agreement." },
    { type: "gap", text: "You have not asked how min, max, safety stock, and promotion data are calculated." },
    { type: "next", text: "Ask the planner to walk through one SKU from forecast to transfer or PO decision." },
  ],
  finance: [
    { type: "strength", text: "You converted the speed-versus-control conflict into a value-threshold decision table." },
    { type: "gap", text: "You have not confirmed behavior when the accounting period is locked." },
    { type: "next", text: "Ask about reversals, segregation of duties, and audit-log retention." },
  ],
  supply: [
    { type: "strength", text: "The KPIs have clear baselines, targets, timing, and pilot scope." },
    { type: "gap", text: "You have not clarified priority when fill rate conflicts with holding cost." },
    { type: "next", text: "Confirm override authority and the information needed to make an override decision." },
  ],
  operator: [
    { type: "strength", text: "Your contextual question revealed the risk of duplicate offline transactions." },
    { type: "gap", text: "You have not captured device models, outage duration, or average offline transaction volume." },
    { type: "next", text: "Use observation to document each scan and resynchronization step." },
  ],
  sponsor: [
    { type: "strength", text: "You clearly identified time, budget, and technology constraints." },
    { type: "gap", text: "You have not asked about pilot stop criteria or who approves rollout expansion." },
    { type: "next", text: "Confirm out-of-scope items and decision authority for change requests." },
  ],
};

export const evidenceRegister: EvidenceItem[] = [
  { id: "EV-01", quote: "Returned goods update inventory only at the end of the shift.", source: "Interview 01 · 09:14", stakeholderId: "warehouse", category: "Process", confidence: "High", status: "confirmed", linkedRequirements: ["FR-RET-01"] },
  { id: "EV-02", quote: "The system treats some quarantined goods as saleable.", source: "Interview 01 · 09:17", stakeholderId: "warehouse", category: "Pain point", confidence: "High", status: "confirmed", linkedRequirements: ["BR-01", "FR-RET-01"] },
  { id: "EV-03", quote: "When projected stock falls below minimum, check other warehouses before purchasing.", source: "Interview 02 · 09:36", stakeholderId: "planner", category: "Business rule", confidence: "Medium", status: "confirmed", linkedRequirements: ["SR-04", "FR-08"] },
  { id: "EV-04", quote: "Transfer-first is a verbal agreement, not an approved policy.", source: "Interview 02 · 09:39", stakeholderId: "planner", category: "Business rule", confidence: "High", status: "confirmed", linkedRequirements: ["SR-04"] },
  { id: "EV-05", quote: "The audit trail must include creator, approver, timestamp, reason, and before-and-after values.", source: "Interview 03 · 10:04", stakeholderId: "finance", category: "Business rule", confidence: "High", status: "confirmed", linkedRequirements: ["NFR-AUD-01"] },
  { id: "EV-06", quote: "Amounts below VND 10 million may be auto-approved when a reason code is mandatory.", source: "Interview 03 · 10:08", stakeholderId: "finance", category: "Business rule", confidence: "High", status: "confirmed", linkedRequirements: ["BR-ADJ-02"] },
  { id: "EV-07", quote: "Stockouts below 5%, fill rate at least 96%, and holding-cost growth no more than 8%.", source: "Interview 04 · 10:27", stakeholderId: "supply", category: "KPI", confidence: "High", status: "confirmed", linkedRequirements: ["BR-01"] },
  { id: "EV-08", quote: "Offline scans can be recorded twice because pending transactions are not visible.", source: "Interview 05 · 10:48", stakeholderId: "operator", category: "Pain point", confidence: "High", status: "needs-clarification", linkedRequirements: ["NFR-03"] },
  { id: "EV-09", quote: "The MVP is limited to six months and VND 4 billion, cannot replace POS, and cannot interrupt warehouse operations.", source: "Interview 06 · 11:04", stakeholderId: "sponsor", category: "Constraint", confidence: "High", status: "confirmed", linkedRequirements: ["TR-02"] },
];

export const findings: FindingItem[] = [
  { id: "FND-01", title: "Stockouts are not caused by forecasting alone", interpretation: "Delayed POS data and end-of-shift quarantine updates make planners decide from inventory that does not reflect the physical state.", evidenceIds: ["EV-01", "EV-02", "EV-08"], status: "confirmed", owner: "Warehouse Manager" },
  { id: "FND-02", title: "Transfer-first is not governed as a business rule", interpretation: "The rule has business value but depends on individual experience, with no policy, cost threshold, or clear override authority.", evidenceIds: ["EV-03", "EV-04"], status: "confirmed", owner: "Supply Chain Director" },
  { id: "FND-03", title: "Adjustment controls can be risk-based", interpretation: "Value thresholds and mandatory reason codes can balance warehouse speed with segregation of duties.", evidenceIds: ["EV-05", "EV-06"], status: "confirmed", owner: "Finance Manager" },
  { id: "FND-04", title: "Offline barcode processing requires idempotency", interpretation: "Offline storage alone is insufficient; transactions need unique client IDs and a pending-sync view to prevent duplicates.", evidenceIds: ["EV-08"], status: "needs-clarification", owner: "Warehouse Operator" },
];

export const conflicts: ConflictItem[] = [
  { id: "CF-01", topic: "Inventory-adjustment processing speed", positions: [{ stakeholder: "Warehouse Manager", position: "The warehouse cannot wait for Finance on every adjustment during a shift." }, { stakeholder: "Finance Manager", position: "Creators must not approve their own transactions, and every adjustment needs an audit trail." }], impact: "Without agreement, the process will be both slow and noncompliant.", resolution: "Below VND 10 million: auto-approve with reason code; VND 10–50 million: Warehouse Manager approval; above VND 50 million: Finance Controller approval.", status: "resolved" },
  { id: "CF-02", topic: "Fill rate versus holding cost", positions: [{ stakeholder: "Supply Chain Director", position: "Prioritize achieving a 96% fill rate during the pilot." }, { stakeholder: "Finance Manager", position: "Holding cost must not increase by more than 8%." }], impact: "Excess safety stock may meet service targets while violating the financial objective.", resolution: "Priority and override thresholds by SKU class are still undefined.", status: "open" },
];

export const confirmations: ConfirmationItem[] = [
  { id: "CFM-01", findingId: "FND-01", stakeholder: "Le Thanh Lan · Warehouse Manager", response: "Confirmed. Add an SLA for moving returned goods from quarantine to available after quality inspection.", status: "confirmed", confirmedAt: "Sep 16 · 14:20" },
  { id: "CFM-02", findingId: "FND-02", stakeholder: "Nguyen Ha Anh · Supply Chain Director", response: "Confirmed. Transfer-first is mandatory, but planners may override when transfer arrives later than a PO or costs more than 12% above purchasing.", status: "confirmed", confirmedAt: "Sep 16 · 14:32" },
  { id: "CFM-03", findingId: "FND-03", stakeholder: "Hoang Thu Trang · Finance Manager", response: "Confirmed. Add a rule for adjustments when the accounting period is locked.", status: "confirmed", confirmedAt: "Sep 16 · 14:41" },
  { id: "CFM-04", findingId: "FND-04", stakeholder: "Vu Minh Khoa · Warehouse Operator", response: "Needs clarification: older devices do not display pending transactions.", status: "needs-clarification" },
];

export const risks: RiskItem[] = [
  { id: "RSK-01", title: "POS API remains delayed or misses transactions", probability: "High", impact: "High", response: "Incremental-sync reconciliation, latency alerts, and daily reconciliation.", owner: "Integration Lead" },
  { id: "RSK-02", title: "Offline scanning creates duplicate transactions", probability: "Medium", impact: "High", response: "Idempotency keys, a pending queue, and controlled retries.", owner: "Warehouse IT" },
  { id: "RSK-03", title: "Min-max settings do not reflect promotions", probability: "High", impact: "Medium", response: "Consume the promotion calendar and allow reasoned planner overrides.", owner: "Inventory Planner" },
  { id: "RSK-04", title: "Opening inventory data is inaccurate", probability: "Medium", impact: "High", response: "Cycle count, reconciliation, and sign-off before cutover.", owner: "Finance Manager" },
];

export const decisions = [
  { id: "DEC-01", title: "Use transfer-first in the MVP", rationale: "Reduce new purchases while surplus exists in the network", decidedBy: "Supply Chain Director", date: "Sep 16", status: "Approved" },
  { id: "DEC-02", title: "Do not replace POS in the MVP", rationale: "The project is limited to six months and VND 4 billion", decidedBy: "Project Sponsor", date: "Sep 16", status: "Approved" },
  { id: "DEC-03", title: "Pilot in three southern warehouses", rationale: "They have high stockout rates and a consistent operating model", decidedBy: "Project Sponsor", date: "Sep 16", status: "Approved" },
];

export const traceabilityRows = [
  { objective: "OBJ-01 · Stockout < 5%", finding: "FND-01", evidence: "EV-01, EV-02", requirement: "FR-RET-01", acceptance: "Quarantined goods are excluded from ATP within one minute", status: "Complete" },
  { objective: "OBJ-01 · Stockout < 5%", finding: "FND-02", evidence: "EV-03, EV-04", requirement: "FR-08", acceptance: "Check surplus across all warehouses before creating a PO suggestion", status: "Complete" },
  { objective: "OBJ-03 · Accuracy >= 98%", finding: "FND-03", evidence: "EV-05, EV-06", requirement: "NFR-AUD-01", acceptance: "Every adjustment records before/after values, actor, reason, and approver", status: "Complete" },
  { objective: "OBJ-03 · Accuracy >= 98%", finding: "FND-04", evidence: "EV-08", requirement: "NFR-03", acceptance: "Retry threshold and supported devices are not yet defined", status: "Gap" },
];

export const openQuestions = [
  { id: "OQ-01", question: "What is the maximum SLA for inspecting returned goods and updating them to available status?", owner: "Warehouse Manager", due: "Sep 17", relatedTo: "FND-01" },
  { id: "OQ-02", question: "When an accounting period is locked, is an adjustment reversed in the next period or is the original period reopened?", owner: "Finance Manager", due: "Sep 17", relatedTo: "FND-03" },
  { id: "OQ-03", question: "Which scanner models support a local queue and client transaction ID?", owner: "Warehouse IT", due: "Sep 18", relatedTo: "FND-04" },
];
