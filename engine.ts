import { buildDeck, getCardDef, mulberry32 } from './cards'
import type {
  CardDef,
  FloatText,
  GameState,
  Keyword,
  LogEntry,
  Minion,
  PlayerState,
  TargetRef,
} from './types'

const HAND_LIMIT = 10
const BOARD_LIMIT = 7
const MANA_CAP = 10

// ─── 工具 ───

function clone(state: GameState): GameState {
  return structuredClone(state)
}

function pushLog(state: GameState, text: string, kind: LogEntry['kind'] = 'info') {
  state.logCounter += 1
  state.log.push({ id: state.logCounter, text, kind })
  if (state.log.length > 80) state.log.splice(0, state.log.length - 80)
}

function pushFloat(state: GameState, key: string, text: string, kind: FloatText['kind']) {
  state.logCounter += 1
  state.floats.push({ id: state.logCounter, key, text, kind })
}

function makeMinion(state: GameState, def: CardDef): Minion {
  state.uidCounter += 1
  return {
    uid: `m${state.uidCounter}`,
    defId: def.id,
    name: def.name,
    icon: def.icon,
    attack: def.attack ?? 0,
    health: def.health ?? 1,
    maxHealth: def.health ?? 1,
    keywords: [...(def.keywords ?? [])],
    canAttack: (def.keywords ?? []).includes('charge'),
  }
}

function opponentOf(p: 0 | 1): 0 | 1 {
  return p === 0 ? 1 : 0
}

function checkWinner(state: GameState) {
  const dead = state.players.map((p) => p.hp <= 0)
  if (dead[0] && dead[1]) {
    state.winner = state.active // 同歸於盡時由主動方獲勝
  } else if (dead[0]) {
    state.winner = 1
  } else if (dead[1]) {
    state.winner = 0
  }
}

function damageHero(state: GameState, pid: 0 | 1, amount: number) {
  const p = state.players[pid]
  p.hp -= amount
  pushFloat(state, `hero-${pid}`, `-${amount}`, 'damage')
}

function healHero(state: GameState, pid: 0 | 1, amount: number) {
  const p = state.players[pid]
  const healed = Math.min(amount, p.maxHp - p.hp)
  if (healed > 0) {
    p.hp += healed
    pushFloat(state, `hero-${pid}`, `+${healed}`, 'heal')
  }
}

/** 移除場上死亡隨從，回傳死亡名單 */
function sweepDead(state: GameState): Minion[] {
  const deadList: Minion[] = []
  for (const p of state.players) {
    const survivors: Minion[] = []
    for (const m of p.board) {
      if (m.health <= 0) deadList.push(m)
      else survivors.push(m)
    }
    p.board = survivors
  }
  return deadList
}

function drawCards(state: GameState, pid: 0 | 1, count: number) {
  const p = state.players[pid]
  for (let i = 0; i < count; i++) {
    if (p.deck.length === 0) {
      p.fatigue += 1
      damageHero(state, pid, p.fatigue)
      pushLog(state, `${p.name} 牌庫耗盡，受到 ${p.fatigue} 點疲勞傷害`, 'damage')
      continue
    }
    const card = p.deck.shift()!
    if (p.hand.length >= HAND_LIMIT) {
      pushLog(state, `${p.name} 手牌已滿，${card.name} 被燒毀了`, 'system')
      continue
    }
    p.hand.push(card)
  }
}

// ─── 建立遊戲 ───

export function createGame(): GameState {
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0
  const rng = mulberry32(seed)

  const mkPlayer = (id: 0 | 1, name: string, title: string): PlayerState => ({
    id,
    name,
    title,
    hp: 30,
    maxHp: 30,
    mana: 0,
    maxMana: 0,
    deck: buildDeck(rng),
    hand: [],
    board: [],
    fatigue: 0,
  })

  const state: GameState = {
    players: [
      mkPlayer(0, '蒼藍晨星', '玩家一'),
      mkPlayer(1, '緋紅暮影', '玩家二'),
    ],
    active: 0,
    round: 1,
    winner: null,
    log: [],
    floats: [],
    uidCounter: 0,
    logCounter: 0,
  }

  // 先攻抽 3 張，後攻抽 4 張並獲得幸運幣
  drawCards(state, 0, 3)
  drawCards(state, 1, 4)
  state.players[1].hand.push(getCardDef('the-coin'))

  pushLog(state, '對戰開始！蒼藍晨星 先攻，緋紅暮影 獲得幸運幣。', 'system')
  startTurn(state)
  return state
}

// ─── 回合 ───

function startTurn(state: GameState) {
  const p = state.players[state.active]
  p.maxMana = Math.min(MANA_CAP, p.maxMana + 1)
  p.mana = p.maxMana
  drawCards(state, state.active, 1)
  for (const m of p.board) m.canAttack = true
  pushLog(
    state,
    `── 第 ${state.round} 回合 · ${p.name}（${p.title}）的回合 ──`,
    'turn',
  )
  checkWinner(state)
}

export function endTurn(prev: GameState): GameState {
  const state = clone(prev)
  state.floats = []
  const p = state.players[state.active]
  pushLog(state, `${p.name} 結束回合`, 'info')
  state.active = opponentOf(state.active)
  if (state.active === 0) state.round += 1
  startTurn(state)
  return state
}

// ─── 出牌 ───

function applyBattlecry(state: GameState, pid: 0 | 1, def: CardDef) {
  const bc = def.battlecry
  if (!bc) return
  if (bc.type === 'healFriendlyHero') {
    healHero(state, pid, bc.amount)
    pushLog(state, `${def.name} 的戰吼：${state.players[pid].name} 恢復 ${bc.amount} 點生命`, 'heal')
  } else if (bc.type === 'damageEnemyHero') {
    damageHero(state, opponentOf(pid), bc.amount)
    pushLog(state, `${def.name} 的戰吼：對敵方英雄造成 ${bc.amount} 點傷害`, 'damage')
  }
}

function applySpell(
  state: GameState,
  pid: 0 | 1,
  def: CardDef,
  target: TargetRef | undefined,
) {
  const eff = def.spell!
  const enemy = opponentOf(pid)

  switch (eff.type) {
    case 'damage': {
      if (!target) throw new Error('請選擇一個目標')
      if (target.kind === 'hero') {
        damageHero(state, target.player, eff.amount)
        pushLog(state, `${def.name} 對 ${state.players[target.player].name} 造成 ${eff.amount} 點傷害`, 'damage')
      } else {
        const m = state.players[target.player].board.find((x) => x.uid === target.uid)
        if (!m) throw new Error('目標不存在')
        m.health -= eff.amount
        pushFloat(state, m.uid, `-${eff.amount}`, 'damage')
        pushLog(state, `${def.name} 對 ${m.name} 造成 ${eff.amount} 點傷害`, 'damage')
        const dead = sweepDead(state)
        for (const d of dead) pushLog(state, `${d.name} 被消滅了`, 'combat')
      }
      break
    }
    case 'heal': {
      if (!target) throw new Error('請選擇一個目標')
      if (target.kind === 'hero') {
        healHero(state, target.player, eff.amount)
        pushLog(state, `${def.name} 使 ${state.players[target.player].name} 恢復生命`, 'heal')
      } else {
        const m = state.players[target.player].board.find((x) => x.uid === target.uid)
        if (!m) throw new Error('目標不存在')
        const healed = Math.min(eff.amount, m.maxHealth - m.health)
        m.health += healed
        if (healed > 0) pushFloat(state, m.uid, `+${healed}`, 'heal')
        pushLog(state, `${def.name} 使 ${m.name} 恢復 ${healed} 點生命`, 'heal')
      }
      break
    }
    case 'damageAllEnemyMinions': {
      const board = state.players[enemy].board
      if (board.length === 0) pushLog(state, `${def.name} 撲了個空`, 'info')
      for (const m of board) {
        m.health -= eff.amount
        pushFloat(state, m.uid, `-${eff.amount}`, 'damage')
      }
      pushLog(state, `${def.name} 對所有敵方隨從造成 ${eff.amount} 點傷害`, 'damage')
      const dead = sweepDead(state)
      for (const d of dead) pushLog(state, `${d.name} 被消滅了`, 'combat')
      break
    }
    case 'healAllFriendly': {
      healHero(state, pid, eff.amount)
      for (const m of state.players[pid].board) {
        const healed = Math.min(eff.amount, m.maxHealth - m.health)
        m.health += healed
        if (healed > 0) pushFloat(state, m.uid, `+${healed}`, 'heal')
      }
      pushLog(state, `${def.name} 治癒了所有友方角色`, 'heal')
      break
    }
    case 'draw': {
      drawCards(state, pid, eff.amount)
      pushLog(state, `${def.name}：${state.players[pid].name} 抽了 ${eff.amount} 張牌`, 'play')
      break
    }
    case 'buff': {
      if (!target || target.kind !== 'minion') throw new Error('請選擇一個友方隨從')
      const m = state.players[target.player].board.find((x) => x.uid === target.uid)
      if (!m) throw new Error('目標不存在')
      if (target.player !== pid) throw new Error('只能以友方隨從為目標')
      m.attack += eff.amount
      m.health += eff.extra ?? 0
      m.maxHealth += eff.extra ?? 0
      pushFloat(state, m.uid, `+${eff.amount}/+${eff.extra ?? 0}`, 'heal')
      pushLog(state, `${def.name}：${m.name} 獲得 +${eff.amount}/+${eff.extra ?? 0}`, 'play')
      break
    }
    case 'gainMana': {
      const p = state.players[pid]
      p.mana += eff.amount
      pushLog(state, `${def.name}：本回合法力 +${eff.amount}`, 'play')
      break
    }
    default:
      break
  }
}

export function playCard(
  prev: GameState,
  handIndex: number,
  target?: TargetRef,
): GameState {
  const state = clone(prev)
  if (state.winner !== null) throw new Error('對戰已結束')
  const p = state.players[state.active]
  const def = p.hand[handIndex]
  if (!def) throw new Error('沒有這張牌')
  if (def.cost > p.mana) throw new Error('法力不足')

  if (def.kind === 'minion') {
    if (p.board.length >= BOARD_LIMIT) throw new Error('場上隨從已滿（7 個）')
    p.hand.splice(handIndex, 1)
    p.mana -= def.cost
    const minion = makeMinion(state, def)
    p.board.push(minion)
    pushLog(state, `${p.name} 召喚了 ${def.name}（${minion.attack}/${minion.health}）`, 'play')
    applyBattlecry(state, state.active, def)
  } else {
    const eff = def.spell!
    const needsTarget = def.targetType === 'any' || def.targetType === 'friendlyMinion'
    if (needsTarget && !target) throw new Error('NEED_TARGET')
    // 先驗證目標再扣費：失敗時拋出，狀態丟棄
    p.hand.splice(handIndex, 1)
    p.mana -= def.cost
    try {
      applySpell(state, state.active, def, target)
    } catch (e) {
      throw e
    }
    if (!needsTarget) {
      // 無目標法術的日誌已在 applySpell 中記錄
    }
  }

  checkWinner(state)
  return state
}

// ─── 攻擊 ───

function hasTaunt(p: PlayerState): boolean {
  return p.board.some((m) => m.keywords.includes('taunt'))
}

export function attack(
  prev: GameState,
  attackerUid: string,
  target: TargetRef,
): GameState {
  const state = clone(prev)
  if (state.winner !== null) throw new Error('對戰已結束')
  const me = state.players[state.active]
  const foe = state.players[opponentOf(state.active)]

  const attacker = me.board.find((m) => m.uid === attackerUid)
  if (!attacker) throw new Error('攻擊者不存在')
  if (!attacker.canAttack) throw new Error(`${attacker.name} 本回合無法攻擊`)
  if (attacker.attack <= 0) throw new Error('攻擊力為 0，無法攻擊')

  // 攻擊只能指向敵方
  if (target.player !== foe.id) throw new Error('只能攻擊敵方目標')

  // 嘲諷檢查
  const taunts = foe.board.filter((m) => m.keywords.includes('taunt'))
  if (target.kind === 'hero' && taunts.length > 0) {
    throw new Error('必須先攻擊具有嘲諷的隨從')
  }
  if (
    target.kind === 'minion' &&
    taunts.length > 0 &&
    !taunts.some((m) => m.uid === (target as { uid: string }).uid)
  ) {
    throw new Error('必須先攻擊具有嘲諷的隨從')
  }

  attacker.canAttack = false

  if (target.kind === 'hero') {
    damageHero(state, foe.id, attacker.attack)
    pushLog(state, `${attacker.name} 攻擊 ${foe.name}，造成 ${attacker.attack} 點傷害`, 'combat')
  } else {
    const defender = foe.board.find((m) => m.uid === (target as { uid: string }).uid)
    if (!defender) throw new Error('目標不存在')
    pushLog(
      state,
      `${attacker.name}（${attacker.attack}/${attacker.health}）交戰 ${defender.name}（${defender.attack}/${defender.health}）`,
      'combat',
    )
    defender.health -= attacker.attack
    attacker.health -= defender.attack
    pushFloat(state, defender.uid, `-${attacker.attack}`, 'damage')
    if (defender.attack > 0) pushFloat(state, attacker.uid, `-${defender.attack}`, 'damage')
    const dead = sweepDead(state)
    for (const d of dead) pushLog(state, `${d.name} 被消滅了`, 'combat')
  }

  checkWinner(state)
  return state
}

// ─── 查詢 ───

export function keywordLabel(k: Keyword): string {
  return k === 'taunt' ? '嘲諷' : '衝鋒'
}

export { HAND_LIMIT, BOARD_LIMIT, MANA_CAP }
