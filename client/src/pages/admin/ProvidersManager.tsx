import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Provider } from '@shared/schema';

const ProvidersManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch providers
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/providers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/providers');
      return response.json();
    },
  });

  // Delete provider mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/providers/${id}`);
      if (!response.ok) throw new Error('Failed to delete provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: 'Success',
        description: 'Provider deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive',
      });
    },
  });

  // Add/Update provider mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { provider: Partial<Provider>; isNew: boolean }) => {
      const { provider, isNew } = data;
      const response = await apiRequest(
        isNew ? 'POST' : 'PUT',
        isNew ? '/api/providers' : `/api/providers/${provider.id}`,
        provider
      );
      if (!response.ok) throw new Error('Failed to save provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: 'Success',
        description: 'Provider saved successfully',
      });
      setEditingProvider(null);
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save provider',
        variant: 'destructive',
      });
    },
  });

  const handleSaveProvider = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const provider = {
      id: editingProvider?.id,
      name: formData.get('name') as string,
      logo: formData.get('logo') as string,
      website: formData.get('website') as string,
    };
    saveMutation.mutate({ provider, isNew: !editingProvider });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Providers</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProvider(null)}>
              <i className="ri-add-line mr-2"></i>
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Provider</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveProvider} className="space-y-4">
              <div>
                <Label htmlFor="name">Provider Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Spectrum"
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Provider
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers?.map((provider: Provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {provider.logo && (
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-12 h-12 object-contain"
                  />
                )}
                <div>
                  <h3 className="font-medium">{provider.name}</h3>
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {provider.website}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProvider(provider)}
                    >
                      <i className="ri-edit-line"></i>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Provider</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveProvider} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Provider Name</Label>
                        <Input
                          id="edit-name"
                          name="name"
                          required
                          defaultValue={provider.name}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-logo">Logo URL</Label>
                        <Input
                          id="edit-logo"
                          name="logo"
                          defaultValue={provider.logo || ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-website">Website</Label>
                        <Input
                          id="edit-website"
                          name="website"
                          defaultValue={provider.website || ''}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Update Provider
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(provider.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <i className="ri-delete-bin-line"></i>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProvidersManager; 