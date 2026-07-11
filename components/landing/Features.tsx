import FeatureCard from './FeatureCard'
import { Mail, Lightbulb, BarChart2, Download, Repeat2, Zap } from 'lucide-react'

const features = [
  {
    heading: 'Deals that never get lost',
    body: 'Connect Gmail and brand sponsorship emails surface automatically, tracked from inquiry to paid invoice.',
    icon: <Mail size={16} stroke="#fff" strokeWidth={1.7} />,
    accent: 'bg-sky',
  },
  {
    heading: 'Ideas, captured on the spot',
    body: 'Write down a content idea the second you have it. Organize, tag, and develop it at your own pace.',
    icon: <Lightbulb size={16} stroke="#fff" strokeWidth={1.7} />,
    accent: 'bg-amber',
  },
  {
    heading: 'Know what\'s actually working',
    body: 'Your YouTube performance sits next to your deal pipeline — not buried in a separate analytics tab.',
    icon: <BarChart2 size={16} stroke="#fff" strokeWidth={1.7} />,
    accent: 'bg-lavender',
  },
  {
    heading: 'Repurpose in one click',
    body: 'Turn a long-form video into a Twitter thread, newsletter, or short-form script with AI.',
    icon: <Repeat2 size={16} stroke="#fff" strokeWidth={1.7} />,
    accent: 'bg-mint',
  },
  {
    heading: 'Automations without code',
    body: 'Auto-reply to inbound brand inquiries, schedule follow-ups, or trigger workflows based on deal stage.',
    icon: <Zap size={16} stroke="#fff" strokeWidth={1.7} />,
    accent: 'bg-magenta',
  },
  {
    heading: 'Never locked in',
    body: 'Export everything you\'ve put in, any time, no questions asked. Your data is yours — always.',
    icon: <Download size={16} stroke="#fff" strokeWidth={1.7} />,
    accent: 'bg-graphite',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-linen py-24 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span
              className="inline-block text-[11.5px] font-semibold text-lavender uppercase tracking-widest mb-3"
            >
              Features
            </span>
            <h2
              className="font-bold text-carbon text-balance"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.04em' }}
            >
              Everything a creator<br />business actually needs
            </h2>
          </div>
          <p
            className="text-graphite max-w-[320px] md:text-right"
            style={{ fontSize: '15px', lineHeight: 1.6, letterSpacing: '-0.25px' }}
          >
            Built for creators who are serious about the business side, not just the top 1%.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <FeatureCard
              key={f.heading}
              icon={f.icon}
              heading={f.heading}
              body={f.body}
              accent={f.accent}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
