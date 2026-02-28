export class PricingService {
    // Pricing Tiers (Standard Rates)
    private static readonly TIERS = [
        { min: 0, max: 49, fee: 0 },
        { min: 50, max: 499, fee: 5.9 },
        { min: 500, max: 999, fee: 9.9 },
        { min: 1000, max: 1499, fee: 14.9 },
        { min: 1500, max: 2499, fee: 19.9 },
        { min: 2500, max: 3499, fee: 24.9 },
        { min: 3500, max: 4999, fee: 29.9 },
        { min: 5000, max: 7499, fee: 39.9 },
        { min: 7500, max: 9999, fee: 44.9 },
        { min: 10000, max: 14999, fee: 49.9 },
        { min: 15000, max: 19999, fee: 54.9 },
        { min: 20000, max: 34999, fee: 79.9 },
        { min: 35000, max: 49999, fee: 104.9 },
        { min: 50000, max: 149999, fee: 129.9 },
        { min: 150000, max: 249999, fee: 159.9 },
        { min: 250000, max: 349999, fee: 194.9 },
        { min: 350000, max: 549999, fee: 229.9 },
        { min: 550000, max: 749999, fee: 274.9 },
        { min: 750000, max: 999999, fee: 319.9 },
    ];

    /**
     * Calculate transaction fee based on amount
     */
    static calculateFee(amount: number): number {
        const tier = this.TIERS.find(t => amount >= t.min && amount <= t.max);

        // If amount is above max defined tier, use the max tier fee (or define generic fallback)
        if (!tier) {
            if (amount > 999999) return 192.0; // Cap at highest known fee
            return 0;
        }

        return tier.fee;
    }

    static getTiers() {
        return this.TIERS;
    }
}
