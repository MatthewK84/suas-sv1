/**
 * Shaw AFB cUAS SV-1 — Threat Database & Scoring Engine v3
 *
 * v3 additions:
 *  - Time-of-day modifiers (Day/Dusk/Night/Flight Ops)
 *  - Scenario serialization for URL sharing
 *  - Briefing data generation for PDF export
 */

const DRONES=[
  {n:"DJI Mavic 4 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1063,s:25,ft:51,pr:2899,proto:"OcuSync 4+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Mini 5 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:38,pr:759,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:6},
  {n:"DJI Air 3S",m:"DJI",c:"Photo & Video",p:"Multirotor",w:724,s:21,ft:46,pr:1099,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:7},
  {n:"DJI Flip",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:31,pr:439,proto:"OcuSync 4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Neo 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:151,s:12,ft:19,pr:229,proto:"OcuSync O4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:3},
  {n:"DJI Neo",m:"DJI",c:"Photo & Video",p:"Multirotor",w:135,s:8,ft:18,pr:199,proto:"OcuSync O4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:3},
  {n:"DJI Mini 4K",m:"DJI",c:"Photo & Video",p:"Multirotor",w:245,s:16,ft:31,pr:349,proto:"OcuSync O4",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Avata 2",m:"DJI",c:"FPV",p:"Multirotor",w:377,s:27,ft:23,pr:849,proto:"OcuSync O4+",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:5},
  {n:"DJI Mini 4 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:34,pr:759,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:6},
  {n:"DJI Air 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:720,s:21,ft:46,pr:1099,proto:"OcuSync 4",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:7},
  {n:"DJI Mavic 3 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:958,s:21,ft:43,pr:2199,proto:"OcuSync 3+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Inspire 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:3995,s:26,ft:28,pr:16499,proto:"OcuSync 3+",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:15},
  {n:"DJI Mini 2 SE",m:"DJI",c:"Photo & Video",p:"Multirotor",w:246,s:16,ft:31,pr:369,proto:"OcuSync 2",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Mini 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:248,s:16,ft:38,pr:419,proto:"OcuSync 3",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Mavic 3 Classic",m:"DJI",c:"Photo & Video",p:"Multirotor",w:895,s:21,ft:46,pr:1399,proto:"OcuSync 3+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Avata",m:"DJI",c:"FPV",p:"Multirotor",w:410,s:27,ft:18,pr:629,proto:"OcuSync 3",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:5},
  {n:"DJI Mini 3 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:34,pr:759,proto:"OcuSync 3",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:6},
  {n:"DJI Mavic 3",m:"DJI",c:"Photo & Video",p:"Multirotor",w:895,s:21,ft:46,pr:2367,proto:"OcuSync 3+",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Mini SE",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:13,ft:30,pr:299,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Air 2S",m:"DJI",c:"Photo & Video",p:"Multirotor",w:595,s:19,ft:31,pr:999,proto:"OcuSync 3",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:7},
  {n:"DJI FPV",m:"DJI",c:"FPV",p:"Multirotor",w:795,s:39,ft:20,pr:1299,proto:"OcuSync 3",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:5},
  {n:"DJI Mini 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:31,pr:449,proto:"OcuSync 2",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Mavic Air 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:570,s:19,ft:34,pr:849,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:7},
  {n:"DJI Mavic Mini",m:"DJI",c:"Photo & Video",p:"Multirotor",w:249,s:13,ft:30,pr:399,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:6},
  {n:"DJI Mavic 2 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:907,s:20,ft:31,pr:1499,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:8},
  {n:"DJI Mavic 2 Zoom",m:"DJI",c:"Photo & Video",p:"Multirotor",w:905,s:20,ft:31,pr:1249,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:8},
  {n:"DJI Mavic Air",m:"DJI",c:"Photo & Video",p:"Multirotor",w:430,s:19,ft:21,pr:799,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:5},
  {n:"DJI Mavic Pro Platinum",m:"DJI",c:"Photo & Video",p:"Multirotor",w:734,s:18,ft:30,pr:1099,proto:"OcuSync",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:8},
  {n:"DJI Spark",m:"DJI",c:"Photo & Video",p:"Multirotor",w:300,s:14,ft:16,pr:499,proto:"Enhanced WiFi",rtk:false,wp:false,cell:false,enc:false,auto:false,fs:"RTH",props:4,pd:5},
  {n:"DJI Mavic Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:734,s:18,ft:27,pr:999,proto:"OcuSync",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:8},
  {n:"DJI Phantom 4 RTK",m:"DJI",c:"Mapping",p:"Multirotor",w:1391,s:16,ft:30,pr:5999,proto:"OcuSync 2",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 4 Pro V2.0",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1375,s:20,ft:30,pr:1499,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 4 Advanced",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1368,s:20,ft:30,pr:1349,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 4 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1388,s:20,ft:30,pr:1499,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 4",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1380,s:20,ft:28,pr:999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 3 Standard",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1216,s:16,ft:25,pr:499,proto:"WiFi",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 3 Professional",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1280,s:16,ft:23,pr:1259,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Phantom 3 Advanced",m:"DJI",c:"Photo & Video",p:"Multirotor",w:1280,s:16,ft:23,pr:999,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Inspire 2",m:"DJI",c:"Photo & Video",p:"Multirotor",w:3440,s:26,ft:27,pr:2999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:13},
  {n:"DJI Inspire 1 Pro",m:"DJI",c:"Photo & Video",p:"Multirotor",w:3060,s:22,ft:15,pr:3800,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:13},
  {n:"DJI Inspire 1",m:"DJI",c:"Photo & Video",p:"Multirotor",w:2935,s:22,ft:18,pr:2899,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:13},
  {n:"DJI Matrice 400",m:"DJI",c:"Enterprise",p:"Multirotor",w:9740,s:25,ft:59,pr:10450,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:21},
  {n:"DJI Matrice 4 Enterprise",m:"DJI",c:"Enterprise",p:"Multirotor",w:1690,s:23,ft:42,pr:5189,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Matrice 4 Thermal",m:"DJI",c:"Enterprise",p:"Multirotor",w:1690,s:23,ft:38,pr:7849,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:10},
  {n:"DJI Matrice 350 RTK",m:"DJI",c:"Enterprise",p:"Multirotor",w:6470,s:23,ft:55,pr:13649,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:4,pd:21},
  {n:"DJI Mavic 3 Enterprise",m:"DJI",c:"Enterprise",p:"Multirotor",w:920,s:21,ft:45,pr:4950,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Mavic 3 Thermal",m:"DJI",c:"Enterprise",p:"Multirotor",w:920,s:21,ft:45,pr:6700,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Mavic 3 Multispectral",m:"DJI",c:"Mapping",p:"Multirotor",w:951,s:21,ft:43,pr:5729,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"DJI Matrice 30",m:"DJI",c:"Enterprise",p:"Multirotor",w:3770,s:23,ft:41,pr:9440,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:15},
  {n:"DJI Matrice 30T",m:"DJI",c:"Enterprise",p:"Multirotor",w:3770,s:23,ft:41,pr:9999,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:15},
  {n:"DJI Mavic 2 Enterprise Adv",m:"DJI",c:"Enterprise",p:"Multirotor",w:920,s:19,ft:31,pr:3607,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:4,pd:8},
  {n:"DJI Matrice 300 RTK",m:"DJI",c:"Enterprise",p:"Multirotor",w:6300,s:23,ft:55,pr:15999,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:4,pd:21},
  {n:"DJI Matrice 200 V2",m:"DJI",c:"Enterprise",p:"Multirotor",w:4690,s:23,ft:38,pr:5999,proto:"OcuSync 2",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:4,pd:17},
  {n:"DJI Mavic 2 Enterprise",m:"DJI",c:"Enterprise",p:"Multirotor",w:905,s:20,ft:31,pr:5999,proto:"OcuSync 2",rtk:false,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:4,pd:8},
  {n:"DJI Matrice 200",m:"DJI",c:"Enterprise",p:"Multirotor",w:3800,s:23,ft:38,pr:5999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:17},
  {n:"DJI Matrice 600 Pro",m:"DJI",c:"Enterprise",p:"Multirotor",w:9500,s:18,ft:32,pr:4999,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:6,pd:21},
  {n:"DJI Matrice 600",m:"DJI",c:"Enterprise",p:"Multirotor",w:9100,s:18,ft:35,pr:4599,proto:"Lightbridge 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:6,pd:21},
  {n:"DJI Matrice 100",m:"DJI",c:"Enterprise",p:"Multirotor",w:2355,s:22,ft:28,pr:3599,proto:"Lightbridge",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:13},
  {n:"DJI Agras T25",m:"DJI",c:"Agriculture",p:"Multirotor",w:17200,s:15,ft:20,pr:null,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:28},
  {n:"DJI Agras T50",m:"DJI",c:"Agriculture",p:"Multirotor",w:35000,s:15,ft:20,pr:17999,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:36},
  {n:"DJI Agras T40",m:"DJI",c:"Agriculture",p:"Multirotor",w:28600,s:15,ft:20,pr:19999,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:36},
  {n:"DJI Agras T10",m:"DJI",c:"Agriculture",p:"Multirotor",w:15300,s:12,ft:15,pr:null,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:28},
  {n:"DJI Agras T30",m:"DJI",c:"Agriculture",p:"Multirotor",w:26400,s:15,ft:16,pr:null,proto:"OcuSync 2 Enterprise",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:6,pd:30},
  {n:"DJI FlyCart 100",m:"DJI",c:"Cargo",p:"Multirotor",w:62000,s:20,ft:22,pr:12500,proto:"OcuSync 4 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:8,pd:40},
  {n:"DJI FlyCart 30",m:"DJI",c:"Cargo",p:"Multirotor",w:42500,s:20,ft:18,pr:16590,proto:"OcuSync 3 Enterprise",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:8,pd:36},
  {n:"Autel EVO Max 4N V2",m:"Autel",c:"Enterprise",p:"Multirotor",w:1510,s:23,ft:42,pr:12599,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel EVO Max 4T V2",m:"Autel",c:"Enterprise",p:"Multirotor",w:1510,s:23,ft:42,pr:7299,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel EVO Max 4T-XE",m:"Autel",c:"Enterprise",p:"Multirotor",w:1510,s:23,ft:42,pr:9999,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel Alpha",m:"Autel",c:"Enterprise",p:"Multirotor",w:10200,s:23,ft:51,pr:19289,proto:"SkyLink 3",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:22},
  {n:"Autel EVO Max 4T",m:"Autel",c:"Enterprise",p:"Multirotor",w:1470,s:23,ft:42,pr:12599,proto:"SkyLink 2",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel EVO II Pro V3",m:"Autel",c:"Photo & Video",p:"Multirotor",w:1150,s:20,ft:42,pr:2699,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel EVO II Pro RTK V3",m:"Autel",c:"Mapping",p:"Multirotor",w:1200,s:20,ft:42,pr:3899,proto:"SkyLink 2",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel EVO II Dual 640T V3",m:"Autel",c:"Enterprise",p:"Multirotor",w:1200,s:20,ft:39,pr:5999,proto:"SkyLink 2",rtk:true,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:4,pd:9},
  {n:"Autel EVO Nano",m:"Autel",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:28,pr:649,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:6},
  {n:"Autel EVO Nano+",m:"Autel",c:"Photo & Video",p:"Multirotor",w:249,s:16,ft:28,pr:799,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:6},
  {n:"Autel EVO Lite",m:"Autel",c:"Photo & Video",p:"Multirotor",w:820,s:18,ft:40,pr:1149,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:7},
  {n:"Autel EVO Lite+",m:"Autel",c:"Photo & Video",p:"Multirotor",w:820,s:18,ft:40,pr:1149,proto:"SkyLink 2",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:7},
  {n:"Skydio X10D",m:"Skydio",c:"Enterprise",p:"Multirotor",w:2200,s:20,ft:35,pr:null,proto:"Skydio Link",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH",props:4,pd:10},
  {n:"Skydio X10",m:"Skydio",c:"Enterprise",p:"Multirotor",w:2200,s:20,ft:35,pr:16000,proto:"Skydio Link",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH",props:4,pd:10},
  {n:"Skydio X2D",m:"Skydio",c:"Enterprise",p:"Multirotor",w:1000,s:17,ft:35,pr:10999,proto:"Skydio Link",rtk:false,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH",props:4,pd:8},
  {n:"Skydio X2E",m:"Skydio",c:"Enterprise",p:"Multirotor",w:1000,s:17,ft:35,pr:10999,proto:"Skydio Link",rtk:false,wp:true,cell:true,enc:true,auto:true,fs:"Hover/RTH",props:4,pd:8},
  {n:"Freefly Alta X Gen2",m:"Freefly",c:"Enterprise",p:"Multirotor",w:11800,s:22,ft:50,pr:39650,proto:"Microhard",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:8,pd:18},
  {n:"Freefly Astro Max",m:"Freefly",c:"Mapping",p:"Multirotor",w:4200,s:20,ft:42,pr:22995,proto:"Microhard",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:15},
  {n:"Freefly Astro",m:"Freefly",c:"Mapping",p:"Multirotor",w:3400,s:20,ft:32,pr:20000,proto:"Microhard",rtk:true,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:15},
  {n:"Freefly Alta X",m:"Freefly",c:"Enterprise",p:"Multirotor",w:6200,s:22,ft:50,pr:32495,proto:"Microhard",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:8,pd:18},
  {n:"Freefly Alta 8",m:"Freefly",c:"Enterprise",p:"Multirotor",w:6200,s:17,ft:18,pr:17495,proto:"Futaba S-FHSS",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:8,pd:18},
  {n:"Freefly Alta 6",m:"Freefly",c:"Enterprise",p:"Multirotor",w:3900,s:17,ft:16,pr:null,proto:"Futaba S-FHSS",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:6,pd:15},
  {n:"Wingtra RAY",m:"Wingtra",c:"Mapping",p:"VTOL",w:5800,s:22,ft:90,pr:21193,proto:"Microhard",rtk:true,wp:true,cell:true,enc:false,auto:true,fs:"RTH",props:4,pd:13},
  {n:"Antigravity A1",m:"Antigravity",c:"Photo & Video",p:"Multirotor",w:249,s:20,ft:47,pr:1599,proto:"WiFi 6",rtk:false,wp:true,cell:false,enc:false,auto:true,fs:"RTH",props:4,pd:6},
  {n:"RigiTech Eiger",m:"RigiTech",c:"Cargo",p:"VTOL",w:25000,s:30,ft:120,pr:null,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:20},
  {n:"StriekAir CarryAir",m:"StriekAir",c:"Cargo",p:"VTOL",w:18000,s:25,ft:60,pr:null,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:18},
  {n:"Wingcopter 198",m:"Wingcopter",c:"Cargo",p:"VTOL",w:24000,s:40,ft:120,pr:80000,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:20},
  {n:"Matternet M2",m:"Matternet",c:"Cargo",p:"Multirotor",w:9750,s:22,ft:20,pr:null,proto:"Custom ISM",rtk:true,wp:true,cell:true,enc:true,auto:true,fs:"RTH",props:4,pd:20},
];

// ── Constants ─────────────────────────────────────────────────────────────────

const INJECTABLE=new Set(["OcuSync","OcuSync 2","OcuSync 3","OcuSync 3+","OcuSync 4","OcuSync 4+","OcuSync O4","OcuSync O4+","OcuSync 2 Enterprise","OcuSync 3 Enterprise","OcuSync 4 Enterprise","Lightbridge","Lightbridge 2","Enhanced WiFi","WiFi","WiFi 6"]);
const JAM_DIFF={"WiFi":10,"Enhanced WiFi":15,"WiFi 6":25,"Lightbridge":20,"Lightbridge 2":25,"OcuSync":35,"OcuSync 2":40,"OcuSync 3":45,"OcuSync 3+":48,"OcuSync 4":52,"OcuSync 4+":55,"OcuSync O4":50,"OcuSync O4+":53,"OcuSync 2 Enterprise":50,"OcuSync 3 Enterprise":55,"OcuSync 4 Enterprise":60,"SkyLink 2":55,"SkyLink 3":60,"Skydio Link":60,"Microhard":65,"Futaba S-FHSS":30,"Custom ISM":55};
const cl=(v)=>Math.max(0,Math.min(100,Math.round(v)));

// ── Hardened Mode Definitions ─────────────────────────────────────────────────

export const HARDENED_MODS={
  rfSilent:{label:"RF-Silent Mode",desc:"No RF emissions for DF/TDOA",icon:"📡"},
  customFW:{label:"Custom Firmware",desc:"Protocol injection fails",icon:"🔧"},
  gpsDenied:{label:"GPS-Denied Nav",desc:"GPS spoofing cannot redirect",icon:"🛰️"},
  noCell:{label:"Cellular Disabled",desc:"Jamming more effective",icon:"📶"},
  terrainMask:{label:"Terrain Masking",desc:"Reduces radar & EO/IR",icon:"🏔️"},
  swarm:{label:"Swarm Tactics",desc:"Overwhelms single-node EA",icon:"🐝"},
};

// ── Time-of-Day Definitions ───────────────────────────────────────────────────

export const TOD_MODES={
  day:      {label:"Day",       icon:"☀️", desc:"Full daylight — baseline conditions. EO/IR visible channel at full capability, thermal contrast reduced by solar heating."},
  dusk:     {label:"Dusk/Dawn", icon:"🌅", desc:"Transitional lighting — visible channel degraded, thermal contrast improving as surfaces cool differentially."},
  night:    {label:"Night",     icon:"🌙", desc:"Full darkness — visible channel ineffective without illumination, thermal channel at peak performance (max ΔT contrast)."},
  flightOps:{label:"Flight Ops",icon:"✈️",  desc:"Active flying operations on RW 04/22 — jet noise elevates acoustic baseline 15-25 dB, compressing MEMS array effective range."},
};

// TOD modifiers applied to base scores
function todAcousticMod(tod) {
  if (tod === "night") return 8;       // quieter ambient = better detection
  if (tod === "dusk") return 3;        // slightly quieter
  if (tod === "flightOps") return -22; // jet noise destroys acoustic baseline
  return 0;
}
function todEOIRMod(tod) {
  if (tod === "night") return 12;      // thermal ΔT at max, IR illuminator active
  if (tod === "dusk") return -5;       // transitional, neither channel optimal
  return 0;                            // day = baseline (visible good, thermal OK)
}
function todRadarMod() { return 0; }   // radar is weather/lighting independent
function todRFMod() { return 0; }      // RF detection is lighting independent

// ── Scoring Functions ─────────────────────────────────────────────────────────

function scoreRF(d,mo,tod){if(mo.rfSilent)return 5;let b=85;const p=d.proto;if(p.includes("WiFi")||p==="Enhanced WiFi")b=95;else if(p.includes("Lightbridge"))b=92;else if(p.includes("OcuSync"))b=88;else if(p.includes("SkyLink"))b=80;else if(p.includes("Skydio"))b=78;else if(p.includes("Microhard"))b=72;else if(p.includes("Custom"))b=65;else if(p.includes("Futaba"))b=90;if(d.cell&&!mo.noCell)b-=5;if(d.enc)b-=3;b+=todRFMod(tod);return cl(b);}

function scoreAcoustic(d,mo,tod){const w=d.w;const pf=Math.min(1,(d.pd||8)/20);const cb=((d.props||4)-4)*3;let b;if(w<=200)b=20;else if(w<=300)b=30;else if(w<=500)b=42;else if(w<=1000)b=52;else if(w<=2000)b=62;else if(w<=5000)b=72+pf*8;else if(w<=10000)b=82+pf*6;else b=88+pf*5;b+=cb;if(d.p==="VTOL")b-=18;if(mo.terrainMask)b-=12;b+=todAcousticMod(tod);return cl(b);}

function scoreRadar(d,mo,tod){let b=20+55*Math.min(1,Math.pow(d.w/50000,0.4));if(d.p==="VTOL")b+=10;if(d.w>5000)b=Math.min(b+8,98);if(mo.terrainMask)b-=18;b+=todRadarMod(tod);return cl(b);}

function scoreEOIR(d,mo,tod){const w=d.w;let b=w<=200?28:w<=300?38:w<=500?48:w<=1000?58:w<=2000?68:w<=5000?78:w<=10000?88:95;if(mo.terrainMask)b-=15;b+=todEOIRMod(tod);return cl(b);}

function scoreProtoInject(d,mo){if(mo.customFW)return 2;if(mo.rfSilent)return 0;if(!INJECTABLE.has(d.proto))return 10;const p=d.proto;if(p.includes("WiFi")||p==="Enhanced WiFi")return 92;if(p.includes("Lightbridge"))return 85;if(p.includes("Enterprise"))return 60;if(p.includes("4")||p.includes("O4"))return 65;if(p.includes("3"))return 70;if(p.includes("2"))return 78;return 80;}

function scoreJamming(d,mo){if(mo.rfSilent)return 15;let b=100-(JAM_DIFF[d.proto]||50);if(d.cell&&!mo.noCell)b-=15;if(d.enc)b-=5;if(mo.swarm)b-=25;return cl(b);}

function scoreGPS(d,mo){if(mo.gpsDenied)return 5;let b=80;if(d.rtk)b-=35;if(!d.auto)b+=10;return cl(b);}

function riskTier(r){if(r<=15)return"LOW";if(r<=35)return"MODERATE";if(r<=55)return"ELEVATED";if(r<=75)return"HIGH";return"CRITICAL";}

// ── Analysis ──────────────────────────────────────────────────────────────────

export function analyzeDrone(d,mods={},tod="day"){
  const rd=scoreRF(d,mods,tod),ad=scoreAcoustic(d,mods,tod),rad=scoreRadar(d,mods,tod),ed=scoreEOIR(d,mods,tod);
  const pi=scoreProtoInject(d,mods),jm=scoreJamming(d,mods),gs=scoreGPS(d,mods);
  const cd=cl((1-(1-rd/100)*(1-ad/100)*(1-rad/100)*(1-ed/100))*100);
  const cdf=cl((1-(1-pi/100)*(1-jm/100)*(1-gs/100))*100);
  const or_=cl((1-(cd/100)*(cdf/100))*100);
  return{...d,rd,ad,rad,ed,cd,pi,jm,gs,cdf,or:or_,rt:riskTier(or_)};
}

export function analyzeDrones(mods={},tod="day"){
  return DRONES.map(d=>analyzeDrone(d,mods,tod)).sort((a,b)=>b.or-a.or);
}

export function getNodeEffectiveness(scored){
  return{rfSensor:scored.rd,eaNode:Math.round((scored.pi+scored.jm+scored.gs)/3),radar:scored.rad,acoustic:scored.ad,eoir:scored.ed};
}

// ── Scenario Serialization ────────────────────────────────────────────────────

export function serializeScenario(mods,tod,droneName,scenarioName){
  const params=new URLSearchParams();
  const activeMods=Object.keys(mods).filter(k=>mods[k]);
  if(activeMods.length)params.set("mods",activeMods.join(","));
  if(tod&&tod!=="day")params.set("tod",tod);
  if(droneName)params.set("drone",droneName);
  if(scenarioName)params.set("name",scenarioName);
  return params.toString();
}

export function deserializeScenario(hash){
  const params=new URLSearchParams(hash.replace(/^#/,""));
  const mods={};
  const modsStr=params.get("mods");
  if(modsStr)modsStr.split(",").forEach(k=>{if(HARDENED_MODS[k])mods[k]=true;});
  const tod=params.get("tod")||"day";
  const drone=params.get("drone")||null;
  const name=params.get("name")||null;
  return{mods,tod,drone,name};
}

// ── PDF Briefing Generator ────────────────────────────────────────────────────

function riskColor(tier){return{CRITICAL:"#ff0000",HIGH:"#ff4444",ELEVATED:"#ff9900",MODERATE:"#cccc00",LOW:"#00cc66"}[tier]||"#888";}
function barSVG(v,color,w=200){return`<svg width="${w}" height="8" style="vertical-align:middle"><rect width="${w}" height="8" rx="3" fill="#1a1a2a"/><rect width="${Math.round(v/100*w)}" height="8" rx="3" fill="${color}"/></svg>`;}
function sColor(v){return v>=70?"#00cc66":v>=50?"#aaaa00":v>=30?"#ff9900":"#ff4444";}

export function generateBriefingHTML(data,mods,tod,scenarioName){
  const activeMods=Object.keys(mods).filter(k=>mods[k]);
  const tiers={CRITICAL:[],HIGH:[],ELEVATED:[],MODERATE:[],LOW:[]};
  data.forEach(d=>tiers[d.rt].push(d));
  const todLabel=TOD_MODES[tod]?.label||"Day";
  const now=new Date().toISOString().split("T")[0];

  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Shaw AFB cUAS Threat Briefing</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Oxanium:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:#fff;color:#111;font-family:'IBM Plex Mono',monospace;font-size:10px;line-height:1.5}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:letter portrait;margin:0.5in}}
.page{max-width:7.5in;margin:0 auto;padding:20px}
h1{font-family:Oxanium,sans-serif;font-size:16px;letter-spacing:2px;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:12px}
h2{font-family:Oxanium,sans-serif;font-size:13px;letter-spacing:1.5px;margin:16px 0 8px;padding:4px 8px;border-left:3px solid}
.meta{display:flex;justify-content:space-between;font-size:9px;color:#444;margin-bottom:16px;flex-wrap:wrap;gap:4px}
.tier-summary{display:flex;gap:16px;margin:10px 0 16px;flex-wrap:wrap}
.tier-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;font-family:Oxanium,sans-serif;font-weight:700;font-size:11px}
table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:9px}
th{background:#0a0e14;color:#e4ecf4;padding:5px 6px;text-align:left;font-size:8px;letter-spacing:1px;font-family:Oxanium,sans-serif}
td{padding:4px 6px;border-bottom:1px solid #e0e0e0}
tr:nth-child(even){background:#f8f8fa}
.score{font-weight:700;text-align:center}
.mod-tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:8px;margin-right:4px;background:#fff0f0;color:#cc3333;border:1px solid #ffcccc}
.footer{margin-top:20px;padding-top:8px;border-top:1px solid #ccc;font-size:8px;color:#888;display:flex;justify-content:space-between}
.gap-note{font-size:8px;color:#cc3300;margin:2px 0}
</style></head><body><div class="page">`;

  html+=`<h1>SHAW AFB C-UAS SV-1 — THREAT MITIGATION BRIEFING</h1>`;
  html+=`<div class="meta">`;
  html+=`<span>Shaw AFB, Sumter SC · 20th Fighter Wing · DoDAF SV-1 Threat Assessment</span>`;
  html+=`<span>Generated: ${now} · UNCLASSIFIED // FOUO</span></div>`;

  if(scenarioName)html+=`<div style="background:#0a0e14;color:#00ff88;padding:8px 12px;border-radius:4px;font-family:Oxanium,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;margin-bottom:12px">SCENARIO: ${scenarioName.toUpperCase()}</div>`;

  html+=`<div style="display:flex;gap:20px;margin-bottom:14px;flex-wrap:wrap"><div><strong>Time of Day:</strong> ${todLabel}</div>`;
  if(activeMods.length){html+=`<div><strong>Operator Mods:</strong> `;activeMods.forEach(k=>{html+=`<span class="mod-tag">${HARDENED_MODS[k].icon} ${HARDENED_MODS[k].label}</span>`;});html+=`</div>`;}
  html+=`</div>`;

  html+=`<div class="tier-summary">`;
  ["CRITICAL","HIGH","ELEVATED","MODERATE","LOW"].forEach(t=>{
    if(!tiers[t].length)return;
    html+=`<div class="tier-badge" style="background:${riskColor(t)}20;color:${riskColor(t)};border:1px solid ${riskColor(t)}44">${t}: ${tiers[t].length}</div>`;
  });
  html+=`</div>`;

  // Per-tier tables
  ["CRITICAL","HIGH","ELEVATED","MODERATE"].forEach(tier=>{
    if(!tiers[tier].length)return;
    html+=`<h2 style="color:${riskColor(tier)};border-color:${riskColor(tier)}">${tier} RISK — ${tiers[tier].length} PLATFORM${tiers[tier].length>1?"S":""}</h2>`;
    html+=`<table><tr><th>PLATFORM</th><th>MFR</th><th>WEIGHT</th><th>PROTOCOL</th><th>RF</th><th>ACU</th><th>RAD</th><th>EO/IR</th><th>INJ</th><th>JAM</th><th>GPS</th><th>RISK</th></tr>`;
    tiers[tier].forEach(d=>{
      html+=`<tr><td style="font-weight:700">${d.n}</td><td>${d.m}</td><td>${(d.w/1000).toFixed(1)}kg</td><td>${d.proto}</td>`;
      [d.rd,d.ad,d.rad,d.ed,d.pi,d.jm,d.gs].forEach(v=>{html+=`<td class="score" style="color:${sColor(v)}">${v}%</td>`;});
      html+=`<td class="score" style="color:${riskColor(d.rt)};font-size:11px">${d.or}%</td></tr>`;
    });
    html+=`</table>`;

    // Gap analysis for this tier
    tiers[tier].forEach(d=>{
      const gaps=[];
      if(d.pi<30)gaps.push(`Protocol injection ineffective against ${d.proto}`);
      if(d.jm<40)gaps.push(`Jamming difficult — ${d.proto} FHSS${d.cell?" + cellular":""}`);
      if(d.gs<50)gaps.push("GPS spoofing limited by RTK cross-check");
      if(d.rd<15)gaps.push("RF-silent — no emissions for passive DF/TDOA");
      if(gaps.length){html+=`<div class="gap-note">⚠ <strong>${d.n}:</strong> ${gaps.join("; ")}</div>`;}
    });
  });

  // LOW tier summary (condensed)
  if(tiers.LOW.length){
    html+=`<h2 style="color:${riskColor("LOW")};border-color:${riskColor("LOW")}">LOW RISK — ${tiers.LOW.length} PLATFORMS (SUMMARY)</h2>`;
    html+=`<div style="font-size:9px;color:#444;margin-bottom:8px">All detection and defeat mechanisms effective. Platforms listed for completeness.</div>`;
    html+=`<table><tr><th>PLATFORM</th><th>MFR</th><th>PROTOCOL</th><th>RISK</th></tr>`;
    tiers.LOW.forEach(d=>{html+=`<tr><td>${d.n}</td><td>${d.m}</td><td>${d.proto}</td><td class="score" style="color:#00cc66">${d.or}%</td></tr>`;});
    html+=`</table>`;
  }

  html+=`<div class="footer"><span>Shaw AFB C-UAS SV-1 · 93 Platforms · dronecompare.org</span><span>40 RF/EA nodes · 30 radars · 24 acoustic · 12 EO/IR · 2 C2</span></div>`;
  html+=`</div></body></html>`;
  return html;
}
