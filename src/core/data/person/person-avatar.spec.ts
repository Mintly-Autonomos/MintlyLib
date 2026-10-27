import { avatarSchema, AVATAR_MAX_BYTES, AVATAR_MAX_DATA_URL_LENGTH } from './person-avatar'
import { personSchema } from './person-schema'
import { signupRequestSchema } from '../auth/signup-schema'

const audit = { createdAt: new Date('2026-10-01T00:00:00.000Z'), updatedAt: new Date('2026-10-01T00:00:00.000Z') }
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHhM3JQAAAABJRU5ErkJggg=='

describe('avatarSchema', () => {
  it.each(['jpeg', 'png', 'webp'])('aceita data URL de imagem %s', (mime) => {
    expect(avatarSchema.safeParse(`data:image/${mime};base64,AAAA`).success).toBe(true)
  })

  it('rejeita tipo que não é imagem permitida', () => {
    expect(avatarSchema.safeParse('data:image/gif;base64,AAAA').success).toBe(false)
    expect(avatarSchema.safeParse('data:text/html;base64,AAAA').success).toBe(false)
    expect(avatarSchema.safeParse('https://exemplo.com/foto.png').success).toBe(false)
    expect(avatarSchema.safeParse('data:image/png;base64,').success).toBe(false)
  })

  it('rejeita acima de 1 MB (data URL maior que o teto)', () => {
    const grande = `data:image/png;base64,${'A'.repeat(AVATAR_MAX_DATA_URL_LENGTH)}`
    expect(avatarSchema.safeParse(grande).success).toBe(false)
  })

  it('aceita uma imagem de exatamente 1 MB codificada', () => {
    const base64 = 'A'.repeat(Math.ceil((AVATAR_MAX_BYTES * 4) / 3))
    expect(avatarSchema.safeParse(`data:image/png;base64,${base64}`).success).toBe(true)
  })
})

describe('Person / signup com avatar', () => {
  it('avatar é opcional no Person', () => {
    expect(personSchema.safeParse({ name: 'Ana', phone: '11999999999', audit }).success).toBe(true)
    expect(personSchema.safeParse({ name: 'Ana', phone: '11999999999', audit, avatar: PNG }).success).toBe(true)
    expect(personSchema.safeParse({ name: 'Ana', phone: '11999999999', audit, avatar: 'oi' }).success).toBe(false)
  })

  it('signup aceita avatar em person', () => {
    const base = { email: 'ana@exemplo.com', password: 'Senha123', restaurantName: 'Cantina', termsAccepted: true }
    expect(signupRequestSchema.safeParse({ ...base, person: { name: 'Ana', phone: '11999999999', avatar: PNG } }).success).toBe(true)
    expect(signupRequestSchema.safeParse({ ...base, person: { name: 'Ana', phone: '11999999999' } }).success).toBe(true)
  })
})
