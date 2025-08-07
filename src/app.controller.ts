import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger();
  constructor(private readonly appService: AppService) {}

  @MessagePattern('getPatient')
  async getPatient(@Payload() IdDocs: string) {
    const response = await this.appService.getPatient(IdDocs);
    this.logger.log('getPatient(): ' + JSON.stringify(response));
    return response;
  }

  @MessagePattern('getPatientPrivacyConsent')
  async getPatientPrivacyConsent(@Payload() IdDocs: string) {
    const response = await this.appService.getPatientPrivacyConsent(IdDocs);
    this.logger.log('getPatientPrivacyConsent(): ' + JSON.stringify(response));
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
