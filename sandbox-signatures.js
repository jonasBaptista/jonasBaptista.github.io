// -----------------------------------------------------------------------------

const url =
    'https://mos-api-sandbox.spotmetrics.com/mos/v1/data-agreement/hash/';

// -----------------------------------------------------------------------------

const param = new URLSearchParams(window.location.search);
const hash = param.get('confirmationHash');

// -----------------------------------------------------------------------------

function sendSignatures(e) {
    e.preventDefault();

    var signatures = document.querySelectorAll(
        '#mos-signatures input[type="checkbox"]'
    );

    const body = {};
    for (var element of signatures) {
        body[element.name] = { valid: element.checked };
    }

    fetch(url + hash, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
        },
        method: 'POST',
        body: JSON.stringify(body),
    })
        .then(function (response) {
            if (response.ok) {
                document.getElementById('mos-signatures').innerHTML =
                    '<p class="successful-message">Assinaturas enviadas com sucesso!</p>';
            }
        })
        .catch(function (error) {
            console.warn('Assinaturas não foram enviadas.', error);
        });
}

document.addEventListener('submit', sendSignatures);

// -----------------------------------------------------------------------------

function invalidField(id) {
    if (document.getElementById(id)) {
        document.getElementById(id).className = 'error';
    }
}

// -----------------------------------------------------------------------------

let signatureJson = {};

hash &&
    fetch(url + 'signatures?hash=' + hash)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const main = document.getElementById('mos-signatures');
            const form = document.createElement('form');
            main.appendChild(form);

            if (data?.signatureTypes) {
                Object.keys(data?.signatureTypes).forEach((key) => {
                    const current = data?.signatureTypes[key];
                    if (current?.active) {
                        // div
                        const div = document.createElement('div');
                        div.setAttribute('id', 'mos_div_' + current.name);
                        div.setAttribute('class', 'mos-checkbox');
                        form.appendChild(div);

                        // input
                        const input = document.createElement('input');
                        input.setAttribute('type', 'checkbox');
                        input.setAttribute('name', current.name);
                        input.setAttribute('id', 'mos_' + current.name);
                        if (data?.customer?.signatures[key]?.valid) {
                            input.setAttribute('checked', true);
                        }
                        if (current.required === true) {
                            input.setAttribute(
                                'oninvalid',
                                `this.setCustomValidity('Esta assinatura é obrigatória'); invalidField('mos_${current.name}')`
                            );
                            input.setAttribute(
                                'oninput',
                                "setCustomValidity(''); this.classList.remove('error')"
                            );
                            input.required = true;
                        } else {
                            input.required = false;
                        }
                        div.appendChild(input);

                        // label
                        const label = document.createElement('label');
                        label.innerHTML = current.label;
                        label.setAttribute('for', 'mos_' + current.name);
                        div.append(label);
                    }
                });
                const button = document.createElement('button');
                button.setAttribute('type', 'submit');
                button.setAttribute('class', 'mos-button');
                button.innerHTML = 'Enviar';
                form.appendChild(button);
            }
        })
        .catch(() => {
            document.getElementById('mos-signatures').innerHTML =
                '<p class="successful-message">Link expirado.</p>';
        });
