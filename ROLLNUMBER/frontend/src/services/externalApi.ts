import axios from 'axios';
import { clientLog } from './logger';
import { ExternalNotification } from '../types';

const EXTERNAL_URL = 'http://4.224.186.213/evaluation-service/notifications';

export const externalNotificationApi = {
  fetchExternal: async (params: {
    limit?: number;
    page?: number;
    notification_type?: string;
  }) => {
    clientLog('info', 'api', `Requesting External Notification API. type=${params.notification_type}`);
    
    try {
      const response = await axios.get<ExternalNotification[]>(EXTERNAL_URL, { params, timeout: 8000 });
      clientLog('info', 'api', `External fetch success. Count=${response.data?.length}`);
      return response.data;
    } catch (error: any) {
      clientLog('fatal', 'api', `CRITICAL - External API Failure: ${error.message}`);
      throw error;
    }
  }
};
