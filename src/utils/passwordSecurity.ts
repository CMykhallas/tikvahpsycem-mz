import * as sha1 from 'js-sha1'

/**
 * Verifica se uma senha foi comprometida em violações de dados usando a API HaveIBeenPwned
 * Utiliza o método de anonimato-k para garantir privacidade - apenas os primeiros 5 caracteres
 * do hash SHA-1 são enviados para a API
 * 
 * @param password - A senha a ser verificada
 * @returns Promise<{ isSecure: boolean, error?: string }> - Resultado da verificação
 */
export async function checkPasswordSecurity(password: string): Promise<{ isSecure: boolean, error?: string }> {
  if (!password || password.length < 6) {
    return { isSecure: false, error: 'A senha deve ter pelo menos 6 caracteres' }
  }

  try {
    // Gera hash SHA-1 da senha
    const passwordHash = (sha1 as any)(password).toUpperCase()
    const firstFiveChars = passwordHash.substring(0, 5)
    const remainingHash = passwordHash.substring(5)

    // Faz request para API HaveIBeenPwned com apenas os primeiros 5 caracteres
    const apiUrl = `https://api.pwnedpasswords.com/range/${firstFiveChars}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Tikvah-Psycem-Password-Checker'
      }
    })

    if (!response.ok) {
      console.warn('Falha na comunicação com a API de verificação de senha. Continuando sem verificação extra.')
      // Falha segura: permite o registro se a API estiver indisponível
      return { isSecure: true, error: 'Não foi possível verificar a segurança da senha, mas o registro pode continuar' }
    }

    const responseText = await response.text()
    const hashSuffixes = responseText.split('\r\n')

    // Verifica se o hash da senha está na lista de senhas comprometidas
    const isCompromised = hashSuffixes.some(line => {
      const hashSuffix = line.split(':')[0]
      return hashSuffix === remainingHash
    })

    if (isCompromised) {
      return { 
        isSecure: false, 
        error: 'Esta senha foi comprometida em violações de dados conhecidas. Por favor, escolha uma senha diferente.' 
      }
    }

    return { isSecure: true }

  } catch (error) {
    console.error('Erro ao verificar segurança da senha:', error)
    // Falha segura: permite o registro se houver erro de rede
    return { 
      isSecure: true, 
      error: 'Erro de rede ao verificar a senha. O registro pode continuar, mas recomendamos usar uma senha forte.' 
    }
  }
}

/**
 * Valida a força da senha baseada em critérios de segurança
 * @param password - A senha a ser validada
 * @returns { isStrong: boolean, suggestions: string[] } - Resultado da validação
 */
export function validatePasswordStrength(password: string): { isStrong: boolean, suggestions: string[] } {
  const suggestions: string[] = []
  let isStrong = true

  if (password.length < 8) {
    suggestions.push('Use pelo menos 8 caracteres')
    isStrong = false
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Inclua pelo menos uma letra minúscula')
    isStrong = false
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Inclua pelo menos uma letra maiúscula')
    isStrong = false
  }

  if (!/\d/.test(password)) {
    suggestions.push('Inclua pelo menos um número')
    isStrong = false
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    suggestions.push('Inclua pelo menos um caractere especial (!@#$%^&*)')
    isStrong = false
  }

  // Verifica sequências comuns
  const commonSequences = ['123456', 'abcdef', 'qwerty', 'password', 'admin']
  if (commonSequences.some(seq => password.toLowerCase().includes(seq))) {
    suggestions.push('Evite sequências comuns como "123456" ou "qwerty"')
    isStrong = false
  }

  return { isStrong, suggestions }
}