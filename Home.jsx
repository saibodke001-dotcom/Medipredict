import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
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
