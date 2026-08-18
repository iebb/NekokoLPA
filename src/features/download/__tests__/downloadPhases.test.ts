/// <reference types="jest" />
import {percentForStep, phaseForMessage, phasesFor, reportsBytes} from '../downloadPhases';

describe('phaseForMessage', () => {
  it('maps the authenticate exchange to the first phase', () => {
    expect(phaseForMessage('download.step1.es10b_get_euicc_challenge_and_info')).toBe(0);
    expect(phaseForMessage('download.step4.es9p_authenticate_client')).toBe(0);
  });

  it('maps the package fetch to the second', () => {
    expect(phaseForMessage('download.step5.es10b_prepare_download')).toBe(1);
    expect(phaseForMessage('download.step6.es9p_get_bound_profile_package')).toBe(1);
  });

  it('maps writing to the card to the third', () => {
    expect(phaseForMessage('download.step7.es10b_load_bound_profile_package')).toBe(2);
    expect(phaseForMessage('download.step8.load_bpp')).toBe(2);
    expect(phaseForMessage('download.step9.finalize')).toBe(2);
  });

  it('holds the current phase for an unrecognised message rather than rewinding', () => {
    expect(phaseForMessage('something.new', 2)).toBe(2);
    expect(phaseForMessage(undefined, 1)).toBe(1);
  });
});

describe('phasesFor', () => {
  it('marks earlier phases done and later ones pending', () => {
    expect(phasesFor(1).map(p => p.state)).toEqual(['done', 'current', 'pending']);
    expect(phasesFor(0).map(p => p.state)).toEqual(['current', 'pending', 'pending']);
  });
});

describe('percentForStep', () => {
  const step = (name: string) => `download.step9.${name}`;

  it('weights the work rather than the phase count', () => {
    // Everything before the download is the first tenth; loading the package
    // owns the rest.
    expect(percentForStep('download.step1.es10b_get_euicc_challenge_and_info')).toBe(0);
    expect(percentForStep('download.step5.es10b_prepare_download')).toBe(10);
    expect(percentForStep('download.step7.es10b_load_bound_profile_package')).toBe(15);
    expect(percentForStep(step('finalize'))).toBe(90);
    expect(percentForStep(step('finished'))).toBe(100);
  });

  it('interpolates the loading step towards 90 using its byte counts', () => {
    const msg = 'download.step8.load_bpp';
    expect(percentForStep(msg, 0, 1000)).toBe(15);
    expect(percentForStep(msg, 500, 1000)).toBe(53);
    expect(percentForStep(msg, 1000, 1000)).toBe(90);
  });

  it('accepts the transmit-suffixed variants the LPA emits', () => {
    expect(percentForStep('download.step7.es10b_load_bound_profile_package_tx_3', 0, 100)).toBe(15);
  });

  it('never goes backwards', () => {
    // The regression: loading interpolates to 90, then finalize starts lower
    // than where it ended, and the bar jumped back.
    const loaded = percentForStep('download.step8.load_bpp', 1000, 1000);
    expect(percentForStep('download.step9.finalize', undefined, undefined, loaded)).toBe(90);
    expect(percentForStep('download.step1.es10b_get_euicc_challenge_and_info', 0, 0, 42)).toBe(42);
  });

  it('holds the floor for an unrecognised step', () => {
    expect(percentForStep('download.step99.something_new', 0, 0, 55)).toBe(55);
    expect(percentForStep(undefined, 0, 0, 12)).toBe(12);
  });
});

describe('reportsBytes', () => {
  it('is true only for the steps that carry byte counts', () => {
    expect(reportsBytes('download.step8.load_bpp')).toBe(true);
    expect(reportsBytes('download.step7.es10b_load_bound_profile_package')).toBe(true);
    expect(reportsBytes('download.step5.es10b_prepare_download')).toBe(false);
    expect(reportsBytes(undefined)).toBe(false);
  });
});
