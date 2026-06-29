/**
 * San Soluções e Negócios - JavaScript do Formulário de Contato (contato.js)
 * ===========================================================================
 * Validação completa do formulário via JavaScript puro (sem bibliotecas).
 *
 * Validações implementadas:
 *  - Nome: obrigatório, mínimo 3 caracteres
 *  - E-mail: obrigatório, formato válido (regex RFC5322 simplificado)
 *  - Telefone: opcional, formato brasileiro se preenchido
 *  - Assunto: seleção obrigatória
 *  - Mensagem: obrigatória, mínimo 10 e máximo 500 caracteres
 *  - LGPD: checkbox obrigatório
 *
 * Feedback visual:
 *  - Bordas verde/vermelho nos campos
 *  - Mensagem de erro embaixo de cada campo
 *  - Contador de caracteres no textarea
 *  - Mensagem global de sucesso/erro após envio
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Referências ao DOM ─────────────────────────────── */
  const form       = document.getElementById('contact-form');
  if (!form) return; // segurança: só executa na página de contato

  const fields = {
    nome:      document.getElementById('nome'),
    email:     document.getElementById('email'),
    telefone:  document.getElementById('telefone'),
    assunto:   document.getElementById('assunto'),
    mensagem:  document.getElementById('mensagem'),
    lgpd:      document.getElementById('lgpd'),
  };

  const errors = {
    nome:      document.getElementById('erro-nome'),
    email:     document.getElementById('erro-email'),
    telefone:  document.getElementById('erro-telefone'),
    assunto:   document.getElementById('erro-assunto'),
    mensagem:  document.getElementById('erro-mensagem'),
    lgpd:      document.getElementById('erro-lgpd'),
  };

  const charCount  = document.getElementById('erro-mensagem-count');
  const feedback   = document.getElementById('form-feedback');
  const btnSubmit  = document.getElementById('btn-submit');
  const btnText    = btnSubmit?.querySelector('.btn-text');
  const btnLoading = btnSubmit?.querySelector('.btn-loading');

  /* ── Regras de validação ────────────────────────────── */
  const RULES = {
    nome: (v) => {
      if (!v.trim()) return 'Por favor, informe seu nome completo.';
      if (v.trim().length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Por favor, informe seu e-mail.';
      // Regex para formato básico de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(v.trim())) return 'Por favor, informe um e-mail válido.';
      return '';
    },
    telefone: (v) => {
      if (!v.trim()) return ''; // opcional
      // Aceita formatos: (00) 00000-0000 ou (00) 0000-0000 ou variantes
      const telRegex = /^[\d\s\(\)\-\+]{8,20}$/;
      if (!telRegex.test(v.trim())) return 'Formato de telefone inválido.';
      return '';
    },
    assunto: (v) => {
      if (!v) return 'Por favor, selecione um assunto.';
      return '';
    },
    mensagem: (v) => {
      if (!v.trim()) return 'Por favor, escreva sua mensagem.';
      if (v.trim().length < 10) return 'A mensagem deve ter pelo menos 10 caracteres.';
      if (v.trim().length > 500) return 'A mensagem não pode ultrapassar 500 caracteres.';
      return '';
    },
    lgpd: (_, el) => {
      if (!el.checked) return 'Você precisa concordar com o uso dos dados para continuar.';
      return '';
    },
  };

  /* ── Funções de utilidade ───────────────────────────── */

  /**
   * Exibe ou limpa o erro de um campo específico.
   * @param {string} fieldName - nome do campo
   * @param {string} message   - mensagem de erro (vazio = sem erro)
   */
  const setFieldError = (fieldName, message) => {
    const input  = fields[fieldName];
    const errEl  = errors[fieldName];
    if (!input || !errEl) return;

    errEl.textContent = message;

    if (message) {
      // Erro: borda vermelha
      input.classList.add('input-error');
      input.classList.remove('input-success');
      input.setAttribute('aria-invalid', 'true');
    } else {
      // Sem erro: borda verde (campo preenchido) ou neutra (vazio)
      input.classList.remove('input-error');
      if (input.value.trim() || (input.type === 'checkbox' && input.checked)) {
        input.classList.add('input-success');
      }
      input.setAttribute('aria-invalid', 'false');
    }
  };

  /**
   * Valida um único campo e atualiza o feedback visual.
   * @param {string} fieldName
   * @returns {boolean} true se válido
   */
  const validateField = (fieldName) => {
    const input = fields[fieldName];
    if (!input) return true;

    const value   = input.type === 'checkbox' ? input.value : input.value;
    const rule    = RULES[fieldName];
    const message = rule ? rule(value, input) : '';

    setFieldError(fieldName, message);
    return message === '';
  };

  /**
   * Valida todos os campos e retorna se o formulário é válido.
   * @returns {boolean}
   */
  const validateAll = () => {
    const results = Object.keys(RULES).map((name) => validateField(name));
    return results.every(Boolean);
  };

  /* ── Contador de caracteres (textarea) ─────────────── */
  const MAX_CHARS = 500;

  if (fields.mensagem && charCount) {
    fields.mensagem.addEventListener('input', () => {
      const len = fields.mensagem.value.length;
      charCount.textContent = `${len} / ${MAX_CHARS}`;

      // Feedback visual de limite
      charCount.classList.remove('limit-near', 'limit-reached');
      if (len > MAX_CHARS) {
        charCount.classList.add('limit-reached');
      } else if (len > MAX_CHARS * 0.8) {
        charCount.classList.add('limit-near');
      }
    });
  }

  /* ── Validação em tempo real (blur) ─────────────────── */
  // Valida cada campo quando o usuário sai dele (blur)
  Object.keys(fields).forEach((name) => {
    const input = fields[name];
    if (!input) return;

    input.addEventListener('blur', () => validateField(name));

    // Para checkbox: valida ao mudar
    if (input.type === 'checkbox') {
      input.addEventListener('change', () => validateField(name));
    }

    // Para campos de texto: remove erro ao começar a digitar
    if (input.type !== 'checkbox') {
      input.addEventListener('input', () => {
        if (input.classList.contains('input-error')) {
          validateField(name);
        }
      });
    }
  });

  /* ── Máscara de telefone (opcional) ─────────────────── */
  if (fields.telefone) {
    fields.telefone.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, ''); // remove não-dígitos
      if (v.length > 11) v = v.slice(0, 11);

      // Formata: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
      if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }

      e.target.value = v.trim().replace(/-$/, '');
    });
  }

  /* ── Envio do formulário ─────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // previne envio padrão

    // Esconde feedback anterior
    if (feedback) {
      feedback.hidden = true;
      feedback.className = 'form-feedback';
    }

    // Valida todos os campos
    const isValid = validateAll();

    if (!isValid) {
      // Foca no primeiro campo com erro
      const firstError = form.querySelector('.input-error');
      if (firstError) firstError.focus();
      return;
    }

    /* ── Simula envio (substitua por fetch() real se houver backend) ── */
    // Em produção, você faria:
    //   const formData = new FormData(form);
    //   await fetch('/api/contato', { method: 'POST', body: formData });

    // Estado de carregamento
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;
    if (btnSubmit) btnSubmit.disabled = true;

    // Simulação de delay de rede (2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Monta o link de mailto como fallback para abrir o cliente de e-mail
    const nome     = fields.nome.value.trim();
    const emailVal = fields.email.value.trim();
    const assunto  = fields.assunto.options[fields.assunto.selectedIndex].text;
    const mensagem = fields.mensagem.value.trim();

    const subject  = encodeURIComponent(`[Site] ${assunto} - ${nome}`);
    const body     = encodeURIComponent(
      `Nome: ${nome}\nE-mail: ${emailVal}\nAssunto: ${assunto}\n\nMensagem:\n${mensagem}`
    );

    window.location.href = `mailto:santossan2210@gmail.com?subject=${subject}&body=${body}`;

    // Exibe mensagem de sucesso
    if (feedback) {
      feedback.textContent = '✅ Mensagem preparada! Seu cliente de e-mail será aberto para confirmar o envio.';
      feedback.className   = 'form-feedback feedback-success';
      feedback.hidden      = false;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Restaura botão
    if (btnText) btnText.hidden = false;
    if (btnLoading) btnLoading.hidden = true;
    if (btnSubmit) btnSubmit.disabled = false;

    // Limpa formulário e estados visuais após sucesso
    form.reset();
    Object.keys(fields).forEach((name) => {
      const input = fields[name];
      if (input) {
        input.classList.remove('input-success', 'input-error');
      }
    });

    if (charCount) charCount.textContent = `0 / ${MAX_CHARS}`;
  });

});
