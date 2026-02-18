export class PricingService {
    // Pricing Tiers (40% Discounted Rates)
    private static readonly TIERS = [
        { min: 0, max: 49, fee: 0 },
        { min: 50, max: 499, fee: 3.6 },
        { min: 500, max: 999, fee: 6.0 },
        { min: 1000, max: 1499, fee: 9.0 },
        { min: 1500, max: 2499, fee: 12.0 },
        { min: 2500, max: 3499, fee: 15.0 },
        { min: 3500, max: 4999, fee: 18.0 },
        { min: 5000, max: 7499, fee: 24.0 },
        { min: 7500, max: 9999, fee: 27.0 },
        { min: 10000, max: 14999, fee: 30.0 },
        { min: 15000, max: 19999, fee: 33.0 },
        { min: 20000, max: 34999, fee: 48.0 },
        { min: 35000, max: 49999, fee: 63.0 },
        { min: 50000, max: 149999, fee: 78.0 },
        { min: 150000, max: 249999, fee: 96.0 },
        { min: 250000, max: 349999, fee: 117.0 },
        { min: 350000, max: 549999, fee: 138.0 },
        { min: 550000, max: 749999, fee: 165.0 },
        { min: 750000, max: 999999, fee: 192.0 },
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
