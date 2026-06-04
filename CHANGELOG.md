# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-06-02

### Changed
- Migrada toda a camada de validação/ORM da `aurora` interna para a biblioteca publicada [`@ascendance-hub/sapphire-core`](https://www.npmjs.com/package/@ascendance-hub/sapphire-core) (Sapphire). (#3, #5)
- `person-orm.ts` substituído por `person-schema.ts`, declarado via `new Sapphire().object({ ... })`.
- `type Person` agora é inferido do schema (`Infer<typeof personSchema> & Entity`), unificando validação e tipagem numa única fonte de verdade.

### Added
- `personSchema` exportado pela lib, habilitando o uso de `getSchema('bson')` para adoção futura do validator `$jsonSchema` no MongoDB.

### Removed
- Pasta `src/aurora/` removida por completo (~660 linhas) e seu export em `src/index.ts`.

### Dependencies
- Requer `@ascendance-hub/sapphire-core@^1.2.0` — resolve [Sapphire#33](https://github.com/Ascendance-Hub/Sapphire/issues/33) (emissão correta de `.d.ts` em libs com `declaration: true`).

[1.1.0]: https://github.com/Mintly-Autonomos/MintlyLib/releases/tag/v1.1.0
