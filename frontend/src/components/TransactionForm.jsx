import { useState } from 'react';
import { predictFraud, getSampleLegitimate, getSampleFraud } from '../services/api';
import { Send, RefreshCw, Zap, AlertCircle } from 'lucide-react';

function TransactionForm({ onPrediction, apiStatus }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    time: 0,
    amount: 100,
    v1: 0, v2: 0, v3: 0, v4: 0, v5: 0,
    v6: 0, v7: 0, v8: 0, v9: 0, v10: 0,
    v11: 0, v12: 0, v13: 0, v14: 0, v15: 0,
    v16: 0, v17: 0, v18: 0, v19: 0, v20: 0,
    v21: 0, v22: 0, v23: 0, v24: 0, v25: 0,
    v26: 0, v27: 0, v28: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (apiStatus !== 'online') {
      setError('API is not available. Please check the connection.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await predictFraud(formData);
      onPrediction(result, formData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = async (type) => {
    setLoading(true);
    setError(null);

    try {
      const sample = type === 'fraud'
        ? await getSampleFraud()
        : await getSampleLegitimate();
      setFormData(sample);
    } catch (err) {
      setError('Failed to load sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const vFields = Array.from({ length: 28 }, (_, i) => `v${i + 1}`);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Transaction Analyzer</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter transaction details or load a sample
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-b border-gray-100 flex gap-3">
        <button
          onClick={() => loadSample('legitimate')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          Load Legitimate Sample
        </button>
        <button
          onClick={() => loadSample('fraud')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-danger-50 text-danger-700 rounded-lg hover:bg-danger-100 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <AlertCircle className="w-4 h-4" />
          Load Fraud Sample
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Main Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time (seconds)
            </label>
            <input
              type="number"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="any"
              min="0"
            />
          </div>
        </div>

        {/* V Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            PCA Features (V1-V28)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {vFields.map((field) => (
              <div key={field} className="relative">
                <label className="absolute -top-1 left-2 text-[10px] text-gray-400 bg-gray-50 px-1">
                  {field.toUpperCase()}
                </label>
                <input
                  type="number"
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-full px-2 py-1.5 pt-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  step="any"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * PCA-transformed features from the original dataset (anonymized for privacy)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || apiStatus !== 'online'}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze Transaction
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
