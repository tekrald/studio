
export interface AssetBase {
  id?: string;
  userId: string;
  nomeAtivo: string;
  observacoes?: string; // Alterado de descricaoDetalhada para observacoes e tornado opcional
  // valorAtualEstimado: number; // Removido
  dataAquisicao: Date;
  tipo: 'digital' | 'fisico';
  quemComprou?: string;
  contribuicaoParceiro1?: number;
  contribuicaoParceiro2?: number;
}

export interface DigitalAsset extends AssetBase {
  tipo: 'digital';
  tipoAtivoDigital: 'cripto' | 'nft' | string; // Alterado de tipoCriptoAtivoDigital, string para outros tipos
  quantidadeDigital: number;
  valorPagoEpocaDigital: number; // Label será "Valor do ativo no momento da compra"
}

export interface PhysicalAsset extends AssetBase {
  tipo: 'fisico';
  tipoImovelBemFisico: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisico?: string; // Placeholder for file path or URL
}

export type Asset = DigitalAsset | PhysicalAsset;

// Mantendo AssetFormData para consistência, mas os campos específicos são opcionais
// e validados condicionalmente no formulário.
export type AssetFormData = Omit<AssetBase, 'id' | 'userId' | 'tipo'> & {
  tipo: 'digital' | 'fisico'; // Obrigatório para o formulário distinguir
  // Digitais - campos opcionais na base, mas podem ser obrigatórios no form
  tipoAtivoDigital?: 'cripto' | 'nft' | string;
  quantidadeDigital?: number;
  valorPagoEpocaDigital?: number;
  // Físicos - campos opcionais na base
  tipoImovelBemFisico?: string;
  enderecoLocalizacaoFisico?: string;
  documentacaoFisicoFile?: FileList;
};
