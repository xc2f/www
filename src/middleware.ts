// app/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const locales = ['zh', 'en']
const defaultLocale = 'zh'
const LOCALE_COOKIE = 'locale'

function detectLocale(req: NextRequest) {
  // 1. cookie 优先
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // 2. Accept-Language
  const acceptLanguage = req.headers.get('accept-language')
  if (acceptLanguage) {
    const langs = acceptLanguage.split(',').map((l) => l.split(';')[0].toLowerCase())

    if (langs.some((l) => l.startsWith('zh'))) return 'zh'
    if (langs.some((l) => l.startsWith('en'))) return 'en'
  }

  // 3. fallback
  return defaultLocale
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 跳过内部资源
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/next') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 是否已包含 locale
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))

  if (hasLocale) {
    return NextResponse.next()
  }

  // 动态检测 locale
  const locale = detectLocale(req)

  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`

  const res = NextResponse.redirect(url)

  // 写入 cookie，避免下次再判断
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return res
}

export const config = {
  matcher: ['/((?!admin|_next|api|favicon.ico).*)'],
}
