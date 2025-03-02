const wrapper = document.querySelector('.wrapper');
const loginForm = document.querySelector('.form-box.login');
const registerForm = document.querySelector('.form-box.register');
const loginButton = document.querySelector('.form-switch-text:first-child');
const registerButton = document.querySelector('.form-switch-text:last-child');

function showRegister() {
  wrapper.classList.add('active');
  setWrapperMinHeight();

  registerButton.classList.add('active');
  loginButton.classList.remove('active');

  resetErrors();
}

function showLogin() {
  wrapper.classList.remove('active');
  setWrapperMinHeight();

  loginButton.classList.add('active');
  registerButton.classList.remove('active');

  resetErrors();
}

function resetErrors() {
  $('.error-message').removeClass('active').text('');
}

function displayErrors(formId, errors) {
    $(`#${formId} .error-message`).removeClass('active').text('');
    for (const key in errors) {
        $(`#${formId}-${key}-error`).text(errors[key]).addClass('active');
    }
    console.log("Errors:", errors);
}
function setWrapperMinHeight() {
    const activeForm = wrapper.classList.contains('active') ? registerForm : loginForm;
    const formHeight = activeForm.offsetHeight;
    const headerHeight = 80;
    const newHeight = formHeight + headerHeight;
    wrapper.style.minHeight = `${newHeight}px`;
  }

$(document).ready(function() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                localStorage.setItem("loggedIn", "true");
                window.location.href = '/';
            },
            error: function(xhr, status, error) {
                console.error("AJAX error:", error);
                const errors = xhr.responseJSON && xhr.responseJSON.errors;
                if (xhr.status === 401 && errors) {
                    displayErrors('login', errors);
                } else {
                    displayErrors('login', { 'general': 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.' });
                }
            }
        });
    });
    $('#registerForm').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    window.location.href = '/login';
                } else {
                    displayErrors('register', response.errors);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX error:", error);
                const errors = xhr.responseJSON && xhr.responseJSON.errors;
                if (errors) {
                    // Sửa ở đây: Gọi hàm displayErrors để hiển thị lỗi
                    displayErrors('register', errors);
                } else {
                    displayErrors('register', { 'general': 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.' });
                }
            }
        });
    });

  setWrapperMinHeight();
});