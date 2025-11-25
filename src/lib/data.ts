import { Pill, Sun, Briefcase, Zap, Utensils, Bath, Moon, Gamepad2, Heart, BookOpen, Music, Droplets } from 'lucide-react';

export const ACTION_LIBRARY = {
  meds: { label: "Medicação", icon: Pill, color: "bg-blue-50 text-blue-600 border-blue-100" },
  mood: { label: "Humor", icon: Sun, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  school: { label: "Escola", icon: Briefcase, color: "bg-purple-50 text-purple-600 border-purple-100" },
  crisis: { label: "Crise", icon: Zap, color: "bg-red-50 text-red-600 border-red-100" },
  food: { label: "Alimentação", icon: Utensils, color: "bg-green-50 text-green-600 border-green-100" },
  bath: { label: "Banho", icon: Bath, color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  sleep: { label: "Sono", icon: Moon, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  play: { label: "Brincar", icon: Gamepad2, color: "bg-pink-50 text-pink-600 border-pink-100" },
  therapy: { label: "Terapia", icon: Heart, color: "bg-rose-50 text-rose-600 border-rose-100" },
  study: { label: "Estudos", icon: BookOpen, color: "bg-orange-50 text-orange-600 border-orange-100" },
  sensory: { label: "Sensorial", icon: Music, color: "bg-teal-50 text-teal-600 border-teal-100" },
  toilet: { label: "Higiene", icon: Droplets, color: "bg-sky-50 text-sky-600 border-sky-100" }
};

export const doctors = [
  { id: 1, name: "Dra. Sofia Martins", role: "Neuropediatra", rating: 4.9, reviews: 124, verified: true },
  { id: 2, name: "Dr. Pedro Silva", role: "Psiquiatra Infantil", rating: 4.8, reviews: 89, verified: true }
];

export const suggestedMoms = [
  { id: 1, name: "Carla M.", location: "Vila Yara (2km)", matchParams: ["Síndrome de Down", "7 anos"], online: true },
  { id: 2, name: "Joana F.", location: "Online", matchParams: ["Cardiopatia", "Estimulação"], online: true }
];

export const nearbyServices = [
  { id: 4, name: "APAE Osasco", type: "ONG", dist: "1.5km", rating: 4.9, free: true, address: "R. Sanazar Mardiros, 64 - Pres. Altino", phone: "(11) 3681-1000", hours: "08:00 - 17:00" },
  { id: 5, name: "Instituto Sophia Vercelli", type: "ONG", dist: "3.2km", rating: 5.0, free: true, address: "R. Euclides da Cunha, 342 - Centro", phone: "(11) 3682-0000", hours: "09:00 - 18:00" },
  { id: 1, name: "Parque da FITO", type: "Lazer", dist: "2.0km", rating: 4.7, free: true, address: "R. Georgina, 64 - Jd. das Flores", phone: "Aberto ao Público", hours: "06:00 - 18:00" },
  { id: 6, name: "Borboletário de Osasco", type: "Lazer", dist: "4.5km", rating: 4.8, free: true, address: "R. David Silva, 111 - Jd. Piratininga", phone: "(11) 3599-0000", hours: "Ter-Dom: 10:00-16:00" },
  { id: 3, name: "Instituto Singular", type: "Saúde", dist: "1.8km", rating: 5.0, free: false, address: "Av. Hilário P. de Souza, 406 - Industrial", phone: "(11) 3699-9999", hours: "08:00 - 19:00" },
  { id: 7, name: "Inovare Multidisciplinar", type: "Saúde", dist: "2.3km", rating: 4.8, free: false, address: "Av. Dr. Carlos de Moraes Barros, 315", phone: "(11) 3685-5555", hours: "08:00 - 18:00" },
];

export const eventsAgenda = [
  { id: 1, month: "ABR", day: "06", title: "Caminhada Autismo 2025", loc: "Memorial da América Latina", dist: "14km", desc: "Grande caminhada pela conscientização. Shows e atividades sensoriais." },
  { id: 2, month: "OUT", day: "15", title: "Autismo Tech 2025", loc: "Online / Híbrido", dist: "Digital", desc: "Hackathon focado em inclusão e tecnologia. Participe de casa." },
  { id: 3, month: "NOV", day: "06", title: "Reatech Brasil 2025", loc: "São Paulo Expo", dist: "18km", desc: "Maior feira de reabilitação da América Latina. Novidades em tecnologia assistiva." },
  { id: 4, month: "NOV", day: "28", title: "ExpoTEA 2025", loc: "Expo Center Norte", dist: "22km", desc: "Evento internacional dedicado ao TEA. Palestras e stands." },
];
