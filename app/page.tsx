"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronRight, Shirt, Wand2, User, Compass, Layers, Plus, Search, X, Check, Moon, Sun, Camera, Heart, SlidersHorizontal } from "lucide-react";

const dict = {
  en: {
    studio: "Studio", wardrobe: "Wardrobe", avatar: "Avatar", discover: "Discover",
    welcome: "Welcome", letstyle: "Let's style.", desc: "Discover your personal style with intelligent outfit recommendations.",
    placeholder: "What are we dressing for?", create: "Create", ai: "AI Stylist",
    emptywardrobe: "Wardrobe empty. AI generated this look.",
    fullwardrobe: "Generated from your wardrobe.",
    hybridwardrobe: "Mixed your wardrobe with AI suggestions.",
    profile: "Settings", name: "Your Name", gender: "Gender", lang: "Language", theme: "Appearance",
    save: "Save", search: "Search...",
    season: "Season", weather: "Weather", upload_face: "Upload Face", manual_select: "Select Item Type", auto_detect: "Auto-Detect"
  },
  hi: {
    studio: "स्टूडियो", wardrobe: "वार्डरोब", avatar: "अवतार", discover: "खोजें",
    welcome: "स्वागत है", letstyle: "चलिए स्टाइल करें।", desc: "इंटेलिजेंट आउटफिट सुझावों के साथ अपनी शैली खोजें।",
    placeholder: "आज क्या पहनें?", create: "बनाएं", ai: "एआई स्टाइलिस्ट",
    emptywardrobe: "वार्डरोब खाली है। एआई ने यह बनाया है।",
    fullwardrobe: "आपके वार्डरोब से बनाया गया।",
    hybridwardrobe: "आपके कपड़ों और एआई का मिश्रण।",
    profile: "सेटिंग्स", name: "आपका नाम", gender: "लिंग", lang: "भाषा", theme: "थीम",
    save: "सहेजें", search: "खोजें...",
    season: "मौसम", weather: "वेदर", upload_face: "चेहरा अपलोड करें", manual_select: "प्रकार चुनें", auto_detect: "ऑटो-डिटेक्ट"
  }
};

const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

const DUMMY_MALE = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"; 
const DUMMY_FEMALE = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"; 

const DISCOVER_IMAGES = [
  { id: "d1", url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop", title: "Minimal", styleTag: "Minimal" },
  { id: "d2", url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop", title: "Streetwear", styleTag: "Streetwear" },
  { id: "d3", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop", title: "Night Out", styleTag: "Party" },
];

export default function AuraApp() {
  const [activeTab, setActiveTab] = useState("studio");
  const [prompt, setPrompt] = useState("");
  const [outfit, setOutfit] = useState<any>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [gender, setGender] = useState("Male");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isDark, setIsDark] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const [selectedSeason, setSelectedSeason] = useState("Any");
  const [selectedWeather, setSelectedWeather] = useState("Any");

  const [wardrobe, setWardrobe] = useState<{id: string, name: string, type: string, img: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("auto");

  // AVATAR CUSTOMIZATION STATE
  const faceInputRef = useRef<HTMLInputElement>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [avatarGenerated, setAvatarGenerated] = useState(false);
  
  const [bodyType, setBodyType] = useState("Fit");
  const [height, setHeight] = useState(50);
  const [weight, setWeight] = useState(50);
  const [skinColor, setSkinColor] = useState("#e0ac69");

  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [dislikedItems, setDislikedItems] = useState<string[]>([]);

  // SWIPE LOGIC
  let touchStartX = 0;
  let touchEndX = 0;
  const tabs = ["studio", "wardrobe", "avatar", "discover"];

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWardrobe = localStorage.getItem("aura_wardrobe");
      if (savedWardrobe) setWardrobe(JSON.parse(savedWardrobe));
      const savedName = localStorage.getItem("aura_name");
      if (savedName) setUserName(savedName);
      const savedGender = localStorage.getItem("aura_gender");
      if (savedGender) setGender(savedGender);
      const savedDark = localStorage.getItem("aura_dark");
      if (savedDark) setIsDark(savedDark === "true");
      const savedAvatar = localStorage.getItem("aura_avatar");
      if (savedAvatar) setAvatar(savedAvatar);
      const savedFace = localStorage.getItem("aura_face");
      if (savedFace) { setFaceImage(savedFace); setAvatarGenerated(true); }
      const savedLikes = localStorage.getItem("aura_likes");
      if (savedLikes) setLikedItems(JSON.parse(savedLikes));
      const savedDislikes = localStorage.getItem("aura_dislikes");
      if (savedDislikes) setDislikedItems(JSON.parse(savedDislikes));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aura_wardrobe", JSON.stringify(wardrobe));
      localStorage.setItem("aura_name", userName);
      localStorage.setItem("aura_gender", gender);
      localStorage.setItem("aura_dark", isDark.toString());
      localStorage.setItem("aura_likes", JSON.stringify(likedItems));
      localStorage.setItem("aura_dislikes", JSON.stringify(dislikedItems));
      if (avatar) localStorage.setItem("aura_avatar", avatar);
      if (faceImage) localStorage.setItem("aura_face", faceImage);
      if (isDark) document.documentElement.classList.add("dark-mode");
      else document.documentElement.classList.remove("dark-mode");
    }
  }, [wardrobe, userName, gender, isDark, avatar, faceImage, likedItems, dislikedItems]);

  const t = dict[lang];

  const handleGenerate = () => {
    let items: string[] = [];
    let reason = "";
    const text = prompt.toLowerCase();
    const isCold = selectedSeason === "Winter" || selectedWeather === "Cold";
    const isHot = selectedSeason === "Summer" || selectedWeather === "Hot";

    const likedStyles = DISCOVER_IMAGES.filter(img => likedItems.includes(img.id)).map(img => img.styleTag);
    const tops = wardrobe.filter(i => ["shirt", "t-shirt", "top", "sweater", "jacket"].some(k => i.type.toLowerCase().includes(k)));
    const bottoms = wardrobe.filter(i => ["jeans", "pants", "trousers", "chinos", "shorts"].some(k => i.type.toLowerCase().includes(k)));
    const shoes = wardrobe.filter(i => ["shoe", "sneaker", "slipper", "slider", "loafer", "boot"].some(k => i.type.toLowerCase().includes(k)));

    if (wardrobe.length === 0) {
      reason = t.emptywardrobe;
      if (likedStyles.includes("Streetwear")) items = ["Oversized Black Tee", "Baggy Cargo Pants", "Chunky Sneakers", "Beanie"];
      else if (likedStyles.includes("Party")) items = ["Silk Black Shirt", "Tailored Trousers", "Leather Loafers", "Silver Chain"];
      else if (isCold) items = ["Warm Trench Coat", "Knit Sweater", "Thermal Trousers", "Boots"];
      else if (isHot) items = ["White Linen Shirt", "Cotton Shorts", "Sliders"];
      else items = ["Classic White Tee", "Straight Leg Jeans", "Clean White Sneakers", "Minimal Watch"];
    } else {
      if (tops.length > 0) items.push(shuffle([...tops])[0].name);
      if (bottoms.length > 0) items.push(shuffle([...bottoms])[0].name);
      if (shoes.length > 0) items.push(shuffle([...shoes])[0].name);
      if (items.length < 3) reason = t.hybridwardrobe; else reason = t.fullwardrobe;
    }
    setOutfit({ title: `${selectedSeason !== "Any" ? selectedSeason : ""} Look`, items: shuffle(items), reason });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setPendingImage(event.target?.result as string); setSelectedType("auto"); setShowUploadModal(true); };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const confirmUpload = () => {
    if (!pendingImage) return;
    let finalType = selectedType === "auto" ? "Shirt" : selectedType;
    let finalName = selectedType === "auto" ? "AI Scanned Shirt" : selectedType;
    setWardrobe(prev => [...prev, { id: Date.now().toString(), name: finalName, type: finalType, img: pendingImage }]);
    setShowUploadModal(false); setPendingImage(null);
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setFaceImage(event.target?.result as string); setAvatarGenerated(false); };
    reader.readAsDataURL(file);
  };

  const handleLike = (id: string) => {
    setLikedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setDislikedItems(prev => prev.filter(i => i !== id));
  };
  const handleDislike = (id: string) => {
    setDislikedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setLikedItems(prev => prev.filter(i => i !== id));
  };

  const occasionTags = ["Casual", "Streetwear", "Formal", "Aesthetic", "Funky", "Date Night"];

  return (
    <div className="min-h-screen relative overflow-hidden pb-24 font-sans" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="fixed inset-0 -z-10 bg-[var(--bg-main)] transition-colors duration-500">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e0dcd3] dark:bg-[#1c1c1a] blur-[120px] opacity-70 pointer-events-none" />
      </div>

      <div className="px-5 pt-8 flex flex-col gap-6 max-w-md mx-auto relative z-10">
        
        <header className="flex justify-between items-center">
          <h1 className="font-agency text-[#ff2a2a] text-3xl mt-1 tracking-widest drop-shadow-sm">AURA</h1>
          <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm overflow-hidden">
            {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <User size={18} />}
          </button>
        </header>

        {/* STUDIO TAB */}
        {activeTab === "studio" && (
          <div className="flex flex-col gap-5">
            <section className="mt-1 flex flex-col gap-2">
              <h2 className="font-serif text-4xl leading-[1.05] tracking-tight">{t.welcome}, {userName.split(' ')[0]}.</h2>
              <p className="text-[var(--text-muted)] text-xs max-w-sm leading-relaxed">{t.desc}</p>
            </section>

            <section className="flex flex-col gap-3">
              <div className="glass-panel rounded-[28px] p-2 flex flex-col gap-2 transition-all">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full bg-transparent border-none outline-none resize-none px-3 pt-2 pb-0 text-sm placeholder:text-[var(--text-muted)]" rows={2} />
                
                <div className="px-2 pb-1 flex flex-wrap gap-1.5">
                  <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} className="glass-panel px-2 py-1 rounded-md text-[11px] font-medium outline-none">
                    <option value="Any">Any Season</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                  <select value={selectedWeather} onChange={(e) => setSelectedWeather(e.target.value)} className="glass-panel px-2 py-1 rounded-md text-[11px] font-medium outline-none">
                    <option value="Any">Any Weather</option>
                    <option value="Hot">Hot</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>

                <div className="flex justify-between items-center px-1 pb-1">
                  <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1"><Sparkles size={12} /> {t.ai}</span>
                  <button onClick={handleGenerate} className="bg-[var(--text-main)] text-[var(--bg-main)] rounded-full px-4 py-2 text-xs font-medium flex items-center gap-1 hover:opacity-80 active:scale-95 transition-all shadow-md">
                    {t.create} <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="flex overflow-x-auto gap-1.5 pb-1 -mx-5 px-5 scrollbar-hide">
                {occasionTags.map(tag => (
                  <button key={tag} onClick={() => setPrompt(tag)} className="whitespace-nowrap glass-panel px-3 py-1.5 rounded-full text-[11px] font-medium hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-[var(--text-main)]">
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {outfit && (
              <section className="glass-panel p-5 rounded-3xl flex flex-col gap-4">
                
                {/* 3D DUMMY PREVIEW WITH OUTFIT OVERLAY */}
                <div className="w-full h-72 rounded-2xl overflow-hidden relative bg-[#e0dcd3] dark:bg-[#1c1c1a] flex justify-center items-center shadow-inner">
                  <img src={gender === "Female" ? DUMMY_FEMALE : DUMMY_MALE} className="h-full object-cover opacity-90" style={{ filter: `sepia(0.3) hue-rotate(-10deg) saturate(1.2) brightness(${1 + (skinColor === "#8d5524" ? -0.3 : skinColor === "#f1c27d" ? 0.2 : 0)})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Overlay Visuals to simulate clothes */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center opacity-60">
                     <div className="w-32 h-24 bg-[var(--text-main)] rounded-lg mix-blend-multiply opacity-80 blur-[1px]" style={{ transform: `scaleY(${1 + weight/100})`}}></div>
                     <div className="w-24 h-32 bg-[var(--text-main)] rounded-t-lg mix-blend-multiply opacity-80 blur-[1px] mt-1" style={{ transform: `scaleX(${1 + weight/100})`}}></div>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-serif text-xl drop-shadow-md">{outfit.title}</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[var(--text-muted)]" />
                    <h3 className="font-medium text-sm">Outfit Details</h3>
                  </div>
                  {outfit.items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center"><Shirt size={14} /></div>
                      <span className="text-xs font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">"{outfit.reason}"</p>
              </section>
            )}
          </div>
        )}

        {/* WARDROBE TAB */}
        {activeTab === "wardrobe" && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-3xl tracking-tight">{t.wardrobe}</h2>
              <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] flex items-center justify-center shadow-md active:scale-95 transition-transform"><Plus size={18} /></button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
            
            <div className="glass-panel flex items-center px-3 py-2.5 rounded-xl gap-2">
              <Search size={16} className="text-[var(--text-muted)]" />
              <input type="text" placeholder={t.search} className="bg-transparent border-none outline-none w-full text-xs" />
            </div>

            {wardrobe.length === 0 ? (
              <p className="text-[var(--text-muted)] text-xs text-center mt-8">{t.emptywardrobe}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wardrobe.map((item) => (
                  <div key={item.id} className="glass-panel rounded-2xl overflow-hidden aspect-[3/4] relative flex flex-col">
                    <img src={item.img} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-md p-1.5 text-white">
                      <p className="text-[10px] font-bold truncate">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AVATAR TAB - 3D DUMMY */}
        {activeTab === "avatar" && (
          <div className="flex flex-col gap-5 min-h-[50vh]">
            <h2 className="font-serif text-3xl tracking-tight">Your Character</h2>
            
            {!faceImage ? (
              <div className="flex flex-col items-center justify-center mt-8 glass-panel p-6 rounded-2xl">
                <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-3"><User size={30} strokeWidth={1} className="text-[var(--text-muted)]" /></div>
                <h3 className="font-serif text-lg text-center mb-1">Meet your digital self.</h3>
                <p className="text-[var(--text-muted)] text-center text-[11px] mb-5">Upload a face photo to apply it to your 3D dummy.</p>
                <button onClick={() => faceInputRef.current?.click()} className="bg-[var(--text-main)] text-[var(--bg-main)] rounded-full px-6 py-2 text-xs font-medium active:scale-95 transition-transform shadow-md">{t.upload_face}</button>
                <input type="file" accept="image/*" ref={faceInputRef} onChange={handleFaceUpload} className="hidden" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* THE DUMMY CHARACTER */}
                <div className="w-full glass-panel rounded-2xl overflow-hidden relative aspect-[3/4] bg-[#e0dcd3] dark:bg-[#1c1c1a] flex justify-center items-center shadow-lg">
                  <img 
                    src={gender === "Female" ? DUMMY_FEMALE : DUMMY_MALE} 
                    className="h-full object-contain transition-all duration-500" 
                    style={{ 
                      filter: `sepia(0.3) hue-rotate(-10deg) saturate(1.2) brightness(${1 + (skinColor === "#8d5524" ? -0.3 : skinColor === "#f1c27d" ? 0.2 : 0)})`,
                      transform: `scaleY(${1 + (height - 50) / 200}) scaleX(${bodyType === 'Fat' || bodyType === 'Overweight' ? 1.2 : bodyType === 'Skinny' ? 0.85 : 1})`
                    }} 
                  />
                  
                  {/* THE FACE MAPPING OVERLAY */}
                  {faceImage && (
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full overflow-hidden border-2 border-white/50 shadow-md backdrop-blur-sm mix-blend-normal">
                      <img src={faceImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* CUSTOMIZATION SLIDERS */}
                <div className="glass-panel p-4 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 mb-2 text-[var(--text-main)]">
                    <SlidersHorizontal size={16} />
                    <h3 className="font-medium text-sm">Edit Character</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Body Type</label>
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                      {["Skinny", "Fit", "Athletic", "Fat", "Overweight"].map(bt => (
                        <button key={bt} onClick={() => setBodyType(bt)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${bodyType === bt ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm' : 'glass-panel'}`}>{bt}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between"><label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Height</label><span className="text-[10px] text-[var(--text-muted)]">{height}%</span></div>
                    <input type="range" min="1" max="100" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-black dark:accent-white" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between"><label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Weight</label><span className="text-[10px] text-[var(--text-muted)]">{weight}%</span></div>
                    <input type="range" min="1" max="100" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-black dark:accent-white" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Skin Tone</label>
                    <div className="flex gap-2">
                      {["#f1c27d", "#e0ac69", "#c68642", "#8d5524"].map(color => (
                        <button key={color} onClick={() => setSkinColor(color)} className={`w-8 h-8 rounded-full border-2 transition-all ${skinColor === color ? 'border-[var(--text-main)] scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  
                  <button onClick={() => setFaceImage(null)} className="w-full mt-2 text-[10px] font-medium text-[#ff2a2a] underline">Remove Face</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DISCOVER TAB */}
        {activeTab === "discover" && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-3xl tracking-tight mb-1">{t.discover}</h2>
            <div className="columns-2 gap-3 space-y-3">
              {DISCOVER_IMAGES.map((img) => (
                <div key={img.id} className={`relative rounded-2xl overflow-hidden break-inside-avoid h-52 group transition-all duration-300 ${dislikedItems.includes(img.id) ? 'opacity-40 grayscale' : ''}`}>
                  <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 w-full p-2.5 flex justify-between items-end">
                    <p className="text-white text-[11px] font-medium">{img.title}</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleDislike(img.id)} className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition ${dislikedItems.includes(img.id) ? 'bg-[#ff2a2a] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}>
                        <X size={12} />
                      </button>
                      <button onClick={() => handleLike(img.id)} className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition ${likedItems.includes(img.id) ? 'bg-[#ff2a2a] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}>
                        <Heart size={12} className={likedItems.includes(img.id) ? "fill-white" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WARDROBE UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md glass-nav rounded-t-[32px] sm:rounded-[32px] p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-serif text-lg">Add to Wardrobe</h2>
              <button onClick={() => setShowUploadModal(false)} className="w-7 h-7 rounded-full glass-panel flex items-center justify-center"><X size={16} /></button>
            </div>
            {pendingImage && <div className="w-full h-40 rounded-xl overflow-hidden mb-3 border border-black/10 dark:border-white/10"><img src={pendingImage} className="w-full h-full object-cover" /></div>}
            <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5 block">{t.manual_select}</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full glass-panel px-3 py-2 rounded-lg outline-none text-xs font-medium mb-4 appearance-none">
              <option value="auto" className="text-black">✨ {t.auto_detect}</option>
              <option value="Shirt" className="text-black">Shirt</option>
              <option value="Jeans" className="text-black">Jeans</option>
              <option value="Shoes" className="text-black">Shoes</option>
              <option value="Sliders" className="text-black">Sliders</option>
              <option value="Cap" className="text-black">Cap</option>
              <option value="Chain" className="text-black">Chain</option>
            </select>
            <button onClick={confirmUpload} className="w-full bg-[var(--text-main)] text-[var(--bg-main)] rounded-lg py-3 text-sm font-medium flex justify-center items-center gap-1.5 shadow-md"><Check size={16} /> Save</button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md glass-nav rounded-t-[32px] sm:rounded-[32px] p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-serif text-xl">{t.profile}</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              <div className="flex flex-col items-center gap-2">
                <label className="relative w-20 h-20 rounded-full glass-panel flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-[var(--text-muted)] border-dashed">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <Camera size={20} className="text-[var(--text-muted)]" />}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => setAvatar(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </label>
                <span className="text-[10px] text-[var(--text-muted)]">Tap to change</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{t.name}</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full glass-panel px-3 py-2 rounded-lg outline-none text-xs font-medium" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{t.gender}</label>
                <div className="flex gap-1.5">
                  {["Male", "Female", "Other"].map(g => (
                    <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${gender === g ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm' : 'glass-panel'}`}>{g}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{t.theme}</label>
                <div className="flex gap-1.5">
                  <button onClick={() => setIsDark(false)} className={`flex-1 py-2 rounded-lg text-xs font-medium flex justify-center gap-1.5 items-center transition-all ${!isDark ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm' : 'glass-panel'}`}><Sun size={14} /> Light</button>
                  <button onClick={() => setIsDark(true)} className={`flex-1 py-2 rounded-lg text-xs font-medium flex justify-center gap-1.5 items-center transition-all ${isDark ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm' : 'glass-panel'}`}><Moon size={14} /> Dark</button>
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full bg-[var(--text-main)] text-[var(--bg-main)] rounded-lg py-3 text-sm font-medium flex justify-center items-center gap-1.5 mt-2 shadow-md"><Check size={16} /> {t.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CAPSULE TABS */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm glass-nav rounded-full px-1.5 py-1.5 flex justify-between items-center z-50">
        {[
          { id: "studio", icon: Wand2, label: t.studio },
          { id: "wardrobe", icon: Shirt, label: t.wardrobe },
          { id: "avatar", icon: User, label: t.avatar },
          { id: "discover", icon: Compass, label: t.discover }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex flex-col items-center justify-center gap-0.5 w-full py-2 rounded-full transition-all duration-300 ${activeTab === tab.id ? "text-[var(--text-main)] scale-105" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}>
            {activeTab === tab.id && <div className="absolute inset-0 bg-white/70 dark:bg-white/15 rounded-full shadow-sm -z-10" />}
            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
            <span className="text-[9px] font-bold tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
