import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

// Available subjects for selection
const AVAILABLE_SUBJECTS = [
    'AAL', 'AFST', 'AF_AM_ST', 'ALT_CERT', 'AMER_ST', 'AMES', 'ANIM_ART', 'ANTHRO', 
    'ARABIC', 'ART', 'ART_HIST', 'ASIAN_AM', 'ASIAN_LC', 'ASIAN_ST', 'ASTRON', 
    'BIOL_SCI', 'BLK_ST', 'BMD_ENG', 'BUS_INST', 'CAT', 'CFS', 'CHEM', 'CHEM_ENG', 
    'CHINESE', 'CHRCH_MU', 'CIV_ENG', 'CIV_ENV', 'CLASSICS', 'CMN', 'COG_SCI', 
    'COMM_SCI', 'COMM_ST', 'COMP_ENG', 'COMP_LIT', 'COMP_SCI', 'CONDUCT', 'COOP', 
    'CRDV', 'CSD', 'DANCE', 'DATA_ENG', 'DSGN', 'EARTH', 'ECE', 'ECON', 'EDIT', 
    'EECS', 'ELEC_ENG', 'ENGLISH', 'ENTREP', 'ENVR_POL', 'ENVR_SCI', 'EPICS', 
    'ES_APPM', 'EUR_ST', 'EUR_TH', 'FRENCH', 'GBL_HLTH', 'GEN_CMN', 'GEN_ENG', 
    'GEN_LA', 'GEN_MUS', 'GEN_SPCH', 'GEOG', 'GEOL_SCI', 'GERMAN', 'GNDR_ST', 
    'GREEK', 'HDC', 'HDPS', 'HEBREW', 'HINDI', 'HIND_URD', 'HISTORY', 'HUM', 
    'IDEA', 'IEMS', 'IMC', 'INTG_ART', 'INTG_SCI', 'INTL_ST', 'ISEN', 'ITALIAN', 
    'JAPANESE', 'JAZZ_ST', 'JOUR', 'JWSH_ST', 'KELLG_CP', 'KELLG_FE', 'KELLG_MA', 
    'KOREAN', 'LATIN', 'LATINO', 'LATIN_AM', 'LDRSHP', 'LEGAL_ST', 'LING', 'LOC', 
    'LRN_DIS', 'LRN_SCI', 'MATH', 'MAT_SCI', 'MECH_ENG', 'MENA', 'MFG_ENG', 'MMSS', 
    'MUSIC', 'MUSICOL', 'MUSIC_ED', 'MUS_COMP', 'MUS_TECH', 'MUS_THRY', 'NEUROSCI', 
    'NICO', 'PERF_ST', 'PERSIAN', 'PHIL', 'PHYSICS', 'PIANO', 'POLISH', 'POLI_SCI', 
    'PORT', 'PRDV', 'PSYCH', 'RELIGION', 'RTVF', 'RUSSIAN', 'SESP', 'SHC', 'SLAVIC', 
    'SOCIOL', 'SOC_POL', 'SPANISH', 'SPCH', 'STAT', 'STRINGS', 'SWAHILI', 'TEACH_ED', 
    'THEATRE', 'TRANS', 'TURKISH', 'URBAN_ST', 'VOICE', 'WIND_PER', 'WM_ST', 
    'WRITING', 'YIDDISH'
  ];

// Available majors
const AVAILABLE_MAJORS = [
  'AAL', 'AFST', 'AF_AM_ST', 'ALT_CERT', 'AMER_ST', 'AMES', 'ANIM_ART', 'ANTHRO', 
  'ARABIC', 'ART', 'ART_HIST', 'ASIAN_AM', 'ASIAN_LC', 'ASIAN_ST', 'ASTRON', 
  'BIOL_SCI', 'BLK_ST', 'BMD_ENG', 'BUS_INST', 'CAT', 'CFS', 'CHEM', 'CHEM_ENG', 
  'CHINESE', 'CHRCH_MU', 'CIV_ENG', 'CIV_ENV', 'CLASSICS', 'CMN', 'COG_SCI', 
  'COMM_SCI', 'COMM_ST', 'COMP_ENG', 'COMP_LIT', 'COMP_SCI', 'CONDUCT', 'COOP', 
  'CRDV', 'CSD', 'DANCE', 'DATA_ENG', 'DSGN', 'EARTH', 'ECE', 'ECON', 'EDIT', 
  'EECS', 'ELEC_ENG', 'ENGLISH', 'ENTREP', 'ENVR_POL', 'ENVR_SCI', 'EPICS', 
  'ES_APPM', 'EUR_ST', 'EUR_TH', 'FRENCH', 'GBL_HLTH', 'GEN_CMN', 'GEN_ENG', 
  'GEN_LA', 'GEN_MUS', 'GEN_SPCH', 'GEOG', 'GEOL_SCI', 'GERMAN', 'GNDR_ST', 
  'GREEK', 'HDC', 'HDPS', 'HEBREW', 'HINDI', 'HIND_URD', 'HISTORY', 'HUM', 
  'IDEA', 'IEMS', 'IMC', 'INTG_ART', 'INTG_SCI', 'INTL_ST', 'ISEN', 'ITALIAN', 
  'JAPANESE', 'JAZZ_ST', 'JOUR', 'JWSH_ST', 'KELLG_CP', 'KELLG_FE', 'KELLG_MA', 
  'KOREAN', 'LATIN', 'LATINO', 'LATIN_AM', 'LDRSHP', 'LEGAL_ST', 'LING', 'LOC', 
  'LRN_DIS', 'LRN_SCI', 'MATH', 'MAT_SCI', 'MECH_ENG', 'MENA', 'MFG_ENG', 'MMSS', 
  'MUSIC', 'MUSICOL', 'MUSIC_ED', 'MUS_COMP', 'MUS_TECH', 'MUS_THRY', 'NEUROSCI', 
  'NICO', 'PERF_ST', 'PERSIAN', 'PHIL', 'PHYSICS', 'PIANO', 'POLISH', 'POLI_SCI', 
  'PORT', 'PRDV', 'PSYCH', 'RELIGION', 'RTVF', 'RUSSIAN', 'SESP', 'SHC', 'SLAVIC', 
  'SOCIOL', 'SOC_POL', 'SPANISH', 'SPCH', 'STAT', 'STRINGS', 'SWAHILI', 'TEACH_ED', 
  'THEATRE', 'TRANS', 'TURKISH', 'URBAN_ST', 'VOICE', 'WIND_PER', 'WM_ST', 
  'WRITING', 'YIDDISH'
];

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null); 
  const [userPreferences, setUserPreferences] = useState({
    major: '',
    interests: [],
    courseQuote: '', // Goal description
    topCourses: ['', '', ''],
    otherCourses: [],
  });

  const updatePreferences = (updates) => {
    setUserPreferences((prev) => ({ ...prev, ...updates }));
  };

  const getAvailableSubjects = () => AVAILABLE_SUBJECTS;
  const getAvailableMajors = () => AVAILABLE_MAJORS;

  // On mount, load userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Whenever userId changes, store or clear it in localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ 
      userId,
      setUserId,
      userPreferences, 
      updatePreferences,
      getAvailableSubjects,
      getAvailableMajors
    }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => useContext(UserContext);