import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { eq, and, asc } from "drizzle-orm";
import {
    addFieldInput,
    type AddFieldInputType,
    listFieldsInput,
    type ListFieldsInputType,
    updateFieldInput,
    type UpdateFieldInputType,
    deleteFieldInput,
    type DeleteFieldInputType,
    reorderFieldsInput,
    type ReorderFieldsInputType,
} from "./model";

function toLabelKey(label: string): string {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function verifyFormOwnership(formId: string, userId: string) {
    const form = await db
        .select({ id: formsTable.id })
        .from(formsTable)
        .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
    if (!form?.[0]) throw new Error("Form not found");
}

export default class FormFieldService {
    public async addField(payload: AddFieldInputType) {
        const data = await addFieldInput.parseAsync(payload);
        await verifyFormOwnership(data.formId, data.userId);
        const result = await db
            .insert(formsFieldsTable)
            .values({
                formId: data.formId,
                label: data.label,
                labelKey: toLabelKey(data.label),
                description: data.description,
                placeholder: data.placeholder,
                isRequired: data.isRequired,
                index: String(data.index),
                type: data.type,
            })
            .returning({ id: formsFieldsTable.id });
        if (!result?.[0]) throw new Error("Failed to add field");
        return { id: result[0].id };
    }

    public async listFields(payload: ListFieldsInputType) {
        const { formId, userId } = await listFieldsInput.parseAsync(payload);
        await verifyFormOwnership(formId, userId);
        return await db
            .select()
            .from(formsFieldsTable)
            .where(eq(formsFieldsTable.formId, formId))
            .orderBy(asc(formsFieldsTable.index));
    }

    public async updateField(payload: UpdateFieldInputType) {
        const { fieldId, formId, userId, ...fields } = await updateFieldInput.parseAsync(payload);
        await verifyFormOwnership(formId, userId);
        const updates: Record<string, unknown> = {};
        if (fields.label !== undefined) {
            updates.label = fields.label;
            updates.labelKey = toLabelKey(fields.label);
        }
        if (fields.description !== undefined) updates.description = fields.description;
        if (fields.placeholder !== undefined) updates.placeholder = fields.placeholder;
        if (fields.isRequired !== undefined) updates.isRequired = fields.isRequired;
        if (fields.index !== undefined) updates.index = String(fields.index);
        if (fields.type !== undefined) updates.type = fields.type;
        if (Object.keys(updates).length === 0) throw new Error("Nothing to update");
        const result = await db
            .update(formsFieldsTable)
            .set(updates)
            .where(and(eq(formsFieldsTable.id, fieldId), eq(formsFieldsTable.formId, formId)))
            .returning({ id: formsFieldsTable.id });
        if (!result?.[0]) throw new Error("Field not found");
        return { id: result[0].id };
    }

    public async deleteField(payload: DeleteFieldInputType) {
        const { fieldId, formId, userId } = await deleteFieldInput.parseAsync(payload);
        await verifyFormOwnership(formId, userId);
        const result = await db
            .delete(formsFieldsTable)
            .where(and(eq(formsFieldsTable.id, fieldId), eq(formsFieldsTable.formId, formId)))
            .returning({ id: formsFieldsTable.id });
        if (!result?.[0]) throw new Error("Field not found");
        return { id: result[0].id };
    }

    public async reorderFields(payload: ReorderFieldsInputType) {
        const { formId, userId, fieldIds } = await reorderFieldsInput.parseAsync(payload);
        await verifyFormOwnership(formId, userId);
        for (let i = 0; i < fieldIds.length; i++) {
            await db
                .update(formsFieldsTable)
                .set({ index: String(i) })
                .where(and(eq(formsFieldsTable.id, fieldIds[i]!), eq(formsFieldsTable.formId, formId)));
        }
        return { success: true };
    }
}
