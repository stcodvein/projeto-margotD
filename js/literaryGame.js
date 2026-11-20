/**
 * NÍVEL II — DESAFIO LITERÁRIO (3 FASES)
 * Jogo editorial de leitura, subtexto e interpretação poética.
 */
class LiteraryChallengeGame {
  constructor(options = {}) {
    this.phases = [
      {
        category: 'FRAGMENTO I · SUBTEXTO & TEMPO',
        excerpt: '“Não era a distância que nos separava, mas o medo de descobrir que o outro já havia aprendido a existir em outro idioma.”',
        question: 'Qual é o núcleo emocional sugerido por essa passagem?',
        options: [
          'A estranheza silenciosa que surge quando duas pessoas mudam em ritmos diferentes sem perceber.',
          'A dificuldade prática de aprender uma língua estrangeira durante uma viagem longa.',
          'O desejo de apagar todas as lembranças do passado para recomeçar sem história.'
        ],
        correctIndex: 0,
        explanation: 'A metáfora do “outro idioma” traduz o afastamento íntimo: não é geográfico, mas a transformação interior de cada um ao longo do tempo.'
      },
      {
        category: 'FRAGMENTO II · VOZ LITERÁRIA',
        excerpt: '“Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei. Não se preocupe em entender, viver ultrapassa qualquer entendimento.”',
        question: 'Essa célebre reflexão sobre entregar-se à experiência antes da razão pertence à escrita de:',
        options: [
          'Machado de Assis, em tom irônico sobre as convenções sociais do século XIX.',
          'Clarice Lispector, explorando a epifania e os limites da lógica diante da existência.',
          'Fernando Pessoa, através de seu heterônimo engenheiro Álvaro de Campos.'
        ],
        correctIndex: 1,
        explanation: 'Clarice Lispector frequentemente confronta a insuficiência do intelecto puro, convidando o leitor a experimentar o instante vivo antes de tentar explicá-lo.'
      },
      {
        category: 'FRAGMENTO III · SIMBOLISMO',
        excerpt: '“Guardava bilhetes não dobrados dentro de livros nunca devolvidos — como quem planta sementes em páginas que ninguém mais abriria.”',
        question: 'Na construção simbólica deste trecho, os livros funcionam como:',
        options: [
          'Um arquivo secreto de afetos preservados fora do alcance do tempo comum.',
          'Um sinal de descuido com objetos emprestados e falta de organização.',
          'Uma crítica à leitura solitária em comparação com conversas em voz alta.'
        ],
        correctIndex: 0,
        explanation: 'Ao unir “bilhetes não dobrados” e “sementes”, o texto transforma o livro em cápsula de memória íntima — protegida, silenciosa e viva.'
      }
    ];

    this.currentIndex = 0;
    this.correctCount = 0;
    this.answeredCurrent = false;

    this.stepIndicator = document.getElementById('l2-step-indicator');
    this.stepDots = document.getElementById('l2-step-dots');
    this.categoryTag = document.getElementById('l2-category-tag');
    this.scoreBadge = document.getElementById('l2-score-badge');
    this.excerptEl = document.getElementById('l2-excerpt');
    this.questionEl = document.getElementById('l2-question');
    this.optionsEl = document.getElementById('l2-options');
    this.feedbackBox = document.getElementById('l2-feedback');
    this.feedbackBadge = document.getElementById('l2-feedback-badge');
    this.feedbackText = document.getElementById('l2-feedback-text');
    this.nextBtn = document.getElementById('btn-l2-next-phase');
    this.nextLabel = document.getElementById('btn-l2-next-label');

    this.cardEl = document.getElementById('l2-card');
    this.completePanel = document.getElementById('l2-complete-panel');
    this.finalSummary = document.getElementById('l2-final-summary');

    this.onCompleteCallback = options.onComplete || (() => {});
    this.init();
  }

  init() {
    if (!this.cardEl) return;

    this.nextBtn?.addEventListener('click', () => this.advancePhase());
    document.getElementById('btn-l2-restart')?.addEventListener('click', () => this.reset());

    this.renderPhase();
  }

  reset() {
    this.currentIndex = 0;
    this.correctCount = 0;
    this.answeredCurrent = false;
    this.cardEl?.classList.remove('hidden');
    this.completePanel?.classList.add('hidden');
    this.renderPhase();
  }

  renderPhase() {
    const phase = this.phases[this.currentIndex];
    this.answeredCurrent = false;

    if (this.stepIndicator) {
      this.stepIndicator.textContent = `FOLHA 0${this.currentIndex + 1} DE 0${this.phases.length}`;
    }
    if (this.categoryTag) this.categoryTag.textContent = phase.category;
    if (this.scoreBadge) this.scoreBadge.textContent = `ACERTOS: ${this.correctCount}/${this.phases.length}`;
    if (this.excerptEl) this.excerptEl.textContent = phase.excerpt;
    if (this.questionEl) this.questionEl.textContent = phase.question;

    // Atualizar indicadores de etapa
    if (this.stepDots) {
      const dots = this.stepDots.querySelectorAll('.step-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentIndex);
        dot.classList.toggle('done', idx < this.currentIndex);
      });
    }

    // Esconder feedback anterior
    this.feedbackBox?.classList.add('hidden');

    // Renderizar alternativas
    if (this.optionsEl) {
      this.optionsEl.innerHTML = '';
      const letters = ['A', 'B', 'C'];

      phase.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'literary-option-btn';
        btn.innerHTML = `
          <span class="option-letter">${letters[idx]}.</span>
          <span>${optText}</span>
        `;
        btn.addEventListener('click', () => this.selectOption(idx, btn));
        this.optionsEl.appendChild(btn);
      });
    }
  }

  selectOption(selectedIndex, selectedBtn) {
    if (this.answeredCurrent) return;
    this.answeredCurrent = true;

    const phase = this.phases[this.currentIndex];
    const isCorrect = selectedIndex === phase.correctIndex;
    const allBtns = this.optionsEl.querySelectorAll('.literary-option-btn');

    allBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === phase.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.correctCount += 1;
      window.margotAudio?.playChime(659.25, 0.35);
      this.feedbackBadge.textContent = 'LEITURA PRECISA';
      this.feedbackBadge.className = 'feedback-badge is-correct';
    } else {
      window.margotAudio?.playDamage();
      this.feedbackBadge.textContent = 'OUTRA PERSPECTIVA';
      this.feedbackBadge.className = 'feedback-badge is-wrong';
    }

    if (this.scoreBadge) {
      this.scoreBadge.textContent = `ACERTOS: ${this.correctCount}/${this.phases.length}`;
    }

    this.feedbackText.textContent = phase.explanation;
    this.nextLabel.textContent =
      this.currentIndex === this.phases.length - 1 ? 'CONCLUIR MANUSCRITO' : 'PRÓXIMA FOLHA';
    this.feedbackBox?.classList.remove('hidden');
  }

  advancePhase() {
    if (this.currentIndex < this.phases.length - 1) {
      this.currentIndex += 1;
      this.renderPhase();
    } else {
      this.cardEl?.classList.add('hidden');
      this.completePanel?.classList.remove('hidden');
      if (this.finalSummary) {
        this.finalSummary.textContent = `Você concluiu as 3 leituras do arquivo violeta com ${this.correctCount} de ${this.phases.length} interpretações exatas.`;
      }
      this.onCompleteCallback(this.correctCount);
    }
  }
}

window.LiteraryChallengeGame = LiteraryChallengeGame;
