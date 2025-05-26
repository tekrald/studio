
export interface AssetTransaction {
  id: string;
  dataAquisicao: Date;
  quantidadeDigital?: number;
  valorPagoEpoca?: number | string; // Allow string for flexible input, parse to number on save
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
  observacoes?: string; // Transaction specific notes
  // Physical asset specific details, if applicable to the transaction
  tipoImovelBemFisico?: string;
  enderecoLocalizacaoFisico?: string;
}

export interface AssetBase {
  id: string; // Now mandatory for existing assets
  userId: string;
  nomeAtivo: string;
  tipo: 'digital' | 'fisico';
  assignedToMemberId?: string;
  releaseCondition?: { type: 'age'; targetAge: number };
  observacoes?: string; // General asset notes, distinct from transaction notes
  transactions: AssetTransaction[];
}

export interface DigitalAsset extends AssetBase {
  tipo: 'digital';
  quantidadeTotalDigital: number;
}

export interface PhysicalAsset extends AssetBase {
  tipo: 'fisico';
  tipoImovelBemFisico: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisico?: string; // URL or reference to stored document
}

export type Asset = DigitalAsset | PhysicalAsset;

// For AssetForm - representing data for a NEW transaction or the FIRST transaction of a new asset
export type AssetFormData = {
  // For identifying/creating the main asset (only for new assets)
  nomeAtivo: string; // Name of the asset (e.g., "Bitcoin", "Beach House")

  // Details for the specific transaction being added
  dataAquisicao: Date;
  observacoes?: string; // Notes for THIS specific transaction
  quemComprou?: string; // Who made THIS specific transaction
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;

  // Digital asset specific transaction fields
  quantidadeDigital?: number;
  valorPagoEpocaDigital?: number | string; // Value paid for THIS digital asset transaction

  // Physical asset specific transaction fields
  tipoImovelBemFisico?: string; // Only if it's a physical asset
  enderecoLocalizacaoFisico?: string; // Only if it's a physical asset
  documentacaoFisicoFile?: FileList; // Only for physical assets

  // For overall asset assignment and release (applies to the asset, not individual transactions)
  assignedToMemberId?: string;
  setReleaseCondition?: boolean;
  releaseTargetAge?: number;
};

// Extended data structure for nodes in React Flow, especially AssetNode
export interface ExtendedAssetNodeData extends AssetBase {
  // Inherits id, userId, nomeAtivo, tipo, assignedToMemberId, releaseCondition, observacoes, transactions
  quantidadeTotalDigital?: number; // For digital assets, sum of transactions
  tipoImovelBemFisico?: string; // For physical assets
  enderecoLocalizacaoFisico?: string; // For physical assets
  isAutoLoaded?: boolean;
  onOpenDetails: () => void;
  onOpenReleaseDialog?: (assetData: ExtendedAssetNodeData) => void; // Callback to open release dialog
}
