
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/sonner';
import { api } from '@/services/api';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Key } from 'lucide-react';

// Form schema for activation key
const activationSchema = z.object({
  activationKey: z.string().min(1, "Activation key is required"),
});

type ActivationFormValues = z.infer<typeof activationSchema>;

const ClientActivation = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    macAddress: '',
    hostname: '',
  });
  const [isActivated, setIsActivated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Checking activation status...');

  const form = useForm<ActivationFormValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      activationKey: '',
    },
  });

  // Get device information (simplified for web context)
  useEffect(() => {
    // In a browser environment, we can't directly access MAC address due to security restrictions
    // This is a simplified version that generates a unique device fingerprint instead
    const generateDeviceFingerprint = () => {
      // Generate a fingerprint based on available browser information
      const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Add any other unique properties available
      };
      
      // Create a simple hash from the fingerprint
      const fingerprintString = JSON.stringify(fingerprint);
      let hash = 0;
      for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Format as MAC-like string for compatibility with backend
      const hashStr = Math.abs(hash).toString(16).padStart(12, '0');
      const macLike = [
        hashStr.slice(0, 2),
        hashStr.slice(2, 4),
        hashStr.slice(4, 6),
        hashStr.slice(6, 8),
        hashStr.slice(8, 10),
        hashStr.slice(10, 12)
      ].join(':');
      
      return macLike;
    };

    // Set device info
    setDeviceInfo({
      macAddress: generateDeviceFingerprint(),
      hostname: window.location.hostname,
    });

    // Check activation status
    checkActivationStatus();
  }, []);

  const checkActivationStatus = async () => {
    try {
      setIsChecking(true);
      setStatusMessage('Checking activation status...');
      
      // In a real application, you would call your API here
      // This is a mock implementation similar to your Python app's check_activation_status
      const mac = deviceInfo.macAddress || 'pending';
      const hostname = deviceInfo.hostname;
      
      console.log(`Checking activation: MAC=${mac}, Hostname=${hostname}`);
      
      // Simulate API call to check if the device is activated
      try {
        // Get all devices
        const devices = await api.getDevices();
        // Find if this device exists and is active
        const device = devices.find(d => 
          d.macAddress.toLowerCase() === mac.toLowerCase() && 
          d.status === 'active'
        );
        
        if (device) {
          console.log("Device found and is active:", device);
          setIsActivated(true);
          setStatusMessage('Status: Activated');
        } else {
          console.log("Device not activated");
          setIsActivated(false);
          setStatusMessage('Status: Not activated');
        }
      } catch (error) {
        console.error("Error checking activation:", error);
        setStatusMessage('Error: Could not check activation status');
        toast.error("Connection error", {
          description: "Could not connect to activation server"
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleActivate = async (values: ActivationFormValues) => {
    try {
      setStatusMessage('Activating...');
      const { activationKey } = values;
      
      console.log(`Sending activation request: MAC=${deviceInfo.macAddress}, Hostname=${deviceInfo.hostname}, Key=${activationKey}`);
      
      // In a real application, you would call your API here
      // This is a mock implementation similar to your Python app's activate_software
      const devices = await api.getDevices();
      const matchingDevice = devices.find(d => d.key === activationKey);
      
      if (matchingDevice) {
        // Update the device with this computer's information
        // In a real app, you would call an API endpoint to do this
        console.log("Valid activation key:", matchingDevice);
        setIsActivated(true);
        setStatusMessage('Activation successful!');
        toast.success("Activated successfully", {
          description: "Your software has been activated successfully!"
        });
        
        // Log the activation
        await api.addLogEntry({
          action: 'issue_key',
          deviceId: matchingDevice.id,
          deviceDetails: `${deviceInfo.hostname} (${deviceInfo.macAddress})`
        });
      } else {
        console.log("Invalid activation key");
        setStatusMessage('Error: Invalid activation key');
        toast.error("Activation failed", {
          description: "The activation key is invalid or expired."
        });
      }
    } catch (error) {
      console.error("Activation error:", error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast.error("Connection error", {
        description: "Could not connect to activation server"
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Software Activation</CardTitle>
            <CardDescription>Activate your software with a license key</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Device Information:</h3>
                <p className="text-xs text-muted-foreground">Device ID: {deviceInfo.macAddress}</p>
                <p className="text-xs text-muted-foreground">Hostname: {deviceInfo.hostname}</p>
              </div>

              {isChecking ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : isActivated ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-green-50 dark:bg-green-950">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Software Successfully Activated
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                      You can now use all features of the software.
                    </p>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleActivate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="activationKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activation Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your activation key" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      <Key className="mr-2 h-4 w-4" />
                      Activate Software
                    </Button>
                  </form>
                </Form>
              )}
              
              <div className={`text-sm ${
                statusMessage.includes('Error') 
                  ? 'text-red-500' 
                  : statusMessage.includes('Activated') || statusMessage.includes('successful')
                    ? 'text-green-500' 
                    : 'text-muted-foreground'
              }`}>
                {statusMessage}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClientActivation;
