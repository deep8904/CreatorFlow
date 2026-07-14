import RevealUp from '@/components/editorial/RevealUp'

const steps = [
  {
    number: '01',
    heading: 'Connect Gmail and YouTube',
    body: 'Takes two minutes. Nothing is shared or sold. Disconnect any time.',
  },
  {
    number: '02',
    heading: 'Brand deals get sorted for you',
    body: 'Sponsorship emails are pulled out of your regular inbox noise into one pipeline view.',
  },
  {
    number: '03',
    heading: 'Capture and develop your ideas',
    body: 'Turn a passing thought into a scheduled piece of content.',
  },
  {
    number: '04',
    heading: 'See the full picture',
    body: 'Your deals, your ideas, and your channel performance in one dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-linen py-24 md:py-32">
      <div className="container-shell">
        <RevealUp>
          <div className="mb-20 flex flex-col items-center text-center">
            <div className="label-eyebrow mb-6">HOW_IT_WORKS</div>
            <h2 className="text-display-sm max-w-[36rem] text-white">
              Set up in two minutes. Run your business from day one.
            </h2>
          </div>
        </RevealUp>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-[19px] hidden h-px bg-fog lg:block" />

          {steps.map((step, i) => (
            <RevealUp key={step.number} delay={(Math.min(i, 3)) as 0 | 1 | 2 | 3}>
              <div className="flex flex-col gap-5">
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fog bg-linen font-label text-[12px] text-white">
                  {step.number}
                </div>
                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-white">{step.heading}</h3>
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
