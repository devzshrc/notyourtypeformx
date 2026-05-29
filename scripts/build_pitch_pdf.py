#!/usr/bin/env python3
"""Render the Schema pitch deck as a PDF (mirrors build_pitch_deck.py)."""
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color

# 13.333 x 7.5 inches -> points (72/in)
W, H = 13.333 * 72, 7.5 * 72

def c(hexv):
    return Color(((hexv >> 16) & 255) / 255, ((hexv >> 8) & 255) / 255, (hexv & 255) / 255)

BG, PANEL = c(0x0F172A), c(0x1E293B)
ACCENT, ACCENT2 = c(0x7C3AED), c(0x22D3EE)
WHITE, MUTED, GREEN = c(0xF8FAFC), c(0x94A3B8), c(0x34D399)

pdf = canvas.Canvas("/Users/dev/Desktop/trpc/Schema-Pitch-Deck.pdf", pagesize=(W, H))
F, FB = "Helvetica", "Helvetica-Bold"

def IX(v): return v * 72
def IY(v): return H - v * 72  # top-origin like slides

def rect(x, y, w, h, col, line=None, lw=1):
    pdf.setFillColor(col)
    if line:
        pdf.setStrokeColor(line); pdf.setLineWidth(lw)
        pdf.rect(IX(x), IY(y) - IX(h), IX(w), IX(h), fill=1, stroke=1)
    else:
        pdf.rect(IX(x), IY(y) - IX(h), IX(w), IX(h), fill=1, stroke=0)

def wrap(txt, font, size, maxw):
    words, lines, cur = txt.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdf.stringWidth(t, font, size) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def text(x, y, s, size, col, bold=False, align="l", maxw=None):
    font = FB if bold else F
    pdf.setFillColor(col); pdf.setFont(font, size)
    lines = wrap(s, font, size, IX(maxw)) if maxw else [s]
    ly = IY(y) - size
    for ln in lines:
        if align == "c": pdf.drawCentredString(IX(x), ly, ln)
        elif align == "r": pdf.drawRightString(IX(x), ly, ln)
        else: pdf.drawString(IX(x), ly, ln)
        ly -= size * 1.25
    return len(lines)

def page(): rect(0, 0, 13.333, 7.5, BG)

def kicker(label):
    rect(0.7, 0.62, 0.12, 0.42, ACCENT)
    text(0.98, 0.72, label.upper(), 13, ACCENT2, True)

def heading(t): text(0.9, 1.05, t, 30, WHITE, True, maxw=11.5)

def bullets(x, y, items, size=17, gap=0.34, maxw=6.0):
    cy = y
    for it in items:
        if isinstance(it, tuple):
            head = it[0]; body = it[1] if len(it) > 1 else None
        else:
            head, body = it, None
        pdf.setFont(FB, size); pdf.setFillColor(WHITE)
        pdf.drawString(IX(x), IY(cy) - size, "▸  " + head)
        hw = pdf.stringWidth("▸  " + head, FB, size)
        if body:
            pdf.setFont(F, size - 3); pdf.setFillColor(MUTED)
            pdf.drawString(IX(x) + hw + 6, IY(cy) - size, "—  " + body)
        cy += gap
    return cy

# 1. Title
page()
rect(0, 6.95, 13.333, 0.55, ACCENT)
rect(0.9, 2.35, 0.18, 1.6, ACCENT)
text(1.3, 2.55, "Schema", 60, WHITE, True)
text(1.32, 3.75, "AI-Powered Form Builder", 28, ACCENT2, True)
text(1.32, 4.55, "Build forms by hand or generate them with AI. Collaborate in team workspaces. Publish, embed, collect responses, and track analytics — all type-safe, end to end.", 17, MUTED, maxw=10.8)
text(1.32, 6.2, "notyourtypeformx  ·  Pitch Deck", 13, MUTED, True)
pdf.showPage()

# 2. Problem
page(); kicker("Problem"); heading("Form tools force a trade-off")
bullets(0.95, 2.3, [
    ("Polished but locked-in", "Typeform-class UX — expensive, closed, hard to self-host."),
    ("Powerful but ugly", "Open/free builders are clunky, dated, break on mobile."),
    ("AI bolted on as an afterthought", "A chatbot, not real form generation you can trust."),
    ("No real collaboration", "Shared logins or copy-pasted links; no roles, no workspaces."),
    ("Type drift between front and back end", "A backend change silently breaks the UI."),
], size=19, gap=0.62, maxw=11.5)
pdf.showPage()

# 3. Solution
page(); kicker("Solution"); heading("One platform, three superpowers")
for i, (t, d, col) in enumerate([
    ("Create", "Hand-build or AI-generate forms with 14 field types, logic jumps & scoring.", ACCENT),
    ("Collaborate", "Team workspaces with OWNER / ADMIN / EDITOR / VIEWER roles & invites.", ACCENT2),
    ("Convert", "Publish, embed, QR — then watch responses & completion rate live.", GREEN)]):
    x = 0.95 + i * 4.12
    rect(x, 2.3, 3.8, 3.6, PANEL); rect(x, 2.3, 3.8, 0.14, col)
    text(x + 0.3, 3.0, t, 25, col, True)
    text(x + 0.3, 3.75, d, 16, WHITE, maxw=3.2)
pdf.showPage()

# 4. Product
page(); kicker("Product"); heading("Everything a form needs — in the box")
bullets(0.95, 2.3, [
    ("14 field types", "text, choice, rating, date & more"),
    ("Logic jumps & scoring", "branch by answer; build quizzes"),
    ("Drag-drop + bulk import", "reorder, duplicate, paste a list"),
    ("Themes & screens", "welcome / thank-you / redirect"),
], size=17, gap=0.6, maxw=6.0)
bullets(7.0, 2.3, [
    ("Public slug + iframe embed", "/f/:slug with embed.js"),
    ("QR codes & draft auto-save", "resume where you left off"),
    ("Access control", "password, response limit, expiry"),
    ("Hidden fields", "capture UTM / query params"),
], size=17, gap=0.6, maxw=5.7)
pdf.showPage()

# 5. AI
page(); kicker("AI"); heading("AI that builds the form, not a chatbot")
bullets(0.95, 2.3, [
    ("Prompt → full form", "title, description & 4–12 typed fields in seconds"),
    ("Improve a label", "one-click rewrite to a clearer question"),
    ("Suggest next fields", "context-aware recommendations"),
    ("Prompt-injection guarded", "attacks fall back to a safe default"),
    ("Zod-validated output", "AI never writes unvalidated data"),
], size=18, gap=0.6, maxw=7.0)
rect(8.4, 2.2, 4.2, 3.6, PANEL); rect(8.4, 2.2, 4.2, 0.14, ACCENT2)
text(8.7, 2.75, "Powered by", 13, MUTED, True)
text(8.7, 3.5, "Groq", 28, WHITE, True)
text(8.7, 4.25, "Llama 3.3 70B", 19, ACCENT2, True)
text(8.7, 4.95, "sub-second generation", 14, MUTED)
pdf.showPage()

# 6. Architecture
page(); kicker("How it works"); heading("End-to-end type safety is the moat")
flow = ["Postgres + Drizzle", "Services", "tRPC router", "Next.js UI"]
for i, label in enumerate(flow):
    x = 0.95 + i * 3.0
    rect(x, 2.7, 2.5, 1.4, PANEL, line=ACCENT)
    text(x + 1.25, 3.3, label, 15, WHITE, True, align="c")
    if i < 3: text(x + 2.75, 3.3, "→", 26, ACCENT2, True, align="c")
bullets(0.95, 4.55, [
    ("One contract, zero codegen", "the router defines the API once; the UI infers types"),
    ("Backend change → UI fails to compile", "no silent drift, fewer prod bugs"),
    ("Same router = REST + tRPC + OpenAPI", "auto Scalar docs at /docs"),
], size=16, gap=0.55, maxw=11.6)
pdf.showPage()

# 7. Teams
page(); kicker("Teams"); heading("Built for teams, not just individuals")
bullets(0.95, 2.3, [
    ("Workspaces with real RBAC", "OWNER / ADMIN / EDITOR / VIEWER, enforced server-side"),
    ("Secure email invitations", "signed tokens, 7-day expiry, email-match on accept"),
    ("Full member management", "invite, remove, change role, leave, revoke"),
    ("Forms move freely", "between personal space and shared workspaces"),
    ("Templates & cloning", "publish a form as a template; clone public forms"),
], size=19, gap=0.62, maxw=11.5)
pdf.showPage()

# 8. Analytics
page(); kicker("Analytics"); heading("Know what's working — in real time")
for i, (t, col) in enumerate([("Views", ACCENT2), ("Starts", ACCENT), ("Submissions", GREEN), ("Completion %", WHITE)]):
    x = 0.95 + i * 3.0
    rect(x, 2.5, 2.6, 1.7, PANEL); rect(x, 2.5, 2.6, 0.12, col)
    text(x + 1.3, 3.5, t, 17, WHITE, True, align="c")
bullets(0.95, 4.7, [
    ("Live dashboard", "share tab polls every 5 seconds"),
    ("Time-series & admin stats", "trends per form and across all forms"),
    ("Response browser", "date filters, pagination, XLSX export"),
], size=17, gap=0.5, maxw=11.6)
pdf.showPage()

# 9. Stack
page(); kicker("Stack"); heading("Modern, boring-where-it-counts stack")
rows = [
    ("Monorepo", "Turborepo · pnpm workspaces"),
    ("Frontend", "Next.js 16 · React 19 · Tailwind v4 · Radix · Motion"),
    ("API", "Express 5 · tRPC v11 · TanStack Query · OpenAPI/Scalar"),
    ("Data", "PostgreSQL 15 · Drizzle ORM · Zod v4"),
    ("Auth", "JWT (httpOnly cookies) · bcrypt"),
    ("AI", "Groq SDK · Llama 3.3 70B"),
]
y = 2.15
for i, (k, v) in enumerate(rows):
    rect(0.95, y, 11.4, 0.72, PANEL if i % 2 == 0 else BG)
    text(1.2, y + 0.5, k, 17, ACCENT2, True)
    text(4.2, y + 0.5, v, 16, WHITE)
    y += 0.78
pdf.showPage()

# 10. Differentiation
page(); kicker("Why Schema"); heading("The open, type-safe Typeform alternative")
hdr = ["", "Schema", "Typeform", "OSS builders"]
data = [
    ("Beautiful UX", "yes", "yes", "no"),
    ("Real AI generation", "yes", "partial", "no"),
    ("Team RBAC + invites", "yes", "paid", "rare"),
    ("Self-host / own data", "yes", "no", "yes"),
    ("End-to-end type safety", "yes", "n/a", "rare"),
]
cw = [4.2, 2.5, 2.5, 2.5]; x0, y = 0.95, 2.2
cx = x0
for j, h in enumerate(hdr):
    rect(cx, y, cw[j], 0.65, ACCENT if j == 1 else PANEL)
    text(cx + cw[j] / 2, y + 0.46, h, 15, WHITE, True, align="c")
    cx += cw[j]
y += 0.7
sym = {"yes": ("✓", GREEN), "no": ("—", MUTED), "n/a": ("n/a", MUTED), "partial": ("partial", WHITE), "paid": ("paid tiers", WHITE), "rare": ("rare", WHITE)}
for row in data:
    cx = x0
    for j, cell in enumerate(row):
        rect(cx, y, cw[j], 0.62, PANEL if j == 0 else BG)
        if j == 0:
            text(cx + 0.25, y + 0.44, cell, 15, WHITE, True)
        else:
            t, col = sym[cell]
            text(cx + cw[j] / 2, y + 0.44, t, 14, col, align="c")
        cx += cw[j]
    y += 0.66
pdf.showPage()

# 11. Live
page(); kicker("Live"); heading("Shipped & running today")
bullets(0.95, 2.3, [
    ("Full platform live", "auth, forms, AI, workspaces, submissions, analytics"),
    ("Production deploy", "notyourtypeformx.onrender.com"),
    ("Type-checked & linted", "green build across the monorepo"),
    ("Seeded demo data", "forms, responses, workspace, templates"),
], size=18, gap=0.6, maxw=7.2)
rect(8.5, 2.2, 4.1, 3.3, PANEL); rect(8.5, 2.2, 4.1, 0.14, GREEN)
text(8.8, 2.7, "Try it — demo login", 14, GREEN, True)
text(8.8, 3.45, "alice@schema.dev", 19, WHITE, True)
text(8.8, 4.1, "Password123!", 17, ACCENT2, True)
text(8.8, 4.85, "/f/customer-feedback   ·   /templates", 13, MUTED)
pdf.showPage()

# 12. Roadmap + Ask
page(); kicker("What's next"); heading("Roadmap & the ask")
text(0.95, 2.15, "ROADMAP", 15, ACCENT2, True)
bullets(0.95, 2.65, [
    ("Payments & paid plans",), ("Webhooks & integrations (Zapier, Slack)",),
    ("File uploads & e-signatures",), ("Advanced analytics & A/B tests",),
    ("Custom domains for public forms",),
], size=16, gap=0.5, maxw=6.0)
text(7.2, 2.15, "THE ASK", 15, ACCENT2, True)
rect(7.2, 2.55, 5.4, 3.4, PANEL)
text(7.5, 3.1, "Looking for", 15, MUTED, True)
text(7.5, 3.7, "design partners + early teams", 20, WHITE, True, maxw=4.9)
text(7.5, 4.6, "to shape the roadmap and prove the team-collaboration wedge.", 15, MUTED, maxw=4.8)
rect(0, 7.0, 13.333, 0.5, ACCENT)
pdf.showPage()

pdf.save()
print("Saved: /Users/dev/Desktop/trpc/Schema-Pitch-Deck.pdf")
