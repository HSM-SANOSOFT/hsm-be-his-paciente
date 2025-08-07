import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as oracledb from 'oracledb';

import { DatabaseService } from '../database.service';
import { PdpModel } from '../models';

@Injectable()
export class PdpRepository {
  private readonly logger = new Logger();
  constructor(private readonly databaseService: DatabaseService) {}

  async getUsersLOPD(IdDocs: string) {
    const results = await this.databaseService.execute<PdpModel>(
      `SELECT * FROM PDP WHERE CEDULA = :ID`,
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

  async createUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    const FECHA = new Date();
    const FECHA_ACT = new Date();
    const TIPO = 'PAC';
    const resultsLOPDPrev = await this.databaseService.execute<{ NUM: number }>(
      'SELECT COUNT(*) AS NUM FROM PDP WHERE CEDULA = :ID AND TIPO_ENVIO = :TIPO_ENVIO',
      [data.CEDULA, data.TIPO_ENVIO],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const NUM = resultsLOPDPrev.rows?.[0].NUM || 0;
    if (NUM > 0) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Record already exists for ID: ${data.CEDULA}`,
      });
    }
    const resultID = await this.databaseService.execute<{ ID: number }>(
      'SELECT (X.ID)+1 AS ID FROM(SELECT P.ID FROM PDP P ORDER BY P.ID DESC)X WHERE ROWNUM=1',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const ID = resultID.rows?.[0].ID;
    if (!ID) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Failed to generate new ID for CEDULA: ${data.CEDULA}`,
      });
    }
    await this.databaseService.execute(
      `INSERT INTO PDP (ID,CEDULA, STATUS, FECHA, FECHA_ACT, TIPO_ENVIO,TIPO) VALUES (:ID,:CEDULA, :STATUS, :FECHA, :FECHA_ACT, :TIPO_ENVIO,:TIPO)`,
      [ID, data.CEDULA, data.STATUS, FECHA, FECHA_ACT, data.TIPO_ENVIO, TIPO],
      { autoCommit: true },
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: `Record created with ID: ${ID}`,
    };
  }

  async updateUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    const FECHA_ACT = new Date();
    const resultLOPDPrev = await this.databaseService.execute<{
      NUM: number;
    }>(
      'SELECT COUNT(*) AS NUM FROM PDP WHERE CEDULA = :ID AND TIPO_ENVIO = :TIPO_ENVIO',
      [data.CEDULA, data.TIPO_ENVIO],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (resultLOPDPrev.rows && resultLOPDPrev.rows.length > 0) {
      const NUM = (resultLOPDPrev.rows[0] as { NUM: number }).NUM;
      if (NUM === 0) {
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `No records found for ID: ${data.CEDULA}`,
        });
      }
      await this.databaseService.execute(
        `UPDATE PDP SET STATUS = :STATUS, FECHA_ACT = :FECHA_ACT WHERE CEDULA = :CEDULA AND TIPO_ENVIO = :TIPO_ENVIO`,
        [data.STATUS, FECHA_ACT, data.CEDULA, data.TIPO_ENVIO],
        { autoCommit: true },
      );
      return {
        statusCode: HttpStatus.OK,
        message: `Record updated for ID: ${data.CEDULA}`,
      };
    }
  }
}
