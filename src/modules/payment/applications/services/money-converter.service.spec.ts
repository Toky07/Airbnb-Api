import { MoneyConverterService } from './money-converter.service';

describe('AmountConverterService', () => {
  it('should convert an amount to a formatted string', () => {
    const formattedAmount = MoneyConverterService.convertToCurrency(1000);
    expect(formattedAmount).toBe('10.00');
  });
});
