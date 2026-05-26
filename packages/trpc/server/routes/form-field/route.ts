import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formFieldService } from "../../services";
import {
    addFieldInputModel,
    addFieldOutputModel,
    listFieldsInputModel,
    listFieldsOutputModel,
    updateFieldInputModel,
    updateFieldOutputModel,
    deleteFieldInputModel,
    deleteFieldOutputModel,
    reorderFieldsInputModel,
    reorderFieldsOutputModel,
} from "./model";

const getPath = generatePath("/form-field");
const TAGS = ["Form Field"];

export const formFieldRouter = router({
    addField: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/addField"), tags: TAGS, protect: true } })
        .input(addFieldInputModel)
        .output(addFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formFieldService.addField({ ...input, userId: ctx.user.id });
        }),

    listFields: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listFields"), tags: TAGS, protect: true } })
        .input(listFieldsInputModel)
        .output(listFieldsOutputModel)
        .query(async ({ input, ctx }) => {
            return await formFieldService.listFields({ formId: input.formId, userId: ctx.user.id });
        }),

    updateField: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/updateField"), tags: TAGS, protect: true } })
        .input(updateFieldInputModel)
        .output(updateFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formFieldService.updateField({ ...input, userId: ctx.user.id });
        }),

    deleteField: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteField"), tags: TAGS, protect: true } })
        .input(deleteFieldInputModel)
        .output(deleteFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formFieldService.deleteField({ ...input, userId: ctx.user.id });
        }),

    reorderFields: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/reorderFields"), tags: TAGS, protect: true } })
        .input(reorderFieldsInputModel)
        .output(reorderFieldsOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formFieldService.reorderFields({ ...input, userId: ctx.user.id });
        }),
});
