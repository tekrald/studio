
'use server';
import type { AssetFormData, AssetTransaction } from '@/types/asset';

export async function addAsset(data: AssetFormData, userId: string): Promise<{ success: boolean; error?: string; assetId?: string, transactionId?: string }> {
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const newTransactionId = `mock-tx-${Date.now()}`;
  // O assetId seria o ID do ativo principal. Se é um novo ativo, geramos um novo.
  // Se é uma nova transação para um ativo existente, o assetId viria da UI.
  // Por enquanto, o mock do dashboard gerencia isso.
  const assetIdForLog = `mock-asset-${data.nomeAtivo.replace(/\s+/g, '-')}`;

  console.log('Simulando adição de transação de ativo (Firebase desabilitado):', {
    userId,
    assetIdTarget: assetIdForLog, // A qual ativo esta transação se refere
    newTransactionId,
    tipoAtivoPrincipal: data.tipo,
    nomeAtivoPrincipal: data.nomeAtivo,
    
    // Detalhes da transação específica
    dataAquisicaoTransacao: data.dataAquisicao,
    observacoesTransacao: data.observacoes,
    quemComprouTransacao: data.quemComprou,
    contribuicaoParceiro1Transacao: data.contribuicaoParceiro1,
    contribuicaoParceiro2Transacao: data.contribuicaoParceiro2,
    
    quantidadeDigitalTransacao: data.quantidadeDigital,
    valorPagoEpocaDigitalTransacao: data.valorPagoEpocaDigital, 
    
    // Campos para a primeira transação de um ativo físico
    tipoImovelBemFisico: data.tipoImovelBemFisico,
    enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico,
    documentacaoFisicoFileName: data.documentacaoFisicoFile?.[0]?.name,
    
    // Designação e liberação (pertencem ao ativo principal, mas podem ser definidos na primeira transação)
    assignedToMemberId: data.assignedToMemberId,
    releaseCondition: data.setReleaseCondition && data.releaseTargetAge ? { type: 'age', targetAge: data.releaseTargetAge } : undefined,
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // Em uma implementação real com Firebase, você faria:
  // 1. Verificar se o ativo 'nomeAtivo' para 'userId' e 'assignedToMemberId' já existe.
  // 2. Se não existe, criar um novo documento de ativo com a primeira transação.
  // 3. Se existe, adicionar a nova transação a uma subcoleção 'transactions' do ativo existente
  //    e atualizar campos consolidados (como quantidadeTotalDigital).

  return { success: true, assetId: assetIdForLog, transactionId: newTransactionId };
}
