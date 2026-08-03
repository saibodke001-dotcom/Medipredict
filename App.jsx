import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';

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
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wizard" element={<Wizard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
