import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetPatientType } from 'src/type/patient';

import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
  private readonly logger = new Logger(PatientController.name);
  constructor(private readonly patientService: PatientService) {}

  @MessagePattern('getPatient')
  async getPatient(
    @Payload()
    payload: GetPatientType,
  ) {
    const response = await this.patientService.get(payload);
    this.logger.log('getPatient(): ' + JSON.stringify(response));
    return response;
  }
}
