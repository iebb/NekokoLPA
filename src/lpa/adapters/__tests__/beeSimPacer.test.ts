/// <reference types="jest" />
import {BeeSimCommandPacer, COMMANDS_PER_BURST, COOLDOWN_MS} from '../beeSimPacer';

/** Records the waits instead of performing them, so the suite stays instant. */
function makePacer() {
  const waits: number[] = [];
  const pacer = new BeeSimCommandPacer(async ms => {
    waits.push(ms);
  });
  return {pacer, waits};
}

describe('BeeSimCommandPacer', () => {
  it('lets a full burst through without waiting', async () => {
    const {pacer, waits} = makePacer();
    for (let i = 0; i < COMMANDS_PER_BURST; i++) {
      expect(await pacer.beforeCommand()).toBe(false);
    }
    expect(waits).toEqual([]);
  });

  it('waits on the command after the burst is exhausted', async () => {
    const {pacer, waits} = makePacer();
    for (let i = 0; i < COMMANDS_PER_BURST; i++) {
      await pacer.beforeCommand();
    }
    expect(await pacer.beforeCommand()).toBe(true);
    expect(waits).toEqual([COOLDOWN_MS]);
  });

  it('counts the command that triggered the cooldown against the next burst', async () => {
    const {pacer, waits} = makePacer();
    // The cooldown command is command 1 of the new burst, so the next cooldown
    // lands one command earlier than a naive reset would put it.
    for (let i = 0; i < COMMANDS_PER_BURST + 1; i++) {
      await pacer.beforeCommand();
    }
    for (let i = 0; i < COMMANDS_PER_BURST - 1; i++) {
      expect(await pacer.beforeCommand()).toBe(false);
    }
    expect(await pacer.beforeCommand()).toBe(true);
    expect(waits).toEqual([COOLDOWN_MS, COOLDOWN_MS]);
  });

  it('restores the full allowance on reset', async () => {
    const {pacer, waits} = makePacer();
    for (let i = 0; i < COMMANDS_PER_BURST; i++) {
      await pacer.beforeCommand();
    }
    pacer.reset();
    for (let i = 0; i < COMMANDS_PER_BURST; i++) {
      expect(await pacer.beforeCommand()).toBe(false);
    }
    expect(waits).toEqual([]);
  });
});
