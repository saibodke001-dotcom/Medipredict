import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Wizard() {
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
      await axios.post('http://127.0.0.1:8000/predict', formData, {
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
