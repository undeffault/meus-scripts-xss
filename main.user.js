(function () {
    'use strict';

    navigation.addEventListener("navigate", e => {

        if (e.destination.url === 'https://futzin.online/pages/arena.html') {
            const dependencies = [
                "https://unpkg.com/hotkeys-js/dist/hotkeys.min.js",
                "https://unpkg.com/guify@0.14.3/lib/guify.min.js"
            ]

            let depCount = 0
            const loadDependencies = (forced = 0) => {

                GM_xmlhttpRequest({
                    method: "GET",
                    url: dependencies[forced],
                    onload: (res) => {

                        const script = document.createElement('script')
                        script.innerHTML = res.responseText
                        document.body.appendChild(script)

                        depCount++
                        if (depCount === dependencies.length) {
                            init()
                        } else {
                            loadDependencies(depCount)
                        }
                    }
                })
            }

            const encode = (/**@type {string}*/ text) => {
                const codePoints = [...text].map((c) => c.codePointAt(0));

                const output = [];
                for (const char of codePoints) {
                    output.push(
                        String.fromCodePoint(
                            char + (0x00 < char && char < 0x7f ? 0xe0000 : 0)
                        ).toString()
                    );
                }

                return output.join("");
            };

            const decode = (/**@type {string}*/ text) => {
                const codePoints = [...text].map((c) => c.codePointAt(0));

                const output = [];
                for (const char of codePoints) {
                    output.push(
                        String.fromCodePoint(
                            char - (0xe0000 < char && char < 0xe007f ? 0xe0000 : 0)
                        ).toString()
                    );
                }

                return output.join("");
            };

            const detect = (/**@type {string}*/ text) => {
                const codePoints = [...text].map((c) => c.codePointAt(0));
                return codePoints.some((c) => 0xe0000 < c && c < 0xe007f);
            };

            function init() {


                var affectedPlayers = []
                var state = {
                    target: 'Me',
                    command: 'rainbowify',
                    arg: ''
                }

                var gui = new guify({
                    title: 'fz!Hook',
                    align: 'right',
                });

                gui.Register(
                    {
                        type: 'select', label: 'Select Command',
                        options: ['say', 'rainbowify', 'redirect', 'play_sound', 'skin', 'alert'],
                        object: state,
                        property: 'command'
                    }
                );

                var targetSelect = gui.Register(
                    {
                        type: 'select', label: 'Select Target',
                        options: ['All', 'Others', 'Me'],
                        initial: 'Me',
                        object: state,
                        property: 'target'

                    }
                );

                //optional
                gui.Register(
                    {
                        type: 'text', label: 'Argument',
                        object: state,
                        property: 'arg'
                    }
                );

                gui.Register(
                    {
                        type: 'button', label: 'Send Command',
                        action: function () {

                            socket.emit('chat', {
                                type: 'fz!Hook',
                                body: {
                                    text: 'fz!Hook',
                                    content: encode(JSON.stringify({ message: 'command', state, sender: { id: socket.id } }))
                                }
                            })

                        }
                    }
                );



                const waitForSocket = () => {
                    if (typeof socket !== 'undefined') {

                        socket.on('chat', (_msg) => {

                            if (_msg && _msg.content.type === 'fz!Hook') {
        
                                if (!detect(_msg.content.body.content)) return
        
                                const msg = decode(_msg.content.body.content)
                                const message = JSON.parse(msg)
        
                                if (message.message === 'hooked') {
        
                                    targetSelect.input.add(new Option(message.sender.nickname, message.sender.id))
                                } else if (message.message === 'unhooked') {
                                    for (let i = 0; i < targetSelect.input.options.length; i++) {
                                        if (targetSelect.input.options[i].value === valueToRemove) {
                                            targetSelect.input.remove(i);
                                            break;  // Exit loop once the option is removed
                                        }
                                    }
                                }
                            }
                        })

                        socket.emit('chat', {
                            type: 'fz!Hook',
                            body: {
                                text: 'fz!Hook',
                                content: encode(JSON.stringify({ message: 'ask', sender: { id: socket.id } }))
                            }
                        });
                        
                    } else {
                        setTimeout(waitForSocket, 100); // Check again after 100ms
                    }
                };

                waitForSocket();

            }

            loadDependencies()
        }

    })
})()
