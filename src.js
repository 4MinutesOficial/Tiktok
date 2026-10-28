
import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div class="brandmark">↻</div>
      <div class="brand">
        REPOST CLEANER <span>BETA</span>
      </div>
      <div class="local-pill">
        <i></i> LOCAL
      </div>
    </header>

    <section class="hero">
      <p class="eyebrow">FERRAMENTA PESSOAL · TIKTOK</p>
      <h1>Seu perfil.<br><em>Mais organizado.</em></h1>
      <p class="lede">
        Organize suas republicações e acompanhe
        o progresso da limpeza em um só lugar.
      </p>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Sessão de limpeza</h2>
          <p>Entre na sua conta pelo site oficial.</p>
        </div>
        <span class="status" id="status">Aguardando</span>
      </div>

      <div class="notice">
        <b>Login seguro</b><br>
        O login acontece diretamente no TikTok.
        Este site não recebe sua senha nem seus cookies.
      </div>

      <a
        class="primary"
        href="https://www.tiktok.com/login"
        target="_blank"
        rel="noopener noreferrer"
      >
        Entrar com TikTok <span>↗</span>
      </a>

      <button class="secondary full" id="loginHelp">
        Já fiz login
      </button>

      <div class="metrics">
        <div class="metric">
          <span>Republicações removidas</span>
          <strong id="removed">0</strong>
        </div>
        <div class="metric">
          <span>Falhas / ignoradas</span>
          <strong id="skipped">0</strong>
        </div>
      </div>

      <div class="progress-label">
        <span>Progresso da sessão</span>
        <strong id="progressText">0%</strong>
      </div>

      <div class="progress">
        <div id="progressBar"></div>
      </div>

      <div class="actions">
        <button class="secondary" id="reset">
          Zerar contador
        </button>
        <button class="secondary" id="guide">
          Como funciona
        </button>
      </div>

      <p class="micro" id="message">
        Nenhuma remoção foi executada. O login, por si só,
        não conecta a conta à automação.
      </p>
    </section>

    <section class="steps">
      <h2>Como usar</h2>

      <div class="step">
        <b>01</b>
        <div>
          <strong>Entre no TikTok</strong>
          <p>
            Toque em “Entrar com TikTok” e faça login
            diretamente no site oficial.
          </p>
        </div>
      </div>

      <div class="step">
        <b>02</b>
        <div>
          <strong>Abra suas republicações</strong>
          <p>
            No TikTok, acesse seu perfil e a aba
            de republicações, se disponível.
          </p>
        </div>
      </div>

      <div class="step">
        <b>03</b>
        <div>
          <strong>Prepare a automação</strong>
          <p>
            Será necessário um mecanismo compatível com
            o navegador para remover republicações.
          </p>
        </div>
      </div>
    </section>

    <footer>
      Projeto independente · Não afiliado ao TikTok
    </footer>

    <dialog id="help">
      <button class="close" id="closeHelp"
        aria-label="Fechar">×</button>

      <p class="eyebrow">INFORMAÇÕES</p>
      <h2>Sobre a automação</h2>

      <p>
        O botão de login abre o TikTok oficial em outra aba.
        Por segurança do navegador, este site não consegue
        detectar automaticamente se você entrou na conta.
      </p>

      <p>
        O contador é apenas visual nesta versão.
        Para remover republicações de verdade, ainda precisamos
        integrar uma automação local compatível com o TikTok Web.
      </p>

      <button class="primary" id="closeHelp2">
        Entendi
      </button>
    </dialog>
  </main>
`;

const removed = document.querySelector('#removed');
const skipped = document.querySelector('#skipped');
const progressText = document.querySelector('#progressText');
const progressBar = document.querySelector('#progressBar');
const status = document.querySelector('#status');
const message = document.querySelector('#message');
const help = document.querySelector('#help');

document.querySelector('#loginHelp').addEventListener('click', () => {
  status.textContent = 'Verifique o TikTok';
  message.textContent =
    'Confira a outra aba. Se você entrou, volte para esta página. ' +
    'O site não consegue confirmar seu login automaticamente.';
});

document.querySelector('#reset').addEventListener('click', () => {
  removed.textContent = '0';
  skipped.textContent = '0';
  progressText.textContent = '0%';
  progressBar.style.width = '0%';
  status.textContent = 'Aguardando';
  message.textContent =
    'Contador zerado. Nenhuma ação foi executada no TikTok.';
});

document.querySelector('#guide').addEventListener('click', () => {
  help.showModal();
});

document.querySelector('#closeHelp').addEventListener('click', () => {
  help.close();
});

document.querySelector('#closeHelp2').addEventListener('click', () => {
  help.close();
});
