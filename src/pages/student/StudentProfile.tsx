import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from 'lucide-react';
import StudentProfileCard from '@/components/student/profile/StudentProfileCard';
import SecuritySettings from '@/pages/student/SecuritySettings';

const StudentProfile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'details';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-slate-100/50 backdrop-blur-sm border border-slate-200 shadow-inner rounded-full">
              <TabsTrigger
                value="details"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-bold flex items-center gap-2 transition-all"
              >
                <User className="h-4 w-4" />
                Full Account Details
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-bold flex items-center gap-2 transition-all"
              >
                <Shield className="h-4 w-4" />
                Security Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <StudentProfileCard className="w-full" />
          </TabsContent>

          <TabsContent value="security" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;
