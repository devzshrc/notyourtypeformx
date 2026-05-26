import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { submissionsTable } from "@repo/database/models/submission";
import { formEventsTable } from "@repo/database/models/form-event";
import { eq, and, desc, count } from "drizzle-orm";
import {
    submitFormInput,
    type SubmitFormInputType,
    listSubmissionsInput,
    type ListSubmissionsInputType,
    recordEventInput,
    type RecordEventInputType,
    getAnalyticsInput,
    type GetAnalyticsInputType,
} from "./model";

export default class SubmissionService {
    public async submitForm(payload: SubmitFormInputType) {
        const { formId, data } = await submitFormInput.parseAsync(payload);
        // Verify form exists and is accepting responses
        const form = await db
            .select({ id: formsTable.id, status: formsTable.status })
            .from(formsTable)
            .where(eq(formsTable.id, formId));
        if (!form?.[0]) throw new Error("Form not found");
        if (form[0].status !== "PUBLISHED") throw new Error("This form is not accepting responses");
        // Get required fields and validate
        const fields = await db.select().from(formsFieldsTable).where(eq(formsFieldsTable.formId, formId));
        for (const field of fields) {
            if (!field.isRequired) continue;
            const v = data[field.labelKey];
            const missing =
                v === undefined ||
                v === null ||
                (typeof v === "string" && v.trim() === "") ||
                (Array.isArray(v) && v.length === 0);
            if (missing) throw new Error(`Field "${field.label}" is required`);
        }
        const result = await db
            .insert(submissionsTable)
            .values({ formId, data })
            .returning({ id: submissionsTable.id });
        if (!result?.[0]) throw new Error("Failed to submit");
        return { id: result[0].id };
    }

    public async listSubmissions(payload: ListSubmissionsInputType) {
        const { formId, userId } = await listSubmissionsInput.parseAsync(payload);
        // Verify ownership
        const form = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!form?.[0]) throw new Error("Form not found");
        return await db
            .select()
            .from(submissionsTable)
            .where(eq(submissionsTable.formId, formId))
            .orderBy(desc(submissionsTable.createdAt));
    }

    public async recordEvent(payload: RecordEventInputType) {
        const { formId, type } = await recordEventInput.parseAsync(payload);
        await db.insert(formEventsTable).values({ formId, type });
        return { success: true };
    }

    public async getAnalytics(payload: GetAnalyticsInputType) {
        const { formId, userId } = await getAnalyticsInput.parseAsync(payload);
        const form = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!form?.[0]) throw new Error("Form not found");

        const countWhere = async (where: ReturnType<typeof eq>) =>
            (await db.select({ c: count() }).from(formEventsTable).where(where))[0]?.c ?? 0;

        const views = await countWhere(
            and(eq(formEventsTable.formId, formId), eq(formEventsTable.type, "VIEW"))!,
        );
        const starts = await countWhere(
            and(eq(formEventsTable.formId, formId), eq(formEventsTable.type, "START"))!,
        );
        const subRow = await db
            .select({ c: count() })
            .from(submissionsTable)
            .where(eq(submissionsTable.formId, formId));
        const submissions = subRow[0]?.c ?? 0;
        const completionRate = views > 0 ? Math.round((submissions / views) * 100) : 0;
        return { views, starts, submissions, completionRate };
    }
}
