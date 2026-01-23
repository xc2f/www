import localFont from 'next/font/local'

export const LogoFont = localFont({
  src: [
    {
      path: './PressStart2P-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-logo',
})
