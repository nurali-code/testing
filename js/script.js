$('.btn__menu').click(function () {
    $('.btn__menu, .header .nav').toggleClass('active')
})

$('.subnav__btn').click(function () {
    if (window.innerWidth < 1200) {
        $('.subnav__btn').removeClass('active').next().slideUp()
        $(this).toggleClass('active').next().slideToggle()
    }
})

$('.profile__btn').click(function () {
    $('.profile-content').toggleClass('active')
})

$(document).click(function (e) {
    if (!$(e.target).closest('.profile, .profile__btn').length) {
        $('.profile-content').removeClass('active')
    }
})

$('.faq__heading').on('click', function () {
    $('.faq__heading').not($(this)).removeClass('active').next().slideUp(250);
    $(this).addClass('active').next().slideDown(250);
});
