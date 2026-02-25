
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, DollarSign, TrendingUp, Users, 
  Edit, Trash2, Plus, Eye, CheckCircle, XCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentPlans = () => {
  const { toast } = useToast();
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const [plans] = useState([
    { id: 1, name: 'Basic Plan', price: 299, duration: '1 month', features: 'Basic tests, Limited support', active: true, subscribers: 1250 },
    { id: 2, name: 'Premium Plan', price: 899, duration: '3 months', features: 'All tests, Priority support, Mock interviews', active: true, subscribers: 850 },
    { id: 3, name: 'Pro Plan', price: 1499, duration: '6 months', features: 'Everything + Mentorship, Career guidance', active: true, subscribers: 620 },
    { id: 4, name: 'Ultimate Plan', price: 2499, duration: '12 months', features: 'All features + Personal mentor, Job placement', active: true, subscribers: 380 },
    { id: 5, name: 'Free Trial', price: 0, duration: '7 days', features: 'Limited access to platform', active: true, subscribers: 2100 },
  ]);

  const [transactions] = useState([
    { id: 1, user: 'John Doe', plan: 'Premium Plan', amount: 899, date: '2024-06-01', status: 'completed' },
    { id: 2, user: 'Jane Smith', plan: 'Pro Plan', amount: 1499, date: '2024-06-01', status: 'completed' },
    { id: 3, user: 'Mike Johnson', plan: 'Basic Plan', amount: 299, date: '2024-06-02', status: 'pending' },
    { id: 4, user: 'Sarah Wilson', plan: 'Ultimate Plan', amount: 2499, date: '2024-06-02', status: 'completed' },
    { id: 5, user: 'David Brown', plan: 'Premium Plan', amount: 899, date: '2024-06-02', status: 'failed' },
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleCreatePlan = () => {
    toast({
      title: "Plan Created",
      description: "New payment plan has been created successfully.",
    });
    setShowCreatePlan(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment & Plans</h1>
          <p className="text-gray-600 mt-2">Manage subscription plans and payment analytics</p>
        </div>
        <Button onClick={() => setShowCreatePlan(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">₹78,450</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">5,200</div>
                <div className="text-sm text-gray-600">Active Subscribers</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">92.5%</div>
                <div className="text-sm text-gray-600">Payment Success Rate</div>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">+12.3%</div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Manage and configure subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="text-2xl font-bold text-green-600">₹{plan.price}</div>
                      <div className="text-sm text-gray-600">{plan.duration}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plan.features}</p>
                  <div className="flex justify-between items-center">
                    <Badge className={plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-600">{plan.subscribers} subscribers</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Plan Form (conditionally shown) */}
        {showCreatePlan && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Plan</CardTitle>
              <CardDescription>
                Add a new subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input id="planName" placeholder="Enter plan name" />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" placeholder="Enter price" />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="3-month">3 Months</SelectItem>
                      <SelectItem value="6-month">6 Months</SelectItem>
                      <SelectItem value="12-month">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="features">Features</Label>
                  <Input id="features" placeholder="Enter plan features" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePlan} className="flex-1">
                    Create Plan
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreatePlan(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest payment transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.user}</TableCell>
                  <TableCell>{transaction.plan}</TableCell>
                  <TableCell>₹{transaction.amount}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPlans;
