/**
 * 七宗遊園 (Hichiso Yuen) - Front-End Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    renderGlobalComponents(); 
    initHamburgerMenu();      
    initModalLogic();         // シンプル予約モーダルの開閉
    initSimpleReservation();  // シンプル予約のLINE送信ロジック
    initScrollAnimation();    
    initFishingTabs();        
    initStickyButtonToggle(); 
    initDogrunMosaic();
    initCarousel();
  });
  
  function renderGlobalComponents() {
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
                      <li><a href="index.html">トップページ</a></li>
                      <li><a href="fishing.html">釣り堀案内</a></li>
                      <li><a href="restaurant.html">レストラン</a></li>
                      <li><a href="bbq.html">BBQ（プレミアム）</a></li>
                      <li><a href="dogrun.html">ドッグラン</a></li>
                      <li><a href="story.html">こだわりとストーリー</a></li>
                      <li><a href="access.html">アクセス</a></li>
                      <li style="margin-top: 24px; border-top: 1px dashed var(--color-main); padding-top: 24px;"><a href="simulation.html" style="color: var(--color-accent); font-weight: bold;">料金シミュレーション</a></li>
                  </ul>
              </nav>
          </header>
      `;
    
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
    
      const headerContainer = document.getElementById('header-container');
      const footerContainer = document.getElementById('footer-container');
    
      if (headerContainer) headerContainer.innerHTML = headerHTML;
      if (footerContainer) footerContainer.innerHTML = footerHTML;
    
      // ▼ シンプルになった予約モーダル
      if (!document.getElementById('reservation-modal')) {
          const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
          const yyyy = tmr.getFullYear(); const mm = String(tmr.getMonth() + 1).padStart(2, '0'); const dd = String(tmr.getDate()).padStart(2, '0');
          const minDate = `${yyyy}-${mm}-${dd}`;

          const modalHTML = `
              <div id="reservation-modal" class="modal" aria-hidden="true">
                  <div class="modal-overlay" data-modal-close></div>
                  <div class="modal-content" style="background:#FDFBF7;">
                      <button class="modal-close-btn" data-modal-close aria-label="閉じる">×</button>
                      <h3 class="font-mincho modal-title" style="margin-bottom: 24px; font-size:1.4rem; border-bottom:1px solid #ccc; padding-bottom:12px;">WEBご予約</h3>
                      
                      <div class="simple-reservation-form">
                          <label style="font-size:0.9rem; font-weight:bold; color:var(--color-main); display:block; margin-bottom:4px;">ご希望のプラン</label>
                          <select id="res-plan" style="width:100%; padding:12px; margin-bottom:16px; border:1px solid #ccc; border-radius:4px; font-size:1rem;">
                              <option value="釣り堀・お食事">釣り堀・お食事（店内・持ち帰り）</option>
                              <option value="レストラン">レストラン（お食事のみ）</option>
                              <option value="手ぶらBBQ">手ぶらBBQ（1日3組限定）</option>
                          </select>

                          <label style="font-size:0.9rem; font-weight:bold; color:var(--color-main); display:block; margin-bottom:4px;">ご希望日 <span style="color:#D96D2B;">*</span></label>
                          <input type="date" id="res-date" min="${minDate}" style="width:100%; padding:12px; margin-bottom:16px; border:1px solid #ccc; border-radius:4px; font-size:1rem;">

                          <div style="display:flex; gap:16px; margin-bottom:16px;">
                              <div style="flex:1;">
                                  <label style="font-size:0.9rem; font-weight:bold; color:var(--color-main); display:block; margin-bottom:4px;">大人</label>
                                  <input type="number" id="res-adult" min="1" value="2" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:4px; font-size:1rem;">
                              </div>
                              <div style="flex:1;">
                                  <label style="font-size:0.9rem; font-weight:bold; color:var(--color-main); display:block; margin-bottom:4px;">子供</label>
                                  <input type="number" id="res-child" min="0" value="0" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:4px; font-size:1rem;">
                              </div>
                          </div>

                          <label style="font-size:0.9rem; font-weight:bold; color:var(--color-main); display:block; margin-bottom:4px;">代表者名 <span style="color:#D96D2B;">*</span></label>
                          <input type="text" id="res-name" placeholder="山田 太郎" style="width:100%; padding:12px; margin-bottom:16px; border:1px solid #ccc; border-radius:4px; font-size:1rem;">
                          
                          <label style="font-size:0.9rem; font-weight:bold; color:var(--color-main); display:block; margin-bottom:4px;">電話番号 <span style="color:#D96D2B;">*</span></label>
                          <input type="tel" id="res-phone" placeholder="09012345678" style="width:100%; padding:12px; margin-bottom:24px; border:1px solid #ccc; border-radius:4px; font-size:1rem;">

                          <div style="background:#FDFBF7; padding:16px; border-radius:8px; margin-bottom:24px; border:1px solid #D8D2C4;">
                          <details style="margin-bottom:16px; font-size:0.85rem;">
                              <summary style="cursor:pointer; color:var(--color-main); font-weight:bold; outline:none; display: flex; align-items: center; gap: 8px;">
                                  <span style="font-size:1.2rem; color:var(--color-accent);">▼</span> キャンセルポリシー（タップして確認）
                              </summary>
                              <div style="padding-top:12px; color:#555; line-height:1.6; border-top:1px dashed #ccc; margin-top:12px;">
                                  ・ご予約の変更・キャンセルは<strong>前日の15:00まで</strong>にお願いいたします。<br>
                                  ・当日のキャンセルや無断キャンセルの場合、規定のキャンセル料（100%）が発生する場合がございます。<br>
                                  ・悪天候等で施設が休業となる場合は、キャンセル料は発生いたしません。<br>
                                  <small style="color:#A0522D; display:block; margin-top:8px;">※当日のご予約はお電話にて承ります。</small>
                              </div>
                          </details>
                          <label style="display:flex; align-items:flex-start; gap:10px; font-size:0.95rem; line-height:1.4; cursor:pointer;">
                              <input type="checkbox" id="res-policy" style="transform:scale(1.3); margin-top:2px;">
                              <span style="font-weight:bold; color:#333;">キャンセルポリシーを確認し、同意します</span>
                          </label>
                      </div>

                          <button id="res-submit-btn" style="width:100%; background:var(--color-accent); color:#fff; border:none; padding:16px; font-size:1.1rem; font-weight:bold; border-radius:50px; cursor:pointer;">LINEで予約を送信する</button>
                          <p id="res-error" style="color:#D96D2B; font-size:0.85rem; text-align:center; margin-top:12px; display:none;"></p>
                      </div>
                  </div>
              </div>
          `;
          document.body.insertAdjacentHTML('beforeend', modalHTML);
      }
  }
  
  function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const globalNav = document.getElementById('global-nav');
    if (!hamburgerBtn || !globalNav) return;
    hamburgerBtn.addEventListener('click', function() {
        this.classList.toggle('is-active');
        globalNav.classList.toggle('is-active');
        document.body.style.overflow = this.classList.contains('is-active') ? 'hidden' : '';
    });
    globalNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            globalNav.classList.remove('is-active');
            document.body.style.overflow = '';
        });
    });
  }
  
  function initScrollAnimation() {
    const targets = document.querySelectorAll('.fade-in-target');
    if (targets.length === 0) return;
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        });
    }, { threshold: 0 });
    targets.forEach(target => observer.observe(target));
  }
  
  function initFishingTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) return; 
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('is-active'));
            btn.classList.add('is-active');
            const targetContent = document.getElementById(btn.getAttribute('data-target'));
            if (targetContent) targetContent.classList.add('is-active');
        });
    });
  }
  
  function initModalLogic() {
    const modal = document.getElementById('reservation-modal');
    if (!modal) return;
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#open-reservation-btn') || e.target.closest('#header-reserve-btn') || e.target.closest('#bottom-reservation-btn') || e.target.closest('#sticky-reservation-btn')) { 
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

  function initSimpleReservation() {
      document.body.addEventListener('click', (e) => {
          if (e.target.id === 'res-submit-btn') {
              const plan = document.getElementById('modal-plan') ? document.getElementById('modal-plan').value : document.getElementById('res-plan').value;
              const date = document.getElementById('res-date').value;
              const adult = document.getElementById('res-adult').value;
              const child = document.getElementById('res-child').value;
              const name = document.getElementById('res-name').value;
              const phone = document.getElementById('res-phone').value;
              const policy = document.getElementById('res-policy').checked;
              const errorLabel = document.getElementById('res-error');

              errorLabel.style.display = 'none';

              if (!date) { errorLabel.innerText = "ご希望日を選択してください。"; errorLabel.style.display = "block"; return; }
              if (!name.trim() || !phone.trim()) { errorLabel.innerText = "お名前と電話番号を入力してください。"; errorLabel.style.display = "block"; return; }
              if (!policy) { errorLabel.innerText = "キャンセルポリシーへの同意が必要です。"; errorLabel.style.display = "block"; return; }

              const textMessage = `【七宗遊園 WEB予約リクエスト】\n■ 希望プラン: ${plan}\n■ 希望日時: ${date}\n■ 人数: 大人${adult}名 / 子供${child}名\n■ 代表者名: ${name} 様\n■ 電話番号: ${phone}\n------------------------\n※上記の内容で予約をお願いします。`;
              const encodedText = encodeURIComponent(textMessage);
              const lineUrl = `https://line.me/R/oaMessage/@543grrmg/?${encodedText}`;
              window.open(lineUrl, '_blank');
          }
      });
  }
  
  function initStickyButtonToggle() {
      const stickyContainer = document.getElementById('sticky-btn-container');
      if (!stickyContainer) return;
  
      // ▼ ボタンの文言を「WEBご予約」に変更
      stickyContainer.innerHTML = `
          <div class="sticky-btn-wrapper">
              <button id="sticky-reservation-btn" class="btn-accent sticky-reserve-btn" style="display: flex; align-items: center; gap: 8px; touch-action: manipulation; padding: 16px 24px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <div class="btn-text-wrapper" style="text-align: left; line-height: 1.2;">
                      <span class="main-text" style="font-size: 1.1rem; font-weight: bold; display: block;">WEBご予約</span>
                      <span class="sub-text" style="font-size: 0.75rem; opacity: 0.9; display: block;">簡単1分！ご予約はこちら</span>
                  </div>
              </button>
          </div>
      `;
  
      const stickyBtnWrapper = stickyContainer.querySelector('.sticky-btn-wrapper');
      const bottomCta = document.querySelector('.page-bottom-cta');
      if (!stickyBtnWrapper || !bottomCta) return;
  
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) stickyBtnWrapper.classList.add('is-hidden');
              else stickyBtnWrapper.classList.remove('is-hidden');
          });
      }, { threshold: 0 });
      observer.observe(bottomCta);
  }

  // ▼ ドッグラン用のランダムアルバム生成機能
// ▼ ドッグラン用のランダムアルバム（画像＋動画対応版）
function initDogrunMosaic() {
    const grid = document.getElementById('random-mosaic-grid');
    if (!grid) return; 

    // 1. 画像と動画のリストを用意する
    //   ※ 'type' で画像('img')か動画('video')かを指定します。
    const allMedia = [
        { type: 'img', src: 'images/dogrun/dog1.JPG' },
        { type: 'img', src: 'images/dogrun/dog2.JPG' },
        { type: 'img', src: 'images/dogrun/dog3.JPG' },
        { type: 'img', src: 'images/dogrun/dog4.JPG' },
        { type: 'img', src: 'images/dogrun/dog5.JPG' },
        { type: 'img', src: 'images/dogrun/dog6.JPG' },
        { type: 'img', src: 'images/dogrun/dog7.JPG' },
        // ▼ ここに動画（MP4やMOV）を追加！
        { type: 'video', src: 'images/dogrun/video2.MP4' },
        { type: 'video', src: 'images/dogrun/video3.MP4' },
        { type: 'video', src: 'images/dogrun/video4.MP4' },
    ];

    // 2. 6つの形（クラス名）のリスト
    const shapes = [
        'item-large', 'item-large',
        'item-tall',
        'item-wide',
        '', '' 
    ];

    // 3. 配列をシャッフルする魔法の関数
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // 4. メディアと形をそれぞれシャッフル！
    const shuffledMedia = shuffle([...allMedia]).slice(0, 6); // 10個から6個を選ぶ
    const shuffledShapes = shuffle([...shapes]);

    // 5. HTMLを組み立てて流し込む
    let html = '';
    for (let i = 0; i < 6; i++) {
        const shapeClass = shuffledShapes[i] ? ` ${shuffledShapes[i]}` : '';
        const media = shuffledMedia[i];
        
        let mediaHtml = '';
        // 画像か動画かでHTMLタグを切り替える
        if (media.type === 'video') {
            mediaHtml = `<video src="${media.src}" autoplay loop muted playsinline></video>`;
        } else {
            mediaHtml = `<img src="${media.src}" alt="七宗遊園の思い出" loading="lazy">`;
        }

        html += `<div class="mosaic-item${shapeClass} no-save">${mediaHtml}<div class="glass-barrier"></div></div>`;
    }

    grid.innerHTML = html;
}

// ▼ スライダー（BBQアルバム）の動作プログラム
function initCarousel() {
    const track = document.getElementById('bbq-carousel');
    if (!track) return; // BBQページ以外では何もしない

    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('bbq-next');
    const prevBtn = document.getElementById('bbq-prev');
    const dotsContainer = document.getElementById('bbq-dots');
    let currentIndex = 0;

    // 写真の枚数に合わせて、下の「ドット」を自動で作る
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    // スライドを動かす処理
    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach(dot => dot.classList.remove('is-active'));
        dots[currentIndex].classList.add('is-active');
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
        resetInterval(); // 手動で動かしたら自動再生タイマーをリセット
    }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        updateSlider();
        resetInterval();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
        updateSlider();
        resetInterval();
    });

    // 4秒ごとに自動で次の写真に進む
    let autoPlay = setInterval(() => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        updateSlider();
    }, 4000);

    function resetInterval() {
        clearInterval(autoPlay);
        autoPlay = setInterval(() => {
            currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            updateSlider();
        }, 4000);
    }
    
    // スマホの「指スワイプ」対応
    let startX = 0;
    let endX = 0;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        if (startX - endX > 40) { // 左にスワイプ（次へ）
            currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            updateSlider();
            resetInterval();
        } else if (endX - startX > 40) { // 右にスワイプ（前へ）
            currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
            updateSlider();
            resetInterval();
        }
    }, {passive: true});
}