import { ChannelModel, ChannelType } from './channel.model';
import mongoose from 'mongoose';
import { AppError, ErrorCode } from '../../common/constants/errors';

export class ChannelService {
    /**
     * List all channels for a merchant
     */
    static async listChannels(merchantId: string) {
        return ChannelModel.find({
            merchantId: new mongoose.Types.ObjectId(merchantId)
        }).sort({ createdAt: -1 });
    }

    /**
     * Create a new payment channel
     */
    static async createChannel(
        merchantId: string,
        data: {
            name: string;
            type: ChannelType;
            number: string;
            bankName?: string;
            accountNumber?: string;
        }
    ) {
        // Check for duplicate channel numbers for this merchant
        const existing = await ChannelModel.findOne({
            merchantId: new mongoose.Types.ObjectId(merchantId),
            type: data.type,
            number: data.number,
        });

        if (existing) {
            throw new AppError(ErrorCode.VALIDATION_ERROR, 'Channel number already exists for this type', 400);
        }

        // Generate a unique alias (e.g. PAYL-XXXXXX)
        const generateAlias = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0, O, 1, I
            let result = 'PAYL-';
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        let alias = generateAlias();
        let isUnique = false;
        while (!isUnique) {
            const exists = await ChannelModel.findOne({ alias });
            if (!exists) {
                isUnique = true;
            } else {
                alias = generateAlias();
            }
        }

        return ChannelModel.create({
            merchantId: new mongoose.Types.ObjectId(merchantId),
            ...data,
            alias
        });
    }

    /**
     * Delete a channel
     */
    static async deleteChannel(merchantId: string, channelId: string) {
        const channel = await ChannelModel.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(channelId),
            merchantId: new mongoose.Types.ObjectId(merchantId),
        });

        if (!channel) {
            throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Channel not found', 404);
        }

        return channel;
    }

    /**
     * Update channel details
     */
    static async updateChannel(
        merchantId: string,
        channelId: string,
        data: { name?: string; status?: string }
    ) {
        const channel = await ChannelModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(channelId),
                merchantId: new mongoose.Types.ObjectId(merchantId)
            },
            { $set: data },
            { new: true }
        );

        if (!channel) {
            throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Channel not found', 404);
        }

        return channel;
    }
}

/* cspell:ignore PAYL ABCDEFGHJKLMNPQRSTUVWXYZ */
