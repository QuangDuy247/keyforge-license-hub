
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { LogEntry } from '@/types';
import { mockData } from '@/utils/mockData';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Logs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch logs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = mockData.getLogs();
        setLogs(data);
        setFilteredLogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: "Error",
          description: "Failed to load log data.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter logs based on search query and active filter
  useEffect(() => {
    let filtered = logs;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        log =>
          (log.username && log.username.toLowerCase().includes(query)) ||
          (log.deviceDetails && log.deviceDetails.toLowerCase().includes(query)) ||
          formatAction(log.action).toLowerCase().includes(query)
      );
    }
    
    // Apply action type filter
    if (activeFilter) {
      filtered = filtered.filter(log => log.action === activeFilter);
    }
    
    setFilteredLogs(filtered);
  }, [searchQuery, activeFilter, logs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = mockData.getLogs();
      setLogs(data);
      setFilteredLogs(data);
      toast({
        title: "Refreshed",
        description: "Log data has been updated.",
      });
    } catch (error) {
      console.error('Error refreshing logs:', error);
      toast({
        title: "Error",
        description: "Failed to refresh log data.",
        variant: "destructive",
      });
    }
    setRefreshing(false);
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">View a history of all system activities</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>Track user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-1 items-center relative">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search logs..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        {activeFilter ? formatAction(activeFilter) : "All Actions"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setActiveFilter(null)}>
                        All Actions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("login")}>
                        Login Events
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("issue_key")}>
                        Key Issuance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("reset")}>
                        Device Resets
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter("delete")}>
                        Deletions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No logs found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={getActionBadgeClasses(log.action)}>
                              {formatAction(log.action)}
                            </span>
                          </TableCell>
                          <TableCell>{log.username}</TableCell>
                          <TableCell>
                            {log.deviceDetails || "System event"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} logs
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Helper function to format action types for display
const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    login: 'Login',
    issue_key: 'Issued Key',
    reset: 'Reset Device',
    delete: 'Deleted',
  };

  return actionMap[action] || action;
};

// Helper function to get badge classes based on action type
const getActionBadgeClasses = (action: string): string => {
  let baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (action) {
    case 'login':
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
    case 'issue_key':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
    case 'reset':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
    case 'delete':
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300`;
  }
};

export default Logs;
