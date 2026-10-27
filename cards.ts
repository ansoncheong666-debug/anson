import type { CardDef } from './types'

export const CARD_POOL: CardDef[] = [
  // ─── 隨從 ───
  {
    id: 'town-guard', name: '城鎮守衛', cost: 1, kind: 'minion',
    attack: 1, health: 2, keywords: ['taunt'],
    text: '嘲諷', flavor: '第一道防線，也是最後一道。',
    icon: 'shield',
  },
  {
    id: 'young-swordsman', name: '見習劍士', cost: 1, kind: 'minion',
    attack: 2, health: 1,
    text: '', flavor: '他的劍比他的經驗鋒利。',
    icon: 'sword',
  },
  {
    id: 'swift-wolf', name: '迅捷座狼', cost: 2, kind: 'minion',
    attack: 2, health: 1, keywords: ['charge'],
    text: '衝鋒', flavor: '風追不上牠。',
    icon: 'zap',
  },
  {
    id: 'stoneguard', name: '石甲衛兵', cost: 2, kind: 'minion',
    attack: 2, health: 3, keywords: ['taunt'],
    text: '嘲諷', flavor: '岩石不會退縮。',
    icon: 'landmark',
  },
  {
    id: 'shadow-assassin', name: '暗影刺客', cost: 2, kind: 'minion',
    attack: 3, health: 2,
    text: '', flavor: '你看見她時，已經太遲了。',
    icon: 'ghost',
  },
  {
    id: 'field-medic', name: '戰地醫師', cost: 2, kind: 'minion',
    attack: 2, health: 2,
    text: '戰吼：恢復你的英雄 3 點生命。',
    battlecry: { type: 'healFriendlyHero', amount: 3 },
    icon: 'cross',
  },
  {
    id: 'troll-warrior', name: '巨魔戰士', cost: 3, kind: 'minion',
    attack: 3, health: 4,
    text: '', flavor: '再生能力讓他從不害怕受傷。',
    icon: 'axe',
  },
  {
    id: 'flame-mage', name: '烈焰法師', cost: 3, kind: 'minion',
    attack: 4, health: 2,
    text: '', flavor: '她的字典裡沒有「節制」。',
    icon: 'flame',
  },
  {
    id: 'light-priest', name: '聖光牧師', cost: 3, kind: 'minion',
    attack: 2, health: 4, keywords: ['taunt'],
    text: '嘲諷', flavor: '信仰是最堅固的鎧甲。',
    icon: 'sun',
  },
  {
    id: 'drake-rider', name: '雙足飛龍騎士', cost: 4, kind: 'minion',
    attack: 4, health: 4,
    text: '', flavor: '制空權就是一切。',
    icon: 'bird',
  },
  {
    id: 'heavy-knight', name: '重裝騎士', cost: 4, kind: 'minion',
    attack: 4, health: 5, keywords: ['taunt'],
    text: '嘲諷', flavor: '移動的堡壘。',
    icon: 'castle',
  },
  {
    id: 'moon-warlock', name: '影月術士', cost: 4, kind: 'minion',
    attack: 3, health: 5,
    text: '戰吼：對敵方英雄造成 2 點傷害。',
    battlecry: { type: 'damageEnemyHero', amount: 2 },
    icon: 'moon',
  },
  {
    id: 'wild-colossus', name: '荒野巨像', cost: 5, kind: 'minion',
    attack: 5, health: 6,
    text: '', flavor: '山脈學會了行走。',
    icon: 'mountain',
  },
  {
    id: 'rage-werewolf', name: '狂暴狼人', cost: 5, kind: 'minion',
    attack: 6, health: 4, keywords: ['charge'],
    text: '衝鋒', flavor: '月圓之夜，無人倖免。',
    icon: 'flame-kindling',
  },
  {
    id: 'ancient-dragon', name: '遠古巨龍', cost: 6, kind: 'minion',
    attack: 6, health: 7,
    text: '', flavor: '牠沉睡時，王國興衰了三次。',
    icon: 'crown',
  },
  {
    id: 'titan-warden', name: '泰坦守護者', cost: 7, kind: 'minion',
    attack: 7, health: 7, keywords: ['taunt'],
    text: '嘲諷', flavor: '上古的誓約仍在履行。',
    icon: 'shield-half',
  },
  {
    id: 'abyss-lord', name: '深淵魔王', cost: 8, kind: 'minion',
    attack: 8, health: 8,
    text: '', flavor: '深淵也在注視著你。',
    icon: 'skull',
  },
  // ─── 法術 ───
  {
    id: 'fireball', name: '火球術', cost: 3, kind: 'spell',
    text: '造成 4 點傷害。',
    spell: { type: 'damage', amount: 4 }, targetType: 'any',
    icon: 'fireball', flavor: '經典，永不過時。',
  },
  {
    id: 'shadow-bolt', name: '暗影箭', cost: 2, kind: 'spell',
    text: '造成 3 點傷害。',
    spell: { type: 'damage', amount: 3 }, targetType: 'any',
    icon: 'sparkles',
  },
  {
    id: 'holy-light', name: '聖光術', cost: 2, kind: 'spell',
    text: '恢復 6 點生命。',
    spell: { type: 'heal', amount: 6 }, targetType: 'any',
    icon: 'heart-pulse',
  },
  {
    id: 'flamestrike', name: '烈焰風暴', cost: 4, kind: 'spell',
    text: '對所有敵方隨從造成 3 點傷害。',
    spell: { type: 'damageAllEnemyMinions', amount: 3 }, targetType: 'none',
    icon: 'tornado',
  },
  {
    id: 'healing-wave', name: '治療之潮', cost: 2, kind: 'spell',
    text: '恢復所有友方角色 2 點生命。',
    spell: { type: 'healAllFriendly', amount: 2 }, targetType: 'none',
    icon: 'waves',
  },
  {
    id: 'arcane-intellect', name: '奧術智慧', cost: 2, kind: 'spell',
    text: '抽 2 張牌。',
    spell: { type: 'draw', amount: 2 }, targetType: 'none',
    icon: 'book-open',
  },
  {
    id: 'blessing-might', name: '力量祝福', cost: 1, kind: 'spell',
    text: '使一個友方隨從獲得 +2/+2。',
    spell: { type: 'buff', amount: 2, extra: 2 }, targetType: 'friendlyMinion',
    icon: 'chevrons-up',
  },
  {
    id: 'the-coin', name: '幸運幣', cost: 0, kind: 'spell',
    text: '僅在本回合中，獲得 1 點法力。',
    spell: { type: 'gainMana', amount: 1 }, targetType: 'none',
    icon: 'coins', flavor: '後手的補償。',
  },
]

export function getCardDef(id: string): CardDef {
  const def = CARD_POOL.find((c) => c.id === id)
  if (!def) throw new Error(`unknown card: ${id}`)
  return def
}

/** 30 張牌的固定牌表（雙方共用） */
const DECKLIST: string[] = [
  'town-guard', 'town-guard',
  'young-swordsman', 'young-swordsman',
  'swift-wolf', 'swift-wolf',
  'stoneguard', 'stoneguard',
  'shadow-assassin', 'shadow-assassin',
  'field-medic', 'field-medic',
  'troll-warrior', 'troll-warrior',
  'flame-mage', 'flame-mage',
  'light-priest', 'light-priest',
  'drake-rider', 'drake-rider',
  'heavy-knight',
  'moon-warlock', 'moon-warlock',
  'wild-colossus', 'wild-colossus',
  'rage-werewolf',
  'ancient-dragon', 'ancient-dragon',
  'titan-warden',
  'abyss-lord',
  'fireball', 'fireball',
  'shadow-bolt', 'shadow-bolt',
  'holy-light', 'holy-light',
  'flamestrike',
  'healing-wave',
  'arcane-intellect', 'arcane-intellect',
  'blessing-might',
]

export function buildDeck(rng: () => number): CardDef[] {
  const deck = DECKLIST.map(getCardDef)
  // Fisher–Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
