const tattoos = [
    'kep1.jpg',
    'kep2.jpg',
    'kep3.jpg',
    'kep4.jpg',
    'kep5.jpg',
];

const gallery = document.getElementById('gallery');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const span = document.getElementsByClassName('close')[0];

function loadGallery() {
    tattoos.forEach(imageSrc => {
        const img = document.createElement('img');
        img.src = `images/${imageSrc}`;
        img.classList.add('gallery-item');
        img.alt = 'Tetoválás';
        
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/300x300/1e1e1e/10b981?text=INK';
        };

        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.src;
        });

        gallery.appendChild(img);
    });
}

span.onclick = function() {
    modal.style.display = 'none';
}

modal.onclick = function(e) {
    if (e.target !== modalImg) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadGallery);