
// =============================================
// HAD-Agent — core/services/notification.js
// 통합 알림 및 배지 서비스
// =============================================

/**
 * 앱 아이콘 숫자 배지 업데이트
 */
export function updateAppBadge(count) {
  if (localStorage.getItem('noti-badge') === 'off') return;
  if ('setAppBadge' in navigator) {
    if (count > 0) navigator.setAppBadge(count).catch(console.error);
    else navigator.clearAppBadge().catch(console.error);
  }
}

/**
 * 통합 알림 실행 (소리, 진동, 팝업)
 */
export function triggerNotification(title, options = {}) {
  // 1. 소리
  if (localStorage.getItem('noti-sound') !== 'off') {
    const audio = new Audio('client/assets/alert.mp3'); 
    audio.play().catch(e => console.log('Audio play ignored by browser', e));
  }
  
  // 2. 진동
  if (localStorage.getItem('noti-vibe') !== 'off') {
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  }
  
  // 3. 브라우저/푸시 알림 팝업
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: options.body || '',
      icon: options.icon || 'client/assets/icon-192.png',
      badge: options.badge || 'client/assets/icon-192.png',
    });
  }
}
