import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import PredictionResult from './components/PredictionResult';
import TransactionHistory from './components/TransactionHistory';
import ModelInfo from './components/ModelInfo';
import Login from './components/Login';
import { checkHealth, getMe, logout, isAuthenticated } from './services/api';
import { Shield, AlertTriangle, Activity, LogOut, User } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const health = await checkHealth();
        setApiStatus(health.model_loaded ? 'online' : 'no-model');
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadUser();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false);
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  const handlePrediction = (result, transaction) => {
    setPrediction(result);
    setHistory(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      transaction,
      result,
    }, ...prev].slice(0, 50));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'predict', label: 'Analyzer', icon: Shield },
    { id: 'model', label: 'Model Info', icon: AlertTriangle },
  ];

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fraud Detection</h1>
                <p className="text-xs text-gray-500">ML-Powered Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`status-dot ${apiStatus === 'online' ? 'online' : 'offline'}`} />
                <span className="text-sm text-gray-600">
                  {apiStatus === 'online' && 'API Online'}
                  {apiStatus === 'offline' && 'API Offline'}
                  {apiStatus === 'no-model' && 'Model Not Loaded'}
                  {apiStatus === 'checking' && 'Checking...'}
                </span>
              </div>

              {/* User menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.full_name || user?.username || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard history={history} />
        )}

        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <TransactionForm
                onPrediction={handlePrediction}
                apiStatus={apiStatus}
              />
            </div>
            <div className="space-y-6">
              <PredictionResult prediction={prediction} />
              <TransactionHistory history={history} />
            </div>
          </div>
        )}

        {activeTab === 'model' && (
          <ModelInfo />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Built with FastAPI, scikit-learn, and React
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/docs"
                target="_blank"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                API Documentation
              </a>
              <a
                href="https://github.com/Nostradam4ik/fraud-detection-ml"
                target="_blank"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
