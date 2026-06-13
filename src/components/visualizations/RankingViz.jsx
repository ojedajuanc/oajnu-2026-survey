import { useState } from 'react';
import Button from '../ui/Button.jsx';

// Lower average rank = better. Bar length is inverted so a better rank shows a fuller bar.
export default function RankingViz({ question, result }) {
  const [view, setView] = useState('avg'); // 'avg' | 'freq'
  const items = question.config.items || [];
  const selectCount = question.config.selectCount || result?.selectCount || items.length;
  const { averages = {}, frequency = {}, total = 0 } = result || {};

  const ordered = [...items]
    .map((it) => ({ ...it, avg: averages[it.id] }))
    .sort((a, b) => {
      if (a.avg == null) return 1;
      if (b.avg == null) return -1;
      return a.avg - b.avg;
    });

  return (
    <div>
      <div className="viz-toggle">
        <Button
          variant={view === 'avg' ? 'primary' : 'outline'}
          onClick={() => setView('avg')}
          style={{ marginRight: 8 }}
        >
          Promedio
        </Button>
        <Button variant={view === 'freq' ? 'primary' : 'outline'} onClick={() => setView('freq')}>
          Frecuencia
        </Button>
      </div>

      {view === 'avg' ? (
        <div>
          {ordered.map((it) => {
            // score: closer to rank 1 → fuller bar
            const score =
              it.avg == null ? 0 : ((selectCount - it.avg + 1) / selectCount) * 100;
            return (
              <div className="bar-row" key={it.id}>
                <div className="bar-row__label">
                  <span>{it.label}</span>
                  <span>{it.avg == null ? '—' : `Ø ${it.avg.toFixed(1)}`}</span>
                </div>
                <div className="bar-row__track">
                  <div className="bar-row__fill" style={{ width: `${Math.max(0, score)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <table className="freq-table">
          <thead>
            <tr>
              <th>Ítem</th>
              {Array.from({ length: selectCount }, (_, i) => (
                <th key={i}>#{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td className="label-cell">{it.label}</td>
                {Array.from({ length: selectCount }, (_, i) => {
                  const rank = i + 1;
                  const count = frequency[it.id]?.[rank] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  // Heatmap: alpha proporcional al %, texto oscuro/blanco según intensidad
                  const alpha = pct / 100;
                  return (
                    <td
                      key={i}
                      style={{
                        backgroundColor: `rgba(37, 99, 235, ${alpha})`,
                        color: alpha > 0.55 ? '#fff' : 'inherit',
                      }}
                    >
                      {pct}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
