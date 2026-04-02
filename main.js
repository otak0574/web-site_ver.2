/**
 * 七宗遊園 (Hichiso Yuen) - Front-End Logic
 * Vanilla JSのみを使用し、軽量かつ高速に動作させます。
 */

document.addEventListener('DOMContentLoaded', () => {
  initCommonComponents();
  initModalLogic();
  initLineIntegration();
});

/**
* 1. 共通パーツの一元化と動的読み込み
*/
function initCommonComponents() {
  // ヘッダーのHTML文字列 (画像の遅延読み込み lazy 指定込み)
  const headerHTML = `
      <header class="global-header">
          <h1 class="header-logo font-mincho">
              <a href="/">七宗遊園</a>
          </h1>
          <button class="hamburger-btn" aria-label="メニューを開く">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
          </button>
      </header>
  `;

  // フッターのHTML文字列
  const footerHTML = `
      <footer class="global-footer">
          <p class="font-mincho">国有林の秘密基地。七宗遊園</p>
          <p style="font-size: 0.75rem; margin-top: 16px;">&copy; Hichiso Yuen All Rights Reserved.</p>
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

  // DOMへの挿入
  document.getElementById('header-container').innerHTML = headerHTML;
  document.getElementById('footer-container').innerHTML = footerHTML;
  document.getElementById('sticky-btn-container').innerHTML = stickyBtnHTML;
}

/**
* 2. モーダルウィンドウの制御
*/
function initModalLogic() {
  const modal = document.getElementById('reservation-modal');
  // ボタン生成後にイベントリスナーを登録するため、少し遅延させるか親要素でイベント委譲する
  document.body.addEventListener('click', (e) => {
      // 予約ボタンクリック時（モーダルを開く）
      if (e.target.closest('#open-reservation-btn')) {
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
* 3. LINE連携システム（フロントエンド完結）
* 金額情報は含めず、選択項目のみをテキストとしてLINEへ送るロジック
*/
function initLineIntegration() {
  const sendLineBtn = document.getElementById('send-line-btn');
  if (!sendLineBtn) return;

  sendLineBtn.addEventListener('click', () => {
      // ※実際の案件では、ここでシミュレーションフォームの選択値を取得します。
      // 例: const selectedPlan = document.getElementById('plan-select').value;
      
      const selectedPlan = "BBQファミリーセット";
      const selectedDate = "未定";
      const peopleCount = "大人2名, 子供2名";

      // LINEに送信するテキストの組み立て（合計金額の目安は意図的に除外）
      const textMessage = `【七宗遊園 予約リクエスト】\n`
                        + `希望プラン: ${selectedPlan}\n`
                        + `希望日時: ${selectedDate}\n`
                        + `人数: ${peopleCount}\n`
                        + `------------------------\n`
                        + `※上記の内容で空き状況を確認してください。`;

      // URLエンコード
      const encodedText = encodeURIComponent(textMessage);
      
      // LINEアプリを開く（スマートフォン向け）
      const lineUrl = `https://line.me/R/msg/text/?${encodedText}`;
      
      // 新しいタブ（またはアプリ）で開く
      window.open(lineUrl, '_blank');
  });
}