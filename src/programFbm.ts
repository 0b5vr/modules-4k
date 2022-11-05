import { lazyQuadProgram } from './lazyQuadProgram';
import fbmFrag from './assets/fbm.frag?shader';

export const programFbm = lazyQuadProgram( fbmFrag );
