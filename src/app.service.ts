import { Injectable, Logger } from '@nestjs/common';

import { DatabaseRepository } from './database/database.repository';
import { PacientesModel } from './database/models';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async getPatient(IdDocs: string): Promise<fhir4.Patient> {
    const patientResult: PacientesModel =
      await this.databaseRepository.pacientesRepository.getUser(IdDocs);
    const patientLopd =
      await this.databaseRepository.pdpRepository.getUsersLOPD(IdDocs);

    interface MaritalCode {
      code: 'D' | 'S' | 'W' | 'M' | 'UN';
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

    const patientResource: fhir4.Patient = {
      resourceType: 'Patient',
      id: patientResult.NUMERO_HC.toString(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
        lastUpdated: new Date().toISOString(),
      },
      identifier: [
        {
          use: 'official',
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
      ],
      active: true,
      name: [
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
      ],
      birthDate: patientResult.FECHA_NACIMIENTO
        ? patientResult.FECHA_NACIMIENTO.toISOString().split('T')[0]
        : '',
      gender: patientResult.SEXO === 'M' ? 'male' : 'female',
      telecom: [
        {
          system: 'phone',
          value: patientResult.TELEFONO,
          use: 'mobile',
        },
        {
          system: 'email',
          value: patientResult.EMAIL,
          use: 'home',
        },
      ],
      address: [
        {
          use: 'home',
          line: [patientResult.DIRRECION_DOMICILIO || ''],
          district: patientResult.PRQ_CNT_PRV_CODIGO,
          city: patientResult.PRQ_CNT_CODIGO,
          state: patientResult.PRQ_CODIGO,
        },
        {
          use: 'work',
          line: [patientResult.DIRRECION_TRABAJO || ''],
        },
      ],
      maritalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
            code: maritalCode.code,
            display: maritalCode.display,
          },
        ],
        text: maritalCode.texto,
      },
      extension: [
        // Add any necessary extensions here
      ],
    };
    return patientResource;
  }

  async getPatientPrivacyConsent(IdDocs: string) {
    const patientResult: PacientesModel =
      await this.databaseRepository.pacientesRepository.getUser(IdDocs);
    const consentResult =
      await this.databaseRepository.pdpRepository.getUsersLOPD(IdDocs);
    const consentResource: fhir4.Consent = {
      resourceType: 'Consent',
      id: consentResult.ID.toString(),
      meta: {
        profile: ['http://hl7.org/fhir/Consent'],
        lastUpdated: consentResult.FECHA_ACT
          ? consentResult.FECHA_ACT.toISOString()
          : new Date().toISOString(),
      },
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'NI',
                display: 'National unique individual identifier',
              },
            ],
          },
          value: consentResult.CEDULA,
        },
      ],
      status: 'active',
      scope: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/consentscope',
            code: 'patient-privacy',
            display: 'Privacy Consent',
          },
        ],
        text: 'Consentimiento de privacidad del paciente',
      },
      category: [
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/consentcategorycodes',
              code: 'npp',
              display: 'Notice of Privacy Practices',
            },
          ],
          text: 'Consentimiento de privacidad',
        },
      ],
      patient: {
        reference: `Patient/${patientResult.NUMERO_HC}`,
        display: `${patientResult.PRIMER_NOMBRE} ${patientResult.SEGUNDO_NOMBRE} ${patientResult.APELLIDO_PATERNO} ${patientResult.APELLIDO_MATERNO}`,
      },
    };

    return consentResource;
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
