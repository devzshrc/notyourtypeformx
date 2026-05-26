import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { formFieldOptionsTable } from "@repo/database/models/form-field-option";
import { eq, and, inArray } from "drizzle-orm";
import {
    createFormInput,
    type CreateFormInputType,
    listFormsByUserIdInput,
    type ListFormsByUserIdInputType,
    getFormByIdInput,
    type GetFormByIdInputType,
    updateFormInput,
    type UpdateFormInputType,
    deleteFormInput,
    type DeleteFormInputType,
} from "./model";

function slugify(title: string): string {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base || "form"}-${suffix}`;
}

export default class FormService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy } = await createFormInput.parseAsync(payload);
        const result = await db
            .insert(formsTable)
            .values({ title, description, createdBy, slug: slugify(title) })
            .returning({ id: formsTable.id });
        if (!result?.[0]?.id) throw new Error("Failed to create form");
        return { id: result[0].id };
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload);
        return await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                status: formsTable.status,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
            })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId));
    }

    public async getFormById(payload: GetFormByIdInputType) {
        const { formId, userId } = await getFormByIdInput.parseAsync(payload);
        const result = await db
            .select()
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!result?.[0]) throw new Error("Form not found");
        return result[0];
    }

    public async updateForm(payload: UpdateFormInputType) {
        const {
            formId,
            userId,
            title,
            description,
            welcomeTitle,
            welcomeDescription,
            endingTitle,
            endingDescription,
            status,
            hiddenFields,
        } = await updateFormInput.parseAsync(payload);
        const updates: Record<string, unknown> = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (welcomeTitle !== undefined) updates.welcomeTitle = welcomeTitle;
        if (welcomeDescription !== undefined) updates.welcomeDescription = welcomeDescription;
        if (endingTitle !== undefined) updates.endingTitle = endingTitle;
        if (endingDescription !== undefined) updates.endingDescription = endingDescription;
        if (status !== undefined) updates.status = status;
        if (hiddenFields !== undefined) updates.hiddenFields = hiddenFields;
        if (Object.keys(updates).length === 0) throw new Error("Nothing to update");
        const result = await db
            .update(formsTable)
            .set(updates)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
        return { id: result[0].id };
    }

    public async deleteForm(payload: DeleteFormInputType) {
        const { formId, userId } = await deleteFormInput.parseAsync(payload);
        // Delete options, then fields
        const fieldRows = await db
            .select({ id: formsFieldsTable.id })
            .from(formsFieldsTable)
            .where(eq(formsFieldsTable.formId, formId));
        if (fieldRows.length > 0) {
            await db.delete(formFieldOptionsTable).where(
                inArray(formFieldOptionsTable.fieldId, fieldRows.map((f) => f.id)),
            );
        }
        await db.delete(formsFieldsTable).where(eq(formsFieldsTable.formId, formId));
        const result = await db
            .delete(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
        return { id: result[0].id };
    }
}
