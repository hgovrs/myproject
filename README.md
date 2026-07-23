# Elétrica Maia — Protótipo de Redesign

Protótipo estático (HTML + CSS) para o redesign e a modernização do site da
**Elétrica Maia**. O objetivo desta versão é a **avaliação do cliente**: nada é
programado no back-end ainda. Após a aprovação, o site será desenvolvido de fato.

## Como visualizar

Basta abrir o arquivo `index.html` no navegador. Não é necessário nenhum
servidor ou build. Opcionalmente, para servir localmente:

```bash
# Python 3
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Páginas

| Arquivo                 | Descrição                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `index.html`            | Home: banners dos setores, CTA de orçamento, diferenciais, reviews |
| `quem-somos.html`       | Página institucional                                             |
| `blog.html`             | Blog/projetos com área para integração do Instagram             |
| `clientes.html`         | Portfólio e clientes atendidos                                  |
| `central-de-ajuda.html` | Dúvidas frequentes (FAQ) e contato                              |
| `comercial.html`        | Setor Comercial                                                 |
| `industrial.html`       | Setor Industrial                                                |
| `residencial.html`      | Setor Residencial                                               |
| `orcamento.html`        | Formulário de orçamento (todos os campos do briefing)          |

Estilos em `assets/css/style.css` e interações em `assets/js/main.js`.

## Paleta de cores (briefing)

| Cor          | Hex       | Uso principal                       |
| ------------ | --------- | ----------------------------------- |
| Azul         | `#183e5e` | Marca, títulos, botões, header      |
| Vinho        | `#400307` | Rodapé, destaques                   |
| Branco       | `#ffffff` | Fundo do cabeçalho e conteúdo       |
| Preto        | `#000000` | Texto                               |
| Cinza escuro | `#5c5953` | Ícones sociais, textos de apoio     |
| Cinza claro  | `#e3e3e3` | Topbar e faixa de CTA               |

## Observações para o cliente

- Textos e imagens são **ilustrativos** (placeholders) e serão substituídos pelo
  conteúdo real fornecido pela loja.
- O formulário de orçamento é apenas visual nesta versão (não envia e-mail). O
  envio para o e-mail da empresa e a integração com o Instagram serão
  implementados na fase de programação, após a aprovação.
- Definição estratégica pendente: foco principal do site (venda direta,
  captação de orçamentos ou vitrine de projetos).