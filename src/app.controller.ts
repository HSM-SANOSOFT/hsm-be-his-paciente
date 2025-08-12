import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

import { AppService } from './app.service';
import { ConsentService } from './consent/consent.service';

@Controller()
export class AppController {
  private readonly logger = new Logger();
  constructor(
    private readonly appService: AppService,
    private readonly consentService: ConsentService,
  ) {}

  @MessagePattern('getPatientConsent')
  async getPatientConsent(
    @Payload('id') id: string,
    @Payload('category') category?: string,
    @Payload('status') status?: string,
  ) {
    const response = await this.consentService.getPatientConsent(
      id,
      category,
      status,
    );
    this.logger.log('getPatientConsent(): ' + JSON.stringify(response));
    return response;
  }

  @MessagePattern('createUserLOPD')
  async createUserLOPD(
    @Payload('CEDULA') CEDULA: string,
    @Payload('STATUS') STATUS: string,
    @Payload('TIPO_ENVIO') TIPO_ENVIO: string,
  ) {
    const response = await this.appService.createUserLOPD({
      CEDULA,
      STATUS,
      TIPO_ENVIO,
    });
    this.logger.log('createUserLOPD(): ' + JSON.stringify(response));
    return response;
  }

  @MessagePattern('updateUserLOPD')
  async updateUserLOPD(
    @Payload('CEDULA') CEDULA: string,
    @Payload('STATUS') STATUS: string,
    @Payload('TIPO_ENVIO') TIPO_ENVIO: string,
  ) {
    const response = await this.appService.updateUserLOPD({
      CEDULA,
      STATUS,
      TIPO_ENVIO,
    });
    this.logger.log('updateUserLOPD(): ' + JSON.stringify(response));
    return response;
  }
}
