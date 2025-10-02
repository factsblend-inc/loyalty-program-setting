'use client';

import React, { useState } from 'react';
import { Store, Plus, X, Edit2, Check } from 'lucide-react';

interface Merchant {
  id: number;
  name: string;
  businessType: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface MerchantManagementProps {
  merchants: Merchant[];
  selectedMerchantId: number | null;
  onMerchantsChange: (merchants: Merchant[]) => void;
  onSelectMerchant: (id: number) => void;
  onBack: () => void;
}

export default function MerchantManagement({
  merchants,
  selectedMerchantId,
  onMerchantsChange,
  onSelectMerchant,
  onBack
}: MerchantManagementProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessType: 'restaurant',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Café/Coffee Shop' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'bar', label: 'Bar/Pub' },
    { value: 'other', label: 'Other' }
  ];

  const handleAddMerchant = () => {
    if (!formData.name.trim()) return;

    const newMerchant: Merchant = {
      id: Math.max(...merchants.map(m => m.id), 0) + 1,
      ...formData
    };

    onMerchantsChange([...merchants, newMerchant]);
    setFormData({ name: '', businessType: 'restaurant', contactPerson: '', email: '', phone: '' });
    setShowAddForm(false);
  };

  const handleUpdateMerchant = (id: number) => {
    const merchant = merchants.find(m => m.id === id);
    if (!merchant) return;

    onMerchantsChange(
      merchants.map(m => m.id === id ? { ...m, ...formData } : m)
    );
    setEditingId(null);
    setFormData({ name: '', businessType: 'restaurant', contactPerson: '', email: '', phone: '' });
  };

  const handleDeleteMerchant = (id: number) => {
    if (merchants.length === 1) {
      alert('You must have at least one merchant');
      return;
    }

    if (confirm('Are you sure you want to delete this merchant?')) {
      onMerchantsChange(merchants.filter(m => m.id !== id));
      if (selectedMerchantId === id && merchants.length > 1) {
        const nextMerchant = merchants.find(m => m.id !== id);
        if (nextMerchant) onSelectMerchant(nextMerchant.id);
      }
    }
  };

  const startEdit = (merchant: Merchant) => {
    setEditingId(merchant.id);
    setFormData({
      name: merchant.name,
      businessType: merchant.businessType,
      contactPerson: merchant.contactPerson,
      email: merchant.email,
      phone: merchant.phone
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', businessType: 'restaurant', contactPerson: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Merchant Management</h1>
                <p className="text-gray-600 mt-1">Manage your merchant accounts and settings</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Calculator
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Merchant List */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Merchants ({merchants.length})</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Merchant
              </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">Add New Merchant</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      placeholder="e.g., The Coffee House"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    >
                      {businessTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      placeholder="0812345678"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAddMerchant}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Add Merchant
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ name: '', businessType: 'restaurant', contactPerson: '', email: '', phone: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Merchant Cards */}
            <div className="space-y-3">
              {merchants.map(merchant => (
                <div
                  key={merchant.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMerchantId === merchant.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {editingId === merchant.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Type
                        </label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        >
                          {businessTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateMerchant(merchant.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedMerchantId === merchant.id ? 'bg-orange-500' : 'bg-gray-200'
                          }`}>
                            <Store className={`w-5 h-5 ${
                              selectedMerchantId === merchant.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className="font-bold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                                onClick={() => {
                                  onSelectMerchant(merchant.id);
                                  onBack();
                                }}
                              >
                                {merchant.name}
                              </h3>
                              {selectedMerchantId === merchant.id && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{merchant.businessType}</p>
                            {merchant.contactPerson && (
                              <p className="text-xs text-gray-500 mt-1">Contact: {merchant.contactPerson}</p>
                            )}
                            {merchant.email && (
                              <p className="text-xs text-gray-500">{merchant.email}</p>
                            )}
                            {merchant.phone && (
                              <p className="text-xs text-gray-500">{merchant.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => startEdit(merchant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMerchant(merchant.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Merchant Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Selected Merchant</h3>
              {selectedMerchantId && merchants.find(m => m.id === selectedMerchantId) ? (
                (() => {
                  const merchant = merchants.find(m => m.id === selectedMerchantId)!;
                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 rounded-xl text-center">
                        <Store className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <h4 className="font-bold text-gray-900">{merchant.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{merchant.businessType}</p>
                      </div>
                      {merchant.contactPerson && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Contact Person</p>
                          <p className="text-sm font-medium text-gray-900">{merchant.contactPerson}</p>
                        </div>
                      )}
                      {merchant.email && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{merchant.email}</p>
                        </div>
                      )}
                      {merchant.phone && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{merchant.phone}</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No merchant selected</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-2 text-sm">💡 Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Each merchant has separate loyalty program settings</li>
                <li>• All data is saved automatically to your browser</li>
                <li>• Click on a merchant to make it active</li>
                <li>• You can manage multiple businesses easily</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
