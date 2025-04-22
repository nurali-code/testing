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
                    slideUp(otherBtn.nextElementSibling, 300);
                }
            });
            this.classList.toggle('active');
            const subnav = this.nextElementSibling;
            slideToggle(subnav, 300);
        }
    });
});

// Профиль
document.querySelectorAll('.profile__btn, .profile__close').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelector('.profile-content').classList.toggle('active');
    });
})

// Закрытие профиля при клике вне его
document.addEventListener('click', function (e) {
    const profile = document.querySelector('.profile');
    const profileBtn = document.querySelector('.profile__btn');
    const profileContent = document.querySelector('.profile-content');

    if (!profile.contains(e.target) && !profileBtn.contains(e.target)) {
        profileContent.classList.remove('active');
    }
});

function _clear(el, props) {
    props.forEach(p => el.style.removeProperty(p));
}

function slideUp(el, d = 400) {
    el.style.height = el.offsetHeight + 'px';
    el.style.transition = `height ${d}ms, margin ${d}ms, padding ${d}ms`;
    el.style.overflow = 'hidden';
    el.offsetHeight;
    ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']
        .forEach(p => (el.style[p] = 0));
    setTimeout(() => {
        el.style.display = 'none';
        _clear(el, ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'overflow', 'transition']);
    }, d);
}

function slideDown(el, d = 400) {
    el.style.display = '';
    let display = getComputedStyle(el).display;
    if (display === 'none') display = 'block';
    el.style.display = display;
    const h = el.offsetHeight;
    el.style.overflow = 'hidden';
    ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']
        .forEach(p => (el.style[p] = 0));
    el.offsetHeight;
    el.style.transition = `height ${d}ms, margin ${d}ms, padding ${d}ms`;
    el.style.height = h + 'px';
    setTimeout(() => {
        _clear(el, ['height', 'overflow', 'transition']);
    }, d);
}

function slideToggle(el, d = 400) {
    getComputedStyle(el).display === 'none'
        ? slideDown(el, d)
        : slideUp(el, d);
}



// FAQ аккордеон
document.querySelectorAll('.faq__heading').forEach(heading => {
    heading.addEventListener('click', function () {
        // Скрываем все кроме текущего
        document.querySelectorAll('.faq__heading').forEach(otherHeading => {
            if (otherHeading !== this) {
                otherHeading.classList.remove('active');
                slideUp(otherHeading.nextElementSibling, 300);
            }
        });

        this.classList.toggle('active');
        const content = this.nextElementSibling;
        slideToggle(content, 300);
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

const toggleElements = document.querySelectorAll('[data-toggle="show"]');
toggleElements.forEach(function(element) {
    element.addEventListener('click', function(e) {
        e.preventDefault();
        
        const parentRow = this.closest('.profile-row');
        
        const targetId = this.getAttribute('data-toggle');
        console.log(targetId);
        const targetElement = document.querySelector(`[data-target="${targetId}"]`);
        
        if (parentRow && targetElement) {
            // Скрываем родительский элемент
            slideUp(parentRow, 300);
            
            // После завершения анимации скрытия показываем целевой элемент
            slideDown(targetElement, 300);
        }
    });
});


