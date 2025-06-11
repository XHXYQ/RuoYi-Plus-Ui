import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { 
  SysContractVO, 
  SysContractQuery, 
  SysContractForm,
  PageResult
} from '@/api/system/contract/types';

/**
 * 查询合同列表
 * @param query 查询参数
 * @returns 合同列表
 */
export const listContract = (query?: SysContractQuery): AxiosPromise<SysContractVO[]> => {
  return request({
    url: '/system/contract/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询合同分页列表
 * @param query 查询参数
 * @returns 分页合同列表
 */
export function pageContract(params: {
  name?: string;
  jobnumber?: string;
  deptId?: number;
  pageNum: number;
  pageSize: number;
}) {
  return request<{
    rows: SysContractVO[]; // 直接返回 rows 和 total
    total: number;
  }>({
    url: '/system/contract/list',
    method: 'get',
    params,
  });
}

/**
 * 查询合同详细
 * @param userId 用户ID（合同主键）
 * @returns 合同详情
 */
export const getContract = (userId: string | number): AxiosPromise<SysContractVO> => {
  return request({
    url: '/system/contract/' + userId,
    method: 'get'
  });
};

/**
 * 新增合同
 * @param data 合同表单数据
 * @returns 操作结果
 */
// 正确：使用 data 传递 JSON 请求体
export function addContract(data: SysContractForm) {
  return request({
    url: '/system/contract', // 确保路径与后端一致
    method: 'post',          // 必须用 POST
    data,                    // 关键：使用 data 而非 params
    headers: {
      'Content-Type': 'application/json' // 明确指定 JSON 类型
    }
  });
}

/**
 * 修改合同
 * @param data 合同表单数据
 * @returns 操作结果
 */
export const updateContract = (data: SysContractForm): AxiosPromise<number> => {
  return request({
    url: '/system/contract',
    method: 'put',
    data: data
  });
};

/**
 * 删除合同
 * @param userIds 用户ID或ID数组（合同主键）
 * @returns 操作结果
 */
export const delContract = (userIds: string | number | Array<string | number>) => {
  return request({
    url: '/system/contract/' + userIds,
    method: 'delete'
  });
};