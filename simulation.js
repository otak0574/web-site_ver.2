/**
 * 七宗遊園 - 予約・料金シミュレーション＆LINE連携システム
 * （店内飲食時のお魚調理メニュー追加版）
 */

const ReservationSystem = {
    state: {
        isOpen: false,
        flow: null, // 'A' (釣り堀) or 'B' (BBQ)
        step: 1,
        isLoading: false, 
        
        simA: {
            purpose: '', 
            people: { adult: 0, child: 0, infant: 0 },
            date: '', 
            menus: { adultTeishoku: 0, adultTanpin: 0, childKids: 0, childCurry: 0 },
            fish: { shioyaki: 0, gyoden: 0, karaage: 0 }, // ★店内飲食時のお魚調理データ追加
            takeout: { rods: 0, fish: 0, method: '' } 
        },
        
        simB: {
            people: { adult: 0, child: 0, infant: 0, dog: 0 },
            plan: '', 
            date: ''
        },
        
        userInfo: { name: '', phone: '', policy: false }
    },

    prices: {
        A: { 
            teishoku: 2000, tanpin: 1000, kids: 1000, curry: 800,
            shioyaki: 400, gyoden: 450, karaage: 480, // ★お魚調理代追加
            takeoutRods: 1000,
            methodRaw: 400, methodGut: 420, methodGrill: 440 
        },
        B: { dogFee: 500 }
    },

    // 明日の日付を YYYY-MM-DD 形式で取得する（カレンダーの当日ブロック用）
    getTomorrowDateString() {
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        const yyyy = tmr.getFullYear();
        const mm = String(tmr.getMonth() + 1).padStart(2, '0');
        const dd = String(tmr.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    },

    init() {
        this.injectStyles();
        this.bindEvents();
    },

    injectStyles() {
        if (document.getElementById('sim-styles')) return;
        const style = document.createElement('style');
        style.id = 'sim-styles';
        style.innerHTML = `
            .sim-panel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px; }
            /* パネルの基本スタイル（高さを確保して文字を中央配置） */
            .sim-panel { border: 2px solid #ddd; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fff; font-size: 0.95rem; line-height:1.4; display: flex; align-items: center; justify-content: center; min-height: 60px; }
            .sim-panel:hover { border-color: rgba(44, 66, 52, 0.5); }
            /* ▼ 選択時のスタイルをブランドカラー（緑色）に変更 */
            .sim-panel.is-active { border-color: var(--color-main, #2C4234); background: rgba(44, 66, 52, 0.08); color: var(--color-main, #2C4234); font-weight: bold; box-shadow: 0 4px 10px rgba(44, 66, 52, 0.15); }
            
            .sim-counter-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #eee; }
            .sim-counter-controls { display: flex; align-items: center; gap: 12px; }
            .sim-btn-circle { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--color-main, #2C4234); background: #fff; color: var(--color-main, #2C4234); font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .sim-btn-circle:active { background: #eee; }
            .sim-btn-circle.is-disabled { opacity: 0.3; pointer-events: none; }
            .sim-counter-val { font-size: 1.2rem; font-weight: bold; width: 30px; text-align: center; }
            .sim-error-msg { background: #fee; color: #c00; padding: 12px; border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem; display: none; border-left: 4px solid #c00; }
            .sim-input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; margin-top: 8px; font-size: 1rem; }
            .sim-btn-block { width: 100%; padding: 16px; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; margin-bottom: 12px; text-align: center; }
            .sim-btn-primary { background: var(--color-accent, #D96D2B); color: #fff; }
            .sim-btn-secondary { background: #fff; border: 2px solid var(--color-main, #2C4234); color: var(--color-main, #2C4234); }
            .sim-receipt { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #ddd; }
            .sim-receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem; }
            .sim-receipt-total { display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 2px solid #ccc; font-size: 1.2rem; font-weight: bold; color: var(--color-accent, #D96D2B); }
            .sim-indicator { background: var(--color-main, #2C4234); color: #fff; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; text-align: center; margin-bottom: 16px; }
            .sim-indicator strong { font-size: 1.1rem; color: var(--color-accent, #D96D2B); }
            .sim-loading { text-align: center; padding: 40px 0; }
            .sim-spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: var(--color-accent, #D96D2B); animation: spin 1s ease-in-out infinite; margin-bottom: 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    },

    bindEvents() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#open-reservation-btn') || e.target.closest('#header-reserve-btn') || e.target.closest('#bottom-reservation-btn')) {
                e.preventDefault();
                const isBBQ = window.location.pathname.includes('bbq.html');
                this.startSimulation(isBBQ ? 'B' : 'A');
            }

            if (e.target.closest('[data-modal-close]')) this.closeModal();

            if (e.target.closest('.btn-next')) {
                if (this.validateCurrentStep()) {
                    this.state.step++;
                    this.render();
                }
            }

            if (e.target.closest('.btn-calculate')) {
                if (this.validateCurrentStep()) {
                    this.state.isLoading = true;
                    this.render();
                    setTimeout(() => {
                        this.state.isLoading = false;
                        this.state.step++;
                        this.render();
                    }, 1500); 
                }
            }

            if (e.target.closest('.btn-prev')) {
                this.state.step--;
                this.render();
            }

            if (e.target.closest('.sim-panel')) {
                const panel = e.target.closest('.sim-panel');
                const group = panel.dataset.group;
                const val = panel.dataset.value;
                document.querySelectorAll(`.sim-panel[data-group="${group}"]`).forEach(p => p.classList.remove('is-active'));
                panel.classList.add('is-active');
                
                if (group === 'A_purpose') {
                    this.state.simA.purpose = val;
                    // データリセット
                    this.state.simA.menus = { adultTeishoku: 0, adultTanpin: 0, childKids: 0, childCurry: 0 };
                    this.state.simA.fish = { shioyaki: 0, gyoden: 0, karaage: 0 };
                    this.state.simA.takeout = { rods: 0, fish: 0, method: '' };
                }
                if (group === 'B_plan') this.state.simB.plan = val;
                if (group === 'A_method') this.state.simA.takeout.method = val;
            }

            if (e.target.closest('.sim-btn-circle')) {
                const btn = e.target.closest('.sim-btn-circle');
                if (btn.classList.contains('is-disabled')) return; 
                const target = btn.dataset.target;
                const action = btn.dataset.action;
                this.handleCounter(target, action);
            }

            if (e.target.closest('#btn-submit-line')) {
                this.sendToLine();
            }
        });

        document.body.addEventListener('change', (e) => {
            if (e.target.id === 'sim-date') {
                if (this.state.flow === 'A') this.state.simA.date = e.target.value;
                if (this.state.flow === 'B') this.state.simB.date = e.target.value;
            }
            if (e.target.id === 'user-name') this.state.userInfo.name = e.target.value;
            if (e.target.id === 'user-phone') this.state.userInfo.phone = e.target.value;
            if (e.target.id === 'policy-check') this.state.userInfo.policy = e.target.checked;
            
            if (e.target.id === 'sim-date' && this.state.step === 4) {
                this.hideError();
            }
        });
    },

    startSimulation(flow) {
        this.state.flow = flow;
        this.state.step = 1;
        this.state.isLoading = false;
        
        this.state.simA = { 
            purpose: '', people: { adult: 0, child: 0, infant: 0 }, date: '', 
            menus: { adultTeishoku: 0, adultTanpin: 0, childKids: 0, childCurry: 0 }, 
            fish: { shioyaki: 0, gyoden: 0, karaage: 0 },
            takeout: { rods: 0, fish: 0, method: '' } 
        };
        this.state.simB = { people: { adult: 0, child: 0, infant: 0, dog: 0 }, plan: '', date: '' };
        this.state.userInfo = { name: '', phone: '', policy: false };
        
        this.state.isOpen = true;
        const modal = document.getElementById('reservation-modal');
        if(modal) {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            this.render();
        }
    },

    closeModal() {
        this.state.isOpen = false;
        const modal = document.getElementById('reservation-modal');
        if(modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    },

    handleCounter(target, action) {
        let path = target.split('.'); 
        let obj = this.state[path[0]][path[1]];
        let key = path[2];
        
        let currentVal = obj[key];
        
        if (action === 'plus') {
            if (path[0] === 'simA' && path[1] === 'menus') {
                const sA = this.state.simA;
                if (key === 'adultTeishoku' || key === 'adultTanpin') {
                    const adultMenus = sA.menus.adultTeishoku + sA.menus.adultTanpin;
                    if (adultMenus >= sA.people.adult) return; 
                }
                if (key === 'childKids' || key === 'childCurry') {
                    const childMenus = sA.menus.childKids + sA.menus.childCurry;
                    if (childMenus >= sA.people.child) return; 
                }
            }
            if (path[0] === 'simA' && path[1] === 'takeout' && key === 'rods') {
                const pA = this.state.simA.people;
                const totalPeople = pA.adult + pA.child + pA.infant; 
                if (currentVal >= totalPeople) return; 
            }
            obj[key]++;
        }
        
        if (action === 'minus' && currentVal > 0) {
            obj[key]--;
        }
        
        this.render();
    },

    showError(msg) {
        const errDiv = document.getElementById('sim-error');
        if (errDiv) {
            errDiv.innerText = msg;
            errDiv.style.display = 'block';
            errDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert(msg);
        }
    },

    hideError() {
        const errDiv = document.getElementById('sim-error');
        if(errDiv) errDiv.style.display = 'none';
    },

    validateCurrentStep() {
        this.hideError();
        const step = this.state.step;
        const sA = this.state.simA;
        const sB = this.state.simB;

        if (this.state.flow === 'A') {
            if (step === 1 && !sA.purpose) {
                this.showError('「持ち帰り」か「店内で食事」を選択してください。'); return false;
            }
            if (step === 2) {
                if (sA.people.adult + sA.people.child === 0) {
                    this.showError('ご来場者様（大人または子供）の人数を1名以上入力してください。'); return false;
                }
            }
            if (step === 3) {
                if (sA.purpose === 'eat_in') {
                    const adultMenus = sA.menus.adultTeishoku + sA.menus.adultTanpin;
                    if (adultMenus !== sA.people.adult) {
                        this.showError(`大人は人数分（${sA.people.adult}名分）のオーダーが必要です。残り${sA.people.adult - adultMenus}名分のメニューを選択してください。`); return false;
                    }
                    // お魚が1匹も選択されていない場合は警告
                    const totalFish = sA.fish.shioyaki + sA.fish.gyoden + sA.fish.karaage;
                    if (totalFish === 0) {
                        this.showError('釣ったお魚の調理方法（匹数）を1匹以上選択してください。'); return false;
                    }
                } else if (sA.purpose === 'takeout') {
                    if (sA.takeout.fish > 0 && !sA.takeout.method) {
                        this.showError('釣る予定のお魚の「調理方法」を選択してください。'); return false;
                    }
                }
            }
        }

        if (this.state.flow === 'B') {
            if (step === 1) {
                if (sB.people.adult + sB.people.child === 0) {
                    this.showError('ご来場者様（大人または子供）の人数を1名以上入力してください。'); return false;
                }
            }
            if (step === 2 && !sB.plan) {
                this.showError('ご希望のプランを1つ選択してください。'); return false;
            }
        }
        return true;
    },

    render() {
        const container = document.querySelector('.simulation-form-placeholder');
        if (!container) return;

        if (this.state.isLoading) {
            container.innerHTML = `
                <div class="sim-loading">
                    <div class="sim-spinner"></div>
                    <p style="font-weight:bold; color:var(--color-main);">料金をお見積り中...</p>
                </div>
            `;
            return;
        }

        let html = `<div id="sim-error" class="sim-error-msg"></div>`;
        const flow = this.state.flow;
        const step = this.state.step;

        document.querySelector('.modal-title').innerText = flow === 'A' ? '釣り堀・レストラン 予約' : '手ぶらBBQ 予約';

        if (flow === 'A') {
            if (step === 1) {
                html += `
                    <h4 style="margin-bottom:12px; color:var(--color-main);">ご利用目的を選択してください</h4>
                    <div class="sim-panel-grid">
                        <div class="sim-panel ${this.state.simA.purpose === 'takeout' ? 'is-active' : ''}" data-group="A_purpose" data-value="takeout">
                            釣ってお持ち帰り
                        </div>
                        <div class="sim-panel ${this.state.simA.purpose === 'eat_in' ? 'is-active' : ''}" data-group="A_purpose" data-value="eat_in">
                            釣って店内で食事
                        </div>
                    </div>
                    <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                `;
            }
            else if (step === 2) {
                html += `
                    <h4 style="margin-bottom:12px; color:var(--color-main);">人数のご入力</h4>
                    ${this.createCounter('simA.people.adult', '大人（中学生以上）', this.state.simA.people.adult)}
                    ${this.createCounter('simA.people.child', '子供（小学生）', this.state.simA.people.child)}
                    ${this.createCounter('simA.people.infant', '幼児', this.state.simA.people.infant)}
                    
                    <h5 style="margin-top:24px; margin-bottom:8px;">ご希望日 <small style="font-weight:normal; color:#666;">※後からでも入力可能です</small></h5>
                    <div style="background:#fff3cd; color:#856404; padding:8px 12px; border-radius:4px; font-size:0.85rem; margin-bottom:8px; border-left:4px solid #ffeeba; line-height:1.4;">
                        ※当日のご予約はWEBからは受け付けておりません。<br>お手数ですがお電話にてお問い合わせください。
                    </div>
                    <input type="date" id="sim-date" class="sim-input" value="${this.state.simA.date}" min="${this.getTomorrowDateString()}">
                    
                    <div style="margin-top:24px;">
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                    </div>
                `;
            }
            else if (step === 3) {
                if (this.state.simA.purpose === 'eat_in') {
                    const pA = this.state.simA.people;
                    const mA = this.state.simA.menus;
                    const adultRemain = pA.adult - (mA.adultTeishoku + mA.adultTanpin);
                    const childRemain = pA.child - (mA.childKids + mA.childCurry);

                    html += `
                        <h4 style="margin-bottom:8px; color:var(--color-main);">メニューの選択</h4>
                        
                        <div class="sim-indicator">
                            大人メニュー 残り枠：<strong>${adultRemain}</strong>名分<br>
                            <small style="color:#eee;">※大人は必ず人数分（${pA.adult}名分）選択してください</small>
                        </div>
                        <h5 style="background:#f0f0f0; padding:8px; border-radius:4px;">大人のメニュー</h5>
                        ${this.createCounter('simA.menus.adultTeishoku', '定食（2,000円〜）', mA.adultTeishoku, adultRemain === 0)}
                        ${this.createCounter('simA.menus.adultTanpin', '単品・釣り体験のみ（500円〜）', mA.adultTanpin, adultRemain === 0)}
                        
                        <div class="sim-indicator" style="margin-top:16px;">
                            子供メニュー 注文可能：あと <strong>${childRemain}</strong>個<br>
                            <small style="color:#eee;">※子供は人数（${pA.child}名）まで注文可能です</small>
                        </div>
                        <h5 style="background:#f0f0f0; padding:8px; border-radius:4px;">子供のメニュー</h5>
                        ${this.createCounter('simA.menus.childKids', 'お子様ランチ（1,000円）', mA.childKids, childRemain === 0)}
                        ${this.createCounter('simA.menus.childCurry', 'カレー（800円）', mA.childCurry, childRemain === 0)}

                        <h5 style="background:#f0f0f0; padding:8px; border-radius:4px; margin-top:16px;">釣ったお魚の調理方法（1匹あたり）</h5>
                        <p style="font-size:0.85rem; color:#666; margin-bottom:8px;">※釣った魚の数だけ調理方法を選択してください。</p>
                        ${this.createCounter('simA.fish.shioyaki', 'しお焼き（400円）', this.state.simA.fish.shioyaki)}
                        ${this.createCounter('simA.fish.gyoden', 'ぎょでん・みそ（450円）', this.state.simA.fish.gyoden)}
                        ${this.createCounter('simA.fish.karaage', 'からあげ（480円）', this.state.simA.fish.karaage)}
                    `;
                } 
                else if (this.state.simA.purpose === 'takeout') {
                    const pA = this.state.simA.people;
                    const totalPeople = pA.adult + pA.child + pA.infant;
                    const isRodMaxed = this.state.simA.takeout.rods >= totalPeople; 

                    html += `
                        <h4 style="margin-bottom:12px; color:var(--color-main);">持ち帰りの詳細入力</h4>
                        
                        <h5 style="background:#f0f0f0; padding:8px; border-radius:4px;">釣りの道具</h5>
                        <p style="font-size:0.85rem; color:#666; margin-bottom:8px;">※釣竿はご来場人数（${totalPeople}名）までレンタル可能です。</p>
                        ${this.createCounter('simA.takeout.rods', '竿の本数（1,000円/本）', this.state.simA.takeout.rods, isRodMaxed)}
                        
                        <h5 style="background:#f0f0f0; padding:8px; border-radius:4px; margin-top:16px;">お魚・調理方法</h5>
                        ${this.createCounter('simA.takeout.fish', '釣る予定の匹数（目安）', this.state.simA.takeout.fish)}
                        
                        <p style="font-size:0.85rem; color:#666; margin-top:16px; margin-bottom:8px;">ご希望の調理方法（お持ち帰り状態）を選択してください。</p>
                        <div class="sim-panel-grid" style="grid-template-columns: 1fr;">
                            <div class="sim-panel ${this.state.simA.takeout.method === 'raw' ? 'is-active' : ''}" data-group="A_method" data-value="raw">生のまま持ち帰る<br><small>（400円/100g）</small></div>
                            <div class="sim-panel ${this.state.simA.takeout.method === 'gut' ? 'is-active' : ''}" data-group="A_method" data-value="gut">お腹を出してもらう<br><small>（420円/100g）</small></div>
                            <div class="sim-panel ${this.state.simA.takeout.method === 'grill' ? 'is-active' : ''}" data-group="A_method" data-value="grill">焼いて持ち帰る<br><small>（440円/100g）</small></div>
                        </div>
                    `;
                }
                
                html += `
                    <div style="margin-top:24px;">
                        <button class="sim-btn-block sim-btn-primary btn-calculate">料金を計算する</button>
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                    </div>
                `;
            }
            else if (step === 4) {
                html += this.renderResultScreen('A');
            }
        }

        if (flow === 'B') {
            if (step === 1) {
                html += `
                    <h4 style="margin-bottom:12px; color:var(--color-main);">人数のご入力</h4>
                    ${this.createCounter('simB.people.adult', '大人', this.state.simB.people.adult)}
                    ${this.createCounter('simB.people.child', '子供', this.state.simB.people.child)}
                    ${this.createCounter('simB.people.infant', '幼児', this.state.simB.people.infant)}
                    ${this.createCounter('simB.people.dog', 'ワンちゃん', this.state.simB.people.dog)}
                    <p style="font-size:0.8rem; color:var(--color-accent); margin-top:8px;">※ワンちゃんは「大人＋子供」の人数までは無料。超えた分は1頭500円となります。</p>

                    <h5 style="margin-top:24px; margin-bottom:8px;">ご希望日 <small style="font-weight:normal; color:#666;">※後からでも入力可能です</small></h5>
                    <div style="background:#fff3cd; color:#856404; padding:8px 12px; border-radius:4px; font-size:0.85rem; margin-bottom:8px; border-left:4px solid #ffeeba; line-height:1.4;">
                        ※当日のご予約はWEBからは受け付けておりません。<br>お手数ですがお電話にてお問い合わせください。
                    </div>
                    <input type="date" id="sim-date" class="sim-input" value="${this.state.simB.date}" min="${this.getTomorrowDateString()}">
                    
                    <div style="margin-top:24px;">
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            }
            else if (step === 2) {
                html += `
                    <h4 style="margin-bottom:12px; color:var(--color-main);">プランを選択してください</h4>
                    <p style="font-size:0.85rem; color:#666; margin-bottom:16px;">※グループ皆様で同じプランとなります。</p>
                    <div class="sim-panel-grid" style="grid-template-columns: 1fr;">
                        <div class="sim-panel ${this.state.simB.plan === '3000' ? 'is-active' : ''}" data-group="B_plan" data-value="3000">スタンダード（3,000円）</div>
                        <div class="sim-panel ${this.state.simB.plan === '4000' ? 'is-active' : ''}" data-group="B_plan" data-value="4000">ボリューム（4,000円）</div>
                        <div class="sim-panel ${this.state.simB.plan === '5000' ? 'is-active' : ''}" data-group="B_plan" data-value="5000">プレミアム（5,000円）</div>
                    </div>
                    <div style="margin-top:24px;">
                        <button class="sim-btn-block sim-btn-primary btn-calculate">料金を計算する</button>
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                    </div>
                `;
            }
            else if (step === 3) {
                html += this.renderResultScreen('B');
            }
        }

        container.innerHTML = html;
    },

    createCounter(targetPath, label, val, isMaxed = false) {
        return `
            <div class="sim-counter-row">
                <span style="font-weight:bold; color:var(--color-text);">${label}</span>
                <div class="sim-counter-controls">
                    <button class="sim-btn-circle" data-action="minus" data-target="${targetPath}">－</button>
                    <span class="sim-counter-val" id="count-${targetPath.replace(/\./g, '-')}">${val}</span>
                    <button class="sim-btn-circle ${isMaxed ? 'is-disabled' : ''}" data-action="plus" data-target="${targetPath}">＋</button>
                </div>
            </div>
        `;
    },

    renderResultScreen(flow) {
        let total = 0;
        let receiptHtml = `<div class="sim-receipt"><h4 style="text-align:center; border-bottom:1px solid #ccc; padding-bottom:8px; margin-bottom:16px;">お見積り結果（目安）</h4>`;

        if (flow === 'A') {
            if (this.state.simA.purpose === 'eat_in') {
                const m = this.state.simA.menus;
                const f = this.state.simA.fish;
                const p = this.prices.A;
                if (m.adultTeishoku > 0) { total += m.adultTeishoku * p.teishoku; receiptHtml += `<div class="sim-receipt-row"><span>定食 x${m.adultTeishoku}</span><span>¥${(m.adultTeishoku * p.teishoku).toLocaleString()}</span></div>`; }
                if (m.adultTanpin > 0) { total += m.adultTanpin * p.tanpin; receiptHtml += `<div class="sim-receipt-row"><span>単品/体験 x${m.adultTanpin}</span><span>¥${(m.adultTanpin * p.tanpin).toLocaleString()}</span></div>`; }
                if (m.childKids > 0) { total += m.childKids * p.kids; receiptHtml += `<div class="sim-receipt-row"><span>お子様ランチ x${m.childKids}</span><span>¥${(m.childKids * p.kids).toLocaleString()}</span></div>`; }
                if (m.childCurry > 0) { total += m.childCurry * p.curry; receiptHtml += `<div class="sim-receipt-row"><span>カレー x${m.childCurry}</span><span>¥${(m.childCurry * p.curry).toLocaleString()}</span></div>`; }
                
                // ★追加：店内飲食時のお魚調理代をレシートに反映
                if (f.shioyaki > 0) { total += f.shioyaki * p.shioyaki; receiptHtml += `<div class="sim-receipt-row"><span>しお焼き x${f.shioyaki}</span><span>¥${(f.shioyaki * p.shioyaki).toLocaleString()}</span></div>`; }
                if (f.gyoden > 0) { total += f.gyoden * p.gyoden; receiptHtml += `<div class="sim-receipt-row"><span>ぎょでん(みそ) x${f.gyoden}</span><span>¥${(f.gyoden * p.gyoden).toLocaleString()}</span></div>`; }
                if (f.karaage > 0) { total += f.karaage * p.karaage; receiptHtml += `<div class="sim-receipt-row"><span>からあげ x${f.karaage}</span><span>¥${(f.karaage * p.karaage).toLocaleString()}</span></div>`; }

            } 
            else if (this.state.simA.purpose === 'takeout') {
                const t = this.state.simA.takeout;
                const p = this.prices.A;
                if (t.rods > 0) {
                    const rodCost = t.rods * p.takeoutRods;
                    total += rodCost;
                    receiptHtml += `<div class="sim-receipt-row"><span>釣竿 x${t.rods}</span><span>¥${rodCost.toLocaleString()}</span></div>`;
                }
                if (t.fish > 0) {
                    let methodPrice = 0; let methodLabel = '';
                    if (t.method === 'raw') { methodPrice = p.methodRaw; methodLabel = '生'; }
                    if (t.method === 'gut') { methodPrice = p.methodGut; methodLabel = 'お腹出し'; }
                    if (t.method === 'grill') { methodPrice = p.methodGrill; methodLabel = '焼き'; }
                    
                    const fishCost = t.fish * (methodPrice * 0.8);
                    total += fishCost;
                    receiptHtml += `<div class="sim-receipt-row"><span>お魚（${methodLabel}） x約${t.fish}匹</span><span>約 ¥${fishCost.toLocaleString()}</span></div>`;
                    receiptHtml += `<p style="font-size:0.75rem; color:#666; margin-top:4px;">※お魚は1匹約80gとして計算しています（通常70〜100g）。実際の重さにより金額は前後します。</p>`;
                }
            }
        } 
        else if (flow === 'B') {
            const pB = this.state.simB.people;
            const basePrice = parseInt(this.state.simB.plan, 10);
            const adultTotal = pB.adult * basePrice;
            const childTotal = pB.child * (basePrice / 2); 
            total += adultTotal + childTotal;
            receiptHtml += `<div class="sim-receipt-row"><span>プラン(大人) x${pB.adult}</span><span>¥${adultTotal.toLocaleString()}</span></div>`;
            receiptHtml += `<div class="sim-receipt-row"><span>プラン(子供) x${pB.child}</span><span>¥${childTotal.toLocaleString()}</span></div>`;
            
            const freeDogs = pB.adult + pB.child;
            const paidDogs = Math.max(0, pB.dog - freeDogs);
            if (paidDogs > 0) {
                total += paidDogs * this.prices.B.dogFee;
                receiptHtml += `<div class="sim-receipt-row"><span>ワンちゃん追加料金 x${paidDogs}</span><span>¥${(paidDogs * this.prices.B.dogFee).toLocaleString()}</span></div>`;
            } else if (pB.dog > 0) {
                receiptHtml += `<div class="sim-receipt-row"><span>ワンちゃん同伴 x${pB.dog}</span><span>無料</span></div>`;
            }
        }

        receiptHtml += `<div class="sim-receipt-total"><span>合計目安</span><span>¥${total.toLocaleString()}</span></div></div>`;

        // ▼▼▼ 今回追加：ワクワク感を高めるメッセージボックス ▼▼▼
        receiptHtml += `
            <div style="background:#f4f9f5; border:2px dashed var(--color-main, #2C4234); padding:16px; border-radius:8px; margin-bottom:24px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                <p style="color:var(--color-main, #2C4234); font-weight:bold; margin-bottom:8px; font-size:1.05rem;">
                    ✨ 上記はあくまでお見積りの「目安」です
                </p>
                <p style="font-size:0.9rem; color:#444; line-height:1.6;">
                    当日はメニューの追加や変更も大歓迎です！<br>
                    他にも美味しいお料理や冷たいドリンクをたくさんご用意して、皆様のお越しを心よりお待ちしております。
                </p>
            </div>
        `;
        // ▲▲▲ ここまで追加 ▲▲▲

        const currentDate = flow === 'A' ? this.state.simA.date : this.state.simB.date;
        const dateAlertHtml = !currentDate ? `<div style="color:#c00; font-size:0.85rem; font-weight:bold; margin-bottom:8px;">※ご予約に進むには日付の入力が必要です</div>` : '';

        const formHtml = `
            <h4 style="margin-bottom:12px; color:var(--color-main);">ご予約者情報の入力</h4>
            
            ${dateAlertHtml}
            <label style="font-size:0.9rem; font-weight:bold;">ご予約日 <span style="color:#c00;">*</span></label>
            <div style="background:#fff3cd; color:#856404; padding:8px 12px; border-radius:4px; font-size:0.85rem; margin-top:4px; margin-bottom:8px; border-left:4px solid #ffeeba; line-height:1.4;">
                ※当日のご予約はWEBからは受け付けておりません。<br>お手数ですがお電話にてお問い合わせください。
            </div>
            <input type="date" id="sim-date" class="sim-input" value="${currentDate}" min="${this.getTomorrowDateString()}" style="margin-bottom:16px;">

            <label style="font-size:0.9rem; font-weight:bold;">代表者名 <span style="color:#c00;">*</span></label>
            <input type="text" id="user-name" class="sim-input" value="${this.state.userInfo.name}" placeholder="山田 太郎" style="margin-bottom:16px;">
            
            <label style="font-size:0.9rem; font-weight:bold;">電話番号 <span style="color:#c00;">*</span></label>
            <input type="tel" id="user-phone" class="sim-input" value="${this.state.userInfo.phone}" placeholder="09012345678" style="margin-bottom:24px;">

            <div style="background:#fff3cd; padding:16px; border-radius:4px; margin-bottom:24px; border-left:4px solid #ffecb5;">
                <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:0.9rem; font-weight:bold; line-height:1.4;">
                    <input type="checkbox" id="policy-check" style="margin-top:2px; transform:scale(1.2);" ${this.state.userInfo.policy ? 'checked' : ''}>
                    <span>キャンセルポリシーに同意する<br><small style="font-weight:normal; color:#666;">※当日キャンセルではなく、前日までのキャンセル・変更を受け付けます。</small></span>
                </label>
            </div>
            
            <button id="btn-submit-line" class="sim-btn-block" style="background:#06C755; color:#fff;">LINEで予約する</button>
            <button class="sim-btn-block sim-btn-secondary btn-prev" style="border:none;">戻る</button>
        `;

        return receiptHtml + formHtml;
    },

    sendToLine() {
        this.hideError();
        const u = this.state.userInfo;
        const currentDate = this.state.flow === 'A' ? this.state.simA.date : this.state.simB.date;
        
        if (!currentDate) { this.showError('ご予約日を選択してください。'); return; }
        if (currentDate < this.getTomorrowDateString()) { this.showError('当日のご予約はWEBからは受け付けておりません。お手数ですがお電話にてお問い合わせください。'); return; }
        if (!u.name.trim() || !u.phone.trim()) { this.showError('お名前と電話番号を入力してください。'); return; }
        
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(u.phone.trim())) { this.showError('電話番号はハイフンなしの半角数字（10桁または11桁）で入力してください。例：09012345678'); return; }
        
        if (!u.policy) { this.showError('キャンセルポリシーへの同意チェックが必要です。'); return; }

        const flow = this.state.flow;
        let planStr = flow === 'A' ? `釣り堀・レストラン（${this.state.simA.purpose === 'takeout' ? '持ち帰り' : '店内飲食'}）` : `バーベキュー（${this.state.simB.plan}円プラン）`;
        
        let details = [];
        if (flow === 'A') {
            const p = this.state.simA.people;
            details.push(`大人${p.adult}名/子供${p.child}名/幼児${p.infant}名`);
            
            if (this.state.simA.purpose === 'eat_in') {
                const m = this.state.simA.menus;
                const f = this.state.simA.fish;
                if(m.adultTeishoku > 0) details.push(`定食:${m.adultTeishoku}`);
                if(m.adultTanpin > 0) details.push(`単品:${m.adultTanpin}`);
                if(m.childKids > 0) details.push(`お子様:${m.childKids}`);
                if(m.childCurry > 0) details.push(`カレー:${m.childCurry}`);
                
                // ★追加：店内飲食時のお魚情報をLINEへ
                if(f.shioyaki > 0) details.push(`しお焼き:${f.shioyaki}`);
                if(f.gyoden > 0) details.push(`ぎょでん:${f.gyoden}`);
                if(f.karaage > 0) details.push(`からあげ:${f.karaage}`);

            } else {
                const t = this.state.simA.takeout;
                let methodLabel = '';
                if(t.method==='raw') methodLabel='生'; if(t.method==='gut') methodLabel='お腹出し'; if(t.method==='grill') methodLabel='焼き';
                if(t.rods > 0) details.push(`竿:${t.rods}本`);
                if(t.fish > 0) details.push(`魚予定:${t.fish}匹(${methodLabel})`);
            }
        } else {
            const p = this.state.simB.people;
            details.push(`大人${p.adult}名/子供${p.child}名/幼児${p.infant}名/犬${p.dog}頭`);
        }

        const textMessage = `【七宗遊園 予約・お問い合わせ】\n以下の内容で予約を依頼します。\n■ ご利用施設：${planStr}\n■ ご予約日：${currentDate}\n■ 人数・内訳：${details.join('、')}\n■ 代表者名：${u.name} 様\n■ お電話番号：${u.phone}`;
        const encodedText = encodeURIComponent(textMessage);
        const lineUrl = `https://line.me/R/oaMessage/@YOUR_LINE_ID/?${encodedText}`;
        window.open(lineUrl, '_blank');
    }
};