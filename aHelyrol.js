const shopImages = [
    'hely1.jpeg',
    'hely2.jpg',
    'hely3.jpg',
    'hely4.jpg',
    'hely5.jpg',
    'hely6.jpg',
    'hely7.jpg',
    'hely8.jpg'
];

const shopGallery = document.getElementById('shopGallery');
const shopModal = document.getElementById('shopImageModal');
const shopModalImg = document.getElementById('shopModalImg');
const closeShopSpan = document.getElementsByClassName('close')[0];

function loadShopGallery() {
    shopImages.forEach(imageSrc => {
        const img = document.createElement('img');
        img.src = `images/${imageSrc}`;
        img.classList.add('gallery-item');
        img.alt = 'A szalon';

        img.onerror = function () {
            this.src = 'https://via.placeholder.com/300x300/1e1e1e/10b981?text=SZALON';
        };

        img.addEventListener('click', function () {
            shopModal.style.display = 'block';
            shopModalImg.src = this.src;
        });

        shopGallery.appendChild(img);
    });
}

closeShopSpan.onclick = function () {
    shopModal.style.display = 'none';
}

shopModal.onclick = function (e) {
    if (e.target !== shopModalImg) {
        shopModal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadShopGallery);