/**
 * 七宗遊園 (Hichiso Yuen) - Front-End Logic
 * Vanilla JSのみを使用し、軽量かつ高速に動作させます。
 */

// ページ読み込み完了時に各機能を一斉にスタートさせます
document.addEventListener('DOMContentLoaded', () => {
  renderGlobalComponents(); // ヘッダー・フッター・追従ボタンの生成
  initHamburgerMenu();      // メニューの開閉制御
  initModalLogic();         // モーダルの制御
  initLineIntegration();    // LINE連携
  initScrollAnimation();    // フェードインアニメーション
});

/**
* 1. 共通パーツ（ヘッダー、フッター、追従ボタン）のHTMLを生成しDOMに挿入する
*/
function renderGlobalComponents() {
  // ヘッダーのHTML文字列
  const headerHTML = `
      <header class="global-header">
          <div class="header-inner">
              <h1 class="header-logo font-mincho">
                  <a href="/">七宗遊園</a>
              </h1>
              <div class="header-actions">
                  <button class="hamburger-btn" id="hamburger-btn" aria-label="メニューを開閉する">
                      <span class="hamburger-line"></span>
                      <span class="hamburger-line"></span>
                      <span class="hamburger-line"></span>
                  </button>
              </div>
          </div>
          
          <nav class="global-nav" id="global-nav">
              <ul class="nav-list font-mincho">
                  <li><a href="/">トップページ</a></li>
                  <li><a href="fishing.html">釣り堀案内</a></li>
                  <li><a href="restaurant.html">レストラン</a></li>
                  <li><a href="bbq.html">手ぶらでBBQ</a></li>
                  <li><a href="dogrun.html">ひろびろドッグラン</a></li>
                  <li><a href="story.html">こだわりとストーリー</a></li>
              </ul>
          </nav>
      </header>
  `;

  // フッターのHTML文字列
  const footerHTML = `
      <footer class="global-footer">
          <div class="footer-inner">
              <h2 class="footer-logo font-mincho">七宗遊園</h2>
              <div class="footer-info">
                  <p>〒509-0400<br>岐阜県加茂郡七宗町神渕4183-4</p>
                  <p class="footer-tel">TEL: <a href="tel:0574461128">0574-46-1128</a></p>
                  <p>営業時間: 10:00 ～ 15:00<br>定休日: 第二・第四火曜</p>
              </div>
              <div class="footer-link">
                  <a href="access.html" class="btn-access">アクセスを見る</a>
              </div>
              <p class="footer-copyright">&copy; Hichiso Yuen All Rights Reserved.</p>
          </div>
      </footer>
  `;

  // 追従ボタンのHTML文字列
  const stickyBtnHTML = `
      <div class="sticky-btn-wrapper">
          <button id="open-reservation-btn" class="btn-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              予約・料金シミュ
          </button>
      </div>
  `;

  // 挿入先コンテナが存在する場合のみHTMLを挿入（ここで一括処理）
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  const stickyBtnContainer = document.getElementById('sticky-btn-container');

  if (headerContainer) headerContainer.innerHTML = headerHTML;
  if (footerContainer) footerContainer.innerHTML = footerHTML;
  if (stickyBtnContainer) stickyBtnContainer.innerHTML = stickyBtnHTML;
}

/**
* 2. ハンバーガーメニューの開閉制御（Vanilla JS）
*/
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const globalNav = document.getElementById('global-nav');
  
  if (!hamburgerBtn || !globalNav) return;

  hamburgerBtn.addEventListener('click', function() {
      this.classList.toggle('is-active');
      globalNav.classList.toggle('is-active');
      
      // メニューが開いている時は背面のスクロールを無効化
      if (this.classList.contains('is-active')) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
  });

  // ナビゲーションのリンクをクリックしたらメニューを閉じる
  const navLinks = globalNav.querySelectorAll('a');
  navLinks.forEach(link => {
      link.addEventListener('click', () => {
          hamburgerBtn.classList.remove('is-active');
          globalNav.classList.remove('is-active');
          document.body.style.overflow = '';
      });
  });
}

/**
* 3. モーダルウィンドウの制御
*/
function initModalLogic() {
  const modal = document.getElementById('reservation-modal');
  if (!modal) return;

  document.body.addEventListener('click', (e) => {
      // 予約ボタンクリック時（モーダルを開く）
      if (e.target.closest('#open-reservation-btn') || e.target.closest('#header-reserve-btn')) {
          e.preventDefault(); // リンクのデフォルト動作を防ぐ
          modal.classList.add('is-open');
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden'; // 背面のスクロール防止
      }
      
      // 閉じるボタンまたはオーバーレイクリック時（モーダルを閉じる）
      if (e.target.closest('[data-modal-close]')) {
          modal.classList.remove('is-open');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = ''; // スクロール再開
      }
  });
}

/**
* 4. LINE連携システム（フロントエンド完結）
*/
function initLineIntegration() {
  const sendLineBtn = document.getElementById('send-line-btn');
  if (!sendLineBtn) return;

  sendLineBtn.addEventListener('click', () => {
      const selectedPlan = "BBQファミリーセット";
      const selectedDate = "未定";
      const peopleCount = "大人2名, 子供2名";

      const textMessage = `【七宗遊園 予約リクエスト】\n`
                        + `希望プラン: ${selectedPlan}\n`
                        + `希望日時: ${selectedDate}\n`
                        + `人数: ${peopleCount}\n`
                        + `------------------------\n`
                        + `※上記の内容で空き状況を確認してください。`;

      const encodedText = encodeURIComponent(textMessage);
      const lineUrl = `https://line.me/R/msg/text/?${encodedText}`;
      window.open(lineUrl, '_blank');
  });
}

/**
* 5. スクロール時のフェードインアニメーション
*/
function initScrollAnimation() {
  const targets = document.querySelectorAll('.fade-in-target');
  if (targets.length === 0) return;

  const options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0
  };

  const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
          }
      });
  }, options);

  targets.forEach(target => {
      observer.observe(target);
  });
}