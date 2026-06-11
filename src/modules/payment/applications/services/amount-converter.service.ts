export class AmountConverterService {
    static convert(amount: number): string {
        return (amount / 100).toFixed(2);
    }
}
