const canvas = document.getElementById('tech-bg');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Tech lines and nodes
const nodes = [];
const lines = [];
const NODE_COUNT = Math.floor((width * height) / 12000);

function randomColor() {
  return `rgba(${80 + Math.random()*80},${180 + Math.random()*40},${200 + Math.random()*55},0.7)`;
}

function createNodes() {
  nodes.length = 0;
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 2 + Math.random() * 2,
      color: randomColor(),
      vx: (Math.random()-0.5)*0.5,
      vy: (Math.random()-0.5)*0.5
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  // Draw lines
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        ctx.strokeStyle = 'rgba(0,255,255,' + (1 - dist/120) * 0.3 + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  // Draw nodes
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI*2);
    ctx.fillStyle = node.color;
    ctx.shadowColor = '#00fff7';
    ctx.shadowBlur = 8;
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
    // Mouse repulsion
    if (mouse) {
      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        node.vx += dx/dist * 0.2;
        node.vy += dy/dist * 0.2;
      }
    }
    // Limit speed
    node.vx = Math.max(-1, Math.min(1, node.vx));
    node.vy = Math.max(-1, Math.min(1, node.vy));
  }
}

let mouse = null;
canvas.addEventListener('mousemove', e => {
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

function loop() {
  animate(mouse);
  draw();
  requestAnimationFrame(loop);
}

createNodes();
loop();
