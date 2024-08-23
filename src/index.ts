import { run } from './main';
import { setFailed } from '@actions/core';

run().catch((e: unknown) => {
    console.error(e);
    setFailed(e as Error);
});
