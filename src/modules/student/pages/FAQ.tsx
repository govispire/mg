
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const generalFAQs = [
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. You will receive an email with instructions to create a new password."
  },
  {
    question: "Can I access the platform on mobile devices?",
    answer: "Yes, our platform is fully responsive and can be accessed on smartphones and tablets through any modern web browser."
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to your profile by clicking on your name in the top-right corner, then select 'Edit Profile'. From there you can update your personal information, change your photo, and manage notification preferences."
  },
  {
    question: "How can I track my progress on the platform?",
    answer: "Navigate to the 'Performance Analytics' section from the sidebar menu. There you'll find detailed statistics about your test performance, study hours, and improvement areas."
  },
  {
    question: "Is there a limit to how many tests I can take?",
    answer: "There are no limits on the number of tests you can take. You can attempt any test multiple times to improve your score and understanding."
  }
];

const examFAQs = [
  {
    question: "How are the mock tests similar to real exams?",
    answer: "Our mock tests are designed to closely match the pattern, difficulty level, and time constraints of the actual competitive exams. We update our question bank regularly based on the latest exam patterns."
  },
  {
    question: "Can I pause a test and resume it later?",
    answer: "For practice purposes, yes. However, to simulate real exam conditions, we recommend completing tests in one sitting. The 'Strict Mode' option prevents pausing to provide a more authentic experience."
  },
  {
    question: "How accurate are the difficulty levels of the questions?",
    answer: "Our questions are categorized based on difficulty levels observed in previous year papers and are reviewed by subject matter experts who have deep knowledge of competitive exam patterns."
  },
  {
    question: "Are the solutions provided for all questions?",
    answer: "Yes, detailed solutions are provided for all questions in our test series. After completing a test, you can review each question with step-by-step explanations."
  },
  {
    question: "How is the percentile calculated?",
    answer: "Percentiles are calculated based on the performance of all users who have attempted the same test. It represents the percentage of test-takers who scored lower than you."
  }
];

const subscriptionFAQs = [
  {
    question: "What are the available subscription plans?",
    answer: "We offer various subscription plans including monthly, quarterly, and annual options. Each plan provides access to different levels of content and features. Visit the 'Plans' page for detailed information."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription anytime by going to 'My Account' > 'Subscription' and clicking on 'Cancel Subscription'. Your access will continue until the end of the current billing period."
  },
  {
    question: "Are there any refunds available?",
    answer: "We offer a 7-day refund policy for annual subscriptions if you're not satisfied with our services. Monthly and quarterly subscriptions are non-refundable. Please contact our support team for assistance."
  },
  {
    question: "Can I upgrade my current plan?",
    answer: "Yes, you can upgrade your subscription plan at any time. The price difference will be prorated based on the remaining time in your current subscription."
  },
  {
    question: "Are there any discounts for students?",
    answer: "Yes, we offer special discounts for students. You'll need to verify your student status by providing valid ID or enrollment proof. Contact our support team for details."
  }
];

const FAQ = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-500">Find answers to common questions about our platform</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input className="pl-10" placeholder="Search questions..." />
        </div>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="exams">Exams & Tests</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General FAQs</CardTitle>
              <CardDescription>Common questions about using our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {generalFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`general-item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exams & Tests FAQs</CardTitle>
              <CardDescription>Questions about our mock tests and exam preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {examFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`exam-item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription FAQs</CardTitle>
              <CardDescription>Questions about plans, billing, and subscription management</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {subscriptionFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`subscription-item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
            <p className="text-gray-500 mb-4">Our support team is ready to help you</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>Contact Support</Button>
              <Button variant="outline">Visit Help Center</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;
