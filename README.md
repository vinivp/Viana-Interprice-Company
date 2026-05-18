# Viana Interprice Company

Site público da Viana Interprice Company publicado na Vercel.

## Páginas principais

- `index.html`: página de venda com nicho, oferta inicial e exemplos práticos.
- `servicos.html`: pacotes de entrada, módulos e gestão mensal.
- `portal-demo.html`: demonstração pública do portal sem login.
- `contato.html`: diagnóstico operacional com formulário de lead.
- `portal/`: área do portal do cliente.

## Integrações

- Supabase Auth e leads pelo arquivo `assets/js/supabase-config.js`.
- O portal real exige usuário criado no Supabase Auth.
- O modo demo local usa `portal/login.html?demo=1` apenas em `localhost`.
