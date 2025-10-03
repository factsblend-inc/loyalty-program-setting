# Campaign ROI Calculation Logic Audit

## Test Scenario
- Monthly Transactions: 1,000
- Avg Transaction Value: ฿350
- Gross Margin: 65%
- Reward Budget: 3%
- Point Value: ฿0.105 (from calculation)

---

## 1. Point Multiplier ✅ CORRECT

**Example:** Double Points Weekend (7 days, 2X points, 30% participation, 25% extra spending)

### Calculation:
- Duration: 7/30 = 0.233 months
- Participants: 1,000 × 0.30 × 0.233 = 70 transactions
- Transaction Value: ฿350 × 1.25 = ฿437.50
- Revenue: 70 × ฿437.50 = ฿30,625
- Incremental Revenue: ฿30,625 - (70 × ฿350) = ฿6,125
- Point Cost: (฿30,625 × 0.03) × 2 = ฿1,838

**Logic:** ✅ Correct - people spend more and get double points

---

## 2. Group Reward ❌ CRITICAL BUG

**Example:** Family Dining (4 people minimum, 100 points/person)

### Current Calculation:
- Participants: 1,000 × 0.20 × 1 × **4** = **800 people**
- Revenue: **800** × ฿455 = ฿364,000 ❌ WRONG!

### Problem:
**Multiplying by group size inflates revenue by 4X!**
- 200 transactions (20% of 1,000) with 4 people each = 800 people total
- But revenue should be 200 transactions × ฿455, NOT 800 × ฿455

### Correct Calculation:
- Group Transactions: 1,000 × 0.20 × 1 = 200 transactions
- People: 200 × 4 = 800 people
- Revenue: **200** × ฿455 = ฿91,000
- Point Cost: 800 people × 100 points × ฿0.105 = ฿8,400

---

## 3. Spending Tier ✅ FIXED
**Logic:** 20% spending increase to reach threshold - looks correct after fix

---

## 4. Referral ✅ CORRECT
**Logic:** New customers × avg transaction = all new revenue - correct

---

## 5. Special Occasion ⚠️ NEEDS REVIEW

**Example:** Birthday Bonus (300฿ bonus, 100 occasions/month)

### Current Calculation:
- Participants: 100 occasions
- Revenue: 100 × ฿490 = ฿49,000
- Incremental: ฿14,000
- Point Cost: 100 × ฿300 = ฿30,000

### Question:
Is this monthly or total during campaign?
- If monthly: Revenue seems right
- Duration is not used - should this multiply by duration?

**Recommendation:** Add duration support for ongoing occasion campaigns

---

## 6. Minimum Purchase ✅ CORRECT
**Logic:** Customers spend more to reach minimum - looks correct

---

## 7. Time Based (Happy Hour) ⚠️ QUESTIONABLE LOGIC

**Example:** Happy Hour 3-6pm (3 hours, 25% participation)

### Current Calculation:
- hourlyParticipation = (3/24) × 0.25 = 0.03125 = **3.125%**
- Participants: 1,000 × 0.03125 × 1 = **31 transactions**

### Problem:
This formula doesn't reflect reality!
- If happy hour is 3 hours (12.5% of day) and 25% of customers participate
- Should be: Transactions during those 3 hours × participation rate

### Better Logic:
- Assuming even distribution: 1,000 trans/month ÷ 30 days = 33/day
- Happy hour transactions: 33 × (3/12 hours per business day) = 8.25 trans/day
- Campaign transactions: 8.25 × 30 days × 0.25 = 62 transactions
- OR: Just use participation % directly as "% who come during happy hour"

**Current formula is confusing and probably underestimates**

---

## 8. Frequency Reward ⚠️ BROKEN LOGIC

**Example:** Visit 5 times in 30 days, get 200฿ bonus

### Current Calculation:
- Achievers: (1,000 / 5) × 0.30 = 60 people
- Base Revenue: 1,000 × ฿350 × 1 = ฿350,000 (ALL monthly revenue!)
- Revenue with boost: ฿350,000 × 1.09 = ฿381,500
- Incremental: ฿31,500

### Problems:
1. Why divide transactions by required visits? This doesn't make sense
2. Base revenue is TOTAL store revenue, not program revenue
3. The boost is applied to ALL revenue, not just participants

### Correct Logic Should Be:
- Regular customers: Make 2-3 visits/month normally
- With 5-visit challenge: Participating customers increase to 5 visits
- Incremental visits from participants = additional revenue
- Example: 300 customers × 2 extra visits × ฿350 = incremental revenue

---

## Summary of Issues:

### CRITICAL (Fix Immediately):
1. ❌ **groupReward**: Revenue inflated 4X by multiplying participants by group size
2. ❌ **frequencyReward**: Wrong logic - using total store revenue instead of program revenue

### NEEDS REVIEW:
3. ⚠️ **timeBased**: Confusing formula that likely underestimates participation
4. ⚠️ **specialOccasion**: Missing duration support (should it be ongoing?)

### CORRECT:
5. ✅ pointMultiplier
6. ✅ spendingTier (after fix)
7. ✅ referral
8. ✅ minPurchase
