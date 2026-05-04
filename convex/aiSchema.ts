import {z} from "zod"

//i am creating a pydanitc schema this will bascially help in getting correct data and reduce errors
export const caseAnalysisSchema = z.object({

    caseStrenght:z
    .number()
    .min(0)
    .max(100)
    .describe("Score from 0-100 based on evidence, severity, and legal precedent of that state"),

    summary:z.string().describe("A brief, objective summary of the tenant's situation."),

    yourRights:z
    .array(z.string())
    .describe("List of tenant rights strictly based on the provided state laws."),

    recommendedActions:z
    .array(z.string())
    .describe("Prioritized, actionable steps the tenant should take immediately."),

    documentation:z
    .array(z.string())
    .describe("Specific documents or evidence the tenant needs to gather."),

    redFlags:z
    .array(z.string())
    .describe("Warnings about deadlines, immediate dangers, or when to hire an attorney."),

    userTimeline:z
    .array(z.string())
    .describe("what the user should do next in a timeline from in terms of days"),

    caseStrengthDescription:z
    .string()
    .describe("A detailed explanation of the case strength score based on the provided state laws."),



})














