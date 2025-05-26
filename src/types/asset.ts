
export interface AssetTransaction {
  id: string; 
  dataAquisicao: Date;
  quantidadeDigital?: number; 
  valorPagoEpoca?: number; 
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
  observacoes?: string;
}

export interface AssetBase {
  id?: string; 
  userId: string;
  nomeAtivo: string;
  tipo: 'digital' | 'fisico';
  assignedToMemberId?: string;
  releaseCondition?: { type: 'age'; targetAge: number };
  observacoesGerais?: string; 
}

export interface DigitalAsset extends AssetBase {
  tipo: 'digital';
  quantidadeTotalDigital: number; 
  transactions: AssetTransaction[];
}

export interface PhysicalAsset extends AssetBase {
  tipo: 'fisico';
  tipoImovelBemFisico: string; // Mantido para ativos físicos
  enderecoLocalizacaoFisico?: string; // Mantido
  documentacaoFisico?: string; 
  transactions: AssetTransaction[]; 
}

export type Asset = DigitalAsset | PhysicalAsset;

// AssetFormData agora é exclusivamente para adicionar um NOVO ATIVO FÍSICO
export type AssetFormData = {
  // tipo: 'fisico'; // Implícito
  nomeAtivo: string; 
  dataAquisicao: Date;
  observacoes?: string; 
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
  
  // Campos específicos para a primeira transação de um ativo físico
  tipoImovelBemFisico: string; 
  enderecoLocalizacaoFisico?: string; 
  documentacaoFisicoFile?: FileList;

  assignedToMemberId?: string; 
  setReleaseCondition?: boolean; 
  releaseTargetAge?: number; 
};
