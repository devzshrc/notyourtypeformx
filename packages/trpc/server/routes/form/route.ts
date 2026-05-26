import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "../../services";
import {
    createFormInputModel,
    createFormOutputModel,
    listFormsInputModel,
    listFormOutputModel,
} from "./model";

const getPath = generatePath("/form");
const TAGS = ["Form"];

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { title, description } = input;
            const { id } = await formService.createForm({
                title: input.title,
                description: input.description,
                createdBy: ctx.user.id,
            });
            return { id };
        }),
    listForms: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/listForms"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(listFormsInputModel)
        .output(listFormOutputModel)
        .query(async ({ ctx }) => {
            const forms = await formService.listFormsByUserId({ userId: ctx.user.id });
            return forms;
        }),
});
