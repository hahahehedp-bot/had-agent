
// =============================================
// HAD-Agent — core/services/theme.js
// 테마 시스템 및 디자인 토큰 관리 서비스
// =============================================

export function initTheme(cfg) {
  const savedTheme = localStorage.getItem('had-theme');
  const themeMode = savedTheme || cfg.theme?.default || 'modern-light';
  applyTheme(themeMode);
  
  if (cfg.brand?.primaryColor) {
    document.documentElement.style.setProperty('--brand-color', cfg.brand.primaryColor);
  }
}

export function applyTheme(themeMode) {
  const themeLink = document.getElementById('themeStylesheet');
  if (themeLink) {
    themeLink.href = `core/themes/${themeMode}.css?v=5`;
  }
  localStorage.setItem('had-theme', themeMode);
}

export function getCurrentTheme() {
  const savedTheme = localStorage.getItem('had-theme');
  const isDark = document.getElementById('themeStylesheet')?.href.includes('glass-dark');
  return savedTheme || (isDark ? 'glass-dark' : 'modern-light');
}

export function toggleTheme() {
  const current = getCurrentTheme();
  const next = current.includes('glass-dark') ? 'modern-light' : 'glass-dark';
  applyTheme(next);
  return next;
}
