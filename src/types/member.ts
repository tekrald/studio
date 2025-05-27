
export interface MemberBase {
  id?: string;
  unionId: string; // To associate with the main union/family node
  nome: string;
  tipoRelacao: 'filho_a' | 'pai_mae' | 'conjuge_parceiro_a' | 'outro_parente' | string;
  dataNascimento?: Date;
  walletAddress?: string; // Optional wallet address for the member
}

export type Member = MemberBase;

// MemberFormData reflects that tipoRelacao is no longer a direct form field for "Add Child"
// but the full data type (MemberFormData) still expects tipoRelacao for the onSubmit function of AddMemberForm.
export type MemberFormData = Omit<MemberBase, 'id' | 'unionId'> & {
  // Specific form fields, if necessary, but for now they are the same as the base
  // walletAddress will be part of this as MemberBase is extended
};

