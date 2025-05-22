
'use server';
// import type { User } from 'firebase/auth'; // Firebase Auth não está sendo usado no momento
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore não está sendo usado no momento
// import { db } from '@/lib/firebase'; // db será null
import type { AssetFormData, DigitalAsset, PhysicalAsset } from '@/types/asset';
// import { auth } from '@/lib/firebase'; // auth será null

export async function addAsset(data: AssetFormData, userId: string): Promise<{ success: boolean; error?: string; assetId?: string }> {
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  console.log('Simulando adição de ativo (Firebase desabilitado):', data);

  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  // Retorna um sucesso mockado, já que o Firebase está desabilitado
  // A lógica de diferenciar assetData digital/físico é mantida para estrutura, mas não é salva.
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
  //   let assetData;
  //   if (data.tipo === 'digital') {
  //     assetData = { ... } as Omit<DigitalAsset, 'id'>;
  //   } else if (data.tipo === 'fisico') {
  //     assetData = { ... } as Omit<PhysicalAsset, 'id'>;
  //   }
  //   const docRef = await addDoc(collection(db!, 'assets'), assetData); // db! aqui assume que db não é null
  //   return { success: true, assetId: docRef.id };
  // } catch (error) {
  //   console.error('Erro ao adicionar ativo:', error);
  //   return { success: false, error: 'Falha ao adicionar ativo no Firestore.' };
  // }

  return { success: true, assetId: `mock-asset-${Date.now()}` };
}
