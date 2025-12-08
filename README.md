# 📘 StudyHub

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

> Uma plataforma full-stack de estudos e simulados para estudantes.

O **StudyHub** é uma aplicação web que permite aos estudantes buscar questões de concursos, ENADE e provas específicas, criar simulados personalizados (manuais ou automáticos) e acompanhar seu desempenho. O foco do projeto foi criar uma experiência de usuário fluida (SPA) com um backend robusto e performático.

---

## 📸 Screenshots

<div style="display: flex; gap: 10px;">
  <img src="https://wnstxjzpdaunxiphcbrc.supabase.co/storage/v1/object/public/questoes-img/studyhub-home.png" alt="Tela principal" width="400">
  <img src="https://wnstxjzpdaunxiphcbrc.supabase.co/storage/v1/object/public/questoes-img/studyhub-questoes.png" alt="Questões" width="400">
</div>

---

## 🚀 Tecnologias Utilizadas

### Frontend (Client-side)
* **Angular 16+** (Standalone Components, Signals, Reactive Forms)
* **Bootstrap 5** (Layout responsivo e Grid System)
* **SweetAlert2** (Feedback visual e alertas elegantes)
* **Ngx-Markdown & Katex** (Renderização de enunciados complexos e fórmulas matemáticas)
* **RxJS** (Manipulação reativa de dados)

### Backend (Server-side)
* **Java 17 / 21**
* **Spring Boot 3**
* **Spring Security + JWT** (Autenticação e Autorização Stateless)
* **MongoDB** (Banco de dados NoSQL para flexibilidade dos documentos)
* **Maven** (Gerenciamento de dependências)

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação & Segurança
* Login e Cadastro de usuários.
* **JWT (JSON Web Token):** Sessão segura e stateless.
* **Auto-Logout Inteligente:** Interceptores verificam a expiração do token e deslogam o usuário automaticamente por inatividade ou token inválido.
* **Guards:** Proteção de rotas administrativas e privadas.

### 📚 Portal de Questões (Busca Avançada)
* **Filtros Dinâmicos:** Busca por Disciplina, Tópico, Instituição, Ano e Dificuldade.
* **Busca Textual (Regex):** Pesquisa inteligente que procura termos no enunciado, tópicos ou instituição, ignorando acentos e maiúsculas (*Case & Accent Insensitive*).
* **Renderização:** Suporte a Markdown e Imagens dentro das questões.

### 📝 Simulados
* **Criação Automática:** O usuário define os filtros e o sistema gera um simulado aleatório usando **MongoDB Aggregation Pipeline**.
* **Gerenciamento:** Editar nome, remover questões indesejadas ou excluir simulados.
* **Modo Vazio:** Criação de simulados vazios para população manual via Portal de Questões.
* **Resolução:** Interface limpa para responder as questões com feedback imediato.

### 🎨 UX/UI
* Design totalmente **Responsivo** (Mobile First).
* Feedback visual de carregamento (Skeleton/Spinners).
* Tratamento de erros amigável (Página 404, Toasts de Sucesso/Erro).
