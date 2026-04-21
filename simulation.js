/**
 * 七宗遊園 - 料金シミュレーション専用システム (別ページ用)
 */

const ReservationSystem = {
    state: {
        flow: 'SELECT', 
        step: 1,
        isLoading: false, 
        
        simA: { purpose: '', people: { adult: 0, child: 0 }, menus: { adultLunch: 0, adultSashimi: 0, adultTempura: 0, adultPotato: 0, adultYakiniku: 0, childKids: 0, childLight: 0, childSashimi: 0, childTempura: 0 }, fish: { shioyaki: 0, gyoden: 0, karaage: 0 }, takeout: { rods: 0, fish: 0, method: '' } },
        simB: { people: { adult: 0, child: 0, dog: 0 }, plan: '', drink: '' }
    },

    prices: {
        A: { adultLunch: 2400, adultSashimi: 1500, adultTempura: 1500, adultPotato: 1500, adultYakiniku: 2200, childKids: 1200, childLight: 750, childSashimi: 1100, childTempura: 1100, shioyaki: 0, gyoden: 50, karaage: 80, extraShioyaki: 400, extraGyoden: 450, extraKaraage: 480, takeoutRods: 1000, methodRaw: 400, methodGut: 420, methodGrill: 440 },
        B: { dogFee: 500, drinkAlcohol: 2000, drinkSoftAdult: 1500, drinkSoftChild: 750 }
    },

    init() {
        // ▼ ページ内に専用のコンテナがある場合のみ作動する（エラー防止）
        if (!document.getElementById('simulation-app')) return;
        this.injectStyles();
        this.bindEvents();
        this.render(); // 初期画面を描画
    },

    injectStyles() {
        if (document.getElementById('sim-styles')) return;
        const style = document.createElement('style');
        style.id = 'sim-styles';
        style.innerHTML = `
            .simulation-app-container { overflow-x: hidden; width: 100%; box-sizing: border-box; padding: 32px 24px; color: #333; background-color: #ffffff; border: 1px solid #E8E4D9; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .simulation-app-container h4 { margin-top: 10px; margin-bottom: 24px; font-size: 1.25rem; border-bottom: 1px solid rgba(44, 66, 52, 0.15); padding-bottom: 12px; color: var(--color-main, #2C4234); font-weight: bold; text-align: center; }
            .simulation-app-container h5 { margin-top: 32px; margin-bottom: 16px; font-size: 1.05rem; color: var(--color-main, #2C4234); font-weight: bold; }
            .sim-panel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; margin-bottom: 32px; }
            .sim-panel { border: 1px solid #D8D2C4; border-radius: 8px; padding: 20px 12px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #fff; font-size: 0.95rem; font-weight:bold; color: #555; }
            .sim-panel:hover { border-color: var(--color-main, #2C4234); background-color: #F9F9F9; }
            .sim-panel.is-active { background: var(--color-main, #2C4234); color: #fff; border-color: var(--color-main, #2C4234); }
            .sim-counter-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #E8E4D9; }
            .sim-counter-label { font-size: 0.95rem; color: #444; }
            .sim-counter-controls { display: flex; align-items: center; gap: 16px; }
            .sim-btn-circle { width: 36px; height: 36px; border-radius: 4px; border: 1px solid #D8D2C4; background: #fff; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; touch-action: manipulation; -webkit-user-select: none; user-select: none;}            .sim-btn-circle:active { background: #f0f0f0; }
            .sim-counter-val { font-size: 1.2rem; width: 30px; text-align: center; font-weight: bold;}
            .sim-error-msg { color: #A0522D; padding: 0 0 20px 0; font-size: 0.9rem; display: none; font-weight: bold; text-align: center;}
            .sim-btn-block { width: 100%; padding: 16px; border-radius: 50px; font-size: 1.05rem; cursor: pointer; border: none; transition: 0.3s; text-align: center; font-weight: bold; letter-spacing: 0.05em;}
            .sim-btn-primary { background: var(--color-main, #2C4234); color: #fff; }
            .sim-btn-secondary { background: #fff; border: 1px solid #D8D2C4; color: #555; }
            .sim-btn-group { display: flex; gap: 16px; margin-top: 40px; }
            .sim-receipt { background: #FDFBF7; padding: 24px; border-radius: 8px; margin-bottom: 32px; border: 1px solid #E8E4D9;}
            .sim-receipt-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; color: #555; font-weight: bold;}
            .sim-loading { text-align: center; padding: 60px 0; }
            .sim-spinner { display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(44, 66, 52, 0.1); border-radius: 50%; border-top-color: var(--color-main, #2C4234); animation: spin 1s infinite; margin-bottom: 24px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeInStep { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .step-animation { animation: fadeInStep 0.4s ease forwards; }
        `;
        document.head.appendChild(style);
    },

    bindEvents() {
        const container = document.getElementById('simulation-app');
        container.addEventListener('click', (e) => {
            
            if (e.target.closest('.sim-panel[data-action="select-plan"]')) {
                const val = e.target.closest('.sim-panel').dataset.value;
                if (val === 'fishing') this.startSimulation('A');
                else if (val === 'bbq') this.startSimulation('B');
            }

            if (e.target.closest('.btn-next')) {
                if (this.validateCurrentStep()) { this.state.step++; this.render(); }
            }

            if (e.target.closest('.btn-calculate')) {
                if (this.validateCurrentStep()) {
                    this.state.isLoading = true; this.render();
                    setTimeout(() => { this.state.isLoading = false; this.state.step++; this.render(); }, 800); 
                }
            }

            if (e.target.closest('.btn-prev')) {
                if(this.state.step === 1) { this.state.flow = 'SELECT'; this.render(); }
                else { this.state.step--; this.render(); }
            }

            if (e.target.closest('.btn-reset')) {
                this.state.flow = 'SELECT'; this.state.step = 1; this.render();
            }

            if (e.target.closest('.sim-panel') && !e.target.closest('.sim-panel[data-action="select-plan"]')) {
                const panel = e.target.closest('.sim-panel');
                const group = panel.dataset.group;
                const val = panel.dataset.value;
                document.querySelectorAll(`.sim-panel[data-group="${group}"]`).forEach(p => p.classList.remove('is-active'));
                panel.classList.add('is-active');
                
                if (group === 'A_purpose') {
                    this.state.simA.purpose = val;
                    this.state.simA.menus = { adultLunch: 0, adultSashimi: 0, adultTempura: 0, adultPotato: 0, adultYakiniku: 0, childKids: 0, childLight: 0, childSashimi: 0, childTempura: 0 };
                    this.state.simA.fish = { shioyaki: 0, gyoden: 0, karaage: 0 };
                    this.state.simA.takeout = { rods: 0, fish: 0, method: '' };
                }
                if (group === 'B_plan') this.state.simB.plan = val;
                if (group === 'B_drink') this.state.simB.drink = val; 
                if (group === 'A_method') this.state.simA.takeout.method = val;
            }

            if (e.target.closest('.sim-btn-circle')) {
                const btn = e.target.closest('.sim-btn-circle');
                if (btn.classList.contains('is-disabled')) return; 
                this.handleCounter(btn.dataset.target, btn.dataset.action);
            }
        });
    },

    startSimulation(flow) {
        this.state.flow = flow; this.state.step = 1; this.state.isLoading = false;
        this.state.simA = { purpose: '', people: { adult: 0, child: 0 }, menus: { adultLunch: 0, adultSashimi: 0, adultTempura: 0, adultPotato: 0, adultYakiniku: 0, childKids: 0, childLight: 0, childSashimi: 0, childTempura: 0 }, fish: { shioyaki: 0, gyoden: 0, karaage: 0 }, takeout: { rods: 0, fish: 0, method: '' } };
        this.state.simB = { people: { adult: 0, child: 0, dog: 0 }, plan: '', drink: '' };
        this.render();
    },

    handleCounter(target, action) {
        let path = target.split('.'); let obj = this.state[path[0]][path[1]]; let key = path[2];
        let currentVal = obj[key];
        
        if (action === 'plus') {
            if (path[0] === 'simA' && path[1] === 'menus') {
                const sA = this.state.simA;
                if (['adultLunch', 'adultSashimi', 'adultTempura', 'adultPotato', 'adultYakiniku'].includes(key)) {
                    if ((sA.menus.adultLunch + sA.menus.adultSashimi + sA.menus.adultTempura + sA.menus.adultPotato + sA.menus.adultYakiniku) >= sA.people.adult) return; 
                }
                if (['childKids', 'childLight', 'childSashimi', 'childTempura'].includes(key)) {
                    if ((sA.menus.childKids + sA.menus.childLight + sA.menus.childSashimi + sA.menus.childTempura) >= sA.people.child) return; 
                }
            }
            if (path[0] === 'simA' && path[1] === 'takeout' && key === 'rods') {
                if (currentVal >= (this.state.simA.people.adult + this.state.simA.people.child)) return; 
            }
            obj[key]++;
        }
        if (action === 'minus' && currentVal > 0) obj[key]--;
        this.render();
    },

    showError(msg) {
        const errDiv = document.getElementById('sim-error');
        if (errDiv) { errDiv.innerText = msg; errDiv.style.display = 'block'; errDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    },
    hideError() {
        const errDiv = document.getElementById('sim-error');
        if(errDiv) errDiv.style.display = 'none';
    },

    validateCurrentStep() {
        this.hideError(); const step = this.state.step; const sA = this.state.simA; const sB = this.state.simB;

        if (this.state.flow === 'A') {
            if (step === 1 && !sA.purpose) { this.showError('「持ち帰り」か「店内で食事」を選択してください。'); return false; }
            if (step === 2 && sA.people.adult < 1) { this.showError('ご来場には、大人（中学生以上）1名以上の同伴が必要です。'); return false; }
            if (step === 3) {
                const totalPeople = sA.people.adult + sA.people.child;
                if (sA.purpose === 'eat_in') {
                    const adultMenus = sA.menus.adultLunch + sA.menus.adultSashimi + sA.menus.adultTempura + sA.menus.adultPotato + sA.menus.adultYakiniku;
                    if (adultMenus !== sA.people.adult) { this.showError(`大人は人数分（${sA.people.adult}名分）のオーダーが必要です。`); return false; }
                    const baseFish = (sA.people.adult - sA.menus.adultYakiniku) * 2 + sA.people.child;
                    const totalFish = sA.fish.shioyaki + sA.fish.gyoden + sA.fish.karaage;
                    if (totalFish < baseFish) { this.showError(`お魚の調理方法の合計が「最低 ${baseFish} 匹以上」になるように選択してください。`); return false; }
                } else if (sA.purpose === 'takeout') {
                    if (sA.takeout.rods === 0) { this.showError('釣竿を1本以上選択してください。'); return false; }
                    if (sA.takeout.fish < totalPeople) { this.showError(`お魚はご来場人数（${totalPeople}匹）以上釣るルールとなっております。`); return false; }
                    if (!sA.takeout.method) { this.showError('釣る予定のお魚の「調理方法」を選択してください。'); return false; }
                }
            }
        }
        if (this.state.flow === 'B') {
            if (step === 1 && sB.people.adult < 1) { this.showError('ご来場には、おとな1名以上の同伴が必要です。'); return false; }
            if (step === 2 && !sB.plan) { this.showError('ご希望のプランを1つ選択してください。'); return false; }
        }
        return true;
    },

    render() {
        const container = document.getElementById('simulation-app');
        if (!container) return;

        if (this.state.isLoading) {
            container.innerHTML = `
                <div class="simulation-app-container sim-loading step-animation">
                    <div class="sim-spinner"></div>
                    <p style="font-weight:bold; color:var(--color-main);">料金をお見積り中...</p>
                </div>
            `;
            return;
        }

        let html = `<div id="sim-error" class="sim-error-msg"></div>`;
        const flow = this.state.flow;
        const step = this.state.step;

        if (flow === 'SELECT') {
            html += `
                <h4>シミュレーションするプラン</h4>
                <div class="sim-panel-grid" style="grid-template-columns: 1fr; margin-top:24px;">
                    <div class="sim-panel" data-action="select-plan" data-value="fishing" style="display:flex; flex-direction:column; align-items:center; padding:32px 24px;">
                        <span style="font-size:1.3rem; margin-bottom:8px; color: var(--color-main);">釣り堀・お食事</span>
                        <span style="font-size:0.85rem; color:#666; font-weight:normal;">釣って店内で食事・またはお持ち帰り</span>
                    </div>
                    <div class="sim-panel" data-action="select-plan" data-value="bbq" style="display:flex; flex-direction:column; align-items:center; padding:32px 24px;">
                        <span style="font-size:1.3rem; margin-bottom:8px; color: var(--color-main);">手ぶらBBQ</span>
                        <span style="font-size:0.85rem; color:#666; font-weight:normal;">1日3組限定・愛犬同伴可のBBQプラン</span>
                    </div>
                </div>
            `;
        }

        if (flow === 'A') {
            if (step === 1) {
                html += `
                    <h4>釣り堀のご利用目的</h4>
                    <div class="sim-panel-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                        <div class="sim-panel ${this.state.simA.purpose === 'eat_in' ? 'is-active' : ''}" data-group="A_purpose" data-value="eat_in">釣って店内で食事</div>
                        <div class="sim-panel ${this.state.simA.purpose === 'takeout' ? 'is-active' : ''}" data-group="A_purpose" data-value="takeout">釣ってお持ち帰り</div>
                    </div>
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">最初に戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 2) {
                html += `
                    <h4>ご来店人数</h4>
                    ${this.createCounter('simA.people.adult', '大人', this.state.simA.people.adult)}
                    ${this.createCounter('simA.people.child', 'お子さま(小学生以下)', this.state.simA.people.child)}
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 3) {
                if (this.state.simA.purpose === 'eat_in') {
                    const pA = this.state.simA.people; const mA = this.state.simA.menus;
                    const adultRemain = pA.adult - (mA.adultLunch + mA.adultSashimi + mA.adultTempura + mA.adultPotato + mA.adultYakiniku);
                    const childRemain = pA.child - (mA.childKids + mA.childLight + mA.childSashimi + mA.childTempura);

                    html += `
                        <h5 style="margin-top:0;">大人のメニュー</h5>
                        ${this.createCounter('simA.menus.adultLunch', 'ランチセット(魚2匹)', mA.adultLunch, adultRemain === 0)}
                        ${this.createCounter('simA.menus.adultSashimi', 'にじます刺身(魚2匹)', mA.adultSashimi, adultRemain === 0)}
                        ${this.createCounter('simA.menus.adultTempura', '天ぷら盛り合わせ(魚2匹)', mA.adultTempura, adultRemain === 0)}
                        ${this.createCounter('simA.menus.adultPotato', 'フライドポテト(魚2匹)', mA.adultPotato, adultRemain === 0)}
                        ${this.createCounter('simA.menus.adultYakiniku', '飛騨牛焼肉ランチ(※魚なし)', mA.adultYakiniku, adultRemain === 0)}
                        
                        <h5>子供のメニュー</h5>
                        ${this.createCounter('simA.menus.childKids', 'おこさまランチ(魚1匹)', mA.childKids, childRemain === 0)}
                        ${this.createCounter('simA.menus.childLight', 'ポテト(ミニ)(魚1匹)', mA.childLight, childRemain === 0)}
                        ${this.createCounter('simA.menus.childSashimi', 'にじます刺身(魚1匹)', mA.childSashimi, childRemain === 0)}
                        ${this.createCounter('simA.menus.childTempura', '天ぷら盛り合わせ(魚1匹)', mA.childTempura, childRemain === 0)}

                        <h5>お魚の調理変更</h5>
                        <div style="background:#FDFBF7; border:1px solid #D96D2B; padding:12px; border-radius:4px; margin-bottom:16px; font-size:0.85rem; color:#A0522D;">
                            <strong>💡 セットのお魚は【 合計 ${(pA.adult - mA.adultYakiniku) * 2 + pA.child} 匹 】です！</strong><br>
                            合計 ${(pA.adult - mA.adultYakiniku) * 2 + pA.child} 匹以上 になるように選択してください。<br>
                            <small>※超えた分は自動的に「追加料金」として計算されます。</small>
                        </div>
                        ${(() => {
                            return `
                                ${this.createCounter('simA.fish.shioyaki', 'しお焼き(セット0円 / 追加400円)', this.state.simA.fish.shioyaki)}
                                ${this.createCounter('simA.fish.gyoden', 'ぎょでん(セット+50円 / 追加450円)', this.state.simA.fish.gyoden)}
                                ${this.createCounter('simA.fish.karaage', 'からあげ(セット+80円 / 追加480円)', this.state.simA.fish.karaage)}
                            `;
                        })()}
                    `;
                } else if (this.state.simA.purpose === 'takeout') {
                    const pA = this.state.simA.people; const totalPeople = pA.adult + pA.child;
                    html += `
                        <h5 style="margin-top:0;">釣りの道具</h5>
                        ${this.createCounter('simA.takeout.rods', '竿の本数', this.state.simA.takeout.rods, this.state.simA.takeout.rods >= totalPeople)}
                        <h5>お魚の匹数</h5>
                        ${this.createCounter('simA.takeout.fish', '釣る予定の匹数（目安）', this.state.simA.takeout.fish)}
                        <h5 style="margin-bottom:16px;">ご希望の調理方法</h5>
                        <div class="sim-panel-grid" style="grid-template-columns: 1fr;">
                            <div class="sim-panel ${this.state.simA.takeout.method === 'raw' ? 'is-active' : ''}" data-group="A_method" data-value="raw">そのまま生で</div>
                            <div class="sim-panel ${this.state.simA.takeout.method === 'gut' ? 'is-active' : ''}" data-group="A_method" data-value="gut">おなかの掃除</div>
                            <div class="sim-panel ${this.state.simA.takeout.method === 'grill' ? 'is-active' : ''}" data-group="A_method" data-value="grill">焼きで持ちかえる</div>
                        </div>
                    `;
                }
                html += `
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-calculate">料金を計算する</button>
                    </div>
                `;
            } else if (step === 4) {
                html += this.renderResultScreen('A');
            }
        }

        if (flow === 'B') {
            if (step === 1) {
                html += `
                    <h4>BBQ ご来店人数</h4>
                    ${this.createCounter('simB.people.adult', 'おとな', this.state.simB.people.adult)}
                    ${this.createCounter('simB.people.child', 'こども', this.state.simB.people.child)}
                    ${this.createCounter('simB.people.dog', 'わんちゃん', this.state.simB.people.dog)}
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">最初に戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 2) {
                html += `
                    <h4>プランの選択</h4>
                    <div class="sim-panel-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                        <div class="sim-panel ${this.state.simB.plan === '3000' ? 'is-active' : ''}" data-group="B_plan" data-value="3000">スタンダード<br>（¥3,000）</div>
                        <div class="sim-panel ${this.state.simB.plan === '4000' ? 'is-active' : ''}" data-group="B_plan" data-value="4000">ボリューム<br>（¥4,000）</div>
                        <div class="sim-panel ${this.state.simB.plan === '5000' ? 'is-active' : ''}" data-group="B_plan" data-value="5000">プレミアム<br>（¥5,000）</div>
                    </div>
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 3) {
                html += `
                    <h4>飲み放題オプション</h4>
                    <div class="sim-panel-grid" style="grid-template-columns: 1fr; gap: 12px;">
                        <div class="sim-panel ${this.state.simB.drink === 'none' ? 'is-active' : ''}" data-group="B_drink" data-value="none">なし（単品注文）</div>
                        <div class="sim-panel ${this.state.simB.drink === 'alcohol' ? 'is-active' : ''}" data-group="B_drink" data-value="alcohol" style="flex-direction:column;">
                            <span>アルコール飲み放題</span><small style="font-weight:normal;">（大人はアルコール、子供はソフト）</small>
                        </div>
                        <div class="sim-panel ${this.state.simB.drink === 'soft' ? 'is-active' : ''}" data-group="B_drink" data-value="soft" style="flex-direction:column;">
                            <span>ソフトドリンク飲み放題</span><small style="font-weight:normal;">（全員ソフトドリンク）</small>
                        </div>
                    </div>
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-calculate">料金を計算する</button>
                    </div>
                `;
            } else if (step === 4) {
                html += this.renderResultScreen('B');
            }
        }

        const animationClass = this.state._prevStep !== step ? 'step-animation' : '';
        this.state._prevStep = step;

        container.innerHTML = `<div class="simulation-app-container ${animationClass}">${html}</div>`;
    },

    createCounter(targetPath, label, val, isMaxed = false) {
        return `
            <div class="sim-counter-row">
                <span class="sim-counter-label">${label}</span>
                <div class="sim-counter-controls">
                    <button class="sim-btn-circle" data-action="minus" data-target="${targetPath}">－</button>
                    <span class="sim-counter-val">${val}</span>
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
                const m = this.state.simA.menus; const f = this.state.simA.fish; const p = this.prices.A;
                
                if (m.adultLunch > 0) { total += m.adultLunch * p.adultLunch; receiptHtml += `<div class="sim-receipt-row"><span>大人 ランチセット x${m.adultLunch}</span><span>¥${(m.adultLunch * p.adultLunch).toLocaleString()}</span></div>`; }
                if (m.adultSashimi > 0) { total += m.adultSashimi * p.adultSashimi; receiptHtml += `<div class="sim-receipt-row"><span>大人 刺身セット x${m.adultSashimi}</span><span>¥${(m.adultSashimi * p.adultSashimi).toLocaleString()}</span></div>`; }
                if (m.adultTempura > 0) { total += m.adultTempura * p.adultTempura; receiptHtml += `<div class="sim-receipt-row"><span>大人 天ぷらセット x${m.adultTempura}</span><span>¥${(m.adultTempura * p.adultTempura).toLocaleString()}</span></div>`; }
                if (m.adultPotato > 0) { total += m.adultPotato * p.adultPotato; receiptHtml += `<div class="sim-receipt-row"><span>大人 ポテトセット x${m.adultPotato}</span><span>¥${(m.adultPotato * p.adultPotato).toLocaleString()}</span></div>`; }
                if (m.adultYakiniku > 0) { total += m.adultYakiniku * p.adultYakiniku; receiptHtml += `<div class="sim-receipt-row"><span>飛騨牛焼肉ランチ x${m.adultYakiniku}</span><span>¥${(m.adultYakiniku * p.adultYakiniku).toLocaleString()}</span></div>`; }
                
                if (m.childKids > 0) { total += m.childKids * p.childKids; receiptHtml += `<div class="sim-receipt-row"><span>おこさまランチ x${m.childKids}</span><span>¥${(m.childKids * p.childKids).toLocaleString()}</span></div>`; }
                if (m.childLight > 0) { total += m.childLight * p.childLight; receiptHtml += `<div class="sim-receipt-row"><span>こども ポテトorドリンク x${m.childLight}</span><span>¥${(m.childLight * p.childLight).toLocaleString()}</span></div>`; }
                if (m.childSashimi > 0) { total += m.childSashimi * p.childSashimi; receiptHtml += `<div class="sim-receipt-row"><span>こども 刺身 x${m.childSashimi}</span><span>¥${(m.childSashimi * p.childSashimi).toLocaleString()}</span></div>`; }
                if (m.childTempura > 0) { total += m.childTempura * p.childTempura; receiptHtml += `<div class="sim-receipt-row"><span>こども 天ぷら x${m.childTempura}</span><span>¥${(m.childTempura * p.childTempura).toLocaleString()}</span></div>`; }
                
                const baseFishLimit = (this.state.simA.people.adult - m.adultYakiniku) * 2 + this.state.simA.people.child;
                let remainBase = baseFishLimit; 

                const baseShioyaki = Math.min(remainBase, f.shioyaki); const exShioyaki = f.shioyaki - baseShioyaki; remainBase -= baseShioyaki;
                const baseGyoden = Math.min(remainBase, f.gyoden); const exGyoden = f.gyoden - baseGyoden; remainBase -= baseGyoden;
                const baseKaraage = Math.min(remainBase, f.karaage); const exKaraage = f.karaage - baseKaraage; remainBase -= baseKaraage;

                if (baseShioyaki > 0) { total += baseShioyaki * p.shioyaki; receiptHtml += `<div class="sim-receipt-row"><span>お魚(しお焼き) x${baseShioyaki}</span><span>¥${(baseShioyaki * p.shioyaki).toLocaleString()}</span></div>`; }
                if (baseGyoden > 0) { total += baseGyoden * p.gyoden; receiptHtml += `<div class="sim-receipt-row"><span>お魚(ぎょでん変更) x${baseGyoden}</span><span>¥${(baseGyoden * p.gyoden).toLocaleString()}</span></div>`; }
                if (baseKaraage > 0) { total += baseKaraage * p.karaage; receiptHtml += `<div class="sim-receipt-row"><span>お魚(からあげ変更) x${baseKaraage}</span><span>¥${(baseKaraage * p.karaage).toLocaleString()}</span></div>`; }

                if (exShioyaki > 0) { total += exShioyaki * p.extraShioyaki; receiptHtml += `<div class="sim-receipt-row"><span style="color:#D96D2B;">追加お魚(しお焼き) x${exShioyaki}</span><span>¥${(exShioyaki * p.extraShioyaki).toLocaleString()}</span></div>`; }
                if (exGyoden > 0) { total += exGyoden * p.extraGyoden; receiptHtml += `<div class="sim-receipt-row"><span style="color:#D96D2B;">追加お魚(ぎょでん) x${exGyoden}</span><span>¥${(exGyoden * p.extraGyoden).toLocaleString()}</span></div>`; }
                if (exKaraage > 0) { total += exKaraage * p.extraKaraage; receiptHtml += `<div class="sim-receipt-row"><span style="color:#D96D2B;">追加お魚(からあげ) x${exKaraage}</span><span>¥${(exKaraage * p.extraKaraage).toLocaleString()}</span></div>`; }
            }
            else if (this.state.simA.purpose === 'takeout') {
                const t = this.state.simA.takeout; const p = this.prices.A;
                if (t.rods > 0) {
                    const rodCost = t.rods * p.takeoutRods; total += rodCost;
                    receiptHtml += `<div class="sim-receipt-row"><span>釣竿 x${t.rods}</span><span>¥${rodCost.toLocaleString()}</span></div>`;
                }
                if (t.fish > 0) {
                    let methodPrice = 0; let methodLabel = '';
                    if (t.method === 'raw') { methodPrice = p.methodRaw; methodLabel = '生'; }
                    if (t.method === 'gut') { methodPrice = p.methodGut; methodLabel = 'お腹出し'; }
                    if (t.method === 'grill') { methodPrice = p.methodGrill; methodLabel = '焼き'; }
                    
                    const fishCost = t.fish * (methodPrice * 0.8); total += fishCost;
                    receiptHtml += `<div class="sim-receipt-row"><span>お魚（${methodLabel}） x約${t.fish}匹</span><span>約 ¥${fishCost.toLocaleString()}</span></div>`;
                }
            }
        } 
        else if (flow === 'B') {
            const pB = this.state.simB.people; const pbPrices = this.prices.B; const basePrice = parseInt(this.state.simB.plan, 10);
            const adultMeal = pB.adult * basePrice; const childMeal = pB.child * (basePrice / 2); 
            total += adultMeal + childMeal;
            receiptHtml += `<div class="sim-receipt-row"><span>BBQプラン(大人) x${pB.adult}</span><span>¥${adultMeal.toLocaleString()}</span></div>`;
            receiptHtml += `<div class="sim-receipt-row"><span>BBQプラン(子供) x${pB.child}</span><span>¥${childMeal.toLocaleString()}</span></div>`;
            
            if (this.state.simB.drink === 'alcohol') {
                const alcTotal = (pB.adult * pbPrices.drinkAlcohol) + (pB.child * pbPrices.drinkSoftChild); total += alcTotal;
                receiptHtml += `<div class="sim-receipt-row"><span>アルコール放題(大人) x${pB.adult}</span><span>¥${(pB.adult * pbPrices.drinkAlcohol).toLocaleString()}</span></div>`;
                receiptHtml += `<div class="sim-receipt-row"><span>ソフトドリンク(子供) x${pB.child}</span><span>¥${(pB.child * pbPrices.drinkSoftChild).toLocaleString()}</span></div>`;
            } else if (this.state.simB.drink === 'soft') {
                const softTotal = (pB.adult * pbPrices.drinkSoftAdult) + (pB.child * pbPrices.drinkSoftChild); total += softTotal;
                receiptHtml += `<div class="sim-receipt-row"><span>ソフトドリンク(大人) x${pB.adult}</span><span>¥${(pB.adult * pbPrices.drinkSoftAdult).toLocaleString()}</span></div>`;
                receiptHtml += `<div class="sim-receipt-row"><span>ソフトドリンク(子供) x${pB.child}</span><span>¥${(pB.child * pbPrices.drinkSoftChild).toLocaleString()}</span></div>`;
            }
        }
        
        let totalPeople = (flow === 'A') ? (this.state.simA.people.adult + this.state.simA.people.child) : (this.state.simB.people.adult + this.state.simB.people.child);
        const perPerson = totalPeople > 0 ? Math.round(total / totalPeople) : 0;

        receiptHtml += `
            <div style="display: flex; justify-content: space-between; margin-top: 24px; padding-top: 20px; border-top: 1px solid #D8D2C4; font-size: 0.95rem; color: #666;">
                <span>合計目安</span><span>¥${total.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: bold; color:var(--color-main);">
                <span style="font-size: 1.05rem;">お一人様あたり</span><span style="font-size: 1.6rem;">約 ¥${perPerson.toLocaleString()}</span>
            </div>
        </div>`;

        // ▼ モーダルを開くためのボタン（個人情報の入力フォームはここから消しました）
        const actionHtml = `
            <div class="sim-btn-group" style="flex-direction: column; gap: 12px;">
                <button id="open-reservation-btn" class="sim-btn-block sim-btn-primary" style="background:var(--color-accent); font-size:1.1rem;">📝 このプランでWEB予約に進む</button>
                <button class="sim-btn-block sim-btn-secondary btn-reset">シミュレーションをやり直す</button>
            </div>
        `;

        return receiptHtml + actionHtml;
    }
};

// ページの読み込みが終わったらシミュレーションを起動
document.addEventListener('DOMContentLoaded', () => {
    ReservationSystem.init();
});