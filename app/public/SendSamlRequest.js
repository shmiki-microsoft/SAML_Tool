document.addEventListener('DOMContentLoaded', function() {
    const sendRequestButton = document.getElementById('sendRequestButton');
    const isOpeningNewTab = document.getElementById('openInNewTab').checked;
    if (sendRequestButton) {
        sendRequestButton.addEventListener('click', function(event) {
            event.preventDefault();
            const samlRequestUrl = sendRequestButton.getAttribute('data-login-url');
            if (samlRequestUrl) {
                if (isOpeningNewTab) {
                    window.open(samlRequestUrl, '_blank');
                }else{
                    window.location.href = samlRequestUrl;
                }
            }
        });
    }
});

document.getElementById('samlRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const isOpeningNewTab = document.getElementById('openInNewTab').checked;
    try {
        const response = await fetch('/generateSamlRequest/api/sendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.loginUrl) {
            if (isOpeningNewTab) {
                window.open(result.loginUrl)
            } else {
                window.location.href = result.loginUrl;
            }
        } else {
            console.error('loginUrl is null');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});