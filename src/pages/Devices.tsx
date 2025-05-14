
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { Device, DeviceStatus, KeyDuration } from '@/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Key, 
  Trash, 
  RefreshCw
} from 'lucide-react';

// Form schema for issuing a key
const issueKeySchema = z.object({
  macAddress: z.string().min(1, "MAC address is required"),
  hostname: z.string().min(1, "Hostname is required"),
  duration: z.string().min(1, "Duration is required"),
});

type IssueKeyFormValues = z.infer<typeof issueKeySchema>;

const Devices = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStatus, setCurrentStatus] = useState<DeviceStatus | 'all'>('all');
  const [isIssueKeyDialogOpen, setIsIssueKeyDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [deviceToReset, setDeviceToReset] = useState<Device | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const form = useForm<IssueKeyFormValues>({
    resolver: zodResolver(issueKeySchema),
    defaultValues: {
      macAddress: '',
      hostname: '',
      duration: '1month',
    },
  });

  // Fetch devices on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = mockData.getDevices();
        setDevices(data);
        setFilteredDevices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching devices:', error);
        toast({
          title: "Error",
          description: "Failed to load devices.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter devices based on search query and status
  useEffect(() => {
    let result = devices;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        device =>
          device.macAddress.toLowerCase().includes(query) ||
          device.hostname.toLowerCase().includes(query) ||
          device.key.toLowerCase().includes(query)
      );
    }
    
    if (currentStatus !== 'all') {
      result = result.filter(device => device.status === currentStatus);
    }
    
    setFilteredDevices(result);
  }, [searchQuery, currentStatus, devices]);

  const handleIssueKey = (values: IssueKeyFormValues) => {
    // Generate a random key for demonstration
    const randomKey = Array.from({ length: 5 }, () => 
      Math.random().toString(36).substring(2, 10)
    ).join('-').toUpperCase();

    // Calculate expiry date based on duration
    let expiryDate: string | undefined;
    const now = new Date();
    
    switch (values.duration) {
      case '1day':
        expiryDate = new Date(now.setDate(now.getDate() + 1)).toISOString();
        break;
      case '3days':
        expiryDate = new Date(now.setDate(now.getDate() + 3)).toISOString();
        break;
      case '1month':
        expiryDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
        break;
      case '6months':
        expiryDate = new Date(now.setMonth(now.getMonth() + 6)).toISOString();
        break;
      case '2years':
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 2)).toISOString();
        break;
      case 'forever':
        expiryDate = undefined;
        break;
    }

    // Create a new device
    const newDevice: Device = {
      id: Math.random().toString(36).substring(2, 15),
      macAddress: values.macAddress,
      hostname: values.hostname,
      status: 'pending',
      key: randomKey,
      expiryDate: expiryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update state
    setDevices(prevDevices => [...prevDevices, newDevice]);
    
    // Close dialog and reset form
    setIsIssueKeyDialogOpen(false);
    form.reset();
    
    // Show success toast
    toast({
      title: "Key Issued",
      description: `License key has been issued for ${values.hostname}`,
    });

    // Log the action
    mockData.addLogEntry({
      action: 'issue_key',
      deviceDetails: `${values.hostname} (${values.macAddress})`,
      deviceId: newDevice.id
    });
  };

  const handleDeleteDevice = () => {
    if (!deviceToDelete) return;
    
    // Update state
    setDevices(prevDevices => 
      prevDevices.filter(device => device.id !== deviceToDelete.id)
    );
    
    // Close dialog
    setIsConfirmDialogOpen(false);
    setDeviceToDelete(null);
    
    // Show success toast
    toast({
      title: "Device Deleted",
      description: `${deviceToDelete.hostname} has been deleted successfully.`,
    });

    // Log the action
    mockData.addLogEntry({
      action: 'delete',
      deviceDetails: `${deviceToDelete.hostname} (${deviceToDelete.macAddress})`,
      deviceId: deviceToDelete.id
    });
  };

  const handleResetDevice = () => {
    if (!deviceToReset) return;
    
    // Update device status
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceToReset.id 
          ? { ...device, status: 'pending', updatedAt: new Date().toISOString() } 
          : device
      )
    );
    
    // Close dialog
    setIsResetDialogOpen(false);
    setDeviceToReset(null);
    
    // Show success toast
    toast({
      title: "Device Reset",
      description: `${deviceToReset.hostname} has been reset to pending status.`,
    });

    // Log the action
    mockData.addLogEntry({
      action: 'reset',
      deviceDetails: `${deviceToReset.hostname} (${deviceToReset.macAddress})`,
      deviceId: deviceToReset.id
    });
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
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Device Management</h1>
          <p className="text-muted-foreground">Manage and monitor all registered devices</p>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setIsIssueKeyDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Issue New Key
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Device Registry</CardTitle>
            <CardDescription>View and manage all registered devices in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-1 items-center relative">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by MAC, hostname or key..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Tabs 
                  defaultValue="all" 
                  className="w-full md:w-auto"
                  value={currentStatus}
                  onValueChange={(value) => setCurrentStatus(value as DeviceStatus | 'all')}
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Hostname</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>License Key</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                          No devices found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDevices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell className="font-mono">{device.macAddress}</TableCell>
                          <TableCell>{device.hostname}</TableCell>
                          <TableCell>
                            <span className={`status-badge status-badge-${device.status}`}>
                              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{device.key}</TableCell>
                          <TableCell>
                            {device.expiryDate 
                              ? new Date(device.expiryDate).toLocaleDateString() 
                              : "Never"}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setDeviceToReset(device);
                                    setIsResetDialogOpen(true);
                                  }}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reset Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setDeviceToDelete(device);
                                    setIsConfirmDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredDevices.length} of {devices.length} devices
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issue Key Dialog */}
      <Dialog open={isIssueKeyDialogOpen} onOpenChange={setIsIssueKeyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Issue New License Key</DialogTitle>
            <DialogDescription>
              Enter device details to issue a new license key.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleIssueKey)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="macAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAC Address</FormLabel>
                    <FormControl>
                      <Input placeholder="XX:XX:XX:XX:XX:XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostname</FormLabel>
                    <FormControl>
                      <Input placeholder="Device name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1day">1 Day</SelectItem>
                        <SelectItem value="3days">3 Days</SelectItem>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="w-full">
                  <Key className="mr-2 h-4 w-4" />
                  Generate License Key
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this device? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deviceToDelete && (
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">MAC Address:</div>
                <div className="text-sm font-mono">{deviceToDelete.macAddress}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Hostname:</div>
                <div className="text-sm">{deviceToDelete.hostname}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Status:</div>
                <div className="text-sm">
                  <span className={`status-badge status-badge-${deviceToDelete.status}`}>
                    {deviceToDelete.status.charAt(0).toUpperCase() + deviceToDelete.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDevice}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Device Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Device Status</DialogTitle>
            <DialogDescription>
              This will reset the device status to pending, requiring reactivation.
            </DialogDescription>
          </DialogHeader>
          
          {deviceToReset && (
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">MAC Address:</div>
                <div className="text-sm font-mono">{deviceToReset.macAddress}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Hostname:</div>
                <div className="text-sm">{deviceToReset.hostname}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Current Status:</div>
                <div className="text-sm">
                  <span className={`status-badge status-badge-${deviceToReset.status}`}>
                    {deviceToReset.status.charAt(0).toUpperCase() + deviceToReset.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetDevice}
            >
              Reset Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Devices;
