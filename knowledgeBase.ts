import { ClinicalProtocol } from './types';

export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: 'GEN-SEP-001',
    title: 'Management of Sepsis and Septic Shock',
    metadata: {
      version: '1.0.0',
      date_effective: '2024-01-01',
      last_reviewed: '2024-07-20',
      authors: ['International Sepsis Committee'],
      institution: 'Surviving Sepsis Campaign',
      jurisdiction: ['International'],
      scope: 'Management of sepsis and septic shock in adult patients.',
      'use_if_conditions': ['Suspected or confirmed infection', 'Signs of organ dysfunction (e.g., altered mental status, hypotension, elevated lactate)'],
      canonical_sources: [
        { name: 'Surviving Sepsis Campaign Guidelines 2021', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-guidelines-2021' },
      ],
      reviewer_signoff: [{ name: 'Dr. John Doe', date: '2024-07-18', comments: 'Approved version 1.0' }],
    },
    preconditions: ['Patient is an adult.'],
    settings: ['Primary', 'Secondary', 'Tertiary'],
    stepwise_actions: [
      { id: 'sep-step1', timing: 'Hour-1 Bundle (Immediate)', title: 'Initial Resuscitation and Diagnosis', is_critical: true, actions: [
        'Measure lactate level. Remeasure if initial lactate is >2 mmol/L.',
        'Obtain blood cultures before administering antibiotics.',
        'Administer broad-spectrum antibiotics within 1 hour of recognition.',
        'Begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate ≥4 mmol/L.',
        'Apply vasopressors if hypotensive during or after fluid resuscitation to maintain a mean arterial pressure (MAP) ≥ 65 mm Hg.'
      ]},
      { id: 'sep-step2', timing: 'Ongoing', title: 'Source Control and Monitoring', is_critical: false, actions: [
        'Identify and control the source of infection as soon as possible.',
        'Continue to monitor hemodynamic status (MAP, heart rate).',
        'Monitor urine output to assess renal perfusion.',
        'Monitor respiratory status and provide oxygen or mechanical ventilation as needed.'
      ]}
    ],
    dosing_table: [
      { drug_name: 'Norepinephrine', brand_names_india: ['Norad'], available_strengths: ['1 mg/mL'], formula: 'Start 0.05-0.1 mcg/kg/min', route: 'IV Infusion', dilution_instructions: 'Typically 4mg in 250mL D5W or NS.', administration_details: 'Administer via central line if possible. Titrate to maintain MAP ≥ 65 mmHg.', max_dose: 'Titrate to effect, high doses can exceed 1-2 mcg/kg/min.', monitoring: ['Continuous BP monitoring (arterial line preferred)'], contraindications: ['Use with caution in hypovolemia until corrected.'] },
      { drug_name: 'Vasopressin', brand_names_india: ['Vasopin'], available_strengths: ['20 units/mL'], formula: '0.03 units/minute', route: 'IV Infusion', dilution_instructions: 'Typically 20 units in 100mL NS.', administration_details: 'Added to norepinephrine to help raise MAP or decrease norepinephrine dose. Not for titration.', max_dose: '0.04 units/minute', monitoring: ['BP'], contraindications: ['Caution in patients with cardiac disease.'] }
    ],
    monitoring_template: {
      title: 'Sepsis Monitoring',
      parameters: [
          { parameter: 'MAP', frequency: 'Continuous or every 5-15 mins.', normal_range: '≥ 65 mmHg'},
          { parameter: 'Urine Output', frequency: 'Hourly.', normal_range: '> 0.5 mL/kg/hr'},
          { parameter: 'Lactate', frequency: 'Every 2-4 hours until normalized.'},
      ],
      alert_triggers: [
          { condition: 'MAP < 65 mmHg despite fluids and vasopressors', action: 'Alert senior clinician/intensivist immediately.'},
          { condition: 'Urine Output < 0.5 mL/kg/hr for 2 consecutive hours', action: 'Alert clinician; consider fluid challenge or hemodynamic assessment.'},
      ]
    },
    contraindications_general: [],
    escalation_triggers: [
      { condition: 'Persistent hypotension (MAP < 65 mmHg) despite adequate fluid resuscitation and high-dose vasopressors (refractory shock).', action: 'Consider adding second vasopressor (e.g., Vasopressin). Consider IV corticosteroids (Hydrocortisone 200mg/day). Consult Critical Care.', requires_confirmation: true },
    ],
    references: [{ citation: 'Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021.' }]
  },
  {
    id: 'GEN-ANA-001',
    title: 'Management of Anaphylaxis',
    metadata: {
      version: '1.0.0',
      date_effective: '2023-01-01',
      last_reviewed: '2024-07-20',
      authors: ['Anaphylaxis Guideline Committee'],
      institution: 'World Allergy Organization (WAO)',
      jurisdiction: ['International'],
      scope: 'Management of acute anaphylaxis in adults and children.',
      'use_if_conditions': ['Acute onset of illness involving skin/mucosal tissue AND either respiratory compromise or reduced BP.', 'Exposure to a known allergen with rapid onset of hypotension, bronchospasm, or laryngeal edema.'],
      canonical_sources: [ { name: 'WAO Anaphylaxis Guidelines' }, { name: 'NIAID Guidelines' } ],
      reviewer_signoff: [{ name: 'Dr. Jane Smith', date: '2024-07-19', comments: 'Approved version 1.0' }],
    },
    preconditions: [],
    settings: ['Primary', 'Secondary', 'Tertiary'],
    stepwise_actions: [
      { id: 'ana-step1', timing: 'Immediate', title: 'Initial Assessment and Epinephrine', is_critical: true, actions: [
        'Assess Airway, Breathing, Circulation, Disability, Exposure (ABCDE).',
        'Administer EPINEPHRINE (ADRENALINE) IM without delay. This is the first and most important treatment.',
        'Administer into the mid-outer thigh (vastus lateralis). See Dosing Table.',
        'Call for Help / Activate Emergency Response System.',
      ]},
      { id: 'ana-step2', timing: 'Concurrent', title: 'Positioning and Supportive Care', is_critical: true, actions: [
        'Place the patient in a comfortable position. Lay flat and elevate legs if hypotensive. If dyspneic or vomiting, sit patient up.',
        'Administer high-flow oxygen (10-15 L/min) via face mask.',
        'Establish IV access with 2 large-bore cannulas. Begin IV fluid resuscitation with normal saline for hypotension.',
        'Monitor vital signs (BP, HR, RR, SpO2) continuously.'
      ]},
      { id: 'ana-step3', timing: 'After Stabilization', title: 'Second-Line & Adjunctive Therapies', is_critical: false, actions: [
        'Administer H1 antihistamines (e.g., Cetirizine or Diphenhydramine) for cutaneous symptoms.',
        'Administer H2 antihistamines (e.g., Ranitidine or Famotidine).',
        'Administer corticosteroids (e.g., Hydrocortisone or Methylprednisolone) to potentially prevent biphasic reactions.',
        'Observe patient for at least 4-8 hours after symptoms resolve due to risk of biphasic reaction.'
      ]}
    ],
    dosing_table: [
      { drug_name: 'Epinephrine (Adrenaline) 1:1000', brand_names_india: ['Adrenaline'], available_strengths: ['1 mg/mL'], formula: '0.01 mg/kg (max 0.5 mg)', route: 'IM', dilution_instructions: 'No dilution needed.', administration_details: 'Adults: 0.3-0.5 mg IM. Children: 0.01 mg/kg. May be repeated every 5-15 minutes if symptoms persist.', max_dose: 'No absolute max dose in an emergency.', monitoring: ['Heart rate, BP, respiratory status'], contraindications: ['No absolute contraindications in anaphylaxis.'] }
    ],
    monitoring_template: {
        title: 'Anaphylaxis Monitoring',
        parameters: [
            { parameter: 'BP, Heart Rate, Respiratory Rate, SpO2', frequency: 'Continuously or every 5 minutes during acute phase.' },
            { parameter: 'Airway patency', frequency: 'Continuously.' },
            { parameter: 'Skin (hives, angioedema)', frequency: 'Every 15-30 minutes.' }
        ],
        alert_triggers: [
            { condition: 'Worsening respiratory distress (stridor, wheeze, increased work of breathing).', action: 'Repeat IM Epinephrine. Prepare for advanced airway management. Alert senior clinician/anesthetist.' },
            { condition: 'Persistent hypotension despite initial epinephrine and fluids.', action: 'Repeat IM Epinephrine. Consider starting an IV epinephrine infusion. Alert senior clinician/intensivist.' }
        ]
    },
    contraindications_general: ['Antihistamines and corticosteroids are NOT first-line treatments and should never delay epinephrine administration.'],
    escalation_triggers: [
      { condition: 'Patient requires more than two doses of IM epinephrine.', action: 'Begin an IV epinephrine infusion in a monitored setting (ICU/ED). Consult Critical Care.', requires_confirmation: true },
      { condition: 'Patient shows signs of impending airway obstruction (stridor, voice change, tongue swelling).', action: 'Prepare for immediate intubation. Alert Anesthesia and ENT.', requires_confirmation: true }
    ],
    references: [{ citation: 'Shaker MS, et al. Anaphylaxis—a 2020 practice parameter update, systematic review, and Grading of Recommendations, Assessment, Development and Evaluation (GRADE) analysis. J Allergy Clin Immunol. 2020.' }]
  }
];