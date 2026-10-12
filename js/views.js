/* Вольта — разметка экранов */
(function () {
  const D = Volta.data, M = Volta.M, F = Volta.F;
  const V = {};

  /* ---------- Иконки ---------- */
  const I = {
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9l-7 7-7-7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    sheet: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
    logo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7v8l10-12h-7z"/></svg>'
  };
  V.icons = I;

  const TABS = [
    { id: 'monitoring', href: '#/monitoring', label: 'Мониторинг', icon: I.bolt },
    { id: 'forecast', href: '#/forecast', label: 'Прогноз', icon: I.chart },
    { id: 'tariff', href: '#/tariff', label: 'Тарифы', icon: I.tag },
    { id: 'approval', href: '#/approval', label: 'Журнал', icon: I.doc }
  ];

  /* ---------- Каркас ---------- */
  V.topbar = (active) => `
    <div class="topbar__inner">
      <a class="brand" href="#/monitoring" aria-label="Вольта — на главную">
        <span class="brand__logo">${I.logo}</span>
        <span><span class="brand__name">Вольта</span><span class="brand__sub">Диспетчерская сети</span></span>
      </a>
      <nav class="desk-nav" aria-label="Разделы">${navLinks(active)}</nav>
      <div class="operator" title="${D.operator.name}, смена ${D.operator.shift}">
        <span class="operator__avatar">${D.operator.initials}</span>
        <span class="operator__text"><b>${D.operator.name}</b><span>${D.operator.shift}</span></span>
      </div>
    </div>`;

  V.tabbar = (active) => `<div class="tabbar__inner">${navLinks(active)}</div>`;

  function navLinks(active) {
    const hasPending = M.pending().length > 0;
    return TABS.map((t) => `
      <a class="tab${t.id === active ? ' is-active' : ''}" href="${t.href}"${t.id === active ? ' aria-current="page"' : ''}>
        <span class="tab__icon">${t.icon}${t.id === 'approval' && hasPending ? '<i class="tab__dot" aria-label="есть решения в ожидании"></i>' : ''}</span>
        <span class="tab__label">${t.label}</span>
      </a>`).join('');
  }

  /* ---------- Общие элементы ---------- */
  const locOptions = (withAll, allLabel) =>
    (withAll ? [['all', allLabel]] : []).concat(D.locations.map((l) => [l.id, l.name]));

  function select(name, value, options, label) {
    return `<label class="select">
      <span class="sr-only">${label}</span>
      <select data-bind="${name}" aria-label="${label}">
        ${options.map(([v, t]) => `<option value="${v}"${v === value ? ' selected' : ''}>${t}</option>`).join('')}
      </select>${I.down}</label>`;
  }

  function context({ line, status, selectHtml }) {
    return `<section class="context">
      <div class="context__line">${I.cal}<span>${line}</span></div>
      <div class="context__row">
        <span class="live"><i class="pulse"></i>${status}</span>
        ${selectHtml || ''}
      </div>
    </section>`;
  }

  const progress = (share, level) =>
    `<div class="progress progress--${level}" role="progressbar" aria-valuenow="${Math.round(share * 100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.min(100, share * 100).toFixed(1)}%"></span></div>`;

  const pctBadge = (share, level) => `<span class="badge badge--pct-${level}">${F.pct(share)}</span>`;

  const kw = (n) => `${F.int(n)}&nbsp;кВт`;

  /* ---------- 1. Мониторинг ---------- */
  V.monitoring = (S) => {
    const net = M.network();
    const crit = net.all.filter((x) => x.level === 'crit');
    const highStations = net.all.flatMap((x) => x.high.map((s) => s.id));
    const f = S.filters.monitoring;
    const shown = f === 'all' ? net.all : net.all.filter((x) => x.loc.id === f);
    const netLevel = M.level(net.share);

    return `
    ${context({
      line: `${D.now.dateLong} · текущий час ${F.range(D.now.hour)}`,
      status: `Данные на ${D.now.dataAt} · обн. ${D.now.nextUpdate}`,
      selectHtml: select('monitoring', f, locOptions(true, 'Все локации'), 'Фильтр по локациям')
    })}
    <div class="page-head"><h1>Мониторинг нагрузки и лимитов</h1></div>

    ${crit.map((x) => `
      <section class="alert" aria-label="Предупреждение о перегрузке">
        <div class="alert__body">
          <span class="alert__icon">${I.warn}</span>
          <div>
            <h2 class="alert__title">Риск превышения лимита в текущем часе: ${x.loc.name}</h2>
            <p>Нагрузка <b>${kw(x.load)}</b> при лимите <b>${kw(x.limit)}</b> (${F.pct(x.share)}). Штраф за превышение — <b class="text-red">${F.int(x.loc.fine)}&nbsp;₽</b>.</p>
          </div>
        </div>
        <a class="btn btn--alert btn--block" href="#/location/${x.loc.id}">Открыть локацию ${I.chev}</a>
      </section>`).join('')}

    <section class="metrics" aria-label="Ключевые метрики сети">
      <article class="card metric metric--wide">
        <div class="metric__head"><span>Нагрузка сети сейчас</span>${pctBadge(net.share, netLevel)}</div>
        <div class="metric__value"><b>${F.int(net.load)}</b><span>/ ${F.int(net.limit)} кВт</span></div>
        ${progress(net.share, netLevel)}
      </article>
      <article class="card metric">
        <span class="metric__label">Локации с риском</span>
        <b class="metric__num ${crit.length ? 'text-amber' : ''}">${crit.length}</b>
        <span class="metric__note">${crit.length ? crit.map((x) => x.loc.name).join(', ') : 'нет'}</span>
      </article>
      <article class="card metric">
        <span class="metric__label">Станции с высокой нагр.</span>
        <b class="metric__num ${highStations.length ? 'text-amber' : ''}">${highStations.length}</b>
        <span class="metric__note">${highStations.length ? highStations.join(', ') : 'нет'}</span>
      </article>
    </section>

    <section aria-label="Нагрузка по локациям">
      <div class="section-head">
        <h2>Нагрузка по локациям в текущем часе</h2>
        <div class="legend">
          <span><i class="sw sw--ok"></i>до 75%</span>
          <span><i class="sw sw--warn"></i>75–90%</span>
          <span><i class="sw sw--crit"></i>от 90%</span>
        </div>
      </div>
      <div class="grid grid--locs">
        ${shown.map(locCard).join('')}
      </div>
    </section>

    <section class="actions">
      <a class="btn btn--secondary btn--lg" href="#/forecast">Открыть прогноз на сутки</a>
      <a class="btn btn--primary btn--lg" href="#/tariff">Перейти к расчёту тарифа ${I.arrow}</a>
    </section>`;
  };

  function locCard(x) {
    const crit = x.level === 'crit';
    return `
    <article class="card loc-card loc-card--${x.level}">
      ${crit ? '<span class="corner-tag">Внимание</span>' : ''}
      <h3>${x.loc.name}</h3>
      <span class="muted-s">Лимит: ${kw(x.limit)}</span>
      <div class="gauge">
        <div class="gauge__row"><span><b>${F.int(x.load)}</b> <span class="muted">/ ${kw(x.limit)}</span></span>${pctBadge(x.share, x.level)}</div>
        ${progress(x.share, x.level)}
      </div>
      <dl class="mini-stats">
        <div><dt>Запас</dt><dd>${kw(x.reserve)}</dd></div>
        <div><dt>Перегрузка</dt><dd class="${x.high.length ? 'text-amber-d' : ''}">${x.high.length} из ${x.loc.stations.length}</dd></div>
        <div><dt>Штраф</dt><dd>${F.int(x.loc.fine)}&nbsp;₽</dd></div>
      </dl>
      <a class="btn btn--outline btn--block btn--sm" href="#/location/${x.loc.id}">Станции ${I.chev}</a>
    </article>`;
  }

  /* ---------- 2. Локация ---------- */
  V.location = (S, id) => {
    const loc = M.loc(id);
    if (!loc) return V.notFound();
    const x = M.locStats(loc);
    const badge = { crit: ['badge--solid-amber', 'Риск превышения'], warn: ['badge--amber', 'Повышенная нагрузка'], ok: ['badge--blue', 'В норме'] }[x.level];
    const n = loc.stations.length;

    return `
    <nav class="crumbs" aria-label="Хлебные крошки"><a href="#/monitoring">Мониторинг</a><span>/</span><span>${loc.name}</span></nav>
    <div class="page-head page-head--row">
      <h1>${loc.name}</h1>
      <span class="badge ${badge[0]} badge--caps">${badge[1]}</span>
    </div>
    <div class="strip"><span class="live"><i class="pulse"></i>Текущий час ${F.range(D.now.hour)}</span><span class="muted-s">данные на ${D.now.dataAt}</span></div>

    <div class="layout-2">
      <div class="stack">
        <section class="metrics metrics--2">
          <article class="card metric"><span class="metric__label">Нагрузка сейчас</span><b class="metric__num ${x.level !== 'ok' ? 'text-amber' : ''}">${F.int(x.load)} <small>кВт</small></b></article>
          <article class="card metric"><span class="metric__label">Лимит на час</span><b class="metric__num">${F.int(x.limit)} <small>кВт</small></b></article>
        </section>

        <section class="card ${x.level === 'ok' ? '' : 'card--warn'}">
          <div class="card__head">
            <div><h2>${x.level === 'crit' ? 'Риск превышения лимита' : x.level === 'warn' ? 'Нагрузка приближается к лимиту' : 'Нагрузка в норме'}</h2>
            <p class="muted-s">Текущий час ${F.range(D.now.hour)}</p></div>
            ${x.level !== 'ok' ? '<span class="ping" aria-hidden="true"></span>' : ''}
          </div>
          <div class="kv ${x.level === 'ok' ? 'kv--plain' : ''}">
            <div><span>Нагрузка</span><b>${kw(x.load)}</b></div>
            <div><span>Лимит электросети</span><b>${kw(x.limit)}</b></div>
            <div class="kv__total"><span>Запас</span><b>${kw(x.reserve)} · ${F.pct(x.reserve / x.limit)}</b></div>
          </div>
          <div class="fine"><span>Штраф при превышении:</span><b>${F.int(loc.fine)}&nbsp;₽</b></div>
          <div class="stack stack--tight">
            <button class="btn btn--primary btn--block" data-action="goto-tariff" data-loc="${loc.id}">Перейти к расчёту тарифа</button>
            <button class="btn btn--outline btn--block" data-action="goto-forecast" data-loc="${loc.id}">Открыть прогноз на сутки</button>
            <a class="btn btn--link" href="#/monitoring">${I.back} Ко всем локациям</a>
          </div>
        </section>
      </div>

      <section aria-label="Станции локации">
        <div class="section-head section-head--row"><h2>Станции локации</h2><span class="muted-s">${n} ${F.plural(n, 'станция', 'станции', 'станций')}</span></div>
        <div class="grid grid--stations">${loc.stations.map(stationCard).join('')}</div>
      </section>
    </div>`;
  };

  function stationCard(s) {
    const high = M.stationHigh(s);
    const share = M.stationShare(s);
    const full = s.busy >= s.connectors;
    return `
    <article class="card station${high ? ' station--high' : ''}">
      <div class="station__head">
        <div>
          <b>${s.id}</b> <span class="${full ? 'text-amber-d' : 'muted-s'}">· ${full ? '100% занято' : s.connectors + ' ' + F.plural(s.connectors, 'разъём', 'разъёма', 'разъёмов')}</span>
          <p class="muted-s">${s.address}</p>
        </div>
        <span class="badge ${high ? 'badge--solid-amber-d' : 'badge--blue-o'}">${high ? 'Высокая нагрузка' : 'Норма'}</span>
      </div>
      <div class="station__rows">
        <div><span>Занято разъёмов:</span><b class="${full ? 'text-amber-d' : ''}">${s.busy} / ${s.connectors}</b></div>
        <div><span>Нагрузка:</span><b>${s.load} <span class="muted">/ ${s.max} кВт</span></b></div>
        <div class="station__bar"><span>Загрузка мощности</span><b class="${high ? 'text-amber-d' : ''}">${F.pct(share)}</b></div>
        ${progress(share, high ? 'crit' : 'ok')}
      </div>
    </article>`;
  }

  /* ---------- 3. Прогноз ---------- */
  V.forecast = (S, ui) => {
    const f = S.filters.forecast;
    const metric = S.filters.metric;
    const fc = M.forecast(f);
    const dm = M.demand(f);
    const peakI = fc.reduce((b, x, i) => (x.load > fc[b].load ? i : b), 0);
    const vals = metric === 'load' ? fc.map((x) => x.load) : dm.byHour;
    const sel = ui.chartSel == null ? (metric === 'load' ? peakI : vals.indexOf(Math.max(...vals))) : ui.chartSel;
    const loc = f === 'all' ? null : M.loc(f);
    const riskCount = fc.filter((x) => x.risk).length;

    return `
    ${context({
      line: `${D.now.dateShort}, 14:00 — 13.10.2026, 13:00`,
      status: `Обновлён в ${D.now.forecastAt} · следующее в ${D.now.nextUpdate}`,
      selectHtml: select('forecast', f, locOptions(true, 'Вся сеть'), 'Локация прогноза')
    })}
    <div class="page-head"><h1>Прогноз спроса и нагрузки на сутки</h1></div>

    <section class="metrics metrics--3">
      <article class="card metric">
        <span class="metric__label">Ожидаемый спрос за сутки</span>
        <b class="metric__num metric__num--xl">${F.int(dm.total)}</b>
        <span class="metric__note">сессий</span>
      </article>
      <article class="card metric">
        <span class="metric__label">Пик нагрузки ${loc ? 'локации' : 'сети'}</span>
        <b class="metric__num metric__num--xl">${F.int(fc[peakI].load)} <small>кВт</small></b>
        <span><span class="badge badge--rose">в ${F.hh(fc[peakI].hour)}</span></span>
      </article>
      <article class="card metric metric--hide-m">
        <span class="metric__label">Часов с риском превышения</span>
        <b class="metric__num metric__num--xl ${riskCount ? 'text-amber' : ''}">${riskCount}</b>
        <span class="metric__note">${riskCount ? fc.filter((x) => x.risk).map((x) => F.hh(x.hour)).join(', ') : 'нет'}</span>
      </article>
    </section>

    <section class="card">
      <div class="card__head"><h2>Прогноз по часам</h2><span class="muted-s">24 часа</span></div>
      <div class="seg" role="tablist" aria-label="Показатель">
        <button role="tab" class="${metric === 'load' ? 'is-on' : ''}" aria-selected="${metric === 'load'}" data-action="metric" data-v="load">Нагрузка, кВт</button>
        <button role="tab" class="${metric === 'demand' ? 'is-on' : ''}" aria-selected="${metric === 'demand'}" data-action="metric" data-v="demand">Спрос, сессий</button>
      </div>
      ${chart(fc, vals, metric, sel, loc)}
      <div class="legend legend--col">
        <span><i class="sw sw--bar"></i>${metric === 'load' ? (loc ? 'Нагрузка локации' : 'Нагрузка сети') : 'Зарядные сессии'}</span>
        <span><i class="sw sw--risk"></i>${loc ? 'Час с риском превышения лимита локации (от 90%)' : 'Час с риском превышения лимита хотя бы в одной локации'}</span>
        ${metric === 'load' && loc ? '<span><i class="sw sw--line"></i>Лимит электросети</span>' : ''}
      </div>
    </section>

    <section class="card">
      <div class="card__head"><h2>Прогноз спроса по типам</h2><span class="muted-s">за сутки, ${loc ? loc.name.toLowerCase() : 'вся сеть'}</span></div>
      <div class="rows rows--types">
        ${dm.types.map((t) => `
          <article class="row">
            <div class="row__top"><b>${t.name}</b><span class="badge badge--green">+${t.growth}%</span></div>
            <div class="row__bottom"><span>Сессий: <b>${F.int(t.total)}</b></span><span>Пик: <b>${F.hh(t.peak[0])}–${F.hh(t.peak[1])}</b></span></div>
          </article>`).join('')}
      </div>
    </section>

    <section class="actions">
      <button class="btn btn--primary btn--lg" data-action="goto-tariff" data-loc="${loc ? loc.id : ''}">Перейти к расчёту тарифа ${I.arrow}</button>
      <a class="btn btn--secondary btn--lg" href="#/monitoring">Открыть мониторинг</a>
    </section>`;
  };

  function niceTop(v) {
    const step = v > 1000 ? 100 : v > 300 ? 100 : 50;
    return Math.ceil(v / step) * step;
  }

  function chart(fc, vals, metric, sel, loc) {
    const showLimit = metric === 'load' && loc;
    const top = niceTop(Math.max(...vals, showLimit ? loc.limit : 0) * 1.06);
    const unit = metric === 'load' ? 'кВт' : 'сессий';
    const s = fc[sel];
    const v = vals[sel];
    const info = metric === 'load'
      ? `${F.int(v)} кВт · ${F.pct(s.share)} лимита${s.risk ? ' · <b class="text-red">риск превышения</b>' : ''}`
      : `${F.int(v)} сессий${s.risk ? ' · <b class="text-red">час с риском</b>' : ''}`;
    return `
    <div class="chart-meta"><span>Шкала: 0–${F.int(top)} ${unit}</span><span class="swipe-hint">Свайп для просмотра →</span></div>
    <div class="chart-scroll">
      <div class="chart">
        <div class="chart__plot">
          <i class="chart__grid" style="bottom:100%"></i><i class="chart__grid" style="bottom:50%"></i>
          ${showLimit ? `<i class="chart__limit" style="bottom:${(loc.limit / top * 100).toFixed(1)}%"><span>Лимит ${loc.limit}</span></i>` : ''}
          ${vals.map((val, i) => `
            <button class="bar${fc[i].risk ? ' bar--risk' : ''}${i === sel ? ' is-sel' : ''}" data-action="bar" data-i="${i}" aria-label="${F.hh(fc[i].hour)}: ${F.int(val)} ${unit}">
              <span class="bar__fill" style="height:${(val / top * 100).toFixed(1)}%"><span class="bar__val">${F.int(val)}</span></span>
            </button>`).join('')}
        </div>
        <div class="chart__axis">${fc.map((x, i) => `<span class="${x.risk ? 'is-risk' : ''}${i === sel ? ' is-sel' : ''}">${String(x.hour).padStart(2, '0')}</span>`).join('')}</div>
      </div>
    </div>
    <div class="chart-info"><b>${F.range(s.hour)}</b> — ${info}</div>`;
  }

  /* ---------- 4. Расчёт тарифа ---------- */
  V.tariff = (S, ui) => {
    const id = S.filters.tariffLoc;
    const loc = M.loc(id);
    const cor = S.corridors[id];
    const recs = M.recommend(id, cor);
    const r = recs[0];
    const cur = D.currentTariff;
    const draft = ui.corridorDraft && ui.corridorDraft.loc === id ? ui.corridorDraft : { min: cor.min, max: cor.max };
    const pos = (v) => Math.max(0, Math.min(100, ((v - cor.min) / (cor.max - cor.min)) * 100));
    const calcAt = S.calcAt ? F.time(S.calcAt) : D.now.calcAt;

    const recCard = r ? `
      <section class="card stack" aria-label="Рекомендация">
        <div>
          <h2 class="h-lg">Рекомендация на ${F.range(r.hour)}</h2>
          <p class="muted-s">${loc.name} · прогноз нагрузки ${kw(r.base)} при лимите ${kw(r.limit)}</p>
        </div>
        <div class="price"><b>${F.rub(r.price)}</b><span>₽/кВт·ч</span></div>
        <div class="scale">
          <div class="scale__track">
            <i class="scale__cur" style="left:${pos(cur)}%" title="Текущий ${F.rub(cur)} ₽"></i>
            <i class="scale__rec" style="left:${pos(r.price)}%" title="Рекомендация ${F.rub(r.price)} ₽"></i>
          </div>
          <div class="scale__labels"><span>${F.rub(cor.min)} ₽</span><span>${F.rub(cor.max)} ₽</span></div>
          <div class="legend legend--center"><span><i class="sw sw--rec"></i>рекомендация</span><span><i class="sw sw--cur"></i>текущий ${F.rub(cur)} ₽</span></div>
        </div>
        ${r.capped ? `<p class="note note--amber">Расчётный тариф выше верхней границы коридора — рекомендация ограничена ${F.rub(cor.max)} ₽.</p>` : ''}
        <div class="metrics metrics--2 metrics--flat">
          <div class="delta"><span>Ожидаемая нагрузка</span><b>${F.int(r.base)} <i>→</i> <em class="${r.resolved ? 'text-green' : 'text-amber'}">${kw(r.after)}</em></b></div>
          <div class="delta"><span>Выручка за час</span><b>${F.int(r.revenueBefore)} <i>→</i> <em class="text-blue">${F.int(r.revenueAfter)}&nbsp;₽</em></b></div>
        </div>
        <div class="divider"></div>
        <div>
          <h3 class="h-sm">Варианты тарифа по типам клиентов</h3>
          <div class="rows rows--compact">
            ${M.segmentPrices(r.price).map((s) => `
              <div class="row row--inline"><div><b>${s.name}</b><span class="mono">Коэффициент × ${s.coef.toFixed(2).replace('.', ',')}</span></div><b>${F.rub(s.price)} <small>₽/кВт·ч</small></b></div>`).join('')}
          </div>
        </div>
      </section>` : `
      <section class="card stack empty">
        <span class="empty__icon">${I.check}</span>
        <h2 class="h-lg">Часов с риском нет</h2>
        <p class="muted-s">По прогнозу нагрузка в локации «${loc.name}» не превысит ${F.pct(D.riskShare)} лимита в ближайшие сутки. Тариф остаётся текущим — <b>${F.rub(cur)} ₽/кВт·ч</b>.</p>
      </section>`;

    return `
    <nav class="crumbs"><span>Тарифы</span></nav>
    <div class="page-head"><h1>Расчёт рекомендуемого тарифа</h1>
      <span class="badge badge--green-o"><i class="pulse"></i>Новый прогноз получен в ${D.now.forecastAt} · расчёт в ${calcAt}</span>
    </div>

    <div class="layout-2">
      <div class="stack">${recCard}</div>

      <div class="stack">
        <section class="card stack" aria-label="Ценовой коридор">
          <div><h2>Ценовой коридор</h2><p class="muted-s">Система рекомендует тариф только внутри этих границ</p></div>
          <div class="field">
            <span class="field__label">Локация</span>
            ${select('tariffLoc', id, locOptions(false), 'Локация').replace('class="select"', 'class="select select--field"')}
          </div>
          <div class="grid grid--2">
            ${stepper('min', 'Нижняя граница, ₽/кВт·ч', draft.min)}
            ${stepper('max', 'Верхняя граница, ₽/кВт·ч', draft.max)}
          </div>
          ${ui.corridorError ? `<p class="note note--red" role="alert">${ui.corridorError}</p>` : ''}
          <button class="btn btn--dark btn--block" data-action="save-corridor">Сохранить коридор</button>
          <p class="note">Действует коридор <b>${F.rub(cor.min)} — ${F.rub(cor.max)} ₽</b>, сохранён ${F.when(cor.savedAt)}. Текущий тариф на станциях — <b>${F.rub(cur)} ₽</b>.</p>
        </section>

        <section class="card stack" aria-label="Часы с риском">
          <div><h2>Рекомендации на часы с риском</h2><p class="muted-s">Снижение пиковой нагрузки при введении тарифа</p></div>
          ${recs.length ? recs.map((x) => `
            <article class="risk-hour">
              <div class="risk-hour__top">
                <span class="time-chip">${F.hh(x.hour)}</span>
                <span class="muted-s">Тариф:</span><b>${F.rub(x.price)} ₽</b>
                <span class="badge ${x.resolved ? 'badge--green' : 'badge--amber'}">${x.resolved ? I.check + ' Риск снят' : 'Риск снижен'}</span>
              </div>
              <div class="risk-hour__cmp">
                <div><span>Без изменений:</span><span class="badge badge--solid-red">${kw(x.base)} · ${F.pct(x.baseShare)}</span></div>
                <i>→</i>
                <div class="ta-r"><span>С новым тарифом:</span><span class="badge ${x.resolved ? 'badge--amber' : 'badge--solid-red'}">${kw(x.after)} · ${F.pct(x.afterShare)}</span></div>
              </div>
            </article>`).join('') : '<p class="note">Нет часов с риском превышения лимита.</p>'}
        </section>
      </div>
    </div>

    <section class="actions">
      <button class="btn btn--primary btn--lg" data-action="send-approval" ${recs.length ? '' : 'disabled'}>Отправить на утверждение ${I.arrow}</button>
      <button class="btn btn--secondary btn--lg" data-action="recalc">Пересчитать</button>
    </section>`;
  };

  function stepper(which, label, val) {
    return `<div class="field">
      <label class="field__label" for="cor-${which}">${label}</label>
      <div class="stepper">
        <input id="cor-${which}" inputmode="decimal" data-cor="${which}" value="${String(val).replace('.', ',')}">
        <div class="stepper__btns">
          <button type="button" aria-label="Увеличить" data-action="step" data-w="${which}" data-d="1">▲</button>
          <button type="button" aria-label="Уменьшить" data-action="step" data-w="${which}" data-d="-1">▼</button>
        </div>
      </div>
    </div>`;
  }

  /* ---------- 5. Утверждение и журнал ---------- */
  V.approval = (S, ui) => {
    const pend = M.pending();
    const cur = pend.find((e) => e.id === S.approvalId) || pend[0];
    const journal = M.sortedJournal();

    let left;
    if (cur) {
      const loc = M.loc(cur.locId);
      const cor = S.corridors[cur.locId];
      const edit = ui.decision === 'edit';
      const delta = cur.rec / D.currentTariff - 1;
      left = `
      <nav class="crumbs"><span>Утверждение и журнал</span><span>/</span><span>Рекомендация № ${cur.id}</span></nav>
      <div class="page-head"><h1>Утверждение тарифа</h1>
        <span class="badge badge--amber-o"><i class="pulse pulse--amber"></i>Ожидает решения · действует с ${F.hh(cur.hour)}</span>
      </div>
      ${pend.length > 1 ? `<div class="chips" role="tablist" aria-label="Ожидающие рекомендации">${pend.map((e) => `<button class="chip${e.id === cur.id ? ' is-on' : ''}" data-action="pick" data-id="${e.id}">${M.loc(e.locId).code} · ${F.hh(e.hour)}</button>`).join('')}</div>` : ''}

      <section class="card stack">
        <div class="hero">
          <p class="caps">${loc.name} · ${F.range(cur.hour)}</p>
          <p class="muted-s">Рекомендуемый тариф</p>
          <div class="hero__row"><div class="price"><b>${F.rub(cur.rec)}</b><span>₽/кВт·ч</span></div>
            <span class="badge ${delta >= 0 ? 'badge--green-o' : 'badge--blue-o'}">${delta >= 0 ? '+' : ''}${Math.round(delta * 100)}% к тек.</span></div>
        </div>
        <div>
          <h3 class="caps caps--b">На чём основана рекомендация</h3>
          <div class="tiles">
            <div class="tile tile--wide"><span>Текущая нагрузка</span><b>${F.int(cur.nowLoad)} <span class="muted">/ ${kw(cur.limit)}</span></b></div>
            <div class="tile"><span>Прогноз на ${F.hh(cur.hour)}</span><b class="text-amber">${kw(cur.forecast)}</b></div>
            <div class="tile"><span>Ожидаемый эффект</span><b>${kw(cur.after)}</b></div>
          </div>
        </div>
        <div>
          <h3 class="caps caps--b">Варианты по типам клиентов</h3>
          <div class="list-box">
            ${M.segmentPrices(cur.rec).map((s) => `<div><span>${s.name} <span class="mono">× ${s.coef.toFixed(2).replace('.', ',')}</span></span><b>${F.rub(s.price)} ₽</b></div>`).join('')}
          </div>
        </div>
      </section>

      <section class="card stack">
        <h2 class="h-lg">Ваше решение</h2>
        <div class="stack stack--tight" role="radiogroup">
          <label class="radio${!edit ? ' is-on' : ''}"><input type="radio" name="decision" value="approve" data-action="decision" ${!edit ? 'checked' : ''}>
            <span><b>Утвердить рекомендацию</b><span>Установить ${F.rub(cur.rec)} ₽/кВт·ч</span></span></label>
          <label class="radio${edit ? ' is-on' : ''}"><input type="radio" name="decision" value="edit" data-action="decision" ${edit ? 'checked' : ''}>
            <span><b>Скорректировать значение</b><span>Ввести свой тариф в пределах коридора ${F.rub(cor.min)}–${F.rub(cor.max)} ₽</span></span></label>
        </div>
        <div class="field">
          <label class="field__label" for="custom-rate">Скорректированный тариф, ₽/кВт·ч</label>
          <input class="input" id="custom-rate" inputmode="decimal" data-ui="custom" value="${F.esc(ui.custom != null ? ui.custom : F.rub(cur.rec))}" ${edit ? '' : 'disabled'}>
          ${ui.customError ? `<p class="field__err" role="alert">${ui.customError}</p>` : ''}
        </div>
        <div class="field">
          <label class="field__label" for="decision-comment">Комментарий (необязательно)</label>
          <textarea class="input" id="decision-comment" rows="2" data-ui="comment" placeholder="Например, причина корректировки">${F.esc(ui.comment || '')}</textarea>
        </div>
        <div class="stack stack--tight">
          <button class="btn btn--primary btn--block" data-action="apply" data-id="${cur.id}">Установить тариф на станциях</button>
          <button class="btn btn--outline btn--block" data-action="goto-tariff" data-loc="${cur.locId}">${I.back} К расчёту тарифа</button>
        </div>
      </section>`;
    } else {
      left = `
      <nav class="crumbs"><span>Утверждение и журнал</span></nav>
      <div class="page-head"><h1>Утверждение тарифа</h1></div>
      <section class="card stack empty">
        <span class="empty__icon">${I.check}</span>
        <h2 class="h-lg">Нет рекомендаций, ожидающих решения</h2>
        <p class="muted-s">Все рекомендации обработаны. Новые появятся после расчёта тарифа.</p>
        <a class="btn btn--primary btn--block" href="#/tariff">Перейти к расчёту тарифа ${I.arrow}</a>
      </section>`;
    }

    const statusBadge = { pending: ['badge--blue-o', 'Ожидает решения'], approved: ['badge--green-o', 'Утверждено'], corrected: ['badge--amber-o', 'Скорректировано'] };

    return `
    <div class="layout-2 layout-2--approval">
      <div class="stack">${left}</div>
      <section class="stack" aria-label="Журнал">
        <div class="section-head section-head--row"><h2 class="h-lg">Журнал рекомендаций и решений</h2></div>
        <button class="btn btn--outline btn--block btn--sm" data-action="export">${I.sheet.replace('<svg', '<svg class="text-green"')} Выгрузить в Excel</button>
        <div class="stack stack--tight">
          ${journal.map((e) => {
            const b = statusBadge[e.status];
            const setCls = e.status === 'approved' ? 'text-green' : e.status === 'corrected' ? 'text-amber-d' : 'muted';
            return `
            <article class="card log${e.id === (cur && cur.id) ? ' log--current' : ''}">
              <div class="log__head">
                <div><span class="muted-s">${e.decidedAt ? F.stamp(e.decidedAt) : '—'}</span> <b>${M.loc(e.locId).name}, ${F.hh(e.hour)}</b></div>
                <span class="badge ${b[0]}">${b[1]}</span>
              </div>
              <div class="log__grid">
                <div><span>Рекомендовано</span><b>${F.rub(e.rec)} ₽</b></div>
                <div><span>Установлено</span><b class="${setCls}">${e.set != null ? F.rub(e.set) + ' ₽' : '— —'}</b></div>
              </div>
              ${e.comment ? `<p class="log__comment">«${F.esc(e.comment)}»</p>` : ''}
              <div class="log__foot"><span>Оператор:</span><span>${e.operator || '—'}</span></div>
            </article>`;
          }).join('')}
        </div>
        <button class="btn btn--link" data-action="reset">Сбросить демо-данные</button>
      </section>
    </div>`;
  };

  V.notFound = () => `
    <section class="card stack empty">
      <h1 class="h-lg">Страница не найдена</h1>
      <a class="btn btn--primary btn--block" href="#/monitoring">К мониторингу</a>
    </section>`;

  Volta.V = V;
})();
