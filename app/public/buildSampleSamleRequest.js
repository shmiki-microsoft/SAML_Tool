document.addEventListener('DOMContentLoaded', function() {    
    const includeIssuer = document.getElementById('includeIssuer');
    const includeNameIDPolicy = document.getElementById('includeNameIDPolicy');
    const includeAuthnContext = document.getElementById('includeAuthnContext');
    const includeForceAuthn = document.getElementById('includeForceAuthn');
    const includeIsPassive = document.getElementById('includeIsPassive');

    function updateSamlRequest() {
        const issuer = includeIssuer.checked ? 'on' : 'off';
        const nameIDPolicy = includeNameIDPolicy.checked ? 'on' : 'off';
        const authnContext = includeAuthnContext.checked ? 'on' : 'off';
        const forceAuthn = includeForceAuthn.checked ? 'on' : 'off';
        const isPassive = includeIsPassive.checked ? 'on' : 'off';

        window.location.href = `/generateAdvancedSamlRequest?issuer=${issuer}&nameIDPolicy=${nameIDPolicy}&authnContext=${authnContext}&forceAuthn=${forceAuthn}&isPassive=${isPassive}`;
    }

    includeIssuer.addEventListener('change', updateSamlRequest);
    includeNameIDPolicy.addEventListener('change', updateSamlRequest);
    includeAuthnContext.addEventListener('change', updateSamlRequest);
    includeForceAuthn.addEventListener('change', updateSamlRequest);
    includeIsPassive.addEventListener('change', updateSamlRequest);
});