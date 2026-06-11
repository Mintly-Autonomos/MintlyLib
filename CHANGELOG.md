# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2026-06-10

### Added
- Contratos do domínio de cadastro e autenticação (MIN-58/MIN-59/MIN-60):
  - `userSchema` / `User` — credencial de acesso separada dos dados pessoais (`Person` como complemento), com `status` (`active | inactive | blocked`), `role` e `passwordHash`.
  - `restaurantSchema` / `Restaurant`, `financialAccountSchema` / `FinancialAccount`, `financialCategorySchema` / `FinancialCategory`.
  - `signupRequestSchema`, `loginSchema` e `passwordSchema` — política de senha compartilhada entre cadastro e redefinição (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número).
  - Tipos de resposta de auth (`LoginResult`, `RefreshResult`, `AuthUser`).
- Contratos comuns: `Audit`, enums de status e *extended reference* de Person (`person-ref-schema`).
- Clients HTTP para consumo pelo front: `AuthClient`, `RestaurantClient`, `FinancialAccountClient`, `FinancialCategoryClient`. (#6)

### Changed
- `Person` alinhado ao domínio real do Mintly; `cpf` movido para o `personSchema`. (#6)
- Revisão geral dos contratos: enums, audit e extended references padronizados. (#6)
- `PersonClient` com path de recurso corrigido. (#6)

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

[1.2.0]: https://github.com/Mintly-Autonomos/MintlyLib/releases/tag/v1.2.0
[1.1.0]: https://github.com/Mintly-Autonomos/MintlyLib/releases/tag/v1.1.0
