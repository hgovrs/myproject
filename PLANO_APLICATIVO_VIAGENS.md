# Aplicativo de roteiros de viagem — plano e comparação de IA

**Data da pesquisa:** 28/10/2026.

**Stack proposta:** Flutter + Firebase.

**Objetivo:** começar sem cobrança e permitir evolução para baixo custo.

## 1. Resumo executivo e limites da pesquisa

Recomendação inicial: **Flutter Web + Firebase Spark + Firebase AI Logic com um Gemini de texto elegível à camada gratuita**, condicionado à confirmação de disponibilidade, cotas e termos no projeto. Usar edição manual quando a IA estiver indisponível; não habilitar cobrança automaticamente.

O repositório contém apenas um README inicial. Este documento é um plano, não uma descrição de funcionalidades já implementadas.

**A comparação comercial ainda é parcial.** Foi possível consultar código e documentação em repositórios oficiais de Firebase, Google, Qwen, DeepSeek, Ollama, llama.cpp, vLLM e Groq. As páginas comerciais do Google, DeepSeek e Groq não puderam ser recuperadas neste ambiente por falhas de DNS; consultas adicionais via busca e GitHub MCP expiraram.

Consequentemente:

- Os modelos e recursos identificados em repositórios têm fontes na seção 13.
- **Preços atuais, franquias e cotas numéricas dos provedores não foram confirmados.** Não usamos valores antigos como se fossem atuais.
- As simulações financeiras e de capacidade são **hipóteses de planejamento**, não ofertas comerciais.
- Links não recuperados são referências para validação, não evidências de conteúdo lido.
- Um nome presente em um exemplo não garante disponibilidade na API, estabilidade, gratuidade ou suporte no Firebase AI Logic.

### O que significa “custo zero”

| Situação | O que podemos prometer |
|---|---|
| Protótipo com franquias gratuitas | Ausência de cobrança enquanto os serviços/configurações forem elegíveis; haverá limites e possível indisponibilidade |
| Aplicativo público gratuito e ilimitado | Não é uma promessa viável |
| API paga de baixo custo | Despesa variável; exige orçamento, medição e proteção contra abuso |
| Modelo baixado em computador existente | Sem tarifa de API, mas com consumo de energia, memória e tempo de operação |
| Modelo próprio disponível 24 horas | Servidor, rede, segurança e manutenção; não é infraestrutura gratuita |

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
| **Gemini via Firebase AI Logic** | Camada gratuita e elegibilidade a confirmar por modelo/projeto; preços pagos não verificados | SDK oficial `firebase_ai` no Flutter [S1] | Menos infraestrutura própria; integração alinhada à stack | Primeira opção condicional; confirmar suporte a saída estruturada, cotas e tratamento de dados |
| **Gemini via backend** | Tarifas do provedor + execução do backend | Flutter → backend autenticado → Gemini | Maior controle de orçamento por usuário, ferramentas e troca de provedor | Etapa paga/controlada; não necessária para o primeiro experimento |
| **DeepSeek API** | Não foi possível confirmar franquia permanente nem tarifas de entrada/cache/saída | Backend com chave protegida → API | Candidato a comparar em custo e qualidade de português | Não presumir que o chat gratuito torne a API gratuita; decisão pendente de preços e benchmark |
| **Groq API** | Cookbook anuncia obtenção gratuita de chave, não uma capacidade gratuita específica [S12] | Backend com chave protegida → API | Alternativa hospedada para experimentar modelos abertos | Cotas, modelos elegíveis, políticas e preço pagos não verificados |
| **Qwen/Gemma/DeepSeek destilado no computador** | Sem tarifa por token do provedor; há custos locais | Ollama ou llama.cpp, inicialmente para desenvolvimento | Experimentação offline, controle dos dados e comparação sem consumo de API | Não atende automaticamente todos os usuários do app |
| **Modelo aberto em servidor próprio** | Hardware próprio ou aluguel + operação | Backend autenticado → servidor de inferência privado | Controle operacional e de retenção | Não recomendado para MVP de orçamento zero |
| **Modelo no dispositivo do usuário** | Sem servidor de inferência; custo de download e recursos do dispositivo | Integração nativa/runtime compatível com cada plataforma | Uso offline e menor envio de dados | Complexidade, memória, bateria e qualidade variável; projeto separado de validação |

### 3.1 Gemini: qual modelo escolher?

O cookbook oficial consultado menciona **Gemini 3.5 Flash-Lite, Gemini 3.8 Flash e Gemini 4 Argon** [S2]. Esses nomes são registros da fonte consultada, não uma recomendação automática de versão.

Ordem de avaliação:

1. Modelo de texto Flash-Lite estável, caso disponível e elegível: candidato para extração de preferências e alterações simples.
2. Modelo de texto Flash estável: candidato para geração e reorganização de roteiros.
3. Modelo de raciocínio maior: somente se o teste demonstrar benefício que justifique seu custo.

Para simplicidade, **começar com um único modelo**. Usar dois modelos ou roteamento por complexidade apenas depois de medir ganho real. Não assumir que o modelo mais novo ou maior seja o melhor custo-benefício.

Confirmar modelo exato, status estável/preview, região, limite de contexto, saída máxima, suporte do SDK, saída estruturada e eventuais tokens de raciocínio faturáveis. Evitar atrelar o aplicativo a aliases sem acompanhar mudanças e descontinuações.

### 3.2 DeepSeek: API comercial não é modelo baixado

Separar três produtos: aplicação de chat, API hospedada e pesos de modelos disponíveis para download. Gratuidade, licença e política de dados de um não se transferem aos demais.

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
| Firebase AI Logic | Cobrança do modelo/provedor e comportamento com Spark/Blaze | Limites do serviço e por usuário, suporte ao modelo escolhido | Pendente [P3, P4] |
| DeepSeek API | Entrada cache hit/miss, saída e regras de cobrança | Concorrência, fila, timeout e limites publicados | Pendente [P7, P8] |
| Groq API | Tarifa por modelo e elegibilidade à oferta gratuita | RPM/RPD, TPM/TPD, contexto e saída por modelo | Pendente [P10, P11] |
| Firestore | Franquia de armazenamento, operações e transferência; excedentes se houver faturamento | Leituras, escritas, exclusões, tamanho de documentos e conexões | Pendente [P5, P6] |
| Hosting e Authentication | Armazenamento/tráfego, método de autenticação e eventuais serviços associados | Transferência, usuários/operações e limites aplicáveis | Pendente [P5] |
| Modelo próprio | Compra/aluguel, energia, disco, rede e operação | RAM/VRAM, tokens/s, contexto e concorrência medidos | Benchmark necessário |

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

## 6. Baixar e configurar nosso próprio modelo

### 6.1 Não precisamos treinar uma IA do zero

O primeiro experimento local deve usar pesos existentes, instruções e recuperação de dados turísticos. Fine-tuning fica para uma necessidade comprovada e não resolve atualização de horários, preços ou disponibilidade.

**Gemini e Gemma não são o mesmo produto:** Gemini é a família acessada pelo serviço; Gemma oferece modelos com pesos disponíveis sob condições próprias.

### 6.2 Candidatos identificados

| Família | Exemplos encontrados | Licença e cautelas |
|---|---|---|
| Qwen3 | `Qwen3-8B`, `Qwen3-4B-Instruct-2507`, `Qwen3-30B-A3B-Instruct-2507` | Repositório declara Apache 2.0 para seus modelos de pesos abertos; conferir checkpoint específico [S3] |
| Gemma | Checkpoints Gemma 3 de 1B, 4B, 12B e 27B; também há referências a Gemma 4 no código | Licença Apache 2.0 da implementação não comprova a licença dos pesos; consultar termos do modelo [S4, S5, P12] |
| DeepSeek-R1 destilado | Variantes Qwen de 1,5B, 7B, 14B e 32B; variantes Llama de 8B e 70B | DeepSeek declara MIT, mas documenta modelos-base e condições respectivas; verificar especialmente variantes Llama [S6] |

Não há benchmark específico do nosso aplicativo que prove superioridade de uma dessas famílias em português. Começar avaliando um modelo instruct de 4B–8B; comparar um destilado de raciocínio apenas se necessário.

### 6.3 Memória e hardware

Estimativa aritmética **apenas dos pesos**, em GB decimais: `parâmetros × bits ÷ 8`.

| Parâmetros nominais | 4 bits | 8 bits | 16 bits |
|---:|---:|---:|---:|
| 1,5 bilhões | 0,75 GB | 1,5 GB | 3 GB |
| 4 bilhões | 2 GB | 4 GB | 8 GB |
| 8 bilhões | 4 GB | 8 GB | 16 GB |
| 14 bilhões | 7 GB | 14 GB | 28 GB |
| 32 bilhões | 16 GB | 32 GB | 64 GB |

**Isso não é a RAM/VRAM necessária para executar o modelo.** Faltam cache KV, metadados de quantização, buffers, ativações, sistema operacional e eventuais componentes multimodais. Precisamos medir com contexto e concorrência reais.

Como ponto de partida experimental, uma máquina com 16 GB de RAM pode ser avaliada para um modelo pequeno quantizado; não é garantia de velocidade nem de cabimento para qualquer contexto. GPU é opcional em alguns runtimes, mas CPU pode resultar em latência inadequada para uso interativo.

Modelos MoE não devem ser dimensionados apenas pelos parâmetros ativados: um modelo 30B-A3B não equivale a armazenar apenas 3B de pesos.

### 6.4 Ferramentas de execução

| Ferramenta | Uso recomendado | Recursos e licença |
|---|---|---|
| Ollama | Primeiro teste local e configuração simples | Execução local, gestão de modelos e concorrência; MIT. Também possui funções cloud: selecionar execução realmente local [S7, S8] |
| llama.cpp | Controle sobre quantização e execução CPU/GPU | Servidor compatível com OpenAI, multiusuário, batching e saída JSON com esquema; MIT [S9, S10] |
| vLLM | Serviço compartilhado quando escala justificar | Serving, batching, PagedAttention e paralelismo; Apache 2.0 [S11] |

Licença do runtime não substitui a licença dos pesos. Não baixar quantizações de terceiros sem verificar origem, licença e integridade.

### 6.5 Caminho de configuração

1. Inventariar RAM, GPU/VRAM, disco e plataformas a atender.
2. Escolher checkpoint e quantização compatíveis, revisar licença e tamanho do download.
3. Instalar runtime pela distribuição oficial e fixar versões avaliadas.
4. Executar primeiro apenas em interface local/privada.
5. Configurar contexto, saída máxima e concorrência conforme medições.
6. Rodar os mesmos testes de roteiro e edição usados para APIs hospedadas.
7. Para serviço compartilhado, colocar autenticação, autorização e limites no backend; não expor o runtime diretamente à internet.
8. Controlar atualizações, logs, backups, monitoramento e recuperação de falhas.

Ollama declara que execução local não envia prompts para seu serviço [S7]; isso não impede que nosso backend registre dados. Desativar recursos cloud quando a intenção for operação exclusivamente local e revisar logs.

No Flutter Web, não tratar um servidor no computador do desenvolvedor como endpoint de produção. No celular, executar pesos exige integração própria, testes térmicos e de bateria, gestão de download e fallback.

### 6.6 Custo total da hospedagem própria

`custo mensal = aluguel ou depreciação + energia + armazenamento + rede + operação + redundância`.

Exemplo **hipotético**, apenas de energia: equipamento consumindo em média 100 W por 8 horas/dia, durante 30 dias, usa 24 kWh. A R$ 1,00/kWh, seriam R$ 24,00. Não representa cotação de energia nem consumo de uma GPU específica.

Para comparar com API, dividir o custo fixo mensal pela diferença entre custo por tarefa da API e custo variável local, quando essa diferença for positiva. Depois conferir capacidade e latência: um ponto de equilíbrio financeiro não garante capacidade de atender picos.

**Conclusão:** modelo local é útil para experimentação e privacidade; hospedar um servidor próprio não é a opção inicial mais simples nem necessariamente mais barata.

## 7. Implementação com Flutter e Firebase

### Caminho A — piloto sem faturamento

Fluxo: **Flutter → Firebase AI Logic → Gemini Developer API**, condicionado ao modelo/plano elegível.

- Usar o SDK oficial `firebase_ai`, cuja existência e finalidade foram verificadas [S1].
- Firebase Authentication para identificar usuário e Firestore para viagens.
- Preferir login por e-mail/provedor suportado; evitar SMS no escopo inicial.
- Ativar App Check e regras de acesso por proprietário.
- Manter catálogo pequeno no aplicativo ou no Firestore, observando custos de leituras.
- Usar Hosting para web e links externos para mapas e reservas.
- Evitar serviços que exijam vincular faturamento, incluindo backend gerenciado ou armazenamento adicional, até validar as condições atuais.
- Ao atingir cotas, oferecer edição manual e informar indisponibilidade.

**Spark não torna automaticamente qualquer modelo gratuito.** A integração, o provedor, o modelo e o estado do faturamento precisam ser conferidos. Não substituir Gemini Developer API por Vertex AI sem reavaliar cobrança.

A chave secreta de um provedor não deve ir para o Flutter, assets, configuração pública ou Remote Config. A configuração pública normal do Firebase é diferente de uma chave secreta de API; ela também não substitui regras de segurança.

App Check reduz abuso, mas não constitui autorização nem garantia de teto financeiro. Controles apenas no cliente podem ser contornados.

### Caminho B — produção com API paga ou múltiplos provedores

Fluxo: **Flutter → backend autenticado → adaptador Gemini/DeepSeek/Groq ou inferência própria**.

- Backend valida identidade, propriedade da viagem e limites por usuário.
- Chaves armazenadas em mecanismo seguro do servidor, nunca distribuídas ao cliente.
- Firestore mantém dados do usuário; o modelo recebe somente o contexto necessário.
- Adaptadores traduzem um contrato comum de geração/edição, sem acoplar a interface a um provedor.
- Backend limita concorrência, tokens, tentativas e orçamento; registra uso sem conteúdo pessoal desnecessário.
- Cloud Functions/Cloud Run são opções a avaliar com faturamento explícito, não promessas de Spark gratuito.

Firebase AI Logic não deve ser tratado como gateway genérico para DeepSeek, Groq ou Ollama.

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
- Modelo local não garante privacidade se houver telemetry, logs, backups ou recursos cloud ativados.

## 11. Validação e critérios de decisão

Usar o mesmo conjunto de pelo menos 30 casos de viagem em português nos candidatos: orçamento apertado, múltiplas cidades, acessibilidade, atrações fechadas, remoção de cidade, conflito de datas, prompt malicioso e dados incompletos.

Medir:

- Aderência às preferências e preservação de itens obrigatórios.
- Validade estrutural, acerto de IDs e consistência das edições.
- Informações e links inventados, distinguindo geração de recuperação.
- Latência mediana/p95, tokens, falhas de cota e custo por roteiro aceito.
- Número de correções e avaliação humana da utilidade.
- RAM/VRAM, velocidade e concorrência no caso local.

Critérios iniciais propostos, não resultados já obtidos:

- Nenhum vazamento entre usuários ou ação não autorizada nos testes.
- Nenhum link inventado aceito pelo validador.
- Pelo menos 95% das respostas estruturadas válidas na primeira tentativa.
- Toda alteração destrutiva deve passar por confirmação e poder ser desfeita.
- Falha de IA/cota não deve impedir acesso e edição manual da viagem salva.

Não publicar ranking de qualidade antes do benchmark. A escolha deve considerar qualidade, integração, privacidade, custo total e disponibilidade, não só preço por token.

## 12. Etapas e decisão recomendada

1. **Validar a viabilidade gratuita:** conferir páginas/console pendentes, registrar tarifas e cotas, modelo exato e data; verificar acesso sem faturamento.
2. **Criar base Flutter/Firebase:** autenticação, regras, cadastro de viagem, roteiro e edição manual.
3. **Preparar catálogo inicial:** destinos limitados, IDs, coordenadas e fontes oficiais.
4. **Integrar um Gemini elegível:** saída estruturada, validadores, consumo medido e tratamento de cota.
5. **Adicionar conversa:** propostas incrementais, confirmação, revisões e desfazer.
6. **Comparar alternativas:** mesmo benchmark para DeepSeek/Groq, se houver credenciais e orçamento, e Qwen/Gemma local em hardware existente.
7. **Liberar piloto limitado:** observar consumo e erros antes de ampliar público.
8. **Avaliar backend pago:** somente se controle, volume ou qualidade justificarem.

**Decisão provisória:** começar com Gemini via Firebase AI Logic se a configuração gratuita for confirmada; manter modelo local como experimento, não infraestrutura pública. DeepSeek e Groq permanecem candidatos, sem vencedor financeiro enquanto preços e cotas atuais não forem validados.

Se nenhuma opção hospedada gratuita atender às condições, entregar primeiro o planejador manual e testar IA localmente. Não mudar a promessa de custo zero sem decisão explícita.

### Pendências comerciais obrigatórias

- [ ] Recuperar preços e limites oficiais e registrar data, região, moeda e modelo.
- [ ] Verificar cotas efetivas do projeto no console, além dos limites publicados.
- [ ] Confirmar Spark/Blaze e se alguma integração exige faturamento.
- [ ] Validar termos de dados, licenças de pesos e permissões das fontes turísticas.
- [ ] Substituir cenários hipotéticos por cálculo baseado em tarifas confirmadas.
- [ ] Executar benchmark e decidir se API ou inferência local atende à qualidade mínima.

## 13. Fontes e rastreabilidade

### Fontes oficiais recuperadas nesta pesquisa

Consultadas em 28/10/2026. Links para branches são mutáveis; registrar commit/checkpoint exato quando a implementação selecionar versões.

- **[S1]** [Firebase AI Logic Flutter — README oficial](https://raw.githubusercontent.com/firebase/flutterfire/main/packages/firebase_ai/firebase_ai/README.md): SDK Flutter e acesso a modelos Gemini/Imagen.
- **[S2]** [Gemini API Cookbook — README oficial](https://raw.githubusercontent.com/google-gemini/cookbook/main/README.md): modelos mencionados e referências de integração; não comprova tarifas ou elegibilidade gratuita.
- **[S3]** [Qwen3 — modelos e licença](https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md).
- **[S4]** [Gemma — checkpoints na implementação oficial](https://raw.githubusercontent.com/google-deepmind/gemma/main/gemma/gm/ckpts/_paths.py).
- **[S5]** [Gemma PyTorch — licença da implementação](https://raw.githubusercontent.com/google/gemma_pytorch/main/LICENSE).
- **[S6]** [DeepSeek-R1 — downloads e licenças](https://raw.githubusercontent.com/deepseek-ai/DeepSeek-R1/main/README.md) e [arquivo de licença](https://raw.githubusercontent.com/deepseek-ai/DeepSeek-R1/main/LICENSE).
- **[S7]** [Ollama — FAQ, execução local, memória e concorrência](https://raw.githubusercontent.com/ollama/ollama/main/docs/faq.mdx).
- **[S8]** [Ollama — licença](https://raw.githubusercontent.com/ollama/ollama/main/LICENSE).
- **[S9]** [llama.cpp — servidor e recursos](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md).
- **[S10]** [llama.cpp — licença](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/LICENSE).
- **[S11]** [vLLM — recursos](https://raw.githubusercontent.com/vllm-project/vllm/main/README.md) e [licença](https://raw.githubusercontent.com/vllm-project/vllm/main/LICENSE).
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
- **[P12]** [Gemma — termos](https://ai.google.dev/gemma/terms).
- **[P13]** [Gemini API — termos](https://ai.google.dev/gemini-api/terms).
- **[P14]** [Groq — privacidade](https://groq.com/privacy-policy/).

## 14. Experimento na Azure: modelo próprio servido ao chat

### 14.1 É possível? Qual é a recomendação?

**Sim.** Podemos alugar uma VM Linux na Azure, instalar um modelo de pesos abertos e disponibilizar um endpoint autenticado para o chat Flutter. Firebase continua responsável por login e dados; a inferência acontece na Azure, sem passar pelo Firebase AI Logic.

Para o primeiro experimento, a recomendação é:

- **Modelo:** `Qwen/Qwen3-4B-Instruct-2507`, em quantização de 4 bits compatível com o runtime.
- **Runtime:** llama.cpp com modelo GGUF de origem verificável; Ollama é alternativa se houver pacote do checkpoint exato, com procedência e template conferidos.
- **Máquina:** VM Linux CPU com 4 vCPUs e 16 GiB de RAM para validar funcionalidade, ou GPU NVIDIA com pelo menos 16 GiB de VRAM para avaliar experiência interativa.
- **Carga inicial:** um usuário/uma geração por vez, contexto de 4.096 tokens e saída máxima de 1.024 tokens, ampliando somente após medir memória e qualidade.
- **Operação:** ligar apenas durante testes e confirmar desalocação ao terminar.

Esses tamanhos e limites são pontos de partida de engenharia, **não requisitos oficiais nem garantia de desempenho**. O contexto inclui instruções, catálogo, histórico e saída: enviar apenas trechos relevantes e reservar espaço para a resposta. Para roteiros longos, gerar por dia ou aumentar o limite após benchmark, sem aceitar JSON truncado.

O Qwen3-Instruct-2507 é descrito pelo projeto como modelo sem modo de raciocínio explícito; isso simplifica o chat e evita começar com uma variante Thinking [S3]. A qualidade em português e a precisão de alterações ainda precisam passar pelos testes da seção 11.

Esse caminho é **uma alternativa de laboratório** à recomendação da seção 12, não uma decisão de substituir a opção hospedada gratuita nem de financiar produção com créditos de desenvolvimento.

### 14.2 Visual Studio Enterprise e créditos Azure

**Não é possível confirmar o benefício apenas pelo nome “Visual Studio Enterprise”.** A licença do IDE, a assinatura Visual Studio, a oferta Azure associada e permissões organizacionais são coisas diferentes.

As ofertas de crédito Azure para assinantes Visual Studio são voltadas a desenvolvimento/testes, mas é necessário consultar os termos da oferta efetivamente atribuída. Não tratar uma aplicação pública atendendo usuários reais como laboratório apenas porque ainda não cobra assinatura.

Antes de criar recursos:

1. Abrir o [portal de benefícios Visual Studio](https://my.visualstudio.com/benefits) e verificar se existe um benefício Azure ativo, seu valor, renovação, validade e conta de ativação.
2. No Azure Portal, confirmar a **assinatura de cobrança** selecionada, a oferta associada e o saldo/crédito disponível; não confundir com outra assinatura do mesmo diretório.
3. Consultar os termos: uso permitido, restrições de serviços/Marketplace, eventual não acumulação de saldo e comportamento ao esgotar o crédito.
4. Confirmar com o administrador as permissões e políticas aplicáveis ao experimento, especialmente para projetos pessoais, modelos baixados e dados enviados à nuvem.
5. Verificar limite de gastos, alertas e eventual transição para cobrança. Não remover um limite nem converter para pagamento por uso só para liberar uma VM.
6. Usar dados sintéticos e acesso restrito aos participantes autorizados do teste.

**Não foi possível verificar nesta sessão a página de benefícios do Microsoft Learn nem os termos específicos da oferta.** Portanto, não prometemos um valor mensal, elegibilidade individual, cobertura de qualquer serviço nem ausência de cobrança. A possibilidade de testes depende dessas confirmações [A2, A3].

Crédito monetário também **não equivale a cota de GPU**. A assinatura pode ter cota zero, restrições de família/região ou pedido de aumento não elegível. Mesmo com cota aprovada, pode faltar capacidade física.

### 14.3 Escolha de VM e modelo

| Cenário | Configuração a procurar | Modelo | Decisão |
|---|---|---|---|
| Validar integração com menor complexidade | Linux, 4 vCPUs, 16 GiB RAM, SSD com espaço para SO, pesos e artefatos | Qwen3-4B-Instruct-2507 quantizado | Primeiro teste se GPU não estiver disponível; latência em CPU precisa ser medida |
| Validar chat interativo | GPU NVIDIA com 16 GiB VRAM ou mais; RAM suficiente para runtime/backend | Mesmo modelo de 4B | Preferível para medir experiência; depende de driver, região, cota e preço |
| Comparar qualidade | GPU dimensionada após medição do modelo maior | Qwen3-8B quantizado, avaliando modo sem thinking | Só promover se melhorar os casos do app; não presumir que tamanho maior garante qualidade |
| Explorar raciocínio | Máquina dimensionada para o checkpoint escolhido | DeepSeek-R1-Distill-Qwen-7B | Experimento secundário; medir verbosidade, latência e validade estrutural |

Uma família como **NCasT4_v3** pode ser investigada para GPU T4, mas seu SKU, disponibilidade, especificações e preço **não foram confirmados nesta pesquisa** [A4]. Não selecionar automaticamente a maior GPU nem assumir que todas as máquinas com “GPU” servem igualmente para inferência CUDA.

Preferir capacidade sob demanda para o primeiro teste. Spot pode sofrer interrupção e exige recuperação, portanto não é uma economia garantida para uma demonstração de chat.

Para o modelo de 4B em 4 bits, aproximadamente 2 GB representam apenas os pesos ideais, conforme a seção 6.3. O processo real consome mais. Dimensionar disco com margem para download, quantização e versões coexistentes; se a conversão ocorrer na própria VM, os pesos originais e artefatos temporários podem ocupar muito mais que o GGUF final.

Não iniciar com DeepSeek completo, modelos de centenas de bilhões de parâmetros ou fine-tuning. O objetivo é **servir inferência de um modelo pequeno existente**.

### 14.4 Arquitetura do endpoint

Fluxo proposto:

**Chat Flutter → HTTPS → API do aplicativo na Azure → llama.cpp/Ollama em interface local → resposta ao chat.**

No laboratório, proxy HTTPS, API e runtime podem estar na mesma VM para evitar serviços extras. Isso cria um ponto único de falha, aceitável apenas para o teste controlado.

- O Flutter envia a mensagem e o Firebase ID token; a API valida assinatura, emissor, público e expiração com biblioteca oficial adequada, não apenas decodifica o token.
- A API valida autorização para a viagem solicitada. Firebase App Check pode acrescentar proteção, mas não substitui autenticação.
- O runtime escuta somente em loopback ou rede privada; **não publicar diretamente as portas do Ollama/llama.cpp**.
- Expor externamente somente o endpoint HTTPS necessário; restringir SSH ao acesso administrativo autorizado, sem abrir para toda a internet.
- TLS termina em um proxy configurado com certificado confiável e renovação. Não distribuir certificados ignorados pelo cliente nem desabilitar validação TLS.
- Segredos ficam no servidor. Não colocar chave administrativa, credencial de conta de serviço ou senha compartilhada no aplicativo.
- CORS permite apenas origens necessárias no Flutter Web, mas não é mecanismo de autenticação.
- A API fixa modelo, ferramentas e limites permitidos; o cliente não escolhe livremente caminho de arquivo, URL interna ou modelo arbitrário.

Se a API acessar Firestore com Admin SDK, lembrar que esse acesso **não é limitado pelas Security Rules do cliente**: implementar autorização por proprietário no backend. Preferir identidade federada/credenciais de curta duração quando disponíveis; qualquer credencial de serviço precisa de acesso mínimo e armazenamento seguro.

Para simplificar o primeiro teste, o app pode carregar o roteiro autorizado pelo Firebase e enviar somente o contexto necessário à API; esse conteúdo ainda deve ser tratado como entrada não confiável. A resposta gera uma proposta, não uma gravação automática privilegiada.

### 14.5 Sequência de implantação do laboratório

1. **Aprovar o uso:** conferir benefício, saldo, oferta, política, região, cota e estimativa de custo; não provisionar até isso estar resolvido.
2. **Isolar recursos:** criar grupo de recursos específico, etiquetas de finalidade e responsável, orçamento e plano de remoção.
3. **Provisionar a VM:** selecionar Linux suportado, acesso por chave, disco adequado e regras de rede restritas. Verificar o preço estimado antes de confirmar.
4. **Preparar o ambiente:** atualizar o sistema e instalar runtime de fonte oficial; em GPU, instalar driver compatível e confirmar que o runtime realmente usa a GPU.
5. **Obter os pesos:** escolher o checkpoint exato, conferir licença, origem, revisão e checksum. Usar GGUF confiável ou converter/quantizar o checkpoint oficial com processo documentado; não confundir Qwen3-4B original com Instruct-2507.
6. **Validar localmente:** carregar o modelo com contexto e concorrência pequenos, testar português e saída estruturada e medir memória/latência antes de abrir o endpoint externo.
7. **Implementar a API:** validar identidade, autorização, tamanho de entrada, esquema de saída, cancelamento e limites por usuário. Usar fila limitada e rejeitar excesso em vez de acumular trabalho sem controle.
8. **Publicar com HTTPS:** conectar proxy à API e manter inferência privada; adicionar verificação de saúde sem expor prompts, configuração ou credenciais.
9. **Integrar ao Flutter:** mostrar estados de espera/geração, erros e indisponibilidade. Streaming pode melhorar percepção de latência, mas só aplicar mudanças no roteiro após receber e validar a resposta completa.
10. **Executar testes:** incluir tokens inválidos, acesso a viagem alheia, pedidos grandes, fila cheia, cancelamento e VM desligada, além dos testes de qualidade.
11. **Encerrar:** parar o atendimento, desalocar a VM e conferir recursos remanescentes. Ao terminar o experimento, excluir recursos exclusivos que não precisem ser preservados.

Não foram criados recursos Azure, instaladas dependências ou configuradas credenciais nesta tarefa; esta seção descreve a execução futura.

### 14.6 Custos, desligamento e orçamento de testes

Modelo baixado não gera tarifa de API por token, mas gera **custo de máquina enquanto estiver alocada**, além dos recursos associados.

A documentação oficial consultada confirma [A1]:

- VM em **Stopped/Allocated**, inclusive após desligamento por dentro do sistema operacional, continua sendo cobrada por computação.
- VM em **Stopped (Deallocated)** deixa de ser cobrada pela instância de computação.
- Discos e determinados recursos de rede podem continuar gerando despesas após a desalocação.

Configurar desligamento programado e verificar se o estado final é realmente desalocado. O reinício exige capacidade disponível e recarregamento do modelo; o chat deve informar indisponibilidade sem iniciar cobrança alternativa automaticamente.

Fórmula de planejamento:

**Horas disponíveis ≈ (crédito efetivamente utilizável − reserva − custos adicionais) ÷ preço por hora da VM.**

Exemplo **totalmente hipotético, não cotação Azure nem valor confirmado do benefício**: crédito de US$ 150, reserva de US$ 30 e US$ 20 para disco/rede deixam US$ 100 para computação.

| Preço hipotético da VM | Horas de computação disponíveis |
|---:|---:|
| US$ 0,25/h | 400 h |
| US$ 0,75/h | aproximadamente 133 h |
| US$ 1,50/h | aproximadamente 66 h |

Uma VM de US$ 0,75/h ligada por 720 horas consumiria **US$ 540 apenas de computação**. A mesma tarifa por 40 horas de teste corresponderia a US$ 30. Não pressupor que crédito mensal mantenha GPU ligada 24 horas.

Somar discos, snapshots, IP público, tráfego de saída, logs e quaisquer serviços auxiliares. Backend Azure acessando Firebase também pode gerar transferência entre nuvens. Orçamentos e alertas não equivalem a bloqueio; conferir o limite de gastos efetivo da oferta.

O preço precisa ser consultado por região, SKU, sistema operacional e assinatura na calculadora/portal [A5]. Só depois comparar custo por roteiro aceito com Gemini/DeepSeek hospedados.

### 14.7 Critério para continuar ou abandonar o experimento

Continuar se houver permissão de uso, crédito suficiente, endpoint protegido, respostas úteis em português e latência aceitável nos testes. Começar com uma sessão concorrente; aumentar somente após medir fila, memória e custo.

Se a CPU for lenta, avaliar GPU por poucas horas. Se GPU não tiver cota ou o custo superar o orçamento, manter o teste local ou comparar API hospedada, sem trocar silenciosamente de assinatura nem remover limite de gastos.

**Recomendação final para o laboratório:** Qwen3-4B-Instruct-2507 quantizado + llama.cpp + API autenticada na mesma VM, usando Firebase para identidade e dados. GPU é preferível para avaliar o chat, mas não é pré-requisito para testar integração. Para produção, fazer uma nova avaliação de licença da oferta, disponibilidade, segurança, redundância e custo.

### 14.8 Fontes adicionais e estado da verificação

Pesquisa complementar em 28/10/2026:

- **[A1] Recuperada:** [Microsoft — estados da VM e cobrança, fonte oficial](https://raw.githubusercontent.com/MicrosoftDocs/azure-compute-docs/main/articles/virtual-machines/states-billing.md). Sustenta a distinção entre parada e desalocação e despesas residuais.
- **[S3] Recuperada novamente:** [Qwen3 — documentação oficial](https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md). Identifica Qwen3-4B-Instruct-2507, modo Instruct sem thinking e caminhos de execução local.
- **[A2] Pendente:** [Microsoft Learn — benefício Azure no Visual Studio](https://learn.microsoft.com/en-us/visualstudio/subscriptions/vs-azure). Acesso falhou por DNS; valor e condições atuais não confirmados.
- **[A3] Validação individual necessária:** [portal de benefícios Visual Studio](https://my.visualstudio.com/benefits). Não acessado nesta sessão; conferir a oferta atribuída sem compartilhar credenciais.
- **[A4] Pendente:** [Microsoft Learn — família NCasT4_v3](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nct4-v3-series). Página não recuperada; confirmar família, SKU, memória e disponibilidade no portal.
- **[A5] Pendente:** [calculadora de preços Azure](https://azure.microsoft.com/pricing/calculator/). Não foi obtida cotação nesta sessão.
- **[A6] Pendente:** [Microsoft Learn — cotas de vCPU](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas). Confirmar cotas regionais e por família na assinatura.

As páginas não recuperadas não comprovam elegibilidade, preços ou cotas; a referência orienta a validação antes de gastar créditos.
