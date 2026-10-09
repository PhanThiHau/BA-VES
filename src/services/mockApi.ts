import type { ChatMessage, Stakeholder } from "../types/models";

const replies: Record<string, string[]> = {
  warehouse: [
    "From receiving the pick list to staging the goods for dispatch, the average is about 22 minutes. The biggest delay is that operators revisit the same zone several times because the picking sequence is inefficient.",
    "We keep returned goods in a separate area for inspection, but their status is usually updated only at the end of the shift. During the day, system inventory can differ from the physical stock.",
    "I agree that controls are necessary, but waiting for Finance on every small adjustment would stop warehouse operations. Value-based approval thresholds would be more practical.",
  ],
  finance: [
    "Any adjustment above VND 50 million requires independent approval. The person who creates the transaction cannot approve it.",
    "For audit purposes, we need to trace who performed the action, when it happened, why the adjustment was made, and the before-and-after values.",
    "Amounts below VND 10 million may be auto-approved if a reason code is mandatory. From 10 to 50 million, the Warehouse Manager approves; above 50 million goes to the Finance Controller.",
  ],
  planner: [
    "POS data is often about 15 minutes late, while supplier lead time can vary by three to five days. Those two issues make the Excel plan obsolete very quickly.",
    "Before suggesting another purchase, I need the system to show which warehouse has surplus stock, the transferable quantity, cost, and expected arrival date.",
    "Min-max values are still maintained in Excel. When an unexpected promotion is not added to the file, replenishment suggestions do not reflect actual demand.",
  ],
  supply: [
    "I need to see all three measures together: stockouts below 5%, fill rate at least 96%, and holding cost increasing by no more than 8%. Improving only one does not count as success.",
    "Transfer-first is the general policy, but planners still need authority to choose another option when a transfer costs more or arrives later than a purchase.",
  ],
  operator: [
    "When the network is down, we write transactions on paper and scan them again later. The scanner does not show pending transactions, so two people can accidentally scan the same item.",
    "A pending-sync list on the scanner would show us what has already been captured, so we would no longer need paper notes or verbal checks.",
  ],
  sponsor: [
    "I want an MVP that can run within six months. The team may propose the approach, but the budget cannot exceed VND 4 billion and the current POS cannot be replaced.",
    "The pilot must not interrupt warehouse operations. Reuse the existing APIs instead of creating another POS replacement project.",
  ],
};

export async function sendStakeholderMessage(stakeholder: Stakeholder, text: string, turn: number): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const options = replies[stakeholder.id] ?? [`I am not sure I understand what you mean by “${text.slice(0, 45)}”. Could you ask about a specific real-world situation?`];
  return { id: Date.now(), stakeholderId: stakeholder.id, sender: "agent", text: options[turn % options.length], time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) };
}
