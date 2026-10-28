import './style.css';
import { createClient } from '@supabase/supabase-js';

const app = document.querySelector('#app');
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('SEU-PROJETO') && !supabaseAnonKey.includes('SUA_CHAVE'));
const supabase = configured ? createClient(supabaseUrl, supabaseAnonKey) : null;

function authScreen(mode = 'login', note = '') {
  const register = mode === 'register';
  app.innerHTML = `
    <main class="auth-shell">
      <header class="topbar">
        <div class="brandmark">↻</div>
        <div class="brand">REPOST CLEANER <span>BETA</span></div>
      </header>
      <section class="auth-card">
        <p class="eyebrow">SUA CONTA · SEU PAINEL</p>
        <h1>${register ? 'Crie sua conta.' : 'Bom ter você aqui.'}</h1>
        <p class="lede">${register ? 'Cadastre-se para acessar seu painel pessoal.' : 'Entre para acessar seu painel pessoal.'}</p>
        ${!configured ? '<div class="notice warning"><b>Configuração necessária</b><br>Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel. Veja o README.</div>' : ''}
        <form id="authForm">
          ${register ? '<label for="name">Nome (opcional)</label><input id="name" name="name" autocomplete="name" placeholder="Como podemos te chamar?">' : ''}
          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required>
          <label for="password">Senha</label>
          <div class="password-wrap">
            <input id="password" name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="8" placeholder="${register ? 'Mínimo de 8 caracteres' : 'Digite sua senha'}" required>
            <button class="password-toggle" id="togglePassword" type="button" aria-label="Mostrar senha" aria-pressed="false">Mostrar</button>
          </div>
          ${!register ? '<button class="forgot-button" id="forgotPassword" type="button">Esqueci minha senha</button>' : ''}
          <button class="primary" type="submit" ${!configured ? 'disabled' : ''}>${register ? 'Criar conta' : 'Entrar'} <span>→</span></button>
        </form>
        <p class="form-message" id="formMessage" role="status">${escapeHtml(note)}</p>
        <button class="text-button" id="switchMode">${register ? 'Já tem uma conta? Entrar' : 'Ainda não tem conta? Criar conta'}</button>
        <p class="micro">Este login é apenas do Repost Cleaner. Nunca informe sua senha do TikTok aqui.</p>
      </section>
      <footer>Projeto independente · Não afiliado ao TikTok</footer>
    </main>`;
  document.querySelector('#switchMode').addEventListener('click', () => authScreen(register ? 'login' : 'register'));
  const passwordInput = document.querySelector('#password');
  const togglePassword = document.querySelector('#togglePassword');
  togglePassword.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    togglePassword.textContent = show ? 'Ocultar' : 'Mostrar';
    togglePassword.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    togglePassword.setAttribute('aria-pressed', String(show));
  });
  const forgotPassword = document.querySelector('#forgotPassword');
  if (forgotPassword) forgotPassword.addEventListener('click', async () => {
    const email = document.querySelector('#email').value.trim();
    const message = document.querySelector('#formMessage');
    if (!email) {
      message.textContent = 'Digite seu e-mail acima para receber o link de recuperação.';
      document.querySelector('#email').focus();
      return;
    }
    forgotPassword.disabled = true;
    message.textContent = 'Enviando solicitação…';
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      message.textContent = 'Se houver uma conta com esse e-mail, você receberá instruções de recuperação.';
    } catch (error) {
      message.textContent = friendlyError(error.message);
    } finally {
      forgotPassword.disabled = false;
    }
  });
  document.querySelector('#authForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const message = document.querySelector('#formMessage');
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    if (!configured) return;
    submit.disabled = true;
    message.textContent = register ? 'Criando conta…' : 'Entrando…';
    try {
      if (register) {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: String(form.get('name') || '').trim() } }
        });
        if (error) throw error;
        if (data.session) await renderDashboard(data.session.user);
        else authScreen('login', 'Cadastro iniciado. Confira seu e-mail para confirmar a conta e depois entre.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await renderDashboard(data.user);
      }
    } catch (error) {
      message.textContent = friendlyError(error.message);
      submit.disabled = false;
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function friendlyError(message) {
  if (/Invalid login credentials|invalid_credentials/i.test(message)) return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  if (/Email not confirmed|email_not_confirmed/i.test(message)) return 'Confirme seu e-mail pelo link enviado quando criou a conta. Confira também a caixa de spam.';
  if (/rate limit|too many requests/i.test(message)) return 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.';
  if (/already registered/i.test(message)) return 'Este e-mail já possui cadastro. Tente entrar.';
  if (/Password should be at least/i.test(message)) return 'Use uma senha com pelo menos 8 caracteres.';
  return `Não foi possível concluir: ${message}`;
}

async function renderDashboard(user) {
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'usuário';
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brandmark">↻</div>
        <div class="brand">REPOST CLEANER <span>BETA</span></div>
        <button class="small-button" id="logout">Sair</button>
      </header>
      <section class="hero">
        <p class="eyebrow">PAINEL PESSOAL</p>
        <h1>Olá, <em>${escapeHtml(displayName)}.</em></h1>
        <p class="lede">Sua conta está conectada ao Repost Cleaner. O acesso ao TikTok é uma etapa separada.</p>
      </section>
      <section class="panel">
        <div class="panel-head"><div><h2>Sua conta</h2><p>${escapeHtml(user.email || '')}</p></div><span class="status">Conta ativa</span></div>
        <div class="notice"><b>Conectar TikTok</b><br>Por segurança, não digite sua senha do TikTok neste site. A conexão precisa ser feita por um fluxo oficial autorizado. Esta versão ainda não conecta nem remove reposts automaticamente.</div>
        <a class="primary" href="https://www.tiktok.com/login" target="_blank" rel="noopener noreferrer">Abrir login oficial do TikTok <span>↗</span></a>
        <div class="metrics">
          <div class="metric"><span>Removidas nesta sessão</span><strong id="removed">0</strong></div>
          <div class="metric"><span>Falhas / ignoradas</span><strong id="skipped">0</strong></div>
        </div>
        <div class="progress-label"><span>Progresso da sessão</span><strong id="progressText">0%</strong></div>
        <div class="progress"><div id="progressBar"></div></div>
        <div class="actions"><button class="secondary" id="reset">Zerar contador</button><button class="secondary" id="guide">Como funciona</button></div>
        <p class="micro" id="message">Os contadores são demonstrativos e não representam ações reais no TikTok.</p>
      </section>
      <footer>Projeto independente · Não afiliado ao TikTok · Não coletamos senha do TikTok</footer>
    </main>
    <dialog id="help"><button class="close" id="closeHelp" aria-label="Fechar">×</button><p class="eyebrow">STATUS DO PROJETO</p><h2>O que já funciona?</h2><p>O cadastro, login, sessão e logout usam Supabase Auth. O painel de remoção é apenas visual por enquanto. Antes de automatizar ações, precisamos confirmar uma integração autorizada e testar o comportamento com segurança.</p><button class="primary" id="closeHelp2">Entendi</button></dialog>`;
  document.querySelector('#logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    authScreen('login', 'Você saiu da sua conta.');
  });
  const help = document.querySelector('#help');
  document.querySelector('#guide').addEventListener('click', () => help.showModal());
  document.querySelector('#closeHelp').addEventListener('click', () => help.close());
  document.querySelector('#closeHelp2').addEventListener('click', () => help.close());
  document.querySelector('#reset').addEventListener('click', () => {
    document.querySelector('#removed').textContent = '0';
    document.querySelector('#skipped').textContent = '0';
    document.querySelector('#progressText').textContent = '0%';
    document.querySelector('#progressBar').style.width = '0%';
    document.querySelector('#message').textContent = 'Contadores reiniciados. Nenhuma ação foi executada no TikTok.';
  });
}

async function initializeApp() {
  if (!configured) {
    authScreen();
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') return;
    if (session?.user) {
      void renderDashboard(session.user);
    } else if (event === 'SIGNED_OUT') {
      authScreen('login', 'Você saiu da sua conta.');
    }
  });

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.user) await renderDashboard(data.session.user);
    else authScreen('login');
  } catch (error) {
    console.error('Erro ao iniciar a sessão:', error);
    authScreen('login', 'Não foi possível verificar sua sessão. Atualize a página e tente novamente.');
  }
}

void initializeApp();
