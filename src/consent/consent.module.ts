import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';

import { ConsentService } from './consent.service';

@Module({
  providers: [ConsentService],
  exports: [ConsentService],
  imports: [DatabaseModule],
})
export class ConsentModule {}
