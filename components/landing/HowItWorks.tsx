import RevealUp from '@/components/editorial/RevealUp'

const steps = [
  {
    number: '01',
    heading: 'Sign in with Google, connect YouTube',
    body: 'Takes two minutes. We only read what CreatorFlow needs — nothing is shared or sold.',
  },
  {
    number: '02',
    heading: 'Capture every idea the moment it hits',
    body: "Write it down before it's gone — this becomes the one place ideas actually survive.",
  },
  {
    number: '03',
    heading: 'Turn ideas into drafts, drafts into published work',
    body: "Develop what's worth developing, faster than starting from a blank page every time.",
  },
  {
    number: '04',
    heading: 'See what worked, then do more of that',
    body: 'Deals and channel performance sit side by side, so the next idea is a better bet.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-linen py-24 md:py-32">
      <div className="container-shell">
        <RevealUp>
          <div className="mb-20 flex flex-col items-center text-center">
            <div className="label-eyebrow mb-6">THE_LOOP</div>
            <h2 className="text-display-sm max-w-[36rem] text-carbon">
              From scattered to consistent, in four steps.
            </h2>
          </div>
        </RevealUp>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-[19px] hidden h-px bg-fog lg:block" />

          {steps.map((step, i) => (
            <RevealUp key={step.number} delay={(Math.min(i, 3)) as 0 | 1 | 2 | 3}>
              <div className="flex flex-col gap-5">
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fog bg-linen font-label text-[12px] text-carbon">
                  {step.number}
                </div>
                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-carbon">{step.heading}</h3>
                  <p className="font-body-editorial text-[14px] leading-relaxed text-graphite">{step.body}</p>
                </div>
              </div>
            </RevealUp>
          ))}
        </div>
      </div>
    </section>
  )
}
