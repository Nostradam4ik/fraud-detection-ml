import { Shield, AlertTriangle, CheckCircle, Clock, Gauge } from 'lucide-react';

function PredictionResult({ prediction }) {
  if (!prediction) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Prediction Yet</h3>
          <p className="text-sm text-gray-500 mt-2">
            Enter transaction details and click Analyze to see results
          </p>
        </div>
      </div>
    );
  }

  const isFraud = prediction.is_fraud;
  const riskScore = prediction.risk_score;

  // Determine risk level color
  const getRiskColor = (score) => {
    if (score < 30) return 'text-success-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-danger-600';
  };

  const getRiskBg = (score) => {
    if (score < 30) return 'bg-success-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-danger-500';
  };

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden ${
      isFraud ? 'border-danger-300' : 'border-success-300'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 ${isFraud ? 'bg-danger-50' : 'bg-success-50'}`}>
        <div className="flex items-center gap-3">
          {isFraud ? (
            <AlertTriangle className="w-8 h-8 text-danger-600" />
          ) : (
            <CheckCircle className="w-8 h-8 text-success-600" />
          )}
          <div>
            <h3 className={`text-xl font-bold ${isFraud ? 'text-danger-700' : 'text-success-700'}`}>
              {isFraud ? 'Fraud Detected!' : 'Transaction Legitimate'}
            </h3>
            <p className={`text-sm ${isFraud ? 'text-danger-600' : 'text-success-600'}`}>
              Confidence: {prediction.confidence.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-6">
        {/* Risk Score Gauge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Risk Score
            </span>
            <span className={`text-2xl font-bold ${getRiskColor(riskScore)}`}>
              {riskScore}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getRiskBg(riskScore)} transition-all duration-500`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Low Risk</span>
            <span>Medium</span>
            <span>High Risk</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Fraud Probability</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {(prediction.fraud_probability * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Response Time
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {prediction.prediction_time_ms.toFixed(1)}ms
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-4 rounded-lg ${isFraud ? 'bg-danger-50' : 'bg-success-50'}`}>
          <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
          <p className={`text-sm ${isFraud ? 'text-danger-700' : 'text-success-700'}`}>
            {isFraud
              ? 'This transaction shows suspicious patterns. Recommend blocking and further investigation.'
              : 'This transaction appears normal. No action required.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default PredictionResult;
