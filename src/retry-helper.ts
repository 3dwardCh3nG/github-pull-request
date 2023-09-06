import * as core from '@actions/core';
import { ErrorMessages } from './message';
import { IWorkflowUtils, WorkflowUtils } from './workflow-utils';

export interface IRetryHelper {
  execute<T>(action: (...vars: unknown[]) => Promise<T>): Promise<T>;
}

// export class RetryHelper implements IRetryHelper {
export class RetryHelper implements IRetryHelper {
  private readonly workflowUtils: IWorkflowUtils;
  private readonly maxAttempts: number;
  private readonly minSeconds: number | undefined;
  private readonly maxSeconds: number | undefined;
  private readonly attemptsInterval: number | undefined;

  constructor(
    maxAttempts: number,
    minSeconds: number | undefined,
    maxSeconds: number | undefined,
    attemptsInterval: number | undefined
  ) {
    this.workflowUtils = new WorkflowUtils();

    this.maxAttempts = maxAttempts;
    this.minSeconds =
      minSeconds === undefined ? undefined : Math.floor(minSeconds);
    this.maxSeconds =
      maxSeconds === undefined ? undefined : Math.floor(maxSeconds);
    this.attemptsInterval =
      attemptsInterval === undefined ? undefined : Math.floor(attemptsInterval);
    if (
      this.minSeconds &&
      this.maxSeconds &&
      this.minSeconds > this.maxSeconds
    ) {
      throw new Error(ErrorMessages.RETRY_HELPER_MIN_SECONDS_MAX_SECONDS_ERROR);
    }
  }

  async execute<T>(action: (...vars: unknown[]) => Promise<T>): Promise<T> {
    let attempt: number = 1;
    while (attempt < this.maxAttempts) {
      // Try
      try {
        return await action();
      } catch (err) {
        core.info(this.workflowUtils.getErrorMessage(err));
      }

      // Sleep
      const seconds: number = this.getSleepAmount();
      core.info(`Waiting ${seconds} seconds before trying again`);
      await this.sleep(seconds);
      attempt++;
    }

    // Last attempt
    try {
      return await action();
    } catch (err) {
      core.info(this.workflowUtils.getErrorMessage(err));
      throw err;
    }
  }

  private getSleepAmount(): number {
    if (this.attemptsInterval !== undefined) {
      return this.attemptsInterval;
    }
    if (this.minSeconds === undefined || this.maxSeconds === undefined) {
      throw Error(
        "minSeconds and maxSeconds cannot be undefined when attemptsInterval isn't provided"
      );
    }
    return (
      Math.floor(Math.random() * (this.maxSeconds - this.minSeconds + 1)) +
      this.minSeconds
    );
  }

  private async sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
}
