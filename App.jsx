import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Globe, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Info,
  User,
  Instagram,
  X,
  Cpu,
  ArrowUpRight,
  Code,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API Configuration - Gemini 2.5 Flash
const apiKey = ""; 

const App = () => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showDevModal, setShowDevModal] = useState(false);
  const [error, setError] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState('');

  // استخراج الأيقونة من الرابط
  const getFavicon = (targetUrl) => {
    try {
      const domain = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch (e) {
      return null;
    }
  };

  // وظيفة للتحقق من صحة الرابط
  const isValidUrl = (string) => {
    try {
      const pattern = new RegExp('^(https?:\\/\\/)?'+ 
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
        '(\\#[-a-z\\d%_.~+ Barb]*)?$','i'); 
      return !!pattern.test(string);
    } catch (e) {
      return false;
    }
  };

  const hybridAnalysis = async (targetUrl) => {
    let engineStatus = 0; 
    
    try {
      const response = await fetch('https://link-checker.nordvpn.com/v1/public-url-checker/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      if (response.ok) {
        const data = await response.json();
        engineStatus = data.status;
      }
    } catch (e) { engineStatus = 0; }

    const systemPrompt = `
      You are ZAKI AI, a Senior Cyber Security Specialist. 
      Analyze the URL and engine status (${engineStatus}).
      - Calculate a realistic 'score' (0-100). 
      - Clean sites: 85-99%. 
      - Threats: 0-20%.

      Response format (JSON ONLY):
      {
        "isSafe": boolean,
        "score": number,
        "threats": string[],
        "summary": string (Arabic),
        "details": { "domain": string, "location": string, "ssl": string, "engine": "ZAKI CORE V3" }
      }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze this: ${targetUrl}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const aiFinal = JSON.parse(data.candidates[0].content.parts[0].text);
      
      return {
        ...aiFinal,
        isSafe: engineStatus === 0 && aiFinal.isSafe,
        score: aiFinal.score === 0 ? (engineStatus === 0 ? 88 : 10) : aiFinal.score
      };
    } catch (err) { return null; }
  };

  const checkLink = async (e) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();
    
    if (!cleanUrl) return;

    if (!isValidUrl(cleanUrl)) {
      setError("Invalid URL - يرجى إدخال رابط صحيح");
      setResult(null);
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setError(null);
    setFaviconUrl(getFavicon(cleanUrl));

    const finalResult = await hybridAnalysis(cleanUrl);

    if (finalResult) {
      setResult(finalResult);
    } else {
      setError("حدث خطأ في نظام الفحص.");
    }
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden selection:bg-blue-500/30">
      
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes pulse-border {
          0% { border-color: rgba(59, 130, 246, 0.2); }
          50% { border-color: rgba(59, 130, 246, 0.5); }
          100% { border-color: rgba(59, 130, 246, 0.2); }
        }
        .analyzing-input { animation: pulse-border 2s infinite; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <header className="text-center mb-10 pt-8">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6">
            <div className="inline-block p-5 bg-gradient-to-br from-blue-600/20 to-transparent rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
               <ShieldCheck size={52} className="text-blue-500 relative z-10" />
               <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 uppercase italic">
            LINK <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">CHECKER</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
            <Zap size={12} className="text-blue-500 animate-pulse" />
            Powered by ZAKI
          </div>
        </header>

        {/* Input Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`bg-slate-900/40 backdrop-blur-2xl p-2 rounded-[2.5rem] border ${error ? 'border-red-500/50' : 'border-white/5'} ${analyzing ? 'analyzing-input' : ''} shadow-2xl mb-6 transition-all`}
        >
          <form onSubmit={checkLink} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4">
               {faviconUrl && !error && (
                 <motion.img 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  src={faviconUrl} 
                  className="w-8 h-8 rounded-lg mr-2 shadow-lg border border-white/10" 
                  alt="Icon"
                  onError={() => setFaviconUrl('')}
                 />
               )}
               <input 
                type="text" 
                placeholder="https://example.com"
                className="w-full bg-transparent border-none py-4 px-2 text-white text-lg outline-none placeholder:text-slate-600 font-mono"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if(error) setError(null);
                  if(!e.target.value) setFaviconUrl('');
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={20} />
                  <span>تحليل</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-red-400 font-bold text-xs px-8 mb-6"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-[3rem] border backdrop-blur-md ${result.isSafe ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  {faviconUrl && (
                    <img src={faviconUrl} className="w-14 h-14 rounded-2xl border-2 border-white/5 bg-slate-800 p-1" alt="site-icon" />
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">التقرير الاستخباراتي</p>
                    <h2 className={`text-4xl font-black ${result.isSafe ? 'text-green-400' : 'text-red-400'}`}>
                      {result.isSafe ? 'رابط آمن' : 'تهديد مكتشف'}
                    </h2>
                  </div>
                </div>
                <div className={`p-5 rounded-2xl shadow-inner ${result.isSafe ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {result.isSafe ? <CheckCircle2 size={40} className="text-green-400" /> : <ShieldAlert size={40} className="text-red-400" />}
                </div>
              </div>

              <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8 leading-relaxed text-slate-300 text-sm font-medium">
                {result.summary}
              </div>

              {/* Confidence Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase mb-2 px-1">
                   <span className="text-slate-500">مؤشر الدقة</span>
                   <span className={result.isSafe ? 'text-green-400' : 'text-red-400'}>{result.score}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${result.score}%` }}
                    className={`h-full ${result.isSafe ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MiniStat label="المحرك" value={result.details.engine} />
                <MiniStat label="النطاق" value={result.details.domain} />
                <MiniStat label="التشفير" value={result.details.ssl} />
                <MiniStat label="المعرف" value={`ID-${Math.floor(Math.random()*9000)+1000}`} />
              </div>

              {!result.isSafe && (
                 <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-[10px] font-black text-red-400 uppercase mb-3">قائمة التهديدات المحتملة:</p>
                    <div className="flex flex-wrap gap-2">
                       {result.threats.map((t, i) => (
                         <span key={i} className="text-[10px] bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30 font-bold">
                           {t}
                         </span>
                       ))}
                    </div>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pb-12 flex flex-col items-center">
          <button 
            onClick={() => setShowDevModal(true)}
            className="group flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-blue-600 transition-all rounded-full border border-white/5 shadow-xl active:scale-95"
          >
            <User size={16} className="text-slate-400 group-hover:text-white" />
            <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">ZG22X PROFILE</span>
            <ArrowUpRight size={14} className="text-slate-600 group-hover:text-white transition-transform" />
          </button>
          <p className="mt-4 text-[9px] text-slate-700 font-bold tracking-[0.3em] uppercase italic">Zero Trust Architecture</p>
        </footer>
      </div>

      {/* Developer Profile Modal */}
      <AnimatePresence>
        {showDevModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDevModal(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.8, y: 50, opacity: 0 }} 
              className="relative bg-[#0f172a] border border-white/10 rounded-[3rem] p-1 shadow-2xl max-w-[340px] w-full overflow-hidden group"
            >
              <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-900 absolute top-0 left-0 right-0 opacity-30" />
              <div className="p-8 pt-12 relative flex flex-col items-center">
                <button onClick={() => setShowDevModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-500 transition-colors hover:text-white"><X size={20} /></button>
                <div className="relative mb-6">
                  <div className="w-28 h-28 bg-slate-800 rounded-[2.5rem] border-4 border-slate-900 overflow-hidden flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                    <User size={60} className="text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 p-2 rounded-xl shadow-lg border-2 border-slate-900">
                    <Code size={16} className="text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-1 tracking-tight">ZG22X</h3>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.5em] mb-8">Elite Developer</p>
                <div className="w-full space-y-3">
                  <a href="https://instagram.com/zg22x" target="_blank" rel="noreferrer" className="flex items-center justify-between w-full bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] text-white p-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 group/btn">
                    <div className="flex items-center gap-3"><Instagram size={20} /><span className="text-sm font-bold tracking-widest">INSTAGRAM</span></div>
                    <ArrowUpRight size={18} className="opacity-50 group-hover/btn:opacity-100 transition-all" />
                  </a>
                  <div className="flex gap-2 w-full">
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                      <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Projects</p>
                      <p className="text-sm font-black text-white">42+</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                      <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Status</p>
                      <p className="text-sm font-black text-blue-400 uppercase">Active</p>
                    </div>
                  </div>
                </div>
                <p className="mt-8 text-[8px] text-slate-700 font-bold uppercase tracking-[0.3em]">SECURE SYSTEM V3.0</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
    <p className="text-[8px] text-slate-500 uppercase font-black mb-1 group-hover:text-blue-400 transition-colors">{label}</p>
    <p className="text-[10px] font-mono text-slate-200 truncate">{value || 'N/A'}</p>
  </div>
);

export default App;