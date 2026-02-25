import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'Will PrepSmart replace traditional coaching completely?',
    answer: 'PrepSmart provides comprehensive exam preparation that rivals and often exceeds traditional coaching. With personalized study plans, expert mentorship, real exam simulations, and AI-powered analytics, many students find they don\'t need additional coaching. However, you can use PrepSmart alongside traditional coaching as a supplement for extra practice and personalized guidance.'
  },
  {
    question: 'What if I fail even after using PrepSmart?',
    answer: 'We offer a results guarantee! If you complete 80% of your study plan, attempt all mock tests, and don\'t clear your exam, we provide free access for the next attempt cycle. Our 98% success rate speaks for itself, but we stand by our commitment to your success.'
  },
  {
    question: 'How is the mentorship program different from other platforms?',
    answer: 'Our mentors are actual exam toppers and selected candidates who have cleared the exact exam you\'re preparing for. They provide personalized 1-on-1 guidance, strategy sessions, doubt resolution, and motivation support. This isn\'t recorded content – it\'s real human connection with people who\'ve walked your path.'
  },
  {
    question: 'Can I access the platform on mobile?',
    answer: 'Absolutely! PrepSmart is fully responsive and works seamlessly on smartphones, tablets, and desktops. You can study during your commute, in breaks, or anywhere you have internet access. We also offer offline access for downloaded materials.'
  },
  {
    question: 'What if I\'m preparing for multiple exams?',
    answer: 'Great question! Many competitive exams share common topics. PrepSmart allows you to add multiple exam targets and creates an integrated study plan that covers common topics together while giving specific attention to unique sections of each exam.'
  },
  {
    question: 'How current are the study materials and current affairs?',
    answer: 'Our content team updates materials daily. Current affairs capsules are published every morning. All mock tests reflect the latest exam patterns, and question banks are updated whenever exam authorities announce changes.'
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! You can try PrepSmart free for 7 days with full access to all features. No credit card required. After the trial, you can choose a plan that fits your needs, starting at just ₹499/month.'
  },
  {
    question: 'How do the daily quizzes and streaks help?',
    answer: 'Consistency is key to exam success. Our daily quizzes help build a regular study habit, while the streak system gamifies learning and keeps you motivated. Studies show that students who maintain a 30+ day streak score 40% higher on average.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including credit/debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe. We also offer EMI options for longer subscription plans.'
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with the platform within the first 7 days of your paid subscription, we\'ll refund your payment in full, no questions asked.'
  }
];

const FAQSection = () => {
  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary mb-4">
            <HelpCircle className="h-3 w-3 mr-1" />
            Have Questions?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about PrepSmart
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="bg-background rounded-lg border px-6 data-[state=open]:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              📧 support@prepsmart.com
            </Badge>
            <Badge variant="outline" className="py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              💬 Live Chat
            </Badge>
            <Badge variant="outline" className="py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              📞 +91-1800-XXX-XXXX
            </Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
