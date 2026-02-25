
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { useExamCategorySelection } from '@/hooks/useExamCategorySelection';
import { getRoleData } from './profile/roleData';
import PersonalTab from './profile/PersonalTab';
import RoleSpecificTab from './profile/RoleSpecificTab';
import ThirdTab from './profile/ThirdTab';

interface UniversalProfileCardProps {
  className?: string;
}

const UniversalProfileCard: React.FC<UniversalProfileCardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearSelection } = useExamCategorySelection();

  const handleChangeExamCategory = () => {
    if (user?.role === 'student') {
      clearSelection();
      navigate('/student/exam-categories', { state: { fromProfile: true } });
    }
  };

  const roleData = getRoleData(user);
  const RoleIcon = roleData.icon;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 py-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white">
            <div className={`bg-gradient-to-r ${roleData.color} text-white font-bold flex items-center justify-center h-full w-full text-lg`}>
              {getInitials(user?.name || "User")}
            </div>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-600">
              {roleData.title} • {roleData.subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-${roleData.tabs.length} w-full rounded-none bg-gray-50`}>
            {roleData.tabs.map((tab, index) => (
              <TabsTrigger key={tab} value={tab}>
                {roleData.tabLabels[index]}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="personal" className="m-0">
              <PersonalTab user={user} onChangeExamCategory={handleChangeExamCategory} />
            </TabsContent>
            
            {roleData.tabs.length > 1 && (
              <TabsContent value={roleData.tabs[1]} className="m-0">
                <RoleSpecificTab user={user} />
              </TabsContent>
            )}
            
            {roleData.tabs.length > 2 && (
              <TabsContent value={roleData.tabs[2]} className="m-0">
                <ThirdTab user={user} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UniversalProfileCard;
