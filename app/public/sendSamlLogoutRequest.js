document.addEventListener('DOMContentLoaded', function() {
    const sendRequestButton = document.getElementById('sendLogoutRequestButton');
    if (sendRequestButton) {
        sendRequestButton.addEventListener('click', function(event) {
            event.preventDefault();
            const samlLogoutRequestUrl = sendRequestButton.getAttribute('data-logout-url');
            if (samlLogoutRequestUrl) {
                window.location.href = samlLogoutRequestUrl;
            }
        });
    }
});