/**
 * Stand-in for SVGs imported as React components.
 *
 * `jest.config.js` maps every `*.svg` and `*.svg?react` import here, but the file
 * itself was never committed — so *every* suite failed to resolve at the first
 * icon import, before running a single assertion. Restored rather than redesigned:
 * the config's two other mocks (`fileMock`, `styleMock`) already set the shape.
 *
 * Both shapes are exported because both import styles are in use across the app —
 * `import Icon from '...svg'` (vite-plugin-svgr's default) and
 * `import { ReactComponent as Icon } from '...svg'` (CRA's).
 */
const SvgrMock = 'svg';

export default SvgrMock;
export const ReactComponent = SvgrMock;
