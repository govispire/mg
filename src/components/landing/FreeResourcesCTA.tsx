import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, CheckCircle, Mail, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const resources = [
  { name: 'SSC CGL Previous Year Papers (2018-2023)', downloads: '25,000+' },
  { name: 'IBPS PO Complete Study Material', downloads: '18,500+' },
  { name: 'Current Affairs Capsule 2024', downloads: '32,000+' },
  { name: 'Quantitative Aptitude Formula Sheet', downloads: '45,000+' },
];

const FreeResourcesCTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsSubmitted(true);
    toast.success('Resources sent to your email!');
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Resources List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-green-500 text-white mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              100% Free
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Download Free Study Materials
            </h2>
            <p className="text-muted-foreground mb-6">
              Get access to previous year papers, study guides, and more - absolutely free!
            </p>

            <div className="space-y-3">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{resource.name}</p>
                    <p className="text-xs text-muted-foreground">{resource.downloads} downloads</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Email Capture */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="p-8">
                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Resources Sent!</h3>
                    <p className="text-muted-foreground">Check your email for the download links</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Get Free Resources</h3>
                      <p className="text-muted-foreground">
                        Enter your email to receive SSC CGL Previous Year Papers & more
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12"
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 text-lg">
                        <Download className="mr-2 h-5 w-5" />
                        Download Now - It's Free
                      </Button>
                    </form>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      By submitting, you agree to receive study materials and updates. 
                      Unsubscribe anytime.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FreeResourcesCTA;
