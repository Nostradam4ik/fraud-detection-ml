import { useState, useEffect } from 'react';
import { getModelInfo, getFeatureImportance } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Brain,
  Database,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';

function ModelInfo() {
  const [modelInfo, setModelInfo] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, featureData] = await Promise.all([
          getModelInfo(),
          getFeatureImportance(),
        ]);
        setModelInfo(info);
        setFeatures(featureData);
      } catch (err) {
        setError('Failed to load model information. Make sure the model is trained.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-danger-800">Error Loading Model Info</h3>
            <p className="text-sm text-danger-600 mt-1">{error}</p>
            <p className="text-sm text-danger-600 mt-2">
              Run <code className="bg-danger-100 px-1 rounded">python ml/train.py</code> to train the model.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare feature importance data for chart
  const featureData = features
    ? Object.entries(features)
        .map(([name, importance]) => ({ name, importance }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10)
    : [];

  const metrics = [
    { label: 'Accuracy', value: modelInfo?.accuracy, icon: Target, color: 'text-primary-600' },
    { label: 'Precision', value: modelInfo?.precision, icon: Award, color: 'text-success-600' },
    { label: 'Recall', value: modelInfo?.recall, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'F1 Score', value: modelInfo?.f1_score, icon: Brain, color: 'text-orange-600' },
    { label: 'ROC-AUC', value: modelInfo?.roc_auc, icon: Database, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Model Information</h2>
        <p className="text-gray-500 mt-1">
          Details about the fraud detection machine learning model
        </p>
      </div>

      {/* Model Overview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {modelInfo?.model_name || 'Random Forest Classifier'}
              </h3>
              <p className="text-sm text-gray-500">Version {modelInfo?.model_version || '1.0.0'}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Training Samples</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelInfo?.training_samples?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fraud Samples</p>
              <p className="text-2xl font-bold text-danger-600">
                {modelInfo?.fraud_samples?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Features</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelInfo?.features_count || 30}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <metric.icon className={`w-6 h-6 ${metric.color} mx-auto mb-2`} />
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {metric.value ? (metric.value * 100).toFixed(1) + '%' : 'N/A'}
                </p>
              </div>
            ))}
          </div>

          {/* Metrics Explanation */}
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-2">Understanding the Metrics</h4>
            <ul className="text-sm text-primary-800 space-y-1">
              <li><strong>Accuracy:</strong> Overall correctness of predictions</li>
              <li><strong>Precision:</strong> Of predicted frauds, how many are actually fraud</li>
              <li><strong>Recall:</strong> Of actual frauds, how many did we catch</li>
              <li><strong>F1 Score:</strong> Balance between precision and recall</li>
              <li><strong>ROC-AUC:</strong> Model's ability to distinguish between classes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Feature Importance</h3>
          <p className="text-sm text-gray-500 mt-1">
            Features with highest influence on fraud detection
          </p>
        </div>

        <div className="p-6">
          {featureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={featureData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 'auto']} />
                <YAxis dataKey="name" type="category" width={50} />
                <Tooltip
                  formatter={(value) => [(value * 100).toFixed(2) + '%', 'Importance']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index < 3 ? '#3b82f6' : '#93c5fd'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Feature importance data not available</p>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Dataset Information</h3>
        </div>

        <div className="p-6">
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              This model is trained on the{' '}
              <a
                href="https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                Credit Card Fraud Detection
              </a>{' '}
              dataset from Kaggle.
            </p>
            <ul className="mt-4 space-y-2">
              <li>284,807 total transactions</li>
              <li>492 fraudulent transactions (0.17%)</li>
              <li>Features V1-V28 are PCA-transformed (anonymized)</li>
              <li>Time and Amount are original features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelInfo;
