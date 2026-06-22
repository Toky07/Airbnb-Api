export class MoneyConverterService {
    static convertToCurrency(amount: number): string {
        return (amount / 100).toFixed(2);
    }

    static convertToCents(amount: number): number {
        return amount * 100;
    }
}
