import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { templateService } from "../../services";
import {
    listCategoriesInputModel, listCategoriesOutputModel,
    listTemplatesInputModel, listTemplatesOutputModel,
    getTemplateInputModel, getTemplateOutputModel,
    publishAsTemplateInputModel, publishAsTemplateOutputModel,
    unpublishTemplateInputModel, unpublishTemplateOutputModel,
    cloneTemplateInputModel, cloneTemplateOutputModel,
} from "./model";

const getPath = generatePath("/template");
const TAGS = ["Template"];

export const templateRouter = router({
    listCategories: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listCategories"), tags: TAGS } })
        .input(listCategoriesInputModel).output(listCategoriesOutputModel)
        .query(async () => templateService.listCategories()),

    listTemplates: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listTemplates"), tags: TAGS } })
        .input(listTemplatesInputModel).output(listTemplatesOutputModel)
        .query(async ({ input }) => templateService.listTemplates(input ?? {})),

    getTemplate: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getTemplate"), tags: TAGS } })
        .input(getTemplateInputModel).output(getTemplateOutputModel)
        .query(async ({ input }) => templateService.getTemplate(input)),

    publishAsTemplate: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/publishAsTemplate"), tags: TAGS, protect: true } })
        .input(publishAsTemplateInputModel).output(publishAsTemplateOutputModel)
        .mutation(async ({ input, ctx }) => templateService.publishAsTemplate({ ...input, userId: ctx.user.id })),

    unpublishTemplate: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/unpublishTemplate"), tags: TAGS, protect: true } })
        .input(unpublishTemplateInputModel).output(unpublishTemplateOutputModel)
        .mutation(async ({ input, ctx }) => { await templateService.unpublishTemplate({ formId: input.formId, userId: ctx.user.id }); return { success: true }; }),

    cloneTemplate: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/cloneTemplate"), tags: TAGS, protect: true } })
        .input(cloneTemplateInputModel).output(cloneTemplateOutputModel)
        .mutation(async ({ input, ctx }) => templateService.cloneTemplate({ ...input, userId: ctx.user.id })),
});
