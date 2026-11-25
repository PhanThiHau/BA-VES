import { writeFileSync } from "node:fs";
import { JIRA_DOC_TEMPLATES } from "../src/features/docs/jiraTemplates";
writeFileSync("D:/BA-VES/BAVES-Backend/database/doc-templates/_raw.json", JSON.stringify(JIRA_DOC_TEMPLATES, null, 2), "utf8");
console.log("exported", JIRA_DOC_TEMPLATES.length);
