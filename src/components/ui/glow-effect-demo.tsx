import { GlowEffect } from '@/components/ui/glow-effect';

export function GlowEffectCardBackground() {
  return (
    <div className='relative h-44 w-64'>
      <GlowEffect
        colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
        mode='static'
        blur='medium'
      />
      <div className='relative h-44 w-64 rounded-lg bg-black p-2 text-white dark:bg-white dark:text-black'>
        <svg
          role='img'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 70 70'
          aria-label='MP Logo'
          width='70'
          height='70'
          className='absolute bottom-4 right-4 h-8 w-8'
          fill='none'
        >
          <path
            stroke='currentColor'
            strokeLinecap='round'
            strokeWidth='3'
            d='M51.883 26.495c-7.277-4.124-18.08-7.004-26.519-7.425-2.357-.118-4.407-.244-6.364 1.06M59.642 51c-10.47-7.25-26.594-13.426-39.514-15.664-3.61-.625-6.744-1.202-9.991.263'
          ></path>
        </svg>
      </div>
    </div>
  );
}

export function GlowEffectDemo() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-6">GlowEffect Component Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Static Mode */}
        <div className="relative h-32 w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
          <GlowEffect
            colors={['#8B5CF6', '#A855F7', '#C084FC', '#E879F9']}
            mode='static'
            blur='soft'
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-white mb-2">Static Mode</h3>
            <p className="text-sm text-white/80">Fixed gradient background</p>
          </div>
        </div>

        {/* Breathe Mode */}
        <div className="relative h-32 w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
          <GlowEffect
            colors={['#8B5CF6', '#A855F7', '#C084FC', '#E879F9']}
            mode='breathe'
            blur='soft'
            duration={4}
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-white mb-2">Breathe Mode</h3>
            <p className="text-sm text-white/80">Gentle pulsing animation</p>
          </div>
        </div>

        {/* Pulse Mode */}
        <div className="relative h-32 w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
          <GlowEffect
            colors={['#8B5CF6', '#A855F7', '#C084FC', '#E879F9']}
            mode='pulse'
            blur='medium'
            duration={3}
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-white mb-2">Pulse Mode</h3>
            <p className="text-sm text-white/80">Dynamic scaling and opacity</p>
          </div>
        </div>

        {/* Rotate Mode */}
        <div className="relative h-32 w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
          <GlowEffect
            colors={['#8B5CF6', '#A855F7', '#C084FC', '#E879F9']}
            mode='rotate'
            blur='medium'
            duration={6}
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-white mb-2">Rotate Mode</h3>
            <p className="text-sm text-white/80">Conic gradient rotation</p>
          </div>
        </div>

        {/* Color Shift Mode */}
        <div className="relative h-32 w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
          <GlowEffect
            colors={['#8B5CF6', '#A855F7', '#C084FC', '#E879F9']}
            mode='colorShift'
            blur='soft'
            duration={5}
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-white mb-2">Color Shift</h3>
            <p className="text-sm text-white/80">Smooth color transitions</p>
          </div>
        </div>

        {/* Flow Horizontal Mode */}
        <div className="relative h-32 w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
          <GlowEffect
            colors={['#8B5CF6', '#A855F7', '#C084FC', '#E879F9']}
            mode='flowHorizontal'
            blur='soft'
            duration={4}
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-white mb-2">Flow Horizontal</h3>
            <p className="text-sm text-white/80">Horizontal gradient flow</p>
          </div>
        </div>
      </div>
    </div>
  );
} 