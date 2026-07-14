const axios = require('axios');

/**
 * Discord 通知服务
 * 通过 Discord Webhook 发送通知消息
 * 与 Telegram 不同，Discord Webhook URL 已包含鉴权信息，
 * 因此配置以「每个渠道的 webhook_url」形式保存，无需额外的全局 Token。
 */
class DiscordService {
    constructor() {
        this.client = axios.create({
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * 校验 Webhook URL 是否为合法的 Discord Webhook 地址
     * @param {string} webhookUrl - Discord Webhook URL
     * @returns {boolean} 是否合法
     */
    isValidWebhookUrl(webhookUrl) {
        if (!webhookUrl || typeof webhookUrl !== 'string') {
            return false;
        }
        try {
            const url = new URL(webhookUrl);
            const isHttps = url.protocol === 'https:';
            const isDiscordHost = /(^|\.)discord(app)?\.com$/.test(url.hostname);
            const isWebhookPath = url.pathname.startsWith('/api/webhooks/');
            return isHttps && isDiscordHost && isWebhookPath;
        } catch {
            return false;
        }
    }

    /**
     * 发送 Discord 消息
     * @param {string} webhookUrl - Discord Webhook URL
     * @param {string} content - 消息内容（Discord Markdown，最大 2000 字符）
     * @param {Object} options - 额外的发送选项
     * @returns {Promise<Object>} 发送结果
     */
    async sendMessage(webhookUrl, content, options = {}) {
        try {
            if (!this.isValidWebhookUrl(webhookUrl)) {
                throw new Error('Invalid Discord webhook URL');
            }

            if (!content) {
                throw new Error('Message content is required');
            }

            // Discord 单条消息内容上限为 2000 字符
            const truncatedContent = content.length > 2000
                ? `${content.slice(0, 1997)}...`
                : content;

            const response = await this.client.post(webhookUrl, {
                content: truncatedContent,
                ...options
            });

            return {
                success: true,
                statusCode: response.status,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Discord notification failed:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * 发送测试消息
     * @param {string} webhookUrl - Discord Webhook URL
     * @returns {Promise<Object>} 发送结果
     */
    async sendTestMessage(webhookUrl) {
        const testMessage = `🔔 **Subscription Manager Test Message**

This is a test message from Subscription Manager.

If you received this message, your Discord notification is configured correctly!

⏰ Sent at: ${new Date().toISOString()}`;

        return await this.sendMessage(webhookUrl, testMessage);
    }
}

module.exports = DiscordService;
