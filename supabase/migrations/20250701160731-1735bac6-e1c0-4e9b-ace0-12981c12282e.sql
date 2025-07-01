
-- Criar enum para status dos usuários
CREATE TYPE user_status AS ENUM ('Teste 7 dias', 'Ativado', 'Cancelado', 'Vencido');

-- Adicionar colunas de status e controle de tempo na tabela users
ALTER TABLE public.users 
ADD COLUMN status user_status DEFAULT 'Teste 7 dias',
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days');

-- Criar função para verificar e atualizar status expirados
CREATE OR REPLACE FUNCTION check_expired_users()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users 
  SET status = 'Vencido'
  WHERE status IN ('Teste 7 dias', 'Ativado') 
    AND expires_at < now();
END;
$$;

-- Criar trigger para verificar usuários expirados periodicamente
-- (Nota: Em produção, seria melhor usar um cron job)
CREATE OR REPLACE FUNCTION trigger_check_expired()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM check_expired_users();
  RETURN NEW;
END;
$$;

-- Políticas RLS para permitir admin ver todos os usuários
CREATE POLICY "Admin pode ver todos os usuários" 
ON public.users 
FOR SELECT 
USING (true);

-- Política para permitir admin atualizar status dos usuários
CREATE POLICY "Admin pode atualizar usuários" 
ON public.users 
FOR UPDATE 
USING (true);
