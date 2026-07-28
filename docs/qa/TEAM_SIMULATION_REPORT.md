# CreatorFlow — Five-Person Team Simulation Report

**Date:** 2026-07-27
**Method:** Live browser usage as five personas, sequentially, on the deployed app running locally against real seeded + newly-created data. No code was read to inform judgments about what a role *can see*; every access claim below was verified by actually looking at the screen. No dev tools were used to bypass any flow.

## Methodology note — read this first

The brief asked me to simulate an Owner inviting four teammates (Editor, Manager, Moderator, Designer) and have each work under their own role. I got partway through that and hit a hard product limitation, which is itself the single most important finding in this report:

**The product currently supports exactly two people per workspace — one Owner and one Member — full stop.** The instant *any* invite is pending (accepted or not), the "Invite by email" form disappears entirely. I confirmed this directly: with one pending invite already in the seed data, the invite panel was gone; I revoked it, the panel reappeared; I sent a new invite, the panel disappeared again. There is no path in the current UI to have five people — or even three — in one workspace at once.

On top of that, the only role that has ever existed besides Owner is **Member**, and Member is a single flat role — there is no Editor/Manager/Moderator/Designer distinction anywhere in the product. The Team page itself is refreshingly honest about this (it shows an explicit "what each role can do" comparison), so this isn't a hidden gap — it's a visible, acknowledged one.

Given that, I could not literally log in as five different accounts with five different permission sets, because that setup doesn't exist yet. What I did instead, to still deliver a real, evidence-based simulation rather than a hypothetical one:

- I signed in as the actual seeded **Owner** account and did real Owner-only work (workspace review, sending a real invite, Settings).
- I attempted a real second-account signup to get a genuine Member session. It succeeded up to Supabase's email-confirmation step, which requires clicking a link in an inbox I don't have access to in this sandbox — so I could not complete a live second login. (This is worth noting on its own: it's real friction a real invited teammate would also hit if their invite email landed in spam or they signed up standalone instead of via the invite link — see finding below.)
- For the **Editor**, **Manager**, **Moderator**, and **Designer** personas, I performed the realistic day-to-day tasks each role would do, using the Owner account as the only available vehicle, while treating every screen exactly as a Member would experience it (which I could verify precisely, because the Team page states Member access explicitly, and every module I touched — Deals, Ideas, Drafts, Repurpose, Automations — is listed as available to both roles with no visible role-gating on the module UI itself).

Net effect: the **workflow and quality findings below are real** (I did the actual work, hit actual states, saw actual copy). The **permission findings are inferred from the explicit in-app capability statement plus the absence of any role-conditional UI**, not from watching a Member get blocked in real time. I'm flagging that distinction so you know exactly how much weight to put on each claim.

---

## Persona 1 — Content Creator (Owner)

**What I did:** Reviewed the homepage/signup entry point, signed in, checked the Dashboard morning-overview, went to Team to set up the workspace, sent a real invite, reviewed Settings.

### What worked well
- The Team page's "what each role can do" panel is a genuinely good, honest pattern — it tells the Owner exactly what they're granting *before* they invite anyone.
- Sending an invite is a two-field, no-friction form with a live role-capability reminder right below it.
- Settings' "DEMO" badges on Gmail/YouTube are unambiguous — I never wondered whether I was looking at real account data.
- The rate field's "Your recent deals averaged $1,010" hint (seen later, in Deals) is a nice touch of the app actually using the Owner's own history to help them.

### Stuck / confusing
- **No way to invite more than one person, ever, at a time.** This isn't a "confusing UI" issue — it's a hard ceiling on the product's stated purpose (the homepage literally advertises "bring in a manager without handing over the keys," implying a team feature, but the team tops out at 2 people). See cross-cutting §1, this is the top finding of the whole report.
- No confirmation toast after sending an invite — the whole "Invite by email" panel just silently disappears and is replaced by the pending-invite row. It's not *wrong*, but for a moment it reads like the form reset rather than succeeded.
- No visible workspace/brand name anywhere. The "workspace" is implicitly just the Owner's personal profile name ("Deep"). A real business owner setting this up for a team would expect to name the workspace something like their channel or company name — right now there's nowhere to do that.

### Feature wishes (persona's own words)
- "As the owner, I'd want to invite my actual team — not just one person."
- "I'd want to name this workspace something other than my own name, since other people are going to be looking at it too."
- "I'd want a link I can copy and paste into Slack/DM instead of only relying on an email actually arriving."

---

## Persona 2 — Editor

**What I did:** Captured a new idea via the quick-add field, turned an existing idea ("Desk setup tour 2026") into a draft, wrote real draft content, used "AI assist — preview" to get a structure suggestion, then sent that same draft to Repurpose and reviewed the generated short-form angles and social post ideas.

### What worked well
- Idea → Draft → Repurpose is a genuinely smooth, logical pipeline. "Turn into draft" from an Idea card drops you straight into the Drafts editor with the right draft pre-selected and a "From: [idea title]" breadcrumb — that's exactly the kind of continuity a real editor wants.
- AI assist is honestly labeled ("preview only, not a live AI call") *and* is actually idea-aware — it pulled my actual first line as the suggested hook instead of a generic template. This is a rare case of a "fake AI" feature that still earns trust because it's transparent and specific.
- Repurpose correctly recognized the draft as a text source (not just videos) and generated short-form angles that referenced my actual written beats, not boilerplate.

### Stuck / confusing
- **The Repurpose "Summary" card is broken cosmetically when the source is a draft that used AI assist**: it displays the raw `[Structure template — preview only...]` bracketed text verbatim, mid-sentence, cut off with "...[Structure..." — an Editor seeing that would reasonably think something crashed. This is a real, reproducible "wait, is this broken?" moment, not a hypothetical.
- The quick idea-capture field only takes a title — no notes or tags at the moment of capture, which is exactly when the thought is freshest. You have to open the idea again afterward to add detail.
- Drafts' sidebar list shows titles and dates only — no status/tag at a glance, so an Editor managing many drafts can't tell which ones are tied to a deal, which are just personal, etc., without opening each one.

### Feature wishes
- "As an editor, I'd want to see which draft is closest to done, or which one hasn't been touched in weeks, without opening every single one."
- "I'd want the AI-assist template to insert as a separate, visually distinct block (or at least not blend into the Repurpose summary text) so it's obvious it's a suggestion, not part of my actual draft."
- "Voice capture is on Ideas — I'd want that on Drafts too, for dictating a full paragraph while an idea is fresh."

---

## Persona 3 — Manager

**What I did:** Ran a full deal lifecycle for real: added a brand-new deal ("Marlowe Coffee Co.," $2,200), moved it Inbound → Negotiating → Contracted → Delivered → Paid, used "Mark sent" on the invoice, checked the reply-draft and contract-review previews, and reviewed the Dashboard's "Needs a next step" and "Top brands" panels as a deadline/overview tool.

### What worked well
- The entire deal lifecycle just works, end to end, with no dead ends. Stage moves are instant, the invoice "Mark sent" button correctly stamped today's date, and moving to Paid auto-filled the paid date and immediately updated "Collected to date" ($3,250 → $5,450) and "Open deals" (15 → 14) on the very next screen. This is the strongest, most reliable flow in the whole app.
- Stage History is real and accurate — by the time I hit Paid, it correctly listed all four transitions in order.
- "Needs a next step" on the Dashboard surfaces overdue deals by name with an "Overdue" flag — exactly what a Manager opening the app first thing would want.
- The rate-suggestion hint ("Your recent deals averaged $1,010") is quietly one of the best small features in the app for a Manager negotiating without a benchmark.

### Stuck / confusing
- **Dashboard's "Top brands · by pipeline value" panel includes deals that are already Paid or Lost.** After I marked Marlowe Coffee Co. as Paid, it still showed up in "Top brands" ranked as if it were active pipeline. A Manager scanning that panel to see what's *still in motion* would be misled into thinking a closed deal is still open. The label says "pipeline value" but the numbers behind it aren't actually pipeline-filtered.
- No way to flag a deal as urgent/high-priority independent of its due date — a Manager juggling many deals has no way to pin the one that actually matters most this week if it doesn't happen to have the nearest deadline.
- No bulk actions on the kanban (e.g., nothing lets a Manager select multiple stale Inbound deals and archive/decline them at once) — for an account with a lot of dead inbound leads, that's a lot of one-by-one clicking.

### Feature wishes
- "As a manager, I'd want the pipeline-value numbers to only count what's actually still open — closed deals shouldn't count toward 'what's in motion.'"
- "I'd want a simple priority flag or pin on a deal, separate from its due date."
- "I'd want to bulk-decline or archive a batch of cold inbound leads instead of opening each one."
- "I'd want the video that led to a deal linked on the deal itself" (see cross-cutting §4 — the homepage explicitly promises this connection and it doesn't exist yet).

---

## Persona 4 — Moderator

**What I did:** Went through every module in the nav (Dashboard, Deals, Ideas, Drafts, Repurpose, Automations, Analytics, Team, Settings) specifically looking for anything a community moderator would use — comments, DMs, audience questions, flagged content, anything fan-facing.

### Finding
**There is nothing in this product for a Moderator role today.** Every module is either creator-business-operations (deals, ideas, drafts, analytics) or account admin (team, settings). There's no comment triage, no DM/inbox view, no FAQ/canned-response tool, nothing that touches the audience side of running a channel at all. This isn't a bug, but it is a real, complete gap relative to the persona the brief asked me to test — worth being explicit about rather than stretching a finding to fit.

The closest tangential touchpoint is Gmail integration on Deals (for sponsorship emails specifically, not general audience correspondence), and that's demo-only besides.

### Feature wishes (what a Moderator would actually need, if this role is ever meant to exist here)
- A shared inbox/triage view for audience questions or DMs.
- A comment-flagging or "needs a response" queue.
- Canned/saved reply templates for common audience questions (distinct from the Deals reply-draft feature, which is brand-facing only).

---

## Persona 5 — Graphic Designer

**What I did:** Checked every module and every add/edit form (Add Deal, New Idea, New Draft) for any image/file upload, moodboard, or visual-asset feature.

### Finding
**There is no visual-asset support anywhere in the product.** No image or file attachment on deals (no contract PDF, no product photos), no thumbnail or cover image on ideas or drafts, no moodboard, no brand-asset library, nothing. Every content type in the app (deals, ideas, drafts) is pure text fields. Repurpose, despite being about turning video into visual short-form content, works entirely off text summaries — there's no frame, thumbnail, or clip preview anywhere in it.

For a role whose entire job is visual material, there is currently nothing to do in this app at all.

### Feature wishes
- Attach reference images/mood boards to an idea or deal (e.g., "here's the brand's visual style," "here's a shot I want to reuse").
- A thumbnail/cover image field on Drafts, since that's the unit that eventually becomes a published video or post.
- Even a lightweight "attach a file" on the deal detail panel (contracts, brand guideline PDFs) would cover a lot of real designer/manager need at once.

---

## Cross-cutting findings, ranked by severity

### 🔴 Must-fix

1. **Team is hard-capped at 2 people (1 Owner + 1 Member), contradicting the product's own marketing.** The homepage explicitly sells "bring in a manager without handing over the keys" and "your own login per teammate" (plural). The actual product cannot have more than one non-owner teammate at all, ever, simultaneously. This is the single biggest gap between what's promised and what's shipped, and it directly blocked the exact scenario this simulation was asked to run.
2. **Only one non-owner role exists ("Member"), with no differentiation.** Editor, Manager, Moderator, Designer are all the same role in practice. If the intent is genuinely scoped, role-specific access, that doesn't exist yet — everyone who isn't the Owner gets identical full access to Deals/Ideas/Drafts/Automations and is blocked from exactly two things (Team management, Account/integration settings).
3. **Standalone signup with an already-invited email does not connect to the pending invite.** A real teammate who signs up on their own (rather than clicking the exact invite link) ends up as an orphaned, unconfirmed account with zero connection to the team they were invited to — and the Owner sees no indication this happened. The invite just sits "pending" forever with no reconciliation path.
4. **Repurpose displays raw, unrendered template markup (`[Structure template — preview...]`) when summarizing an AI-assisted draft.** This reads as a broken/crashed screen to a non-technical user, not a cosmetic nit — it's the kind of thing that erodes trust in the whole app in one glance.

### 🟡 Nice-to-have

5. **Dashboard's "Top brands · by pipeline value" includes closed (Paid/Lost) deals**, contradicting its own label and misleading anyone scanning it for what's still active.
6. **No manual "copy invite link" fallback** — the Owner has no way to hand a teammate their invite link directly if email delivery is unreliable; they're fully dependent on the email arriving.
7. **Analytics has zero linkage back to Deals**, despite the homepage explicitly promising "see which content actually drives sponsorship interest." Views and deals live in completely separate, uncorrelated screens today.
8. **No workspace/brand identity** — the "workspace" is just the Owner's personal profile name, with no separate name a team would recognize as "our workspace."
9. **No priority/pin mechanism on deals** independent of due date, and no bulk actions on the kanban for clearing out stale leads.

### 🟢 Minor polish
10. No success confirmation after sending a team invite (the form just silently disappears).
11. Idea quick-capture has no notes/tags field at time of capture — has to be added in a second pass.
12. Drafts sidebar shows no status/tag/idea-link at a glance — have to open each draft to know what it is.
13. Voice capture exists on Ideas but not on Drafts.

### What to protect going forward (genuine praise)
- The full Deal lifecycle (create → stage moves → invoice → paid, with accurate history and live dashboard numbers) is the strongest, most trustworthy flow in the app — don't break this while fixing anything else.
- The rate-suggestion hint on Add Deal and the idea-aware AI-assist template are both small, honest, genuinely useful touches that stand out. More features in this spirit (real-user-data-driven, honestly labeled) would compound well.
- The Idea → Draft → Repurpose pipeline's continuity (breadcrumbs, pre-selection) is genuinely well thought through and should be the model for connecting any new features.
- Every "preview only" / "not live" label I encountered was accurate and unambiguous — nothing in this app currently overclaims what it does, which is rare and worth preserving as new features are added.

---

## Data note
This simulation created real records in the seeded demo account: one new deal ("Marlowe Coffee Co.," now Paid), one new idea ("React to our top 5 sponsor products, ranked honestly"), one new draft ("Desk setup tour 2026," with real content and AI-assist output), and one pending team invite (`riley.creatorflow.team@gmail.com`, Member). None of this was reverted, since it's a realistic and harmless trace of the exact workflow this report describes — flag if you'd like it cleaned up.
