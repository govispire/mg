import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Newspaper, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const mediaLogos = [
  { name: 'The Hindu', logo: '📰' },
  { name: 'Times of India', logo: '🗞️' },
  { name: 'Economic Times', logo: '📊' },
  { name: 'India Today', logo: '🇮🇳' },
  { name: 'NDTV', logo: '📺' },
];

const awards = [
  { title: 'Best EdTech Startup 2024', org: 'Startup India', icon: Trophy },
  { title: 'Excellence in E-Learning', org: 'NASSCOM', icon: Award },
  { title: 'Top 10 Education Apps', org: 'Google Play', icon: Star },
  { title: 'Innovation Award', org: 'CII', icon: Award },
];

const MediaMentions = () => {
  return (
    <section className="w-full py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary mb-4">
            <Newspaper className="h-3 w-3 mr-1" />
            As Featured In
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Trusted by Media & Recognized for Excellence
          </h2>
        </div>

        {/* Media Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
          {mediaLogos.map((media, index) => (
            <motion.div
              key={media.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-6 py-3 bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{media.logo}</span>
              <span className="font-semibold text-muted-foreground">{media.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Awards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {awards.map((award, index) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <award.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{award.title}</h4>
                  <p className="text-xs text-muted-foreground">{award.org}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <p className="text-lg italic text-muted-foreground mb-4">
                "PrepSmart is revolutionizing exam preparation in India with its AI-powered 
                personalized learning approach and comprehensive mentorship program."
              </p>
              <p className="font-semibold">— The Economic Times</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default MediaMentions;
