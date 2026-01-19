const canvas = document.getElementById('tech-bg');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Enhanced interactive background with stronger mouse effects
const nodes = [];
const NODE_COUNT = Math.floor((width * height) / 12000);

function randomColor() {
  const colors = [
    'rgba(0, 212, 255, 0.4)',
    'rgba(0, 255, 247, 0.4)',
    'rgba(123, 47, 247, 0.3)'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function createNodes() {
  nodes.length = 0;
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 1.5,
      color: randomColor(),
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  
  // Draw connecting lines with mouse interaction enhancement
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 180) {
        let opacity = (1 - dist/180) * 0.2;
        // Enhance lines near mouse
        if (mouse) {
          const midX = (nodes[i].x + nodes[j].x) / 2;
          const midY = (nodes[i].y + nodes[j].y) / 2;
          const mouseDist = Math.sqrt((midX - mouse.x)**2 + (midY - mouse.y)**2);
          if (mouseDist < 200) {
            opacity += (1 - mouseDist/200) * 0.3;
          }
        }
        ctx.strokeStyle = `rgba(0, 255, 247, ${Math.min(opacity, 0.5)})`;
        ctx.lineWidth = mouse && dist < 100 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  
  // Draw nodes with enhanced glow near mouse
  for (const node of nodes) {
    let glowIntensity = 1;
    let nodeSize = node.r;
    
    if (mouse) {
      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 150) {
        glowIntensity = 1 + (1 - dist/150) * 2;
        nodeSize = node.r * (1 + (1 - dist/150) * 0.5);
      }
    }
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, Math.PI*2);
    ctx.fillStyle = node.color;
    ctx.shadowColor = '#00fff7';
    ctx.shadowBlur = 8 * glowIntensity;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function animate(mouse) {
  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;
    
    // Bounce off edges
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
    
    // Strong mouse interaction - bubbles move away from cursor
    if (mouse) {
      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 200) {
        const force = (1 - dist/200) * 0.8;
        node.vx += (dx/dist) * force;
        node.vy += (dy/dist) * force;
      }
    }
    
    // Apply friction
    node.vx *= 0.98;
    node.vy *= 0.98;
    
    // Limit speed
    const maxSpeed = mouse ? 3 : 1.2;
    node.vx = Math.max(-maxSpeed, Math.min(maxSpeed, node.vx));
    node.vy = Math.max(-maxSpeed, Math.min(maxSpeed, node.vy));
  }
}

let mouse = null;
// Track mouse on entire document for better interaction
document.addEventListener('mousemove', e => {
  mouse = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('mouseleave', () => {
  mouse = null;
});
canvas.addEventListener('touchmove', e => {
  if (e.touches.length > 0) {
    mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}, {passive:true});
canvas.addEventListener('touchend', () => { mouse = null; });

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  createNodes();
}
window.addEventListener('resize', resize);

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.experience-card, .passion-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

function loop() {
  animate(mouse);
  draw();
  requestAnimationFrame(loop);
}

createNodes();
loop();
