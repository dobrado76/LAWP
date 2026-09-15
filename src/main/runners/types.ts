export type CodeCheck = {
  type: 'stdout' | 'stdout-regex' | 'python-assert' | 'js-assert' | 'ast' | 'react-test'
  equals?: string
  pattern?: string
  file?: string
  language?: 'js' | 'py'
  query?: string
  misconceptionId?: string
}

export type PlaySpec = {
  api: 'player-v1'
  playerId?: string
  world: import('@shared/schemas/world').WorldV1
  goal: { all?: import('@shared/schemas/world').Property[]; any?: import('@shared/schemas/world').Property[]; none?: import('@shared/schemas/world').Property[] }
  constraints?: import('@shared/schemas/world').Property[]
  scaleValues?: number[]
  guided?: boolean
}

export type CodeBlock = {
  type: 'code' | 'debug'
  id?: string
  engine: 'python' | 'javascript' | 'react'
  files: { path: string; role: 'edit' | 'ro' | 'hidden-test' | 'fixture'; contents?: string }[]
  entry?: string
  timeoutMs?: number
  checks: CodeCheck[]
  hintLadder?: { level: number; kind?: 'concept' | 'assist'; md: string }[]
  play?: PlaySpec
  promptMd?: string
}
