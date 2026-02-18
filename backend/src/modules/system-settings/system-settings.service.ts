import { SystemSettingModel } from './system-settings.model';

export const PLATFORM_CHANNEL_KEY = 'PLATFORM_PAYMENT_CHANNEL';

export interface PlatformChannelConfig {
    type: 'PAYBILL' | 'TILL';
    number: string;
    accountNumber?: string; // For Bank Paybills
}

export class SystemSettingsService {
    static async getSetting(key: string) {
        const setting = await SystemSettingModel.findOne({ key });
        return setting ? setting.value : null;
    }

    static async setSetting(key: string, value: any, userId?: string) {
        return await SystemSettingModel.findOneAndUpdate(
            { key },
            { key, value, updatedBy: userId },
            { upsert: true, new: true }
        );
    }

    static async getPlatformChannel(): Promise<PlatformChannelConfig | null> {
        return await this.getSetting(PLATFORM_CHANNEL_KEY);
    }
}
