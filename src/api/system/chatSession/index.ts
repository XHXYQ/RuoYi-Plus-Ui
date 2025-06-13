import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChatSessionVO, ChatSessionForm, ChatSessionQuery } from '@/api/system/chatSession/types';

/**
 * 查询会话：用于记录会话（聊天房间），支持私聊或群聊列表
 * @param query
 * @returns {*}
 */

export const listChatSession = (query?: ChatSessionQuery): AxiosPromise<ChatSessionVO[]> => {
  return request({
    url: '/system/chatSession/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询会话：用于记录会话（聊天房间），支持私聊或群聊详细
 * @param id
 */
export const getChatSession = (id: string | number): AxiosPromise<ChatSessionVO> => {
  return request({
    url: '/system/chatSession/' + id,
    method: 'get'
  });
};

/**
 * 新增会话：用于记录会话（聊天房间），支持私聊或群聊
 * @param data
 */
export const addChatSession = (data: ChatSessionForm) => {
  return request({
    url: '/system/chatSession',
    method: 'post',
    data: data
  });
};

/**
 * 修改会话：用于记录会话（聊天房间），支持私聊或群聊
 * @param data
 */
export const updateChatSession = (data: ChatSessionForm) => {
  return request({
    url: '/system/chatSession',
    method: 'put',
    data: data
  });
};

/**
 * 删除会话：用于记录会话（聊天房间），支持私聊或群聊
 * @param id
 */
export const delChatSession = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/chatSession/' + id,
    method: 'delete'
  });
};
