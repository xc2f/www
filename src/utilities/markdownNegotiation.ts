export function acceptsMarkdown(accept: string | null): boolean {
  return Boolean(
    accept?.split(',').some((range) => {
      const [type, ...parameters] = range.split(';').map((part) => part.trim().toLowerCase())
      if (type !== 'text/markdown') return false

      const quality = parameters.find((parameter) => /^q\s*=/.test(parameter))
      if (!quality) return true

      const value = Number(quality.split('=')[1])
      return value > 0 && value <= 1
    }),
  )
}

export function isMarkdownPage(pathname: string): boolean {
  try {
    const path = decodeURIComponent(pathname)
    return (
      path.startsWith('/') &&
      !/[.\\%?#]/.test(path) &&
      !/%2f/i.test(pathname) &&
      !path.includes('//') &&
      !/^\/(?:admin|api|media|next|trpc|_next|_vercel)(?:\/|$)/i.test(path) &&
      !/^\/(?:en\/|zh\/)?moments\/feed\/?$/.test(path)
    )
  } catch {
    return false
  }
}
