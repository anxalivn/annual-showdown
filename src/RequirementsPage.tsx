import {
  Gamepad2,
  Headphones,
  Wifi,
  Monitor,
  Camera,
  CheckCircle2,
  Zap,
  Smile,
  Trophy,
} from 'lucide-react'

const CHAMPIONSHIP_ACRONYM = 'TAGS'

interface Requirement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const REQUIREMENTS: Requirement[] = [
  {
    id: 'discord',
    title: 'Discord Connected',
    description: 'Both players must be on Discord during the event',
    icon: <Headphones className="h-5 w-5" />,
  },
  {
    id: 'webcam',
    title: 'Webcam Ready',
    description: 'Webcam recommended for fairness and presence',
    icon: <Camera className="h-5 w-5" />,
  },
  {
    id: 'recording',
    title: 'Recording Setup',
    description: 'OBS Studio or similar recommended for recording',
    icon: <Monitor className="h-5 w-5" />,
  },
  {
    id: 'platform',
    title: 'Platform Ready',
    description: 'Players should have PC and PS5 ready',
    icon: <Gamepad2 className="h-5 w-5" />,
  },
  {
    id: 'psplus',
    title: 'PS Plus Active',
    description: 'PlayStation Plus required for online PS5 games',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'internet',
    title: 'Stable Internet',
    description: 'Wired connection preferred, stable internet required',
    icon: <Wifi className="h-5 w-5" />,
  },
  {
    id: 'setup',
    title: 'Proper Setup',
    description: 'Quiet gaming setup with minimal distractions',
    icon: <Monitor className="h-5 w-5" />,
  },
  {
    id: 'presentable',
    title: 'Presentable',
    description: 'Suit and tie suggested for fun and formality',
    icon: <Smile className="h-5 w-5" />,
  },
]

const CHECKLIST_ITEMS = [
  'Discord on',
  'Webcam ready',
  'Recording started',
  'Games installed',
  'Internet tested',
  'Ready to play',
]

const RequirementCard: React.FC<{ requirement: Requirement }> = ({
  requirement,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950 p-5 transition-all duration-300 hover:border-white/20 hover:bg-slate-900/60">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
          {requirement.icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{requirement.title}</h3>
          <p className="mt-1 text-xs text-slate-400">{requirement.description}</p>
        </div>
      </div>
    </div>
  )
}

const PreMatchChecklistCard: React.FC = () => {
  return (
    <div
      className="rounded-3xl border border-emerald-400/20 p-8 overflow-hidden relative"
      style={{
        background:
          'linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(168,85,247,0.05) 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          <h3 className="text-xl font-black text-white">Pre-Match Checklist</h3>
        </div>

        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm font-medium text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RequirementsPage() {
  return (
    <main className="relative overflow-hidden pb-12 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_0,transparent_44%),radial-gradient(circle_at_right,rgba(168,85,247,0.08),transparent_0,transparent_40%)]" />      {/* Header with back button */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
          >
            ← Back
          </a>
          <div className="text-right flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Requirements</p>
            <p className="text-sm font-bold text-white">{CHAMPIONSHIP_ACRONYM}</p>
          </div>
          <a
            href="#rules"
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-semibold text-fuchsia-50 transition hover:-translate-y-0.5 hover:bg-fuchsia-500/20"
          >
            Official Rules
          </a>
          <a
            href="https://discord.gg/rekBxgWT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-50 transition hover:-translate-y-0.5 hover:bg-indigo-500/20"
          >
            Discord
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100">
              <Trophy className="h-4 w-4" />
              {CHAMPIONSHIP_ACRONYM}
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl font-black text-white text-center mb-6 tracking-tight">
            Player Requirements
          </h1>

          {/* Subheading */}
          <p className="text-center text-lg sm:text-lg text-slate-300 max-w-2xl mx-auto">
            What both players need before match day
          </p>
        </div>
      </section>

      {/* Visual Divider */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Requirements Grid */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REQUIREMENTS.map((requirement) => (
              <RequirementCard key={requirement.id} requirement={requirement} />
            ))}
          </div>
        </div>
      </section>

      {/* Visual Divider */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Pre-Match Checklist */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <PreMatchChecklistCard />
        </div>
      </section>

      {/* Footer Statement */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-xl sm:text-2xl font-black text-white">
          Preparation matters.
        </p>
      </section>
    </main>
  )
}
