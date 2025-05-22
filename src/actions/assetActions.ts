
'use server';
// import type { User } from 'firebase/auth'; // Firebase Auth não está sendo usado no momento
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore não está sendo usado no momento
// import { db } from '@/lib/firebase'; // db será null
import type { AssetFormData } from '@/types/asset';
// import { auth } from '@/lib/firebase'; // auth será null

export async function addAsset(data: AssetFormData, userId: string): Promise<{ success: boolean; error?: string; assetId?: string }> {
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  console.log('Simulando adição de ativo (Firebase desabilitado):', {
    userId,
    tipo: data.tipo,
    nomeAtivo: data.nomeAtivo,
    dataAquisicao: data.dataAquisicao,
    observacoes: data.observacoes,
    quemComprou: data.quemComprou,
    contribuicaoParceiro1: data.contribuicaoParceiro1,
    contribuicaoParceiro2: data.contribuicaoParceiro2,
    // Campos específicos (serão undefined se não aplicável ao tipo)
    // tipoAtivoDigital: data.tipoAtivoDigital, // Removido
    quantidadeDigital: data.quantidadeDigital,
    valorPagoEpocaDigital: data.valorPagoEpocaDigital, 
    tipoImovelBemFisico: data.tipoImovelBemFisico,
    enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico,
    documentacaoFisicoFileName: data.documentacaoFisicoFile?.[0]?.name,
    assignedToMemberId: data.assignedToMemberId,
    releaseCondition: data.releaseCondition,
  });

  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  let assetTypeForLog: string;
  if (data.tipo === 'digital') {
    assetTypeForLog = 'digital';
  } else if (data.tipo === 'fisico') {
    assetTypeForLog = 'fisico';
  } else {
    return { success: false, error: 'Tipo de ativo inválido.' };
  }

  console.log(`Tipo de ativo simulado: ${assetTypeForLog}`);
  
  // Em uma implementação real com Firebase, você usaria:
  // try {
  //   const commonData = {
  //     userId,
  //     nomeAtivo: data.nomeAtivo,
  //     observacoes: data.observacoes,
  //     quemComprou: data.quemComprou || '',
  //     contribuicaoParceiro1: data.contribuicaoParceiro1,
  //     contribuicaoParceiro2: data.contribuicaoParceiro2,
  //     dataAquisicao: data.dataAquisicao, 
  //     tipo: data.tipo,
  //     assignedToMemberId: data.assignedToMemberId,
  //     releaseCondition: data.releaseCondition,
  //     createdAt: serverTimestamp(),
  //     updatedAt: serverTimestamp(),
  //   };
  //   let assetDataToSave;
  //   if (data.tipo === 'digital') {
  //     assetDataToSave = {
  //       ...commonData,
  //       // tipoAtivoDigital: data.tipoAtivoDigital!, // Removido
  //       quantidadeDigital: data.quantidadeDigital!,
  //       valorPagoEpocaDigital: data.valorPagoEpocaDigital!,
  //     } 
  //   } else { // fisico
  //     assetDataToSave = {
  //       ...commonData,
  //       tipoImovelBemFisico: data.tipoImovelBemFisico!,
  //       enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico || '',
  //       // documentacaoFisico: "url_do_arquivo_no_storage" 
  //     } 
  //   }
  //   const docRef = await addDoc(collection(db!, 'assets'), assetDataToSave); 
  //   return { success: true, assetId: docRef.id };
  // } catch (error) {
  //   console.error('Erro ao adicionar ativo:', error);
  //   return { success: false, error: 'Falha ao adicionar ativo no Firestore.' };
  // }

  return { success: true, assetId: `mock-asset-${Date.now()}` };
}
