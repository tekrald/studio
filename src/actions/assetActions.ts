
'use server';
import type { AssetFormData, AssetTransaction } from '@/types/asset';

// Esta action agora é para adicionar um ATIVO FÍSICO,
// ou uma transação a um ativo existente (embora o form não esteja configurado para transações múltiplas em físicos)
export async function addAsset(data: AssetFormData, userId: string): Promise<{ success: boolean; error?: string; assetId?: string, transactionId?: string }> {
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const newTransactionId = `mock-tx-${Date.now()}`;
  const assetIdForLog = `mock-physical-asset-${data.nomeAtivo.replace(/\s+/g, '-')}`;

  console.log('Simulando adição de ativo físico (Firebase desabilitado):', {
    userId,
    assetIdTarget: assetIdForLog, 
    newTransactionId,
    tipoAtivoPrincipal: 'fisico', // Hardcoded, pois o form é para físicos
    nomeAtivoPrincipal: data.nomeAtivo,
    
    // Detalhes da transação/aquisição
    dataAquisicaoTransacao: data.dataAquisicao,
    observacoesTransacao: data.observacoes,
    quemComprouTransacao: data.quemComprou,
    contribuicaoParceiro1Transacao: data.contribuicaoParceiro1,
    contribuicaoParceiro2Transacao: data.contribuicaoParceiro2,
    
    // Campos específicos de ativo físico
    tipoImovelBemFisico: data.tipoImovelBemFisico,
    enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico,
    documentacaoFisicoFileName: data.documentacaoFisicoFile?.[0]?.name,
    
    // Designação e liberação
    assignedToMemberId: data.assignedToMemberId,
    releaseCondition: data.setReleaseCondition && data.releaseTargetAge ? { type: 'age', targetAge: data.releaseTargetAge } : undefined,
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true, assetId: assetIdForLog, transactionId: newTransactionId };
}
