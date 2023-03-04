export interface DsapiRequestWrapper {
  requests: DsapiRequest[];
}

export interface DsapiRequest {
  op: number;
  pc: DsapiPcOuter;
  to: string;
}

export interface DsapiPc {
  pn: string;
}

export interface DsapiPcOuter extends DsapiPc {
  pch: DsapiPcOuter[] | DsapiPcInner[];
}

export interface DsapiPcInner extends DsapiPc {
  pv: string;
}
