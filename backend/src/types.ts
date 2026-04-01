// ─── ROPA — Registro de Operações de Tratamento de Dados ────────────────────
// Modelo completo conforme Art. 37 da LGPD e recomendações da ANPD

export interface RopaRegistro {
  // ── Identificação ────────────────────────────────────────────────
  id: number;
  nomeProcesso: string;          // Nome do processo de negócio (ex: "Prontuário Eletrônico")
  secretaria: string;            // Secretaria/setor responsável pelo tratamento
  dpoResponsavel: string;        // Nome do DPO ou servidor responsável

  // ── Classificação ────────────────────────────────────────────────
  sistema: string;               // Sistema de informação onde os dados estão (ex: "PEC e-SUS")
  finalidade: string;            // Por que os dados são tratados
  descricaoFluxo: string;        // Como os dados fluem dentro da Prefeitura (entrada → processamento → saída)

  // ── Dados e Titulares ────────────────────────────────────────────
  categorias: string[];          // Categorias de dados pessoais coletados
  categoriasSensiveis: string[]; // Dados sensíveis (art. 5°, II LGPD), se houver
  titulares: string;             // Quem são os titulares (ex: "Pacientes SUS")

  // ── Base Legal ───────────────────────────────────────────────────
  baseLegal: string;             // Fundamento legal do tratamento (Art. 7° ou 11° LGPD)
  hipoteseTratamento: string;    // Ex: "Execução de política pública", "Consentimento", etc.

  // ── Armazenamento e Retenção ─────────────────────────────────────
  armazenamento: string;         // Onde os dados são armazenados (ex: "Servidor local + backup em nuvem")
  retencao: string;              // Prazo de retenção (ex: "20 anos conforme Res. CFM 1.638/2002")

  // ── Operadores e Compartilhamento ────────────────────────────────
  operador: string;              // Operador do tratamento (quem processa em nome da Prefeitura)
  compartilhamento: string;      // Com quem os dados são compartilhados (terceiros, outros órgãos)
  transferenciaInternacional: boolean; // Há transferência internacional de dados?
  paisDestino?: string;          // Se sim, qual país

  // ── Segurança ────────────────────────────────────────────────────
  medidasSeguranca: string;      // Controles técnicos e administrativos aplicados

  // ── Metadados ────────────────────────────────────────────────────
  criadoEm: string;
  atualizadoEm: string;
}

// ─── DSR — Requisição de Titular de Dados ───────────────────────────────────
export interface DsrRequisicao {
  id: string;           // Protocolo RC-XXXXXX
  nome: string;
  cpf: string;          // Armazenado sem máscara
  email: string;
  tipo: 'Acesso' | 'Correção' | 'Eliminação' | 'Portabilidade' | 'Revogação' | 'Oposição' | 'Anonimização';
  descricao: string;
  status: 'Pendente' | 'Em Análise' | 'Concluído' | 'Indeferido';
  dataCriacao: string;
  prazoLegal: string;   // 15 dias corridos
  dataConclusao?: string;
  observacoesDpo?: string;
}
