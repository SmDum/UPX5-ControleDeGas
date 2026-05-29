# gas-app

Aplicativo Expo React Native para controle de gás.

## Visão geral

Este projeto é um app criado com Expo e Expo Router, usando React Native 0.81.5 e React 19.1.0. O código principal está em `app/`, com roteamento baseado em arquivos.

## Pré-requisitos

- Node.js instalado (recomendado 18+)
- npm
- Expo CLI não é obrigatório para rodar via `npx`, mas pode ser instalado globalmente
- Emulador Android / iOS ou dispositivo físico para testar

## Instalação

No terminal, entre na pasta do app e instale as dependências:

```bash
cd c:\Users\Pichau\Desktop\UPX5-ControleDeGas\gas-app
npm install
```

## Como rodar

### Iniciar o projeto

```bash
npm run start
```

### Abrir em Android

```bash
npm run android
```

### Abrir em iOS

```bash
npm run ios
```

### Abrir na web

```bash
npm run web
```

## Scripts úteis

- `npm run start` — inicia o servidor Expo
- `npm run android` — abre no Android (emulador ou dispositivo)
- `npm run ios` — abre no iOS Simulator
- `npm run web` — roda no navegador
- `npm run lint` — executa o lint do Expo
- `npm run reset-project` — reseta o projeto para o padrão de inicialização

## Estrutura do projeto

- `app/` — principais telas e rotas do Expo Router
- `components/` — componentes reutilizáveis
- `assets/` — imagens e recursos estáticos
- `scripts/` — utilitários do projeto
- `package.json` — dependências e scripts

## Dependências principais

- `expo`
- `expo-router`
- `react`
- `react-native`
- `mqtt`

## Observações

- Se for usar em dispositivo físico, abra o QR code do Expo Go ou configure um build de desenvolvimento.
- Para desenvolvimento web, use `npm run web`.

## Links úteis

- Expo: https://expo.dev
- Expo Router: https://docs.expo.dev/router/introduction/
