/**
 * Seeds (or resets) the CreatorFlow demo account for investor-demo purposes.
 *
 * Identity: founder using his own product — name "Deep", channel
 * https://www.youtube.com/@deep-xdd. Seeded numbers are plausible, not real
 * channel numbers.
 *
 * Usage:
 *   1. Fill in SUPABASE_SERVICE_ROLE_KEY, DEMO_ACCOUNT_EMAIL, and
 *      DEMO_ACCOUNT_PASSWORD in .env.local. Never commit these values —
 *      deliberately not defaulted in source so nothing here ends up in git.
 *   2. npm run seed:demo
 *
 * Safe to re-run any number of times: it deletes this demo user's existing
 * rows in every seeded table first, then re-inserts fresh data, so it always
 * resets to the same known-good state before a live demo.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEMO_EMAIL = process.env.DEMO_ACCOUNT_EMAIL
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DEMO_EMAIL || !DEMO_PASSWORD) {
  console.error(
    'Missing one of: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ' +
      'DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_PASSWORD.\n' +
      'Fill all four into .env.local, then run: npm run seed:demo'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function getOrCreateDemoUser(): Promise<string> {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Deep', username: 'deep' },
  })

  if (!createError && created.user) return created.user.id

  // Already exists — look it up instead.
  let page = 1
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email === DEMO_EMAIL)
    if (match) return match.id
    if (data.users.length < 200) break
    page += 1
  }
  throw new Error(`Could not create or find demo user ${DEMO_EMAIL}: ${createError?.message}`)
}

async function resetSeededRows(userId: string) {
  const byUserId = ['repurposed_content', 'channel_videos', 'channel_stats_daily', 'automations', 'drafts', 'ideas', 'deals', 'integrations']
  for (const table of byUserId) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) throw new Error(`Failed clearing ${table}: ${error.message}`)
  }
  const { error: inviteErr } = await supabase.from('team_invites').delete().eq('account_id', userId)
  if (inviteErr) throw new Error(`Failed clearing team_invites: ${inviteErr.message}`)
}

async function seed(userId: string) {
  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId)

  await supabase.from('team_members').upsert(
    { account_id: userId, user_id: userId, role: 'owner' },
    { onConflict: 'account_id,user_id' }
  )
  await supabase.from('team_invites').insert({
    account_id: userId,
    invited_email: 'editor@creatorflow.demo',
    role: 'editor',
    status: 'pending',
  })

  await supabase.from('integrations').insert([
    { user_id: userId, provider: 'youtube', scope: ['youtube.readonly'], metadata: { email: '@deep-xdd' }, is_demo: true },
    { user_id: userId, provider: 'gmail', scope: ['gmail.readonly'], metadata: { email: 'deep.creates@gmail.com' }, is_demo: true },
  ])

  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
  const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
  const daysAgoDate = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

  // Every row sets updated_at explicitly (equal to created_at, i.e. "never
  // touched since") — a batch insert of objects with different key sets
  // sends an explicit null for any row missing a key present elsewhere in
  // the array, which trips updated_at's NOT NULL constraint instead of
  // falling back to its default. Crestline Cameras deliberately sets
  // updated_at more recently than created_at (touched once, then went
  // quiet) so it demonstrates the "needs follow-up" flag out of the box.
  const deals = [
    { brand_name: 'Aura Skincare', contact_name: 'Priya Nair', contact_email: 'priya@aurabeauty.co', status: 'inbound', rate_amount_cents: 150000, deliverables: '1 dedicated YouTube video', notes: 'Reached out after seeing the desk setup video.', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { brand_name: 'Northstar VPN', contact_name: 'Alex Kim', contact_email: 'partnerships@northstarvpn.com', status: 'inbound', rate_amount_cents: 80000, deliverables: '60-second mid-roll ad read', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { brand_name: 'Bloom Meal Kits', contact_name: 'Sasha Winters', contact_email: 'sasha@bloommeals.com', status: 'inbound', rate_amount_cents: 120000, deliverables: '1 integration + 1 Story post', notes: 'Wants a 2-video series if the first goes well.', created_at: daysAgo(3), updated_at: daysAgo(3) },
    { brand_name: 'Kinetic Audio', contact_name: 'Marcus Webb', contact_email: 'marcus@kineticaudio.io', status: 'inbound', rate_amount_cents: 95000, deliverables: 'Unboxing + review video', created_at: daysAgo(5), updated_at: daysAgo(5) },
    { brand_name: 'Trailmix Gear', contact_name: 'Dana Osei', contact_email: 'dana@trailmixgear.com', status: 'inbound', rate_amount_cents: 60000, deliverables: '1 dedicated Short', notes: 'Smaller budget but good brand fit.', created_at: daysAgo(6), updated_at: daysAgo(6) },
    { brand_name: 'Formfit Athletics', contact_name: 'Jordan Reyes', contact_email: 'jordan@formfit.com', status: 'negotiating', rate_amount_cents: 220000, deliverables: '2 videos + 3 Shorts', notes: 'Countered their first offer, waiting on revised terms.', due_date: daysFromNow(12), created_at: daysAgo(10), updated_at: daysAgo(10) },
    { brand_name: 'Verve Energy Drinks', contact_name: 'Casey Lin', contact_email: 'casey@verveenergy.com', status: 'negotiating', rate_amount_cents: 175000, deliverables: '1 video + usage rights (90 days)', notes: 'They want paid social usage rights, discussing add-on fee.', due_date: daysFromNow(9), usage_rights_expires_at: daysFromNow(99), created_at: daysAgo(9), updated_at: daysAgo(9) },
    { brand_name: 'Lumen Desk Co.', contact_name: 'Rina Suzuki', contact_email: 'rina@lumendesk.com', status: 'negotiating', rate_amount_cents: 140000, deliverables: '1 dedicated video', due_date: daysFromNow(14), created_at: daysAgo(8), updated_at: daysAgo(8) },
    { brand_name: 'Crestline Cameras', contact_name: 'Ben Ortiz', contact_email: 'ben@crestlinecam.com', status: 'negotiating', rate_amount_cents: 260000, deliverables: '1 video + gear loan', notes: 'Long-term ambassador conversation attached to this one — gone quiet for over a week.', due_date: daysFromNow(20), created_at: daysAgo(14), updated_at: daysAgo(9) },
    { brand_name: 'Glowlab Cosmetics', contact_name: 'Tessa Moore', contact_email: 'tessa@glowlab.com', status: 'contracted', rate_amount_cents: 130000, deliverables: '1 integration', notes: 'Contract signed, filming scheduled next week.', due_date: daysFromNow(7), created_at: daysAgo(18), updated_at: daysAgo(18) },
    { brand_name: 'Ripple Water Bottles', contact_name: 'Owen Clarke', contact_email: 'owen@ripplebottle.com', status: 'contracted', rate_amount_cents: 70000, deliverables: '2 Shorts', due_date: daysFromNow(5), created_at: daysAgo(15), updated_at: daysAgo(15) },
    { brand_name: 'Anchor Financial App', contact_name: 'Nina Patel', contact_email: 'nina@anchorapp.com', status: 'contracted', rate_amount_cents: 300000, deliverables: '1 video + newsletter mention', notes: 'Highest-value deal this quarter.', due_date: daysFromNow(10), created_at: daysAgo(20), updated_at: daysAgo(20) },
    { brand_name: 'Cedar & Sage', contact_name: 'Liam Foster', contact_email: 'liam@cedarandsage.com', status: 'delivered', rate_amount_cents: 90000, deliverables: '1 dedicated video', notes: 'Video published, invoice sent — now overdue.', due_date: daysAgoDate(3), invoiced_at: daysAgo(10), created_at: daysAgo(30), updated_at: daysAgo(10) },
    { brand_name: 'Solace Sleep Co.', contact_name: 'Grace Wu', contact_email: 'grace@solacesleep.com', status: 'delivered', rate_amount_cents: 110000, deliverables: '1 video + 1 Short', notes: 'Waiting on payment, due in 5 days.', due_date: daysAgoDate(1), created_at: daysAgo(25), updated_at: daysAgo(25) },
    { brand_name: 'Nordfeld Outdoor', contact_name: 'Erik Solberg', contact_email: 'erik@nordfeldoutdoor.com', status: 'paid', rate_amount_cents: 175000, deliverables: '1 video', notes: 'Paid on time, would work with again.', due_date: daysAgoDate(20), usage_rights_expires_at: daysFromNow(25), created_at: daysAgo(60), updated_at: daysAgo(60) },
    { brand_name: 'PulseFit Nutrition', contact_name: 'Maya Alvarez', contact_email: 'maya@pulsefitnutrition.com', status: 'paid', rate_amount_cents: 85000, deliverables: '1 Short + 1 Story', due_date: daysAgoDate(35), created_at: daysAgo(70), updated_at: daysAgo(70) },
    { brand_name: 'Brightside Coffee', contact_name: 'Tom Bradley', contact_email: 'tom@brightsidecoffee.com', status: 'paid', rate_amount_cents: 65000, deliverables: '1 integration', notes: 'Recurring partner — third deal with them.', due_date: daysAgoDate(50), created_at: daysAgo(90), updated_at: daysAgo(90) },
  ]
  const { error: dealsErr } = await supabase.from('deals').insert(deals.map((d) => ({ user_id: userId, ...d })))
  if (dealsErr) throw dealsErr

  const ideas = [
    { title: 'Desk setup tour 2026', notes: 'Full walkthrough — mic, lighting, monitor arm, new chair.', tags: ['setup', 'gear'], status: 'new', created_at: daysAgo(1) },
    { title: 'How I actually track brand deals now', notes: 'Screen-record the CreatorFlow pipeline as the hook.', tags: ['business', 'meta'], status: 'new', created_at: daysAgo(2) },
    { title: 'Is content creation still worth it in 2026?', notes: 'Q&A format, pull questions from comments.', tags: ['discussion'], status: 'new', created_at: daysAgo(3) },
    { title: 'Rating my old sponsorships, 1 year later', notes: 'Which ones actually converted vs. which just paid.', tags: ['business', 'retrospective'], status: 'in_progress', created_at: daysAgo(6) },
    { title: 'A week in my life as a full-time creator', notes: 'Vlog style, film every day this week.', tags: ['vlog'], status: 'in_progress', created_at: daysAgo(8) },
    { title: 'Every editing shortcut I use daily', notes: 'Quick-cut listicle style, good for Shorts too.', tags: ['tutorial', 'editing'], status: 'in_progress', created_at: daysAgo(10) },
    { title: 'Q1 income breakdown — sponsorships vs. everything else', notes: 'Transparency video, real numbers.', tags: ['business', 'transparency'], status: 'scheduled', created_at: daysAgo(12) },
    { title: 'Reacting to my first ever video', notes: 'Milestone content for the anniversary.', tags: ['milestone'], status: 'scheduled', created_at: daysAgo(14) },
    { title: 'The gear that was NOT worth the money', notes: 'Honest gear review, contrarian angle.', tags: ['gear', 'review'], status: 'scheduled', created_at: daysAgo(15) },
    { title: 'How I plan a month of content in one sitting', notes: 'Tie into ideas -> drafts workflow.', tags: ['productivity'], status: 'done', created_at: daysAgo(40) },
    { title: 'Answering the most-asked question in my DMs', notes: 'Compiled from the last 3 months of messages.', tags: ['qa'], status: 'done', created_at: daysAgo(45) },
    { title: 'My actual morning routine (not the aesthetic version)', notes: 'Contrast bit — expectation vs reality.', tags: ['vlog', 'lifestyle'], status: 'done', created_at: daysAgo(50) },
  ]
  const { data: insertedIdeas, error: ideasErr } = await supabase
    .from('ideas')
    .insert(ideas.map((i) => ({ user_id: userId, ...i })))
    .select('id, title')
  if (ideasErr) throw ideasErr
  const ideaIdByTitle = new Map((insertedIdeas ?? []).map((i) => [i.title, i.id]))

  const drafts = [
    { ideaTitle: 'Rating my old sponsorships, 1 year later', title: 'Rating my old sponsorships, 1 year later', body: 'INTRO\n- Hook: "I took 6 brand deals last year. Here\'s which ones I\'d actually do again."\n\nBODY\n- Go deal by deal, show the video, show what happened after\n- Call out the ones that clearly moved product vs. just looked good on paper\n\nCTA\n- If you\'re a brand watching this: this is exactly why I use a real pipeline now, not a spreadsheet.', created_at: daysAgo(5), due_date: daysFromNow(4) },
    { ideaTitle: 'A week in my life as a full-time creator', title: 'A week in my life as a full-time creator', body: 'DAY 1 — filming + editing morning, sponsor call at 2pm\nDAY 2 — outline this video, batch record audio for 3 Shorts\nDAY 3 — off day, but film b-roll anyway\nDAY 4 — sponsor deliverable due, upload day\nDAY 5 — community day, respond to comments on camera\n\nNeed: b-roll of the actual editing process, not just talking head.', created_at: daysAgo(7), due_date: daysFromNow(11) },
    { ideaTitle: 'Every editing shortcut I use daily', title: 'Every editing shortcut I use daily', body: 'Format: fast cuts, on-screen keybind overlay for each one\n\nList:\n1. Ripple delete\n2. Multi-cam sync\n3. Speed ramping preset\n4. Auto-caption + manual cleanup pass\n5. Export queue while I write the next script', created_at: daysAgo(9) },
    { ideaTitle: 'Q1 income breakdown — sponsorships vs. everything else', title: 'Q1 income breakdown — sponsorships vs. everything else', body: 'Numbers to pull from CreatorFlow before recording:\n- Total sponsorship revenue this quarter\n- Number of deals closed vs. dropped\n- Rough estimate of hours per deal\n\nStructure: pie chart moment, then walk through what surprised me.', created_at: daysAgo(11) },
    { ideaTitle: null, title: 'Sponsor pitch template — cold outreach version', body: 'Not a video — reusable draft for reaching out to brands directly instead of waiting on inbound.\n\nSubject: Quick idea for [Brand]\nBody: intro, 2-line channel stats, 1 specific idea for their product, ask for a call.', created_at: daysAgo(20) },
    { ideaTitle: null, title: 'End-of-year thank you / recap post', body: "Short community post, not a full video. Thank the people who stuck around, tease what's coming next year.", created_at: daysAgo(4) },
  ]
  await supabase.from('drafts').insert(
    drafts.map(({ ideaTitle, ...d }) => ({
      user_id: userId,
      idea_id: ideaTitle ? (ideaIdByTitle.get(ideaTitle) ?? null) : null,
      ...d,
    }))
  )

  await supabase.from('automations').insert([
    { user_id: userId, name: 'New sponsorship email → Create a deal', trigger_type: 'gmail.sponsorship_email_detected', action_type: 'deals.create', config: { description: 'When Gmail detects a new brand deal email, automatically create a deal card for it.' }, enabled: true, created_at: daysAgo(55) },
    { user_id: userId, name: 'Deal marked Paid → Archive contract', trigger_type: 'deals.status_changed_to_paid', action_type: 'deals.archive_contract', config: { description: 'Keep your Deals view focused on what\'s active.' }, enabled: true, created_at: daysAgo(50) },
    { user_id: userId, name: 'New video published → Suggest a repurpose', trigger_type: 'youtube.video_published', action_type: 'repurpose.suggest', config: { description: 'As soon as a new video goes live, queue it up in Repurpose so clips and posts are ready same-day.' }, enabled: false, created_at: daysAgo(12) },
    { user_id: userId, name: 'Deal gone quiet or invoice overdue → Flag for follow-up', trigger_type: 'deals.needs_follow_up', action_type: 'deals.flag_follow_up', config: { description: 'Deals stuck 5+ days in Inbound/Negotiating, or with an unpaid invoice past its due date, already show on your Dashboard and in Deals regardless of this toggle.' }, enabled: false, created_at: daysAgo(6) },
  ])

  const videos = [
    { title: 'How I plan a month of content in one sitting', published_at: daysAgo(38), views: 84200, watch_time_minutes: 312000, likes: 5100, comments: 380, duration_seconds: 742 },
    { title: 'Answering the most-asked question in my DMs', published_at: daysAgo(32), views: 61500, watch_time_minutes: 198000, likes: 3600, comments: 290, duration_seconds: 512 },
    { title: 'My actual morning routine (not the aesthetic version)', published_at: daysAgo(28), views: 142800, watch_time_minutes: 501000, likes: 9200, comments: 640, duration_seconds: 611 },
    { title: 'Ranking every camera I have ever owned', published_at: daysAgo(22), views: 53200, watch_time_minutes: 176000, likes: 2800, comments: 210, duration_seconds: 903 },
    { title: 'What $2,000 of brand deal gear actually looks like', published_at: daysAgo(17), views: 97400, watch_time_minutes: 340000, likes: 6100, comments: 455, duration_seconds: 688 },
    { title: 'I tried every productivity app for a month', published_at: daysAgo(13), views: 118600, watch_time_minutes: 402000, likes: 7300, comments: 512, duration_seconds: 754 },
    { title: 'The truth about sponsorship money nobody tells you', published_at: daysAgo(9), views: 205300, watch_time_minutes: 780000, likes: 15400, comments: 1120, duration_seconds: 823 },
    { title: 'A realistic studio tour (not the fake tidy version)', published_at: daysAgo(6), views: 76900, watch_time_minutes: 251000, likes: 4700, comments: 330, duration_seconds: 567 },
    { title: 'Answering your questions about going full-time', published_at: daysAgo(3), views: 44100, watch_time_minutes: 139000, likes: 2200, comments: 190, duration_seconds: 690 },
    { title: 'My editing setup, start to finish', published_at: daysAgo(1), views: 18700, watch_time_minutes: 48000, likes: 950, comments: 62, duration_seconds: 812 },
  ]
  const { data: insertedVideos, error: videosErr } = await supabase
    .from('channel_videos')
    .insert(videos.map((v, i) => ({ user_id: userId, youtube_video_id: `demo-vid-${String(i + 1).padStart(2, '0')}`, ...v })))
    .select('id, title')
  if (videosErr) throw videosErr
  const videoIdByTitle = new Map((insertedVideos ?? []).map((v) => [v.title, v.id]))

  await supabase.from('repurposed_content').insert([
    {
      user_id: userId,
      video_id: videoIdByTitle.get('The truth about sponsorship money nobody tells you'),
      source_url: 'https://youtube.com/watch?v=demo-vid-07',
      summary: 'A candid breakdown of what sponsorship money actually looks like after taxes, agency cuts, and production costs — using real (if rounded) numbers from the past year.',
      clip_worthy_moments: [
        { timestamp: '02:14', description: 'The moment the real take-home number gets revealed on screen' },
        { timestamp: '05:48', description: 'Story about a deal that looked great on paper but barely broke even' },
        { timestamp: '11:02', description: 'The one rule for pricing a deal that changed everything' },
      ],
      social_post_ideas: [
        'A carousel breaking down where sponsorship money actually goes, step by step',
        'A quote graphic: the pricing rule from the 11:02 mark',
        'A poll: "Did this number surprise you?" driving back to the full video',
      ],
      blog_outline: 'H1: The Truth About Sponsorship Money Nobody Tells You\n\n- Intro: why creators don\'t talk about real numbers\n- Breakdown: gross vs. net per deal\n- The pricing rule that changed my approach\n- What I\'d tell a creator taking their first deal',
      created_at: daysAgo(7),
    },
    {
      user_id: userId,
      video_id: videoIdByTitle.get('My actual morning routine (not the aesthetic version)'),
      source_url: 'https://youtube.com/watch?v=demo-vid-03',
      summary: 'A contrast-driven look at a real morning routine versus the polished version creators usually post — showing the messy middle, not just the highlight reel.',
      clip_worthy_moments: [
        { timestamp: '00:45', description: 'The "expectation vs reality" split-screen intro' },
        { timestamp: '04:10', description: 'The unfiltered moment things go wrong' },
        { timestamp: '08:30', description: 'The actual productivity takeaway, once the bit is over' },
      ],
      social_post_ideas: [
        'Before/after style short using the 00:45 split-screen',
        'A single relatable quote card from the 04:10 moment',
        'Community post asking followers to share their own "reality" version',
      ],
      blog_outline: 'H1: My Actual Morning Routine (Not the Aesthetic Version)\n\n- Why the polished version is mostly fiction\n- What really happens hour by hour\n- The one habit that actually stuck',
      created_at: daysAgo(5),
    },
    {
      user_id: userId,
      video_id: videoIdByTitle.get('I tried every productivity app for a month'),
      source_url: 'https://youtube.com/watch?v=demo-vid-06',
      summary: 'A month-long test of productivity apps, ranked by what actually stuck versus what got abandoned after week one.',
      clip_worthy_moments: [
        { timestamp: '01:30', description: 'The ranking reveal graphic' },
        { timestamp: '06:55', description: 'The app that surprisingly made the cut' },
        { timestamp: '13:20', description: 'The honest verdict on the most-hyped app' },
      ],
      social_post_ideas: [
        'Ranked list graphic as a carousel post',
        'Short clip of the surprise winner reveal at 06:55',
        'Text post: "I tried 9 productivity apps for a month, here\'s what actually stuck"',
      ],
      blog_outline: 'H1: I Tried Every Productivity App for a Month\n\n- Method: how each app was tested\n- Full ranked list\n- The one habit that mattered more than any app',
      created_at: daysAgo(2),
    },
  ])

  // 120 days of daily channel stats with a gentle upward trend + noise, so
  // "this month vs last month" comparisons and a growth chart both look real.
  const statsRows: {
    user_id: string
    stat_date: string
    views: number
    watch_time_minutes: number
    subscribers_total: number
    subscribers_gained: number
  }[] = []
  let subscribersTotal = 24000
  for (let i = 0; i < 120; i++) {
    const views = Math.max(200, Math.round(900 + i * 15 + (Math.random() * 600 - 300)))
    const watchTimeMinutes = Math.max(50, Math.round(views * (3.5 + Math.random() * 2)))
    const subscribersGained = Math.max(0, Math.round(views * 0.015 + (Math.random() * 10 - 5)))
    subscribersTotal += subscribersGained
    statsRows.push({
      user_id: userId,
      stat_date: daysAgoDate(119 - i),
      views,
      watch_time_minutes: watchTimeMinutes,
      subscribers_total: subscribersTotal,
      subscribers_gained: subscribersGained,
    })
  }
  await supabase.from('channel_stats_daily').insert(statsRows)
}

async function main() {
  console.log(`Seeding demo account: ${DEMO_EMAIL}`)
  const userId = await getOrCreateDemoUser()
  console.log(`User id: ${userId}`)
  console.log('Clearing previously seeded rows...')
  await resetSeededRows(userId)
  console.log('Inserting fresh seed data...')
  await seed(userId)
  console.log('\nDone. Demo login:')
  console.log(`  email:    ${DEMO_EMAIL}`)
  console.log(`  password: ${DEMO_PASSWORD}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
