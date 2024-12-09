let suffixIconShow = document.getElementById('suffix-icon-show');
let sufficIconHide = document.getElementById('suffix-icon-hide');
let passwordInput = document.getElementById('password-input');

function showPassword() {
    passwordInput.type = 'text';
    suffixIconShow.style.display = 'none';
    sufficIconHide.style.display = 'block';
}

function dontShowPassword() {
    passwordInput.type = 'password';
    suffixIconShow.style.display = 'block';
    sufficIconHide.style.display = 'none';
}

suffixIconShow.addEventListener('click', showPassword);
sufficIconHide.addEventListener('click', dontShowPassword);

  