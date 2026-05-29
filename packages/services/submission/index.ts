import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { submissionsTable } from "@repo/database/models/submission";
import { formEventsTable } from "@repo/database/models/form-event";
import { eq, and, desc, count, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
    submitFormInput,
    type SubmitFormInputType,
    listSubmissionsInput,
    type ListSubmissionsInputType,
    recordEventInput,
    type RecordEventInputType,
    getAnalyticsInput,
    type GetAnalyticsInputType,
    verifyFormPasswordInput,
    type VerifyFormPasswordInputType,
    getAdminStatsInput,
    type GetAdminStatsInputType,
    getSubmissionTimeSeriesInput,
    type GetSubmissionTimeSeriesInputType,
} from "./model";

export default class SubmissionService {
    public async submitForm(payload: SubmitFormInputType) {
        const { formId, data } = await submitFormInput.parseAsync(payload);
        const form = await db
            .select({ id: formsTable.id, status: formsTable.status, expiresAt: formsTable.expiresAt, maxResponses: formsTable.maxResponses, password: formsTable.password })
            .from(formsTable)
            .where(eq(formsTable.id, formId));
        if (!form?.[0]) throw new Error("Form not found");
        if (form[0].status !== "PUBLISHED") throw new Error("This form is not accepting responses");
        // Check expiry
        if (form[0].expiresAt && new Date() > form[0].expiresAt) {
            throw new Error("This form has expired and is no longer accepting responses");
        }
        // Validate against the form's actual fields: reject unknown keys, enforce required.
        const fields = await db.select().from(formsFieldsTable).where(eq(formsFieldsTable.formId, formId));
        const validKeys = new Set(fields.map((f) => f.labelKey));
        for (const key of Object.keys(data)) {
            if (!validKeys.has(key)) throw new Error(`Unknown field "${key}"`);
        }
        for (const field of fields) {
            if (!field.isRequired) continue;
            const v = data[field.labelKey];
            const missing = v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
            if (missing) throw new Error(`Field "${field.label}" is required`);
        }
        // Count + insert inside one transaction so concurrent submits can't exceed maxResponses (TOCTOU).
        const maxResponses = form[0].maxResponses;
        const result = await db.transaction(async (tx) => {
            if (maxResponses) {
                const countResult = await tx.select({ c: count() }).from(submissionsTable).where(eq(submissionsTable.formId, formId));
                if ((countResult[0]?.c ?? 0) >= maxResponses) {
                    throw new Error("This form has reached its maximum number of responses");
                }
            }
            return tx
                .insert(submissionsTable)
                .values({ formId, data })
                .returning({ id: submissionsTable.id });
        });
        if (!result?.[0]) throw new Error("Failed to submit");
        return { id: result[0].id };
    }

    public async listSubmissions(payload: ListSubmissionsInputType) {
        const { formId, userId, limit = 50, offset = 0, startDate, endDate } = await listSubmissionsInput.parseAsync(payload);
        const form = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!form?.[0]) throw new Error("Form not found");
        const conditions = [eq(submissionsTable.formId, formId)];
        if (startDate) conditions.push(gte(submissionsTable.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(submissionsTable.createdAt, new Date(endDate)));
        const rows = await db
            .select()
            .from(submissionsTable)
            .where(and(...conditions))
            .orderBy(desc(submissionsTable.createdAt))
            .limit(limit)
            .offset(offset);
        const totalResult = await db.select({ c: count() }).from(submissionsTable).where(and(...conditions));
        return { rows, total: totalResult[0]?.c ?? 0 };
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
        const views = (await db.select({ c: count() }).from(formEventsTable).where(and(eq(formEventsTable.formId, formId), eq(formEventsTable.type, "VIEW"))))[0]?.c ?? 0;
        const starts = (await db.select({ c: count() }).from(formEventsTable).where(and(eq(formEventsTable.formId, formId), eq(formEventsTable.type, "START"))))[0]?.c ?? 0;
        const submissions = (await db.select({ c: count() }).from(submissionsTable).where(eq(submissionsTable.formId, formId)))[0]?.c ?? 0;
        const completionRate = views > 0 ? Math.round((submissions / views) * 100) : 0;
        return { views, starts, submissions, completionRate };
    }

    public async verifyFormPassword(payload: VerifyFormPasswordInputType) {
        const { formId, password } = await verifyFormPasswordInput.parseAsync(payload);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formId);
        const form = await db
            .select({ password: formsTable.password })
            .from(formsTable)
            .where(isUuid ? eq(formsTable.id, formId) : eq(formsTable.slug, formId));
        if (!form?.[0]) throw new Error("Form not found");
        if (!form[0].password) return { valid: true };
        return { valid: await bcrypt.compare(password, form[0].password) };
    }

    public async getAdminStats(payload: GetAdminStatsInputType) {
        const { userId } = await getAdminStatsInput.parseAsync(payload);
        const userForms = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId));
        const formIds = userForms.map((f) => f.id);
        if (formIds.length === 0) return { totalForms: 0, totalSubmissions: 0, totalViews: 0, avgCompletionRate: 0 };
        const totalForms = formIds.length;
        const totalSubmissions = (await db.select({ c: count() }).from(submissionsTable).where(sql`${submissionsTable.formId} IN (${sql.join(formIds.map(id => sql`${id}`), sql`, `)})`))[0]?.c ?? 0;
        const totalViews = (await db.select({ c: count() }).from(formEventsTable).where(and(sql`${formEventsTable.formId} IN (${sql.join(formIds.map(id => sql`${id}`), sql`, `)})`, eq(formEventsTable.type, "VIEW"))))[0]?.c ?? 0;
        const avgCompletionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;
        return { totalForms, totalSubmissions, totalViews, avgCompletionRate };
    }

    public async getSubmissionTimeSeries(payload: GetSubmissionTimeSeriesInputType) {
        const { formId, userId, days = 30 } = await getSubmissionTimeSeriesInput.parseAsync(payload);
        const form = await db.select({ id: formsTable.id }).from(formsTable).where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!form?.[0]) throw new Error("Form not found");
        const since = new Date();
        since.setDate(since.getDate() - days);
        const rows = await db.select({ createdAt: submissionsTable.createdAt }).from(submissionsTable).where(and(eq(submissionsTable.formId, formId), gte(submissionsTable.createdAt, since)));
        // Group by date
        const map: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            map[d.toISOString().slice(0, 10)] = 0;
        }
        for (const row of rows) {
            if (row.createdAt) {
                const key = row.createdAt.toISOString().slice(0, 10);
                if (key in map) map[key] = (map[key] ?? 0) + 1;
            }
        }
        return Object.entries(map).map(([date, count]) => ({ date, count }));
    }
}
