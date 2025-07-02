import {
  CozeloopSpanExporter,
  CozeloopSpanProcessor,
  type CozeloopSpanExporterOptions,
} from '@cozeloop/langchain/otel';

describe('CozeloopSpanProcessor', () => {
  let processor: CozeloopSpanProcessor;
  let exporterOptions: CozeloopSpanExporterOptions;

  beforeEach(() => {
    processor = new CozeloopSpanProcessor();
    exporterOptions = {
      traceEndpoint: 'https://example.com',
    };
  });

  describe('addExporter', () => {
    it('🧪 should add a new exporter', () => {
      const exporter = processor.addExporter('test', exporterOptions);
      expect(exporter).toBeInstanceOf(CozeloopSpanExporter);
      // @ts-expect-error -- skip private
      expect(processor._exporters.get('test')).toBeTruthy();
    });
  });

  describe('flushExporter', () => {
    it('🧪 should flush the corresponding exporter', async () => {
      const exporter = processor.addExporter('test', exporterOptions);
      const flushSpy = vi.spyOn(exporter, 'flush');

      await processor.flushExporter('test');
      expect(flushSpy).toHaveBeenCalled();
    });

    it('🧪 should do nothing if the exporter does not exist', async () => {
      await expect(
        processor.flushExporter('nonexistent'),
      ).resolves.not.toThrow();
    });
  });

  describe('removeExporter', () => {
    it('🧪 should flush and remove the corresponding exporter', async () => {
      const exporter = processor.addExporter('test', exporterOptions);
      const flushSpy = vi.spyOn(exporter, 'flush');

      await processor.removeExporter('test');
      expect(flushSpy).toHaveBeenCalled();
      // @ts-expect-error -- skip private
      expect(processor._exporters.has('test')).toBe(false);
    });

    it('🧪 should do nothing if the exporter does not exist', async () => {
      await expect(
        processor.removeExporter('nonexistent'),
      ).resolves.not.toThrow();
    });
  });

  describe('forceFlush', () => {
    it('🧪 should flush all exporters', async () => {
      const exporter1 = processor.addExporter('test1', exporterOptions);
      const exporter2 = processor.addExporter('test2', exporterOptions);
      const flushSpy1 = vi.spyOn(exporter1, 'flush');
      const flushSpy2 = vi.spyOn(exporter2, 'flush');

      await processor.forceFlush();
      expect(flushSpy1).toHaveBeenCalled();
      expect(flushSpy2).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('🧪 should shut down all exporters and clear the exporters map', async () => {
      const exporter1 = processor.addExporter('test1', exporterOptions);
      const exporter2 = processor.addExporter('test2', exporterOptions);
      const shutdownSpy1 = vi.spyOn(exporter1, 'shutdown');
      const shutdownSpy2 = vi.spyOn(exporter2, 'shutdown');

      await processor.shutdown();
      expect(shutdownSpy1).toHaveBeenCalled();
      expect(shutdownSpy2).toHaveBeenCalled();
      // @ts-expect-error -- skip private
      expect(processor._exporters.size).toBe(0);
    });
  });
});
