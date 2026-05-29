import { db } from "@repo/database";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { formFieldOptionsTable } from "@repo/database/models/form-field-option";
import { eq, and, asc, inArray } from "drizzle-orm";
import { toLabelKey } from "../common/utils";
import { assertFormReadAccess, assertFormWriteAccess } from "../common/access";
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

async function replaceOptions(fieldId: string, options: string[]) {
    await db.delete(formFieldOptionsTable).where(eq(formFieldOptionsTable.fieldId, fieldId));
    if (options.length === 0) return;
    await db.insert(formFieldOptionsTable).values(
        options.map((label, i) => ({ fieldId, label, index: String(i) })),
    );
}

export default class FormFieldService {
    public async addField(payload: AddFieldInputType) {
        const data = await addFieldInput.parseAsync(payload);
        await assertFormWriteAccess(data.formId, data.userId);
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
                logic: data.logic ?? null,
                scores: data.scores ?? null,
            })
            .returning({ id: formsFieldsTable.id });
        if (!result?.[0]) throw new Error("Failed to add field");
        if (data.options) await replaceOptions(result[0].id, data.options);
        return { id: result[0].id };
    }

    public async listFields(payload: ListFieldsInputType) {
        const { formId, userId } = await listFieldsInput.parseAsync(payload);
        await assertFormReadAccess(formId, userId);
        const fields = await db
            .select()
            .from(formsFieldsTable)
            .where(eq(formsFieldsTable.formId, formId))
            .orderBy(asc(formsFieldsTable.index));
        if (fields.length === 0) return [];
        const options = await db
            .select()
            .from(formFieldOptionsTable)
            .where(inArray(formFieldOptionsTable.fieldId, fields.map((f) => f.id)))
            .orderBy(asc(formFieldOptionsTable.index));
        return fields.map((f) => ({
            ...f,
            options: options.filter((o) => o.fieldId === f.id).map((o) => o.label),
        }));
    }

    public async updateField(payload: UpdateFieldInputType) {
        const { fieldId, formId, userId, ...fields } = await updateFieldInput.parseAsync(payload);
        await assertFormWriteAccess(formId, userId);
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
        if (fields.logic !== undefined) updates.logic = fields.logic;
        if (fields.scores !== undefined) updates.scores = fields.scores;
        if (fields.options === undefined && Object.keys(updates).length === 0)
            throw new Error("Nothing to update");
        if (Object.keys(updates).length > 0) {
            const result = await db
                .update(formsFieldsTable)
                .set(updates)
                .where(and(eq(formsFieldsTable.id, fieldId), eq(formsFieldsTable.formId, formId)))
                .returning({ id: formsFieldsTable.id });
            if (!result?.[0]) throw new Error("Field not found");
        }
        if (fields.options !== undefined) await replaceOptions(fieldId, fields.options);
        return { id: fieldId };
    }

    public async deleteField(payload: DeleteFieldInputType) {
        const { fieldId, formId, userId } = await deleteFieldInput.parseAsync(payload);
        await assertFormWriteAccess(formId, userId);
        await db.delete(formFieldOptionsTable).where(eq(formFieldOptionsTable.fieldId, fieldId));
        const result = await db
            .delete(formsFieldsTable)
            .where(and(eq(formsFieldsTable.id, fieldId), eq(formsFieldsTable.formId, formId)))
            .returning({ id: formsFieldsTable.id });
        if (!result?.[0]) throw new Error("Field not found");
        return { id: result[0].id };
    }

    public async reorderFields(payload: ReorderFieldsInputType) {
        const { formId, userId, fieldIds } = await reorderFieldsInput.parseAsync(payload);
        await assertFormWriteAccess(formId, userId);
        for (let i = 0; i < fieldIds.length; i++) {
            await db
                .update(formsFieldsTable)
                .set({ index: String(i) })
                .where(and(eq(formsFieldsTable.id, fieldIds[i]!), eq(formsFieldsTable.formId, formId)));
        }
        return { success: true };
    }
}
