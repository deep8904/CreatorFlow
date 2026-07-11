const steps = [
  {
    number: '01',
    heading: 'Connect Gmail & YouTube',
    body: 'Takes two minutes. Nothing is shared or sold. Disconnect any time you like.',
    chip: 'bg-sky/10 text-sky',
    bar: 'bg-sky',
  },
  {
    number: '02',
    heading: 'Deals get sorted automatically',
    body: 'Sponsorship emails are pulled out of inbox noise into a clean deal pipeline view.',
    chip: 'bg-lavender/10 text-lavender',
    bar: 'bg-lavender',
  },
  {
    number: '03',
    heading: 'Capture and develop ideas',
    body: 'Turn a passing thought into a scheduled piece of content in seconds.',
    chip: 'bg-mint-wash text-mint',
    bar: 'bg-mint',
  },
  {
    number: '04',
    heading: 'See the full picture',
    body: 'Deals, ideas, and channel performance in one dashboard — no tab-switching.',
    chip: 'bg-amber/10 text-amber',
    bar: 'bg-amber',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-paper-white py-24 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[11.5px] font-semibold text-lavender uppercase tracking-widest mb-3"
          >
            How it works
          </span>
          <h2
            className="font-bold text-carbon text-balance"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.04em' }}
          >
            Set up in two minutes.<br />Run your business from day one.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 relative">
          {/* Horizontal connector line (desktop) */}
          <div className="hidden lg:block absolute top-[19px] left-[12.5%] right-[12.5%] h-px bg-fog" />

          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-5 px-4 pb-8 lg:pb-0">
              {/* Number badge */}
              <div className="relative flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full border-2 border-fog bg-paper-white flex items-center justify-center shrink-0 z-10`}>
                  <span className="text-[12px] font-bold text-carbon">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 ${step.chip}`}>
                  Step {step.number}
                </div>
                <h3
                  className="font-semibold text-carbon mb-2"
                  style={{ fontSize: '15px', lineHeight: 1.4, letterSpacing: '-0.3px' }}
                >
                  {step.heading}
                </h3>
                <p
                  className="text-graphite"
                  style={{ fontSize: '14px', lineHeight: 1.55, letterSpacing: '-0.2px' }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
