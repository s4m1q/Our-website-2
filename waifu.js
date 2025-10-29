const apiUrl = 'https://api.waifu.im/search';

const tagsInput = document.getElementById('tags');
const orientationSelect = document.getElementById('orientation');
const nsfwSelect = document.getElementById('nsfw');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const nextBtn = document.getElementById('nextBtn'); 
const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalTags = document.getElementById('modalTags');
const modalSource = document.getElementById('modalSource');
const closeModal = document.querySelector('.close');

let isAppending = false;

const tagsLabel = document.getElementById('tagsLabel');
const tagCloud = document.getElementById('tagCloud');

tagsLabel.addEventListener('mouseenter', () => {
  tagCloud.classList.remove('hidden');
});

document.addEventListener('mouseleave', (e) => {
  if (!tagsLabel.matches(':hover') && !tagCloud.matches(':hover')) {
    tagCloud.classList.add('hidden');
  }
});

function buildQueryParams() {
  const params = {};
  
  const tagsValue = tagsInput.value.trim();
  if (tagsValue) {
    params.included_tags = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  
  const orientation = orientationSelect.value;
  if (orientation) {
    params.orientation = orientation;
  }
  
  params.is_nsfw = nsfwSelect.value;
  
  return params;
}

async function fetchImages(append = false) {
  try {
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');


    if (!append) {
      gallery.innerHTML = '';
    }

    const params = buildQueryParams();
    
    const queryParams = new URLSearchParams();
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach(value => {
          queryParams.append(key, value);
        });
      } else {
        queryParams.set(key, params[key]);
      }
    }
    
    const requestUrl = `${apiUrl}?${queryParams.toString()}`;
    console.log('Request URL:', requestUrl);
    
    const response = await fetch(requestUrl);
    
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    loading.classList.add('hidden');
    
    if (!data.images || data.images.length === 0) {
      showError('Изображения не найдены. Попробуйте изменить параметры поиска.');
      return;
    }
    

    displayImages(data.images, append);
    
  } catch (error) {
    loading.classList.add('hidden');
    showError(error.message);
    console.error('Ошибка:', error);
  }
}

function showError(message) {
  errorDiv.textContent = `❌ ${message}`;
  errorDiv.classList.remove('hidden');
}


function displayImages(images, append = false) {
  if (!append) {
    gallery.innerHTML = '';
  }

  images.forEach((image, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.tags.map(tag => tag.name).join(', ');
    img.loading = 'lazy';
    
    const imageInfo = document.createElement('div');
    imageInfo.className = 'image-info';
    
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    
    image.tags.slice(0, 5).forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.textContent = tag.name;
      tagsDiv.appendChild(tagSpan);
    });
    
    const sourceLink = document.createElement('a');
    sourceLink.href = image.source;
    sourceLink.target = '_blank';
    sourceLink.className = 'source-link';
    sourceLink.textContent = '🔗 Открыть источник';
    sourceLink.onclick = (e) => e.stopPropagation();
    
    imageInfo.appendChild(tagsDiv);
    imageInfo.appendChild(sourceLink);
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(imageInfo);
    
    galleryItem.addEventListener('click', () => {
      openModal(image);
    });
    
    gallery.appendChild(galleryItem);
  });
}

function openModal(image) {
  modal.classList.remove('hidden');
  modalImg.src = image.url;
  const tagsText = image.tags.map(tag => tag.name).join(', ');
  modalTags.textContent = `Теги: ${tagsText}`;
  modalSource.href = image.source;
}

function closeModalWindow() {
  modal.classList.add('hidden');
}

searchBtn.addEventListener('click', () => fetchImages(false));
randomBtn.addEventListener('click', () => fetchImages(false));
nextBtn.addEventListener('click', () => fetchImages(true)); 

closeModal.addEventListener('click', closeModalWindow);

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModalWindow();
  }
});

tagsInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    fetchImages(false);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  fetchImages(false);
});


function clearGalleryOnInputChange() {
  gallery.innerHTML = '';
  errorDiv.classList.add('hidden');
  loading.classList.add('hidden');
}


tagsInput.addEventListener('input', clearGalleryOnInputChange);
orientationSelect.addEventListener('change', clearGalleryOnInputChange);
nsfwSelect.addEventListener('change', clearGalleryOnInputChange);