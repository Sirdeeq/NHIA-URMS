import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Area, AreaChart
} from "recharts";
import { Search, TrendingUp, TrendingDown, Award, AlertTriangle, Star, X, ChevronRight, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { zonesApi, statesApi, type ZonalOffice, type StateOffice } from "@/lib/adminApi";

// ─── Types ────────────────────────────────────────────────────────────────────
type Year = "2023" | "2024" | "2025";

// ─── Zone colours ─────────────────────────────────────────────────────────────
const ZONE_COLORS: Record<string, string> = {
  "South West":   "#22c55e",
  "North West":   "#f59e0b",
  "South South":  "#3b82f6",
  "North Central":"#a78bfa",
  "North East":   "#f87171",
  "South East":   "#34d399",
};

const ZONES = Object.keys(ZONE_COLORS);

// ─── 2023 quarterly data ──────────────────────────────────────────────────────
const Q2023 = [
  { state:"Ondo",        zone:"South West",    gifQ1:111,  gifQ2:81,   gifQ3:177,  gifQ4:151,  igrQ1:2183000,   igrQ2:2942500,   igrQ3:5031500,   igrQ4:3170500,   bhcpfQ1:126,  bhcpfQ2:165,  bhcpfQ3:148,  bhcpfQ4:130,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:47,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Oyo",         zone:"South West",    gifQ1:0,    gifQ2:729,  gifQ3:792,  gifQ4:316,  igrQ1:11738000,  igrQ2:12781500,  igrQ3:24963500,  igrQ4:24066000,  bhcpfQ1:472,  bhcpfQ2:530,  bhcpfQ3:485,  bhcpfQ4:357,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:82,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Ogun",        zone:"South West",    gifQ1:205,  gifQ2:915,  gifQ3:322,  gifQ4:307,  igrQ1:4630500,   igrQ2:3468800,   igrQ3:10178500,  igrQ4:5440000,   bhcpfQ1:192,  bhcpfQ2:143,  bhcpfQ3:201,  bhcpfQ4:121,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:87,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Osun",        zone:"South West",    gifQ1:594,  gifQ2:561,  gifQ3:799,  gifQ4:867,  igrQ1:9488500,   igrQ2:8415000,   igrQ3:11985000,  igrQ4:13219500,  bhcpfQ1:197,  bhcpfQ2:159,  bhcpfQ3:228,  bhcpfQ4:157,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:36,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Ekiti",       zone:"South West",    gifQ1:76,   gifQ2:100,  gifQ3:156,  gifQ4:135,  igrQ1:1553000,   igrQ2:1761000,   igrQ3:3266000,   igrQ4:3503500,   bhcpfQ1:96,   bhcpfQ2:138,  bhcpfQ3:164,  bhcpfQ4:90,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:33,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Yaba",        zone:"South West",    gifQ1:344,  gifQ2:211,  gifQ3:470,  gifQ4:323,  igrQ1:6724500,   igrQ2:4850500,   igrQ3:8812500,   igrQ4:6683500,   bhcpfQ1:612,  bhcpfQ2:411,  bhcpfQ3:375,  bhcpfQ4:306,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:60,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Ikeja",       zone:"South West",    gifQ1:338,  gifQ2:257,  gifQ3:351,  gifQ4:311,  igrQ1:8063321,   igrQ2:6128000,   igrQ3:11244662,  igrQ4:6882000,   bhcpfQ1:151,  bhcpfQ2:169,  bhcpfQ3:86,   bhcpfQ4:74,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:61,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Kaduna",      zone:"North West",    gifQ1:318,  gifQ2:268,  gifQ3:690,  gifQ4:386,  igrQ1:6442500,   igrQ2:5916500,   igrQ3:12970000,  igrQ4:7997000,   bhcpfQ1:1005, bhcpfQ2:833,  bhcpfQ3:1100, bhcpfQ4:804,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:133,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Kebbi",       zone:"North West",    gifQ1:0,    gifQ2:146,  gifQ3:395,  gifQ4:258,  igrQ1:836500,    igrQ2:627500,    igrQ3:1789000,   igrQ4:2041000,   bhcpfQ1:183,  bhcpfQ2:105,  bhcpfQ3:98,   bhcpfQ4:122,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:80,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Sokoto",      zone:"North West",    gifQ1:57,   gifQ2:57,   gifQ3:77,   gifQ4:25,   igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:209,  bhcpfQ2:133,  bhcpfQ3:294,  bhcpfQ4:185,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,    cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Zamfara",     zone:"North West",    gifQ1:9,    gifQ2:27,   gifQ3:17,   gifQ4:6,    igrQ1:550500,    igrQ2:807000,    igrQ3:780500,    igrQ4:541500,    bhcpfQ1:231,  bhcpfQ2:110,  bhcpfQ3:271,  bhcpfQ4:233,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:47,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Jigawa",      zone:"North West",    gifQ1:0,    gifQ2:225,  gifQ3:171,  gifQ4:117,  igrQ1:913500,    igrQ2:832000,    igrQ3:1381500,   igrQ4:1076000,   bhcpfQ1:123,  bhcpfQ2:131,  bhcpfQ3:53,   bhcpfQ4:53,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:26,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Katsina",     zone:"North West",    gifQ1:12,   gifQ2:12,   gifQ3:76,   gifQ4:21,   igrQ1:1086000,   igrQ2:691000,    igrQ3:2298500,   igrQ4:1054000,   bhcpfQ1:444,  bhcpfQ2:122,  bhcpfQ3:148,  bhcpfQ4:165,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:62,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Kano",        zone:"North West",    gifQ1:264,  gifQ2:159,  gifQ3:228,  gifQ4:255,  igrQ1:6956000,   igrQ2:3891000,   igrQ3:5443500,   igrQ4:6490500,   bhcpfQ1:581,  bhcpfQ2:482,  bhcpfQ3:677,  bhcpfQ4:295,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:121,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Kwara",       zone:"North Central", gifQ1:84,   gifQ2:89,   gifQ3:153,  gifQ4:242,  igrQ1:2231500,   igrQ2:1846000,   igrQ3:3517000,   igrQ4:6533000,   bhcpfQ1:233,  bhcpfQ2:222,  bhcpfQ3:294,  bhcpfQ4:479,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:59,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Kogi",        zone:"North Central", gifQ1:67,   gifQ2:30,   gifQ3:89,   gifQ4:60,   igrQ1:1313500,   igrQ2:921500,    igrQ3:1815500,   igrQ4:1918500,   bhcpfQ1:364,  bhcpfQ2:258,  bhcpfQ3:310,  bhcpfQ4:217,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:59,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Niger",       zone:"North Central", gifQ1:24,   gifQ2:9,    gifQ3:73,   gifQ4:112,  igrQ1:1377000,   igrQ2:682500,    igrQ3:1756000,   igrQ4:2676500,   bhcpfQ1:430,  bhcpfQ2:379,  bhcpfQ3:412,  bhcpfQ4:295,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:22,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Anambra",     zone:"South East",    gifQ1:434,  gifQ2:87,   gifQ3:216,  gifQ4:86,   igrQ1:7173500,   igrQ2:3362500,   igrQ3:4829000,   igrQ4:3061000,   bhcpfQ1:207,  bhcpfQ2:195,  bhcpfQ3:98,   bhcpfQ4:72,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:130,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Ebonyi",      zone:"South East",    gifQ1:69,   gifQ2:102,  gifQ3:408,  gifQ4:191,  igrQ1:3328000,   igrQ2:3153500,   igrQ3:6136000,   igrQ4:6722000,   bhcpfQ1:167,  bhcpfQ2:133,  bhcpfQ3:156,  bhcpfQ4:146,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:38,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Imo",         zone:"South East",    gifQ1:352,  gifQ2:645,  gifQ3:511,  gifQ4:455,  igrQ1:4925000,   igrQ2:10946500,  igrQ3:9198500,   igrQ4:8001500,   bhcpfQ1:113,  bhcpfQ2:172,  bhcpfQ3:228,  bhcpfQ4:202,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:64,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Abia",        zone:"South East",    gifQ1:75,   gifQ2:71,   gifQ3:114,  gifQ4:120,  igrQ1:1599000,   igrQ2:1060000,   igrQ3:2587000,   igrQ4:2031500,   bhcpfQ1:127,  bhcpfQ2:150,  bhcpfQ3:186,  bhcpfQ4:78,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:57,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Enugu",       zone:"South East",    gifQ1:176,  gifQ2:193,  gifQ3:323,  gifQ4:294,  igrQ1:187730,    igrQ2:2957500,   igrQ3:6081500,   igrQ4:4978500,   bhcpfQ1:123,  bhcpfQ2:159,  bhcpfQ3:195,  bhcpfQ4:134,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:8408, cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Akwa-Ibom",   zone:"South South",   gifQ1:44,   gifQ2:29,   gifQ3:99,   gifQ4:71,   igrQ1:1633500,   igrQ2:1405500,   igrQ3:0,         igrQ4:1589000,   bhcpfQ1:78,   bhcpfQ2:131,  bhcpfQ3:38,   bhcpfQ4:24,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:84,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Bayelsa",     zone:"South South",   gifQ1:58,   gifQ2:28,   gifQ3:179,  gifQ4:158,  igrQ1:567000,    igrQ2:1429000,   igrQ3:3944000,   igrQ4:2816000,   bhcpfQ1:145,  bhcpfQ2:99,   bhcpfQ3:244,  bhcpfQ4:160,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:93,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Edo",         zone:"South South",   gifQ1:459,  gifQ2:272,  gifQ3:294,  gifQ4:489,  igrQ1:10677000,  igrQ2:8240442,   igrQ3:16793000,  igrQ4:7474000,   bhcpfQ1:578,  bhcpfQ2:516,  bhcpfQ3:16,   bhcpfQ4:363,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:179,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Cross River", zone:"South South",   gifQ1:115,  gifQ2:218,  gifQ3:34,   gifQ4:27,   igrQ1:735,       igrQ2:3715000,   igrQ3:1194000,   igrQ4:843000,    bhcpfQ1:176,  bhcpfQ2:190,  bhcpfQ3:268,  bhcpfQ4:217,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:34,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Delta",       zone:"South South",   gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,    cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Rivers",      zone:"South South",   gifQ1:242,  gifQ2:218,  gifQ3:357,  gifQ4:231,  igrQ1:5923000,   igrQ2:4755500,   igrQ3:8379500,   igrQ4:6238500,   bhcpfQ1:306,  bhcpfQ2:292,  bhcpfQ3:369,  bhcpfQ4:97,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:160,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Adamawa",     zone:"North East",    gifQ1:57,   gifQ2:56,   gifQ3:38,   gifQ4:200,  igrQ1:1583000,   igrQ2:1311500,   igrQ3:1046000,   igrQ4:1627000,   bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:99,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Borno",       zone:"North East",    gifQ1:106,  gifQ2:211,  gifQ3:198,  gifQ4:35,   igrQ1:800500,    igrQ2:843500,    igrQ3:884000,    igrQ4:1716000,   bhcpfQ1:202,  bhcpfQ2:256,  bhcpfQ3:301,  bhcpfQ4:343,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:84,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Taraba",      zone:"North East",    gifQ1:15,   gifQ2:13,   gifQ3:105,  gifQ4:27,   igrQ1:846000,    igrQ2:404000,    igrQ3:3312500,   igrQ4:1223500,   bhcpfQ1:194,  bhcpfQ2:138,  bhcpfQ3:191,  bhcpfQ4:149,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:164,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Yobe",        zone:"North East",    gifQ1:11,   gifQ2:21,   gifQ3:0,    gifQ4:35,   igrQ1:247500,    igrQ2:1382000,   igrQ3:0,         igrQ4:0,         bhcpfQ1:127,  bhcpfQ2:226,  bhcpfQ3:74,   bhcpfQ4:32,   cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:47,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Gombe",       zone:"North East",    gifQ1:47,   gifQ2:56,   gifQ3:22,   gifQ4:82,   igrQ1:2232500,   igrQ2:2362500,   igrQ3:1259680,   igrQ4:3640500,   bhcpfQ1:148,  bhcpfQ2:295,  bhcpfQ3:517,  bhcpfQ4:441,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:77,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Bauchi",      zone:"North East",    gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,    cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Abuja",       zone:"North Central", gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,    cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Nasarawa",    zone:"North Central", gifQ1:38,   gifQ2:23,   gifQ3:24,   gifQ4:156,  igrQ1:985500,    igrQ2:642000,    igrQ3:1012500,   igrQ4:1220500,   bhcpfQ1:131,  bhcpfQ2:148,  bhcpfQ3:335,  bhcpfQ4:273,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:35,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Plateau",     zone:"North Central", gifQ1:110,  gifQ2:189,  gifQ3:144,  gifQ4:264,  igrQ1:3154500,   igrQ2:4187500,   igrQ3:5036500,   igrQ4:6186500,   bhcpfQ1:770,  bhcpfQ2:585,  bhcpfQ3:663,  bhcpfQ4:503,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:118,  cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
  { state:"Benue",       zone:"North Central", gifQ1:489,  gifQ2:327,  gifQ3:692,  gifQ4:435,  igrQ1:2827000,   igrQ2:4650000,   igrQ3:6505000,   igrQ4:7387500,   bhcpfQ1:521,  bhcpfQ2:304,  bhcpfQ3:181,  bhcpfQ4:110,  cmpQ1:0,  cmpQ2:0,  cmpQ3:0,  cmpQ4:57,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0   },
];

// ─── 2024 quarterly data ──────────────────────────────────────────────────────
const Q2024 = [
  { state:"Ondo",        zone:"South West",    gifQ1:182,  gifQ2:535,  gifQ3:387,  gifQ4:166,  igrQ1:61500,     igrQ2:49000,     igrQ3:49000,     igrQ4:50350,     bhcpfQ1:162,  bhcpfQ2:152,  bhcpfQ3:165,  bhcpfQ4:106,  cmpQ1:51,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:551  },
  { state:"Oyo",         zone:"South West",    gifQ1:1196, gifQ2:702,  gifQ3:1275, gifQ4:864,  igrQ1:1460500,   igrQ2:590500,    igrQ3:749000,    igrQ4:533500,    bhcpfQ1:444,  bhcpfQ2:257,  bhcpfQ3:460,  bhcpfQ4:154,  cmpQ1:55,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:1015 },
  { state:"Ogun",        zone:"South West",    gifQ1:283,  gifQ2:404,  gifQ3:756,  gifQ4:198,  igrQ1:1285000,   igrQ2:520000,    igrQ3:1022000,   igrQ4:404000,    bhcpfQ1:538,  bhcpfQ2:351,  bhcpfQ3:527,  bhcpfQ4:181,  cmpQ1:201, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:678  },
  { state:"Osun",        zone:"South West",    gifQ1:983,  gifQ2:951,  gifQ3:3266, gifQ4:1489, igrQ1:15786500,  igrQ2:15449000,  igrQ3:49415500,  igrQ4:22741500,  bhcpfQ1:276,  bhcpfQ2:253,  bhcpfQ3:446,  bhcpfQ4:36,   cmpQ1:38,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:861  },
  { state:"Ekiti",       zone:"South West",    gifQ1:91,   gifQ2:268,  gifQ3:293,  gifQ4:220,  igrQ1:30500,     igrQ2:19500,     igrQ3:71500,     igrQ4:12050,     bhcpfQ1:188,  bhcpfQ2:146,  bhcpfQ3:382,  bhcpfQ4:55,   cmpQ1:42,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:527  },
  { state:"Yaba",        zone:"South West",    gifQ1:577,  gifQ2:367,  gifQ3:508,  gifQ4:283,  igrQ1:9435000,   igrQ2:6285000,   igrQ3:8460000,   igrQ4:5088000,   bhcpfQ1:830,  bhcpfQ2:924,  bhcpfQ3:832,  bhcpfQ4:695,  cmpQ1:55,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:1614 },
  { state:"Ikeja",       zone:"South West",    gifQ1:725,  gifQ2:470,  gifQ3:558,  gifQ4:404,  igrQ1:4130000,   igrQ2:1359500,   igrQ3:3922500,   igrQ4:1743000,   bhcpfQ1:252,  bhcpfQ2:240,  bhcpfQ3:304,  bhcpfQ4:130,  cmpQ1:78,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:1221 },
  { state:"Kaduna",      zone:"North West",    gifQ1:533,  gifQ2:539,  gifQ3:779,  gifQ4:281,  igrQ1:10279500,  igrQ2:10057500,  igrQ3:13099000,  igrQ4:6478000,   bhcpfQ1:969,  bhcpfQ2:525,  bhcpfQ3:428,  bhcpfQ4:284,  cmpQ1:187, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:95,   fsshipTotal:2206 },
  { state:"Kebbi",       zone:"North West",    gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,   cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:0    },
  { state:"Sokoto",      zone:"North West",    gifQ1:63,   gifQ2:72,   gifQ3:74,   gifQ4:30,   igrQ1:133000,    igrQ2:93500,     igrQ3:94000,     igrQ4:49000,     bhcpfQ1:266,  bhcpfQ2:187,  bhcpfQ3:188,  bhcpfQ4:98,   cmpQ1:928, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:44,  ffpTotal:198,  fsshipTotal:739  },
  { state:"Zamfara",     zone:"North West",    gifQ1:45,   gifQ2:9,    gifQ3:31,   gifQ4:26,   igrQ1:149000,    igrQ2:103000,    igrQ3:135000,    igrQ4:1524000,   bhcpfQ1:298,  bhcpfQ2:206,  bhcpfQ3:270,  bhcpfQ4:154,  cmpQ1:202, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:79,   fsshipTotal:928  },
  { state:"Jigawa",      zone:"North West",    gifQ1:18,   gifQ2:10,   gifQ3:13,   gifQ4:24,   igrQ1:674500,    igrQ2:300500,    igrQ3:27500,     igrQ4:63500,     bhcpfQ1:160,  bhcpfQ2:257,  bhcpfQ3:169,  bhcpfQ4:206,  cmpQ1:48,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:453  },
  { state:"Katsina",     zone:"North West",    gifQ1:81,   gifQ2:34,   gifQ3:38,   gifQ4:11,   igrQ1:8170000,   igrQ2:1602500,   igrQ3:1169000,   igrQ4:624750,    bhcpfQ1:209,  bhcpfQ2:171,  bhcpfQ3:204,  bhcpfQ4:202,  cmpQ1:25,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:108,  fsshipTotal:786  },
  { state:"Kano",        zone:"North West",    gifQ1:394,  gifQ2:260,  gifQ3:356,  gifQ4:167,  igrQ1:950000,    igrQ2:898000,    igrQ3:402000,    igrQ4:130500,    bhcpfQ1:479,  bhcpfQ2:603,  bhcpfQ3:528,  bhcpfQ4:484,  cmpQ1:94,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:670, ffpTotal:218,  fsshipTotal:1419 },
  { state:"Kwara",       zone:"North Central", gifQ1:297,  gifQ2:156,  gifQ3:286,  gifQ4:257,  igrQ1:239000,    igrQ2:143000,    igrQ3:2255000,   igrQ4:2598500,   bhcpfQ1:477,  bhcpfQ2:288,  bhcpfQ3:411,  bhcpfQ4:196,  cmpQ1:48,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:74,   fsshipTotal:1372 },
  { state:"Kogi",        zone:"North Central", gifQ1:58,   gifQ2:60,   gifQ3:72,   gifQ4:37,   igrQ1:476000,    igrQ2:200000,    igrQ3:325000,    igrQ4:196000,    bhcpfQ1:515,  bhcpfQ2:425,  bhcpfQ3:598,  bhcpfQ4:172,  cmpQ1:113, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:1072 },
  { state:"Niger",       zone:"North Central", gifQ1:18,   gifQ2:14,   gifQ3:24,   gifQ4:58,   igrQ1:1062000,   igrQ2:886500,    igrQ3:291500,    igrQ4:470000,    bhcpfQ1:297,  bhcpfQ2:113,  bhcpfQ3:210,  bhcpfQ4:126,  cmpQ1:34,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:746  },
  { state:"Anambra",     zone:"South East",    gifQ1:490,  gifQ2:151,  gifQ3:475,  gifQ4:72,   igrQ1:1823500,   igrQ2:617500,    igrQ3:255000,    igrQ4:44500,     bhcpfQ1:316,  bhcpfQ2:320,  bhcpfQ3:325,  bhcpfQ4:25,   cmpQ1:76,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:547  },
  { state:"Ebonyi",      zone:"South East",    gifQ1:280,  gifQ2:210,  gifQ3:154,  gifQ4:118,  igrQ1:125000,    igrQ2:709500,    igrQ3:309000,    igrQ4:60000,     bhcpfQ1:283,  bhcpfQ2:240,  bhcpfQ3:322,  bhcpfQ4:196,  cmpQ1:71,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:105,  fsshipTotal:580  },
  { state:"Imo",         zone:"South East",    gifQ1:663,  gifQ2:672,  gifQ3:924,  gifQ4:716,  igrQ1:2273000,   igrQ2:1201500,   igrQ3:942500,    igrQ4:808500,    bhcpfQ1:229,  bhcpfQ2:201,  bhcpfQ3:210,  bhcpfQ4:111,  cmpQ1:31,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:760  },
  { state:"Abia",        zone:"South East",    gifQ1:202,  gifQ2:261,  gifQ3:284,  gifQ4:101,  igrQ1:1725500,   igrQ2:806500,    igrQ3:707500,    igrQ4:76100,     bhcpfQ1:182,  bhcpfQ2:134,  bhcpfQ3:271,  bhcpfQ4:116,  cmpQ1:24,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:306  },
  { state:"Enugu",       zone:"South East",    gifQ1:401,  gifQ2:399,  gifQ3:738,  gifQ4:347,  igrQ1:1311500,   igrQ2:1814500,   igrQ3:956500,    igrQ4:153500,    bhcpfQ1:208,  bhcpfQ2:174,  bhcpfQ3:192,  bhcpfQ4:158,  cmpQ1:200, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:810  },
  { state:"Akwa-Ibom",   zone:"South South",   gifQ1:51,   gifQ2:29,   gifQ3:181,  gifQ4:52,   igrQ1:3019780,   igrQ2:3063260,   igrQ3:45000,     igrQ4:10500,     bhcpfQ1:190,  bhcpfQ2:106,  bhcpfQ3:158,  bhcpfQ4:205,  cmpQ1:61,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:46,  ffpTotal:57,   fsshipTotal:219  },
  { state:"Bayelsa",     zone:"South South",   gifQ1:146,  gifQ2:151,  gifQ3:198,  gifQ4:87,   igrQ1:434000,    igrQ2:1343000,   igrQ3:727500,    igrQ4:121500,    bhcpfQ1:228,  bhcpfQ2:203,  bhcpfQ3:195,  bhcpfQ4:145,  cmpQ1:94,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:514  },
  { state:"Edo",         zone:"South South",   gifQ1:479,  gifQ2:428,  gifQ3:793,  gifQ4:263,  igrQ1:5157200,   igrQ2:2774500,   igrQ3:10538454,  igrQ4:1453800,   bhcpfQ1:367,  bhcpfQ2:265,  bhcpfQ3:280,  bhcpfQ4:106,  cmpQ1:138, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:20,   fsshipTotal:1018 },
  { state:"Cross River", zone:"South South",   gifQ1:446,  gifQ2:61,   gifQ3:174,  gifQ4:32,   igrQ1:988000,    igrQ2:159500,    igrQ3:206500,    igrQ4:844508,    bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,   cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:899, ffpTotal:46,   fsshipTotal:820  },
  { state:"Delta",       zone:"South South",   gifQ1:80,   gifQ2:97,   gifQ3:103,  gifQ4:38,   igrQ1:239500,    igrQ2:482000,    igrQ3:290000,    igrQ4:695500,    bhcpfQ1:232,  bhcpfQ2:154,  bhcpfQ3:180,  bhcpfQ4:60,   cmpQ1:20,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:540  },
  { state:"Rivers",      zone:"South South",   gifQ1:290,  gifQ2:664,  gifQ3:815,  gifQ4:560,  igrQ1:4614800,   igrQ2:2512000,   igrQ3:1006500,   igrQ4:960850,    bhcpfQ1:782,  bhcpfQ2:763,  bhcpfQ3:625,  bhcpfQ4:274,  cmpQ1:229, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:529  },
  { state:"Adamawa",     zone:"North East",    gifQ1:59,   gifQ2:23,   gifQ3:179,  gifQ4:55,   igrQ1:130500,    igrQ2:51000,     igrQ3:174000,    igrQ4:107900,    bhcpfQ1:313,  bhcpfQ2:218,  bhcpfQ3:420,  bhcpfQ4:298,  cmpQ1:33,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:19,   fsshipTotal:577  },
  { state:"Borno",       zone:"North East",    gifQ1:159,  gifQ2:60,   gifQ3:20,   gifQ4:30,   igrQ1:3624000,   igrQ2:798500,    igrQ3:77500,     igrQ4:145000,    bhcpfQ1:404,  bhcpfQ2:325,  bhcpfQ3:521,  bhcpfQ4:369,  cmpQ1:85,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:690  },
  { state:"Taraba",      zone:"North East",    gifQ1:55,   gifQ2:22,   gifQ3:6,    gifQ4:18,   igrQ1:423000,    igrQ2:20500,     igrQ3:105000,    igrQ4:47900,     bhcpfQ1:250,  bhcpfQ2:115,  bhcpfQ3:192,  bhcpfQ4:116,  cmpQ1:117, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:240  },
  { state:"Yobe",        zone:"North East",    gifQ1:0,    gifQ2:31,   gifQ3:3,    gifQ4:0,    igrQ1:256500,    igrQ2:1369000,   igrQ3:915000,    igrQ4:1075750,   bhcpfQ1:120,  bhcpfQ2:118,  bhcpfQ3:101,  bhcpfQ4:120,  cmpQ1:41,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:25,   fsshipTotal:152  },
  { state:"Gombe",       zone:"North East",    gifQ1:31,   gifQ2:108,  gifQ3:84,   gifQ4:89,   igrQ1:1815000,   igrQ2:2760000,   igrQ3:2610000,   igrQ4:4598000,   bhcpfQ1:573,  bhcpfQ2:392,  bhcpfQ3:384,  bhcpfQ4:467,  cmpQ1:66,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:1079 },
  { state:"Bauchi",      zone:"North East",    gifQ1:18,   gifQ2:41,   gifQ3:47,   gifQ4:3,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:418,  bhcpfQ2:299,  bhcpfQ3:542,  bhcpfQ4:189,  cmpQ1:83,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:8,   ffpTotal:234,  fsshipTotal:717  },
  { state:"Abuja",       zone:"North Central", gifQ1:553,  gifQ2:393,  gifQ3:382,  gifQ4:332,  igrQ1:3358500,   igrQ2:2151500,   igrQ3:3292000,   igrQ4:313000,    bhcpfQ1:604,  bhcpfQ2:421,  bhcpfQ3:394,  bhcpfQ4:224,  cmpQ1:121, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:32,   fsshipTotal:1432 },
  { state:"Nasarawa",    zone:"North Central", gifQ1:1473, gifQ2:85,   gifQ3:82,   gifQ4:18,   igrQ1:23325500,  igrQ2:1520500,   igrQ3:3652500,   igrQ4:471000,    bhcpfQ1:378,  bhcpfQ2:260,  bhcpfQ3:433,  bhcpfQ4:170,  cmpQ1:26,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:869  },
  { state:"Plateau",     zone:"North Central", gifQ1:343,  gifQ2:225,  gifQ3:330,  gifQ4:87,   igrQ1:4087500,   igrQ2:1185000,   igrQ3:822500,    igrQ4:119500,    bhcpfQ1:196,  bhcpfQ2:117,  bhcpfQ3:158,  bhcpfQ4:70,   cmpQ1:73,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:148,  fsshipTotal:1799 },
  { state:"Benue",       zone:"North Central", gifQ1:566,  gifQ2:386,  gifQ3:611,  gifQ4:664,  igrQ1:4280000,   igrQ2:154500,    igrQ3:446500,    igrQ4:495500,    bhcpfQ1:181,  bhcpfQ2:217,  bhcpfQ3:141,  bhcpfQ4:266,  cmpQ1:76,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,   ffpTotal:0,    fsshipTotal:572  },
];

// ─── 2025 quarterly data ──────────────────────────────────────────────────────
const Q2025 = [
  { state:"Ondo",        zone:"South West",    gifQ1:43,   gifQ2:70,   gifQ3:178,  gifQ4:655,  igrQ1:111150,    igrQ2:97500,     igrQ3:129400,    igrQ4:179400,    bhcpfQ1:143,  bhcpfQ2:188,  bhcpfQ3:284,  bhcpfQ4:305,  cmpQ1:87,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:331,  ffpTotal:364,   fsshipTotal:603  },
  { state:"Oyo",         zone:"South West",    gifQ1:720,  gifQ2:609,  gifQ3:498,  gifQ4:1780, igrQ1:781000,    igrQ2:485000,    igrQ3:780500,    igrQ4:1770000,   bhcpfQ1:408,  bhcpfQ2:245,  bhcpfQ3:556,  bhcpfQ4:600,  cmpQ1:42,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:85,   ffpTotal:1780,  fsshipTotal:722  },
  { state:"Ogun",        zone:"South West",    gifQ1:152,  gifQ2:592,  gifQ3:641,  gifQ4:942,  igrQ1:687500,    igrQ2:3497350,   igrQ3:1041600,   igrQ4:1303450,   bhcpfQ1:348,  bhcpfQ2:334,  bhcpfQ3:331,  bhcpfQ4:307,  cmpQ1:150, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:336,  ffpTotal:2327,  fsshipTotal:542  },
  { state:"Osun",        zone:"South West",    gifQ1:522,  gifQ2:2093, gifQ3:1529, gifQ4:1914, igrQ1:42501500,  igrQ2:2056560,   igrQ3:81402822,  igrQ4:60702930,  bhcpfQ1:255,  bhcpfQ2:181,  bhcpfQ3:330,  bhcpfQ4:211,  cmpQ1:68,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:104,  ffpTotal:6058,  fsshipTotal:439  },
  { state:"Ekiti",       zone:"South West",    gifQ1:70,   gifQ2:133,  gifQ3:116,  gifQ4:268,  igrQ1:31500,     igrQ2:61000,     igrQ3:97000,     igrQ4:76000,     bhcpfQ1:146,  bhcpfQ2:104,  bhcpfQ3:142,  bhcpfQ4:262,  cmpQ1:67,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:690,  ffpTotal:587,   fsshipTotal:395  },
  { state:"Yaba",        zone:"South West",    gifQ1:238,  gifQ2:360,  gifQ3:431,  gifQ4:477,  igrQ1:11418000,  igrQ2:10143934,  igrQ3:15331588,  igrQ4:16759259,  bhcpfQ1:991,  bhcpfQ2:586,  bhcpfQ3:689,  bhcpfQ4:630,  cmpQ1:87,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:58,   ffpTotal:1506,  fsshipTotal:780  },
  { state:"Ikeja",       zone:"South West",    gifQ1:297,  gifQ2:254,  gifQ3:401,  gifQ4:426,  igrQ1:1324500,   igrQ2:907500,    igrQ3:729000,    igrQ4:257000,    bhcpfQ1:315,  bhcpfQ2:215,  bhcpfQ3:369,  bhcpfQ4:367,  cmpQ1:81,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:34,   ffpTotal:1378,  fsshipTotal:391  },
  { state:"Kaduna",      zone:"North West",    gifQ1:204,  gifQ2:223,  gifQ3:92,   gifQ4:489,  igrQ1:13286000,  igrQ2:11482168,  igrQ3:12933630,  igrQ4:7552982,   bhcpfQ1:167,  bhcpfQ2:83,   bhcpfQ3:227,  bhcpfQ4:190,  cmpQ1:83,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:776,  ffpTotal:1008,  fsshipTotal:1786 },
  { state:"Kebbi",       zone:"North West",    gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,   cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:2760, ffpTotal:0,     fsshipTotal:0    },
  { state:"Sokoto",      zone:"North West",    gifQ1:6,    gifQ2:55,   gifQ3:27,   gifQ4:32,   igrQ1:58500,     igrQ2:57500,     igrQ3:77000,     igrQ4:160000,    bhcpfQ1:50,   bhcpfQ2:43,   bhcpfQ3:69,   bhcpfQ4:80,   cmpQ1:1167,cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:198,  ffpTotal:120,   fsshipTotal:466  },
  { state:"Zamfara",     zone:"North West",    gifQ1:0,    gifQ2:3,    gifQ3:10,   gifQ4:48,   igrQ1:85700,     igrQ2:77350,     igrQ3:215750,    igrQ4:391850,    bhcpfQ1:86,   bhcpfQ2:92,   bhcpfQ3:142,  bhcpfQ4:243,  cmpQ1:232, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:1626, ffpTotal:61,    fsshipTotal:571  },
  { state:"Jigawa",      zone:"North West",    gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,   cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,    ffpTotal:0,     fsshipTotal:0    },
  { state:"Katsina",     zone:"North West",    gifQ1:7,    gifQ2:107,  gifQ3:3,    gifQ4:39,   igrQ1:1239500,   igrQ2:266000,    igrQ3:5041134,   igrQ4:1324642,   bhcpfQ1:143,  bhcpfQ2:101,  bhcpfQ3:146,  bhcpfQ4:184,  cmpQ1:22,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:1227, ffpTotal:156,   fsshipTotal:957  },
  { state:"Kano",        zone:"North West",    gifQ1:187,  gifQ2:215,  gifQ3:137,  gifQ4:611,  igrQ1:583500,    igrQ2:408500,    igrQ3:3437000,   igrQ4:4624500,   bhcpfQ1:258,  bhcpfQ2:212,  bhcpfQ3:560,  bhcpfQ4:731,  cmpQ1:61,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:4425, ffpTotal:1150,  fsshipTotal:1966 },
  { state:"Kwara",       zone:"North Central", gifQ1:334,  gifQ2:261,  gifQ3:187,  gifQ4:673,  igrQ1:276500,    igrQ2:81500,     igrQ3:745000,    igrQ4:988000,    bhcpfQ1:214,  bhcpfQ2:220,  bhcpfQ3:299,  bhcpfQ4:319,  cmpQ1:36,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:302,  ffpTotal:1455,  fsshipTotal:915  },
  { state:"Kogi",        zone:"North Central", gifQ1:31,   gifQ2:60,   gifQ3:27,   gifQ4:57,   igrQ1:74100,     igrQ2:218700,    igrQ3:816550,    igrQ4:875000,    bhcpfQ1:546,  bhcpfQ2:297,  bhcpfQ3:216,  bhcpfQ4:192,  cmpQ1:53,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,    ffpTotal:0,     fsshipTotal:0    },
  { state:"Niger",       zone:"North Central", gifQ1:0,    gifQ2:29,   gifQ3:90,   gifQ4:34,   igrQ1:143500,    igrQ2:75000,     igrQ3:207000,    igrQ4:129000,    bhcpfQ1:113,  bhcpfQ2:209,  bhcpfQ3:181,  bhcpfQ4:217,  cmpQ1:43,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,    ffpTotal:153,   fsshipTotal:567  },
  { state:"Anambra",     zone:"South East",    gifQ1:56,   gifQ2:79,   gifQ3:632,  gifQ4:327,  igrQ1:552000,    igrQ2:151000,    igrQ3:903000,    igrQ4:479000,    bhcpfQ1:259,  bhcpfQ2:133,  bhcpfQ3:157,  bhcpfQ4:248,  cmpQ1:115, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:681,  ffpTotal:1094,  fsshipTotal:339  },
  { state:"Ebonyi",      zone:"South East",    gifQ1:51,   gifQ2:67,   gifQ3:235,  gifQ4:17468,igrQ1:441000,    igrQ2:63500,     igrQ3:494245,    igrQ4:466191,    bhcpfQ1:241,  bhcpfQ2:249,  bhcpfQ3:270,  bhcpfQ4:255,  cmpQ1:83,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:3417, ffpTotal:17821, fsshipTotal:628  },
  { state:"Imo",         zone:"South East",    gifQ1:318,  gifQ2:399,  gifQ3:565,  gifQ4:631,  igrQ1:954500,    igrQ2:597500,    igrQ3:924000,    igrQ4:1344000,   bhcpfQ1:147,  bhcpfQ2:134,  bhcpfQ3:151,  bhcpfQ4:138,  cmpQ1:70,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:312,  ffpTotal:1913,  fsshipTotal:450  },
  { state:"Abia",        zone:"South East",    gifQ1:99,   gifQ2:89,   gifQ3:165,  gifQ4:199,  igrQ1:57550,     igrQ2:343500,    igrQ3:269200,    igrQ4:129600,    bhcpfQ1:209,  bhcpfQ2:235,  bhcpfQ3:149,  bhcpfQ4:163,  cmpQ1:65,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:213,  ffpTotal:552,   fsshipTotal:425  },
  { state:"Enugu",       zone:"South East",    gifQ1:297,  gifQ2:236,  gifQ3:349,  gifQ4:877,  igrQ1:1678750,   igrQ2:1569800,   igrQ3:1886000,   igrQ4:1657150,   bhcpfQ1:201,  bhcpfQ2:178,  bhcpfQ3:225,  bhcpfQ4:385,  cmpQ1:224, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:962,  ffpTotal:1759,  fsshipTotal:1117 },
  { state:"Akwa-Ibom",   zone:"South South",   gifQ1:20,   gifQ2:14,   gifQ3:29,   gifQ4:56,   igrQ1:128800,    igrQ2:190850,    igrQ3:248050,    igrQ4:446650,    bhcpfQ1:174,  bhcpfQ2:206,  bhcpfQ3:210,  bhcpfQ4:122,  cmpQ1:43,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:1560, ffpTotal:119,   fsshipTotal:432  },
  { state:"Bayelsa",     zone:"South South",   gifQ1:180,  gifQ2:226,  gifQ3:158,  gifQ4:173,  igrQ1:1105050,   igrQ2:919660,    igrQ3:630134,    igrQ4:553024,    bhcpfQ1:174,  bhcpfQ2:147,  bhcpfQ3:102,  bhcpfQ4:164,  cmpQ1:52,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:248,  ffpTotal:737,   fsshipTotal:341  },
  { state:"Edo",         zone:"South South",   gifQ1:295,  gifQ2:3204, gifQ3:315,  gifQ4:579,  igrQ1:1209250,   igrQ2:490050,    igrQ3:5197352,   igrQ4:32791000,  bhcpfQ1:144,  bhcpfQ2:187,  bhcpfQ3:256,  bhcpfQ4:148,  cmpQ1:88,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:415,  ffpTotal:4393,  fsshipTotal:496  },
  { state:"Cross River", zone:"South South",   gifQ1:61,   gifQ2:59,   gifQ3:56,   gifQ4:35,   igrQ1:415950,    igrQ2:1166300,   igrQ3:357900,    igrQ4:190550,    bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:23,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:899,  ffpTotal:211,   fsshipTotal:536  },
  { state:"Delta",       zone:"South South",   gifQ1:190,  gifQ2:211,  gifQ3:68,   gifQ4:49,   igrQ1:939000,    igrQ2:374950,    igrQ3:292000,    igrQ4:344700,    bhcpfQ1:279,  bhcpfQ2:108,  bhcpfQ3:92,   bhcpfQ4:94,   cmpQ1:34,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:83,   ffpTotal:518,   fsshipTotal:228  },
  { state:"Rivers",      zone:"South South",   gifQ1:216,  gifQ2:319,  gifQ3:547,  gifQ4:908,  igrQ1:1288650,   igrQ2:4104500,   igrQ3:1972350,   igrQ4:2028000,   bhcpfQ1:202,  bhcpfQ2:299,  bhcpfQ3:415,  bhcpfQ4:408,  cmpQ1:144, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:196,  ffpTotal:1990,  fsshipTotal:532  },
  { state:"Adamawa",     zone:"North East",    gifQ1:0,    gifQ2:27,   gifQ3:53,   gifQ4:88,   igrQ1:530500,    igrQ2:70850,     igrQ3:364950,    igrQ4:337900,    bhcpfQ1:350,  bhcpfQ2:390,  bhcpfQ3:304,  bhcpfQ4:193,  cmpQ1:33,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:928,  ffpTotal:168,   fsshipTotal:670  },
  { state:"Borno",       zone:"North East",    gifQ1:6,    gifQ2:9,    gifQ3:23,   gifQ4:109,  igrQ1:159000,    igrQ2:200000,    igrQ3:709000,    igrQ4:54000,     bhcpfQ1:452,  bhcpfQ2:98,   bhcpfQ3:124,  bhcpfQ4:79,   cmpQ1:36,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:73,   ffpTotal:147,   fsshipTotal:266  },
  { state:"Taraba",      zone:"North East",    gifQ1:0,    gifQ2:0,    gifQ3:0,    gifQ4:0,    igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:0,    bhcpfQ2:0,    bhcpfQ3:0,    bhcpfQ4:0,    cmpQ1:0,   cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:0,    ffpTotal:0,     fsshipTotal:0    },
  { state:"Yobe",        zone:"North East",    gifQ1:57,   gifQ2:0,    gifQ3:2,    gifQ4:13,   igrQ1:293000,    igrQ2:11050,     igrQ3:333100,    igrQ4:998900,    bhcpfQ1:96,   bhcpfQ2:123,  bhcpfQ3:126,  bhcpfQ4:80,   cmpQ1:24,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:664,  ffpTotal:72,    fsshipTotal:178  },
  { state:"Gombe",       zone:"North East",    gifQ1:36,   gifQ2:22,   gifQ3:48,   gifQ4:59,   igrQ1:3198800,   igrQ2:2583920,   igrQ3:2507184,   igrQ4:7360546,   bhcpfQ1:358,  bhcpfQ2:365,  bhcpfQ3:298,  bhcpfQ4:300,  cmpQ1:51,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:2335, ffpTotal:165,   fsshipTotal:853  },
  { state:"Bauchi",      zone:"North East",    gifQ1:42,   gifQ2:13,   gifQ3:21,   gifQ4:123,  igrQ1:0,         igrQ2:0,         igrQ3:0,         igrQ4:0,         bhcpfQ1:460,  bhcpfQ2:344,  bhcpfQ3:304,  bhcpfQ4:227,  cmpQ1:126, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:4538, ffpTotal:199,   fsshipTotal:729  },
  { state:"Abuja",       zone:"North Central", gifQ1:393,  gifQ2:382,  gifQ3:332,  gifQ4:553,  igrQ1:729500,    igrQ2:709000,    igrQ3:1491900,   igrQ4:929000,    bhcpfQ1:604,  bhcpfQ2:421,  bhcpfQ3:394,  bhcpfQ4:224,  cmpQ1:94,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:1893, ffpTotal:1660,  fsshipTotal:1432 },
  { state:"Nasarawa",    zone:"North Central", gifQ1:13,   gifQ2:441,  gifQ3:26,   gifQ4:340,  igrQ1:8039500,   igrQ2:973296,    igrQ3:8409958,   igrQ4:1787284,   bhcpfQ1:581,  bhcpfQ2:362,  bhcpfQ3:400,  bhcpfQ4:177,  cmpQ1:32,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:570,  ffpTotal:820,   fsshipTotal:539  },
  { state:"Plateau",     zone:"North Central", gifQ1:87,   gifQ2:144,  gifQ3:98,   gifQ4:283,  igrQ1:545000,    igrQ2:109000,    igrQ3:492000,    igrQ4:670000,    bhcpfQ1:140,  bhcpfQ2:192,  bhcpfQ3:144,  bhcpfQ4:307,  cmpQ1:35,  cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:211,  ffpTotal:612,   fsshipTotal:898  },
  { state:"Benue",       zone:"North Central", gifQ1:236,  gifQ2:229,  gifQ3:475,  gifQ4:790,  igrQ1:135850,    igrQ2:76050,     igrQ3:644800,    igrQ4:319000,    bhcpfQ1:195,  bhcpfQ2:256,  bhcpfQ3:200,  bhcpfQ4:385,  cmpQ1:115, cmpQ2:0,  cmpQ3:0,  cmpQ4:0,   cemoncTotal:336,  ffpTotal:1730,  fsshipTotal:753  },
];

// ─── Year data map ────────────────────────────────────────────────────────────
const YEAR_DATA: Record<Year, typeof Q2023> = { "2023": Q2023, "2024": Q2024, "2025": Q2025 };

// ─── Compute derived data from raw quarterly rows ─────────────────────────────
function computeData(rows: typeof Q2023) {
  const totalGIF  = rows.reduce((s,r) => s + r.gifQ1+r.gifQ2+r.gifQ3+r.gifQ4, 0);
  const totalIGR  = rows.reduce((s,r) => s + r.igrQ1+r.igrQ2+r.igrQ3+r.igrQ4, 0);
  const totalBHCPF= rows.reduce((s,r) => s + r.bhcpfQ1+r.bhcpfQ2+r.bhcpfQ3+r.bhcpfQ4, 0);
  const totalCMP  = rows.reduce((s,r) => s + r.cmpQ1+r.cmpQ2+r.cmpQ3+r.cmpQ4, 0);
  const totalCEM  = rows.reduce((s,r) => s + r.cemoncTotal, 0);
  const totalFFP  = rows.reduce((s,r) => s + r.ffpTotal, 0);
  const totalFSSHIP = rows.reduce((s,r) => s + r.fsshipTotal, 0);

  const stateTable = rows.map(r => {
    const gif = r.gifQ1+r.gifQ2+r.gifQ3+r.gifQ4;
    const igr = (r.igrQ1+r.igrQ2+r.igrQ3+r.igrQ4)/1000000;
    const bhcpf = r.bhcpfQ1+r.bhcpfQ2+r.bhcpfQ3+r.bhcpfQ4;
    const cmp = r.cmpQ1+r.cmpQ2+r.cmpQ3+r.cmpQ4;
    const res = cmp === 0 ? 100 : cmp > 500 ? 36 : cmp > 150 ? 72 : cmp > 80 ? 82 : 91;
    return { state:r.state, zone:r.zone, gifship:gif, igr:Math.round(igr*100)/100,
      bhcpf, complaints:cmp, resolution:res, cemonc:r.cemoncTotal, ffp:r.ffpTotal,
      fsship:r.fsshipTotal, status: gif===0&&igr===0 ? "Pending" : "Active" };
  });

  const topIGR = [...stateTable].filter(s=>s.igr>0).sort((a,b)=>b.igr-a.igr).slice(0,12)
    .map(s=>({ state:s.state, zone:s.zone, igr:s.igr }));

  const zoneIGR: Record<string,number> = {};
  stateTable.forEach(s => { zoneIGR[s.zone] = (zoneIGR[s.zone]||0) + s.igr; });
  const totalZoneIGR = Object.values(zoneIGR).reduce((a,b)=>a+b,0);
  const donut = Object.entries(zoneIGR).map(([name,val]) => ({
    name, value: Math.round((val/totalZoneIGR)*1000)/10, color: ZONE_COLORS[name]
  })).sort((a,b)=>b.value-a.value);

  const zoneGIF: Record<string,number> = {};
  stateTable.forEach(s => { zoneGIF[s.zone] = (zoneGIF[s.zone]||0) + s.gifship; });
  const zoneCMP: Record<string,number> = {};
  stateTable.forEach(s => { zoneCMP[s.zone] = (zoneCMP[s.zone]||0) + s.complaints; });
  const zoneCards = Object.keys(ZONE_COLORS).map(zone => {
    const gif = zoneGIF[zone]||0;
    const igr = stateTable.filter(s=>s.zone===zone).reduce((a,s)=>a+s.igr,0);
    const cmp = zoneCMP[zone]||0;
    const res = cmp===0 ? 100 : Math.min(95, Math.round(80 + (gif/500)));
    return { zone, gifship:gif, gifshipMax:Math.round(gif*1.4)||1, igr:`₦${igr.toFixed(1)}M`, resolution:Math.min(res,99) };
  });

  const complaintBars = [...stateTable].sort((a,b)=>b.complaints-a.complaints).slice(0,10)
    .map(s=>({ state:s.state, complaints:s.complaints, resolution:s.resolution,
      color: s.resolution>=90?"#22c55e":s.resolution>=70?"#f59e0b":"#f87171" }));

  return { totalGIF, totalIGR, totalBHCPF, totalCMP, totalCEM, totalFFP, totalFSSHIP,
    stateTable, topIGR, donut, zoneCards, complaintBars };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(0) + "K";
  return n.toString();
}
function resColor(r: number) {
  if (r >= 90) return "#22c55e";
  if (r >= 70) return "#f59e0b";
  return "#f87171";
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          fill={`url(#sg-${color.replace("#","")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Donut centre label ───────────────────────────────────────────────────────
function DonutCenter({ cx, cy, total }: { cx?: number; cy?: number; total: string }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-10" fontSize="12" fontWeight="800" fill="#0f1f18">{total}</tspan>
      <tspan x={cx} dy="18"  fontSize="10" fill="#5a7a6a">Total IGR</tspan>
    </text>
  );
}

// ─── KPI Drill Config ─────────────────────────────────────────────────────────
// Quarterly metrics: GIFSHIP, IGR, BHCPF, Complaints
const KPI_QUARTERLY_CONFIG: Record<string, {
  qFields: [string,string,string,string];
  label: string;
  fmt: (v: number) => string;
  color: string;
}> = {
  "GIFSHIP Enrolments": { qFields:["gifQ1","gifQ2","gifQ3","gifQ4"], label:"GIFSHIP Enrolments", fmt:(v)=>v.toLocaleString(), color:"#22c55e" },
  "Total IGR (₦)":      { qFields:["igrQ1","igrQ2","igrQ3","igrQ4"], label:"IGR (₦)",            fmt:(v)=>`₦${(v/1000000).toFixed(2)}M`, color:"#3b82f6" },
  "BHCPF Lives":        { qFields:["bhcpfQ1","bhcpfQ2","bhcpfQ3","bhcpfQ4"], label:"BHCPF Lives", fmt:(v)=>v.toLocaleString(), color:"#a78bfa" },
  "Total Complaints":   { qFields:["cmpQ1","cmpQ2","cmpQ3","cmpQ4"], label:"Complaints",          fmt:(v)=>v.toLocaleString(), color:"#f59e0b" },
};

// Annual-only metrics: CEmONC, FFP, FSSHIP
const KPI_ANNUAL_CONFIG: Record<string, {
  field: string;
  label: string;
  fmt: (v: number) => string;
  color: string;
}> = {
  "CEmONC Beneficiaries": { field:"cemonc",  label:"CEmONC Beneficiaries", fmt:(v)=>v.toLocaleString(), color:"#3b82f6" },
  "FFP Beneficiaries":    { field:"ffp",     label:"FFP Beneficiaries",    fmt:(v)=>v.toLocaleString(), color:"#a78bfa" },
  "FSSHIP Enrolments":    { field:"fsship",  label:"FSSHIP Enrolments",    fmt:(v)=>v.toLocaleString(), color:"#f97316" },
};

// Combined lookup for "is this KPI drillable?"
const ALL_DRILL_LABELS = new Set([
  ...Object.keys(KPI_QUARTERLY_CONFIG),
  ...Object.keys(KPI_ANNUAL_CONFIG),
]);

// ─── Pill tabs helper ─────────────────────────────────────────────────────────
function PillTabs({ options, active, onChange }: { options: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#e8f5ee] border border-[#d4e8dc] w-fit flex-wrap">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            active === o ? "bg-[#145c3f] text-white shadow-sm" : "text-[#5a7a6a] hover:text-[#145c3f]"
          }`}
        >{o}</button>
      ))}
    </div>
  );
}

// ─── Reusable Modal Shell ─────────────────────────────────────────────────────
function ModalShell({ title, subtitle, onClose, onBack, children }: {
  title: string; subtitle?: React.ReactNode; onClose: () => void;
  onBack?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.96, y:16 }} transition={{ duration:0.2 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#d4e8dc] flex flex-col"
        style={{ maxHeight:"88vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4e8dc] bg-[#f0fdf7] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#d4e8dc] transition-colors text-[#145c3f]">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="text-sm font-black text-slate-900">{title}</p>
              {subtitle && <div className="mt-0.5">{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#d4e8dc] transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-5">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Reusable State Table with Zone+State filter ──────────────────────────────
type StateRow = { state: string; zone: string; gifship: number; igr: number; bhcpf: number;
  complaints: number; resolution: number; cemonc: number; ffp: number; fsship: number; status: string; };

function StateFilterTable({ rows, year, highlightField, onStateClick, initialZone }: {
  rows: StateRow[]; year: string; highlightField?: keyof StateRow;
  onStateClick?: (s: StateRow) => void;
  initialZone?: string;
}) {
  const [zoneFilter, setZoneFilter] = React.useState(initialZone ?? "All");
  const [stateSearch, setStateSearch] = React.useState("");

  // Sync when parent changes the initialZone (API zone selection)
  React.useEffect(() => {
    setZoneFilter(initialZone ?? "All");
  }, [initialZone]);

  const filtered = React.useMemo(() => {
    let t = [...rows];
    if (zoneFilter !== "All") t = t.filter(r => r.zone === zoneFilter);
    if (stateSearch) t = t.filter(r => r.state.toLowerCase().includes(stateSearch.toLowerCase()));
    return t;
  }, [rows, zoneFilter, stateSearch]);

  return (
    <div className="rounded-2xl border border-[#d4e8dc] overflow-hidden">
      <div className="bg-[#f0fdf7] border-b border-[#d4e8dc] px-3 py-2.5 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 flex-wrap">
          {["All", ...ZONES].map(z => (
            <button key={z} onClick={() => setZoneFilter(z)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                zoneFilter === z
                  ? "bg-[#145c3f] border-[#145c3f] text-white"
                  : "border-[#c8e6d8] text-[#5a7a6a] hover:border-[#25a872] hover:text-[#145c3f]"
              }`}
              style={zoneFilter !== z && z !== "All" ? { borderColor: ZONE_COLORS[z]+"60", color: ZONE_COLORS[z] } : {}}
            >{z === "All" ? "All Zones" : z.split(" ")[0] + " " + z.split(" ")[1]}</button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5a7a6a]" />
          <input value={stateSearch} onChange={e => setStateSearch(e.target.value)} placeholder="Filter state..."
            className="pl-6 pr-2 h-7 w-32 rounded-lg bg-white border border-[#d4e8dc] text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#145c3f] transition-all" />
        </div>
        <span className="text-[10px] text-[#5a7a6a]">{filtered.length} states</span>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight:"320px" }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#f0fdf7] border-b border-[#d4e8dc] z-10">
            <tr>
              {["#","State","Zone","GIFSHIP","BHCPF","IGR (₦M)","Complaints","Resolution","CEmONC","FFP","FSSHIP","Status"].map(h => (
                <th key={h} className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.state}
                onClick={() => onStateClick?.(row)}
                className={`border-b border-[#e8f5ee] transition-colors hover:bg-[#f0fdf7] ${onStateClick ? "cursor-pointer" : ""}`}>
                <td className="px-2.5 py-2 text-[#5a7a6a] font-bold">{i+1}</td>
                <td className={`px-2.5 py-2 font-bold whitespace-nowrap ${highlightField === "igr" || highlightField === "gifship" ? "text-[#145c3f]" : "text-slate-800"}`}>
                  {row.state}
                  {onStateClick && <ChevronRight className="w-3 h-3 inline ml-1 text-[#25a872] opacity-60" />}
                </td>
                <td className="px-2.5 py-2">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor:ZONE_COLORS[row.zone]+"18", color:ZONE_COLORS[row.zone] }}>
                    {row.zone.split(" ")[0]}
                  </span>
                </td>
                <td className={`px-2.5 py-2 font-semibold ${highlightField==="gifship"?"font-black text-[#145c3f]":"text-slate-700"}`}>{fmt(row.gifship)}</td>
                <td className="px-2.5 py-2 text-slate-600">{fmt(row.bhcpf)}</td>
                <td className={`px-2.5 py-2 font-bold ${highlightField==="igr"?"text-[#145c3f]":row.igr>50?"text-green-700":row.igr>15?"text-amber-600":"text-slate-500"}`}>₦{row.igr}M</td>
                <td className={`px-2.5 py-2 ${highlightField==="complaints"?"font-black text-[#145c3f]":"text-slate-500"}`}>{row.complaints.toLocaleString()}</td>
                <td className="px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${row.resolution}%`, backgroundColor:resColor(row.resolution) }} />
                    </div>
                    <span className="font-bold text-[10px]" style={{ color:resColor(row.resolution) }}>{row.resolution}%</span>
                  </div>
                </td>
                <td className="px-2.5 py-2 text-slate-500">{row.cemonc.toLocaleString()}</td>
                <td className="px-2.5 py-2 text-slate-500">{fmt(row.ffp)}</td>
                <td className="px-2.5 py-2 text-slate-500">{fmt(row.fsship)}</td>
                <td className="px-2.5 py-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    row.status==="Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── StateDetailModal — full metrics for a single state ──────────────────────
function StateDetailModal({ state, year, stateTable, onClose }: {
  state: string; year: string;
  stateTable: StateRow[];
  onClose: () => void;
}) {
  const row = stateTable.find(r => r.state === state);
  if (!row) return null;
  const col = ZONE_COLORS[row.zone] || "#22c55e";
  const metrics = [
    { label:"GIFSHIP Enrolments", value: row.gifship.toLocaleString(), color:"#22c55e" },
    { label:"BHCPF Lives",        value: row.bhcpf.toLocaleString(),   color:"#a78bfa" },
    { label:"IGR (₦M)",           value: `₦${row.igr}M`,              color:"#3b82f6" },
    { label:"Complaints",         value: row.complaints.toLocaleString(), color:"#f59e0b" },
    { label:"Resolution Rate",    value: `${row.resolution}%`,         color: resColor(row.resolution) },
    { label:"CEmONC",             value: row.cemonc.toLocaleString(),  color:"#3b82f6" },
    { label:"FFP",                value: row.ffp.toLocaleString(),     color:"#a78bfa" },
    { label:"FSSHIP",             value: row.fsship.toLocaleString(),  color:"#f97316" },
  ];
  return (
    <ModalShell title={`${state} — ${year} Performance`}
      subtitle={<span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor:col+"18", color:col }}>{row.zone}</span>}
      onClose={onClose}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="p-3 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a] mb-1">{m.label}</p>
            <p className="text-lg font-black" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-2xl border border-[#d4e8dc] bg-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a] mb-3">KPI Progress Bars</p>
        <div className="space-y-3">
          {[
            { label:"GIFSHIP", val: row.gifship, max: 20000, color:"#22c55e" },
            { label:"BHCPF",   val: row.bhcpf,   max: 5000,  color:"#a78bfa" },
            { label:"IGR",     val: row.igr,      max: 200,   color:"#3b82f6" },
            { label:"Resolution", val: row.resolution, max: 100, color: resColor(row.resolution) },
          ].map(b => (
            <div key={b.label}>
              <div className="flex justify-between text-[10px] text-[#5a7a6a] mb-1">
                <span className="font-semibold">{b.label}</span>
                <span className="font-bold text-slate-700">{b.label==="IGR"?`₦${b.val}M`:b.label==="Resolution"?`${b.val}%`:b.val.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-[#e8f5ee] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width:`${Math.min((b.val/b.max)*100,100)}%`, backgroundColor:b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
        <span className="text-xs font-bold text-slate-700">Status</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${row.status==="Active"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{row.status}</span>
      </div>
    </ModalShell>
  );
}

// ─── QuarterlyDrillModal ──────────────────────────────────────────────────────
// Flow: Quarterly → Zonal → State
type QDrillLevel = "quarterly" | "zonal" | "state";

function QuarterlyDrillModal({ kpiLabel, data, onClose }: { kpiLabel: string; data: typeof Q2023; onClose: () => void }) {
  const [level, setLevel]       = React.useState<QDrillLevel>("quarterly");
  const [activeQ, setActiveQ]   = React.useState("Q1");
  const [activeZone, setActiveZone] = React.useState(ZONES[0]);

  const cfg = KPI_QUARTERLY_CONFIG[kpiLabel];
  if (!cfg) return null;

  const isIGR = kpiLabel === "Total IGR (₦)";
  const QUARTERS = ["Q1","Q2","Q3","Q4"];

  // ── Quarterly totals ──
  const quarterlyTotals = QUARTERS.map((q, qi) => {
    const field = cfg.qFields[qi] as keyof typeof data[0];
    const total = data.reduce((s, r) => s + (Number(r[field]) || 0), 0);
    return { quarter: q, value: total };
  });
  const annualTotal = quarterlyTotals.reduce((s, q) => s + q.value, 0);

  // ── Zonal totals for active quarter ──
  const getZonalBreakdown = (q: string) => {
    const qi = QUARTERS.indexOf(q);
    const field = cfg.qFields[qi] as keyof typeof data[0];
    const zoneMap: Record<string, number> = {};
    data.forEach(r => {
      zoneMap[r.zone] = (zoneMap[r.zone] || 0) + (Number(r[field]) || 0);
    });
    return ZONES.map(zone => ({ zone, value: zoneMap[zone] || 0 }))
      .sort((a, b) => b.value - a.value);
  };

  // ── State breakdown for active quarter + zone ──
  const getStateBreakdown = (q: string, zone: string) => {
    const qi = QUARTERS.indexOf(q);
    const field = cfg.qFields[qi] as keyof typeof data[0];
    return data
      .filter(r => r.zone === zone)
      .map(r => ({
        state: r.state, zone: r.zone,
        value: Number(r[field]) || 0,
        q1: Number(r[cfg.qFields[0] as keyof typeof data[0]]) || 0,
        q2: Number(r[cfg.qFields[1] as keyof typeof data[0]]) || 0,
        q3: Number(r[cfg.qFields[2] as keyof typeof data[0]]) || 0,
        q4: Number(r[cfg.qFields[3] as keyof typeof data[0]]) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const zonalBreakdown = getZonalBreakdown(activeQ);
  const stateBreakdown = getStateBreakdown(activeQ, activeZone);
  const qTotal = zonalBreakdown.reduce((s, z) => s + z.value, 0);
  const stateMaxVal = stateBreakdown[0]?.value || 1;

  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-[10px] text-[#5a7a6a] mt-0.5 flex-wrap">
      <button onClick={() => setLevel("quarterly")}
        className={`font-bold transition-colors ${level==="quarterly"?"text-[#145c3f]":"hover:text-[#145c3f]"}`}>
        Quarterly
      </button>
      {(level === "zonal" || level === "state") && (
        <><ChevronRight className="w-3 h-3"/>
        <button onClick={() => setLevel("zonal")}
          className={`font-bold transition-colors ${level==="zonal"?"text-[#145c3f]":"hover:text-[#145c3f]"}`}>
          {activeQ} — Zones
        </button></>
      )}
      {level === "state" && (
        <><ChevronRight className="w-3 h-3"/>
        <span className="font-bold text-[#145c3f]">{activeZone}</span></>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.96, y:16 }} transition={{ duration:0.2 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#d4e8dc] flex flex-col"
        style={{ maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4e8dc] bg-[#f0fdf7] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            {level !== "quarterly" && (
              <button onClick={() => setLevel(level === "state" ? "zonal" : "quarterly")}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#d4e8dc] transition-colors text-[#145c3f]">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="text-sm font-black text-slate-900">{cfg.label} — Drill-Down</p>
              {breadcrumb}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#d4e8dc] transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-5">

            {/* ════ QUARTERLY LEVEL ════ */}
            {level === "quarterly" && (
              <>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Annual Total</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{cfg.fmt(annualTotal)}</p>
                  </div>
                  <p className="text-[10px] font-bold text-[#145c3f]">Click a quarter → zone breakdown →</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterlyTotals} barSize={44}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                      <XAxis dataKey="quarter" tick={{ fontSize:12, fill:"#5a7a6a", fontWeight:700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false}
                        tickFormatter={v => isIGR ? `₦${(v/1000000).toFixed(0)}M` : v.toLocaleString()} />
                      <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                        formatter={(v:number) => [cfg.fmt(v), cfg.label]} />
                      <Bar dataKey="value" radius={[8,8,0,0]} cursor="pointer"
                        onClick={(d: any) => { setActiveQ(d.quarter); setLevel("zonal"); }}>
                        {quarterlyTotals.map(q => <Cell key={q.quarter} fill={cfg.color} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {quarterlyTotals.map(q => {
                    const pct = annualTotal > 0 ? Math.round((q.value/annualTotal)*100) : 0;
                    return (
                      <button key={q.quarter}
                        onClick={() => { setActiveQ(q.quarter); setLevel("zonal"); }}
                        className="p-4 rounded-2xl border border-[#d4e8dc] bg-white hover:border-[#25a872] hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">{q.quarter}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8f5ee] text-[#145c3f]">{pct}%</span>
                        </div>
                        <p className="text-base font-black text-slate-900">{cfg.fmt(q.value)}</p>
                        <div className="mt-2 h-1 rounded-full bg-[#e8f5ee] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:cfg.color }} />
                        </div>
                        <p className="text-[10px] text-[#25a872] font-semibold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View zones <ChevronRight className="w-3 h-3" />
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ════ ZONAL LEVEL ════ */}
            {level === "zonal" && (
              <>
                <PillTabs options={QUARTERS} active={activeQ} onChange={q => setActiveQ(q)} />
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">{activeQ} — Zone Breakdown</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{cfg.fmt(qTotal)}</p>
                  </div>
                  <p className="text-[10px] font-bold text-[#145c3f]">Click a zone → state breakdown →</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zonalBreakdown} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                      <XAxis dataKey="zone" tick={{ fontSize:9, fill:"#5a7a6a", fontWeight:700 }} axisLine={false} tickLine={false}
                        tickFormatter={z => z.split(" ")[0] + " " + z.split(" ")[1]} />
                      <YAxis tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false}
                        tickFormatter={v => isIGR ? `₦${(v/1000000).toFixed(0)}M` : v.toLocaleString()} />
                      <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                        formatter={(v:number) => [cfg.fmt(v), cfg.label]} />
                      <Bar dataKey="value" radius={[8,8,0,0]} cursor="pointer"
                        onClick={(d: any) => { setActiveZone(d.zone); setLevel("state"); }}>
                        {zonalBreakdown.map(z => <Cell key={z.zone} fill={ZONE_COLORS[z.zone]||cfg.color} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {zonalBreakdown.map(z => {
                    const pct = qTotal > 0 ? Math.round((z.value/qTotal)*100) : 0;
                    const col = ZONE_COLORS[z.zone] || cfg.color;
                    return (
                      <button key={z.zone}
                        onClick={() => { setActiveZone(z.zone); setLevel("state"); }}
                        className="p-4 rounded-2xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                        style={{ borderColor: col + "40" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#5a7a6a] leading-tight">{z.zone}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: col+"18", color: col }}>{pct}%</span>
                        </div>
                        <p className="text-base font-black text-slate-900">{cfg.fmt(z.value)}</p>
                        <div className="mt-2 h-1 rounded-full bg-[#e8f5ee] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:col }} />
                        </div>
                        <p className="text-[10px] font-semibold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: col }}>
                          View states <ChevronRight className="w-3 h-3" />
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ════ STATE LEVEL ════ */}
            {level === "state" && (
              <>
                <div className="flex flex-wrap gap-3">
                  <PillTabs options={QUARTERS} active={activeQ} onChange={q => setActiveQ(q)} />
                  <PillTabs options={ZONES} active={activeZone} onChange={z => setActiveZone(z)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">{activeZone} — {activeQ}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      {cfg.fmt(stateBreakdown.reduce((s,r)=>s+r.value,0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#5a7a6a]">{stateBreakdown.filter(s=>s.value>0).length} states reported</p>
                    <p className="text-[10px] font-bold text-[#145c3f] mt-0.5">Sorted by value ↓</p>
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateBreakdown} layout="vertical" barSize={10} margin={{ left:8, right:24 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
                      <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false}
                        tickFormatter={v => isIGR ? `₦${(v/1000000).toFixed(1)}M` : v.toLocaleString()} />
                      <YAxis type="category" dataKey="state" tick={{ fontSize:10, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={72} />
                      <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                        formatter={(v:number) => [cfg.fmt(v), `${activeQ} ${cfg.label}`]} />
                      <Bar dataKey="value" radius={[0,6,6,0]}>
                        {stateBreakdown.map(s => <Cell key={s.state} fill={ZONE_COLORS[s.zone]||cfg.color} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* State filter table with zone+state filter */}
                <div className="rounded-2xl border border-[#d4e8dc] overflow-hidden">
                  <div className="bg-[#f0fdf7] border-b border-[#d4e8dc] px-3 py-2 flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">States — All Quarters</p>
                    <div className="flex gap-1 flex-wrap ml-2">
                      {["All", ...ZONES].map(z => (
                        <button key={z} onClick={() => setActiveZone(z === "All" ? ZONES[0] : z)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                            (z === "All" ? false : activeZone === z)
                              ? "bg-[#145c3f] border-[#145c3f] text-white"
                              : "border-[#c8e6d8] text-[#5a7a6a] hover:border-[#25a872]"
                          }`}
                          style={z !== "All" && activeZone !== z ? { borderColor: ZONE_COLORS[z]+"60", color: ZONE_COLORS[z] } : {}}
                        >{z === "All" ? "All" : z.split(" ")[0]}</button>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#5a7a6a] ml-auto">{stateBreakdown.length} states</span>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#f0fdf7] border-b border-[#d4e8dc] z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">#</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">State</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Q1</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Q2</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Q3</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Q4</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateBreakdown.map((s, i) => {
                          const zoneTotal = stateBreakdown.reduce((acc,r)=>acc+r.value,0);
                          const share = zoneTotal > 0 ? Math.round((s.value/zoneTotal)*100) : 0;
                          const qVals = [s.q1, s.q2, s.q3, s.q4];
                          return (
                            <tr key={s.state} className="border-b border-[#e8f5ee] hover:bg-[#f0fdf7] transition-colors">
                              <td className="px-3 py-2 text-[#5a7a6a] font-bold">{i+1}</td>
                              <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">{s.state}</td>
                              {qVals.map((v, qi) => (
                                <td key={qi} className={`px-3 py-2 font-mono text-[11px] ${
                                  QUARTERS[qi] === activeQ ? "font-black text-[#145c3f]" : "text-slate-500"
                                }`}>
                                  {v > 0 ? cfg.fmt(v) : <span className="text-slate-300">—</span>}
                                </td>
                              ))}
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width:`${(s.value/stateMaxVal)*100}%`, backgroundColor:ZONE_COLORS[s.zone]||cfg.color }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-[#5a7a6a]">{share}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── AnnualDrillModal ─────────────────────────────────────────────────────────
// Flow: Zonal → State (no quarterly level)
type ADrillLevel = "zonal" | "state";

function AnnualDrillModal({ kpiLabel, stateTable, onClose }: {
  kpiLabel: string;
  stateTable: ReturnType<typeof computeData>["stateTable"];
  onClose: () => void;
}) {
  const [level, setLevel]           = React.useState<ADrillLevel>("zonal");
  const [activeZone, setActiveZone] = React.useState(ZONES[0]);

  const cfg = KPI_ANNUAL_CONFIG[kpiLabel];
  if (!cfg) return null;

  const field = cfg.field as keyof typeof stateTable[0];

  // ── Zonal totals ──
  const zonalBreakdown = ZONES.map(zone => {
    const value = stateTable
      .filter(r => r.zone === zone)
      .reduce((s, r) => s + (Number(r[field]) || 0), 0);
    return { zone, value };
  }).sort((a, b) => b.value - a.value);

  const annualTotal = zonalBreakdown.reduce((s, z) => s + z.value, 0);

  // ── State breakdown for active zone ──
  const stateBreakdown = stateTable
    .filter(r => r.zone === activeZone)
    .map(r => ({ state: r.state, zone: r.zone, value: Number(r[field]) || 0 }))
    .sort((a, b) => b.value - a.value);

  const zoneTotal = stateBreakdown.reduce((s, r) => s + r.value, 0);
  const stateMaxVal = stateBreakdown[0]?.value || 1;

  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-[10px] text-[#5a7a6a] mt-0.5">
      <button onClick={() => setLevel("zonal")}
        className={`font-bold transition-colors ${level==="zonal"?"text-[#145c3f]":"hover:text-[#145c3f]"}`}>
        Zone Breakdown
      </button>
      {level === "state" && (
        <><ChevronRight className="w-3 h-3"/>
        <span className="font-bold text-[#145c3f]">{activeZone}</span></>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.96, y:16 }} transition={{ duration:0.2 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#d4e8dc] flex flex-col"
        style={{ maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4e8dc] bg-[#f0fdf7] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            {level === "state" && (
              <button onClick={() => setLevel("zonal")}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#d4e8dc] transition-colors text-[#145c3f]">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="text-sm font-black text-slate-900">{cfg.label} — Drill-Down</p>
              {breadcrumb}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#d4e8dc] transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-5">

            {/* ════ ZONAL LEVEL ════ */}
            {level === "zonal" && (
              <>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Annual Total</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{cfg.fmt(annualTotal)}</p>
                  </div>
                  <p className="text-[10px] font-bold text-[#145c3f]">Click a zone → state breakdown →</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zonalBreakdown} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                      <XAxis dataKey="zone" tick={{ fontSize:9, fill:"#5a7a6a", fontWeight:700 }} axisLine={false} tickLine={false}
                        tickFormatter={z => z.split(" ")[0] + " " + z.split(" ")[1]} />
                      <YAxis tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false}
                        tickFormatter={v => v.toLocaleString()} />
                      <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                        formatter={(v:number) => [cfg.fmt(v), cfg.label]} />
                      <Bar dataKey="value" radius={[8,8,0,0]} cursor="pointer"
                        onClick={(d: any) => { setActiveZone(d.zone); setLevel("state"); }}>
                        {zonalBreakdown.map(z => <Cell key={z.zone} fill={ZONE_COLORS[z.zone]||cfg.color} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {zonalBreakdown.map(z => {
                    const pct = annualTotal > 0 ? Math.round((z.value/annualTotal)*100) : 0;
                    const col = ZONE_COLORS[z.zone] || cfg.color;
                    return (
                      <button key={z.zone}
                        onClick={() => { setActiveZone(z.zone); setLevel("state"); }}
                        className="p-4 rounded-2xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                        style={{ borderColor: col + "40" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#5a7a6a] leading-tight">{z.zone}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: col+"18", color: col }}>{pct}%</span>
                        </div>
                        <p className="text-base font-black text-slate-900">{cfg.fmt(z.value)}</p>
                        <div className="mt-2 h-1 rounded-full bg-[#e8f5ee] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:col }} />
                        </div>
                        <p className="text-[10px] font-semibold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: col }}>
                          View states <ChevronRight className="w-3 h-3" />
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ════ STATE LEVEL ════ */}
            {level === "state" && (
              <>
                <PillTabs options={ZONES} active={activeZone} onChange={z => setActiveZone(z)} />
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">{activeZone} — {cfg.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{cfg.fmt(zoneTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#5a7a6a]">{stateBreakdown.filter(s=>s.value>0).length} states reported</p>
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateBreakdown} layout="vertical" barSize={10} margin={{ left:8, right:24 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
                      <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false}
                        tickFormatter={v => v.toLocaleString()} />
                      <YAxis type="category" dataKey="state" tick={{ fontSize:10, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={72} />
                      <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                        formatter={(v:number) => [cfg.fmt(v), cfg.label]} />
                      <Bar dataKey="value" radius={[0,6,6,0]}>
                        {stateBreakdown.map(s => <Cell key={s.state} fill={ZONE_COLORS[s.zone]||cfg.color} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-2xl border border-[#d4e8dc] overflow-hidden">
                  <div className="bg-[#f0fdf7] border-b border-[#d4e8dc] px-3 py-2 flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">{activeZone} States</p>
                    <span className="text-[10px] text-[#5a7a6a] ml-auto">{stateBreakdown.length} states</span>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#f0fdf7] border-b border-[#d4e8dc] z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">#</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">State</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">{cfg.label}</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateBreakdown.map((s, i) => {
                          const share = zoneTotal > 0 ? Math.round((s.value/zoneTotal)*100) : 0;
                          const col = ZONE_COLORS[s.zone] || cfg.color;
                          return (
                            <tr key={s.state} className="border-b border-[#e8f5ee] hover:bg-[#f0fdf7] transition-colors">
                              <td className="px-3 py-2 text-[#5a7a6a] font-bold">{i+1}</td>
                              <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">{s.state}</td>
                              <td className="px-3 py-2 font-black text-slate-900">
                                {s.value > 0 ? cfg.fmt(s.value) : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width:`${(s.value/stateMaxVal)*100}%`, backgroundColor:col }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-[#5a7a6a]">{share}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ZoneDrillModal — full metrics table for a zone, click state for detail ──
function ZoneDrillModal({ zone, year, stateTable, onClose }: {
  zone: string; year: string;
  stateTable: StateRow[];
  onClose: () => void;
}) {
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const col = ZONE_COLORS[zone] || "#22c55e";

  const zoneRows = React.useMemo(() =>
    stateTable.filter(r => r.zone === zone).sort((a,b) => b.igr - a.igr),
    [stateTable, zone]
  );

  const totals = React.useMemo(() => ({
    gif: zoneRows.reduce((s,r)=>s+r.gifship,0),
    igr: zoneRows.reduce((s,r)=>s+r.igr,0),
    bhcpf: zoneRows.reduce((s,r)=>s+r.bhcpf,0),
    cmp: zoneRows.reduce((s,r)=>s+r.complaints,0),
    cemonc: zoneRows.reduce((s,r)=>s+r.cemonc,0),
    ffp: zoneRows.reduce((s,r)=>s+r.ffp,0),
    fsship: zoneRows.reduce((s,r)=>s+r.fsship,0),
  }), [zoneRows]);

  if (selectedState) {
    return (
      <StateDetailModal state={selectedState} year={year} stateTable={stateTable}
        onClose={() => setSelectedState(null)} />
    );
  }

  return (
    <ModalShell
      title={`${zone} — ${year} Zone Performance`}
      subtitle={<span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor:col+"18", color:col }}>{zoneRows.length} states</span>}
      onClose={onClose}
    >
      {/* Zone summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[
          { label:"GIFSHIP",    value: totals.gif.toLocaleString(),       color:"#22c55e" },
          { label:"BHCPF",      value: totals.bhcpf.toLocaleString(),     color:"#a78bfa" },
          { label:"IGR (₦M)",   value: `₦${totals.igr.toFixed(1)}M`,     color:"#3b82f6" },
          { label:"Complaints", value: totals.cmp.toLocaleString(),       color:"#f59e0b" },
          { label:"CEmONC",     value: totals.cemonc.toLocaleString(),    color:"#3b82f6" },
          { label:"FFP",        value: totals.ffp.toLocaleString(),       color:"#a78bfa" },
          { label:"FSSHIP",     value: totals.fsship.toLocaleString(),    color:"#f97316" },
        ].map(m => (
          <div key={m.label} className="p-3 rounded-2xl border border-[#d4e8dc] bg-[#f0fdf7]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a] mb-1">{m.label}</p>
            <p className="text-sm font-black" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* States table — click state for detail */}
      <div className="rounded-2xl border border-[#d4e8dc] overflow-hidden">
        <div className="bg-[#f0fdf7] border-b border-[#d4e8dc] px-3 py-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">States — click for detail</p>
          <p className="text-[10px] text-[#5a7a6a]">{zoneRows.length} states</p>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight:"360px" }}>
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#f0fdf7] border-b border-[#d4e8dc] z-10">
              <tr>
                {["#","State","GIFSHIP","BHCPF","IGR (₦M)","Complaints","Resolution","CEmONC","FFP","FSSHIP","Status"].map(h => (
                  <th key={h} className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zoneRows.map((row, i) => (
                <tr key={row.state} onClick={() => setSelectedState(row.state)}
                  className="border-b border-[#e8f5ee] hover:bg-[#f0fdf7] transition-colors cursor-pointer">
                  <td className="px-2.5 py-2 text-[#5a7a6a] font-bold">{i+1}</td>
                  <td className="px-2.5 py-2 font-bold text-[#145c3f] whitespace-nowrap">
                    {row.state} <ChevronRight className="w-3 h-3 inline text-[#25a872] opacity-60" />
                  </td>
                  <td className="px-2.5 py-2 text-slate-700 font-semibold">{fmt(row.gifship)}</td>
                  <td className="px-2.5 py-2 text-slate-600">{fmt(row.bhcpf)}</td>
                  <td className="px-2.5 py-2 font-bold" style={{ color: row.igr>50?"#16a34a":row.igr>15?"#d97706":"#64748b" }}>₦{row.igr}M</td>
                  <td className="px-2.5 py-2 text-slate-500">{row.complaints.toLocaleString()}</td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${row.resolution}%`, backgroundColor:resColor(row.resolution) }} />
                      </div>
                      <span className="font-bold text-[10px]" style={{ color:resColor(row.resolution) }}>{row.resolution}%</span>
                    </div>
                  </td>
                  <td className="px-2.5 py-2 text-slate-500">{row.cemonc.toLocaleString()}</td>
                  <td className="px-2.5 py-2 text-slate-500">{fmt(row.ffp)}</td>
                  <td className="px-2.5 py-2 text-slate-500">{fmt(row.fsship)}</td>
                  <td className="px-2.5 py-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${row.status==="Active"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Top12IGRDrillModal — zone tabs + state IGR breakdown ────────────────────
function Top12IGRDrillModal({ year, stateTable, initialZone, onClose }: {
  year: string; stateTable: StateRow[]; initialZone?: string; onClose: () => void;
}) {
  const [activeZone, setActiveZone] = React.useState(initialZone || "All");
  const [selectedState, setSelectedState] = React.useState<string | null>(null);

  const displayRows = React.useMemo(() => {
    let rows = stateTable.filter(s => s.igr > 0);
    if (activeZone !== "All") rows = rows.filter(r => r.zone === activeZone);
    return rows.sort((a,b) => b.igr - a.igr).slice(0, 12);
  }, [stateTable, activeZone]);

  const maxIGR = displayRows[0]?.igr || 1;

  if (selectedState) {
    return <StateDetailModal state={selectedState} year={year} stateTable={stateTable} onClose={() => setSelectedState(null)} />;
  }

  return (
    <ModalShell title={`Top States by IGR — ${year}`}
      subtitle={<span className="text-[10px] text-[#5a7a6a]">Click a state for full breakdown</span>}
      onClose={onClose}>
      {/* Zone tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#e8f5ee] border border-[#d4e8dc] w-fit flex-wrap">
        {["All", ...ZONES].map(z => (
          <button key={z} onClick={() => setActiveZone(z)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              activeZone === z ? "bg-[#145c3f] text-white shadow-sm" : "text-[#5a7a6a] hover:text-[#145c3f]"
            }`}
          >{z === "All" ? "All Zones" : z.split(" ")[0] + " " + z.split(" ")[1]}</button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayRows} layout="vertical" barSize={12} margin={{ left:8, right:24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
            <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false} tickFormatter={v=>`₦${v}M`} />
            <YAxis type="category" dataKey="state" tick={{ fontSize:11, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={64} />
            <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
              formatter={(v:number)=>[`₦${v}M`,"IGR"]} />
            <Bar dataKey="igr" radius={[0,6,6,0]} cursor="pointer"
              onClick={(d:any) => setSelectedState(d.state)}>
              {displayRows.map(e => <Cell key={e.state} fill={ZONE_COLORS[e.zone]} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* State cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {displayRows.map(s => {
          const col = ZONE_COLORS[s.zone];
          const pct = Math.round((s.igr / maxIGR) * 100);
          return (
            <button key={s.state} onClick={() => setSelectedState(s.state)}
              className="p-3 rounded-2xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
              style={{ borderColor: col+"40" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-700">{s.state}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor:col+"18", color:col }}>{s.zone.split(" ")[0]}</span>
              </div>
              <p className="text-sm font-black" style={{ color:col }}>₦{s.igr}M</p>
              <div className="mt-1.5 h-1 rounded-full bg-[#e8f5ee] overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:col }} />
              </div>
              <p className="text-[9px] text-[#25a872] font-semibold mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                View detail <ChevronRight className="w-3 h-3" />
              </p>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

// ─── IGRByZoneDrillModal — zone donut → zone detail → state detail ────────────
function IGRByZoneDrillModal({ year, stateTable, initialZone, onClose }: {
  year: string; stateTable: StateRow[]; initialZone?: string; onClose: () => void;
}) {
  const [selectedZone, setSelectedZone] = React.useState<string | null>(initialZone || null);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);

  const zoneIGR = React.useMemo(() => {
    const map: Record<string,number> = {};
    stateTable.forEach(s => { map[s.zone] = (map[s.zone]||0) + s.igr; });
    const total = Object.values(map).reduce((a,b)=>a+b,0);
    return ZONES.map(z => ({ zone:z, igr: map[z]||0, pct: total>0?Math.round(((map[z]||0)/total)*1000)/10:0 }))
      .sort((a,b)=>b.igr-a.igr);
  }, [stateTable]);

  const zoneStates = React.useMemo(() =>
    selectedZone ? stateTable.filter(r=>r.zone===selectedZone).sort((a,b)=>b.igr-a.igr) : [],
    [stateTable, selectedZone]
  );

  if (selectedState) {
    return <StateDetailModal state={selectedState} year={year} stateTable={stateTable} onClose={() => setSelectedState(null)} />;
  }

  if (selectedZone) {
    const col = ZONE_COLORS[selectedZone];
    const zoneTotal = zoneStates.reduce((s,r)=>s+r.igr,0);
    return (
      <ModalShell title={`${selectedZone} — IGR Breakdown (${year})`}
        subtitle={<span className="text-[10px] font-bold" style={{ color:col }}>₦{zoneTotal.toFixed(1)}M total · click state for detail</span>}
        onClose={onClose} onBack={() => setSelectedZone(null)}>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneStates} layout="vertical" barSize={10} margin={{ left:8, right:24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
              <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false} tickFormatter={v=>`₦${v}M`} />
              <YAxis type="category" dataKey="state" tick={{ fontSize:10, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={72} />
              <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                formatter={(v:number)=>[`₦${v}M`,"IGR"]} />
              <Bar dataKey="igr" radius={[0,6,6,0]} cursor="pointer"
                onClick={(d:any) => setSelectedState(d.state)}>
                {zoneStates.map(s => <Cell key={s.state} fill={col} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-[#d4e8dc] overflow-hidden">
          <div className="bg-[#f0fdf7] border-b border-[#d4e8dc] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a]">States — click for full metrics</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight:"280px" }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#f0fdf7] border-b border-[#d4e8dc] z-10">
                <tr>
                  {["#","State","GIFSHIP","BHCPF","IGR (₦M)","Complaints","Resolution","CEmONC","FFP","FSSHIP","Status"].map(h => (
                    <th key={h} className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#5a7a6a] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zoneStates.map((row, i) => (
                  <tr key={row.state} onClick={() => setSelectedState(row.state)}
                    className="border-b border-[#e8f5ee] hover:bg-[#f0fdf7] transition-colors cursor-pointer">
                    <td className="px-2.5 py-2 text-[#5a7a6a] font-bold">{i+1}</td>
                    <td className="px-2.5 py-2 font-bold text-[#145c3f] whitespace-nowrap">
                      {row.state} <ChevronRight className="w-3 h-3 inline text-[#25a872] opacity-60" />
                    </td>
                    <td className="px-2.5 py-2 text-slate-700 font-semibold">{fmt(row.gifship)}</td>
                    <td className="px-2.5 py-2 text-slate-600">{fmt(row.bhcpf)}</td>
                    <td className="px-2.5 py-2 font-bold" style={{ color:row.igr>50?"#16a34a":row.igr>15?"#d97706":"#64748b" }}>₦{row.igr}M</td>
                    <td className="px-2.5 py-2 text-slate-500">{row.complaints.toLocaleString()}</td>
                    <td className="px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${row.resolution}%`, backgroundColor:resColor(row.resolution) }} />
                        </div>
                        <span className="font-bold text-[10px]" style={{ color:resColor(row.resolution) }}>{row.resolution}%</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-2 text-slate-500">{row.cemonc.toLocaleString()}</td>
                    <td className="px-2.5 py-2 text-slate-500">{fmt(row.ffp)}</td>
                    <td className="px-2.5 py-2 text-slate-500">{fmt(row.fsship)}</td>
                    <td className="px-2.5 py-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${row.status==="Active"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ModalShell>
    );
  }

  // Zone overview
  const totalIGR = zoneIGR.reduce((s,z)=>s+z.igr,0);
  return (
    <ModalShell title={`IGR by Zone — ${year}`}
      subtitle={<span className="text-[10px] text-[#5a7a6a]">Click a zone for state breakdown</span>}
      onClose={onClose}>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zoneIGR} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
            <XAxis dataKey="zone" tick={{ fontSize:9, fill:"#5a7a6a", fontWeight:700 }} axisLine={false} tickLine={false}
              tickFormatter={z => z.split(" ")[0] + " " + z.split(" ")[1]} />
            <YAxis tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false} tickFormatter={v=>`₦${v}M`} />
            <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
              formatter={(v:number)=>[`₦${v}M`,"IGR"]} />
            <Bar dataKey="igr" radius={[8,8,0,0]} cursor="pointer"
              onClick={(d:any) => setSelectedZone(d.zone)}>
              {zoneIGR.map(z => <Cell key={z.zone} fill={ZONE_COLORS[z.zone]} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {zoneIGR.map(z => {
          const col = ZONE_COLORS[z.zone];
          return (
            <button key={z.zone} onClick={() => setSelectedZone(z.zone)}
              className="p-4 rounded-2xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
              style={{ borderColor: col+"40" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#5a7a6a] leading-tight">{z.zone}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor:col+"18", color:col }}>{z.pct}%</span>
              </div>
              <p className="text-base font-black text-slate-900">₦{z.igr.toFixed(1)}M</p>
              <div className="mt-2 h-1 rounded-full bg-[#e8f5ee] overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${(z.igr/totalIGR)*100}%`, backgroundColor:col }} />
              </div>
              <p className="text-[10px] font-semibold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:col }}>
                View states <ChevronRight className="w-3 h-3" />
              </p>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

// ─── ComplaintDrillModal — top complaints → state detail ─────────────────────
function ComplaintDrillModal({ year, stateTable, onClose }: {
  year: string; stateTable: StateRow[]; onClose: () => void;
}) {
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = React.useState("All");

  const rows = React.useMemo(() => {
    let t = stateTable.filter(s => s.complaints > 0);
    if (zoneFilter !== "All") t = t.filter(r => r.zone === zoneFilter);
    return t.sort((a,b) => b.complaints - a.complaints).slice(0, 10);
  }, [stateTable, zoneFilter]);

  if (selectedState) {
    return <StateDetailModal state={selectedState} year={year} stateTable={stateTable} onClose={() => setSelectedState(null)} />;
  }

  return (
    <ModalShell title={`Top Complaint States — ${year}`}
      subtitle={<span className="text-[10px] text-[#5a7a6a]">Click a state for full breakdown</span>}
      onClose={onClose}>
      {/* Zone filter */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#e8f5ee] border border-[#d4e8dc] w-fit flex-wrap">
        {["All", ...ZONES].map(z => (
          <button key={z} onClick={() => setZoneFilter(z)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              zoneFilter === z ? "bg-[#145c3f] text-white shadow-sm" : "text-[#5a7a6a] hover:text-[#145c3f]"
            }`}
          >{z === "All" ? "All Zones" : z.split(" ")[0] + " " + z.split(" ")[1]}</button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" barSize={12} margin={{ left:8, right:16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
            <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="state" tick={{ fontSize:11, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={60} />
            <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
              formatter={(v:number,_:string,p:any)=>[`${v} complaints · ${p.payload.resolution}% resolved`, p.payload.state]} />
            <Bar dataKey="complaints" radius={[0,6,6,0]} cursor="pointer"
              onClick={(d:any) => setSelectedState(d.state)}>
              {rows.map(b => <Cell key={b.state} fill={resColor(b.resolution)} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* State list */}
      <div className="space-y-2">
        {rows.map((s, i) => {
          const col = ZONE_COLORS[s.zone];
          return (
            <button key={s.state} onClick={() => setSelectedState(s.state)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f0fdf7] border border-[#d4e8dc] hover:border-[#25a872] hover:shadow-sm transition-all text-left group">
              <span className="w-6 h-6 rounded-full bg-[#145c3f] text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">{s.state}</p>
                <p className="text-[10px]" style={{ color:col }}>{s.zone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{s.complaints.toLocaleString()} complaints</p>
                <p className="text-[10px] font-bold" style={{ color:resColor(s.resolution) }}>{s.resolution}% resolved</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#25a872] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SORT_OPTIONS = ["IGR","GIFSHIP","BHCPF Lives","Complaints","Resolution Rate"];

export default function SDOPerformance() {
  const [year, setYear]       = React.useState<Year>("2025");
  const [drillKPI, setDrillKPI] = React.useState<string | null>(null);
  // New modal states
  const [showTop12IGR, setShowTop12IGR]     = React.useState(false);
  const [showIGRByZone, setShowIGRByZone]   = React.useState(false);
  const [showComplaints, setShowComplaints] = React.useState(false);
  const [drillZone, setDrillZone]           = React.useState<string | null>(null);
  const [drillState, setDrillState]         = React.useState<string | null>(null);
  const [top12InitZone, setTop12InitZone]   = React.useState<string | undefined>(undefined);
  const [igrZoneInit, setIgrZoneInit]       = React.useState<string | undefined>(undefined);

  // ── Real zone + state data ──────────────────────────────────────────────────
  const [apiZones,        setApiZones]        = React.useState<ZonalOffice[]>([]);
  const [apiStates,       setApiStates]       = React.useState<StateOffice[]>([]);
  const [selectedApiZone, setSelectedApiZone] = React.useState<ZonalOffice | null>(null);
  const [zonesLoading,    setZonesLoading]    = React.useState(true);
  const [statesLoading,   setStatesLoading]   = React.useState(false);

  // Fetch all zones on mount
  React.useEffect(() => {
    let cancelled = false;
    zonesApi.list()
      .then((r) => { if (!cancelled) setApiZones(r.data); })
      .catch(() => {/* silently ignore — dummy data still works */})
      .finally(() => { if (!cancelled) setZonesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Fetch states when a zone is selected
  React.useEffect(() => {
    if (!selectedApiZone) { setApiStates([]); return; }
    let cancelled = false;
    setStatesLoading(true);
    statesApi.list(selectedApiZone.id)
      .then((r) => { if (!cancelled) setApiStates(r.data); })
      .catch(() => { if (!cancelled) setApiStates([]); })
      .finally(() => { if (!cancelled) setStatesLoading(false); });
    return () => { cancelled = true; };
  }, [selectedApiZone?.id]);

  // Derive the zone filter string from the selected API zone (matches dummy data zone names)
  // Falls back to "All" if nothing selected
  const zoneFilterFromApi: string = selectedApiZone?.description ?? "All";

  // Build the effective ZONES list from API (fallback to hardcoded if API not loaded yet)
  const effectiveZones: string[] = apiZones.length > 0
    ? apiZones.map((z) => z.description)
    : ZONES;

  // States for the selected zone — use API states if available, else derive from dummy data
  const effectiveStates: string[] = selectedApiZone && apiStates.length > 0
    ? apiStates.map((s) => s.description)
    : selectedApiZone
      ? ZONES.includes(selectedApiZone.description)
        ? (YEAR_DATA[year] ?? []).filter((r) => r.zone === selectedApiZone.description).map((r) => r.state)
        : []
      : [];

  const rows = YEAR_DATA[year];
  const d    = React.useMemo(() => computeData(rows), [rows]);

  const igrTotal = `₦${(d.totalIGR/1000000).toFixed(1)}M`;

  const KPI_STRIP = [
    { label:"GIFSHIP Enrolments",    value: d.totalGIF.toLocaleString(),          trend:+18.4, color:"#22c55e" },
    { label:"Total IGR (₦)",         value: igrTotal,                             trend:+22.1, color:"#22c55e" },
    { label:"BHCPF Lives",           value: d.totalBHCPF.toLocaleString(),        trend:+14.3, color:"#22c55e" },
    { label:"Total Complaints",      value: d.totalCMP.toLocaleString(),          trend:+8.6,  color:"#f59e0b" },
    { label:"CEmONC Beneficiaries",  value: d.totalCEM.toLocaleString(),          trend:+26.7, color:"#3b82f6" },
    { label:"FFP Beneficiaries",     value: d.totalFFP.toLocaleString(),          trend:+12.1, color:"#a78bfa" },
    { label:"FSSHIP Enrolments",     value: d.totalFSSHIP.toLocaleString(),       trend:+9.4,  color:"#f97316" },
  ];

  const SPARKLINE_CARDS = [
    { label:"Complaints",      kpi:"Total Complaints",     value: d.totalCMP.toLocaleString(),   trend:+8.6,  color:"#f87171", data:[620,710,780,840,920,1050,1180,1320,1450,1580,1720,d.totalCMP] },
    { label:"Avg Resolution",  kpi:null,                   value:"82%",                          trend:+4.1,  color:"#22c55e", data:[62,65,67,64,68,70,72,69,74,76,73,82] },
    { label:"BHCPF Lives",     kpi:"BHCPF Lives",          value: fmt(d.totalBHCPF),             trend:+21.3, color:"#60a5fa", data:[82000,95000,108000,121000,138000,152000,168000,185000,201000,218000,234000,d.totalBHCPF] },
    { label:"GIFSHIP",         kpi:"GIFSHIP Enrolments",   value: d.totalGIF.toLocaleString(),   trend:+18.4, color:"#a78bfa", data:[1800,2100,2400,2650,2900,3200,3500,3800,4100,4400,4700,d.totalGIF] },
  ];

  const card = "rounded-2xl border border-[#d4e8dc] bg-white shadow-sm hover:shadow-md transition-all";
  const lbl  = "text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a7a6a]";

  const isAnnualDrill    = drillKPI ? drillKPI in KPI_ANNUAL_CONFIG : false;
  const isQuarterlyDrill = drillKPI ? drillKPI in KPI_QUARTERLY_CONFIG : false;

  const closeAll = () => {
    setDrillKPI(null); setShowTop12IGR(false); setShowIGRByZone(false);
    setShowComplaints(false); setDrillZone(null); setDrillState(null);
  };

  return (
    <>
      {/* ── NHIA Watermark ── */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0 overflow-hidden">
        <img src="/logo.png" alt="" aria-hidden className="opacity-[0.035] select-none" style={{ width: '80vw', maxWidth: '900px' }} />
      </div>

      {/* ── All content above watermark ── */}
      <div className="relative z-10 space-y-6 pb-16">

        {/* ── All Modals ── */}
        <AnimatePresence>
          {drillKPI && isQuarterlyDrill && (
            <QuarterlyDrillModal kpiLabel={drillKPI} data={rows} onClose={closeAll} />
          )}
          {drillKPI && isAnnualDrill && (
            <AnnualDrillModal kpiLabel={drillKPI} stateTable={d.stateTable} onClose={closeAll} />
          )}
          {showTop12IGR && (
            <Top12IGRDrillModal year={year} stateTable={d.stateTable} initialZone={top12InitZone} onClose={closeAll} />
          )}
          {showIGRByZone && (
            <IGRByZoneDrillModal year={year} stateTable={d.stateTable} initialZone={igrZoneInit} onClose={closeAll} />
          )}
          {showComplaints && (
            <ComplaintDrillModal year={year} stateTable={d.stateTable} onClose={closeAll} />
          )}
          {drillZone && (
            <ZoneDrillModal zone={drillZone} year={year} stateTable={d.stateTable} onClose={closeAll} />
          )}
          {drillState && (
            <StateDetailModal state={drillState} year={year} stateTable={d.stateTable} onClose={closeAll} />
          )}
        </AnimatePresence>

        {/* ── Year selector ── */}
        <div className="flex items-center justify-between">
          <p className={lbl}>National Performance Snapshot</p>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#e8f5ee] border border-[#d4e8dc]">
            {(["2023","2024","2025"] as Year[]).map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  year === y ? "bg-[#145c3f] text-white shadow-sm" : "text-[#5a7a6a] hover:text-[#145c3f]"
                }`}
              >{y}</button>
            ))}
          </div>
        </div>

        {/* ── Zone + State selector (real API data) ── */}
        <div className="rounded-2xl border border-[#d4e8dc] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className={lbl}>Filter by Zone &amp; State</p>
            {selectedApiZone && (
              <button
                onClick={() => { setSelectedApiZone(null); setApiStates([]); }}
                className="text-[10px] text-[#145c3f] font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filter
              </button>
            )}
          </div>

          {/* Zone pills */}
          <div className="flex flex-wrap gap-1.5">
            {zonesLoading ? (
              <div className="flex items-center gap-2 py-1">
                <div className="w-3.5 h-3.5 border-2 border-[#25a872] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-400">Loading zones…</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setSelectedApiZone(null); setApiStates([]); }}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                    !selectedApiZone
                      ? "bg-[#145c3f] text-white border-[#145c3f]"
                      : "border-[#d4e8dc] text-[#5a7a6a] hover:border-[#25a872] hover:text-[#145c3f]"
                  }`}
                >
                  All Zones
                </button>
                {apiZones.map((zone) => {
                  const isActive = selectedApiZone?.id === zone.id;
                  const color    = ZONE_COLORS[zone.description] ?? "#145c3f";
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedApiZone(isActive ? null : zone)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                        isActive ? "text-white" : "hover:opacity-90"
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: color, borderColor: color }
                          : { borderColor: color + "60", color }
                      }
                    >
                      {zone.description}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* States for selected zone */}
          <AnimatePresence>
            {selectedApiZone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 border-t border-[#e8f5ee]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    States under {selectedApiZone.description}
                    {statesLoading && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 border border-[#25a872] border-t-transparent rounded-full animate-spin inline-block" />
                        loading…
                      </span>
                    )}
                  </p>
                  {!statesLoading && (
                    <div className="flex flex-wrap gap-1.5">
                      {effectiveStates.length === 0 ? (
                        <span className="text-[10px] text-slate-400">No states found</span>
                      ) : (
                        effectiveStates.map((stateName) => (
                          <button
                            key={stateName}
                            onClick={() => setDrillState(stateName)}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#d4e8dc] bg-[#f0fdf7] text-[#145c3f] hover:bg-[#e8f5ee] hover:border-[#25a872] transition-all"
                          >
                            {stateName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Data Insights ── */}
        <div>
          <p className={lbl + " mb-3"}>Data Insights — {year}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Top IGR — clickable */}
            {(() => {
              const top = d.topIGR[0];
              return top ? (
                <button onClick={() => { setTop12InitZone(undefined); setShowTop12IGR(true); }}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700">Top IGR Performer</span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base font-black text-slate-900">{top.state} State</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Leads nationally with <span className="text-emerald-700 font-bold">₦{top.igr}M IGR</span> in {year}. Click to explore all states.
                  </p>
                </button>
              ) : null;
            })()}

            {/* Critical complaint flag — clickable */}
            {(() => {
              const flag = [...d.stateTable].filter(s=>s.complaints>100&&s.resolution<50)[0];
              return flag ? (
                <button onClick={() => setShowComplaints(true)}
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <span className="text-xs font-bold text-rose-700">Critical Flag · Urgent Action</span>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base font-black text-slate-900">{flag.state} State</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    <span className="text-rose-700 font-bold">{flag.resolution}% resolution rate</span> on <span className="font-bold text-slate-900">{flag.complaints.toLocaleString()} complaints</span>. Click to view all.
                  </p>
                </button>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700">Strong Compliance</span>
                  </div>
                  <p className="text-base font-black text-slate-900">No Critical Flags</p>
                  <p className="text-[11px] text-slate-600 mt-1">All states maintaining acceptable resolution rates in {year}.</p>
                </div>
              );
            })()}

            {/* Top GIFSHIP — clickable */}
            {(() => {
              const top = [...d.stateTable].sort((a,b)=>b.gifship-a.gifship)[0];
              return top ? (
                <button onClick={() => setDrillKPI("GIFSHIP Enrolments")}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-amber-700">GIFSHIP Champion</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base font-black text-slate-900">{top.state} State</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    <span className="text-amber-700 font-bold">{top.gifship.toLocaleString()}</span> enrolments · <span className="font-bold text-slate-900">₦{top.igr}M IGR</span> in {year}. Click to drill down.
                  </p>
                </button>
              ) : null;
            })()}
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {KPI_STRIP.map(k => (
            <button key={k.label} onClick={() => ALL_DRILL_LABELS.has(k.label) && setDrillKPI(k.label)}
              className={`relative rounded-2xl border bg-white p-4 shadow-sm text-left overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
              style={{ borderColor: k.color + "40" }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: k.color }} />
              <p className="text-[9px] text-[#5a7a6a] font-semibold uppercase tracking-wider mb-2 mt-1 leading-tight">{k.label}</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">{k.value}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-2.5 h-2.5" />+{k.trend}%
                </span>
              </div>
              <p className="text-[9px] text-[#25a872] font-semibold mt-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Drill down <ChevronRight className="w-3 h-3" />
              </p>
            </button>
          ))}
        </div>

        {/* ── Sparkline row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SPARKLINE_CARDS.map(s => (
            <button key={s.label}
              onClick={() => {
                if (s.kpi && ALL_DRILL_LABELS.has(s.kpi)) setDrillKPI(s.kpi);
                else if (s.label === "Complaints") setShowComplaints(true);
              }}
              className={card + " p-4 text-left group hover:-translate-y-0.5 transition-all"}>
              <div className="flex items-start justify-between mb-1">
                <p className="text-[10px] text-[#5a7a6a] font-semibold uppercase tracking-wider leading-tight">{s.label}</p>
                <span className="text-[10px] font-bold text-emerald-600">+{s.trend}%</span>
              </div>
              <p className="text-xl font-black text-slate-900 mb-1">{s.value}</p>
              <Sparkline data={s.data} color={s.color} />
              <p className="text-[9px] text-[#25a872] font-semibold mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Drill down <ChevronRight className="w-3 h-3" />
              </p>
            </button>
          ))}
        </div>

        {/* ── Bar + Donut ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Top 12 IGR — clickable bars + zone tabs */}
          <div className={card + " xl:col-span-2 p-5"}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-bold text-slate-800">Top 12 States by IGR</p>
                <p className="text-[10px] text-[#5a7a6a]">Internally Generated Revenue — {year} (₦ Millions) · click bar or zone tab</p>
              </div>
              <button onClick={() => { setTop12InitZone(undefined); setShowTop12IGR(true); }}
                className="text-[10px] font-bold text-[#145c3f] px-2.5 py-1 rounded-lg bg-[#e8f5ee] hover:bg-[#d4e8dc] transition-colors flex items-center gap-1 shrink-0">
                Expand <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {/* Zone filter tabs */}
            <div className="flex items-center gap-1 mt-2 mb-3 flex-wrap">
              {Object.entries(ZONE_COLORS).map(([zone, color]) => (
                <button key={zone} onClick={() => { setTop12InitZone(zone); setShowTop12IGR(true); }}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all hover:shadow-sm hover:-translate-y-0.5"
                  style={{ borderColor: color+"60", color, backgroundColor: color+"10" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor:color }} />
                  {zone.split(" ")[0]}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d.topIGR} layout="vertical" barSize={12} margin={{ left:8, right:24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
                <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false} tickFormatter={v=>`₦${v}M`} />
                <YAxis type="category" dataKey="state" tick={{ fontSize:11, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={64} />
                <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }} formatter={(v:number)=>[`₦${v}M`,"IGR"]} />
                <Bar dataKey="igr" radius={[0,6,6,0]} cursor="pointer"
                  onClick={(data:any) => { setDrillState(data.state); }}>
                  {d.topIGR.map(e => <Cell key={e.state} fill={ZONE_COLORS[e.zone]} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* IGR by Zone donut — clickable */}
          <div className={card + " p-5 flex flex-col"}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-bold text-slate-800">IGR by Zone</p>
                <p className="text-[10px] text-[#5a7a6a]">{year} distribution · click zone</p>
              </div>
              <button onClick={() => { setIgrZoneInit(undefined); setShowIGRByZone(true); }}
                className="text-[10px] font-bold text-[#145c3f] px-2.5 py-1 rounded-lg bg-[#e8f5ee] hover:bg-[#d4e8dc] transition-colors flex items-center gap-1 shrink-0">
                Expand <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={d.donut} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="value" paddingAngle={3} strokeWidth={0}
                    cursor="pointer" onClick={(data:any) => { setIgrZoneInit(data.name); setShowIGRByZone(true); }}>
                    {d.donut.map(dd => <Cell key={dd.name} fill={dd.color} fillOpacity={0.9} />)}
                  </Pie>
                  <DonutCenter total={igrTotal} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {d.donut.map(dd => (
                <button key={dd.name} onClick={() => { setIgrZoneInit(dd.name); setShowIGRByZone(true); }}
                  className="w-full flex items-center justify-between hover:bg-[#f0fdf7] px-2 py-1 rounded-lg transition-colors group">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor:dd.color }} />
                    <span className="text-[11px] text-[#5a7a6a]">{dd.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-700">{dd.value}%</span>
                    <ChevronRight className="w-3 h-3 text-[#25a872] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Zone cards — clickable ── */}
        <div>
          <p className={lbl + " mb-3"}>Zone-Level Performance — {year}</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {d.zoneCards.map(z => {
              const pct = Math.round((z.gifship/z.gifshipMax)*100);
              const col = ZONE_COLORS[z.zone];
              return (
                <button key={z.zone} onClick={() => setDrillZone(z.zone)}
                  className={card + " p-4 text-left group hover:-translate-y-0.5 transition-all"}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">{z.zone}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor:col+"18", color:col, borderColor:col+"40" }}>{z.igr}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:col }} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-[#5a7a6a] mb-1">
                        <span>GIFSHIP</span><span className="text-slate-700 font-semibold">{fmt(z.gifship)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:col }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[#5a7a6a] mb-1">
                        <span>Resolution</span>
                        <span className="font-bold" style={{ color:resColor(z.resolution) }}>{z.resolution}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#e8f5ee] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${z.resolution}%`, backgroundColor:resColor(z.resolution) }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-semibold mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:col }}>
                    View states <ChevronRight className="w-3 h-3" />
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── State Performance Table — with zone+state filter ── */}
        <div className="rounded-2xl border border-[#d4e8dc] bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#d4e8dc] bg-[#f0fdf7]">
            <p className="text-sm font-bold text-slate-800">State Performance Table — {year}</p>
            <p className="text-[10px] text-[#5a7a6a] mt-0.5">Filter by zone or state · click a row for full detail</p>
          </div>
          <StateFilterTable rows={d.stateTable} year={year} onStateClick={row => setDrillState(row.state)} initialZone={zoneFilterFromApi} />
        </div>

        {/* ── Complaint management ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={card + " p-5"}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-bold text-slate-800">Top 10 States by Complaint Volume — {year}</p>
                <p className="text-[10px] text-[#5a7a6a]">Bar colour = resolution rate · click bar for detail</p>
              </div>
              <button onClick={() => setShowComplaints(true)}
                className="text-[10px] font-bold text-[#145c3f] px-2.5 py-1 rounded-lg bg-[#e8f5ee] hover:bg-[#d4e8dc] transition-colors flex items-center gap-1 shrink-0">
                Expand <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={d.complaintBars} layout="vertical" barSize={12} margin={{ left:8, right:16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8f5ee" />
                <XAxis type="number" tick={{ fontSize:10, fill:"#5a7a6a" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="state" tick={{ fontSize:11, fill:"#334155", fontWeight:600 }} axisLine={false} tickLine={false} width={60} />
                <RTooltip contentStyle={{ background:"#fff", border:"1px solid #d4e8dc", borderRadius:12, fontSize:12 }}
                  formatter={(v:number,_:string,p:any)=>[`${v} complaints · ${p.payload.resolution}% resolved`, p.payload.state]} />
                <Bar dataKey="complaints" radius={[0,6,6,0]} cursor="pointer"
                  onClick={(data:any) => setDrillState(data.state)}>
                  {d.complaintBars.map(b => <Cell key={b.state} fill={b.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={card + " p-5"}>
            <p className="text-sm font-bold text-slate-800 mb-1">Resolution Leaderboard</p>
            <p className="text-[10px] text-[#5a7a6a] mb-4">States with highest resolution rates</p>
            <div className="space-y-2.5">
              {[...d.stateTable].filter(s=>s.complaints>0).sort((a,b)=>b.resolution-a.resolution).slice(0,6).map((s,i) => (
                <div key={s.state} className="flex items-center gap-3 p-3 rounded-xl bg-[#f0fdf7] border border-[#d4e8dc] hover:border-[#25a872] transition-all">
                  <span className="w-6 h-6 rounded-full bg-[#145c3f] text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{s.state}</p>
                    <p className="text-[10px] text-[#5a7a6a]">{s.zone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#145c3f]">{s.complaints} complaints</p>
                    <p className="text-[10px] text-emerald-600">{s.resolution}% resolved</p>
                  </div>
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
