/* Вольта — роутинг и обработка действий */
(function () {
  const D = Volta.data, M = Volta.M, F = Volta.F, V = Volta.V;
  const $view = document.getElementById('view');
  const $top = document.getElementById('topbar');
  const $tabs = document.getElementById('tabbar');
  const $toast = document.getElementById('toast');

  // Временное состояние интерфейса (не сохраняется)
  let ui = {};
  let lastRoute = '';

  const S = () => M.state;

  function parseRoute() {
    const parts = (location.hash || '#/monitoring').replace(/^#\/?/, '').split('/');
    return { name: parts[0] || 'monitoring', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  const TITLES = {
    monitoring: 'Мониторинг нагрузки и лимитов',
    location: 'Локация',
    forecast: 'Прогноз спроса и нагрузки',
    tariff: 'Расчёт рекомендуемого тарифа',
    approval: 'Утверждение тарифа'
  };

  function render(keepScroll) {
    const r = parseRoute();
    const key = r.name + '/' + (r.arg || '');
    if (key !== lastRoute) { ui = {}; }
    const tab = r.name === 'location' ? 'monitoring' : r.name;

    let html;
    switch (r.name) {
      case 'monitoring': html = V.monitoring(S()); break;
      case 'location': html = V.location(S(), r.arg); break;
      case 'forecast': html = V.forecast(S(), ui); break;
      case 'tariff': html = V.tariff(S(), ui); break;
      case 'approval': html = V.approval(S(), ui); break;
      default: html = V.notFound();
    }
    const y = window.scrollY;
    $top.innerHTML = V.topbar(tab);
    $tabs.innerHTML = V.tabbar(tab);
    $view.innerHTML = html;
    $view.dataset.page = r.name;

    const loc = r.name === 'location' && M.loc(r.arg);
    document.title = 'Вольта — ' + (loc ? loc.name : TITLES[r.name] || 'Диспетчерская');

    if (key !== lastRoute) {
      window.scrollTo(0, 0);
      // на мобильном пролистать график к выбранному часу
      const sel = $view.querySelector('.bar.is-sel');
      if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
    } else if (keepScroll !== false) {
      window.scrollTo(0, y);
    }
    lastRoute = key;
  }

  let toastTimer;
  function toast(msg, kind) {
    $toast.textContent = msg;
    $toast.className = 'toast is-on' + (kind ? ' toast--' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ($toast.className = 'toast'), 3200);
  }

  function go(hash) {
    if (location.hash === hash) render(); else location.hash = hash;
  }

  /* ---------- Действия ---------- */
  const actions = {
    'goto-tariff'(el) {
      if (el.dataset.loc) { S().filters.tariffLoc = el.dataset.loc; M.save(); }
      go('#/tariff');
    },
    'goto-forecast'(el) {
      if (el.dataset.loc) { S().filters.forecast = el.dataset.loc; M.save(); }
      go('#/forecast');
    },
    metric(el) {
      S().filters.metric = el.dataset.v; ui.chartSel = null; M.save(); render();
    },
    bar(el) {
      ui.chartSel = +el.dataset.i;
      const scroller = $view.querySelector('.chart-scroll');
      const sx = scroller ? scroller.scrollLeft : 0;
      render();
      const s2 = $view.querySelector('.chart-scroll');
      if (s2) s2.scrollLeft = sx;
    },
    step(el) {
      const id = S().filters.tariffLoc;
      const cor = S().corridors[id];
      const d = ui.corridorDraft && ui.corridorDraft.loc === id ? ui.corridorDraft : { loc: id, min: cor.min, max: cor.max };
      const w = el.dataset.w;
      const cur = F.parseNum(d[w]);
      d[w] = Math.max(0, (Number.isFinite(cur) ? cur : 0) + D.priceStep * +el.dataset.d);
      ui.corridorDraft = d; ui.corridorError = null;
      render();
    },
    'save-corridor'() {
      const id = S().filters.tariffLoc;
      const min = F.parseNum(document.getElementById('cor-min').value);
      const max = F.parseNum(document.getElementById('cor-max').value);
      let err = null;
      if (!Number.isFinite(min) || !Number.isFinite(max)) err = 'Введите числовые значения границ.';
      else if (min <= 0) err = 'Нижняя граница должна быть больше нуля.';
      else if (max <= min) err = 'Верхняя граница должна быть больше нижней.';
      else if (max > 100) err = 'Верхняя граница не может превышать 100 ₽/кВт·ч.';
      if (err) { ui.corridorDraft = { loc: id, min: document.getElementById('cor-min').value, max: document.getElementById('cor-max').value }; ui.corridorError = err; render(); return; }
      S().corridors[id] = { min, max, savedAt: new Date().toISOString() };
      ui.corridorDraft = null; ui.corridorError = null;
      M.save(); render();
      toast('Коридор ' + F.rub(min) + ' — ' + F.rub(max) + ' ₽ сохранён · рекомендации пересчитаны', 'ok');
    },
    recalc() {
      S().calcAt = new Date().toISOString(); M.save(); render();
      toast('Тариф пересчитан по прогнозу от ' + D.now.forecastAt, 'ok');
    },
    'send-approval'() {
      const id = S().filters.tariffLoc;
      const recs = M.recommend(id, S().corridors[id]);
      if (!recs.length) return;
      const nowLoad = M.locStats(M.loc(id)).load;
      const entries = recs.map((r) => M.makeRecEntry(id, r, nowLoad));
      const j = S().journal.filter((e) => !(e.status === 'pending' && e.locId === id));
      S().journal = entries.concat(j);
      S().approvalId = entries[0].id;
      M.save();
      toast(entries.length + ' ' + F.plural(entries.length, 'рекомендация отправлена', 'рекомендации отправлены', 'рекомендаций отправлено') + ' на утверждение', 'ok');
      go('#/approval');
    },
    pick(el) {
      S().approvalId = el.dataset.id; ui = {}; M.save(); render();
    },
    decision(el) {
      ui.decision = el.value; ui.customError = null; render();
      if (el.value === 'edit') { const i = document.getElementById('custom-rate'); if (i) { i.focus(); i.select(); } }
    },
    apply(el) {
      const e = S().journal.find((x) => x.id === el.dataset.id);
      if (!e) return;
      const cor = S().corridors[e.locId];
      let value = e.rec;
      if (ui.decision === 'edit') {
        value = F.parseNum(document.getElementById('custom-rate').value);
        if (!Number.isFinite(value)) { ui.customError = 'Введите тариф числом, например 29,5.'; render(); return; }
        if (value < cor.min || value > cor.max) { ui.customError = 'Тариф должен быть в пределах коридора ' + F.rub(cor.min) + '–' + F.rub(cor.max) + ' ₽.'; render(); return; }
        value = Math.round(value * 100) / 100;
      }
      e.set = value;
      e.status = Math.abs(value - e.rec) < 0.005 ? 'approved' : 'corrected';
      e.decidedAt = new Date().toISOString();
      e.operator = D.operator.name;
      e.comment = (document.getElementById('decision-comment').value || '').trim();
      S().approvalId = null; ui = {};
      M.save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
      toast('Тариф ' + F.rub(value) + ' ₽/кВт·ч установлен · ' + M.loc(e.locId).name + ', ' + F.hh(e.hour), 'ok');
    },
    export() {
      const head = ['Дата решения', 'Локация', 'Час', 'Рекомендовано, ₽/кВт·ч', 'Установлено, ₽/кВт·ч', 'Статус', 'Оператор', 'Комментарий'];
      const st = { pending: 'Ожидает решения', approved: 'Утверждено', corrected: 'Скорректировано' };
      const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      const rows = M.sortedJournal().map((e) => [
        e.decidedAt ? F.dm(e.decidedAt) + '.2026 ' + F.time(e.decidedAt) : '', M.loc(e.locId).name, F.range(e.hour),
        F.rub(e.rec), e.set != null ? F.rub(e.set) : '', st[e.status], e.operator || '', e.comment || ''
      ]);
      const csv = '﻿' + [head].concat(rows).map((r) => r.map(q).join(';')).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'volta-journal-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Журнал выгружен — файл откроется в Excel', 'ok');
    },
    reset() {
      if (!confirm('Вернуть демо-данные к исходному состоянию? Журнал решений и коридоры будут сброшены.')) return;
      M.reset(); ui = {}; render(); toast('Демо-данные сброшены');
    }
  };

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    if (el.type === 'radio') return; // обрабатывается в change
    const fn = actions[el.dataset.action];
    if (fn) { ev.preventDefault(); fn(el, ev); }
  });

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.matches('select[data-bind]')) {
      S().filters[el.dataset.bind] = el.value;
      if (el.dataset.bind === 'forecast') ui.chartSel = null;
      if (el.dataset.bind === 'tariffLoc') { ui.corridorDraft = null; ui.corridorError = null; }
      M.save(); render();
    } else if (el.matches('input[type=radio][data-action]')) {
      actions[el.dataset.action](el);
    }
  });

  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset.ui) ui[el.dataset.ui] = el.value;
    if (el.dataset.cor) {
      const id = S().filters.tariffLoc, cor = S().corridors[id];
      ui.corridorDraft = ui.corridorDraft && ui.corridorDraft.loc === id ? ui.corridorDraft : { loc: id, min: cor.min, max: cor.max };
      ui.corridorDraft[el.dataset.cor] = el.value;
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.cor) { ev.preventDefault(); actions['save-corridor'](); }
  });

  window.addEventListener('hashchange', () => render());
  render();
})();
