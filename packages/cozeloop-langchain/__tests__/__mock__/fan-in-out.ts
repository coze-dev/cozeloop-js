import { END, START, StateGraph, Annotation } from '@langchain/langgraph';

// see https://langchain-ai.github.io/langgraphjs/how-tos/branching/#fan-out-fan-in

const StateAnnotation = Annotation.Root({
  aggregate: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

// Create the graph
const nodeA = (state: typeof StateAnnotation.State) => ({
  aggregate: ["I'm A"],
});
const nodeB = (state: typeof StateAnnotation.State) => ({
  aggregate: ["I'm B"],
});
const nodeC = (state: typeof StateAnnotation.State) => ({
  aggregate: ["I'm C"],
});
const nodeD = (state: typeof StateAnnotation.State) => ({
  aggregate: ["I'm D"],
});

const builder = new StateGraph(StateAnnotation)
  .addNode('a', nodeA)
  .addEdge(START, 'a')
  .addNode('b', nodeB)
  .addNode('c', nodeC)
  .addNode('d', nodeD)
  .addEdge('a', 'b')
  .addEdge('a', 'c')
  .addEdge('b', 'd')
  .addEdge('c', 'd')
  .addEdge('d', END);

export const fanGraph = builder.compile();
