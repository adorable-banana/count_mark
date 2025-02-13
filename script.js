document.addEventListener('DOMContentLoaded', function() {
    // 添加計時器相關變量
    const timerDisplay = document.querySelector('.timer-display');
    const timerProgress = document.querySelector('.timer-progress');
    const resetButton = document.getElementById('resetTimer');
    const MATCH_DURATION = 3 * 60; // 3分鐘換算成秒
    const BREAK_DURATION = 2 * 60; // 中場休息2分鐘
    let timeRemaining = MATCH_DURATION;
    let isBreakTime = false; // 添加標記來區分是否為休息時間
    let timerInterval;

    const nextPeriodButton = document.getElementById('nextPeriod');

    let currentPeriod = 1;
    const periodDisplay = document.querySelector('.period-display');
    periodDisplay.textContent = `第 ${currentPeriod} 節`;
    
    const increaseTimeBtn = document.getElementById('increaseTime');
    const decreaseTimeBtn = document.getElementById('decreaseTime');

    const pauseButton = document.getElementById('pauseTimer');
    let isPaused = true;
    pauseButton.textContent = '開始';
    pauseButton.classList.add('paused');

    let homeFirstPeriodScore = 0;
    let awayFirstPeriodScore = 0;
    const homeFirstPeriodScoreDisplay = document.getElementById('homeFirstPeriodScore');
    const awayFirstPeriodScoreDisplay = document.getElementById('awayFirstPeriodScore');

    // 添加新的變量
    let homeSecondPeriodScore = 0;
    let awaySecondPeriodScore = 0;
    const homeSecondPeriodScoreDisplay = document.getElementById('homeSecondPeriodScore');
    const awaySecondPeriodScoreDisplay = document.getElementById('awaySecondPeriodScore');
    const homeTotalScoreDisplay = document.getElementById('homeTotalScore');
    const awayTotalScoreDisplay = document.getElementById('awayTotalScore');

    // 添加禁用/啟用按鈕的函數
    function toggleTimeButtons(disabled) {
        increaseTimeBtn.disabled = disabled;
        decreaseTimeBtn.disabled = disabled;
        if (disabled) {
            increaseTimeBtn.classList.add('disabled');
            decreaseTimeBtn.classList.add('disabled');
        } else {
            increaseTimeBtn.classList.remove('disabled');
            decreaseTimeBtn.classList.remove('disabled');
        }
    }

    // 添加得分按鈕禁用/啟用函數
    function toggleScoreButtons(disabled) {
        homeScoreBtn.disabled = disabled;
        awayScoreBtn.disabled = disabled;
        if (disabled) {
            homeScoreBtn.classList.add('disabled');
            awayScoreBtn.classList.add('disabled');
        } else {
            homeScoreBtn.classList.remove('disabled');
            awayScoreBtn.classList.remove('disabled');
        }
    }

    // 添加禁用重置分數按鈕的函數
    function toggleResetScoreButton(disabled) {
        resetScoreBtn.disabled = disabled;
        if (disabled) {
            resetScoreBtn.classList.add('disabled');
        } else {
            resetScoreBtn.classList.remove('disabled');
        }
    }

    // 修改重置計時器功能
    function resetTimer() {
        clearInterval(timerInterval);

        // 如果是比賽結束狀態，執行完整重置
        if (periodDisplay.textContent === '比賽結束') {
            // 重置所有狀態
            currentPeriod = 1;
            isBreakTime = false;
            timeRemaining = MATCH_DURATION;
            periodDisplay.textContent = `第 ${currentPeriod} 節`;
            periodDisplay.classList.remove('end');
            resetButton.textContent = '重置時間'; // 將按鈕文字改回原本的
            
            // 重置所有分數
            homeScore = 0;
            awayScore = 0;
            homeFirstPeriodScore = 0;
            awayFirstPeriodScore = 0;
            homeSecondPeriodScore = 0;
            awaySecondPeriodScore = 0;
            
            // 更新分數顯示
            homeScoreDisplay.textContent = '0';
            awayScoreDisplay.textContent = '0';
            
            // 隱藏所有階段分數顯示
            homeFirstPeriodScoreDisplay.style.display = 'none';
            awayFirstPeriodScoreDisplay.style.display = 'none';
            homeSecondPeriodScoreDisplay.style.display = 'none';
            awaySecondPeriodScoreDisplay.style.display = 'none';
            homeTotalScoreDisplay.style.display = 'none';
            awayTotalScoreDisplay.style.display = 'none';

            // 啟用得分按鈕
            toggleScoreButtons(false);

            // 重新啟用重置分數按鈕
            toggleResetScoreButton(false);
        } else {
            // 原有的重置邏輯
            if (isBreakTime) {
                timeRemaining = BREAK_DURATION;
                toggleScoreButtons(true);
            } else {
                timeRemaining = MATCH_DURATION;
                toggleScoreButtons(false);
                if (currentPeriod === 1) {
                    // 在第一節重置時，重置所有狀態
                    currentPeriod = 1;
                    periodDisplay.textContent = `第 ${currentPeriod} 節`;
                    periodDisplay.classList.remove('end');
                    nextPeriodButton.style.display = 'none';
                    // 隱藏所有得分顯示
                    homeFirstPeriodScoreDisplay.style.display = 'none';
                    awayFirstPeriodScoreDisplay.style.display = 'none';
                    homeSecondPeriodScoreDisplay.style.display = 'none';
                    awaySecondPeriodScoreDisplay.style.display = 'none';
                    homeTotalScoreDisplay.style.display = 'none';
                    awayTotalScoreDisplay.style.display = 'none';
                    // 重置所有分數
                    homeFirstPeriodScore = 0;
                    awayFirstPeriodScore = 0;
                    homeSecondPeriodScore = 0;
                    awaySecondPeriodScore = 0;
                }
                // 在第二節重置時，保持第一節的分數顯示
            }
        }

        isPaused = true;
        pauseButton.textContent = '開始';
        pauseButton.classList.add('paused');

        // 重置樣式
        timerDisplay.classList.remove('timeout');
        document.querySelector('.timer-bar').classList.remove('timeout');
        document.querySelector('.timer-progress').classList.remove('timeout');

        // 根據當前狀態設置按鈕
        if (isBreakTime) {
            toggleTimeButtons(true); // 休息時間保持禁用加減按鈕
            timerDisplay.textContent = `中場休息 ${Math.floor(BREAK_DURATION/60)}:00`;
            nextPeriodButton.style.display = 'block';
        } else {
            toggleTimeButtons(false); // 比賽時間啟用加減按鈕
        }

        // 更新顯示
        updateTimerDisplay();
        updateProgressBar();
    }

    // 添加重置按鈕點擊事件
    resetButton.addEventListener('click', resetTimer);

    // 修改計時器結束邏輯
    function startTimer() {
        if (isPaused) return;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            updateProgressBar();
            updateSharedData(); // 每秒更新一次數據

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                if (currentPeriod === 1) {
                    // 第一節結束，開始中場休息
                    isBreakTime = true;
                    timeRemaining = BREAK_DURATION;
                    timerDisplay.textContent = '中場休息';
                    timerDisplay.classList.add('timeout');
                    document.querySelector('.timer-bar').classList.add('timeout');
                    document.querySelector('.timer-progress').classList.add('timeout');
                    nextPeriodButton.style.display = 'block';
                    
                    // 保存並顯示第一節分數
                    homeFirstPeriodScore = homeScore;
                    awayFirstPeriodScore = awayScore;
                    homeFirstPeriodScoreDisplay.style.display = 'block';
                    awayFirstPeriodScoreDisplay.style.display = 'block';
                    homeFirstPeriodScoreDisplay.querySelector('span').textContent = homeFirstPeriodScore;
                    awayFirstPeriodScoreDisplay.querySelector('span').textContent = awayFirstPeriodScore;
                    
                    // 禁用按鈕
                    toggleTimeButtons(true);
                    toggleScoreButtons(true);
                    // 開始休息時間倒計時
                    startBreakTimer();
                } else if (currentPeriod === 2) {
                    // 第二節結束，比賽結束
                    timerDisplay.textContent = '比賽結束';
                    periodDisplay.textContent = '比賽結束';
                    periodDisplay.classList.add('end');
                    timerDisplay.classList.add('timeout');
                    document.querySelector('.timer-bar').classList.add('timeout');
                    document.querySelector('.timer-progress').classList.add('timeout');
                    nextPeriodButton.style.display = 'none';

                    // 計算並顯示第二節得分
                    homeSecondPeriodScore = homeScore - homeFirstPeriodScore;
                    awaySecondPeriodScore = awayScore - awayFirstPeriodScore;
                    
                    // 顯示第二節得分
                    homeSecondPeriodScoreDisplay.style.display = 'block';
                    awaySecondPeriodScoreDisplay.style.display = 'block';
                    homeSecondPeriodScoreDisplay.querySelector('span').textContent = homeSecondPeriodScore;
                    awaySecondPeriodScoreDisplay.querySelector('span').textContent = awaySecondPeriodScore;
                    
                    // 顯示總得分
                    homeTotalScoreDisplay.style.display = 'block';
                    awayTotalScoreDisplay.style.display = 'block';
                    homeTotalScoreDisplay.querySelector('span').textContent = homeScore;
                    awayTotalScoreDisplay.querySelector('span').textContent = awayScore;

                    // 顯示重置提示文字
                    document.getElementById('resetMessage').style.display = 'block';

                    // 禁用所有按鈕
                    toggleTimeButtons(true);
                    toggleScoreButtons(true);
                    toggleResetScoreButton(true);
                    
                    // 禁用其他按鈕
                    resetButton.disabled = true;
                    resetButton.classList.add('disabled');
                    pauseButton.disabled = true;
                    pauseButton.classList.add('disabled');
                    nextPeriodButton.disabled = true;
                    nextPeriodButton.classList.add('disabled');
                    
                    // 暫停計時器
                    isPaused = true;
                    pauseButton.textContent = '開始';
                    pauseButton.classList.add('paused');
                }
                updateSharedData(); // 添加數據同步
            }
        }, 1000);
    }

    // 修改中場休息計時器
    function startBreakTimer() {
        if (isPaused) return;
        clearInterval(timerInterval);
        // 禁用加減按鈕和得分按鈕
        toggleTimeButtons(true);
        toggleScoreButtons(true); // 禁用得分按鈕
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            // 更新休息時間顯示
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `中場休息 ${minutes}:${seconds.toString().padStart(2, '0')}`;
            updateProgressBar();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = '請開始第二節';
            }
        }, 1000);
    }

    // 修改下一節按鈕事件
    nextPeriodButton.addEventListener('click', () => {
        if (currentPeriod === 1) {
            isBreakTime = false;
            currentPeriod = 2;
            periodDisplay.textContent = `第 ${currentPeriod} 節`;
            timeRemaining = MATCH_DURATION;
            // 重置樣式
            timerDisplay.classList.remove('timeout');
            document.querySelector('.timer-bar').classList.remove('timeout');
            document.querySelector('.timer-progress').classList.remove('timeout');
            // 隱藏下一節按鈕
            nextPeriodButton.style.display = 'none';
            // 啟用所有按鈕
            toggleTimeButtons(false);
            toggleScoreButtons(false);
            // 更新顯示
            updateTimerDisplay();
            updateProgressBar();
            // 開始第二節計時
            startTimer();
        }
    });

    // 修改進度條更新函數
    function updateProgressBar() {
        const totalDuration = isBreakTime ? BREAK_DURATION : MATCH_DURATION;
        const progressPercentage = (timeRemaining / totalDuration) * 100;
        timerProgress.style.width = `${progressPercentage}%`;
    }

    // 修改增減時間按鈕事件
    document.getElementById('increaseTime').addEventListener('click', () => {
        timeRemaining += 60;
        updateTimerDisplay();
        updateProgressBar();
        updateSharedData(); // 添加更新
    });

    document.getElementById('decreaseTime').addEventListener('click', () => {
        if (timeRemaining > 60) {
            timeRemaining -= 60;
            updateTimerDisplay();
            updateProgressBar();
            updateSharedData(); // 添加更新
        }
    });

    // 更新時間顯示
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 初始化分數
    let homeScore = 0;
    let awayScore = 0;

    // 獲取DOM元素
    const homeScoreBtn = document.getElementById('homeScore');
    const awayScoreBtn = document.getElementById('awayScore');
    const homeScoreDisplay = document.getElementById('homeScoreDisplay');
    const awayScoreDisplay = document.getElementById('awayScoreDisplay');
    const resetScoreBtn = document.getElementById('resetScore');

    // 重置分數功能
    function resetScore() {
        // 如果是比賽結束狀態，執行完整重置
        if (periodDisplay.textContent === '比賽結束') {
            // 重置所有狀態
            currentPeriod = 1;
            isBreakTime = false;
            timeRemaining = MATCH_DURATION;
            periodDisplay.textContent = `第 ${currentPeriod} 節`;
            periodDisplay.classList.remove('end');
            
            // 重置按鈕文字
            resetButton.textContent = '重置時間';
            resetScoreBtn.textContent = '重置分數';
            
            // 重置所有分數
            homeScore = 0;
            awayScore = 0;
            homeFirstPeriodScore = 0;
            awayFirstPeriodScore = 0;
            homeSecondPeriodScore = 0;
            awaySecondPeriodScore = 0;
            
            // 更新分數顯示
            homeScoreDisplay.textContent = '0';
            awayScoreDisplay.textContent = '0';
            
            // 隱藏所有階段分數顯示
            homeFirstPeriodScoreDisplay.style.display = 'none';
            awayFirstPeriodScoreDisplay.style.display = 'none';
            homeSecondPeriodScoreDisplay.style.display = 'none';
            awaySecondPeriodScoreDisplay.style.display = 'none';
            homeTotalScoreDisplay.style.display = 'none';
            awayTotalScoreDisplay.style.display = 'none';

            // 重置樣式
            timerDisplay.classList.remove('timeout');
            document.querySelector('.timer-bar').classList.remove('timeout');
            document.querySelector('.timer-progress').classList.remove('timeout');
            
            // 啟用按鈕
            toggleTimeButtons(false);
            toggleScoreButtons(false);
            
            // 更新顯示
            updateTimerDisplay();
            updateProgressBar();
        } else {
            // 原有的重置分數邏輯
            homeScore = 0;
            awayScore = 0;
            homeScoreDisplay.textContent = '0';
            awayScoreDisplay.textContent = '0';
            // 重置並隱藏所有得分顯示
            homeFirstPeriodScoreDisplay.style.display = 'none';
            awayFirstPeriodScoreDisplay.style.display = 'none';
            homeSecondPeriodScoreDisplay.style.display = 'none';
            awaySecondPeriodScoreDisplay.style.display = 'none';
            homeTotalScoreDisplay.style.display = 'none';
            awayTotalScoreDisplay.style.display = 'none';
            // 重置所有分數
            homeFirstPeriodScore = 0;
            awayFirstPeriodScore = 0;
            homeSecondPeriodScore = 0;
            awaySecondPeriodScore = 0;
            // 添加重置動畫效果
            animateScore(homeScoreDisplay);
            animateScore(awayScoreDisplay);
        }
        updateSharedData(); // 添加數據同步
    }

    // 添加重置分數按鈕點擊事件
    resetScoreBtn.addEventListener('click', resetScore);

    // 修改主隊得分按鈕事件
    homeScoreBtn.addEventListener('click', function() {
        homeScore++;
        homeScoreDisplay.textContent = homeScore;
        animateScore(homeScoreDisplay);
        updateSharedData(); // 確保更新共享數據
    });

    // 修改客隊得分按鈕事件
    awayScoreBtn.addEventListener('click', function() {
        awayScore++;
        awayScoreDisplay.textContent = awayScore;
        animateScore(awayScoreDisplay);
        updateSharedData(); // 確保更新共享數據
    });

    // 分數更新動畫
    function animateScore(element) {
        element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    // 修改暫停按鈕事件
    pauseButton.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(timerInterval);
            pauseButton.textContent = '開始';
            pauseButton.classList.add('paused');
        } else {
            if (isBreakTime) {
                startBreakTimer();
            } else {
                startTimer();
            }
            pauseButton.textContent = '暫停';
            pauseButton.classList.remove('paused');
        }
        updateSharedData(); // 添加暫停狀態同步
    });

    // 角色選擇相關
    const roleSelection = document.getElementById('roleSelection');
    const mainContent = document.getElementById('mainContent');
    const adminBtn = document.getElementById('adminBtn');
    const guestBtn = document.getElementById('guestBtn');

    // 控制按鈕
    const controlButtons = document.querySelectorAll('.time-button, .reset-button, .pause-button, #homeScore, #awayScore, #resetScore');

    // 添加密碼驗證相關變量
    const passwordDialog = document.getElementById('passwordDialog');
    const adminPassword = document.getElementById('adminPassword');
    const submitPassword = document.getElementById('submitPassword');
    const cancelPassword = document.getElementById('cancelPassword');
    const passwordError = document.getElementById('passwordError');

    // 修改遊客按鈕點擊事件
    guestBtn.addEventListener('click', function() {
        roleSelection.style.display = 'none';
        mainContent.style.display = 'block';
        mainContent.classList.add('guest-mode');
        
        // 隱藏所有控制按鈕
        controlButtons.forEach(button => {
            button.classList.add('guest-hidden');
        });

        // 設置為遊客模式
        localStorage.setItem('isAdmin', 'false');
        
        // 立即同步一次當前數據
        try {
            const gameData = JSON.parse(localStorage.getItem('gameData') || '{}');
            if (Object.keys(gameData).length > 0) {
                // 更新時間和進度條
                if (gameData.timeRemaining !== undefined) {
                    timeRemaining = gameData.timeRemaining;
                    updateTimerDisplay();
                    updateProgressBar();
                }
                
                // 更新所有狀態
                if (gameData.currentPeriod !== undefined) {
                    currentPeriod = gameData.currentPeriod;
                    isBreakTime = gameData.isBreakTime;
                    isPaused = gameData.isPaused;
                    
                    // 更新顯示
                    timerDisplay.textContent = gameData.timerDisplay;
                    periodDisplay.textContent = gameData.periodDisplay;
                }
                
                // 更新分數
                if (gameData.homeScore !== undefined) {
                    homeScore = gameData.homeScore;
                    homeScoreDisplay.textContent = gameData.homeScore;
                }
                if (gameData.awayScore !== undefined) {
                    awayScore = gameData.awayScore;
                    awayScoreDisplay.textContent = gameData.awayScore;
                }

                // 更新隊名
                if (gameData.homeTeamName) {
                    homeTeamName.value = gameData.homeTeamName;
                }
                if (gameData.awayTeamName) {
                    awayTeamName.value = gameData.awayTeamName;
                }
            }
        } catch (error) {
            console.error('初始同步數據時出錯:', error);
        }
        
        // 開始持續同步
        startDataSync();
    });

    // 修改管理員按鈕點擊事件
    adminBtn.addEventListener('click', function() {
        roleSelection.style.display = 'none';
        passwordDialog.style.display = 'flex';
    });

    // 添加密碼提交事件
    submitPassword.addEventListener('click', function() {
        if (adminPassword.value === 'chameleon') {
            passwordDialog.style.display = 'none';
            mainContent.style.display = 'block';
            mainContent.classList.remove('guest-mode');
            
            // 使隊名可編輯
            homeTeamName.readOnly = false;
            awayTeamName.readOnly = false;
            homeTeamName.classList.add('editable');
            awayTeamName.classList.add('editable');
            
            // 設置為管理員模式
            localStorage.setItem('isAdmin', 'true');
            
            // 只更新數據，不需要啟動同步
            updateSharedData();

            // 重置密碼輸入
            adminPassword.value = '';
            passwordError.style.display = 'none';
        } else {
            passwordError.style.display = 'block';
            adminPassword.value = '';
        }
    });

    // 添加取消按鈕事件
    cancelPassword.addEventListener('click', function() {
        passwordDialog.style.display = 'none';
        roleSelection.style.display = 'flex';
        adminPassword.value = '';
        passwordError.style.display = 'none';
    });

    // 添加按 Enter 鍵提交密碼
    adminPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitPassword.click();
        }
    });

    // 在文件加載時添加以下代碼
    const homeTeamName = document.getElementById('homeTeamName');
    const awayTeamName = document.getElementById('awayTeamName');

    // 修改數據同步相關函數
    function updateSharedData() {
        const sharedData = {
            timeRemaining,
            currentPeriod,
            homeScore,
            awayScore,
            homeFirstPeriodScore,
            awayFirstPeriodScore,
            homeSecondPeriodScore,
            awaySecondPeriodScore,
            isPaused,
            isBreakTime,
            homeTeamName: homeTeamName.value,
            awayTeamName: awayTeamName.value,
            timerDisplay: timerDisplay.textContent,
            periodDisplay: periodDisplay.textContent,
            lastUpdate: Date.now(),
            // 添加分數顯示的當前狀態
            homeScoreDisplayText: homeScoreDisplay.textContent,
            awayScoreDisplayText: awayScoreDisplay.textContent
        };
        localStorage.setItem('gameData', JSON.stringify(sharedData));
    }

    // 修改數據監聽函數
    function startDataSync() {
        const syncInterval = setInterval(() => {
            try {
                const gameData = JSON.parse(localStorage.getItem('gameData') || '{}');
                if (Object.keys(gameData).length > 0) {
                    // 更新時間和進度條
                    if (gameData.timeRemaining !== undefined) {
                        timeRemaining = gameData.timeRemaining;
                        updateTimerDisplay();
                        updateProgressBar();
                    }
                    
                    // 更新所有狀態
                    if (gameData.currentPeriod !== undefined) {
                        currentPeriod = gameData.currentPeriod;
                        isBreakTime = gameData.isBreakTime;
                        isPaused = gameData.isPaused;
                        
                        // 更新顯示
                        timerDisplay.textContent = gameData.timerDisplay;
                        periodDisplay.textContent = gameData.periodDisplay;
                    }
                    
                    // 更新分數
                    if (gameData.homeScore !== undefined) {
                        homeScore = gameData.homeScore;
                        homeScoreDisplay.textContent = gameData.homeScoreDisplayText || gameData.homeScore;
                    }
                    if (gameData.awayScore !== undefined) {
                        awayScore = gameData.awayScore;
                        awayScoreDisplay.textContent = gameData.awayScoreDisplayText || gameData.awayScore;
                    }

                    // 更新階段分數
                    if (gameData.homeFirstPeriodScore !== undefined) {
                        homeFirstPeriodScore = gameData.homeFirstPeriodScore;
                        if (homeFirstPeriodScoreDisplay.style.display !== 'none') {
                            homeFirstPeriodScoreDisplay.querySelector('span').textContent = homeFirstPeriodScore;
                        }
                    }
                    if (gameData.awayFirstPeriodScore !== undefined) {
                        awayFirstPeriodScore = gameData.awayFirstPeriodScore;
                        if (awayFirstPeriodScoreDisplay.style.display !== 'none') {
                            awayFirstPeriodScoreDisplay.querySelector('span').textContent = awayFirstPeriodScore;
                        }
                    }
                }
            } catch (error) {
                console.error('同步數據時出錯:', error);
            }
        }, 100);
    }

    // 更新階段分數顯示的輔助函數
    function updatePeriodScores(data) {
        if (data.homeFirstPeriodScore > 0 || data.awayFirstPeriodScore > 0) {
            homeFirstPeriodScoreDisplay.style.display = 'block';
            awayFirstPeriodScoreDisplay.style.display = 'block';
            const homeFirstPeriodText = homeFirstPeriodScoreDisplay.firstChild;
            const awayFirstPeriodText = awayFirstPeriodScoreDisplay.firstChild;
            homeFirstPeriodText.textContent = '第一節得分: ';
            awayFirstPeriodText.textContent = '第一節得分: ';
            homeFirstPeriodScoreDisplay.querySelector('span').textContent = data.homeFirstPeriodScore;
            awayFirstPeriodScoreDisplay.querySelector('span').textContent = data.awayFirstPeriodScore;
        }

        if (data.homeSecondPeriodScore > 0 || data.awaySecondPeriodScore > 0) {
            homeSecondPeriodScoreDisplay.style.display = 'block';
            awaySecondPeriodScoreDisplay.style.display = 'block';
            const homeSecondPeriodText = homeSecondPeriodScoreDisplay.firstChild;
            const awaySecondPeriodText = awaySecondPeriodScoreDisplay.firstChild;
            homeSecondPeriodText.textContent = '第二節得分: ';
            awaySecondPeriodText.textContent = '第二節得分: ';
            homeSecondPeriodScoreDisplay.querySelector('span').textContent = data.homeSecondPeriodScore;
            awaySecondPeriodScoreDisplay.querySelector('span').textContent = data.awaySecondPeriodScore;
        }
    }

    // 添加隊名更改事件
    homeTeamName.addEventListener('change', updateSharedData);
    awayTeamName.addEventListener('change', updateSharedData);

    // 自動開始計時
    updateTimerDisplay();
    updateProgressBar();

    // 更新分數的函數
    function updateScore(score) {
        // 將分數保存到 localStorage
        localStorage.setItem('currentScore', score);
        
        // 更新當前頁面的分數顯示
        document.getElementById('score').textContent = score;
    }

    // 監聽 storage 變化
    window.addEventListener('storage', (e) => {
        if (e.key === 'currentScore') {
            // 當其他頁面更新分數時，更新當前頁面的顯示
            document.getElementById('score').textContent = e.newValue;
        }
    });

    // 在頁面加載時讀取已保存的分數
    document.addEventListener('DOMContentLoaded', () => {
        const savedScore = localStorage.getItem('currentScore');
        if (savedScore) {
            document.getElementById('score').textContent = savedScore;
        }
    });
}); 