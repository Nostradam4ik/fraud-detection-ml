import { useState, useEffect } from 'react';
import { getStats } from '../services/api';
import StatsChart from './StatsChart';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

function Dashboard({ history }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Predictions',
      value: stats?.total_predictions || 0,
      icon: Activity,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Fraud Detected',
      value: stats?.fraud_detected || 0,
      icon: AlertTriangle,
      color: 'bg-danger-500',
      bgColor: 'bg-danger-50',
    },
    {
      title: 'Legitimate',
      value: stats?.legitimate_detected || 0,
      icon: CheckCircle,
      color: 'bg-success-500',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Avg Response Time',
      value: `${stats?.average_response_time_ms?.toFixed(1) || 0}ms`,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  // Calculate fraud rate for display
  const fraudRate = stats?.fraud_rate ? (stats.fraud_rate * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Real-time fraud detection analytics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            Fraud Rate: <span className={fraudRate > 1 ? 'text-danger-600' : 'text-success-600'}>{fraudRate}%</span>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl p-6 border border-gray-200 card-hover"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              {loading && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Prediction Distribution</h3>
          </div>
          <StatsChart
            fraudCount={stats?.fraud_detected || 0}
            legitimateCount={stats?.legitimate_detected || 0}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <span className="text-sm text-gray-500">{history.length} predictions</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No predictions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Go to Analyzer to make your first prediction
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.result.is_fraud ? 'bg-danger-50' : 'bg-success-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.result.is_fraud ? (
                      <AlertTriangle className="w-5 h-5 text-danger-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.result.is_fraud ? 'Fraud Detected' : 'Legitimate'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Risk: {item.result.risk_score}% • {item.result.prediction_time_ms}ms
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="status-dot online" />
            <div>
              <p className="text-sm font-medium text-gray-900">API Status</p>
              <p className="text-xs text-gray-500">Healthy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Uptime</p>
              <p className="text-xs text-gray-500">
                {stats?.uptime_seconds
                  ? `${Math.floor(stats.uptime_seconds / 60)}m ${Math.floor(stats.uptime_seconds % 60)}s`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Model</p>
              <p className="text-xs text-gray-500">Random Forest v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
