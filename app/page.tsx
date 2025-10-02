'use client';

import { useState, useEffect } from 'react';
import LoyaltyProgramCalculator from './components/LoyaltyProgramCalculator';
import MerchantManagement from './components/MerchantManagement';

interface Merchant {
  id: number;
  name: string;
  businessType: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface MerchantData {
  inputs: any;
  campaigns: any[];
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'calculator' | 'merchants'>('calculator');
  const [merchants, setMerchants] = useState<Merchant[]>([
    {
      id: 1,
      name: 'Demo Restaurant',
      businessType: 'restaurant',
      contactPerson: '',
      email: '',
      phone: ''
    }
  ]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<number>(1);
  const [merchantsData, setMerchantsData] = useState<Record<number, MerchantData>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMerchants = localStorage.getItem('loyaltyProgram_merchants');
    const savedSelectedId = localStorage.getItem('loyaltyProgram_selectedMerchantId');
    const savedMerchantsData = localStorage.getItem('loyaltyProgram_merchantsData');

    if (savedMerchants) {
      try {
        setMerchants(JSON.parse(savedMerchants));
      } catch (e) {
        console.error('Failed to load merchants:', e);
      }
    }

    if (savedSelectedId) {
      try {
        setSelectedMerchantId(parseInt(savedSelectedId));
      } catch (e) {
        console.error('Failed to load selected merchant:', e);
      }
    }

    if (savedMerchantsData) {
      try {
        setMerchantsData(JSON.parse(savedMerchantsData));
      } catch (e) {
        console.error('Failed to load merchants data:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem('loyaltyProgram_merchants', JSON.stringify(merchants));
    localStorage.setItem('loyaltyProgram_selectedMerchantId', selectedMerchantId.toString());
    localStorage.setItem('loyaltyProgram_merchantsData', JSON.stringify(merchantsData));
  }, [merchants, selectedMerchantId, merchantsData, isLoaded]);

  const handleMerchantsChange = (newMerchants: Merchant[]) => {
    setMerchants(newMerchants);
  };

  const handleSelectMerchant = (id: number) => {
    setSelectedMerchantId(id);
  };

  const handleDataChange = (inputs: any, campaigns: any[]) => {
    setMerchantsData(prev => ({
      ...prev,
      [selectedMerchantId]: { inputs, campaigns }
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return currentView === 'calculator' ? (
    <LoyaltyProgramCalculator
      merchantId={selectedMerchantId}
      merchantName={merchants.find(m => m.id === selectedMerchantId)?.name || ''}
      initialData={merchantsData[selectedMerchantId]}
      onDataChange={handleDataChange}
      onNavigateToMerchants={() => setCurrentView('merchants')}
    />
  ) : (
    <MerchantManagement
      merchants={merchants}
      selectedMerchantId={selectedMerchantId}
      onMerchantsChange={handleMerchantsChange}
      onSelectMerchant={handleSelectMerchant}
      onBack={() => setCurrentView('calculator')}
    />
  );
}
