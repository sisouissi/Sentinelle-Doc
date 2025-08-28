
import React, { useState, useEffect } from 'react';
import type { NewPatient, PatientData } from '../types';
import { User, XCircle, CheckCircle, ClipboardCopy } from './icons';
import { countries } from '../utils/countries';
import { useTranslation } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: NewPatient) => Promise<PatientData | null>;
}

export function AddPatientModal({ isOpen, onClose, onAddPatient }: AddPatientModalProps): React.ReactNode {
  const { t, language } = useTranslation();

  const getDefaultCountryForLang = (lang: Language) => {
    if (lang === 'fr') return `France (FR)`;
    if (lang === 'en') return `United States (US)`;
    if (lang === 'ar') return `المملكة العربية السعودية (SA)`;
    return '';
  };

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(() => getDefaultCountryForLang(language));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [addedPatient, setAddedPatient] = useState<PatientData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // When the modal is not open, we keep the country in sync with the global language setting.
    // This ensures that when it opens, it shows the correct default.
    if (!isOpen) {
      setCountry(getDefaultCountryForLang(language));
    }
  }, [isOpen, language]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setName('');
    setAge('');
    setCondition('');
    setCity('');
    setCountry(getDefaultCountryForLang(language));
    setError('');
    setIsSaving(false);
    setAddedPatient(null);
    setCopied(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const countryCodeMatch = country.match(/\(([^)]+)\)$/);
    const finalCountryCode = (countryCodeMatch ? countryCodeMatch[1] : country).trim().toUpperCase();
    const isValidCountry = countries.some(c => c.code === finalCountryCode);

    if (!name.trim() || !age.trim() || !condition.trim() || !city.trim() || !country.trim()) {
      setError(t('addPatientModal.errorRequired'));
      return;
    }

    if (!isValidCountry) {
        setError(t('addPatientModal.errorCountry'));
        return;
    }

    setError('');
    setIsSaving(true);
    try {
      const newPatient = await onAddPatient({ name, age: parseInt(age, 10), condition, city, country: finalCountryCode });
      if (newPatient) {
        setAddedPatient(newPatient);
      } else {
        throw new Error("Patient creation failed.");
      }
    } catch (err) {
      setError(t('addPatientModal.errorGeneric'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    if (isSaving) return;
    resetForm();
    onClose();
  }

  const handleCopyCode = () => {
    if (addedPatient?.code) {
        navigator.clipboard.writeText(addedPatient.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  }

  const renderForm = () => (
     <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">{t('addPatientModal.fullName')}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
        </div>
        <div>
            <label htmlFor="age" className="block text-sm font-medium text-zinc-700 mb-1">{t('addPatientModal.age')}</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
        </div>
        <div>
            <label htmlFor="condition" className="block text-sm font-medium text-zinc-700 mb-1">{t('addPatientModal.condition')}</label>
            <input
              type="text"
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={t('addPatientModal.conditionPlaceholder')}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-zinc-700 mb-1">{t('addPatientModal.city')}</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('addPatientModal.cityPlaceholder')}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
            </div>
             <div>
                <label htmlFor="country" className="block text-sm font-medium text-zinc-700 mb-1">{t('addPatientModal.country')}</label>
                <input
                    id="country"
                    list="countries-list"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t('addPatientModal.countryPlaceholder')}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    required
                />
                <datalist id="countries-list">
                    {countries.map(c => <option key={c.code} value={`${c.name[language]} (${c.code})`} />)}
                </datalist>
            </div>
        </div>
          
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 disabled:opacity-50"
            >
              {t('addPatientModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:bg-indigo-400 disabled:cursor-wait transition-all duration-200"
            >
              {isSaving ? t('addPatientModal.saving') : t('addPatientModal.submit')}
            </button>
        </div>
    </form>
  )

  const renderSuccess = () => (
    <div className="mt-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">{t('addPatientModal.successHeader')}</h3>
        <p className="text-sm text-zinc-500 mt-2">{t('addPatientModal.successMessage')}</p>

        <div className="my-6">
            <p className="text-sm font-semibold text-zinc-600">{t('addPatientModal.pairingCode')}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
                 <p className="text-3xl font-bold tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border-2 border-dashed border-indigo-200">
                    {addedPatient?.code}
                </p>
                <button onClick={handleCopyCode} className="p-3 bg-zinc-100 rounded-lg hover:bg-zinc-200">
                    <ClipboardCopy className="w-5 h-5 text-zinc-600" />
                </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-2 animate-fade-in">{t('addPatientModal.copied')}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
             <button
              type="button"
              onClick={resetForm}
              className="w-full px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200"
            >
              {t('addPatientModal.addAnother')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
            >
              {t('addPatientModal.done')}
            </button>
        </div>
    </div>
  )

  return (
    <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-white to-zinc-50 rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-zinc-800">
                {addedPatient ? t('addPatientModal.successTitle', { name: addedPatient.name }) : t('addPatientModal.addTitle') }
              </h2>
              <p className="text-sm text-zinc-500">
                  {addedPatient ? t('addPatientModal.successSubtitle') : t('addPatientModal.addSubtitle')}
              </p>
            </div>
          </div>
           <button onClick={handleClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-200">
                <XCircle className="w-6 h-6" />
           </button>
        </div>

        {addedPatient ? renderSuccess() : renderForm()}
        
      </div>
    </div>
  );
}
