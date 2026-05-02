// === Interactive Tree Distance Explorer ===

class TreeExplorer {
  constructor(canvasId, infoId) {
    this.canvas = document.getElementById(canvasId);
    this.infoEl = document.getElementById(infoId);
    this.ctx = this.canvas.getContext('2d');
    this.depth = 5;
    this.b = 2;
    this.selectedNodes = [];
    this.hoveredNode = null;
    this.animFrame = null;

    this.resize();
    window.addEventListener('resize', debounce(() => this.resize(), 150));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredNode = null;
      this.draw();
    });

    this.draw();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = Math.min(rect.width - 32, 700);
    const h = this.depth * 72 + 60;
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.computeLayout();
    this.draw();
  }

  computeLayout() {
    this.nodes = [];
    const w = this.canvas.width;
    const h = this.canvas.height;
    const topMargin = 20;
    const vSpacing = (h - topMargin - 20) / (this.depth);

    for (let d = 0; d <= this.depth; d++) {
      const count = Math.pow(this.b, d);
      const y = topMargin + d * vSpacing;
      const totalWidth = w - 40;
      const spacing = count > 1 ? totalWidth / (count - 1) : 0;
      const startX = count === 1 ? w / 2 : 20;

      for (let i = 0; i < count; i++) {
        const x = count === 1 ? startX : startX + i * spacing;
        const path = i.toString(this.b).padStart(d || 0, '0');
        this.nodes.push({
          x, y, depth: d, index: i, path,
          radius: Math.max(4, 14 - d * 1.5)
        });
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw edges
    ctx.strokeStyle = 'rgba(30,41,59,0.6)';
    ctx.lineWidth = 1;
    for (const node of this.nodes) {
      if (node.depth === 0) continue;
      const parentIdx = Math.floor(node.index / this.b);
      const parent = this.nodes.find(n => n.depth === node.depth - 1 && n.index === parentIdx);
      if (!parent) continue;

      const isSelected = this.isEdgeSelected(node, parent);
      ctx.strokeStyle = isSelected ? 'rgba(226,176,74,0.7)' : 'rgba(30,41,59,0.5)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const node of this.nodes) {
      const isSelected = this.selectedNodes.includes(node);
      const isHovered = this.hoveredNode === node;
      const isAncestor = this.selectedNodes.length === 2 &&
        this.isAncestorOf(node, this.selectedNodes[0], this.selectedNodes[1]);

      // Glow
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(226,176,74,0.15)';
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      if (isSelected) {
        ctx.fillStyle = '#e2b04a';
        ctx.strokeStyle = '#f0c96d';
        ctx.lineWidth = 2;
      } else if (isAncestor) {
        ctx.fillStyle = 'rgba(96,165,250,0.5)';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(226,176,74,0.4)';
        ctx.strokeStyle = '#e2b04a';
        ctx.lineWidth = 1.5;
      } else {
        ctx.fillStyle = 'rgba(100,116,139,0.4)';
        ctx.strokeStyle = 'rgba(100,116,139,0.3)';
        ctx.lineWidth = 1;
      }
      ctx.fill();
      ctx.stroke();

      // Label for selected
      if (isSelected) {
        ctx.fillStyle = '#0a0e17';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.path || 'root', node.x, node.y);
      }
    }

    // Update info panel
    this.updateInfo();
  }

  isEdgeSelected(child, parent) {
    if (this.selectedNodes.length !== 2) return false;
    const [a, b] = this.selectedNodes;
    const commonDepth = this.commonPrefixLen(a.path, b.path);
    return child.depth <= commonDepth + 1 && parent.depth <= commonDepth;
  }

  isAncestorOf(node, a, b) {
    const cd = this.commonPrefixLen(a.path, b.path);
    return node.depth <= cd;
  }

  commonPrefixLen(p1, p2) {
    let k = 0;
    while (k < p1.length && k < p2.length && p1[k] === p2[k]) k++;
    return k;
  }

  updateInfo() {
    if (this.selectedNodes.length === 2) {
      const [a, b] = this.selectedNodes;
      const k = this.commonPrefixLen(a.path, b.path);
      const dist = Math.pow(this.b, -k);
      this.infoEl.innerHTML = `
        <span>Selected: <span class="highlight">${a.path || 'root'}</span> &amp; <span class="highlight">${b.path || 'root'}</span></span><br>
        <span>Common prefix: <span class="highlight">${k}</span> digits</span><br>
        <span>Tree distance: <span class="highlight">${this.b}<sup>-${k}</sup> = ${dist < 0.001 ? dist.toExponential(3) : dist.toFixed(4)}</span></span>
      `;
    } else if (this.selectedNodes.length === 1) {
      this.infoEl.innerHTML = `
        <span>Selected: <span class="highlight">${this.selectedNodes[0].path || 'root'}</span></span><br>
        <span style="color:#9ca3af">Click another node to measure distance</span>
      `;
    } else {
      this.infoEl.innerHTML = `
        <span style="color:#9ca3af">Click two nodes to measure the tree distance between them</span>
      `;
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let closest = null;
    let minDist = Infinity;
    for (const node of this.nodes) {
      const dx = mx - node.x;
      const dy = my - node.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < node.radius + 8 && d < minDist) {
        closest = node;
        minDist = d;
      }
    }

    if (closest !== this.hoveredNode) {
      this.hoveredNode = closest;
      this.canvas.style.cursor = closest ? 'pointer' : 'default';
      this.draw();
    }
  }

  onClick(e) {
    if (!this.hoveredNode) return;

    const idx = this.selectedNodes.indexOf(this.hoveredNode);
    if (idx >= 0) {
      this.selectedNodes.splice(idx, 1);
    } else {
      this.selectedNodes.push(this.hoveredNode);
      if (this.selectedNodes.length > 2) {
        this.selectedNodes.shift();
      }
    }
    this.draw();
  }

  reset() {
    this.selectedNodes = [];
    this.draw();
  }
}

// Initialize on pages that have the tree canvas
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tree-canvas');
  if (canvas) {
    window.treeExplorer = new TreeExplorer('tree-canvas', 'tree-info');
    const resetBtn = document.getElementById('tree-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => window.treeExplorer.reset());
    }
  }
});
