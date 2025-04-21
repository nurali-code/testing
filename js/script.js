// Меню бургер
document.querySelector('.btn__menu').addEventListener('click', function () {
    this.classList.toggle('active');
    document.querySelector('.header .nav').classList.toggle('active');
});

// Подменю
document.querySelectorAll('.subnav__btn').forEach(btn => {
    btn.addEventListener('click', function () {
        if (window.innerWidth < 1200) {
            document.querySelectorAll('.subnav__btn').forEach(otherBtn => {
                if (otherBtn !== this) {
                    otherBtn.classList.remove('active');
                    otherBtn.nextElementSibling.style.display = 'none';
                }
            });
            this.classList.toggle('active');
            const subnav = this.nextElementSibling;
            subnav.style.display = subnav.style.display === 'none' ? 'block' : 'none';
        }
    });
});

// Профиль
document.querySelector('.profile__btn').addEventListener('click', function () {
    document.querySelector('.profile-content').classList.toggle('active');
});

// Закрытие профиля при клике вне его
document.addEventListener('click', function (e) {
    const profile = document.querySelector('.profile');
    const profileBtn = document.querySelector('.profile__btn');
    const profileContent = document.querySelector('.profile-content');

    if (!profile.contains(e.target) && !profileBtn.contains(e.target)) {
        profileContent.classList.remove('active');
    }
});

// FAQ аккордеон
document.querySelectorAll('.faq__heading').forEach(heading => {
    heading.addEventListener('click', function () {
        document.querySelectorAll('.faq__heading').forEach(otherHeading => {
            if (otherHeading !== this) {
                otherHeading.classList.remove('active');
                otherHeading.nextElementSibling.style.display = 'none';
            }
        });

        this.classList.toggle('active');
        const content = this.nextElementSibling;
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
});
const body = document.body;
const mBtns = body.querySelectorAll('a[href^="#"]');
const mModals = body.querySelectorAll('.modal');
const mClose = body.querySelectorAll('[data-modal-close]');

// Функция для управления полосой прокрутки
function cFS(inst) {
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.marginRight = inst === 0 ? '0' : scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
}

// Обработчик для всех ссылок с href, начинающимся с #
mBtns.forEach(el => {
    el.onclick = (e) => {
        const modalId = el.getAttribute('href');
        if (modalId.startsWith('#') && modalId.length > 1) {
            const targetModal = document.querySelector(modalId);
            if (targetModal && targetModal.classList.contains('modal')) {
                e.preventDefault();
                cFS();
                targetModal.classList.add('active');
                body.classList.add('active');
            }
        }
    }
});

// Обработчик для закрытия модальных окон
mClose.forEach(el => {
    el.addEventListener('click', () => {
        const modal = el.closest('.modal');
        modal.classList.remove('active');
        body.classList.remove('active');
        cFS(0);
    });
});

// Закрытие модального окна при клике вне его содержимого
mModals.forEach(el => {
    el.addEventListener('click', (event) => {
        if (!event.target.closest('.modal-content')) {
            el.classList.remove('active');
            body.classList.remove('active');
            cFS(0);
        }
    });
});