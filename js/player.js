document.addEventListener('DOMContentLoaded', () => {

    const playerContainers = document.querySelectorAll('.audio-player');

    // --- Константы SVG ---
    const SPRITE_PATH = 'img/sprite.svg';
    const ICON_PLAY = `${SPRITE_PATH}#play`;
    const ICON_PAUSE = `${SPRITE_PATH}#pause`;
    const ICON_VOLUME = `${SPRITE_PATH}#volume`;
    const ICON_VOLUME_OFF = `${SPRITE_PATH}#volume-off`; // Убедитесь, что есть в спрайте
    const ICON_SELECTED = `${SPRITE_PATH}#selected`; // Для галочки скорости
    // Замечание: ID для стрелок влево/вправо используются прямо в HTML

    function initializePlayer(playerElement) {
        const audio = playerElement.querySelector('.audio-element');
        const playPauseBtn = playerElement.querySelector('.play-pause-btn');
        const progressBar = playerElement.querySelector('.progress-bar');
        const currentTimeEl = playerElement.querySelector('.current-time');
        const durationEl = playerElement.querySelector('.duration');
        const volumeContainer = playerElement.querySelector('.volume-container'); // Родительский контейнер
        const volumeBtn = playerElement.querySelector('.volume-btn');
        const volumeSlider = playerElement.querySelector('.volume-slider');
        const optionsBtn = playerElement.querySelector('.options-btn');
        const optionsMenu = playerElement.querySelector('.options-menu');
        const speedMenuItem = playerElement.querySelector('.speed-menu-item');
        const speedSubmenu = playerElement.querySelector('.speed-submenu');
        const speedList = playerElement.querySelector('.speed-list');
        const backBtn = playerElement.querySelector('.back-btn');
        const downloadLink = playerElement.querySelector('.download-link');

        let isSeeking = false;
        let fadeOutInterval = null; // Для анимации затухания

        function formatTime(seconds) {
            seconds = isNaN(seconds) ? 0 : seconds;
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function updateProgress() {
            let percentage = 0;
            if (audio.duration) {
                percentage = (audio.currentTime / audio.duration) * 100;
            }
            progressBar.style.setProperty('--progress-percentage', `${percentage}%`);
            if (!isSeeking) {
                progressBar.value = percentage;
            }
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }

        function updatePlayPauseIcon() {
            const useElement = playPauseBtn.querySelector('use');
            if (!useElement) return;
            useElement.setAttribute('href', audio.paused ? ICON_PLAY : ICON_PAUSE);
            playPauseBtn.setAttribute('aria-label', audio.paused ? 'Воспроизвести' : 'Пауза');
        }

        function updateVolumeIcon() {
            const useElement = volumeBtn.querySelector('use');
            if (!useElement) return;
            const isMuted = audio.muted || audio.volume === 0;
            useElement.setAttribute('href', isMuted ? ICON_VOLUME_OFF : ICON_VOLUME);
            volumeBtn.setAttribute('aria-label', isMuted ? 'Включить звук' : 'Выключить звук');
        }

        // Обновлено для SVG иконки галочки
        function updateSpeedSelection(newSpeed) {
            const speedItems = speedList.querySelectorAll('li');
            speedItems.forEach(item => {
                const itemSpeed = parseFloat(item.dataset.speed);
                const isSelected = itemSpeed === newSpeed;
                item.setAttribute('aria-checked', isSelected);
                const checkMark = item.querySelector('svg use'); // Находим use внутри SVG
                 // Показываем/скрываем сам SVG или его родителя в зависимости от дизайна
                 if (checkMark && checkMark.closest('svg')) {
                     checkMark.closest('svg').style.visibility = isSelected ? 'visible' : 'hidden';
                 }
            });
            speedMenuItem.setAttribute('aria-expanded', 'false');
        }

        // Плавное затухание громкости
        function fadeVolumeOut(duration = 300) {
            if (fadeOutInterval) clearInterval(fadeOutInterval); // Остановить предыдущее затухание, если есть
            if (audio.volume === 0) { // Если уже 0, просто ставим muted
                audio.muted = true;
                updateVolumeIcon();
                return;
            };

            const startVolume = audio.volume;
            // Запоминаем громкость перед затуханием
            playerElement.dataset.lastVolume = startVolume;
            const startTime = Date.now();

            fadeOutInterval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const fraction = elapsedTime / duration;

                if (fraction >= 1) {
                    audio.volume = 0;
                    audio.muted = true; // Устанавливаем muted после завершения
                    volumeSlider.value = 0; // Обновляем слайдер
                    clearInterval(fadeOutInterval);
                    fadeOutInterval = null;
                    updateVolumeIcon(); // Обновляем иконку в конце
                } else {
                    audio.volume = startVolume * (1 - fraction);
                    volumeSlider.value = audio.volume; // Обновляем слайдер во время анимации
                    updateVolumeIcon(); // Обновляем иконку во время анимации
                }
            }, 15); // ~60 fps
        }

        // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

        playPauseBtn.addEventListener('click', () => { /* ... без изменений ... */
             if (!audio.src && !audio.currentSrc) return;
             if (audio.paused) {
                 pauseOtherPlayers(playerElement);
                 audio.play();
             } else {
                 audio.pause();
             }
             updatePlayPauseIcon();
        });

        audio.addEventListener('loadedmetadata', () => { /* ... без изменений ... */
             durationEl.textContent = formatTime(audio.duration);
             progressBar.value = 0;
             progressBar.style.setProperty('--progress-percentage', `0%`);
             if (audio.currentSrc) {
                 downloadLink.href = audio.currentSrc;
                 try {
                     const url = new URL(audio.currentSrc);
                     const filename = url.pathname.split('/').pop();
                     if(filename) downloadLink.setAttribute('download', filename);
                 } catch (e) {}
             } else {
                 downloadLink.style.display = 'none';
             }
        });

        audio.addEventListener('canplay', () => { /* ... без изменений ... */
             if (audio.duration) {
                 durationEl.textContent = formatTime(audio.duration);
             }
        });
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => { /* ... без изменений ... */
             audio.currentTime = 0;
             updatePlayPauseIcon();
             updateProgress();
         });

        // --- Перемотка (без изменений) ---
        progressBar.addEventListener('mousedown', () => { if (audio.duration) isSeeking = true; });
        progressBar.addEventListener('touchstart', () => { if (audio.duration) isSeeking = true; }, { passive: true });
        progressBar.addEventListener('input', () => {
            if (!audio.duration) return;
            const currentPercentage = progressBar.value;
            progressBar.style.setProperty('--progress-percentage', `${currentPercentage}%`);
            const seekTime = (audio.duration / 100) * currentPercentage;
            currentTimeEl.textContent = formatTime(seekTime);
            if (!isSeeking && audio.duration) { isSeeking = true; }
        });
        progressBar.addEventListener('change', () => {
            if (!audio.duration) return;
            const seekTime = (audio.duration / 100) * progressBar.value;
            audio.currentTime = seekTime;
            if (isSeeking) { isSeeking = false; }
            updateProgress();
        });
        progressBar.addEventListener('mouseup', () => { if (isSeeking) progressBar.dispatchEvent(new Event('change')); });
        progressBar.addEventListener('touchend', () => { if (isSeeking) progressBar.dispatchEvent(new Event('change')); });


        // --- Громкость ---
        volumeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (fadeOutInterval) return; // Не реагировать во время затухания

            // Проверяем, активен ли уже контейнер (слайдер виден)
            if (volumeContainer.classList.contains('active')) {
                // Если слайдер виден -> запускаем затухание
                fadeVolumeOut(300); // Длительность затухания 300ms
                 // Скрываем слайдер после затухания или сразу? Давайте сразу
                // volumeContainer.classList.remove('active'); // Скрыть слайдер
            } else {
                // Если слайдер скрыт -> показываем его
                 // Перед показом скроем слайдеры у других плееров
                 hideOtherVolumeSliders(playerElement);
                volumeContainer.classList.add('active');
                // При первом клике НЕ меняем громкость и не мьютим
            }
        });

        volumeSlider.addEventListener('input', () => {
            if (fadeOutInterval) clearInterval(fadeOutInterval); // Остановить затухание, если пользователь взялся за слайдер

            const newVolume = parseFloat(volumeSlider.value);
            audio.volume = newVolume;

            // Если громкость > 0, обязательно снимаем флаг muted
            if (newVolume > 0) {
                audio.muted = false;
            } else {
                // Если громкость стала 0 через слайдер, ставим muted
                 audio.muted = true;
            }
            updateVolumeIcon(); // Обновляем иконку
        });


        // --- Меню опций (без изменений, кроме видимости через class) ---
        optionsBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeOtherOptionMenus(playerElement); // Закрыть меню других плееров
            const isVisible = optionsMenu.classList.toggle('visible');
            optionsBtn.setAttribute('aria-expanded', isVisible);
            if (isVisible) { // Если открываем основное меню, скрыть подменю
                 speedSubmenu.classList.remove('visible');
                 speedMenuItem.setAttribute('aria-expanded', 'false');
            }
        });

        speedMenuItem.addEventListener('click', (event) => {
            event.stopPropagation();
            optionsMenu.classList.remove('visible'); // Скрыть основное
            speedSubmenu.classList.add('visible');   // Показать подменю
            speedMenuItem.setAttribute('aria-expanded', 'true');
            optionsBtn.setAttribute('aria-expanded', 'true');
        });

        backBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            speedSubmenu.classList.remove('visible'); // Скрыть подменю
            optionsMenu.classList.add('visible');    // Показать основное
            speedMenuItem.setAttribute('aria-expanded', 'false');
            optionsBtn.setAttribute('aria-expanded', 'true');
        });

        speedList.addEventListener('click', (event) => { /* ... без изменений ... */
            event.stopPropagation();
            const targetLi = event.target.closest('li');
            if (targetLi && targetLi.dataset.speed) {
                const newSpeed = parseFloat(targetLi.dataset.speed);
                audio.playbackRate = newSpeed;
                updateSpeedSelection(newSpeed);
                speedSubmenu.classList.remove('visible'); // Скрыть подменю
                optionsMenu.classList.add('visible');    // Показать основное
                speedMenuItem.setAttribute('aria-expanded', 'false');
                 optionsBtn.setAttribute('aria-expanded', 'true');
            }
        });

        // --- Начальная инициализация ---
        updateVolumeIcon();
        updatePlayPauseIcon();
        updateSpeedSelection(audio.playbackRate || 1.0);
        volumeSlider.value = audio.volume;
        progressBar.value = 0;
        progressBar.style.setProperty('--progress-percentage', `0%`);
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = formatTime(audio.duration);
        optionsBtn.setAttribute('aria-expanded', 'false');
        optionsMenu.classList.remove('visible'); // Убедиться, что меню скрыты
        speedSubmenu.classList.remove('visible');


        if (audio.currentSrc) { /* ... без изменений ... */
            downloadLink.href = audio.currentSrc;
            try {
                const url = new URL(audio.currentSrc);
                const filename = url.pathname.split('/').pop();
                 if(filename) downloadLink.setAttribute('download', filename);
            } catch(e) {}
        } else if (audio.src) { /* ... без изменений ... */
            downloadLink.href = audio.src;
             try {
                 const url = new URL(audio.src);
                 const filename = url.pathname.split('/').pop();
                  if(filename) downloadLink.setAttribute('download', filename);
             } catch(e) {}
        } else {
             downloadLink.style.display = 'none';
        }
        if (!audio.src && !audio.currentSrc) { /* ... без изменений ... */
             console.warn("Аудиофайл не найден:", playerElement);
             playerElement.style.opacity = '0.5';
        }

    } // Конец initializePlayer


    // --- Глобальные функции ---

    function pauseOtherPlayers(currentPlayerElement) { /* ... без изменений, кроме иконки SVG ... */
         playerContainers.forEach(container => {
             if (container !== currentPlayerElement) {
                 const audio = container.querySelector('.audio-element');
                 const btn = container.querySelector('.play-pause-btn');
                 if (audio && !audio.paused) {
                     audio.pause();
                     const useElement = btn ? btn.querySelector('use') : null;
                     if (useElement) useElement.setAttribute('href', ICON_PLAY);
                     if (btn) btn.setAttribute('aria-label', 'Воспроизвести');
                 }
             }
         });
    }

    // Обновлено для скрытия .visible класса и слайдера громкости
    function closeOtherOptionMenus(currentPlayerElement = null) {
        playerContainers.forEach(container => {
            if (container !== currentPlayerElement) {
                const menu = container.querySelector('.options-menu');
                const submenu = container.querySelector('.speed-submenu');
                const btn = container.querySelector('.options-btn');
                const speedItem = container.querySelector('.speed-menu-item');
                const volContainer = container.querySelector('.volume-container'); // Слайдер громкости

                if (menu && menu.classList.contains('visible')) {
                    menu.classList.remove('visible');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
                if (submenu && submenu.classList.contains('visible')) {
                    submenu.classList.remove('visible');
                    if (speedItem) speedItem.setAttribute('aria-expanded', 'false');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
                 if (volContainer && volContainer.classList.contains('active')) {
                     volContainer.classList.remove('active');
                 }
            }
        });
    }

    // Функция для скрытия слайдеров громкости у других плееров
    function hideOtherVolumeSliders(currentPlayerElement) {
         playerContainers.forEach(container => {
             if (container !== currentPlayerElement) {
                 const volContainer = container.querySelector('.volume-container');
                 if (volContainer && volContainer.classList.contains('active')) {
                     volContainer.classList.remove('active');
                 }
             }
         });
    }


    // Обновлено для проверки .visible и .active
    document.addEventListener('click', (event) => {
        let clickedInsideAnyPlayerControl = false;
        playerContainers.forEach(container => {
            // Проверяем клик внутри меню, кнопок или видимого слайдера громкости
            const menu = container.querySelector('.options-menu');
            const submenu = container.querySelector('.speed-submenu');
            const btnOptions = container.querySelector('.options-btn');
            const volContainer = container.querySelector('.volume-container'); // Весь контейнер громкости
            const volBtn = container.querySelector('.volume-btn');

            if ((btnOptions && btnOptions.contains(event.target)) ||
                (menu && menu.classList.contains('visible') && menu.contains(event.target)) ||
                (submenu && submenu.classList.contains('visible') && submenu.contains(event.target)) ||
                (volContainer && volContainer.classList.contains('active') && volContainer.contains(event.target)) || // Клик внутри активного блока громкости
                (volBtn && volBtn.contains(event.target)) // Клик по самой кнопке громкости (уже обработан, но для логики)
               )
            {
                clickedInsideAnyPlayerControl = true;
            }
        });

        if (!clickedInsideAnyPlayerControl) {
            closeOtherOptionMenus(); // Закрыть все меню и слайдеры громкости
        }
    });

    // --- Запуск инициализации ---
    playerContainers.forEach(player => {
        initializePlayer(player);
    });

}); // Конец DOMContentLoaded