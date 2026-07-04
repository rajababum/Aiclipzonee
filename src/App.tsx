import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Presentation, 
  GraduationCap, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle, 
  Send, 
  Facebook, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Headphones, 
  Star, 
  ChevronDown, 
  X, 
  Bot, 
  User, 
  Check,
  BookOpen
} from 'lucide-react';

import { COURSES, TESTIMONIALS, FAQS } from './data';
import { Course, ChatMessage } from './types';

export default function App() {
  // Course details modal state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // QR modal state
  const [showQrModal, setShowQrModal] = useState(false);
  // Canvas ref for FonePay QR
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // FAQ open indexes
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  // Carousel testimonial index
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveredCarousel, setIsHoveredCarousel] = useState(false);

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // Toast banner state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // AI Chat Assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'नमस्ते! 👋\nम AI Clipzone Assistant हुँ।\nCourse, price, payment, access आदि जुनसुकै प्रश्न सोध्नुहोस्।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Testimonial automated carousel
  useEffect(() => {
    if (isHoveredCarousel) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHoveredCarousel]);

  // Render QR Code inside canvas once QR modal opens
  useEffect(() => {
    if (showQrModal && selectedCourse && qrCanvasRef.current) {
      // payload from original code
      const qrPayload = "00020101021126350011fonepay.com071622226100158730565204527153035245802NP5915Prakash Store 16012Pokhariya MC62110707162568663048986";
      QRCode.toCanvas(
        qrCanvasRef.current,
        qrPayload,
        {
          width: 260,
          margin: 1,
          color: {
            dark: '#1e1b4b', // deep indigo/navy tone
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.error('Failed to generate FonePay QR code', error);
            showToast('QR Code generation failed. Please use WhatsApp instead.', 'error');
          }
        }
      );
    }
  }, [showQrModal, selectedCourse]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // Toggle single FAQ accordion
  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle contact form WhatsApp trigger
  const handleSendContactMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMsg.trim()) {
      showToast('कृपया तपाईंको नाम र सन्देश लेख्नुहोस्!', 'error');
      return;
    }
    const fullMessage = `Name: ${contactName}\nPhone: ${contactPhone}\nMessage: ${contactMsg}`;
    const whatsappUrl = `https://wa.me/9779763323268?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear inputs
    setContactName('');
    setContactPhone('');
    setContactMsg('');
    showToast('तपाईंको सन्देश WhatsApp मा पठाइयो।', 'success');
  };

  const getLocalAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    
    // Greeting
    if (q === 'hi' || q === 'hello' || q === 'namaste' || q.includes('नमस्ते') || q === 'hey') {
      return `नमस्ते! 🙏 AI Clipzone Nepal को आधिकारिक च्याटबोटमा यहाँलाई स्वागत छ। म यहाँलाई हाम्रा प्रिमियम AI कोर्षहरू खरिद गर्न र सिक्न मद्दत गर्नेछु। तपाईंलाई के सम्बन्धी जानकारी चाहिन्छ सोध्नुहोस्! 😊`;
    }

    // Pricing
    if (q.includes('price') || q.includes('कति') || q.includes('मूल्य') || q.includes('paisa') || q.includes('cost') || q.includes('rs') || q.includes('rupees') || q.includes('rate')) {
      return `हाम्रा प्रिमियम कोर्षहरू र तिनको विशेष अफर मूल्यहरू यस प्रकार छन्:<br/><br/>
      1. <strong>AI Master Class by Dhruv Rathee:</strong> मात्र Rs. 449 (Hindi, 30+ AI Tools)<br/>
      2. <strong>AI Video, Image & Song Creation:</strong> मात्र Rs. 350 (Nepali)<br/>
      3. <strong>AI Song Creation Course:</strong> मात्र Rs. 299 (Nepali/Hindi)<br/>
      4. <strong>AI Presentation Making Course:</strong> मात्र Rs. 199 (Nepali/Hindi, Slides Creator)<br/><br/>
      <i>सबै कोर्षहरूमा लाइफटाइम एक्सेस र सर्टिफिकेट उपलब्ध छ। खरिद गर्न कोर्ष कार्डको "Pay & Join Now" बटनमा क्लिक गर्नुहोस्!</i>`;
    }

    // Payment / How to buy / eSewa
    if (q.includes('payment') || q.includes('तिर्ने') || q.includes('किन्ने') || q.includes('buy') || q.includes('esewa') || q.includes('khalti') || q.includes('qr') || q.includes('pay') || q.includes('purchase')) {
      return `भुक्तानी गर्न अत्यन्तै सजिलो छ! तपाईंले <strong>eSewa, Khalti, IME Pay, वा Bank Transfer</strong> मार्फत FonePay QR स्क्यान गरेर तिर्न सक्नुहुन्छ। <br/><br/>
      <strong>प्रक्रिया:</strong><br/>
      १. कोर्ष सेक्सनमा गएर आफूलाई मनपर्ने कोर्षको <strong>"Pay & Join Now"</strong> बटन थिच्नुहोस्।<br/>
      २. त्यहाँ देखाइएको FonePay QR स्क्यान गरी तोकिएको शुल्क भुक्तानी गर्नुहोस्।<br/>
      ३. भुक्तानी गरिसकेपछि स्क्रीनसट हाम्रो आधिकारिक <strong>WhatsApp (976-3323268)</strong> मा पठाउनुहोस् र कोर्षको तत्काल पहुँच पाउनुहोस्।`;
    }

    // Contact / Support / WhatsApp / Phone
    if (q.includes('contact') || q.includes('whatsapp') || q.includes('फोन') || q.includes('नम्बर') || q.includes('phone') || q.includes('number') || q.includes('support') || q.includes('help')) {
      return `हाम्रो आधिकारिक सम्पर्क विवरणहरू यस प्रकार छन्:<br/>
      • <strong>WhatsApp:</strong> <a href="https://wa.me/9779763323268" target="_blank" class="text-purple-600 font-extrabold underline">976-3323268</a> (वा +977 9763323268)<br/>
      • <strong>सपोर्ट समय:</strong> २४/७ (तपाईं जुनसुकै बेला पनि म्यासेज पठाउन सक्नुहुन्छ)<br/><br/>
      तपाईंले भुक्तानी गरेपछि स्क्रीनसट यही WhatsApp नम्बरमा पठाउनुपर्नेछ।`;
    }

    // Recorded or Live
    if (q.includes('recorded') || q.includes('live') || q.includes('भिडियो') || q.includes('class') || q.includes('क्लास')) {
      return `हाम्रा सबै कोर्षहरू पूर्ण रूपमा <strong>Recorded HD Lectures</strong> हुन्। यसमा कुनै पनि Live Class को झन्झट छैन। तपाईंले आफ्नो फुर्सदको समयमा (बिहान, दिउँसो, वा राती) जुनसुकै बेला पनि सजिलै भिडियोहरू हेरेर सिक्न सक्नुहुन्छ र दोहोर्याएर हेर्न पनि पाउनुहुन्छ।`;
    }

    // Access or Lifetime
    if (q.includes('lifetime') || q.includes('एक्सेस') || q.includes('access') || q.includes('कति दिन') || q.includes('समय')) {
      return `हो! कोर्ष खरिद गरेपछि तपाईंले <strong>Lifetime Access (आजीवन पहुँच)</strong> पाउनुहुन्छ। भविष्यमा थपिने सबै नयाँ भिडियोहरू र अपडेटहरू पनि तपाईंले बिल्कुलै नि:शुल्क पाउनुहुनेछ।`;
    }

    // Certificate
    if (q.includes('certificate') || q.includes('प्रमाणपत्र') || q.includes('सर्टिफिकेट')) {
      return `हो, प्रत्येक कोर्ष सफलतापूर्वक पूरा गरेपछि तपाईंले <strong>Professional Certificate of Completion</strong> प्राप्त गर्नुहुनेछ, जसलाई तपाईंले आफ्नो CV वा LinkedIn प्रोफाइलमा राख्न सक्नुहुन्छ।`;
    }

    // Specific Course: Dhruv Rathee style
    if (q.includes('dhruv') || q.includes('rathee') || q.includes('master') || q.includes('30+')) {
      return `<strong>AI Master Class by Dhruv Rathee (Hindi) - मात्र Rs. 449:</strong><br/>
      यो कोर्षमा ChatGPT, Midjourney, Runway, ElevenLabs, Leonardo AI जस्ता ३० भन्दा बढी प्रिमियम AI tools को पूर्ण प्रयोगात्मक जानकारी समावेस छ। यो हाम्रो "Best Seller" कोर्ष हो।`;
    }

    // Specific Course: Song / Music
    if (q.includes('song') || q.includes('music') || q.includes('गीत') || q.includes('संगीत') || q.includes('suno')) {
      return `<strong>AI Song Creation Course - मात्र Rs. 299 (Nepali/Hindi):</strong><br/>
      यसमा Suno v3/v4 को प्रयोग गरी आफ्नै लिरिक्स बनाउने, संगीत कम्पोज गर्ने, धून तयार गर्ने, भ्वाइस क्लोनिङ गर्ने र व्यावसायिक गीतहरू उत्पादन गर्ने तरिका सिकाइन्छ।`;
    }

    // Specific Course: Video
    if (q.includes('video') || q.includes('भिडियो सम्पादन') || q.includes('avatar') || q.includes('एनिमेसन')) {
      return `<strong>AI Video, Image & Song Creation - मात्र Rs. 350 (Nepali):</strong><br/>
      यो नेपाली भाषाको पूर्ण कोर्ष हो जसमा Talking Avatar भिडियोहरू बनाउने, Text-to-Video, र प्रोफेसनल एनिमेटेड भिडियो सम्पादन गर्न सिकाइन्छ।`;
    }

    // Specific Course: Presentation / Slides / PPT
    if (q.includes('presentation') || q.includes('slides') || q.includes('ppt') || q.includes('पावरपोइन्ट')) {
      return `<strong>AI Presentation Making Course - मात्र Rs. 199 (Nepali/Hindi):</strong><br/>
      यसमा Gamma App, Tome, PowerPoint AI को प्रयोग गरी Dhruv Rathee शैलीमा उत्कृष्ट एनिमेटेड स्लाइड र व्यावसायिक कलेज/अफिस प्रस्तुतीकरणहरू मिनेटमै बनाउन सिकाइन्छ।`;
    }

    return `धन्यवाद! कोर्ष तुरुन्त खरिद गर्न वा थप जानकारीका लागि कृपया हाम्रो आधिकारिक <strong>WhatsApp नम्बर <a href="https://wa.me/9779763323268" target="_blank" class="text-purple-600 font-extrabold underline">976-3323268</a></strong> मा सिधै सम्पर्क गर्नुहोस्। हामी तपाईंलाई तत्काल सहयोग गर्नेछौं!`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isTyping) return;

    // Add user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text, timestamp };
    
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: chatMessages.map(msg => ({ sender: msg.sender, text: msg.text }))
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned non-ok status');
      }

      const data = await response.json();
      const botReply = data.reply || getLocalAIResponse(text);
      
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.warn('Chat API Error, falling back to local KB:', error);
      
      // Fallback seamlessly to the highly accurate local responder instead of breaking!
      const botReply = getLocalAIResponse(text);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Open QR modal from Course Modal
  const handleOpenFonePayQR = () => {
    setSelectedCourse(null); // close main course modal
    setShowQrModal(true);
  };

  // Confirm payment & launch WhatsApp message
  const handleConfirmPayment = () => {
    if (!selectedCourse) return;
    const message = `I have purchased the "${selectedCourse.title}" course and paid ${selectedCourse.price} via QR/eSewa. Please provide the course access link!`;
    window.open(`https://wa.me/9779763323268?text=${encodeURIComponent(message)}`, '_blank');
    setShowQrModal(false);
    showToast('Payment confirmation message sent on WhatsApp!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[3000] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-sm ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 
              toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <X className="w-5 h-5 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Banner with elegant gradient */}
      <div className="sticky top-0 z-[100] w-full bg-linear-to-r from-purple-800 via-indigo-900 to-purple-900 text-white shadow-md border-b border-purple-700/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight">
              AI Clipzone <span className="text-amber-400">Nepal</span> 🇳🇵
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-purple-100 bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-500/30">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Nepal's #1 AI Academy • Trusted by 1000+ Students
          </div>
          <a 
            href="https://wa.me/9779763323268" 
            target="_blank" 
            rel="noopener noreferrer"
            title="WhatsApp Support"
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition duration-200 shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-105 shrink-0"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5.5 h-5.5"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.96.512 3.878 1.483 5.581l-.975 3.563 3.664-.949zm12.333-5.068c-.326-.161-1.929-.938-2.228-1.046-.299-.109-.517-.161-.734.161-.217.323-.841 1.046-1.031 1.262-.19.217-.381.244-.707.082-.326-.161-1.378-.501-2.624-1.597-.969-.854-1.623-1.909-1.813-2.231-.19-.323-.02-.497.142-.658.146-.145.326-.376.49-.564.163-.189.217-.324.326-.541.109-.217.054-.407-.027-.569-.081-.162-.734-1.74-.1005-2.39-.292-.705-.664-.609-.914-.609h-.78c-.272 0-.713.101-1.086.502-.373.402-1.425 1.375-1.425 3.353 0 1.977 1.451 3.886 1.654 4.156.204.27 2.856 4.305 6.918 6.023.966.409 1.72.653 2.308.837.97.305 1.854.263 2.551.16.778-.115 2.392-.962 2.731-1.892.34-.93.34-1.728.238-1.89-.101-.163-.38-.244-.707-.406z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Main Container for Course List */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Course Catalog Title */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" />
            Our Premium AI Courses
          </h3>
          <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full mt-3"></div>
          <p className="text-slate-500 mt-3 text-sm md:text-base">
            तपाईंको आवश्यकता अनुसार उत्कृष्ट कोर्ष छनोट गर्नुहोस् र आजैबाट सिक्न सुरु गर्नुहोस्!
          </p>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {COURSES.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 relative flex flex-col h-full"
            >
              {course.isPopular && (
                <div className="absolute top-0 inset-x-0 bg-rose-600 text-white text-center py-2 text-xs md:text-sm font-black tracking-widest uppercase z-10 shadow-md">
                  {course.popularText || '🔥 MOST POPULAR - BEST SELLER'}
                </div>
              )}

              {/* Course Thumbnail Image */}
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img 
                  src={course.image} 
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-purple-950/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-lg border border-purple-500/20">
                    Lifetime Access
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-lg shadow-md">
                    Instant Delivery
                  </span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 md:p-8 flex flex-col grow justify-between">
                <div>
                  <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {course.title}
                  </h4>
                  
                  {/* Prices */}
                  <div className="mt-4 flex items-baseline gap-2.5">
                    <span className="text-2xl md:text-3xl font-black text-purple-700">
                      {course.price}
                    </span>
                    {course.isPopular && (
                      <span className="text-slate-400 line-through text-sm md:text-base font-semibold">
                        Price $19
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 text-xs md:text-sm mt-3 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Language: {index === 0 ? 'Hindi' : index === 1 ? 'Nepali' : 'Nepali / Hindi'} • Includes Certificate
                  </p>

                  {/* Highlights checklist */}
                  <ul className="mt-6 space-y-2.5">
                    {course.learn.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="w-full bg-linear-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer text-center"
                  >
                    Enroll Now / View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial slider / carousel */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <span className="bg-purple-100 text-purple-700 font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-purple-200">
              Real Stories
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              What Our Students Say ❤️
            </h3>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-3"></div>
            <p className="text-slate-500 mt-3 text-sm md:text-base">
              हाम्रा विद्यार्थीहरूले कोर्ष लिएर आफ्नो करियर र कामलाई धेरै सजिलो बनाएका छन्।
            </p>
          </div>

          <div 
            className="max-w-3xl mx-auto overflow-hidden relative px-2"
            onMouseEnter={() => setIsHoveredCarousel(true)}
            onMouseLeave={() => setIsHoveredCarousel(false)}
          >
            {/* Testimonial Cards Layout */}
            <div className="relative h-72 md:h-64 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
                        {TESTIMONIALS[currentSlide].avatar}
                      </div>
                      <div>
                        <strong className="text-base md:text-lg text-slate-900 block font-bold">
                          {TESTIMONIALS[currentSlide].name}
                        </strong>
                        <span className="text-xs text-slate-500 block font-semibold">
                          {TESTIMONIALS[currentSlide].location} • {TESTIMONIALS[currentSlide].course}
                        </span>
                      </div>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex gap-1 text-amber-400 mt-3">
                      {[...Array(TESTIMONIALS[currentSlide].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm md:text-base italic leading-relaxed mt-4">
                      "{TESTIMONIALS[currentSlide].text}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified Student
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Student {currentSlide + 1} of {TESTIMONIALS.length}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Navigation Dots */}
            <div className="flex justify-center gap-2.5 mt-6">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-purple-700 scale-125' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* What You Learn Section */}
        <section className="mt-24 relative">
          <div className="text-center mb-16 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-purple-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Full-Stack Skills
            </span>
            <h3 className="text-3xl md:text-4xl font-black mt-4 text-slate-950 tracking-tight leading-tight">
              तपाईंले के सिक्नुहुन्छ ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">What You Will Learn</span>
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full mt-4"></div>
            <p className="text-slate-500 mt-4 text-sm md:text-base max-w-xl mx-auto font-medium">
              हाम्रो व्यावहारिक कोर्षहरूमा समावेस गरिएका मुख्य विधा र सीपहरू
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Learn Card 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-purple-500/20 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 shadow-2xs">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                  30+ Premium AI Tools
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  ChatGPT, Midjourney, Runway, ElevenLabs, Leonardo आदि विश्वस्तरीय AI tools को पूर्ण प्रयोगात्मक प्रशिक्षण।
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-black text-purple-600 uppercase tracking-wider">
                <span>Complete Tools Master</span> • <span className="text-slate-400">Practical</span>
              </div>
            </motion.div>

            {/* Learn Card 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-500/20 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-2xs">
                  <Video className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                  AI Video Creation
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Talking Avatar भिडियो, Text to Video, Script-writing, र प्रोफेसनल एनिमेटेड भिडियो सम्पादन।
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider">
                <span>Video Editing & Avatar</span> • <span className="text-slate-400">Viral Style</span>
              </div>
            </motion.div>

            {/* Learn Card 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-pink-500/20 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 border border-pink-100 shadow-2xs">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                  AI Image Generation
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Stunning यथार्थपरक फोटोहरू, एनिमेसन, व्यावसायिक डिजिटल कला र थम्बनेलहरू सजिलै बनाउने।
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-black text-pink-600 uppercase tracking-wider">
                <span>Art & Graphic Prompting</span> • <span className="text-slate-400">Pro Quality</span>
              </div>
            </motion.div>

            {/* Learn Card 4 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-amber-500/20 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 shadow-2xs">
                  <Music className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                  AI Song & Music Creation
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  आफ्नै गीत, धून, संगीत कम्पोजिसन, भ्वाइस क्लोनिङ र ट्रेन्डिङ सामाजिक सञ्जाल संगीतको उत्पादन।
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-black text-amber-600 uppercase tracking-wider">
                <span>Audio & Voice Cloning</span> • <span className="text-slate-400">Vocal Hits</span>
              </div>
            </motion.div>

            {/* Learn Card 5 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-emerald-500/20 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 shadow-2xs">
                  <Presentation className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                  AI Presentation Making
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Dhruv Rathee शैलीमा उत्कृष्ट एनिमेटेड पावरपोइन्ट स्लाईड र व्यावसायिक कलेज/अफिस प्रस्तुतीकरण।
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-wider">
                <span>Professional Slides</span> • <span className="text-slate-400">Dhruv Rathee Style</span>
              </div>
            </motion.div>

            {/* Learn Card 6 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-sky-500/20 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 border border-sky-100 shadow-2xs">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                  Practical Projects & Access
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  वास्तविक प्रयोगात्मक प्रोजेक्टहरू, कोर्स पूरा गरेपछि सर्टिफिकेट, र सधैंको लागि आजीवन पहुँच।
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-black text-sky-600 uppercase tracking-wider">
                <span>Verified Certificate</span> • <span className="text-slate-400">Lifetime Access</span>
              </div>
            </motion.div>

          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <span className="bg-amber-100 text-amber-800 font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-amber-200">
              Common Questions
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Frequently Asked Questions
            </h3>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-3"></div>
            <p className="text-slate-500 mt-3 text-sm md:text-base">
              कोर्ष र भुक्तानी सम्बन्धी आम जिज्ञासाहरूको समाधान यहाँ पाउन सक्नुहुन्छ।
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = !!openFaqs[index];
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all duration-200 hover:border-amber-500/30 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-5 md:p-6 font-bold text-slate-900 flex items-center justify-between gap-4 text-base md:text-lg focus:outline-hidden"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-purple-700' : ''
                      }`}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 md:p-6 pt-0 text-slate-600 border-t border-slate-50 text-sm md:text-base leading-relaxed bg-slate-50/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="mt-20">
          <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border border-slate-100">
            <div className="text-center mb-10">
              <span className="bg-indigo-100 text-indigo-700 font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-indigo-200">
                Help & Support
              </span>
              <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Contact Us
              </h3>
              <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-3"></div>
              <p className="text-slate-500 mt-3 text-sm md:text-base">
                कुनै पनि प्रश्न वा तत्काल भर्नाको लागि हामीलाई सिधै सम्पर्क गर्नुहोस्
              </p>
            </div>

            {/* Support channels grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              
              {/* WhatsApp Call Card */}
              <a 
                href="https://wa.me/9779763323268" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl border-2 border-emerald-500/20 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/50 transition duration-300 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <strong className="text-slate-900 font-extrabold text-lg group-hover:text-emerald-700 transition-colors">
                    WhatsApp / Call
                  </strong>
                  <span className="text-slate-600 block text-sm font-semibold mt-1">976-3323268</span>
                  <span className="text-xs text-emerald-600 font-extrabold mt-1 inline-block">
                    ◆ Active support (Replies in 5 mins)
                  </span>
                </div>
              </a>

              {/* Facebook Card */}
              <a 
                href="https://www.facebook.com/profile.php?id=61583901232576&mibextid=ZbWKwL" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl border-2 border-blue-500/10 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/50 transition duration-300 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Facebook className="w-6 h-6" />
                </div>
                <div>
                  <strong className="text-slate-900 font-extrabold text-lg group-hover:text-blue-700 transition-colors">
                    Facebook Page
                  </strong>
                  <span className="text-slate-500 block text-xs mt-1">AI Clipzone Nepal</span>
                  <span className="text-xs text-blue-600 font-extrabold mt-1 inline-block">
                    Follow us for news & coupon codes
                  </span>
                </div>
              </a>

              {/* Email Card */}
              <a 
                href="mailto:ai.clipzone.edu@gmail.com" 
                className="group p-6 rounded-2xl border-2 border-rose-500/10 hover:border-rose-500 bg-rose-50/10 hover:bg-rose-50/40 transition duration-300 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <strong className="text-slate-900 font-extrabold text-lg group-hover:text-rose-700 transition-colors">
                    Email Support
                  </strong>
                  <span className="text-slate-500 block text-xs mt-1">ai.clipzone.edu@gmail.com</span>
                  <span className="text-xs text-rose-600 font-extrabold mt-1 inline-block">
                    Official queries & feedback
                  </span>
                </div>
              </a>

            </div>

            {/* Quick Contact Message Form */}
            <div className="bg-slate-50/60 p-6 md:p-10 rounded-2xl border border-slate-100">
              <h4 className="text-xl font-bold text-center text-slate-900 mb-6 flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-700" />
                Send Quick Message on WhatsApp
              </h4>

              <form onSubmit={handleSendContactMessage} className="space-y-4 max-w-xl mx-auto">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">तपाईंको नाम (Full Name) *</label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="तपाईंको नाम लेख्नुहोस्..."
                    className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm transition outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">फोन नम्बर (WhatsApp Number) - Optional</label>
                  <input 
                    type="tel" 
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="सम्पर्क फोन नम्बर लेख्नुहोस्..."
                    className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm transition outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">तपाईंको सन्देश (Your Message) *</label>
                  <textarea 
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    rows={4}
                    placeholder="कोर्ष सम्बन्धी केही सोध्न मन छ भने यहाँ लेख्नुहोस्..."
                    className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm transition outline-hidden"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> 📤 Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Business Hours Information */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center max-w-xl mx-auto">
              <div className="sm:border-r sm:border-slate-200 pb-4 sm:pb-0">
                <h5 className="font-extrabold text-slate-900 flex items-center justify-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-purple-700" /> Business Hours
                </h5>
                <p className="text-slate-600 text-xs mt-2 font-medium">Sunday - Friday: 8:00 AM - 8:00 PM</p>
                <p className="text-slate-600 text-xs mt-1 font-medium">Saturday: 10:00 AM - 6:00 PM</p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-emerald-600 font-extrabold text-sm flex items-center gap-1">
                  ⚡ Instant WhatsApp Support
                </span>
                <p className="text-slate-500 text-xs mt-2">
                  हामी प्राय: ५ मिनेट भित्रै जवाफ पठाउनेछौं!
                </p>
              </div>
            </div>

            {/* Trust and safety badges */}
            <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-slate-400 opacity-90 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure eSewa / QR Checkout
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <GraduationCap className="w-4 h-4 text-purple-500" /> Standard Certificate Issued
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Headphones className="w-4 h-4 text-amber-500" /> Lifelong Learning Access
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs md:text-sm py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h5 className="text-white font-extrabold text-base tracking-tight mb-2">
              AI Clipzone <span className="text-amber-400">Nepal</span> 🇳🇵
            </h5>
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} AI Clipzone. All rights reserved. Nepal's Premium AI Learning platform.
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://wa.me/9779763323268" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
            <span>•</span>
            <a href="https://www.facebook.com/profile.php?id=61583901232576&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Facebook</a>
            <span>•</span>
            <a href="mailto:ai.clipzone.edu@gmail.com" className="hover:text-rose-400 transition-colors">Email</a>
          </div>
        </div>
      </footer>

      {/* COURSE DETAILS MODAL */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white max-w-lg w-full rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto border border-slate-100"
            >
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <span className="inline-block bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                Course Details
              </span>

              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                {selectedCourse.title}
              </h3>
              
              <p className="text-3xl font-black text-purple-700 mt-3">
                {selectedCourse.price}
              </p>

              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  यो Course बाट के सिक्नुहुन्छ ?
                </h4>
                
                <ul className="space-y-3">
                  {selectedCourse.learn.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-700 text-sm md:text-base leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Secure purchase assurances */}
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 text-xs text-slate-600 font-semibold">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <span>१००% सुरक्षित भुक्तानी। भुक्तानी गरेपछि तत्कालै ड्राइभ लिङ्क र भिडियो कोर्ष प्राप्त गर्नुहुनेछ।</span>
              </div>

              {/* Purchase options CTA */}
              <div className="mt-8 flex flex-col gap-3">
                <a 
                  href={`https://wa.me/9779763323268?text=${encodeURIComponent(selectedCourse.message)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-2xl text-center shadow-lg shadow-emerald-500/10 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> WhatsApp बाट किन्नुहोस्
                </a>
                
                <button 
                  onClick={handleOpenFonePayQR}
                  className="w-full bg-linear-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-extrabold py-4 px-6 rounded-2xl text-center shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>QR स्क्यान गरी तत्काल भुक्तानी (eSewa / Khalti)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FONEPAY QR CODE DETAILS MODAL */}
      <AnimatePresence>
        {showQrModal && selectedCourse && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white max-w-sm w-full rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 text-center border border-slate-100"
            >
              <h3 className="text-lg font-black text-slate-900">
                Scan to Pay (eSewa / Khalti / Bank App)
              </h3>
              
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {selectedCourse.title}
              </p>

              <p className="text-3xl font-black text-purple-700 mt-2">
                {selectedCourse.price}
              </p>

              {/* QR Canvas Container */}
              <div className="my-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl inline-block shadow-inner">
                <canvas ref={qrCanvasRef} className="mx-auto" />
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/50 text-xs text-amber-800 font-bold leading-normal mb-6">
                📌 Ai Clipzone • QR स्क्यान गरी तोकिएको रकम भुक्तानी गर्नुहोस् र स्क्रीनसट हामीलाई WhatsApp मा पठाउनुहोस्।
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  ✅ I Have Paid
                </button>
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING CHATBOT ASSISTANT */}
      <div className="fixed bottom-6 left-6 z-[999]">
        
        {/* Floating circular button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-gradient-to-tr from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-950 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-purple-700/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative"
          aria-label="Toggle chat assistant"
        >
          {isChatOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <>
              <Bot className="w-8 h-8 animate-bounce mt-1" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-slate-950 items-center justify-center">1</span>
              </span>
            </>
          )}
        </button>

        {/* Chat Window Popup */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50, x: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50, x: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="absolute bottom-20 left-0 w-[340px] md:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm md:text-base tracking-tight text-white">
                      AI Clipzone Assistant
                    </h4>
                    <span className="text-[10px] text-purple-200 block font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      तुरुन्त जवाफ उपलब्ध छ
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-purple-200 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat messages body */}
              <div className="grow overflow-y-auto p-5 space-y-4 bg-slate-50">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className="max-w-[80%] flex flex-col">
                      <div 
                        className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-purple-700 text-white rounded-tr-none shadow-sm' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-xs'
                        }`}
                        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                      />
                      <span className={`text-[9px] text-slate-400 mt-1 font-semibold ${msg.sender === 'user' ? 'text-right' : ''}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xs">
                      <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
                    </div>
                    <div className="max-w-[80%] flex flex-col">
                      <div className="bg-white text-slate-800 border border-slate-100 p-3.5 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Quick reply chips & Input bar */}
              <div className="p-4 bg-white border-t border-slate-100">
                
                {/* Suggestions chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button 
                    onClick={() => handleSendMessage('Price कति हो?')}
                    className="bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-200 transition cursor-pointer"
                  >
                    Price कति हो?
                  </button>
                  <button 
                    onClick={() => handleSendMessage('Recorded हो कि Live?')}
                    className="bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-200 transition cursor-pointer"
                  >
                    Recorded कि Live?
                  </button>
                  <button 
                    onClick={() => handleSendMessage('Payment कसरी गर्ने?')}
                    className="bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-200 transition cursor-pointer"
                  >
                    Payment कसरी गर्ने?
                  </button>
                  <button 
                    onClick={() => handleSendMessage('Lifetime Access?')}
                    className="bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-200 transition cursor-pointer"
                  >
                    Lifetime Access?
                  </button>
                </div>

                {/* Input Text Form */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder="तपाईंको प्रश्न यहाँ लेख्नुहोस्..."
                    className="grow bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-full px-4 py-2.5 text-xs md:text-sm transition outline-hidden font-medium"
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    className="w-10 h-10 bg-purple-700 hover:bg-purple-800 text-white rounded-full flex items-center justify-center shrink-0 shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
