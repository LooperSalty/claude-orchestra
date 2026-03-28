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

// Demo data
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
  { name: 'Sonnet 4.6', value: 62, color: '#4f7df9' },
  { name: 'Opus 4.6', value: 25, color: '#a78bfa' },
  { name: 'Haiku 4.5', value: 13, color: '#22d3ee' },
];

const LATENCY_DATA = [
  { range: '<100ms', count: 45 },
  { range: '100-300ms', count: 120 },
  { range: '300-500ms', count: 85 },
  { range: '500ms-1s', count: 38 },
  { range: '1-3s', count: 22 },
  { range: '>3s', count: 8 },
];

const ACTIVITY_DATA: { week: number; day: number; value: number }[] = [];
for (let w = 0; w < 12; w++) {
  for (let d = 0; d < 7; d++) {
    ACTIVITY_DATA.push({ week: w, day: d, value: Math.floor(Math.random() * 5) });
  }
}

const HEATMAP_COLORS = ['var(--bg-hover)', '#1a3a2a', '#1f5f3a', '#2a8a4a', '#33b85a'];

function StatCard({ index, icon: Icon, label, value, sub, accent }: {
  index: number; icon: React.ElementType; label: string; value: string; sub?: string; accent: string;
}) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="initial" animate="animate"
      className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}20`, color: accent }}><Icon size={16} /></div>
        <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <div className="text-h2" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div className="text-small mt-1" style={{ color: 'var(--text-tertiary)' }}>{sub}</div>}
    </motion.div>
  );
}

export function MetricsPage() {
  const totalTokens = TOKEN_DATA.reduce((s, d) => s + d.tokens, 0);
  const totalCost = TOKEN_DATA.reduce((s, d) => s + d.cost, 0);

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Métriques</h1>
        <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
          Utilisation, coûts et performance — 7 derniers jours
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard index={0} icon={Activity} label="Tokens cette semaine" value={totalTokens.toLocaleString()} accent="var(--accent-primary)" sub="+12% vs semaine dernière" />
        <StatCard index={1} icon={Coins} label="Coût cette semaine" value={`$${(totalCost / 100).toFixed(2)}`} accent="var(--accent-warning)" sub="Budget: $5.00" />
        <StatCard index={2} icon={Zap} label="Latence moyenne" value="230ms" accent="var(--accent-cyan)" sub="P95: 890ms" />
        <StatCard index={3} icon={TrendingUp} label="Sessions cette semaine" value="18" accent="var(--accent-success)" sub="3 actives maintenant" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Token usage area chart */}
        <motion.div custom={4} variants={cardVariants} initial="initial" animate="animate"
          className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-h3 mb-4" style={{ color: 'var(--text-primary)' }}>Tokens par jour</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TOKEN_DATA}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f7df9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f7df9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1c2e" />
              <XAxis dataKey="day" stroke="#555873" fontSize={11} />
              <YAxis stroke="#555873" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#161825', border: '1px solid #252840', borderRadius: 8, fontSize: 12, color: '#e8e9f0' }}
                formatter={(value) => [Number(value).toLocaleString(), 'Tokens']} />
              <Area type="monotone" dataKey="tokens" stroke="#4f7df9" strokeWidth={2} fill="url(#tokenGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cost bar chart */}
        <motion.div custom={5} variants={cardVariants} initial="initial" animate="animate"
          className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-h3 mb-4" style={{ color: 'var(--text-primary)' }}>Coût par jour (cents)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TOKEN_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1c2e" />
              <XAxis dataKey="day" stroke="#555873" fontSize={11} />
              <YAxis stroke="#555873" fontSize={11} />
              <Tooltip contentStyle={{ background: '#161825', border: '1px solid #252840', borderRadius: 8, fontSize: 12, color: '#e8e9f0' }}
                formatter={(value) => [`${value}¢`, 'Coût']} />
              <Bar dataKey="cost" fill="#ffb224" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Model distribution */}
        <motion.div custom={6} variants={cardVariants} initial="initial" animate="animate"
          className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-h3 mb-4" style={{ color: 'var(--text-primary)' }}>Par modèle</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={MODEL_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {MODEL_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#161825', border: '1px solid #252840', borderRadius: 8, fontSize: 12, color: '#e8e9f0' }}
                formatter={(value) => [`${value}%`, 'Usage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {MODEL_DATA.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                {m.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Latency distribution */}
        <motion.div custom={7} variants={cardVariants} initial="initial" animate="animate"
          className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-h3 mb-4" style={{ color: 'var(--text-primary)' }}>Distribution latence</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={LATENCY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1c2e" />
              <XAxis dataKey="range" stroke="#555873" fontSize={9} />
              <YAxis stroke="#555873" fontSize={11} />
              <Tooltip contentStyle={{ background: '#161825', border: '1px solid #252840', borderRadius: 8, fontSize: 12, color: '#e8e9f0' }} />
              <Bar dataKey="count" fill="#22d3ee" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity heatmap */}
        <motion.div custom={8} variants={cardVariants} initial="initial" animate="animate"
          className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-h3 mb-4" style={{ color: 'var(--text-primary)' }}>Activité</h3>
          <div className="flex gap-0.5">
            {Array.from({ length: 12 }, (_, w) => (
              <div key={w} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }, (_, d) => {
                  const entry = ACTIVITY_DATA.find((a) => a.week === w && a.day === d);
                  return (
                    <div key={d} className="w-3.5 h-3.5 rounded-sm"
                      style={{ background: HEATMAP_COLORS[entry?.value ?? 0] }} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: 'var(--text-ghost)' }}>
            <span>Moins</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span>Plus</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
