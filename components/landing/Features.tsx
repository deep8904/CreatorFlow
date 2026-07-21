import FeatureCard from './FeatureCard'
import RevealUp from '@/components/editorial/RevealUp'
import { Mail, Lightbulb, BarChart2, Download, Repeat2, Zap, Users, Clock } from 'lucide-react'

const features = [
  {
    heading: 'Nothing gets forgotten',
    body: 'Brand emails become tracked deals automatically — nothing slips through your inbox again.',
    icon: <Mail size={26} strokeWidth={2} />,
  },
  {
    heading: 'Ideas survive the day',
    body: "Capture a thought the moment you have it, so it's still there when you sit down to work.",
    icon: <Lightbulb size={26} strokeWidth={2} />,
  },
  {
    heading: 'Never locked in',
    body: "Your ideas, drafts, and deal history are yours — export everything, any time.",
    icon: <Download size={26} strokeWidth={2} />,
    invert: true,
  },
  {
    heading: "Know what's actually working",
    body: 'See which videos and which deals are paying off, so your next idea is a better bet than your last.',
    icon: <BarChart2 size={26} strokeWidth={2} />,
  },
  {
    heading: 'One video becomes five things',
    body: 'Turn a published video into clips, posts, and outlines — instead of moving on and never revisiting it.',
    icon: <Repeat2 size={26} strokeWidth={2} />,
  },
  {
    heading: 'Less busywork, more making',
    body: 'The repetitive parts of running a creator business happen on their own, so that time goes back into creating.',
    icon: <Zap size={26} strokeWidth={2} />,
  },
  {
    heading: 'Room for your team',
    body: "Bring in an editor or manager without losing track of what's happening.",
    icon: <Users size={26} strokeWidth={2} />,
    invert: true,
  },
  {
    heading: 'Up and running today',
    body: "Connect Gmail and YouTube and you're tracking your first deal the same day — no setup marathon.",
    icon: <Clock size={26} strokeWidth={2} />,
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-linen py-24 md:py-32">
      <div className="container-shell">
        <RevealUp>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="label-eyebrow mb-6">THE_LOOP</div>
              <h2 className="text-display-sm max-w-[24rem] text-carbon">
                What it actually takes to publish consistently.
              </h2>
            </div>
            <p className="font-body-editorial max-w-[22rem] text-[15px] leading-relaxed text-graphite md:text-right">
              Not more tools. Fewer things falling through the cracks.
            </p>
          </div>
        </RevealUp>

        <RevealUp delay={1}>
          <div className="swiss-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <FeatureCard key={f.heading} icon={f.icon} heading={f.heading} body={f.body} invert={f.invert} />
            ))}
          </div>
        </RevealUp>
      </div>
    </section>
  )
}
