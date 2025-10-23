import { solveWaterSort } from "./solver";

const grid = [
  ['A','B','C','A'],
  ['B','C','A','B'],
  ['C','A','B','C'],
  [null,null,null,null],
  [null,null,null,null],
  [null,null,null,null],
]

const moves = solveWaterSort(grid)
if (!moves) console.log("Решение не найдено.")
else {
  console.log(`Ходов: ${moves.length}`)
  // console.log(moves)
  let res = ''
  moves.forEach(move => {
    res += `(${move[0]}, ${move[1]}) `
  })
  console.log(res)
}
