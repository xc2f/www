import clsx from 'clsx'

interface Props {
  className?: string
  variant?: 'form' | 'signal'
}

export const Logo = ({ className, variant = 'signal' }: Props) => (
  <span className={clsx('select-none font-logo text-2xl font-bold text-primary', className)}>
    XC
    <span className="inline-flex w-[1em] justify-center leading-none">
      {variant === 'form' ? '2' : '@'}
    </span>
    F
  </span>
)
