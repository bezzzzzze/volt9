/* Вольта — исходные данные (демо). В реальной системе приходят с бэкенда. */
window.Volta = window.Volta || {};

Volta.data = {
  // Контекст смены
  now: {
    dateLong: '12 октября 2026',
    dateShort: '12.10.2026',
    hour: 13,            // текущий час 13:00–14:00
    dataAt: '13:05',     // время среза телеметрии
    nextUpdate: '14:00',
    forecastAt: '13:00',
    calcAt: '13:02'
  },
  operator: { initials: 'ОС', name: 'Оператор смены', shift: '08:00–20:00' },

  // Параметры модели
  currentTariff: 24.0,   // ₽/кВт·ч, действует сейчас на станциях
  elasticity: 0.2865,    // снижение нагрузки на 1 долю роста цены
  warnShare: 0.75,       // от 75% — повышенная нагрузка
  riskShare: 0.90,       // от 90% — риск превышения лимита
  targetShare: 0.88,     // целевая загрузка после изменения тарифа
  priceStep: 0.5,        // шаг округления тарифа, ₽
  defaultCorridor: { min: 18, max: 35, savedAt: '2026-10-12T08:15:00' },

  segments: [
    { id: 'regular', name: 'Обычные клиенты', coef: 1.0,  sessions: 3050, growth: 4, peak: [17, 19] },
    { id: 'taxi',    name: 'Такси',           coef: 0.9,  sessions: 1690, growth: 9, peak: [7, 9] },
    { id: 'car',     name: 'Каршеринг',       coef: 0.85, sessions: 900,  growth: 7, peak: [15, 17] }
  ],

  locations: [
    {
      id: 'central', code: 'ЦР', name: 'Центральный район', limit: 500, fine: 50000,
      stations: [
        { id: 'ЗС-01', address: 'Невский пр., 48',    connectors: 6, busy: 4, load: 65,  max: 120 },
        { id: 'ЗС-02', address: 'Литейный пр., 21',   connectors: 6, busy: 3, load: 60,  max: 120 },
        { id: 'ЗС-03', address: 'Садовая ул., 32',    connectors: 6, busy: 6, load: 140, max: 150 },
        { id: 'ЗС-04', address: 'Гороховая ул., 15',  connectors: 4, busy: 2, load: 50,  max: 90 },
        { id: 'ЗС-05', address: 'Сенная пл., 3',      connectors: 6, busy: 6, load: 150, max: 160 }
      ]
    },
    {
      id: 'primorsky', code: 'ПР', name: 'Приморский район', limit: 450, fine: 50000,
      stations: [
        { id: 'ЗС-06', address: 'Приморский пр., 54',   connectors: 6, busy: 3, load: 55, max: 120 },
        { id: 'ЗС-07', address: 'Комендантский пр., 17', connectors: 6, busy: 4, load: 70, max: 120 },
        { id: 'ЗС-08', address: 'ул. Савушкина, 112',   connectors: 6, busy: 3, load: 60, max: 120 },
        { id: 'ЗС-09', address: 'Богатырский пр., 2',   connectors: 4, busy: 2, load: 45, max: 90 },
        { id: 'ЗС-10', address: 'Туристская ул., 28',   connectors: 6, busy: 3, load: 70, max: 150 }
      ]
    },
    {
      id: 'moscow', code: 'МР', name: 'Московский район', limit: 400, fine: 50000,
      stations: [
        { id: 'ЗС-11', address: 'Московский пр., 143', connectors: 6, busy: 3, load: 60, max: 120 },
        { id: 'ЗС-12', address: 'пл. Победы, 1',       connectors: 6, busy: 3, load: 55, max: 120 },
        { id: 'ЗС-13', address: 'Ленинский пр., 160',  connectors: 4, busy: 2, load: 50, max: 90 },
        { id: 'ЗС-14', address: 'ул. Типанова, 21',    connectors: 6, busy: 2, load: 45, max: 120 },
        { id: 'ЗС-15', address: 'Пулковское ш., 25',   connectors: 6, busy: 3, load: 50, max: 120 }
      ]
    },
    {
      id: 'pulkovo', code: 'АП', name: 'Аэропорт Пулково', limit: 350, fine: 50000,
      stations: [
        { id: 'ЗС-16', address: 'Терминал, парковка P1', connectors: 6, busy: 3, load: 50, max: 150 },
        { id: 'ЗС-17', address: 'Терминал, парковка P2', connectors: 6, busy: 2, load: 45, max: 120 },
        { id: 'ЗС-18', address: 'Пулковское ш., 41',     connectors: 6, busy: 2, load: 40, max: 120 },
        { id: 'ЗС-19', address: 'Стартовая ул., 8',      connectors: 6, busy: 3, load: 45, max: 120 }
      ]
    }
  ],

  // Прогноз на сутки: часы 14:00 сегодня … 13:00 завтра
  forecastHours: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  // Нагрузка всей сети, кВт
  networkLoad:   [1250, 1380, 1420, 1340, 1170, 1035, 930, 810, 690, 570, 480, 405, 360, 345, 375, 435, 540, 720, 885, 990, 1050, 1080, 1110, 1155],
  // Нагрузка Центрального района, кВт
  centralLoad:   [445, 480, 490, 455, 430, 400, 360, 320, 270, 220, 185, 160, 140, 135, 145, 165, 205, 270, 330, 370, 395, 410, 420, 440],
  // Как остаток сети делится между остальными локациями
  residualShares: { primorsky: 0.36, moscow: 0.33, pulkovo: 0.31 },
  // Доля спроса (сессий) по локациям
  demandShares: { central: 0.31, primorsky: 0.26, moscow: 0.24, pulkovo: 0.19 },

  // Журнал на начало смены (ожидающая рекомендация создаётся моделью при старте)
  initialJournal: [
    { locId: 'central',   hour: 14, rec: 26.0, set: 26.0, status: 'approved',  decidedAt: '2026-10-12T12:04:00' },
    { locId: 'moscow',    hour: 15, rec: 27.0, set: 26.0, status: 'corrected', decidedAt: '2026-10-12T11:03:00' },
    { locId: 'primorsky', hour: 10, rec: 22.0, set: 22.0, status: 'approved',  decidedAt: '2026-10-12T09:02:00' },
    { locId: 'pulkovo',   hour: 9,  rec: 21.5, set: 23.0, status: 'corrected', decidedAt: '2026-10-12T08:05:00' }
  ]
};
