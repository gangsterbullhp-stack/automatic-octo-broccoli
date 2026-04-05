/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Headphones,
  Smartphone,
  DollarSign,
  Zap,
  CheckCircle2,
  Star,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Brain,
  Users,
  Check,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from "./firebase";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const GuaranteeLogo = () => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full animate-pulse" />
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5,5" />
      <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="#D4AF37" />
      <text x="50" y="45" textAnchor="middle" fill="black" fontSize="24" fontWeight="900" fontFamily="sans-serif">7</text>
      <text x="50" y="65" textAnchor="middle" fill="black" fontSize="12" fontWeight="700" fontFamily="sans-serif">DÍAS</text>
      <text x="50" y="80" textAnchor="middle" fill="black" fontSize="8" fontWeight="600" fontFamily="sans-serif">GARANTÍA</text>
    </svg>
  </div>
);

const CountdownTimer = ({ compact = false }: { compact?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 5,
    seconds: 0
  });
  const hasRedirected = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };

        // Timer reached 0:0
        if (!hasRedirected.current && prev.minutes === 0 && prev.seconds === 0) {
          hasRedirected.current = true;
          window.open("https://pay.hotmart.com/S104875108I", "_blank");
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        {[
          { label: 'm', value: timeLeft.minutes },
          { label: 's', value: timeLeft.seconds }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="bg-neutral-900 border border-gold-500/30 rounded px-2 py-1 text-sm font-bold text-gold-400">
              {item.value.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] uppercase text-neutral-500 font-bold">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center items-center">
      {[
        { label: 'Minutos', value: timeLeft.minutes },
        { label: 'Segundos', value: timeLeft.seconds }
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-neutral-900 border border-gold-500/30 rounded-lg w-16 h-16 flex items-center justify-center text-2xl font-bold text-gold-400">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] uppercase tracking-widest mt-2 text-neutral-500 font-semibold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`py-20 px-6 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

const CTAButton = ({ children, className = "", primary = true }: { children: React.ReactNode, className?: string, primary?: boolean }) => (
  <motion.a
    href="https://pay.hotmart.com/S104875108I"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${primary
        ? "bg-gold-gradient text-neutral-950 hover:shadow-gold-500/20"
        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
      } ${className}`}
  >
    {children}
  </motion.a>
);

const PromoVideo = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      {/* Decorative background glow */}
      <div className="absolute -inset-10 bg-gold-500/15 blur-[120px] rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

      <div className="relative z-10 bg-neutral-900/60 rounded-[2rem] p-1 border border-white/10 shadow-[0_0_50px_-12px_rgba(212,175,55,0.3)] backdrop-blur-md overflow-hidden flex items-center justify-center transition-all duration-500 hover:shadow-[0_0_60px_-10px_rgba(212,175,55,0.4)] hover:border-gold-500/30">
        <img
          src="/biblioteca.jpeg"
          alt="Mega Biblioteca Digital"
          className="w-full h-auto object-cover rounded-[1.8rem] shadow-2xl transition-transform duration-700 scale-100 group-hover:scale-105"
        />

        {/* Premium Overlay Gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-white/5" />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [recentPurchase, setRecentPurchase] = useState<{ name: string, city: string, time: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasStartedPlayback = useRef(false);

  // Social Proof: Simulated Recent Purchases
  useEffect(() => {
    const names = [
      "Carlos", "María", "Juan", "Ana", "Roberto", "Lucía", "Diego", "Sofía", "Miguel", "Valentina",
      "Andrés", "Gabriela", "Fernando", "Isabella", "Javier", "Camila", "Ricardo", "Ximena", "Mateo", "Mariana",
      "Sebastián", "Daniela", "Alejandro", "Victoria", "Luis", "Elena", "Jorge", "Natalia", "Felipe", "Paola",
      "Esteban", "Claudia", "Hugo", "Beatriz", "Raúl", "Silvia", "Oscar", "Mónica", "Pablo", "Patricia"
    ];
    const cities = [
      "Madrid", "Ciudad de México", "Bogotá", "Buenos Aires", "Santiago", "Lima", "Barcelona", "Medellín", "Quito", "Guadalajara",
      "Valencia", "Monterrey", "Cali", "Córdoba", "Valparaíso", "Arequipa", "Sevilla", "Puebla", "Barranquilla", "Rosario",
      "Concepción", "Trujillo", "Bilbao", "Cancún", "Cartagena", "Mendoza", "Antofagasta", "Chiclayo", "Málaga", "Tijuana",
      "Santa Cruz", "San José", "Panamá", "Santo Domingo", "San Juan", "Guayaquil", "Asunción", "Montevideo", "Caracas", "La Paz"
    ];

    const showNextPurchase = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      setRecentPurchase({ name, city, time: "hace 1 minuto" });

      setTimeout(() => setRecentPurchase(null), 5000);
      setTimeout(showNextPurchase, 15000 + Math.random() * 10000);
    };

    const initialTimeout = setTimeout(showNextPurchase, 8000);
    return () => clearTimeout(initialTimeout);
  }, []);

  // Local Audio Initialization
  useEffect(() => {
    setIsAudioReady(true);
  }, []);

  const [hasInteracted, setHasInteracted] = useState(false);

  // Background Music Logic
  useEffect(() => {
    console.log("🎵 Initializing background music...");
    // Epic, motivational action soundtrack from Pixabay
    const music = new Audio('/background.mp3');
    music.loop = true;
    music.volume = 0.15; // Slightly lower volume so the voiceover shines through
    music.muted = isMuted;
    musicRef.current = music;

    const startMusic = () => {
      if (musicRef.current) {
        console.log("🎵 Attempting to play background music...");
        musicRef.current.play().then(() => {
          console.log("✅ Background music started successfully");
        }).catch((error) => {
          console.warn("⚠️ Background music autoplay blocked:", error.name);
          if (error.name === 'NotAllowedError') {
            setShowPlayOverlay(true);
          }
        });
      }
    };

    if (hasInteracted) {
      startMusic();
    }

    const interactionEvents = ['click', 'touchstart', 'mousedown', 'keydown'];
    const handleInteraction = () => {
      console.log("🖱️ User interaction detected (Music)");
      setHasInteracted(true);
      startMusic();
      interactionEvents.forEach(event => window.removeEventListener(event, handleInteraction));
    };

    interactionEvents.forEach(event => window.addEventListener(event, handleInteraction));

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      interactionEvents.forEach(event => window.removeEventListener(event, handleInteraction));
    };
  }, [isMuted, hasInteracted]);

  // Voiceover Playback Logic
  useEffect(() => {
    console.log("🎙️ Preparing local voiceover playback...");

    const audio = new Audio('/ventas.wav');
    audio.loop = false; // Play only once
    audio.muted = isMuted;
    audioRef.current = audio;
    audio.preload = "auto";

    const startPlayback = () => {
      if (hasStartedPlayback.current) {
        console.log("🎙️ Voiceover already started, skipping...");
        return;
      }

      console.log("🎙️ Attempting to play voiceover...");
      const playPromises = [];
      if (audioRef.current) {
        playPromises.push(audioRef.current.play());
      }
      if (musicRef.current) {
        playPromises.push(musicRef.current.play());
      }
      if (videoRef.current) {
        playPromises.push(videoRef.current.play());
      }

      if (playPromises.length === 0) {
        console.log("🎙️ No media ready to play yet");
        return;
      }

      Promise.all(playPromises).then(() => {
        hasStartedPlayback.current = true;
        setShowPlayOverlay(false);
        console.log("✅ Voiceover & Media system started successfully");
      }).catch((error) => {
        if (error.name === 'NotAllowedError') {
          console.warn("⚠️ Autoplay blocked for voiceover. Waiting for interaction.");
          setShowPlayOverlay(true);
        } else {
          console.error("❌ Playback error:", error);
        }
      });
    };

    if (hasInteracted) {
      startPlayback();
    }

    const interactionEvents = ['click', 'touchstart', 'mousedown', 'keydown'];
    const handleInteraction = () => {
      console.log("🖱️ User interaction detected (Voiceover)");
      setHasInteracted(true);
      startPlayback();
      interactionEvents.forEach(event => window.removeEventListener(event, handleInteraction));
    };

    interactionEvents.forEach(event => window.addEventListener(event, handleInteraction));

    return () => {
      audio.pause();
      interactionEvents.forEach(event => window.removeEventListener(event, handleInteraction));
    };
  }, [isMuted, hasInteracted]);

  const togglePlayback = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (audioRef.current) {
      if (newState) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
    if (musicRef.current) {
      if (newState) musicRef.current.play().catch(console.error);
      else musicRef.current.pause();
    }
    if (videoRef.current) {
      if (newState) videoRef.current.play().catch(console.error);
      else videoRef.current.pause();
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
    if (musicRef.current) musicRef.current.muted = newMuted;
    if (videoRef.current) videoRef.current.muted = newMuted;
  };

  const forceStartAudio = () => {
    console.log("🚀 Force starting audio system...");
    setShowPlayOverlay(false); // Hide immediately for better UX
    setHasInteracted(true);

    const playPromises = [];
    if (audioRef.current) {
      console.log("🎙️ Adding voiceover to force play");
      playPromises.push(audioRef.current.play());
    }
    if (musicRef.current) {
      console.log("🎵 Adding music to force play");
      playPromises.push(musicRef.current.play());
    }
    if (videoRef.current) {
      console.log("📹 Adding video to force play");
      playPromises.push(videoRef.current.play());
    }

    if (playPromises.length === 0) {
      console.log("⚠️ No media available to force play");
      return;
    }

    Promise.all(playPromises).then(() => {
      console.log("✅ Force start successful");
      hasStartedPlayback.current = true;
    }).catch(e => {
      console.error("❌ Force start failed:", e);
    });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const isAdmin = user?.email === "gangsterbullhp@gmail.com";

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());

  return (
    <div className="font-sans">

      {/* Play Overlay (if browser blocks autoplay) */}
      <AnimatePresence>
        {showPlayOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-neutral-900/90 border-2 border-gold-500/50 p-8 rounded-[2rem] text-center shadow-[0_0_50px_-12px_rgba(212,175,55,0.4)] backdrop-blur-md">
              <h3 className="text-3xl font-extrabold mb-2 text-white">¡Felicitaciones! 🎉</h3>
              <p className="text-gold-400 font-bold mb-6 text-lg uppercase">
                Oferta por Tiempo Limitado
              </p>
              
              <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-red-500 line-through text-xl font-bold">Precio Anterior: $97.00</p>
                  <p className="text-5xl font-black text-white">
                    $3.99 <span className="text-xl text-gold-500">USD</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={forceStartAudio}
                className="w-full bg-gold-gradient text-neutral-950 font-black py-5 rounded-xl shadow-[0_0_30px_-5px_rgba(212,175,55,0.5)] hover:scale-105 transition-transform text-xl uppercase tracking-wider flex items-center justify-center gap-3"
              >
                LO QUIERO AHORA <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Header with Timer */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-gold-500/20 py-3 px-6 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold">Oferta Expira En:</span>
              <p className="text-xs text-neutral-400">Asegura tu precio de $3.99</p>
            </div>
            <CountdownTimer compact />
            <CTAButton className="px-4 py-2 text-sm" primary>
              Comprar Ahora
            </CTAButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-neutral-950">
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-bold uppercase tracking-widest mb-6">
              Oferta por Tiempo Limitado: $3.99 USD
            </span>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Accede a <span className="text-gradient-gold">8,000+ Libros</span> y Audiolibros por Menos de lo que Cuesta un Almuerzo
            </h1>
            <p className="text-xl md:text-2xl text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Desbloquea una biblioteca digital masiva con más de 5,000 ebooks y 3,000 audiolibros que cubren negocios, desarrollo personal, psicología, finanzas, emprendimiento, novelas y más.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
              <div className="text-left">
                <p className="text-red-500 line-through text-lg font-bold">Precio Anterior: $97.00</p>
                <p className="text-3xl font-bold text-gold-400">Hoy: $3.99 USD</p>
              </div>
              <CTAButton className="w-full md:w-auto">
                Obtén Acceso Instantáneo por $3.99 <ArrowRight className="w-5 h-5" />
              </CTAButton>
            </div>

            <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gold-500" /> <span>Entrega al Instante</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gold-500" /> <span>Acceso de por Vida</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gold-500" /> <span>Todos los Dispositivos</span></div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Solution Section (Now Second) */}
      <Section>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Mega Biblioteca Digital – <span className="text-gradient-gold">Todo el Conocimiento</span> que Necesitas en un Solo Lugar.
            </h2>
            <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
              Hemos curado la colección definitiva de sabiduría, estrategias e historias para ayudarte a transformar tu vida sin gastar una fortuna.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "Acceso instantáneo a 5,000+ Ebooks",
                "3,000+ Audiolibros narrados profesionalmente",
                "Contenido en Negocios, Finanzas, Psicología y más",
                "Compatible con todos tus dispositivos digitales"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gold-500" />
                  <span className="text-lg font-medium">{item}</span>
                </div>
              ))}
            </div>
            <CTAButton>
              Comprar Ahora
            </CTAButton>
          </div>
          <div className="relative">
            <PromoVideo videoRef={videoRef} />
          </div>
        </div>
      </Section>

      {/* Problem Section (Now Third) */}
      <Section className="bg-neutral-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 leading-tight text-center">
            Por qué la mayoría de las personas <span className="text-red-500">nunca alcanzan</span> su máximo potencial...
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: DollarSign, text: "Los libros son caros ($15-$30 cada uno), lo que hace que una biblioteca personal sea inasequible para muchos." },
              { icon: Users, text: "Los recursos de aprendizaje están dispersos por todo Internet, haciéndote perder tu valioso tiempo." },
              { icon: Headphones, text: "Las suscripciones a audiolibros cuestan cientos de dólares al año." },
              { icon: Brain, text: "La 'Brecha de Conocimiento' es lo único que se interpone entre tú y tu éxito." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-neutral-800/30 border border-white/5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <item.icon className="w-6 h-6" />
                </div>
                <p className="text-lg text-neutral-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section className="bg-neutral-900/50">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: "Biblioteca Masiva", text: "8,000+ recursos de aprendizaje a tu alcance." },
            { icon: Headphones, title: "Audiolibros Incluidos", text: "Aprende mientras conduces, haces ejercicio o haces tareas." },
            { icon: Smartphone, title: "Acceso en Cualquier Lugar", text: "Compatible con iOS, Android, Kindle y PC." },
            { icon: DollarSign, title: "Ahorra Miles", text: "Obtén más de $10,000 en valor por menos de $4." },
            { icon: Zap, title: "Acceso Instantáneo", text: "Descarga tu biblioteca inmediatamente después de la compra." },
            { icon: TrendingUp, title: "Mentalidad de Crecimiento", text: "Todo lo que necesitas para escalar tu vida y negocio." }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-neutral-800/50 border border-white/5">
              <div className="text-gold-500 mt-1">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                <p className="text-neutral-400 text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Value Comparison Section */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl border border-white/10 bg-neutral-900/30">
              <h3 className="text-2xl font-bold mb-6 text-neutral-400">Comprando Individualmente</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex justify-between"><span>Costo Promedio por Libro</span> <span className="font-bold">$15.00</span></li>
                <li className="flex justify-between"><span>5,000 Libros</span> <span className="font-bold">$75,000.00</span></li>
                <li className="flex justify-between"><span>Suscripciones de Audiolibros</span> <span className="font-bold">$180/año</span></li>
              </ul>
              <div className="pt-6 border-t border-white/10">
                <p className="text-neutral-500 text-sm">Valor Total Estimado</p>
                <p className="text-3xl font-bold text-neutral-400">$75,000+</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border-2 border-gold-500 bg-gold-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold-500 text-neutral-950 px-4 py-1 font-bold text-sm rounded-bl-xl">
                MEJOR VALOR
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gold-400">Mega Biblioteca Digital</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gold-500" /> 5,000+ Ebooks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gold-500" /> 3,000+ Audiolibros</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gold-500" /> Actualizaciones de por Vida</li>
              </ul>
              <div className="pt-6 border-t border-gold-500/20">
                <p className="text-gold-500 text-sm">Precio Especial de Hoy</p>
                <p className="text-5xl font-bold text-white">$3.99 <span className="text-lg font-normal text-neutral-500">USD</span></p>
              </div>
              <CTAButton className="w-full mt-8">
                Aprovecha esta Oferta Ahora
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* What's Included Section */}
      <Section className="bg-neutral-900/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Lo que Recibirás Hoy</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            "5,000+ Ebooks", "3,000+ Audiolibros", "Negocios y Finanzas", "Desarrollo Personal",
            "Psicología", "Emprendimiento", "Marketing y Ventas", "Novelas y Ficción",
            "Acceso Instantáneo", "Todos los Dispositivos", "Actualizaciones de por Vida", "Sin Cuotas Mensuales"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800/50 border border-white/5">
              <Check className="w-5 h-5 text-gold-500 flex-shrink-0" />
              <span className="font-medium text-sm md:text-base">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Únete a más de 50,000 Lectores Felices</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Sarah J.", role: "Emprendedora", text: "No podía creer el valor. Ya he escuchado 5 audiolibros en mi trayecto al trabajo esta semana. Los mejores $4 que he gastado." },
            { name: "David M.", role: "Estudiante", text: "Como estudiante con presupuesto limitado, esto es una mina de oro. La sección de negocios y finanzas por sí sola vale miles." },
            { name: "Elena R.", role: "Lectora Ávida", text: "La variedad es increíble. Desde autoayuda hasta ficción, tengo material de lectura suficiente para toda la vida." }
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />)}
              </div>
              <p className="text-neutral-300 italic mb-6">"{item.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-gold-500">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-neutral-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Scarcity Section */}
      <Section className="bg-gold-500/10 border-y border-gold-500/20">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Esta Oferta <span className="text-red-500">Expira Pronto</span></h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Actualmente estamos realizando esta promoción para celebrar a nuestro cliente número 50,000. Una vez que el temporizador llegue a cero, el precio volverá a $97.00.
          </p>
          <CountdownTimer />
          <div className="mt-12">
            <CTAButton className="mx-auto">
              Asegurar mi Precio de $3.99 Ahora
            </CTAButton>
          </div>
        </div>
      </Section>

      {/* Guarantee Section */}
      <Section>
        <div className="max-w-3xl mx-auto glass-card p-10 rounded-3xl flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0">
            <GuaranteeLogo />
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-4">Garantía de Satisfacción del 100%</h3>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Estamos tan seguros de que te encantará la Mega Biblioteca Digital que ofrecemos una garantía de devolución de dinero de <span className="text-gold-500 font-bold">7 días</span>. Si no estás satisfecho por cualquier motivo, simplemente envíanos un correo electrónico y te devolveremos tus $3.99. Sin preguntas.
            </p>
          </div>
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gold-gradient opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 text-center py-10">
          <h2 className="text-4xl md:text-7xl font-bold mb-6">Empieza a Aprender Hoy por Solo $3.99</h2>
          <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-3xl mx-auto">
            Transforma tu teléfono en la biblioteca digital más grande que hayas tenido. Accede a más de 8,000 libros y audiolibros al instante.
          </p>
          <div className="flex flex-col items-center gap-6">
            <CTAButton className="w-full md:w-auto text-xl py-6 px-12">
              COMPRAR AHORA – OBTENER ACCESO INSTANTÁNEO ($3.99)
            </CTAButton>
            <div className="flex items-center gap-4 text-neutral-500">
              <div className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Pago Seguro</div>
              <div className="w-1 h-1 rounded-full bg-neutral-700" />
              <div className="flex items-center gap-1"><Zap className="w-4 h-4" /> Entrega al Instante</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5 text-center text-neutral-600 text-sm">
        <p className="mb-4">&copy; 2026 Mega Biblioteca Digital. Todos los derechos reservados.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-gold-500 transition-colors">Política de Privacidad</a>
          <a href="#" className="hover:text-gold-500 transition-colors">Términos de Servicio</a>
          <a href="#" className="hover:text-gold-500 transition-colors">Soporte de Contacto</a>
        </div>
      </footer>

      {/* Floating Mute/Unmute Control */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 shadow-xl hover:bg-white/10 hover:text-white transition-all duration-300"
          title={isMuted ? "Activar Sonido" : "Silenciar"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Social Proof Notification */}
      <AnimatePresence>
        {recentPurchase && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-[70] bg-neutral-900/90 backdrop-blur-xl border border-gold-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs"
          >
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {recentPurchase.name} de {recentPurchase.city}
              </p>
              <p className="text-xs text-gold-400 font-medium">
                Acaba de comprar la Biblioteca Digital
              </p>
              <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tighter">
                {recentPurchase.time}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Section */}
      {isAdmin && (
        <div className="bg-gray-900 text-white p-8 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif text-gold-400 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Panel de Administración
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <button
                  onClick={() => signOut(auth)}
                  className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-900/50 text-red-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
