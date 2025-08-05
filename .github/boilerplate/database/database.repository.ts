import { Injectable } from '@nestjs/common';

import {
  CgRefCodeService,
  CrmChatMenuPrincipalRepository,
  SgiPilaresService,
  VwServiciosChatService,
} from './repositories';

@Injectable()
export class DatabaseRepository {
  constructor(
    public cgRefCodeService: CgRefCodeService,
    public sgiPilaresSerivice: SgiPilaresService,
    public vwServiciosChatService: VwServiciosChatService,
    public crmChatMenuPrincipalService: CrmChatMenuPrincipalRepository,
  ) {}
}
