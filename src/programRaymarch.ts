import { lazyQuadProgram } from './lazyQuadProgram';
import raymarchFrag from './assets/raymarch.frag?shader';

export const programRaymarch = lazyQuadProgram( raymarchFrag );
