import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConsentModule } from './consent/consent.module';

@Module({
  imports: [DatabaseModule, ConsentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
