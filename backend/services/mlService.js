const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Communicates with the Python FastAPI Machine Learning Service
 * to calculate Diabetes Risk using the trained Random Forest Classifier.
 *
 * @param {Object} metrics - Clinical biometric parameters
 * @returns {Promise<Object>} ML prediction result JSON
 */
const predictDiabetesRisk = async (metrics) => {
  const payload = {
    pregnancies: Number(metrics.pregnancies) || 0,
    glucose: Number(metrics.glucose) || 120.0,
    blood_pressure: Number(metrics.bloodPressure || metrics.blood_pressure) || 70.0,
    skin_thickness: Number(metrics.skinThickness || metrics.skin_thickness) || 20.0,
    insulin: Number(metrics.insulin) || 79.0,
    bmi: Number(metrics.bmi) || 25.0,
    diabetes_pedigree_function: Number(metrics.diabetesPedigreeFunction || metrics.diabetes_pedigree_function) || 0.47,
    age: Number(metrics.age) || 30,
  };

  const endpoint = `${ML_SERVICE_URL}/predict/diabetes`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ML Service responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('ML Service request timed out after 6 seconds.');
    }
    throw new Error(`ML Service Unavailable: ${error.message}`);
  }
};

module.exports = {
  predictDiabetesRisk,
};
