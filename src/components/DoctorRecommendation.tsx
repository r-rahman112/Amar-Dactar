import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Star, Calendar, Clock, Video, UserCheck, Filter, ArrowLeft, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AppointmentBooking from './AppointmentBooking';
import { useTranslation } from '../contexts/LanguageContext';

const SPECIALTIES = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'General Practitioner', 'Orthopedic'];
const LOCATIONS = ['All', 'Downtown Clinic, NY', 'Westside Medical, NY', 'Uptown Hospital, NY', 'Central Care Clinic, NY', 'Midtown Health, NY'];

export default function DoctorRecommendation({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [consultationType, setConsultationType] = useState<'All' | 'Online' | 'Offline'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors/search', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if(res.ok) {
        const data = await res.json();
        const mapped = data.map((d: any) => ({
           id: d.id,
           name: d.fullname,
           specialty: d.specialty || 'General Practitioner',
           experience: '5+',
           rating: 4.8,
           reviews: 120,
           location: 'Downtown Clinic',
           image: d.photo_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&q=80',
           availableOnline: true,
           availableOffline: true,
           price: 150
        }));
        setDoctors(mapped);
      }
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
      const matchesLocation = selectedLocation === 'All' || doc.location === selectedLocation;
      
      let matchesType = true;
      if (consultationType === 'Online') matchesType = doc.availableOnline;
      if (consultationType === 'Offline') matchesType = doc.availableOffline;

      return matchesSearch && matchesSpecialty && matchesLocation && matchesType;
    });
  }, [doctors, searchQuery, selectedSpecialty, selectedLocation, consultationType]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans text-slate-800 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('Find a Doctor')}</h1>
            <p className="text-sm text-slate-500">{t('Book online or in-person consultations')}</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Mobile Filter Toggle */}
        <div className="w-full md:hidden flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 relative mr-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`${t('Search')}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"
          >
            <Filter className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Sidebar Filters */}
        <AnimatePresence>
          {(isFilterOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
            <motion.aside 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full md:w-64 shrink-0 space-y-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm md:block overflow-hidden"
            >
              {/* Desktop Search */}
              <div className="hidden md:block">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">{t('Search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={`${t('Doctor')}...`} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">{t('Consultation Type')}</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['All', 'Online', 'Offline'].map(type => (
                    <button
                      key={type}
                      onClick={() => setConsultationType(type as any)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${consultationType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {t(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">{t('Specialty')}</label>
                <div className="space-y-2">
                  {SPECIALTIES.map(spec => (
                    <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSpecialty === spec ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                        {selectedSpecialty === spec && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className={`text-sm ${selectedSpecialty === spec ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>{t(spec)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">{t('Location')}</label>
                <div className="relative">
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{t(loc)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>

        {/* Doctor List */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-end mb-2 hidden md:flex">
            <h2 className="text-lg font-semibold text-slate-800">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? t('Doctor') : t('Doctors')} {t('Found')}
            </h2>
            {/* Optional Sorting here */}
          </div>

          <AnimatePresence mode="popLayout">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: "easeOut" }}
                  key={doc.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm premium-card-hover flex flex-col sm:flex-row gap-5"
                >
                  <div className="flex gap-4 sm:contents">
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                      {/* Status dot */}
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{t(doc.name)}</h3>
                            <span className="flex items-center justify-center p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Verified Doctor">
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 font-medium mb-1">{t(doc.specialty)}</p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-lg font-bold text-slate-800">${doc.price}</span>
                          <span className="text-xs text-slate-500">{t('per visit')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 mt-1 sm:mt-0">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-slate-800">{doc.rating}</span>
                        <span className="text-slate-400">({doc.reviews} {t('reviews')})</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>{doc.experience} {t('Years')}</span>
                      </div>

                      <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{t(doc.location)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{t('Next')}: <span className="font-medium text-slate-800">{t(doc.nextAvailable)}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sm:w-48 shrink-0 flex flex-col justify-end gap-3 mt-4 sm:mt-0 sm:border-l sm:border-slate-100 sm:pl-5">
                    
                    <div className="flex sm:hidden justify-between items-center bg-slate-50 px-3 py-2 rounded-xl mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('Fee')}</span>
                      <span className="font-bold text-slate-800">${doc.price}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-start sm:justify-center">
                      {doc.availableOnline && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100/50">
                          <Video className="h-3 w-3" />
                          <span>{t('Online')}</span>
                        </div>
                      )}
                      {doc.availableOffline && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100/50">
                          <MapPin className="h-3 w-3" />
                          <span>{t('In-Person')}</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Calendar className="h-4 w-4" />
                      {t('Book Now')}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-3xl"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t('No doctors found')}</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">{t('Try adjusting your filters or search terms to find available healthcare professionals.')}</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('All');
                    setSelectedLocation('All');
                    setConsultationType('All');
                  }}
                  className="mt-6 text-blue-600 font-medium text-sm hover:underline"
                >
                  {t('Clear all filters')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      <AppointmentBooking 
        doctor={selectedDoctor}
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
      />
    </div>
  );
}
