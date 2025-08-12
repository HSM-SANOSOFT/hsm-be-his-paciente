export type GetPatientType =
  | {
      param: { id: number };
    }
  | {
      query: {
        identifier: { system: string; value: string };
      };
    };
