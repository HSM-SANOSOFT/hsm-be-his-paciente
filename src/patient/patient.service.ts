import { Core } from '@hsm-sanosoft/hsm-types';
import { ContactoCode } from '@hsm-sanosoft/hsm-types/dist/core/contacto';
import { NacionalidadCode } from '@hsm-sanosoft/hsm-types/dist/core/demografica';
import { DocumentoIdentidadCode } from '@hsm-sanosoft/hsm-types/dist/core/documento_identidad';
import {
  InfoContacto,
  InfoIdentificacion,
  InfoNacimiento,
  InfoNombres,
  InfoResidencia,
} from '@hsm-sanosoft/hsm-types/dist/core/informacion';
import {
  Metadata,
  SuccessResponse,
} from '@hsm-sanosoft/hsm-types/dist/core/response';
import { Paciente } from '@hsm-sanosoft/hsm-types/dist/domain/his';
import { Injectable, Logger } from '@nestjs/common';
import type * as fhir from 'fhir/r5';
import { DatabaseRepository } from 'src/database/database.repository';
import { PacientesModel } from 'src/database/models';
import { GetPatientType } from 'src/type/patient';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async get(data: GetPatientType): Promise<fhir.Patient> {
    const id: number | string =
      'param' in data ? data.param.id : data.query.identifier.value;
    const patientResult: PacientesModel =
      await this.databaseRepository.pacientesRepository.getPatient(id);

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
    const patientId = patientResult.NUMERO_HC.toString();
    const patientMeta: fhir.Meta = {
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      lastUpdated: new Date().toISOString(),
      source: `api.hospitalsm.org/Patient/${patientId}`,
    };
    const patientIdentifier: Array<fhir.Identifier> = [
      {
        use: 'official',
        system: 'https://fhir.hospitalsm.org/IdentifierSystem/ni',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'NI',
              display: 'National unique individual identifier',
            },
          ],
          text: 'Documento de Identidad',
        },
        value: patientResult.CEDULA,
      },
      {
        use: 'usual',
        system: 'https://fhir.hospitalsm.org/IdentifierSystem/mr',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical record number',
            },
          ],
          text: 'Historia clínica',
        },
        assigner: {
          display: 'Hospital Santamaria',
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
                    text: `${patientResult.DIRRECION_DOMICILIO}, ${patientResult.PRQ_CNT_PRV_CODIGO}, ${patientResult.PRQ_CNT_CODIGO}, ${patientResult.PRQ_CODIGO}`,
                  } as fhir.Address,
                ]
              : []),
            ...(patientResult.DIRRECION_TRABAJO
              ? [
                  {
                    use: 'work',
                    line: [patientResult.DIRRECION_TRABAJO],
                    text: patientResult.DIRRECION_TRABAJO,
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
    interface NationalCode {
      code: string;
      display: string;
      texto: string;
    }
    const nationalityCode: NationalCode = (() => {
      switch (patientResult.NACIONALIDAD) {
        case 'ECU':
          return { code: 'ECU', display: 'Ecuador', texto: 'Ecuatoriano' };
        case 'COL':
          return { code: 'COL', display: 'Colombia', texto: 'Colombiano' };
        default:
          return {
            code: `${patientResult.NACIONALIDAD}`,
            display: 'Otro',
            texto: 'Otro',
          };
      }
    })();
    const patientExtension: Array<fhir.Extension> = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/patient-birthPlace',
        valueString: patientResult.LUGAR_NACIMIENTO,
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
        extension: [
          {
            url: 'code',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'urn:iso:std:iso:3166',
                  code: nationalityCode.code,
                  display: nationalityCode.display,
                },
              ],
              text: nationalityCode.texto,
            },
          },
        ],
      },
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
      extension: patientExtension,
    };
    return patientResource;
  }

  async getPaciente(id: number | string) {
    const patientResult: PacientesModel =
      await this.databaseRepository.pacientesRepository.getPatient(id);
    const pacienteId = patientResult.NUMERO_HC;
    const pacienteNombres: InfoNombres = {
      primerNombre: patientResult.PRIMER_NOMBRE,
      segundoNombre: patientResult.SEGUNDO_NOMBRE,
      apellidoPaterno: patientResult.APELLIDO_PATERNO,
      apellidoMaterno: patientResult.APELLIDO_MATERNO,
    };
    const pacienteIdentificacion: InfoIdentificacion = [
      {
        tipo: patientResult.TIPO_IDENTIFICACION as DocumentoIdentidadCode,
        numero: patientResult.CEDULA,
      },
    ];
    const pacienteSexo: Core.sexo.SexoCode =
      patientResult.SEXO as Core.sexo.SexoCode;
    const pacienteNacimiento: InfoNacimiento = {
      fecha: patientResult.FECHA_NACIMIENTO,
      lugar: patientResult.LUGAR_NACIMIENTO,
      nacionalidad: patientResult.NACIONALIDAD as NacionalidadCode,
    };
    const pacienteContacto: InfoContacto = [
      {
        tipo: ContactoCode.CELULAR,
        valor: patientResult.TELEFONO || '',
      },
      {
        tipo: ContactoCode.EMAIL,
        valor: patientResult.EMAIL || '',
      },
    ];
    const pacienteResidencia: InfoResidencia = [
      {
        direccion: patientResult.DIRRECION_DOMICILIO || '',
        parroquia: patientResult.PRQ_CNT_CODIGO || '',
        canton: patientResult.PRQ_CNT_PRV_CODIGO || '',
        provincia: patientResult.PRQ_CODIGO || '',
      },
    ];
    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const paciente: Paciente = {
      id: pacienteId,
      nombres: pacienteNombres,
      identificacion: pacienteIdentificacion,
      sexo: pacienteSexo,
      nacimiento: pacienteNacimiento,
      contacto: pacienteContacto,
      residencia: pacienteResidencia,
    };
    const response: SuccessResponse<Paciente> = {
      data: paciente,
      meta: metadata,
    };
    return response;
  }
}
