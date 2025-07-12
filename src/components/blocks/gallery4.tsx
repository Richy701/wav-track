import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Music2, BarChart3, Target, Clock, Users } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GalleryItem {
  id: string
  title: string
  description: string
  image: string
  category: 'production' | 'analytics' | 'collaboration' | 'goals'
  features: string[]
  icon: React.ReactNode
}

const galleryItems: GalleryItem[] = [
  // All items removed
]

const categoryColors = {
  production: 'from-violet-500 to-violet-600',
  analytics: 'from-blue-500 to-blue-600',
  goals: 'from-emerald-500 to-emerald-600',
  collaboration: 'from-orange-500 to-orange-600'
}

const categoryBgColors = {
  production: 'bg-violet-50 dark:bg-violet-950/20',
  analytics: 'bg-blue-50 dark:bg-blue-950/20',
  goals: 'bg-emerald-50 dark:bg-emerald-950/20',
  collaboration: 'bg-orange-50 dark:bg-orange-950/20'
}

export function Gallery4Demo() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative">
      {/* Stronger dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Discover WavTrack
              </h2>
              <p className="mx-auto max-w-[700px] text-white font-semibold md:text-xl drop-shadow-lg bg-black/40 rounded-lg px-4 py-2">
                Explore the powerful features that make WavTrack the ultimate music production companion
              </p>
            </motion.div>
          </div>
        </div>
        
        <div className="mx-auto max-w-6xl mt-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {galleryItems.map((item, index) => (
                <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900">
                      <div className="relative aspect-[3/2] overflow-hidden bg-zinc-900/80 dark:bg-zinc-800/80 flex items-center justify-center">
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-10",
                          categoryColors[item.category]
                        )} />
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback to a placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center&auto=format&q=80`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white",
                            `bg-gradient-to-r ${categoryColors[item.category]}`
                          )}>
                            {item.icon}
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </div>
                        </div>
                      </div>
                      
                      <CardHeader className="p-6 pb-4">
                        <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-zinc-600 dark:text-zinc-400">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-2">
                          {item.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                `bg-gradient-to-r ${categoryColors[item.category]}`
                              )} />
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className={cn(
                            "w-full mt-4 bg-gradient-to-r text-white border-0 hover:opacity-90 transition-opacity",
                            categoryColors[item.category]
                          )}
                        >
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="left-4 bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 border-0 shadow-lg" />
            <CarouselNext className="right-4 bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 border-0 shadow-lg" />
          </Carousel>
        </div>
        
      </div>
    </section>
  )
} 