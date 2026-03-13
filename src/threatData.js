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
  {n:"Wolf Block 3",m:"Wolf Program",c:"Enterprise",p:"VTOL",w:11300,s:78,ft:25,pr:27500,proto:"Doodle Labs Mesh",rtk:false,wp:true,cell:false,enc:true,auto:true,fs:"RTH",props:5,pd:10},
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
// All three are FPV-pilot-operated high-speed interceptors.
// Detection = FPV pilot visual acquisition (independent of SV-1 sensors)
// Defeat = high-speed physical strike on vulnerable components (props, antennas,
//          control surfaces) — protocol-independent, NOT kinetic warhead or EW
// Effectiveness = FPV_visual_detection × physical_strike_probability

// FPV Pilot Visual Detection — independent of SV-1 sensor network
// Based on target visual signature (size, contrast), target speed (less loiter
// time = harder to find), and platform profile
function fpvDetect(d,mo){
  let b=55;
  const w=d.w;
  if(w<=150)b=22;else if(w<=250)b=28;else if(w<=500)b=35;else if(w<=1000)b=45;
  else if(w<=2000)b=55;else if(w<=5000)b=65;else if(w<=10000)b=75;else b=85;
  // Fast targets reduce visual acquisition window
  if(d.s>35)b-=12;else if(d.s>25)b-=7;else if(d.s>20)b-=3;
  // VTOL in cruise presents smaller visual profile
  if(d.p==="VTOL")b-=10;
  // Terrain masking degrades visual tracking
  if(mo.terrainMask)b-=15;
  // Swarms overwhelm single FPV pilot focus
  if(mo.swarm)b-=20;
  return cl(b);
}

// Physical strike scoring — protocol-independent
// All three interceptors disable targets by striking vulnerable components
// (props, motor arms, antennas, control surfaces) at high speed.
// Factors: target vulnerable surface area, speed closure, interceptor agility

// Target vulnerability score — how many/how large are exposed components
function targetVulnerability(d){
  let v=50;
  // More props = more vulnerable strike points
  const props=d.props||4;
  if(props>=8)v+=15;else if(props>=6)v+=10;else if(props>=4)v+=5;
  // Larger prop diameter = bigger target area per prop
  const pd=d.pd||8;
  if(pd>=20)v+=18;else if(pd>=15)v+=12;else if(pd>=10)v+=7;else if(pd>=7)v+=3;
  // Heavier platforms have larger motor arms and structures
  const w=d.w;
  if(w>=10000)v+=10;else if(w>=5000)v+=6;else if(w>=2000)v+=3;
  else if(w<=250)v-=15;else if(w<=500)v-=8;
  // VTOL fixed-wing: fewer exposed props in cruise, hardened airframe
  if(d.p==="VTOL")v-=12;
  return cl(v);
}

// REDDI (MITRE) — 283 mph (126 m/s), ~5-7G, $800
// Fastest interceptor. Extreme closure speed gives pilot less reaction time
// on terminal approach, but massive speed advantage over all targets.
function reddiStrike(d,mo){
  let b=targetVulnerability(d);
  // Speed closure: REDDI at 126 m/s vs target
  // Higher closure = harder for pilot to fine-tune aim, but target can't evade
  const closure=126-d.s;
  if(closure>100)b+=10;else if(closure>80)b+=6;else if(closure>50)b+=2;
  else if(closure<20)b-=15;else if(closure<40)b-=8;
  // Moderate maneuverability (~5-7G estimated)
  // Fast targets that jink are harder
  if(d.s>25&&d.w<2000)b-=5;
  if(mo.terrainMask)b-=10;
  if(mo.swarm)b-=18;
  return cl(b);
}

// SICA (MIT Lincoln Lab) — 170 mph (76 m/s), 10G, $1500
// Most maneuverable. 10G turns give the pilot the best terminal tracking
// for fine adjustments. Slower than REDDI but better aim window.
function sicaStrike(d,mo){
  let b=targetVulnerability(d);
  // Speed closure: SICA at 76 m/s vs target
  const closure=76-d.s;
  if(closure>50)b+=8;else if(closure>30)b+=4;else if(closure>10)b+=0;
  else if(closure<0)b-=18;else if(closure<10)b-=8;
  // 10G maneuverability — best terminal tracking
  b+=8;
  // Fine aim bonus against large slow targets
  if(d.w>=5000&&d.s<=20)b+=5;
  if(mo.terrainMask)b-=10;
  if(mo.swarm)b-=18;
  return cl(b);
}

// WASP (Titan Dynamics) — 200 mph (89 m/s), 5G, $8000
// Middle ground: faster than SICA, less maneuverable.
// 5G limits terminal corrections against agile small targets.
function waspStrike(d,mo){
  let b=targetVulnerability(d);
  // Speed closure: WASP at 89 m/s vs target
  const closure=89-d.s;
  if(closure>60)b+=8;else if(closure>40)b+=4;else if(closure>20)b+=0;
  else if(closure<0)b-=15;else if(closure<10)b-=8;
  // 5G maneuverability — moderate terminal tracking
  b+=3;
  // Less able to fine-tune against small agile targets
  if(d.w<500&&d.s>15)b-=5;
  if(mo.terrainMask)b-=10;
  if(mo.swarm)b-=18;
  return cl(b);
}

// Wolf Block 3 (Wolf Program) — 175 mph (78 m/s), 5g inst / 3.5g sust, $27,500
// FUNDAMENTALLY DIFFERENT from REDDI/SICA/WASP:
//   Detection: Dual EO/IR AI seeker (YOLO 30fps on Jetson Orin Nano) + external
//     radar cueing via ASTERIX/STANAG/MAVLink/JSON/CoT. NOT FPV pilot visual.
//   Defeat: AI-guided proportional navigation terminal strike — net capture or
//     kinetic ram. Autonomous kill chain from cueing through impact.
// Detection is NOT limited by FPV pilot eyeballs — thermal/EO AI seeker acquires
// targets that are invisible to the human eye (small, fast, night, cluttered BG).

function wolfDetect(d,mo){
  // AI seeker detection via dual EO/IR + YOLO
  // Thermal channel (FLIR Boson 640 LWIR) detects motor/battery heat signatures
  // EO channel (Allied Vision Alvium 1800) detects visual contrast
  // YOLO runs both feeds at 30fps — confidence scales with target pixel area
  let b=60;
  const w=d.w;
  // Thermal + visual signature scales with platform size
  if(w<=150)b=35;else if(w<=250)b=42;else if(w<=500)b=50;else if(w<=1000)b=58;
  else if(w<=2000)b=65;else if(w<=5000)b=75;else if(w<=10000)b=85;else b=92;
  // YOLO confidence bonus: larger targets fill more pixels
  if(w>=5000)b+=5;
  // Thermal channel works day AND night — no degradation at night
  // (unlike FPV pilots who lose visual in darkness)
  // Fast targets reduce tracking window but AI handles better than human
  if(d.s>35)b-=6;else if(d.s>25)b-=3;
  // VTOL in cruise: smaller thermal cross-section
  if(d.p==="VTOL")b-=6;
  // External radar cueing gives initial track — Wolf flies to the area
  // and then AI seeker acquires autonomously. Cueing assumed available.
  if(mo.terrainMask)b-=10;
  if(mo.swarm)b-=12; // AI can track one at a time, less degraded than human
  return cl(b);
}

function wolfStrike(d,mo){
  // AI-guided proportional navigation terminal strike
  // Much more precise than FPV manual aim — PN guidance computes lead angle
  // and continuously adjusts flight path to impact point
  let b=targetVulnerability(d);
  // Speed closure: Wolf at 78 m/s vs target
  const closure=78-d.s;
  if(closure>50)b+=8;else if(closure>30)b+=5;else if(closure>10)b+=2;
  else if(closure<0)b-=15;else if(closure<10)b-=6;
  // 5g instantaneous / 3.5g sustained — moderate maneuverability
  b+=4;
  // AI PN guidance bonus — precision terminal correction that FPV pilots can't match
  // Especially effective against small targets where human aim fails
  b+=10;
  // AI tracks through clutter better than human eye
  if(d.w>=2000)b+=3;
  if(mo.terrainMask)b-=8;
  if(mo.swarm)b-=15;
  return cl(b);
}

function analyzeInterceptors(d,mo){
  const det=fpvDetect(d,mo);
  const rS=reddiStrike(d,mo),sS=sicaStrike(d,mo),wS=waspStrike(d,mo);
  const rE=cl((det/100)*(rS/100)*100);
  const sE=cl((det/100)*(sS/100)*100);
  const wE=cl((det/100)*(wS/100)*100);
  // Wolf uses AI seeker detection, not FPV pilot
  const wlfD=wolfDetect(d,mo),wlfS=wolfStrike(d,mo);
  const wlfE=cl((wlfD/100)*(wlfS/100)*100);
  return{iFPV:det,iRStr:rS,iREff:rE,iRTier:effTier(rE),iSStr:sS,iSEff:sE,iSTier:effTier(sE),iWStr:wS,iWEff:wE,iWTier:effTier(wE),iWolfDet:wlfD,iWolfStr:wlfS,iWolfEff:wlfE,iWolfTier:effTier(wlfE)};
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
  const intcpt=analyzeInterceptors(d,mods);
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
  const rT={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>rT[d.iRTier].push(d));
  const siT={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>siT[d.iSTier].push(d));
  const wT={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>wT[d.iWTier].push(d));
  const wolfT={CRITICAL:[],ELEVATED:[],LOW:[]};data.forEach(d=>wolfT[d.iWolfTier].push(d));
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

  // Interceptor cards
  html+=`<div style="display:flex;gap:12px;margin:8px 0;flex-wrap:wrap">`;
  html+=`<div class="sb" style="border-color:#00cc88"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#00cc88;margin:0 0 4px">REDDI (MITRE) — $800</h3><div style="color:#666">FPV pilot · Physical strike · 283 mph · Non-kinetic</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(rT[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${rT[t].length}</div>`;});
  html+=`</div></div>`;
  html+=`<div class="sb" style="border-color:#00aa77"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#00aa77;margin:0 0 4px">SICA (Lincoln Lab) — $1,500</h3><div style="color:#666">FPV pilot · Physical strike · 170 mph · 10G</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(siT[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${siT[t].length}</div>`;});
  html+=`</div></div>`;
  html+=`<div class="sb" style="border-color:#009966"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#009966;margin:0 0 4px">WASP (Titan Dynamics) — $8,000</h3><div style="color:#666">FPV pilot · Physical strike · 200 mph · 5G</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(wT[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${wT[t].length}</div>`;});
  html+=`</div></div></div>`;

  // Wolf Block 3 card (separate — AI seeker, not FPV pilot)
  html+=`<div style="display:flex;gap:12px;margin:8px 0;flex-wrap:wrap">`;
  html+=`<div class="sb" style="border-color:#b8960a"><h3 style="font-family:Oxanium,sans-serif;font-size:10px;color:#b8960a;margin:0 0 4px">Wolf Block 3 (Wolf Program) — $27,500</h3><div style="color:#666">AI seeker (EO/IR YOLO) · PN-guided strike · 175 mph · 5g/3.5g · Autonomous</div><div class="ts">`;
  ["CRITICAL","ELEVATED","LOW"].forEach(t=>{if(wolfT[t].length)html+=`<div class="tb" style="background:${rc(t)}20;color:${rc(t)};border:1px solid ${rc(t)}44">${t[0]}:${wolfT[t].length}</div>`;});
  html+=`</div></div></div>`;

  // Comparative table for all ELEVATED+ across any system
  const elev=data.filter(d=>d.or<=60||d.sRisk<=60||d.nRisk<=60).sort((a,b)=>b.or-a.or);
  if(elev.length){
    html+=`<h2 style="color:#c30;border-color:#c30">CRITICAL PLATFORMS: EFFECTIVENESS BELOW 60% (${elev.length})</h2>`;
    html+=`<table><tr><th>PLATFORM</th><th>PROTOCOL</th><th style="text-align:center;background:#002208">SV-1</th><th style="text-align:center;background:#002208">TIER</th><th style="text-align:center;background:#0a1a33">SUADS</th><th style="text-align:center;background:#0a1a33">TIER</th><th style="text-align:center;background:#221100">NINJA</th><th style="text-align:center;background:#221100">TIER</th><th style="text-align:center;background:#002a22">REDDI</th><th style="text-align:center;background:#002a22">SICA</th><th style="text-align:center;background:#002a22">WASP</th><th style="text-align:center;background:#2a2200">WOLF</th><th>SUADS vs SV-1</th><th>NINJA vs SV-1</th></tr>`;
    elev.forEach(d=>{
      const ds=d.sRisk-d.or;const dn=d.nRisk-d.or;
      html+=`<tr><td style="font-weight:700">${d.n}</td><td>${d.proto}</td>`;
      html+=`<td class="sc" style="color:${rc(d.rt)};font-size:10px">${d.or}%</td><td class="sc" style="color:${rc(d.rt)}">${d.rt}</td>`;
      html+=`<td class="sc" style="color:${rc(d.sTier)};font-size:10px">${d.sRisk}%</td><td class="sc" style="color:${rc(d.sTier)}">${d.sTier}</td>`;
      html+=`<td class="sc" style="color:${rc(d.nTier)};font-size:10px">${d.nRisk}%</td><td class="sc" style="color:${rc(d.nTier)}">${d.nTier}</td>`;
      html+=`<td class="sc" style="color:${rc(d.iRTier)};font-size:10px">${d.iREff}%</td>`;
      html+=`<td class="sc" style="color:${rc(d.iSTier)};font-size:10px">${d.iSEff}%</td>`;
      html+=`<td class="sc" style="color:${rc(d.iWTier)};font-size:10px">${d.iWEff}%</td>`;
      html+=`<td class="sc" style="color:${rc(d.iWolfTier)};font-size:10px">${d.iWolfEff}%</td>`;
      html+=`<td class="sc ${ds<0?"dn":"dp"}">${ds>0?"+":""}${ds}%</td>`;
      html+=`<td class="sc ${dn<0?"dn":"dp"}">${dn>0?"+":""}${dn}%</td></tr>`;
    });
    html+=`</table>`;
  }

  // Assessment tab
  html+=`<div class="pb"></div>`;
  html+=`<h2 style="color:#333;border-color:#333">COMPARATIVE ASSESSMENT</h2>`;
  html+=`<div class="assess">${generateAssessment(data)}</div>`;

  // Interceptor assessment
  const avgR=Math.round(data.reduce((a,d)=>a+d.iREff,0)/data.length);
  const avgS=Math.round(data.reduce((a,d)=>a+d.iSEff,0)/data.length);
  const avgW=Math.round(data.reduce((a,d)=>a+d.iWEff,0)/data.length);
  const avgWolf=Math.round(data.reduce((a,d)=>a+d.iWolfEff,0)/data.length);
  const rCrit=data.filter(d=>d.iRTier==="CRITICAL").length;
  const sCrit=data.filter(d=>d.iSTier==="CRITICAL").length;
  const wCrit=data.filter(d=>d.iWTier==="CRITICAL").length;
  const wolfCrit=data.filter(d=>d.iWolfTier==="CRITICAL").length;
  html+=`<h2 style="color:#00aa77;border-color:#00aa77">DRONESMOKE INTERCEPTOR ASSESSMENT (FPV PILOT OPERATED)</h2>`;
  html+=`<div class="assess">REDDI, SICA, and WASP are FPV-pilot-operated platforms that defeat targets by physically striking vulnerable components (propellers, motor arms, antennas, control surfaces) at high speed. They operate independently of the SV-1 sensor network. Their effectiveness depends on two factors: the FPV pilot's ability to visually acquire the target, and the probability of a successful physical strike on exposed components during a high-speed pass. REDDI achieves ${avgR}% average effectiveness at 283 mph, the fastest closure speed of the three, which gives targets zero evasion window but limits the pilot's terminal correction time, placing ${rCrit} platforms in the CRITICAL tier. SICA achieves ${avgS}% average effectiveness at 170 mph with 10G maneuvering, which gives the pilot the best terminal tracking for fine adjustments against small or agile targets, placing ${sCrit} platforms in the CRITICAL tier. WASP achieves ${avgW}% average effectiveness at 200 mph with 5G maneuvering, a middle ground between REDDI's speed and SICA's agility, placing ${wCrit} platforms in the CRITICAL tier. All three share the same detection bottleneck: FPV pilot visual acquisition degrades sharply against sub-250g platforms, which have minimal visual signature at engagement ranges.</div>`;
  html+=`<h2 style="color:#b8960a;border-color:#b8960a">WOLF BLOCK 3 ASSESSMENT (AI SEEKER · AUTONOMOUS)</h2>`;
  html+=`<div class="assess">Wolf Block 3 operates on a fundamentally different model from the three FPV-pilot interceptors. Wolf uses a dual EO/IR AI seeker (Allied Vision Alvium 1800 EO + FLIR Boson 640 LWIR running YOLO at 30 fps on a Jetson Orin Nano) for autonomous target acquisition, and proportional navigation for terminal guidance. External radar cueing via ASTERIX, STANAG, MAVLink, JSON, or CoT provides the initial track, after which Wolf's onboard AI handles acquisition, tracking, and strike autonomously. Wolf achieves ${avgWolf}% average effectiveness across all ${data.length} platforms and places ${wolfCrit} in the CRITICAL tier. The AI seeker eliminates the FPV pilot visual detection bottleneck that limits REDDI, SICA, and WASP: the thermal channel detects motor and battery heat signatures regardless of ambient lighting, and the YOLO classifier maintains confidence against small targets that human pilots cannot visually acquire at engagement range. The PN terminal guidance provides precision strike corrections that exceed manual FPV aim, particularly against small or agile targets where the pilot's reaction time is the limiting factor. Wolf's 175 mph sprint speed provides positive closure against all Group 1 sUAS, commercial drones, and FPV attack drones in any pursuit geometry. Against the hardest targets in the database (sub-250g consumer drones), Wolf's AI seeker still scores higher detection than FPV pilot visual because the thermal channel picks up motor heat that the human eye cannot resolve at distance.</div>`;

  // Full table
  html+=`<h2 style="color:#333;border-color:#333">ALL ${data.length} PLATFORMS</h2>`;
  html+=`<table><tr><th>PLATFORM</th><th>PROTO</th><th>SV-1</th><th>SUADS</th><th>NINJA</th><th>REDDI</th><th>SICA</th><th>WASP</th><th>WOLF</th><th>Δ S</th><th>Δ N</th></tr>`;
  [...data].sort((a,b)=>b.or-a.or).forEach(d=>{
    const ds=d.sRisk-d.or;const dn=d.nRisk-d.or;
    html+=`<tr><td>${d.n}</td><td>${d.proto}</td>`;
    html+=`<td class="sc" style="color:${rc(d.rt)}">${d.or}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.sTier)}">${d.sRisk}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.nTier)}">${d.nRisk}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.iRTier)}">${d.iREff}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.iSTier)}">${d.iSEff}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.iWTier)}">${d.iWEff}%</td>`;
    html+=`<td class="sc" style="color:${rc(d.iWolfTier)}">${d.iWolfEff}%</td>`;
    html+=`<td class="sc ${ds<0?"dn":"dp"}">${ds>0?"+":""}${ds}%</td>`;
    html+=`<td class="sc ${dn<0?"dn":"dp"}">${dn>0?"+":""}${dn}%</td></tr>`;
  });
  html+=`</table>`;

  html+=`<div class="ft"><span>Shaw AFB C-UAS · SV-1 vs RD-SUADS vs NINJA · ${data.length} platforms</span><span>SV-1: 40 RF/EA · 30 radars · 24 acoustic · 12 EO/IR · 2 C2</span></div>`;

  // ── CAPE Tab ──────────────────────────────────────────────────────────────
  html+=`<div class="pb"></div>`;
  const cape=generateCAPE(data);
  html+=`<h1>COST ASSESSMENT AND PROGRAM EVALUATION (CAPE)</h1>`;
  html+=`<div class="meta"><span>Shaw AFB, Sumter SC · 20th FW · Investment Analysis</span><span>${now} · UNCLASSIFIED // FOUO</span></div>`;

  // Baseline costs table
  html+=`<h2 style="color:#333;border-color:#333">BASELINE SYSTEM COSTS (1x INVESTMENT)</h2>`;
  html+=`<table><tr><th>SYSTEM</th><th>1x COST</th><th style="text-align:center">AVG EFFECTIVENESS</th><th style="text-align:center">COST PER 1% EFF</th><th>SCALING MODEL</th></tr>`;
  cape.systems.forEach(s=>{
    html+=`<tr><td style="font-weight:700;color:${s.color}">${s.label}</td>`;
    html+=`<td style="font-weight:700">$${s.baseCost.toLocaleString()}</td>`;
    html+=`<td class="sc" style="color:${s.eff[0]>=81?'#00cc66':s.eff[0]>=61?'#ff9900':'#ff0000'}">${s.eff[0]}%</td>`;
    html+=`<td class="sc">$${Math.round(s.baseCost/s.eff[0]).toLocaleString()}</td>`;
    html+=`<td>${s.scale}</td></tr>`;
  });
  html+=`</table>`;

  // Investment scaling table
  html+=`<h2 style="color:#333;border-color:#333">INVESTMENT SCALING (1x → 2x → 3x)</h2>`;
  html+=`<table><tr><th>SYSTEM</th><th style="text-align:center">1x COST</th><th style="text-align:center">1x EFF</th><th style="text-align:center">2x COST</th><th style="text-align:center">2x EFF</th><th style="text-align:center">Δ EFF</th><th style="text-align:center">3x COST</th><th style="text-align:center">3x EFF</th><th style="text-align:center">Δ EFF</th></tr>`;
  cape.systems.forEach(s=>{
    const d12=s.eff[1]-s.eff[0];const d23=s.eff[2]-s.eff[1];
    html+=`<tr><td style="font-weight:700;color:${s.color}">${s.label}</td>`;
    html+=`<td class="sc">$${s.baseCost.toLocaleString()}</td><td class="sc" style="color:${s.color}">${s.eff[0]}%</td>`;
    html+=`<td class="sc">$${(s.baseCost*2).toLocaleString()}</td><td class="sc" style="color:${s.color}">${s.eff[1]}%</td><td class="sc ${d12>0?'dp':'dn'}">+${d12}%</td>`;
    html+=`<td class="sc">$${(s.baseCost*3).toLocaleString()}</td><td class="sc" style="color:${s.color}">${s.eff[2]}%</td><td class="sc ${d23>0?'dp':'dn'}">+${d23}%</td></tr>`;
  });
  html+=`</table>`;

  // Optimal investment point
  html+=`<h2 style="color:#0a4;border-color:#0a4">OPTIMAL INVESTMENT POINT</h2>`;
  html+=`<div class="assess">${cape.assessment}</div>`;

  // Visual cost-effectiveness chart (HTML/CSS bars)
  html+=`<h2 style="color:#333;border-color:#333">COST vs EFFECTIVENESS AT EACH INVESTMENT LEVEL</h2>`;
  const maxCost=Math.max(...cape.systems.map(s=>s.baseCost*3));
  [1,2,3].forEach(lvl=>{
    html+=`<div style="margin:8px 0 12px"><div style="font-family:Oxanium,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;margin-bottom:4px">${lvl}x INVESTMENT</div>`;
    cape.systems.forEach(s=>{
      const cost=s.baseCost*lvl;const eff=s.eff[lvl-1];const pct=Math.round((cost/maxCost)*100);
      html+=`<div style="display:flex;align-items:center;gap:6px;margin:2px 0">`;
      html+=`<div style="width:80px;font-size:7px;font-weight:700;color:${s.color};text-align:right">${s.id.toUpperCase()}</div>`;
      html+=`<div style="flex:1;height:14px;background:#f0f0f0;border-radius:2px;position:relative;overflow:hidden">`;
      html+=`<div style="width:${pct}%;height:100%;background:${s.color}22;border-right:2px solid ${s.color}"></div>`;
      html+=`</div>`;
      html+=`<div style="width:80px;font-size:7px;font-weight:600">$${(cost/1000000).toFixed(2)}M</div>`;
      html+=`<div style="width:40px;font-size:8px;font-weight:700;color:${s.color}">${eff}%</div>`;
      html+=`</div>`;
    });
    html+=`</div>`;
  });

  // Optimal combo highlight
  html+=`<div style="background:#e8ffe8;border:2px solid #00cc66;border-radius:6px;padding:10px;margin:12px 0">`;
  html+=`<div style="font-family:Oxanium,sans-serif;font-size:11px;font-weight:700;color:#0a4;letter-spacing:2px;margin-bottom:4px">★ RECOMMENDED: ${cape.optimal.label}</div>`;
  html+=`<div style="font-size:9px;color:#222">Total: <strong>$${cape.optimal.cost.toLocaleString()}</strong> · Combined Effectiveness: <strong>${cape.optimal.eff}%</strong> · Cost per 1%: <strong>$${Math.round(cape.optimal.cost/cape.optimal.eff).toLocaleString()}</strong></div>`;
  html+=`<div style="font-size:8px;color:#444;margin-top:4px">${cape.optimal.rationale}</div>`;
  html+=`</div>`;

  html+=`<div class="ft"><span>Shaw AFB C-UAS · CAPE Analysis</span><span>Costs in FY26 USD · Effectiveness = avg detect+defeat rate across ${data.length} platforms</span></div></div></body></html>`;
  return html;
}

// ── CAPE Model ────────────────────────────────────────────────────────────────
export function generateCAPE(data){
  const total=data.length;
  const avgSV1=Math.round(data.reduce((a,d)=>a+d.or,0)/total);
  const avgNinja=Math.round(data.reduce((a,d)=>a+d.nRisk,0)/total);
  const avgSuads=Math.round(data.reduce((a,d)=>a+d.sRisk,0)/total);
  const avgReddi=Math.round(data.reduce((a,d)=>a+d.iREff,0)/total);
  const avgSica=Math.round(data.reduce((a,d)=>a+d.iSEff,0)/total);

  // Scaling model: diminishing returns at each investment multiplier
  // SV-1: adding sensors/EA fills coverage gaps → strong returns at 2x, diminishing at 3x
  // NINJA/SUADS: adding sites → limited returns (same fundamental capability gaps)
  // REDDI/SICA: adding units → sortie capacity scales, per-engagement stays similar
  function scale(base,r2,r3){return[base,Math.round(base+(100-base)*r2),Math.round(base+(100-base)*r2+(100-base-(100-base)*r2)*r3)];}

  const sv1Eff=scale(avgSV1,0.38,0.35);
  const ninjaEff=scale(avgNinja,0.09,0.06);
  const suadsEff=scale(avgSuads,0.12,0.08);
  const reddiEff=scale(avgReddi,0.04,0.03);
  const sicaEff=scale(avgSica,0.04,0.03);

  const systems=[
    {id:"sv1",label:"SV-1 Multi-Modal",color:"#00cc66",baseCost:1643758,eff:sv1Eff,scale:"Sensor nodes + EA nodes"},
    {id:"ninja",label:"NINJA Gen2",color:"#cc8800",baseCost:2000000,eff:ninjaEff,scale:"Additional sites"},
    {id:"suads",label:"RD-SUADS",color:"#2266cc",baseCost:2000000,eff:suadsEff,scale:"Additional sites"},
    {id:"reddi",label:"REDDI (50 units)",color:"#00cc88",baseCost:100000,eff:reddiEff,scale:"Interceptor units (50→100→150)"},
    {id:"sica",label:"SICA (50 units)",color:"#00aa77",baseCost:125000,eff:sicaEff,scale:"Interceptor units (50→100→150)"},
  ];

  // Optimal point: SV-1 2x + REDDI 1x + SICA 1x
  // This doubles the sensor/EA backbone and adds both interceptor types
  // Beyond this, adding 3x SV-1 costs another $1.64M for ~3% more effectiveness
  const optCost=1643758*2+100000+125000;
  // Combined effectiveness: SV-1 2x provides detection+EA, interceptors add physical defeat layer
  // For platforms where SV-1 EA fails, interceptors provide backup
  // Model: use SV-1 2x as base, boost by interceptor coverage on platforms where SV-1 EA<70%
  const sv1_2x=sv1Eff[1];
  const intcptBoost=Math.round((100-sv1_2x)*0.25);
  const combinedEff=Math.min(98,sv1_2x+intcptBoost);

  const optRationale=`SV-1 at 2x investment ($${(1643758*2).toLocaleString()}) adds sensor density that closes coverage gaps and pushes average effectiveness from ${sv1Eff[0]}% to ${sv1Eff[1]}%. Adding REDDI ($100,000) and SICA ($125,000) provides a physical defeat layer against the ${data.filter(d=>d.or<=70).length} platforms where SV-1 electronic attack scores below 70%. The combined investment of $${optCost.toLocaleString()} achieves ${combinedEff}% estimated combined effectiveness. A 3x SV-1 investment ($${(1643758*3).toLocaleString()}) would add only ${sv1Eff[2]-sv1Eff[1]}% more effectiveness for an additional $${(1643758).toLocaleString()}, placing that incremental dollar well into diminishing returns. NINJA at any investment level ($${(2000000).toLocaleString()} to $${(6000000).toLocaleString()}) never exceeds ${ninjaEff[2]}% due to its RF-only detection and protocol-dependent defeat. SUADS peaks at ${suadsEff[2]}% at 3x ($${(6000000).toLocaleString()}), still ${sv1Eff[0]-suadsEff[2]}% below SV-1 at 1x for nearly 4x the cost.`;

  return{systems,optimal:{label:"SV-1 (2x) + REDDI (1x) + SICA (1x)",cost:optCost,eff:combinedEff,rationale:optRationale}};
}
