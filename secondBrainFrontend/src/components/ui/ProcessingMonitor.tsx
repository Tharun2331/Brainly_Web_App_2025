// src/components/ui/ProcessingMonitor.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface ProcessingStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
  queueSize: number;
  isProcessing: boolean;
}

interface FailedContent {
  _id: string;
  title: string;
  type: string;
  processingError?: string;
}

export function ProcessingMonitor({ token }: { token: string }) {
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [failedContent, setFailedContent] = useState<FailedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStats();
    fetchFailedContent();

    // Auto-refresh every 10 seconds if queue is active
    const interval = setInterval(() => {
      if (stats?.queueSize && stats.queueSize > 0) {
        fetchStats();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [token, stats?.queueSize]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/processing/stats`, {
        headers: { Authorization: token }
      });
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const fetchFailedContent = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/content/failed`, {
        headers: { Authorization: token },
        params: { limit: 10 }
      });
      setFailedContent(response.data.data.failed || []);
    } catch (error) {
      console.error('Failed to fetch failed content:', error);
    }
  };

  const handleReprocess = async (contentId: string) => {
    setReprocessing(prev => new Set(prev).add(contentId));

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/content/${contentId}/reprocess`,
        {},
        { headers: { Authorization: token } }
      );

      // Refresh data
      await fetchStats();
      await fetchFailedContent();

      // Remove from reprocessing set after a delay
      setTimeout(() => {
        setReprocessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Reprocess failed:', error);
      setReprocessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    }
  };

  const handleBatchReprocess = async () => {
    if (failedContent.length === 0) return;

    const contentIds = failedContent.map(c => c._id);

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/content/reprocess/batch`,
        { contentIds },
        { headers: { Authorization: token } }
      );

      await fetchStats();
      await fetchFailedContent();
    } catch (error) {
      console.error('Batch reprocess failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  // Don't show if everything is completed
  if (stats.pending === 0 && stats.processing === 0 && stats.failed === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Content Processing</h3>
        <button
          onClick={fetchStats}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Completed */}
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div>
            <div className="text-xs text-muted-foreground">Completed</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
          </div>
        </div>

        {/* Processing */}
        {stats.processing > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <div className="text-xs text-muted-foreground">Processing</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {stats.processing}
              </div>
            </div>
          </div>
        )}

        {/* Pending */}
        {stats.pending > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <div>
              <div className="text-xs text-muted-foreground">Pending</div>
              <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {stats.pending}
              </div>
            </div>
          </div>
        )}

        {/* Failed */}
        {stats.failed > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <div>
              <div className="text-xs text-muted-foreground">Failed</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {stats.failed}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Queue Status */}
      {stats.queueSize > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Queue Size:</span>
            <span className="text-sm font-medium text-foreground">{stats.queueSize} items</span>
          </div>
        </div>
      )}

      {/* Failed Content List */}
      {failedContent.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">Failed Items</h4>
            {failedContent.length > 1 && (
              <button
                onClick={handleBatchReprocess}
                className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Retry All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {failedContent.map((content) => (
              <div
                key={content._id}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {content.title || 'Untitled'}
                  </div>
                  {content.processingError && (
                    <div className="text-xs text-red-600 dark:text-red-400 truncate">
                      {content.processingError}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground capitalize">
                    {content.type}
                  </div>
                </div>

                <button
                  onClick={() => handleReprocess(content._id)}
                  disabled={reprocessing.has(content._id)}
                  className="ml-2 p-2 hover:bg-background rounded transition-colors disabled:opacity-50"
                  aria-label="Retry"
                >
                  {reprocessing.has(content._id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}