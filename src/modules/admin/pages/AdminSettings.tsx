
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Clock, FileCheck, Lock } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  
  // Test duration preset settings
  const [prelimsDuration, setPrelimsDuration] = useState(60);
  const [mainsDuration, setMainsDuration] = useState(180);
  const [sectionalDuration, setSectionalDuration] = useState(30);
  
  // Auto-approval rules settings
  const [autoApproveTests, setAutoApproveTests] = useState(false);
  const [maxQuestionsForAutoApproval, setMaxQuestionsForAutoApproval] = useState(5);
  const [autoApprovePDFs, setAutoApprovePDFs] = useState(false);
  
  // Security settings
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  
  const saveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>
      
      <Tabs defaultValue="test-durations">
        <TabsList className="mb-6">
          <TabsTrigger value="test-durations">Test Durations</TabsTrigger>
          <TabsTrigger value="auto-approval">Auto-Approval</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-durations">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Default Test Duration Presets</h2>
            <p className="text-sm text-gray-500 mb-6">Configure default durations for different test types. These will be pre-filled when creating new tests.</p>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Prelims Full Test (minutes)</label>
                  <Input 
                    type="number" 
                    value={prelimsDuration} 
                    onChange={(e) => setPrelimsDuration(Number(e.target.value))}
                    min="10"
                  />
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-5 w-5" />
                  <span>Typical range: 45-60 minutes</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Mains Full Test (minutes)</label>
                  <Input 
                    type="number" 
                    value={mainsDuration} 
                    onChange={(e) => setMainsDuration(Number(e.target.value))}
                    min="60"
                  />
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-5 w-5" />
                  <span>Typical range: 120-180 minutes</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Sectional Test (minutes)</label>
                  <Input 
                    type="number" 
                    value={sectionalDuration} 
                    onChange={(e) => setSectionalDuration(Number(e.target.value))}
                    min="5"
                  />
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-5 w-5" />
                  <span>Typical range: 20-40 minutes</span>
                </div>
              </div>
              
              <Button onClick={() => saveSettings('Test duration')}>
                <Save className="h-4 w-4 mr-2" />
                Save Duration Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="auto-approval">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Auto-Approval Rules</h2>
            <p className="text-sm text-gray-500 mb-6">Configure rules for when content should be automatically approved without manual review.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto-approve tests with few questions</h3>
                  <p className="text-sm text-gray-500">Tests with fewer questions than the threshold will be auto-approved</p>
                </div>
                <Switch 
                  checked={autoApproveTests} 
                  onCheckedChange={setAutoApproveTests}
                />
              </div>
              
              {autoApproveTests && (
                <div className="flex flex-col md:flex-row md:items-center gap-4 pl-6 border-l-2 border-gray-100">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Max questions for auto-approval</label>
                    <Input 
                      type="number" 
                      value={maxQuestionsForAutoApproval} 
                      onChange={(e) => setMaxQuestionsForAutoApproval(Number(e.target.value))}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <FileCheck className="h-5 w-5" />
                    <span>Recommended: 5 questions or fewer</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto-approve PDF uploads</h3>
                  <p className="text-sm text-gray-500">PDFs will be available to students immediately after upload</p>
                </div>
                <Switch 
                  checked={autoApprovePDFs} 
                  onCheckedChange={setAutoApprovePDFs}
                />
              </div>
              
              <Button onClick={() => saveSettings('Auto-approval')}>
                <Save className="h-4 w-4 mr-2" />
                Save Approval Rules
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Configure security options for admin and employee accounts.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Require Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Admin accounts will need to confirm login with a verification code</p>
                </div>
                <Switch 
                  checked={requireTwoFactor} 
                  onCheckedChange={setRequireTwoFactor}
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Password expiry (days)</label>
                  <Input 
                    type="number" 
                    value={passwordExpiryDays} 
                    onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
                    min="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 for no expiry</p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-5 w-5" />
                  <span>Recommended: 90 days</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Session timeout (minutes)</label>
                  <Input 
                    type="number" 
                    value={sessionTimeout} 
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    min="5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Inactive sessions will be logged out</p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Lock className="h-5 w-5" />
                  <span>Recommended: 30 minutes</span>
                </div>
              </div>
              
              <Button onClick={() => saveSettings('Security')}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit-logs">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
            <p className="text-sm text-gray-500 mb-6">View record of all actions performed by admins and employees.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Recent Activity</h3>
                <Button variant="outline" size="sm">Export Logs</Button>
              </div>
              
              <div className="border rounded-md divide-y">
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">John Doe (Employee)</p>
                      <p className="text-sm text-gray-500">Created a new test "IBPS PO Prelims Mock Test 4"</p>
                    </div>
                    <span className="text-sm text-gray-500">Today, 10:23 AM</span>
                  </div>
                </div>
                
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Admin User (Admin)</p>
                      <p className="text-sm text-gray-500">Published course "SSC CGL Complete Course"</p>
                    </div>
                    <span className="text-sm text-gray-500">Yesterday, 3:45 PM</span>
                  </div>
                </div>
                
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Jane Smith (Employee)</p>
                      <p className="text-sm text-gray-500">Uploaded PDF "Current Affairs April 2025"</p>
                    </div>
                    <span className="text-sm text-gray-500">Apr 26, 2025, 11:30 AM</span>
                  </div>
                </div>
                
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Admin User (Admin)</p>
                      <p className="text-sm text-gray-500">Changed security settings</p>
                    </div>
                    <span className="text-sm text-gray-500">Apr 25, 2025, 9:15 AM</span>
                  </div>
                </div>
                
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">John Doe (Employee)</p>
                      <p className="text-sm text-gray-500">Deleted test "Old SSC Test"</p>
                    </div>
                    <span className="text-sm text-gray-500">Apr 24, 2025, 2:10 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline">Load More</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
