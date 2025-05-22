
export interface MemberBase {
  id?: string;
  unionId: string; // Para associar ao nó da união/família principal
  nome: string;
  tipoRelacao: 'filho_a' | 'pai_mae' | 'conjuge_parceiro_a' | 'outro_parente' | string;
  dataNascimento?: Date;
}

export type Member = MemberBase;

export type MemberFormData = Omit<MemberBase, 'id' | 'unionId'> & {
  // Campos específicos do formulário, se necessário, mas por enquanto são os mesmos da base
};
