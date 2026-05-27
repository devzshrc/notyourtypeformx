import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
    usersTable,
    workspacesTable,
    workspaceMembersTable,
    workspaceInvitationsTable,
    templateCategoriesTable,
    formsTable,
    formsFieldsTable,
    formFieldOptionsTable,
    submissionsTable,
    formEventsTable,
} from "./schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

function labelKey(label: string): string {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

type SeedField = {
    label: string;
    type:
        | "TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "PHONE" | "WEBSITE" | "DATE"
        | "YES_NO" | "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN" | "RATING" | "PASSWORD" | "STATEMENT";
    isRequired?: boolean;
    placeholder?: string;
    options?: string[];
};

async function insertFields(formId: string, fields: SeedField[]) {
    const created: { id: string; labelKey: string; field: SeedField }[] = [];
    for (let i = 0; i < fields.length; i++) {
        const f = fields[i]!;
        const lk = labelKey(f.label);
        const [row] = await db
            .insert(formsFieldsTable)
            .values({
                formId,
                label: f.label,
                labelKey: lk,
                placeholder: f.placeholder ?? null,
                isRequired: f.isRequired ?? false,
                index: String(i),
                type: f.type,
            })
            .returning({ id: formsFieldsTable.id });
        if (f.options?.length) {
            await db.insert(formFieldOptionsTable).values(
                f.options.map((label, idx) => ({ fieldId: row!.id, label, index: String(idx) })),
            );
        }
        created.push({ id: row!.id, labelKey: lk, field: f });
    }
    return created;
}

// ─── Seed ───────────────────────────────────────────────────────────────────

async function seed() {
    console.log("🧹 Clearing existing data...");
    // Delete in FK-safe order
    await db.delete(formEventsTable);
    await db.delete(submissionsTable);
    await db.delete(formFieldOptionsTable);
    await db.delete(formsFieldsTable);
    await db.delete(formsTable);
    await db.delete(workspaceInvitationsTable);
    await db.delete(workspaceMembersTable);
    await db.delete(workspacesTable);
    await db.delete(templateCategoriesTable);
    await db.delete(usersTable);

    console.log("👤 Creating users...");
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const [alice] = await db.insert(usersTable).values({ fullName: "Alice Owner", email: "alice@schema.dev", passwordHash }).returning({ id: usersTable.id });
    const [bob] = await db.insert(usersTable).values({ fullName: "Bob Editor", email: "bob@schema.dev", passwordHash }).returning({ id: usersTable.id });
    const [carol] = await db.insert(usersTable).values({ fullName: "Carol Viewer", email: "carol@schema.dev", passwordHash }).returning({ id: usersTable.id });

    console.log("🏢 Creating workspace + members...");
    const [acme] = await db.insert(workspacesTable).values({ name: "Acme Inc", slug: "acme-inc", ownerId: alice!.id }).returning({ id: workspacesTable.id });
    await db.insert(workspaceMembersTable).values([
        { workspaceId: acme!.id, userId: alice!.id, role: "OWNER", joinedAt: new Date() },
        { workspaceId: acme!.id, userId: bob!.id, role: "EDITOR", joinedAt: new Date() },
        { workspaceId: acme!.id, userId: carol!.id, role: "VIEWER", joinedAt: new Date() },
    ]);
    // A pending invitation (visible under Pending Invitations + testable at /invite/<token>)
    await db.insert(workspaceInvitationsTable).values({
        workspaceId: acme!.id,
        email: "dave@schema.dev",
        role: "EDITOR",
        invitedBy: alice!.id,
        token: "seedtoken_dave_acme_0000000000000000000000000000",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("🗂️  Creating template categories...");
    const cats = await db.insert(templateCategoriesTable).values([
        { name: "Feedback", slug: "feedback", description: "Surveys and feedback forms", icon: "MessageSquare", index: "0" },
        { name: "HR & Recruiting", slug: "hr", description: "Hiring and HR forms", icon: "Briefcase", index: "1" },
        { name: "Events", slug: "events", description: "RSVPs and registrations", icon: "Calendar", index: "2" },
        { name: "Marketing", slug: "marketing", description: "Lead capture and signups", icon: "Megaphone", index: "3" },
    ]).returning({ id: templateCategoriesTable.id, slug: templateCategoriesTable.slug });
    const hrCat = cats.find((c) => c.slug === "hr")!;

    console.log("📝 Creating forms + fields...");

    // 1) Alice personal PUBLISHED form: Customer Feedback (has submissions + analytics)
    const [feedback] = await db.insert(formsTable).values({
        title: "Customer Feedback",
        description: "Tell us how we did",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        slug: "customer-feedback",
        welcomeTitle: "We value your feedback",
        welcomeDescription: "Takes less than 2 minutes.",
        endingTitle: "Thank you!",
        endingDescription: "Your response was recorded.",
        theme: "bold-tech",
        createdBy: alice!.id,
    }).returning({ id: formsTable.id });
    const fbFields = await insertFields(feedback!.id, [
        { label: "Your name", type: "TEXT", isRequired: true, placeholder: "Jane Doe" },
        { label: "Email", type: "EMAIL", isRequired: true, placeholder: "jane@example.com" },
        { label: "How would you rate us?", type: "RATING", isRequired: true },
        { label: "How did you hear about us?", type: "MULTIPLE_CHOICE", isRequired: false, options: ["Search", "Social media", "Friend", "Other"] },
        { label: "Any additional comments?", type: "LONG_TEXT", isRequired: false, placeholder: "Optional" },
    ]);
    const fbKey = (l: string) => fbFields.find((x) => x.field.label === l)!.labelKey;

    // Submissions for Customer Feedback
    const fbSubmissions = [
        { [fbKey("Your name")]: "John Smith", [fbKey("Email")]: "john@example.com", [fbKey("How would you rate us?")]: 5, [fbKey("How did you hear about us?")]: "Search", [fbKey("Any additional comments?")]: "Great service!" },
        { [fbKey("Your name")]: "Mary Jones", [fbKey("Email")]: "mary@example.com", [fbKey("How would you rate us?")]: 4, [fbKey("How did you hear about us?")]: "Friend", [fbKey("Any additional comments?")]: "" },
        { [fbKey("Your name")]: "Sam Lee", [fbKey("Email")]: "sam@example.com", [fbKey("How would you rate us?")]: 3, [fbKey("How did you hear about us?")]: "Social media", [fbKey("Any additional comments?")]: "Could be faster." },
    ];
    for (let i = 0; i < fbSubmissions.length; i++) {
        const daysAgo = fbSubmissions.length - i;
        await db.insert(submissionsTable).values({ formId: feedback!.id, data: fbSubmissions[i]!, createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) });
    }
    // Events for analytics (10 views, 5 starts → 30% completion with 3 submissions)
    await db.insert(formEventsTable).values([
        ...Array.from({ length: 10 }, () => ({ formId: feedback!.id, type: "VIEW" as const })),
        ...Array.from({ length: 5 }, () => ({ formId: feedback!.id, type: "START" as const })),
    ]);

    // 2) Workspace PUBLISHED form: Event RSVP
    const [rsvp] = await db.insert(formsTable).values({
        title: "Acme Launch RSVP",
        description: "RSVP for our product launch",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        slug: "acme-launch-rsvp",
        theme: "minimal",
        createdBy: alice!.id,
        workspaceId: acme!.id,
    }).returning({ id: formsTable.id });
    const rsvpFields = await insertFields(rsvp!.id, [
        { label: "Full name", type: "TEXT", isRequired: true },
        { label: "Will you attend?", type: "YES_NO", isRequired: true },
        { label: "Number of guests", type: "NUMBER", isRequired: false, placeholder: "0" },
        { label: "Dietary preference", type: "DROPDOWN", isRequired: false, options: ["No preference", "Vegetarian", "Vegan", "Gluten-free"] },
    ]);
    const rsvpKey = (l: string) => rsvpFields.find((x) => x.field.label === l)!.labelKey;
    await db.insert(submissionsTable).values([
        { formId: rsvp!.id, data: { [rsvpKey("Full name")]: "Priya Patel", [rsvpKey("Will you attend?")]: "yes", [rsvpKey("Number of guests")]: 2, [rsvpKey("Dietary preference")]: "Vegetarian" } },
        { formId: rsvp!.id, data: { [rsvpKey("Full name")]: "Tom Brown", [rsvpKey("Will you attend?")]: "no", [rsvpKey("Number of guests")]: 0, [rsvpKey("Dietary preference")]: "No preference" } },
    ]);
    await db.insert(formEventsTable).values([
        ...Array.from({ length: 6 }, () => ({ formId: rsvp!.id, type: "VIEW" as const })),
        ...Array.from({ length: 3 }, () => ({ formId: rsvp!.id, type: "START" as const })),
    ]);

    // 3) Alice DRAFT form (password protected, response limit) — tests settings + access control
    const [draft] = await db.insert(formsTable).values({
        title: "Beta Signup",
        description: "Join the beta",
        status: "DRAFT",
        visibility: "UNLISTED",
        slug: "beta-signup",
        password: "secret123",
        maxResponses: 100,
        theme: "bold-tech",
        createdBy: alice!.id,
    }).returning({ id: formsTable.id });
    await insertFields(draft!.id, [
        { label: "Work email", type: "EMAIL", isRequired: true },
        { label: "Company website", type: "WEBSITE", isRequired: false },
    ]);

    // 4) Public SYSTEM TEMPLATE: Job Application (browsable + clonable at /templates)
    const [template] = await db.insert(formsTable).values({
        title: "Job Application",
        description: "Standard job application form",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        isTemplate: true,
        isSystemTemplate: true,
        categoryId: hrCat.id,
        slug: "job-application-template",
        theme: "minimal",
        createdBy: alice!.id,
    }).returning({ id: formsTable.id });
    await insertFields(template!.id, [
        { label: "Full name", type: "TEXT", isRequired: true },
        { label: "Email", type: "EMAIL", isRequired: true },
        { label: "Phone", type: "PHONE", isRequired: true },
        { label: "Position applying for", type: "DROPDOWN", isRequired: true, options: ["Engineering", "Design", "Sales", "Marketing"] },
        { label: "Resume / portfolio URL", type: "WEBSITE", isRequired: false },
        { label: "Why do you want to work here?", type: "LONG_TEXT", isRequired: true },
    ]);

    console.log("\n✅ Seed complete.\n");
    console.log("─────────────────────────────────────────────");
    console.log("Test accounts (password for all: Password123!)");
    console.log("─────────────────────────────────────────────");
    console.log("  alice@schema.dev  — workspace OWNER, owns all seeded forms");
    console.log("  bob@schema.dev    — Acme Inc EDITOR");
    console.log("  carol@schema.dev  — Acme Inc VIEWER");
    console.log("");
    console.log("Public forms to try:");
    console.log("  /f/customer-feedback   (published, 3 responses, analytics)");
    console.log("  /f/acme-launch-rsvp    (workspace form, 2 responses)");
    console.log("  /f/beta-signup         (DRAFT — not publicly accepting; password: secret123)");
    console.log("");
    console.log("Pending invite (sign in as dave@schema.dev after signup):");
    console.log("  /invite/seedtoken_dave_acme_0000000000000000000000000000");
    console.log("");
    console.log("Templates: /templates  (Job Application under HR & Recruiting)");
    console.log("─────────────────────────────────────────────");
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    });
