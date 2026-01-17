import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineSync } from '@/lib/offlineSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { status, pendingCount, processSyncQueue } = useOfflineSync();

  if (status === 'online' && pendingCount === 0) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'synced':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return pendingCount > 0 ? <RefreshCw className="h-4 w-4" /> : null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'offline':
        return t('offline.youAreOffline');
      case 'syncing':
        return t('offline.syncPending');
      case 'synced':
        return t('offline.syncComplete');
      case 'error':
        return t('offline.syncFailed');
      default:
        return pendingCount > 0 ? `${pendingCount} ${t('offline.syncPending').toLowerCase()}` : '';
    }
  };

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'offline':
        return 'destructive';
      case 'syncing':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'synced':
        return 'outline';
      default:
        return pendingCount > 0 ? 'secondary' : 'outline';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <Badge 
        variant={getStatusVariant()} 
        className="flex items-center gap-2 px-3 py-1.5 shadow-lg"
      >
        {getStatusIcon()}
        <span className="text-sm">{getStatusText()}</span>
      </Badge>
      
      {(status === 'online' || status === 'error') && pendingCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => processSyncQueue()}
          className="shadow-lg"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
};

export default OfflineIndicator;
