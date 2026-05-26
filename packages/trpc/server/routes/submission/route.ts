import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { submissionService } from "../../services";
import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";
import { eq, asc } from "drizzle-orm";
import {
    submitFormInputModel,
    submitFormOutputModel,
    listSubmissionsInputModel,
    listSubmissionsOutputModel,
    getPublicFormInputModel,
    getPublicFormOutputModel,
} from "./model";

const getPath = generatePath("/submission");
const TAGS = ["Submission"];

export const submissionRouter = router({
    getPublicForm: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getPublicForm"), tags: TAGS } })
        .input(getPublicFormInputModel)
        .output(getPublicFormOutputModel)
        .query(async ({ input }) => {
            const form = await db.select().from(formsTable).where(eq(formsTable.id, input.formId));
            if (!form?.[0]) throw new Error("Form not found");
            const fields = await db
                .select()
                .from(formsFieldsTable)
                .where(eq(formsFieldsTable.formId, input.formId))
                .orderBy(asc(formsFieldsTable.index));
            return {
                id: form[0].id,
                title: form[0].title,
                description: form[0].description,
                fields,
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
            return await submissionService.listSubmissions({ formId: input.formId, userId: ctx.user.id });
        }),
});
