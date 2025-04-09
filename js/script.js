$(document).ready(function () {
    const audio = $('.audio-element')[0]; // Получаем сам DOM-элемент audio
    const playPauseBtn = $('.play-pause-btn');
    const playIcon = 'fa-play';
    const pauseIcon = 'fa-pause';
    const progressBar = $('.progress-bar'); // input type range, max=100 по умолчанию в HTML
    const currentTimeEl = $('.current-time');
    const durationEl = $('.duration');
    const volumeBtn = $('.volume-btn');
    const volumeSlider = $('.volume-slider');
    const volumeUpIcon = 'fa-volume-up';
    const volumeMuteIcon = 'fa-volume-mute';
    const optionsBtn = $('.options-btn');
    const optionsMenu = $('.options-menu');
    const playbackSpeedSelect = $('.playback-speed');

    let isSeeking = false; // Флаг, указывающий на активную перемотку пользователем

    // --- Функции ---

    // Форматирование времени (секунды -> мм:сс)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Обновление времени и прогресс-бара
    function updateProgress() {
        // Обновляем положение ползунка только если пользователь не перематывает активно
        if (!isSeeking && audio.duration) {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.val(percentage);
        }
        // Всегда обновляем текстовое отображение времени
        currentTimeEl.text(formatTime(audio.currentTime));
    }

    // Обновление иконки Play/Pause
    function updatePlayPauseIcon() {
        if (audio.paused) {
            playPauseBtn.find('i').removeClass(pauseIcon).addClass(playIcon);
        } else {
            playPauseBtn.find('i').removeClass(playIcon).addClass(pauseIcon);
        }
    }

    // Обновление иконки громкости
    function updateVolumeIcon() {
        const icon = volumeBtn.find('i');
        if (audio.muted || audio.volume === 0) {
            icon.removeClass(volumeUpIcon).addClass(volumeMuteIcon);
        } else {
            icon.removeClass(volumeMuteIcon).addClass(volumeUpIcon);
        }
    }

    // --- Обработчики событий ---

    // Клик по Play/Pause
    playPauseBtn.on('click', function () {
        if (!audio.src) return; // Не делаем ничего, если нет аудиофайла
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        updatePlayPauseIcon();
    });

    // Загрузка метаданных аудио (для получения длительности)
    $(audio).on('loadedmetadata', function () {
        durationEl.text(formatTime(audio.duration));
        progressBar.val(0); // Сбросить прогресс-бар в начало
    });

    // Проверка готовности к воспроизведению (важно для точной duration)
    $(audio).on('canplay', function () {
        durationEl.text(formatTime(audio.duration));
    });

    // Обновление времени при воспроизведении
    $(audio).on('timeupdate', updateProgress);

    // Конец воспроизведения
    $(audio).on('ended', function () {
        audio.currentTime = 0;
        updatePlayPauseIcon();
        updateProgress(); // Сбросить время и прогресс
    });

    // --- Перемотка (Progress Bar) ---

    // Когда пользователь начинает двигать ползунок
    progressBar.on('mousedown touchstart', function () {
        if (!audio.duration) return; // Нельзя мотать, если длительность неизвестна
        isSeeking = true;
    });

    // Когда пользователь двигает ползунок (событие input срабатывает постоянно при движении)
    progressBar.on('input', function () {
        if (!isSeeking || !audio.duration) return;
        // Показываем время, соответствующее положению ползунка, но НЕ меняем audio.currentTime
        const seekTime = (audio.duration / 100) * $(this).val();
        currentTimeEl.text(formatTime(seekTime));
    });

    // Когда пользователь отпустил ползунок (событие change)
    progressBar.on('change', function () {
        if (!audio.duration) return;
        const seekTime = (audio.duration / 100) * $(this).val();
        audio.currentTime = seekTime;
        isSeeking = false; // Завершили перемотку
        // Обновляем прогресс сразу, чтобы ползунок не "прыгнул" назад
        updateProgress();
    });

    // Также обрабатываем mouseup/touchend на случай, если change не сработает корректно во всех браузерах
    progressBar.on('mouseup touchend', function () {
        if (isSeeking) {
            // Можно вызвать change программно или дублировать логику
            $(this).trigger('change');
        }
    });


    // --- Громкость ---
    volumeSlider.on('input', function () {
        audio.volume = $(this).val();
        audio.muted = audio.volume === 0; // Mute если громкость 0
        updateVolumeIcon();
    });

    volumeBtn.on('click', function () {
        audio.muted = !audio.muted;
        if (!audio.muted && audio.volume === 0) {
            // Если размьютили и громкость была 0, ставим немного
            audio.volume = 0.1; // Или запомненное значение
        }
        // Обновляем слайдер в соответствии с состоянием mute и реальной громкостью
        volumeSlider.val(audio.muted ? 0 : audio.volume);
        updateVolumeIcon();
    });

    // --- Меню опций ---
    optionsBtn.on('click', function (e) {
        e.stopPropagation(); // Предотвращаем закрытие при клике на кнопку
        optionsMenu.toggle();
    });

    // Закрытие меню при клике вне его
    $(document).on('click', function (e) {
        // Проверяем, что клик был не по кнопке и не внутри меню
        if (!optionsBtn.is(e.target) && optionsBtn.has(e.target).length === 0 &&
            !optionsMenu.is(e.target) && optionsMenu.has(e.target).length === 0) {
            optionsMenu.hide();
        }
    });

    // Изменение скорости воспроизведения
    playbackSpeedSelect.on('change', function () {
        audio.playbackRate = $(this).val();
    });

    // --- Начальная инициализация ---
    updateVolumeIcon(); // Установить иконку громкости при загрузке
    volumeSlider.val(audio.volume); // Установить ползунок громкости
    progressBar.val(0); // Убедиться, что прогресс-бар в начале
    currentTimeEl.text('0:00'); // Начальное время
    durationEl.text('0:00'); // Начальная длительность
});