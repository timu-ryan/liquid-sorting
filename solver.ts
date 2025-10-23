type Color = string | number
type Tube = Color[]               // слои без пустот, снизу-вверх
type State = Tube[]               // массив пробирок
type Move  = [number, number]     // (A, B)

// убрать null в конце пробирок
function normalizeInput(grid: (Color | null | "")[][]): State {
  return grid.map(row => row.filter(x => x !== null && x !== "") as Color[])
}

// решена ли задача
function isGoal(state: State, V: number): boolean {
  return state.every(t =>
    t.length === 0 || (t.length === V && t.every(c => c === t[0]))
  )
}

// возвращает [верхний цвет, количество подряд верхних цветов]
// topBlock(["A", "B", "B", "B"])   // ['B', 3]
// topBlock(["C", "C"])             // ['C', 2]
// topBlock([])                     // [null, 0]
function topBlock(tube: Tube): [Color | null, number] {
  const L = tube.length
  // если пробирка пустая
  if (!L) return [null, 0]
  const top = tube[L - 1]
  // k - количество жидкостей одного цвета сверху
  let k = 1
  for (let i = L - 2; i >= 0 && tube[i] === top; i--) k++
  return [top, k]
}

// state: состояние, a: куда, b: откуда, V: допустимая заполненность b
// возвращает сколько можно перелить
function canPour(state: State, a: number, b: number, V: number): number {
  // в ту же пробирку нельзя
  if (a === b) return 0
  const A = state[a], B = state[b]
  // источник пустой
  if (A.length === 0) return 0
  // цель переполнена
  if (B.length === V) return 0

  const [topColorA, countA] = topBlock(A)
  // цель пуста
  if (B.length === 0) return Math.min(countA, V - B.length)

  const topColorB = B[B.length - 1]
  // верхние цвета отличаются
  if (topColorA !== topColorB) return 0
  return Math.min(countA, V - B.length)
}

// state: состояние, a: куда, b: откуда, k: сколько перелить
// возвращает новое состояние
function doPour(state: State, a: number, b: number, k: number): State {
  const A = state[a]
  const B = state[b]
  const moved = A.slice(A.length - k)
  const newA: Tube = A.slice(0, A.length - k)
  const newB: Tube = B.concat(moved)
  const next: State = state.map(t => t.slice())
  next[a] = newA
  next[b] = newB
  return next
}

// для visited, отсутствия цикличности
function key(state: State): string {
  return state.map(t => t.join(",")).join("|")
}

/**
 * обходом в ширину DFS
 *
 * @param {(Color | null | "")[][]} grid - исходная матрица NxV (каждая строка — пробирка, снизу-вверх)
 * @returns {Move[] | null} список ходов [A, B] (из A в B) или null, если решения нет
 */
export function solveWaterSort(grid: (Color | null | "")[][]): Move[] | null {
  if (grid.length === 0) return []
  // количество пробирок
  const N = grid.length
  // высота пробирок
  const V = grid[0].length
  const start: State = normalizeInput(grid)
  if (isGoal(start, V)) return []

  const visited = new Set<string>()
  const path: Move[] = []

  function dfs(state: State): boolean {
    if (isGoal(state, V)) return true
    const k = key(state)
    if (visited.has(k)) return false
    visited.add(k)

    // a - номер пробирки источника
    for (let a = 0; a < N; a++) {
      // пробирка пустая
      if (state[a].length === 0) continue
      // b - номер пробирки приемника
      for (let b = 0; b < N; b++) {
        const amount = canPour(state, a, b, V)
        if (amount <= 0) continue
        const next = doPour(state, a, b, amount)
        path.push([a, b])
        if (dfs(next)) return true
        path.pop()
      }
    }
    return false
  }

  const ok = dfs(start)
  return ok ? path : null
}
