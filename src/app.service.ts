import { Injectable, Logger } from '@nestjs/common';
import type * as fhir from 'fhir/r5';

import { DatabaseRepository } from './database/database.repository';
import { PacientesModel } from './database/models';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async getPatient(id: string): Promise<fhir.Patient> {
    const patientResult: PacientesModel =
      await this.databaseRepository.pacientesRepository.getUser(id);
    const patientLopd =
      await this.databaseRepository.pdpRepository.getUsersLOPD(id);

    interface MaritalCode {
      code: string;
      display: string;
      texto: string;
    }
    const maritalCode: MaritalCode = ((): MaritalCode => {
      switch (patientResult.ESTADO_CIVIL) {
        case 'DVC':
          return { code: 'D', display: 'Divorced', texto: 'Divorciado' };
        case 'SOL':
          return { code: 'S', display: 'Never Married', texto: 'Soltero' };
        case 'VDO':
          return { code: 'W', display: 'Widowed', texto: 'Viudo' };
        case 'CAS':
          return { code: 'M', display: 'Married', texto: 'Casado' };
        default:
          return { code: 'UN', display: 'Unknown', texto: 'Desconocido' };
      }
    })();
    const patientId = patientResult.CEDULA;
    const patientMeta: fhir.Meta = {
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      lastUpdated: new Date().toISOString(),
    };
    const patientIdentifier: Array<fhir.Identifier> = [
      {
        use: 'official',
        system: 'N',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'NI',
              display: 'National unique individual identifier',
            },
          ],
        },
        value: patientResult.CEDULA,
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical record number',
            },
          ],
        },
        value: patientResult.NUMERO_HC.toString(),
      },
    ];

    const patientName: Array<fhir.HumanName> = [
      {
        family: `${patientResult.APELLIDO_PATERNO} ${patientResult.APELLIDO_MATERNO}`,
        _family: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/humanname-fathers',
              valueString: patientResult.APELLIDO_PATERNO,
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/humanname-mothers',
              valueString: patientResult.APELLIDO_MATERNO,
            },
          ],
        },
        given: [
          patientResult.PRIMER_NOMBRE,
          patientResult.SEGUNDO_NOMBRE,
        ].filter((name): name is string => typeof name === 'string'),
        text: `${patientResult.PRIMER_NOMBRE} ${patientResult.SEGUNDO_NOMBRE} ${patientResult.APELLIDO_PATERNO} ${patientResult.APELLIDO_MATERNO}`,
        use: 'official',
      },
    ];

    const patientBirthDate = patientResult.FECHA_NACIMIENTO
      ? patientResult.FECHA_NACIMIENTO.toISOString().split('T')[0]
      : undefined;
    const patientGender = patientResult.SEXO === 'M' ? 'male' : 'female';
    const patientTelecom: fhir.ContactPoint[] | undefined =
      patientResult.TELEFONO || patientResult.EMAIL
        ? [
            ...(patientResult.TELEFONO
              ? [
                  {
                    system: 'phone',
                    value: patientResult.TELEFONO,
                    use: 'mobile',
                  } as fhir.ContactPoint,
                ]
              : []),
            ...(patientResult.EMAIL
              ? [
                  {
                    system: 'email',
                    value: patientResult.EMAIL,
                    use: 'home',
                  } as fhir.ContactPoint,
                ]
              : []),
          ]
        : undefined;
    const patientAddress: fhir.Address[] | undefined =
      patientResult.DIRRECION_DOMICILIO || patientResult.DIRRECION_TRABAJO
        ? [
            ...(patientResult.DIRRECION_DOMICILIO
              ? [
                  {
                    use: 'home',
                    line: [patientResult.DIRRECION_DOMICILIO],
                    district: patientResult.PRQ_CNT_PRV_CODIGO,
                    city: patientResult.PRQ_CNT_CODIGO,
                    state: patientResult.PRQ_CODIGO,
                  } as fhir.Address,
                ]
              : []),
            ...(patientResult.DIRRECION_TRABAJO
              ? [
                  {
                    use: 'work',
                    line: [patientResult.DIRRECION_TRABAJO],
                  } as fhir.Address,
                ]
              : []),
          ]
        : undefined;

    const patientMaritalStatus: fhir.CodeableConcept = {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
          code: maritalCode.code,
          display: maritalCode.display,
        },
      ],
      text: maritalCode.texto,
    };
    const patientExtension: Array<fhir.Extension> = [
      // Add any necessary extensions here
    ];
    const patientLink: Array<fhir.PatientLink> = [
      // Add any necessary extensions here
    ];
    const patientResource: fhir.Patient = {
      resourceType: 'Patient',
      id: patientId,
      meta: patientMeta,
      identifier: patientIdentifier,
      active: true,
      name: patientName,
      birthDate: patientBirthDate,
      gender: patientGender,
      telecom: patientTelecom,
      address: patientAddress,
      maritalStatus: patientMaritalStatus,
      link: patientLink,
    };
    return patientResource;
  }

  async createUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseRepository.pdpRepository.createUserLOPD(data);
  }

  async updateUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseRepository.pdpRepository.updateUserLOPD(data);
  }
}
