import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/** Tamanho máximo da imagem de perfil (bytes, já decodificada): 1 MB. */
export const AVATAR_MAX_BYTES = 1024 * 1024

export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/**
 * Teto do data URL em caracteres: base64 infla ~4/3 sobre os bytes da imagem, mais o
 * prefixo `data:<mime>;base64,` (≤ 23). Folga de 1 KB p/ arredondamento do padding.
 */
export const AVATAR_MAX_DATA_URL_LENGTH = Math.ceil((AVATAR_MAX_BYTES * 4) / 3) + 1024

/**
 * Foto de perfil guardada no próprio documento do `Person` (Mongo) como data URL
 * (`data:image/png;base64,...`) — dispensa bucket/serviço externo, e o limite de 1 MB
 * deixa o documento muito abaixo dos 16 MB do Mongo.
 */
export const avatarSchema = s.string()
  .max(AVATAR_MAX_DATA_URL_LENGTH, { message: 'A foto de perfil deve ter no máximo 1 MB.' })
  .regex(
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/,
    { message: 'A foto de perfil deve ser uma imagem JPG, PNG ou WebP.' },
  )

/**
 * Corpo de `PUT /people/me/avatar` (troca a foto do usuário autenticado). Objeto estrito:
 * qualquer outro campo é rejeitado (mass assignment). Para remover a foto: `DELETE`.
 */
export const updateAvatarRequestSchema = s.object({ avatar: avatarSchema })

export type UpdateAvatarRequest = Infer<typeof updateAvatarRequestSchema>

/** Resposta de `GET /people/avatar/:username`, `PUT` e `DELETE /people/me/avatar`. `avatar` é `null` quando a pessoa não tem foto. */
export interface PersonAvatarResult {
  avatar: string | null
}
