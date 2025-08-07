export class PdpModel {
  constructor(
    public ID: number,
    public TIPO: string,
    public CEDULA: string,
    public STATUS: string,
    public FECHA: Date,
    public EMAIL?: string,
    public TIPO_ENVIO?: string,
    public USUARIO?: string,
    public FECHA_ACT?: Date,
  ) {}
}
