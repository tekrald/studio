
'use server';
import type { AssetFormData, AssetTransaction } from '@/types/asset';

// This action is now for adding a PHYSICAL ASSET,
// or a transaction to an existing asset (though the form isn't set up for multiple physical transactions)
export async function addAsset(data: AssetFormData, userId: string): Promise<{ success: boolean; error?: string; assetId?: string, transactionId?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  const newTransactionId = `mock-tx-${Date.now()}`;
  const assetIdForLog = `mock-physical-asset-${data.nomeAtivo.replace(/\s+/g, '-')}`;

  console.log('Simulating addition of physical asset (Firebase disabled):', {
    userId,
    assetIdTarget: assetIdForLog, 
    newTransactionId,
    tipoAtivoPrincipal: 'physical', // Hardcoded, as the form is for physical assets
    nomeAtivoPrincipal: data.nomeAtivo,
    
    // Transaction/acquisition details
    dataAquisicaoTransacao: data.dataAquisicao,
    observacoesTransacao: data.observacoes,
    quemComprouTransacao: data.quemComprou,
    contribuicaoParceiro1Transacao: data.contribuicaoParceiro1,
    contribuicaoParceiro2Transacao: data.contribuicaoParceiro2,
    
    // Physical asset specific fields
    tipoImovelBemFisico: data.tipoImovelBemFisico,
    enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico,
    documentacaoFisicoFileName: data.documentacaoFisicoFile?.[0]?.name,
    
    // Designation and release
    assignedToMemberId: data.assignedToMemberId,
    releaseCondition: data.setReleaseCondition && data.releaseTargetAge ? { type: 'age', targetAge: data.releaseTargetAge } : undefined,
  });

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  return { success: true, assetId: assetIdForLog, transactionId: newTransactionId };
}
