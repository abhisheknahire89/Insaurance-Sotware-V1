import React, { useState } from 'react';

// Type definitions matching your existing structure
const InsuranceModule = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preAuthOutput, setPreAuthOutput] = useState<any>(null);
  
  // Input state
  const [clinicalInput, setClinicalInput] = useState({
    patient: {
      age: '58',
      gender: 'Male',
      chiefComplaint: 'Fever and breathlessness for 4 days'
    },
    vitals: {
      bp: '100/60',
      pulse: '112',
      temp: '102.4',
      spo2: '88',
      rr: '28'
    },
    soap: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    },
    ddx: [
      { diagnosis: 'Community-Acquired Pneumonia', probability: 0.87, icd10: 'J18.9', reasoning: 'Fever + cough + dyspnea + hypoxia + CXR consolidation' },
      { diagnosis: 'COVID-19 Pneumonia', probability: 0.08, icd10: 'J12.82', reasoning: 'Pandemic context, bilateral symptoms possible' },
      { diagnosis: 'Acute COPD Exacerbation', probability: 0.05, icd10: 'J44.1', reasoning: 'Less likely without smoking history' }
    ],
    severity: {
      phenoIntensity: 0.78,
      urgencyQuotient: 0.82,
      deteriorationVelocity: 0.71,
      mustNotMiss: true,
      redFlagSeverity: 'critical'
    },
    proposedAdmission: {
      type: 'General Ward',
      expectedLOS: '5-7',
      estimatedCost: '85000',
      procedures: ['IV Antibiotics', 'Oxygen Therapy', 'Serial Monitoring'],
      investigations: ['CBC', 'CRP', 'Chest X-ray', 'ABG']
    }
  });

  const generatePreAuth = () => {
    setIsGenerating(true);
    
    // Simulate API call - replace with actual Gemini call
    setTimeout(() => {
      const output = generateMedicalNecessityStatement(clinicalInput);
      setPreAuthOutput(output);
      setActiveTab('output');
      setIsGenerating(false);
    }, 1500);
  };

  const generateMedicalNecessityStatement = (input: any) => {
    const { patient, vitals, ddx, severity, proposedAdmission } = input;
    const primaryDx = ddx[0];
    
    // Severity interpretations
    const severityText = severity.phenoIntensity > 0.7 
      ? 'Severe symptoms necessitating inpatient monitoring'
      : severity.phenoIntensity > 0.4 
      ? 'Moderate symptoms requiring close observation'
      : 'Mild symptoms';
    
    const urgencyText = severity.urgencyQuotient > 0.7
      ? 'Urgent intervention needed within hours'
      : severity.urgencyQuotient > 0.4
      ? 'Semi-urgent, intervention needed within 24-48 hours'
      : 'Non-urgent';

    const deteriorationText = severity.deteriorationVelocity > 0.7
      ? 'High risk of rapid clinical deterioration without intervention'
      : severity.deteriorationVelocity > 0.4
      ? 'Potential for clinical decline, monitoring advised'
      : 'Stable condition';

    return {
      generatedAt: new Date().toISOString(),
      patient,
      diagnosis: {
        primary: primaryDx.diagnosis,
        icd10: primaryDx.icd10,
        probability: (primaryDx.probability * 100).toFixed(0) + '%',
        differentials: ddx.slice(1).map((d: any) => `${d.diagnosis} (${(d.probability * 100).toFixed(0)}%)`)
      },
      clinicalPresentation: {
        chiefComplaint: patient.chiefComplaint,
        vitals: {
          bp: { value: vitals.bp, status: 'Low-normal' },
          pulse: { value: vitals.pulse + '/min', status: parseInt(vitals.pulse) > 100 ? 'Tachycardia' : 'Normal' },
          temp: { value: vitals.temp + '°F', status: parseFloat(vitals.temp) > 100.4 ? 'Febrile' : 'Normal' },
          spo2: { value: vitals.spo2 + '%', status: parseInt(vitals.spo2) < 94 ? 'HYPOXIA' : 'Normal' },
          rr: { value: vitals.rr + '/min', status: parseInt(vitals.rr) > 20 ? 'Tachypnea' : 'Normal' }
        }
      },
      severityAssessment: {
        phenoIntensity: { score: severity.phenoIntensity, interpretation: severityText },
        urgencyQuotient: { score: severity.urgencyQuotient, interpretation: urgencyText },
        deteriorationVelocity: { score: severity.deteriorationVelocity, interpretation: deteriorationText },
        mustNotMiss: severity.mustNotMiss,
        redFlagSeverity: severity.redFlagSeverity
      },
      medicalNecessity: {
        whyHospitalizationRequired: [
          parseInt(vitals.spo2) < 94 ? `Hypoxic Respiratory Failure: SpO2 ${vitals.spo2}% requires supplemental oxygen and continuous monitoring` : null,
          severity.phenoIntensity > 0.7 ? 'Severe symptom intensity precludes safe outpatient management' : null,
          severity.urgencyQuotient > 0.7 ? 'Time-critical intervention required within therapeutic window' : null,
          'IV medication required due to severity and potential oral intolerance'
        ].filter(Boolean),
        whyOPDNotAppropriate: [
          'Oxygen requirement cannot be met at home',
          'IV antibiotics required due to severity',
          'Need for serial vital sign monitoring',
          'Risk of sudden respiratory decompensation'
        ],
        riskIfNotAdmitted: [
          'Progression to ARDS (15-25% risk)',
          'Sepsis development without adequate monitoring',
          'Delayed recognition of deterioration',
          severity.mustNotMiss ? 'Must rule out life-threatening differentials' : null
        ].filter(Boolean)
      },
      proposedManagement: {
        admissionType: proposedAdmission.type,
        expectedLOS: proposedAdmission.expectedLOS + ' days',
        estimatedCost: '₹' + parseInt(proposedAdmission.estimatedCost).toLocaleString(),
        procedures: proposedAdmission.procedures,
        investigations: proposedAdmission.investigations
      },
      clinicalReasoning: primaryDx.reasoning
    };
  };

  const copyToClipboard = () => {
    const text = formatForTPA(preAuthOutput);
    navigator.clipboard.writeText(text);
  };

  const formatForTPA = (output: any) => {
    if (!output) return '';
    return `
PRE-AUTHORIZATION REQUEST - MEDICAL NECESSITY STATEMENT
Generated: ${new Date(output.generatedAt).toLocaleString()}

PATIENT: ${output.patient.age} year old ${output.patient.gender}

DIAGNOSIS
Primary: ${output.diagnosis.primary} (ICD-10: ${output.diagnosis.icd10})
Confidence: ${output.diagnosis.probability}
Differentials: ${output.diagnosis.differentials.join(', ')}

CLINICAL PRESENTATION
Chief Complaint: ${output.clinicalPresentation.chiefComplaint}

Vitals:
- BP: ${output.clinicalPresentation.vitals.bp.value} (${output.clinicalPresentation.vitals.bp.status})
- Pulse: ${output.clinicalPresentation.vitals.pulse.value} (${output.clinicalPresentation.vitals.pulse.status})
- Temperature: ${output.clinicalPresentation.vitals.temp.value} (${output.clinicalPresentation.vitals.temp.status})
- SpO2: ${output.clinicalPresentation.vitals.spo2.value} (${output.clinicalPresentation.vitals.spo2.status})
- Respiratory Rate: ${output.clinicalPresentation.vitals.rr.value} (${output.clinicalPresentation.vitals.rr.status})

SEVERITY ASSESSMENT (NEXUS Scores)
- Symptom Severity: ${output.severityAssessment.phenoIntensity.score.toFixed(2)} - ${output.severityAssessment.phenoIntensity.interpretation}
- Clinical Urgency: ${output.severityAssessment.urgencyQuotient.score.toFixed(2)} - ${output.severityAssessment.urgencyQuotient.interpretation}
- Deterioration Risk: ${output.severityAssessment.deteriorationVelocity.score.toFixed(2)} - ${output.severityAssessment.deteriorationVelocity.interpretation}
- Red Flag: ${output.severityAssessment.redFlagSeverity.toUpperCase()}

MEDICAL NECESSITY JUSTIFICATION

Why Hospitalization Required:
${output.medicalNecessity.whyHospitalizationRequired.map((r: string) => '• ' + r).join('\n')}

Why OPD Management NOT Appropriate:
${output.medicalNecessity.whyOPDNotAppropriate.map((r: string) => '• ' + r).join('\n')}

Risk if NOT Admitted:
${output.medicalNecessity.riskIfNotAdmitted.map((r: string) => '• ' + r).join('\n')}

PROPOSED MANAGEMENT
- Admission To: ${output.proposedManagement.admissionType}
- Expected Stay: ${output.proposedManagement.expectedLOS}
- Estimated Cost: ${output.proposedManagement.estimatedCost}
- Procedures: ${output.proposedManagement.procedures.join(', ')}
- Investigations: ${output.proposedManagement.investigations.join(', ')}

CLINICAL REASONING
${output.clinicalReasoning}
    `.trim();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Aivana Insurance Intelligence</h1>
            <p className="text-sm text-gray-400">Pre-Authorization Document Generator</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-600 text-xs rounded-full">MVP v1.0</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 font-medium ${activeTab === 'input' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            📝 Clinical Input
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`px-6 py-3 font-medium ${activeTab === 'output' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            📄 Pre-Auth Output
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Patient Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Age</label>
                  <input
                    type="text"
                    value={clinicalInput.patient.age}
                    onChange={(e) => setClinicalInput({...clinicalInput, patient: {...clinicalInput.patient, age: e.target.value}})}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Gender</label>
                  <select
                    value={clinicalInput.patient.gender}
                    onChange={(e) => setClinicalInput({...clinicalInput, patient: {...clinicalInput.patient, gender: e.target.value}})}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Chief Complaint</label>
                  <input
                    type="text"
                    value={clinicalInput.patient.chiefComplaint}
                    onChange={(e) => setClinicalInput({...clinicalInput, patient: {...clinicalInput.patient, chiefComplaint: e.target.value}})}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-green-400">Vitals</h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(clinicalInput.vitals).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-400 mb-1">{key.toUpperCase()}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setClinicalInput({...clinicalInput, vitals: {...clinicalInput.vitals, [key]: e.target.value}})}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* DDx from NEXUS */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-purple-400">Differential Diagnosis (from NEXUS)</h3>
              <div className="space-y-2">
                {clinicalInput.ddx.map((dx, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-700 p-3 rounded">
                    <span className={`px-2 py-1 rounded text-xs ${idx === 0 ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {(dx.probability * 100).toFixed(0)}%
                    </span>
                    <span className="flex-1">{dx.diagnosis}</span>
                    <span className="text-gray-400 text-sm">{dx.icd10}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Scores */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-orange-400">NEXUS Severity Scores</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">PhenoIntensity (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={clinicalInput.severity.phenoIntensity}
                    onChange={(e) => setClinicalInput({...clinicalInput, severity: {...clinicalInput.severity, phenoIntensity: parseFloat(e.target.value)}})}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">UrgencyQuotient (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={clinicalInput.severity.urgencyQuotient}
                    onChange={(e) => setClinicalInput({...clinicalInput, severity: {...clinicalInput.severity, urgencyQuotient: parseFloat(e.target.value)}})}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">DeteriorationVelocity (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={clinicalInput.severity.deteriorationVelocity}
                    onChange={(e) => setClinicalInput({...clinicalInput, severity: {...clinicalInput.severity, deteriorationVelocity: parseFloat(e.target.value)}})}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={clinicalInput.severity.mustNotMiss}
                    onChange={(e) => setClinicalInput({...clinicalInput, severity: {...clinicalInput.severity, mustNotMiss: e.target.checked}})}
                    className="rounded"
                  />
                  <span className="text-sm">MustNotMiss Flag</span>
                </label>
                <select
                  value={clinicalInput.severity.redFlagSeverity}
                  onChange={(e) => setClinicalInput({...clinicalInput, severity: {...clinicalInput.severity, redFlagSeverity: e.target.value}})}
                  className="bg-gray-700 rounded px-3 py-1 text-sm"
                >
                  <option value="none">No Red Flag</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePreAuth}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Pre-Authorization...
                </>
              ) : (
                <>📋 Generate Pre-Authorization Document</>
              )}
            </button>
          </div>
        )}

        {activeTab === 'output' && preAuthOutput && (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2"
              >
                📋 Copy for TPA
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2">
                📄 Download PDF
              </button>
            </div>

            {/* Output Display */}
            <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
              {formatForTPA(preAuthOutput)}
            </div>
          </div>
        )}

        {activeTab === 'output' && !preAuthOutput && (
          <div className="text-center py-20 text-gray-400">
            <p>No pre-authorization generated yet.</p>
            <p className="text-sm mt-2">Fill in clinical details and click "Generate"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceModule;
