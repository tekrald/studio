
'use server';
import type { User } from 'firebase/auth'; // Assuming you have a way to get the current user
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Your Firebase config and Firestore instance
import type { AssetFormData, DigitalAsset, PhysicalAsset } from '@/types/asset';
import { auth } from '@/lib/firebase'; // Assuming auth is exported from your firebase setup

export async function addAsset(data: AssetFormData, userId: string): Promise<{ success: boolean; error?: string; assetId?: string }> {
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  try {
    let assetData;

    if (data.tipo === 'digital') {
      assetData = {
        userId,
        tipo: data.tipo,
        nomeAtivo: data.nomeAtivo,
        descricaoDetalhada: data.descricaoDetalhada,
        valorAtualEstimado: Number(data.valorAtualEstimado),
        observacoesInvestimento: data.observacoesInvestimento,
        dataAquisicao: new Date(data.dataAquisicao),
        tipoCriptoAtivoDigital: data.tipoCriptoAtivoDigital,
        quantidadeDigital: Number(data.quantidadeDigital),
        valorPagoEpocaDigital: Number(data.valorPagoEpocaDigital),
        criadoEm: serverTimestamp(),
      } as Omit<DigitalAsset, 'id'>;
    } else if (data.tipo === 'fisico') {
      assetData = {
        userId,
        tipo: data.tipo,
        nomeAtivo: data.nomeAtivo,
        descricaoDetalhada: data.descricaoDetalhada,
        valorAtualEstimado: Number(data.valorAtualEstimado),
        observacoesInvestimento: data.observacoesInvestimento,
        dataAquisicao: new Date(data.dataAquisicao),
        tipoImovelBemFisico: data.tipoImovelBemFisico,
        enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico,
        // documentacaoFisico: "placeholder_file_path_or_url", // Handle actual file upload separately
        criadoEm: serverTimestamp(),
      } as Omit<PhysicalAsset, 'id'>;
    } else {
      return { success: false, error: 'Tipo de ativo inválido.' };
    }

    const docRef = await addDoc(collection(db, 'assets'), assetData);
    return { success: true, assetId: docRef.id };
  } catch (error) {
    console.error('Erro ao adicionar ativo:', error);
    return { success: false, error: 'Falha ao adicionar ativo no Firestore.' };
  }
}
