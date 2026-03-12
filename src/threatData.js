/**
 * Shaw AFB cUAS SV-1 — Threat Database & Scoring Engine v7
 *
 * v7: Effectiveness Rate framing (inverted from residual risk)
 *     - Scores now represent successful detect & defeat per 100 encounters
 *     - 3-tier system: CRITICAL (<60%), ELEVATED (61-80%), LOW (81-100%)
 *     - Three-way comparison: SV-1 vs NINJA vs RD-SUADS
 *     - Assessment paragraph uses effectiveness language
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
  // ── DRONESMOKE Battle Lab Interceptors (also scored as threats) ──
  {n:"REDDI",m:"MITRE",c:"Enterprise",p:"VTOL",w:1814,s:126,ft:5,pr:800,proto:"Doodle Labs Mesh",rtk:false,wp:false,cell:false,enc:true,auto:false,fs:"Land",props:1,pd:8},
  {n:"SICA",m:"MIT Lincoln Lab",c:"Enterprise",p:"VTOL",w:2994,s:76,ft:10,pr:1500,proto:"Custom ISM",rtk:false,wp:false,cell:true,enc:true,auto:false,fs:"Land",props:1,pd:10},
  {n:"WASP",m:"Titan Dynamics",c:"Enterprise",p:"VTOL",w:1814,s:89,ft:8,pr:8000,proto:"Custom ISM",rtk:false,wp:false,cell:true,enc:true,auto:false,fs:"Land",props:1,pd:8},
];

const INJECTABLE=new Set(["OcuSync","OcuSync 2","OcuSync 3","OcuSync 3+","OcuSync 4","OcuSync 4+","OcuSync O4","OcuSync O4+","OcuSync 2 Enterprise","OcuSync 3 Enterprise","OcuSync 4 Enterprise","Lightbridge","Lightbridge 2","Enhanced WiFi","WiFi","WiFi 6"]);
const JAM_DIFF={"WiFi":10,"Enhanced WiFi":15,"WiFi 6":25,"Lightbridge":20,"Lightbridge 2":25,"OcuSync":35,"OcuSync 2":40,"OcuSync 3":45,"OcuSync 3+":48,"OcuSync 4":52,"OcuSync 4+":55,"OcuSync O4":50,"OcuSync O4+":53,"OcuSync 2 Enterprise":50,"OcuSync 3 Enterprise":55,"OcuSync 4 Enterprise":60,"SkyLink 2":55,"SkyLink 3":60,"Skydio Link":60,"Microhard":65,"Futaba S-FHSS":30,"Custom ISM":55,"Doodle Labs Mesh":68};
const cl=(v)=>Math.max(0,Math.min(100,Math.round(v)));

export const HARDENED_MODS={rfSilent:{label:"RF-Silent Mode",desc:"No RF emissions for DF/TDOA",icon:"📡"},customFW:{label:"Custom Firmware",desc:"Protocol injection fails",icon:"🔧"},gpsDenied:{label:"GPS-Denied Nav",desc:"GPS spoofing cannot redirect",icon:"🛰️"},noCell:{label:"Cellular Disabled",desc:"Jamming more effective",icon:"📶"},terrainMask:{label:"Terrain Masking",desc:"Reduces radar & EO/IR",icon:"🏔️"},swarm:{label:"Swarm Tactics",desc:"Overwhelms single-node EA",icon:"🐝"}};
export const TOD_MODES={day:{label:"Day",icon:"☀️",desc:"Baseline conditions."},dusk:{label:"Dusk/Dawn",icon:"🌅",desc:"Visible degraded, thermal improving."},night:{label:"Night",icon:"🌙",desc:"Thermal at peak, visible ineffective."},flightOps:{label:"Flight Ops",icon:"✈️",desc:"Jet noise compresses acoustic to ~100-150m."}};

function todAcousticMod(tod){if(tod==="night")return 8;if(tod==="dusk")return 3;if(tod==="flightOps")return-22;return 0;}
function todEOIRMod(tod){if(tod==="night")return 12;if(tod==="dusk")return-5;return 0;}

// ── SV-1 Scoring ──────────────────────────────────────────────────────────────
function scoreRF(d,mo){if(mo.rfSilent)return 5;let b=85;const p=d.proto;if(p.includes("WiFi")||p==="Enhanced WiFi")b=95;else if(p.includes("Lightbridge"))b=92;else if(p.includes("OcuSync"))b=88;else if(p.includes("SkyLink"))b=80;else if(p.includes("Skydio"))b=78;else if(p.includes("Microhard"))b=72;else if(p.includes("Custom"))b=65;else if(p.includes("Futaba"))b=90;if(d.cell&&!mo.noCell)b-=5;if(d.enc)b-=3;return cl(b);}
function scoreAcoustic(d,mo,tod){const w=d.w;const pf=Math.min(1,(d.pd||8)/20);const cb=((d.props||4)-4)*3;let b;if(w<=200)b=20;else if(w<=300)b=30;else if(w<=500)b=42;else if(w<=1000)b=52;else if(w<=2000)b=62;else if(w<=5000)b=72+pf*8;else if(w<=10000)b=82+pf*6;else b=88+pf*5;b+=cb;if(d.p==="VTOL")b-=18;if(mo.terrainMask)b-=12;b+=todAcousticMod(tod);return cl(b);}
function scoreRadar(d,mo){let b=20+55*Math.min(1,Math.pow(d.w/50000,0.4));if(d.p==="VTOL")b+=10;if(d.w>5000)b=Math.min(b+8,98);if(mo.terrainMask)b-=18;return cl(b);}
function scoreEOIR(d,mo,tod){const w=d.w;let b=w<=200?28:w<=300?38:w<=500?48:w<=1000?58:w<=2000?68:w<=5000?78:w<=10000?88:95;if(mo.terrainMask)b-=15;b+=todEOIRMod(tod);return cl(b);}
function scoreProtoInject(d,mo){if(mo.customFW)return 2;if(mo.rfSilent)return 0;if(!INJECTABLE.has(d.proto))return 10;const p=d.proto;if(p.includes("WiFi")||p==="Enhanced WiFi")return 92;if(p.includes("Lightbridge"))return 85;if(p.includes("Enterprise"))return 60;if(p.includes("4")||p.includes("O4"))return 65;if(p.includes("3"))return 70;if(p.includes("2"))return 78;return 80;}
function scoreJamming(d,mo){if(mo.rfSilent)return 15;let b=100-(JAM_DIFF[d.proto]||50);if(d.cell&&!mo.noCell)b-=15;if(d.enc)b-=5;if(mo.swarm)b-=25;return cl(b);}
function scoreGPS(d,mo){if(mo.gpsDenied)return 5;let b=80;if(d.rtk)b-=35;if(!d.auto)b+=10;return cl(b);}
function effTier(e){if(e>=81)return"LOW";if(e>=61)return"ELEVATED";return"CRITICAL";}

// ── NINJA Scoring (RF-only detection, protocol manipulation only) ─────────────
function ninjaRF(d,mo){if(mo.rfSilent)return 3;const p=d.proto;if(p.includes("OcuSync")||p.includes("Lightbridge"))return 82;if(p.includes("WiFi")||p==="Enhanced WiFi")return 85;if(p.includes("SkyLink"))return 55;if(p.includes("Skydio"))return 50;if(p.includes("Microhard"))return 45;if(p.includes("Custom"))return 35;if(p.includes("Futaba"))return 65;if(d.enc)return cl(70-5);return 70;}
function ninjaDefeat(d,mo){if(mo.customFW)return 1;if(mo.rfSilent)return 0;const p=d.proto;if(p.includes("WiFi")||p==="Enhanced WiFi")return 88;if(p.includes("OcuSync")||p.includes("Lightbridge"))return 75;if(p.includes("SkyLink"))return 15;if(p.includes("Skydio"))return 10;if(p.includes("Microhard"))return 8;if(p.includes("Custom"))return 5;if(p.includes("Futaba"))return 12;return 20;}
function analyzeNinja(d,mo){const rf=ninjaRF(d,mo);const def=ninjaDefeat(d,mo);const eff=cl((rf/100)*(def/100)*100);return{nRF:rf,nDefeat:def,nRisk:eff,nTier:effTier(eff)};}

// ── RD-SUADS Scoring (RF detection via MEDUSA + C2/GNSS jamming) ──────────────
// Trust Automation SUADS: $490M USAF IDIQ (Jan 2026)
// Detection: RF-based via MEDUSA C2 network (better than single NINJA unit, still RF-only)
// Defeat: Broadband EW jamming in C2 bands + GNSS denial (NOT protocol manipulation)
// Key difference from NINJA: SUADS jams indiscriminately across C2 bands (affects all protocols)
// Key difference from SV-1: No radar, no acoustic, no EO/IR, no surgical protocol injection, no GPS spoofing (only denial)
// GNSS denial forces failsafe but does not redirect the drone to a capture point

function suadsRF(d,mo){
  // MEDUSA sensor fusion improves on single-unit NINJA, but still RF-only
  if(mo.rfSilent)return 4;
  const p=d.proto;
  if(p.includes("OcuSync")||p.includes("Lightbridge"))return 85; // DJI well-characterized
  if(p.includes("WiFi")||p==="Enhanced WiFi")return 88; // simple protocols easy
  if(p.includes("SkyLink"))return 62; // better than NINJA due to MEDUSA broadband scan
  if(p.includes("Skydio"))return 58;
  if(p.includes("Microhard"))return 52; // ISM, harder but MEDUSA picks up energy
  if(p.includes("Custom"))return 42; // unknown protocol, anomaly detection
  if(p.includes("Futaba"))return 70;
  if(d.enc)return cl(72-4);
  return 72;
}

function suadsC2Jam(d,mo){
  // Broadband C2 jamming across drone command frequencies
  // Not protocol-specific like NINJA, just brute-force RF energy in the band
  // Works against ANY protocol but effectiveness depends on link robustness
  if(mo.rfSilent)return 12; // some residual jamming effect even on silent drones near the zone
  let b=75; // baseline broadband jam
  const p=d.proto;
  if(p.includes("WiFi")||p==="Enhanced WiFi")b=88; // narrow-band WiFi easy to overwhelm
  else if(p.includes("Lightbridge"))b=80;
  else if(p.includes("OcuSync")){
    if(p.includes("4"))b=52; // newer FHSS harder
    else if(p.includes("3"))b=58;
    else b=65;
  }
  else if(p.includes("SkyLink"))b=48; // robust FHSS
  else if(p.includes("Skydio"))b=45;
  else if(p.includes("Microhard"))b=38; // very robust ISM data link
  else if(p.includes("Custom"))b=42;
  else if(p.includes("Futaba"))b=72;
  // Cellular backup survives C2 jamming
  if(d.cell&&!mo.noCell)b-=20;
  if(d.enc)b-=3;
  if(mo.swarm)b-=20;
  return cl(b);
}

function suadsGNSS(d,mo){
  // GNSS denial (broadband jamming of GPS bands), not surgical spoofing
  // Denies GPS fix but does NOT redirect, just forces fallback behavior
  if(mo.gpsDenied)return 3; // drone already GPS-denied, minimal additional effect
  let b=65; // baseline GNSS denial
  if(d.rtk)b-=30; // RTK correction stream helps maintain fix through some jamming
  if(!d.auto)b+=8; // non-autonomous drones more dependent on GPS
  return cl(b);
}

function analyzeSUADS(d,mo){
  const rf=suadsRF(d,mo);
  const jam=suadsC2Jam(d,mo);
  const gnss=suadsGNSS(d,mo);
  const det=rf; // RF-only detection
  const def=cl((1-(1-jam/100)*(1-gnss/100))*100); // two defeat mechanisms
  const eff=cl((det/100)*(def/100)*100);
  return{sRF:rf,sJam:jam,sGNSS:gnss,sDet:det,sDefeat:def,sRisk:eff,sTier:effTier(eff)};
}

// ── DRONESMOKE Interceptor Effectiveness Model ────────────────────────────────
// All three interceptors rely on SV-1 cueing (cd = composite detection).
// Effectiveness = SV-1_detection × interceptor_defeat_probability
// Each interceptor has a unique defeat mechanism scored against each target.

// REDDI (MITRE) — Close-proximity analog EW via Gnat jammer
// 283 mph, VTOL launch, Doodle Labs Mesh C2, $800/unit
// Defeat: Analog electronic attack at close range — protocol-dependent
// More effective than standoff jamming because of proximity, but still
// cannot defeat cellular backup or encrypted autonomous waypoint nav
function reddiDefeat(d,mo){
  if(mo.rfSilent)return 15;
  let b=70;
  const p=d.proto;
  if(p.includes("WiFi")||p==="Enhanced WiFi")b=92;
  else if(p.includes("Lightbridge"))b=85;
  else if(p.includes("OcuSync")){
    if(p.includes("Enterprise"))b=58;
    else if(p.includes("4")||p.includes("O4"))b=62;
    else if(p.includes("3"))b=67;
    else b=74;
  }
  else if(p.includes("Futaba"))b=80;
  else if(p.includes("SkyLink")){b=p.includes("3")?48:52;}
  else if(p.includes("Skydio"))b=46;
  else if(p.includes("Microhard"))b=38;
  else if(p.includes("Custom"))b=42;
  else if(p.includes("Doodle"))b=35;
  if(d.cell&&!mo.noCell)b-=22;
  if(d.enc)b-=3;
  if(mo.swarm)b-=20;
  return cl(b);
}

// SICA (MIT Lincoln Lab) — Kinetic intercept via SWAP-C warhead + optional EW
// 170 mph, 10G maneuvering, cell modem (RPi5), $1500/unit
// Defeat: Kinetic kill — protocol-independent, depends on target size/speed/agility
// 10G turn capability gives excellent tracking against evasive targets
function sicaDefeat(d,mo){
  let b=70;
  const w=d.w;
  if(w<=200)b=38;else if(w<=300)b=45;else if(w<=500)b=52;else if(w<=1000)b=62;
  else if(w<=2000)b=70;else if(w<=5000)b=78;else if(w<=10000)b=86;else b=92;
  if(d.s>30)b-=10;else if(d.s>25)b-=6;else if(d.s>20)b-=3;
  if(d.p==="VTOL")b-=10;
  if(mo.swarm)b-=25;
  if(mo.terrainMask)b-=15;
  return cl(b);
}

// WASP (Titan Dynamics) — Kinetic intercept
// 200 mph, 5G maneuvering, DTC Radio + 5G cell, $8000/unit
// Defeat: Kinetic kill — protocol-independent, similar to SICA but 5G vs 10G
// Faster than SICA (200 vs 170 mph) but less maneuverable (5G vs 10G)
function waspDefeat(d,mo){
  let b=65;
  const w=d.w;
  if(w<=200)b=32;else if(w<=300)b=40;else if(w<=500)b=48;else if(w<=1000)b=57;
  else if(w<=2000)b=65;else if(w<=5000)b=74;else if(w<=10000)b=82;else b=88;
  if(d.s>30)b-=8;else if(d.s>25)b-=5;else if(d.s>20)b-=2;
  if(d.p==="VTOL")b-=8;
  if(mo.swarm)b-=25;
  if(mo.terrainMask)b-=15;
  return cl(b);
}

function analyzeInterceptors(d,mo,cd){
  const rD=reddiDefeat(d,mo),sD=sicaDefeat(d,mo),wD=waspDefeat(d,mo);
  const rE=cl((cd/100)*(rD/100)*100);
  const sE=cl((cd/100)*(sD/100)*100);
  const wE=cl((cd/100)*(wD/100)*100);
  return{iRDef:rD,iREff:rE,iRTier:effTier(rE),iSDef:sD,iSEff:sE,iSTier:effTier(sE),iWDef:wD,iWEff:wE,iWTier:effTier(wE)};
}

// ── Main Analysis ─────────────────────────────────────────────────────────────
export function analyzeDrone(d,mods={},tod="day"){
  const rd=scoreRF(d,mods),ad=scoreAcoustic(d,mods,tod),rad=scoreRadar(d,mods),ed=scoreEOIR(d,mods,tod);
  const pi=scoreProtoInject(d,mods),jm=scoreJamming(d,mods),gs=scoreGPS(d,mods);
  const cd=cl((1-(1-rd/100)*(1-ad/100)*(1-rad/100)*(1-ed/100))*100);
  const cdf=cl((1-(1-pi/100)*(1-jm/100)*(1-gs/100))*100);
  const or_=cl((cd/100)*(cdf/100)*100);
  const ninja=analyzeNinja(d,mods);
  const suads=analyzeSUADS(d,mods);
  const intcpt=analyzeInterceptors(d,mods,cd);
  return{...d,rd,ad,rad,ed,cd,pi,jm,gs,cdf,or:or_,rt:effTier(or_),...ninja,...suads,...intcpt};
}

export function analyzeDrones(mods={},tod="day",customDrones=[]){
  const all=[...DRONES,...customDrones.map(d=>({...d,custom:true}))];
  return all.map(d=>analyzeDrone(d,mods,tod)).sort((a,b)=>a.or-b.or);
}

export function getNodeEffectiveness(scored){return{rfSensor:scored.rd,eaNode:Math.round((scored.pi+scored.jm+scored.gs)/3),radar:scored.rad,acoustic:scored.ad,eoir:scored.ed};}

// ── Scenario ──────────────────────────────────────────────────────────────────
export function serializeScenario(mods,tod,droneName,scenarioName){const params=new URLSearchParams();const am=Object.keys(mods).filter(k=>mods[k]);if(am.length)params.set("mods",am.join(","));if(tod&&tod!=="day")params.set("tod",tod);if(droneName)params.set("drone",droneName);if(scenarioName)params.set("name",scenarioName);return params.toString();}
export function deserializeScenario(hash){const params=new URLSearchParams(hash.replace(/^#/,""));const mods={};const ms=params.get("mods");if(ms)ms.split(",").forEach(k=>{if(HARDENED_MODS[k])mods[k]=true;});return{mods,tod:params.get("tod")||"day",drone:params.get("drone")||null,name:params.get("name")||null};}

// ── Custom Drone Persistence ──────────────────────────────────────────────────
const STORAGE_KEY="shaw_cuas_custom_drones";
export function loadCustomDrones(){try{const s=localStorage.getItem(STORAGE_KEY);return s?JSON.parse(s):[];}catch(e){return[];}}
export function saveCustomDrones(drones){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(drones));}catch(e){}}

// ── PDF Extraction ────────────────────────────────────────────────────────────
export const EXTRACTION_PROMPT=`You are extracting sUAS/drone specifications from a product sheet to assess it against a Counter-UAS system. Return ONLY valid JSON, no markdown, no backticks, no preamble.
Extract these fields. Use null for anything you cannot determine:
{"n":"Full platform name","m":"Manufacturer","c":"Category: 'Photo & Video','Enterprise','Mapping','Agriculture','Cargo','FPV'","p":"'Multirotor' or 'VTOL'","w":weight_grams,"s":max_speed_m_s,"ft":flight_time_min,"pr":price_usd_or_null,"proto":"Transmission protocol","rtk":bool,"wp":bool,"cell":bool,"enc":bool,"auto":bool,"fs":"RTH or Hover/RTH or Land","props":num_propellers,"pd":prop_diameter_inches,"confidence":"high/medium/low","notes":"brief"}
Weight MUST be grams. Speed MUST be m/s. If protocol unclear use "Custom ISM". Respond ONLY with JSON.`;

export function validateExtracted(raw){const d={...raw};d.n=d.n||"Unknown Platform";d.m=d.m||"Unknown";d.c=d.c||"Enterprise";d.p=d.p||"Multirotor";d.w=Math.round(Number(d.w))||1000;d.s=Math.round(Number(d.s))||15;d.ft=Math.round(Number(d.ft))||20;d.pr=d.pr?Math.round(Number(d.pr)):null;d.proto=d.proto||"Custom ISM";d.rtk=!!d.rtk;d.wp=!!d.wp;d.cell=!!d.cell;d.enc=!!d.enc;d.auto=!!d.auto;d.fs=d.fs||"RTH";d.props=Math.round(Number(d.props))||4;d.pd=Math.round(Number(d.pd))||8;d.custom=true;d.addedAt=new Date().toISOString();return d;}
const KEY_STORAGE="shaw_cuas_api_key";
export function loadApiKey(){try{return localStorage.getItem(KEY_STORAGE)||"";}catch(e){return"";}}
export function saveApiKey(k){try{localStorage.setItem(KEY_STORAGE,k);}catch(e){}}

// ── Briefing with Three-Way Comparison + Assessment ───────────────────────────
function rc(t){return{CRITICAL:"#ff0000",ELEVATED:"#ff9900",LOW:"#00cc66"}[t]||"#888";}
function sc(v){return v>=70?"#00cc66":v>=50?"#aaaa00":v>=30?"#ff9900":"#ff4444";}

function generateAssessment(data){
  const total=data.length;
  const avgSV1=Math.round(data.reduce((a,d)=>a+d.or,0)/total);
  const avgNinja=Math.round(data.reduce((a,d)=>a+d.nRisk,0)/total);
  const avgSuads=Math.round(data.reduce((a,d)=>a+d.sRisk,0)/total);
  const sv1Low=data.filter(d=>d.rt==="LOW").length;
  const sv1Crit=data.filter(d=>d.rt==="CRITICAL").length;
  const ninjaCrit=data.filter(d=>d.nTier==="CRITICAL").length;
  const suadsCrit=data.filter(d=>d.sTier==="CRITICAL").length;

  return `The SV-1 multi-modal architecture achieves an average effectiveness rate of ${avgSV1}% across all ${total} platforms and holds ${sv1Low} platforms in the LOW tier (81% or higher effectiveness), because its four detection phenomenologies (RF, acoustic, radar, EO/IR) and three defeat mechanisms (protocol injection, jamming, GPS spoofing) overlap so that no single platform characteristic can evade the entire kill chain. The NINJA Gen2 system achieves only ${avgNinja}% average effectiveness and places ${ninjaCrit} platforms in the CRITICAL tier (below 60% effectiveness), because any drone running a non-DJI protocol like Autel SkyLink, Skydio Link, Microhard, or a custom ISM link falls outside NINJA's protocol library and becomes nearly undefeatable. NINJA is ${avgSV1-avgNinja}% less effective than SV-1 on average. The RD-SUADS system improves on NINJA by adding broadband C2 jamming and GNSS denial, raising average effectiveness to ${avgSuads}% and reducing CRITICAL-tier platforms to ${suadsCrit}, but it still detects through RF alone and cannot redirect a drone the way GPS spoofing does, it cannot classify or track RF-silent platforms, and its broadband jamming risks disrupting friendly communications across the installation. RD-SUADS is ${avgSV1-avgSuads}% less effective than SV-1 on average. The SV-1 closes the gaps both systems leave open: radar and acoustic arrays detect platforms that emit no RF energy, EO/IR turrets confirm and track targets that evade radar at close range, protocol injection takes surgical control of DJI platforms without collateral interference, and GPS spoofing redirects uncooperative drones to a capture corridor rather than simply denying their navigation fix and hoping the failsafe behavior works in the defender's favor.`;
}

export function generateBriefingHTML(data,mods,tod,scenarioName){
  const activeMods=Object.keys(mods).filter(k=>mods[k]);
  const tiers={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>tiers[d.rt].push(d));
  const nT={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>nT[d.nTier].push(d));
  const sT={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>sT[d.sTier].push(d));
  const todLabel=TOD_MODES[tod]?.label||"Day";const now=new Date().toISOString().split("T")[0];

  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Shaw AFB cUAS Three-Way Comparison</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Oxanium:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;color:#111;font-family:'IBM Plex Mono',monospace;font-size:9px;line-height:1.5}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:letter portrait;margin:0.4in}.pb{page-break-before:always}}
.pg{max-width:7.5in;margin:0 auto;padding:16px}
h1{font-family:Oxanium,sans-serif;font-size:15px;letter-spacing:2px;border-bottom:2px solid #111;padding-bottom:5px;margin-bottom:10px}
h2{font-family:Oxanium,sans-serif;font-size:12px;letter-spacing:1.5px;margin:14px 0 6px;padding:3px 8px;border-left:3px solid}
.meta{display:flex;justify-content:space-between;font-size:8px;color:#444;margin-bottom:12px;flex-wrap:wrap;gap:4px}
.ts{display:flex;gap:10px;margin:6px 0 12px;flex-wrap:wrap}
.tb{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:3px;font-family:Oxanium,sans-serif;font-weight:700;font-size:10px}
table{width:100%;border-collapse:collapse;margin:4px 0 10px;font-size:8px}
th{background:#0a0e14;color:#e4ecf4;padding:4px 3px;text-align:left;font-size:7px;letter-spacing:0.8px;font-family:Oxanium,sans-serif}
td{padding:3px;border-bottom:1px solid #e0e0e0}tr:nth-child(even){background:#f8f8fa}
.sc{font-weight:700;text-align:center;font-size:8px}
.mod-tag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:7px;margin-right:3px;background:#fff0f0;color:#c33;border:1px solid #fcc}
.dp{color:#00aa44;font-weight:700}.dn{color:#cc0000;font-weight:700}
.ft{margin-top:16px;padding-top:6px;border-top:1px solid #ccc;font-size:7px;color:#888;display:flex;justify-content:space-between}
.gap{font-size:7px;color:#c30;margin:1px 0}
.sb{flex:1;min-width:160px;padding:8px;border:1px solid #ddd;border-radius:5px;font-size:8px}
.assess{font-size:9.5px;line-height:1.7;color:#222;text-align:justify;margin:12px 0}
</style></head><body><div class="pg">`;

  html+=`<h1>SHAW AFB C-UAS: SV-1 vs RD-SUADS vs NINJA EFFECTIVENESS COMPARISON</h1>`;
  html+=`<div class="meta"><span>Shaw AFB, Sumter SC · 20th FW · DoDAF SV-1 Comparative Assessment</span><span>${now} · UNCLASSIFIED // FOUO</span></div>`;
  if(scenarioName)html+=`<div style="background:#0a0e14;color:#00ff88;padding:6px 10px;border-radius:4px;font-family:Oxanium,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:10px">SCENARIO: ${scenarioName.toUpperCase()}</div>`;
  html+=`<div style="display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap"><div><strong>ToD:</strong> ${todLabel}</div><div><strong>Platforms:</strong> ${data.length}</div>`;
  if(activeMods.length){html+=`<div><strong>Mods:</strong> `;activeMods.forEach(k=>{html+=`<span class="mod-tag">${HARDENED_MODS[k].icon} ${HARDENED_MODS[k].label}</span>`;});html+=`</div>`;}
  html+=`</div>`;

  // System cards
  html+=`<div style="display:flex;gap:12px;margin:10px 0;flex-wrap:wrap">`;
  html+=`<div class="sb" style="border-color:#0a4"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#0a4;margin:0 0 4px">SV-1 MULTI-MODAL ($1.64M)</h3><div style="color:#666">4 detection (RF+Acoustic+Radar+EO/IR) · 3 defeat (Injection+Jamming+GPS Spoof) · 40 sensor nodes</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(tiers[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${tiers[t].length}</div>`;});
  html+=`</div></div>`;
  html+=`<div class="sb" style="border-color:#2266cc"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#2266cc;margin:0 0 4px">RD-SUADS (Trust Automation)</h3><div style="color:#666">1 detection (RF/MEDUSA) · 2 defeat (C2 Jam+GNSS Denial) · No radar/acoustic/EO-IR</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(sT[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${sT[t].length}</div>`;});
  html+=`</div></div>`;
  html+=`<div class="sb" style="border-color:#c60"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#c60;margin:0 0 4px">NINJA Gen2 (Black River)</h3><div style="color:#666">1 detection (RF) · 1 defeat (Protocol Manipulation) · No jamming/GPS/radar/acoustic</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(nT[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${nT[t].length}</div>`;});
  html+=`</div></div></div>`;

  // Comparative table for all ELEVATED+ across any system
  const elev=data.filter(d=>d.or<=60||d.sRisk<=60||d.nRisk<=60).sort((a,b)=>b.or-a.or);
  if(elev.length){
    html+=`<h2 style="color:#c30;border-color:#c30">CRITICAL PLATFORMS: EFFECTIVENESS BELOW 60% (${elev.length})</h2>`;
    html+=`<table><tr><th>PLATFORM</th><th>PROTOCOL</th><th style="text-align:center;background:#002208">SV-1</th><th style="text-align:center;background:#002208">TIER</th><th style="text-align:center;background:#0a1a33">SUADS</th><th style="text-align:center;background:#0a1a33">TIER</th><th style="text-align:center;background:#221100">NINJA</th><th style="text-align:center;background:#221100">TIER</th><th>SUADS vs SV-1</th><th>NINJA vs SV-1</th></tr>`;
    elev.forEach(d=>{
      const ds=d.sRisk-d.or;const dn=d.nRisk-d.or;
      html+=`<tr><td style="font-weight:700">${d.n}</td><td>${d.proto}</td>`;
      html+=`<td class="sc" style="color:${rc(d.rt)};font-size:10px">${d.or}%</td><td class="sc" style="color:${rc(d.rt)}">${d.rt}</td>`;
      html+=`<td class="sc" style="color:${rc(d.sTier)};font-size:10px">${d.sRisk}%</td><td class="sc" style="color:${rc(d.sTier)}">${d.sTier}</td>`;
      html+=`<td class="sc" style="color:${rc(d.nTier)};font-size:10px">${d.nRisk}%</td><td class="sc" style="color:${rc(d.nTier)}">${d.nTier}</td>`;
      html+=`<td class="sc ${ds<0?"dn":"dp"}">${ds>0?"+":""}${ds}%</td>`;
      html+=`<td class="sc ${dn<0?"dn":"dp"}">${dn>0?"+":""}${dn}%</td></tr>`;
    });
    html+=`</table>`;
  }

  // Assessment tab
  html+=`<div class="pb"></div>`;
  html+=`<h2 style="color:#333;border-color:#333">COMPARATIVE ASSESSMENT</h2>`;
  html+=`<div class="assess">${generateAssessment(data)}</div>`;

  // Full table
  html+=`<h2 style="color:#333;border-color:#333">ALL ${data.length} PLATFORMS</h2>`;
  html+=`<table><tr><th>PLATFORM</th><th>PROTO</th><th>SV-1</th><th>SUADS</th><th>NINJA</th><th>Δ S</th><th>Δ N</th></tr>`;
  [...data].sort((a,b)=>b.or-a.or).forEach(d=>{
    const ds=d.sRisk-d.or;const dn=d.nRisk-d.or;
    html+=`<tr><td>${d.n}</td><td>${d.proto}</td>`;
    html+=`<td class="sc" style="color:${rc(d.rt)}">${d.or}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.sTier)}">${d.sRisk}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.nTier)}">${d.nRisk}%</td>`;
    html+=`<td class="sc ${ds<0?"dn":"dp"}">${ds>0?"+":""}${ds}%</td>`;
    html+=`<td class="sc ${dn<0?"dn":"dp"}">${dn>0?"+":""}${dn}%</td></tr>`;
  });
  html+=`</table>`;

  html+=`<div class="ft"><span>Shaw AFB C-UAS · SV-1 vs RD-SUADS vs NINJA · ${data.length} platforms</span><span>SV-1: 40 RF/EA · 30 radars · 24 acoustic · 12 EO/IR · 2 C2</span></div></div></body></html>`;
  return html;
}
