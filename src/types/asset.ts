
export interface AssetTransaction {
  id: string; // ID único para a transação
  dataAquisicao: Date;
  quantidadeDigital?: number; // Usado para ativos digitais
  valorPagoEpoca?: number; // Valor pago para esta transação específica
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
  observacoes?: string;
}

export interface AssetBase {
  id?: string; // ID do ativo principal
  userId: string;
  nomeAtivo: string;
  tipo: 'digital' | 'fisico';
  assignedToMemberId?: string;
  releaseCondition?: { type: 'age'; targetAge: number };
  // Detalhes da primeira/última transação ou informações gerais do ativo podem ficar aqui,
  // mas o histórico detalhado estará em 'transactions'
  // Observações gerais sobre o ativo, não sobre uma transação específica
  observacoesGerais?: string; 
}

export interface DigitalAsset extends AssetBase {
  tipo: 'digital';
  // A quantidade total será a soma das quantidades nas transações
  quantidadeTotalDigital: number; 
  transactions: AssetTransaction[];
}

export interface PhysicalAsset extends AssetBase {
  tipo: 'fisico';
  tipoImovelBemFisico: string;
  enderecoLocalizacaoFisico?: string;
  // Para ativos físicos, a noção de múltiplas "transações" pode ser diferente.
  // Poderia ser um histórico de reformas, grandes manutenções, ou a aquisição inicial.
  // Por simplicidade, podemos usar uma estrutura similar ou apenas a primeira aquisição como uma transação.
  documentacaoFisico?: string; 
  transactions: AssetTransaction[]; // Para armazenar a aquisição inicial e/ou outras entradas relevantes
}

export type Asset = DigitalAsset | PhysicalAsset;

// AssetFormData agora representa os dados para UMA NOVA TRANSAÇÃO/AQUISIÇÃO
export type AssetFormData = {
  // Campos do formulário que definem uma nova transação ou a primeira aquisição
  tipo: 'digital' | 'fisico';
  nomeAtivo: string; // Nome do ativo ao qual esta transação pertence
  dataAquisicao: Date;
  observacoes?: string; // Observações desta transação específica
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
  
  quantidadeDigital?: number; // Quantidade desta transação (se digital)
  valorPagoEpocaDigital?: number; // Valor pago nesta transação (se digital)
  
  tipoImovelBemFisico?: string; // Se for a primeira transação de um ativo físico
  enderecoLocalizacaoFisico?: string; // Se for a primeira transação de um ativo físico
  documentacaoFisicoFile?: FileList;

  assignedToMemberId?: string; // A quem o ativo principal está/será designado
  setReleaseCondition?: boolean; 
  releaseTargetAge?: number; 
};
