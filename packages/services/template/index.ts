import { db, eq, and, sql } from "@repo/database";
import { templateCategoriesTable } from "@repo/database/models/template-category";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { formFieldOptionsTable } from "@repo/database/models/form-field-option";
import { usersTable } from "@repo/database/models/user";
import { ilike } from "@repo/database";
import {
    listTemplatesInput, type ListTemplatesInputType,
    getTemplateInput, type GetTemplateInputType,
    publishAsTemplateInput, type PublishAsTemplateInputType,
    unpublishTemplateInput, type UnpublishTemplateInputType,
    cloneTemplateInput, type CloneTemplateInputType,
} from "./model";

function slugify(title: string): string {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    return `${base || "form"}-${Math.random().toString(36).slice(2, 8)}`;
}

export default class TemplateService {
    async listCategories() {
        return await db.select().from(templateCategoriesTable).orderBy(templateCategoriesTable.index);
    }

    async listTemplates(payload: ListTemplatesInputType) {
        const { categoryId, search, limit = 20, offset = 0 } = await listTemplatesInput.parseAsync(payload);
        const conditions = [eq(formsTable.isTemplate, true), eq(formsTable.status, "PUBLISHED"), eq(formsTable.visibility, "PUBLIC")];
        if (categoryId) conditions.push(eq(formsTable.categoryId, categoryId));
        if (search) conditions.push(ilike(formsTable.title, `%${search}%`));

        const rows = await db
            .select({ id: formsTable.id, title: formsTable.title, description: formsTable.description, slug: formsTable.slug, categoryId: formsTable.categoryId, isSystemTemplate: formsTable.isSystemTemplate, templateCloneCount: formsTable.templateCloneCount, createdAt: formsTable.createdAt, creatorName: usersTable.fullName })
            .from(formsTable)
            .leftJoin(usersTable, eq(formsTable.createdBy, usersTable.id))
            .where(and(...conditions))
            .limit(limit)
            .offset(offset)
            .orderBy(formsTable.templateCloneCount);

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(formsTable).where(and(...conditions));
        return { templates: rows, total: Number(countResult[0]?.count ?? 0) };
    }

    async getTemplate(payload: GetTemplateInputType) {
        const { templateId } = await getTemplateInput.parseAsync(payload);
        const form = await db.select().from(formsTable).where(and(eq(formsTable.id, templateId), eq(formsTable.isTemplate, true)));
        if (!form?.[0]) throw new Error("Template not found");
        const fields = await db.select().from(formsFieldsTable).where(eq(formsFieldsTable.formId, templateId));
        return { ...form[0], fields };
    }

    async publishAsTemplate(payload: PublishAsTemplateInputType) {
        const { formId, userId, categoryId } = await publishAsTemplateInput.parseAsync(payload);
        const result = await db.update(formsTable).set({ isTemplate: true, visibility: "PUBLIC", status: "PUBLISHED", categoryId }).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId))).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
        return { id: result[0].id };
    }

    async unpublishTemplate(payload: UnpublishTemplateInputType) {
        const { formId, userId } = await unpublishTemplateInput.parseAsync(payload);
        const result = await db.update(formsTable).set({ isTemplate: false, visibility: "UNLISTED", categoryId: null }).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId))).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Form not found");
    }

    async cloneTemplate(payload: CloneTemplateInputType) {
        const { templateId, userId, workspaceId } = await cloneTemplateInput.parseAsync(payload);
        const source = await db.select().from(formsTable).where(and(eq(formsTable.id, templateId), eq(formsTable.isTemplate, true), eq(formsTable.status, "PUBLISHED")));
        if (!source?.[0]) throw new Error("Template not found");
        const s = source[0];

        const result = await db.insert(formsTable).values({
            title: `${s.title}`.slice(0, 50), description: s.description, status: "DRAFT", visibility: "UNLISTED",
            slug: slugify(s.title), welcomeTitle: s.welcomeTitle, welcomeDescription: s.welcomeDescription,
            endingTitle: s.endingTitle, endingDescription: s.endingDescription, hiddenFields: s.hiddenFields,
            theme: s.theme, createdBy: userId, workspaceId: workspaceId ?? null,
        }).returning({ id: formsTable.id });
        if (!result?.[0]) throw new Error("Failed to clone template");

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

        // Increment clone count
        await db.update(formsTable).set({ templateCloneCount: sql`${formsTable.templateCloneCount} + 1` }).where(eq(formsTable.id, templateId));

        return { id: result[0].id };
    }
}
