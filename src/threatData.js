/**
 * Shaw AFB cUAS SV-1 Threat Database & Scoring Engine
 * 
 * 93 drone platforms from dronecompare.org scored against
 * 4-phenomenology detection + 3-mechanism EA defeat architecture.
 * 
 * Detection scores = P(detect) per phenomenology (higher = easier to detect)
 * Defeat scores = P(defeat) per EA mechanism (higher = easier to defeat)  
 * Risk = inverse composite (higher = harder to mitigate)
 */

const DRONES = [
  {n:"DJI Mavic 4 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1063,s:25,ft:51,pr:2899,proto:"OcuSync 4+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mini 5 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:38,pr:759,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Air 3S",m:"DJI",c:"Photo & Video",p:"Multirotor",w:724,s:21,ft:46,pr:1099,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Flip",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:31,pr:439,proto:"OcuSync 4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Neo 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:151,s:12,ft:19,pr:229,proto:"OcuSync O4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Neo",m:"DJI",c:"Photo & Video",p:"Multirotor",w:135,s:8,ft:18,pr:199,proto:"OcuSync O4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mini 4K",m:"DJI",c:"Photo & Video",p:"Multirotor",w:245,s:16,ft:31,pr:349,proto:"OcuSync O4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Avata 2",m:"DJI",c:"FPV",p:"Multirotor",w:377,s:27,ft:23,pr:849,proto:"OcuSync O4+",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mini 4 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:34,pr:759,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Air 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:720,s:21,ft:46,pr:1099,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mavic 3 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:958,s:21,ft:43,pr:2199,proto:"OcuSync 3+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Inspire 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:3995,s:26,ft:28,pr:16499,proto:"OcuSync 3+",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mini 2 SE",m:"DJI",c:"Photo & Video",p:"Multirotor",w:246,s:16,ft:31,pr:369,proto:"OcuSync 2",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mini 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:248,s:16,ft:38,pr:419,proto:"OcuSync 3",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mavic 3 Classic",m:"DJI",c:"Photo & Video",p:"Multirotor",w:895,s:21,ft:46,pr:1399,proto:"OcuSync 3+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Avata",m:"DJI",c:"FPV",p:"Multirotor",w:410,s:27,ft:18,pr:629,proto:"OcuSync 3",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mini 3 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:34,pr:759,proto:"OcuSync 3",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mavic 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:895,s:21,ft:46,pr:2367,proto:"OcuSync 3+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mini SE",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:13,ft:30,pr:299,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Air 2S",m:"DJI",c:"Photo & Video",p:"Multirotor",w:595,s:19,ft:31,pr:999,proto:"OcuSync 3",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI FPV",m:"DJI",c:"FPV",p:"Multirotor",w:795,s:39,ft:20,pr:1299,proto:"OcuSync 3",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mini 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:31,pr:449,proto:"OcuSync 2",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mavic Air 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:570,s:19,ft:34,pr:849,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mavic Mini",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:13,ft:30,pr:399,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mavic 2 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:907,s:20,ft:31,pr:1499,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mavic 2 Zoom",m:"DJI",c:"Photo & Video",p:"Multirotor",w:905,s:20,ft:31,pr:1249,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Mavic Air",m:"DJI",c:"Photo & Video",p:"Multirotor",w:430,s:19,ft:21,pr:799,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mavic Pro Platinum",m:"DJI",c:"Photo & Video",p:"Multirotor",w:734,s:18,ft:30,pr:1099,proto:"OcuSync",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Spark",m:"DJI",c:"Photo & Video",p:"Multirotor",w:300,s:14,ft:16,pr:499,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH"},
  {n:"DJI Mavic Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:734,s:18,ft:27,pr:999,proto:"OcuSync",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 4 RTK",m:"DJI",c:"Mapping",p:"Multirotor",w:1391,s:16,ft:30,pr:5999,proto:"OcuSync 2",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 4 Pro V2.0",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1375,s:20,ft:30,pr:1499,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 4 Advanced",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1368,s:20,ft:30,pr:1349,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 4 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1388,s:20,ft:30,pr:1499,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 4",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1380,s:20,ft:28,pr:999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 3 Standard",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1216,s:16,ft:25,pr:499,proto:"WiFi",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 3 Professional",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1280,s:16,ft:23,pr:1259,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Phantom 3 Advanced",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1280,s:16,ft:23,pr:999,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Inspire 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:3440,s:26,ft:27,pr:2999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Inspire 1 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:3060,s:22,ft:15,pr:3800,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Inspire 1",m:"DJI",c:"Photo & Video",p:"Multirotor",w:2935,s:22,ft:18,pr:2899,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Matrice 400",m:"DJI",c:"Enterprise",p:"Multirotor",w:9740,s:25,ft:59,pr:10450,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 4 Enterprise",m:"DJI",c:"Enterprise",p:"Multirotor",w:1690,s:23,ft:42,pr:5189,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 4 Thermal",m:"DJI",c:"Enterprise",p:"Multirotor",w:1690,s:23,ft:38,pr:7849,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 350 RTK",m:"DJI",c:"Enterprise",p:"Multirotor",w:6470,s:23,ft:55,pr:13649,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Mavic 3 Enterprise",m:"DJI",c:"Enterprise",p:"Multirotor",w:920,s:21,ft:45,pr:4950,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Mavic 3 Thermal",m:"DJI",c:"Enterprise",p:"Multirotor",w:920,s:21,ft:45,pr:6700,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Mavic 3 Multispectral",m:"DJI",c:"Mapping",p:"Multirotor",w:951,s:21,ft:43,pr:5729,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 30",m:"DJI",c:"Enterprise",p:"Multirotor",w:3770,s:23,ft:41,pr:9440,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 30T",m:"DJI",c:"Enterprise",p:"Multirotor",w:3770,s:23,ft:41,pr:9999,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Mavic 2 Enterprise Advanced",m:"DJI",c:"Enterprise",p:"Multirotor",w:920,s:19,ft:31,pr:3607,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 300 RTK",m:"DJI",c:"Enterprise",p:"Multirotor",w:6300,s:23,ft:55,pr:15999,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 200 V2",m:"DJI",c:"Enterprise",p:"Multirotor",w:4690,s:23,ft:38,pr:5999,proto:"OcuSync 2",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Mavic 2 Enterprise",m:"DJI",c:"Enterprise",p:"Multirotor",w:905,s:20,ft:31,pr:5999,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:true,auto:true,fs:"RTH"},
  {n:"DJI Matrice 200",m:"DJI",c:"Enterprise",p:"Multirotor",w:3800,s:23,ft:38,pr:5999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Matrice 600 Pro",m:"DJI",c:"Enterprise",p:"Multirotor",w:9500,s:18,ft:32,pr:4999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Matrice 600",m:"DJI",c:"Enterprise",p:"Multirotor",w:9100,s:18,ft:35,pr:4599,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Matrice 100",m:"DJI",c:"Enterprise",p:"Multirotor",w:2355,s:22,ft:28,pr:3599,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Agras T25",m:"DJI",c:"Agriculture",p:"Multirotor",w:17200,s:15,ft:20,pr:null,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Agras T50",m:"DJI",c:"Agriculture",p:"Multirotor",w:35000,s:15,ft:20,pr:17999,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Agras T40",m:"DJI",c:"Agriculture",p:"Multirotor",w:28600,s:15,ft:20,pr:19999,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Agras T10",m:"DJI",c:"Agriculture",p:"Multirotor",w:15300,s:12,ft:15,pr:null,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI Agras T30",m:"DJI",c:"Agriculture",p:"Multirotor",w:26400,s:15,ft:16,pr:null,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"DJI FlyCart 100",m:"DJI",c:"Cargo",p:"Multirotor",w:62000,s:20,ft:22,pr:12500,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"DJI FlyCart 30",m:"DJI",c:"Cargo",p:"Multirotor",w:42500,s:20,ft:18,pr:16590,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Autel EVO Max 4N V2",m:"Autel",c:"Enterprise",p:"Multirotor",w:1510,s:23,ft:42,pr:12599,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Autel EVO Max 4T V2",m:"Autel",c:"Enterprise",p:"Multirotor",w:1510,s:23,ft:42,pr:7299,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Autel EVO Max 4T-XE",m:"Autel",c:"Enterprise",p:"Multirotor",w:1510,s:23,ft:42,pr:9999,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Autel Alpha",m:"Autel",c:"Enterprise",p:"Multirotor",w:10200,s:23,ft:51,pr:19289,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Autel EVO Max 4T",m:"Autel",c:"Enterprise",p:"Multirotor",w:1470,s:23,ft:42,pr:12599,proto:"SkyLink 2",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Autel EVO II Pro V3",m:"Autel",c:"Photo & Video",p:"Multirotor",w:1150,s:20,ft:42,pr:2699,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Autel EVO II Pro RTK V3",m:"Autel",c:"Mapping",p:"Multirotor",w:1200,s:20,ft:42,pr:3899,proto:"SkyLink 2",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Autel EVO II Dual 640T V3",m:"Autel",c:"Enterprise",p:"Multirotor",w:1200,s:20,ft:39,pr:5999,proto:"SkyLink 2",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH"},
  {n:"Autel EVO Nano",m:"Autel",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:28,pr:649,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Autel EVO Nano+",m:"Autel",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:28,pr:799,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Autel EVO Lite",m:"Autel",c:"Photo & Video",p:"Multirotor",w:820,s:18,ft:40,pr:1149,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Autel EVO Lite+",m:"Autel",c:"Photo & Video",p:"Multirotor",w:820,s:18,ft:40,pr:1149,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Skydio X10D",m:"Skydio",c:"Enterprise",p:"Multirotor",w:2200,s:20,ft:35,pr:null,proto:"Skydio Link",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH"},
  {n:"Skydio X10",m:"Skydio",c:"Enterprise",p:"Multirotor",w:2200,s:20,ft:35,pr:16000,proto:"Skydio Link",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH"},
  {n:"Skydio X2D",m:"Skydio",c:"Enterprise",p:"Multirotor",w:1000,s:17,ft:35,pr:10999,proto:"Skydio Link",rtk:false,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH"},
  {n:"Skydio X2E",m:"Skydio",c:"Enterprise",p:"Multirotor",w:1000,s:17,ft:35,pr:10999,proto:"Skydio Link",rtk:false,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH"},
  {n:"Freefly Alta X Gen2",m:"Freefly",c:"Enterprise",p:"Multirotor",w:11800,s:22,ft:50,pr:39650,proto:"Microhard",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Freefly Astro Max",m:"Freefly",c:"Mapping",p:"Multirotor",w:4200,s:20,ft:42,pr:22995,proto:"Microhard",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Freefly Astro",m:"Freefly",c:"Mapping",p:"Multirotor",w:3400,s:20,ft:32,pr:20000,proto:"Microhard",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Freefly Alta X",m:"Freefly",c:"Enterprise",p:"Multirotor",w:6200,s:22,ft:50,pr:32495,proto:"Microhard",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Freefly Alta 8",m:"Freefly",c:"Enterprise",p:"Multirotor",w:6200,s:17,ft:18,pr:17495,proto:"Futaba S-FHSS",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Freefly Alta 6",m:"Freefly",c:"Enterprise",p:"Multirotor",w:3900,s:17,ft:16,pr:null,proto:"Futaba S-FHSS",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"Wingtra RAY",m:"Wingtra",c:"Mapping",p:"VTOL",w:5800,s:22,ft:90,pr:21193,proto:"Microhard",rtk:true,wp:true,cell:true,enc:false,auto:true,fs:"RTH"},
  {n:"Antigravity A1",m:"Antigravity",c:"Photo & Video",p:"Multirotor",w:249,s:20,ft:47,pr:1599,proto:"WiFi 6",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH"},
  {n:"RigiTech Eiger",m:"RigiTech",c:"Cargo",p:"VTOL",w:25000,s:30,ft:120,pr:null,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"StriekAir CarryAir",m:"StriekAir",c:"Cargo",p:"VTOL",w:18000,s:25,ft:60,pr:null,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Wingcopter 198",m:"Wingcopter",c:"Cargo",p:"VTOL",w:24000,s:40,ft:120,pr:80000,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
  {n:"Matternet M2",m:"Matternet",c:"Cargo",p:"Multirotor",w:9750,s:22,ft:20,pr:null,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH"},
];

// --- Scoring Engine ---
const INJECTABLE = new Set([
  "OcuSync","OcuSync 2","OcuSync 3","OcuSync 3+","OcuSync 4","OcuSync 4+",
  "OcuSync O4","OcuSync O4+","OcuSync 2 Enterprise","OcuSync 3 Enterprise",
  "OcuSync 4 Enterprise","Lightbridge","Lightbridge 2","Enhanced WiFi","WiFi","WiFi 6",
]);

const JAM_DIFF = {
  "WiFi":10,"Enhanced WiFi":15,"WiFi 6":25,"Lightbridge":20,"Lightbridge 2":25,
  "OcuSync":35,"OcuSync 2":40,"OcuSync 3":45,"OcuSync 3+":48,"OcuSync 4":52,"OcuSync 4+":55,
  "OcuSync O4":50,"OcuSync O4+":53,"OcuSync 2 Enterprise":50,"OcuSync 3 Enterprise":55,
  "OcuSync 4 Enterprise":60,"SkyLink 2":55,"SkyLink 3":60,"Skydio Link":60,
  "Microhard":65,"Futaba S-FHSS":30,"Custom ISM":55,
};

const cl = (v,lo=0,hi=100) => Math.max(lo,Math.min(hi,v));

function scoreRF(d) {
  let b=85;
  const p=d.proto;
  if(p.includes("WiFi")||p==="Enhanced WiFi")b=95;
  else if(p.includes("Lightbridge"))b=92;
  else if(p.includes("OcuSync"))b=88;
  else if(p.includes("SkyLink"))b=80;
  else if(p.includes("Skydio"))b=78;
  else if(p.includes("Microhard"))b=72;
  else if(p.includes("Custom"))b=65;
  else if(p.includes("Futaba"))b=90;
  if(d.cell)b-=5; if(d.enc)b-=3;
  return Math.round(cl(b));
}

function scoreAcoustic(d) {
  const w=d.w;
  let b=w<=200?25:w<=300?35:w<=500?45:w<=1000?55:w<=2000?65:w<=5000?75:w<=10000?85:92;
  if(d.p==="VTOL")b-=15;
  return Math.round(cl(b));
}

function scoreRadar(d) {
  let b=20+60*Math.min(1,Math.log10(Math.max(d.w,100))/Math.log10(100000));
  if(d.p==="VTOL")b+=8; if(d.w>5000)b=Math.min(b+10,98);
  return Math.round(cl(b));
}

function scoreEOIR(d) {
  const w=d.w;
  return Math.round(cl(w<=200?30:w<=300?40:w<=500?50:w<=1000?60:w<=2000?70:w<=5000?80:w<=10000?88:95));
}

function scoreProtoInject(d) {
  if(!INJECTABLE.has(d.proto))return 10;
  const p=d.proto;
  if(p.includes("WiFi")||p==="Enhanced WiFi")return 92;
  if(p.includes("Lightbridge"))return 85;
  if(p.includes("Enterprise"))return 60;
  if(p.includes("4")||p.includes("O4"))return 65;
  if(p.includes("3"))return 70;
  if(p.includes("2"))return 78;
  return 80;
}

function scoreJamming(d) {
  let b=100-(JAM_DIFF[d.proto]||50);
  if(d.cell)b-=15; if(d.enc)b-=5;
  return Math.round(cl(b));
}

function scoreGPS(d) {
  let b=80;
  if(d.rtk)b-=35; if(!d.auto)b+=10;
  return Math.round(cl(b));
}

function riskTier(r) {
  if(r<=20)return"LOW"; if(r<=40)return"MODERATE"; if(r<=60)return"ELEVATED";
  if(r<=80)return"HIGH"; return"CRITICAL";
}

export function analyzeDrones() {
  return DRONES.map(d => {
    const rd=scoreRF(d), ad=scoreAcoustic(d), rad=scoreRadar(d), ed=scoreEOIR(d);
    const pi=scoreProtoInject(d), jm=scoreJamming(d), gs=scoreGPS(d);
    const pMiss=(1-rd/100)*(1-ad/100)*(1-rad/100)*(1-ed/100);
    const cd=Math.round(cl((1-pMiss)*100));
    const pSurv=(1-pi/100)*(1-jm/100)*(1-gs/100);
    const cdf=Math.round(cl((1-pSurv)*100));
    const or_=Math.round(cl((1-(cd/100)*(cdf/100))*100));
    return {...d,rd,ad,rad,ed,cd,pi,jm,gs,cdf,or:or_,rt:riskTier(or_)};
  }).sort((a,b)=>b.or-a.or);
}
