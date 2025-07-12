import { Ref, forwardRef, useState, useEffect, memo, useMemo } from "react";
import { motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Music2 } from "lucide-react";
import { StarBorder } from "@/components/ui/star-border";
import { useNavigate } from "react-router-dom";

const PhotoGalleryInner = ({
  animationDelay = 0.5,
}: {
  animationDelay?: number;
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // First make the container visible with a fade-in
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay * 1000);

    // Then start the photo animations after a short delay
    const animationTimer = setTimeout(
      () => {
        setIsLoaded(true);
      },
      (animationDelay + 0.4) * 1000
    );

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(animationTimer);
    };
  }, [animationDelay]);

  // Animation variants for the container
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }), []);

  // Animation variants for each photo
  const photoVariants = useMemo(() => ({
    hidden: () => ({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    }),
    visible: (custom: { x: any; y: any; order: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        mass: 1,
        delay: custom.order * 0.15,
      },
    }),
  }), []);

  // Photo positions - horizontal layout with random y offsets
  const photos = [
    {
      id: 1,
      order: 0,
      x: "-420px",
      y: "15px",
      zIndex: 50,
      direction: "left" as Direction,
      src: "/images/studio/ozer-guzel-QqTEd6Crta4-unsplash.jpg", // Dynamic studio shot
    },
    {
      id: 2,
      order: 1,
      x: "-210px",
      y: "42px",
      zIndex: 40,
      direction: "left" as Direction,
      src: "/images/studio/chuck-fortner-LFVBohYmtgc-unsplash.jpg", // Intimate studio moment
    },
    {
      id: 3,
      order: 2,
      x: "0px",
      y: "-5px",
      zIndex: 30,
      direction: "right" as Direction,
      src: "/images/studio/techivation-cuUWIKaEusk-unsplash.jpg", // Center focus
    },
    {
      id: 4,
      order: 3,
      x: "210px",
      y: "28px",
      zIndex: 20,
      direction: "right" as Direction,
      src: "/images/studio/piero-villarreal-CQjTA7zlEWo-unsplash.jpg", // Studio vibe
    },
    {
      id: 5,
      order: 4,
      x: "420px",
      y: "35px",
      zIndex: 10,
      direction: "left" as Direction,
      src: "/images/studio/techivation-f4Y89jqwjKc-unsplash.jpg", // Producer focus
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-32">
      <div className="absolute inset-0 max-md:hidden -z-10 h-[500px] w-full bg-transparent bg-[linear-gradient(to_right,#57534e_1px,transparent_1px),linear-gradient(to_bottom,#57534e_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#a8a29e_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e_1px,transparent_1px)]"></div>
      <div className="text-center mb-12">
        <p className="lg:text-lg my-2 text-sm font-medium uppercase tracking-widest text-white/90 dark:text-white/80 drop-shadow-lg">
          Showcase Your Musical Journey
        </p>
        <h3 className="z-20 mx-auto max-w-3xl justify-center bg-gradient-to-r from-white via-white/90 to-white bg-clip-text py-3 text-center text-5xl text-transparent dark:from-white dark:via-white/90 dark:to-white md:text-7xl lg:text-8xl">
          Create Your Next <span className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">Hit</span>
        </h3>
      </div>
      <div className="relative mb-12 h-[450px] w-full items-center justify-center lg:flex">
        <motion.div
          className="relative mx-auto flex w-full max-w-[1400px] justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            willChange: 'opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        >
          <motion.div
            className="relative flex w-full justify-center"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <div className="relative h-[320px] w-[320px]">
              {[...photos].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="absolute left-0 top-0"
                  style={{ 
                    zIndex: photo.zIndex,
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                  variants={photoVariants}
                  custom={{
                    x: photo.x,
                    y: photo.y,
                    order: photo.order,
                  }}
                >
                  <Photo
                    width={320}
                    height={320}
                    src={photo.src}
                    alt="Music producer in studio"
                    direction={photo.direction}
                    className="rounded-2xl shadow-2xl shadow-black/20 transition-all duration-300
                      hover:scale-105 hover:z-50
                      saturate-[0.85] contrast-[1.1] brightness-110
                      hover:saturate-110 hover:contrast-100 hover:brightness-100
                      [mask-image:linear-gradient(to_bottom,black,black)]
                      after:absolute after:inset-0 after:bg-gradient-to-b 
                      after:from-black/10 after:via-transparent after:to-black/20
                      after:mix-blend-overlay after:opacity-80
                      after:hover:opacity-0 after:transition-opacity
                      before:absolute before:inset-0 
                      before:bg-gradient-to-r before:from-[#8257E5]/10 before:to-[#B490FF]/10
                      before:mix-blend-overlay before:opacity-70
                      before:hover:opacity-0 before:transition-opacity"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div className="flex w-full justify-center">
        <StarBorder 
          className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] text-white hover:opacity-90 transition-opacity scale-90 cursor-pointer"
          speed="4s"
          onClick={() => navigate('/dashboard')}
        >
          Start Creating
        </StarBorder>
      </div>
    </div>
  );
};

export const PhotoGallery = memo(PhotoGalleryInner);

function getRandomNumberInRange(min: number, max: number): number {
  if (min >= max) {
    throw new Error("Min value should be less than max value");
  }
  return Math.random() * (max - min) + min;
}

type Direction = "left" | "right";

export const Photo = ({
  src,
  alt,
  className,
  direction,
  width,
  height,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  direction?: Direction;
  width: number;
  height: number;
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden group",
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <img
        src={src}
        {...props}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: "cover",
        }}
        className="rounded-2xl shadow-2xl shadow-black/20 transition-all duration-300
          hover:scale-105 hover:z-50 relative
          saturate-[0.85] contrast-[1.1] brightness-110
          hover:saturate-110 hover:contrast-100 hover:brightness-100"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 
        mix-blend-overlay opacity-80 group-hover:opacity-0 transition-opacity rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 
        mix-blend-overlay opacity-70 group-hover:opacity-0 transition-opacity rounded-2xl" />
    </div>
  );
}; 