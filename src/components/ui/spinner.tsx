import { cn } from '@/lib/utils'
import {
  Loader2,
  Loader,
  Loader2Icon,
  type LucideProps,
} from 'lucide-react'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?:
    | 'default'
    | 'circle'
    | 'pinwheel'
    | 'circle-filled'
    | 'ellipsis'
    | 'ring'
    | 'bars'
    | 'infinite'
}

type SpinnerVariantProps = Omit<SpinnerProps, 'variant'>

const Default = ({ className, ...props }: SpinnerVariantProps) => (
  <Loader className={cn('animate-spin', className)} {...props} />
)

const Circle = ({ className, ...props }: SpinnerVariantProps) => (
  <Loader2 className={cn('animate-spin', className)} {...props} />
)

const Pinwheel = ({ className, ...props }: SpinnerVariantProps) => (
  <Loader2Icon className={cn('animate-spin', className)} {...props} />
)

const CircleFilled = ({
  className,
  size = 24,
  ...props
}: SpinnerVariantProps) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rotate-180">
      <Loader2
        className={cn('animate-spin', className, 'text-foreground opacity-20')}
        size={size}
        {...props}
      />
    </div>
    <Loader2
      className={cn('relative animate-spin', className)}
      size={size}
      {...props}
    />
  </div>
)

const Ellipsis = ({ size = 24, ...props }: SpinnerVariantProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...props}
    >
      <title>Loading...</title>
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="ellipsis1"
          begin="0;ellipsis3.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="ellipsis1.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="ellipsis3"
          begin="ellipsis1.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  )
}

const Ring = ({ size = 24, ...props }: SpinnerVariantProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const Bars = ({ size = 24, ...props }: SpinnerVariantProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <rect x="1" y="4" width="4" height="16">
      <animate
        attributeName="height"
        attributeType="XML"
        values="16;20;16"
        begin="0s"
        dur="0.6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        attributeType="XML"
        values="4;2;4"
        begin="0s"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="10" y="4" width="4" height="16">
      <animate
        attributeName="height"
        attributeType="XML"
        values="16;20;16"
        begin="0.15s"
        dur="0.6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        attributeType="XML"
        values="4;2;4"
        begin="0.15s"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="19" y="4" width="4" height="16">
      <animate
        attributeName="height"
        attributeType="XML"
        values="16;20;16"
        begin="0.3s"
        dur="0.6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        attributeType="XML"
        values="4;2;4"
        begin="0.3s"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
)

const Infinite = ({ size = 24, ...props }: SpinnerVariantProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8c3.332 0 6.185-2.043 7.37-4.945a1 1 0 1 0-1.866-.715A6.002 6.002 0 0 1 12 18 6 6 0 0 1 6 12a6 6 0 0 1 6-6c2.615 0 4.85 1.674 5.666 4H15a1 1 0 1 0 0 2h4.5A1.5 1.5 0 0 0 21 10.5V6a1 1 0 1 0-2 0v1.535A7.982 7.982 0 0 0 12 4z"
    >
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

export const Spinner = ({ variant, ...props }: SpinnerProps) => {
  switch (variant) {
    case 'circle':
      return <Circle {...props} />
    case 'pinwheel':
      return <Pinwheel {...props} />
    case 'circle-filled':
      return <CircleFilled {...props} />
    case 'ellipsis':
      return <Ellipsis {...props} />
    case 'ring':
      return <Ring {...props} />
    case 'bars':
      return <Bars {...props} />
    case 'infinite':
      return <Infinite {...props} />
    default:
      return <Default {...props} />
  }
}
