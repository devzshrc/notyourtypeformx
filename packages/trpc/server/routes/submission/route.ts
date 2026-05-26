import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { submissionService } from "../../services";
import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { formFieldOptionsTable } from "@repo/database/models/form-field-option";
import { eq, asc, inArray } from "drizzle-orm";
import {
    submitFormInputModel, submitFormOutputModel, listSubmissionsInputModel, listSubmissionsOutputModel,
    getPublicFormInputModel, getPublicFormOutputModel, recordEventInputModel, recordEventOutputModel,
    getAnalyticsInputModel, getAnalyticsOutputModel, verifyFormPasswordInputModel, verifyFormPasswordOutputModel,
    getAdminStatsInputModel, getAdminStatsOutputModel, getSubmissionTimeSeriesInputModel, getSubmissionTimeSeriesOutputModel,
} from "./model";

const getPath = generatePath("/submission");
const TAGS = ["Submission"];

export const submissionRouter = router({
    getPublicForm: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getPublicForm"), tags: TAGS } })
        .input(getPublicFormInputModel)
        .output(getPublicFormOutputModel)
        .query(async ({ input }) => {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.formId);
            const form = await db
                .select()
                .from(formsTable)
                .where(isUuid ? eq(formsTable.id, input.formId) : eq(formsTable.slug, input.formId));
            if (!form?.[0]) throw new Error("Form not found");
            const fields = await db
                .select()
                .from(formsFieldsTable)
                .where(eq(formsFieldsTable.formId, form[0].id))
                .orderBy(asc(formsFieldsTable.index));
            const options = fields.length
                ? await db
                      .select()
                      .from(formFieldOptionsTable)
                      .where(inArray(formFieldOptionsTable.fieldId, fields.map((f) => f.id)))
                      .orderBy(asc(formFieldOptionsTable.index))
                : [];
            return {
                id: form[0].id,
                status: form[0].status,
                slug: form[0].slug,
                hiddenFields: form[0].hiddenFields,
                hasPassword: Boolean(form[0].password),
                title: form[0].title,
                description: form[0].description,
                welcomeTitle: form[0].welcomeTitle,
                welcomeDescription: form[0].welcomeDescription,
                endingTitle: form[0].endingTitle,
                endingDescription: form[0].endingDescription,
                fields: fields.map((f) => ({
                    ...f,
                    options: options.filter((o) => o.fieldId === f.id).map((o) => o.label),
                })),
            };
        }),

    submitForm: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/submitForm"), tags: TAGS } })
        .input(submitFormInputModel)
        .output(submitFormOutputModel)
        .mutation(async ({ input }) => {
            return await submissionService.submitForm(input);
        }),

    listSubmissions: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listSubmissions"), tags: TAGS, protect: true } })
        .input(listSubmissionsInputModel)
        .output(listSubmissionsOutputModel)
        .query(async ({ input, ctx }) => {
            return await submissionService.listSubmissions({ ...input, userId: ctx.user.id });
        }),

    recordEvent: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/recordEvent"), tags: TAGS } })
        .input(recordEventInputModel)
        .output(recordEventOutputModel)
        .mutation(async ({ input }) => {
            return await submissionService.recordEvent(input);
        }),

    getAnalytics: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getAnalytics"), tags: TAGS, protect: true } })
        .input(getAnalyticsInputModel)
        .output(getAnalyticsOutputModel)
        .query(async ({ input, ctx }) => {
            return await submissionService.getAnalytics({ formId: input.formId, userId: ctx.user.id });
        }),

    verifyFormPassword: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/verifyFormPassword"), tags: TAGS } })
        .input(verifyFormPasswordInputModel)
        .output(verifyFormPasswordOutputModel)
        .mutation(async ({ input }) => {
            return await submissionService.verifyFormPassword(input);
        }),

    getAdminStats: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getAdminStats"), tags: TAGS, protect: true } })
        .input(getAdminStatsInputModel)
        .output(getAdminStatsOutputModel)
        .query(async ({ ctx }) => {
            return await submissionService.getAdminStats({ userId: ctx.user.id });
        }),

    getSubmissionTimeSeries: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getSubmissionTimeSeries"), tags: TAGS, protect: true } })
        .input(getSubmissionTimeSeriesInputModel)
        .output(getSubmissionTimeSeriesOutputModel)
        .query(async ({ input, ctx }) => {
            return await submissionService.getSubmissionTimeSeries({ formId: input.formId, userId: ctx.user.id, days: input.days });
        }),
});
