
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardStats, LogEntry } from '@/types';
import { mockData } from '@/utils/mockData'; // We'll create this later

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStats(mockData.getDashboardStats());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = stats
    ? [
        { name: 'Active', value: stats.activeDevices, color: '#22c55e' }, // Green
        { name: 'Expired', value: stats.expiredDevices, color: '#ef4444' }, // Red
        { name: 'Pending', value: stats.pendingDevices, color: '#eab308' }, // Yellow
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your license system</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Devices</CardTitle>
              <CardDescription>All registered devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.totalDevices || 0}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active</CardTitle>
              <CardDescription>Devices with valid licenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 dark:text-green-500">
                {stats?.activeDevices || 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Expired</CardTitle>
              <CardDescription>Devices with expired licenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600 dark:text-red-500">
                {stats?.expiredDevices || 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="md:col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Pending</CardTitle>
              <CardDescription>Devices waiting for activation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-500">
                {stats?.pendingDevices || 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="md:col-span-3"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>License Status Distribution</CardTitle>
              <CardDescription>Overview of device license statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} devices`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">No data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="md:col-span-4"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-auto max-h-[300px]">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((log: LogEntry) => (
                    <div
                      key={log.id}
                      className="flex items-start p-3 rounded-md border bg-background"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">
                            {log.username}{' '}
                            <span className="font-normal text-muted-foreground">
                              ({formatAction(log.action)})
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {log.deviceDetails && (
                          <p className="text-sm text-muted-foreground">
                            Device: {log.deviceDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to format action types for display
const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    login: 'Logged in',
    issue_key: 'Issued key',
    reset: 'Reset device',
    delete: 'Deleted device',
  };

  return actionMap[action] || action;
};

export default Dashboard;
