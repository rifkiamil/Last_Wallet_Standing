export interface Agent {
  id: number;
  balance: number;
  active: boolean; // False if bankrupt (and debt not allowed)
  peakBalance: number;
  transactionCount: number;
}

export interface SimulationSettings {
  agentCount: number;
  initialBalance: number;
  transactionsPerRound: number;
  allowDebt: boolean;
  transactionAmount: number;
}

export interface GameStats {
  round: number;
  totalTransactions: number;
  activeAgents: number;
  giniCoefficient: number;
  richestBalance: number;
  poorestBalance: number;
}