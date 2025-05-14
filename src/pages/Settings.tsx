
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Save, Database, Key, Server } from 'lucide-react';

// API settings form schema
const apiSettingsSchema = z.object({
  apiKey: z.string().optional(),
  allowedIps: z.string().optional(),
  rateLimitPerMinute: z.number().min(1).max(1000).optional(),
  enableApiLogging: z.boolean().default(true),
});

type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

// Database settings form schema
const databaseSettingsSchema = z.object({
  host: z.string().default('127.0.0.1'),
  port: z.number().min(1).max(65535).default(3308),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  databaseName: z.string().min(1, "Database name is required"),
});

type DatabaseSettingsValues = z.infer<typeof databaseSettingsSchema>;

const Settings = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savingApi, setSavingApi] = useState(false);
  const [savingDb, setSavingDb] = useState(false);

  // Initialize forms
  const apiForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: 'sk_test_51KHjfsKJlfajsdD3jsdf5ajs5',
      allowedIps: '',
      rateLimitPerMinute: 60,
      enableApiLogging: true,
    },
  });

  const dbForm = useForm<DatabaseSettingsValues>({
    resolver: zodResolver(databaseSettingsSchema),
    defaultValues: {
      host: '127.0.0.1',
      port: 3308,
      username: 'KingAutoColony',
      password: 'StrongPass123',
      databaseName: 'license_system',
    },
  });

  // Redirect non-admin users
  React.useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSaveApiSettings = async (values: ApiSettingsValues) => {
    setSavingApi(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "API Settings Saved",
        description: "Your API configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API settings.",
        variant: "destructive",
      });
    } finally {
      setSavingApi(false);
    }
  };

  const handleSaveDatabaseSettings = async (values: DatabaseSettingsValues) => {
    setSavingDb(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Database Settings Saved",
        description: "Your database configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save database settings.",
        variant: "destructive",
      });
    } finally {
      setSavingDb(false);
    }
  };

  if (!isAdmin) {
    return null; // Should never get here due to redirect
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="database">
              <Database className="mr-2 h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="api">
              <Server className="mr-2 h-4 w-4" />
              API Configuration
            </TabsTrigger>
          </TabsList>
          
          {/* Database Settings */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>
                  Configure your database connection settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...dbForm}>
                  <form onSubmit={dbForm.handleSubmit(handleSaveDatabaseSettings)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={dbForm.control}
                        name="host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Host</FormLabel>
                            <FormControl>
                              <Input placeholder="localhost" {...field} />
                            </FormControl>
                            <FormDescription>
                              Database server address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={dbForm.control}
                        name="port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value, 10) || 3306)}
                              />
                            </FormControl>
                            <FormDescription>
                              Database server port
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={dbForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Database user account
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dbForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Database password
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dbForm.control}
                      name="databaseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Name of the database to connect to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={savingDb}>
                      {savingDb ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Database Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* API Settings */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure API settings for client applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...apiForm}>
                  <form onSubmit={apiForm.handleSubmit(handleSaveApiSettings)} className="space-y-6">
                    <FormField
                      control={apiForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <Button type="button" variant="outline" onClick={() => {
                              const newKey = Array.from({ length: 3 }, () => 
                                Math.random().toString(36).substring(2, 15)
                              ).join('_');
                              apiForm.setValue('apiKey', `sk_${newKey}`);
                              toast({
                                title: "API Key Generated",
                                description: "A new API key has been generated. Remember to save your changes.",
                              });
                            }}>
                              <Key className="h-4 w-4" />
                              <span className="sr-only">Generate</span>
                            </Button>
                          </div>
                          <FormDescription>
                            Secret key used to authenticate API requests from clients
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="allowedIps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed IPs</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter IP addresses, one per line (leave empty to allow all)" 
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Restrict API access to specific IP addresses (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="rateLimitPerMinute"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Rate Limit (requests per minute)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value, 10) || 60)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of API requests allowed per minute
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="enableApiLogging"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              API Request Logging
                            </FormLabel>
                            <FormDescription>
                              Log all API requests for security monitoring
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={savingApi}>
                      {savingApi ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save API Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Settings;
