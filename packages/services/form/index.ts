import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { formFieldOptionsTable } from "@repo/database/models/form-field-option";
import { usersTable } from "@repo/database/models/user";
import { eq, and, inArray } from "drizzle-orm";
import {
    createFormInput, type CreateFormInputType,
    listFormsByUserIdInput, type ListFormsByUserIdInputType,
    getFormByIdInput, type GetFormByIdInputType,
    updateFormInput, type UpdateFormInputType,
    deleteFormInput, type DeleteFormInputType,
    cloneFormInput, type CloneFormInputType,
    archiveFormInput, type ArchiveFormInputType,
    listPublicFormsInput, type ListPublicFormsInputType,
    clonePublicFormInput, type ClonePublicFormInputType,
} from "./model";

function slugify(title: string): string {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    return `${base || "form"}-${Math.random().toString(36).slice(2, 8)}`;
}

export default class FormService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy } = await createFormInput.parseAsync(payload);
        const result = await db.insert(formsTable).values({ title, description, createdBy, slug: slugify(title) }).returning({ id: formsTable.id });
        if (!result?.[0]?.id) throw new Error("Failed to create form");
        return { id: result[0].id };
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const { userId, includeArchived } = await listFormsByUserIdInput.parseAsync(payload);
        const conditions = [eq(formsTable.createdBy, userId)];
        if (!includeArchived) conditions.push(eq(formsTable.isArchived, false));
        return await db.select({
            id: formsTable.id, title: formsTable.title, description: formsTable.description,
            status: formsTable.status, visibility: formsTable.visibility, isTemplate: formsTable.isTemplate,
            isArchived: formsTable.isArchived, createdAt: formsTable.createdAt, updatedAt: formsTable.updatedAt,
        }).from(formsTable).where(and(...conditions));
    }

    public async getFormById(payload: GetFormByIdInputType) {
        const { formId, userId } = await getFormByIdInput.parseAsync(payload);
        const result = await db.select().from(formsTable).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!result?.[0]) throw new Error("Form not found");
        return result[0];
    }

    public async updateForm(payload: UpdateFormInputType) {
        const { formId, userId, title, description, welcomeTitle, welcomeDescription, endingTitle, endingDescription, status, visibility, isTemplate, hiddenFields, expiresAt, maxResponses, password } = await updateFormInput.parseAsync(payload);
        const updates: Record<string, unknown> = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (welcomeTitle !== undefined) updates.welcomeTitle = welcomeTitle;
        if (welcomeDescription !== undefined) updates.welcomeDescription = welcomeDescription;
        if (endingTitle !== undefined) updates.endingTitle = endingTitle;
        if (endingDescription !== undefined) updates.endingDescription = endingDescription;
        if (status !== undefined) updates.status = status;
        if (visibility !== undefined) updates.visibility = visibility;
        if (isTemplate !== undefined) updates.isTemplate = isTemplate;
        if (hiddenFields !== undefined) updates.hiddenFields = hiddenFields;
        if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (maxResponses !== undefined) updates.maxResponses = maxResponses;
        if (password !== undefined) updates.password = password;
        if (Object.keys(updates).length === 0) throw new Error("Nothing to update");
        const result = await db.update(formsTable).set(updates).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId))).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
        return { id: result[0].id };
    }

    public async deleteForm(payload: DeleteFormInputType) {
        const { formId, userId } = await deleteFormInput.parseAsync(payload);
        const fieldRows = await db.select({ id: formsFieldsTable.id }).from(formsFieldsTable).where(eq(formsFieldsTable.formId, formId));
        if (fieldRows.length > 0) await db.delete(formFieldOptionsTable).where(inArray(formFieldOptionsTable.fieldId, fieldRows.map((f) => f.id)));
        await db.delete(formsFieldsTable).where(eq(formsFieldsTable.formId, formId));
        const result = await db.delete(formsTable).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId))).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
        return { id: result[0].id };
    }

    public async cloneForm(payload: CloneFormInputType) {
        const { formId, userId } = await cloneFormInput.parseAsync(payload);
        const source = await db.select().from(formsTable).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!source?.[0]) throw new Error("Form not found");
        return this._cloneFormRow(source[0], userId);
    }

    public async clonePublicForm(payload: ClonePublicFormInputType) {
        const { formId, userId } = await clonePublicFormInput.parseAsync(payload);
        const source = await db.select().from(formsTable).where(and(eq(formsTable.id, formId), eq(formsTable.status, "PUBLISHED"), eq(formsTable.visibility, "PUBLIC")));
        if (!source?.[0]) throw new Error("Form not found");
        return this._cloneFormRow(source[0], userId);
    }

    private async _cloneFormRow(s: typeof formsTable.$inferSelect, userId: string) {
        const result = await db.insert(formsTable).values({
            title: `${s.title} (copy)`.slice(0, 50), description: s.description, status: "DRAFT", visibility: "UNLISTED",
            slug: slugify(s.title), welcomeTitle: s.welcomeTitle, welcomeDescription: s.welcomeDescription,
            endingTitle: s.endingTitle, endingDescription: s.endingDescription, hiddenFields: s.hiddenFields,
            createdBy: userId,
        }).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Failed to clone form");
        const fields = await db.select().from(formsFieldsTable).where(eq(formsFieldsTable.formId, s.id));
        for (const field of fields) {
            const newField = await db.insert(formsFieldsTable).values({
                formId: result[0].id, label: field.label, labelKey: field.labelKey, description: field.description,
                placeholder: field.placeholder, isRequired: field.isRequired, index: field.index, type: field.type, logic: field.logic, scores: field.scores,
            }).returning({ id: formsFieldsTable.id });
            if (!newField?.[0]) continue;
            const options = await db.select().from(formFieldOptionsTable).where(eq(formFieldOptionsTable.fieldId, field.id));
            if (options.length > 0) await db.insert(formFieldOptionsTable).values(options.map((o) => ({ fieldId: newField[0]!.id, label: o.label, index: o.index })));
        }
        return { id: result[0].id };
    }

    public async archiveForm(payload: ArchiveFormInputType) {
        const { formId, userId, archive } = await archiveFormInput.parseAsync(payload);
        const result = await db.update(formsTable).set({ isArchived: archive }).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId))).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
        return { id: result[0].id };
    }

    public async listPublicForms(payload: ListPublicFormsInputType) {
        const { onlyTemplates } = await listPublicFormsInput.parseAsync(payload);
        const conditions = [eq(formsTable.status, "PUBLISHED"), eq(formsTable.visibility, "PUBLIC")];
        if (onlyTemplates) conditions.push(eq(formsTable.isTemplate, true));
        return await db.select({
            id: formsTable.id, title: formsTable.title, description: formsTable.description,
            slug: formsTable.slug, isTemplate: formsTable.isTemplate, createdAt: formsTable.createdAt,
            creatorName: usersTable.fullName,
        }).from(formsTable).leftJoin(usersTable, eq(formsTable.createdBy, usersTable.id)).where(and(...conditions));
    }
}
