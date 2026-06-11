import { AmountConverterService } from "./amount-converter.service";

describe('AmountConverterService', () => {
    it('should convert an amount to a formatted string', () => {
        const formattedAmount = AmountConverterService.convert(1000);
        expect(formattedAmount).toBe('10.00');
    });
});
