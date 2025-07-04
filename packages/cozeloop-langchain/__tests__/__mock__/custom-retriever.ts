import { BaseRetriever } from '@langchain/core/retrievers';
import { Document } from '@langchain/core/documents';
import type { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager';

export class CustomRetriever extends BaseRetriever {
  lc_namespace = ['langchain', 'retrievers'];

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun,
  ): Promise<Document[]> {
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // const additionalDocs = await someOtherRunnable.invoke(params, runManager?.getChild());
    return await [
      // ...additionalDocs,
      new Document({
        pageContent: `Some document pertaining to ${query}`,
        metadata: {},
      }),
      new Document({
        pageContent: `Some other document pertaining to ${query}`,
        metadata: {},
      }),
    ];
  }
}
