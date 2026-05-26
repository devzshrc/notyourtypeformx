import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { eq } from "drizzle-orm";
import {
    createFormInput,
    type CreateFormInputType,
    listFormsByUserIdInput,
    type ListFormsByUserIdInputType,
} from "./model";

export default class UserService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy } = await createFormInput.parseAsync(payload);

        const result = await db
            .insert(formsTable)
            .values({
                title,
                description,
                createdBy,
            })
            .returning({
                id: formsTable.id,
            });
        if (!result || (await result).length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the form");
        return {
            id: result[0].id,
        };
    }
    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload);
        const forms = await listFormsByUserIdInput.parseAsync(payload);
        return await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
            })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId));
        return forms;
    }
}
