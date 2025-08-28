import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'fr' | 'en' | 'ar';
export type TFunction = (key: string, options?: Record<string, string | number>) => string;

// --- Dictionaries ---
// In a real project, these would be in separate JSON files.

const fr = {
  app: {
    title: 'Sentinelle Moniteur BPCO',
    loading: 'Chargement des données du patient...',
    dashboardLoadError: 'Impossible de rafraîchir les données du tableau de bord.',
    initialLoadError: 'Impossible de charger les données initiales.',
    connectionError: {
      title: 'Erreur',
      instructions: 'Une erreur inattendue est survenue. Veuillez rafraîchir la page ou réessayer plus tard.'
    },
    header: {
      title: 'Tableau de Bord Médecin',
      subtitle: 'Surveillance des patients BPCO sévères'
    },
    footer: '© 2025 Sentinelle : Application de simulation (Interface Médecin) développée par Dr Zouhair Souissi. Tous droits réservés'
  },
  riskScore: {
    score: 'Score : {{score}}',
    low: { title: 'Risque Faible', description: 'Le patient est stable. Poursuivre la surveillance de routine.' },
    medium: { title: 'Risque Moyen', description: 'Le patient présente des signes de déstabilisation. Surveillance accrue recommandée.' },
    high: { title: 'Risque Élevé', description: 'Le patient est à haut risque d\'exacerbation. Action immédiate requise.' }
  },
  trendsChart: {
    heartRate: 'Fréq. Cardiaque',
    spo2: 'SpO₂',
    spo2Trend: 'Tendance SpO₂',
    hrTrend: 'Tendance FC',
    ySpo2: 'SpO₂ (%)',
    yHr: 'FC (bpm)'
  },
  deviceManager: {
    title: 'Gestion des Appareils',
    total: 'Total',
    connected: 'Connectés',
    oximeters: 'Oxymètres',
    devices: 'Appareils',
    liveData: 'Données Live',
    active: 'Actif',
    inactive: 'Inactif',
    disconnect: 'Déconnecter',
    connect: 'Connecter',
    connecting: 'Connexion...',
    waitingForData: 'En attente de données...',
    connectDevicePrompt: 'Connectez un appareil pour voir les mesures.',
    liveMeasurement: 'Mesure en direct',
    quality: 'Qualité',
    heartRateUnit: 'bpm',
    noDevicesFoundError: 'Aucun appareil trouvé. Assurez-vous que le Bluetooth est activé.',
    scanError: 'Erreur lors du scan des appareils.',
    connectionFailedError: 'La connexion a échoué : {{error}}',
    unknownError: 'Erreur inconnue',
    scanning: 'Recherche d\'appareils...',
    noDevicesFound: 'Aucun appareil trouvé',
    clickToScan: 'Cliquez sur l\'icône rafraîchir pour rechercher.'
  },
  smartphone: {
    title: 'Données du Smartphone',
    tabs: {
      activity: 'Activité',
      sleep: 'Sommeil',
      cough: 'Toux',
      environment: 'Environnement',
      reported: 'Déclaré'
    },
    activity: {
      steps: 'Pas',
      sedentaryTime: 'Temps sédentaire',
      walkingSpeed: 'Vitesse de marche',
      activeTime: 'Temps actif',
      distance: 'Distance',
      floorsClimbed: 'Étages montés'
    },
    sleep: {
      sleepHours: 'Heures de sommeil',
      efficiency: 'Efficacité',
      awakeTime: 'Temps éveillé',
      totalSleep: 'Sommeil total',
      sleepEfficiency: 'Efficacité du sommeil',
      awakeTimeCard: 'Temps éveillé',
      nightMovements: 'Mouvements nocturnes',
      deepSleep: 'Sommeil profond',
      sleepPosition: 'Position de sommeil',
      hoursMinutes: 'Heures / Minutes',
      positions: {
        supine: 'Dorsale',
        lateral: 'Latérale',
        prone: 'Ventrale',
        sitting: 'Assise'
      }
    },
    cough: {
      frequency: 'Fréquence de la toux',
      nightCough: 'Toux nocturne',
      type: 'Type de toux',
      intensity: 'Intensité de la toux',
      respiratoryRate: 'Fréq. respiratoire',
      patterns: {
        dry: 'Sèche',
        productive: 'Productive',
        wheezing: 'Sifflante'
      }
    },
    environment: {
      aqi: 'Qualité de l\'air',
      homeTime: 'Temps à domicile',
      travelRadius: 'Rayon de déplacement',
      temperature: 'Température',
      humidity: 'Humidité'
    },
    reported: {
      breathlessness: 'Essoufflement',
      fatigue: 'Fatigue',
      catScore: 'Score CAT',
      adherence: 'Adhérence médicamenteuse',
      missedDoses: 'Doses manquées',
      coughSymptom: 'Symptôme de toux'
    }
  },
  days: {
    d6: 'J-6', d5: 'J-5', d4: 'J-4', d3: 'J-3', d2: 'J-2', d1: 'Hier', today: 'Aujourd\'hui',
    short: { sun: 'Dim', mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam' }
  },
  units: {
    steps: 'pas',
    min: 'min',
    kmh: 'km/h',
    km: 'km',
    floors: 'étages',
    h: 'h',
    times: 'fois',
    perHour: '/heure',
    episodes: 'épisodes',
    rpm: 'resp/min',
    doses: 'doses'
  },
  chatbot: {
    title: 'Assistant IA Sentinelle',
    placeholder: 'Posez une question sur le patient...',
    listening: 'Écoute en cours...',
    sendMessage: 'Envoyer le message',
    startListening: 'Commencer l\'écoute',
    stopListening: 'Arrêter l\'écoute',
    readMessage: 'Lire le message',
    stopReading: 'Arrêter la lecture'
  },
  errors: {
    speechRecognition: {
      notSupported: "La reconnaissance vocale n'est pas supportée par ce navigateur.",
      micNotAllowed: "L'accès au microphone est refusé. Veuillez l'autoriser dans les paramètres de votre navigateur.",
      genericError: 'Une erreur de reconnaissance vocale est survenue.',
      startError: 'Impossible de démarrer la reconnaissance vocale.'
    }
  },
  alerts: {
    highRiskScore: 'Risque élevé détecté (Score : {{score}}).',
    spo2Detail: ' SpO₂ actuelle : {{spo2}}%.',
    decliningTrend: 'Tendance à la baisse des signes vitaux sur les dernières 4 heures.',
    missedMeasurement: 'Aucune mesure d\'oxymètre reçue depuis plus de 6 heures.'
  },
  doctorDashboard: {
    totalPatients: 'Patients',
    critical: 'Critiques',
    warnings: 'Alertes',
    stable: 'Stables',
    patients: 'Liste des Patients',
    alerts: 'Alertes Récentes',
    searchPlaceholder: 'Rechercher un patient...',
    allStatuses: 'Tous les statuts',
    riskLow: 'Risque Faible',
    riskMedium: 'Risque Moyen',
    riskHigh: 'Risque Élevé',
    addPatient: 'Nouveau Patient',
    addPatientError: 'Erreur lors de l\'ajout du patient.',
    view: 'Voir',
    details: 'Détails',
    yearsOld: '{{age}} ans',
    riskLevels: { low: 'Faible', medium: 'Moyen', high: 'Élevé' },
    emergencyContact: 'Contact d\'Urgence',
    adherenceDetailTitle: 'Observance Médicamenteuse',
    currentMedications: 'Traitements Actuels',
    table: {
      patient: 'Patient',
      riskScore: 'Score Risque',
      adherence: 'Observance',
      vitals: 'Signes vitaux (SpO₂/FC)',
      trend: 'Tendance',
      status: 'Statut',
      actions: 'Actions'
    }
  },
  patientDetail: {
    backToDoctors: 'Retour aux médecins',
    loadingPrediction: 'Chargement de l\'analyse prédictive...',
    loadingChat: 'Chargement de l\'historique des conversations...',
    noChatHistory: 'Aucun historique de conversation trouvé pour ce patient.',
    tabs: {
      prediction: 'Prédiction IA',
      vitals: 'Signes Vitaux',
      observance: 'Observance',
      chat: 'Conversations',
      environment: 'Environnement',
      speech: 'Élocution',
      smoking: 'Sevrage Tabac'
    },
    hourlyActivity: 'Activité horaire (24h)',
    vitalsMonitoring: 'Suivi des signes vitaux (4h)'
  },
  addPatientModal: {
    addTitle: 'Ajouter un nouveau patient',
    successTitle: 'Code pour {{name}}',
    addSubtitle: 'Renseignez les informations de base.',
    successSubtitle: 'Finalisez la configuration du patient.',
    fullName: 'Nom complet',
    age: 'Âge',
    condition: 'Condition',
    conditionPlaceholder: 'Ex: BPCO Sévère',
    city: 'Ville',
    cityPlaceholder: 'Ex: Paris',
    country: 'Pays',
    countryPlaceholder: 'Commencez à taper un pays...',
    errorRequired: 'Tous les champs sont obligatoires.',
    errorCountry: 'Veuillez sélectionner un pays valide dans la liste.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    cancel: 'Annuler',
    submit: 'Ajouter et obtenir le code',
    saving: 'Ajout...',
    successHeader: 'Patient ajouté avec succès !',
    successMessage: 'Communiquez le code de jumelage suivant au patient pour qu\'il puisse se connecter à son profil.',
    pairingCode: 'Code de Jumelage',
    copied: 'Copié !',
    addAnother: 'Ajouter un autre patient',
    done: 'Terminé'
  },
  mobility: {
    activateTitle: 'Activer le suivi de mobilité',
    activateDescription: "Pour fournir une analyse complète de votre activité quotidienne, Sentinelle a besoin d'accéder aux capteurs de mouvement de votre téléphone (comme l'accéléromètre et le gyroscope).",
    grantPermission: 'Donner la permission',
    loading: 'Chargement des données de mobilité...',
    stopTracking: 'Arrêter le suivi',
    startTracking: 'Démarrer le suivi',
    batteryInterval: 'Intervalle : {{interval}}s',
    mobilityScore: 'Score Mobilité',
    stepFrequency: 'Fréquence Pas',
    movementSpeed: 'Vitesse Déplacement',
    accelerometer: 'Accéléromètre',
    gyroscope: 'Gyroscope',
    activity: {
      stationary: 'Immobile',
      walking: 'Marche',
      running: 'Course',
      vehicle: 'En Véhicule'
    }
  },
  pairing: {
    welcome: 'Bienvenue sur Sentinelle',
    instructions: 'Pour accéder à votre tableau de bord personnel, veuillez entrer le code de jumelage fourni par votre médecin.',
    label: 'Code de Jumelage',
    placeholder: 'ABC-123',
    errorRequired: 'Veuillez entrer un code de jumelage.',
    errorInvalid: 'Code de jumelage invalide ou introuvable. Veuillez réessayer.',
    errorConnection: 'Une erreur de connexion est survenue. Vérifiez votre connexion internet.',
    button: 'Se Connecter',
    loadingButton: 'Vérification...'
  },
  prediction: {
    title: 'Analyse de la prédiction IA',
    synthesisTitle: "Synthèse de l'IA",
    riskScore: 'Score de risque d\'exacerbation',
    confidence: 'Confiance : {{confidence}}%',
    factors: 'Principaux facteurs contributifs',
    recommendations: 'Actions recommandées',
    impacts: {
      high: 'élevé',
      medium: 'moyen',
      low: 'faible'
    },
    clickToAnalyze: {
        title: "Analyse IA en attente",
        description: "Cliquez pour lancer une analyse prédictive complète des données du patient.",
        button: "Lancer l'Analyse"
    },
    errors: {
      analysisFailed: "Échec de l'analyse"
    }
  },
  alertsTimeline: {
    title: 'Alertes d\'anomalie',
    none: 'Aucune nouvelle anomalie détectée.',
    types: {
      vital_sign_anomaly: 'Anomalie de signe vital',
      mobility_decline: 'Baisse de mobilité',
      sleep_disruption: 'Perturbation du sommeil',
      cough_increase: 'Augmentation de la toux'
    },
    severity: 'sévérité {{level}}',
    severities: {
      high: 'élevée',
      medium: 'moyenne',
      low: 'faible'
    }
  },
  realTimeChart: {
    steps: 'Pas',
    activeMinutes: 'Minutes Actives',
    label: 'Heure : {{label}}'
  },
  locationHeatmap: {
    title: 'Analyse de la Mobilité à Domicile (3 Jours)',
    legendLow: 'Faible',
    legendHigh: 'Élevée',
    trendTitle: 'Tendance sur 3 jours',
    patternTitle: 'Aspect de la carte du jour',
    trends: {
      insufficient: 'Données insuffisantes pour une tendance.',
      up: 'La mobilité globale est en nette hausse par rapport à hier. C\'est un signe positif.',
      down: 'La mobilité semble en baisse aujourd\'hui. Il est important de surveiller ce point.',
      stable: 'La mobilité du patient est stable par rapport aux jours précédents.'
    },
    patterns: {
      dispersed: 'L\'activité est bien dispersée dans le domicile, indiquant des déplacements variés et une bonne mobilité.',
      localized: 'L\'activité est très localisée. Le patient semble rester dans une zone restreinte, ce qui peut indiquer une sédentarité accrue.',
      moderate: 'L\'activité du patient est modérée, avec des déplacements dans plusieurs zones du domicile.'
    }
  },
  chatHistory: {
    title: "Historique des conversations avec l'Assistant IA",
    stopReading: "Arrêter la lecture",
    readMessage: "Lire le message"
  },
  sleepDetails: {
    title: 'Analyse Détaillée du Sommeil',
    totalSleep: 'Sommeil total',
    efficiency: 'Efficacité',
    movements: 'Mouvements',
    position: 'Position',
    compositionTitle: 'Répartition des phases de sommeil (en minutes)',
    phases: {
      deep: 'Profond',
      rem: 'Paradoxal (REM)',
      light: 'Léger',
      awake: 'Éveillé'
    }
  },
  environment: {
    title: 'Conditions Météo Actuelles à {{location}}',
    loading: 'Analyse des conditions environnementales en cours...',
    errorTitle: 'Erreur de chargement',
    errorGeneric: 'Aucune donnée environnementale n\'a pu être chargée.',
    errorLocation: 'Les informations de localisation (ville, pays) du patient sont manquantes. Impossible de récupérer les données météo.',
    weather: {
      temperature: 'Température',
      humidity: 'Humidité',
      aqi: 'Qualité de l\'Air',
      wind: 'Vent',
      pollen: 'Pollen',
      uv: 'Indice UV'
    },
    impact: {
      title: 'Analyse de l\'Impact IA',
      levels: {
        High: 'Élevé',
        Medium: 'Moyen',
        Low: 'Faible'
      },
      analysisFailed: "Échec de l'analyse d'impact",
      analyzeButton: "Analyser l'Impact Météo",
      analyzing: "Analyse en cours...",
      analyzeDescription: "Lancer une analyse IA pour évaluer l'impact des conditions actuelles sur le patient.",
      launchAnalysis: "Lancer l'Analyse Environnementale",
      launchDescription: "Charge les données météo et analyse leur impact potentiel sur le patient."
    }
  },
  medicationAdherence: {
    weeklyLog: 'Journal d\'observance hebdomadaire',
    medication: 'Médicament',
    status: 'Statut',
    taken: 'Pris',
    missed: 'Manqué',
    scheduled: 'Prévu',
    notApplicable: 'Non applicable',
    last7days: '7 derniers jours',
    adherenceRate: 'Taux d\'observance',
    noData: 'Aucune médication programmée à suivre pour ce patient.'
  },
  speechAnalysis: {
    title: "Analyse de l'élocution",
    lastAnalysis: "Dernière analyse",
    speechRate: "Débit de parole",
    wpm: "mots/min",
    pauseFrequency: "Fréquence des pauses",
    perMin: "/min",
    articulationScore: "Score d'articulation",
    historicalTrend: "Tendance historique des marqueurs vocaux",
    speechRateLabel: 'Débit (mots/min)',
    pauseFreqLabel: 'Pauses (/min)',
    articulationLabel: 'Articulation (%)',
    noData: "Aucune donnée d'analyse vocale disponible."
  },
  smokingCessation: {
    title: 'Suivi du Sevrage Tabagique',
    smokedToday: "Cigarettes aujourd'hui",
    cravingsToday: "Envies aujourd'hui",
    smokeFreeDays: "Jours sans fumer",
    nonSmoker: 'Non-fumeur',
    nonSmokerMessage: 'Ce patient est déclaré non-fumeur ou a arrêté depuis longtemps.',
    weeklyCigarettes: 'Cigarettes fumées (7 derniers jours)',
    recentActivity: 'Activité récente du journal',
    log: {
        smoked: 'A fumé',
        craving: 'Envie ressentie',
        resisted: "A résisté à l'envie"
    },
    trigger: 'Déclencheur',
    noLogs: 'Aucune activité enregistrée dans le journal.'
  }
};

const en = {
  app: {
    title: 'Sentinel COPD Monitor',
    loading: 'Loading patient data...',
    dashboardLoadError: 'Failed to refresh dashboard data.',
    initialLoadError: 'Failed to load initial data.',
    connectionError: {
      title: 'Error',
      instructions: 'An unexpected error occurred. Please refresh the page or try again later.'
    },
    header: {
      title: 'Doctor Dashboard',
      subtitle: 'Monitoring Severe COPD Patients'
    },
    footer: '© 2025 Sentinel: Simulation application (Doctor Interface) developed by Dr Zouhair Souissi. All rights reserved'
  },
  riskScore: {
    score: 'Score: {{score}}',
    low: { title: 'Low Risk', description: 'Patient is stable. Continue routine monitoring.' },
    medium: { title: 'Medium Risk', description: 'Patient shows signs of destabilization. Increased monitoring is recommended.' },
    high: { title: 'High Risk', description: 'Patient is at high risk of exacerbation. Immediate action required.' }
  },
  trendsChart: {
    heartRate: 'Heart Rate',
    spo2: 'SpO₂',
    spo2Trend: 'SpO₂ Trend',
    hrTrend: 'HR Trend',
    ySpo2: 'SpO₂ (%)',
    yHr: 'HR (bpm)'
  },
  deviceManager: {
    title: 'Device Manager',
    total: 'Total',
    connected: 'Connected',
    oximeters: 'Oximeters',
    devices: 'Devices',
    liveData: 'Live Data',
    active: 'Active',
    inactive: 'Inactive',
    disconnect: 'Disconnect',
    connect: 'Connect',
    connecting: 'Connecting...',
    waitingForData: 'Waiting for data...',
    connectDevicePrompt: 'Connect a device to see measurements.',
    liveMeasurement: 'Live Measurement',
    quality: 'Quality',
    heartRateUnit: 'bpm',
    noDevicesFoundError: 'No devices found. Ensure Bluetooth is enabled.',
    scanError: 'Error while scanning for devices.',
    connectionFailedError: 'Connection failed: {{error}}',
    unknownError: 'Unknown error',
    scanning: 'Scanning for devices...',
    noDevicesFound: 'No devices found',
    clickToScan: 'Click the refresh icon to scan.'
  },
  smartphone: {
    title: 'Smartphone Data',
    tabs: {
      activity: 'Activity',
      sleep: 'Sleep',
      cough: 'Cough',
      environment: 'Environment',
      reported: 'Reported'
    },
    activity: {
      steps: 'Steps',
      sedentaryTime: 'Sedentary Time',
      walkingSpeed: 'Walking Speed',
      activeTime: 'Active Time',
      distance: 'Distance',
      floorsClimbed: 'Floors Climbed'
    },
    sleep: {
      sleepHours: 'Sleep Hours',
      efficiency: 'Efficiency',
      awakeTime: 'Awake Time',
      totalSleep: 'Total Sleep',
      sleepEfficiency: 'Sleep Efficiency',
      awakeTimeCard: 'Awake Time',
      nightMovements: 'Night Movements',
      deepSleep: 'Deep Sleep',
      sleepPosition: 'Sleep Position',
      hoursMinutes: 'Hours / Minutes',
      positions: {
        supine: 'Supine',
        lateral: 'Lateral',
        prone: 'Prone',
        sitting: 'Sitting'
      }
    },
    cough: {
      frequency: 'Cough Frequency',
      nightCough: 'Night Cough',
      type: 'Cough Type',
      intensity: 'Cough Intensity',
      respiratoryRate: 'Respiratory Rate',
      patterns: {
        dry: 'Dry',
        productive: 'Productive',
        wheezing: 'Wheezing'
      }
    },
    environment: {
      aqi: 'Air Quality',
      homeTime: 'Time at Home',
      travelRadius: 'Travel Radius',
      temperature: 'Temperature',
      humidity: 'Humidity'
    },
    reported: {
      breathlessness: 'Breathlessness',
      fatigue: 'Fatigue',
      catScore: 'CAT Score',
      adherence: 'Medication Adherence',
      missedDoses: 'Missed Doses',
      coughSymptom: 'Cough Symptom'
    }
  },
  days: {
    d6: 'D-6', d5: 'D-5', d4: 'D-4', d3: 'D-3', d2: 'D-2', d1: 'Yesterday', today: 'Today',
    short: { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }
  },
  units: {
    steps: 'steps',
    min: 'min',
    kmh: 'km/h',
    km: 'km',
    floors: 'floors',
    h: 'h',
    times: 'times',
    perHour: '/hour',
    episodes: 'episodes',
    rpm: 'breaths/min',
    doses: 'doses'
  },
  chatbot: {
    title: 'Sentinel AI Assistant',
    placeholder: 'Ask a question about the patient...',
    listening: 'Listening...',
    sendMessage: 'Send message',
    startListening: 'Start listening',
    stopListening: 'Stop listening',
    readMessage: 'Read message',
    stopReading: 'Stop reading'
  },
  errors: {
    speechRecognition: {
      notSupported: "Speech recognition is not supported by this browser.",
      micNotAllowed: "Microphone access is denied. Please allow it in your browser settings.",
      genericError: 'A speech recognition error occurred.',
      startError: 'Could not start speech recognition.'
    }
  },
  alerts: {
    highRiskScore: 'High risk detected (Score: {{score}}).',
    spo2Detail: ' Current SpO₂: {{spo2}}%.',
    decliningTrend: 'Declining trend in vital signs over the last 4 hours.',
    missedMeasurement: 'No oximeter measurement received for over 6 hours.'
  },
  doctorDashboard: {
    totalPatients: 'Patients',
    critical: 'Critical',
    warnings: 'Warnings',
    stable: 'Stable',
    patients: 'Patient List',
    alerts: 'Recent Alerts',
    searchPlaceholder: 'Search for a patient...',
    allStatuses: 'All Statuses',
    riskLow: 'Low Risk',
    riskMedium: 'Medium Risk',
    riskHigh: 'High Risk',
    addPatient: 'New Patient',
    addPatientError: 'Error adding patient.',
    view: 'View',
    details: 'Details',
    yearsOld: '{{age}} years old',
    riskLevels: { low: 'Low', medium: 'Medium', high: 'High' },
    emergencyContact: 'Emergency Contact',
    adherenceDetailTitle: 'Medication Adherence',
    currentMedications: 'Current Medications',
    table: {
      patient: 'Patient',
      riskScore: 'Risk Score',
      adherence: 'Adherence',
      vitals: 'Vitals (SpO₂/HR)',
      trend: 'Trend',
      status: 'Status',
      actions: 'Actions'
    }
  },
  patientDetail: {
    backToDoctors: 'Back to Doctors',
    loadingPrediction: 'Loading predictive analysis...',
    loadingChat: 'Loading conversation history...',
    noChatHistory: 'No conversation history found for this patient.',
    tabs: {
      prediction: 'AI Prediction',
      vitals: 'Vital Signs',
      observance: 'Adherence',
      chat: 'Conversations',
      environment: 'Environment',
      speech: 'Speech',
      smoking: 'Smoking Cessation'
    },
    hourlyActivity: 'Hourly Activity (24h)',
    vitalsMonitoring: 'Vital Signs Monitoring (4h)'
  },
  addPatientModal: {
    addTitle: 'Add a new patient',
    successTitle: 'Code for {{name}}',
    addSubtitle: 'Fill in the basic information.',
    successSubtitle: 'Finalize the patient setup.',
    fullName: 'Full name',
    age: 'Age',
    condition: 'Condition',
    conditionPlaceholder: 'e.g., Severe COPD',
    city: 'City',
    cityPlaceholder: 'e.g., London',
    country: 'Country',
    countryPlaceholder: 'Start typing a country...',
    errorRequired: 'All fields are required.',
    errorCountry: 'Please select a valid country from the list.',
    errorGeneric: 'An error occurred. Please try again.',
    cancel: 'Cancel',
    submit: 'Add & Get Code',
    saving: 'Adding...',
    successHeader: 'Patient Added Successfully!',
    successMessage: 'Provide the following pairing code to the patient so they can connect to their profile.',
    pairingCode: 'Pairing Code',
    copied: 'Copied!',
    addAnother: 'Add another patient',
    done: 'Done'
  },
  mobility: {
    activateTitle: 'Activate Mobility Tracking',
    activateDescription: "To provide a complete analysis of your daily activity, Sentinel needs access to your phone's motion sensors (like the accelerometer and gyroscope).",
    grantPermission: 'Grant Permission',
    loading: 'Loading mobility data...',
    stopTracking: 'Stop Tracking',
    startTracking: 'Start Tracking',
    batteryInterval: 'Interval: {{interval}}s',
    mobilityScore: 'Mobility Score',
    stepFrequency: 'Step Frequency',
    movementSpeed: 'Movement Speed',
    accelerometer: 'Accelerometer',
    gyroscope: 'Gyroscope',
    activity: {
      stationary: 'Stationary',
      walking: 'Walking',
      running: 'Running',
      vehicle: 'In Vehicle'
    }
  },
  pairing: {
    welcome: 'Welcome to Sentinel',
    instructions: 'To access your personal dashboard, please enter the pairing code provided by your doctor.',
    label: 'Pairing Code',
    placeholder: 'ABC-123',
    errorRequired: 'Please enter a pairing code.',
    errorInvalid: 'Invalid or unfound pairing code. Please try again.',
    errorConnection: 'A connection error occurred. Please check your internet connection.',
    button: 'Connect',
    loadingButton: 'Verifying...'
  },
  prediction: {
    title: 'AI Prediction Analysis',
    synthesisTitle: "AI Synthesis",
    riskScore: 'Exacerbation Risk Score',
    confidence: 'Confidence: {{confidence}}%',
    factors: 'Main Contributing Factors',
    recommendations: 'Recommended Actions',
    impacts: {
      high: 'high',
      medium: 'medium',
      low: 'low'
    },
    clickToAnalyze: {
      title: "AI Analysis Pending",
      description: "Click to run a full predictive analysis of the patient's data.",
      button: "Run Analysis"
    },
    errors: {
      analysisFailed: "Analysis Failed"
    }
  },
  alertsTimeline: {
    title: 'Anomaly Alerts',
    none: 'No new anomalies detected.',
    types: {
      vital_sign_anomaly: 'Vital Sign Anomaly',
      mobility_decline: 'Mobility Decline',
      sleep_disruption: 'Sleep Disruption',
      cough_increase: 'Cough Increase'
    },
    severity: 'severity {{level}}',
    severities: {
      high: 'high',
      medium: 'medium',
      low: 'low'
    }
  },
  realTimeChart: {
    steps: 'Steps',
    activeMinutes: 'Active Minutes',
    label: 'Time: {{label}}'
  },
  locationHeatmap: {
    title: 'Home Mobility Analysis (3 Days)',
    legendLow: 'Low',
    legendHigh: 'High',
    trendTitle: '3-Day Trend',
    patternTitle: 'Today\'s Map Pattern',
    trends: {
      insufficient: 'Insufficient data for a trend.',
      up: 'Overall mobility is clearly increasing compared to yesterday. This is a positive sign.',
      down: 'Mobility appears to be decreasing today. This should be monitored.',
      stable: 'The patient\'s mobility is stable compared to previous days.'
    },
    patterns: {
      dispersed: 'Activity is well-dispersed throughout the home, indicating varied movements and good mobility.',
      localized: 'Activity is highly localized. The patient seems to be staying in a restricted area, which may indicate increased sedentary behavior.',
      moderate: 'The patient\'s activity is moderate, with movements in several areas of the home.'
    }
  },
  chatHistory: {
    title: "Conversation History with AI Assistant",
    stopReading: "Stop reading",
    readMessage: "Read message"
  },
  sleepDetails: {
    title: 'Detailed Sleep Analysis',
    totalSleep: 'Total Sleep',
    efficiency: 'Efficiency',
    movements: 'Movements',
    position: 'Position',
    compositionTitle: 'Sleep Stage Distribution (in minutes)',
    phases: {
      deep: 'Deep',
      rem: 'REM',
      light: 'Light',
      awake: 'Awake'
    }
  },
  environment: {
    title: 'Current Weather Conditions in {{location}}',
    loading: 'Analyzing environmental conditions...',
    errorTitle: 'Loading Error',
    errorGeneric: 'Could not load any environmental data.',
    errorLocation: 'Patient location information (city, country) is missing. Cannot retrieve weather data.',
    weather: {
      temperature: 'Temperature',
      humidity: 'Humidity',
      aqi: 'Air Quality',
      wind: 'Wind',
      pollen: 'Pollen',
      uv: 'UV Index'
    },
    impact: {
      title: 'AI Impact Analysis',
      levels: {
        High: 'High',
        Medium: 'Medium',
        Low: 'Low'
      },
      analysisFailed: 'Impact Analysis Failed',
      analyzeButton: "Analyze Weather Impact",
      analyzing: "Analyzing...",
      analyzeDescription: "Run an AI analysis to assess the impact of current conditions on the patient.",
      launchAnalysis: "Run Environmental Analysis",
      launchDescription: "Loads weather data and analyzes its potential impact on the patient."
    }
  },
  medicationAdherence: {
    weeklyLog: 'Weekly Adherence Log',
    medication: 'Medication',
    status: 'Status',
    taken: 'Taken',
    missed: 'Missed',
    scheduled: 'Scheduled',
    notApplicable: 'Not Applicable',
    last7days: 'Last 7 Days',
    adherenceRate: 'Adherence Rate',
    noData: 'No scheduled medications to track for this patient.'
  },
  speechAnalysis: {
    title: 'Speech Analysis',
    lastAnalysis: 'Last analysis',
    speechRate: 'Speech Rate',
    wpm: 'wpm',
    pauseFrequency: 'Pause Frequency',
    perMin: '/min',
    articulationScore: 'Articulation Score',
    historicalTrend: 'Historical Trend of Vocal Markers',
    speechRateLabel: 'Rate (wpm)',
    pauseFreqLabel: 'Pauses (/min)',
    articulationLabel: 'Articulation (%)',
    noData: 'No speech analysis data available.'
  },
  smokingCessation: {
    title: 'Smoking Cessation Tracking',
    smokedToday: 'Cigarettes Today',
    cravingsToday: 'Cravings Today',
    smokeFreeDays: 'Smoke-Free Days',
    nonSmoker: 'Non-smoker',
    nonSmokerMessage: 'This patient is reported as a non-smoker or has quit long ago.',
    weeklyCigarettes: 'Cigarettes Smoked (Last 7 Days)',
    recentActivity: 'Recent Journal Activity',
    log: {
        smoked: 'Smoked a cigarette',
        craving: 'Felt a craving',
        resisted: 'Resisted a craving'
    },
    trigger: 'Trigger',
    noLogs: 'No journal activity logged.'
  }
};

const ar = {
  app: {
    title: 'الرقيب | مراقبة مرضى الانسداد الرئوي المزمن',
    loading: 'جاري تحميل بيانات المريض...',
    dashboardLoadError: 'فشل تحديث بيانات لوحة المعلومات.',
    initialLoadError: 'فشل تحميل البيانات الأولية.',
    connectionError: {
      title: 'خطأ',
      instructions: 'حدث خطأ غير متوقع. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.'
    },
    header: {
      title: 'لوحة معلومات الطبيب',
      subtitle: 'مراقبة مرضى الانسداد الرئوي المزمن الشديد'
    },
    footer: '© 2025 الرقيب: تطبيق محاكاة (واجهة الطبيب) تم تطويره بواسطة الدكتور زهير السويسي. كل الحقوق محفوظة.'
  },
  riskScore: {
    score: 'النتيجة: {{score}}',
    low: { title: 'خطورة منخفضة', description: 'المريض مستقر. استمر في المراقبة الروتينية.' },
    medium: { title: 'خطورة متوسطة', description: 'يظهر المريض علامات عدم استقرار. يوصى بزيادة المراقبة.' },
    high: { title: 'خطورة عالية', description: 'المريض في خطر كبير لحدوث تفاقم. مطلوب اتخاذ إجراء فوري.' }
  },
  trendsChart: {
    heartRate: 'معدل ضربات القلب',
    spo2: 'تشبع الأكسجين',
    spo2Trend: 'اتجاه تشبع الأكسجين',
    hrTrend: 'اتجاه معدل القلب',
    ySpo2: 'تشبع الأكسجين (٪)',
    yHr: 'معدل القلب (نبضة/د)'
  },
  deviceManager: {
    title: 'إدارة الأجهزة',
    total: 'الإجمالي',
    connected: 'المتصلة',
    oximeters: 'أجهزة قياس الأكسجين',
    devices: 'الأجهزة',
    liveData: 'البيانات الحية',
    active: 'نشط',
    inactive: 'غير نشط',
    disconnect: 'قطع الاتصال',
    connect: 'اتصال',
    connecting: 'جاري الاتصال...',
    waitingForData: 'في انتظار البيانات...',
    connectDevicePrompt: 'قم بتوصيل جهاز لرؤية القياسات.',
    liveMeasurement: 'القياس المباشر',
    quality: 'الجودة',
    heartRateUnit: 'ن/د',
    noDevicesFoundError: 'لم يتم العثور على أجهزة. تأكد من تمكين البلوتوث.',
    scanError: 'خطأ أثناء البحث عن الأجهزة.',
    connectionFailedError: 'فشل الاتصال: {{error}}',
    unknownError: 'خطأ غير معروف',
    scanning: 'جاري البحث عن أجهزة...',
    noDevicesFound: 'لم يتم العثور على أجهزة',
    clickToScan: 'انقر فوق أيقونة التحديث للبحث.'
  },
  smartphone: {
    title: 'بيانات الهاتف الذكي',
    tabs: {
      activity: 'النشاط',
      sleep: 'النوم',
      cough: 'السعال',
      environment: 'البيئة',
      reported: 'المبلغ عنها'
    },
    activity: {
      steps: 'الخطوات',
      sedentaryTime: 'وقت الجلوس',
      walkingSpeed: 'سرعة المشي',
      activeTime: 'الوقت النشط',
      distance: 'المسافة',
      floorsClimbed: 'الطوابق المصعودة'
    },
    sleep: {
      sleepHours: 'ساعات النوم',
      efficiency: 'الكفاءة',
      awakeTime: 'وقت الاستيقاظ',
      totalSleep: 'إجمالي النوم',
      sleepEfficiency: 'كفاءة النوم',
      awakeTimeCard: 'وقت الاستيقاظ',
      nightMovements: 'الحركات الليلية',
      deepSleep: 'النوم العميق',
      sleepPosition: 'وضعية النوم',
      hoursMinutes: 'ساعات / دقائق',
      positions: {
        supine: 'على الظهر',
        lateral: 'جانبية',
        prone: 'على البطن',
        sitting: 'جلوس'
      }
    },
    cough: {
      frequency: 'تكرار السعال',
      nightCough: 'السعال الليلي',
      type: 'نوع السعال',
      intensity: 'شدة السعال',
      respiratoryRate: 'معدل التنفس',
      patterns: {
        dry: 'جاف',
        productive: 'منتج',
        wheezing: 'صفير'
      }
    },
    environment: {
      aqi: 'جودة الهواء',
      homeTime: 'الوقت في المنزل',
      travelRadius: 'نطاق التنقل',
      temperature: 'درجة الحرارة',
      humidity: 'الرطوبة'
    },
    reported: {
      breathlessness: 'ضيق التنفس',
      fatigue: 'التعب',
      catScore: 'درجة CAT',
      adherence: 'الالتزام بالدواء',
      missedDoses: 'الجرعات الفائتة',
      coughSymptom: 'عرض السعال'
    }
  },
  days: {
    d6: 'ي-6', d5: 'ي-5', d4: 'ي-4', d3: 'ي-3', d2: 'ي-2', d1: 'أمس', today: 'اليوم',
    short: { sun: 'ح', mon: 'ن', tue: 'ث', wed: 'ر', thu: 'خ', fri: 'ج', sat: 'س' }
  },
  units: {
    steps: 'خطوة',
    min: 'دقيقة',
    kmh: 'كم/س',
    km: 'كم',
    floors: 'طابق',
    h: 'س',
    times: 'مرة',
    perHour: '/ساعة',
    episodes: 'نوبة',
    rpm: 'نفس/د',
    doses: 'جرعات'
  },
  chatbot: {
    title: 'مساعد الرقيب الذكي',
    placeholder: 'اطرح سؤالاً عن المريض...',
    listening: 'الاستماع جارٍ...',
    sendMessage: 'إرسال الرسالة',
    startListening: 'بدء الاستماع',
    stopListening: 'إيقاف الاستماع',
    readMessage: 'قراءة الرسالة',
    stopReading: 'إيقاف القراءة'
  },
  errors: {
    speechRecognition: {
      notSupported: 'التعرف على الكلام غير مدعوم من قبل هذا المتصفح.',
      micNotAllowed: 'تم رفض الوصول إلى الميكروفون. يرجى السماح به في إعدادات متصفحك.',
      genericError: 'حدث خطأ في التعرف على الكلام.',
      startError: 'تعذر بدء التعرف على الكلام.'
    }
  },
  alerts: {
    highRiskScore: 'تم اكتشاف خطورة عالية (النتيجة: {{score}}).',
    spo2Detail: ' تشبع الأكسجين الحالي: {{spo2}}٪.',
    decliningTrend: 'اتجاه هبوطي في العلامات الحيوية خلال الـ 4 ساعات الماضية.',
    missedMeasurement: 'لم يتم استلام أي قياس من جهاز قياس الأكسجين لأكثر من 6 ساعات.'
  },
  doctorDashboard: {
    totalPatients: 'المرضى',
    critical: 'الحالات الحرجة',
    warnings: 'التحذيرات',
    stable: 'الحالات المستقرة',
    patients: 'قائمة المرضى',
    alerts: 'التنبيهات الأخيرة',
    searchPlaceholder: 'ابحث عن مريض...',
    allStatuses: 'جميع الحالات',
    riskLow: 'خطورة منخفضة',
    riskMedium: 'خطورة متوسطة',
    riskHigh: 'خطورة عالية',
    addPatient: 'مريض جديد',
    addPatientError: 'خطأ في إضافة المريض.',
    view: 'عرض',
    details: 'التفاصيل',
    yearsOld: '{{age}} سنة',
    riskLevels: { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' },
    emergencyContact: 'جهة اتصال للطوارئ',
    adherenceDetailTitle: 'الالتزام الدوائي',
    currentMedications: 'الأدوية الحالية',
    table: {
      patient: 'المريض',
      riskScore: 'درجة الخطورة',
      adherence: 'الالتزام',
      vitals: 'العلامات الحيوية (SpO₂/HR)',
      trend: 'الاتجاه',
      status: 'الحالة',
      actions: 'الإجراءات'
    }
  },
  patientDetail: {
    backToDoctors: 'العودة إلى الأطباء',
    loadingPrediction: 'جاري تحميل التحليل التنبؤي...',
    loadingChat: 'جاري تحميل سجل المحادثات...',
    noChatHistory: 'لم يتم العثور على سجل محادثات لهذا المريض.',
    tabs: {
      prediction: 'تنبؤات الذكاء الاصطناعي',
      vitals: 'العلامات الحيوية',
      observance: 'الالتزام',
      chat: 'المحادثات',
      environment: 'البيئة',
      speech: 'الكلام',
      smoking: 'الإقلاع عن التدخين'
    },
    hourlyActivity: 'النشاط الساعي (24 ساعة)',
    vitalsMonitoring: 'مراقبة العلامات الحيوية (4 ساعات)'
  },
  addPatientModal: {
    addTitle: 'إضافة مريض جديد',
    successTitle: 'رمز لـ {{name}}',
    addSubtitle: 'املأ المعلومات الأساسية.',
    successSubtitle: 'أكمل إعداد المريض.',
    fullName: 'الاسم الكامل',
    age: 'العمر',
    condition: 'الحالة',
    conditionPlaceholder: 'مثال: انسداد رئوي مزمن حاد',
    city: 'المدينة',
    cityPlaceholder: 'مثال: الرياض',
    country: 'الدولة',
    countryPlaceholder: 'ابدأ بكتابة اسم الدولة...',
    errorRequired: 'جميع الحقول مطلوبة.',
    errorCountry: 'يرجى تحديد دولة صالحة من القائمة.',
    errorGeneric: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    cancel: 'إلغاء',
    submit: 'إضافة والحصول على الرمز',
    saving: 'جاري الإضافة...',
    successHeader: 'تمت إضافة المريض بنجاح!',
    successMessage: 'قدم رمز الاقتران التالي للمريض حتى يتمكن من الاتصال بملفه الشخصي.',
    pairingCode: 'رمز الاقتران',
    copied: 'تم النسخ!',
    addAnother: 'إضافة مريض آخر',
    done: 'تم'
  },
  mobility: {
    activateTitle: 'تفعيل تتبع الحركة',
    activateDescription: 'لتقديم تحليل كامل لنشاطك اليومي، يحتاج الرقيب إلى الوصول إلى مستشعرات الحركة في هاتفك (مثل مقياس التسارع والجيروسكوب).',
    grantPermission: 'منح الإذن',
    loading: 'جاري تحميل بيانات الحركة...',
    stopTracking: 'إيقاف التتبع',
    startTracking: 'بدء التتبع',
    batteryInterval: 'الفاصل الزمني: {{interval}} ثانية',
    mobilityScore: 'درجة الحركة',
    stepFrequency: 'تردد الخطوات',
    movementSpeed: 'سرعة الحركة',
    accelerometer: 'مقياس التسارع',
    gyroscope: 'الجيروسكوب',
    activity: {
      stationary: 'ثابت',
      walking: 'يمشي',
      running: 'يجري',
      vehicle: 'في مركبة'
    }
  },
  pairing: {
    welcome: 'أهلاً بك في الرقيب',
    instructions: 'للوصول إلى لوحة معلوماتك الشخصية، يرجى إدخال رمز الاقتران الذي قدمه لك طبيبك.',
    label: 'رمز الاقتران',
    placeholder: 'ABC-123',
    errorRequired: 'يرجى إدخال رمز الاقتران.',
    errorInvalid: 'رمز الاقتران غير صالح أو غير موجود. يرجى المحاولة مرة أخرى.',
    errorConnection: 'حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت.',
    button: 'اتصال',
    loadingButton: 'جاري التحقق...'
  },
  prediction: {
    title: 'تحليل تنبؤات الذكاء الاصطناعي',
    synthesisTitle: "ملخص الذكاء الاصطناعي",
    riskScore: 'درجة خطر التفاقم',
    confidence: 'الثقة: {{confidence}}%',
    factors: 'العوامل الرئيسية المساهمة',
    recommendations: 'الإجراءات الموصى بها',
    impacts: {
      high: 'مرتفع',
      medium: 'متوسط',
      low: 'منخفض'
    },
    clickToAnalyze: {
      title: "تحليل الذكاء الاصطناعي معلق",
      description: "انقر لتشغيل تحليل تنبؤي كامل لبيانات المريض.",
      button: "تشغيل التحليل"
    },
    errors: {
      analysisFailed: "فشل التحليل"
    }
  },
  alertsTimeline: {
    title: 'تنبيهات الحالات الشاذة',
    none: 'لم يتم الكشف عن أي حالات شاذة جديدة.',
    types: {
      vital_sign_anomaly: 'شذوذ في العلامات الحيوية',
      mobility_decline: 'انخفاض في الحركة',
      sleep_disruption: 'اضطراب في النوم',
      cough_increase: 'زيادة في السعال'
    },
    severity: 'الخطورة {{level}}',
    severities: {
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة'
    }
  },
  realTimeChart: {
    steps: 'الخطوات',
    activeMinutes: 'الدقائق النشطة',
    label: 'الوقت: {{label}}'
  },
  locationHeatmap: {
    title: 'تحليل الحركة في المنزل (3 أيام)',
    legendLow: 'منخفضة',
    legendHigh: 'عالية',
    trendTitle: 'الاتجاه لمدة 3 أيام',
    patternTitle: 'نمط خريطة اليوم',
    trends: {
      insufficient: 'بيانات غير كافية لتحديد الاتجاه.',
      up: 'الحركة الإجمالية في ازدياد واضح مقارنة بالأمس. هذه علامة إيجابية.',
      down: 'تبدو الحركة في انخفاض اليوم. يجب مراقبة هذا الأمر.',
      stable: 'حركة المريض مستقرة مقارنة بالأيام السابقة.'
    },
    patterns: {
      dispersed: 'النشاط موزع جيدًا في جميع أنحاء المنزل، مما يشير إلى تحركات متنوعة وحركة جيدة.',
      localized: 'النشاط متركز في منطقة محددة. يبدو أن المريض يبقى في منطقة مقيدة، مما قد يشير إلى زيادة السلوك المستقر.',
      moderate: 'نشاط المريض معتدل، مع تحركات في عدة مناطق من المنزل.'
    }
  },
  chatHistory: {
    title: "سجل المحادثات مع المساعد الذكي",
    stopReading: "إيقاف القراءة",
    readMessage: "قراءة الرسالة"
  },
  sleepDetails: {
    title: 'تحليل مفصل للنوم',
    totalSleep: 'إجمالي النوم',
    efficiency: 'الكفاءة',
    movements: 'الحركات',
    position: 'الوضعية',
    compositionTitle: 'توزيع مراحل النوم (بالدقائق)',
    phases: {
      deep: 'العميق',
      rem: 'حركة العين السريعة',
      light: 'الخفيف',
      awake: 'مستيقظ'
    }
  },
  environment: {
    title: 'أحوال الطقس الحالية في {{location}}',
    loading: 'جاري تحليل الظروف البيئية...',
    errorTitle: 'خطأ في التحميل',
    errorGeneric: 'تعذر تحميل أي بيانات بيئية.',
    errorLocation: 'معلومات موقع المريض (المدينة، البلد) مفقودة. لا يمكن استرداد بيانات الطقس.',
    weather: {
      temperature: 'درجة الحرارة',
      humidity: 'الرطوبة',
      aqi: 'جودة الهواء',
      wind: 'الرياح',
      pollen: 'حبوب اللقاح',
      uv: 'مؤشر الأشعة فوق البنفسجية'
    },
    impact: {
      title: 'تحليل التأثير بالذكاء الاصطناعي',
      levels: {
        High: 'مرتفع',
        Medium: 'متوسط',
        Low: 'منخفض'
      },
      analysisFailed: 'فشل تحليل التأثير',
      analyzeButton: "تحليل تأثير الطقس",
      analyzing: "جاري التحليل...",
      analyzeDescription: "قم بتشغيل تحليل الذكاء الاصطناعي لتقييم تأثير الظروف الحالية على المريض.",
      launchAnalysis: "بدء التحليل البيئي",
      launchDescription: "تحميل بيانات الطقس وتحليل تأثيرها المحتمل على المريض."
    }
  },
  medicationAdherence: {
    weeklyLog: 'سجل الالتزام الأسبوعي',
    medication: 'الدواء',
    status: 'الحالة',
    taken: 'تم تناوله',
    missed: 'فائتة',
    scheduled: 'مجدول',
    notApplicable: 'لا ينطبق',
    last7days: 'آخر 7 أيام',
    adherenceRate: 'معدل الالتزام',
    noData: 'لا توجد أدوية مجدولة لتتبعها لهذا المريض.'
  },
  speechAnalysis: {
    title: 'تحليل الكلام',
    lastAnalysis: 'آخر تحليل',
    speechRate: 'سرعة الكلام',
    wpm: 'كلمة/د',
    pauseFrequency: 'تكرار الوقفات',
    perMin: '/د',
    articulationScore: 'درجة النطق',
    historicalTrend: 'الاتجاه التاريخي للمؤشرات الصوتية',
    speechRateLabel: 'السرعة (كلمة/د)',
    pauseFreqLabel: 'الوقفات (/د)',
    articulationLabel: 'النطق (٪)',
    noData: 'لا توجد بيانات تحليل صوتي متاحة.'
  },
  smokingCessation: {
    title: 'متابعة الإقلاع عن التدخين',
    smokedToday: 'سجائر اليوم',
    cravingsToday: 'الرغبات اليوم',
    smokeFreeDays: 'أيام بلا تدخين',
    nonSmoker: 'غير مدخن',
    nonSmokerMessage: 'تم الإبلاغ عن هذا المريض كغير مدخن أو أقلع منذ فترة طويلة.',
    weeklyCigarettes: 'السجائر المدخنة (آخر 7 أيام)',
    recentActivity: 'نشاط اليوميات الأخير',
    log: {
        smoked: 'دخن سيجارة',
        craving: 'شعر برغبة',
        resisted: 'قاوم الرغبة'
    },
    trigger: 'المحفز',
    noLogs: 'لم يتم تسجيل أي نشاط في اليوميات.'
  }
};

const translations = { fr, en, ar };

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TFunction;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult: any = translations['en'];
         for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) {
                 console.warn(`Translation not found for key: ${key} in language: ${language} or fallback EN`);
                 return key;
            }
         }
         result = fallbackResult;
         break;
      }
    }

    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((str, [key, value]) => {
        return str.replace(`{{${key}}}`, String(value));
      }, result);
    }
    
    if (typeof result !== 'string') {
        console.warn(`Translation for key: ${key} is not a string.`);
        return key;
    }

    return result as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};