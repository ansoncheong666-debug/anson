export type Keyword = 'taunt' | 'charge'

export type SpellTargetType =
  | 'any' // 傷害／治療：任意角色（雙方英雄與隨從）
  | 'friendlyMinion' // 增益：友方隨從
  | 'none' // 不需要目標

export interface SpellEffect {
  type:
    | 'damage'
    | 'heal'
    | 'damageAllEnemyMinions'
    | 'healAllFriendly'
    | 'draw'
    | 'buff'
    | 'gainMana'
    | 'damageEnemyHero'
    | 'healFriendlyHero'
  amount: number
  extra?: number // buff 的生命加成
}

export interface CardDef {
  id: string
  name: string
  cost: number
  kind: 'minion' | 'spell'
  attack?: number
  health?: number
  keywords?: Keyword[]
  text: string
  icon: string // lucide icon 對照鍵
  flavor?: string
  // 法術效果與目標類型
  spell?: SpellEffect
  targetType?: SpellTargetType
  // 戰吼（僅限不需選目標的效果）
  battlecry?: SpellEffect
}

export interface Minion {
  uid: string
  defId: string
  name: string
  icon: string
  attack: number
  health: number
  maxHealth: number
  keywords: Keyword[]
  canAttack: boolean
}

export interface PlayerState {
  id: 0 | 1
  name: string
  title: string
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  deck: CardDef[]
  hand: CardDef[]
  board: Minion[]
  fatigue: number
}

export interface LogEntry {
  id: number
  text: string
  kind: 'info' | 'play' | 'combat' | 'damage' | 'heal' | 'turn' | 'system'
}

export interface FloatText {
  id: number
  key: string // 'hero-0' | 'hero-1' | minion uid
  text: string
  kind: 'damage' | 'heal' | 'info'
}

export interface GameState {
  players: [PlayerState, PlayerState]
  active: 0 | 1
  round: number
  winner: 0 | 1 | null
  log: LogEntry[]
  floats: FloatText[]
  uidCounter: number
  logCounter: number
}

export type TargetRef =
  | { kind: 'hero'; player: 0 | 1 }
  | { kind: 'minion'; player: 0 | 1; uid: string }

export interface SelectionState {
  type: 'attacker' | 'spell'
  uid?: string // attacker minion uid
  handIndex?: number // spell hand index
}
