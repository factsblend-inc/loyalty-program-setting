# Campaign ROI Optimization Feature

## Overview
Automatically optimizes campaign settings to achieve positive ROI (target: 15% minimum).

---

## How It Works

### Visual Indicators:

1. **Campaign List**:
   - ✅ **Green ROI** (>10%): Campaign is performing well
   - ⚠️ **Orange ROI** (0-10%): Marginal performance
   - 🔴 **Red ROI** (<0%): Losing money
   - **"Needs Optimization" badge**: Shows on campaigns with ROI ≤ 10%

2. **Optimize Button**:
   - Appears in campaign settings when ROI ≤ 10%
   - One click to automatically optimize
   - Shows success message with what was changed

---

## Optimization Strategies by Campaign Type

### 1. Point Multiplier (⚡)
**Adjustments:**
- Reduce point multiplier to 2X max
- Increase participation to 40%
- Cut marketing budget in half

**Example:**
```
Before: 3X points, 25% participation, ฿2,000 marketing → -20% ROI
After: 2X points, 40% participation, ฿1,000 marketing → +18% ROI
```

---

### 2. Group Reward (👥)
**Adjustments:**
- Reduce bonus to 50-60% of original
- Increase participation to 25%

**Example:**
```
Before: 150 points/person, 15% participation → -15% ROI
After: 90 points/person, 25% participation → +12% ROI
```

---

### 3. Spending Tier (🎯)
**Adjustments:**
- Reduce tier bonus to 40% of original (max ฿200)
- Increase spending threshold to ฿8,000

**Example:**
```
Before: ฿500 bonus at ฿5,000 → -85% ROI
After: ฿200 bonus at ฿8,000 → -20% ROI (better, may need further adjustment)
```

**Note:** High-value tier bonuses are expensive. Manual adjustment may still be needed.

---

### 4. Referral Program (🤝)
**Adjustments:**
- Reduce referrer bonus to ฿150
- Reduce referee bonus to ฿75
- Increase expected referrals by 50%

**Example:**
```
Before: ฿200/฿100 bonuses, 50 referrals → -36% ROI
After: ฿150/฿75 bonuses, 75 referrals → +5% ROI
```

---

### 5. Special Occasion (🎂)
**Adjustments:**
- Cut occasion bonus in half (max ฿150)
- Increase expected extra spending to 40%

**Example:**
```
Before: ฿300 birthday bonus → -56% ROI
After: ฿150 birthday bonus → -12% ROI
```

---

### 6. Minimum Purchase (💰)
**Adjustments:**
- Reduce bonus to ฿30
- Increase minimum threshold to ฿600

**Example:**
```
Before: ฿50 bonus at ฿500 → -4% ROI
After: ฿30 bonus at ฿600 → +8% ROI
```

---

### 7. Happy Hour (⏰)
**Adjustments:**
- Limit multiplier to 1.5X
- Reduce marketing to ฿1,000

**Example:**
```
Before: 2X points, ฿2,000 marketing → -39% ROI
After: 1.5X points, ฿1,000 marketing → -10% ROI
```

---

### 8. Frequency Reward (📅)
**Adjustments:**
- Reduce bonus to ฿150
- Increase required visits to 7

**Example:**
```
Before: ฿200 for 5 visits → 441% ROI (already good!)
After: No changes needed ✅
```

---

## When Optimization Can't Help

Some campaigns may still show negative ROI after optimization because:

1. **Fundamental Economics**: The campaign type doesn't fit the business model
2. **Low Margins**: Business has thin margins that can't support rewards
3. **High Costs**: Fixed costs are too high relative to revenue

**In these cases, the tool will show:**
> "💡 Try increasing participation or reducing rewards manually"

**Merchant should:**
- Consider a different campaign type
- Manually adjust values further
- Focus on campaigns with naturally positive ROI (like frequency rewards)

---

## Best Practices

### ✅ Good Campaigns (Easy to Optimize):
1. **Frequency Rewards** - Drive extra visits with small bonuses
2. **Minimum Purchase** - Encourage larger baskets
3. **Point Multipliers** - Limited-time excitement with controlled costs

### ⚠️ Challenging Campaigns (Need Careful Tuning):
1. **Spending Tiers** - High bonuses can lose money
2. **Special Occasions** - Hard to predict participation
3. **Group Rewards** - Complex economics

### 🔴 High-Risk Campaigns (Often Negative Short-term):
1. **Referral Programs** - Customer acquisition play (focus on LTV, not immediate ROI)

---

## Testing the Feature

### Scenario 1: Point Multiplier Campaign
1. Create "Weekend 3X Points" with ฿3,000 marketing
2. See negative ROI (-25%)
3. Click "Optimize ROI"
4. Campaign adjusts to 2X points, ฿1,500 marketing
5. ROI becomes positive (+12%)

### Scenario 2: Already Optimized Campaign
1. Create "Visit 5 Times Bonus" with ฿100 reward
2. See high ROI (+400%)
3. Click "Optimize ROI"
4. See message: "✅ Campaign already has positive ROI!"

### Scenario 3: Needs Manual Adjustment
1. Create "Spend ฿10,000 Get ฿1,000" campaign
2. See very negative ROI (-90%)
3. Click "Optimize ROI"
4. Adjusts to ฿400 bonus, threshold ฿8,000
5. Still negative (-40%)
6. Shows: "💡 Try increasing participation or reducing rewards manually"
7. Merchant manually reduces to ฿200 bonus
8. ROI becomes positive (+15%)

---

## User Experience

### Visual Flow:
```
1. Create campaign → See red ROI badge "Needs Optimization"
                              ↓
2. Click on campaign → See "Optimize ROI" button (green)
                              ↓
3. Click button → See green message: "✨ Optimized: Bonus reduced to ฿30, Participation increased to 40%"
                              ↓
4. ROI updates in real-time → Badge changes to green ✅
```

### Messages:
- ✅ Success: "✨ Optimized: [list of changes]"
- 🎯 Already good: "✅ Campaign already has positive ROI!"
- 💡 Manual needed: "💡 Try increasing participation or reducing rewards manually"

---

## Impact on Merchant Confidence

**Before Optimization Feature:**
- Merchant sees -56% ROI
- Doesn't know what to adjust
- Gives up or makes random changes

**After Optimization Feature:**
- Merchant sees -56% ROI with "Needs Optimization" badge
- Clicks one button
- Gets immediate, actionable changes
- Sees improved ROI with clear explanation

**Result:** Merchants feel confident and empowered to design profitable campaigns.
