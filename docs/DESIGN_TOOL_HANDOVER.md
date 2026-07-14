# CreatorFlow — Design Handover: Claude Design, Google Stitch, v0

**Attach to every tool below, alongside its prompt:**
1. `design.pdf` — the design token reference (colors, type, spacing, radii, shadows)
2. `CreatorFlow_UIUX_Designer_Brief.md` — the full content/copy brief (every screen's real copy, empty states, and functional requirements, already written — no design direction included)

Each tool gets its own kickoff prompt below, shaped to how that specific tool actually works best (confirmed against each tool's current documentation). Don't reuse one prompt across all three — the structure matters.

---

## 1. Claude Design

**Why this shape:** Claude Design can build a complete multi-screen user flow in a single conversation when you walk it through the journey step by step, and it extracts a design system directly from an attached file rather than needing every token restated in the prompt. It also improves with incremental, specific follow-up requests rather than one giant do-everything prompt.

**Setup:** Create a new Project → choose **Prototype** → High Fidelity → import both attached files (design.pdf as the design system, the brief as content reference).

**Kickoff prompt (marketing site):**
```
I'm building CreatorFlow, a free tool that helps content creators manage brand 
sponsorship deals, content ideas, drafts, video repurposing, and channel analytics 
in one place — with no cut taken from any deal, ever. Audience: creators who are 
serious about their channel but not yet earning six figures.

Use the attached design.pdf as the design system for this project — colors, type, 
spacing, and component styling should come from it. Use the attached content brief 
for all copy — use it as written, don't invent new headlines or body text.

Build the marketing site as a connected flow: Landing page → How It Works → Pricing. 
Walk through it as a journey a prospective creator would take, not three disconnected 
pages.
```

**Follow-up prompt (app flow — send after reviewing the marketing site):**
```
Now build the core app flow as a connected journey: Onboarding (welcome → connect 
YouTube → connect Gmail → done) → Dashboard → Deals. Use the same content brief for 
copy and the same design system. Show what a new user sees moving through onboarding 
into their first look at Deals with no data yet (the empty state matters as much as 
the populated state).
```

**Further follow-ups (send one at a time, referencing the brief by screen name):**
```
Now add Ideas and Drafts, following the same design system and the brief's content 
for those sections.
```
```
Now add Repurpose and Automations.
```
```
Now add Analytics, Team, and Settings.
```

**Iteration tip:** give specific feedback, not vague reactions — e.g. "tighten the spacing on the Deals pipeline cards" rather than "this doesn't feel right yet."

---

## 2. Google Stitch

**Why this shape:** Stitch's own guidance warns against long, dense prompts — it works in a "zoom-out, then zoom-in" pattern, and drifts toward its own Material Design defaults unless explicitly told to stick to an attached palette. Build screen by screen, not all at once.

**Setup:** Standard mode (Gemini 2.5 Flash) for exploring directions fast; switch to Experimental/Pro mode for the final pass once you've picked a direction, since Pro also supports image reference input.

**Zoom-out kickoff prompt:**
```
CreatorFlow is a free tool for content creators to manage brand deals, content 
ideas, drafts, video repurposing, and channel analytics in one place. Audience: 
creators who are serious about their channel but not yet earning six figures. Tone: 
direct, plain, respectful of the creator's time — not corporate, not hype-y.

Strictly use the colors, fonts, and spacing from the attached design.pdf — do not 
substitute your own default palette or Material Design styling. Use the attached 
content brief for exact copy on every screen going forward.
```

**Then zoom in — one prompt per screen, sent in sequence (Stitch handles single-screen, specific requests far better than multi-screen asks):**
```
Design the Landing page. Use the Landing section of the attached content brief for 
copy.
```
```
Design the Pricing page ("Free"). Use the Pricing section of the brief for copy.
```
```
Design the Onboarding flow (3 steps: connect YouTube, connect Gmail, done). Use the 
Onboarding section of the brief.
```
```
Design the Dashboard, including its empty state for a brand-new user. Use the 
Dashboard section of the brief.
```
```
Design the Deals screen, including the empty state and the deal pipeline stages. Use 
the Deals section of the brief.
```
```
Design Ideas and Drafts. Use those sections of the brief.
```
```
Design Repurpose and Automations. Use those sections of the brief.
```
```
Design Analytics, Team, and Settings. Use those sections of the brief.
```

**If output drifts from the palette:** follow up with a short, targeted correction like "Use #918df6 for the primary action only, not this purple" rather than re-sending the whole brief.

---

## 3. v0 (Vercel)

**Why this shape:** v0 is code-first (React + Tailwind), and works best with a strong upfront design-system setup prompt, then component/page generation building on that established base. Treat the first prompt as establishing the project's foundation.

**Kickoff prompt (design system + Landing page):**
```
Set up a Next.js + Tailwind v4 project for CreatorFlow, a free tool for content 
creators to manage brand deals, ideas, drafts, video repurposing, and analytics in 
one place — no cut taken from any deal, ever.

Configure the Tailwind @theme block using the attached design.pdf as the exact and 
only source for colors, type scale, spacing, radii, and shadows — reference tokens 
as CSS variables rather than default Tailwind values.

Build the Landing page first, using the Landing section of the attached content 
brief verbatim for all copy. Build it as reusable components (Hero, FeatureCard, 
CTAButton, etc.) since these will be reused across the rest of the site.
```

**Follow-up prompts, one page/flow per message, all referencing the same theme and brief:**
```
Now build the Pricing page using the Pricing section of the brief. Reuse existing 
components where they fit.
```
```
Now build the Onboarding flow (3 steps) using the Onboarding section of the brief.
```
```
Now build the Dashboard, including the empty state for a new user with nothing 
connected, using the Dashboard section of the brief.
```
```
Now build the Deals screen — pipeline view, deal detail, and empty state — using the 
Deals section of the brief. This is the most important screen in the app, so give it 
the most attention.
```
```
Now build Ideas, Drafts, Repurpose, Automations, Analytics, Team, and Settings, using 
their respective sections of the brief. Reuse existing components (cards, empty 
states, buttons) rather than inventing new patterns for each.
```

**Note:** v0's output is real component code, so this batch will produce something closer to a working front end than Stitch or Claude Design's prototypes — useful if you plan to hand this straight to engineering rather than treating it as a design exploration step.

---

## After All Three Are Back

Compare using the same rubric as before: token fidelity (did it actually use your palette/type), usable output (code you can build on vs. a mockup to rebuild), iteration speed, and how well empty states and the Deals screen — the two most important surfaces — came out. Bring results back here and we'll pick a direction together.
