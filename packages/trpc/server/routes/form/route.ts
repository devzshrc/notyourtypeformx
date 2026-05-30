import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "../../services";
import {
    createFormInputModel, createFormOutputModel, listFormsInputModel, listFormOutputModel,
    getFormInputModel, getFormOutputModel, updateFormInputModel, updateFormOutputModel,
    deleteFormInputModel, deleteFormOutputModel, cloneFormInputModel, cloneFormOutputModel,
    archiveFormInputModel, archiveFormOutputModel, listPublicFormsInputModel, listPublicFormsOutputModel,
    clonePublicFormInputModel, clonePublicFormOutputModel,
    generateFormInputModel, generateFormOutputModel,
    importGoogleFormInputModel, importGoogleFormOutputModel,
    improveFieldInputModel, improveFieldOutputModel,
    updateSlugInputModel, updateSlugOutputModel,
    getFormBySlugInputModel, getFormBySlugOutputModel,
    suggestFieldsInputModel, suggestFieldsOutputModel,
    moveFormInputModel, moveFormOutputModel,
} from "./model";

const getPath = generatePath("/form");
const TAGS = ["Form"];

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createForm"), tags: TAGS, protect: true } })
        .input(createFormInputModel).output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.createForm({ ...input, createdBy: ctx.user.id })),

    listForms: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listForms"), tags: TAGS, protect: true } })
        .input(listFormsInputModel).output(listFormOutputModel)
        .query(async ({ input, ctx }) => formService.listFormsByUserId({ userId: ctx.user.id, includeArchived: input?.includeArchived, workspaceId: input?.workspaceId })),

    getForm: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getForm"), tags: TAGS, protect: true } })
        .input(getFormInputModel).output(getFormOutputModel)
        .query(async ({ input, ctx }) => formService.getFormById({ formId: input.formId, userId: ctx.user.id })),

    updateForm: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/updateForm"), tags: TAGS, protect: true } })
        .input(updateFormInputModel).output(updateFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.updateForm({ ...input, userId: ctx.user.id })),

    deleteForm: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteForm"), tags: TAGS, protect: true } })
        .input(deleteFormInputModel).output(deleteFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.deleteForm({ formId: input.formId, userId: ctx.user.id })),

    cloneForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/cloneForm"), tags: TAGS, protect: true } })
        .input(cloneFormInputModel).output(cloneFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.cloneForm({ formId: input.formId, userId: ctx.user.id })),

    archiveForm: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/archiveForm"), tags: TAGS, protect: true } })
        .input(archiveFormInputModel).output(archiveFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.archiveForm({ formId: input.formId, userId: ctx.user.id, archive: input.archive })),

    listPublicForms: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listPublicForms"), tags: TAGS } })
        .input(listPublicFormsInputModel).output(listPublicFormsOutputModel)
        .query(async ({ input }) => formService.listPublicForms({ onlyTemplates: input?.onlyTemplates })),

    clonePublicForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/clonePublicForm"), tags: TAGS, protect: true } })
        .input(clonePublicFormInputModel).output(clonePublicFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.clonePublicForm({ formId: input.formId, userId: ctx.user.id })),

    generateForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/generateForm"), tags: TAGS, protect: true } })
        .input(generateFormInputModel).output(generateFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.generateFormWithAI(ctx.user.id, input.prompt)),

    importGoogleForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/importGoogleForm"), tags: TAGS, protect: true } })
        .input(importGoogleFormInputModel).output(importGoogleFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.importFromGoogleForm(ctx.user.id, input.url, input.workspaceId)),

    improveField: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/improveField"), tags: TAGS, protect: true } })
        .input(improveFieldInputModel).output(improveFieldOutputModel)
        .mutation(async ({ input, ctx }) => formService.improveFieldLabel(input.fieldId, ctx.user.id)),

    updateSlug: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/updateSlug"), tags: TAGS, protect: true } })
        .input(updateSlugInputModel).output(updateSlugOutputModel)
        .mutation(async ({ input, ctx }) => formService.updateSlug({ ...input, userId: ctx.user.id })),

    getFormBySlug: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getFormBySlug"), tags: TAGS } })
        .input(getFormBySlugInputModel).output(getFormBySlugOutputModel)
        .query(async ({ input }) => formService.getFormBySlug(input)),

    suggestFields: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/suggestFields"), tags: TAGS, protect: true } })
        .input(suggestFieldsInputModel).output(suggestFieldsOutputModel)
        .mutation(async ({ input, ctx }) => formService.suggestNextField(input.formId, ctx.user.id)),

    moveForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/moveForm"), tags: TAGS, protect: true } })
        .input(moveFormInputModel).output(moveFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.moveForm({ formId: input.formId, userId: ctx.user.id, workspaceId: input.workspaceId })),
});
