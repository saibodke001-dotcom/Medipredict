document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = form.querySelector('.btn-text');
    const spinner = document.getElementById('loading-spinner');
    
    const resultCard = document.getElementById('result-card');
    const predIcon = document.getElementById('pred-icon');
    const predText = document.getElementById('pred-text');
    const confBar = document.getElementById('conf-bar');
    const confValue = document.getElementById('conf-value');

    // API Endpoint
    const API_URL = 'http://127.0.0.1:8000/predict';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI Loading State
        btnText.textContent = 'Analyzing...';
        spinner.classList.remove('hidden');
        analyzeBtn.disabled = true;
        resultCard.classList.add('hidden');
        
        // Reset confidence bar animation
        confBar.style.width = '0%';

        // Gather Data
        const formData = new FormData(form);
        const data = {
            age: parseInt(formData.get('age')),
            gender: parseInt(formData.get('gender')),
            blood_pressure: parseInt(formData.get('blood_pressure')),
            blood_sugar: parseInt(formData.get('blood_sugar')),
            heart_rate: parseInt(formData.get('heart_rate')),
            bmi: parseFloat(formData.get('bmi')),
            
            // Checkboxes
            fever: formData.get('fever') ? 1 : 0,
            cough: formData.get('cough') ? 1 : 0,
            headache: formData.get('headache') ? 1 : 0,
            body_pain: formData.get('body_pain') ? 1 : 0,
            chest_pain: formData.get('chest_pain') ? 1 : 0,
            frequent_urination: formData.get('frequent_urination') ? 1 : 0
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to get prediction from server.');
            }

            const result = await response.json();
            displayResult(result);

        } catch (error) {
            console.error(error);
            alert('Error connecting to the Prediction API. Make sure the backend is running.');
        } finally {
            // Restore UI
            btnText.textContent = 'Analyze Patient Data';
            spinner.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    });

    function displayResult(result) {
        const { prediction_id, prediction_label, confidence } = result;
        const confPercent = Math.round(confidence * 100);

        // Update Text
        predText.textContent = prediction_label;
        confValue.textContent = confPercent;

        // Update Styles based on prediction
        predText.className = 'prediction-text'; // reset
        confBar.className = 'confidence-bar'; // reset

        let icon = '⚕️';
        if (prediction_id === 0) {
            icon = '✅';
            predText.classList.add('status-healthy');
            confBar.classList.add('bg-healthy');
        } else if (prediction_id === 1) {
            icon = '🤒';
            predText.classList.add('status-flu');
            confBar.classList.add('bg-flu');
        } else if (prediction_id === 2) {
            icon = '❤️‍🩹';
            predText.classList.add('status-heart');
            confBar.classList.add('bg-heart');
        } else if (prediction_id === 3) {
            icon = '🩸';
            predText.classList.add('status-diabetes');
            confBar.classList.add('bg-diabetes');
        }
        
        predIcon.textContent = icon;

        // Show Card
        resultCard.classList.remove('hidden');

        // Trigger animation for confidence bar
        setTimeout(() => {
            confBar.style.width = `${confPercent}%`;
        }, 100);
    }
});
