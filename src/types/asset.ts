
export interface AssetBase {
  id?: string;
  userId: string;
  nomeAtivo: string;
  observacoes?: string; 
  dataAquisicao: Date;
  tipo: 'digital' | 'fisico';
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
  assignedToMemberId?: string;
  releaseCondition?: { type: 'age'; targetAge: number };
}

export interface DigitalAsset extends AssetBase {
  tipo: 'digital';
  // tipoAtivoDigital: 'cripto' | 'nft' | string; // Removido
  quantidadeDigital: number;
  valorPagoEpocaDigital: number; 
}

export interface PhysicalAsset extends AssetBase {
  tipo: 'fisico';
  tipoImovelBemFisico: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisico?: string; 
}

export type Asset = DigitalAsset | PhysicalAsset;

export type AssetFormData = Omit<AssetBase, 'id' | 'userId'> & {
  // tipoAtivoDigital?: 'cripto' | 'nft' | string; // Removido
  quantidadeDigital?: number;
  valorPagoEpocaDigital?: number;
  
  tipoImovelBemFisico?: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisicoFile?: FileList;

  setReleaseCondition?: boolean; // Campo auxiliar para o form
  releaseTargetAge?: number; // Campo auxiliar para o form
};
