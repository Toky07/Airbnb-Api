import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceSequenceOrmEntity } from '@src/modules/invoice/infrastructure/entities/invoice-sequence.orm-entity';

@Injectable()
export class InvoiceSequenceRepository {
  constructor(
    @InjectRepository(InvoiceSequenceOrmEntity)
    private readonly repository: Repository<InvoiceSequenceOrmEntity>,
  ) {}

  async getNextNumber(year: number): Promise<number> {
    return this.repository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(InvoiceSequenceOrmEntity);
      let sequence = await repo.findOne({ where: { year } });

      if (!sequence) {
        sequence = repo.create({ year, lastNumber: 0 });
      }

      sequence.lastNumber += 1;
      await repo.save(sequence);
      return sequence.lastNumber;
    });
  }
}
