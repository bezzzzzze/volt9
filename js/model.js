/* Вольта — расчёты, форматирование и состояние приложения */
(function () {
  const D = Volta.data;

  /* ---------- Форматирование ---------- */
  const F = {
    int: (n) => Math.round(n).toLocaleString('ru-RU'),
    rub: (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    pct: (share) => Math.round(share * 100) + '%',
    hh: (h) => String(((h % 24) + 24) % 24).padStart(2, '0') + ':00',
    range: (h) => F.hh(h) + '–' + F.hh(h + 1),
    time: (d) => { d = new Date(d); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); },
    dm: (d) => { d = new Date(d); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0'); },
    stamp: (d) => F.dm(d) + ' ' + F.time(d),
    when: (d) => {
      const x = new Date(d), t = new Date();
      const same = x.getFullYear() === t.getFullYear() && x.getMonth() === t.getMonth() && x.getDate() === t.getDate();
      return (same ? 'сегодня' : F.dm(x)) + ' в ' + F.time(x);
    },
    plural: (n, one, few, many) => {
      const a = Math.abs(n) % 100, b = a % 10;
      if (a > 10 && a < 20) return many;
      if (b > 1 && b < 5) return few;
      if (b === 1) return one;
      return many;
    },
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    parseNum: (s) => {
      const v = parseFloat(String(s).replace(/\s/g, '').replace(',', '.'));
      return Number.isFinite(v) ? v : NaN;
    }
  };

  /* ---------- Модель ---------- */
  const M = {};

  M.loc = (id) => D.locations.find((l) => l.id === id);
  M.level = (share) => (share >= D.riskShare ? 'crit' : share >= D.warnShare ? 'warn' : 'ok');

  M.stationShare = (s) => s.load / s.max;
  M.stationHigh = (s) => M.stationShare(s) >= D.riskShare || s.busy >= s.connectors;

  M.locStats = (loc) => {
    const load = loc.stations.reduce((a, s) => a + s.load, 0);
    const share = load / loc.limit;
    const high = loc.stations.filter(M.stationHigh);
    return { loc, load, limit: loc.limit, share, level: M.level(share), reserve: loc.limit - load, high };
  };

  M.network = () => {
    const all = D.locations.map(M.locStats);
    const load = all.reduce((a, x) => a + x.load, 0);
    const limit = all.reduce((a, x) => a + x.limit, 0);
    return { all, load, limit, share: load / limit };
  };

  /** Почасовой прогноз нагрузки локации, кВт */
  M.locLoadSeries = (id) => {
    if (id === 'central') return D.centralLoad.slice();
    const k = D.residualShares[id];
    return D.networkLoad.map((v, i) => Math.round((v - D.centralLoad[i]) * k));
  };

  /** Прогноз: [{hour, load, limit, share, risk}] для локации или 'all' */
  M.forecast = (id) => {
    if (id !== 'all') {
      const loc = M.loc(id);
      return M.locLoadSeries(id).map((load, i) => {
        const share = load / loc.limit;
        return { hour: D.forecastHours[i], load, limit: loc.limit, share, risk: share >= D.riskShare };
      });
    }
    const series = D.locations.map((l) => ({ l, s: M.locLoadSeries(l.id) }));
    const limit = D.locations.reduce((a, l) => a + l.limit, 0);
    return D.forecastHours.map((hour, i) => {
      const load = series.reduce((a, x) => a + x.s[i], 0);
      const risk = series.some((x) => x.s[i] / x.l.limit >= D.riskShare);
      return { hour, load, limit, share: load / limit, risk };
    });
  };

  /** Спрос (сессии) по часам и по типам клиентов */
  M.demand = (id) => {
    const k = id === 'all' ? 1 : D.demandShares[id];
    const hours = D.forecastHours;
    const dist = (a, b) => { const d = Math.abs(a - b) % 24; return Math.min(d, 24 - d); };
    const byHour = hours.map(() => 0);
    const types = D.segments.map((seg) => {
      const total = Math.round(seg.sessions * k);
      const center = (seg.peak[0] + seg.peak[1]) / 2;
      const w = hours.map((h) => 0.12 + Math.exp(-Math.pow(dist(h + 0.5, center), 2) / (2 * 2.4 * 2.4)) + (h >= 1 && h <= 5 ? -0.08 : 0));
      const sw = w.reduce((a, b) => a + b, 0);
      const vals = w.map((x) => Math.round((x / sw) * total));
      const diff = total - vals.reduce((a, b) => a + b, 0);
      vals[w.indexOf(Math.max(...w))] += diff;
      vals.forEach((v, i) => (byHour[i] += v));
      return { ...seg, total };
    });
    return { byHour, types, total: types.reduce((a, t) => a + t.total, 0) };
  };

  M.roundPrice = (p) => Math.round(p / D.priceStep) * D.priceStep;

  /** Рекомендации тарифа по часам с риском для локации */
  M.recommend = (id, corridor) => {
    const cur = D.currentTariff;
    return M.forecast(id).filter((x) => x.risk).map((x) => {
      const target = D.targetShare * x.limit;
      const r = 1 - target / x.load;
      let price = M.roundPrice(cur * (1 + r / D.elasticity));
      const capped = price > corridor.max;
      price = Math.min(Math.max(price, corridor.min), corridor.max);
      const after = Math.round(x.load * (1 - D.elasticity * (price / cur - 1)));
      const afterShare = after / x.limit;
      return {
        hour: x.hour, base: x.load, baseShare: x.share, limit: x.limit,
        price, after, afterShare, capped,
        resolved: afterShare < D.riskShare,
        revenueBefore: x.load * cur, revenueAfter: after * price
      };
    });
  };

  M.segmentPrices = (price) => D.segments.map((s) => ({ ...s, price: Math.round(price * s.coef * 100) / 100 }));

  /* ---------- Состояние ---------- */
  const KEY = 'volta-state-v1';

  function makeRecEntry(locId, rec, nowLoad) {
    return {
      id: '2026-' + '1012' + '-' + String(rec.hour).padStart(2, '0') + (locId === 'central' ? '' : '-' + M.loc(locId).code),
      locId, hour: rec.hour, rec: rec.price, set: null, status: 'pending',
      createdAt: new Date().toISOString(), decidedAt: null, operator: null, comment: '',
      nowLoad, limit: rec.limit, forecast: rec.base, after: rec.after
    };
  }
  M.makeRecEntry = makeRecEntry;

  function initialState() {
    const corridors = {};
    D.locations.forEach((l) => (corridors[l.id] = { ...D.defaultCorridor }));
    const journal = D.initialJournal.map((e, i) => ({
      id: 'H' + i, ...e, createdAt: e.decidedAt, operator: D.operator.name, comment: ''
    }));
    const first = M.recommend('central', corridors.central)[0];
    if (first) journal.unshift(makeRecEntry('central', first, M.locStats(M.loc('central')).load));
    return {
      corridors, journal,
      calcAt: null,
      filters: { monitoring: 'all', forecast: 'all', metric: 'load', tariffLoc: 'central' },
      approvalId: null
    };
  }

  M.state = (function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.corridors && Array.isArray(s.journal)) return s;
      }
    } catch (e) { /* хранилище недоступно — работаем в памяти */ }
    return initialState();
  })();

  M.save = () => { try { localStorage.setItem(KEY, JSON.stringify(M.state)); } catch (e) { /* ignore */ } };
  M.reset = () => { M.state = initialState(); M.save(); };

  M.pending = () => M.state.journal.filter((e) => e.status === 'pending');
  M.sortedJournal = () => {
    const p = M.pending();
    const rest = M.state.journal.filter((e) => e.status !== 'pending')
      .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt));
    return p.concat(rest);
  };

  Volta.F = F;
  Volta.M = M;
})();
