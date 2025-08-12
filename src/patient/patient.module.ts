import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';

import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
@Module({
  imports: [DatabaseModule],
  providers: [PatientService],
  controllers: [PatientController],
})
export class PatientModule {}
