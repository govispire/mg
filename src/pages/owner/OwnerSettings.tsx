
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings, Shield, Bell, Globe, Database, Save } from 'lucide-react';

const OwnerSettings: React.FC = () => {
  const [platformSettings, setPlatformSettings] = useState({
    name: 'PrepSmart',
    description: 'Comprehensive exam preparation platform',
    supportEmail: 'support@prepsmart.com',
    timezone: 'UTC-5',
    maintenanceMode: false,
    registrationOpen: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    userActivity: true,
    paymentAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 60,
    passwordComplexity: 'high',
    loginAttempts: 5,
    dataEncryption: true,
  });

  const handleSavePlatformSettings = () => {
    console.log('Saving platform settings:', platformSettings);
  };

  const handleSaveNotificationSettings = () => {
    console.log('Saving notification settings:', notificationSettings);
  };

  const handleSaveSecuritySettings = () => {
    console.log('Saving security settings:', securitySettings);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">Configure and manage platform-wide settings</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup & Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name</label>
                  <Input
                    value={platformSettings.name}
                    onChange={(e) => setPlatformSettings({...platformSettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input
                    value={platformSettings.supportEmail}
                    onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Platform Description</label>
                <Textarea
                  value={platformSettings.description}
                  onChange={(e) => setPlatformSettings({...platformSettings, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={platformSettings.timezone}
                    onChange={(e) => setPlatformSettings({...platformSettings, timezone: e.target.value})}
                  >
                    <option value="UTC-5">UTC-5 (Eastern)</option>
                    <option value="UTC-6">UTC-6 (Central)</option>
                    <option value="UTC-7">UTC-7 (Mountain)</option>
                    <option value="UTC-8">UTC-8 (Pacific)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-gray-600">Temporarily disable platform access</div>
                  </div>
                  <Switch
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) => setPlatformSettings({...platformSettings, maintenanceMode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Open Registration</div>
                    <div className="text-sm text-gray-600">Allow new user registrations</div>
                  </div>
                  <Switch
                    checked={platformSettings.registrationOpen}
                    onCheckedChange={(checked) => setPlatformSettings({...platformSettings, registrationOpen: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSavePlatformSettings}>
                Save Platform Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Require 2FA for admin accounts</div>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Data Encryption</div>
                    <div className="text-sm text-gray-600">Encrypt sensitive user data</div>
                  </div>
                  <Switch
                    checked={securitySettings.dataEncryption}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, dataEncryption: checked})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
                  <Input
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password Complexity</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={securitySettings.passwordComplexity}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordComplexity: e.target.value})}
                >
                  <option value="low">Low (6+ characters)</option>
                  <option value="medium">Medium (8+ characters, mixed case)</option>
                  <option value="high">High (12+ characters, mixed case, numbers, symbols)</option>
                </select>
              </div>

              <Button onClick={handleSaveSecuritySettings}>
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive important updates via email</div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-gray-600">Receive critical alerts via SMS</div>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-600">Browser push notifications</div>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">System Alerts</div>
                    <div className="text-sm text-gray-600">System health and performance alerts</div>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">User Activity Alerts</div>
                    <div className="text-sm text-gray-600">Notifications about user behavior</div>
                  </div>
                  <Switch
                    checked={notificationSettings.userActivity}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userActivity: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Payment Alerts</div>
                    <div className="text-sm text-gray-600">Payment processing notifications</div>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentAlerts: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotificationSettings}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                External Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">Google Analytics</div>
                      <div className="text-sm text-gray-600">Track user behavior and platform usage</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">Stripe Payment</div>
                      <div className="text-sm text-gray-600">Payment processing integration</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">SendGrid Email</div>
                      <div className="text-sm text-gray-600">Email delivery service</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">Zoom Integration</div>
                      <div className="text-sm text-gray-600">Video conferencing for mentoring</div>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Automated Backups</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Daily Database Backup</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Weekly Full System Backup</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Real-time Data Replication</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Data Retention</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">User Data Retention (months)</label>
                    <Input type="number" defaultValue={24} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Log Data Retention (days)</label>
                    <Input type="number" defaultValue={90} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Manual Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline">Create Backup Now</Button>
                  <Button variant="outline">Download System Logs</Button>
                  <Button variant="outline">Export User Data</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerSettings;
