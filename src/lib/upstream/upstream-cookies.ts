export type CookieJar = Map<string, string>

export const parseCookieHeader = (header: string): CookieJar =>
  new Map(
    header
      .split(';')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const separatorIndex = pair.indexOf('=')
        return [pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1)] as const
      }),
  )

export const mergeSetCookies = (jar: CookieJar, setCookies: string[]): CookieJar => {
  const merged = new Map(jar)
  setCookies.forEach((setCookie) => {
    const [pair] = setCookie.split(';')
    const separatorIndex = pair.indexOf('=')
    const name = pair.slice(0, separatorIndex).trim()
    const value = pair.slice(separatorIndex + 1).trim()
    if (value === 'deleted' || value === '') {
      merged.delete(name)
      return
    }
    merged.set(name, value)
  })
  return merged
}

export const serializeCookieJar = (jar: CookieJar) =>
  [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
