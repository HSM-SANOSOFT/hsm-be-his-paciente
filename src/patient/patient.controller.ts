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
    const id: number | string =
      'param' in payload ? payload.param.id : payload.query.identifier.value;
    const response = await this.patientService.getPaciente(id);
    this.logger.log('getPatient(): ' + JSON.stringify(response));
    return response;
  }
}
