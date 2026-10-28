# Aplicativo de roteiros de viagem — plano e comparação de IA

**Data da pesquisa:** 28/10/2026.

**Stack proposta:** Flutter + Firebase.

**Objetivo:** usar IA paga via API, com baixo custo por viagem e controle de consumo.

## 1. Resumo executivo e limites da pesquisa

Decisão: **Flutter Web + Firebase + backend autenticado + API de IA paga**. Comparar inicialmente modelos pequenos de OpenAI e Gemini, confirmar tarifas e escolher um único modelo após testes de qualidade e latência. Usar roteiros-base para reduzir geração e oferecer edição manual quando a IA estiver indisponível. Habilitar faturamento apenas com orçamento e limites definidos.

O repositório contém documentação de planejamento, sem aplicativo implementado. Este documento é um plano, não uma descrição de funcionalidades já implementadas.

**A comparação comercial ainda é parcial.** Foi possível consultar código e documentação em repositórios oficiais de Firebase, Google e Groq. As páginas comerciais do Google, DeepSeek e Groq não puderam ser recuperadas neste ambiente por falhas de DNS; consultas adicionais via busca e GitHub MCP expiraram.

Consequentemente:

- Os modelos e recursos identificados em repositórios têm fontes na seção 13.
- **Preços atuais, franquias e cotas numéricas dos provedores não foram confirmados.** Não usamos valores antigos como se fossem atuais.
- As simulações financeiras e de capacidade são **hipóteses de planejamento**, não ofertas comerciais.
- Links não recuperados são referências para validação, não evidências de conteúdo lido.
- Um nome presente em um exemplo não garante disponibilidade na API, estabilidade, gratuidade ou suporte no Firebase AI Logic.

### Política de custos

| Situação | O que podemos prometer |
|---|---|
| Franquias e créditos promocionais | Benefício eventual, não premissa do orçamento nem requisito para funcionar |
| Aplicativo público gratuito e ilimitado | Não é uma promessa viável |
| API paga de baixo custo | Despesa variável; exige orçamento, medição e proteção contra abuso |
| Infraestrutura e ferramentas externas | Custos separados dos tokens, incluindo backend, Firebase e consultas a outros serviços |

## 2. Produto e escopo do MVP

### Entrada do usuário

- País, cidades desejadas ou pedido de sugestão de destinos.
- Datas ou quantidade de dias, origem e número de viajantes.
- Orçamento, moeda e despesas incluídas: transporte, hospedagem, alimentação e atividades.
- Interesses, ritmo, mobilidade, acessibilidade e restrições.
- Preferência por hotel, hostel ou outra hospedagem.
- Lista de desejos e lugares que não deseja visitar.

“Bucket” é interpretado como orçamento (*budget*), mas também haverá uma lista de desejos (*bucket list*).

### Saída do aplicativo

- Roteiro organizado por dia e região, com duração e deslocamentos aproximados.
- Alternativas compatíveis com interesses e orçamento.
- Bairros e opções de hospedagem com links de consulta.
- Atrações e links oficiais para ingressos, quando verificados.
- Custos classificados como estimativa ou preço verificado, com moeda, fonte e data.
- Alertas de informação ausente, incerteza ou necessidade de reserva.

“Melhor” significa maior adequação aos critérios do usuário, não uma classificação universal nem garantia de menor preço.

### Edição por linguagem natural

Permitir adicionar/remover cidades e atrações, redistribuir dias, reduzir gastos e trocar atividades. Mostrar um resumo das mudanças antes de salvar, preservar itens obrigatórios e oferecer desfazer.

Se um pedido alterar a duração total, exigir gasto adicional ou contrariar uma restrição, solicitar confirmação ou esclarecimento.

### Fora da primeira versão

Compra dentro do aplicativo, pagamentos, reservas automáticas, tarifas e vagas em tempo real, busca mundial exaustiva, mapas pagos, agentes autônomos com navegação irrestrita e treinamento de modelo próprio.

Começar com poucos destinos e um catálogo revisado. A versão web responsiva evita inicialmente taxas de publicação das lojas; Android e iOS poderão aproveitar o projeto Flutter depois.

## 3. Comparação das opções de IA

| Opção | Gratuidade e custo | Integração proposta | Vantagens para o projeto | Restrições e decisão |
|---|---|---|---|---|
| **Gemini via Firebase AI Logic** | Uso pago condicionado ao provedor/modelo e faturamento; tarifas não verificadas | SDK oficial `firebase_ai` no Flutter [S1] | Integração alinhada à stack | Alternativa de integração; avaliar controles de consumo antes de substituir o backend |
| **Gemini via backend** | Tarifas do provedor + execução do backend | Flutter → backend autenticado → Gemini | Controle de orçamento por usuário, ferramentas e troca de provedor | Candidato inicial para a arquitetura escolhida |
| **OpenAI via backend** | Tarifas fornecidas pelo usuário ainda não verificadas oficialmente | Backend com chave protegida → API | Candidato para alterações estruturadas e chamadas de ferramentas | Comparar com Gemini antes de selecionar o modelo |
| **DeepSeek API** | Não foi possível confirmar franquia permanente nem tarifas de entrada/cache/saída | Backend com chave protegida → API | Candidato a comparar em custo e qualidade de português | Não presumir que o chat gratuito torne a API gratuita; decisão pendente de preços e benchmark |
| **Groq API** | Cookbook anuncia obtenção gratuita de chave, não uma capacidade gratuita específica [S12] | Backend com chave protegida → API | Alternativa hospedada para experimentar modelos abertos | Cotas, modelos elegíveis, políticas e preço pagos não verificados |

### 3.1 Gemini: qual modelo escolher?

O cookbook oficial consultado menciona **Gemini 3.5 Flash-Lite, Gemini 3.8 Flash e Gemini 4 Argon** [S2]. Esses nomes são registros da fonte consultada, não uma recomendação automática de versão.

Ordem de avaliação:

1. Modelo de texto Flash-Lite estável, caso disponível e elegível: candidato para extração de preferências e alterações simples.
2. Modelo de texto Flash estável: candidato para geração e reorganização de roteiros.
3. Modelo de raciocínio maior: somente se o teste demonstrar benefício que justifique seu custo.

Para simplicidade, **começar com um único modelo**. Usar dois modelos ou roteamento por complexidade apenas depois de medir ganho real. Não assumir que o modelo mais novo ou maior seja o melhor custo-benefício.

Confirmar modelo exato, status estável/preview, região, limite de contexto, saída máxima, suporte do SDK, saída estruturada e eventuais tokens de raciocínio faturáveis. Evitar atrelar o aplicativo a aliases sem acompanhar mudanças e descontinuações.

### 3.2 DeepSeek: API comercial

Separar aplicação de chat e API hospedada: gratuidade e política de dados de um produto não se transferem ao outro.

Na API, confirmar:

- IDs dos modelos de conversa e raciocínio atualmente oferecidos.
- Preço por milhão de tokens de entrada com cache hit, entrada com cache miss e saída.
- Como tokens de raciocínio são contabilizados.
- Contexto máximo, saída máxima, concorrência, timeouts e política de filas.
- Compatibilidade efetiva com chamadas de ferramentas e saída estruturada.
- Créditos promocionais, expiração, pagamento, retenção e uso dos dados.

A interface compatível com OpenAI, quando oferecida, facilita adaptação, mas não garante equivalência de comportamento entre provedores. Testar cada adaptação.

### 3.3 Groq e outras alternativas

O SDK oficial do Groq inclui exemplos/referências a `openai/gpt-oss-20b`, `llama-3.1-8b-instant` e `llama-3.3-70b-versatile` [S13, S14]. É necessário confirmar quais continuam disponíveis e quais têm acesso gratuito.

Gateways de múltiplos provedores e endpoints comunitários podem facilitar testes, mas acrescentam dependência, possíveis mudanças de modelo, política de dados adicional e disponibilidade variável. Não serão a base do MVP sem uma avaliação própria de termos, cotas e custos.

## 4. Cotas, franquias e custos: o que falta confirmar

**Não existe nesta pesquisa uma tabela de preços comerciais atuais validada.** Esta é a ficha a preencher antes de aprovar um provedor:

| Serviço | Preços necessários | Limites necessários | Situação |
|---|---|---|---|
| Gemini Developer API | Entrada, saída, raciocínio, cache, armazenamento de cache e busca/grounding, conforme recurso | RPM, TPM, RPD, contexto, saída e camada do projeto | Pendente [P1, P2] |
| OpenAI API | Entrada, cache, saída, raciocínio e ferramentas conforme modelo | Limites por projeto/modelo, contexto e saída | Tarifas fornecidas não verificadas; ver seção 15 |
| Firebase AI Logic | Cobrança do modelo/provedor e comportamento com Spark/Blaze | Limites do serviço e por usuário, suporte ao modelo escolhido | Pendente [P3, P4] |
| DeepSeek API | Entrada cache hit/miss, saída e regras de cobrança | Concorrência, fila, timeout e limites publicados | Pendente [P7, P8] |
| Groq API | Tarifa por modelo e elegibilidade à oferta gratuita | RPM/RPD, TPM/TPD, contexto e saída por modelo | Pendente [P10, P11] |
| Firestore | Franquia de armazenamento, operações e transferência; excedentes se houver faturamento | Leituras, escritas, exclusões, tamanho de documentos e conexões | Pendente [P5, P6] |
| Hosting e Authentication | Armazenamento/tráfego, método de autenticação e eventuais serviços associados | Transferência, usuários/operações e limites aplicáveis | Pendente [P5] |

### Como interpretar as cotas

- **RPM/RPD:** requisições por minuto/dia.
- **TPM/TPD:** tokens por minuto/dia; confirmar quais tipos de tokens entram no cálculo de cada serviço.
- Limites podem valer por projeto, organização, modelo, região ou usuário. Criar várias chaves não significa ganhar nova cota.
- Janela de contexto e limite de saída são restrições diferentes de limite de tráfego.
- Gratuidade não implica SLA, capacidade reservada nem uso ilimitado.
- Cache só reduz custo quando as regras do provedor forem atendidas; não pressupor acerto de cache em conversas diferentes.
- Grounding/busca pode ter faturamento e cotas próprios, mesmo quando a geração de texto é gratuita.

### Exemplo hipotético de capacidade

Suponha uma franquia de **100 requisições/dia**, 6 chamadas por viagem e reserva operacional de 20%. Isso sustentaria aproximadamente `100 × 0,8 ÷ 6 = 13` viagens completas/dia, antes dos limites de tokens e picos.

**Esses números não são a cota de nenhum provedor.** Servem para dimensionar o piloto depois de obter os limites reais no console.

Medir também o pico por minuto. Cem usuários enviando uma mensagem ao mesmo tempo podem atingir RPM mesmo com consumo diário baixo.

## 5. Simulações de custo de API

### Hipótese de uso por viagem

| Operação | Quantidade | Entrada por chamada | Saída por chamada |
|---|---:|---:|---:|
| Geração inicial | 1 | 4.000 tokens | 3.000 tokens |
| Ajustes por conversa | 5 | 2.000 tokens | 500 tokens |
| **Total** | **6** | **14.000 tokens** | **5.500 tokens** |

Estimativa própria. Prompts, catálogo, histórico, raciocínio, reparos de respostas inválidas e tentativas adicionais podem aumentar esses totais.

Sem cache: `custo = (tokens de entrada × preço de entrada + tokens de saída × preço de saída) ÷ 1.000.000`.

Com cache: separar entrada hit e miss, aplicar cada tarifa e acrescentar armazenamento de cache quando cobrado. Incluir raciocínio conforme a regra de faturamento, sem contabilizá-lo duas vezes.

### Cenários ilustrativos — NÃO são preços de Gemini, DeepSeek ou Groq

Tarifas em USD por milhão de tokens:

| Cenário hipotético | Entrada | Saída | 1 viagem | 100 viagens | 1.000 viagens |
|---|---:|---:|---:|---:|---:|
| A | US$ 0,10 | US$ 0,40 | US$ 0,0036 | US$ 0,36 | US$ 3,60 |
| B | US$ 0,50 | US$ 2,00 | US$ 0,018 | US$ 1,80 | US$ 18,00 |
| C | US$ 2,00 | US$ 10,00 | US$ 0,083 | US$ 8,30 | US$ 83,00 |

Não incluem busca, mapas, backend, Firebase, rede, impostos, conversão cambial ou assinatura mínima. Uma API barata por token pode não ser a opção mais barata por **roteiro aceito**, caso exija muitas correções.

Converter para reais somente com câmbio e encargos da data de pagamento. Não fixar promessa de mensalidade com base nestas simulações.

## 6. Seleção da API paga

1. Confirmar modelos disponíveis, tarifas oficiais, termos de dados e limites da conta.
2. Comparar um modelo pequeno de OpenAI e um Gemini com os mesmos casos de roteiro em português.
3. Medir latência, validade das alterações estruturadas, chamadas extras e custo por viagem aceita.
4. Escolher um único modelo inicial e definir limites de tokens, concorrência, tentativas e orçamento.
5. Avaliar DeepSeek e outros provedores apenas se houver benefício comprovado; não ativar troca automática de provedor sem validar custo e tratamento de dados.

Franquias gratuitas podem reduzir despesas, mas não são necessárias para a arquitetura escolhida. As tarifas informadas na seção 15 continuam pendentes de confirmação oficial.

## 7. Implementação com Flutter e Firebase

### Alternativa de integração — Gemini via Firebase AI Logic

Fluxo: **Flutter → Firebase AI Logic → Gemini Developer API**, condicionado ao modelo pago, plano e controles disponíveis. Esta é uma alternativa à arquitetura principal via backend, não a premissa do MVP.

- Usar o SDK oficial `firebase_ai`, cuja existência e finalidade foram verificadas [S1].
- Firebase Authentication para identificar usuário e Firestore para viagens.
- Preferir login por e-mail/provedor suportado; evitar SMS no escopo inicial.
- Ativar App Check e regras de acesso por proprietário.
- Manter catálogo pequeno no aplicativo ou no Firestore, observando custos de leituras.
- Usar Hosting para web e links externos para mapas e reservas.
- Confirmar os requisitos de faturamento e orçamento dos serviços antes da ativação.
- Ao atingir cotas, oferecer edição manual e informar indisponibilidade.

**Spark não torna automaticamente qualquer modelo gratuito.** A integração, o provedor, o modelo e o estado do faturamento precisam ser conferidos. Não substituir Gemini Developer API por Vertex AI sem reavaliar cobrança.

A chave secreta de um provedor não deve ir para o Flutter, assets, configuração pública ou Remote Config. A configuração pública normal do Firebase é diferente de uma chave secreta de API; ela também não substitui regras de segurança.

App Check reduz abuso, mas não constitui autorização nem garantia de teto financeiro. Controles apenas no cliente podem ser contornados.

### Arquitetura principal — backend com API paga

Fluxo: **Flutter → backend autenticado → API paga do provedor escolhido**. O adaptador permite comparar OpenAI, Gemini e outras APIs sem acoplar o app a um fornecedor.

- Backend valida identidade, propriedade da viagem e limites por usuário.
- Chaves armazenadas em mecanismo seguro do servidor, nunca distribuídas ao cliente.
- Firestore mantém dados do usuário; o modelo recebe somente o contexto necessário.
- Adaptadores traduzem um contrato comum de geração/edição, sem acoplar a interface a um provedor.
- Backend limita concorrência, tokens, tentativas e orçamento; registra uso sem conteúdo pessoal desnecessário.
- Cloud Functions/Cloud Run são opções a avaliar com faturamento explícito, não promessas de Spark gratuito.

Firebase AI Logic não deve ser tratado como gateway genérico para OpenAI, DeepSeek ou Groq.

Alertas de orçamento não são um bloqueio automático de gastos. Mesmo um bloqueio próprio exige margem para requisições já em andamento e atraso de contabilização. Nunca ativar fallback pago silencioso.

## 8. Como a IA vai gerar e alterar o roteiro

### Geração inicial

1. Validar destino, datas, orçamento e preferências; perguntar quando faltar algo essencial.
2. Buscar candidatos em catálogo/fontes permitidas e normalizar IDs, coordenadas, preços e fontes.
3. Aplicar filtros objetivos antes da IA: localização, restrições, orçamento e disponibilidade conhecida.
4. Enviar apenas candidatos relevantes e pedir resposta estruturada.
5. Validar estrutura e referências: a IA só pode citar IDs/links permitidos, sem inventar estabelecimentos.
6. Verificar duração, sobreposição, deslocamentos e orçamento por regras determinísticas.
7. Apresentar roteiro e incertezas antes de salvar.

### Edição conversacional

- O roteiro estruturado é a fonte de verdade; o histórico de chat não substitui os dados.
- Interpretar intenção e gerar uma proposta de alterações: adicionar, remover, mover ou substituir.
- Validar cidades, datas, itens obrigatórios, IDs e propriedade dos dados.
- Mostrar diferença antes/depois; obter confirmação para aplicar.
- Salvar revisão e oferecer desfazer; usar controle de versão para evitar sobrescrever edições concorrentes.
- Limitar tentativas de reparo de resposta inválida; falhar de forma clara em vez de repetir indefinidamente.

Guardar moeda e valores monetários com precisão definida, datas/fusos do destino, fontes e data de verificação. Não apresentar estimativas como reservas confirmadas.

Dados sugeridos: usuários, viagens, preferências, dias/atividades, referências de lugares e revisões. Evitar um único documento crescente contendo toda a conversa e todas as revisões.

## 9. Dados turísticos, busca e informações confiáveis

LLM não é motor de busca nem banco de disponibilidade. RAG significa recuperar informações para fornecer ao modelo; não garante que elas estejam atualizadas.

Para o MVP:

- Catálogo revisado de poucos destinos, com páginas oficiais e coordenadas.
- Avaliar Wikidata, Wikipedia e dados OpenStreetMap, respeitando licenças e atribuição.
- Não tratar endpoints públicos de geocodificação ou mapas como serviços ilimitados.
- Regras/consulta simples antes de adotar banco vetorial e embeddings.
- Links de pesquisa de hospedagens em vez de preços/vagas inventados.
- Links oficiais de atrações para compra externa de ingressos.
- Sem scraping de plataformas de reservas ou cópia de conteúdo protegido.

Cada integração externa precisa confirmar termos, limites, custos, atualização e permissões de exibição. Grounding do Gemini, caso utilizado depois, exige avaliação separada de disponibilidade e cobrança [P1].

Conteúdo recuperado da web é dado não confiável: ignorar instruções embutidas, limitar ferramentas e domínios e não permitir que uma página altere regras do sistema. Links devem ser obtidos de fontes verificadas, não aceitos apenas por parecerem plausíveis.

## 10. Privacidade, segurança e controle de custos

- Minimizar dados enviados aos provedores; não enviar documentos, cartões, credenciais ou códigos de reserva.
- Evitar localização precisa quando cidade/bairro forem suficientes.
- Confirmar retenção, treinamento, localização do processamento e subprocessadores por serviço e plano [P9, P13, P14].
- Definir exclusão de conta/viagens, retenção de conversas e prazo de limpeza de logs e backups.
- Proteger Firestore por usuário; catálogo público não deve permitir escrita por clientes comuns.
- Não aceitar operações de gravação arbitrárias propostas pela IA.
- Não executar comandos, compras ou navegação irrestrita a partir do texto gerado.
- Limitar tamanho de entrada/saída, frequência, concorrência e tentativas com espera progressiva.
- Usar resumo de histórico e alterações incrementais para reduzir tokens.
- Não registrar prompts completos por padrão em analytics/logs.

## 11. Validação e critérios de decisão

Usar o mesmo conjunto de pelo menos 30 casos de viagem em português nos candidatos: orçamento apertado, múltiplas cidades, acessibilidade, atrações fechadas, remoção de cidade, conflito de datas, prompt malicioso e dados incompletos.

Medir:

- Aderência às preferências e preservação de itens obrigatórios.
- Validade estrutural, acerto de IDs e consistência das edições.
- Informações e links inventados, distinguindo geração de recuperação.
- Latência mediana/p95, tokens, falhas de cota e custo por roteiro aceito.
- Número de correções e avaliação humana da utilidade.
- Comportamento sob picos de concorrência e limites da API contratada.

Critérios iniciais propostos, não resultados já obtidos:

- Nenhum vazamento entre usuários ou ação não autorizada nos testes.
- Nenhum link inventado aceito pelo validador.
- Pelo menos 95% das respostas estruturadas válidas na primeira tentativa.
- Toda alteração destrutiva deve passar por confirmação e poder ser desfeita.
- Falha de IA/cota não deve impedir acesso e edição manual da viagem salva.

Não publicar ranking de qualidade antes do benchmark. A escolha deve considerar qualidade, integração, privacidade, custo total e disponibilidade, não só preço por token.

## 12. Etapas e decisão recomendada

1. **Validar a API paga:** conferir páginas/console pendentes, registrar tarifas e cotas, modelo exato e data; definir orçamento.
2. **Criar base Flutter/Firebase:** autenticação, regras, cadastro de viagem, roteiro e edição manual.
3. **Preparar catálogo inicial:** destinos limitados, IDs, coordenadas e fontes oficiais.
4. **Integrar o modelo escolhido via backend:** saída estruturada, validadores, consumo medido e tratamento de cota.
5. **Adicionar conversa:** propostas incrementais, confirmação, revisões e desfazer.
6. **Comparar alternativas:** mesmo benchmark para OpenAI/Gemini e, se necessário, DeepSeek/Groq, com credenciais e orçamento aprovados.
7. **Liberar piloto limitado:** observar consumo e erros antes de ampliar público.
8. **Revisar custos medidos:** ajustar limites e contexto antes de aumentar volume ou adotar outro modelo.

**Decisão:** usar IA paga via API e roteiros-base, escolhendo o provedor após validar preços, qualidade e latência. Não há vencedor financeiro confirmado.

Se a API estiver indisponível ou o limite de consumo for atingido, manter acesso aos roteiros salvos e edição manual. Não trocar para outro provedor nem ampliar orçamento silenciosamente.

### Pendências comerciais obrigatórias

- [ ] Recuperar preços e limites oficiais e registrar data, região, moeda e modelo.
- [ ] Verificar cotas efetivas do projeto no console, além dos limites publicados.
- [ ] Confirmar Spark/Blaze e se alguma integração exige faturamento.
- [ ] Validar termos de dados dos provedores e permissões das fontes turísticas.
- [ ] Substituir cenários hipotéticos por cálculo baseado em tarifas confirmadas.
- [ ] Executar benchmark e selecionar a API paga que atende à qualidade mínima e ao orçamento.

## 13. Fontes e rastreabilidade

### Fontes oficiais recuperadas nesta pesquisa

Consultadas em 28/10/2026. Links para branches são mutáveis; registrar commit/checkpoint exato quando a implementação selecionar versões.

- **[S1]** [Firebase AI Logic Flutter — README oficial](https://raw.githubusercontent.com/firebase/flutterfire/main/packages/firebase_ai/firebase_ai/README.md): SDK Flutter e acesso a modelos Gemini/Imagen.
- **[S2]** [Gemini API Cookbook — README oficial](https://raw.githubusercontent.com/google-gemini/cookbook/main/README.md): modelos mencionados e referências de integração; não comprova tarifas ou elegibilidade gratuita.
- **[S12]** [Groq Cookbook — obtenção gratuita de chave](https://raw.githubusercontent.com/groq/groq-api-cookbook/main/README.md).
- **[S13]** [Groq Python — exemplo de integração](https://raw.githubusercontent.com/groq/groq-python/main/README.md).
- **[S14]** [Groq Python — referências a modelos](https://raw.githubusercontent.com/groq/groq-python/main/src/groq/types/chat/completion_create_params.py).

### Referências oficiais pendentes de leitura/validação

Não recuperadas ou não validadas nesta sessão. Não sustentam preços/cotas atuais no documento.

- **[P1]** [Gemini API — preços](https://ai.google.dev/gemini-api/docs/pricing).
- **[P2]** [Gemini API — limites](https://ai.google.dev/gemini-api/docs/rate-limits).
- **[P3]** [Firebase AI Logic — preços](https://firebase.google.com/docs/ai-logic/pricing).
- **[P4]** [Firebase AI Logic — início com Flutter](https://firebase.google.com/docs/ai-logic/get-started?api=dev&platform=flutter).
- **[P5]** [Firebase — planos e preços](https://firebase.google.com/pricing).
- **[P6]** [Firestore — cotas](https://firebase.google.com/docs/firestore/quotas).
- **[P7]** [DeepSeek API — preços e modelos](https://api-docs.deepseek.com/quick_start/pricing).
- **[P8]** [DeepSeek API — limites](https://api-docs.deepseek.com/quick_start/rate_limit).
- **[P9]** [DeepSeek — política de privacidade](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html).
- **[P10]** [Groq — preços](https://groq.com/pricing).
- **[P11]** [Groq — limites](https://console.groq.com/docs/rate-limits).
- **[P13]** [Gemini API — termos](https://ai.google.dev/gemini-api/terms).
- **[P14]** [Groq — privacidade](https://groq.com/privacy-policy/).

## 14. Operação do chat com API paga

O chat usa HTTPS para chamar o backend, que valida o Firebase ID token, a autorização sobre a viagem e os limites de consumo antes de chamar o provedor de IA.

- Manter chaves e credenciais no servidor, com privilégios mínimos.
- Fixar modelos e ferramentas permitidos no backend; não aceitar URLs ou operações arbitrárias propostas pelo cliente ou modelo.
- Se usar Firestore Admin SDK, implementar autorização no backend: esse acesso não é limitado pelas Security Rules do cliente.
- Validar a resposta estruturada antes de propor ou aplicar alterações; streaming pode exibir texto, mas não deve salvar alterações incompletas.
- Limitar filas, concorrência, tokens e tentativas; oferecer edição manual quando a API falhar ou o orçamento atingir o limite.
- Medir custo por viagem e latência, incluindo inicialização do backend gerenciado e consultas externas.

## 15. Atualização: uso ocasional e custos com tarifas fornecidas

### 15.1 Perfil de uso prioritário

O usuário tende a criar um roteiro e ajustá-lo ao longo de dias ou semanas, não a enviar dez mensagens todos os dias. A unidade principal de acompanhamento será **custo por viagem criada e editada**, além de usuários ativos no mês e picos de chamadas.

Uma viagem pode atravessar meses: os custos devem ser atribuídos ao período de cada chamada. Os cenários abaixo contabilizam todo o ciclo no mesmo mês apenas para facilitar comparação. Não são previsão de comportamento já medido.

### 15.2 Tarifas informadas pelo usuário — não verificadas

Valores apresentados na conversa em 28/10/2026, em USD por milhão de tokens:

| Provedor / nome informado | Entrada | Saída |
|---|---:|---:|
| OpenAI — GPT-6 Luna | US$ 0,05 | US$ 0,25 |
| Google — Gemini 2.5 Flash-Lite | US$ 0,10 | US$ 0,40 |
| xAI — Grok 4.3 | US$ 1,25 | US$ 2,50 |
| DeepSeek — V4.1 Flash, tarifa menor | US$ 0,15 | US$ 0,60 |
| DeepSeek — V4.1 Flash, tarifa maior | US$ 0,30 | US$ 1,20 |

**Esses nomes, tarifas e condições não foram confirmados em documentação oficial nesta tarefa.** São entradas para simulação, não cotações nem garantia de disponibilidade. A fonte é o texto fornecido pelo usuário; não foi acompanhado de links diretos para cada tabela.

A descrição dos horários do DeepSeek no texto fornecido é inconsistente com a ordem dos valores. Por isso, usamos “tarifa menor/maior”, sem afirmar qual janela ou modalidade corresponde a cada uma. Não presumir que desconto de cache seja desconto de horário.

Referências para futura confirmação: [OpenAI](https://developers.openai.com/api/docs/pricing), [Gemini](https://ai.google.dev/gemini-api/docs/pricing), [xAI](https://docs.x.ai/) e [DeepSeek](https://api-docs.deepseek.com/quick_start/pricing). A referência xAI é o portal de documentação, não uma tabela recuperada. Não confundir **Grok, da xAI**, com **Groq**, outro provedor discutido anteriormente.

### 15.3 Três cenários para 1.000 usuários

**A — uso ocasional leve, mais próximo da hipótese atual:**

- Uma geração: 4.000 tokens de entrada e 3.000 de saída.
- Três alterações: 2.000 de entrada e 500 de saída por chamada.
- Duas dúvidas: 1.500 de entrada e 300 de saída por chamada.
- Total por usuário: **6 chamadas, 13.000 tokens de entrada e 5.100 de saída**.
- Total para 1.000 usuários: **6.000 chamadas, 13 milhões de entrada e 5,1 milhões de saída**.
- Não inclui rodadas adicionais de ferramentas; contabilizá-las quando necessárias.

**B — ciclo mais completo, da simulação anterior:**

- Uma geração, cinco alterações, três dúvidas e duas chamadas extras após ferramentas.
- Total por usuário: **11 chamadas, 23.500 tokens de entrada e 7.100 de saída**.
- Total para 1.000 usuários: **11.000 chamadas, 23,5 milhões de entrada e 7,1 milhões de saída**.

**C — referência de uso intenso, não cenário-base:**

- 1.000 usuários ativos por dia, dez chamadas por dia, durante 30 dias.
- 4.000 tokens de entrada e 700 de saída por chamada.
- Total: **300.000 chamadas, 1,2 bilhão de tokens de entrada e 210 milhões de saída**.

| Modelo informado | A: ciclo leve | B: ciclo completo | C: 1.000 DAUs por 30 dias |
|---|---:|---:|---:|
| OpenAI — GPT-6 Luna | US$ 1,93 | US$ 2,95 | US$ 112,50 |
| Gemini 2.5 Flash-Lite | US$ 3,34 | US$ 5,19 | US$ 204,00 |
| Grok 4.3 | US$ 29,00 | US$ 47,13 | US$ 2.025,00 |
| DeepSeek — V4.1 Flash | US$ 5,01–10,02 | US$ 7,79–15,57 | US$ 306,00–612,00 |

Fórmula: **milhões de tokens de entrada × tarifa de entrada + milhões de saída × tarifa de saída**. Arredondamento monetário feito no total, não por chamada.

Exemplo do cenário A com as tarifas informadas do Gemini: `13 × 0,10 + 5,1 × 0,40 = US$ 3,34`. Uma margem aritmética de 20% resultaria em aproximadamente US$ 4,01; não é garantia de cobertura de todos os extras.

Valores sem descontos de cache e sem franquias gratuitas. Não incluem busca, mapas, reservas, hospedagem, banco, tráfego, impostos, câmbio nem raciocínio adicional faturável. Chamadas de ferramentas podem provocar novas chamadas ao modelo e devem entrar na medição.

**Decisão atualizada:** usar uma API paga para o uso ocasional, comparando um modelo pequeno OpenAI e um Gemini após validar preços e qualidade. Não há vencedor confirmado. As etapas da seção 12 seguem essa decisão; esta seção dimensiona o consumo pago por viagem.

## 16. Catálogo de roteiros prontos por cidade e país

### 16.1 Funcionamento proposto

Oferecer roteiros-base revisados para navegar antes de conversar com a IA. Filtrar por cidade/país, duração, interesses, faixa de orçamento e ritmo. Exemplo: “Roma — quatro dias — museus, gastronomia e vida noturna”.

- **Cidade:** organizar dias por regiões próximas, com atividades principais, alternativas e blocos livres.
- **País:** combinar cidades e dias de deslocamento; não apenas concatenar roteiros urbanos sem considerar chegada, saída e transporte.
- **Personalização:** selecionar uma base e pedir à IA somente ajustes relevantes.
- **Sem IA quando possível:** visualizar, copiar para a conta, remover pelo botão ou mudar uma ordem manualmente são operações normais do aplicativo.
- **IA quando necessário:** interpretar pedidos, propor substituições, explicar escolhas e reorganizar conflitos.

A cópia do roteiro-base pertence à viagem do usuário. Editá-la não modifica o catálogo nem viagens de outras pessoas. Mudanças na base não devem sobrescrever silenciosamente uma viagem já personalizada.

### 16.2 Dados e publicação

Cada base deve registrar identificador, versão, país/cidade, idioma, duração, interesses, regiões, atividades, duração estimada, alternativas, fontes, data da última revisão e estado de publicação. Preços precisam de moeda e status de estimativa/verificação; horários sazonais e restrições precisam de confirmação.

Separar catálogo editorial, referências de lugares e viagens particulares. Apenas responsáveis autorizados podem publicar/editar bases; usuários comuns podem ler bases publicadas e editar suas próprias cópias.

Ao atribuir datas reais, verificar fechamentos, reservas, tempo de deslocamento e fuso. Uma base sem datas não comprova que todas as atrações estarão abertas nos dias escolhidos.

Conteúdo gerado por IA deve passar por revisão antes da publicação. Usar material original e referências permitidas, sem copiar roteiros comerciais. O custo de geração/revisão do catálogo é separado do custo de personalização e pode ser diluído entre várias viagens.

**Economia esperada, ainda não medida:** menos geração integral, prompts menores e menos chamadas. As simulações da seção 15 ainda cobram uma geração completa por usuário; não antecipam uma porcentagem de economia sem benchmark.

## 17. Teste de roteiro-base: Roma em quatro dias

### 17.1 Hipóteses e limites

Exemplo personalizado para **museus durante o dia, restaurantes, bares à noite e hospedagem em hostel**. Como datas, orçamento, duração e ritmo não foram informados, assumimos quatro dias completos, três noites e ritmo moderado, sem passeios intensos muito cedo após noites de bar.

É um rascunho sem reservas, não um itinerário com disponibilidade verificada. Chegada/saída não estão incluídas nos quatro dias completos. Com voos nesses dias, remover atividades ou ampliar a estadia.

As tentativas de consultar os sites dos Museus Capitolinos, Galleria Borghese e Museus Vaticanos em 28/10/2026 falharam por DNS. Horários, preços, regras de ingressos, funcionamento de bares/restaurantes e vagas em hostel **não foram verificados**. As durações abaixo são sugestões de planejamento, não horários publicados.

### 17.2 Onde ficar

**Base sugerida: hostel na região de Termini/Castro Pretorio**, pela conexão de transporte e opções de hospedagem. Alternativa: procurar em Monti para priorizar passeios e saídas nessa região, conforme orçamento e oferta.

Dois candidatos para pesquisar, sem afirmar preço, disponibilidade ou qualidade atual:

- **The RomeHello:** comparar localização, dormitório/quarto, lockers e programação social.
- **YellowSquare Rome:** comparar ambiente social, regras de silêncio e localização do quarto em relação a espaços de convivência.

Para decidir, conferir avaliações recentes, ar-condicionado, armazenamento de bagagem, roupa de cama, taxa turística, cancelamento e eventuais limites etários. Se dormir bem for prioridade, preferir quarto afastado do bar ou quarto privativo.

### 17.3 Dia 1 — Museus Capitolinos, centro histórico e Monti

- **Fim da manhã e começo da tarde:** Museus Capitolinos, reservando aproximadamente 2–3 horas.
- **Almoço:** região do Campidoglio/centro; procurar uma trattoria e experimentar cacio e pepe ou uma alternativa compatível com restrições alimentares.
- **Tarde:** passeio leve pela região da Piazza Venezia e ruas do centro, com pausa para café. Evitar acrescentar outro museu grande no mesmo dia.
- **Jantar:** Monti; **La Taverna dei Fori Imperiali** é uma candidata a pesquisar e reservar, se disponível.
- **Noite:** bares em Monti. **Ai Tre Scalini** é uma opção a verificar para vinho e petiscos; se estiver cheio, escolher outro local próximo em vez de atravessar a cidade.

### 17.4 Dia 2 — Galleria Borghese, parque e centro

- **Fim da manhã ou início da tarde:** Galleria Borghese, planejando cerca de 2 horas e respeitando o horário/duração do ingresso efetivamente comprado. Verificar reserva antecipada.
- **Almoço:** região de Pinciano, antes ou depois da visita conforme o horário disponível.
- **Tarde:** Villa Borghese e caminhada até o Pincio/Piazza del Popolo; deixar o restante livre.
- **Jantar:** centro histórico; **Osteria dell'Ingegno** é uma candidata a consultar, sem disponibilidade confirmada.
- **Noite:** opção de coquetéis no centro, como **Salotto42**, se funcionamento, preço e lotação forem adequados.

### 17.5 Dia 3 — Museus Vaticanos e Trastevere

- **Final da manhã e tarde:** Museus Vaticanos e Capela Sistina, com cerca de 3–4 horas de planejamento e pausas. Ficam na Cidade do Vaticano; incluir deslocamento e regras próprias de visita.
- **Almoço:** Prati, antes ou depois do museu conforme o ingresso; um lanche evita somar restaurante demorado a uma visita extensa.
- **Fim da tarde:** descanso no hostel ou ida a Trastevere. Não tratar Vaticano e Trastevere como pontos vizinhos: escolher transporte conforme localização, mobilidade e horário.
- **Jantar:** **Da Enzo al 29** como candidato a verificar; ter uma segunda trattoria próxima como alternativa a filas ou falta de mesa.
- **Noite:** **Freni e Frizioni**, em Trastevere, como opção de bar a consultar.

Não acrescentar automaticamente a Basílica de São Pedro: acesso, filas e tempo precisam ser planejados separadamente. Se for prioridade, reduzir outras atividades.

### 17.6 Dia 4 — Palazzo Massimo e noite flexível

- **Fim da manhã:** Palazzo Massimo alle Terme, do Museo Nazionale Romano, reservando aproximadamente 2 horas.
- **Almoço:** região de Termini/Monti; opção mais informal para equilibrar os jantares anteriores.
- **Tarde:** livre para compras, repetir um bairro ou descansar. Se preferir arte contemporânea, avaliar trocar o museu por MAXXI, reorganizando também o deslocamento.
- **Jantar:** escolher o bairro preferido dos dias anteriores, em vez de acrescentar outro deslocamento longo.
- **Noite:** se houver pernoite adicional, repetir Monti ou aproveitar uma atividade social do hostel. Se houver partida, substituir o bar por retorno e preparação da viagem.

### 17.7 Reservas, deslocamentos e orçamento

Referências institucionais para confirmar ingressos e informações — não páginas com disponibilidade recuperada nesta tarefa:

- [Museus Capitolinos](https://www.museicapitolini.org/).
- [Galleria Borghese](https://galleriaborghese.beniculturali.it/).
- [Museus Vaticanos](https://www.museivaticani.va/).
- [Museo Nazionale Romano](https://museonazionaleromano.beniculturali.it/).
- [MAXXI](https://www.maxxi.art/).
- [Transporte público ATAC](https://www.atac.roma.it/).

Usar o link de compra indicado pelo site institucional, sem presumir que resultados patrocinados sejam oficiais. Confirmar dias de fechamento e ingressos antes de fixar a ordem dos dias.

Combinar caminhadas com transporte público; conferir serviço noturno no dia e reservar verba para táxi autorizado se necessário. Não pressupor metrô disponível após a saída dos bares. Não dirigir após beber.

Sem datas e teto de gastos, não apresentar um total como cotação. Orçar separadamente: três noites de hostel, taxas, refeições, quatro visitas, transporte e bebidas. Se forem quatro noites ou houver transfer de aeroporto, acrescentar esses itens.

Para reduzir gastos, alternar jantares com refeições simples, escolher menos visitas pagas e definir limite para saídas noturnas. Para personalizar de verdade, pedir datas, dias completos disponíveis, orçamento diário e preferência por dormitório ou quarto privativo.

### 17.8 Como testar as alterações no app

| Pedido de teste | Comportamento esperado |
|---|---|
| “Quero uma noite a menos de bar” | Retirar uma saída sem mexer nos museus ou nas outras noites |
| “Troque Borghese por arte contemporânea” | Propor MAXXI, conferir dados e reorganizar a região do dia |
| “Vou embora na tarde do quarto dia” | Remover jantar/bar desse dia e reservar margem para bagagem e transporte |
| “Adicione um dia em Florença” | Perguntar se amplia a viagem ou substitui um dia em Roma; prever deslocamento e nova hospedagem |
| “Meu hostel mudou para Trastevere” | Recalcular organização e deslocamentos, sem alterar reservas silenciosamente |
| “Deixe mais barato” | Identificar gastos ajustáveis e propor alternativas sem inventar tarifas |

O modelo propõe alterações; o aplicativo valida datas, IDs, restrições e fontes, apresenta a diferença e salva apenas após a confirmação necessária. Este exemplo ainda não foi publicado como catálogo nem executado por um aplicativo.
