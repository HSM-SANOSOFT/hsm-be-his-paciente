import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsentModule } from './consent/consent.module';
import { DatabaseModule } from './database/database.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [DatabaseModule, ConsentModule, PatientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
