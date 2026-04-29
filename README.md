# MintlyLib

Biblioteca compartilhada do ecossistema Mintly para reaproveitar DTOs, entidades, clientes HTTP e utilitários entre projetos como `MintlyApi` e `MintlyWeb`.

## Instalação

```bash
npm install mintly-lib
```

## Uso

```ts
import { PaginationDto, Person } from 'mintly-lib'
```

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm run pack:check
```

## Publicação

A publicação manual foi automatizada via GitHub Actions em `.github/workflows/deploy.yml`.

- `staging`: publica com a tag `next`
- `production`: publica com a tag `latest`

Para o workflow funcionar, o repositório precisa do secret `NPM_TOKEN`.
