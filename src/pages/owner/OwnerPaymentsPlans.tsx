
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, TrendingUp, Users, Download, Settings } from 'lucide-react';

const OwnerPaymentsPlans: React.FC = () => {
  const paymentStats = [
    { title: 'Monthly Revenue', value: '$87,450', change: '+12.3%', icon: DollarSign, color: 'text-green-600' },
    { title: 'Total Transactions', value: '12,547', change: '+8.7%', icon: CreditCard, color: 'text-blue-600' },
    { title: 'Active Subscriptions', value: '8,934', change: '+15.2%', icon: Users, color: 'text-purple-600' },
    { title: 'Conversion Rate', value: '12.8%', change: '+2.1%', icon: TrendingUp, color: 'text-orange-600' },
  ];

  const subscriptionPlans = [
    { 
      name: 'Basic Plan', 
      price: '$29/month', 
      subscribers: 3245, 
      revenue: '$94,105',
      features: ['Access to all courses', 'Basic support', '1 mentor session'],
      status: 'Active'
    },
    { 
      name: 'Premium Plan', 
      price: '$49/month', 
      subscribers: 4567, 
      revenue: '$223,783',
      features: ['Everything in Basic', 'Priority support', '4 mentor sessions', 'Advanced analytics'],
      status: 'Active'
    },
    { 
      name: 'Enterprise Plan', 
      price: '$99/month', 
      subscribers: 1122, 
      revenue: '$111,078',
      features: ['Everything in Premium', '24/7 support', 'Unlimited mentoring', 'Custom features'],
      status: 'Active'
    },
  ];

  const recentTransactions = [
    { id: 1, user: 'John Doe', plan: 'Premium', amount: '$49.00', date: '2025-06-02', status: 'Completed' },
    { id: 2, user: 'Jane Smith', plan: 'Basic', amount: '$29.00', date: '2025-06-02', status: 'Completed' },
    { id: 3, user: 'Bob Wilson', plan: 'Enterprise', amount: '$99.00', date: '2025-06-01', status: 'Completed' },
    { id: 4, user: 'Alice Brown', plan: 'Premium', amount: '$49.00', date: '2025-06-01', status: 'Failed' },
  ];

  const financialMetrics = [
    { metric: 'Average Revenue Per User (ARPU)', value: '$42.50', change: '+5.2%' },
    { metric: 'Customer Lifetime Value (CLV)', value: '$1,275', change: '+8.7%' },
    { metric: 'Monthly Recurring Revenue (MRR)', value: '$87,450', change: '+12.3%' },
    { metric: 'Churn Rate', value: '4.2%', change: '-1.1%' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Plans</h1>
          <p className="text-gray-600">Manage subscription plans and payment processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Payment Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Financial Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">{plan.status}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{plan.price}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Subscribers</div>
                    <div className="font-bold">{plan.subscribers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                    <div className="font-bold text-green-600">{plan.revenue}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Features</div>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{transaction.user}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{transaction.plan}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{transaction.amount}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{transaction.date}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={transaction.status === 'Completed' ? 'default' : 'destructive'}
                          >
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{metric.metric}</div>
                        <div className="text-xs text-gray-600">{metric.change} from last month</div>
                      </div>
                      <div className="text-xl font-bold">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Premium Plan</span>
                    <span className="font-bold">$223,783 (51.1%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Enterprise Plan</span>
                    <span className="font-bold">$111,078 (25.4%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Basic Plan</span>
                    <span className="font-bold">$94,105 (21.5%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>One-time Purchases</span>
                    <span className="font-bold">$8,790 (2.0%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Payment Gateways</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Stripe</div>
                        <div className="text-sm text-gray-600">Primary payment processor</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-gray-600">Alternative payment option</div>
                      </div>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Billing Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Trial Period</span>
                    <span className="font-medium">14 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Billing Cycle</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax Rate</span>
                    <span className="font-medium">8.25%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerPaymentsPlans;
