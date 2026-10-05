import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { Browser } from 'leaflet';

afterEach(cleanup);
window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
// DOM-only integration tests render vector overlays; real tiles/pan/zoom are
// verified in the browser. jsdom does not implement SVG feature detection.
Browser.svg = true;
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
// jsdom does not implement the native dialog API; the browser check covers focus/Escape.
HTMLDialogElement.prototype.showModal = function () { this.open = true; };
HTMLDialogElement.prototype.close = function () { this.open = false; };
