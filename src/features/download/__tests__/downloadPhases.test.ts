/// <reference types="jest" />
import {percentFor, phaseForMessage, phasesFor} from '../downloadPhases';

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

describe('percentFor', () => {
  it('sits at the phase boundary when there is no sub-progress', () => {
    expect(percentFor(0)).toBe(0);
    expect(percentFor(1)).toBe(33);
    expect(percentFor(2)).toBe(67);
  });

  it('fills within the phase when the LPA reports bytes', () => {
    expect(percentFor(2, 0, 100)).toBe(67);
    expect(percentFor(2, 50, 100)).toBe(83);
    expect(percentFor(2, 100, 100)).toBe(100);
  });

  it('never exceeds the phase span when progress overshoots', () => {
    expect(percentFor(2, 500, 100)).toBe(100);
  });
});
