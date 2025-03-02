const audio = new Audio();
const albumArt = document.querySelector('.album-art img');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const currentTime = document.querySelector('.current-time');
const duration = document.querySelector('.duration');
const btnPlayPause = document.querySelector('.btn-play-pause');
const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');
const volumeSlider = document.querySelector('.volume-slider');
const btnRandom = document.querySelector('.btn-random');
const btnRepeat = document.querySelector('.btn-repeat');
const btnList = document.querySelector('.btn-list');
const playlist = document.querySelector('.playlist');
const playlistUl = document.querySelector('.playlist ul');
const visualizer = document.querySelector('.visualizer');
const musicPlayer = document.querySelector('.music-player');
// Thêm biến tham chiếu đến phần tử hiển thị tên bài hát
const songNameDisplay = document.querySelector('.song-name');
let audioContext;
let analyser;
let frequencyData;
const songInfo = document.querySelector('.song-info');
const separator = document.querySelector('.separator');

let isPlaying = false;
let isRandom = false;
let isListOpen = false;
let isRepeat = false;
let currentTrackIndex = 0;
let tracks = [];

async function loadTrackList() {
    const musicDir = 'music/';
    const response = await fetch(musicDir);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(text, 'text/html');
    const folders = Array.from(htmlDoc.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href.endsWith('/'))
        .map(href => href.substring(href.lastIndexOf('/', href.length - 2) + 1, href.length - 1));

    tracks = await Promise.all(folders.map(async (folder) => {
        const songDir = `${musicDir}${folder}/`;
        const files = await fetchFilesFromDirectory(songDir);

        const mp3File = files.find(file => file.endsWith('.mp3'));
        const imageFile = files.find(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')); // Hỗ trợ nhiều định dạng ảnh

        if (mp3File && imageFile) {
          const songName = mp3File.split('.')[0];
            return {
                name: songName,
                path: `${songDir}${mp3File}`,
                image: `${songDir}${imageFile}`,
            };
        }
        return null;
    }));

    tracks = tracks.filter(track => track !== null);

    renderPlaylist();
    loadTrack(currentTrackIndex);
}

async function fetchFilesFromDirectory(directory) {
    const response = await fetch(directory);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(text, 'text/html');
    return Array.from(htmlDoc.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => !href.endsWith('/')) // Lọc bỏ các thư mục con
        .map(href => {
          const url = new URL(href);
          return decodeURIComponent(url.pathname.substring(url.pathname.lastIndexOf('/') + 1));
        });
}

function renderPlaylist() {
    playlistUl.innerHTML = '';
    tracks.forEach((track, index) => {
        const li = document.createElement('li');

        // Tạo div chứa ảnh
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('playlist-item-image');

        // Tạo thẻ img và thiết lập src
        const img = document.createElement('img');
        img.src = track.image;
        img.alt = 'Album Art';

        // Thêm img vào div chứa ảnh
        imageDiv.appendChild(img);

        // Tạo span chứa tên bài hát
        const span = document.createElement('span');
        span.textContent = track.name;

        // Thêm div chứa ảnh và span vào li
        li.appendChild(imageDiv);
        li.appendChild(span);

        // Thêm sự kiện click vào li
        li.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            playTrack();
        });

        // Thêm li vào ul
        playlistUl.appendChild(li);
    });
}

function loadTrack(index) {
    if (tracks.length === 0) return;

    const track = tracks[index];
    audio.src = track.path;
    albumArt.src = track.image;
    audio.load();

    // Hiển thị tên bài hát bên cạnh avatar
    songNameDisplay.textContent = track.name;

    updatePlaylistHighlight();
}

function playTrack() {
    if (tracks.length === 0) return;

    if (!audioContext) {
        setupVisualizer();
    }

    audio.play().then(() => {
        isPlaying = true;
        btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
        console.log("Audio playing");

        // Thêm class để bắt đầu animation
        songInfo.classList.add('animate');
        
    }).catch(error => {
        console.error("Error playing audio:", error);
        isPlaying = false;
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
    });
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';

    // Xóa class để animation chạy về vị trí cũ
    songInfo.classList.remove('animate');
    
}

function playPause() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function nextTrack() {
  if (isRandom) {
    // Nếu đang bật random, chọn một bài hát ngẫu nhiên
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * tracks.length);
    } while (newIndex === currentTrackIndex && tracks.length > 1); // Tránh lặp lại bài hiện tại nếu có nhiều hơn 1 bài
    currentTrackIndex = newIndex;
  } else {
    // Nếu không, chuyển bài tiếp theo bình thường
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  }
  loadTrack(currentTrackIndex);
  playTrack();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function updateProgress() {
    if (audio.readyState > 2) {
        const { currentTime: current, duration: dur } = audio;

        if (!isNaN(dur)) {
            const progressPercent = (current / dur) * 100;
            progress.style.width = `${progressPercent}%`;
            currentTime.textContent = formatTime(current);
            duration.textContent = formatTime(dur);
        }
    }
}

function setProgress(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    if (!isNaN(duration)) {
        const newTime = (clickX / width) * duration;
        audio.currentTime = newTime;
        // Update progress bar immediately
        const progressPercent = (newTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
}

function setVolume() {
    audio.volume = volumeSlider.value;
}

function toggleRandom() {
    isRandom = !isRandom;
    btnRandom.classList.toggle('active', isRandom);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active', isRepeat);
}

function toggleList() {
    isListOpen = !isListOpen;
    playlist.classList.toggle('open', isListOpen);
}

function updatePlaylistHighlight() {
    const playlistItems = document.querySelectorAll('.playlist li');
    playlistItems.forEach((item, index) => {
        item.classList.toggle('playing', index === currentTrackIndex);
    });
}

function setupVisualizer() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 64;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        createBars();
    }
}

function createBars() {
    visualizer.innerHTML = '';
    const numberOfBars = frequencyData.length;
    for (let i = 0; i < numberOfBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        visualizer.appendChild(bar);
    }
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);

    if (!isPlaying) {
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.height = '0px'; // Set bar height to 0 when paused
        });
        return;
    }

    analyser.getByteFrequencyData(frequencyData);

    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, i) => {
        const height = frequencyData[i] * 0.6;
        bar.style.height = `${height}px`;
    });
}

function handleTrackEnded() {
    if (isRepeat) {
      // Nếu đang bật repeat, phát lại bài hát hiện tại
      playTrack();
    } else {
      // Nếu không, chuyển bài như bình thường
      nextTrack();
    }
}

btnPlayPause.addEventListener('click', playPause);
btnNext.addEventListener('click', nextTrack);
btnPrev.addEventListener('click', prevTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', handleTrackEnded);
progressBar.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);
btnRandom.addEventListener('click', toggleRandom);
btnList.addEventListener('click', toggleList);
btnRepeat.addEventListener('click', toggleRepeat);
audio.addEventListener('play', () => {
    isPlaying = true;
    drawVisualizer();
});
audio.addEventListener('pause', () => {
    isPlaying = false;
});
audio.addEventListener('loadeddata', () => {
    const { duration: dur } = audio;
    if (!isNaN(dur)) {
        duration.textContent = formatTime(dur);
    }
});

loadTrackList();