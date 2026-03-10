

## Diagnóstico do Erro

O problema está na **URL do stream salva no banco de dados**. Olhando os logs e a requisição de rede:

```
stream_url: "https://stm3.xcast.com.br:9946,1"
```

O sufixo **`,1`** é uma convenção antiga do SHOUTcast v1 para forçar o navegador a baixar o stream em vez de mostrar a página de status. Porém, o elemento `<audio>` do HTML5 **não entende essa sintaxe** — ele trata `,1` como parte da URL e a requisição falha.

Por isso o console mostra o ciclo infinito:
```
Direct stream loaded — https://stm3.xcast.com.br:9946,1
Direct stream error — will retry in 10s
Direct stream retry — reassigning source
Direct stream error — will retry in 10s
(repete infinitamente)
```

## Correção Necessária

**Duas ações paralelas:**

1. **No banco de dados** — Corrigir as 4 URLs das estações, removendo o `,1`. A URL correta é:
   ```
   https://stm3.xcast.com.br:9946/
   ```
   Ou, se o servidor exigir um mount point específico (como `/stream` ou `/;`), usar esse. A barra final `/` geralmente funciona para Icecast/Xcast.

2. **No código do AudioEngine** — Adicionar sanitização automática para remover `,1` de URLs SHOUTcast, evitando que o problema se repita caso alguém cole a URL com esse sufixo no painel admin. Lógica:
   ```
   url = url.replace(/,\d+$/, '/');
   ```

Isso resolve o erro imediatamente e previne recorrência.

