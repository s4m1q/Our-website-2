import './style.css';
const SHIKIMORI_BASE_URL = 'https://shikimori.one/api';

const searchInput = document.getElementById('search');
const statusSelect = document.getElementById('status');
const kindSelect = document.getElementById('kind');
const orderSelect = document.getElementById('order');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const animeList = document.getElementById('animeList');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const modal = document.getElementById('animeModal');

let currentPage = 1;
let isLoading = false;

const PLACEHOLDER_IMAGE = 'image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xNTAgMjI1QzE2Ni41NDMgMjI1IDE4MCAyMTEuNTQzIDE4MCAxOTVDMTgwIDE3OC40NTcgMTY2LjU0MyAxNjUgMTUwIDE2NUMxMzMuNDU3IDE2NSAxMjAgMTc4LjQ1NyAxMjAgMTk1QzEyMCAyMTEuNTQzIDEzMy40NTcgMjI1IDE1MCAyMjVaIiBmaWxsPSIjQ0VDRUNFIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

function buildQueryParams(page = 1) {
    const params = {
        limit: 20,
        page: page
    };

    const searchValue = searchInput.value.trim();
    if (searchValue) {
        params.search = searchValue;
    }

    const status = statusSelect.value;
    if (status) {
        params.status = status;
    }

    const kind = kindSelect.value;
    if (kind) {
        params.kind = kind;
    }

    const order = orderSelect.value;
    if (order) {
        params.order = order;
    }

    return params;
}

function getImageUrl(anime) {
    if (anime.image && anime.image.original) {
        if (anime.image.original.startsWith('/')) {
            return `https://shikimori.one${anime.image.original}`;
        }
        return anime.image.original;
    }
    return PLACEHOLDER_IMAGE;
}

function getStatusText(status) {
    const statusMap = {
        'released': 'Вышедшее',
        'ongoing': 'Онгоинг',
        'anons': 'Анонс'
    };
    return statusMap[status] || status;
}

function getYear(dateString) {
    if (!dateString) return '—';
    const year = new Date(dateString).getFullYear();
    return isNaN(year) ? '—' : year;
}

async function fetchAnime(append = false) {
    if (isLoading) return;

    try {
        isLoading = true;
        loading.classList.remove('hidden');
        errorDiv.classList.add('hidden');

        if (!append) {
            currentPage = 1;
            animeList.innerHTML = '';
        }

        const params = buildQueryParams(currentPage);
        const queryParams = new URLSearchParams();
        for (const key in params) {
            queryParams.set(key, params[key]);
        }

        const requestUrl = `${SHIKIMORI_BASE_URL}/animes?${queryParams.toString()}`;
        console.log('Request URL:', requestUrl);

        const response = await fetch(requestUrl, {
            headers: {
                'User-Agent': 'MyAnimeApp/1.0 (user@example.com)'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        loading.classList.add('hidden');

        if (!data || data.length === 0) {
            if (!append) {
                showError('Аниме не найдены.');
            }
            return;
        }

        displayAnime(data, append);

        if (data.length >= 20) {
            loadMoreBtn.style.display = 'flex';
        } else {
            loadMoreBtn.style.display = 'none';
        }

    } catch (error) {
        loading.classList.add('hidden');
        showError(error.message);
        console.error('Ошибка:', error);
    } finally {
        isLoading = false;
    }
}

function showError(message) {
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.classList.remove('hidden');
    loadMoreBtn.style.display = 'none';
}

function displayAnime(animeData, append = false) {
    if (!append) {
        animeList.innerHTML = '';
    }

    animeData.forEach(anime => {
        const animeItem = document.createElement('div');
        animeItem.className = 'anime-item';

        const imageUrl = getImageUrl(anime);
        const year = getYear(anime.aired_on);

        animeItem.innerHTML = `
            <div class="anime-image">
                <img src="${imageUrl}" alt="${anime.russian || anime.name}" 
                     onerror="this.src='${PLACEHOLDER_IMAGE}'">
                ${anime.score ? `<div class="anime-score">★ ${anime.score}</div>` : ''}
            </div>
            <div class="anime-content">
                <h3 class="anime-title">${anime.russian || anime.name}</h3>
                ${anime.japanese ? `<p class="anime-japanese-title">${anime.japanese[0]}</p>` : ''}
                <div class="anime-info">
                    <span class="anime-episodes">Эпизоды: ${anime.episodes || '?'}</span>
                    <span class="anime-status">${getStatusText(anime.status)}</span>
                </div>
                <div class="anime-year">Год: ${year}</div>
            </div>
        `;

        animeItem.addEventListener('click', () => {
            openModal(anime);
        });

        animeList.appendChild(animeItem);
    });
}

function openModal(anime) {
    const imageUrl = getImageUrl(anime);
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('modalImage').alt = anime.russian || anime.name;
    document.getElementById('modalImage').onerror = function () {
        this.src = PLACEHOLDER_IMAGE;
    };

    document.getElementById('modalTitle').textContent = anime.russian || anime.name;

    if (anime.japanese && anime.japanese.length > 0) {
        document.getElementById('modalJapaneseTitle').textContent = anime.japanese[0];
        document.getElementById('modalJapaneseTitle').style.display = 'block';
    } else {
        document.getElementById('modalJapaneseTitle').style.display = 'none';
    }

    const score = anime.score || 'N/A';
    document.getElementById('modalScore').textContent = score === '0.0' ? 'N/A' : score;

    document.getElementById('modalEpisodes').textContent = anime.episodes || '?';
    document.getElementById('modalStatus').textContent = getStatusText(anime.status);
    document.getElementById('modalYear').textContent = getYear(anime.aired_on);
    document.getElementById('modalKind').textContent = anime.kind ? anime.kind.toUpperCase() : '—';

    if (anime.url) {
        document.getElementById('modalShikimoriLink').href = `https://shikimori.one${anime.url}`;
        document.getElementById('modalShikimoriLink').style.display = 'inline-block';
    } else {
        document.getElementById('modalShikimoriLink').style.display = 'none';
    }

    modal.classList.remove('hidden');
}

function closeModalWindow() {
    modal.classList.add('hidden');
}

searchBtn.addEventListener('click', () => fetchAnime(false));
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchAnime(true);
});

document.querySelector('.modal-background').addEventListener('click', closeModalWindow);
document.querySelector('.close').addEventListener('click', closeModalWindow);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModalWindow();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchAnime(false);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    fetchAnime(false);
});

function clearAnimeList() {
    animeList.innerHTML = '';
    errorDiv.classList.add('hidden');
    loading.classList.add('hidden');
    loadMoreBtn.style.display = 'none';
}

searchInput.addEventListener('input', clearAnimeList);
statusSelect.addEventListener('change', clearAnimeList);
kindSelect.addEventListener('change', clearAnimeList);
orderSelect.addEventListener('change', clearAnimeList);
