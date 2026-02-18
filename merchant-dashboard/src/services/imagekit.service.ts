import { api } from './api';

/**
 * ImageKit service for client-side uploads
 */
export class ImageKitService {
    /**
     * Get authentication parameters from backend
     */
    static async getAuthParams(): Promise<{
        signature: string;
        expire: number;
        token: string;
    }> {
        const response = await api.get('/merchants/kyc/auth');
        return response.data;
    }

    /**
     * Upload file directly to ImageKit
     */
    static async uploadFile(file: File): Promise<{ url: string; fileId: string }> {
        const authParams = await this.getAuthParams();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('signature', authParams.signature);
        formData.append('expire', authParams.expire.toString());
        formData.append('token', authParams.token);
        formData.append('publicKey', 'public_4BIiXvUAWVr/Xofv+jcstrvng2o=');

        // Upload directly to ImageKit
        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to ImageKit');
        }

        const data = await response.json();
        return {
            url: data.url,
            fileId: data.fileId,
        };
    }

    /**
     * Upload profile picture
     */
    static async uploadProfilePicture(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<string> {
        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size must be less than 5MB');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }

        // Upload to ImageKit
        const { url } = await this.uploadFile(file);

        // Save URL to backend
        await api.patch('/merchants/profile/avatar', { imageUrl: url });

        return url;
    }
}
