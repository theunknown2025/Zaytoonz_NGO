"use client";

import { useState, useRef } from "react";
import { XMarkIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface NGOFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  year_created: string;
  legal_rep_name: string;
  legal_rep_email: string;
  legal_rep_phone: string;
  legal_rep_function: string;
  profile_image_url: string;
  user_id: string;
}

interface BulkNGOData {
  id: string; // Temporary ID for tracking
  name: string;
  email: string;
  password: string;
  year_created: string;
  legal_rep_name: string;
  legal_rep_email: string;
  legal_rep_phone: string;
  legal_rep_function: string;
  profile_image_url: string;
  user_id: string;
  errors?: string[]; // Validation errors
}

interface AddNGOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddNGOModal({ isOpen, onClose, onSuccess }: AddNGOModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  const [isCreatingNGO, setIsCreatingNGO] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkNGOs, setBulkNGOs] = useState<BulkNGOData[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newNGOForm, setNewNGOForm] = useState<NGOFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    year_created: '',
    legal_rep_name: '',
    legal_rep_email: '',
    legal_rep_phone: '',
    legal_rep_function: '',
    profile_image_url: '',
    user_id: '',
  });

  const resetForm = () => {
    setNewNGOForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      year_created: '',
      legal_rep_name: '',
      legal_rep_email: '',
      legal_rep_phone: '',
      legal_rep_function: '',
      profile_image_url: '',
      user_id: '',
    });
  };

  const handleClose = () => {
    resetForm();
    setBulkNGOs([]);
    setEditingRowId(null);
    setEditingRowData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // CSV parsing function with proper handling of quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());
    return result;
  };

  const parseCSV = (csvText: string): BulkNGOData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('CSV file must have at least a header row and one data row');
      return [];
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/"/g, ''));
    
    // Expected headers mapping
    const headerMap: { [key: string]: string } = {
      'name': 'name',
      'organization_name': 'name',
      'email': 'email',
      'password': 'password',
      'year_created': 'year_created',
      'year': 'year_created',
      'legal_rep_name': 'legal_rep_name',
      'legal_representative_name': 'legal_rep_name',
      'legal_rep_email': 'legal_rep_email',
      'legal_representative_email': 'legal_rep_email',
      'legal_rep_phone': 'legal_rep_phone',
      'legal_representative_phone': 'legal_rep_phone',
      'legal_rep_function': 'legal_rep_function',
      'legal_representative_function': 'legal_rep_function',
      'function': 'legal_rep_function',
      'profile_image_url': 'profile_image_url',
      'image_url': 'profile_image_url',
      'user_id': 'user_id',
    };

    const parsedData: BulkNGOData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
      const row: any = { id: `row-${i}`, errors: [] };
      
      headers.forEach((header, index) => {
        const mappedKey = headerMap[header] || header;
        if (mappedKey && values[index] !== undefined) {
          row[mappedKey] = values[index] || '';
        }
      });

      // Validate required fields
      if (!row.name || !row.email) {
        row.errors = row.errors || [];
        if (!row.name) row.errors.push('Name is required');
        if (!row.email) row.errors.push('Email is required');
      }

      // Validate password if no user_id
      if (!row.user_id && !row.password) {
        row.errors = row.errors || [];
        row.errors.push('Password is required when user_id is not provided');
      }

      parsedData.push(row as BulkNGOData);
    }

    return parsedData;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast.error('No valid data found in CSV file');
        return;
      }

      setBulkNGOs(parsed);
      toast.success(`Loaded ${parsed.length} NGO(s) from CSV`);
    };
    reader.readAsText(file);
  };

  const handleDeleteRow = (id: string) => {
    setBulkNGOs(prev => prev.filter(row => row.id !== id));
    if (editingRowId === id) {
      setEditingRowId(null);
      setEditingRowData(null);
    }
  };

  const [editingRowData, setEditingRowData] = useState<BulkNGOData | null>(null);

  const handleEditRow = (id: string) => {
    const row = bulkNGOs.find(r => r.id === id);
    if (row) {
      setEditingRowData({ ...row });
      setEditingRowId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData(null);
  };

  const handleSaveRow = () => {
    if (!editingRowId || !editingRowData) return;

    setBulkNGOs(prev => prev.map(row => {
      if (row.id === editingRowId) {
        const updated = { ...editingRowData };
        // Re-validate
        updated.errors = [];
        if (!updated.name) updated.errors.push('Name is required');
        if (!updated.email) updated.errors.push('Email is required');
        if (!updated.user_id && !updated.password) {
          updated.errors.push('Password is required when user_id is not provided');
        }
        return updated;
      }
      return row;
    }));
    setEditingRowId(null);
    setEditingRowData(null);
  };


  const handleBulkSave = async () => {
    if (bulkNGOs.length === 0) {
      toast.error('No NGOs to save');
      return;
    }

    // Validate all rows
    const invalidRows = bulkNGOs.filter(row => {
      const errors: string[] = [];
      if (!row.name) errors.push('Name is required');
      if (!row.email) errors.push('Email is required');
      if (!row.user_id && !row.password) {
        errors.push('Password is required when user_id is not provided');
      }
      if (errors.length > 0) {
        row.errors = errors;
        return true;
      }
      return false;
    });

    if (invalidRows.length > 0) {
      toast.error(`Please fix ${invalidRows.length} row(s) with errors before saving`);
      return;
    }

    try {
      setIsBulkSaving(true);
      let successCount = 0;
      let errorCount = 0;

      for (const ngoData of bulkNGOs) {
        try {
          let userId = ngoData.user_id;

          // Create user account if password is provided
          if (ngoData.password && !ngoData.user_id) {
            const userResponse = await fetch('/api/admin/create-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                full_name: ngoData.name,
                email: ngoData.email,
                password: ngoData.password,
                user_type: 'NGO',
              }),
            });

            if (!userResponse.ok) {
              errorCount++;
              continue;
            }

            const userResult = await userResponse.json();
            userId = userResult.user?.id;

            if (!userId) {
              errorCount++;
              continue;
            }
          }

          // Create NGO profile
          const response = await fetch('/api/admin/ngos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: ngoData.name,
              email: ngoData.email,
              year_created: ngoData.year_created,
              legal_rep_name: ngoData.legal_rep_name,
              legal_rep_email: ngoData.legal_rep_email,
              legal_rep_phone: ngoData.legal_rep_phone,
              legal_rep_function: ngoData.legal_rep_function,
              profile_image_url: ngoData.profile_image_url,
              user_id: userId,
              approval_status: 'approved',
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error creating NGO:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} NGO(s)`);
        if (errorCount > 0) {
          toast.error(`Failed to create ${errorCount} NGO(s)`);
        }
        handleClose();
        onSuccess();
      } else {
        toast.error(`Failed to create all NGOs. ${errorCount} error(s)`);
      }
    } catch (error) {
      console.error('Error in bulk save:', error);
      toast.error('Failed to save NGOs');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleNewNGOInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewNGOForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateNGO = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newNGOForm.name || !newNGOForm.email) {
      toast.error('Name and Email are required');
      return;
    }

    // Validate password fields if provided
    if (newNGOForm.password || newNGOForm.confirmPassword) {
      if (!newNGOForm.password || !newNGOForm.confirmPassword) {
        toast.error('Both password fields are required');
        return;
      }
      if (newNGOForm.password !== newNGOForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (newNGOForm.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

    // If password is provided but no user_id, we'll create the user account
    // If user_id is provided, we'll use that (backward compatibility)
    if (!newNGOForm.password && !newNGOForm.user_id) {
      toast.error('Either provide email/password to create an account, or provide an existing User ID');
      return;
    }

    try {
      setIsCreatingNGO(true);

      let userId = newNGOForm.user_id;

      // If password is provided, create user account first
      if (newNGOForm.password) {
        const userResponse = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: newNGOForm.name,
            email: newNGOForm.email,
            password: newNGOForm.password,
            user_type: 'NGO',
          }),
        });

        if (!userResponse.ok) {
          let errorMessage = 'Failed to create user account';
          try {
            const userData = await userResponse.json();
            errorMessage = userData?.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing user creation response:', parseError);
          }
          console.error('User creation failed:', errorMessage);
          toast.error(errorMessage);
          setIsCreatingNGO(false);
          return;
        }

        const userResult = await userResponse.json();
        userId = userResult.user?.id;

        if (!userId) {
          toast.error('Failed to get user ID from created account');
          setIsCreatingNGO(false);
          return;
        }
      }

      // Create NGO profile
      const response = await fetch('/api/admin/ngos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newNGOForm.name,
          email: newNGOForm.email,
          year_created: newNGOForm.year_created,
          legal_rep_name: newNGOForm.legal_rep_name,
          legal_rep_email: newNGOForm.legal_rep_email,
          legal_rep_phone: newNGOForm.legal_rep_phone,
          legal_rep_function: newNGOForm.legal_rep_function,
          profile_image_url: newNGOForm.profile_image_url,
          user_id: userId,
          approval_status: 'approved',
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create NGO';
        try {
          const data = await response.json();
          errorMessage = data?.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing NGO creation response:', parseError);
        }
        console.error('NGO creation failed:', errorMessage);
        toast.error(errorMessage);
        setIsCreatingNGO(false);
        return;
      }

      toast.success('NGO created and approved');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating NGO:', error);
      toast.error('Failed to create NGO');
    } finally {
      setIsCreatingNGO(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 overflow-hidden bg-white rounded-2xl shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Add NGO</h3>
            <p className="mt-1 text-xs text-gray-500">
              Create a new NGO profile. It will be saved with status <span className="font-semibold text-green-700">approved</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-[#556B2F] text-[#556B2F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-[#556B2F] text-[#556B2F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulk
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-[75vh] overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleCreateNGO} className="px-6 py-5 space-y-6">
              {/* Section: Organization details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">Organization details</h4>
                  <span className="text-xs text-gray-400">Fields marked * are required</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newNGOForm.name}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="e.g. Hope Foundation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newNGOForm.email}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="contact@ngo.org"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Year Created
                    </label>
                    <input
                      type="text"
                      name="year_created"
                      value={newNGOForm.year_created}
                      onChange={handleNewNGOInputChange}
                      placeholder="e.g. 2015"
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      User ID (optional - if creating new account, leave empty)
                    </label>
                    <input
                      type="text"
                      name="user_id"
                      value={newNGOForm.user_id}
                      onChange={handleNewNGOInputChange}
                      placeholder="Existing Supabase user ID (optional)"
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      Only provide if linking to an existing account. Otherwise, provide email/password below to create a new account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Account Access */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">Account Access</h4>
                  <span className="text-xs text-gray-400">Create login credentials for the NGO</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Provide email and password to create a new account, OR provide an existing User ID to link to an existing account.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Password {!newNGOForm.user_id && '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={newNGOForm.password}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required={!newNGOForm.user_id}
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      {newNGOForm.user_id 
                        ? 'Optional - leave empty if using existing User ID above'
                        : 'Required to create a new account'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Confirm Password {!newNGOForm.user_id && '*'}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={newNGOForm.confirmPassword}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="Re-enter password"
                      minLength={6}
                      required={!newNGOForm.user_id}
                    />
                    {newNGOForm.password && newNGOForm.confirmPassword && newNGOForm.password !== newNGOForm.confirmPassword && (
                      <p className="mt-1 text-[11px] text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Legal representative */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Legal representative</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="legal_rep_name"
                      value={newNGOForm.legal_rep_name}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Function / Role
                    </label>
                    <input
                      type="text"
                      name="legal_rep_function"
                      value={newNGOForm.legal_rep_function}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="e.g. Director"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="legal_rep_email"
                      value={newNGOForm.legal_rep_email}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="person@ngo.org"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="legal_rep_phone"
                      value={newNGOForm.legal_rep_phone}
                      onChange={handleNewNGOInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                      placeholder="+XXX ..."
                    />
                  </div>
                </div>
              </div>

              {/* Section: Media */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-800">Media</h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Profile image URL
                  </label>
                  <input
                    type="text"
                    name="profile_image_url"
                    value={newNGOForm.profile_image_url}
                    onChange={handleNewNGOInputChange}
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-[#556B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]/40"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Optional URL to the organization logo or profile image. You can paste any public image URL.
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <div className="px-6 py-5 space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#556B2F] file:text-white hover:file:bg-[#4A5D28] cursor-pointer"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  CSV should include columns: name, email, password (or user_id), year_created, legal_rep_name, legal_rep_email, legal_rep_phone, legal_rep_function, profile_image_url
                </p>
              </div>

              {/* Preview Table */}
              {bulkNGOs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Preview ({bulkNGOs.length} NGO(s))
                    </h4>
                    <button
                      onClick={() => {
                        setBulkNGOs([]);
                        setEditingRowId(null);
                        setEditingRowData(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Legal Rep</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bulkNGOs.map((row) => {
                          const isEditing = editingRowId === row.id;
                          const displayData = isEditing && editingRowData ? editingRowData : row;
                          
                          return (
                            <tr key={row.id} className={row.errors && row.errors.length > 0 ? 'bg-red-50' : ''}>
                              {isEditing ? (
                                <>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={displayData.name}
                                      onChange={(e) => setEditingRowData(prev => prev ? { ...prev, name: e.target.value } : null)}
                                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                      placeholder="Name *"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="email"
                                      value={displayData.email}
                                      onChange={(e) => setEditingRowData(prev => prev ? { ...prev, email: e.target.value } : null)}
                                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                      placeholder="Email *"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={displayData.year_created || ''}
                                      onChange={(e) => setEditingRowData(prev => prev ? { ...prev, year_created: e.target.value } : null)}
                                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                      placeholder="Year"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={displayData.legal_rep_name || ''}
                                      onChange={(e) => setEditingRowData(prev => prev ? { ...prev, legal_rep_name: e.target.value } : null)}
                                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                      placeholder="Legal Rep Name"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={handleSaveRow}
                                        className="text-xs text-[#556B2F] hover:text-[#4A5D28] font-medium"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-2 text-xs">{row.name || <span className="text-red-500">Required</span>}</td>
                                  <td className="px-3 py-2 text-xs">{row.email || <span className="text-red-500">Required</span>}</td>
                                  <td className="px-3 py-2 text-xs">{row.year_created || '-'}</td>
                                  <td className="px-3 py-2 text-xs">{row.legal_rep_name || '-'}</td>
                                  <td className="px-3 py-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleEditRow(row.id)}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                        title="Edit"
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteRow(row.id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                        title="Delete"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Expanded Edit Form */}
                  {editingRowId && editingRowData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-gray-800">Edit NGO Details</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveRow}
                            className="px-3 py-1 text-xs font-medium text-white bg-[#556B2F] rounded hover:bg-[#4A5D28]"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="text"
                            value={editingRowData.password || ''}
                            onChange={(e) => setEditingRowData(prev => prev ? { ...prev, password: e.target.value } : null)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Password"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">User ID</label>
                          <input
                            type="text"
                            value={editingRowData.user_id || ''}
                            onChange={(e) => setEditingRowData(prev => prev ? { ...prev, user_id: e.target.value } : null)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="User ID (optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Legal Rep Email</label>
                          <input
                            type="email"
                            value={editingRowData.legal_rep_email || ''}
                            onChange={(e) => setEditingRowData(prev => prev ? { ...prev, legal_rep_email: e.target.value } : null)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Legal Rep Email"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Legal Rep Phone</label>
                          <input
                            type="text"
                            value={editingRowData.legal_rep_phone || ''}
                            onChange={(e) => setEditingRowData(prev => prev ? { ...prev, legal_rep_phone: e.target.value } : null)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Legal Rep Phone"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Legal Rep Function</label>
                          <input
                            type="text"
                            value={editingRowData.legal_rep_function || ''}
                            onChange={(e) => setEditingRowData(prev => prev ? { ...prev, legal_rep_function: e.target.value } : null)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Function/Role"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Profile Image URL</label>
                          <input
                            type="text"
                            value={editingRowData.profile_image_url || ''}
                            onChange={(e) => setEditingRowData(prev => prev ? { ...prev, profile_image_url: e.target.value } : null)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            placeholder="Image URL"
                          />
                        </div>
                        {editingRowData.errors && editingRowData.errors.length > 0 && (
                          <div className="col-span-2">
                            <div className="text-xs text-red-600">
                              <strong>Errors:</strong> {editingRowData.errors.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Summary */}
                  {bulkNGOs.some(row => row.errors && row.errors.length > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>Warning:</strong> Some rows have validation errors. Please fix them before saving.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-[11px] text-gray-500">
            {activeTab === 'manual' 
              ? 'This NGO will be created with status approved. You can later lock or pause it from the list.'
              : 'Bulk upload will create multiple NGOs with approved status.'
            }
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
            >
              Cancel
            </button>
            {activeTab === 'manual' && (
              <button
                type="submit"
                onClick={handleCreateNGO}
                disabled={isCreatingNGO}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#556B2F] rounded-lg shadow-sm hover:bg-[#4A5D28] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#556B2F] disabled:opacity-50"
              >
                {isCreatingNGO ? 'Creating...' : 'Create & Approve'}
              </button>
            )}
            {activeTab === 'bulk' && (
              <button
                type="button"
                onClick={handleBulkSave}
                disabled={isBulkSaving || bulkNGOs.length === 0 || bulkNGOs.some(row => row.errors && row.errors.length > 0)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#556B2F] rounded-lg shadow-sm hover:bg-[#4A5D28] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#556B2F] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkSaving ? 'Saving...' : `Save ${bulkNGOs.length} NGO(s)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
