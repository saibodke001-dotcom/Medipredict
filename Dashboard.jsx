import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    axios.get('http://127.0.0.1:8000/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setHistory(res.data))
    .catch(() => navigate('/login'));
  }, [navigate]);

  const chartData = {
    labels: history.map((_, i) => `Assessment ${history.length - i}`).reverse(),
    datasets: [
      {
        label: 'Confidence (%)',
        data: history.map(h => h.confidence * 100).reverse(),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <button className="btn btn-primary" onClick={() => navigate('/wizard')}>New Assessment</button>
      </header>
      
      <div className="dashboard-grid">
        <div className="glass-panel chart-panel">
          <h3>Prediction Trend</h3>
          {history.length > 0 ? (
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : (
            <p>No assessments yet.</p>
          )}
        </div>
        
        <div className="glass-panel history-panel">
          <h3>Assessment History</h3>
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className={`history-item bg-${item.predicted_disease.toLowerCase().replace(' ', '-')}`}>
                <div className="history-info">
                  <strong>{item.predicted_disease}</strong>
                  <span>{(item.confidence * 100).toFixed(1)}% Confidence</span>
                </div>
                <small>{new Date(item.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
