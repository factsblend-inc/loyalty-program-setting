'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, TrendingUp, AlertCircle, Zap, Settings, Sparkles, Plus, X, Store } from 'lucide-react';

interface ProgramInputs {
  grossMargin: number | string;
  rewardBudget: number | string;
  avgTransactionValue: number | string;
  redemptionRate: number | string;
  fixedProgramCost: number | string;
  monthlyTransactions: number | string;
  returningCustomerUplift: number | string;
  newCustomerAcquisition: number | string;
  customerRetentionRate: number | string;
  pointsPerBaht: number | string;
  autoAdjustPoints: boolean;
}

interface LoyaltyProgramCalculatorProps {
  merchantId: number;
  merchantName: string;
  initialData?: {
    inputs: ProgramInputs;
    campaigns: any[];
  };
  onDataChange: (inputs: ProgramInputs, campaigns: any[]) => void;
  onNavigateToMerchants: () => void;
}

export default function LoyaltyProgramCalculator({
  merchantId,
  merchantName,
  initialData,
  onDataChange,
  onNavigateToMerchants
}: LoyaltyProgramCalculatorProps) {
  const [mode, setMode] = useState('simple');
  const [showLowMarginGuide, setShowLowMarginGuide] = useState(false);
  const [showNegativeROIHelp, setShowNegativeROIHelp] = useState(false);
  const [activePage, setActivePage] = useState('base');

  const defaultInputs: ProgramInputs = {
    grossMargin: 65,
    rewardBudget: 3,
    avgTransactionValue: 350,
    redemptionRate: 60,
    fixedProgramCost: 15000,
    monthlyTransactions: 1000,
    returningCustomerUplift: 15,
    newCustomerAcquisition: 5,
    customerRetentionRate: 70,
    pointsPerBaht: 3.5,
    autoAdjustPoints: true,
  };

  const [inputs, setInputs] = useState(initialData?.inputs || defaultInputs);

  const campaignTypes: Record<string, any> = {
    pointMultiplier: {
      name: 'Point Multiplier',
      description: 'Double/Triple points promotion',
      icon: '⚡',
      fields: ['duration', 'pointMultiplier', 'targetParticipation', 'additionalSpending', 'marketingCost']
    },
    groupReward: {
      name: 'Group Reward',
      description: 'Bonus for dining in groups',
      icon: '👥',
      fields: ['duration', 'minGroupSize', 'bonusPointsPerPerson', 'targetParticipation', 'additionalSpending', 'marketingCost']
    },
    spendingTier: {
      name: 'Spending Tier',
      description: 'Unlock rewards at spending thresholds',
      icon: '🎯',
      fields: ['duration', 'spendingThreshold', 'tierBonus', 'targetParticipation', 'marketingCost']
    },
    referral: {
      name: 'Referral Program',
      description: 'Invite friends, both earn rewards',
      icon: '🤝',
      fields: ['duration', 'referrerBonus', 'refereeBonus', 'expectedReferrals', 'marketingCost']
    },
    specialOccasion: {
      name: 'Special Occasion',
      description: 'Birthday/anniversary bonuses',
      icon: '🎂',
      fields: ['occasionBonus', 'expectedOccasions', 'additionalSpending', 'marketingCost']
    },
    minPurchase: {
      name: 'Minimum Purchase',
      description: 'Bonus for spending above threshold',
      icon: '💰',
      fields: ['duration', 'minPurchaseAmount', 'bonusReward', 'targetParticipation', 'additionalSpending', 'marketingCost']
    },
    timeBased: {
      name: 'Happy Hour',
      description: 'Time-based promotions',
      icon: '⏰',
      fields: ['duration', 'dailyHours', 'pointMultiplier', 'targetParticipation', 'additionalSpending', 'marketingCost']
    },
    frequencyReward: {
      name: 'Frequency Reward',
      description: 'Visit X times get bonus',
      icon: '📅',
      fields: ['duration', 'requiredVisits', 'bonusReward', 'targetParticipation', 'marketingCost']
    }
  };

  const defaultCampaigns = [
    {
      id: 1,
      name: 'Double Points Weekend',
      type: 'pointMultiplier',
      enabled: true,
      duration: 7,
      pointMultiplier: 2,
      targetParticipation: 30,
      additionalSpending: 25,
      marketingCost: 2000,
    }
  ];

  const [campaigns, setCampaigns] = useState(initialData?.campaigns || defaultCampaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState(1);
  const [showCampaignTypeModal, setShowCampaignTypeModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('');
  const [optimizationMessage, setOptimizationMessage] = useState<string>('');

  // Sync data to parent when inputs or campaigns change
  useEffect(() => {
    onDataChange(inputs, campaigns);
  }, [inputs, campaigns]);

  // Reset data when merchant changes
  useEffect(() => {
    if (initialData) {
      setInputs(initialData.inputs || defaultInputs);
      setCampaigns(initialData.campaigns || defaultCampaigns);
    }
  }, [merchantId]);

  const benchmarks: Record<string, any> = {
    restaurant: {
      returningCustomerUplift: { min: 10, avg: 15, max: 25 },
      customerRetentionRate: { min: 60, avg: 70, max: 80 },
      description: 'Restaurant Industry'
    },
    cafe: {
      returningCustomerUplift: { min: 15, avg: 20, max: 30 },
      customerRetentionRate: { min: 65, avg: 75, max: 85 },
      description: 'Café/Coffee Shop'
    },
    retail: {
      returningCustomerUplift: { min: 12, avg: 18, max: 28 },
      customerRetentionRate: { min: 55, avg: 65, max: 75 },
      description: 'Retail/Store'
    }
  };

  const [selectedBenchmark, setSelectedBenchmark] = useState('restaurant');

  const handleInputChange = (field: string, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setInputs(prev => {
      const newInputs = { ...prev, [field]: numValue };

      if (newInputs.autoAdjustPoints && field !== 'pointsPerBaht') {
        const affectingFields = [
          'grossMargin',
          'rewardBudget',
          'avgTransactionValue',
          'redemptionRate',
          'fixedProgramCost',
          'monthlyTransactions'
        ];

        if (affectingFields.includes(field)) {
          newInputs.pointsPerBaht = calculateSuggestedPointsPerBaht(
            field === 'grossMargin' ? numValue : newInputs.grossMargin,
            field === 'rewardBudget' ? numValue : newInputs.rewardBudget,
            field === 'redemptionRate' ? numValue : newInputs.redemptionRate,
            field === 'avgTransactionValue' ? numValue : newInputs.avgTransactionValue,
            field === 'fixedProgramCost' ? numValue : newInputs.fixedProgramCost,
            field === 'monthlyTransactions' ? numValue : newInputs.monthlyTransactions
          );
        }
      }

      return newInputs;
    });
  };

  const calculateSuggestedPointsPerBaht = (
    grossMargin: number | string,
    rewardBudget: number | string,
    redemptionRate: number | string,
    avgTransactionValue: number | string,
    fixedProgramCost: number | string,
    monthlyTransactions: number | string
  ) => {
    // Convert empty strings to safe values
    const safeGrossMargin = Number(grossMargin) || 0;
    const safeRewardBudget = Number(rewardBudget) || 0;
    const safeRedemptionRate = Number(redemptionRate) || 0;
    const safeAvgTransactionValue = Number(avgTransactionValue) || 0;
    const safeFixedProgramCost = Number(fixedProgramCost) || 0;
    const safeMonthlyTransactions = Number(monthlyTransactions) || 0;

    const monthlyRevenue = safeMonthlyTransactions * safeAvgTransactionValue;
    const rewardCost = monthlyRevenue * (safeRewardBudget / 100);
    const totalCost = rewardCost + safeFixedProgramCost;
    const totalCostPercentage = monthlyRevenue > 0 ? (totalCost / monthlyRevenue) * 100 : 0;

    let basePointsPerBaht;

    if (safeGrossMargin <= 15) {
      basePointsPerBaht = 40 - (safeGrossMargin - 10) * 2;
    } else if (safeGrossMargin <= 35) {
      basePointsPerBaht = 35 - safeGrossMargin;
    } else if (safeGrossMargin <= 50) {
      basePointsPerBaht = 20 - (safeGrossMargin - 35) / 3;
    } else {
      basePointsPerBaht = 12 - (safeGrossMargin - 50) / 5;
    }

    const budgetAdjustment = (safeRewardBudget - 2) * 2;
    const redemptionAdjustment = (safeRedemptionRate - 50) * 0.1;
    const costPressureAdjustment = totalCostPercentage > 5 ? (totalCostPercentage - 5) * 0.5 : 0;

    let suggestedPoints = basePointsPerBaht + budgetAdjustment + redemptionAdjustment + costPressureAdjustment;
    suggestedPoints = Math.max(1, Math.min(100, suggestedPoints));

    return Math.round(suggestedPoints * 10) / 10;
  };

  // Get business size based on monthly revenue
  const getBusinessSize = () => {
    const revenue = Number(inputs.monthlyTransactions) * Number(inputs.avgTransactionValue);
    if (revenue < 100000) return 'small';
    if (revenue < 500000) return 'medium';
    return 'large';
  };

  // Campaign templates based on business size
  const campaignTemplates: Record<string, any> = {
    pointMultiplier: {
      'Weekend Double Points': {
        small: { duration: 3, pointMultiplier: 2, targetParticipation: 25, additionalSpending: 15, marketingCost: 500 },
        medium: { duration: 3, pointMultiplier: 2, targetParticipation: 30, additionalSpending: 20, marketingCost: 1500 },
        large: { duration: 3, pointMultiplier: 2, targetParticipation: 35, additionalSpending: 25, marketingCost: 3000 }
      },
      'Flash 3X Points': {
        small: { duration: 1, pointMultiplier: 3, targetParticipation: 20, additionalSpending: 20, marketingCost: 800 },
        medium: { duration: 1, pointMultiplier: 3, targetParticipation: 25, additionalSpending: 25, marketingCost: 2000 },
        large: { duration: 1, pointMultiplier: 3, targetParticipation: 30, additionalSpending: 30, marketingCost: 4000 }
      },
      'Weekly Bonus': {
        small: { duration: 7, pointMultiplier: 1.5, targetParticipation: 30, additionalSpending: 10, marketingCost: 300 },
        medium: { duration: 7, pointMultiplier: 1.5, targetParticipation: 35, additionalSpending: 15, marketingCost: 1000 },
        large: { duration: 7, pointMultiplier: 1.5, targetParticipation: 40, additionalSpending: 20, marketingCost: 2000 }
      }
    },
    groupReward: {
      'Family Dining Bonus': {
        small: { duration: 30, minGroupSize: 4, bonusPointsPerPerson: 50, targetParticipation: 15, additionalSpending: 25, marketingCost: 500 },
        medium: { duration: 30, minGroupSize: 4, bonusPointsPerPerson: 100, targetParticipation: 20, additionalSpending: 30, marketingCost: 1500 },
        large: { duration: 30, minGroupSize: 4, bonusPointsPerPerson: 150, targetParticipation: 25, additionalSpending: 35, marketingCost: 3000 }
      },
      'Large Party Reward': {
        small: { duration: 30, minGroupSize: 6, bonusPointsPerPerson: 75, targetParticipation: 10, additionalSpending: 30, marketingCost: 600 },
        medium: { duration: 30, minGroupSize: 6, bonusPointsPerPerson: 150, targetParticipation: 15, additionalSpending: 35, marketingCost: 1800 },
        large: { duration: 30, minGroupSize: 6, bonusPointsPerPerson: 200, targetParticipation: 20, additionalSpending: 40, marketingCost: 3500 }
      }
    },
    referral: {
      'Friend Referral Program': {
        small: { duration: 90, referrerBonus: 100, refereeBonus: 50, expectedReferrals: 20, marketingCost: 1000 },
        medium: { duration: 90, referrerBonus: 200, refereeBonus: 100, expectedReferrals: 50, marketingCost: 3000 },
        large: { duration: 90, referrerBonus: 300, refereeBonus: 150, expectedReferrals: 100, marketingCost: 6000 }
      }
    },
    specialOccasion: {
      'Birthday Bonus': {
        small: { occasionBonus: 150, expectedOccasions: 50, additionalSpending: 30, marketingCost: 300 },
        medium: { occasionBonus: 300, expectedOccasions: 100, additionalSpending: 40, marketingCost: 800 },
        large: { occasionBonus: 500, expectedOccasions: 200, additionalSpending: 50, marketingCost: 1500 }
      },
      'Anniversary Reward': {
        small: { occasionBonus: 200, expectedOccasions: 30, additionalSpending: 35, marketingCost: 400 },
        medium: { occasionBonus: 400, expectedOccasions: 80, additionalSpending: 45, marketingCost: 1000 },
        large: { occasionBonus: 600, expectedOccasions: 150, additionalSpending: 55, marketingCost: 2000 }
      }
    },
    minPurchase: {
      'Minimum ฿500 Bonus': {
        small: { duration: 14, minPurchaseAmount: 500, bonusReward: 30, targetParticipation: 30, additionalSpending: 15, marketingCost: 800 },
        medium: { duration: 14, minPurchaseAmount: 500, bonusReward: 50, targetParticipation: 35, additionalSpending: 20, marketingCost: 1500 },
        large: { duration: 14, minPurchaseAmount: 500, bonusReward: 75, targetParticipation: 40, additionalSpending: 25, marketingCost: 3000 }
      }
    },
    timeBased: {
      'Happy Hour 3-6pm': {
        small: { duration: 30, dailyHours: 3, pointMultiplier: 1.5, targetParticipation: 20, additionalSpending: 10, marketingCost: 1000 },
        medium: { duration: 30, dailyHours: 3, pointMultiplier: 1.5, targetParticipation: 25, additionalSpending: 15, marketingCost: 2000 },
        large: { duration: 30, dailyHours: 3, pointMultiplier: 1.5, targetParticipation: 30, additionalSpending: 20, marketingCost: 4000 }
      },
      'Early Bird Special': {
        small: { duration: 30, dailyHours: 2, pointMultiplier: 2, targetParticipation: 15, additionalSpending: 12, marketingCost: 800 },
        medium: { duration: 30, dailyHours: 2, pointMultiplier: 2, targetParticipation: 20, additionalSpending: 18, marketingCost: 1800 },
        large: { duration: 30, dailyHours: 2, pointMultiplier: 2, targetParticipation: 25, additionalSpending: 25, marketingCost: 3500 }
      }
    },
    frequencyReward: {
      'Visit 5 Times Bonus': {
        small: { duration: 30, requiredVisits: 5, bonusReward: 100, targetParticipation: 25, marketingCost: 500 },
        medium: { duration: 30, requiredVisits: 5, bonusReward: 200, targetParticipation: 30, marketingCost: 1000 },
        large: { duration: 30, requiredVisits: 5, bonusReward: 300, targetParticipation: 35, marketingCost: 2000 }
      },
      'Visit 10 Times VIP': {
        small: { duration: 60, requiredVisits: 10, bonusReward: 200, targetParticipation: 15, marketingCost: 700 },
        medium: { duration: 60, requiredVisits: 10, bonusReward: 400, targetParticipation: 20, marketingCost: 1500 },
        large: { duration: 60, requiredVisits: 10, bonusReward: 600, targetParticipation: 25, marketingCost: 3000 }
      }
    },
    spendingTier: {
      'Spend ฿5000 Unlock': {
        small: { duration: 30, spendingThreshold: 3000, tierBonus: 300, targetParticipation: 20, marketingCost: 800 },
        medium: { duration: 30, spendingThreshold: 5000, tierBonus: 500, targetParticipation: 25, marketingCost: 1500 },
        large: { duration: 30, spendingThreshold: 8000, tierBonus: 800, targetParticipation: 30, marketingCost: 3000 }
      }
    }
  };

  const getDefaultCampaignValues = (type: string) => {
    const businessSize = getBusinessSize();
    const templates = campaignTemplates[type];
    if (templates) {
      const firstTemplate = Object.values(templates)[0] as any;
      return firstTemplate[businessSize];
    }

    const defaults: Record<string, any> = {
      pointMultiplier: { duration: 7, pointMultiplier: 2, targetParticipation: 30, additionalSpending: 25, marketingCost: 2000 },
      groupReward: { duration: 14, minGroupSize: 4, bonusPointsPerPerson: 100, targetParticipation: 20, additionalSpending: 30, marketingCost: 1500 },
      spendingTier: { duration: 30, spendingThreshold: 5000, tierBonus: 500, targetParticipation: 25, marketingCost: 1000 },
      referral: { duration: 90, referrerBonus: 200, refereeBonus: 100, expectedReferrals: 50, marketingCost: 3000 },
      specialOccasion: { occasionBonus: 300, expectedOccasions: 100, additionalSpending: 40, marketingCost: 500 },
      minPurchase: { duration: 7, minPurchaseAmount: 500, bonusReward: 50, targetParticipation: 35, additionalSpending: 20, marketingCost: 1500 },
      timeBased: { duration: 30, dailyHours: 3, pointMultiplier: 1.5, targetParticipation: 25, additionalSpending: 15, marketingCost: 2000 },
      frequencyReward: { duration: 30, requiredVisits: 5, bonusReward: 200, targetParticipation: 30, marketingCost: 1000 }
    };
    return defaults[type] || defaults.pointMultiplier;
  };

  const addCampaignWithType = (type: string) => {
    setSelectedCampaignType(type);
    setShowCampaignTypeModal(false);
    setShowTemplatesModal(true);
  };

  const addCampaignFromTemplate = (type: string, templateName?: string) => {
    const newId = Math.max(...campaigns.map(c => c.id), 0) + 1;
    const businessSize = getBusinessSize();

    let campaignData;
    if (templateName && campaignTemplates[type] && campaignTemplates[type][templateName]) {
      campaignData = campaignTemplates[type][templateName][businessSize];
    } else {
      campaignData = getDefaultCampaignValues(type);
    }

    const newCampaign = {
      id: newId,
      name: templateName || `${campaignTypes[type].name} ${newId}`,
      type,
      enabled: true,
      ...campaignData
    };
    setCampaigns([...campaigns, newCampaign]);
    setSelectedCampaignId(newId);
    setShowTemplatesModal(false);
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, any> = {
      duration: {
        label: 'Duration (Days)',
        helper: 'Flash sale: 1-3 days | Weekly: 7 days | Monthly: 30 days',
        range: 'Typical: 3-30 days'
      },
      pointMultiplier: {
        label: 'Point Multiplier',
        helper: '1.5X = 50% more | 2X = Double | 3X = Triple points',
        range: 'Common: 1.5X - 3X'
      },
      targetParticipation: {
        label: 'Participation Rate (%)',
        helper: 'What % of customers will join? Restaurants typically see 20-40%',
        range: 'Conservative: 20% | Moderate: 30% | Optimistic: 40%'
      },
      additionalSpending: {
        label: 'Extra Spending (%)',
        helper: 'How much more will customers spend? Promotions typically drive 15-30% increase',
        range: 'Conservative: 15% | Moderate: 25% | Optimistic: 35%'
      },
      marketingCost: {
        label: 'Marketing Budget (฿)',
        helper: 'Social media ads, posters, LINE messages. Small: ฿500 | Medium: ฿2,000 | Large: ฿5,000',
        range: 'Typical: ฿500 - ฿5,000'
      },
      minGroupSize: {
        label: 'Minimum Group Size',
        helper: 'Family: 4 people | Large party: 6+ people',
        range: 'Common: 4-8 people'
      },
      bonusPointsPerPerson: {
        label: 'Bonus Points per Person',
        helper: 'Extra points each person gets. Usually ฿50-200 worth',
        range: 'Typical: 50-200 points'
      },
      spendingThreshold: {
        label: 'Spending Target (฿)',
        helper: 'Total customers need to spend. Small: ฿3,000 | Medium: ฿5,000 | Large: ฿10,000',
        range: 'Common: ฿3,000 - ฿10,000'
      },
      tierBonus: {
        label: 'Tier Reward (฿)',
        helper: 'Value of reward when unlocked. Usually 5-10% of threshold',
        range: 'Typical: ฿300 - ฿1,000'
      },
      referrerBonus: {
        label: 'Referrer Reward (฿)',
        helper: 'Reward for customer who refers. Usually ฿100-300',
        range: 'Common: ฿100 - ฿300'
      },
      refereeBonus: {
        label: 'New Customer Reward (฿)',
        helper: 'Welcome reward for referred friend. Usually ฿50-150',
        range: 'Typical: ฿50 - ฿150'
      },
      expectedReferrals: {
        label: 'Expected New Customers',
        helper: 'How many new customers from referrals? Small: 20 | Medium: 50 | Large: 100',
        range: 'Realistic: 20-100 per 3 months'
      },
      occasionBonus: {
        label: 'Birthday/Anniversary Reward (฿)',
        helper: 'Special day bonus. Small: ฿150 | Medium: ฿300 | Large: ฿500',
        range: 'Common: ฿150 - ฿500'
      },
      expectedOccasions: {
        label: 'Occasions per Month',
        helper: 'Birthdays/anniversaries. About 8-10% of monthly customers',
        range: 'Estimate: 5-10% of customers'
      },
      minPurchaseAmount: {
        label: 'Minimum Spend (฿)',
        helper: 'Threshold to get bonus. Slightly above avg order: ฿500-1,000',
        range: 'Typical: ฿400 - ฿1,000'
      },
      bonusReward: {
        label: 'Bonus Value (฿)',
        helper: 'Reward for reaching minimum. Usually 5-10% of threshold',
        range: 'Common: ฿30 - ฿100'
      },
      dailyHours: {
        label: 'Active Hours per Day',
        helper: 'Lunch: 2-3 hours | Happy Hour: 3-4 hours | Evening: 2-3 hours',
        range: 'Typical: 2-4 hours'
      },
      requiredVisits: {
        label: 'Visits Needed',
        helper: 'Low: 3 visits | Medium: 5 visits | High: 10 visits',
        range: 'Common: 3-10 visits'
      }
    };
    return labels[field] || { label: field, helper: '', range: '' };
  };

  const updateCampaign = (id: number, field: string, value: any) => {
    setCampaigns(campaigns.map(c =>
      c.id === id ? { ...c, [field]: value === '' ? '' : (field === 'name' || field === 'enabled' ? value : parseFloat(value)) } : c
    ));
  };

  const toggleCampaign = (id: number) => {
    setCampaigns(campaigns.map(c =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    if (selectedCampaignId === id && campaigns.length > 1) {
      setSelectedCampaignId(campaigns.find(c => c.id !== id)?.id || campaigns[0].id);
    }
  };

  const optimizeCampaignForPositiveROI = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const campaignMetric = calculations.campaignMetrics?.find(m => m.id === campaignId);
    if (!campaignMetric) return;

    // If already positive ROI > 10%, no need to optimize
    if (campaignMetric.roi > 10) {
      setOptimizationMessage('✅ Campaign already has positive ROI!');
      setTimeout(() => setOptimizationMessage(''), 3000);
      return;
    }

    const optimized = { ...campaign };
    const changes: string[] = [];

    // Target: 15% ROI minimum
    const targetROI = 15;

    switch (campaign.type) {
      case 'pointMultiplier': {
        // Reduce point multiplier if too high
        if ((campaign.pointMultiplier || 2) > 2) {
          optimized.pointMultiplier = 2;
          changes.push(`Point multiplier reduced to 2X`);
        }
        // Increase participation expectation
        if ((campaign.targetParticipation || 30) < 40) {
          optimized.targetParticipation = 40;
          changes.push(`Participation increased to 40%`);
        }
        // Reduce marketing cost
        if ((campaign.marketingCost || 0) > 1000) {
          optimized.marketingCost = Math.max(500, (campaign.marketingCost || 2000) * 0.5);
          changes.push(`Marketing budget optimized`);
        }
        break;
      }

      case 'groupReward': {
        // Reduce bonus per person
        const currentBonus = campaign.bonusPointsPerPerson || 100;
        if (currentBonus > 50) {
          optimized.bonusPointsPerPerson = Math.max(50, Math.floor(currentBonus * 0.6));
          changes.push(`Bonus reduced to ${optimized.bonusPointsPerPerson} points/person`);
        }
        // Increase participation
        if ((campaign.targetParticipation || 20) < 25) {
          optimized.targetParticipation = 25;
          changes.push(`Participation increased to 25%`);
        }
        break;
      }

      case 'spendingTier': {
        // Reduce tier bonus significantly
        const currentBonus = campaign.tierBonus || 500;
        if (currentBonus > 200) {
          optimized.tierBonus = Math.max(200, Math.floor(currentBonus * 0.4));
          changes.push(`Tier bonus reduced to ฿${optimized.tierBonus}`);
        }
        // Increase spending threshold
        const currentThreshold = campaign.spendingThreshold || 5000;
        if (currentThreshold < 8000) {
          optimized.spendingThreshold = 8000;
          changes.push(`Threshold increased to ฿8,000`);
        }
        break;
      }

      case 'referral': {
        // Reduce referral bonuses
        const currentReferrer = campaign.referrerBonus || 200;
        const currentReferee = campaign.refereeBonus || 100;
        if (currentReferrer > 150) {
          optimized.referrerBonus = 150;
          changes.push(`Referrer bonus reduced to ฿150`);
        }
        if (currentReferee > 75) {
          optimized.refereeBonus = 75;
          changes.push(`Referee bonus reduced to ฿75`);
        }
        // Increase expected referrals
        if ((campaign.expectedReferrals || 50) < 100) {
          optimized.expectedReferrals = Math.min(100, (campaign.expectedReferrals || 50) * 1.5);
          changes.push(`Target referrals increased`);
        }
        break;
      }

      case 'specialOccasion': {
        // Reduce occasion bonus
        const currentBonus = campaign.occasionBonus || 300;
        if (currentBonus > 150) {
          optimized.occasionBonus = Math.max(150, Math.floor(currentBonus * 0.5));
          changes.push(`Birthday bonus reduced to ฿${optimized.occasionBonus}`);
        }
        // Increase additional spending expectation
        if ((campaign.additionalSpending || 30) < 40) {
          optimized.additionalSpending = 40;
          changes.push(`Expected extra spending increased to 40%`);
        }
        break;
      }

      case 'minPurchase': {
        // Reduce bonus reward
        const currentBonus = campaign.bonusReward || 50;
        if (currentBonus > 30) {
          optimized.bonusReward = 30;
          changes.push(`Bonus reduced to ฿30`);
        }
        // Increase minimum purchase threshold
        const currentMin = campaign.minPurchaseAmount || 500;
        if (currentMin < 600) {
          optimized.minPurchaseAmount = 600;
          changes.push(`Minimum increased to ฿600`);
        }
        break;
      }

      case 'timeBased': {
        // Reduce point multiplier
        if ((campaign.pointMultiplier || 1.5) > 1.5) {
          optimized.pointMultiplier = 1.5;
          changes.push(`Multiplier reduced to 1.5X`);
        }
        // Reduce marketing cost
        if ((campaign.marketingCost || 0) > 1000) {
          optimized.marketingCost = 1000;
          changes.push(`Marketing budget reduced to ฿1,000`);
        }
        break;
      }

      case 'frequencyReward': {
        // Reduce bonus reward
        const currentBonus = campaign.bonusReward || 200;
        if (currentBonus > 150) {
          optimized.bonusReward = 150;
          changes.push(`Bonus reduced to ฿150`);
        }
        // Increase required visits
        if ((campaign.requiredVisits || 5) < 7) {
          optimized.requiredVisits = 7;
          changes.push(`Required visits increased to 7`);
        }
        break;
      }
    }

    // Apply optimizations
    if (changes.length > 0) {
      setCampaigns(campaigns.map(c => c.id === campaignId ? optimized : c));
      setOptimizationMessage(`✨ Optimized: ${changes.join(', ')}`);
      setTimeout(() => setOptimizationMessage(''), 5000);
    } else {
      setOptimizationMessage('💡 Try increasing participation or reducing rewards manually');
      setTimeout(() => setOptimizationMessage(''), 3000);
    }
  };

  const applyBenchmark = () => {
    const benchmark = benchmarks[selectedBenchmark];
    setInputs(prev => ({
      ...prev,
      returningCustomerUplift: benchmark.returningCustomerUplift.avg,
      customerRetentionRate: benchmark.customerRetentionRate.avg,
    }));
  };

  const applyLowMarginPreset = () => {
    setInputs(prev => ({
      ...prev,
      grossMargin: 10,
      rewardBudget: 0.5,
      redemptionRate: 35,
      pointsPerBaht: 50,
      fixedProgramCost: 3000,
      returningCustomerUplift: 25,
      autoAdjustPoints: false,
    }));
    setShowLowMarginGuide(true);
  };

  const applyQuickFix = (option: string) => {
    const monthlyRevenue = Number(inputs.monthlyTransactions) * Number(inputs.avgTransactionValue);

    if (option === 'paper') {
      setInputs(prev => ({
        ...prev,
        rewardBudget: 1.5,
        fixedProgramCost: 0,
        pointsPerBaht: 50,
        redemptionRate: 30,
        returningCustomerUplift: 15,
        autoAdjustPoints: false,
      }));
    } else if (option === 'minimal') {
      setInputs(prev => ({
        ...prev,
        rewardBudget: 1.0,
        fixedProgramCost: 500,
        pointsPerBaht: 50,
        redemptionRate: 40,
        returningCustomerUplift: 20,
        autoAdjustPoints: false,
      }));
    } else if (option === 'balanced') {
      const suggestedFixedCost = Math.min(5000, Math.max(500, monthlyRevenue * 0.02));
      setInputs(prev => ({
        ...prev,
        rewardBudget: 1.5,
        fixedProgramCost: suggestedFixedCost,
        pointsPerBaht: 30,
        redemptionRate: 50,
        returningCustomerUplift: 18,
        autoAdjustPoints: false,
      }));
    }

    setShowNegativeROIHelp(false);
  };

  const calculations = useMemo(() => {
    const {
      grossMargin,
      rewardBudget,
      avgTransactionValue,
      redemptionRate,
      fixedProgramCost,
      monthlyTransactions,
      returningCustomerUplift,
      pointsPerBaht,
    } = inputs;

    // Convert empty strings to 0 for calculations
    const safeGrossMargin = Number(grossMargin) || 0;
    const safeRewardBudget = Number(rewardBudget) || 0;
    const safeAvgTransactionValue = Number(avgTransactionValue) || 0;
    const safeRedemptionRate = Number(redemptionRate) || 0;
    const safeFixedProgramCost = Number(fixedProgramCost) || 0;
    const safeMonthlyTransactions = Number(monthlyTransactions) || 0;
    const safeReturningCustomerUplift = Number(returningCustomerUplift) || 0;
    const safePointsPerBaht = Number(pointsPerBaht) || 1;

    const monthlyRevenue = safeMonthlyTransactions * safeAvgTransactionValue;
    const rewardBudgetAmount = monthlyRevenue * (safeRewardBudget / 100);
    const pointsEarnedPerTransaction = safeAvgTransactionValue / safePointsPerBaht;
    const totalPointsIssued = safeMonthlyTransactions * pointsEarnedPerTransaction;
    const pointsRedeemed = totalPointsIssued * (safeRedemptionRate / 100);
    const pointValue = pointsRedeemed > 0 ? rewardBudgetAmount / pointsRedeemed : 0;
    const totalMonthlyCost = rewardBudgetAmount + safeFixedProgramCost;
    const costToRevenueRatio = (totalMonthlyCost / monthlyRevenue) * 100;

    // CORRECTED LOGIC: Uplift applies only to member transactions
    // Assume 70% of transactions are from loyalty members
    const memberTransactionPercentage = 0.70;
    const memberRevenue = monthlyRevenue * memberTransactionPercentage;
    // The uplift % represents how much MORE members spend/visit vs non-members
    const additionalRevenueFromReturning = memberRevenue * (safeReturningCustomerUplift / 100);
    const additionalGrossProfit = additionalRevenueFromReturning * (safeGrossMargin / 100);
    const baseNetProfit = additionalGrossProfit - totalMonthlyCost;
    const baseROI = totalMonthlyCost > 0 ? (baseNetProfit / totalMonthlyCost) * 100 : 0;

    // Calculate individual campaign metrics based on type
    const campaignMetrics = campaigns.map(campaign => {
      const safeMarketingCost = campaign.marketingCost || 0;
      let participants = 0, revenue = 0, incrementalRevenue = 0, pointCost = 0;

      switch(campaign.type) {
        case 'pointMultiplier': {
          const durationInMonths = (campaign.duration || 0) / 30;
          participants = safeMonthlyTransactions * ((campaign.targetParticipation || 0) / 100) * durationInMonths;
          const transactionValue = safeAvgTransactionValue * (1 + (campaign.additionalSpending || 0) / 100);
          revenue = participants * transactionValue;
          incrementalRevenue = revenue - (participants * safeAvgTransactionValue);
          pointCost = (revenue * (safeRewardBudget / 100)) * (campaign.pointMultiplier || 1);
          break;
        }
        case 'groupReward': {
          const durationInMonths = (campaign.duration || 0) / 30;
          const groupParticipation = (campaign.targetParticipation || 0) / 100;
          // Group transactions (not people count)
          const groupTransactions = safeMonthlyTransactions * groupParticipation * durationInMonths;
          // Total people participating (for point calculation)
          const totalPeople = groupTransactions * (campaign.minGroupSize || 1);
          participants = totalPeople; // Track people for display
          const transactionValue = safeAvgTransactionValue * (1 + (campaign.additionalSpending || 0) / 100);
          // Revenue is from group TRANSACTIONS, not people
          revenue = groupTransactions * transactionValue;
          incrementalRevenue = revenue - (groupTransactions * safeAvgTransactionValue);
          // Point cost is per person
          const bonusPoints = (campaign.bonusPointsPerPerson || 0) * totalPeople;
          pointCost = bonusPoints * pointValue;
          break;
        }
        case 'spendingTier': {
          const durationInMonths = (campaign.duration || 0) / 30;
          participants = safeMonthlyTransactions * ((campaign.targetParticipation || 0) / 100) * durationInMonths;
          // Customers spend more to reach threshold - estimate 20% increase in spending
          const thresholdIncentive = 0.20; // 20% more spending to reach tier
          const transactionValue = safeAvgTransactionValue * (1 + thresholdIncentive);
          revenue = participants * transactionValue;
          incrementalRevenue = revenue - (participants * safeAvgTransactionValue);
          const achievers = participants * 0.6; // 60% reach threshold
          pointCost = achievers * (campaign.tierBonus || 0);
          break;
        }
        case 'referral': {
          const newCustomers = campaign.expectedReferrals || 0;
          participants = newCustomers;
          revenue = newCustomers * safeAvgTransactionValue;
          incrementalRevenue = revenue; // All new revenue
          pointCost = (newCustomers * (campaign.refereeBonus || 0)) + (newCustomers * (campaign.referrerBonus || 0));
          break;
        }
        case 'specialOccasion': {
          participants = campaign.expectedOccasions || 0;
          const transactionValue = safeAvgTransactionValue * (1 + (campaign.additionalSpending || 0) / 100);
          revenue = participants * transactionValue;
          incrementalRevenue = revenue - (participants * safeAvgTransactionValue);
          pointCost = participants * (campaign.occasionBonus || 0);
          break;
        }
        case 'minPurchase': {
          const durationInMonths = (campaign.duration || 0) / 30;
          participants = safeMonthlyTransactions * ((campaign.targetParticipation || 0) / 100) * durationInMonths;
          const transactionValue = safeAvgTransactionValue * (1 + (campaign.additionalSpending || 0) / 100);
          revenue = participants * transactionValue;
          incrementalRevenue = revenue - (participants * safeAvgTransactionValue);
          pointCost = participants * (campaign.bonusReward || 0);
          break;
        }
        case 'timeBased': {
          const durationInMonths = (campaign.duration || 0) / 30;
          const dailyHours = campaign.dailyHours || 0;
          // Assume business operates 12 hours/day on average
          const businessHoursPerDay = 12;
          // Percentage of daily transactions during happy hour (assuming even distribution)
          const timeWindowPercentage = dailyHours / businessHoursPerDay;
          // Customers during happy hour who participate
          const dailyTransactions = safeMonthlyTransactions / 30; // transactions per day
          const happyHourTransactions = dailyTransactions * timeWindowPercentage;
          const participatingTransactions = happyHourTransactions * ((campaign.targetParticipation || 0) / 100);
          participants = participatingTransactions * 30 * durationInMonths; // scale to monthly
          const transactionValue = safeAvgTransactionValue * (1 + (campaign.additionalSpending || 0) / 100);
          revenue = participants * transactionValue;
          incrementalRevenue = revenue - (participants * safeAvgTransactionValue);
          pointCost = (revenue * (safeRewardBudget / 100)) * (campaign.pointMultiplier || 1);
          break;
        }
        case 'frequencyReward': {
          const durationInMonths = (campaign.duration || 0) / 30;
          const participationRate = (campaign.targetParticipation || 0) / 100;

          // Estimate: Average customer visits 2.5 times per month normally
          const avgNormalVisits = 2.5;
          const requiredVisits = campaign.requiredVisits || 5;

          // Customers who participate and try to complete the challenge
          // Rough estimate: monthly transactions / avg visits = unique customers
          const estimatedUniqueCustomers = safeMonthlyTransactions / avgNormalVisits;
          const participatingCustomers = estimatedUniqueCustomers * participationRate * durationInMonths;

          // Extra visits needed to reach goal (beyond normal behavior)
          const extraVisitsPerCustomer = Math.max(0, requiredVisits - avgNormalVisits);
          const totalExtraVisits = participatingCustomers * extraVisitsPerCustomer;

          participants = Math.round(participatingCustomers); // People who complete challenge
          // Incremental revenue from extra visits
          incrementalRevenue = totalExtraVisits * safeAvgTransactionValue;
          revenue = incrementalRevenue; // Only count incremental
          pointCost = participants * (campaign.bonusReward || 0);
          break;
        }
      }

      const totalCost = pointCost + safeMarketingCost;
      const grossProfitFromIncremental = incrementalRevenue * (safeGrossMargin / 100);
      const netProfit = grossProfitFromIncremental - totalCost;
      const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        enabled: campaign.enabled,
        participants: Math.round(participants),
        revenue,
        incrementalRevenue,
        pointCost,
        totalCost,
        grossProfitFromIncremental,
        netProfit,
        roi,
      };
    });

    // Calculate combined metrics for enabled campaigns
    const enabledCampaigns = campaignMetrics.filter(c => c.enabled);
    const combinedCampaignRevenue = enabledCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const combinedIncrementalRevenue = enabledCampaigns.reduce((sum, c) => sum + c.incrementalRevenue, 0);
    const combinedCampaignCost = enabledCampaigns.reduce((sum, c) => sum + c.totalCost, 0);
    const combinedCampaignGrossProfit = enabledCampaigns.reduce((sum, c) => sum + c.grossProfitFromIncremental, 0);
    const combinedCampaignNetProfit = combinedCampaignGrossProfit - combinedCampaignCost;
    const combinedCampaignROI = combinedCampaignCost > 0 ? (combinedCampaignNetProfit / combinedCampaignCost) * 100 : 0;

    const tierRewardIncrease = 1.3;
    const tierRevenueUplift = 35;
    const tierCost = rewardBudgetAmount * tierRewardIncrease;
    const tierRevenue = monthlyRevenue * (tierRevenueUplift / 100);
    const tierGrossProfit = tierRevenue * (safeGrossMargin / 100);
    const tierNetProfit = tierGrossProfit - tierCost;
    const tierROI = tierCost > 0 ? (tierNetProfit / tierCost) * 100 : 0;

    const rewardCostAsMargin = (rewardBudgetAmount / monthlyRevenue) * 100;
    const marginSafety = safeGrossMargin - rewardCostAsMargin;
    const isSafe = marginSafety > 10;
    const fixedCostRatio = (safeFixedProgramCost / monthlyRevenue) * 100;
    const isRevenueTooSmall = fixedCostRatio > 10;

    const neededGrossProfit = totalMonthlyCost;
    const neededAdditionalRevenue = safeGrossMargin > 0 ? neededGrossProfit / (safeGrossMargin / 100) : 0;
    const breakEvenUplift = monthlyRevenue > 0 ? (neededAdditionalRevenue / monthlyRevenue) * 100 : 0;
    const currentGrossProfitPerTransaction = safeAvgTransactionValue * (safeGrossMargin / 100);
    const additionalTransactionsNeeded = currentGrossProfitPerTransaction > 0 ? Math.ceil(neededGrossProfit / currentGrossProfitPerTransaction) : 0;
    const breakEvenTransactions = safeMonthlyTransactions + additionalTransactionsNeeded;
    const rewardCostPerTransaction = safeMonthlyTransactions > 0 ? rewardBudgetAmount / safeMonthlyTransactions : 0;
    const totalCostPerTransaction = safeMonthlyTransactions > 0 ? totalMonthlyCost / safeMonthlyTransactions : 0;
    const fixedCostPerTransaction = safeMonthlyTransactions > 0 ? safeFixedProgramCost / safeMonthlyTransactions : 0;
    const annualProgramCost = totalMonthlyCost * 12;
    const rewardCostPercentOfRevenue = monthlyRevenue > 0 ? (rewardBudgetAmount / monthlyRevenue) * 100 : 0;
    const fixedCostPercentOfRevenue = monthlyRevenue > 0 ? (safeFixedProgramCost / monthlyRevenue) * 100 : 0;

    return {
      pointsPerBaht: safePointsPerBaht.toFixed(2),
      pointsEarnedPerTransaction: pointsEarnedPerTransaction.toFixed(0),
      pointValue: pointValue.toFixed(4),
      costToRevenueRatio: costToRevenueRatio.toFixed(2),
      baseROI: baseROI.toFixed(1),
      campaignROI: combinedCampaignROI.toFixed(1),
      tierROI: tierROI.toFixed(1),
      monthlyRevenue,
      totalMonthlyCost,
      rewardBudgetAmount,
      marginSafety: marginSafety.toFixed(1),
      isSafe,
      baseNetProfit,
      campaignNetProfit: combinedCampaignNetProfit,
      tierNetProfit,
      fixedCostRatio: fixedCostRatio.toFixed(1),
      isRevenueTooSmall,
      breakEvenUplift: breakEvenUplift.toFixed(1),
      additionalTransactionsNeeded,
      breakEvenTransactions,
      currentGrossProfitPerTransaction: currentGrossProfitPerTransaction.toFixed(2),
      rewardCostPerTransaction: rewardCostPerTransaction.toFixed(2),
      totalCostPerTransaction: totalCostPerTransaction.toFixed(2),
      fixedCostPerTransaction: fixedCostPerTransaction.toFixed(2),
      annualProgramCost,
      rewardCostPercentOfRevenue: rewardCostPercentOfRevenue.toFixed(2),
      fixedCostPercentOfRevenue: fixedCostPercentOfRevenue.toFixed(2),
      // Campaign metrics
      campaignMetrics,
      combinedCampaignRevenue,
      combinedIncrementalRevenue,
      combinedCampaignCost,
      combinedCampaignGrossProfit,
      combinedCampaignROI,
      enabledCampaignsCount: enabledCampaigns.length,
    };
  }, [inputs, campaigns]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Loyalty Program ROI Calculator</h1>
              </div>
              <p className="text-gray-600">Design a profitable loyalty program that protects your margins and drives growth</p>
            </div>
            <button
              onClick={onNavigateToMerchants}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm border border-gray-200"
            >
              <Store className="w-4 h-4" />
              Merchants
            </button>
          </div>

          {/* Current Merchant Display */}
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl mb-6">
            <Store className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600">Current Merchant:</span>
            <span className="text-sm font-bold text-gray-900">{merchantName}</span>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setActivePage('base')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activePage === 'base'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calculator className="w-5 h-5" />
              Base Program
            </button>
            <button
              onClick={() => setActivePage('campaign')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activePage === 'campaign'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Campaign Design
            </button>
          </div>

          {Number(inputs.grossMargin) <= 15 && activePage === 'base' && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Low Margin Detected</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    With {inputs.grossMargin}% margin, use conservative settings for positive ROI.
                  </p>
                  <button
                    onClick={applyLowMarginPreset}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm shadow-sm"
                  >
                    Apply Low Margin Safe Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {activePage === 'base' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Program Settings</h2>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setMode('simple')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all text-sm ${
                      mode === 'simple'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Simple
                  </button>
                  <button
                    onClick={() => setMode('advanced')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all text-sm ${
                      mode === 'advanced'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Advanced
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Basic Inputs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gross Margin (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.grossMargin}
                    onChange={(e) => handleInputChange('grossMargin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                    step="0.1"
                    min="0"
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs font-semibold text-blue-900 mb-1">💡 Use Gross Margin, Not Net Margin</p>
                    <p className="text-xs text-blue-800">
                      <strong>Gross Margin</strong> = (Revenue - COGS) ÷ Revenue<br />
                      Only include direct costs (food, packaging), NOT fixed costs (rent, salaries)
                    </p>
                    <div className="mt-2 text-xs text-blue-700">
                      <strong>Example:</strong> Revenue ฿100k, COGS ฿65k, Fixed costs ฿30k<br />
                      • Gross Margin: 35% ← <strong>Use this</strong> ✓<br />
                      • Net Margin: 5% ← Don&apos;t use this ✗
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Budget (% of Revenue)
                  </label>
                  <input
                    type="number"
                    value={inputs.rewardBudget}
                    onChange={(e) => handleInputChange('rewardBudget', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                    step="0.1"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical: 2-5% of revenue</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Transaction Value (฿)
                  </label>
                  <input
                    type="number"
                    value={inputs.avgTransactionValue}
                    onChange={(e) => handleInputChange('avgTransactionValue', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Redemption Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.redemptionRate}
                    onChange={(e) => handleInputChange('redemptionRate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                    step="1"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Industry average: 50-70%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Program Cost (฿/month)
                  </label>
                  <input
                    type="number"
                    value={inputs.fixedProgramCost}
                    onChange={(e) => handleInputChange('fixedProgramCost', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Software, staff, operations</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Transactions
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyTransactions}
                    onChange={(e) => handleInputChange('monthlyTransactions', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total number of customer purchases per month</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points per Baht
                  </label>
                  <div className="flex gap-2 items-start">
                    <input
                      type="number"
                      value={inputs.pointsPerBaht}
                      onChange={(e) => handleInputChange('pointsPerBaht', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                      step="0.1"
                      min="0.1"
                      disabled={inputs.autoAdjustPoints}
                    />
                    <button
                      onClick={() => setInputs(prev => ({ ...prev, autoAdjustPoints: !prev.autoAdjustPoints }))}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        inputs.autoAdjustPoints
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {inputs.autoAdjustPoints ? '🔒 Auto' : '🔓 Manual'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {inputs.autoAdjustPoints ? (
                      <span className="text-green-600 font-medium">
                        ✓ Auto-adjusting based on margin and reward budget
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Manual mode - adjust points per baht yourself
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Number(inputs.pointsPerBaht) >= 20 ? (
                      <span className="text-green-600 font-medium">✓ Conservative earning (good for low margins)</span>
                    ) : Number(inputs.pointsPerBaht) >= 10 ? (
                      <span className="text-blue-600 font-medium">→ Moderate earning (balanced approach)</span>
                    ) : Number(inputs.pointsPerBaht) >= 5 ? (
                      <span className="text-orange-600 font-medium">⚡ Fast earning (requires higher margins)</span>
                    ) : (
                      <span className="text-red-600 font-medium">⚠ Very fast earning (only for high margin businesses)</span>
                    )}
                    <br />
                    {Number(inputs.grossMargin) <= 15 ? (
                      <span className="text-orange-600">Recommended for {inputs.grossMargin}% margin: 30-50 baht per point</span>
                    ) : Number(inputs.grossMargin) <= 35 ? (
                      <span className="text-orange-600">Recommended for {inputs.grossMargin}% margin: 10-30 baht per point</span>
                    ) : Number(inputs.grossMargin) <= 50 ? (
                      <span className="text-orange-600">Recommended for {inputs.grossMargin}% margin: 5-15 baht per point</span>
                    ) : (
                      <span className="text-orange-600">Recommended for {inputs.grossMargin}% margin: 1-10 baht per point</span>
                    )}
                  </p>
                </div>

                {/* Advanced Inputs */}
                {mode === 'advanced' && (
                  <>
                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Advanced Forecasting</h3>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedBenchmark}
                            onChange={(e) => setSelectedBenchmark(e.target.value)}
                            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                          >
                            <option value="restaurant">Restaurant</option>
                            <option value="cafe">Café/Coffee</option>
                            <option value="retail">Retail</option>
                          </select>
                          <button
                            onClick={applyBenchmark}
                            className="text-sm px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Use Industry Data
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                        <p className="text-xs font-semibold text-blue-900 mb-2">
                          {benchmarks[selectedBenchmark].description} Benchmarks:
                        </p>
                        <div className="text-xs text-blue-800 space-y-1">
                          <div>• Customer Uplift: {benchmarks[selectedBenchmark].returningCustomerUplift.min}-{benchmarks[selectedBenchmark].returningCustomerUplift.max}% (avg: {benchmarks[selectedBenchmark].returningCustomerUplift.avg}%)</div>
                          <div>• Retention Rate: {benchmarks[selectedBenchmark].customerRetentionRate.min}-{benchmarks[selectedBenchmark].customerRetentionRate.max}% (avg: {benchmarks[selectedBenchmark].customerRetentionRate.avg}%)</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Returning Customer Uplift (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.returningCustomerUplift}
                        onChange={(e) => handleInputChange('returningCustomerUplift', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                        step="1"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Revenue increase from repeat visits</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Retention Rate (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.customerRetentionRate}
                        onChange={(e) => handleInputChange('customerRetentionRate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 hover:border-gray-300 transition-colors"
                        step="1"
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">% of customers who return</p>
                    </div>
                  </>
                )}

                {/* Simple Mode Info */}
                {mode === 'simple' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
                    <p className="text-sm text-gray-900 font-medium mb-2">Using Default Values</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Customer Uplift: {inputs.returningCustomerUplift}%</li>
                      <li>• Retention Rate: {inputs.customerRetentionRate}%</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                      Switch to <span className="font-semibold">Advanced Mode</span> to customize or use industry benchmarks
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Negative ROI Alert & Solutions */}
              {parseFloat(calculations.baseROI) < 0 && (
                <div className="bg-red-50 rounded-3xl shadow-sm p-6 border border-red-200">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-red-900 mb-2">
                        ⚠️ Negative ROI: {calculations.baseROI}%
                      </h3>
                      <p className="text-sm text-red-800 mb-3">
                        Your loyalty program is losing ฿{Math.abs(calculations.baseNetProfit).toLocaleString()}/month.
                        {calculations.isRevenueTooSmall && (
                          <span className="font-semibold"> Your fixed cost ({calculations.fixedCostRatio}% of revenue) is too high for your revenue level.</span>
                        )}
                      </p>

                      {!showNegativeROIHelp ? (
                        <button
                          onClick={() => setShowNegativeROIHelp(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Show Solutions 🔧
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-white/80 rounded-lg p-4">
                            <h4 className="font-bold text-red-900 mb-2">📊 Problem Analysis:</h4>
                            <ul className="text-sm text-red-800 space-y-1 ml-4">
                              <li>• Monthly Revenue: ฿{calculations.monthlyRevenue.toLocaleString()}</li>
                              <li>• Current Transactions: {inputs.monthlyTransactions.toLocaleString()}/month</li>
                              <li>• Program Cost: ฿{calculations.totalMonthlyCost.toLocaleString()} ({calculations.costToRevenueRatio}% of revenue)</li>
                              <li>• Fixed Cost Ratio: {calculations.fixedCostRatio}% {parseFloat(calculations.fixedCostRatio) > 10 && <span className="text-red-600 font-bold">(TOO HIGH! Should be &lt;2%)</span>}</li>
                              <li>• Gross Profit from Uplift: ฿{(calculations.monthlyRevenue * Number(inputs.returningCustomerUplift) / 100 * Number(inputs.grossMargin) / 100).toLocaleString()}</li>
                            </ul>
                          </div>

                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2">🎯 Break-Even Analysis:</h4>
                            <p className="text-sm text-gray-600 mb-2">To break even, you need ONE of these:</p>
                            <div className="space-y-2">
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-sm font-semibold text-gray-900">Option 1: Increase Revenue</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  • Need {calculations.breakEvenUplift}% more revenue ({parseFloat(calculations.breakEvenUplift) > 50 ? <span className="text-red-600 font-bold">UNREALISTIC</span> : <span className="text-green-600 font-semibold">Achievable</span>})
                                </p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-sm font-semibold text-gray-900">Option 2: Increase Transactions</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  • Need <span className="font-bold text-orange-600">{calculations.additionalTransactionsNeeded} more orders/month</span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  • From {inputs.monthlyTransactions} → {calculations.breakEvenTransactions} transactions
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  • Each transaction earns you ฿{calculations.currentGrossProfitPerTransaction} gross profit
                                </p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-sm font-semibold text-gray-900">Option 3: Reduce Costs</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  • Cut program costs to match your current revenue uplift
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  • <span className="font-bold">Click one of the quick-fix solutions below</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-bold text-red-900">🎯 Quick Fix Solutions:</h4>

                            {/* Paper Punch Card Option */}
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-bold text-green-900">🏆 Best: Paper Punch Card</h5>
                                  <p className="text-sm text-green-800 mt-1">Zero fixed cost, simple to implement</p>
                                  <ul className="text-xs text-green-700 mt-2 space-y-1">
                                    <li>• Fixed Cost: ฿0 (one-time ฿500 for cards)</li>
                                    <li>• Reward Budget: 1.5%</li>
                                    <li>• Expected ROI: ~100%</li>
                                    <li>• &quot;Buy 10 get 1 free&quot; style</li>
                                  </ul>
                                </div>
                                <button
                                  onClick={() => applyQuickFix('paper')}
                                  className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm whitespace-nowrap"
                                >
                                  Apply Settings
                                </button>
                              </div>
                            </div>

                            {/* Minimal Digital Option */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-bold text-blue-900">💻 Good: Minimal Digital</h5>
                                  <p className="text-sm text-blue-800 mt-1">Low-cost digital platform</p>
                                  <ul className="text-xs text-blue-700 mt-2 space-y-1">
                                    <li>• Fixed Cost: ฿500/month</li>
                                    <li>• Reward Budget: 1%</li>
                                    <li>• Expected ROI: ~20-30%</li>
                                    <li>• Simple app or LINE OA</li>
                                  </ul>
                                </div>
                                <button
                                  onClick={() => applyQuickFix('minimal')}
                                  className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm whitespace-nowrap shadow-sm"
                                >
                                  Apply Settings
                                </button>
                              </div>
                            </div>

                            {/* Balanced Option */}
                            {calculations.monthlyRevenue > 50000 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-bold text-gray-900">⚖️ Balanced Program</h5>
                                    <p className="text-sm text-gray-600 mt-1">For higher revenue businesses</p>
                                    <ul className="text-xs text-gray-600 mt-2 space-y-1">
                                      <li>• Fixed Cost: ~2% of revenue</li>
                                      <li>• Reward Budget: 1.5%</li>
                                      <li>• Expected ROI: ~15-25%</li>
                                      <li>• Better features & tracking</li>
                                    </ul>
                                  </div>
                                  <button
                                    onClick={() => applyQuickFix('balanced')}
                                    className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm whitespace-nowrap shadow-sm"
                                  >
                                    Apply Settings
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-900 mb-1">💡 Key Insight:</p>
                            <p className="text-xs text-gray-600">
                              {calculations.monthlyRevenue < 50000 ? (
                                <>Your revenue (฿{calculations.monthlyRevenue.toLocaleString()}/month) is too small for expensive loyalty platforms. Start with paper cards or free digital tools, then upgrade when revenue reaches ฿50,000+/month.</>
                              ) : (
                                <>Your fixed costs are too high relative to your revenue. Reduce to 2% of revenue or less (฿{(calculations.monthlyRevenue * 0.02).toLocaleString()}).</>
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() => setShowNegativeROIHelp(false)}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                          >
                            Hide Solutions
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Margin Safety */}
              <div className={`rounded-3xl shadow-sm p-6 ${calculations.isSafe ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${calculations.isSafe ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <h3 className={`font-bold ${calculations.isSafe ? 'text-green-900' : 'text-red-900'}`}>
                      {calculations.isSafe ? 'Margin is Safe' : 'Low Margin Safety'}
                    </h3>
                    <p className={`text-sm ${calculations.isSafe ? 'text-green-700' : 'text-red-700'}`}>
                      Margin Safety: {calculations.marginSafety}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Earning Rules */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-3">Earning Rules</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                    <span className="text-gray-700 text-sm">Points per Baht</span>
                    <span className="font-bold text-orange-600">1 per ฿{calculations.pointsPerBaht}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                    <span className="text-gray-700 text-sm">Point Value</span>
                    <span className="font-bold text-orange-600">฿{calculations.pointValue}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Example: Spend ฿{inputs.avgTransactionValue} → Earn {calculations.pointsEarnedPerTransaction} points
                  </p>
                </div>
              </div>

              {/* Cost Analysis - Simplified */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-3">Cost Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-semibold">฿{calculations.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Program Cost</span>
                    <span className="font-semibold">฿{calculations.totalMonthlyCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-bold">Cost/Revenue</span>
                    <span className="font-bold text-orange-600">{calculations.costToRevenueRatio}%</span>
                  </div>
                </div>
              </div>

              {/* ROI Analysis */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg shadow-orange-500/20 p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="font-bold">ROI Analysis</h3>
                </div>

                <div className="space-y-2">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Base Program</span>
                      <span className="text-2xl font-bold">{calculations.baseROI}%</span>
                    </div>
                    <p className="text-xs text-white/80">Net: ฿{calculations.baseNetProfit.toLocaleString()}/mo</p>
                    {parseFloat(calculations.baseROI) < 0 && (
                      <p className="text-xs text-white/90 mt-1">
                        Need {calculations.additionalTransactionsNeeded} more orders/mo to break even
                      </p>
                    )}
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Campaign</span>
                      <span className="text-xl font-bold">{calculations.campaignROI}%</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tier (VIP)</span>
                      <span className="text-xl font-bold">{calculations.tierROI}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Campaign List */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
                  </div>
                  <button
                    onClick={() => setShowCampaignTypeModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
                  >
                    + Add Campaign
                  </button>
                </div>

                <div className="space-y-2">
                  {campaigns.map(campaign => (
                    <div
                      key={campaign.id}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedCampaignId === campaign.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCampaign(campaign.id);
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                              campaign.enabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              campaign.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                          <span className="text-2xl">{campaignTypes[campaign.type]?.icon || '⚡'}</span>
                          <div className="flex-1">
                            <p className={`font-semibold ${campaign.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                              {campaign.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">
                                {campaignTypes[campaign.type]?.name} •
                                <span className={`font-semibold ${
                                  (calculations.campaignMetrics?.find(m => m.id === campaign.id)?.roi || 0) > 10
                                    ? 'text-green-600'
                                    : (calculations.campaignMetrics?.find(m => m.id === campaign.id)?.roi || 0) > 0
                                    ? 'text-orange-600'
                                    : 'text-red-600'
                                }`}>
                                  {' '}{calculations.campaignMetrics?.find(m => m.id === campaign.id)?.roi.toFixed(1)}% ROI
                                </span>
                              </p>
                              {(calculations.campaignMetrics?.find(m => m.id === campaign.id)?.roi || 0) <= 10 && (
                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                  Needs Optimization
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {campaigns.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCampaign(campaign.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Campaign Settings */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                {(() => {
                  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
                  if (!selectedCampaign) return null;
                  const campaignType = campaignTypes[selectedCampaign.type];
                  const campaignMetric = calculations.campaignMetrics?.find(m => m.id === selectedCampaignId);
                  const currentROI = campaignMetric?.roi || 0;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{campaignType?.icon || '⚡'}</span>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{campaignType?.name || 'Campaign'} Settings</h3>
                            <p className="text-xs text-gray-500">{campaignType?.description}</p>
                          </div>
                        </div>
                        {currentROI <= 10 && (
                          <button
                            onClick={() => optimizeCampaignForPositiveROI(selectedCampaignId)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium text-sm shadow-sm"
                          >
                            <Zap className="w-4 h-4" />
                            Optimize ROI
                          </button>
                        )}
                      </div>

                      {/* Optimization Message */}
                      {optimizationMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-sm text-green-800 font-medium">{optimizationMessage}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Campaign Name - Always shown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campaign Name
                          </label>
                          <input
                            type="text"
                            value={selectedCampaign.name || ''}
                            onChange={(e) => updateCampaign(selectedCampaignId, 'name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 hover:border-gray-300 transition-colors"
                          />
                        </div>

                        {/* Dynamic fields based on campaign type */}
                        {campaignType?.fields.map((field: string) => {
                          const fieldConfig = getFieldLabel(field);
                          return (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {fieldConfig.label}
                              </label>
                              <input
                                type="number"
                                value={selectedCampaign[field] || ''}
                                onChange={(e) => updateCampaign(selectedCampaignId, field, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 hover:border-gray-300 transition-colors"
                                min="0"
                                step={field.includes('Multiplier') ? '0.5' : '1'}
                              />
                              {fieldConfig.helper && (
                                <div className="mt-1">
                                  <p className="text-xs text-gray-600">{fieldConfig.helper}</p>
                                  {fieldConfig.range && (
                                    <p className="text-xs text-blue-600 font-medium mt-0.5">💡 {fieldConfig.range}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-6">
              {/* Combined Campaign ROI */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-500/20 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="font-bold text-lg">Combined ROI</h3>
                  </div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    {calculations.enabledCampaignsCount} Enabled
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total ROI</span>
                    <span className="text-3xl font-bold">{calculations.campaignROI}%</span>
                  </div>
                  <p className="text-xs text-white/80">
                    Net Profit: ฿{calculations.campaignNetProfit.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total Revenue:</span>
                    <span className="font-semibold">฿{calculations.combinedCampaignRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Incremental:</span>
                    <span className="font-semibold text-green-200">+฿{calculations.combinedIncrementalRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Total Cost:</span>
                    <span className="font-semibold">฿{calculations.combinedCampaignCost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Comparison */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Campaign Comparison</h3>
                <div className="space-y-2">
                  {calculations.campaignMetrics?.map(metric => (
                    <div
                      key={metric.id}
                      className={`p-3 rounded-xl border ${
                        metric.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${metric.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                            {metric.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ROI: <span className={`font-bold ${
                              metric.roi >= 50 ? 'text-green-600' : metric.roi >= 0 ? 'text-blue-600' : 'text-red-600'
                            }`}>{metric.roi.toFixed(1)}%</span>
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {metric.enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Net: ฿{metric.netProfit.toLocaleString()}</div>
                        <div>Cost: ฿{metric.totalCost.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-3xl shadow-sm p-6 border border-blue-200">
                <h3 className="font-bold text-lg text-gray-900 mb-3">💡 Optimization Suggestions</h3>
                <div className="space-y-3">
                  {calculations.campaignMetrics?.some(m => !m.enabled && m.roi > 0) && (
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-green-900 mb-1">Enable Profitable Campaigns</p>
                      <p className="text-xs text-green-800">
                        {calculations.campaignMetrics?.filter(m => !m.enabled && m.roi > 0).map(m => m.name).join(', ')}
                        {calculations.campaignMetrics?.filter(m => !m.enabled && m.roi > 0).length === 1 ? ' has' : ' have'} positive ROI
                      </p>
                    </div>
                  )}

                  {calculations.campaignMetrics?.some(m => m.enabled && m.roi < 0) && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-red-900 mb-1">Disable Loss-Making Campaigns</p>
                      <p className="text-xs text-red-800">
                        {calculations.campaignMetrics?.filter(m => m.enabled && m.roi < 0).map(m => m.name).join(', ')}
                        {calculations.campaignMetrics?.filter(m => m.enabled && m.roi < 0).length === 1 ? ' is' : ' are'} losing money
                      </p>
                    </div>
                  )}

                  {parseFloat(calculations.campaignROI) >= 50 && (
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900">✓ Well Optimized!</p>
                      <p className="text-xs text-blue-800">Combined ROI is {calculations.campaignROI}%</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">General Tips:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Best days: Thursday-Sunday</li>
                      <li>• Promote 3-5 days before start</li>
                      <li>• Use urgency messaging</li>
                      <li>• Test different multipliers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Type Selection Modal */}
        {showCampaignTypeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Choose Campaign Type</h2>
                <button
                  onClick={() => setShowCampaignTypeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(campaignTypes).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => addCampaignWithType(key)}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <span className="text-4xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 mb-1">
                        {type.name}
                      </h3>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaign Templates Modal */}
        {showTemplatesModal && selectedCampaignType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-3xl">{campaignTypes[selectedCampaignType]?.icon}</span>
                    {campaignTypes[selectedCampaignType]?.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your business size: <span className="font-semibold capitalize">{getBusinessSize()}</span> (based on ฿{(Number(inputs.monthlyTransactions) * Number(inputs.avgTransactionValue)).toLocaleString()}/month)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTemplatesModal(false);
                    setShowCampaignTypeModal(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Templates */}
                {campaignTemplates[selectedCampaignType] && Object.keys(campaignTemplates[selectedCampaignType]).length > 0 && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                      <p className="text-sm font-semibold text-blue-900 mb-1">✨ Recommended Templates</p>
                      <p className="text-xs text-blue-800">Pre-filled with proven values for your business size. Just click and go!</p>
                    </div>

                    {Object.entries(campaignTemplates[selectedCampaignType]).map(([templateName, _]) => (
                      <button
                        key={templateName}
                        onClick={() => addCampaignFromTemplate(selectedCampaignType, templateName)}
                        className="w-full flex items-start justify-between p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100 transition-all text-left group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                              {templateName}
                            </h3>
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                              Template
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            All values pre-filled based on industry benchmarks for {getBusinessSize()} businesses
                          </p>
                        </div>
                        <span className="text-green-600 text-2xl">→</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Custom option */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => addCampaignFromTemplate(selectedCampaignType)}
                    className="w-full flex items-start justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600">
                          Start from Scratch
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-500 text-white text-xs font-medium rounded-full">
                          Custom
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Create your own campaign with smart default values (you can customize everything)
                      </p>
                    </div>
                    <span className="text-gray-400 text-2xl group-hover:text-blue-600">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
