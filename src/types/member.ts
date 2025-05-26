
export interface MemberBase {
  id?: string;
  unionId: string; // Para associar ao nó da união/família principal
  nome: string;
  tipoRelacao: 'filho_a' | 'pai_mae' | 'conjuge_parceiro_a' | 'outro_parente' | string; // Mantido para flexibilidade do modelo de dados
  dataNascimento?: Date;
}

export type Member = MemberBase;

// MemberFormData agora reflete que tipoRelacao não é mais um campo direto do formulário para "Adicionar Filho(a)"
// mas o tipo de dados completo (MemberFormData) ainda espera tipoRelacao para a função onSubmit do AddMemberForm.
export type MemberFormData = Omit<MemberBase, 'id' | 'unionId'> & {
  // Campos específicos do formulário, se necessário, mas por enquanto são os mesmos da base
};
