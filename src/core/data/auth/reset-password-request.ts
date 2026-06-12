/**
 * Corpo de POST /auth/reset-password. A validação da política de senha vive na
 * API (resetPasswordSchema); aqui o tipo apenas descreve o contrato do request.
 */
export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmNewPassword: string
}
