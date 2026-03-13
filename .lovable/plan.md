

## Plano: Estética Premium — Reduzir Repetição do "Ao Vivo"

### Problema
"Ao Vivo" aparece em 4 lugares: badge vermelho no hero, título h1, info da track, e seção "Ao Vivo Agora" abaixo. Isso polui visualmente.

### Mudanças

**1. Hero — Badge minimalista integrado ao título**
- Remover o badge vermelho grande (`bg-red-600/90` com texto "Ao Vivo")
- Adicionar um pequeno indicador inline ao lado do h1: um ponto pulsante verde/vermelho + texto "LIVE" em caps bem pequeno, integrado na mesma linha do nome do programa
- O h1 passa a mostrar o nome do programa ou da estação (nunca "Ao Vivo" como texto principal)
- Se não houver programa no ar, mostrar o nome da estação (env.label ou "Rádio TVG")

**2. Seção "Ao Vivo Agora" → "Tocando Agora"**
- Mudar o título de "Ao Vivo Agora" para "Tocando Agora"
- Em vez de repetir o nome do programa + host, mostrar as informações da música/track atual (`currentTrack.title` e `currentTrack.artist`)
- Manter o card com ícone e botão play, mas adaptar o conteúdo para a música

**3. Info abaixo do player**
- A área de track info no hero (`currentTrack.title` / `currentTrack.artist`) pode ser simplificada ou removida, já que essa info passará para a seção "Tocando Agora" abaixo

### Arquivos afetados
- `src/pages/AudioTab.tsx` — todas as mudanças concentradas aqui

### Resultado visual esperado
```text
┌─────────────────────────┐
│      [logo header]      │
├─────────────────────────┤
│    bg ambiente blur      │
│                          │
│  Manhã Sertaneja ● LIVE │
│    com Fulano            │
│    descrição             │
│                          │
│  |||  [ ▶ ]  |||        │
│                          │
│  🔊 ────●────           │
├─────────────────────────┤
│  TOCANDO AGORA          │
│  🎧 Nome da Música      │
│     Artista    [ ▶ ]    │
├─────────────────────────┤
│  [anúncio]              │
│  ...                    │
└─────────────────────────┘
```

