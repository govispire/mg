
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthModal from './auth/AuthModal';

const examCategories = [
  "Bank & Insurance",
  "SSC",
  "Railway",
  "Regulatory",
  "TNPSC",
  "UPSC",
  "Defence",
  "Engineering",
  "Others"
];

const ExamCategorySection = () => {
  const [selectedExam, setSelectedExam] = useState<string | undefined>();

  return (
    <section id="exams" className="w-full py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign Up & Choose Your Exam</h2>
            <p className="mt-2 text-gray-600">
              Select your target exam to get personalized preparation
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="exam-category" className="text-sm font-medium text-gray-700">
                Exam Category
              </label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger id="exam-category" className="w-full">
                  <SelectValue placeholder="Select an exam category" />
                </SelectTrigger>
                <SelectContent>
                  {examCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                You can add more exams later from your dashboard
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full transition-colors hover:bg-brand-darkblue" 
                  disabled={!selectedExam}
                >
                  Continue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AuthModal activeTab="register" setActiveTab={() => {}} selectedExam={selectedExam} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExamCategorySection;
