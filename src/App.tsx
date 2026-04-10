import { useEffect, useMemo, useRef, useState } from 'react'
import khangalImg from './assets/images/khangal.png'
import temuulenImg from './assets/images/temuulen.png'
import championbeltImg from './assets/images/championbelt.png'
import versusImg from './assets/images/versus.gif'
import './App.css'
import {
  BarChart3,
  ChevronRight,
  Crown,
  Dice5,
  Gamepad2,
  Medal,
  Trophy,

} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type GameStatus = 'available' | 'banned' | 'picked'

interface Player {
  id: string
  name: string
  tag: string
}

interface Game {
  id: string
  name: string
  status: GameStatus
  bannedBy?: string
  pickedBy?: string
  isDecider?: boolean
}

interface LineupGame {
  order: number
  gameId: string
  gameName: string
  sourceLabel: string
  pickedBy?: string
  isDecider?: boolean
}

interface DraftState {
  games: Game[]
  currentStepIndex: number
  lineup: LineupGame[]
}

interface SharedRoomState {
  draftState: DraftState
  resultByGame: Record<string, string>
}

interface MatchGame extends LineupGame {
  winnerId?: string
}

interface Match {
  year: string
  players: Player[]
  games: MatchGame[]
  winnerId?: string
  finalScore: string
}

interface ChampionRecord {
  year: string
  championId?: string
  opponentId?: string
  finalScore: string
  lineup: string[]
}

interface DraftStep {
  type: 'ban' | 'pick' | 'decider'
  playerId?: string
  label: string
  description: string
}

const EVENT_NAME = 'TAGS - The Annual Gamer Showdown 2026'
const EVENT_YEAR = '2026'
const DEFAULT_ROOM_ID = 'tags-2026-showdown'

const PLAYERS: Player[] = [
  { id: 'khangal', name: 'Khangal', tag: 'P1' },
  { id: 'best-friend', name: 'Temuulen', tag: 'P2' },
]

const GAME_POOL = [
  'CS2',
  'Valorant',
  'Rainbow Six Siege',
  'GeoGuessr',
  'Fall Guys',
  'Trackmania',
  'Tetris',
  'UFC',
  'Mortal Kombat',
  'Assetto Corsa',
  'Madden 26',
  'Dota 2',
  'Golf With Your Friends',
  'Pool',
  'Chess',
  'EA FC 26',
]

const DRAFT_STEPS: DraftStep[] = [
  {
    type: 'ban',
    playerId: 'khangal',
    label: 'Step 1 — Khangal bans 1 game',
    description: 'Open the draft by removing one game from the shared pool.',
  },
  {
    type: 'ban',
    playerId: 'best-friend',
    label: 'Step 2 — Temuulen bans 1 game',
    description: 'The second rival answers with a counter-ban.',
  },
  {
    type: 'pick',
    playerId: 'khangal',
    label: 'Step 3 — Khangal picks Game 1',
    description: 'Lock in the first battleground for the BO5.',
  },
  {
    type: 'pick',
    playerId: 'best-friend',
    label: 'Step 4 — Temuulen picks Game 2',
    description: 'The reply pick keeps the lineup balanced.',
  },
  {
    type: 'pick',
    playerId: 'khangal',
    label: 'Step 5 — Khangal picks Game 3',
    description: 'One more comfort pick can swing the night.',
  },
  {
    type: 'pick',
    playerId: 'best-friend',
    label: 'Step 6 — Temuulen picks Game 4',
    description: 'The fourth slot finalizes each player’s choices.',
  },
  {
    type: 'decider',
    label: 'Step 7 — Roll the random decider',
    description: 'One remaining game is drawn at random as the final tiebreaker.',
  },
]


const GAME_ART: Record<string, { code: string; gradient: string; accent: string; image: string }> = {
  CS2: {
    code: 'CS2',
    gradient: 'from-cyan-500/70 via-sky-500/20 to-slate-950',
    accent: '#22d3ee',
    image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg?t=1749053861',
  },
  Valorant: {
    code: 'VLR',
    gradient: 'from-rose-500/70 via-fuchsia-500/20 to-slate-950',
    accent: '#fb7185',
    image: 'https://www.riotgames.com/darkroom/1440/8d5c497da1c2eeec8cffa99b01abc64b:5329ca773963a5b739e98e715957ab39/ps-f2p-val-console-launch-16x9.jpg',
  },
  'Rainbow Six Siege': {
    code: 'R6',
    gradient: 'from-slate-300/60 via-sky-500/20 to-slate-950',
    accent: '#93c5fd',
    image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/359550/ac4f6daf0d8afee2754e9964077a9a7d5bdb8ab8/header_alt_assets_20.jpg?t=1775753097',
  },
  GeoGuessr: {
    code: 'GEO',
    gradient: 'from-emerald-500/70 via-lime-500/20 to-slate-950',
    accent: '#4ade80',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3478870/f8821d2d24ec0a864678ca65b50436a66764d540/capsule_616x353.jpg?t=1773219479',
  },
  'Fall Guys': {
    code: 'FUN',
    gradient: 'from-pink-500/70 via-fuchsia-500/20 to-slate-950',
    accent: '#f472b6',
    image: 'https://cdn1.epicgames.com/offer/50118b7f954e450f8823df1614b24e80/FGSS04_KeyArt_OfferImageLandscape_2560x1440_2560x1440-89c8edd4ffe307f5d760f286a28c3404?resize=1&w=480&h=270&quality=medium',
  },
  Trackmania: {
    code: 'TM',
    gradient: 'from-cyan-500/70 via-blue-500/20 to-slate-950',
    accent: '#22d3ee',
    image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2225070/537c73019c4becaad7afe1be047dcc470866ff20/capsule_616x353.jpg?t=1769529679',
  },
  Tetris: {
    code: 'TET',
    gradient: 'from-violet-500/70 via-indigo-500/20 to-slate-950',
    accent: '#a78bfa',
    image: 'https://m.media-amazon.com/images/I/61M3rDwh4qL.png',
  },
  UFC: {
    code: 'UFC',
    gradient: 'from-red-500/70 via-orange-500/20 to-slate-950',
    accent: '#f87171',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202309/0618/36ed2eda6185435322623473185b7ec765875be46b9b3a83.jpg',
  },
  'Mortal Kombat': {
    code: 'MK',
    gradient: 'from-orange-500/70 via-rose-500/20 to-slate-950',
    accent: '#fb923c',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1971870/header.jpg?t=1750176505',
  },
  'Assetto Corsa': {
    code: 'AC',
    gradient: 'from-indigo-500/70 via-violet-500/20 to-slate-950',
    accent: '#818cf8',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/2922/d495384d7f4109fd499a01d390577947baaf45764b65105d.jpg?w=1920&thumb=false',
  },
  'Madden 26': {
    code: 'M26',
    gradient: 'from-emerald-500/70 via-cyan-500/20 to-slate-950',
    accent: '#34d399',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3230400/ab8710b78d35384dd28a801a306e14d2cba66ea0/page_bg_raw.jpg?t=1771353662',
  },
  'Dota 2': {
    code: 'D2',
    gradient: 'from-rose-500/70 via-red-500/20 to-slate-950',
    accent: '#f87171',
    image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_616x353.jpg?t=1769535998',
  },
  'Golf With Your Friends': {
    code: 'GOLF',
    gradient: 'from-emerald-500/70 via-lime-500/20 to-slate-950',
    accent: '#4ade80',
    image: 'https://i.ytimg.com/vi/no_IUGXGFEI/maxresdefault.jpg',
  },
  Pool: {
    code: 'POOL',
    gradient: 'from-sky-500/70 via-cyan-500/20 to-slate-950',
    accent: '#38bdf8',
    image: 'https://imgs.crazygames.com/8-ball-pool-wyr_1x1/20251027031134/8-ball-pool-wyr_1x1-cover?format=auto&quality=100&metadata=none&width=1200',
  },
  Chess: {
    code: 'CHS',
    gradient: 'from-slate-300/60 via-slate-500/20 to-slate-950',
    accent: '#cbd5e1',
    image: 'https://cdn1.epicgames.com/spt-assets/f8581083c427408285529920a8afbdac/download-chess-ultra-offer-8ocdk.jpg',
  },
  'EA FC 26': {
    code: 'EA26',
    gradient: 'from-lime-500/70 via-emerald-500/20 to-slate-950',
    accent: '#a3e635',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202507/1617/27132291f4187708f316b43f65ab887a74fdf325f4ece306.png?w=1920&thumb=false',
  },
}

function ArenaHeroGraphic() {
  return (
    <div className="relative overflow-visible">
      {/* Full bleed hero with three columns */}
      <div className="grid grid-cols-[1fr_auto_1fr] relative">
          {/* Khangal side - with overflow glow */}        <div className="relative h-96 sm:h-[500px] lg:h-[500px] overflow-visible flex items-center justify-center">
          {/* Large pulsing glow behind - positioned outside container - RED for Khangal */}
          <div className="absolute -inset-32 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-red-500/70 via-red-600/40 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 bg-gradient-radial from-rose-500/60 via-transparent to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
          </div>
            {/* Player image - transparent background will show through */}
          <img 
            src={khangalImg} 
            alt="Khangal" 
            className="h-4/5 w-auto object-contain relative z-10 drop-shadow-[0_0_50px_rgba(34,211,238,0.6)] drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]" 
          />
          
          {/* Text overlay at bottom */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 text-center z-20">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300 drop-shadow-lg">Player 1</p>
            <p className="mt-2 text-2xl font-black text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse">Khangal</p>
            <p className="mt-1 text-xs tracking-[0.2em] text-cyan-200 drop-shadow-lg">THE CHAMPION</p>
          </div>
        </div>        {/* VS Badge in center */}
        <div className="flex items-center justify-center px-2 sm:px-3 relative overflow-visible">
          {/* Pulsing glow around VS badge - yellow/amber with multiple layers - MORE PROMINENT */}
          <div className="absolute -inset-24 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-yellow-300/80 via-yellow-400/50 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 bg-gradient-radial from-amber-400/70 via-orange-500/40 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/60 via-transparent to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
          </div>            <img 
            src={versusImg} 
            alt="VS"
            className="h-32 w-32 object-contain relative z-10 drop-shadow-[0_0_50px_rgba(217,70,239,0.6)] drop-shadow-[0_0_30px_rgba(232,121,250,0.5)] "
          />
        </div>{/* Temuulen side - with overflow glow */}        <div className="relative h-96 sm:h-[500px] lg:h-[500px] overflow-visible flex items-center justify-center">
          {/* Large pulsing glow behind - positioned outside container */}
          <div className="absolute -inset-32 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-fuchsia-500/60 via-pink-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/40 via-transparent to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
            {/* Player image - transparent background will show through */}
          <img 
            src={temuulenImg} 
            alt="Temuulen" 
            className="h-4/5 w-auto object-contain relative z-10 drop-shadow-[0_0_50px_rgba(217,70,239,0.6)] drop-shadow-[0_0_30px_rgba(232,121,250,0.5)]" 
          />
          
          {/* Text overlay at bottom */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 text-center z-20">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-fuchsia-300 drop-shadow-lg">Player 2</p>
            <p className="mt-2 text-2xl font-black text-white drop-shadow-[0_0_20px_rgba(217,70,239,0.6)] animate-pulse">Temuulen</p>
            <p className="mt-1 text-xs tracking-[0.2em] text-fuchsia-200 drop-shadow-lg">THE RIVAL</p>
          </div>
        </div>
      </div>      {/* Footer Section - EPIC CHAMPIONSHIP FINALE */}
      <div className="relative bg-gradient-to-b from-slate-950 via-red-950/30 to-slate-950 px-6 py-6 sm:py-8 text-center overflow-hidden border-t border-amber-500/20">
        {/* Background fire effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-40 bg-gradient-radial from-red-600/30 via-orange-500/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-0 right-0 w-64 h-40 bg-gradient-radial from-amber-600/25 via-red-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/15 via-transparent to-amber-950/15" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-2 sm:space-y-3">
          {/* Event meta */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/60">
            <span>🏆 {EVENT_YEAR}</span>
            <span className="w-1 h-1 rounded-full bg-amber-400/40" />
            <span>04/18</span>
            <span className="w-1 h-1 rounded-full bg-amber-400/40" />
            <span>ANNUAL SHOWDOWN</span>
          </div>

         

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-amber-100 font-semibold drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]">
            Who is a better gamer?
          </p>
        </div>

      
      </div>
    </div>
  )
}
function GameBanner({ gameName, compact = false }: { gameName: string; compact?: boolean }) {
  const art = GAME_ART[gameName] ?? {
    code: 'ARENA',
    gradient: 'from-slate-500/70 via-slate-700/25 to-slate-950',
    accent: '#94a3b8',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 ${compact ? 'h-16' : 'h-24'}`}>
      <img src={art.image} alt="" className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

const createGameId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const createInitialGames = (): Game[] =>
  GAME_POOL.map((name) => ({
    id: createGameId(name),
    name,
    status: 'available',
  }))

const createInitialDraftState = (): DraftState => ({
  games: createInitialGames(),
  currentStepIndex: 0,
  lineup: [],
})

const getInitialRoomId = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_ROOM_ID
  }

  const roomId = new URLSearchParams(window.location.search).get('room')?.trim()
  return roomId || DEFAULT_ROOM_ID
}

const buildSharedRoomState = (draftState: DraftState, resultByGame: Record<string, string>): SharedRoomState => ({
  draftState,
  resultByGame,
})

const isSharedRoomState = (value: unknown): value is SharedRoomState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'draftState' in value && 'resultByGame' in value
}

const getPlayerById = (playerId?: string) => PLAYERS.find((player) => player.id === playerId)

function banGame(draftState: DraftState, gameId: string, playerId: string): DraftState {
  const step = DRAFT_STEPS[draftState.currentStepIndex]
  const targetGame = draftState.games.find((game) => game.id === gameId)

  if (!step || step.type !== 'ban' || step.playerId !== playerId || !targetGame || targetGame.status !== 'available') {
    return draftState
  }

  return {
    ...draftState,
    currentStepIndex: draftState.currentStepIndex + 1,
    games: draftState.games.map((game) =>
      game.id === gameId
        ? {
            ...game,
            status: 'banned',
            bannedBy: playerId,
          }
        : game,
    ),
  }
}

function pickGame(draftState: DraftState, gameId: string, playerId: string): DraftState {
  const step = DRAFT_STEPS[draftState.currentStepIndex]
  const targetGame = draftState.games.find((game) => game.id === gameId)

  if (!step || step.type !== 'pick' || step.playerId !== playerId || !targetGame || targetGame.status !== 'available') {
    return draftState
  }

  return {
    ...draftState,
    currentStepIndex: draftState.currentStepIndex + 1,
    games: draftState.games.map((game) =>
      game.id === gameId
        ? {
            ...game,
            status: 'picked',
            pickedBy: playerId,
          }
        : game,
    ),
    lineup: [
      ...draftState.lineup,
      {
        order: draftState.lineup.length + 1,
        gameId: targetGame.id,
        gameName: targetGame.name,
        sourceLabel: `${getPlayerById(playerId)?.name ?? 'Player'} Pick`,
        pickedBy: playerId,
      },
    ],
  }
}

function generateRandomDecider(draftState: DraftState): DraftState {
  const step = DRAFT_STEPS[draftState.currentStepIndex]
  const remainingGames = draftState.games.filter((game) => game.status === 'available')

  if (!step || step.type !== 'decider' || remainingGames.length === 0) {
    return draftState
  }

  const decider = remainingGames[Math.floor(Math.random() * remainingGames.length)]

  return {
    ...draftState,
    currentStepIndex: draftState.currentStepIndex + 1,
    games: draftState.games.map((game) =>
      game.id === decider.id
        ? {
            ...game,
            status: 'picked',
            isDecider: true,
          }
        : game,
    ),
    lineup: [
      ...draftState.lineup,
      {
        order: draftState.lineup.length + 1,
        gameId: decider.id,
        gameName: decider.name,
        sourceLabel: 'Random Decider',
        isDecider: true,
      },
    ],
  }
}

function computeMatchWinner(matchGames: MatchGame[], players: Player[]) {
  const scoreMap = players.reduce<Record<string, number>>((scores, player) => {
    scores[player.id] = 0
    return scores
  }, {})

  matchGames.forEach((game) => {
    if (game.winnerId) {
      scoreMap[game.winnerId] = (scoreMap[game.winnerId] ?? 0) + 1
    }
  })

  const sortedPlayers = [...players].sort((a, b) => (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0))
  const winner = sortedPlayers.find((player) => (scoreMap[player.id] ?? 0) >= 3)

  return {
    winnerId: winner?.id,
    scoreMap,
    finalScore: `${scoreMap[sortedPlayers[0].id] ?? 0}-${scoreMap[sortedPlayers[1].id] ?? 0}`,
  }
}

function computeFinalScore(matchGames: MatchGame[], players: Player[]) {
  return computeMatchWinner(matchGames, players).finalScore
}

function getPlayerBadgeClass(playerId?: string) {
  if (playerId === 'khangal') {
    return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
  }

  if (playerId === 'best-friend') {
    return 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100'
  }

  return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
}

function getWinnerButtonClass(playerId: string, selected: boolean) {
  if (playerId === 'khangal') {
    return selected
      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-50 shadow-[0_0_30px_-12px_rgba(34,211,238,0.65)]'
      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-50'
  }

  return selected
    ? 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-50 shadow-[0_0_30px_-12px_rgba(217,70,239,0.65)]'
    : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-fuchsia-400/40 hover:text-fuchsia-50'
}

function getGameStatusMeta(game: Game) {
  if (game.isDecider) {
    return {
      label: 'Random Decider',
      className: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    }
  }

  if (game.status === 'banned') {
    return {
      label: `Banned by ${getPlayerById(game.bannedBy)?.name ?? 'Draft'}`,
      className: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
    }
  }

  if (game.pickedBy === 'khangal') {
    return {
      label: 'Picked by Khangal',
      className: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    }
  }

  if (game.pickedBy === 'best-friend') {
    return {
      label: 'Picked by Temuulen',
      className: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100',
    }
  }

  return {
    label: 'Available',
    className: 'border-slate-700 bg-slate-950/70 text-slate-300',
  }
}

function SectionHeading({
  eyebrow,
  title,
  image,
  description,
}: {
  eyebrow: string
  title: string
  image?: boolean
  description: string
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      
      {/* LEFT: Text */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h2>

        <p className="mt-3 text-base text-slate-300">
          {description}
        </p>
      </div>

      {/* RIGHT: Image */}
      {image && (
        <div className="relative flex justify-center md:justify-end">
          <img
            src={championbeltImg}
            alt="TAGS Championship Belt"
            className="h-auto w-full max-w-md object-contain drop-shadow-[0_0_40px_rgba(251,146,60,0.4)]"
          />
        </div>
      )}
    </div>
  )
}

function App() {
  const [draftState, setDraftState] = useState<DraftState>(createInitialDraftState)
  const [resultByGame, setResultByGame] = useState<Record<string, string>>({})
  const [roomId] = useState(getInitialRoomId)
  const [roomBootstrapped, setRoomBootstrapped] = useState(!isSupabaseConfigured)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showChampionPopup, setShowChampionPopup] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const lastSyncedSnapshotRef = useRef('')
  const prevWinnerRef = useRef<string | undefined>(undefined)

  const currentStep = DRAFT_STEPS[draftState.currentStepIndex]
  const currentPlayer = currentStep?.playerId ? getPlayerById(currentStep.playerId) : undefined
  const remainingAvailableGames = draftState.games.filter((game) => game.status === 'available').length
  const draftComplete = draftState.lineup.length === 5

  const liveMatch = useMemo<Match>(() => {
    const games: MatchGame[] = draftState.lineup.map((game) => ({
      ...game,
      winnerId: resultByGame[game.gameId],
    }))

    const summary = computeMatchWinner(games, PLAYERS)

    return {
      year: EVENT_YEAR,
      players: PLAYERS,
      games,
      winnerId: summary.winnerId,
      finalScore: computeFinalScore(games, PLAYERS),
    }
  }, [draftState.lineup, resultByGame])


  useEffect(() => {
    if (!supabase) {
      return
    }

    const supabaseClient = supabase
    let isActive = true

    const hydrateRoom = async () => {

      const { data, error } = await supabaseClient.from('rooms').select('id, state').eq('id', roomId).maybeSingle()

      if (!isActive) {
        return
      }

      if (error) {
        console.error(error)

        return
      }

      if (isSharedRoomState(data?.state)) {
        const nextSnapshot = JSON.stringify(data.state)
        lastSyncedSnapshotRef.current = nextSnapshot
        setDraftState(data.state.draftState)
        setResultByGame(data.state.resultByGame)
      } else {
        const initialSharedState = buildSharedRoomState(createInitialDraftState(), {})

        const { error: createError } = await supabaseClient.from('rooms').upsert({
          id: roomId,
          name: EVENT_NAME,
          state: initialSharedState,
          updated_at: new Date().toISOString(),
        })

        if (createError) {
          console.error(createError)

          return
        }

        lastSyncedSnapshotRef.current = JSON.stringify(initialSharedState)
      }

      setRoomBootstrapped(true)

    }

    const channel = supabaseClient
      .channel(`room-sync:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const nextState = (payload.new as { state?: unknown } | null)?.state

        if (isSharedRoomState(nextState)) {
          const nextSnapshot = JSON.stringify(nextState)

          if (nextSnapshot !== lastSyncedSnapshotRef.current) {
            lastSyncedSnapshotRef.current = nextSnapshot
            setDraftState(nextState.draftState)
            setResultByGame(nextState.resultByGame)
          }


        }
      })
      .subscribe((status) => {
        if (!isActive) {
          return
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {

        }
      })

    hydrateRoom()

    return () => {
      isActive = false
      void supabaseClient.removeChannel(channel)
    }
  }, [roomId])

  useEffect(() => {
    if (!supabase || !roomBootstrapped) {
      return
    }

    const supabaseClient = supabase
    const nextSharedState = buildSharedRoomState(draftState, resultByGame)
    const nextSnapshot = JSON.stringify(nextSharedState)

    if (nextSnapshot === lastSyncedSnapshotRef.current) {
      return
    }

    const timeoutId = window.setTimeout(async () => {
      const { error } = await supabaseClient.from('rooms').upsert({
        id: roomId,
        name: EVENT_NAME,
        state: nextSharedState,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error(error)

        return
      }

      lastSyncedSnapshotRef.current = nextSnapshot

    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [draftState, resultByGame, roomBootstrapped, roomId])

  useEffect(() => {
    if (!copiedLink) {
      return
    }    const timeoutId = window.setTimeout(() => setCopiedLink(false), 1800)
    return () => window.clearTimeout(timeoutId)
  }, [copiedLink])
  // Champion celebration effect
  useEffect(() => {
    if (!liveMatch.winnerId) {
      return
    }

    if (liveMatch.winnerId !== prevWinnerRef.current) {
      prevWinnerRef.current = liveMatch.winnerId
      
      // Small delay to ensure DOM is ready
      const startTimer = setTimeout(() => {
        setShowChampionPopup(true)
        
        // Generate fireworks
        const generateFireworks = () => {
          for (let i = 0; i < 30; i++) {
            const firework = document.createElement('div')
            firework.className = 'firework'
            
            const angle = (Math.PI * 2 * i) / 30
            const velocity = 6 + Math.random() * 8
            const tx = Math.cos(angle) * velocity * 50
            const ty = Math.sin(angle) * velocity * 50
            
            firework.style.setProperty('--tx', `${tx}px`)
            firework.style.setProperty('--ty', `${ty}px`)
            firework.style.left = window.innerWidth / 2 + 'px'
            firework.style.top = window.innerHeight / 2 + 'px'
            
            const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fb923c', '#fbbf24', '#fef08a', '#ffbf00']
            const bgColor = colors[Math.floor(Math.random() * colors.length)]
            
            firework.innerHTML = `<div style="width: 10px; height: 10px; background-color: ${bgColor}; border-radius: 50%; box-shadow: 0 0 8px ${bgColor};"></div>`
            document.body.appendChild(firework)
            
            setTimeout(() => firework.remove(), 1200)
          }
        }
        
        generateFireworks()
        
        // Auto-hide popup after 4.5 seconds
        const hideTimer = setTimeout(() => {
          setIsExiting(true)
          setTimeout(() => {
            setShowChampionPopup(false)
            setIsExiting(false)
          }, 500)
        }, 4500)
        
        return () => clearTimeout(hideTimer)
      }, 100)
      
      return () => clearTimeout(startTimer)
    }
  }, [liveMatch.winnerId])

  const matchSummary = useMemo(() => computeMatchWinner(liveMatch.games, PLAYERS), [liveMatch.games])
  const p1Wins = matchSummary.scoreMap[PLAYERS[0].id] ?? 0
  const p2Wins = matchSummary.scoreMap[PLAYERS[1].id] ?? 0

  const winner = getPlayerById(liveMatch.winnerId)
  const runnerUp = PLAYERS.find((player) => player.id !== liveMatch.winnerId)

  const liveResultText = winner
    ? `${winner.name} defeats ${runnerUp?.name ?? 'the rival'} ${liveMatch.finalScore}`
    : p1Wins === 0 && p2Wins === 0
      ? `Select winners for each game to crown the ${EVENT_YEAR} champion.`
      : p1Wins === p2Wins
        ? `The series is tied ${p1Wins}-${p2Wins}.`
        : `${p1Wins > p2Wins ? PLAYERS[0].name : PLAYERS[1].name} leads ${Math.max(p1Wins, p2Wins)}-${Math.min(p1Wins, p2Wins)}.`

  const championHistory = useMemo<ChampionRecord[]>(() => {
    if (liveMatch.winnerId) {
      return [
        {
          year: EVENT_YEAR,
          championId: liveMatch.winnerId,
          opponentId: PLAYERS.find((player) => player.id !== liveMatch.winnerId)?.id,
          finalScore: liveMatch.finalScore,
          lineup: liveMatch.games.map((game) => game.gameName),
        },
      ]
    }

    return [
      {
        year: EVENT_YEAR,
        finalScore: 'Pending',
        lineup: draftState.lineup.map((game) => game.gameName),
      },
    ]
  }, [draftState.lineup, liveMatch.finalScore, liveMatch.games, liveMatch.winnerId])

  const handleGameAction = (gameId: string) => {
    if (!currentStep) {
      return
    }

    if (currentStep.type === 'ban' && currentStep.playerId) {
      setDraftState((state) => banGame(state, gameId, currentStep.playerId!))
      return
    }

    if (currentStep.type === 'pick' && currentStep.playerId) {
      setDraftState((state) => pickGame(state, gameId, currentStep.playerId!))
    }
  }

  const toggleWinner = (gameId: string, playerId: string) => {
    setResultByGame((current) => {
      const next = { ...current }

      if (next[gameId] === playerId) {
        delete next[gameId]
      } else {
        next[gameId] = playerId
      }

      return next
    })
  }
  const resetExperience = () => {
    setDraftState(createInitialDraftState())
    setResultByGame({})
  }

  return (
    <main className="relative overflow-visible pb-8 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_0,transparent_44%),radial-gradient(circle_at_right,rgba(168,85,247,0.16),transparent_0,transparent_40%)]" />

      <header className="section-shell pt-6">
        <div className="glass-panel flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-100">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{EVENT_NAME}</p>
              <p className="text-xs text-slate-400">Annual 1v1 title match • {EVENT_YEAR}</p>
            </div>          </div>          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs">BO5</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs hidden sm:inline-block">2 players</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs hidden sm:inline-block">Once per year</span>
            <a
              href="#requirements"
              className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-500/20 whitespace-nowrap"
            >
              Req.
            </a>
            <a
              href="#rules"
              className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase text-fuchsia-100 transition hover:-translate-y-0.5 hover:bg-fuchsia-500/20 whitespace-nowrap"
            >
              Rules
            </a>
            <a
              href="https://discord.gg/rekBxgWT"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-indigo-400/40 bg-indigo-500/15 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase text-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-500/20 whitespace-nowrap"
            >
              Discord
            </a>
          </div>
        </div>
      </header>

      <section className="section-shell py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100">
              <Medal className="h-4 w-4" />
              {EVENT_YEAR} • Title Night
            </div>
            <h1 className="mt-5 text-balance text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {EVENT_NAME}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              One rivalry. One BO5. One crown.
            </p>            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.28em]">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 sm:px-3 py-1 text-cyan-100">Khangal</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 sm:px-3 py-1 text-slate-200">VS</span>
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 sm:px-3 py-1 text-fuchsia-100">Temuulen</span>            </div><div className="mt-7 flex flex-wrap justify-center gap-2 sm:gap-3">
              <a
                href="#draft"
                className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-500/20 whitespace-nowrap"
              >
                Start Draft
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
              <a
                href="#champions"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 whitespace-nowrap"
              >
                Champions
              </a>
              <a
                href="#rules"
                className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-fuchsia-50 transition hover:-translate-y-0.5 hover:bg-fuchsia-500/20 whitespace-nowrap"
              >
                Rules
              </a>
            </div><div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Format', value: 'Ban • Pick • Decider' },
                { label: 'Goal', value: 'First to 3' },
                { label: 'Prize', value: 'The Crown' },
              ].map((item) => (
                <div key={item.label} className="glass-panel px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <ArenaHeroGraphic />

          
          </div>
        </div>
      </section>

   

      <section className="section-shell py-8 sm:py-10">
        <div className="section-divider" />
      </section>


      <section id="draft" className="section-shell py-10 sm:py-12">
        <SectionHeading
          eyebrow="Draft Builder"
          title="Lock in the BO5"
          description="Ban, pick, and roll the decider from the shared pool below."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Current draft step</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{currentStep ? currentStep.label : 'Draft complete'}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {currentStep ? currentStep.description : 'All five games are locked and ready for the match.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentPlayer ? (
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${getPlayerBadgeClass(currentPlayer.id)}`}>
                    {currentPlayer.name} on the clock
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">
                    Decider phase
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetExperience}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                >
                  Reset Draft
                </button>
              </div>
            </div>

            {currentStep?.type === 'decider' && (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-50">Only the random decider remains.</p>
                    <p className="text-sm text-amber-100/80">Roll one of the remaining games into the final BO5 slot.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraftState((state) => generateRandomDecider(state))}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:-translate-y-0.5 hover:bg-amber-500/25"
                  >
                    <Dice5 className="h-4 w-4" />
                    Randomly choose decider
                  </button>
                </div>
              </div>
            )}

            <div className="draft-scroll mt-6 max-h-[44rem] overflow-y-auto pr-2">
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {draftState.games.map((game) => {
                const status = getGameStatusMeta(game)
                const canInteract = Boolean(currentStep && currentStep.type !== 'decider' && game.status === 'available')
                const prompt = currentStep?.type === 'ban' ? 'Ban game' : currentStep?.type === 'pick' ? 'Pick game' : ''

                return (
                  <button
                    key={game.id}
                    type="button"
                    disabled={!canInteract}
                    onClick={() => handleGameAction(game.id)}
                    className={`group rounded-3xl border p-4 text-left transition duration-200 ${status.className} ${canInteract ? 'hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-slate-900/80' : 'cursor-not-allowed opacity-95'}`}
                  >
                    <GameBanner gameName={game.name} />

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{game.name}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">{status.label}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-slate-100">
                        <Gamepad2 className="h-4 w-4" />
                      </div>
                    </div>

                    {canInteract && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                        {prompt}
                      </div>
                    )}
                  </button>
                )
              })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-white">Legend</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: 'Available', className: 'border-slate-700 bg-slate-950/70 text-slate-300' },
                  { label: 'Banned', className: 'border-rose-400/30 bg-rose-500/10 text-rose-100' },
                  { label: 'Picked by Khangal', className: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100' },
                  { label: 'Picked by Temuulen', className: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100' },
                  { label: 'Random Decider', className: 'border-amber-400/30 bg-amber-500/10 text-amber-100' },
                ].map((badge) => (
                  <span key={badge.label} className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badge.className}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-300">Remaining available games: {remainingAvailableGames}</p>
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Final BO5 lineup</h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                  {draftState.lineup.length}/5 locked
                </span>
              </div>

              {draftState.lineup.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {draftState.lineup.map((game) => (
                    <div key={game.gameId} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                      <GameBanner gameName={game.gameName} compact />
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                          {game.order}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{game.gameName}</p>
                          <p className="text-sm text-slate-300">{game.sourceLabel}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-8 text-center text-sm text-slate-400">
                  No games locked yet. Start the draft to shape the inaugural BO5.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="results" className="section-shell py-10 sm:py-12">
        <SectionHeading
          eyebrow="Match Results"
          title="Call each map and watch the series score update live"
          description="First to three takes the inaugural crown."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live series score</p>
                <p className="text-sm text-slate-300">Auto-updates from the game winner selectors.</p>
              </div>
            </div>

            <div className="mt-6 flex items-end gap-4">
              <div>
                <p className="text-4xl font-black text-cyan-100">{p1Wins}</p>
                <p className="mt-1 text-sm text-slate-300">Khangal</p>
              </div>
              <span className="pb-2 text-2xl text-slate-500">:</span>
              <div>
                <p className="text-4xl font-black text-fuchsia-100">{p2Wins}</p>
                <p className="mt-1 text-sm text-slate-300">Temuulen</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{liveResultText}</p>

            {winner ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-50">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em]">
                  <Crown className="h-4 w-4" />
                  Champion crowned
                </div>
                <p className="mt-2 text-lg font-semibold">{winner.name} wins {EVENT_YEAR} of TAGS.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                Winner banner unlocks once one player reaches three wins.
              </div>
            )}
          </div>

          <div className="space-y-4">
            {draftComplete ? (
              liveMatch.games.map((game) => (
                <div key={game.gameId} className="glass-panel p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Game {game.order}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{game.gameName}</h3>
                      <p className="mt-1 text-sm text-slate-300">{game.sourceLabel}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${game.isDecider ? 'border-amber-400/30 bg-amber-500/10 text-amber-100' : getPlayerBadgeClass(game.pickedBy)}`}>
                      {game.sourceLabel}
                    </span>
                  </div>

                  <div className="mt-3">
                    <GameBanner gameName={game.gameName} compact />
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {PLAYERS.map((player) => {
                      const selected = resultByGame[game.gameId] === player.id

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => toggleWinner(game.gameId, player.id)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${getWinnerButtonClass(player.id, selected)}`}
                        >
                          {player.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-6 text-sm text-slate-300">
                Finish the BO5 lineup first. Once all five games are selected, the result tracker becomes active.
              </div>
            )}
          </div>
        </div>      </section>      <section id="champions" className="section-shell py-10 sm:py-12">
        <div className="mb-12">
          <SectionHeading
            eyebrow="Champions History"
            title="The wall of champions starts here"
            image={true}
            description="2026 opens the archive."
          />
        </div>       
      

        <div className="mt-12 grid gap-4">
          {championHistory.map((record) => {
            const championName = getPlayerById(record.championId)?.name
            const opponentName = getPlayerById(record.opponentId)?.name

            return (
              <div key={record.year} className="glass-panel p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{record.year}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{championName ?? 'Crown still open'}</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-100">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-400">Opponent:</span> {opponentName ?? 'Pending'}
                  </p>
                  <p>
                    <span className="text-slate-400">Final score:</span> {record.finalScore}
                  </p>
                  <p>
                    <span className="text-slate-400">Lineup:</span>{' '}
                    {record.lineup.length > 0 ? record.lineup.join(' • ') : 'Draft in progress'}
                  </p>
                </div>
              </div>
            )
          })}        </div>
      </section>      {/* Champion Celebration Overlay */}
      {showChampionPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur px-4 sm:px-0">
          <div className={`champion-popup ${isExiting ? 'exiting' : ''} relative w-full max-w-md sm:max-w-lg`}>
            {/* Background glow - hidden on mobile for performance */}
            <div className="hidden sm:block absolute -inset-8 bg-gradient-radial from-yellow-400/40 via-amber-500/20 to-transparent rounded-full blur-3xl -z-10" />
              {/* Gold ring */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.5)] sm:shadow-[0_0_40px_rgba(250,204,21,0.5)] animate-pulse" />
            
            {/* Main card */}
            <div className="relative bg-gradient-to-b from-slate-950 to-slate-900 rounded-full p-8 sm:p-12 md:p-16 text-center border border-yellow-400/40 shadow-2xl">              {/* Crown icon */}
              <div className="mb-3 sm:mb-4 flex justify-center">
                <Crown className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] sm:drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
              </div>
                {/* Winner name */}
              <h1 className="champion-name text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] sm:drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] mb-1 sm:mb-2 line-clamp-2">
                {winner?.name}
              </h1>
              
              {/* Victory text */}
              <p className="text-sm sm:text-lg md:text-xl text-yellow-200 font-semibold drop-shadow-lg">
                WINS THE {EVENT_YEAR} CROWN
              </p>
              
              {/* Score */}
              <p className="mt-3 sm:mt-4 text-xl sm:text-2xl text-amber-300 font-bold drop-shadow-lg">
                {liveMatch.finalScore}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
