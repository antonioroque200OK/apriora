---
name: ship
description: Commita as mudanças, envia para uma branch remota, abre PR, aguarda os checks de CI, corrige o que falhar (até um limite de tentativas) e mergeia assim que tudo passar. Use quando o usuário pedir para "subir", "commitar e mergear", "abrir PR e mergear", ou descrever o fluxo commit → push → PR → CI → fix → merge.
---

# ship

Fluxo ponta a ponta para levar mudanças locais até `main`/`staging` (ou outra branch
protegida) passando por PR e CI, com correção automática de falhas de CI.

`main` e `staging` são protegidas: exigem os 5 checks (`Format`, `Lint`, `Typecheck`,
`Test`, `Build`) verdes, não aceitam push direto nem force-push, e `enforce_admins`
está ativo (nem admin pula os checks). Todo merge passa por PR.

## Passos

1. **Revisar o que vai ser commitado**
   - `git status` e `git diff` (staged + unstaged) para confirmar o escopo.
   - Se houver mudanças não relacionadas ao pedido do usuário, não incluí-las — pergunte
     antes de misturar escopos no mesmo commit.
   - Exceção: mudanças cosméticas/documentais que não afetam o comportamento da
     aplicação (docs, skills, comentários, config sem impacto em build/runtime) podem
     ser agrupadas num único commit/PR mesmo que toquem arquivos diferentes, em vez de
     um PR por arquivo — o custo de um PR (branch, checks, merge) não se paga para
     esse tipo de mudança. Na dúvida se algo é "cosmético" (ex.: mexe em código de
     `apps/*` ou `packages/*` que roda em produção), tratar como não-cosmético e não
     agrupar.

2. **Commitar**
   - Seguir as convenções já descritas no `CLAUDE.md`/system prompt (mensagem objetiva
     focada no "porquê", `Co-Authored-By`, nunca `--no-verify`, nunca `git add -A`).
   - Nunca fazer `--amend` a menos que pedido explicitamente.

3. **Garantir uma branch de trabalho (não tentar push direto em branch protegida)**
   - Se a branch atual for `main`/`staging` (ou qualquer branch protegida), criar uma
     branch nova a partir do HEAD atual, com nome descritivo
     (`fix/<resumo>`, `feat/<resumo>`, `chore/<resumo>`, `sync/<resumo>`).
   - Se já estiver numa branch de feature, reutilizá-la.
   - A branch **base** do PR é a branch de onde essa branch de trabalho foi criada
     (normalmente `staging`; use `main` só se o usuário estava partindo dela). Se houver
     ambiguidade sobre qual branch deve receber o PR, perguntar antes de abrir.

4. **Push**
   - `git push -u origin <branch>`.
   - Se o push for rejeitado por proteção de branch, isso confirma que o passo 3 foi
     pulado — criar a branch e repetir.

5. **Abrir o PR**
   - `gh pr create --base <branch-base> --head <branch> --title "..." --body "..."`
     com resumo do que mudou e por quê (não é necessário checklist de test plan manual
     quando o merge será automático via CI).
   - Reportar o link do PR ao usuário.

6. **Aguardar os checks de CI**
   - `gh pr checks <numero> --watch --interval 15` (ou polling equivalente) até todos os
     checks obrigatórios saírem de `pending`.
   - Não seguir em frente enquanto houver check `pending`.
   - Não colar o log bruto de cada refresh do `--watch` na resposta ao usuário — deixar
     rodar em background/silenciosamente e só reportar o resultado final (passou/falhou
     e quais checks), não o histórico de polling.

7. **Se algum check falhar — corrigir, até 3 tentativas**
   - Ler o log do job que falhou (`gh run view <run-id> --job <job-id> --log` ou
     `--log-failed`) para identificar a causa raiz.
   - Corrigir a causa raiz no código — nunca "corrigir" desabilitando/pulando o teste,
     relaxando uma regra de lint, ou adicionando `--no-verify`/flags de bypass.
   - Rodar a checagem equivalente localmente antes de commitar de novo (ex.: `biome
     check`, `tsc --noEmit`, `pnpm test`) para não gastar um ciclo de CI à toa.
   - Commitar a correção, push, e voltar ao passo 6.
   - Se após 3 tentativas os checks continuarem falhando, **parar** e relatar ao usuário
     o diagnóstico e o que foi tentado, em vez de continuar tentando indefinidamente —
     especialmente se a falha exigir uma decisão de produto/arquitetura, não só um fix
     mecânico.

8. **Mergear assim que os checks passarem**
   - Confirmar `gh pr view <numero> --json mergeable,mergeStateStatus` como
     `MERGEABLE`/`CLEAN`.
   - `gh pr merge <numero> --merge --delete-branch` (usar o método de merge padrão do
     repo; não usar `--admin` para pular checks).
   - Merge é automático assim que os checks estão verdes — não é necessário pedir
     confirmação extra para essa etapa específica, pois é o comportamento explicitamente
     pedido pelo usuário para este fluxo.
   - Sincronizar a branch base local (`git checkout <base> && git pull`).

## Fora de escopo

- Não usar `git push --force`, `git reset --hard` na branch remota, nem apagar branches
  que não foram criadas por este próprio fluxo.
- Não fazer refactors ou mudanças não relacionadas ao que motivou o commit só porque
  "já está mexendo ali".
- Se o PR já existir para a branch, reutilizar em vez de criar um novo.
