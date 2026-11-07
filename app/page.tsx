"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronRight, Shirt, Wand2, User, Compass, Layers, Plus, Search, X, Check, Moon, Sun, Camera, Heart } from "lucide-react";

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

const BASE_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop";
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
  const [gender, setGender] = useState("Unspecified");
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

  const faceInputRef = useRef<HTMLInputElement>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [avatarGenerated, setAvatarGenerated] = useState(false);

  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [dislikedItems, setDislikedItems] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWardrobe = localStorage.getItem("aura_wardrobe");
      if (savedWardrobe) setWardrobe(JSON.parse(savedWardrobe));
      const savedName = localStorage.getItem("aura_name");
      if (savedName) setUserName(savedName);
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
      localStorage.setItem("aura_dark", isDark.toString());
      localStorage.setItem("aura_likes", JSON.stringify(likedItems));
      localStorage.setItem("aura_dislikes", JSON.stringify(dislikedItems));
      if (avatar) localStorage.setItem("aura_avatar", avatar);
      if (faceImage) localStorage.setItem("aura_face", faceImage);
      if (isDark) document.documentElement.classList.add("dark-mode");
      else document.documentElement.classList.remove("dark-mode");
    }
  }, [wardrobe, userName, isDark, avatar, faceImage, likedItems, dislikedItems]);

  const t = dict[lang];

  const handleGenerate = () => {
    let items: string[] = [];
    let reason = "";
    const text = prompt.toLowerCase();
    const isCold = selectedSeason === "Winter" || selectedWeather === "Cold";
    const isHot = selectedSeason === "Summer" || selectedWeather === "Hot";

    const likedStyles = DISCOVER_IMAGES.filter(img => likedItems.includes(img.id)).map(img => img.styleTag);
    const aiPrefers = likedStyles.length > 0 ? likedStyles.join(", ") : "all styles";

    const tops = wardrobe.filter(i => ["shirt", "t-shirt", "top", "sweater", "jacket"].some(k => i.type.toLowerCase().includes(k)));
    const bottoms = wardrobe.filter(i => ["jeans", "pants", "trousers", "chinos", "shorts"].some(k => i.type.toLowerCase().includes(k)));
    const shoes = wardrobe.filter(i => ["shoe", "sneaker", "slipper", "slider", "loafer", "boot"].some(k => i.type.toLowerCase().includes(k)));
    const extras = wardrobe.filter(i => ["cap", "chain", "ring", "watch", "accessory"].some(k => i.type.toLowerCase().includes(k)));

    if (wardrobe.length === 0) {
      reason = t.emptywardrobe;
      if (
