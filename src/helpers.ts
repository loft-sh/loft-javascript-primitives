export const omitProps = <T extends {}, K extends keyof T>(props: T, omit: K[]): Omit<T, K> => {
  const ret = { ...props }
  omit.forEach((key) => delete ret[key])

  return ret
}
