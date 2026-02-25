import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, VolumeX, Pause, Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Anjali Verma',
    role: 'SBI PO Selected',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    quote: 'PrepSmart helped me crack SBI PO in my first attempt. The mock tests were exactly like the real exam!',
    rating: 5
  },
  {
    name: 'Karthik Reddy',
    role: 'SSC CGL Rank 42',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    quote: 'The mentorship program was a game-changer. My mentor helped me overcome my weak areas effectively.',
    rating: 5
  },
  {
    name: 'Shruti Gupta',
    role: 'RRB NTPC Selected',
    image: 'https://randomuser.me/api/portraits/women/52.jpg',
    quote: 'Daily quizzes kept me consistent. The streak feature motivated me to study every single day!',
    rating: 5
  }
];

const VideoExplainer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary mb-4">See How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Watch Our Platform in Action
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a quick tour of PrepSmart and discover how our platform can transform your exam preparation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {/* Placeholder video area */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary/30 transition-colors"
                           onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? (
                          <Pause className="h-10 w-10 text-white" />
                        ) : (
                          <Play className="h-10 w-10 text-white ml-1" />
                        )}
                      </div>
                      <p className="text-lg font-semibold">Platform Walkthrough</p>
                      <p className="text-sm text-white/70">90 seconds</p>
                    </div>
                  </div>
                  
                  {/* Video controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <div className="flex-1 mx-4">
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-primary rounded-full" />
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Testimonials */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">What Our Students Say</h3>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <Badge variant="secondary" className="text-xs">{testimonial.role}</Badge>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          <Quote className="h-3 w-3 inline mr-1" />
                          {testimonial.quote}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainer;
