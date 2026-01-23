// Utility functions for installment calculations

export interface InstallmentInfo {
  installments: number;
  value: number;
  interestFree: boolean;
}

/**
 * Calculate installment options for a given price
 * Returns up to 10x installment options with no interest
 */
export const calculateInstallments = (price: number): InstallmentInfo[] => {
  if (!price || price <= 0) return [];
  
  const options: InstallmentInfo[] = [];
  const maxInstallments = 10;
  const minInstallmentValue = 10; // Minimum installment value of R$ 10
  
  for (let i = 1; i <= maxInstallments; i++) {
    const installmentValue = price / i;
    if (installmentValue >= minInstallmentValue) {
      options.push({
        installments: i,
        value: installmentValue,
        interestFree: true
      });
    }
  }
  
  return options;
};

/**
 * Format price to Brazilian currency
 */
export const formatPrice = (value: number): string => {
  return value.toFixed(2).replace('.', ',');
};

/**
 * Get the best installment option (highest number of installments)
 */
export const getBestInstallment = (price: number): InstallmentInfo | null => {
  const options = calculateInstallments(price);
  return options.length > 0 ? options[options.length - 1] : null;
};

/**
 * Format installment display text
 */
export const formatInstallmentText = (info: InstallmentInfo): string => {
  return `${info.installments}x de R$ ${formatPrice(info.value)}${info.interestFree ? ' sem juros' : ''}`;
};
