import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { submissionsTable } from "@repo/database/models/submission";
import { eq, and, desc } from "drizzle-orm";
import {
    submitFormInput,
    type SubmitFormInputType,
    listSubmissionsInput,
    type ListSubmissionsInputType,
} from "./model";

export default class SubmissionService {
    public async submitForm(payload: SubmitFormInputType) {
        const { formId, data } = await submitFormInput.parseAsync(payload);
        // Verify form exists
        const form = await db.select({ id: formsTable.id }).from(formsTable).where(eq(formsTable.id, formId));
        if (!form?.[0]) throw new Error("Form not found");
        // Get required fields and validate
        const fields = await db.select().from(formsFieldsTable).where(eq(formsFieldsTable.formId, formId));
        for (const field of fields) {
            if (field.isRequired && !data[field.labelKey]) {
                throw new Error(`Field "${field.label}" is required`);
            }
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
}
