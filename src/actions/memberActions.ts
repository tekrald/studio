
'use server';

import type { MemberFormData } from '@/types/member';

export async function addMember(data: MemberFormData, unionId: string): Promise<{ success: boolean; error?: string; memberId?: string }> {
  if (!unionId) {
    return { success: false, error: 'ID da união não fornecido.' };
  }

  console.log('Simulando adição de membro (Firebase desabilitado):', {
    unionId,
    nome: data.nome,
    tipoRelacao: data.tipoRelacao,
    dataNascimento: data.dataNascimento,
  });

  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  // Em uma implementação real com Firebase, você usaria:
  // try {
  //   const memberDataToSave = {
  //     unionId,
  //     ...data,
  //     createdAt: serverTimestamp(),
  //     updatedAt: serverTimestamp(),
  //   };
  //   const docRef = await addDoc(collection(db!, 'members'), memberDataToSave);
  //   return { success: true, memberId: docRef.id };
  // } catch (error) {
  //   console.error('Erro ao adicionar membro:', error);
  //   return { success: false, error: 'Falha ao adicionar membro no Firestore.' };
  // }

  return { success: true, memberId: `mock-member-${Date.now()}` };
}
