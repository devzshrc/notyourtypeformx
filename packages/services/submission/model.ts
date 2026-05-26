import { z } from "zod";

export const submitFormInput = z.object({
    formId: z.uuid(),
    data: z.record(z.string(), z.unknown()),
});
export type SubmitFormInputType = z.infer<typeof submitFormInput>;

export const listSubmissionsInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
});
export type ListSubmissionsInputType = z.infer<typeof listSubmissionsInput>;

export const recordEventInput = z.object({
    formId: z.uuid(),
    type: z.enum(["VIEW", "START"]),
});
export type RecordEventInputType = z.infer<typeof recordEventInput>;

export const getAnalyticsInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
});
export type GetAnalyticsInputType = z.infer<typeof getAnalyticsInput>;
