import { cozeLoopTracer } from '@cozeloop/ai';

import { runModel, runRoot, runCustom } from './simple';
import { runMultiModality } from './multi-modality';
import { runLargeText } from './large-text';

// initialize tracer globally
cozeLoopTracer.initialize({
  /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
  // workspaceId: 'your_workspace_id',
  apiClient: {
    // baseURL: 'https://api.coze.cn',
    // token: 'your_api_token',
    headers: { 'x-tt-env': 'boe_commercial' }, // TODO: remove
  },
  /** Allow ultra long text report */
  ultraLargeReport: true,
});

export async function run() {
  await Promise.all([
    runRoot(),
    runCustom(),
    runModel(),
    runMultiModality(),
    runLargeText(),
  ]);
}
