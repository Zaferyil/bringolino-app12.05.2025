const toggleApothekeCheck = (bauteil, station) => {
  const key = `${bauteil}-${station}`;
  setApothekeChecks((prev) => {
    const currentCount = prev[key] || 0;
    const newCount = currentCount >= 3 ? 0 : currentCount + 1;

    if (newCount === 0) {
      const { [key]: removed, ...rest } = prev;
      return rest;
    }

    return {
      ...prev,
      [key]: newCount,
    };
  });
};

const getApothekeCheckSymbol = (bauteil, station) => {
  const key = `${bauteil}-${station}`;
  const count = apothekeChecks[key] || 0;

  if (count === 0) return null;
  if (count === 1) return "✓";
  if (count === 2) return "✓✓";
  if (count === 3) return "✓✓✓";
};
import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Circle,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  Menu,
  Home,
  BarChart3,
  Filter,
  Bell,
  X,
  Settings,
  TrendingUp,
  Award,
  Target,
  Zap,
  FileText,
  Check,
  Pill,
  Gift,
  Star,
  Coffee,
  Car,
  Plane,
  Wifi,
  WifiOff,
  Download,
  Smartphone,
} from "lucide-react";

const departmentPerformance = [
  { dept: "27527", rate: 85, tasks: 9 },
  { dept: "27522", rate: 92, tasks: 7 },
  { dept: "27525", rate: 78, tasks: 7 },
  { dept: "27529", rate: 88, tasks: 9 },
  { dept: "27530", rate: 75, tasks: 6 },
];

const KrankenhausLogistikApp = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("27527");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showApotheke, setShowApotheke] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [documentationChecks, setDocumentationChecks] = useState({});
  const [apothekeChecks, setApothekeChecks] = useState({});
  const [userPoints, setUserPoints] = useState(150);
  const [purchasedRewards, setPurchasedRewards] = useState([]);

  // ✅ PWA & OFFLINE FEATURES
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'pending', 'syncing'
  const [lastSync, setLastSync] = useState(new Date());
  const [offlineChanges, setOfflineChanges] = useState([]);

  // ✅ YENİ: Lider Dashboard state'leri
  const [showLeaderDashboard, setShowLeaderDashboard] = useState(false);
  const [leaderPassword, setLeaderPassword] = useState("");
  const [isLeaderMode, setIsLeaderMode] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedDepartmentDetails, setSelectedDepartmentDetails] =
    useState(null);
  const [showDepartmentTaskDetails, setShowDepartmentTaskDetails] =
    useState(false);

  // ✅ SADECE ERINNERUNG ÖZELLIKLERI EKLENDI
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showDepartmentComparison, setShowDepartmentComparison] =
    useState(false);
  const [showTimeAnalysis, setShowTimeAnalysis] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    reminderMinutes: 5,
  });

  // ✅ PWA & OFFLINE MANAGEMENT FUNCTIONS

  // Local Storage Management
  const saveToLocalStorage = (key, data) => {
    try {
      const item = {
        data: data,
        timestamp: new Date().getTime(),
        version: "1.0",
      };
      localStorage.setItem(`bringolino_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn("Local storage not available:", error);
    }
  };

  const loadFromLocalStorage = (key) => {
    try {
      const stored = localStorage.getItem(`bringolino_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      console.warn("Error loading from local storage:", error);
    }
    return null;
  };

  // PWA Install Detection
  useEffect(() => {
    console.log("🔧 PWA Install Detection starting...");

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log("🔧 beforeinstallprompt event triggered!", e);
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
      addNotification("📱 App kann jetzt installiert werden!", "info");
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (app is installed)
      const isStandalone =
        window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches;
      const isIOSInstalled = window.navigator.standalone === true;
      const isInWebApk = document.referrer.includes("android-app://");

      const installed = isStandalone || isIOSInstalled || isInWebApk;

      console.log("🔧 Installation check:", {
        isStandalone,
        isIOSInstalled,
        isInWebApk,
        installed,
      });

      if (installed) {
        setIsInstalled(true);
        setShowInstallBanner(false);
        addNotification("📱 App ist bereits installiert!", "success");
      } else {
        // Force show banner for testing if not installed
        console.log("🔧 App not installed - will show banner when possible");
        // Temporär banner anzeigen für Test
        setTimeout(() => {
          if (!installPrompt) {
            console.log(
              "🔧 No native prompt available - showing manual banner"
            );
            setShowInstallBanner(true);
          }
        }, 2000);
      }
    };

    // Event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", (e) => {
      console.log("🔧 App installed event triggered!", e);
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPrompt(null);
      addNotification("🎉 App erfolgreich installiert!", "success");
    });

    // Initial check
    checkIfInstalled();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Network Status Detection
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online && offlineChanges.length > 0) {
        // Sync offline changes when back online
        syncOfflineChanges();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [offlineChanges]);

  // ✅ YENİ: Installation Guide Modal State
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // PWA Install Handler
  const handleInstallApp = async () => {
    console.log("🔧 Install button clicked"); // Debug
    console.log("🔧 Install prompt available:", !!installPrompt); // Debug
    console.log("🔧 Browser:", navigator.userAgent); // Debug

    if (!installPrompt) {
      console.log("🔧 No install prompt available - showing manual guide");
      setShowInstallGuide(true); // Modal'ı aç
      addNotification("📱 Installation Guide geöffnet", "info");
      return;
    }

    try {
      console.log("🔧 Showing install prompt...");
      const result = await installPrompt.prompt();
      console.log("🔧 Install result:", result);

      if (result.outcome === "accepted") {
        console.log("🔧 User accepted installation");
        setShowInstallBanner(false);
        setInstallPrompt(null);
        addNotification("📱 App erfolgreich installiert!", "success");
      } else {
        console.log("🔧 User dismissed installation");
        addNotification("📱 Installation abgebrochen", "info");
      }
    } catch (error) {
      console.error("🔧 Install error:", error);
      // Fallback für Browser die prompt() nicht unterstützen
      const fallbackInstructions =
        '📱 Installation Fallback:\n\n• Chrome: Menu → "App installieren"\n• Safari: Share → "Zum Home-Bildschirm"\n• Firefox: Menu → "Diese Seite installieren"\n• Edge: Menu → "App installieren"';
      alert(fallbackInstructions);
      addNotification("📱 Fallback Installation Guide", "info");
    }
  };

  // Offline Data Sync
  const syncOfflineChanges = async () => {
    if (!isOnline || offlineChanges.length === 0) return;

    setSyncStatus("syncing");

    try {
      // Simulate API sync (in real app, this would be actual API calls)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear offline changes after successful sync
      setOfflineChanges([]);
      setLastSync(new Date());
      setSyncStatus("synced");

      // Show success notification
      addNotification("🔄 Daten erfolgreich synchronisiert!", "sync");
    } catch (error) {
      setSyncStatus("pending");
      addNotification(
        "❌ Synchronisation fehlgeschlagen. Versuche später erneut.",
        "error"
      );
    }
  };

  // Add notification helper
  const addNotification = (message, type = "info") => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      // Check if it's a new day and reset if needed
      const lastSavedDate = loadFromLocalStorage("lastSavedDate");
      const today = new Date().toDateString();

      if (lastSavedDate !== today) {
        // Yeni gün - tüm görevleri sıfırla
        setCompletedTasks(new Set());
        setDocumentationChecks({});
        setApothekeChecks({});

        // Yeni tarihi kaydet
        saveToLocalStorage("lastSavedDate", today);

        // Bildirim göster
        addNotification(
          "🌅 Yeni gün başladı! Tüm görevler sıfırlandı.",
          "info"
        );
      } else {
        // Aynı gün - kaydedilen verileri yükle
        const storedTasks = loadFromLocalStorage("completedTasks");
        if (storedTasks) {
          setCompletedTasks(new Set(storedTasks));
        }
      }

      // Load user points
      const storedPoints = loadFromLocalStorage("userPoints");
      if (storedPoints !== null) {
        setUserPoints(storedPoints);
      }

      // Load documentation checks - reset edilmediyse
      if (lastSavedDate === today) {
        const storedDocs = loadFromLocalStorage("documentationChecks");
        if (storedDocs) {
          setDocumentationChecks(storedDocs);
        }

        // Load apotheke checks - reset edilmediyse
        const storedApotheke = loadFromLocalStorage("apothekeChecks");
        if (storedApotheke) {
          setApothekeChecks(storedApotheke);
        }
      }

      // Load purchased rewards
      const storedRewards = loadFromLocalStorage("purchasedRewards");
      if (storedRewards) {
        setPurchasedRewards(storedRewards);
      }

      // Load selected department
      const storedDept = loadFromLocalStorage("selectedDepartment");
      if (storedDept) {
        setSelectedDepartment(storedDept);
      }
    };

    loadStoredData();
  }, []);

  // ✅ YENİ: Günlük sıfırlama kontrolü - her saat başı kontrol et
  useEffect(() => {
    const checkDailyReset = () => {
      const lastSavedDate = loadFromLocalStorage("lastSavedDate");
      const today = new Date().toDateString();

      if (lastSavedDate && lastSavedDate !== today) {
        // Yeni gün tespit edildi - görevleri sıfırla
        setCompletedTasks(new Set());
        setDocumentationChecks({});
        setApothekeChecks({});

        // Yeni tarihi kaydet
        saveToLocalStorage("lastSavedDate", today);

        // Bildirim göster
        addNotification(
          "🌅 Yeni iş günü başladı! Tüm görevler sıfırlandı.",
          "info"
        );

        console.log("Günlük sıfırlama gerçekleştirildi:", today);
      }
    };

    // İlk kontrolü yap
    checkDailyReset();

    // Her saat başı kontrol et (3600000 ms = 1 saat)
    const interval = setInterval(checkDailyReset, 3600000);

    return () => clearInterval(interval);
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    saveToLocalStorage("completedTasks", Array.from(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    saveToLocalStorage("userPoints", userPoints);
  }, [userPoints]);

  useEffect(() => {
    saveToLocalStorage("documentationChecks", documentationChecks);
  }, [documentationChecks]);

  useEffect(() => {
    saveToLocalStorage("apothekeChecks", apothekeChecks);
  }, [apothekeChecks]);

  useEffect(() => {
    saveToLocalStorage("purchasedRewards", purchasedRewards);
  }, [purchasedRewards]);

  useEffect(() => {
    saveToLocalStorage("selectedDepartment", selectedDepartment);
  }, [selectedDepartment]);
  const [weeklyTrends, setWeeklyTrends] = useState([
    { week: "KW 1", completion: 85, efficiency: 92, quality: 88 },
    { week: "KW 2", completion: 78, efficiency: 85, quality: 91 },
    { week: "KW 3", completion: 92, efficiency: 88, quality: 94 },
    { week: "KW 4", completion: 88, efficiency: 91, quality: 89 },
    { week: "KW 5", completion: 75, efficiency: 93, quality: 92 },
  ]);

  const [hourlyActivity, setHourlyActivity] = useState([
    { hour: "06:00", tasks: 2, efficiency: 95 },
    { hour: "07:00", tasks: 3, efficiency: 88 },
    { hour: "08:00", tasks: 4, efficiency: 92 },
    { hour: "09:00", tasks: 3, efficiency: 85 },
    { hour: "10:00", tasks: 2, efficiency: 90 },
    { hour: "11:00", tasks: 3, efficiency: 87 },
    { hour: "12:00", tasks: 1, efficiency: 100 },
    { hour: "13:00", tasks: 4, efficiency: 89 },
    { hour: "14:00", tasks: 2, efficiency: 94 },
  ]);

  const [departmentMetrics, setDepartmentMetrics] = useState({
    avgCompletionTime: { current: 23, previous: 25, trend: "up" },
    qualityScore: { current: 94, previous: 91, trend: "up" },
    onTimeRate: { current: 89, previous: 85, trend: "up" },
    taskVariation: { current: 12, previous: 15, trend: "down" },
  });

  // İstatistik verileri
  const [dailyStats, setDailyStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    averageTimePerTask: 25,
    mostActiveHour: "09:00",
    streakDays: 3,
    totalPoints: userPoints,
    weeklyGoal: 95,
    monthlyGoal: 92,
  });

  // Örnek departmanlar - Gerçek departman listesi
  const departments = {
    "27527": "Kleiner Botendienst",
    "27522": "Wäsche & Küchen Service",
    "27525": "Bauteil C Service",
    "27529": "Bauteil H & Kindergarten",
    "27530": "Hauptmagazin Service",
    "27521": "Essen Service (N & D)",
  };

  // Görevler - Yeni departmanlar için görev şablonları
  const taskTemplates = {
    "27527": [
      {
        id: 1,
        time: "06:30",
        title: 'Mopp "BT C"',
        description:
          "Nach Mopp-Verteilung, Blut von K101, Präparate und Konservenboxen (leere Kühlboxen) von K101 und OP abholen",
        location: "K101, OP, Labor/Patho",
        priority: "high",
        estimatedDuration: "45 min",
      },
      {
        id: 2,
        time: "07:30",
        title: "Pakete; HLM / APO",
        description: "APO - Post und TW liefern und retour",
        location: "Apotheke",
        priority: "medium",
        estimatedDuration: "15 min",
      },
      {
        id: 3,
        time: "07:45",
        title: "Post Service",
        description:
          "Post von der Poststelle für Seelsorge und Personalstelle mitnehmen und retour",
        location: "Poststelle, Seelsorge, Personal",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 4,
        time: "08:30",
        title: 'Blut "BT D" Transport',
        description: 'Blut "BT D" holen (ausgenommen D101 und D201)',
        location: "Verschiedene Stationen",
        priority: "high",
        estimatedDuration: "30 min",
      },
      {
        id: 5,
        time: "10:00",
        title: "IT Transport (Nur Montags)",
        description:
          "Küchentransport für IT - nur wenn Montag kein Feiertag ist",
        location: "Küche, IT",
        priority: "low",
        condition: "Nur Montags (Dienstags wenn Montag Feiertag)",
        estimatedDuration: "25 min",
      },
      {
        id: 6,
        time: "11:30",
        title: 'Essenswagen "BT H"',
        description: 'Essenswagen "BT H" ausliefern',
        location: "Küche zu Stationen",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 7,
        time: "12:00-12:30",
        title: "Mittagspause",
        description: "Mittagspause",
        location: "Pausenraum",
        priority: "break",
        estimatedDuration: "30 min",
      },
      {
        id: 8,
        time: "12:30",
        title: "Essenswagen Austausch",
        description:
          'Essenswagen von "BT H" Stationen einsammeln und Moppwagen austauschen BT H (HOZ) / N',
        location: "Alle BT H Stationen",
        priority: "medium",
        estimatedDuration: "40 min",
      },
      {
        id: 9,
        time: "13:30",
        title: "Freitag Spezial",
        description: 'Jeden Freitag: Mopp "Bauteil C / K / OP" ausstellen',
        location: "Bauteil C, K, OP",
        priority: "medium",
        condition: "Nur Freitags (Feiertags um 14:00 Uhr)",
        estimatedDuration: "35 min",
      },
    ],
    "27521": [
      {
        id: 39,
        time: "06:30",
        title: "Frühstück ausliefern",
        description:
          "Frühstück in dieser Reihenfolge ausliefern: N102, N103, N201, NOZ3, N101, N202, N204, N104 (Ausräumen lassen und wieder retour zu V1). Dann D101, D102, D103, D201, D202, D203",
        location: "Bauteil N & D Stationen",
        priority: "high",
      },
      {
        id: 40,
        time: "08:30",
        title: "Frühstück einsammeln",
        description:
          "Frühstück einsammeln in dieser Reihenfolge: N204, N201, N202, N101, N102, N103, NOZ3. Dann D101, D102, D103, D201, D202, D203",
        location: "Bauteil N & D Stationen",
        priority: "medium",
      },
      {
        id: 41,
        time: "10:30",
        title: "Mittagessen ausliefern",
        description:
          "Mittagessen ausliefern in dieser Reihenfolge: N102, N103, N201, NOZ3, N101, N202, N204, N104. Dann D101, D102, D103, D201, D202, D203",
        location: "Bauteil N & D Stationen",
        priority: "medium",
      },
      {
        id: 42,
        time: "12:00-12:30",
        title: "Mittagspause",
        description: "Mittagspause",
        location: "Pausenraum",
        priority: "break",
      },
      {
        id: 43,
        time: "12:30",
        title: "Mittagessen einsammeln",
        description:
          "Mittagessen einsammeln in dieser Reihenfolge: N204, N104, N201, N202, N101, N102, N103, NOZ3. Dann D101, D102, D103, D201, D202, D203",
        location: "Bauteil N & D Stationen",
        priority: "medium",
      },
      {
        id: 44,
        time: "14:00",
        title: 'Mopp "BT D/G" ausstellen',
        description: 'Mopp "BT D/G" ausstellen (Freitags um 13:30 Uhr)',
        location: "Bauteil D & G",
        priority: "medium",
        condition: "Freitags um 13:30 Uhr",
      },
    ],
    "27522": [
      {
        id: 10,
        time: "06:30",
        title: "Frischwäschewagen bereitstellen",
        description:
          "Frischwäschewagen bereitstellen, ausliefern und dokumentieren",
        location: "Wäscherei zu Stationen",
        priority: "high",
        estimatedDuration: "45 min",
        condition: "Mo, Mi & Fr Altbau / Di & Do Neubau",
      },
      {
        id: 11,
        time: "08:00",
        title: "Küchen-Nachlieferung",
        description:
          "Küchen-Nachlieferung - Anschließend jeden Montag und Mittwoch: Mineralwasserversorgung",
        location: "Küche zu Stationen",
        priority: "medium",
        estimatedDuration: "30 min",
      },
      {
        id: 12,
        time: "10:30",
        title: "Apothekenversorgung Bauteil K",
        description: "Apothekenversorgung: Bauteil K (ausgenommen Ambulanzen)",
        location: "Apotheke zu Bauteil K",
        priority: "medium",
        estimatedDuration: "25 min",
      },
      {
        id: 13,
        time: "11:30",
        title: "Medikamentenwagen runterstellen",
        description:
          "Medikamentenwagen v. Bauteil K wieder runterstellen und 27518 anrufen wegen zurückstellen",
        location: "Bauteil K",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 14,
        time: "12:00-12:30",
        title: "Mittagspause",
        description: "Mittagspause",
        location: "Pausenraum",
        priority: "break",
        estimatedDuration: "30 min",
      },
      {
        id: 15,
        time: "12:30",
        title: "Essenswagen K101/102 runterstellen",
        description:
          'Essenswagen K101/102 runterstellen. Danach Mopp "Bauteil J / K / G / Ambulanzen" einsammeln. Anschließend Mittagessen einsammeln: G201, G301',
        location: "K101/102, Bauteil J/K/G",
        priority: "medium",
        estimatedDuration: "40 min",
      },
      {
        id: 16,
        time: "14:00",
        title: 'Mopp "BT H" ausstellen',
        description: 'Mopp "BT H" ausstellen (Freitags um 13:30 Uhr)',
        location: "Bauteil H",
        priority: "medium",
        estimatedDuration: "25 min",
        condition: "Freitags um 13:30 Uhr",
      },
    ],
    "27525": [
      {
        id: 17,
        time: "06:30",
        title: "Frühstück ausliefern",
        description:
          "Frühstück ausliefern: C101, C201, C301, C102, C202, C302. Danach JEDEN MONTAG Kleiderbügelständer austauschen",
        location: "Stationen C101-C302",
        priority: "high",
        estimatedDuration: "45 min",
        condition: "Montags: Kleiderbügelständer austauschen",
      },
      {
        id: 18,
        time: "08:15",
        title: "Frühstück einsammeln",
        description: "Frühstück einsammeln: C101, C201, C301, C102, C202, C302",
        location: "Stationen C101-C302",
        priority: "medium",
        estimatedDuration: "30 min",
      },
      {
        id: 19,
        time: "08:30",
        title: "Apothekenversorgung",
        description:
          "Apothekenversorgung; siehe Routenplan (BT C / D und Ambulanzen) - Die leeren APO-Kisten werden mitgenommen!!!",
        location: "Bauteil C/D, Ambulanzen",
        priority: "high",
        estimatedDuration: "40 min",
      },
      {
        id: 20,
        time: "10:30",
        title: "Mittagessen ausliefern",
        description:
          "Mittagessen ausliefern: C101, C201, C301, C102, C202, C302",
        location: "Stationen C101-C302",
        priority: "medium",
        estimatedDuration: "30 min",
      },
      {
        id: 21,
        time: "12:00-12:30",
        title: "Mittagspause",
        description: "Mittagspause",
        location: "Pausenraum",
        priority: "break",
        estimatedDuration: "30 min",
      },
      {
        id: 22,
        time: "12:30",
        title: "Mittagessen einsammeln",
        description:
          'Mittagessen einsammeln: C101, C102, C201, C202, C301, C302. Danach Mopp "BT C / D" einsammeln und retour in Wäscheraum Unrein',
        location: "Stationen C101-C302",
        priority: "medium",
        estimatedDuration: "35 min",
      },
      {
        id: 23,
        time: "14:00",
        title: 'Mopp "BT J" ausstellen',
        description: 'Mopp "BT J" ausstellen (Freitags um 13:30 Uhr)',
        location: "Bauteil J",
        priority: "medium",
        estimatedDuration: "25 min",
        condition: "Freitags um 13:30 Uhr",
      },
    ],
    "27529": [
      {
        id: 24,
        time: "06:30",
        title: 'Austausch Rentomaten "BT N"',
        description: 'Austausch Rentomaten "BT N"',
        location: "Bauteil N",
        priority: "high",
        estimatedDuration: "30 min",
        condition: 'NUR MONTAGS: MOPP BT "D / G" AUSTEILEN!!!',
      },
      {
        id: 25,
        time: "07:20",
        title: "Essenswagen BT H ausliefern",
        description: "Essenswagen BT H ausliefern: H103, H201, H203, H302",
        location: "Bauteil H Stationen",
        priority: "high",
        estimatedDuration: "25 min",
      },
      {
        id: 26,
        time: "09:00",
        title: "Essenswagen BT H einsammeln",
        description: "Essenswagen BT H einsammeln: H103, H201, H203, H302",
        location: "Bauteil H Stationen",
        priority: "medium",
        estimatedDuration: "25 min",
      },
      {
        id: 27,
        time: "09:30",
        title: "Hauptmagazin-Lieferung",
        description:
          "Hauptmagazin-Lieferung (BT H / J / N) gemeinsam mit 27530",
        location: "Bauteil H/J/N",
        priority: "medium",
        estimatedDuration: "40 min",
      },
      {
        id: 28,
        time: "10:40",
        title: 'Essensversorgung "Kindergarten"',
        description: 'Essensversorgung "Kindergarten" gemeinsam mit 27530',
        location: "Kindergarten",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 29,
        time: "11:30-12:00",
        title: "Mittagspause",
        description: "Mittagspause",
        location: "Pausenraum",
        priority: "break",
        estimatedDuration: "30 min",
      },
      {
        id: 30,
        time: "12:15",
        title: "Mikrofasertücher-Wagen",
        description: "Mikrofasertücher-Wagen in Wäscheraum-Unrein stellen",
        location: "Wäscheraum",
        priority: "low",
        estimatedDuration: "10 min",
      },
      {
        id: 31,
        time: "12:20",
        title: 'Essenboxen "Kindergarten" abholen',
        description:
          'Abholung bzw. Rücktransport Essenboxen "Kindergarten" gemeinsam mit 27530',
        location: "Kindergarten",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 32,
        time: "12:30",
        title: "Hauptmagazinwagen dokumentieren",
        description:
          "Hauptmagazinwagen dokumentieren. Danach HLM-Lieferung mit 27530. Anschließend: Hauptmagazinwagen gemeinsam mit 27530 und 27520 retourstellen",
        location: "Hauptmagazin",
        priority: "medium",
        estimatedDuration: "45 min",
      },
    ],
    "27530": [
      {
        id: 33,
        time: "06:30",
        title: 'Austausch Rentomaten "BT N"',
        description: 'Austausch Rentomaten "BT N"',
        location: "Bauteil N",
        priority: "high",
        estimatedDuration: "30 min",
        condition: 'NUR MONTAGS: MOPP BT "H & J" AUSTEILEN!!!',
      },
      {
        id: 34,
        time: "09:30",
        title: "Hauptmagazin-Lieferung",
        description:
          "Hauptmagazin-Lieferung (BT H / J / N) gemeinsam mit 27529",
        location: "Bauteil H/J/N",
        priority: "medium",
        estimatedDuration: "40 min",
      },
      {
        id: 35,
        time: "10:40",
        title: 'Essensversorgung "Kindergarten"',
        description: 'Essensversorgung "Kindergarten" gemeinsam mit 27529',
        location: "Kindergarten",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 36,
        time: "11:30-12:00",
        title: "Mittagspause",
        description: "Mittagspause",
        location: "Pausenraum",
        priority: "break",
        estimatedDuration: "30 min",
      },
      {
        id: 37,
        time: "12:20",
        title: 'Essenboxen "Kindergarten" abholen',
        description:
          'Abholung bzw. Rücktransport Essenboxen "Kindergarten" gemeinsam mit 27529',
        location: "Kindergarten",
        priority: "medium",
        estimatedDuration: "20 min",
      },
      {
        id: 38,
        time: "12:30",
        title: "Hauptmagazin-Lieferung",
        description:
          "Zettel (Transportdokumentation) mitnehmen und die HLM-Wägen aufschreiben. Danach Hauptmagazinversorgung mit 27529. Anschließend: Hauptmagazinwägen gemeinsam mit 27529 und 27520 retourstellen",
        location: "Hauptmagazin",
        priority: "medium",
        estimatedDuration: "45 min",
      },
    ],
  };

  const toggleTask = (taskId) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
      // Görev geri alınırsa puan düş
      const newPoints = Math.max(0, userPoints - 15);
      setUserPoints(newPoints);
    } else {
      newCompletedTasks.add(taskId);
      // Görev tamamlanırsa puan kazan
      const newPoints = userPoints + 15;
      setUserPoints(newPoints);
    }
    setCompletedTasks(newCompletedTasks);

    // ✅ PWA: Track offline changes
    if (!isOnline) {
      const change = {
        type: "task_toggle",
        taskId,
        timestamp: new Date().getTime(),
        action: newCompletedTasks.has(taskId) ? "complete" : "uncomplete",
      };
      setOfflineChanges((prev) => [...prev, change]);
      setSyncStatus("pending");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "from-red-400 via-red-500 to-pink-500";
      case "medium":
        return "from-yellow-400 via-orange-400 to-orange-500";
      case "low":
        return "from-green-400 via-emerald-400 to-teal-500";
      case "break":
        return "from-blue-400 via-indigo-400 to-purple-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "break":
        return <Clock className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Dinamik süre hesaplama fonksiyonu
  const calculateDuration = (currentTime, nextTime, isLastTask = false) => {
    // Zaman aralığı formatı kontrolü (12:00-12:30)
    if (currentTime.includes("-")) {
      const [start, end] = currentTime.split("-");
      const startMinutes = convertTimeToMinutes(start);
      const endMinutes = convertTimeToMinutes(end);
      return `${endMinutes - startMinutes} min`;
    }

    // Son görev için varsayılan süre
    if (isLastTask) {
      return "30 min";
    }

    // Normal hesaplama
    const currentMinutes = convertTimeToMinutes(currentTime);
    const nextMinutes = convertTimeToMinutes(nextTime);
    const duration = nextMinutes - currentMinutes;

    return `${duration} min`;
  };

  // Saat formatını dakikaya çeviren yardımcı fonksiyon
  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Dinamik süre ile görevleri güncelle
  const getTasksWithDynamicDuration = (tasks) => {
    return tasks.map((task, index) => {
      const nextTask = tasks[index + 1];
      const isLastTask = index === tasks.length - 1;

      return {
        ...task,
        estimatedDuration: calculateDuration(
          task.time,
          nextTask?.time,
          isLastTask
        ),
      };
    });
  };

  // Dinamik süre ile görevleri al
  const currentTasks = getTasksWithDynamicDuration(
    taskTemplates[selectedDepartment] || []
  );
  const filteredTasks =
    filterPriority === "all"
      ? currentTasks
      : currentTasks.filter((task) => task.priority === filterPriority);

  const completedCount = Array.from(completedTasks).filter((id) =>
    currentTasks.some((task) => task.id === id)
  ).length;

  const progress =
    currentTasks.length > 0 ? (completedCount / currentTasks.length) * 100 : 0;

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isTaskActive = (taskTime) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (taskTime.includes("-")) {
      const [start] = taskTime.split("-");
      const [hours, minutes] = start.split(":").map(Number);
      const taskTimeMinutes = hours * 60 + minutes;
      return Math.abs(currentTime - taskTimeMinutes) <= 30;
    } else {
      const [hours, minutes] = taskTime.split(":").map(Number);
      const taskTimeMinutes = hours * 60 + minutes;
      return Math.abs(currentTime - taskTimeMinutes) <= 30;
    }
  };

  // ✅ ERINNERUNG FUNKTIONEN
  // Timer für aktuelle Zeit
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Erinnerung kontrollü
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      currentTasks.forEach((task) => {
        if (completedTasks.has(task.id)) return;

        let taskTimeMinutes;
        if (task.time.includes("-")) {
          const [start] = task.time.split("-");
          const [hours, minutes] = start.split(":").map(Number);
          taskTimeMinutes = hours * 60 + minutes;
        } else {
          const [hours, minutes] = task.time.split(":").map(Number);
          taskTimeMinutes = hours * 60 + minutes;
        }

        const reminderTime = taskTimeMinutes - reminderSettings.reminderMinutes;
        const timeDiff = currentMinutes - reminderTime;

        if (timeDiff >= 0 && timeDiff <= 1) {
          const existingNotification = notifications.find(
            (n) => n.taskId === task.id
          );
          if (!existingNotification) {
            const newNotification = {
              id: Date.now(),
              taskId: task.id,
              title: `Erinnerung: ${task.title}`,
              message: `Aufgabe beginnt in ${reminderSettings.reminderMinutes} Minuten um ${task.time}`,
              time: now.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              priority: task.priority,
              isRead: false,
            };

            setNotifications((prev) => [...prev, newNotification]);
          }
        }
      });
    };

    checkReminders();
  }, [
    currentTime,
    currentTasks,
    completedTasks,
    reminderSettings,
    notifications,
  ]);

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // İstatistikleri güncelle
  useEffect(() => {
    const updateStats = () => {
      const total = currentTasks.length;
      const completed = Array.from(completedTasks).filter((id) =>
        currentTasks.some((task) => task.id === id)
      ).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Hedef kontrolü ve streak hesaplama
      const weeklyGoalMet = rate >= 95;
      const monthlyGoalMet = rate >= 92;
      const newStreakDays =
        rate === 100 ? 5 : rate >= 80 ? 3 : rate >= 60 ? 2 : 1;

      setDailyStats({
        totalTasks: total,
        completedTasks: completed,
        completionRate: rate,
        averageTimePerTask: 25,
        mostActiveHour: "09:00",
        streakDays: newStreakDays,
        totalPoints: userPoints,
        weeklyGoal: 95,
        monthlyGoal: 92,
        weeklyGoalMet,
        monthlyGoalMet,
        efficiency: Math.min(rate + 5, 100),
        quality: Math.min(rate + 3, 100),
      });

      // Weekly trends güncelle
      setWeeklyTrends((prev) =>
        prev.map((week, index) =>
          index === prev.length - 1
            ? {
                ...week,
                completion: rate,
                efficiency: Math.min(rate + 5, 100),
                quality: Math.min(rate + 3, 100),
              }
            : week
        )
      );
    };

    updateStats();
  }, [currentTasks, completedTasks, userPoints]);

  // Belohnung Sistemi
  const rewards = [
    {
      id: "coffee",
      name: "Kostenloser Kaffee",
      icon: "☕",
      points: 350,
      description: "Gratis Kaffee aus dem Automaten",
    },
    {
      id: "lunch",
      name: "Kostenloses Mittagessen",
      icon: "🍽️",
      points: 750,
      description: "Gratis Menü in der Kantine",
    },
    {
      id: "parking",
      name: "1 Tag Kostenlose Parkplatz",
      icon: "🅿️",
      points: 750,
      description: "1 Tag VIP Parkplatz näher zum Eingang",
    },
    {
      id: "wellness",
      name: "Wellness Gutschein",
      icon: "💆",
      points: 2250,
      description: "50€ Gutschein für Spa/Massage",
    },
  ];

  const purchaseReward = (rewardId) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward && userPoints >= reward.points) {
      const newPoints = userPoints - reward.points;
      setUserPoints(newPoints);

      // Satın alınan ödülleri kaydet
      const newPurchased = [
        ...purchasedRewards,
        {
          id: rewardId,
          name: reward.name,
          date: new Date().toLocaleDateString("de-DE"),
          time: new Date().toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
      setPurchasedRewards(newPurchased);

      // Satın alma başarı mesajı göster
      alert(
        `🎉 ${reward.name} erfolgreich gekauft!\n💰 Verbrauchte Punkte: ${reward.points}\n⭐ Verbleibende Punkte: ${newPoints}`
      );
    }
  };

  // Haftalık veri simülasyonu
  const weeklyData = [
    { day: "Mo", completed: 8, total: 9 },
    { day: "Di", completed: 7, total: 8 },
    { day: "Mi", completed: 9, total: 9 },
    { day: "Do", completed: 6, total: 8 },
    {
      day: "Fr",
      completed: dailyStats.completedTasks,
      total: dailyStats.totalTasks,
    },
    { day: "Sa", completed: 0, total: 0 },
    { day: "So", completed: 0, total: 0 },
  ];

  const currentDeptPerformance = departmentPerformance.find(
    (d) => d.dept === selectedDepartment
  );
  const updatedDepartmentPerformance = departmentPerformance.map((dept) =>
    dept.dept === selectedDepartment
      ? {
          ...dept,
          rate: dailyStats.completionRate,
          tasks: dailyStats.totalTasks,
        }
      : dept
  );

  // Wäsche Dokumentation Verisi
  const waescheDocumentation = {
    "Bauteil K": [
      "OP",
      "OP Nachtdienst",
      "Anästhesie Nachtd.",
      "Anästhesie",
      "Angiographie",
      "MRI",
      "NUK",
      "Zentralsterilisation",
      "Röntgeninstitut",
      "K101",
      "K102",
      "Internist",
      "NC-Ambulanz",
      "NL-Ambulanz",
      "NMAZ",
      "Portier",
      "CT",
    ],
    "Bauteil C": [
      "C101",
      "C102",
      "C201",
      "C202",
      "C301",
      "C302",
      "Labor",
      "Pathologie",
      "Gebäude C",
      "Hausreinigung",
      "Schlaflabor C 102",
      "Theor. NC",
    ],
    "Bauteil J": [
      "J101",
      "J102",
      "J103",
      "J201",
      "J202",
      "J203",
      "J301",
      "J303",
      "Nachtdienst J",
    ],
    "Bauteil H": [
      "H101",
      "H102",
      "H103",
      "H201",
      "H202",
      "H203",
      "H302",
      "Zentrum f. Suchtm.",
    ],
    "Bauteil D": [
      "D101",
      "D102",
      "D103",
      "D201",
      "D202",
      "D203",
      "SPAZ",
      "Logopädie",
      "Ergotherapie",
      "Physik. Med.",
      "Musiktherapie",
      "Kinderg.&Krabbel.",
      "Techn.Betriebs.",
    ],
    "Bauteil S": [
      "FH Ergotherapie",
      "Gespag Akad.",
      "Schule f. psych.",
      "Ges.-und Krankpfl.",
      "Sportwissen ger.",
    ],
    "Bauteil L": [
      "Servicebereiche",
      "Ärztliche Direktion",
      "Aus- und Fortb.",
      "Eink.- und Besch.",
      "Klinische Sozial.",
      "Personalstelle",
      "Pflegedirektion",
      "Rechnungswesen",
      "Seelsorge, Kapelle",
      "Sozialzentrum",
    ],
    "Bauteil G": [
      "G201",
      "G301",
      "Klinische Psych.",
      "Psychotherapie",
      "Gebäude G",
      "Küche",
      "Apotheke",
    ],
    "Bauteil N": [
      "NOZ3",
      "N101",
      "N102",
      "N103",
      "N104",
      "N201",
      "N202",
      "N204",
      "Nachtdienst N",
      "Betriebsrat",
      "Arbeitsmedizin",
      "Hausreinigung",
      "HBD",
      "Wäscheversorgung",
      "Notfalllager",
    ],
  };

  // Demo Apotheke Dokumentation Verisi
  const apothekeDocumentation = {
    "Bauteil C": [
      "C101 - Innere Medizin",
      "C102 - Kardiologie",
      "C201 - Neurologie",
      "C202 - Onkologie",
      "C301 - Ambulanz",
      "C302 - Tagesklinik",
    ],
    "Bauteil D": [
      "D101 - Pädiatrie",
      "D102 - Neonatologie",
      "D201 - Gynäkologie",
      "D202 - Geburtshilfe",
      "D203 - Chirurgie",
    ],
    "Bauteil H": [
      "H101 - Intensivstation",
      "H102 - Intermediate Care",
      "H103 - Recovery",
      "H201 - Orthopädie",
      "H302 - Unfallchirurgie",
    ],
    "Bauteil J": [
      "J101 - Psychiatrie",
      "J102 - Psychosomatik",
      "J201 - Suchtmedizin",
      "J301 - Tagesklinik Psychiatrie",
    ],
    "Bauteil K": [
      "OP-Säle 1-8",
      "Anästhesie",
      "Aufwachraum",
      "Notfall-OP",
      "Ambulante OPs",
    ],
    "Bauteil N": [
      "Notaufnahme",
      "Schockraum",
      "Erste Hilfe",
      "Rettungsstelle",
      "Beobachtungsstation",
    ],
    Spezialstationen: [
      "Dialyse",
      "Endoskopie",
      "Herzkatheterlabor",
      "Radiologie",
      "Nuklearmedizin",
      "Pathologie",
    ],
  };

  const toggleDocumentationCheck = (bauteil, station) => {
    const key = `${bauteil}-${station}`;
    setDocumentationChecks((prev) => {
      const currentCount = prev[key] || 0;
      const newCount = currentCount >= 3 ? 0 : currentCount + 1;

      if (newCount === 0) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [key]: newCount,
      };
    });
  };

  const getCheckSymbol = (bauteil, station) => {
    const key = `${bauteil}-${station}`;
    const count = documentationChecks[key] || 0;

    if (count === 0) return null;
    if (count === 1) return "✓";
    if (count === 2) return "✓✓";
    if (count === 3) return "✓✓✓";
  };

  // ✅ YENİ: Lider Dashboard fonksiyonları
  const handleLeaderLogin = () => {
    if (leaderPassword === "leader123") {
      setIsLeaderMode(true);
      setShowLeaderDashboard(true);
      setShowPasswordPrompt(false);
      setLeaderPassword("");
    } else {
      alert("❌ Falsches Passwort!");
      setLeaderPassword("");
    }
  };

  const handleLeaderLogout = () => {
    setIsLeaderMode(false);
    setShowLeaderDashboard(false);
    setShowPasswordPrompt(false);
    setLeaderPassword("");
  };

  // Tüm departmanlar için istatistikleri topla
  const getAllDepartmentStats = () => {
    return Object.keys(departments).map((deptCode) => {
      const tasks = taskTemplates[deptCode] || [];
      const completed = Array.from(completedTasks).filter((id) =>
        tasks.some((task) => task.id === id)
      ).length;
      const total = tasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        code: deptCode,
        name: departments[deptCode],
        completed,
        total,
        rate,
        tasks: tasks, // ✅ YENİ: Görevleri de ekledik
        status:
          rate >= 80 ? "excellent" : rate >= 60 ? "good" : "needs_attention",
      };
    });
  };

  // ✅ YENİ: Departman detaylarını açma fonksiyonu
  const handleDepartmentClick = (deptCode) => {
    console.log("Department clicked:", deptCode); // Debug için
    const deptStats = getAllDepartmentStats().find((d) => d.code === deptCode);
    console.log("Department stats:", deptStats); // Debug için
    setSelectedDepartmentDetails(deptStats);
    setShowDepartmentTaskDetails(true);
  };

  // ✅ YENİ: Görev durumunu kontrol etme fonksiyonu
  const getTaskStatus = (taskId) => {
    return completedTasks.has(taskId) ? "completed" : "pending";
  };

  const toggleApothekeCheck = (bauteil, station) => {
    const key = `${bauteil}-${station}`;
    setApothekeChecks((prev) => {
      const currentCount = prev[key] || 0;
      const newCount = currentCount >= 3 ? 0 : currentCount + 1;

      if (newCount === 0) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [key]: newCount,
      };
    });
  };

  const getApothekeCheckSymbol = (bauteil, station) => {
    const key = `${bauteil}-${station}`;
    const count = apothekeChecks[key] || 0;

    if (count === 0) return null;
    if (count === 1) return "✓";
    if (count === 2) return "✓✓";
    if (count === 3) return "✓✓✓";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* ✅ RESPONSIVE HEADER - Mobile First, Desktop Scalable */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* ✅ PWA STATUS BAR */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Bringolino
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {getCurrentTime()}
                  </p>
                  {/* ✅ PWA: Network Status Indicator */}
                  <div className="flex items-center">
                    {isOnline ? (
                      <Wifi className="w-3 h-3 text-green-500" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-500" />
                    )}
                    {syncStatus === "pending" && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full ml-1 animate-pulse" />
                    )}
                    {syncStatus === "syncing" && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full ml-1 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ RESPONSIVE QUICK ACTIONS - Hidden/Visible based on screen size */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop Quick Actions */}
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDocumentation(!showDocumentation)}
                  className="p-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowApotheke(!showApotheke)}
                  className="p-2 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <Pill className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowRewards(!showRewards)}
                  className="p-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <Gift className="w-5 h-5" />
                </button>
              </div>

              {/* Always Visible Core Actions */}
              {/* ✅ PWA: Install App Button */}
              {showInstallBanner && !isInstalled && (
                <button
                  onClick={handleInstallApp}
                  className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:scale-105 transition-transform"
                  title="App installieren"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* ✅ PWA: Installed App Indicator */}
              {isInstalled && (
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}

              <button
                onClick={() => {
                  if (isLeaderMode) {
                    handleLeaderLogout();
                  } else {
                    setShowPasswordPrompt(true);
                  }
                }}
                className={`p-2 rounded-xl text-white shadow-lg hover:scale-105 transition-transform ${
                  isLeaderMode
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : "bg-gradient-to-r from-purple-400 to-purple-500"
                }`}
              >
                {isLeaderMode ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg hover:scale-105 transition-transform"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-lg hover:scale-105 transition-transform"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* ✅ PWA: INSTALL BANNER */}
          {showInstallBanner && !isInstalled && (
            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-2xl border border-green-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-green-800 flex items-center text-sm sm:text-base">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  📱 Bringolino App installieren
                </h3>
                <button
                  onClick={() => {
                    setShowInstallBanner(false);
                    console.log("🔧 Install banner closed by user");
                  }}
                  className="p-1 rounded-lg hover:bg-green-100"
                >
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  🚀 Installieren Sie Bringolino als App für die beste
                  Erfahrung:
                </p>
                <ul className="text-xs text-green-600 space-y-1 ml-4">
                  <li>• ⚡ Schnellerer Zugriff vom Home-Bildschirm</li>
                  <li>• 📴 Offline-Funktionalität</li>
                  <li>• 🔔 Push-Benachrichtigungen (coming soon)</li>
                  <li>• 🏠 Native App-Erfahrung</li>
                </ul>

                {/* Debug Info */}
                <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded border">
                  <strong>🔧 Debug Status:</strong>
                  <br />• Install Prompt:{" "}
                  {installPrompt ? "✅ Verfügbar" : "❌ Nicht verfügbar"}
                  <br />• App installiert: {isInstalled ? "✅ Ja" : "❌ Nein"}
                  <br />• Browser:{" "}
                  {navigator.userAgent.includes("Chrome")
                    ? "Chrome"
                    : navigator.userAgent.includes("Safari")
                    ? "Safari"
                    : navigator.userAgent.includes("Firefox")
                    ? "Firefox"
                    : "Andere"}
                  <br />• Standalone Mode:{" "}
                  {window.matchMedia &&
                  window.matchMedia("(display-mode: standalone)").matches
                    ? "✅ Ja"
                    : "❌ Nein"}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => {
                      console.log("🔧 Install button clicked from banner");
                      handleInstallApp();
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {installPrompt
                      ? "🚀 Jetzt installieren"
                      : "📖 Installation Guide"}
                  </button>
                  <button
                    onClick={() => {
                      setShowInstallBanner(false);
                      console.log("🔧 Install banner dismissed by user");
                    }}
                    className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                  >
                    Später erinnern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ PWA: OFFLINE STATUS BANNER */}
          {!isOnline && (
            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center text-sm text-orange-800">
                <WifiOff className="w-4 h-4 mr-2" />
                <span className="font-medium">Offline-Modus</span>
                <span className="ml-2 text-xs text-orange-600">
                  - Daten werden automatisch synchronisiert, wenn Sie wieder
                  online sind
                </span>
              </div>
            </div>
          )}

          {/* ✅ PWA: SYNC STATUS BANNER */}
          {isOnline &&
            syncStatus === "pending" &&
            offlineChanges.length > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-blue-800">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {offlineChanges.length} Änderungen warten auf
                      Synchronisation
                    </span>
                  </div>
                  <button
                    onClick={syncOfflineChanges}
                    className="py-2 px-3 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                  >
                    Jetzt synchronisieren
                  </button>
                </div>
              </div>
            )}

          {/* ✅ PWA: SYNC SUCCESS BANNER */}
          {syncStatus === "syncing" && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center text-sm text-green-800">
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-green-600 border-t-transparent rounded-full"></div>
                <span className="font-medium">Synchronisiere Daten...</span>
              </div>
            </div>
          )}

          {/* ✅ PWA: INSTALLATION GUIDE MODAL */}
          {showInstallGuide && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white/90 backdrop-blur-xl p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                    📱 Bringolino App Installation Guide
                  </h3>
                  <button
                    onClick={() => setShowInstallGuide(false)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-3 sm:p-4">
                  {/* Browser Detection */}
                  {(() => {
                    const userAgent = navigator.userAgent.toLowerCase();

                    if (
                      userAgent.includes("safari") &&
                      !userAgent.includes("chrome")
                    ) {
                      // Safari Instructions
                      return (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                              🦘 Safari Browser erkannt
                            </h4>
                            <p className="text-sm text-blue-700 mb-3">
                              Folgen Sie diesen Schritten um Bringolino als App
                              zu installieren:
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Teilen-Symbol antippen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Tippen Sie auf das Teilen-Symbol (□↗) unten in
                                  der Browser-Leiste
                                </div>
                                <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  💡 Das Symbol sieht aus wie ein Quadrat mit
                                  einem Pfeil nach oben
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Nach unten scrollen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Scrollen Sie in der Teilen-Liste nach unten
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                3
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  "Zum Home-Bildschirm" wählen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Tippen Sie auf "Zum Home-Bildschirm
                                  hinzufügen"
                                </div>
                                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  📱 Icon: Quadrat mit einem Plus-Symbol
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                4
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Installation bestätigen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Tippen Sie auf "Hinzufügen" um die
                                  Installation abzuschließen
                                </div>
                                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  🎉 Die App erscheint dann auf Ihrem
                                  Home-Bildschirm!
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (userAgent.includes("chrome")) {
                      // Chrome Instructions
                      return (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center">
                              🌐 Chrome Browser erkannt
                            </h4>
                            <p className="text-sm text-green-700 mb-3">
                              Chrome bietet native PWA-Installation. Folgen Sie
                              diesen Schritten:
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Chrome-Menü öffnen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Tippen Sie auf die drei Punkte (⋮) oben rechts
                                </div>
                                <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  💡 Mobile: Drei Punkte vertikal | Desktop:
                                  Drei Punkte horizontal
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  "App installieren" wählen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Suchen Sie nach "App installieren" oder "Zum
                                  Startbildschirm hinzufügen"
                                </div>
                                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  📱 Kann auch als "Zum Home-Bildschirm"
                                  angezeigt werden
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                3
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Installation bestätigen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Bestätigen Sie mit "Installieren" oder
                                  "Hinzufügen"
                                </div>
                                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  🎉 Die App wird als eigenständige Anwendung
                                  installiert!
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (userAgent.includes("firefox")) {
                      // Firefox Instructions
                      return (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                              🦊 Firefox Browser erkannt
                            </h4>
                            <p className="text-sm text-orange-700 mb-3">
                              Firefox unterstützt PWA-Installation. Folgen Sie
                              diesen Schritten:
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Firefox-Menü öffnen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Tippen Sie auf das Hamburger-Menü (☰)
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  "Diese Seite installieren" wählen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Suchen Sie nach der Install-Option im Menü
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                3
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Installation bestätigen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Bestätigen Sie mit "Installieren"
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Generic Instructions for other browsers
                      return (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                              🌐 Universelle Installation
                            </h4>
                            <p className="text-sm text-purple-700 mb-3">
                              Allgemeine Anweisungen für die meisten Browser:
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Browser-Menü öffnen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Suchen Sie nach dem Hauptmenü Ihres Browsers
                                  (meist drei Punkte oder Linien)
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Install-Option suchen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Suchen Sie nach:
                                </div>
                                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                                  <li>• "App installieren"</li>
                                  <li>• "Zum Startbildschirm hinzufügen"</li>
                                  <li>• "Zum Home-Bildschirm"</li>
                                  <li>• "Diese Seite installieren"</li>
                                </ul>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                3
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  Den Anweisungen folgen
                                </div>
                                <div className="text-sm text-gray-600">
                                  Folgen Sie den Browser-spezifischen
                                  Anweisungen zur Installation
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* Benefits Section */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-3">
                      🚀 Vorteile der App-Installation:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-yellow-700">
                      <div className="flex items-center space-x-2">
                        <span>⚡</span>
                        <span>Schnellerer Zugriff</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📴</span>
                        <span>Offline-Funktionalität</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🔔</span>
                        <span>Push-Benachrichtigungen</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🏠</span>
                        <span>Native App-Erfahrung</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => setShowInstallGuide(false)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                    >
                      ✅ Verstanden, Guide schließen
                    </button>
                    <button
                      onClick={() => {
                        setShowInstallGuide(false);
                        setShowInstallBanner(false);
                      }}
                      className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                    >
                      ⏰ Später installieren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE SETTINGS PANEL */}
          {showSettings && (
            <div className="mt-4 p-3 sm:p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Erinnerungseinstellungen
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Erinnerungen aktiviert
                  </span>
                  <button
                    onClick={() =>
                      setReminderSettings((prev) => ({
                        ...prev,
                        enabled: !prev.enabled,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      reminderSettings.enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        reminderSettings.enabled
                          ? "translate-x-6"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Erinnerung vor Aufgabe (Minuten)
                  </label>
                  <select
                    value={reminderSettings.reminderMinutes}
                    onChange={(e) =>
                      setReminderSettings((prev) => ({
                        ...prev,
                        reminderMinutes: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={1}>1 Minute</option>
                    <option value={3}>3 Minuten</option>
                    <option value={5}>5 Minuten</option>
                    <option value={10}>10 Minuten</option>
                    <option value={15}>15 Minuten</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE PASSWORD PROMPT */}
          {showPasswordPrompt && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  Leiter Dashboard Zugang
                </h3>
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Leiter Passwort eingeben:
                  </label>
                  <input
                    type="password"
                    value={leaderPassword}
                    onChange={(e) => setLeaderPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleLeaderLogin()}
                    placeholder="Passwort..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-gray-500 text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleLeaderLogin}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                  >
                    Anmelden
                  </button>
                  <button
                    onClick={() => setShowPasswordPrompt(false)}
                    className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                  >
                    Abbrechen
                  </button>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Demo Passwort: leader123
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE LEADER DASHBOARD */}
          {showLeaderDashboard && isLeaderMode && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  Leiter Dashboard
                </h3>
                <button
                  onClick={handleLeaderLogout}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* ✅ RESPONSIVE OVERVIEW GRID */}
              <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-3 text-sm sm:text-base">
                  📊 Gesamtübersicht
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-700">
                      {getAllDepartmentStats().reduce(
                        (sum, dept) => sum + dept.completed,
                        0
                      )}
                    </div>
                    <div className="text-xs text-purple-600">
                      Erledigte Aufgaben
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-700">
                      {Math.round(
                        getAllDepartmentStats().reduce(
                          (sum, dept) => sum + dept.rate,
                          0
                        ) / getAllDepartmentStats().length
                      )}
                      %
                    </div>
                    <div className="text-xs text-purple-600">Durchschnitt</div>
                  </div>
                </div>
              </div>

              {/* ✅ RESPONSIVE DEPARTMENT DETAILS */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  DEC Übersicht
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                  {getAllDepartmentStats().map((dept) => (
                    <div
                      key={dept.code}
                      className={`p-3 rounded-xl border transition-all ${
                        dept.status === "excellent"
                          ? "bg-green-50 border-green-300"
                          : dept.status === "good"
                          ? "bg-yellow-50 border-yellow-300"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-gray-800 flex items-center">
                            {dept.code}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Event bubbling'i durdur
                                console.log(
                                  "Button clicked for dept:",
                                  dept.code
                                );
                                handleDepartmentClick(dept.code);
                              }}
                              className="ml-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
                            >
                              Details →
                            </button>
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {dept.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              dept.status === "excellent"
                                ? "text-green-700"
                                : dept.status === "good"
                                ? "text-yellow-700"
                                : "text-red-700"
                            }`}
                          >
                            {dept.rate}%
                          </div>
                          <div className="text-xs text-gray-600">
                            {dept.completed}/{dept.total}
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            dept.status === "excellent"
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : dept.status === "good"
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : "bg-gradient-to-r from-red-400 to-red-500"
                          }`}
                          style={{ width: `${dept.rate}%` }}
                        ></div>
                      </div>

                      <div
                        className={`mt-2 text-xs font-medium ${
                          dept.status === "excellent"
                            ? "text-green-700"
                            : dept.status === "good"
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}
                      >
                        {dept.status === "excellent"
                          ? "🟢 Ausgezeichnet"
                          : dept.status === "good"
                          ? "🟡 Gut"
                          : "🔴 Aufmerksamkeit erforderlich"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zeit und Datum */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-xs text-blue-600 text-center">
                  <strong>Letztes Update:</strong>{" "}
                  {new Date().toLocaleString("de-DE")}
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE DEPARTMENT TASK DETAILS */}
          {showDepartmentTaskDetails && selectedDepartmentDetails && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  <span className="truncate">
                    DECT {selectedDepartmentDetails.code} - Details
                  </span>
                </h3>
                <button
                  onClick={() => setShowDepartmentTaskDetails(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* ✅ RESPONSIVE DEPARTMENT SUMMARY */}
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <h4 className="font-bold text-indigo-800 mb-2 text-sm sm:text-base truncate">
                  {selectedDepartmentDetails.name}
                </h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-indigo-700">
                      {selectedDepartmentDetails.completed}
                    </div>
                    <div className="text-xs text-indigo-600">Erledigt</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-orange-700">
                      {selectedDepartmentDetails.total -
                        selectedDepartmentDetails.completed}
                    </div>
                    <div className="text-xs text-orange-600">Ausstehend</div>
                  </div>
                  <div>
                    <div
                      className={`text-base sm:text-lg font-bold ${
                        selectedDepartmentDetails.rate >= 80
                          ? "text-green-700"
                          : selectedDepartmentDetails.rate >= 60
                          ? "text-yellow-700"
                          : "text-red-700"
                      }`}
                    >
                      {selectedDepartmentDetails.rate}%
                    </div>
                    <div className="text-xs text-gray-600">Abschlussrate</div>
                  </div>
                </div>
              </div>

              {/* ✅ RESPONSIVE TASK LIST */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Alle Aufgaben im Detail
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedDepartmentDetails.tasks.map((task) => {
                    const isCompleted = getTaskStatus(task.id) === "completed";

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isCompleted
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`font-bold text-xs sm:text-sm ${
                                  isCompleted
                                    ? "text-green-800"
                                    : "text-red-800"
                                }`}
                              >
                                {task.time} -{" "}
                                <span className="truncate">{task.title}</span>
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {task.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                isCompleted
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {isCompleted ? "✅" : "⏱️"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {task.priority === "high"
                                ? "🔴"
                                : task.priority === "medium"
                                ? "🟡"
                                : task.priority === "low"
                                ? "🟢"
                                : task.priority === "break"
                                ? "🔵"
                                : ""}
                            </div>
                          </div>
                        </div>

                        {/* ✅ RESPONSIVE TASK DESCRIPTION */}
                        <div className="text-xs text-gray-700 bg-white p-2 rounded-lg border border-gray-200">
                          <strong>Beschreibung:</strong> {task.description}
                        </div>

                        {/* ✅ RESPONSIVE SPECIAL CONDITIONS */}
                        {task.condition && (
                          <div className="mt-2 text-xs text-blue-700 bg-blue-100 p-2 rounded-lg border border-blue-200">
                            <strong>Besondere Bedingung:</strong>{" "}
                            {task.condition}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ RESPONSIVE ACTION BUTTONS */}
              <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => {
                    setSelectedDepartment(selectedDepartmentDetails.code);
                    setShowDepartmentTaskDetails(false);
                    setShowLeaderDashboard(false);
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                >
                  📋 Zu dieser Abteilung wechseln
                </button>
                <button
                  onClick={() => setShowDepartmentTaskDetails(false)}
                  className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                >
                  Zurück zur Übersicht
                </button>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE ADVANCED ANALYTICS PANEL */}
          {showAdvancedAnalytics && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cyan-600" />
                  Erweiterte Analytics
                </h3>
                <button
                  onClick={() => setShowAdvancedAnalytics(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* ✅ RESPONSIVE KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        departmentMetrics.avgCompletionTime.trend === "up"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {departmentMetrics.avgCompletionTime.trend === "up"
                        ? "↗️ +8%"
                        : "↘️ -5%"}
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-blue-700">
                    {departmentMetrics.avgCompletionTime.current}min
                  </div>
                  <div className="text-xs text-blue-600">Ø Aufgabenzeit</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Vorher: {departmentMetrics.avgCompletionTime.previous}min
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                      ↗️ +3%
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-green-700">
                    {departmentMetrics.qualityScore.current}%
                  </div>
                  <div className="text-xs text-green-600">Qualitätsscore</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Vorher: {departmentMetrics.qualityScore.previous}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-3 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                      ↗️ +4%
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-purple-700">
                    {departmentMetrics.onTimeRate.current}%
                  </div>
                  <div className="text-xs text-purple-600">Pünktlichkeit</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Vorher: {departmentMetrics.onTimeRate.previous}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-yellow-100 p-3 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                      ↗️ -20%
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-orange-700">
                    {departmentMetrics.taskVariation.current}min
                  </div>
                  <div className="text-xs text-orange-600">Zeitabweichung</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Vorher: {departmentMetrics.taskVariation.previous}min
                  </div>
                </div>
              </div>

              {/* ✅ RESPONSIVE WEEKLY TREND CHART */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  5-Wochen Trend
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-end justify-between h-32">
                    {weeklyTrends.map((week, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1"
                      >
                        <div className="flex flex-col items-center space-y-1 mb-2">
                          {/* Completion Rate */}
                          <div
                            className="w-3 sm:w-4 bg-gray-200 rounded-t-lg relative"
                            style={{ height: "80px" }}
                          >
                            <div
                              className="bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg w-full absolute bottom-0 transition-all duration-1000"
                              style={{
                                height: `${(week.completion / 100) * 80}px`,
                              }}
                            ></div>
                          </div>
                          {/* Efficiency */}
                          <div
                            className="w-3 sm:w-4 bg-gray-200 rounded-t-lg relative"
                            style={{ height: "80px" }}
                          >
                            <div
                              className="bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg w-full absolute bottom-0 transition-all duration-1000"
                              style={{
                                height: `${(week.efficiency / 100) * 80}px`,
                              }}
                            ></div>
                          </div>
                          {/* Quality */}
                          <div
                            className="w-3 sm:w-4 bg-gray-200 rounded-t-lg relative"
                            style={{ height: "80px" }}
                          >
                            <div
                              className="bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg w-full absolute bottom-0 transition-all duration-1000"
                              style={{
                                height: `${(week.quality / 100) * 80}px`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {week.week}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-2 sm:space-x-4 mt-3 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded mr-1"></div>
                      <span className="hidden sm:inline">Abschluss</span>
                      <span className="sm:hidden">A</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded mr-1"></div>
                      <span className="hidden sm:inline">Effizienz</span>
                      <span className="sm:hidden">E</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded mr-1"></div>
                      <span className="hidden sm:inline">Qualität</span>
                      <span className="sm:hidden">Q</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ RESPONSIVE HOURLY ACTIVITY */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                  <Clock className="w-4 h-4 mr-2" />
                  Stündliche Aktivität
                </h4>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                  <div className="flex items-end justify-between h-20">
                    {hourlyActivity.map((hour, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-4 sm:w-6 bg-gray-200 rounded-t-lg relative"
                          style={{ height: "50px" }}
                        >
                          <div
                            className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg w-full absolute bottom-0 transition-all duration-1000"
                            style={{ height: `${(hour.tasks / 4) * 50}px` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 mt-1 font-medium transform rotate-45 origin-center">
                          {hour.hour.substring(0, 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-center text-gray-600">
                    Peak Zeit:{" "}
                    <strong className="hidden sm:inline">08:00-09:00</strong>
                    <strong className="sm:hidden">08-09</strong> | Ruhigste
                    Zeit:{" "}
                    <strong className="hidden sm:inline">12:00-13:00</strong>
                    <strong className="sm:hidden">12-13</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE DEPARTMENT COMPARISON PANEL */}
          {showDepartmentComparison && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                  Power Ranking
                </h3>
                <button
                  onClick={() => setShowDepartmentComparison(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* ✅ RESPONSIVE TOP PERFORMERS */}
              <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-3 flex items-center text-sm sm:text-base">
                  <Award className="w-4 h-4 mr-2" />
                  Top Performer dieser Woche
                </h4>
                <div className="space-y-2">
                  {updatedDepartmentPerformance
                    .sort((a, b) => b.rate - a.rate)
                    .slice(0, 3)
                    .map((dept, index) => (
                      <div
                        key={dept.dept}
                        className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-yellow-300"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : "bg-gradient-to-r from-orange-400 to-red-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-gray-800">
                              {dept.dept}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {departments[dept.dept]}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-bold text-yellow-700">
                            {dept.rate}%
                          </div>
                          <div className="text-xs text-gray-600">
                            {dept.tasks} Aufgaben
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* ✅ RESPONSIVE DETAILED METRICS TABLE */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">
                  Detaillierte Metriken
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="space-y-3">
                    {updatedDepartmentPerformance.map((dept) => (
                      <div
                        key={dept.dept}
                        className={`p-3 rounded-lg border transition-all ${
                          dept.dept === selectedDepartment
                            ? "bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-300"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-gray-800">
                              {dept.dept}{" "}
                              {dept.dept === selectedDepartment &&
                                "(Ihre Abteilung)"}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {departments[dept.dept]}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-base sm:text-lg font-bold ${
                                dept.rate >= 90
                                  ? "text-green-700"
                                  : dept.rate >= 75
                                  ? "text-yellow-700"
                                  : "text-red-700"
                              }`}
                            >
                              {dept.rate}%
                            </div>
                            <div className="text-xs text-gray-600">
                              {dept.tasks} Aufgaben
                            </div>
                          </div>
                        </div>

                        {/* ✅ RESPONSIVE MULTI-METRIC INDICATORS */}
                        <div className="grid grid-cols-3 gap-1 sm:gap-2">
                          <div className="text-center">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${dept.rate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              Abschluss
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                              <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(dept.rate + 5, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              Qualität
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                              <div
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(dept.rate + 3, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              Pünktlichkeit
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ✅ RESPONSIVE BENCHMARK COMPARISON */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-3 text-sm sm:text-base">
                  Hospital Benchmark
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">
                      Hospital Durchschnitt
                    </span>
                    <span className="text-sm font-bold text-purple-800">
                      82%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">
                      Ihre Abteilung
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        dailyStats.completionRate >= 82
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {dailyStats.completionRate}%
                      {dailyStats.completionRate >= 82 ? " ✅" : " ⚠️"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">
                      Branchenstandard
                    </span>
                    <span className="text-sm font-bold text-purple-800">
                      78%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE REWARDS PANEL */}
          {showRewards && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-600" />
                  Belohnungs-System
                </h3>
                <button
                  onClick={() => setShowRewards(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* ✅ RESPONSIVE POINTS INDICATOR */}
              <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-yellow-800 flex items-center text-sm sm:text-base">
                    <Star className="w-4 h-4 mr-1" />
                    Ihre Punkte:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-yellow-700">
                    {userPoints}
                  </span>
                </div>
                <div className="text-xs text-yellow-600 mb-2">
                  ✓ Aufgabe = +15 Punkte | Dokumentation: 1-7 Klicks = +5, 8-10
                  Klicks = +10, 11+ Klicks = +20
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((userPoints / 2250) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* ✅ RESPONSIVE REWARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {rewards.map((reward) => {
                  const canAfford = userPoints >= reward.points;

                  return (
                    <div
                      key={reward.id}
                      className={`p-3 rounded-xl border transition-all ${
                        canAfford
                          ? "bg-green-50 border-green-300 hover:shadow-md cursor-pointer"
                          : "bg-gray-50 border-gray-300 opacity-60"
                      }`}
                      onClick={() => canAfford && purchaseReward(reward.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="text-xl sm:text-2xl">
                            {reward.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`font-bold text-sm ${
                                canAfford ? "text-green-800" : "text-gray-600"
                              }`}
                            >
                              {reward.name}
                            </h4>
                            <p
                              className={`text-xs ${
                                canAfford ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {reward.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-sm font-bold ${
                              canAfford ? "text-green-700" : "text-gray-500"
                            }`}
                          >
                            {reward.points} Punkte
                          </div>
                          {canAfford ? (
                            <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                              KAUFEN! 🛒
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              Noch {reward.points - userPoints}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ✅ RESPONSIVE PURCHASED REWARDS HISTORY */}
              {purchasedRewards.length > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2 flex items-center text-sm sm:text-base">
                    <Gift className="w-4 h-4 mr-1" />
                    Gekaufte Belohnungen:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {purchasedRewards
                      .slice(-5)
                      .reverse()
                      .map((item, index) => (
                        <div
                          key={index}
                          className="text-xs bg-white p-2 rounded border"
                        >
                          <span className="font-bold text-purple-700">
                            {item.name}
                          </span>
                          <span className="text-purple-600 ml-2">
                            am {item.date} um {item.time}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ✅ RESPONSIVE STATISTICS */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">
                  Ihre Statistiken:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-blue-700">
                    <strong>Gekaufte Belohnungen:</strong>{" "}
                    {purchasedRewards.length}
                  </div>
                  <div className="text-blue-700">
                    <strong>Verfügbare Belohnungen:</strong>{" "}
                    {rewards.filter((r) => userPoints >= r.points).length}/
                    {rewards.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE DOCUMENTATION PANELS */}
          {showApotheke && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <Pill className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Medikamenten-Dokumentation (DEMO)
                </h3>
                <button
                  onClick={() => setShowApotheke(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="text-xs text-gray-600 mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <strong>DEMO VERSION:</strong> Beispiel wie
                Apotheke-Dokumentation aussehen würde. Station anklicken für
                Medikamenten-Lieferung Markierung.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(apothekeDocumentation).map(
                  ([bauteil, stations]) => (
                    <div
                      key={bauteil}
                      className="bg-blue-50 rounded-xl p-3 border border-blue-200"
                    >
                      <h4 className="font-bold text-blue-800 mb-3 text-sm border-b border-blue-300 pb-1 flex items-center">
                        <Pill className="w-4 h-4 mr-1" />
                        {bauteil}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {stations.map((station, index) => {
                          const checkSymbol = getApothekeCheckSymbol(
                            bauteil,
                            station
                          );
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                toggleApothekeCheck(bauteil, station)
                              }
                              className={`text-left p-2 rounded-lg text-xs transition-all ${
                                checkSymbol
                                  ? "bg-blue-100 border-2 border-blue-400 text-blue-800"
                                  : "bg-white border border-blue-300 text-gray-700 hover:bg-blue-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {station}
                                </span>
                                {checkSymbol && (
                                  <span className="text-blue-600 font-bold text-sm flex-shrink-0">
                                    {checkSymbol}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-blue-800">
                    Gesamte Medikamenten-Lieferungen:
                  </span>
                  <span className="text-blue-700 font-bold">
                    {Object.values(apothekeChecks).reduce(
                      (total, count) => total + count,
                      0
                    )}{" "}
                    Lieferungen
                  </span>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  Belieferte Stationen: {Object.keys(apothekeChecks).length} /{" "}
                  {Object.values(apothekeDocumentation).flat().length}
                </div>
              </div>
            </div>
          )}

          {showDocumentation && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-96 overflow-y-auto max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                  Tagesdokumentation-Wäsche
                </h3>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="text-xs text-gray-600 mb-4 p-2 bg-blue-50 rounded-lg">
                <strong>Anleitung:</strong> Station anklicken für ✓ Markierung.
                Mehrfach klicken für ✓✓ oder ✓✓✓
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(waescheDocumentation).map(
                  ([bauteil, stations]) => (
                    <div key={bauteil} className="bg-gray-50 rounded-xl p-3">
                      <h4 className="font-bold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-1">
                        {bauteil}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                        {stations.map((station, index) => {
                          const checkSymbol = getCheckSymbol(bauteil, station);
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                toggleDocumentationCheck(bauteil, station)
                              }
                              className={`text-left p-2 rounded-lg text-xs transition-all ${
                                checkSymbol
                                  ? "bg-green-100 border-2 border-green-300 text-green-800"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {station}
                                </span>
                                {checkSymbol && (
                                  <span className="text-green-600 font-bold text-sm flex-shrink-0">
                                    {checkSymbol}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-green-800">
                    Gesamtwagenzahl:
                  </span>
                  <span className="text-green-700 font-bold">
                    {Object.values(documentationChecks).reduce(
                      (total, count) => total + count,
                      0
                    )}{" "}
                    Wägen
                  </span>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  Kontrollierte Stationen:{" "}
                  {Object.keys(documentationChecks).length} /{" "}
                  {Object.values(waescheDocumentation).flat().length}
                </div>
              </div>
            </div>
          )}

          {/* ✅ RESPONSIVE NOTIFICATIONS PANEL */}
          {showNotifications && (
            <div className="mt-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-h-80 overflow-y-auto max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Benachrichtigungen
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Keine Benachrichtigungen
                </p>
              ) : (
                <div className="space-y-2">
                  {notifications
                    .slice(-5)
                    .reverse()
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-xl border transition-all ${
                          notification.isRead
                            ? "bg-gray-50 border-gray-200"
                            : "bg-blue-50 border-blue-200 shadow-sm"
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500 text-white">
                                ERINNERUNG
                              </span>
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 rounded-lg hover:bg-gray-200 ml-2 flex-shrink-0"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ RESPONSIVE MOBILE MENU */}
          {showMenu && (
            <div className="mt-4 p-3 sm:p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-w-2xl mx-auto">
              <div className="space-y-4">
                {/* ✅ MODERN DROPDOWN DEPARTMENT SELECTOR */}
                <div className="relative">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                    DECT wählen
                  </h4>

                  {/* Dropdown Trigger Button */}
                  <button
                    onClick={() =>
                      setShowDepartmentDropdown(!showDepartmentDropdown)
                    }
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {selectedDepartment.slice(-2)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-800">
                          {selectedDepartment}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {departments[selectedDepartment]}
                        </div>
                        <div className="text-xs text-orange-600 font-medium">
                          {(taskTemplates[selectedDepartment] || []).length}{" "}
                          Aufgaben ·{" "}
                          {
                            Array.from(completedTasks).filter((id) =>
                              (taskTemplates[selectedDepartment] || []).some(
                                (task) => task.id === id
                              )
                            ).length
                          }{" "}
                          erledigt
                        </div>
                      </div>
                    </div>
                    <div
                      className={`transform transition-transform ${
                        showDepartmentDropdown ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showDepartmentDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        {/* Search Box */}
                        <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                          <input
                            type="text"
                            placeholder="🔍 DECT suchen..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                            onChange={(e) => {
                              // Filter departments based on search
                              const searchTerm = e.target.value.toLowerCase();
                              // Implementation would filter the departments list
                            }}
                          />
                        </div>

                        {/* DECT List */}
                        <div className="py-2">
                          {Object.entries(departments).map(([code, name]) => (
                            <button
                              key={code}
                              onClick={() => {
                                setSelectedDepartment(code);
                                setShowDepartmentDropdown(false);
                                setShowMenu(false);
                                addNotification(
                                  `📋 Gewechselt zu DECT ${code}`,
                                  "info"
                                );
                              }}
                              className={`w-full p-3 rounded-lg text-left transition-all mb-1 ${
                                selectedDepartment === code
                                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-400 shadow-md"
                                  : "bg-gradient-to-r from-gray-50 to-blue-50 hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 border-2 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg ${
                                    selectedDepartment === code
                                      ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                                  }`}
                                >
                                  {code.slice(-2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`font-bold text-sm flex items-center ${
                                      selectedDepartment === code
                                        ? "text-indigo-800"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {code}
                                    {selectedDepartment === code && (
                                      <span className="ml-2 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                        AKTIV
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`text-xs truncate ${
                                      selectedDepartment === code
                                        ? "text-indigo-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {name}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span
                                      className={`text-xs font-medium ${
                                        selectedDepartment === code
                                          ? "text-orange-700"
                                          : "text-orange-600"
                                      }`}
                                    >
                                      {(taskTemplates[code] || []).length} Tasks
                                    </span>
                                    {selectedDepartment === code && (
                                      <span className="text-xs text-green-700 font-medium">
                                        ·{" "}
                                        {
                                          Array.from(completedTasks).filter(
                                            (id) =>
                                              (taskTemplates[code] || []).some(
                                                (task) => task.id === id
                                              )
                                          ).length
                                        }{" "}
                                        erledigt
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {selectedDepartment === code && (
                                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ DATE SELECTOR */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                    <Calendar className="w-4 h-4 mr-2 text-green-600" />
                    Datum wählen
                  </h4>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 bg-white rounded-xl text-sm font-medium shadow-inner focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>

                {/* ✅ PRIORITY FILTER */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                    <Filter className="w-4 h-4 mr-2 text-orange-600" />
                    Priorität Filter
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["all", "high", "medium", "low"].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setFilterPriority(priority)}
                        className={`py-3 px-4 rounded-xl text-xs font-medium transition-all ${
                          filterPriority === priority
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300"
                        }`}
                      >
                        {priority === "all"
                          ? "🔍 Alle"
                          : priority === "high"
                          ? "🔴 Hoch"
                          : priority === "medium"
                          ? "🟡 Mittel"
                          : "🟢 Niedrig"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ✅ MOBILE ONLY QUICK ACTIONS */}
                <div className="lg:hidden grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDocumentation(!showDocumentation);
                      setShowMenu(false);
                    }}
                    className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg text-sm font-medium"
                  >
                    <FileText className="w-4 h-4 mx-auto mb-1" />
                    Wäsche
                  </button>
                  <button
                    onClick={() => {
                      setShowApotheke(!showApotheke);
                      setShowMenu(false);
                    }}
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg text-sm font-medium"
                  >
                    <Pill className="w-4 h-4 mx-auto mb-1" />
                    Apotheke
                  </button>
                  <button
                    onClick={() => {
                      setShowRewards(!showRewards);
                      setShowMenu(false);
                    }}
                    className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg text-sm font-medium"
                  >
                    <Gift className="w-4 h-4 mx-auto mb-1" />
                    Belohnungen
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setShowMenu(false);
                    }}
                    className="p-3 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg text-sm font-medium"
                  >
                    <Settings className="w-4 h-4 mx-auto mb-1" />
                    Einstellungen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ RESPONSIVE MAIN CONTENT AREA */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* ✅ RESPONSIVE PROGRESS CARD */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              DECT {selectedDepartment}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {new Date(selectedDate).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>

          {/* ✅ RESPONSIVE CIRCULAR PROGRESS */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-4 sm:mb-6">
            <svg
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 transform -rotate-90"
              viewBox="0 0 160 160"
            >
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="50%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="url(#progressGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-lg"
                strokeDasharray={`${progress * 3.77} 377`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">
                  Erledigt
                </div>
              </div>
            </div>
          </div>

          {/* ✅ RESPONSIVE STATS GRID */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 shadow-inner">
              <div className="text-xl sm:text-2xl font-bold text-blue-700">
                {currentTasks.length}
              </div>
              <div className="text-xs text-blue-600 font-medium">Gesamt</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 shadow-inner">
              <div className="text-xl sm:text-2xl font-bold text-green-700">
                {completedCount}
              </div>
              <div className="text-xs text-green-600 font-medium">Erledigt</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl border border-orange-200 shadow-inner">
              <div className="text-xl sm:text-2xl font-bold text-orange-700">
                {currentTasks.length - completedCount}
              </div>
              <div className="text-xs text-orange-600 font-medium">Offen</div>
            </div>
          </div>
        </div>

        {/* ✅ RESPONSIVE TASKS LIST */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className={`relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 overflow-hidden transition-all duration-500 ${
                completedTasks.has(task.id)
                  ? "opacity-60 scale-95 grayscale"
                  : "hover:shadow-2xl hover:scale-102 hover:-translate-y-1"
              } ${
                isTaskActive(task.time)
                  ? "ring-2 ring-yellow-400 shadow-yellow-200"
                  : ""
              }`}
            >
              {/* Active task indicator */}
              {isTaskActive(task.time) && !completedTasks.has(task.id) && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse"></div>
              )}

              {/* Priority stripe */}
              <div
                className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${getPriorityColor(
                  task.priority
                )}`}
              ></div>

              <div className="p-4 sm:p-5">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
                  >
                    {completedTasks.has(task.id) ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl border-4 border-green-200">
                        <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-400 bg-white rounded-full flex items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all duration-300 shadow-md">
                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                      </div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.time}
                        </span>
                        {isTaskActive(task.time) &&
                          !completedTasks.has(task.id) && (
                            <span className="animate-pulse text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                              JETZT
                            </span>
                          )}
                      </div>
                      <div
                        className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPriorityColor(
                          task.priority
                        )} shadow-lg`}
                      >
                        {getPriorityIcon(task.priority)}
                        <span className="ml-1">
                          {task.priority === "high"
                            ? "HOCH"
                            : task.priority === "medium"
                            ? "MITTEL"
                            : task.priority === "low"
                            ? "NIEDRIG"
                            : task.priority === "break"
                            ? "PAUSE"
                            : task.priority}
                        </span>
                      </div>
                    </div>

                    <h3
                      className={`font-bold text-base sm:text-lg text-gray-900 mb-2 ${
                        completedTasks.has(task.id)
                          ? "line-through text-gray-500"
                          : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p
                      className={`text-xs sm:text-sm text-gray-700 mb-4 leading-relaxed ${
                        completedTasks.has(task.id) ? "text-gray-400" : ""
                      }`}
                    >
                      {task.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-indigo-500 flex-shrink-0" />
                        <span className="font-medium truncate">
                          {task.location}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium flex-shrink-0">
                        {task.estimatedDuration}
                      </div>
                    </div>

                    {task.condition && (
                      <div className="mt-3 flex items-start text-xs text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-xl border border-blue-200">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{task.condition}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ RESPONSIVE BOTTOM SPACING */}
        <div className="h-20 sm:h-24"></div>
      </div>

      {/* ✅ RESPONSIVE SUCCESS CELEBRATION */}
      {completedCount === currentTasks.length && currentTasks.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-4 sm:right-4 max-w-lg mx-auto z-50">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl text-center border border-white/20 backdrop-blur-xl">
            <div className="text-xl sm:text-2xl font-bold mb-2">
              🎉 Alle Aufgaben erledigt! 🎉
            </div>
            <div className="text-sm opacity-90">Fantastische Arbeit heute!</div>
            <div className="mt-3 text-xs opacity-75">
              Zeit für eine wohlverdiente Pause!
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESPONSIVE FLOATING QUICK ACTIONS - Desktop Only */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40 flex-col space-y-3">
        <button
          onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
          className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
          title="Erweiterte Analytics"
        >
          <TrendingUp className="w-6 h-6" />
        </button>

        <button
          onClick={() => setShowDepartmentComparison(!showDepartmentComparison)}
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
          title="Power Ranking"
        >
          <BarChart3 className="w-6 h-6" />
        </button>

        <button
          onClick={() => setShowStatistics(!showStatistics)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
          title="Genel İstatistikler"
        >
          <Award className="w-6 h-6" />
        </button>
      </div>

      {/* ✅ RESPONSIVE STATISTICS PANEL */}
      {showStatistics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center text-sm sm:text-base">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                Leistungsstatistiken
              </h3>
              <button
                onClick={() => setShowStatistics(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-3 sm:p-4">
              {/* ✅ RESPONSIVE DAILY STATS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600">
                      HEUTE
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-700">
                    {dailyStats.completionRate}%
                  </div>
                  <div className="text-xs text-blue-600">Abschlussrate</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-600">
                      ERLEDIGT
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-700">
                    {dailyStats.completedTasks}/{dailyStats.totalTasks}
                  </div>
                  <div className="text-xs text-green-600">Aufgaben</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-3 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600">
                      ZEIT
                    </span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {dailyStats.averageTimePerTask}min
                  </div>
                  <div className="text-xs text-purple-600">Ø pro Aufgabe</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-yellow-100 p-3 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-600">
                      STREAK
                    </span>
                  </div>
                  <div className="text-lg font-bold text-orange-700">
                    {dailyStats.streakDays}
                  </div>
                  <div className="text-xs text-orange-600">Tage in Folge</div>
                </div>
              </div>

              {/* ✅ RESPONSIVE WEEKLY PERFORMANCE */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Wöchentliche Leistung
                </h4>
                <div className="flex items-end justify-between h-24 bg-gray-50 rounded-xl p-3">
                  {weeklyData.map((day, index) => {
                    const height =
                      day.total > 0 ? (day.completed / day.total) * 100 : 0;
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-4 sm:w-6 bg-gray-200 rounded-t-lg relative"
                          style={{ height: "60px" }}
                        >
                          <div
                            className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg w-full absolute bottom-0 transition-all duration-500"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 mt-1 font-medium">
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ RESPONSIVE DEPARTMENT COMPARISON */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                  <Award className="w-4 h-4 mr-2" />
                  Power Ranking
                </h4>
                <div className="space-y-2">
                  {updatedDepartmentPerformance.map((dept, index) => (
                    <div
                      key={dept.dept}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                        dept.dept === selectedDepartment
                          ? "bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-300"
                          : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium truncate flex-1 ${
                          dept.dept === selectedDepartment
                            ? "text-blue-800"
                            : "text-gray-700"
                        }`}
                      >
                        {dept.dept}{" "}
                        {dept.dept === selectedDepartment && "(Sie)"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              dept.dept === selectedDepartment
                                ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                                : "bg-gradient-to-r from-green-400 to-emerald-500"
                            }`}
                            style={{ width: `${dept.rate}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            dept.dept === selectedDepartment
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          {dept.rate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ RESPONSIVE ACHIEVEMENTS */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2 flex items-center text-sm sm:text-base">
                  <Award className="w-4 h-4 mr-2" />
                  Erreichte Abzeichen
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dailyStats.completionRate >= 80 && (
                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      🏆 Effizienz
                    </div>
                  )}
                  {dailyStats.streakDays >= 3 && (
                    <div className="bg-blue-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                      🔥 Konsistenz
                    </div>
                  )}
                  {dailyStats.completedTasks >= 8 && (
                    <div className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                      ⚡ Produktivität
                    </div>
                  )}
                  {dailyStats.completionRate === 100 && (
                    <div className="bg-purple-400 text-purple-900 px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ Perfektion
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESPONSIVE MOBILE BOTTOM NAVIGATION - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-white/30 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
            className={`p-3 rounded-xl text-center transition-all ${
              showAdvancedAnalytics
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Analytics</span>
          </button>

          <button
            onClick={() =>
              setShowDepartmentComparison(!showDepartmentComparison)
            }
            className={`p-3 rounded-xl text-center transition-all ${
              showDepartmentComparison
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Power Ranking</span>
          </button>

          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className={`p-3 rounded-xl text-center transition-all ${
              showStatistics
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Award className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Statistik</span>
          </button>

          <button
            onClick={() => setShowRewards(!showRewards)}
            className={`p-3 rounded-xl text-center transition-all ${
              showRewards
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Gift className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Belohnung</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KrankenhausLogistikApp;
