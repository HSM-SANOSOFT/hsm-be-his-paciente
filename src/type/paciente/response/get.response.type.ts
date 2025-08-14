import type { TipoContacto, TipoUsoContacto } from 'src/type/infoContacto.type';

export type GetPacienteResponseType = {
  id: number;
  nombres: {
    primerNombre: string;
    segundoNombre?: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  };
  identificacion: {
    tipo: string;
    numero: string;
    vigencia?: Date;
  };
  nacimiento: {
    fecha?: string;
    lugar?: string;
    nacionalidad?: string;
  };
  residencia: {
    direccion: string;
    parroquia?: string;
    canton?: string;
    provincia?: string;
  };
  contacto: [
    {
      tipo: TipoContacto;
      uso: TipoUsoContacto;
      valor: string;
    },
  ];
  sexo: string;
  estadoCivil?: string;
  ocupacion?: string;
  peso?: number;
  talla?: number;
  grupoSanguineo?: string;
  discapacidad?: {
    tiene: boolean;
    tipo?: string;
    numero?: string;
  };
  alergias?: [
    {
      tipo?: string;
      grado?: string;
    },
  ];
  aseguradora?: [
    {
      nombre?: string;
      numeroPoliza?: string;
    },
  ];
  meta: {
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
  };
};
