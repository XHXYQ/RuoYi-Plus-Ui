export interface TransferVO {
  id: string | number;
  name: string;
  startDate: string;
  deptoldId: number;
  position: string;
  positionRank: string;
  deptId: number;
  positionNew: string;
  positionRanknew: string;
  endDate: string;
  remark: string;
  status?: string;
  deptName?: string;
}

export interface TransferForm extends BaseEntity {
  id?: string | number;
  name: string;
  startDate: string;
  deptoldId: number;
  position: string;
  positionRank: string;
  deptId: number;
  positionNew: string;
  positionRanknew: string;
  endDate: string;
  remark?: string;
  status?: string;
}

export interface TransferQuery extends PageQuery {
  name?: string;
  deptId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}