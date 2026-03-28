import { motion } from 'framer-motion';
import { Activity, Coins, Zap, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const TOKEN_DATA = [
  { day: 'Lun', tokens: 12400, cost: 18 },
  { day: 'Mar', tokens: 28300, cost: 42 },
  { day: 'Mer', tokens: 19800, cost: 30 },
  { day: 'Jeu', tokens: 45100, cost: 68 },
  { day: 'Ven', tokens: 32700, cost: 49 },
  { day: 'Sam', tokens: 8200, cost: 12 },
  { day: 'Dim', tokens: 5400, cost: 8 },
];

const MODEL_DATA = [
  { name: 'Sonnet 4.6', value: 62, color: '#00d4ff' },
  { name: 'Opus 4.6', value: 25, color: '#8b5cf6' },
  { name: 'Haiku 4.5', value: 13, color: '#00ff88' },
];

const LATENCY_DATA = [
  { range: '<100ms', count: 45 },
  { range: '100-300', count: 120 },
  { range: '300-500', count: 85 },
  { range: '500-1s', count: 38 },
  { range: '1-3s', count: 22 },
  { range: '>3s', count: 8 },
];

const ACTIVITY_DATA: { week: number; day: number; value: number }[] = [];
for (let w = 0; w < 12; w++) {
  for (let d = 0; d < 7; d++) {
    ACTIVITY_DATA.push({ week: w, day: d, value: Math.floor(Math.random() * 5) });
  }
}

const HEATMAP_COLORS = ['var(--bg-4)', '#0a3324', '#0f5a3a', '#18854e', '#22b566'];

const tooltipStyle = {
  background: 'var(--bg-3)',
  border: '1px solid var(--border-2)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--text-1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

function SectionTitle({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5" style={{ marginBottom: 20 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}40` }} />
      <h3 className="font-display font-semibold" style={{ color: 'var(--text-1)', fontSize: 14 }}>
        {children}
      </h3>
    </div>
  );
}

function StatCard({ index, icon: Icon, label, value, sub, accent }: {
  index: number; icon: React.ElementType; label: string; value: string; sub?: string; accent: string;
}) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="initial" animate="animate"
      className="card"
      style={{ padding: '20px', background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))' }}>
      <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
        <div className="flex items-center justify-center"
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: `${accent}12`, boxShadow: `0 0 16px ${accent}10`,
          }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{label}</span>
      </div>
      <div className="font-display font-bold" style={{ color: 'var(--text-0)', fontSize: '1.5rem' }}>{value}</div>
      {sub && <div className="font-mono" style={{ color: 'var(--text-4)', fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </motion.div>
  );
}

export function MetricsPage() {
  const totalTokens = TOKEN_DATA.reduce((s, d) => s + d.tokens, 0);
  const totalCost = TOKEN_DATA.reduce((s, d) => s + d.cost, 0);

  return (
    <div className="max-w-6xl" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Page Header */}
      <div>
        <h1 className="font-display font-bold tracking-tight" style={{ color: 'var(--text-0)', fontSize: '1.75rem' }}>
          Metriques
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 8 }}>
          Utilisation, couts et performance — 7 derniers jours
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 14 }}>
        <StatCard index={0} icon={Activity} label="Tokens cette semaine" value={totalTokens.toLocaleString()} accent="var(--cyan)" sub="+12% vs semaine derniere" />
        <StatCard index={1} icon={Coins} label="Cout cette semaine" value={`$${(totalCost / 100).toFixed(2)}`} accent="var(--amber)" sub="Budget: $5.00" />
        <StatCard index={2} icon={Zap} label="Latence moyenne" value="230ms" accent="var(--violet)" sub="P95: 890ms" />
        <StatCard index={3} icon={TrendingUp} label="Sessions cette semaine" value="18" accent="var(--green)" sub="3 actives maintenant" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        {/* Token usage */}
        <motion.div custom={4} variants={cardVariants} initial="initial" animate="animate"
          className="card" style={{ padding: 24 }}>
          <SectionTitle dot="var(--cyan)">Tokens par jour</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TOKEN_DATA}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString(), 'Tokens']} />
              <Area type="monotone" dataKey="tokens" stroke="#00d4ff" strokeWidth={2} fill="url(#tokenGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cost bar chart */}
        <motion.div custom={5} variants={cardVariants} initial="initial" animate="animate"
          className="card" style={{ padding: 24 }}>
          <SectionTitle dot="var(--amber)">Cout par jour (cents)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TOKEN_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}c`, 'Cout']} />
              <Bar dataKey="cost" fill="#ffb800" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16 }}>
        {/* Model distribution */}
        <motion.div custom={6} variants={cardVariants} initial="initial" animate="animate"
          className="card" style={{ padding: 24 }}>
          <SectionTitle dot="var(--violet)">Par modele</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={MODEL_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                {MODEL_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Usage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5" style={{ marginTop: 8 }}>
            {MODEL_DATA.map((m) => (
              <div key={m.name} className="flex items-center gap-2" style={{ fontSize: 11, color: 'var(--text-2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block', boxShadow: `0 0 6px ${m.color}40` }} />
                {m.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Latency distribution */}
        <motion.div custom={7} variants={cardVariants} initial="initial" animate="animate"
          className="card" style={{ padding: 24 }}>
          <SectionTitle dot="var(--green)">Distribution latence</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={LATENCY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" stroke="var(--text-4)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#00d4ff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity heatmap */}
        <motion.div custom={8} variants={cardVariants} initial="initial" animate="animate"
          className="card" style={{ padding: 24 }}>
          <SectionTitle dot="var(--amber)">Activite</SectionTitle>
          <div className="flex" style={{ gap: 3, justifyContent: 'center' }}>
            {Array.from({ length: 12 }, (_, w) => (
              <div key={w} className="flex flex-col" style={{ gap: 3 }}>
                {Array.from({ length: 7 }, (_, d) => {
                  const entry = ACTIVITY_DATA.find((a) => a.week === w && a.day === d);
                  const val = entry?.value ?? 0;
                  return (
                    <div key={d} style={{
                      width: 14, height: 14, borderRadius: 3,
                      background: HEATMAP_COLORS[val],
                      transition: 'background 0.15s ease',
                    }} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center" style={{ gap: 6, marginTop: 16, fontSize: 10, color: 'var(--text-4)' }}>
            <span>Moins</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
            ))}
            <span>Plus</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
