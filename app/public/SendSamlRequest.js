document.addEventListener('DOMContentLoaded', function() {
    const sendRequestButton = document.getElementById('sendRequestButton');
    if (sendRequestButton) {
        sendRequestButton.addEventListener('click', function(event) {
            event.preventDefault();
            const samlRequestUrl = sendRequestButton.getAttribute('data-login-url');
            if (samlRequestUrl) {
                window.open(samlRequestUrl, '_blank');
            }
        });
    }
});