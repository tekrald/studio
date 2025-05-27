
'use server';

import type { MemberFormData } from '@/types/member';

export async function addMember(data: MemberFormData, unionId: string): Promise<{ success: boolean; error?: string; memberId?: string }> {
  if (!unionId) {
    return { success: false, error: 'Union ID not provided.' };
  }

  console.log('Simulating member addition (Firebase disabled):', {
    unionId,
    nome: data.nome,
    tipoRelacao: data.tipoRelacao, // e.g., 'filho_a' (child)
    dataNascimento: data.dataNascimento,
    walletAddress: data.walletAddress, // Log the wallet address
  });

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true, memberId: `mock-member-${Date.now()}` };
}
