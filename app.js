// background.js
const homepage = document.getElementById('homepage');

// Orodha ya picha 5 za love/romantic
const backgrounds = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1509228627157-6b1b1c7773fc?auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1498931299472-8ca5b9a200b3?auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1350&q=80'
];

let index = 0;

// Function ya kubadilisha background kwa smooth
function changeBackground() {
    const nextIndex = (index + 1) % backgrounds.length;

    // Create temporary div kwa fade
    const fadeDiv = document.createElement('div');
    fadeDiv.style.backgroundImage = `url('${backgrounds[nextIndex]}')`;
    fadeDiv.style.position = 'absolute';
    fadeDiv.style.top = 0;
    fadeDiv.style.left = 0;
    fadeDiv.style.width = '100%';
    fadeDiv.style.height = '100%';
    fadeDiv.style.backgroundSize = 'cover';
    fadeDiv.style.backgroundPosition = 'center';
    fadeDiv.style.zIndex = '0';
    fadeDiv.style.opacity = '0';
    fadeDiv.style.transition = 'opacity 1.5s ease-in-out';

    homepage.appendChild(fadeDiv);

    // Start fade
    setTimeout(() => {
        fadeDiv.style.opacity = '1';
    }, 50);

    // Remove old background div after fade
    setTimeout(() => {
        // Remove previous background divs except the first one
        const divs = Array.from(homepage.querySelectorAll('div'));
        divs.forEach((div, i) => {
            if (i < divs.length - 1) div.remove();
        });
        index = nextIndex;
    }, 1600);
}

// Initialize first background
homepage.style.backgroundImage = `url('${backgrounds[0]}')`;

// Change every 5 seconds
setInterval(changeBackground, 5000);
