import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div class="brandmark">↻</div>
      <div class="brand">REPOST CLEANER <span>BETA</span></div>
      <div class="local-pill"><i></i> LOCAL</div>
    </header>

    <section class="hero">
      <p class="eyebrow">FERRAMENTA PESSOAL · TIKTOK</p>
      <h1>Seu perfil.<br><em>Mais organizado.</em></h1>
      <p class="lede">Um painel para acompanhar a remoção das suas republicações em sequência.</p>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div><h2>Sessão de limpeza</h2><p>Conecte pelo TikTok Web no navegador compatível.</p></div>
        <span class="status" id="status">Aguardando</span>
      </div>

      <div class="notice"><b>Antes de começar</b><br>Este painel não recebe sua senha e não consegue controlar o TikTok sozinho. A automação depende de um script local no navegador e pode parar se a interface do TikTok mudar.</div>

      <a class="primary" href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">Abrir TikTok Web <span>↗</span></a>

      <div class="metrics">
        <div class="metric"><span>Removidas nesta sessão</span><strong id="removed">0</strong></div>
        <div class="metric"><span>Falhas / ignoradas</span><strong id="skipped">0</strong></div>
      </div>

      <div class="progress-label"><span>Progresso da sessão</span><strong id="progressText">0%</strong></div>
      <div class="progress"><div id="progressBar"></div></div>

      <div class="actions">
        <button class="secondary" id="reset">Zerar contador</button>
        <button class="secondary" id="guide">Como ativar</button>
      </div>
      <p class="micro" id="message">Nenhuma automação está rodando. O contador começa nesta página e não representa ações reais até a integração local ser instalada.</p>
    </section>

    <section class="steps">
      <h2>Como usar no Android</h2>
      <div class="step"><b>01</b><div><strong>Use um navegador compatível</strong><p>O Chrome para Android não oferece suporte geral a extensões tradicionais. É necessário um navegador que aceite scripts de usuário.</p></div></div>
      <div class="step"><b>02</b><div><strong>Abra seu perfil no TikTok Web</strong><p>Entre diretamente no domínio oficial e vá até a aba de republicações.</p></div></div>
      <div class="step"><b>03</b><div><strong>Teste com poucas ações</strong><p>Confira cada resultado. Pare se os botões ou menus não corresponderem ao que aparece na tela.</p></div></div>
    </section>

    <footer>Projeto independente · Não afiliado ao TikTok · Sem coleta de credenciais</footer>
  </main>

  <dialog id="help">
    <button class="close" id="closeHelp" aria-label="Fechar">×</button>
    <p class="eyebrow">PRÓXIMA ETAPA</p>
    <h2>Ativar automação local</h2>
    <p>Uma página comum não pode clicar na interface de outro site. Para automatizar a remoção, precisamos instalar um script local em um navegador compatível. O TikTok não oferece uma API pública oficial para remover todas as republicações em lote.</p>
    <p>Não use ferramentas que peçam sua senha fora do TikTok. Teste com cuidado e respeite eventuais limites da plataforma.</p>
    <button class="primary" id="closeHelp2">Entendi</button>
  </dialog>
`;

const removed = document.querySelector('#removed');
const skipped = document.querySelector('#skipped');
const progressText = document.querySelector('#progressText');
const progressBar = document.querySelector('#progressBar');
const status = document.querySelector('#status');
const message = document.querySelector('#message');
const help = document.querySelector('#help');

document.querySelector('#reset').addEventListener('click', () => {
  removed.textContent = '0';
  skipped.textContent = '0';
  progressText.textContent = '0%';
  progressBar.style.width = '0%';
  status.textContent = 'Aguardando';
  message.textContent = 'Contador reiniciado. Nenhuma ação foi executada no TikTok.';
});
document.querySelector('#guide').addEventListener('click', () => help.showModal());
document.querySelector('#closeHelp').addEventListener('click', () => help.close());
document.querySelector('#closeHelp2').addEventListener('click', () => help.close());
