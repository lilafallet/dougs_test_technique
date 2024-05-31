import { Module } from '@nestjs/common';
import { BankModule } from './modules/bank.module';

@Module({
  imports: [BankModule]
})
export class AppModule { }
