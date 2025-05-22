
export interface AssetBase {
  id?: string;
  userId: string;
  nomeAtivo: string;
  descricaoDetalhada: string;
  valorAtualEstimado: number;
  // observacoesInvestimento: string; // Removido
  dataAquisicao: Date;
  tipo: 'digital' | 'fisico';
  quemComprou?: string; 
  contribuicaoParceiro1?: number; // Novo campo
  contribuicaoParceiro2?: number; // Novo campo
}

export interface DigitalAsset extends AssetBase {
  tipo: 'digital';
  tipoCriptoAtivoDigital: string;
  quantidadeDigital: number;
  valorPagoEpocaDigital: number;
}

export interface PhysicalAsset extends AssetBase {
  tipo: 'fisico';
  tipoImovelBemFisico: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisico?: string; // Placeholder for file path or URL
}

export type Asset = DigitalAsset | PhysicalAsset;

export type AssetFormData = Omit<DigitalAsset, 'id' | 'userId' | 'tipo' | 'observacoesInvestimento'> | Omit<PhysicalAsset, 'id' | 'userId' | 'tipo' | 'observacoesInvestimento'> & {
  tipo: 'digital' | 'fisico';
  // Campos comuns para validação unificada, antes de serem divididos
  nomeAtivo: string;
  descricaoDetalhada: string;
  valorAtualEstimado: number;
  // observacoesInvestimento: string; // Removido
  dataAquisicao: Date;
  quemComprou?: string; 
  contribuicaoParceiro1?: number; // Novo campo
  contribuicaoParceiro2?: number; // Novo campo
  // Digitais
  tipoCriptoAtivoDigital?: string;
  quantidadeDigital?: number;
  valorPagoEpocaDigital?: number;
  // Físicos
  tipoImovelBemFisico?: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisicoFile?: FileList; // Para o input de arquivo
};
