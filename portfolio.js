const mateTattoos = [
    'kep1.jpg',
    'kep2.jpg',
    'kep3.jpg',
    'kep4.jpg'
];

const erikTattoos = [
    'kep5.jpg',
    'kep6.jpg',
    'kep7.jpg',
    'kep8.jpg'
];

const galleryMate = document.getElementById('gallery-mate');
const galleryErik = document.getElementById('gallery-erik');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const span = document.getElementsByClassName('close')[0];

function createGalleryImages(imagesArray, container) {
    if (!container) return;
    imagesArray.forEach(imageSrc => {
        const img = document.createElement('img');
        img.src = `images/${imageSrc}`;
        img.classList.add('gallery-item');
        img.alt = 'Tetoválás';

        img.onerror = function () {
            this.src = 'https://via.placeholder.com/300x300/1e1e1e/10b981?text=INK';
        };

        img.addEventListener('click', function () {
            modal.style.display = 'block';
            modalImg.src = this.src;
        });

        container.appendChild(img);
    });
}

function loadGalleries() {
    createGalleryImages(mateTattoos, galleryMate);
    createGalleryImages(erikTattoos, galleryErik);
}

span.onclick = function () {
    modal.style.display = 'none';
}

modal.onclick = function (e) {
    if (e.target !== modalImg) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadGalleries);