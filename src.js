
import './style.css';
import { createClient } from '@supabase/supabase-js';

const app = document.querySelector('#app');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('SEU-PROJETO') &&
  !supabaseAnonKey.includes('SUA_CHAVE')
);

const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let currentUserId = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function friendlyError(message) {
  if (/Invalid login credentials/i.test(message)) {
    return 'E-mail ou senha incorretos.';
  }

  if (/already registered/i.test(message)) {
    return 'Este e-mail já possui cadastro. Tente entrar.';
  }

  if (/Password should be at least/i.test(message)) {
    return 'Use uma senha com pelo menos 8 caracteres.';
  }

  if (/Email not confirmed/i.test(message)) {
    return 'Confirme seu e-mail antes de entrar.';
  }

  return `Não foi possível concluir: ${message}`;
}

function authScreen(mode = 'login', note = '') {
  const register = mode === 'register';

  currentUserId = null;

  app.innerHTML = `
    <main class="auth-shell">
      <header class="topbar">
        <div class="brandmark">↻</div>
        <div class="brand">
          REPOST CLEANER <span>BETA</span>
        </div>
      </header>

      <section class="auth-card">
        <p class="eyebrow">SUA CONTA · SEU PAINEL</p>

        <h1>
          ${register ? 'Crie sua conta.' : 'Bom ter você aqui.'}
        </h1>

        <p class="lede">
          ${
            register
              ? 'Cadastre-se para acessar seu painel pessoal.'
              : 'Entre para acessar seu painel pessoal.'
          }
        </p>

        ${
          !configured
            ? `
              <div class="notice warning">
                <b>Configuração necessária</b><br>
                Configure VITE_SUPABASE_URL e
                VITE_SUPABASE_ANON_KEY nas variáveis
                de ambiente da Vercel.
              </div>
            `
            : ''
        }

        <form id="authForm">
          ${
            register
              ? `
                <label for="name">Nome (opcional)</label>
                <input
                  id="name"
                  name="name"
                  autocomplete="name"
                  placeholder="Como podemos te chamar?"
                >
              `
              : ''
          }

          <label for="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="voce@exemplo.com"
            required
          >

          <label for="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="${
              register ? 'new-password' : 'current-password'
            }"
            minlength="8"
            placeholder="Mínimo de 8 caracteres"
            required
          >

          <button
            class="primary"
            type="submit"
            ${!configured ? 'disabled' : ''}
          >
            ${register ? 'Criar conta' : 'Entrar'}
            <span>→</span>
          </button>
        </form>

        <p
          class="form-message"
          id="formMessage"
          role="status"
          aria-live="polite"
        >${escapeHtml(note)}</p>

        <button class="text-button" id="switchMode">
          ${
            register
              ? 'Já tem uma conta? Entrar'
              : 'Ainda não tem conta? Criar conta'
          }
        </button>

        <p class="micro">
          Este login é apenas do Repost Cleaner.
          Nunca informe sua senha do TikTok aqui.
        </p>
      </section>

      <footer>
        Projeto independente · Não afiliado ao TikTok
      </footer>
    </main>
  `;

  document
    .querySelector('#switchMode')
    .addEventListener('click', () => {
      authScreen(register ? 'login' : 'register');
    });

  document
    .querySelector('#authForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();

      const formElement = event.currentTarget;
      const form = new FormData(formElement);

      const email = String(form.get('email') || '').trim();
      const password = String(form.get('password') || '');

      const message = document.querySelector('#formMessage');
      const submit = formElement.querySelector(
        'button[type="submit"]'
      );

      if (!configured) return;

      submit.disabled = true;
      message.textContent = register
        ? 'Criando conta…'
        : 'Entrando…';

      try {
        if (register) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: String(
                  form.get('name') || ''
                ).trim()
              }
            }
          });

          if (error) throw error;

          if (data.session && data.user) {
            await renderDashboard(data.user);
          } else {
            authScreen(
              'login',
              'Cadastro iniciado. Confira seu e-mail para confirmar a conta e depois entre.'
            );
          }
        } else {
          const { data, error } =
            await supabase.auth.signInWithPassword({
              email,
              password
            });

          if (error) throw error;

          if (data.user) {
            await renderDashboard(data.user);
          } else {
            authScreen(
              'login',
              'Não foi possível confirmar o acesso. Tente novamente.'
            );
          }
        }
      } catch (error) {
        const currentMessage =
          document.querySelector('#formMessage');

        if (currentMessage) {
          currentMessage.textContent =
            friendlyError(error.message || 'Erro desconhecido.');
        }

        const currentSubmit = document.querySelector(
          '#authForm button[type="submit"]'
        );

        if (currentSubmit) currentSubmit.disabled = false;
      }
    });
}

async function renderDashboard(user) {
  if (!user) {
    authScreen('login');
    return;
  }

  currentUserId = user.id;

  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'usuário';

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brandmark">↻</div>

        <div class="brand">
          REPOST CLEANER <span>BETA</span>
        </div>

        <button class="small-button" id="logout">
          Sair
        </button>
      </header>

      <section class="hero">
        <p class="eyebrow">PAINEL PESSOAL</p>

        <h1>
          Olá, <em>${escapeHtml(displayName)}.</em>
        </h1>

        <p class="lede">
          Sua conta está conectada ao Repost Cleaner.
          O acesso ao TikTok é uma etapa separada.
        </p>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Sua conta</h2>
            <p>${escapeHtml(user.email || '')}</p>
          </div>

          <span class="status">Conta ativa</span>
        </div>

        <div class="notice">
          <b>Conectar TikTok</b><br>
          Não informe sua senha do TikTok neste site.
          A conexão precisa de um fluxo oficial autorizado.
          Esta versão ainda não conecta nem remove reposts
          automaticamente.
        </div>

        <a
          class="primary"
          href="https://www.tiktok.com/login"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir login oficial do TikTok
          <span>↗</span>
        </a>

        <div class="metrics">
          <div class="metric">
            <span>Removidas nesta sessão</span>
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
          Os contadores são demonstrativos e não representam
          ações reais no TikTok.
        </p>
      </section>

      <footer>
        Projeto independente · Não afiliado ao TikTok
        · Não coletamos senha do TikTok
      </footer>
    </main>

    <dialog id="help">
      <button
        class="close"
        id="closeHelp"
        aria-label="Fechar"
      >×</button>

      <p class="eyebrow">STATUS DO PROJETO</p>
      <h2>O que já funciona?</h2>

      <p>
        O cadastro, login, sessão e logout usam Supabase Auth.
        O painel de remoção é apenas visual por enquanto.
        Antes de automatizar ações, precisamos confirmar
        uma integração autorizada e testar o comportamento
        com segurança.
      </p>

      <button class="primary" id="closeHelp2">
        Entendi
      </button>
    </dialog>
  `;

  document
    .querySelector('#logout')
    .addEventListener('click', async () => {
      const button = document.querySelector('#logout');
      button.disabled = true;

      const { error } = await supabase.auth.signOut();

      if (error) {
        button.disabled = false;
        alert('Não foi possível sair. Tente novamente.');
        return;
      }

      currentUserId = null;
      authScreen('login', 'Você saiu da sua conta.');
    });

  const help = document.querySelector('#help');

  document
    .querySelector('#guide')
    .addEventListener('click', () => help.showModal());

  document
    .querySelector('#closeHelp')
    .addEventListener('click', () => help.close());

  document
    .querySelector('#closeHelp2')
    .addEventListener('click', () => help.close());

  document
    .querySelector('#reset')
    .addEventListener('click', () => {
      document.querySelector('#removed').textContent = '0';
      document.querySelector('#skipped').textContent = '0';
      document.querySelector('#progressText').textContent = '0%';
      document.querySelector('#progressBar').style.width = '0%';

      document.querySelector('#message').textContent =
        'Contadores reiniciados. Nenhuma ação foi executada no TikTok.';
    });
}

// Inicialização sem top-level await.
// Isso corrige o erro de compilação mostrado no log da Vercel.
async function initializeApp() {
  if (!configured) {
    authScreen();
    return;
  }

  // Registra mudanças de autenticação.
  supabase.auth.onAuthStateChange((event, session) => {
    // A sessão inicial será verificada abaixo.
    if (event === 'INITIAL_SESSION') return;

    if (session?.user) {
      // Evita redesenhar o painel para a mesma conta.
      if (currentUserId !== session.user.id) {
        void renderDashboard(session.user);
      }
    } else {
      currentUserId = null;

      if (event === 'SIGNED_OUT') {
        authScreen('login', 'Você saiu da sua conta.');
      }
    }
  });

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (data.session?.user) {
      await renderDashboard(data.session.user);
    } else {
      authScreen('login');
    }
  } catch (error) {
    console.error('Erro ao iniciar a sessão:', error);

    authScreen(
      'login',
      'Não foi possível verificar sua sessão. Atualize a página e tente novamente.'
    );
  }
}

void initializeApp();
