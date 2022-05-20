import watchAndRun from '../src';
import { describe, expect, it, vi } from 'vitest';

describe('vite-plugin-watch-and-run', () => {
  it('Should throw an error as no config is sent', async () => {
    const t = () => {
      watchAndRun(null);
    };
    expect(t).toThrowErrorMatchingInlineSnapshot('"plugin watchAndRun, `params` needs to be an array."');
  });

  it('Should throw an error as no watch', async () => {
    const t = () => {
      watchAndRun([{} as any]);
    };
    expect(t).toThrowErrorMatchingInlineSnapshot('"plugin watch-and-run, `watch` is missing."');
  });

  it('Should throw an error as no run', async () => {
    const t = () => {
      watchAndRun([{ watch: 'hello!' } as any]);
    };
    expect(t).toThrowErrorMatchingInlineSnapshot('"plugin watch-and-run, `run` is missing."');
  });

  it('Should have a valid conf, with default delay:500', async () => {
    const watch = '**/*.(gql|graphql)';
    const plugin = watchAndRun([{ watch, run: 'yarn gen' }]);

    expect(plugin.watchAndRunConf).to.have.property(watch).to.have.property('delay', 500);
  });

  it('Should have a valid conf, with delay 0', async () => {
    const watch = '**/*.(gql|graphql)';
    const plugin = watchAndRun([{ watch, run: 'yarn gen', delay: 0 }]);

    expect(plugin.watchAndRunConf).to.have.property(watch).to.have.property('delay', 0);
  });

  it('Should have a valid conf, with default watchKind:ADD / CHANGE / DELETE', async () => {
    const watch = '**/*.(gql|graphql)';
    const plugin = watchAndRun([{ watch, run: 'yarn gen' }]);

    expect(plugin.watchAndRunConf)
      .to.have.property(watch)
      .to.have.property('kind')
      .to.have.all.members(['ADD', 'CHANGE', 'DELETE']);
  });

  it('Should register all watchers', async () => {
    const watch = '**/*.(gql|graphql)';
    const plugin = watchAndRun([{ watch, run: 'yarn gen' }]);

    const server = {
      watcher: {
        on: vi.fn(),
      },
    };
    const spy = vi.spyOn(server.watcher, 'on').mockImplementation((type: 'add' | 'change' | 'delete', callback) => {
      if (type === 'add' || type === 'change' || type === 'delete') {
        // eslint-disable-next-line unicorn/no-lonely-if
        if (typeof callback === 'function') return 'registered';
      }
      return 'error';
    });
    plugin.configureServer(server);
    expect(spy).toHaveBeenCalledTimes(3);
    const operations = ['add', 'change', 'delete'];
    spy.mock.calls.forEach((call, index) => {
      expect(spy).toHaveBeenNthCalledWith(index + 1, operations[index], call[1]);
      expect(spy).toHaveNthReturnedWith(index + 1, 'registered');
    });
  });
});
