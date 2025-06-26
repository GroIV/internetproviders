import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProvidersManager from './ProvidersManager';
import PlansManager from './PlansManager';
import CoverageManager from './CoverageManager';
import UploadManager from './UploadManager';

const AdminDashboard = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and is admin
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLocation('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (!userData.isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      setLocation('/');
      return;
    }
    
    setUser(userData);
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage providers, plans, and coverage areas
        </p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <ProvidersManager />
        </TabsContent>

        <TabsContent value="plans">
          <PlansManager />
        </TabsContent>

        <TabsContent value="coverage">
          <CoverageManager />
        </TabsContent>

        <TabsContent value="upload">
          <UploadManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 