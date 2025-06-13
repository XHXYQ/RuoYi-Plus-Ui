export interface ReplacementVO {
  id: string | number;
  replacementDate: string;
  remark: string;
  status?: string;
}

export interface ReplacementForm extends BaseEntity {
  id?: string | number;
  replacementDate?: string;
  remark?: string;
  status?: string;
}

export interface ReplacementQuery extends PageQuery {
  replacementDate?: string;
}