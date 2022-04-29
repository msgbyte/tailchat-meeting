import { request } from './request';

/**
 * 获取房间状态
 */
export async function getRoomStatus(roomId: string): Promise<{
  /**
   * 在线人数
   */
  count: number;
  /**
   * 加入人数
   */
  joined: number;
}> {
  return { count: 1, joined: 1 };
  const { data } = await request.get(`/api/room-status?roomId=${roomId}`);

  return data;
}
