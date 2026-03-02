import React from 'react';
import { PreCodedGpt, UserRole } from './types';
import { Icon } from './components/Icon';

export const PRE_CODED_GPTS: PreCodedGpt[] = [
  // General Doctor GPTs
  {
    id: 'doctor-emergency',
    title: 'Emergency Protocols',
    description: 'Instant, step-by-step protocols for common medical emergencies like Sepsis, Anaphylaxis, and ACLS, based on international guidelines.',
    icon: <Icon name="siren" />,
    roles: [UserRole.DOCTOR],
  },
  {
    id: 'doctor-guidelines',
    title: 'Clinical Guideline Search',
    description: 'Query the latest evidence-based guidelines from major health organizations for standardized, high-quality care protocols.',
    icon: <Icon name="search" />,
    roles: [UserRole.DOCTOR],
  },
  {
    id: 'doctor-ddx',
    title: 'Differential Diagnosis',
    description: 'Input symptoms and findings for any patient to receive a structured list of potential diagnoses and their rationales.',
    icon: <Icon name="diagnosis" />,
    roles: [UserRole.DOCTOR],
  },
  {
    id: 'doctor-surgical-workup',
    title: 'Surgical Workup Planner',
    description: 'Outline pre-operative checklists, required investigations, and consent points for various surgical procedures.',
    icon: <Icon name="clipboard-check" />,
    roles: [UserRole.DOCTOR],
  },
  {
    id: 'doctor-case-simulator',
    title: 'Clinical Case Simulator',
    description: 'Engage in realistic, AI-powered case simulations for training in complex medical scenarios across various specialities.',
    icon: <Icon name="clipboard-check" />,
    roles: [UserRole.DOCTOR],
  },
  {
    id: 'doctor-lab',
    title: 'Lab Result Analyzer',
    description: 'Interpret common lab results, identify abnormalities, and receive suggestions for next steps based on clinical context.',
    icon: <Icon name="lab" />,
    roles: [UserRole.DOCTOR],
    customComponentId: 'LabResultAnalysis',
  },
  {
    id: 'doctor-handout',
    title: 'Patient Handout Generator',
    description: 'Create easy-to-understand patient handouts for various medical conditions, treatments, and lifestyle advice.',
    icon: <Icon name="handout" />,
    roles: [UserRole.DOCTOR],
  },
];