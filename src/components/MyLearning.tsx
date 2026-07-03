import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  Send, 
  Play, 
  Tv, 
  Clock, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  Check, 
  ListRestart,
  Sparkles,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  getDocs,
  limit,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COURSES } from '../data';
import { Course, CourseRequest, CourseVideo, ActivationKey } from '../types';

interface MyLearningProps {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function MyLearning({ user, onToast }: MyLearningProps) {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [typedCourseId, setTypedCourseId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const [claimedKeys, setClaimedKeys] = useState<ActivationKey[]>([]);
  
  // Video player state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);

  // Subscribe to real-time requests for this user
  useEffect(() => {
    const userEmailNormalized = (user.email || '').toLowerCase().trim();

    if (useLocalFallback) {
      const loadLocal = () => {
        const localData = localStorage.getItem('course_requests');
        if (localData) {
          try {
            const allReqs: CourseRequest[] = JSON.parse(localData);
            setRequests(allReqs.filter(r => r.userEmail.toLowerCase() === userEmailNormalized));
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
        collection(db, 'course_requests'),
        where('userEmail', '==', userEmailNormalized)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedRequests: CourseRequest[] = [];
        snapshot.forEach((doc) => {
          fetchedRequests.push({ id: doc.id, ...doc.data() } as CourseRequest);
        });
        setRequests(fetchedRequests);
      }, (error) => {
        console.warn("Firestore access error/denied. Falling back to localStorage:", error);
        setUseLocalFallback(true);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Failed to subscribe to Firestore. Using local storage fallback:", err);
      setUseLocalFallback(true);
    }
  }, [user, useLocalFallback]);

  // Subscribe to claimed keys for this user
  useEffect(() => {
    const userEmailNormalized = (user.email || '').toLowerCase().trim();

    if (useLocalFallback) {
      const loadLocal = () => {
        const localData = localStorage.getItem('activation_keys');
        if (localData) {
          try {
            const allKeys: ActivationKey[] = JSON.parse(localData);
            setClaimedKeys(allKeys.filter(k => (k.claimedByEmail || '').toLowerCase().trim() === userEmailNormalized));
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
        where('claimedByEmail', '==', userEmailNormalized)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedKeys: ActivationKey[] = [];
        snapshot.forEach((doc) => {
          fetchedKeys.push({ id: doc.id, ...doc.data() } as ActivationKey);
        });
        setClaimedKeys(fetchedKeys);
      }, (error) => {
        console.warn("Firestore claimed activation_keys access error/denied. Falling back to localStorage:", error);
        setUseLocalFallback(true);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Failed to subscribe to claimed activation_keys. Using localStorage:", err);
      setUseLocalFallback(true);
    }
  }, [user, useLocalFallback]);

  const handleRequestAccess = async (e: FormEvent, selectedId?: string) => {
    e.preventDefault();
    const courseId = (selectedId || typedCourseId).trim().toLowerCase();
    
    if (!courseId) {
      onToast('Please enter or select a Course ID.', 'error');
      return;
    }

    const course = COURSES.find(c => c.id.toLowerCase() === courseId);
    if (!course) {
      onToast(`Course ID "${courseId}" does not exist. Available IDs are: ` + COURSES.map(c => c.id).join(', '), 'error');
      return;
    }

    // Check if request already exists
    const existing = requests.find(r => r.courseId === course.id);
    if (existing) {
      if (existing.status === 'accepted') {
        onToast(`You already have access to this course! Check below.`, 'info');
      } else if (existing.status === 'pending') {
        onToast(`Your request is pending admin approval. You can also nudge them on WhatsApp!`, 'info');
      } else {
        onToast(`Your request was declined. Please contact support via WhatsApp.`, 'error');
      }
      return;
    }

    setSubmitting(true);

    if (useLocalFallback) {
      try {
        const newReq: CourseRequest = {
          id: `local-${Date.now()}`,
          userId: user.uid,
          userEmail: user.email || 'demo@student.com',
          courseId: course.id,
          courseTitle: course.title,
          status: 'pending',
          requestedAt: Date.now()
        };
        const localData = localStorage.getItem('course_requests');
        let allReqs: CourseRequest[] = [];
        if (localData) {
          try { allReqs = JSON.parse(localData); } catch (e) {}
        }
        allReqs.push(newReq);
        localStorage.setItem('course_requests', JSON.stringify(allReqs));
        window.dispatchEvent(new Event('storage'));
        
        onToast(`Request submitted for "${course.title}"! (Saved to Offline Storage)`, 'success');
        setTypedCourseId('');
      } catch (err) {
        console.error(err);
        onToast('Failed to submit request locally.', 'error');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      await addDoc(collection(db, 'course_requests'), {
        userId: user.uid,
        userEmail: user.email || 'unknown',
        courseId: course.id,
        courseTitle: course.title,
        status: 'pending',
        requestedAt: Date.now()
      });

      onToast(`Request submitted successfully for "${course.title}"!`, 'success');
      setTypedCourseId('');
    } catch (err: any) {
      console.error(err);
      // Let's fallback to local saving if Firestore write fails too!
      try {
        const newReq: CourseRequest = {
          id: `local-${Date.now()}`,
          userId: user.uid,
          userEmail: user.email || 'demo@student.com',
          courseId: course.id,
          courseTitle: course.title,
          status: 'pending',
          requestedAt: Date.now()
        };
        const localData = localStorage.getItem('course_requests');
        let allReqs: CourseRequest[] = [];
        if (localData) {
          try { allReqs = JSON.parse(localData); } catch (e) {}
        }
        allReqs.push(newReq);
        localStorage.setItem('course_requests', JSON.stringify(allReqs));
        window.dispatchEvent(new Event('storage'));
        setUseLocalFallback(true);
        onToast(`Submitted request successfully for "${course.title}" (Switched to local persistence)!`, 'success');
        setTypedCourseId('');
      } catch (innerErr) {
        onToast('Failed to submit request. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Redeem unique Alphanumeric Activation/License key code
  const handleRedeemKey = async (e: FormEvent) => {
    e.preventDefault();
    const code = activationCode.trim().toUpperCase();
    if (!code) {
      onToast('Please enter your 6-character activation code.', 'error');
      return;
    }

    setRedeeming(true);

    if (useLocalFallback) {
      try {
        const localData = localStorage.getItem('activation_keys');
        let allKeys: ActivationKey[] = [];
        if (localData) {
          try { allKeys = JSON.parse(localData); } catch (err) {}
        }

        const foundIdx = allKeys.findIndex(k => k.code.toUpperCase() === code);
        if (foundIdx === -1) {
          onToast('Invalid Activation Code. Please check spelling.', 'error');
          return;
        }

        const keyObj = allKeys[foundIdx];
        if (keyObj.status !== 'unused') {
          onToast('This activation code has already been redeemed.', 'error');
          return;
        }

        // Redeem key
        const updatedKey: ActivationKey = {
          ...keyObj,
          status: 'used',
          claimedByEmail: (user.email || 'demo@student.com').toLowerCase().trim(),
          claimedByUid: user.uid,
          claimedAt: Date.now(),
          expiresAt: Date.now() + (keyObj.duration === '1month' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)
        };

        allKeys[foundIdx] = updatedKey;
        localStorage.setItem('activation_keys', JSON.stringify(allKeys));
        window.dispatchEvent(new Event('storage'));
        
        // Refresh local state
        const userEmailNormalized = (user.email || '').toLowerCase().trim();
        setClaimedKeys(allKeys.filter(k => (k.claimedByEmail || '').toLowerCase().trim() === userEmailNormalized));
        
        const successLabel = keyObj.courseId === 'all'
          ? 'All Courses Premium Membership Unlocked!'
          : `"${keyObj.courseTitle || 'Course'}" Course Unlocked!`;
        onToast(`Premium Activation Successful! ${successLabel} (${keyObj.duration === '1month' ? '1 Month' : '1 Year'} Access)`, 'success');
        setActivationCode('');
      } catch (err) {
        console.error(err);
        onToast('Failed to redeem activation key offline.', 'error');
      } finally {
        setRedeeming(false);
      }
      return;
    }

    try {
      const keyRef = doc(db, 'activation_keys', code);
      const snap = await getDoc(keyRef);
      if (!snap.exists()) {
        onToast('Invalid Activation Code. Please verify spelling.', 'error');
        return;
      }

      const keyObj = snap.data() as ActivationKey;
      if (keyObj.status !== 'unused') {
        onToast('This activation code has already been redeemed.', 'error');
        return;
      }

      const durationMs = keyObj.duration === '1month' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
      const expiresAt = Date.now() + durationMs;

      // Update in firestore
      await updateDoc(keyRef, {
        status: 'used',
        claimedByEmail: (user.email || 'unknown').toLowerCase().trim(),
        claimedByUid: user.uid,
        claimedAt: Date.now(),
        expiresAt: expiresAt
      });

      const successLabel = keyObj.courseId === 'all'
        ? 'All Courses Premium Membership Unlocked!'
        : `"${keyObj.courseTitle || 'Course'}" Course Unlocked!`;
      onToast(`Premium Activation Successful! ${successLabel} (${keyObj.duration === '1month' ? '1 Month' : '1 Year'} Access)`, 'success');
      setActivationCode('');
    } catch (err: any) {
      console.warn("Firestore key redemption error, attempting local recovery:", err);
      
      // Fallback to offline local storage redemption if client is offline or has connection issues
      try {
        const localData = localStorage.getItem('activation_keys');
        let allKeys: ActivationKey[] = [];
        if (localData) {
          try { allKeys = JSON.parse(localData); } catch (e) {}
        }

        const foundIdx = allKeys.findIndex(k => k.code.toUpperCase() === code);
        if (foundIdx !== -1) {
          const keyObj = allKeys[foundIdx];
          if (keyObj.status !== 'unused') {
            onToast('This activation code has already been redeemed.', 'error');
            return;
          }

          // Redeem key locally
          const updatedKey: ActivationKey = {
            ...keyObj,
            status: 'used',
            claimedByEmail: (user.email || 'demo@student.com').toLowerCase().trim(),
            claimedByUid: user.uid,
            claimedAt: Date.now(),
            expiresAt: Date.now() + (keyObj.duration === '1month' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)
          };

          allKeys[foundIdx] = updatedKey;
          localStorage.setItem('activation_keys', JSON.stringify(allKeys));
          window.dispatchEvent(new Event('storage'));

          // Refresh local state
          const userEmailNormalized = (user.email || '').toLowerCase().trim();
          setClaimedKeys(allKeys.filter(k => (k.claimedByEmail || '').toLowerCase().trim() === userEmailNormalized));

          const successLabel = keyObj.courseId === 'all'
            ? 'All Courses Premium Membership Unlocked!'
            : `"${keyObj.courseTitle || 'Course'}" Course Unlocked!`;
          
          onToast(`[Offline Recovery] Activation Successful! ${successLabel} (${keyObj.duration === '1month' ? '1 Month' : '1 Year'} Access)`, 'success');
          setActivationCode('');
          setUseLocalFallback(true); // Switch to local fallback for better offline UX
          return;
        }
      } catch (localErr) {
        console.error("Local recovery check failed:", localErr);
      }

      onToast('Failed to redeem key: ' + err.message, 'error');
    } finally {
      setRedeeming(false);
    }
  };

  // Logout trigger
  const handleLogout = async () => {
    await signOut(auth);
    onToast('Logged out successfully.', 'info');
  };

  // Helper to check access status of a course
  const getRequestStatus = (courseId: string) => {
    const req = requests.find(r => r.courseId === courseId);
    return req ? req.status : null;
  };

  // Open course in player
  const startLearning = (course: Course) => {
    setActiveCourse(course);
    if (course.videos && course.videos.length > 0) {
      setActiveVideo(course.videos[0]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
      
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-8">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-1">
            Student Dashboard
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            तपाईंलाई स्वागत छ, {user.displayName || user.email?.split('@')[0]}! 👋
          </h3>
          <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
            Logged in as: <span className="text-slate-800 font-semibold">{user.email}</span>
          </p>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer border border-rose-100"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Immersive Landscape Fullscreen Video Theater Player */}
      <AnimatePresence>
        {activeCourse && activeVideo && (() => {
          const currentIndex = activeCourse.videos.findIndex(v => v.title === activeVideo.title);
          const hasPrev = currentIndex > 0;
          const hasNext = currentIndex < activeCourse.videos.length - 1;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950 z-50 flex flex-col md:flex-row h-screen w-screen overflow-hidden text-slate-100 font-sans"
            >
              {/* Left Cinema Frame Area */}
              <div className="flex-1 flex flex-col justify-between bg-black h-2/3 md:h-full relative overflow-hidden">
                
                {/* Cinema Top Control Bar */}
                <div className="bg-slate-950/80 backdrop-blur-md px-4 py-3 border-b border-slate-900 flex items-center justify-between z-10">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-700/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 font-bold text-xs">
                      AI
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-widest font-black text-purple-400">
                        {activeCourse.title}
                      </span>
                      <h4 className="text-xs md:text-sm font-bold text-slate-100 truncate">
                        Lecture {currentIndex + 1}: {activeVideo.title}
                      </h4>
                    </div>
                  </div>

                  {/* Right tools and close */}
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-500/20">
                      ✓ Premium Stream Locked
                    </span>
                    <button
                      onClick={() => {
                        setActiveCourse(null);
                        setActiveVideo(null);
                      }}
                      className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition duration-200 cursor-pointer border border-slate-800"
                      title="Close Player"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Landscape Screen Rotation Suggestion Notification on mobile */}
                <div className="block md:hidden text-center bg-purple-950/90 py-1.5 px-3 text-[10px] font-semibold text-purple-300 border-b border-purple-900/30">
                  🔄 Rotate device for full-width landscape viewing!
                </div>

                {/* Video Container (Aspect Ratio Guarded) */}
                <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-slate-950 relative">
                  <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-purple-950/10 border border-slate-900 relative">
                    <iframe
                      src={activeVideo.videoUrl.includes('drive.google.com')
                        ? activeVideo.videoUrl.replace(/\/view(\?.*)?$/, '/preview').replace(/\/view.*/, '/preview')
                        : `${activeVideo.videoUrl}?autoplay=1&rel=0`
                      }
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-none"
                    />
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="bg-slate-950/90 border-t border-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Duration: {activeVideo.duration}</span>
                    <span className="text-slate-600">•</span>
                    <span>Lecture {currentIndex + 1} of {activeCourse.videos.length}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      disabled={!hasPrev}
                      onClick={() => setActiveVideo(activeCourse.videos[currentIndex - 1])}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                        hasPrev 
                          ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 cursor-pointer' 
                          : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      disabled={!hasNext}
                      onClick={() => setActiveVideo(activeCourse.videos[currentIndex + 1])}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                        hasNext 
                          ? 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-800 cursor-pointer' 
                          : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Sidebar: Playlist (Zero drive links shown) */}
              <div className="w-full md:w-80 h-1/3 md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
                  <h5 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-purple-400" /> Lectures List ({activeCourse.videos.length})
                  </h5>
                  <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md">
                    Playlist
                  </span>
                </div>

                {/* Playlist Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {activeCourse.videos.map((vid, idx) => {
                    const isActive = activeVideo.title === vid.title;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveVideo(vid)}
                        className={`w-full text-left p-3 rounded-xl transition duration-200 flex items-start gap-3 border ${
                          isActive 
                            ? 'bg-purple-950/50 border-purple-700/60 text-white shadow-lg shadow-purple-950/20' 
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-950/70'
                        }`}
                      >
                        <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black ${
                          isActive ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-xs font-extrabold leading-snug truncate ${isActive ? 'text-purple-300' : 'text-slate-200'}`}>
                            {vid.title}
                          </span>
                          <span className="block text-[9px] font-bold text-slate-400 mt-1">
                            {vid.duration}
                          </span>
                        </div>
                        {isActive ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping mt-1.5 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-1 text-slate-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Premium Key Redemption Section */}
      <div className="mb-8 p-5 md:p-6 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-pink-50/70 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-950 text-sm md:text-base flex items-center gap-1.5">
              प्रिमियम कोड सुचारु गर्नुहोस् <span className="text-xs font-semibold text-purple-700 font-mono bg-purple-100/50 px-2 py-0.5 rounded-md">Redeem License</span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 font-medium leading-relaxed max-w-xl">
              Have a unique activation code (e.g. <strong>AI45NP</strong>) from payment? Enter it here to claim instant course access or full premium membership!
            </p>
          </div>
        </div>

        <form onSubmit={handleRedeemKey} className="flex gap-2.5 w-full md:w-auto shrink-0">
          <input
            type="text"
            required
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            placeholder="e.g. AI45NP"
            className="bg-white border border-slate-250 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-xs font-mono font-black tracking-widest text-slate-950 uppercase outline-hidden transition flex-1 md:w-36 text-center shadow-2xs"
          />
          <button
            type="submit"
            disabled={redeeming}
            className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white font-extrabold px-5 py-2.5 rounded-xl transition text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow-md shadow-purple-600/10"
          >
            {redeeming ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Redeem Code'
            )}
          </button>
        </form>
      </div>

      {/* Access requests panel and instruction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Subscription details / Expiration Status */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-black text-slate-950 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-700" />
              Course Subscription Status
            </h4>
            <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed">
              Your active premium licenses and access expiration dates, managed securely by AI Clipzone administrators.
            </p>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {(() => {
                const usedKeys = claimedKeys.filter(k => k.status === 'used');
                const hasAnyActive = usedKeys.length > 0 || requests.filter(r => r.status === 'accepted').length > 0;

                if (!hasAnyActive) {
                  return (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-semibold">No active subscriptions registered yet.</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Premium Keys Access Badges */}
                    {usedKeys.map((key) => {
                      const isExpired = key.expiresAt ? Date.now() > key.expiresAt : false;
                      const isAll = key.courseId === 'all';
                      return (
                        <div key={key.id} className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between gap-3 shadow-xs">
                          <div className="min-w-0">
                            <strong className="block text-xs font-black text-purple-950 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-700" />
                              {isAll ? 'All-Courses Premium Membership' : (key.courseTitle || 'Premium Course Access')}
                            </strong>
                            <span className="block text-[10px] text-purple-500 font-mono mt-0.5">
                              Code: {key.code}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2.5 py-1 rounded-md border border-purple-200">
                                {isAll ? 'Premium Unlimited' : 'Course Active'}
                              </span>
                            )}
                            {key.expiresAt && (
                              <span className="block text-[9px] text-purple-500 font-bold mt-1">
                                {isExpired ? 'Ended:' : 'Expires:'} {new Date(key.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Individual legacy course requests */}
                    {requests.filter(r => r.status === 'accepted').map((req, i) => {
                      const isExpired = req.expiresAt ? Date.now() > req.expiresAt : false;
                      return (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-3 shadow-xs">
                          <div className="min-w-0">
                            <strong className="block text-xs font-bold text-slate-900 truncate">
                              {req.courseTitle}
                            </strong>
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {req.courseId}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                Active
                              </span>
                            )}
                            {req.expiresAt && (
                              <span className="block text-[9px] text-slate-400 font-bold mt-1">
                                {isExpired ? 'Ended:' : 'Expires:'} {new Date(req.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Support & Purchase instructions */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-black text-slate-950 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              How to Purchase or Renew?
            </h4>
            <p className="text-slate-500 text-xs md:text-sm mb-4 leading-relaxed">
              Course access is granted instantly for either **1 Month** or **1 Year** subscription cycles. To purchase a new course or renew an expired subscription:
            </p>
            
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium mb-6">
              <li className="flex gap-2">
                <span className="text-purple-600">🇳🇵</span> 
                <span>eSewa or Khalti मार्फत सुरक्षित भुक्तानी गर्नुहोस्।</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">💬</span> 
                <span>भुक्तानीको स्क्रीनसट हाम्रो आधिकारिक WhatsApp नम्बरमा पठाउनुहोस्।</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">⚡</span> 
                <span>हाम्रो टिमले १ मिनेटभित्रै तपाईंको इमेलमा लाइसेन्स थपिदिनेछ!</span>
              </li>
            </ul>
          </div>
          
          <a
            href="https://wa.me/9779763323268?text=Hello%20AI%20Clipzone!%20I%20would%20like%20to%20purchase%20or%20renew%20a%20course%20license."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 text-xs animate-pulse"
          >
            💬 Contact Admin on WhatsApp
          </a>
        </div>

      </div>

      {/* My Learning Courses Catalog (Filtered to Unlocked/Approved) */}
      <div className="pt-6 border-t border-slate-100">
        <h4 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-700" />
          तपाईंका स्वीकृत प्रिमियम कोर्षहरू (Your Unlocked Courses)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(() => {
            // Generate licenses from all claimed used keys (and support expiration checks)
            const keyLicenses: CourseRequest[] = [];
            claimedKeys.filter(k => k.status === 'used').forEach(key => {
              if (key.courseId === 'all') {
                COURSES.forEach(course => {
                  keyLicenses.push({
                    id: `key-virtual-${key.code}-${course.id}`,
                    userId: user.uid,
                    userEmail: user.email || '',
                    courseId: course.id,
                    courseTitle: course.title,
                    status: 'accepted' as const,
                    requestedAt: key.claimedAt || Date.now(),
                    expiresAt: key.expiresAt
                  });
                });
              } else if (key.courseId) {
                const targetCourse = COURSES.find(c => c.id === key.courseId);
                if (targetCourse) {
                  keyLicenses.push({
                    id: `key-virtual-${key.code}-${targetCourse.id}`,
                    userId: user.uid,
                    userEmail: user.email || '',
                    courseId: targetCourse.id,
                    courseTitle: targetCourse.title,
                    status: 'accepted' as const,
                    requestedAt: key.claimedAt || Date.now(),
                    expiresAt: key.expiresAt
                  });
                }
              }
            });

            const myApprovedLicenses = [
              ...requests.filter(r => r.status === 'accepted'),
              ...keyLicenses
            ];

            const myCourses = COURSES.filter(course => 
              myApprovedLicenses.some(license => license.courseId === course.id)
            );

            if (myCourses.length === 0) {
              return (
                <div className="col-span-full py-16 text-center bg-slate-50 border border-slate-100 rounded-2xl p-8 max-w-xl mx-auto w-full">
                  <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h5 className="font-extrabold text-slate-900 text-lg mb-2">No Active Courses Found</h5>
                  <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed">
                    तपाईंको इमेल (<span className="font-semibold text-slate-700">{user.email}</span>) मा कुनै पनि सक्रिय कोर्ष थपिएको छैन। कृपया हाम्रो प्रिमियम कोर्ष खरिद गर्न वा नवीकरण गर्न WhatsApp मा सम्पर्क गर्नुहोस्।
                  </p>
                  <a
                    href={`https://wa.me/9779763323268?text=Hello%20AI%20Clipzone!%20My%20email%20is%20${encodeURIComponent(user.email || '')}%20and%20I%20would%20like%20to%20get%20access%20to%20the%20AI%20courses.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-6 py-3.5 rounded-xl transition duration-200 cursor-pointer text-xs"
                  >
                    💬 Request Course Access on WhatsApp
                  </a>
                </div>
              );
            }

            return myCourses.map((course, idx) => {
              const license = myApprovedLicenses.find(r => r.courseId === course.id);
              const isExpired = license?.expiresAt ? Date.now() > license.expiresAt : false;

              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl border p-4 flex flex-col justify-between shadow-xs transition duration-200 ${
                    !isExpired 
                      ? 'border-emerald-500 hover:shadow-lg animate-fade-in' 
                      : 'border-rose-250 opacity-80 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 relative mb-4">
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className={`w-full h-full object-cover ${isExpired ? 'grayscale contrast-50' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                      {isExpired && (
                        <div className="absolute inset-0 bg-rose-950/20 flex items-center justify-center backdrop-blur-xs">
                          <div className="bg-rose-950/80 p-2.5 rounded-full border border-rose-500/30 text-white flex items-center gap-1.5 px-4 font-black text-[10px] uppercase tracking-wider">
                            <Lock className="w-4 h-4" /> Subscription Expired
                          </div>
                        </div>
                      )}
                    </div>

                    <h5 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">
                      {course.title}
                    </h5>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5 font-medium">
                      ID: <span className="font-mono font-bold text-slate-700">{course.id}</span>
                      {license?.expiresAt && (
                        <>
                          • 
                          <span className={isExpired ? 'text-rose-600 font-extrabold' : 'text-slate-500 font-semibold'}>
                            {isExpired 
                              ? `Expired on ${new Date(license.expiresAt).toLocaleDateString()}` 
                              : `Expires on ${new Date(license.expiresAt).toLocaleDateString()}`
                            }
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-xs">
                      {isExpired ? (
                        <span className="text-rose-600 font-extrabold flex items-center gap-1">
                          ⚠️ Access Suspended
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Unlocked & Active
                        </span>
                      )}
                    </div>

                    {!isExpired ? (
                      <button
                        onClick={() => startLearning(course)}
                        className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        <Play className="w-3 h-3 fill-white" /> Play Lectures
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/9779763323268?text=Hello%20AI%20Clipzone!%20My%20subscription%20for%20"${encodeURIComponent(course.title)}"%20has%20expired%20for%20my%20email%20${encodeURIComponent(user.email || '')}.%20I%20would%20like%20to%20renew%20it.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1 border border-rose-250"
                      >
                        🔄 Renew Access
                      </a>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

    </div>
  );
}
