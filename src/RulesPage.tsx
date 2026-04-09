import { useEffect } from 'react'
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  Crown,
  Gamepad2,
  Shield,
  Trophy,
  Zap,
} from 'lucide-react'

const CHAMPIONSHIP_NAME = 'Annual Best Gamer Championship'
const CHAMPIONSHIP_ACRONYM = 'TAGS'
const CURRENT_YEAR = '2026'

interface RuleSection {
  id: string
  number: number
  title: string
  icon: React.ReactNode
  content: string[]
  highlight?: boolean
}

const RULE_SECTIONS: RuleSection[] = [
  {
    id: 'purpose',
    number: 1,
    title: 'Championship Purpose',
    icon: <Trophy className="h-5 w-5" />,
    content: [
      `The ${CHAMPIONSHIP_ACRONYM} is a yearly 1v1 competitive event between two friends held to determine the best gamer of that year.`,
      'The purpose is to settle bragging rights through competitive gaming skill and strategic draft selection.',
      'Each year stands independently, while collectively forming the official legacy and history of the championship.',
    ],
  },
  {
    id: 'format',
    number: 2,
    title: 'Event Format',
    icon: <BarChart3 className="h-5 w-5" />,
    content: [
      `The event happens once per year. The format is Best of 5 (BO5), meaning the first player to win 3 games is declared the year's champion.`,
      'All 5 games in the series are selected from a shared game pool agreed upon before the event begins.',
      'Each year may have a different game pool if both players consent.',
    ],
  },
  {
    id: 'draft',
    number: 3,
    title: 'Draft Format',
    icon: <Gamepad2 className="h-5 w-5" />,
    content: [
      'The draft determines which 5 games will be played in the BO5 series. The draft order is:',
      '',
      '1. Player 1 bans 1 game (cannot be played)',
      '2. Player 2 bans 1 game (cannot be played)',
      '3. Player 1 picks Game 1',
      '4. Player 2 picks Game 2',
      '5. Player 1 picks Game 3',
      '6. Player 2 picks Game 4',
      '7. 1 final random game is selected from the remaining available pool as the decider (Game 5)',
      '',
      'Banned games are removed from play for the year. Picked games are locked and cannot be changed. The random decider must come from games that were neither banned nor previously picked.',
    ],
  },
  {
    id: 'game-pool',
    number: 4,
    title: 'Game Pool Rules',
    icon: <BookOpen className="h-5 w-5" />,
    content: [
      `The championship uses a shared game pool that both players agree on before the event. Only games in the approved pool may be drafted.`,
      'The pool should be large enough to support 2 bans, 4 picks, and 1 decider (minimum 7 games recommended).',
      'The game pool can change each year if both players agree, allowing for new releases and fresh competition.',
    ],
  },
  {
    id: 'match-order',
    number: 5,
    title: 'Match Order',
    icon: <Zap className="h-5 w-5" />,
    content: [
      'The final BO5 lineup is displayed in the order drafted. Once the order is locked after the draft, it cannot be changed during the event.',
      'Each game is played in sequence and counts as one point toward the series score.',
      'The match sequence is binding and official once confirmed.',
    ],
  },
  {
    id: 'winning',
    number: 6,
    title: 'Winning the Championship',
    icon: <Crown className="h-5 w-5" />,
    content: [
      'The first player to win 3 games wins the championship.',
      'Final scores are recorded as 3-0, 3-1, or 3-2. Once a player reaches 3 wins, the series ends immediately.',
      'The winner is crowned that year\'s TAGS champion and earns their place in official TAGS history.',
    ],
  },
  {
    id: 'integrity',
    number: 7,
    title: 'Integrity & Fair Play',
    icon: <Shield className="h-5 w-5" />,
    content: [
      'Both players must agree on all rules and settings before the event begins.',
      'No cheating, hacking, or exploits. No outside assistance during play.',
      'No changing agreed rules mid-event. No dodging or forfeiting selected games without mutual consent.',
      'Rage quitting without accepting the result is not acceptable. Results stand as played.',
      'Sportsmanship is expected at all times, even in friendly trash talk. The goal is to crown the best player of the year.',
    ],
  },
  {
    id: 'technical',
    number: 8,
    title: 'Disconnects & Technical Issues',
    icon: <Gamepad2 className="h-5 w-5" />,
    content: [
      'If a game becomes unplayable due to a technical issue, the players should restart if the issue happens within the first few minutes.',
      'If a technical issue occurs after meaningful progress, both players must mutually agree whether to replay or accept the result.',
      'If a selected game becomes fundamentally unplayable (patch broken, servers down), it may be replaced by a mutually agreed backup game from the pool.',
      'In case of dispute, both players should communicate in good faith to reach a fair resolution.',
    ],
  },
  {
    id: 'record',
    number: 9,
    title: 'Championship Record',
    icon: <BarChart3 className="h-5 w-5" />,
    content: [
      `Each year's result is preserved in official ${CHAMPIONSHIP_ACRONYM} history. The record includes:`,
      '',
      '• Year',
      '• Champion name',
      '• Opponent name',
      '• Final score (3-0, 3-1, or 3-2)',
      '• Final BO5 lineup (all 5 games played)',
      '',
      'This collective history forms the legacy of the championship and determines long-term bragging rights.',
    ],
  },
  {
    id: 'inaugural',
    number: 10,
    title: 'Year One Clause',
    icon: <Trophy className="h-5 w-5" />,
    content: [
      `${CURRENT_YEAR} is the inaugural year of the ${CHAMPIONSHIP_ACRONYM}.`,
      'The first winner becomes the first official TAGS champion.',
      'This victory launches the legacy of the championship. Year One is historic.',
    ],
    highlight: true,
  },
]

const DRAFT_STEPS = [
  { label: 'Ban', player: '1', color: 'from-rose-500/20 to-rose-600/20', icon: '🚫' },
  { label: 'Ban', player: '2', color: 'from-rose-500/20 to-rose-600/20', icon: '🚫' },
  { label: 'Pick', player: '1', color: 'from-cyan-500/20 to-cyan-600/20', icon: '✓' },
  { label: 'Pick', player: '2', color: 'from-fuchsia-500/20 to-fuchsia-600/20', icon: '✓' },
  { label: 'Pick', player: '1', color: 'from-cyan-500/20 to-cyan-600/20', icon: '✓' },
  { label: 'Pick', player: '2', color: 'from-fuchsia-500/20 to-fuchsia-600/20', icon: '✓' },
  { label: 'Random', player: 'Any', color: 'from-amber-500/20 to-amber-600/20', icon: '🎲' },
]

const QUICK_STATS = [
  { label: 'Players', value: '2' },
  { label: 'Frequency', value: 'Once/Year' },
  { label: 'Format', value: 'Best of 5' },
  { label: 'Total Bans', value: '2' },
  { label: 'Picks/Player', value: '2' },
  { label: 'Decider', value: '1 Random' },
  { label: 'To Win', value: 'First to 3' },
]

const RuleCard: React.FC<{
  section: RuleSection
  index: number
}> = ({ section }) => {
  const isHighlight = section.highlight

  return (
    <div
      id={section.id}
      className={`scroll-mt-20 ${
        isHighlight
          ? 'ring-2 ring-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.15)]'
          : ''
      } rounded-3xl border border-white/10 p-8 sm:p-10 transition-all duration-300 hover:border-white/20`}
      style={{
        background: isHighlight
          ? 'linear-gradient(135deg, rgba(251,191,36,0.03) 0%, rgba(168,85,247,0.03) 100%)'
          : 'linear-gradient(135deg, rgba(15,23,42,0.5) 0%, rgba(30,41,59,0.3) 100%)',
      }}
    >
      {/* Header with number badge and icon */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
            <span className="text-lg font-black">{section.number}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white/60">{section.icon}</div>
            <h3 className="text-2xl font-black text-white">{section.title}</h3>
          </div>
        </div>
        {isHighlight && (
          <div className="px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 flex-shrink-0">
            Official
          </div>
        )}
      </div>

      {/* Content */}
      <div className="ml-16 space-y-3 text-slate-300">
        {section.content.map((paragraph, idx) => (
          <p key={idx} className={paragraph === '' ? 'h-2' : 'leading-relaxed'}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

const DraftVisual: React.FC = () => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-8 sm:p-10">
      <h3 className="text-2xl font-black text-white mb-8">Official Draft Sequence</h3>

      {/* Desktop view - Horizontal */}
      <div className="hidden sm:flex gap-2 overflow-x-auto pb-4">
        {DRAFT_STEPS.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center flex-shrink-0">
            <div
              className={`w-28 h-28 rounded-2xl border border-white/10 bg-gradient-to-br ${step.color} flex flex-col items-center justify-center gap-2 transition-all hover:border-white/30`}
            >
              <div className="text-3xl">{step.icon}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white">
                {step.label}
              </div>
              <div className="text-[10px] text-white/70">P{step.player}</div>
            </div>
            {idx < DRAFT_STEPS.length - 1 && (
              <div className="h-8 w-0.5 bg-gradient-to-b from-white/20 to-transparent mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile view - Vertical */}
      <div className="sm:hidden space-y-3">
        {DRAFT_STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-2xl border border-white/10 bg-gradient-to-br ${step.color} flex flex-col items-center justify-center gap-1 flex-shrink-0`}
            >
              <div className="text-2xl">{step.icon}</div>
              <div className="text-[9px] font-semibold text-white/80">{step.label}</div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{step.label}</p>
              <p className="text-xs text-slate-400">Player {step.player}</p>
            </div>
            {idx < DRAFT_STEPS.length - 1 && (
              <div className="flex-1 text-center text-slate-500">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const QuickStatsStrip: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
      {QUICK_STATS.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950 p-4 text-center transition-all hover:border-white/20 hover:bg-slate-900/60"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
            {stat.label}
          </p>
          <p className="text-2xl font-black text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

const ChampionPrizeCard: React.FC = () => {
  return (
    <div
      className="rounded-3xl border border-amber-400/20 p-8 sm:p-10 overflow-hidden relative"
      style={{
        background:
          'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(217,70,239,0.05) 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="h-6 w-6 text-amber-300" />
          <h3 className="text-2xl font-black text-white">What the Champion Earns</h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Title
            </div>
            <p className="text-lg font-semibold text-white">
              Official TAGS Champion
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Crown your year with the title
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Legacy
            </div>
            <p className="text-lg font-semibold text-white">
              Permanent Place in History
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your name etched forever
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Bragging Rights
            </div>
            <p className="text-lg font-semibold text-white">
              1-Year Supremacy
            </p>
            <p className="text-xs text-slate-400 mt-1">
              The right to defend your crown
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const TableOfContents: React.FC<{ onNavigate: (id: string) => void }> = ({
  onNavigate,
}) => {
  return (
    <div className="hidden xl:block fixed left-0 top-1/2 -translate-y-1/2 p-6">
      <div className="space-y-2">
        {RULE_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className="block text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-cyan-300 transition-colors text-left whitespace-nowrap"
          >
            Rule {section.number}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function RulesPage() {

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })

    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = RULE_SECTIONS.map((s) => s.id)
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top < window.innerHeight / 2) {
    
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_0,transparent_44%),radial-gradient(circle_at_right,rgba(168,85,247,0.08),transparent_0,transparent_40%)]" />      {/* Header with back button and Discord link */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Championship
          </a>
          <div className="text-right flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Official Rulebook</p>
            <p className="text-sm font-bold text-white">{CHAMPIONSHIP_ACRONYM}</p>
          </div>
          <a
            href="#requirements"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
          >
            Requirements
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

      {/* Side navigation */}
      <TableOfContents onNavigate={handleNavigate} />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100">
              <BookOpen className="h-4 w-4" />
              {CHAMPIONSHIP_ACRONYM}
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white text-center mb-6 tracking-tight">
            Official Rules
          </h1>

          {/* Subheading */}
          <p className="text-center text-lg sm:text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
            The official format and competitive rules for the{' '}
            <span className="text-cyan-300 font-semibold">{CHAMPIONSHIP_NAME}</span>
          </p>

          {/* Supporting line */}
          <p className="text-center text-sm sm:text-base text-slate-500">
            One night. Five games. One champion.
          </p>
        </div>
      </section>

      {/* Quick Stats Strip */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <QuickStatsStrip />
        </div>
      </section>

      {/* Visual Divider */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Draft Visualization */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <DraftVisual />
        </div>
      </section>

      {/* Visual Divider */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Rule Sections */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {RULE_SECTIONS.map((section, idx) => (
            <RuleCard key={section.id} section={section} index={idx} />
          ))}
        </div>
      </section>

      {/* Visual Divider */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Champion Prize Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="max-w-4xl mx-auto">
          <ChampionPrizeCard />
        </div>
      </section>

      {/* Footer Statement */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl sm:text-3xl font-black text-white mb-3">
            Every year, the title must be earned.
          </p>
          <p className="text-slate-400 text-sm">
            {CHAMPIONSHIP_ACRONYM} {CURRENT_YEAR} • Inaugural Championship
          </p>
        </div>
      </section>
    </main>
  )
}
