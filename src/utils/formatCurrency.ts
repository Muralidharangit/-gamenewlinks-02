/**
 * Formats numeric balance into Namibian Dollar currency format
 * Example: 250 -> "N$ 250.00"
 */
export const formatCurrency = (amount: number): string => {
  return `N$ ${amount.toFixed(2)}`;
};

/**
 * Generates a random Setup Code for mock testing
 */
export const generateRandomSetupCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) part2 += Math.floor(Math.random() * 10);
  return `WB-${part1}-${part2}`;
};

/**
 * Generates a mock ticket number
 * Example: "TKT-88421"
 */
export const generateTicketNumber = (): string => {
  const num = Math.floor(88000 + Math.random() * 999);
  return `TKT-${num}`;
};
