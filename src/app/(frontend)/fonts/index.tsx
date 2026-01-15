import localFont from 'next/font/local'

export const LogoFont = localFont({
  src: [
    {
      path: './Press-Start-2P-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-logo',
})
