import type { Language } from './types';

export const TRANSLATIONS = {
  en: {
    // Home
    'home.subtitle':        'PUZZLE GAME',
    'home.bestScore':       'BEST SCORE',
    'home.classic':         'Classic',
    'home.zen':             'Zen',
    'home.timed':           'Timed',
    'home.continue':        'CONTINUE',
    'home.games':           'GAMES',
    'home.lines':           'LINES',
    'home.combo':           'COMBO',
    'home.streak':          'STREAK',
    'home.achievements':    'ACHIEVEMENTS',

    // Game
    'game.score':           'SCORE',
    'game.best':            'BEST',
    'game.level':           'LVL',
    'game.combo':           'COMBO',
    'game.gameOver':        'GAME OVER',
    'game.newHighScore':    'NEW HIGH SCORE!',
    'game.finalScore':      'FINAL SCORE',
    'game.playAgain':       'PLAY AGAIN',
    'game.home':            'HOME',
    'game.share':           'SHARE',
    'game.paused':          'PAUSED',
    'game.resume':          'Resume',
    'game.quit':            'Quit',

    // Settings
    'settings.title':       'SETTINGS',
    'settings.gameplay':    'GAMEPLAY',
    'settings.accessibility': 'ACCESSIBILITY',
    'settings.data':        'DATA',
    'settings.about':       'ABOUT',
    'settings.sounds':      'Sound Effects',
    'settings.haptics':     'Haptic Feedback',
    'settings.colorblind':  'Colorblind Mode',
    'settings.colorblindDesc': 'Replaces piece colors with a colorblind-safe palette and adds shape patterns',
    'settings.reducedMotion': 'Reduced Motion',
    'settings.reducedMotionDesc': 'Disables animations for motion-sensitive users',
    'settings.language':    'Language',
    'settings.resetStats':  'Reset High Scores',
    'settings.resetConfirm': 'This will clear your high score and all game statistics. This cannot be undone.',
    'settings.cancel':      'Cancel',
    'settings.reset':       'Reset',
    'settings.resetDone':   'All stats have been cleared.',
    'settings.version':     'Version',

    // Shop
    'shop.title':           'SHOP',
    'shop.boardThemes':     'BOARD THEMES',
    'shop.free':            'FREE',
    'shop.active':          'Active',
    'shop.equip':           'Equip',
    'shop.notEnoughCoins':  'Not enough coins',
    'shop.needMore':        'You need {n} more coins.',

    // Stats
    'stats.title':          'STATISTICS',
    'stats.highScore':      'High Score',
    'stats.totalLines':     'Total Lines',
    'stats.bestCombo':      'Best Combo',
    'stats.avgScore':       'Avg Score',
    'stats.avgLines':       'Avg Lines',
    'stats.top10':          'TOP 10 GAMES',
    'stats.recent':         'RECENT GAMES',
    'stats.empty':          'No games played yet. Go play!',
    'stats.currentStreak':  'Current streak: {n} day',
    'stats.currentStreakPlural': 'Current streak: {n} days',
    'stats.best':           'Best: {n}',

    // Daily challenge
    'daily.title':          'DAILY CHALLENGE',
    'daily.done':           'Done!',
    'daily.complete':       'Daily Challenge Complete!',
    'daily.score':          'Score {n} points',
    'daily.lines':          'Clear {n} lines',
    'daily.pieces':         'Place {n} pieces',

    // Tutorial
    'tutorial.dragTitle':   'Drag & Drop',
    'tutorial.dragDesc':    'Drag pieces from the tray at the bottom and place them onto the 10\u00D710 board.',
    'tutorial.clearTitle':  'Clear Lines',
    'tutorial.clearDesc':   'Fill an entire row or column to clear it and earn points. Clear multiple lines at once for bonus!',
    'tutorial.comboTitle':  'Build Combos',
    'tutorial.comboDesc':   'Clear lines on consecutive turns to build combos. Each combo level multiplies your score up to 4\u00D7!',
    'tutorial.dailyTitle':  'Daily Challenges',
    'tutorial.dailyDesc':   'Complete daily goals and maintain your streak. Level up by placing pieces \u2014 the board gets harder!',
    'tutorial.skip':        'Skip',
    'tutorial.next':        'Next',
    'tutorial.go':          "LET'S GO!",

    // Power-ups
    'powerup.bomb':         'Bomb',
    'powerup.sweep':        'Sweep',
    'powerup.eraser':       'Eraser',
    'powerup.hint':         'Tap a cell on the board',
  },

  tr: {
    // Home
    'home.subtitle':        'BULMACA OYUNU',
    'home.bestScore':       'EN İYİ SKOR',
    'home.classic':         'Klasik',
    'home.zen':             'Zen',
    'home.timed':           'Süreli',
    'home.continue':        'DEVAM',
    'home.games':           'OYUN',
    'home.lines':           'SATIR',
    'home.combo':           'KOMBO',
    'home.streak':          'SERİ',
    'home.achievements':    'BAŞARILAR',

    // Game
    'game.score':           'SKOR',
    'game.best':            'EN İYİ',
    'game.level':           'SVY',
    'game.combo':           'KOMBO',
    'game.gameOver':        'OYUN BİTTİ',
    'game.newHighScore':    'YENİ REKOR!',
    'game.finalScore':      'SON SKOR',
    'game.playAgain':       'TEKRAR OYNA',
    'game.home':            'ANA SAYFA',
    'game.share':           'PAYLAŞ',
    'game.paused':          'DURAKLATILDI',
    'game.resume':          'Devam Et',
    'game.quit':            'Çık',

    // Settings
    'settings.title':       'AYARLAR',
    'settings.gameplay':    'OYNANIŞ',
    'settings.accessibility': 'ERİŞİLEBİLİRLİK',
    'settings.data':        'VERİLER',
    'settings.about':       'HAKKINDA',
    'settings.sounds':      'Ses Efektleri',
    'settings.haptics':     'Titreşim',
    'settings.colorblind':  'Renk Körü Modu',
    'settings.colorblindDesc': 'Parça renklerini renk körü dostu paletle değiştirir ve şekil desenleri ekler',
    'settings.reducedMotion': 'Azaltılmış Hareket',
    'settings.reducedMotionDesc': 'Hareket hassasiyeti olanlar için animasyonları kapatır',
    'settings.language':    'Dil',
    'settings.resetStats':  'Skorları Sıfırla',
    'settings.resetConfirm': 'Bu, en yüksek skorunuzu ve tüm oyun istatistiklerinizi siler. Geri alınamaz.',
    'settings.cancel':      'İptal',
    'settings.reset':       'Sıfırla',
    'settings.resetDone':   'Tüm istatistikler silindi.',
    'settings.version':     'Sürüm',

    // Shop
    'shop.title':           'MAĞAZA',
    'shop.boardThemes':     'TAHTA TEMALARI',
    'shop.free':            'ÜCRETSİZ',
    'shop.active':          'Aktif',
    'shop.equip':           'Seç',
    'shop.notEnoughCoins':  'Yetersiz bakiye',
    'shop.needMore':        '{n} coin daha gerekiyor.',

    // Stats
    'stats.title':          'İSTATİSTİKLER',
    'stats.highScore':      'En Yüksek Skor',
    'stats.totalLines':     'Toplam Satır',
    'stats.bestCombo':      'En İyi Kombo',
    'stats.avgScore':       'Ort. Skor',
    'stats.avgLines':       'Ort. Satır',
    'stats.top10':          'EN İYİ 10 OYUN',
    'stats.recent':         'SON OYUNLAR',
    'stats.empty':          'Henüz oyun oynanmadı. Hadi başla!',
    'stats.currentStreak':  'Mevcut seri: {n} gün',
    'stats.currentStreakPlural': 'Mevcut seri: {n} gün',
    'stats.best':           'En İyi: {n}',

    // Daily challenge
    'daily.title':          'GÜNLÜK GÖREV',
    'daily.done':           'Tamamlandı!',
    'daily.complete':       'Günlük Görev Tamamlandı!',
    'daily.score':          '{n} puan topla',
    'daily.lines':          '{n} satır temizle',
    'daily.pieces':         '{n} parça yerleştir',

    // Tutorial
    'tutorial.dragTitle':   'Sürükle & Bırak',
    'tutorial.dragDesc':    'Alttaki kutudan parçaları sürükleyip 10\u00D710\'luk tahtaya yerleştir.',
    'tutorial.clearTitle':  'Satırları Temizle',
    'tutorial.clearDesc':   'Bir satır veya sütunu tamamen doldurarak temizle ve puan kazan. Aynı anda birden fazla satır = bonus!',
    'tutorial.comboTitle':  'Kombo Yap',
    'tutorial.comboDesc':   'Ardışık turlarda satır temizleyerek kombo yap. Her kombo seviyesi skorunu 4\u00D7\'e kadar çarpar!',
    'tutorial.dailyTitle':  'Günlük Görevler',
    'tutorial.dailyDesc':   'Günlük hedefleri tamamla ve serini koru. Parça yerleştirdikçe seviye atla \u2014 tahta zorlaşır!',
    'tutorial.skip':        'Atla',
    'tutorial.next':        'İleri',
    'tutorial.go':          'HADİ BAŞLA!',

    // Power-ups
    'powerup.bomb':         'Bomba',
    'powerup.sweep':        'Süpür',
    'powerup.eraser':       'Silgi',
    'powerup.hint':         'Tahtada bir hücreye dokun',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

/**
 * Translate a key for the given language with optional interpolation.
 * Placeholder format: {name}
 */
export function t(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  const str = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  if (!params) return str;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    str,
  );
}

/** Detect system default language — returns 'tr' if device locale starts with 'tr', else 'en'. */
export function detectSystemLanguage(): Language {
  try {
    // React Native gives us a locale via Intl or Platform
    const locale = typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().locale
      : '';
    return locale.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}
