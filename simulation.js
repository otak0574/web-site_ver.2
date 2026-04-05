/**
 * 七宗遊園 - 予約・料金シミュレーション＆LINE連携システム
 * （UI改善・入力自動化・3択ポータル・お食事シンプル予約 対応版）
 */

const ReservationSystem = {
    state: {
        isOpen: false,
        flow: null, // 'A'(釣り堀), 'B'(BBQ), 'C'(食事のみ), 'SELECT'(3択)
        step: 1,
        isLoading: false, 
        
        simA: {
            purpose: '', 
            people: { adult: 0, child: 0 },
            date: '', 
            menus: { adultTeishoku: 0, adultTanpin: 0, childKids: 0, childCurry: 0 },
            fish: { shioyaki: 0, gyoden: 0, karaage: 0 },
            takeout: { rods: 0, fish: 0, method: '' } 
        },
        
        simB: {
            people: { adult: 0, child: 0, dog: 0 },
            plan: '', 
            drink: '',
            date: ''
        },

        simC: {
            people: { adult: 0, child: 0 },
            date: ''
        },
        
        userInfo: { name: '', phone: '', policy: false }
    },

    prices: {
        A: { 
            teishoku: 2000, tanpin: 500, kids: 1100, curry: 1100,
            shioyaki: 400, gyoden: 450, karaage: 480,
            takeoutRods: 1000,
            methodRaw: 400, methodGut: 420, methodGrill: 440 
        },
        B: { 
            dogFee: 500,
            drinkAlcohol: 2000,
            drinkSoftAdult: 1500,
            drinkSoftChild: 750
        }
    },

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
            .simulation-form-placeholder { overflow-x: hidden; width: 100%; box-sizing: border-box; overflow-y: auto; padding: 15px 10px; color: #333;}
            
            /* 見出しを明朝体にして上品に */
            .simulation-form-placeholder h4 { margin-top: 5px; margin-bottom: 16px; font-size: 1.1rem; font-family: '筑紫Aオールド明朝', 'YuMincho', serif; border-bottom: 1px solid rgba(44, 66, 52, 0.2); padding-bottom: 8px; color: var(--color-main, #2C4234);}
            .simulation-form-placeholder h5 { margin-top: 24px; margin-bottom: 12px; font-size: 1rem; font-family: '筑紫Aオールド明朝', 'YuMincho', serif; color: var(--color-main, #2C4234); }
            
            /* パネル設定 */
            .sim-panel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px; }
            .sim-panel { border: none; border-radius: 12px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: #fff; font-size: 0.9rem; line-height: 1.4; display: flex; align-items: center; justify-content: center; min-height: 50px; margin-bottom: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
            .sim-panel:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
            .sim-panel.is-active { background: #F4F9F5; color: var(--color-main, #2C4234); font-weight: bold; box-shadow: 0 0 0 2px var(--color-main, #2C4234); transform: translateY(-2px); }
            
            /* カウンター周り */
            .sim-counter-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dotted #ccc; }
            .sim-counter-controls { display: flex; align-items: center; gap: 12px; }
            .sim-btn-circle { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--color-main, #2C4234); background: #fff; color: var(--color-main, #2C4234); font-size: 1.4rem; font-weight: normal; cursor: pointer; display: flex; align-items: center; justify-content: center; touch-action: none !important; user-select: none; -webkit-user-select: none; transition: 0.2s;}
            .sim-btn-circle:active { background: #f0f0f0; transform: scale(0.95); }
            .sim-btn-circle.is-disabled { opacity: 0.2; pointer-events: none; border-color: #999; color: #999;}
            .sim-counter-val { font-size: 1.3rem; font-weight: bold; width: 36px; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif;}
            
            /* フォーム入力欄 */
            .sim-input { width: 100%; padding: 14px 12px; border: 1px solid #ddd; border-radius: 8px; margin-top: 4px; font-size: 16px !important; box-sizing: border-box !important; max-width: 100%; background: #fafafa; transition: border 0.3s;}            
            .sim-input:focus { border-color: var(--color-accent, #D96D2B); outline: none; background: #fff;}
            input[type="date"].sim-input { -webkit-appearance: none; appearance: none; background-color: #fafafa; color: var(--color-text, #333); }
            
            /* ★エラーメッセージ（背景なし・赤文字のみ） */
            .sim-error-msg { color: #d32f2f; padding: 0 0 16px 0; font-size: 0.95rem; display: none; font-weight: bold; text-align: center;}
            
            /* ボタン設定 */
            .sim-btn-block { width: 100%; padding: 14px; border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; border: none; transition: 0.3s; text-align: center; box-sizing: border-box !important; max-width: 100%; margin-bottom: 8px; letter-spacing: 0.05em;}            
            .sim-btn-primary { background: var(--color-accent, #D96D2B); color: #fff; box-shadow: 0 4px 12px rgba(217, 109, 43, 0.3);}
            .sim-btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 6px rgba(217, 109, 43, 0.3);}
            .sim-btn-secondary { background: #fff; border: 1px solid #ccc; color: #555; }
            .sim-btn-secondary:active { background: #f5f5f5; }
            .sim-btn-group { display: flex; gap: 12px; margin-top: 32px; align-items: center; }
            .sim-btn-group .sim-btn-block { margin-top: 0; margin-bottom: 0; width: auto; }
            .sim-btn-group .btn-prev { flex: 1; padding: 14px 8px; font-size: 0.95rem; }
            .sim-btn-group .btn-next, .sim-btn-group .btn-calculate { flex: 2; }
            
            /* レシート表示 */
            .sim-receipt { background: #FFFAF0; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px dashed #E8D5C4;}
            .sim-receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #444;}
            .sim-receipt-total { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid #E8D5C4; font-size: 1.3rem; font-weight: bold; color: var(--color-accent, #D96D2B); font-family: '筑紫Aオールド明朝', 'YuMincho', serif;}
            
            /* ローディング */
            .sim-loading { text-align: center; padding: 50px 0; }
            .sim-spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(217, 109, 43, 0.2); border-radius: 50%; border-top-color: var(--color-accent, #D96D2B); animation: spin 1s ease-in-out infinite; margin-bottom: 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            
            /* ステップアニメーション */
            @keyframes fadeInStep { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            .step-animation { animation: fadeInStep 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `;
        document.head.appendChild(style);
    },

    bindEvents() {
        document.body.addEventListener('click', (e) => {
            // ▼ モーダルを開く処理
            if (e.target.closest('#open-reservation-btn') || e.target.closest('#header-reserve-btn') || e.target.closest('#bottom-reservation-btn') || e.target.closest('#sticky-reservation-btn')) {
                e.preventDefault();
                const path = window.location.pathname;
                if (path.includes('story.html') && e.target.closest('#bottom-reservation-btn')) {
                    this.startSimulation('SELECT'); // 3択画面
                } else if (path.includes('restaurant.html') && e.target.closest('#bottom-reservation-btn')) {
                    this.startSimulation('C'); // シンプル食事予約
                } else {
                    const isBBQ = path.includes('bbq.html')|| path.includes('dogrun.html');
                    this.startSimulation(isBBQ ? 'B' : 'A');
                }
            }

            if (e.target.closest('[data-modal-close]')) this.closeModal();

            // ▼ 3択画面でプランを選んだときの処理
            if (e.target.closest('.sim-panel[data-action="select-plan"]')) {
                const val = e.target.closest('.sim-panel').dataset.value;
                if (val === 'fishing') {
                    // 一番上：釣り体験をして食事（Flow A / eat_in）
                    this.startSimulation('A');
                    this.state.simA.purpose = 'eat_in';
                    this.state.step = 2; 
                    this.render();
                } else if (val === 'restaurant') {
                    // 真ん中：食事のみ・シンプル予約（Flow C）
                    this.startSimulation('C');
                } else if (val === 'bbq') {
                    // 一番下：手ぶらBBQ（Flow B）
                    this.startSimulation('B');
                }
            }

            // ▼ 次へ進むボタン（自動入力の賢い処理付き）
            if (e.target.closest('.btn-next')) {
                if (this.validateCurrentStep()) {
                    this.state.step++;
                    this.render();
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
                    }, 1000); 
                }
            }

            if (e.target.closest('.btn-prev')) {
                this.state.step--;
                this.render();
            }

            if (e.target.closest('.sim-panel') && !e.target.closest('.sim-panel[data-action="select-plan"]')) {
                const panel = e.target.closest('.sim-panel');
                const group = panel.dataset.group;
                const val = panel.dataset.value;
                document.querySelectorAll(`.sim-panel[data-group="${group}"]`).forEach(p => p.classList.remove('is-active'));
                panel.classList.add('is-active');
                
                if (group === 'A_purpose') {
                    this.state.simA.purpose = val;
                    this.state.simA.menus = { adultTeishoku: 0, adultTanpin: 0, childKids: 0, childCurry: 0 };
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
                if (this.state.flow === 'C') this.state.simC.date = e.target.value;
            }
            if (e.target.id === 'user-name') this.state.userInfo.name = e.target.value;
            if (e.target.id === 'user-phone') this.state.userInfo.phone = e.target.value;
            if (e.target.id === 'policy-check') this.state.userInfo.policy = e.target.checked;
            
            if (e.target.id === 'sim-date' && (this.state.step === 4 || this.state.flow === 'C')) {
                this.hideError();
            }
        });
    },

    startSimulation(flow) {
        this.state.flow = flow;
        this.state.step = 1;
        this.state.isLoading = false;
        
        this.state.simA = { 
            purpose: '', people: { adult: 0, child: 0 }, date: '', 
            menus: { adultTeishoku: 0, adultTanpin: 0, childKids: 0, childCurry: 0 }, 
            fish: { shioyaki: 0, gyoden: 0, karaage: 0 },
            takeout: { rods: 0, fish: 0, method: '' } 
        };
        this.state.simB = { people: { adult: 0, child: 0, dog: 0 }, plan: '', drink: '', date: '' };
        this.state.simC = { people: { adult: 0, child: 0 }, date: '' };
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
                const totalPeople = pA.adult + pA.child; 
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
        const sC = this.state.simC;

        if (this.state.flow === 'A') {
            if (step === 1 && !sA.purpose) {
                this.showError('「持ち帰り」か「店内で食事」を選択してください。'); return false;
            }
            if (step === 2 && sA.people.adult < 1) {
                this.showError('ご来場には、必ず大人（中学生以上）1名以上の同伴が必要です。'); return false;
            }
            if (step === 3) {
                const totalPeople = sA.people.adult + sA.people.child;
                if (sA.purpose === 'eat_in') {
                    const adultMenus = sA.menus.adultTeishoku + sA.menus.adultTanpin;
                    if (adultMenus !== sA.people.adult) {
                        this.showError(`大人は人数分（${sA.people.adult}名分）のオーダーが必要です。残り${sA.people.adult - adultMenus}名分のメニューを選択してください。`); return false;
                    }
                    const totalFish = sA.fish.shioyaki + sA.fish.gyoden + sA.fish.karaage;
                    if (totalFish < totalPeople) {
                        this.showError(`お魚はご来場人数（最低${totalPeople}匹）以上釣っていただくルールとなっております。調理方法を合計${totalPeople}匹以上になるよう選択してください。`); return false;
                    }
                } else if (sA.purpose === 'takeout') {
                    if (sA.takeout.rods === 0) {
                        this.showError('釣竿を1本以上選択してください。'); return false;
                    }
                    if (sA.takeout.fish < totalPeople) {
                        this.showError(`お魚はご来場人数（最低${totalPeople}匹）以上釣っていただくルールとなっております。釣る予定の匹数を${totalPeople}匹以上に増やしてください。`); return false;
                    }
                    if (sA.takeout.fish > 0 && !sA.takeout.method) {
                        this.showError('釣る予定のお魚の「調理方法」を選択してください。'); return false;
                    }
                }
            }
        }

        if (this.state.flow === 'B') {
            if (step === 1 && sB.people.adult < 1) {
                this.showError('ご来場には、必ずおとな1名以上の同伴が必要です。'); return false;
            }
            if (step === 2 && !sB.plan) {
                this.showError('ご希望のプランを1つ選択してください。'); return false;
            }
        }

        if (this.state.flow === 'C') {
            if (step === 1 && sC.people.adult < 1) {
                this.showError('ご来店には、必ず大人（中学生以上）1名以上の同伴が必要です。'); return false;
            }
        }
        return true;
    },

    render() {
        const container = document.querySelector('.simulation-form-placeholder');
        if (!container) return;

        if (this.state.isLoading) {
            container.innerHTML = `
                <div class="sim-loading step-animation">
                    <div class="sim-spinner"></div>
                    <p style="font-weight:bold; color:var(--color-main);">料金をお見積り中...</p>
                </div>
            `;
            return;
        }

        let html = `<div id="sim-error" class="sim-error-msg"></div>`;
        const flow = this.state.flow;
        const step = this.state.step;

        document.querySelector('.modal-title').innerText = 
            flow === 'A' ? '釣り堀・レストラン 予約' : 
            (flow === 'B' ? '手ぶらBBQ 予約' : 
            (flow === 'C' ? 'お食事のみ 予約' : 'ご希望のプラン'));

        if (flow === 'SELECT') {
            html += `
                <div class="sim-panel-grid" style="grid-template-columns: 1fr; margin-top:16px;">
                    <div class="sim-panel" data-action="select-plan" data-value="fishing" style="display:flex; flex-direction:column; align-items:center; padding:20px;">
                        <span style="font-size:1.8rem; margin-bottom:8px;">🐟</span>
                        <span style="font-weight:bold;">釣り堀＋レストラン<br><small style="font-weight:normal;">（釣って店内で食事）</small></span>
                    </div>
                    <div class="sim-panel" data-action="select-plan" data-value="restaurant" style="display:flex; flex-direction:column; align-items:center; padding:20px;">
                        <span style="font-size:1.8rem; margin-bottom:8px;">🍽️</span>
                        <span style="font-weight:bold;">レストラン<br><small style="font-weight:normal;">（お食事のみ）</small></span>
                    </div>
                    <div class="sim-panel" data-action="select-plan" data-value="bbq" style="display:flex; flex-direction:column; align-items:center; padding:20px;">
                        <span style="font-size:1.8rem; margin-bottom:8px;">🏕️</span>
                        <span style="font-weight:bold;">手ぶらBBQ<br><small style="font-weight:normal;">（1日3組限定）</small></span>
                    </div>
                </div>
            `;
        }

        if (flow === 'A') {
            if (step === 1) {
                html += `
                    <h4>ご利用目的</h4>
                    <div class="sim-panel-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                        <div class="sim-panel ${this.state.simA.purpose === 'takeout' ? 'is-active' : ''}" data-group="A_purpose" data-value="takeout">釣ってお持ち帰り</div>
                        <div class="sim-panel ${this.state.simA.purpose === 'eat_in' ? 'is-active' : ''}" data-group="A_purpose" data-value="eat_in">釣って店内で食事</div>
                    </div>
                    <div class="sim-btn-group"><button class="sim-btn-block sim-btn-primary btn-next">次へ</button></div>
                `;
            } else if (step === 2) {
                html += `
                    <h4>ご来店人数</h4>
                    ${this.createCounter('simA.people.adult', '大人(中学生以上)', this.state.simA.people.adult)}
                    ${this.createCounter('simA.people.child', '子供(小学生)', this.state.simA.people.child)}
                    
                    <h4 style="margin-top:32px;">ご希望日</h4>
                    <input type="date" id="sim-date" class="sim-input" value="${this.state.simA.date}" min="${this.getTomorrowDateString()}">
                    
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-secondary btn-prev">戻る</button>
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 3) {
                if (this.state.simA.purpose === 'eat_in') {
                    const pA = this.state.simA.people;
                    const mA = this.state.simA.menus;
                    const adultRemain = pA.adult - (mA.adultTeishoku + mA.adultTanpin);
                    const childRemain = pA.child - (mA.childKids + mA.childCurry);

                    html += `
                        <h5 style="margin-top:0;">大人のメニュー</h5>
                        ${this.createCounter('simA.menus.adultTeishoku', '定食', mA.adultTeishoku, adultRemain === 0)}
                        ${this.createCounter('simA.menus.adultTanpin', '単品・釣り体験のみ', mA.adultTanpin, adultRemain === 0)}
                        
                        <h5>子供のメニュー</h5>
                        ${this.createCounter('simA.menus.childKids', 'お子様ランチ', mA.childKids, childRemain === 0)}
                        ${this.createCounter('simA.menus.childCurry', 'カレー', mA.childCurry, childRemain === 0)}

                        <h5>釣ったお魚の調理方法</h5>
                        ${this.createCounter('simA.fish.shioyaki', 'しお焼き', this.state.simA.fish.shioyaki)}
                        ${this.createCounter('simA.fish.gyoden', 'ぎょでん・みそ', this.state.simA.fish.gyoden)}
                        ${this.createCounter('simA.fish.karaage', 'からあげ', this.state.simA.fish.karaage)}
                    `;
                } else if (this.state.simA.purpose === 'takeout') {
                    const pA = this.state.simA.people;
                    const totalPeople = pA.adult + pA.child;
                    const isRodMaxed = this.state.simA.takeout.rods >= totalPeople; 

                    html += `
                        <h5 style="margin-top:0;">釣りの道具</h5>
                        ${this.createCounter('simA.takeout.rods', '竿の本数', this.state.simA.takeout.rods, isRodMaxed)}
                        
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
                    <h4>ご来店人数</h4>
                    ${this.createCounter('simB.people.adult', 'おとな', this.state.simB.people.adult)}
                    ${this.createCounter('simB.people.child', 'こども', this.state.simB.people.child)}
                    ${this.createCounter('simB.people.dog', 'わんちゃん', this.state.simB.people.dog)}

                    <h4 style="margin-top:32px;">ご希望日</h4>
                    <input type="date" id="sim-date" class="sim-input" value="${this.state.simB.date}" min="${this.getTomorrowDateString()}">
                    
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 2) {
                html += `
                    <h4>プランの選択</h4>
                    <div class="sim-panel-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                        <div class="sim-panel ${this.state.simB.plan === '3000' ? 'is-active' : ''}" data-group="B_plan" data-value="3000">スタンダード<br>（3,000円）</div>
                        <div class="sim-panel ${this.state.simB.plan === '4000' ? 'is-active' : ''}" data-group="B_plan" data-value="4000">ボリューム<br>（4,000円）</div>
                        <div class="sim-panel ${this.state.simB.plan === '5000' ? 'is-active' : ''}" data-group="B_plan" data-value="5000">プレミアム<br>（5,000円）</div>
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
                            <span>アルコール飲み放題</span>
                            <small style="font-weight:normal; font-size:0.8rem;">（大人はアルコール、子供はソフトドリンク）</small>
                        </div>
                        <div class="sim-panel ${this.state.simB.drink === 'soft' ? 'is-active' : ''}" data-group="B_drink" data-value="soft" style="flex-direction:column;">
                            <span>ソフトドリンク飲み放題</span>
                            <small style="font-weight:normal; font-size:0.8rem;">（全員ソフトドリンク）</small>
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

        if (flow === 'C') {
            if (step === 1) {
                html += `
                    <h4>ご来店人数</h4>
                    ${this.createCounter('simC.people.adult', '大人(中学生以上)', this.state.simC.people.adult)}
                    ${this.createCounter('simC.people.child', '子供(小学生)', this.state.simC.people.child)}
                    
                    <div class="sim-btn-group">
                        <button class="sim-btn-block sim-btn-primary btn-next">次へ</button>
                    </div>
                `;
            } else if (step === 2) {
                html += `
                    <h4>ご予約者情報の入力</h4>
                    
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--color-main);">ご来店日</label>
                    <input type="date" id="sim-date" class="sim-input" value="${this.state.simC.date}" min="${this.getTomorrowDateString()}" style="margin-bottom:20px;">

                    <label style="font-size:0.85rem; font-weight:bold; color:var(--color-main);">代表者名</label>
                    <input type="text" id="user-name" class="sim-input" value="${this.state.userInfo.name}" placeholder="山田 太郎" style="margin-bottom:20px;">
                    
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--color-main);">電話番号</label>
                    <input type="tel" id="user-phone" class="sim-input" value="${this.state.userInfo.phone}" placeholder="09012345678" style="margin-bottom:32px;">

                    <label style="display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; font-size:0.95rem; font-weight:bold; margin-bottom:16px;">
                        <input type="checkbox" id="policy-check" style="transform:scale(1.3);" ${this.state.userInfo.policy ? 'checked' : ''}>
                        <span>キャンセルポリシーに同意する</span>
                    </label>

                    <div class="sim-btn-group" style="margin-top:16px;">
                        <button class="sim-btn-block sim-btn-secondary btn-prev" style="border:none;">戻る</button>
                        <button id="btn-submit-line" class="sim-btn-block" style="background:#06C755; color:#fff; box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);">LINEで予約する</button>
                    </div>
                `;
            }
        }

        const animationClass = this.state._prevStep !== step ? 'step-animation' : '';
        this.state._prevStep = step;

        container.innerHTML = `<div class="${animationClass}">${html}</div>`;
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
            const pbPrices = this.prices.B;
            const basePrice = parseInt(this.state.simB.plan, 10);
            
            const adultMeal = pB.adult * basePrice;
            const childMeal = pB.child * (basePrice / 2); 
            total += adultMeal + childMeal;
            receiptHtml += `<div class="sim-receipt-row"><span>BBQプラン(大人) x${pB.adult}</span><span>¥${adultMeal.toLocaleString()}</span></div>`;
            receiptHtml += `<div class="sim-receipt-row"><span>BBQプラン(子供) x${pB.child}</span><span>¥${childMeal.toLocaleString()}</span></div>`;
            
            if (this.state.simB.drink === 'alcohol') {
                const alcTotal = (pB.adult * pbPrices.drinkAlcohol) + (pB.child * pbPrices.drinkSoftChild);
                total += alcTotal;
                receiptHtml += `<div class="sim-receipt-row"><span>アルコール放題(大人) x${pB.adult}</span><span>¥${(pB.adult * pbPrices.drinkAlcohol).toLocaleString()}</span></div>`;
                receiptHtml += `<div class="sim-receipt-row"><span>ソフトドリンク(子供) x${pB.child}</span><span>¥${(pB.child * pbPrices.drinkSoftChild).toLocaleString()}</span></div>`;
            } else if (this.state.simB.drink === 'soft') {
                const softTotal = (pB.adult * pbPrices.drinkSoftAdult) + (pB.child * pbPrices.drinkSoftChild);
                total += softTotal;
                receiptHtml += `<div class="sim-receipt-row"><span>ソフトドリンク(大人) x${pB.adult}</span><span>¥${(pB.adult * pbPrices.drinkSoftAdult).toLocaleString()}</span></div>`;
                receiptHtml += `<div class="sim-receipt-row"><span>ソフトドリンク(子供) x${pB.child}</span><span>¥${(pB.child * pbPrices.drinkSoftChild).toLocaleString()}</span></div>`;
            }
        }

        receiptHtml += `
            <div style="background:#f4f9f5; border:1px dashed var(--color-main); padding:10px; border-radius:8px; margin-bottom:15px; text-align:center;">
                <p style="color:var(--color-main); font-weight:bold; margin-bottom:4px; font-size:0.95rem;">
                    ✨ お見積りは「目安」です
                </p>
                <p style="font-size:0.8rem; color:#444; line-height:1.4;">
                    当日の追加変更も大歓迎！お待ちしております。
                </p>
            </div>
            `;
        receiptHtml += `<div class="sim-receipt-total"><span>合計目安</span><span>¥${total.toLocaleString()}</span></div></div>`;

        const currentDate = flow === 'A' ? this.state.simA.date : this.state.simB.date;
        const dateAlertHtml = !currentDate ? `<div style="color:#c00; font-size:0.85rem; font-weight:bold; margin-bottom:8px;">※ご予約に進むには日付の入力が必要です</div>` : '';

        const formHtml = `
            <h4 style="margin-bottom:12px; color:var(--color-main);">ご予約者情報の入力</h4>
            
            ${dateAlertHtml}
            <label style="font-size:0.9rem; font-weight:bold;">ご予約日 <span style="color:#c00;">*</span></label>
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
            <div style="background:#fff3cd; color:#856404; padding:8px 12px; border-radius:4px; font-size:0.85rem; margin-top:4px; margin-bottom:8px; border-left:4px solid #ffeeba; line-height:1.4;">
            当日のご予約は承っておりません。<br>お電話でお問い合わせください。
            </div>
            <div class="sim-btn-group">
                <button class="sim-btn-block sim-btn-secondary btn-prev" style="border:none;">戻る</button>
                <button id="btn-submit-line" class="sim-btn-block" style="background:#06C755; color:#fff;">LINEで予約する</button>
            </div>
        `;

        return receiptHtml + formHtml;
    },

    sendToLine() {
        this.hideError();
        const u = this.state.userInfo;
        const flow = this.state.flow;
        const currentDate = flow === 'A' ? this.state.simA.date : (flow === 'B' ? this.state.simB.date : this.state.simC.date);
        
        if (!currentDate) { this.showError('ご予約日を選択してください。'); return; }
        if (currentDate < this.getTomorrowDateString()) { this.showError('当日のご予約は承っておりません。お電話でお問い合わせください。'); return; }
        if (!u.name.trim() || !u.phone.trim()) { this.showError('お名前と電話番号を入力してください。'); return; }
        
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(u.phone.trim())) { this.showError('電話番号はハイフンなしの半角数字（10桁または11桁）で入力してください。例：09012345678'); return; }
        
        if (!u.policy) { this.showError('キャンセルポリシーへの同意チェックが必要です。'); return; }

        let planStr = flow === 'A' ? `釣り堀・レストラン（${this.state.simA.purpose === 'takeout' ? '持ち帰り' : '店内飲食'}）` : (flow === 'B' ? `バーベキュー（${this.state.simB.plan}円プラン）` : `レストラン（お食事のみ）`);
        
        let details = [];
        if (flow === 'A') {
            const p = this.state.simA.people;
            details.push(`大人${p.adult}名/子供${p.child}名`);
        } else if (flow === 'B') {
            const p = this.state.simB.people;
            details.push(`大人${p.adult}名/子供${p.child}名/犬${p.dog}頭`);
        } else if (flow === 'C') {
            const p = this.state.simC.people;
            details.push(`大人${p.adult}名/子供${p.child}名`);
        }

        const textMessage = `【七宗遊園 予約・お問い合わせ】\n以下の内容で予約を依頼します。\n■ ご利用施設：${planStr}\n■ ご予約日：${currentDate}\n■ 人数・内訳：${details.join('、')}\n■ 代表者名：${u.name} 様\n■ お電話番号：${u.phone}`;
        const encodedText = encodeURIComponent(textMessage);
        const lineUrl = `https://line.me/R/oaMessage/@543grrmg/?${encodedText}`;
        window.open(lineUrl, '_blank');
    }
};