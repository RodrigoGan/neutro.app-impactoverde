# 🧪 Guia de Teste - Sistema de Proteção de Nível

## 🎯 **Objetivo**
Este guia ajuda a testar o sistema de proteção de nível de forma rápida e eficiente, mesmo sem avaliações altas reais.

## 🚀 **Como Testar Rápido**

### **Passo 1: Acessar a Página de Demonstração**
```
http://localhost:3000/dashboard/points-demo
```

### **Passo 2: Criar/Logar Usuário de Teste**
1. **Criar usuário**: Use "Criar Usuário de Teste"
2. **Fazer login**: Use "Login com Usuário de Teste"
3. **Verificar**: Progresso deve aparecer na seção "Progresso Atual"

### **Passo 3: Testar Sistema de Proteção (3 Opções)**

#### **Opção A: Modo de Teste Avançado (Mais Rápido)**
1. Clique em **"Ativar Modo de Teste"**
   - Ajusta automaticamente todos os requisitos
   - Facilita level up natural

2. Clique em **"Forçar Level Up Prata (Direto)"**
   - Força level up para Prata
   - Ativa proteção automaticamente
   - Cria notificação de proteção

3. Clique em **"Ver Notificações"**
   - Deve mostrar notificação de proteção
   - Verificar se proteção está ativa

#### **Opção B: Ações de Teste Simuladas**
1. Clique em **"Simular Avaliação Alta"**
   - Adiciona avaliação 4.8 estrelas

2. Clique em **"Simular 15 Coletas"**
   - Adiciona 15 coletas + 300kg

3. Clique em **"Forçar Level Up Prata"**
   - Força level up através das ações

#### **Opção C: Level Up Natural**
1. Use **"Ativar Modo de Teste"** primeiro
2. Adicione pontos com ações normais
3. Sistema deve fazer level up naturalmente

### **Passo 4: Verificar Proteção Ativa**
1. **No Progresso Atual**: Deve mostrar seção "Proteção de Nível Ativa"
2. **Meses de proteção**: Deve mostrar "3 meses"
3. **Data de nível**: Deve mostrar quando alcançou o nível

### **Passo 5: Testar Avaliação de Nível**
1. Clique em **"Avaliar Nível"**
   - Sistema calcula médias dos últimos 3 meses
   - Verifica se pode manter o nível
   - Gera notificações se necessário

### **Passo 6: Verificar Notificações**
1. Clique em **"Ver Notificações"**
2. Deve mostrar:
   - Notificação de proteção (se subiu de nível)
   - Notificação de alerta (se performance caiu)
   - Notificação de queda (se perdeu nível)

## 🔍 **O que Verificar**

### **✅ Indicadores de Sucesso**
- [ ] Usuário sobe de nível (Bronze → Prata → Ouro)
- [ ] Proteção ativada automaticamente (3 meses)
- [ ] Seção "Proteção de Nível Ativa" aparece
- [ ] Notificação de proteção criada
- [ ] Médias mensais calculadas
- [ ] Sistema de avaliação funciona

### **📊 Dados no Banco**
- [ ] `user_progress.protection_months_remaining = 3`
- [ ] `user_progress.level_achieved_date` preenchido
- [ ] `user_progress.notification_type = 'protection'`
- [ ] `level_notifications` com notificação criada

## 🛠️ **Solução de Problemas**

### **Problema: Usuário não sobe de nível**
**Solução**: Use "Ativar Modo de Teste" ou "Forçar Level Up"

### **Problema: Proteção não ativa**
**Solução**: Verifique se o usuário realmente subiu de nível

### **Problema: Notificações não aparecem**
**Solução**: Use "Ver Notificações" e verifique se há dados no banco

### **Problema: Avaliação não funciona**
**Solução**: Verifique se há logs na tabela `points_log`

## 📋 **Checklist de Teste Completo**

### **Teste Básico**
- [ ] Criar usuário de teste
- [ ] Fazer login
- [ ] Ativar modo de teste
- [ ] Forçar level up para Prata
- [ ] Verificar proteção ativa
- [ ] Ver notificações

### **Teste Avançado**
- [ ] Testar avaliação de nível
- [ ] Simular queda de performance
- [ ] Verificar notificação de alerta
- [ ] Testar level up para Ouro
- [ ] Verificar proteção renovada

### **Teste de Edge Cases**
- [ ] Resetar pontos e testar novamente
- [ ] Testar com diferentes tipos de usuário
- [ ] Verificar médias mensais
- [ ] Testar sistema de notificações

## 🎉 **Resultado Esperado**

Após seguir este guia, você deve ter:
- ✅ Usuário com nível Prata ou Ouro
- ✅ Proteção de nível ativa (3 meses)
- ✅ Notificação de proteção criada
- ✅ Sistema de avaliação funcionando
- ✅ Interface mostrando proteção ativa

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Verifique os logs no Supabase
3. Use "Resetar Pontos" e tente novamente
4. Verifique se o SQL foi executado corretamente 