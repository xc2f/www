/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (!cacheTag) return url

  const appendCacheTag = (input: URL) => {
    input.searchParams.set('v', cacheTag)
    return input
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return appendCacheTag(new URL(url)).toString()
  }

  const relativeUrl = appendCacheTag(new URL(url, 'http://local.invalid'))
  return `${relativeUrl.pathname}${relativeUrl.search}${relativeUrl.hash}`
}
