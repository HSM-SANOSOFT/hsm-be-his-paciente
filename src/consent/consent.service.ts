import { Injectable, Logger } from '@nestjs/common';
import type * as fhir from 'fhir/r5';
import { DatabaseRepository } from 'src/database/database.repository';
import { PacientesModel } from 'src/database/models';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);
  constructor(private readonly databaseRepository: DatabaseRepository) {}
  async getPatientConsent(
    id: string,
    category?: string,
    status?: string,
  ): Promise<fhir.Consent | fhir.Bundle> {
    const patientResult: PacientesModel =
      await this.databaseRepository.pacientesRepository.getUser(id);

    if (!category) {
      this.logger.log(`No category provided, returning patient all consent`);
    } else {
      this.logger.log(`Filtering by category: ${category}`);
    }
    switch (category) {
      case 'privacy':
        return await this.getPatientPrivacyConsent(id, patientResult, status);
      default: {
        const privacyConsent = await this.getPatientPrivacyConsent(
          id,
          patientResult,
          status,
        );
        const consents = [privacyConsent];
        return {
          resourceType: 'Bundle',
          id: 'bundle-' + new Date().getTime(),
          type: 'searchset',
          entry: consents.map(consent => ({
            resource: consent,
          })),
        };
      }
    }
  }

  async getPatientPrivacyConsent(
    id: string,
    patientResult: PacientesModel,
    status?: string,
  ): Promise<fhir.Consent> {
    const consentResult =
      await this.databaseRepository.pdpRepository.getUsersLOPD(id);

    const consentId = consentResult.ID.toString();
    const consentMeta: fhir.Meta = {
      profile: ['http://hl7.org/fhir/Consent'],
      lastUpdated: consentResult.FECHA_ACT
        ? consentResult.FECHA_ACT.toISOString()
        : new Date().toISOString(),
    };
    const consentIdentifier: Array<fhir.Identifier> = [
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
    ];

    const consentCategory: Array<fhir.CodeableConcept> = [
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
    ];

    const consentSubject: fhir.Reference = {
      reference: `Patient/${patientResult.NUMERO_HC}`,
      type: 'Patient',
      display: `${patientResult.PRIMER_NOMBRE} ${patientResult.SEGUNDO_NOMBRE} ${patientResult.APELLIDO_PATERNO} ${patientResult.APELLIDO_MATERNO}`,
    };

    const consentResource: fhir.Consent = {
      resourceType: 'Consent',
      id: consentId,
      meta: consentMeta,
      identifier: consentIdentifier,
      status: 'active',
      category: consentCategory,
      subject: consentSubject,
    };

    return consentResource;
  }
}
