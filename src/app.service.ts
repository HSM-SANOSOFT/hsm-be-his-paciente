import { Injectable, Logger } from '@nestjs/common';

import { DatabaseRepository } from './database/database.repository';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async createUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseRepository.pdpRepository.createPatientLOPD(data);
  }

  async updateUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseRepository.pdpRepository.updatePatientLOPD(data);
  }
}
