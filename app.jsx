import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 🚀 DEPLOYMENT NOTE: Change this to your production backend URL before deploying!
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- Home Component ---
function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title">Advanced Medical Intelligence</h1>
        <p className="hero-subtitle">
          Empowering patients and doctors with real-time, multi-model disease prediction and historical tracking.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </header>

      <section className="features-grid">
        <div className="feature-card glass-panel">
          <Activity size={40} className="feature-icon text-blue" />
          <h3>Multiple AI Models</h3>
          <p>Ensemble models covering Cardiology, Endocrinology, and General Symptom checking with high accuracy.</p>
        </div>
        <div className="feature-card glass-panel">
          <ShieldCheck size={40} className="feature-icon text-green" />
          <h3>Secure Dashboards</h3>
          <p>Personalized dashboards for patients to track health history over time securely.</p>
        </div>
        <div className="feature-card glass-panel">
          <Zap size={40} className="feature-icon text-yellow" />
          <h3>Lightning Fast</h3>
          <p>Instantaneous diagnostic feedback powered by scalable FastAPI microservices.</p>
        </div>
      </section>
    </div>
  );
}

// --- Login Component ---
function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? 'register' : 'login';
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, formData);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary full-width">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>
        <p className="toggle-text">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span onClick={() => setIsRegister(!isRegister)} className="text-link">
            {isRegister ? 'Sign in' : 'Create one'}
          </span>
        </p>
      </div>
    </div>
  );
}

const diseaseAdvice = {
  'Healthy': 'Maintain your current lifestyle! Keep eating a balanced diet, exercising regularly, and getting enough sleep.',
  'Flu': 'Rest and hydrate. Consider over-the-counter flu medication. Wash your hands frequently and avoid close contact with others to prevent spreading it.',
  'Heart Disease Risk': 'Adopt a heart-healthy diet low in sodium and saturated fats. Engage in regular aerobic exercise, avoid smoking, and manage stress.',
  'Diabetes': 'Monitor your blood sugar levels. Focus on a diet high in fiber and low in refined carbohydrates. Regular physical activity helps improve insulin sensitivity.'
};

// --- Dashboard Component ---
function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get(`${API_BASE_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setHistory(res.data))
    .catch(() => navigate('/login'));
  }, [navigate]);

  const chartData = {
    labels: history.map((_, i) => `Assmt ${history.length - i}`).reverse(),
    datasets: [
      {
        label: 'Confidence (%)',
        data: history.map(h => h.confidence * 100).reverse(),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#f8fafc' } }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <button className="btn btn-primary" onClick={() => navigate('/wizard')}>New Assessment</button>
      </header>
      
      <div className="dashboard-grid">
        <div className="glass-panel chart-panel" style={{ position: 'relative' }}>
          <h3>Prediction Trend</h3>
          {history.length > 0 ? (
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p>No assessments yet.</p>
          )}
        </div>
        
        <div className="glass-panel history-panel">
          <h3>Assessment History</h3>
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className={`history-item bg-${item.predicted_disease.toLowerCase().replace(/ /g, '-')}`}>
                <div className="history-info">
                  <strong>{item.predicted_disease}</strong>
                  <span>{(item.confidence * 100).toFixed(1)}% Confidence</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0', lineHeight: '1.4' }}>
                  💡 <strong>Prevention & Advice:</strong> {diseaseAdvice[item.predicted_disease] || 'Consult a healthcare professional for specific advice.'}
                </p>
                <small>{new Date(item.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Wizard Component ---
function Wizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 45, gender: 0, blood_pressure: 120, blood_sugar: 95, heart_rate: 72, bmi: 24.5,
    fever: 0, cough: 0, headache: 0, body_pain: 0, chest_pain: 0, frequent_urination: 0
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Prediction failed. Make sure you are logged in.');
    }
  };

  return (
    <div className="wizard-container">
      <div className="glass-panel wizard-card">
        <div className="wizard-header">
          <h2>Diagnostic Assessment</h2>
          <span className="step-indicator">Step {step} of 3</span>
        </div>

        {step === 1 && (
          <div className="wizard-step">
            <h3>Basic Vitals</h3>
            <div className="input-group"><label>Age</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: +e.target.value})} /></div>
            <div className="input-group">
              <label>Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: +e.target.value})}>
                <option value={0}>Female</option>
                <option value={1}>Male</option>
              </select>
            </div>
            <div className="input-group"><label>BMI</label><input type="number" step="0.1" value={formData.bmi} onChange={e => setFormData({...formData, bmi: +e.target.value})} /></div>
            <button className="btn btn-primary full-width mt-4" onClick={nextStep}>Next: Cardiovascular</button>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h3>Cardiovascular & Metabolic</h3>
            <div className="input-group"><label>Blood Pressure (Systolic)</label><input type="number" value={formData.blood_pressure} onChange={e => setFormData({...formData, blood_pressure: +e.target.value})} /></div>
            <div className="input-group"><label>Fasting Blood Sugar</label><input type="number" value={formData.blood_sugar} onChange={e => setFormData({...formData, blood_sugar: +e.target.value})} /></div>
            <div className="input-group"><label>Heart Rate (bpm)</label><input type="number" value={formData.heart_rate} onChange={e => setFormData({...formData, heart_rate: +e.target.value})} /></div>
            <div className="button-row mt-4">
              <button className="btn btn-secondary" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Next: Symptoms</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h3>Current Symptoms</h3>
            <div className="checkbox-grid">
              {['fever', 'cough', 'headache', 'body_pain', 'chest_pain', 'frequent_urination'].map(sym => (
                <label key={sym} className="checkbox-label">
                  <input type="checkbox" checked={formData[sym]} onChange={e => setFormData({...formData, [sym]: e.target.checked ? 1 : 0})} /> 
                  {sym.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              ))}
            </div>
            <div className="button-row mt-4">
              <button className="btn btn-secondary" onClick={prevStep}>Back</button>
              <button className="btn btn-success" onClick={handleSubmit}>Analyze Data</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- About Component ---
function About() {
  return (
    <div className="about-container" style={{ maxWidth: '1000px', margin: 'auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h2 className="hero-title" style={{ fontSize: '3rem' }}>How MediPredict Works</h2>
        <p className="hero-subtitle">Bringing the power of Machine Learning to early medical diagnostics.</p>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#3b82f6', fontSize: '1.5rem', textAlign: 'center' }}>⚙️ The Process</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h4>1. Input Data</h4>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.5rem' }}>You enter your vital signs and symptoms into our secure multi-step assessment wizard.</p>
          </div>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
            <h4>2. AI Analysis</h4>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.5rem' }}>Our state-of-the-art Random Forest Machine Learning model processes your data against historical patterns.</p>
          </div>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h4>3. Instant Results</h4>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.5rem' }}>Receive an immediate diagnostic risk assessment along with personalized preventative lifestyle advice.</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#10b981', fontSize: '1.5rem' }}>🌟 Why is this helpful?</h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.05rem', lineHeight: '1.8' }}>
          <li>✓ <strong>Early Detection:</strong> Identify potential risks for diabetes or heart disease before severe symptoms appear.</li>
          <li>✓ <strong>Continuous Tracking:</strong> Your dashboard logs historical data to track your health trends over time via dynamic charts.</li>
          <li>✓ <strong>Accessibility:</strong> Get instantaneous preliminary insights from anywhere without waiting for an appointment.</li>
        </ul>
      </section>

      <section>
        <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>What our users say</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
            <p style={{ fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.95rem', color: '#e2e8f0' }}>"Incredible tool! It correctly identified my flu symptoms and told me exactly how to manage it before seeing a doctor."</p>
            <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>- Sarah J.</strong>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
            <p style={{ fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.95rem', color: '#e2e8f0' }}>"The dashboard trend tracking is brilliant. I've been monitoring my heart disease risk over the last 3 months effortlessly."</p>
            <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>- Mark T.</strong>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
            <p style={{ fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.95rem', color: '#e2e8f0' }}>"Fast, accurate, and totally secure. The preventative advice feature is my absolute favorite part!"</p>
            <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>- Elena R.</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="navbar glass-panel">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <Activity color="#3b82f6" size={28} />
          <span>MediPredict AI</span>
        </div>
        <div className="nav-links">
          <Link to="/about" className="nav-link">About</Link>
          {localStorage.getItem('token') ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/wizard" className="nav-link primary-link">New Assessment</Link>
              <button onClick={handleLogout} className="nav-link btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link primary-link">Sign In</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wizard" element={<Wizard />} />
        </Routes>
      </main>
    </div>
  );
}

// --- Render ---
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
