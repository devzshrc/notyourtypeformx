import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "../../services";
import {
    createFormInputModel,
    createFormOutputModel,
    listFormsInputModel,
    listFormOutputModel,
    getFormInputModel,
    getFormOutputModel,
    updateFormInputModel,
    updateFormOutputModel,
    deleteFormInputModel,
    deleteFormOutputModel,
} from "./model";

const getPath = generatePath("/form");
const TAGS = ["Form"];

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createForm"), tags: TAGS, protect: true } })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formService.createForm({ ...input, createdBy: ctx.user.id });
        }),

    listForms: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listForms"), tags: TAGS, protect: true } })
        .input(listFormsInputModel)
        .output(listFormOutputModel)
        .query(async ({ ctx }) => {
            return await formService.listFormsByUserId({ userId: ctx.user.id });
        }),

    getForm: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getForm"), tags: TAGS, protect: true } })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({ input, ctx }) => {
            return await formService.getFormById({ formId: input.formId, userId: ctx.user.id });
        }),

    updateForm: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/updateForm"), tags: TAGS, protect: true } })
        .input(updateFormInputModel)
        .output(updateFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formService.updateForm({ ...input, userId: ctx.user.id });
        }),

    deleteForm: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteForm"), tags: TAGS, protect: true } })
        .input(deleteFormInputModel)
        .output(deleteFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            return await formService.deleteForm({ formId: input.formId, userId: ctx.user.id });
        }),
});
