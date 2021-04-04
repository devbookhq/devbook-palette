import IPCService, { IPCSendChannel } from '../ipc.service';
import { AnalyticsEvent, AnalyticsPayload } from './analyticsEvent';

class AnalyticsService {
  private constructor() { }

  static async track<T extends AnalyticsEvent>(event: T, payload: AnalyticsPayload[T]) {
    IPCService.send(IPCSendChannel.AnalyticsTrack, { event, payload });
  }
}

export { AnalyticsEvent };
export default AnalyticsService;
