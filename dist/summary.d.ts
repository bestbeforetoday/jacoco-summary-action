import core from '@actions/core';
import { Coverage } from './coverage';
export declare class Summary {
    #private;
    constructor(githubSummary: typeof core.summary);
    addJobSummary(coverage: Coverage): Promise<void>;
}
