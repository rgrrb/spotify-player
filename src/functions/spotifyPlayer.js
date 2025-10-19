let senafyDeviceId = null;
let spotifyPlayer = null;
let progressInterval = null; 

window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("Spotify Web Playback SDK está pronto.");
};

function initializeSpotifyPlayer(userAccessToken) {

    spotifyPlayer = new Spotify.Player({
        name: 'Senafy Player',
        getOAuthToken: cb => { cb(userAccessToken); },
        volume: 0.5
    });

    const playBtn = document.getElementById('startbtn');
    const backBtn = document.getElementById('backbtn');
    const skipBtn = document.getElementById('btnskip');
    const loopBtn = document.getElementById('loop');
    const progressBar = document.querySelector('.player .progress-bar');
    const progress = document.querySelector('.player .progress');
    const currentTimeEl = document.querySelector('.player .count span:first-child');
    const durationEl = document.querySelector('.player .count span:last-child');
    const volumeBar = document.querySelector('.player .volume-level');
    const volumeProgress = document.querySelector('.player .volume-progress');

    playBtn.addEventListener('click', () => {
        spotifyPlayer.togglePlay().catch(err => console.error(err));
    });
    backBtn.addEventListener('click', () => {
        spotifyPlayer.previousTrack().catch(err => console.error(err));
    });
    skipBtn.addEventListener('click', () => {
        spotifyPlayer.nextTrack().catch(err => console.error(err));
    });
    loopBtn.addEventListener('click', () => {
        spotifyPlayer.getCurrentState().then(state => {
            if (!state) return;
            const newMode = (state.repeat_mode + 1) % 3;
            spotifyPlayer.setRepeatMode(newMode).catch(err => console.error(err));
        });
    });
    progressBar.addEventListener('click', e => {
        const width = progressBar.clientWidth;
        const clickX = e.offsetX;
        spotifyPlayer.getCurrentState().then(state => {
            if (!state) return;
            const newPositionMs = (clickX / width) * state.duration;
            spotifyPlayer.seek(newPositionMs).catch(err => console.error(err));
        });
    });
    volumeBar.addEventListener('click', e => {
        const width = volumeBar.clientWidth;
        const clickX = e.offsetX;
        const newVolume = clickX / width;
        spotifyPlayer.setVolume(newVolume).catch(err => console.error(err));

        volumeProgress.style.width = `${newVolume * 100}%`;
    });

    function updateUI(state) {
        if (!state) return;

        currentTimeEl.textContent = formatMilliseconds(state.position);
        durationEl.textContent = `-${formatMilliseconds(state.duration - state.position)}`;

        const progressPercent = (state.position / state.duration) * 100;
        progress.style.width = `${progressPercent}%`;

        playBtn.src = state.paused ? "./src/img/starticon.svg" : "./src/img/pause.svg";
        
        if (state.repeat_mode === 0) loopBtn.style.opacity = '0.5';
        else if (state.repeat_mode === 1) loopBtn.style.opacity = '1';
        else if (state.repeat_mode === 2) loopBtn.style.opacity = '1';
    }

    spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;

        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }

        if (!state.paused) {
            progressInterval = setInterval(() => {
                spotifyPlayer.getCurrentState().then(currentState => {
                    if (currentState && !currentState.paused) {
                        updateUI(currentState);
                    }
                });
            }, 500); 
        }
        
        updateUI(state);
    });

    spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Player conectado. Device ID:', device_id);
        senafyDeviceId = device_id;
    });
    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID ficou offline', device_id);
    });
    spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Falha ao inicializar:', message);
    });
    spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Falha ao autenticar:', message);
    });

    spotifyPlayer.connect().then(success => {
        if (!success) {
            alert("Não foi possível conectar o player do Spotify. Você precisa de uma conta Premium ativa.");
        }
    });
}

async function playTrack(trackUri, userAccessToken) {
    if (!senafyDeviceId) {
        alert("O player ainda não está pronto. voce deve se conectar antes de tentar escutar alguma musica");
        return;
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${senafyDeviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
            uris: [trackUri]
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAccessToken}`
        },
    });
}