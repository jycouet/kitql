import { describe, expect, it } from 'vitest';
import { queryStringApprend } from '../src/queryStringApprend';

describe('kitql - helper - queryStringApprend', () => {
  it('with empty searchParams', async () => {
    const searchParams = new URLSearchParams();
    const qs = queryStringApprend(searchParams, { focus: 'Hello' });
    expect(qs).toMatchInlineSnapshot('"focus=Hello"');
  });

  it('with default searchParams', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', '7');
    const qs = queryStringApprend(searchParams, { focus: 'Hello' });
    expect(qs).toMatchInlineSnapshot('"focus=Hello&page=7"');
  });

  it('check sorting qs', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', '7');
    const qs = queryStringApprend(searchParams, { focus: 'Hello', sort: 'bestFirst' });
    expect(qs).toMatchInlineSnapshot('"focus=Hello&page=7&sort=bestFirst"');
  });
});
