import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import FormFieldService from "@repo/services/form-field";
import SubmissionService from "@repo/services/submission";
import WorkspaceService from "@repo/services/workspace";
import TemplateService from "@repo/services/template";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const submissionService = new SubmissionService();
export const workspaceService = new WorkspaceService();
export const templateService = new TemplateService();
