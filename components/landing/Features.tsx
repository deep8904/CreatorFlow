import FeatureCard from './FeatureCard'
import RevealUp from '@/components/editorial/RevealUp'
import { Mail, Lightbulb, BarChart2, Download, Repeat2, Zap, Users, Clock } from 'lucide-react'

const features = [
  {
    heading: "Deals that don't get lost",
    body: 'Connect Gmail and brand sponsorship emails get surfaced automatically, tracked from inquiry to paid.',
    icon: <Mail size={26} strokeWidth={1.6} />,
  },
  {
    heading: 'Ideas, captured on the spot',
    body: 'Write down a content idea the second you have it, before it slips away.',
    icon: <Lightbulb size={26} strokeWidth={1.6} />,
  },
  {
    heading: 'Never locked in',
    body: "Export everything you've put in, any time, no questions asked.",
    icon: <Download size={26} strokeWidth={1.6} />,
    invert: true,
  },
  {
    heading: "Know what's working",
    body: 'See your YouTube performance next to your deal pipeline, not in a separate tab.',
    icon: <BarChart2 size={26} strokeWidth={1.6} />,
  },
  {
    heading: 'Repurpose in one click',
    body: 'Turn a long-form video into a short-form script, thread, or newsletter with AI.',
    icon: <Repeat2 size={26} strokeWidth={1.6} />,
  },
  {
    heading: 'Automations without code',
    body: 'Let simple, repetitive steps happen without manual work when a deal moves or an email arrives.',
    icon: <Zap size={26} strokeWidth={1.6} />,
  },
  {
    heading: 'Room for your team',
    body: 'Invite a collaborator to help manage deals and automations without losing control of the account.',
    icon: <Users size={26} strokeWidth={1.6} />,
    invert: true,
  },
  {
    heading: 'Nothing to migrate',
    body: "Connect Gmail and YouTube and you're tracking deals the same day — no setup marathon.",
    icon: <Clock size={26} strokeWidth={1.6} />,
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-linen py-24 md:py-32">
      <div className="container-shell">
        <RevealUp>
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="label-eyebrow mb-6">CAPABILITIES</div>
              <h2 className="text-display-sm max-w-[24rem] text-white">
                Everything a creator business actually needs.
              </h2>
            </div>
            <p className="font-body-editorial max-w-[22rem] text-[15px] leading-relaxed text-graphite md:text-right">
              Built for creators who are serious about the business side, not just the top 1%.
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
