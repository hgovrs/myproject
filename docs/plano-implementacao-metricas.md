# Plano de Implementação de Métricas — App de Relacionamento

> Status: proposta inicial. Documento vivo — atualizar conforme decisões de stack e evolução do produto.
> Última atualização: 2026-09-08

## Situação atual

Não existe nenhuma métrica implementada no app. Verificação do repositório:

- Único commit inicial, contendo apenas o `README.md`
- Nenhum código-fonte, nenhum manifesto de dependências (`package.json`, `pubspec.yaml`, `build.gradle`)
- Nenhum SDK de analytics, backend ou schema de banco

Não há framework de analytics escolhido, nada instrumentado e nada para migrar. É um campo limpo — a melhor hora possível para definir a instrumentação, antes de escrever a primeira feature de likes/matches.

---

## 1. Pesquisa externa: qual framework escolher

### Comparativo (preços verificados nas docs oficiais, 2026)

| Ferramenta | Tier gratuito | Custo após o free | Observação crítica |
|---|---|---|---|
| **Google Analytics for Firebase** | Eventos **ilimitados e gratuitos** | $0 no Analytics. Só paga se exportar para BigQuery (plano Blaze) | Limites *estruturais*: **500 nomes de eventos distintos/projeto** (permanente, não reseta), **25 parâmetros por evento**, **500 nomes de parâmetros/projeto**, **25 user properties/projeto** |
| **PostHog** | **1M eventos/mês** | $0,00005/evento (1–2M), caindo até $0,000009/evento acima de 250M | Sem cobrança por assento; feature flags e A/B inclusos (metered à parte) |
| **Amplitude** | **2M eventos/mês** | A partir de ~$49/mês | Free mais generoso em volume, mas conta pode ser bloqueada se estourar o limite 3x |
| **Mixpanel** | **1M eventos/mês** | Planos pagos por volume | Ao estourar, **bloqueia o acesso aos relatórios** em vez de cobrar overage |
| **BigQuery** (data warehouse) | — | **~$5/TiB processado** + **~$0,02/GB/mês** de armazenamento | Projetos novos (pós-set/2025) têm cap padrão de 200 TiB/dia |

### Recomendação: arquitetura híbrida em 2 camadas

**Camada 1 — Firebase Analytics (SDK no app).** Custo zero em qualquer volume, integra nativamente com Crashlytics, Remote Config (essencial para as feature flags do plano de retenção) e Cloud Messaging (push). É a espinha dorsal para métricas de produto no cliente.

**Camada 2 — Banco de dados próprio como fonte da verdade para métricas de negócio.** Likes, matches e taxa de match **não** devem ser calculados a partir de eventos de analytics. São dados transacionais que já vivem no banco (Postgres/Firestore). Analytics é para comportamento e funil; o banco é para contagem exata. Isso evita duplicar custo e elimina discrepância de números.

**Por que não Amplitude/Mixpanel agora:** para um app pré-lançamento, o volume não justifica o risco de bloqueio de conta ou de relatórios ao estourar o free. Se no futuro precisar de análise exploratória mais rica, o PostHog é o melhor upgrade (free 1M + preço por evento transparente e decrescente, sem taxa por assento).

### Riscos a mitigar desde o dia 1 (Firebase)

- Os 500 nomes de eventos são um recurso **finito e permanente**. Nunca gerar nomes dinâmicos (ex.: `like_user_12345`) — isso queima o projeto. Usar nome fixo + parâmetro.
- Os 25 user properties também são um orçamento fixo. Reservar slots conscientemente.

---

## 2. Métricas essenciais (fase 1 — as mais simples)

### A. Usuários

- Novos cadastros por dia
- DAU / WAU / MAU
- Razão DAU/MAU (stickiness)
- Retenção D1, D7, D30 por coorte de cadastro
- Usuários que completaram o onboarding (perfil com foto + bio)

### B. Likes

- Total de likes dados por dia
- Likes por usuário ativo por dia (média e mediana — a mediana é a que importa, a média é distorcida pelos power users)
- Likes recebidos por usuário (para medir desequilíbrio de oferta/demanda)
- Taxa de like: likes ÷ (likes + passes)

### C. Matches

- Total de matches por dia
- **Taxa de match = matches ÷ likes dados** (métrica-chave de saúde do marketplace)
- Usuários com ≥1 match (%) — o indicador que mais correlaciona com retenção
- Tempo até o primeiro match (mediana), por gênero
- Matches que viraram conversa (%)

### D. Percentuais / saúde

- % de usuários que atingem o limite diário de likes
- % de resgate do desbloqueio diário (aba Ranking)
- % de churn D7
- % de opt-out de notificação

### Segmentações mínimas

Toda métrica deve ser quebrável por: gênero, plataforma (iOS/Android), coorte de cadastro (semana) e status (free/premium).

---

## 3. Dicionário de eventos (nomes fixos, snake_case)

**Ciclo de vida:** `sign_up`, `login`, `onboarding_step_completed`, `profile_completed`, `photo_uploaded`

**Núcleo do produto:** `swipe` (parâmetro `direction`: like/pass/superlike), `match_created`, `conversation_started`, `message_sent`, `profile_viewed`

**Retenção / monetização:** `like_limit_reached`, `like_limit_reset`, `daily_unlock_available`, `daily_unlock_redeemed`, `daily_match_viewed`, `paywall_viewed`, `subscription_started`

**Notificações:** `notification_received`, `notification_opened`, `notification_optout`

**Regras:** nunca colocar dados pessoais (nome, e-mail, foto, localização exata) em parâmetros de evento — apenas IDs internos pseudonimizados.

**User properties** (orçamento de 25 — reservar no máximo ~8 agora): `gender`, `signup_cohort_week`, `subscription_status`, `has_match`, `profile_completeness_bucket`, `experiment_variant`.

---

## 4. Fases de execução

### Fase 0 — Fundação (antes de qualquer feature)

1. Definir a stack do app (mobile nativo / Flutter / React Native) — **pendente de decisão**
2. Criar projeto Firebase (dev/staging/prod separados — projetos distintos, para não queimar os 500 slots de evento com testes)
3. Instalar SDK do Firebase Analytics + Crashlytics
4. Criar um **módulo único de tracking** (wrapper) — nenhuma chamada direta ao SDK espalhada pelo código; assim trocar de ferramenta depois custa uma classe, não o app inteiro
5. Definir o dicionário de eventos em código como constantes/enum tipado (impede typos e nomes dinâmicos)

### Fase 1 — Métricas de negócio no backend

6. Modelar tabelas `users`, `likes`, `matches` com timestamps (isso já é a fonte das métricas — nenhum trabalho extra)
7. Criar views/queries agregadas diárias: usuários novos, DAU, likes/dia, matches/dia, taxa de match, % com ≥1 match
8. Job diário que materializa um snapshot dessas agregações (evita varrer tabelas grandes toda vez)

### Fase 2 — Instrumentação do cliente

9. Instrumentar eventos de ciclo de vida e do núcleo do produto
10. Definir user properties
11. Validar com DebugView do Firebase antes de subir para produção

### Fase 3 — Visualização

12. Dashboard simples com as métricas da seção 2 (Looker Studio conectado ao banco, gratuito; ou tela interna de admin)
13. Relatório diário automatizado (e-mail/Slack) com os ~8 números principais

### Fase 4 — Só quando houver volume real

14. Habilitar export para BigQuery (exige plano Blaze) apenas se precisar de análise SQL sobre eventos brutos
15. Avaliar PostHog se surgir necessidade de análise exploratória / funis avançados

---

## 5. Validação de custos

### Cenário realista de lançamento — 10.000 MAU, ~30 eventos/usuário/dia ≈ 9M eventos/mês

| Item | Custo mensal |
|---|---|
| Firebase Analytics | **$0** (eventos ilimitados, gratuitos) |
| Crashlytics | **$0** |
| Cloud Messaging (push) | **$0** |
| Remote Config (feature flags) | **$0** |
| Dashboard (Looker Studio) | **$0** |
| **Total analytics** | **$0** |

### Comparação se fosse feito em ferramenta paga, no mesmo volume

- PostHog: 1M grátis + 8M pagos ≈ **~$300/mês**
- Mixpanel / Amplitude: acima do free (1M / 2M) → plano pago obrigatório

### Se habilitar BigQuery export nesse volume

~9M eventos/mês geram poucos GB/mês → armazenamento ~$0,02/GB/mês (centavos) e consultas a $5/TiB processado. Na prática, de dezenas de centavos a poucos dólares por mês **desde que** as queries usem particionamento por data. Sem particionamento, cada consulta varre a tabela inteira e o custo explode — este é o único risco real de custo do plano.

### Guarda-rails de custo

- Manter o projeto no plano Spark (gratuito) até haver necessidade concreta de BigQuery
- Ao migrar para Blaze, configurar **orçamento e alerta de faturamento** no Google Cloud imediatamente
- Particionar por data e usar `SELECT` de colunas específicas (nunca `SELECT *`) em BigQuery
- Não logar eventos de alta frequência sem amostragem (ex.: scroll, cada frame de vídeo)

---

## 6. Conformidade (LGPD) — não opcional

- Tela de consentimento antes de inicializar o analytics; coleta desativada por padrão até o aceite
- Nenhum dado pessoal ou sensível (orientação sexual, localização precisa) em parâmetros de evento
- Suporte a exclusão de dados sob solicitação (Firebase oferece deleção por instance ID)
- Política de privacidade descrevendo o que é coletado, antes do lançamento na loja

---

## 7. Métricas de sucesso deste plano

Ao final da Fase 3, deve ser possível responder em menos de 1 minuto: quantos usuários novos ontem, DAU, quantos likes, quantos matches, qual a taxa de match e qual a retenção D7 da coorte da semana passada — com os números do banco batendo com os do Firebase dentro de uma margem de ~5%.

---

## 8. Próximo passo bloqueante

Definir a stack do app (Flutter, React Native ou nativo) e o backend/banco. Sem isso não é possível instalar o SDK nem modelar as tabelas. Definido isso, seguem as Fases 0 e 1 (módulo de tracking + dicionário de eventos + schema com as agregações).
