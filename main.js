/**
 * 七宗遊園 (Hichiso Yuen) - Front-End Logic
 * Vanilla JSのみを使用し、軽量かつ高速に動作させます。
 */

// ページ読み込み完了時に各機能を一斉にスタートさせます
document.addEventListener('DOMContentLoaded', () => {
  renderGlobalComponents(); // ヘッダー・フッター・追従ボタンの生成
  initHamburgerMenu();      // メニューの開閉制御
  initLineIntegration();    // LINE連携
  initScrollAnimation();    // フェードインアニメーション
  initFishingTabs();        // 釣り堀案内のタブ制御
  initStickyButtonToggle(); // 追従ボタンの表示・非表示制御
  ReservationSystem.init(); // 予約システムの初期化
});

/**
 * 1. 共通パーツの生成とDOMへの挿入
 */
function renderGlobalComponents() {
  // 現在のページのURLパスを取得
  const currentPath = window.location.pathname;
  
  // ▼ 予約ボタンを「隠す」ページの条件を定義
  // URLの末尾が /、index.html、restaurant.html、dogrun.html のいずれかであれば true になる
  const hideReserveBtn = currentPath.endsWith('/') || 
                         currentPath.endsWith('index.html') || 
                         currentPath.endsWith('restaurant.html') || 
                         currentPath.endsWith('dogrun.html');

  // ヘッダーのHTML文字列（${headerReserveHTML} で出し分け）
  const headerHTML = `
      <header class="global-header">
          <div class="header-inner">
              <h1 class="header-logo font-mincho">
                  <a href="index.html">七宗遊園
                  <div class="header-logo-image">
                      <img src="images/logo2.png" alt="七宗遊園" loading="lazy">
                  </div>
                  </a>
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
                  <li><a href="bbq.html">BBQ（プレミアム）</a></li>
                  <li><a href="dogrun.html">ドッグラン</a></li>
                  <li><a href="story.html">こだわりとストーリー</a></li>
                  <li><a href="access.html">アクセス</a></li>
              </ul>
          </nav>
      </header>
  `;

  // フッターのHTML文字列（変更なし）
  const footerHTML = `
      <footer class="global-footer">
          <div class="footer-inner">
              <h2 class="footer-logo font-mincho">七宗遊園</h2>
              <div class="footer-info">
                  <p>〒509-0511<br>岐阜県加茂郡七宗町神渕4183-4</p>
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

  // ▼ 追従ボタンのHTML文字列：隠さないページ（false）の場合のみ生成する
  let stickyBtnHTML = '';
  if (!hideReserveBtn) {
      stickyBtnHTML = `
          <div class="sticky-btn-wrapper">
              <button id="open-reservation-btn" class="btn-accent sticky-reserve-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <div class="btn-text-wrapper">
                      <span class="main-text">予約する</span>
                      <span class="sub-text">料金シミュレーションも可能です</span>
                  </div>
              </button>
          </div>
      `;
  }

  // 挿入先コンテナが存在する場合のみHTMLを挿入
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  const stickyBtnContainer = document.getElementById('sticky-btn-container');

  if (headerContainer) headerContainer.innerHTML = headerHTML;
  if (footerContainer) footerContainer.innerHTML = footerHTML;
  // 追従ボタンは中身がある（生成された）場合のみ挿入
  if (stickyBtnContainer) stickyBtnContainer.innerHTML = stickyBtnHTML;

  // ▼ モーダルの自動挿入：ボタンが存在するページでのみモーダル本体を読み込む
  if (!document.getElementById('reservation-modal')) {
      const modalHTML = `
          <div id="reservation-modal" class="modal" aria-hidden="true">
              <div class="modal-overlay" data-modal-close></div>
              <div class="modal-content">
                  <button class="modal-close-btn" data-modal-close aria-label="閉じる">×</button>
                  <h3 class="font-mincho modal-title">ご予約・料金シミュレーション</h3>
                  <p class="modal-desc"><br>※金額は目安です。</p>
                  
                  <div class="simulation-form-placeholder">
                      <p>（フォーム項目実装エリア）</p>
                  </div>
              </div>
          </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
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

/**
 * 6. 釣り堀ページのタブ切り替え制御
 */
function initFishingTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length === 0) return; // タブがないページでは何もしない

  tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          // ① すべてのボタンとコンテンツから is-active を外す
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('is-active'));

          // ② クリックされたボタンに is-active を付ける
          btn.classList.add('is-active');

          // ③ 対応するコンテンツを表示する
          const targetId = btn.getAttribute('data-target');
          const targetContent = document.getElementById(targetId);
          if (targetContent) {
              targetContent.classList.add('is-active');
          }
      });
  });
}

// ※既存の initModalLogic() の中のセレクタに、最下部ボタンを追加（上書き更新）
function initModalLogic() {
  const modal = document.getElementById('reservation-modal');
  if (!modal) return;

  document.body.addEventListener('click', (e) => {
      // 右下追従ボタン、ヘッダーボタン、さらに「最下部の大型ボタン」でも開くようにする
      if (e.target.closest('#open-reservation-btn') || 
          e.target.closest('#header-reserve-btn') || 
          e.target.closest('#bottom-reservation-btn')) { // ←ここを追加
          
          e.preventDefault();
          modal.classList.add('is-open');
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden'; 
      }
      
      if (e.target.closest('[data-modal-close]')) {
          modal.classList.remove('is-open');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = ''; 
      }
  });
}

/**
 * 7. 追従ボタンの表示/非表示の切り替え
 * 最下部の巨大な予約ボタンが見えたら、右下の追従ボタンを隠す
 */
// ==========================================
// 画面右下の追従予約ボタンを制御する関数
// ==========================================
function initStickyButtonToggle() {
    const stickyContainer = document.getElementById('sticky-btn-container');
    if (!stickyContainer) return;

    const currentPath = window.location.pathname;

    // 表示を隠すページ（トップページのみに設定し、ドッグランは表示させる）
    const hiddenPages = ['index','restaurant','dogrun','story','access']; // restaurantなどは既に判定ロジックがあるはずですが、ここではdogrunを除外
    const hideReserveBtn = hiddenPages.some(page => currentPath.includes(page)) || 
                           currentPath === '/' || 
                           currentPath.endsWith('/');

    if (hideReserveBtn) {
        stickyContainer.innerHTML = '';
        return; 
    }

    // ページごとの設定
    let btnClass = "btn-accent"; // デフォルトはアンバー
    let btnText = "大自然の中で釣り体験のご予約";

    if (currentPath.includes('bbq.html')) {
        btnClass = "btn-main"; // BBQページは緑
        btnText = "【1日3組限定】手ぶらBBQのご予約";
    } else if (currentPath.includes('dogrun.html')) {
        btnClass = "btn-accent"; // ドッグランページはアンバー（アクセント）
        btnText = "愛犬同伴BBQの料金シミュレーション・ご予約"; // BBQへの誘導テキスト
    }

    stickyContainer.innerHTML = `
        <div class="sticky-btn-wrapper">
            <button id="sticky-reservation-btn" class="${btnClass} sticky-btn">
                ${btnText}
            </button>
        </div>
    `;

    // 3. スクロール監視（最下部CTAが見えたら隠す）
    const stickyBtnWrapper = stickyContainer.querySelector('.sticky-btn-wrapper');
    const bottomCta = document.querySelector('.page-bottom-cta');

    // どちらかが存在しない場合は監視をスキップ
    if (!stickyBtnWrapper || !bottomCta) return;

    // オブザーバーの設定
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0 // 巨大ボタンのエリアが1pxでも画面に入ったら発火
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 巨大ボタンが画面に入った → 追従ボタンを隠す
                stickyBtnWrapper.classList.add('is-hidden');
            } else {
                // 巨大ボタンが画面から出た → 追従ボタンを再び表示する
                stickyBtnWrapper.classList.remove('is-hidden');
            }
        });
    }, options);

    // 巨大ボタンエリアの監視を開始
    observer.observe(bottomCta);
}