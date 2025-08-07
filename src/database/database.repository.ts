import { Injectable } from '@nestjs/common';

import { PacientesRepository, PdpRepository } from './repositories';

@Injectable()
export class DatabaseRepository {
  constructor(
    public readonly pacientesRepository: PacientesRepository,
    public readonly pdpRepository: PdpRepository,
  ) {}
}
