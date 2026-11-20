    }

    // Botão de disparo mobile
    const fireBtn = document.getElementById('l1-fire-btn');
    if (fireBtn) {
      fireBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.state === 'playing') {
          this.fireLaser();
        }
      });
    }
  }

  start() {
    this.resize();
    this.score = 0;
    this.lives = this.config.initialLives;
    this.lasers = [];
    this.cupids = [];
    this.particles = [];
    this.spawnTimer = 0.2;
    this.state = 'playing';

    this.ship.x = this.width * 0.5;
    this.ship.y = this.height * 0.8;
    this.ship.targetX = this.ship.x;
    this.ship.targetY = this.ship.y;

    this.startOverlay?.classList.remove('active');
    this.endOverlay?.classList.remove('active');
    this.updateHUD();

    // Spawn inicial imediato para ação rápida
    this.spawnCupid();
    this.spawnCupid();

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lastFrameTime = performance.now();
    this.loop(this.lastFrameTime);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  fireLaser(aimX = null, aimY = null) {
    const now = performance.now();
    if (now - this.lastFireTime < this.config.fireCooldownMs) return;
    this.lastFireTime = now;

    this.ship.recoil = 6;
    window.margotAudio?.playLaser();

    let vx = 0;
    let vy = -560;

    if (aimX !== null && aimY !== null && aimY < this.ship.y - 20) {
      const angle = Math.atan2(aimY - this.ship.y, aimX - this.ship.x);
      vx = Math.cos(angle) * 580;
      vy = Math.sin(angle) * 580;
    }

    this.lasers.push({
      x: this.ship.x,
      y: this.ship.y - 16,
      vx,
      vy,
      radius: 4
    });
  }

  spawnCupid() {
    const progressRatio = this.score / this.config.targetScore;
    const speedBase = 55 + progressRatio * 68;
    const margin = 36;
    const x = margin + Math.random() * (this.width - margin * 2);

    this.cupids.push({
      x,
      y: -30,
      vx: (Math.random() - 0.5) * 48,
      vy: speedBase + Math.random() * 28,
      radius: 21,
      wingPhase: Math.random() * Math.PI * 2,
      swayAmp: 18 + Math.random() * 22,
      swayFreq: 1.6 + Math.random() * 1.2,
      age: 0,
      hitFlash: 0
    });
  }

  spawnBurst(x, y, color = '#e2c07d', count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 45 + Math.random() * 130;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.55 + Math.random() * 0.35,
        maxLife: 0.9,
        size: 1.8 + Math.random() * 2.5,
        color
      });
    }
  }

  update(dt) {
    // Estrelas de fundo
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    }

    // Movimento da nave (Teclado + Touchpad + Suavização para toque direto)
    const speed = 310;
    let moveX = 0;
    let moveY = 0;

    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY += 1;

    if (this.touchJoystick.active) {
      moveX += this.touchJoystick.dx;
      moveY += this.touchJoystick.dy;
    }

    if (moveX !== 0 || moveY !== 0) {
      this.ship.x += moveX * speed * dt;
      this.ship.y += moveY * speed * dt;
      this.ship.targetX = this.ship.x;
      this.ship.targetY = this.ship.y;
    } else {
      this.ship.x += (this.ship.targetX - this.ship.x) * Math.min(1, dt * 10);
      this.ship.y += (this.ship.targetY - this.ship.y) * Math.min(1, dt * 10);
    }

    this.ship.x = Math.max(24, Math.min(this.width - 24, this.ship.x));
    this.ship.y = Math.max(this.height * 0.32, Math.min(this.height - 24, this.ship.y));
    this.ship.recoil = Math.max(0, this.ship.recoil - dt * 28);

    // Spawn progressivo de cupidos
    const difficulty = this.score / this.config.targetScore;
    const spawnInterval = Math.max(0.72, 1.65 - difficulty * 0.8);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.cupids.length < 6) {
      this.spawnCupid();
      this.spawnTimer = spawnInterval;
    }

    // Atualizar disparos
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += l.vx * dt;
      l.y += l.vy * dt;
      if (l.y < -20 || l.x < -20 || l.x > this.width + 20) {
        this.lasers.splice(i, 1);
      }
    }

    // Atualizar cupidos e colisões
        ctx.lineWidth = 1;
    const step = 44;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    // Estrelas
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(241, 245, 249, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mira tática (estilo Among Us)
    if (this.crosshair.active && this.state === 'playing') {
      ctx.strokeStyle = 'rgba(226, 192, 125, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(this.crosshair.x, this.crosshair.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Lasers
    for (const l of this.lasers) {
      ctx.save();
      ctx.strokeStyle = '#7dd3fc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y + 8);
      ctx.lineTo(l.x - l.vx * 0.02, l.y - l.vy * 0.02);
      ctx.stroke();
      ctx.restore();
    }

    // Cupidos
    for (const c of this.cupids) {
      this.drawCupid(c);
    }

    // Partículas
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Nave
    this.drawShip();
  }

  renderStaticBackdrop() {
    this.render();
  }

  loop(timestamp) {
    if (this.state !== 'playing') return;
    const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    this.update(dt);
    this.render();

    if (this.state === 'playing') {
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  updateHUD() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.progressEl) {
      const pct = Math.min(100, (this.score / this.config.targetScore) * 100);
      this.progressEl.style.width = `${pct}%`;
    }
    if (this.waveEl) {
      const sector = this.score < 4 ? 'SETOR 01 · ÓRBITA CALMA' : this.score < 8 ? 'SETOR 02 · FLUXO INTENSO' : 'SETOR 03 · CONVERGÊNCIA';
      this.waveEl.textContent = sector;
    }
    if (this.livesEl) {
      const spans = this.livesEl.querySelectorAll('span');
      spans.forEach((span, idx) => {
        span.classList.toggle('lost', idx >= this.lives);
      });
    }
  }

  finishGame(won) {
    this.state = won ? 'won' : 'lost';
    this.stop();

    if (won) {
      this.endEyebrow.textContent = 'ÓRBITA ESTABILIZADA';
      this.endTitle.textContent = 'Passagem Desbloqueada';
      this.endDesc.textContent = `Você interceptou os ${this.config.targetScore} cupidos e abriu o caminho para o Interlúdio Literário.`;
      if (this.nextBtn) this.nextBtn.style.display = 'inline-flex';
      this.onVictoryCallback(this.score);
    } else {
      this.endEyebrow.textContent = 'ESCUDO SOBRECARREGADO';
      this.endTitle.textContent = 'Os Cupidos Atravessaram';
      this.endDesc.textContent = `Você atingiu ${this.score} de ${this.config.targetScore} alvos. Recarregue os propulsores e tente novamente.`;
      if (this.nextBtn) this.nextBtn.style.display = 'none';
    }

    this.endOverlay?.classList.add('active');
  }
}

window.CupidArcadeGame = CupidArcadeGame;
