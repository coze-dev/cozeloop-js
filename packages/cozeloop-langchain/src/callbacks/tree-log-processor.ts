import {
  type ReadableSpan,
  type Span,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { type Context } from '@opentelemetry/api';

interface TreeSpan {
  name: string;
  id: string;
  parent?: string;
}

// 将 TreeSpan[] 转换成对象形式,方便检索
function buildTree(data: TreeSpan[]): { [key: string]: TreeSpan } {
  const treeMap: { [key: string]: TreeSpan } = {};
  data.forEach(item => {
    treeMap[item.id] = item;
  });
  return treeMap;
}

// 递归打印树状结构
function printTree(
  tree: { [key: string]: TreeSpan },
  parentId: string | undefined,
  indent = 0,
) {
  const childNodes = Object.values(tree).filter(
    node => node.parent === parentId,
  );
  childNodes.forEach(node => {
    const root = node.parent ? '-' : '🟢';
    console.log(`${'  '.repeat(indent)}${root} ${node.name} [${node.id}]`);
    printTree(tree, node.id, indent + 1);
  });
}

export class TreeLogSpanProcessor implements SpanProcessor {
  private _treeSpans: TreeSpan[] = [];

  onStart(span: Span, parentContext: Context): void {
    // no - op
  }

  onEnd(span: ReadableSpan): void {
    this._treeSpans.push({
      name: span.name,
      id: span.spanContext().spanId,
      parent: span.parentSpanId,
    });
  }

  forceFlush(): Promise<void> {
    this._treeSpans = [];
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    const tree = buildTree(this._treeSpans);
    printTree(tree, undefined);
    this._treeSpans = [];
    return Promise.resolve();
  }
}
