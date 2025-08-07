import { PacientesRepository } from './pacientes.repository';
import { PdpRepository } from './pdp.repository';

export const DatabaseRepositories = [PacientesRepository, PdpRepository];

export * from './pacientes.repository';
export * from './pdp.repository';
