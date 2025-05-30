import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { UserSettings, InsertUserSettings } from '@shared/schema';

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user-settings'],
    queryFn: () => apiRequest('/api/user-settings')
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: InsertUserSettings) => {
      return apiRequest('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      setIsEditing(false);
    }
  });

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const settingsData = {
      companyName: formData.get('companyName'),
      contactPerson: formData.get('contactPerson'),
      companyAddress: formData.get('companyAddress'),
      email: formData.get('email'),
      mobile: formData.get('mobile')
    };
    updateSettingsMutation.mutate(settingsData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your subcontractor details used across all projects</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Subcontractor Details (Payee)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {settings?.companyName || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {settings?.contactPerson || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {settings?.email || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {settings?.mobile || 'Not set'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  {settings?.companyAddress || 'Not set'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Subcontractor Details (Payee)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    name="companyName"
                    type="text"
                    defaultValue={settings?.companyName || ''}
                    placeholder="LB Concrete Solutions"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    name="contactPerson"
                    type="text"
                    defaultValue={settings?.contactPerson || ''}
                    placeholder="Ben Castelluccio"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={settings?.email || ''}
                    placeholder="ben@casterconstruction.com.au"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    name="mobile"
                    type="text"
                    defaultValue={settings?.mobile || ''}
                    placeholder="0431 746 563"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                <textarea
                  name="companyAddress"
                  rows={3}
                  defaultValue={settings?.companyAddress || ''}
                  placeholder="2 Disney Ave, Keilor East Vic 3033"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}