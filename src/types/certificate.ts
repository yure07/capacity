// Linha da tabela public."CAPACITY" (nomes de colunas exatos do banco).
export type CapacityRow = {
  id: string; // uuid gerado pelo banco
  course_name: string;
  student_name: string;
  course_duration: number;
  start_date: string; // date (YYYY-MM-DD)
  completion_date: string; // date (YYYY-MM-DD)
  cpf: string;
};

// Dados para inserir: o id é sempre gerado pelo banco.
export type NewCertificate = Omit<CapacityRow, "id">;

// Retornado ao admin após a emissão (sem CPF).
export type IssuedCertificate = Omit<CapacityRow, "cpf">;

// Retornado pela função pública validate_certificate (CPF mascarado no banco).
export type PublicCertificate = IssuedCertificate & {
  cpf_masked: string | null;
};
