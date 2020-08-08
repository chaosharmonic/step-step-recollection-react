export const moveIndex = (arr, target, destination) => {
  const filtered = arr.filter((e, i) => i !== target)

  const insertion = arr[target]

  const beginning = filtered.slice(0, destination)
  const end = filtered.slice(destination)

  return [...beginning, insertion, ...end]
}
