import type { PageQuery } from './common';

/* ---------------- 线束端子 ---------------- */

/** 线束列表项 */
export interface HarnessItem {
  id: number;
  harnessCode: string;
  harnessName: string;
  productCode?: string;
  materialCode?: string;
  bomHeaderId?: number;
  bomCode?: string;
  bomPosition?: string;
  docNo?: string;
  totalLength?: number;
  connectorQty?: number;
  status?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 线束分页查询入参 */
export interface HarnessQuery extends PageQuery {
  harnessCode?: string;
  productCode?: string;
  materialCode?: string;
  status?: string;
}

/** 端子明细项 */
export interface HarnessTerminalItem {
  id?: number;
  harnessId?: number;
  seqNo?: number;
  wireMaterialCode?: string;
  wireSpec?: string;
  wireColor?: string;
  wireLength?: number;
  terminalMaterialCode?: string;
  terminalName?: string;
  sheathMaterialCode?: string;
  sheathName?: string;
  fromConnector?: string;
  fromPin?: string;
  toConnector?: string;
  toPin?: string;
  assembleRequirement?: string;
  remark?: string;
}

/** 端子明细新增/编辑入参 */
export interface HarnessTerminalSaveParams {
  seqNo?: number;
  wireMaterialCode?: string;
  wireSpec?: string;
  wireColor?: string;
  wireLength?: number;
  terminalMaterialCode?: string;
  terminalName?: string;
  sheathMaterialCode?: string;
  sheathName?: string;
  fromConnector?: string;
  fromPin?: string;
  toConnector?: string;
  toPin?: string;
  assembleRequirement?: string;
  remark?: string;
}

/** 线束新增/编辑入参 */
export interface HarnessSaveParams {
  harnessCode: string;
  harnessName: string;
  productCode?: string;
  materialCode?: string;
  bomHeaderId?: number;
  bomCode?: string;
  bomPosition?: string;
  docNo?: string;
  totalLength?: number;
  connectorQty?: number;
  status?: string;
  description?: string;
  remark?: string;
  terminals?: HarnessTerminalSaveParams[];
}

/** 线束详情 */
export interface HarnessDetail {
  harness: HarnessItem;
  terminals: HarnessTerminalItem[];
}
