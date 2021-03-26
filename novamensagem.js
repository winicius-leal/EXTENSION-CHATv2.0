chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        chrome.storage.local.set({
            "formChat": details.requestBody.formData
        });
    }, {
        urls: ["https://chat.movidesk.com/ChatWidget/CreateChatSession"]
    },
    ['requestBody']
);

chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === -1) {
        chrome.storage.local.set({
            "minimizado": false
        });

    } else {
        chrome.storage.local.set({
            "minimizado": true
        }, function(){obtenhaUltimoIdConversa(true);});    
    }
});

var novaMensagem = false;

function obtenhaUltimoIdConversa(minimizado) {
    var url = 'https://chat.movidesk.com/ChatWidget/ChatDiscussion?chatWidgetId='

    chrome.storage.local.get(["formChat", "notifique", "conversaFinalizada"], function(valor) {

        if (valor.formChat && !valor.notifique && !valor.conversaFinalizada) {
            var formChat = valor.formChat;

            url += formChat.id[0];
            url += '&personId=' + formChat.personId[0];
            url += '&chatId=' + formChat.chatId[0];
            url += '&__RequestVerificationToken=';

            consulteUrl(url, minimizado);
        }
    });
};

function consulteUrl(url, minimizado) {
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
            var objJson = JSON.parse(Http.responseText);

            if (minimizado) {
                chrome.storage.local.set({
                    'ultimoMinimizado': objJson.pop()
                });
            } else {
                chrome.storage.local.set({
                    'ultimo': objJson.pop()
                });
            }

            verifiqueSeHaNovaMensagem();
        }
    }
};

function verifiqueSeHaNovaMensagem() {
    chrome.storage.local.get(['ultimoMinimizado', 'ultimo'], function(valor) {
        if (valor.ultimoMinimizado && valor.ultimo) {
            var notifique = valor.ultimoMinimizado.id != valor.ultimo.id;

            chrome.storage.local.set({
                'notifique': notifique
            });
        }

        if (valor.ultimo && valor.ultimo.messageType === 7) {
            chrome.storage.local.set({
                'conversaFinalizada': true
            });
        }
    });
};

function executeConsulta() {
    setTimeout(function() {
        obtenhaUltimoIdConversa(false);
        executeConsulta();
    }, 300);
};

executeConsulta();


function executeSound() {

        chrome.storage.local.get('notifique', function(valor) {

            novaMensagem = !novaMensagem;

            if (novaMensagem && valor.notifique) {

            chrome.tts.speak('nova mensagem');

           };


        });

};

executeSound();

function executeIcone() {
    setTimeout(function() {

        chrome.storage.local.get('notifique', function(valor) {

            novaMensagem = !novaMensagem;
            if (novaMensagem && valor.notifique) {


                chrome.browserAction.setIcon({
                    path: "iconMensagem.png"
                });



            } else {

                chrome.browserAction.setIcon({
                    path: "icon.png"
                });


            }
            executeIcone();

        });
    }, 200);
};

executeIcone();

