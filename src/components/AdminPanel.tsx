import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  BookOpen,
  Calendar,
  Key,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  addDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { CourseRequest, ActivationKey } from '../types';
import { COURSES } from '../data';

interface AdminPanelProps {
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminPanel({ onToast }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'legacy'>('keys');
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  
  // Course ID Access Creator Form state
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(COURSES[0]?.id || '');
  const [selectedKeyCourseId, setSelectedKeyCourseId] = useState('all');
  const [expiryOption, setExpiryOption] = useState<'1month' | '1year'>('1month');
  const [creatingGrant, setCreatingGrant] = useState(false);
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Filtering and Searching
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyQuery, setSearchKeyQuery] = useState('');

  // Subscribe to all course requests sorted by requestedAt descending
  useEffect(() => {
    if (useLocalFallback) {
      const loadLocal = () => {
        const localData = localStorage.getItem('course_requests');
        if (localData) {
          try {
            const allReqs: CourseRequest[] = JSON.parse(localData);
            setRequests(allReqs.sort((a, b) => b.requestedAt - a.requestedAt));
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      };
      loadLocal();
      window.addEventListener('storage', loadLocal);
      return () => window.removeEventListener('storage', loadLocal);
    }

    try {
      const q = query(
        collection(db, 'course_requests'),
        orderBy('requestedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedRequests: CourseRequest[] = [];
        snapshot.forEach((doc) => {
          fetchedRequests.push({ id: doc.id, ...doc.data() } as CourseRequest);
        });
        setRequests(fetchedRequests);
        setLoading(false);
        try {
          localStorage.setItem('course_requests', JSON.stringify(fetchedRequests));
        } catch (e) {
          console.warn(e);
        }
      }, (error) => {
        console.warn("Firestore access error/denied for admin. Falling back to localStorage:", error);
        setUseLocalFallback(true);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Failed to subscribe to Firestore admin feed. Falling back to localStorage:", err);
      setUseLocalFallback(true);
      setLoading(false);
    }
  }, [useLocalFallback]);

  // Subscribe to all activation keys sorted by createdAt descending
  useEffect(() => {
    if (useLocalFallback) {
      const loadLocal = () => {
        const localData = localStorage.getItem('activation_keys');
        if (localData) {
          try {
            const allKeys: ActivationKey[] = JSON.parse(localData);
            setKeys(allKeys.sort((a, b) => b.createdAt - a.createdAt));
          } catch (e) {
            console.error(e);
          }
        }
      };
      loadLocal();
      window.addEventListener('storage', loadLocal);
      return () => window.removeEventListener('storage', loadLocal);
    }

    try {
      const q = query(
        collection(db, 'activation_keys'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedKeys: ActivationKey[] = [];
        snapshot.forEach((doc) => {
          fetchedKeys.push({ id: doc.id, ...doc.data() } as ActivationKey);
        });
        setKeys(fetchedKeys);
        try {
          localStorage.setItem('activation_keys', JSON.stringify(fetchedKeys));
        } catch (e) {
          console.warn(e);
        }
      }, (error) => {
        console.warn("Firestore activation_keys error/denied. Falling back to localStorage:", error);
        setUseLocalFallback(true);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Failed to subscribe to activation_keys. Falling back to localStorage:", err);
      setUseLocalFallback(true);
    }
  }, [useLocalFallback]);

  // Accept course request
  const handleAccept = async (id: string, email: string, courseTitle: string) => {
    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('course_requests');
        if (localData) {
          let allReqs: CourseRequest[] = JSON.parse(localData);
          allReqs = allReqs.map(r => r.id === id ? { ...r, status: 'accepted' } : r);
          localStorage.setItem('course_requests', JSON.stringify(allReqs));
          window.dispatchEvent(new Event('storage'));
          onToast(`Request accepted! Unlocked "${courseTitle}" for ${email} (Offline Mode).`, 'success');
        }
      } catch (err) {
        console.error(err);
        onToast('Failed to approve request locally.', 'error');
      }
      return;
    }

    try {
      const docRef = doc(db, 'course_requests', id);
      await updateDoc(docRef, { status: 'accepted' });
      onToast(`Request accepted! Unlocked "${courseTitle}" for ${email}.`, 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to approve request. Please try again.', 'error');
    }
  };

  // Decline course request
  const handleDecline = async (id: string, email: string) => {
    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('course_requests');
        if (localData) {
          let allReqs: CourseRequest[] = JSON.parse(localData);
          allReqs = allReqs.map(r => r.id === id ? { ...r, status: 'declined' } : r);
          localStorage.setItem('course_requests', JSON.stringify(allReqs));
          window.dispatchEvent(new Event('storage'));
          onToast(`Request declined for ${email} (Offline Mode).`, 'info');
        }
      } catch (err) {
        console.error(err);
        onToast('Failed to decline request locally.', 'error');
      }
      return;
    }

    try {
      const docRef = doc(db, 'course_requests', id);
      await updateDoc(docRef, { status: 'declined' });
      onToast(`Request declined for ${email}.`, 'info');
    } catch (err) {
      console.error(err);
      onToast('Failed to decline request.', 'error');
    }
  };

  // Delete course request
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request from database logs?")) return;
    
    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('course_requests');
        if (localData) {
          let allReqs: CourseRequest[] = JSON.parse(localData);
          allReqs = allReqs.filter(r => r.id !== id);
          localStorage.setItem('course_requests', JSON.stringify(allReqs));
          window.dispatchEvent(new Event('storage'));
          onToast(`Request deleted successfully (Offline Mode).`, 'success');
        }
      } catch (err) {
        console.error(err);
        onToast('Failed to delete request locally.', 'error');
      }
      return;
    }

    try {
      const docRef = doc(db, 'course_requests', id);
      await deleteDoc(docRef);
      onToast(`Request deleted successfully.`, 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to delete request.', 'error');
    }
  };

  // Admin Direct Course ID Access Creator
  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = studentEmail.trim().toLowerCase();
    if (!email) {
      onToast('Please enter a valid student email address.', 'error');
      return;
    }

    const course = COURSES.find(c => c.id === selectedCourseId);
    if (!course) {
      onToast('Selected course is invalid.', 'error');
      return;
    }

    setCreatingGrant(true);

    const now = Date.now();
    let durationMs = 0;
    if (expiryOption === '1month') {
      durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      durationMs = 365 * 24 * 60 * 60 * 1000; // 365 days
    }
    const expiresAt = now + durationMs;

    const newGrant: Omit<CourseRequest, 'id'> = {
      userEmail: email,
      courseId: course.id,
      courseTitle: course.title,
      status: 'accepted',
      requestedAt: now,
      expiresAt,
      duration: expiryOption
    };

    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('course_requests');
        let allReqs: CourseRequest[] = [];
        if (localData) {
          try { allReqs = JSON.parse(localData); } catch (e) {}
        }
        
        // Remove existing grant/request for this course + student so we overwrite
        allReqs = allReqs.filter(r => !(r.userEmail.toLowerCase() === email && r.courseId === course.id));
        
        const grantWithId: CourseRequest = {
          id: `local-grant-${Date.now()}`,
          ...newGrant
        };
        
        allReqs.push(grantWithId);
        localStorage.setItem('course_requests', JSON.stringify(allReqs));
        window.dispatchEvent(new Event('storage'));
        onToast(`Successfully created ${expiryOption === '1month' ? '1 Month' : '1 Year'} Access ID for ${email}!`, 'success');
        setStudentEmail('');
      } catch (err) {
        console.error(err);
        onToast('Failed to create course access grant offline.', 'error');
      } finally {
        setCreatingGrant(false);
      }
      return;
    }

    try {
      // Find and delete any existing requests for this email and course first to avoid duplicates
      await addDoc(collection(db, 'course_requests'), newGrant);
      onToast(`Successfully created ${expiryOption === '1month' ? '1 Month' : '1 Year'} Access ID for ${email}!`, 'success');
      setStudentEmail('');
    } catch (err: any) {
      console.error(err);
      onToast('Failed to create Course ID access grant: ' + err.message, 'error');
    } finally {
      setCreatingGrant(false);
    }
  };

  // Generate unique alphanumeric key like AI45NP
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingGrant(true);
    setNewlyGeneratedCode(null);

    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'AI';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Ensure uniqueness
    let code = generateCode();
    let attempts = 0;
    while (keys.some(k => k.code === code) && attempts < 10) {
      code = generateCode();
      attempts++;
    }

    const targetCourse = selectedKeyCourseId === 'all' ? null : COURSES.find(c => c.id === selectedKeyCourseId);
    const courseTitle = selectedKeyCourseId === 'all' ? 'All Courses' : (targetCourse?.title || '');

    const newKey: ActivationKey = {
      id: code,
      code: code,
      status: 'unused',
      duration: expiryOption,
      courseId: selectedKeyCourseId,
      courseTitle: courseTitle,
      createdAt: Date.now()
    };

    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('activation_keys');
        let allKeys: ActivationKey[] = [];
        if (localData) {
          try { allKeys = JSON.parse(localData); } catch (e) {}
        }
        allKeys.push(newKey);
        localStorage.setItem('activation_keys', JSON.stringify(allKeys));
        window.dispatchEvent(new Event('storage'));
        setKeys(allKeys.sort((a, b) => b.createdAt - a.createdAt));
        setNewlyGeneratedCode(code);
        onToast(`Successfully generated Code ${code}!`, 'success');
      } catch (err) {
        console.error(err);
        onToast('Failed to save key locally.', 'error');
      } finally {
        setCreatingGrant(false);
      }
      return;
    }

    try {
      await setDoc(doc(db, 'activation_keys', code), newKey);
      
      // Cache in localStorage for robust offline evaluation and seamless testing across modules
      try {
        const localData = localStorage.getItem('activation_keys');
        let allKeys: ActivationKey[] = [];
        if (localData) {
          try { allKeys = JSON.parse(localData); } catch (e) {}
        }
        allKeys.push(newKey);
        localStorage.setItem('activation_keys', JSON.stringify(allKeys));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.warn("Failed to cache generated key in localStorage:", e);
      }

      setNewlyGeneratedCode(code);
      onToast(`Successfully generated Code ${code}!`, 'success');
    } catch (err: any) {
      console.error(err);
      onToast('Failed to generate key: ' + err.message, 'error');
    } finally {
      setCreatingGrant(false);
    }
  };

  // Delete an activation key
  const handleDeleteKey = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete the key "${code}"?`)) return;

    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('activation_keys');
        if (localData) {
          let allKeys: ActivationKey[] = JSON.parse(localData);
          allKeys = allKeys.filter(k => k.code !== code);
          localStorage.setItem('activation_keys', JSON.stringify(allKeys));
          window.dispatchEvent(new Event('storage'));
          setKeys(allKeys.sort((a, b) => b.createdAt - a.createdAt));
          onToast(`Key ${code} deleted successfully.`, 'success');
        }
      } catch (err) {
        console.error(err);
        onToast('Failed to delete key offline.', 'error');
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'activation_keys', code));
      
      // Sync deletion in localStorage cache as well
      try {
        const localData = localStorage.getItem('activation_keys');
        if (localData) {
          let allKeys: ActivationKey[] = JSON.parse(localData);
          allKeys = allKeys.filter(k => k.code !== code);
          localStorage.setItem('activation_keys', JSON.stringify(allKeys));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {}

      onToast(`Key ${code} deleted successfully.`, 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to delete key.', 'error');
    }
  };

  // Copy activation key to clipboard
  const handleCopyKey = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(code);
    onToast(`Copied key "${code}" to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Stats calculations
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const declinedCount = requests.filter(r => r.status === 'declined').length;

  // Filter and search requests
  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = req.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.courseId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
      
      {/* Admin Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-8">
        <div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Administrator Mode Active
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900">
            Course Access Dashboard
          </h3>
          <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
            Real-time control center to create, manage, and verify student course subscription licenses.
          </p>
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex border-b border-slate-100 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('keys')}
          className={`pb-4 text-xs md:text-sm font-black transition relative cursor-pointer ${
            activeTab === 'keys' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🔑 Premium License Keys
          {activeTab === 'keys' && (
            <motion.div layoutId="adminActiveSubTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-700" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('legacy')}
          className={`pb-4 text-xs md:text-sm font-black transition relative cursor-pointer ${
            activeTab === 'legacy' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          📋 Legacy Course Requests
          {activeTab === 'legacy' && (
            <motion.div layoutId="adminActiveSubTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-700" />
          )}
        </button>
      </div>

      {/* TAB 1: Unique Activation/License Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-8">
          {/* Form to Auto-Generate unique keys */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-purple-700" />
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Generate Unique Alphanumeric License Code
              </h4>
            </div>

            <form onSubmit={handleGenerateKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Course / Access</label>
                <select
                  value={selectedKeyCourseId}
                  onChange={(e) => setSelectedKeyCourseId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs outline-hidden transition font-semibold"
                >
                  <option value="all">🌟 All Courses (Premium Bundle)</option>
                  {COURSES.map(course => (
                    <option key={course.id} value={course.id}>
                      📚 {course.title} ({course.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Premium License Duration</label>
                <select
                  value={expiryOption}
                  onChange={(e) => setExpiryOption(e.target.value as '1month' | '1year')}
                  className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs outline-hidden transition font-semibold"
                >
                  <option value="1month">1 Month Premium Access (30 Days)</option>
                  <option value="1year">1 Year Premium Access (365 Days)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={creatingGrant}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-md shadow-purple-600/10 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  {creatingGrant ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Generate Key
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="text-[10px] text-slate-400 mt-2.5 font-medium">
              Note: Clicking "Generate Key" instantly creates an unused, random key (e.g., <strong>AI45NP</strong>) tied to either a specific course or all courses. Give this code to any student; once redeemed, the chosen course access unlocks for them, and their registered email is recorded below!
            </p>
          </div>

          {/* Newly Generated Code banner */}
          <AnimatePresence>
            {newlyGeneratedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase block">New License Key Ready to Send</span>
                    <strong className="text-lg md:text-xl font-mono font-black text-slate-900 tracking-wider">
                      {newlyGeneratedCode}
                    </strong>
                    <span className="text-xs text-slate-500 font-medium ml-2">
                      ({expiryOption === '1month' ? '1 Month Access' : '1 Year Access'})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyKey(newlyGeneratedCode)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  {copiedKey === newlyGeneratedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === newlyGeneratedCode ? 'Copied!' : 'Copy Key'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* License Key List & Premium Accounts Search Row */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-700" />
                Active Premium Keys & Members ({keys.length})
              </h4>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyQuery}
                  onChange={(e) => setSearchKeyQuery(e.target.value)}
                  placeholder="Search code or student email..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl pl-9 pr-4 py-2 text-xs outline-hidden transition font-medium"
                />
              </div>
            </div>

            {/* Keys Table / List */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-xs">
              {keys.length === 0 ? (
                <div className="py-12 text-center">
                  <Key className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-bold">No Premium Keys generated yet</p>
                  <p className="text-slate-400 text-xs mt-1">Select an expiry and generate one above!</p>
                </div>
              ) : (() => {
                const filteredKeys = keys.filter(k => 
                  k.code.toLowerCase().includes(searchKeyQuery.toLowerCase()) ||
                  (k.claimedByEmail || '').toLowerCase().includes(searchKeyQuery.toLowerCase())
                );

                if (filteredKeys.length === 0) {
                  return (
                    <div className="py-12 text-center">
                      <p className="text-slate-500 text-xs font-bold">No keys match "{searchKeyQuery}"</p>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100">
                    {filteredKeys.map((k) => {
                      const isExpired = k.expiresAt ? Date.now() > k.expiresAt : false;
                      return (
                        <div key={k.id} className="p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/40 transition">
                          
                          {/* Code details */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                                {k.code}
                              </span>
                              <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md font-extrabold uppercase">
                                {k.duration === '1month' ? '1 Month Access' : '1 Year Access'}
                              </span>
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-extrabold uppercase">
                                📚 {k.courseTitle || 'All Courses'}
                              </span>
                              
                              {/* Status Badge */}
                              {k.status === 'unused' ? (
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/40">
                                  Unused / Ready
                                </span>
                              ) : (
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                  isExpired 
                                    ? 'text-rose-700 bg-rose-50 border-rose-200/40' 
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200/40'
                                }`}>
                                  {isExpired ? 'Expired Subscription' : 'Claimed & Active'}
                                </span>
                              )}
                            </div>

                            {/* Claims Info */}
                            {k.status === 'used' && (
                              <div className="space-y-1">
                                <p className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                                  <span>🎓 Member Email:</span>
                                  <span className="text-slate-900 font-bold underline decoration-purple-200">{k.claimedByEmail}</span>
                                </p>
                                <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-3 flex-wrap">
                                  <span>Claimed On: {k.claimedAt ? new Date(k.claimedAt).toLocaleString() : 'N/A'}</span>
                                  {k.expiresAt && (
                                    <span className={isExpired ? 'text-rose-600' : 'text-slate-600'}>
                                      {isExpired 
                                        ? `Expired: ${new Date(k.expiresAt).toLocaleDateString()}`
                                        : `Expires: ${new Date(k.expiresAt).toLocaleDateString()} (${Math.ceil((k.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} days left)`
                                      }
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}

                            {k.status === 'unused' && (
                              <p className="text-[10px] text-slate-400 font-medium">
                                Created on {new Date(k.createdAt).toLocaleDateString()}. Give this code to student for premium access.
                              </p>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {k.status === 'unused' && (
                              <button
                                onClick={() => handleCopyKey(k.code)}
                                className="p-2 text-slate-500 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg transition cursor-pointer"
                                title="Copy Key"
                              >
                                {copiedKey === k.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteKey(k.code)}
                              className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition cursor-pointer"
                              title="Delete Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Legacy manual Course Requests */}
      {activeTab === 'legacy' && (
        <>
          {/* Direct Course Access Creator Form (Admin Only Feature) */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 mb-8">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              🔑 Create Premium Course ID License (Access Grant)
            </h4>
            
            <form onSubmit={handleCreateGrant} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Email input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student Email</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs outline-hidden transition"
                />
              </div>

              {/* Course select */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs outline-hidden transition"
                >
                  {COURSES.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiration Select */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Expiration Period</label>
                <select
                  value={expiryOption}
                  onChange={(e) => setExpiryOption(e.target.value as '1month' | '1year')}
                  className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs outline-hidden transition font-semibold"
                >
                  <option value="1month">1 Month Expiry (30 Days)</option>
                  <option value="1year">1 Year Expiry (365 Days)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-1">
                <button
                  type="submit"
                  disabled={creatingGrant}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-md shadow-purple-600/10 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  {creatingGrant ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Generate License Key'
                  )}
                </button>
              </div>
            </form>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Note: This instantly grants access to the specified email for <strong>1 Month</strong> or <strong>1 Year</strong>. The student can log in using Google or normal login to view it instantly!
            </p>
          </div>

          {/* Stats Counter Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
              <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-1">Total Requests</span>
              <strong className="text-2xl md:text-3xl font-black text-slate-900">{totalCount}</strong>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-center">
              <span className="text-amber-500 block text-[10px] font-black uppercase tracking-wider mb-1">Pending Approval</span>
              <strong className="text-2xl md:text-3xl font-black text-amber-700">{pendingCount}</strong>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 text-center">
              <span className="text-emerald-500 block text-[10px] font-black uppercase tracking-wider mb-1">Approved/Unlocked</span>
              <strong className="text-2xl md:text-3xl font-black text-emerald-700">{acceptedCount}</strong>
            </div>

            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-100 text-center">
              <span className="text-rose-500 block text-[10px] font-black uppercase tracking-wider mb-1">Declined</span>
              <strong className="text-2xl md:text-3xl font-black text-rose-700">{declinedCount}</strong>
            </div>

          </div>

          {/* Filters and Search Bar Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email, course title..."
                className="w-full bg-white border border-slate-200 focus:border-purple-500 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-hidden transition"
              />
            </div>

            {/* Filter status buttons */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-400 font-bold shrink-0 mr-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {(['all', 'pending', 'accepted', 'declined'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition capitalize shrink-0 cursor-pointer ${
                    filterStatus === status
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-150'
                  }`}
                >
                  {status === 'all' ? 'Show All' : status}
                </button>
              ))}
            </div>

          </div>

          {/* Main Request Log List */}
          <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-xs">
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-xs font-semibold">Listening to Firestore changes...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-20 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-bold">No requests found matching your search</p>
                <p className="text-slate-400 text-xs mt-1">Check alternate status filters or add a mock request above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/40 transition duration-150"
                  >
                    
                    {/* Left side: Student details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm md:text-base text-slate-900 block truncate">
                          {req.userEmail}
                        </strong>
                        
                        {/* Status Badge */}
                        {req.status === 'pending' && (
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/40">
                            Pending Verification
                          </span>
                        )}
                        {req.status === 'accepted' && (
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                            req.expiresAt && Date.now() > req.expiresAt
                              ? 'text-rose-700 bg-rose-50 border-rose-200/40'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200/40'
                          }`}>
                            {req.expiresAt && Date.now() > req.expiresAt ? 'Expired Subscription' : 'Approved & Active'}
                          </span>
                        )}
                        {req.status === 'declined' && (
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/40">
                            Declined
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold flex-wrap">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                          {req.courseTitle} (<span className="font-mono text-[10px]">{req.courseId}</span>)
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Created: {new Date(req.requestedAt).toLocaleDateString()}
                        </span>
                        {req.expiresAt && (
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm ${
                            Date.now() > req.expiresAt ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {Date.now() > req.expiresAt 
                              ? `Expired on: ${new Date(req.expiresAt).toLocaleDateString()}`
                              : `Expires: ${new Date(req.expiresAt).toLocaleDateString()} (${Math.ceil((req.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} days left)`
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: Action triggers */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-none border-slate-100">
                      
                      {/* Approve */}
                      {req.status !== 'accepted' && (
                        <button
                          onClick={() => handleAccept(req.id, req.userEmail, req.courseTitle)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve Access
                        </button>
                      )}

                      {/* Decline */}
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleDecline(req.id, req.userEmail)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-500" /> Decline
                        </button>
                      )}

                      {/* Delete log */}
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                        title="Delete log record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
