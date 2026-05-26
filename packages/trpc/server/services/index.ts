import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import FormFieldService from "@repo/services/form-field";
import SubmissionService from "@repo/services/submission";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const submissionService = new SubmissionService();
