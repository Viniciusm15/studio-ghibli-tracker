# Studio Ghibli Films Tracker 🎬

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MUI](https://img.shields.io/badge/Material_UI-5-purple.svg)](https://mui.com/)

Studio Ghibli Films Tracker - Acompanhe seus filmes favoritos do Studio Ghibli

**Uma aplicação web interativa** que permite explorar a filmografia completa do Studio Ghibli, marcar seus filmes assistidos e acompanhar seu progresso. Desenvolvido com Next.js e Material-UI, o projeto oferece uma experiência visual com tema escuro/claro, animações suaves e armazenamento local do seu progresso.

**Acesse a aplicação:** [https://studio-ghibli-tracker-murex.vercel.app](https://studio-ghibli-tracker-murex.vercel.app)

## ✨ Funcionalidades

### 🎬 Catálogo Completo
- Listagem de todos os filmes do Studio Ghibli com capas, títulos e informações básicas
- Cards interativos com efeitos visuais ao hover

### 🔍 Sistema de Busca Avançado
- Barra de pesquisa para filtrar filmes por título
- Filtros por status (Todos/Assistidos/Não assistidos)
- Ordenação por título (A-Z) ou data de lançamento

### 📊 Acompanhamento de Progresso
- Marcar filmes como assistidos/não assistidos
- Contador de progresso (X de Y filmes assistidos)
- Armazenamento local (localStorage) para salvar seu progresso

### 🎨 Experiência Visual
- Alternância entre tema claro e escuro
- Modal de detalhes expandidos com informações completas do filme
- Efeitos de gradiente e transições suaves
- Design totalmente responsivo para todos os dispositivos

### ⭐ Sistema de Avaliação
- Avalie filmes com notas de 0.5 a 5 estrelas
- Visualização rápida da sua avaliação nos cards dos filmes
- Filtro por avaliação (ordenação)
- Suas avaliações são salvas localmente

### 📱 Detalhes dos Filmes
- Modal dedicado com:
  - Sinopse completa
  - Informações detalhadas (diretor, produtor, duração, score)
  - Visualização em tela cheia responsiva

## 🛠 Tecnologias

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Components**: [Material-UI v5](https://mui.com/) (MUI)
- **API**: [Ghibli API](https://ghibliapi.vercel.app)
- **Estilização**: CSS-in-JS com sx prop
- **Gerenciamento de Estado**: React Hooks (useState, useEffect, useMemo)
- **Tipografia**: Fonte Inter personalizada
- **Efeitos Visuais**: Gradientes, sombras e transições CSS

## 🚀 Como Executar
```bash
git clone https://github.com/Viniciusm15/studio-ghibli-tracker.git
npm install
npm run dev
