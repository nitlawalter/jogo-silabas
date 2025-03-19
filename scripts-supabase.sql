-- Criar tabela de sessões de jogo
create table sessoes_jogo (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    nivel integer not null,
    data_inicio timestamp with time zone default timezone('utc'::text, now()) not null,
    data_fim timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de tentativas
create table tentativas (
    id uuid default uuid_generate_v4() primary key,
    sessao_id uuid references sessoes_jogo(id) not null,
    palavra text not null,
    acertou boolean not null,
    tempo_gasto integer not null, -- em segundos
    tentativas_ate_acerto integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar políticas de segurança RLS (Row Level Security)

-- Políticas para sessoes_jogo
alter table sessoes_jogo enable row level security;

create policy "Usuários podem ver apenas suas próprias sessões"
    on sessoes_jogo for select
    using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias sessões"
    on sessoes_jogo for insert
    with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias sessões"
    on sessoes_jogo for update
    using (auth.uid() = user_id);

-- Políticas para tentativas
alter table tentativas enable row level security;

create policy "Usuários podem ver tentativas de suas sessões"
    on tentativas for select
    using (
        exists (
            select 1 from sessoes_jogo
            where sessoes_jogo.id = tentativas.sessao_id
            and sessoes_jogo.user_id = auth.uid()
        )
    );

create policy "Usuários podem inserir tentativas em suas sessões"
    on tentativas for insert
    with check (
        exists (
            select 1 from sessoes_jogo
            where sessoes_jogo.id = tentativas.sessao_id
            and sessoes_jogo.user_id = auth.uid()
        )
    );

-- Criar índices para melhor performance
create index idx_sessoes_user_id on sessoes_jogo(user_id);
create index idx_tentativas_sessao_id on tentativas(sessao_id);
create index idx_tentativas_palavra on tentativas(palavra);
create index idx_sessoes_data_inicio on sessoes_jogo(data_inicio);

-- Criar função para retornar o progresso do usuário
create or replace function obter_progresso_usuario(p_user_id uuid)
returns table (
    nivel integer,
    total_sessoes bigint,
    total_tentativas bigint,
    total_acertos bigint,
    tempo_medio_por_palavra numeric,
    media_tentativas_por_palavra numeric
) 
security definer
set search_path = public
language plpgsql
as $$
begin
    return query
    select 
        s.nivel,
        count(distinct s.id)::bigint as total_sessoes,
        count(t.id)::bigint as total_tentativas,
        sum(case when t.acertou then 1 else 0 end)::bigint as total_acertos,
        round(avg(t.tempo_gasto)::numeric, 2) as tempo_medio_por_palavra,
        round(avg(t.tentativas_ate_acerto)::numeric, 2) as media_tentativas_por_palavra
    from sessoes_jogo s
    left join tentativas t on t.sessao_id = s.id
    where s.user_id = p_user_id
    group by s.nivel;
end;
$$; 