import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Loader2, Send, Save, Settings, Check, X } from 'lucide-react';
import { notificationApi } from '@/services/notificationApi';
import { useToast } from '@/hooks/use-toast';
import { useNotificationStore } from '@/store/notificationStore';

interface DiscordConfigProps {
  onConfigChange?: () => void;
}

interface DiscordChannelConfig {
  webhook_url: string;
}

interface ConfigResponse {
  config?: DiscordChannelConfig;
  is_active?: boolean;
}

const discordWebhookRegex = /^https:\/\/(.*\.)?discord(app)?\.com\/api\/webhooks\/.+/;

export const DiscordConfig: React.FC<DiscordConfigProps> = ({ onConfigChange }) => {
  const { t } = useTranslation('notification');
  const { toast } = useToast();

  const {
    channelConfigs,
    setDiscordConfig,
    setChannelValidated
  } = useNotificationStore();

  const [webhookUrl, setWebhookUrl] = useState(channelConfigs.discord?.webhook_url || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const isWebhookValid = useMemo(() => discordWebhookRegex.test(webhookUrl.trim()), [webhookUrl]);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getChannelConfig('discord');
      const configResponse = response as unknown as ConfigResponse;
      const configUrl = configResponse?.config?.webhook_url || '';

      setWebhookUrl(configUrl);
      setIsActive(Boolean(configResponse?.is_active));

      if (configUrl) {
        setDiscordConfig({ webhook_url: configUrl, validated: true });
        setChannelValidated('discord', true);
      }
    } catch {
      // 404 indicates channel not yet configured; keep local state
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  }, [setDiscordConfig, setChannelValidated]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleWebhookChange = (value: string) => {
    setWebhookUrl(value);
    const valid = discordWebhookRegex.test(value.trim());
    setDiscordConfig({ webhook_url: value, validated: valid });
    setChannelValidated('discord', valid);
  };

  const handleSave = async () => {
    const trimmedUrl = webhookUrl.trim();
    if (!discordWebhookRegex.test(trimmedUrl)) {
      toast({
        title: t('errors.invalidDiscordWebhook'),
        description: t('discordConfig.help'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await notificationApi.configureChannel('discord', { webhook_url: trimmedUrl });
      toast({
        title: t('discordConfig.saved'),
        description: t('channelConfigured')
      });
      await loadConfig();
      onConfigChange?.();
    } catch (error) {
      console.error('Failed to save Discord config:', error);
      toast({
        title: t('discordConfig.saveError'),
        description: t('errors.configSaveFailed'),
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const trimmedUrl = webhookUrl.trim();
    if (!discordWebhookRegex.test(trimmedUrl)) {
      toast({
        title: t('errors.invalidDiscordWebhook'),
        description: t('discordConfig.help'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setTesting(true);
      await notificationApi.testNotification('discord');
      toast({
        title: t('testSuccess'),
        description: t('testSuccess')
      });
    } catch (error) {
      console.error('Failed to send test Discord message:', error);
      toast({
        title: t('testFailed'),
        description: t('errors.sendFailed'),
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const renderStatusBadge = () => {
    if (!webhookUrl) {
      return <Badge variant="secondary">{t('channelNotConfigured')}</Badge>;
    }

    if (isWebhookValid) {
      return <Badge variant="default" className="bg-green-500">{t('configured')}</Badge>;
    }

    return <Badge variant="destructive">{t('errors.invalidDiscordWebhook')}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('discord')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <span>{t('discordConfig.active')}</span>
              {renderStatusBadge()}
            </AlertDescription>
          </Alert>
        )}

        {!isWebhookValid && webhookUrl && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{t('errors.invalidDiscordWebhook')}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="discord-webhook">{t('discordConfig.webhookUrl')}</Label>
          <Input
            id="discord-webhook"
            type="url"
            value={webhookUrl}
            placeholder="https://discord.com/api/webhooks/..."
            onChange={(event) => handleWebhookChange(event.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {t('discordConfig.help')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving || !isWebhookValid}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('save')}
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!isWebhookValid || testing}
            className="flex items-center gap-2"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t('test')}
          </Button>
        </div>

        {isWebhookValid && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>{t('discordConfig.valid')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscordConfig;
