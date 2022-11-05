import { lazyQuadProgram } from './lazyQuadProgram';
import musicFrag from './assets/music.frag?shader';

export const programMusic = lazyQuadProgram( musicFrag );
