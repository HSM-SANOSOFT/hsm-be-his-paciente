import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as oracledb from 'oracledb';

import { DatabaseService } from '../database.service';
import { PacientesModel } from '../models';

@Injectable()
export class PacientesRepository {
  private readonly logger = new Logger();
  constructor(private readonly databaseService: DatabaseService) {}

  async getUser(IdDocs: string) {
    const results = await this.databaseService.execute<PacientesModel>(
      `SELECT * FROM PACIENTES WHERE  CEDULA = :ID`,
      [IdDocs],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (results.rows && results.rows.length > 0) {
      const data = results.rows[0];
      return data;
    } else {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No records found for ID: ${IdDocs}`,
      });
    }
  }
}
