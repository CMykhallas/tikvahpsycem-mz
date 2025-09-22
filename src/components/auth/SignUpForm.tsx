import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { checkPasswordSecurity, validatePasswordStrength } from '@/utils/passwordSecurity'
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Por favor, insira um endereço de email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type SignUpFormData = z.infer<typeof signUpSchema>

export const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [passwordSecurityStatus, setPasswordSecurityStatus] = useState<{
    isSecure?: boolean
    error?: string
    suggestions?: string[]
  }>({})
  
  const { signUp } = useAuth()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange'
  })

  const watchedPassword = form.watch('password')

  // Verifica a força da senha em tempo real
  const passwordStrength = watchedPassword ? validatePasswordStrength(watchedPassword) : { isStrong: false, suggestions: [] }
  const strengthPercentage = watchedPassword ? Math.min(100, (watchedPassword.length / 12) * 100) : 0

  const handlePasswordChange = async (password: string) => {
    if (password.length < 6) {
      setPasswordSecurityStatus({})
      return
    }

    setIsCheckingPassword(true)
    try {
      const securityCheck = await checkPasswordSecurity(password)
      const strengthCheck = validatePasswordStrength(password)
      
      setPasswordSecurityStatus({
        isSecure: securityCheck.isSecure,
        error: securityCheck.error,
        suggestions: strengthCheck.suggestions
      })
    } catch (error) {
      console.error('Erro ao verificar segurança da senha:', error)
      // Em caso de erro, permite continuar sem verificação
      setPasswordSecurityStatus({
        isSecure: true,
        error: 'Não foi possível verificar a segurança da senha, mas o registro pode continuar'
      })
    } finally {
      setIsCheckingPassword(false)
    }
  }

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    
    try {
      // Procede diretamente com o registro, verificação de senha é opcional
      toast.info('Criando sua conta...')
      const success = await signUp(data.email, data.password, data.fullName)
      
      if (success) {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.')
        form.reset()
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription>
          Junte-se à Tikvah Psycem - Registre-se de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Escolha uma senha forte"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handlePasswordChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  
                  {/* Indicador de força da senha */}
                  {watchedPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={strengthPercentage} 
                          className="flex-1 h-2"
                        />
                        {isCheckingPassword && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        )}
                        {passwordSecurityStatus.isSecure === true && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {passwordSecurityStatus.isSecure === false && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      
                      {passwordSecurityStatus.error && (
                        <Alert variant={passwordSecurityStatus.isSecure === false ? "destructive" : "default"}>
                          <Shield className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {passwordSecurityStatus.error}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {passwordSecurityStatus.suggestions && passwordSecurityStatus.suggestions.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-medium">Sugestões para melhorar a senha:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {passwordSecurityStatus.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirme sua senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}