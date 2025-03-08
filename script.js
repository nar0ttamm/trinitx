// Three.js Setup
let scene, camera, renderer, stars, earth;
const canvas = document.getElementById('hero-canvas');

// Animation state variables
let isBigBangComplete = false;
let isStarsVisible = false;
let isEarthVisible = false;
let isHeaderVisible = false;
let isHomeContentVisible = false;
let isThemeSwitcherVisible = false;
let isAnimationsComplete = false;

// Earth rotation control variables
let isDraggingEarth = false;
let previousMousePosition = {
    x: 0,
    y: 0
};
let earthRotationSpeed = 0.005;

// Add custom cursor styles
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

// Add cursor styles to head
const style = document.createElement('style');
style.textContent = `
    .custom-cursor {
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.5);
        border: 2px solid white;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease, opacity 0.2s ease;
        mix-blend-mode: difference;
        opacity: 0;
    }
    .custom-cursor.active {
        transform: scale(1.5);
        background: rgba(255, 255, 255, 0.8);
    }
    .custom-cursor.visible {
        opacity: 1;
    }
    #home {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    .hero-content {
        pointer-events: none;
        opacity: 0;
        transition: opacity 1s ease;
    }
    .hero-content.visible {
        opacity: 1;
    }
    #hero-canvas {
        cursor: default;
    }
    .navbar {
        opacity: 0;
        transition: opacity 1s ease;
        background: transparent !important;
    }
    .navbar.visible {
        opacity: 1;
    }
    .theme-switcher {
        opacity: 0;
        transition: opacity 1s ease;
    }
    .theme-switcher.visible {
        opacity: 1;
    }
    .big-bang-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 2em;
        font-weight: bold;
        opacity: 1;
        transition: opacity 0.5s ease;
    }
    .big-bang-overlay.hidden {
        opacity: 0;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Create Big Bang overlay
const bigBangOverlay = document.createElement('div');
bigBangOverlay.className = 'big-bang-overlay';
bigBangOverlay.textContent = 'TrinitX';
document.body.appendChild(bigBangOverlay);

// Create Big Bang particles
function createBigBangParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Start all particles at the center
        positions[i] = 0;
        positions[i + 1] = 0;
        positions[i + 2] = 0;

        // Random velocities for explosion effect
        const speed = 0.1 + Math.random() * 0.3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        velocities[i] = speed * Math.sin(phi) * Math.cos(theta);
        velocities[i + 1] = speed * Math.sin(phi) * Math.sin(theta);
        velocities[i + 2] = speed * Math.cos(phi);

        // Color gradient from white to blue
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;

        // Random sizes
        sizes[i/3] = 0.02 + Math.random() * 0.03;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });

    return new THREE.Points(geometry, material);
}

function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set scene background to pure black
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // Set renderer clear color to pure black
    canvas.appendChild(renderer.domElement);

    // Create Big Bang particles
    const bigBangParticleSystem = createBigBangParticles();
    scene.add(bigBangParticleSystem);

    // Initial camera position
    camera.position.z = 5;

    // Start Big Bang animation
    bigBangStartTime = Date.now();
    isBigBangComplete = false;

    // Create stars and Earth (initially invisible)
    createStarsAndEarth();
}

function createStarsAndEarth() {
    // Create stars with trails
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 8000;
    const positions = new Float32Array(starsCount * 3);
    const velocities = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
        const radius = Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        velocities[i] = 0;
        velocities[i + 1] = 0;
        velocities[i + 2] = 0.15;

        const brightness = 0.8 + Math.random() * 0.2;
        colors[i] = brightness;
        colors[i + 1] = brightness;
        colors[i + 2] = brightness;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });

    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create Earth (initially invisible and at point size)
    const earthGeometry = new THREE.SphereGeometry(0.01, 128, 128); // Start with tiny size
    const earthTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const earthNormalMap = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const earthSpecularMap = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    const earthCloudsMap = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');

    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: earthNormalMap,
        specularMap: earthSpecularMap,
        specular: new THREE.Color(0x333333),
        shininess: 5,
        normalScale: new THREE.Vector2(0.85, 0.85),
        transparent: true,
        opacity: 0
    });

    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add cloud layer (initially invisible and at point size)
    const cloudGeometry = new THREE.SphereGeometry(0.01, 128, 128);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: earthCloudsMap,
        transparent: true,
        opacity: 0
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.add(clouds); // Add clouds as child of Earth

    // Add atmosphere glow (initially invisible and at point size)
    const atmosphereGeometry = new THREE.SphereGeometry(0.01, 128, 128);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 0.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earth.add(atmosphere); // Add atmosphere as child of Earth

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 5, 5);
    scene.add(sunLight);
}

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const elapsed = currentTime - bigBangStartTime;

    if (!isBigBangComplete) {
        // Big Bang animation (2 seconds)
        if (elapsed < 2000) {
            const positions = scene.children[0].geometry.attributes.position.array;
            const velocities = scene.children[0].geometry.attributes.velocity.array;
            const colors = scene.children[0].geometry.attributes.color.array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                // Fade out particles
                const progress = elapsed / 2000;
                colors[i] *= (1 - progress);
                colors[i + 1] *= (1 - progress);
                colors[i + 2] *= (1 - progress);
            }

            scene.children[0].geometry.attributes.position.needsUpdate = true;
            scene.children[0].geometry.attributes.color.needsUpdate = true;
        } else {
            // Big Bang complete
            isBigBangComplete = true;
            scene.remove(scene.children[0]);
            bigBangOverlay.classList.add('hidden');
            startSequentialFadeIn();
        }
    }

    // Update star positions
    if (isStarsVisible) {
        const positions = stars.geometry.attributes.position.array;
        const velocities = stars.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += velocities[i + 2];

            if (positions[i + 2] > 5) {
                positions[i + 2] = -30;
                positions[i] = (Math.random() - 0.5) * 60;
                positions[i + 1] = (Math.random() - 0.5) * 60;
                velocities[i + 2] = 0.15 + (Math.random() - 0.5) * 0.05;
            }
        }

        stars.geometry.attributes.position.needsUpdate = true;
        stars.geometry.attributes.velocity.needsUpdate = true;
    }

    // Rotate Earth only when not being dragged
    if (earth && !isDraggingEarth) {
        earth.rotation.y += earthRotationSpeed;
    }

    // Camera animation with smoother easing
    const progress = Math.min(elapsed / cameraAnimation.duration, 1);
    const easeOutCubic = 1 - Math.pow(1 - progress, 2); // Changed to quadratic easing for smoother approach
    camera.position.z = cameraAnimation.startZ + (cameraAnimation.endZ - cameraAnimation.startZ) * easeOutCubic;

    renderer.render(scene, camera);
}

function checkAnimationsComplete() {
    return isBigBangComplete && 
           isStarsVisible && 
           isEarthVisible && 
           isHeaderVisible && 
           isHomeContentVisible && 
           isThemeSwitcherVisible;
}

function startSequentialFadeIn() {
    // Disable scrolling initially with a more robust method
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;

    // Fade in stars
    setTimeout(() => {
        isStarsVisible = true;
        gsap.to(stars.material, {
            opacity: 0.9,
            duration: 3,
            ease: "power2.inOut"
        });
    }, 500);

    // Fade in and expand Earth
    setTimeout(() => {
        isEarthVisible = true;
        
        // Expand Earth and its layers with smoother animation
        gsap.to(earth.scale, {
            x: 300,
            y: 300,
            z: 300,
            duration: 8,
            ease: "power1.inOut"
        });
        
        gsap.to(earth.children[0].scale, {
            x: 301,
            y: 301,
            z: 301,
            duration: 8,
            ease: "power1.inOut"
        });
        
        gsap.to(earth.children[1].scale, {
            x: 310,
            y: 310,
            z: 310,
            duration: 8,
            ease: "power1.inOut"
        });

        // Fade in materials with longer duration
        gsap.to(earth.material, {
            opacity: 1,
            duration: 8,
            ease: "power1.inOut"
        });
        gsap.to(earth.children[0].material, {
            opacity: 0.4,
            duration: 8,
            ease: "power1.inOut"
        });
        gsap.to(earth.children[1].material, {
            opacity: 0.3,
            duration: 8,
            ease: "power1.inOut"
        });
    }, 2500);

    // Fade in navbar
    setTimeout(() => {
        isHeaderVisible = true;
        document.querySelector('.navbar').classList.add('visible');
    }, 10500);

    // Fade in home content
    setTimeout(() => {
        isHomeContentVisible = true;
        document.querySelector('.hero-content').classList.add('visible');
    }, 11500);

    // Fade in theme switcher and enable scrolling
    setTimeout(() => {
        isThemeSwitcherVisible = true;
        document.querySelector('.theme-switcher').classList.add('visible');
        
        // Enable scrolling after all animations are complete
        setTimeout(() => {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.overflow = 'auto';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
            isAnimationsComplete = true;
        }, 1000);
    }, 12500);
}

// Raycaster for Earth detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouse event handlers for Earth rotation
function onMouseDown(event) {
    if (!isHoveringEarth(event)) return;
    
    isDraggingEarth = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    cursor.classList.add('active');
}

function onMouseMove(event) {
    // Update custom cursor position
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';

    // Check if hovering over Earth
    if (isHoveringEarth(event)) {
        cursor.classList.add('visible');
        canvas.style.cursor = 'none';
    } else {
        cursor.classList.remove('visible');
        cursor.classList.remove('active');
        canvas.style.cursor = 'default';
    }

    if (!isDraggingEarth) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    // Rotate Earth based on mouse movement
    if (earth) {
        earth.rotation.y += deltaMove.x * 0.005;
        earth.rotation.x += deltaMove.y * 0.005;
        
        // Limit vertical rotation to prevent flipping
        earth.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, earth.rotation.x));
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDraggingEarth = false;
    cursor.classList.remove('active');
}

function isHoveringEarth(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(earth);

    return intersects.length > 0;
}

// Camera animation variables
let cameraAnimation = {
    startTime: Date.now(),
    duration: 12000, // Increased to 12 seconds for smoother approach
    startZ: 30, // Start further away
    endZ: 8
};

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Initialize Three.js
initThree();
animate();

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Animate sections on scroll
document.querySelectorAll('section').forEach(section => {
    gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        if (!isAnimationsComplete) return;
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navLinksContainer = document.querySelector('.nav-links');
            const hamburger = document.querySelector('.hamburger');
            navLinksContainer.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Theme Switcher
const themeSwitcher = document.querySelector('.theme-switcher');
const html = document.documentElement;
let isDragging = false;
let startY = 0;
let currentY = 0;
let pullThreshold = 50; // Distance to pull to trigger theme change

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

// Lamp interaction
const lampElements = [
    document.querySelector('.lamp-rope'),
    document.querySelector('.lamp'),
    document.querySelector('.lamp-head'),
    document.querySelector('.lamp-body'),
    document.querySelector('.lamp-light'),
    document.querySelector('.lamp-tip')
];

lampElements.forEach(element => {
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        themeSwitcher.style.animation = 'none';
        themeSwitcher.style.transform = 'translateX(-50%) rotate(0deg)';
    });
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    currentY = e.clientY;
    const pullDistance = currentY - startY;
    
    // Limit the pull distance
    const maxPull = 100;
    const pullRatio = Math.min(pullDistance / maxPull, 1);
    
    // Rotate the lamp based on pull distance
    const rotation = pullRatio * 15;
    themeSwitcher.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
});

document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    
    isDragging = false;
    const pullDistance = currentY - startY;
    
    if (pullDistance > pullThreshold) {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // Reset lamp position and restart animation
    themeSwitcher.style.transform = '';
    themeSwitcher.style.animation = '';
});

// Navbar Active Link
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function setActiveLink() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', setActiveLink);
setActiveLink();

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinksContainer.contains(e.target) && !hamburger.contains(e.target)) {
        navLinksContainer.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Update navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentTheme = html.getAttribute('data-theme');
    
    if (window.scrollY > 50) {
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
    } else {
        navbar.style.background = 'transparent';
    }
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Add fade-in animation to elements
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// Add event listeners for Earth interaction
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mouseleave', onMouseUp);

// Services Section Scroll
let currentServiceIndex = 0;
const servicesTrack = document.querySelector('.services-track');
const serviceCards = document.querySelectorAll('.service-card');
const totalServices = serviceCards.length;
let isScrollingServices = false;
let lastScrollY = window.scrollY;
let scrollTimeout;
let isServicesSectionActive = false;

// Create scroll indicators
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
for (let i = 0; i < totalServices; i++) {
    const dot = document.createElement('div');
    dot.className = 'scroll-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => scrollToService(i));
    scrollIndicator.appendChild(dot);
}
document.querySelector('.services').appendChild(scrollIndicator);

// Create navigation arrows
const prevButton = document.createElement('div');
prevButton.className = 'service-nav prev';
prevButton.innerHTML = '←';
prevButton.addEventListener('click', () => scrollToService(currentServiceIndex - 1));

const nextButton = document.createElement('div');
nextButton.className = 'service-nav next';
nextButton.innerHTML = '→';
nextButton.addEventListener('click', () => scrollToService(currentServiceIndex + 1));

document.querySelector('.services-container').appendChild(prevButton);
document.querySelector('.services-container').appendChild(nextButton);

function scrollToService(index) {
    if (index < 0 || index >= totalServices) return;
    
    currentServiceIndex = index;
    const scrollAmount = -index * 50; // Changed to 50% for half-width cards
    servicesTrack.style.transform = `translateX(${scrollAmount}%)`;
    
    // Update scroll indicators
    document.querySelectorAll('.scroll-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentServiceIndex);
    });

    // Update navigation buttons
    prevButton.style.opacity = currentServiceIndex === 0 ? '0.5' : '1';
    nextButton.style.opacity = currentServiceIndex === totalServices - 1 ? '0.5' : '1';
}

// Handle vertical scroll for services section
function handleServicesScroll(e) {
    const servicesSection = document.querySelector('.services');
    const sectionRect = servicesSection.getBoundingClientRect();
    const isInView = sectionRect.top <= 0 && sectionRect.bottom >= window.innerHeight;

    if (isInView) {
        // If we're at the last card and scrolling down, allow normal scroll
        if (currentServiceIndex === totalServices - 1 && window.scrollY > lastScrollY) {
            isServicesSectionActive = false;
            return;
        }

        // If we're at the first card and scrolling up, allow normal scroll
        if (currentServiceIndex === 0 && window.scrollY < lastScrollY) {
            isServicesSectionActive = false;
            return;
        }

        // Capture scroll events for card navigation
        isServicesSectionActive = true;
        e.preventDefault();

        const scrollDelta = window.scrollY - lastScrollY;
        
        if (Math.abs(scrollDelta) > 10) { // Minimum scroll threshold
            if (scrollDelta > 0 && currentServiceIndex < totalServices - 1) {
                // Scrolling down
                scrollToService(currentServiceIndex + 1);
            } else if (scrollDelta < 0 && currentServiceIndex > 0) {
                // Scrolling up
                scrollToService(currentServiceIndex - 1);
            }
        }

        // Keep the section in view
        window.scrollTo({
            top: servicesSection.offsetTop,
            behavior: 'instant'
        });
    } else {
        isServicesSectionActive = false;
    }

    lastScrollY = window.scrollY;
}

// Update the scroll event listener to be more strict about preventing scroll
window.addEventListener('scroll', (e) => {
    if (!isAnimationsComplete) {
        e.preventDefault();
        window.scrollTo(0, 0);
        return;
    }
    
    // Handle services section scroll
    if (isAnimationsComplete) {
        handleServicesScroll(e);
    }
}, { passive: false });

// Add touch event prevention for mobile devices
window.addEventListener('touchmove', (e) => {
    if (!isAnimationsComplete) {
        e.preventDefault();
        return;
    }
}, { passive: false });

// Add wheel event prevention
window.addEventListener('wheel', (e) => {
    if (!isAnimationsComplete) {
        e.preventDefault();
        return;
    }
}, { passive: false });

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        scrollToService(currentServiceIndex - 1);
    } else if (e.key === 'ArrowRight') {
        scrollToService(currentServiceIndex + 1);
    }
});

// Initialize navigation buttons
scrollToService(0); 
