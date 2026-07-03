import { Course, Testimonial, FAQItem } from './types';

export const COURSES: Course[] = [
  {
    title: "AI Master Class by Dhruv Rathee",
    price: "Rs. 449",
    amount: 449,
    message: "I want to buy AI Master Class by Dhruv Rathee",
    learn: [
      "30+ AI Tools Mastery",
      "AI Video & Image Generation",
      "AI Songs Creation",
      "Presentation & Website Design"
    ],
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiI6q11UwbnIp-U7yN_NZi3p9W2QuqU4gNTcwUrQHpQ9BjvwRdFd0wRnZke-p9TJfULwJmqx07Qq4tEHuehoBh6ea_Yhfbx9sl4XGKqke1HA43rkqRVYR37fsI5DXmCff4LZZYXUVawHNugWiFNXXyG8J0Wv5uUM5xxcsSv-pOnYX9v37fjy_qEv5p5Zq8l/w400-h221/2236.png",
    isPopular: true,
    popularText: "🔥 MOST POPULAR - BEST SELLER"
  },
  {
    title: "AI Video, Image & Song Creation",
    price: "Rs. 350",
    amount: 350,
    message: "I want to buy AI Video Image Song Course",
    learn: [
      "AI Video Creation",
      "Professional Image Generation",
      "AI Song Making",
      "Editing Techniques"
    ],
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiamlf7uMKucGgjA_KFqVtclRDjBq0Y9jA6vvf_xKLmgkfiWVfvRdnnRWYHQnpH8xGzHE_sdfzhThAHtR9YLfNqqTDDoH5aJdYWaZAzD7VFWatJueGo7AShTCKUUOc1jKppsgclGgyifi2nXqmMNDR_1oyzfiJsTzJ60V6r-UscNlCFxibxx0DrIUT-7xHc/s320/2237.png"
  },
  {
    title: "AI Song Creation Course",
    price: "Rs. 299",
    amount: 299,
    message: "I want to buy AI Song Creation Course",
    learn: [
      "AI Song Generation",
      "Lyrics + Music Creation",
      "Voice Cloning",
      "Trending Song Styles"
    ],
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYjOG4lDyf5xe2U0X4FfB9tthigSJGm1DldgU9qU2CDbnWSrtNX2zX0GyiPKwGy0I-ostrdq0O02Okm1m90M6aFTH6T7TLfNIpRHQtpwBLY0gKXHdH4dPJoV3n-IReclxD56h8Tuuvyrb73XpaTfjEcw6s7JvZkRJDFxAp_kjAf3EUDAMCaWaBHgUKdcYD/s320/2241.jpg"
  },
  {
    title: "AI Presentation Making Course",
    price: "Rs. 199",
    amount: 199,
    message: "I want to buy AI Presentation Making Course",
    learn: [
      "Stunning AI Slides",
      "Automatic Design",
      "Animated Presentations",
      "Fast Creation Techniques"
    ],
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhQkRMqywnYfxP8pjE04fdw157KvkRbC2yr4pHdnuVgWrGc3-yT5vmUFhLYyJXXIU3XrXS5mAyLxba3MEfAMb5Z4soHFa3hr69_4dYDU3qlJwIEIX1ImF7a5BeUOTYWM4Rbfj5-6Sz-H-8IMFe0-ErEH1KFqtJ1qJG8LnOqg-mm1mb1LQyD696l7iYl_2oi/s320/2239.jpg"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Anamol Sharma",
    location: "Kathmandu",
    course: "AI Master Class",
    text: "30+ AI tools एकै कोर्समा सिक्न पाउँदा धेरै फाइदा भयो। Dhruv Rathee style presentation ले मेरो काम अझ professional बनायो।",
    avatar: "🧔",
    rating: 5
  },
  {
    name: "Harsh Sapkota",
    location: "Pokhara",
    course: "AI Video + Image",
    text: "यो price मा यति राम्रो content पाउँदा अचम्म लाग्यो। मेरो YouTube channel को growth 3 महिनामा दोब्बर भयो।",
    avatar: "👨‍💼",
    rating: 5
  },
  {
    name: "Saroj Maharjan",
    location: "Lalitpur",
    course: "AI Song Creation",
    text: "Voice cloning र AI song बनाउने तरिका सिकेर म आहाई song release गर्दैछु। Lifetime access को सबैभन्दा राम्रो फाइदा।",
    avatar: "🎤",
    rating: 5
  },
  {
    name: "Priya Shrestha",
    location: "Biratnagar",
    course: "AI Presentation",
    text: "Office presentation हरू अब 10 मिनेटमै तयार हुन्छन्। Boss ले पनि praise गर्नुभयो। धन्यवाद Clipzone!",
    avatar: "👩‍💼",
    rating: 5
  },
  {
    name: "Aashish Khadka",
    location: "Pokhara",
    course: "AI Master Class",
    text: "Midjourney, Runway, Leonardo जस्ता tools को राम्रो training पाएँ। Beginner बाट अब confident AI user बनेको छु।",
    avatar: "📸",
    rating: 5
  },
  {
    name: "Roshan Thapa",
    location: "Chitwan",
    course: "AI Video Creation",
    text: "Talking avatar video बनाउन सिकेपछि मेरो business को promo video हरू धेरै राम्रो बन्छ। Highly recommended!",
    avatar: "🎥",
    rating: 5
  },
  {
    name: "Srijana Karki",
    location: "Kathmandu",
    course: "AI Image + Song",
    text: "महिलाको लागि पनि सजिलै बुझिने भाषामा course बनाइएको छ। AI ले मेरो creativity लाई नयाँ उडान दियो।",
    avatar: "🌸",
    rating: 5
  },
  {
    name: "Bikash Gurung",
    location: "Dharan",
    course: "AI Master Class",
    text: "Certificate सहित lifetime access पाएँ। अहिले आफैंले सिकाएर अरूलाई course बेच्दैछु। Best investment!",
    avatar: "💰",
    rating: 5
  },
  {
    name: "Nisha Adhikari",
    location: "Bhaktapur",
    course: "AI Presentation",
    text: "College project हरूमा AI presentation प्रयोग गरेर Topper बनेकी छु। Teachers ले पनि सोध्न थाल्नुभयो कसरी बनाएको भनेर।",
    avatar: "🎓",
    rating: 5
  },
  {
    name: "Suman Rai",
    location: "Pokhara",
    course: "AI Video + Song",
    text: "Payment गरेको २ मिनेटमै access पाएँ। Support team पनि अति responsive। Nepal मा यस्तो quality course पाउन गाह्रो छ।",
    avatar: "🚀",
    rating: 5
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "यो course recorded हो कि live class मा?",
    answer: "यो course मा कुनै पनि Live Class छैन। सबै Recorded Videos बनाइएको छ। तपाईं आफ्नो सुविधा अनुसार जुनसुकै समयमा पनि हेर्न सक्नुहुन्छ (Offline / Online)."
  },
  {
    question: "यो course मा lifetime access हुन्छ?",
    answer: "हो, एक पटक किन्नुभयो भने Lifetime Access + सबै Future Updates नि:शुल्क पाउनुहुन्छ।"
  },
  {
    question: "Payment कसरी गर्ने?",
    answer: "WhatsApp मा सम्पर्क गर्नुहोस्। eSewa, Khalti, IME Pay, Bank Transfer सबै विकल्प उपलब्ध छन्।"
  },
  {
    question: "Course भाषा के हो?",
    answer: "सबै courses नेपाली र हिन्दी भाषामा छन् जसले गर्दा सजिलै बुझ्न सकिन्छ।"
  },
  {
    question: "Certificate पाइन्छ कि पाइँदैन?",
    answer: "हो, Course पूरा गरेपछि Professional Completion Certificate उपलब्ध गराइन्छ।"
  }
];
