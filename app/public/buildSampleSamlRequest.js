document.addEventListener('DOMContentLoaded', function() {
    const includeIssuer = document.getElementById('includeIssuer');
    const includeNameIDPolicy = document.getElementById('includeNameIDPolicy');
    const includeAuthnContext = document.getElementById('includeAuthnContext');
    const includeForceAuthn = document.getElementById('includeForceAuthn');
    const includeIsPassive = document.getElementById('includeIsPassive');
    const includeScoping = document.getElementById('includeScoping');
    const includeSubject = document.getElementById('includeSubject');

    function updateSamlRequest() {
        const issuerFlag = includeIssuer.checked ? 'on' : 'off';
        const nameIDPolicyFlag = includeNameIDPolicy.checked ? 'on' : 'off';
        const authnContextFlag = includeAuthnContext.checked ? 'on' : 'off';
        const forceAuthnFlag = includeForceAuthn.checked ? 'on' : 'off';
        const isPassiveFlag = includeIsPassive.checked ? 'on' : 'off';
        const scopingFlag = includeScoping.checked ? 'on' : 'off';
        const subjectFlag = includeSubject.checked ? 'on' : 'off';

        fetch('/generateAdvancedSamlRequest/api/buildSampleSampleRequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                includeIssuer:issuerFlag,
                includeNameIDPolicy:nameIDPolicyFlag,
                includeAuthnContext:authnContextFlag,
                includeForceAuthn:forceAuthnFlag,
                includeIsPassive:isPassiveFlag,
                includeScoping: scopingFlag,
                includeSubject: subjectFlag
            }),
        })
        .then(response => response.json())
        .then(data => {
            const samlRequestXml = document.getElementById('samlRequestXml');
            samlRequestXml.value = data.samlRequest;
        })
        .catch(error => console.error(error));
    }

    includeIssuer.addEventListener('change', updateSamlRequest);
    includeNameIDPolicy.addEventListener('change', updateSamlRequest);
    includeAuthnContext.addEventListener('change', updateSamlRequest);
    includeForceAuthn.addEventListener('change', updateSamlRequest);
    includeIsPassive.addEventListener('change', updateSamlRequest);
    includeScoping.addEventListener('change', updateSamlRequest);
    includeSubject.addEventListener('change', updateSamlRequest);
});

document.getElementById('addRowButton').addEventListener('click', function() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="queryStringKeys" placeholder="Key"></td>
        <td><input type="text" name="queryStringValues" placeholder="Value"></td>
        <td><div class="removeRowButton"></div></td>
    `;
    document.querySelector('#queryStringTable tbody').appendChild(newRow);
});
document.querySelector('#queryStringTable').addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('removeRowButton')) {
        e.target.closest('tr').remove();
    }
});