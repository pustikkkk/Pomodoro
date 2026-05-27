import { useNavigate } from 'react-router-dom'
import { DemoTimer } from '@/components/timer/DemoTimer'
import { Button } from '@/components/ui/Button'
import { TEMPLATE_DEFINITIONS, TEMPLATE_LABELS } from '@/constants/templates'
import type { TemplateType } from '@/types'

const TEMPLATES: TemplateType[] = ['short', 'standard', 'hybrid', 'deep_work']

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 pt-4">
        <div className="max-w-5xl mx-auto bg-white/20 backdrop-blur-md border border-black/10 rounded-full px-8 h-16 flex items-center justify-between">
          <span className="text-black font-mono font-bold text-base tracking-widest">POMODORO</span>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/login')}>Log in</Button>
            <Button onClick={() => navigate('/signup')}>Sign up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-black font-mono mb-4 leading-tight">
            Stay in the zone.<br />
            <span className="text-black">Earn your stars.</span>
          </h1>
          <p className="text-black text-lg max-w-xl mx-auto mb-10">
            Structured focus sessions with customizable template blocks. Build your own rhythm, track your consistency.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>Get started free</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>Log in</Button>
          </div>
        </section>

        <section className="bg-black/[0.07] border-y border-black/10 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-center text-xs text-black uppercase tracking-widest mb-10">
              Four focus templates
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TEMPLATES.map((type) => {
                const phases = TEMPLATE_DEFINITIONS[type]
                const total = phases.reduce((a, b) => a + b, 0)
                return (
                  <div key={type} className="bg-white/30 border border-black/10 rounded-lg p-4 text-center backdrop-blur-sm">
                    <p className="text-black font-semibold text-sm mb-1">{TEMPLATE_LABELS[type]}</p>
                    <p className="text-black text-xs mb-3">{total} min</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-0.5 text-black text-xs font-mono leading-relaxed">
                      {phases.map((p, i) => (
                        <span key={i} className="flex items-center gap-x-1">
                          {p}
                          {i < phases.length - 1 && (
                            <span className="text-black">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-center text-xs text-black mt-4">
              Mix and multiply templates to build custom sessions up to 10 blocks long.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-8">
          <h2 className="text-xs text-black uppercase tracking-widest">Try the standard template</h2>
          <DemoTimer />
          <Button onClick={() => navigate('/signup')}>
            Sign up to create custom timers
          </Button>
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-center">
          <span className="text-xs text-black font-mono">POMODORO</span>
        </div>
      </footer>
    </div>
  )
}
