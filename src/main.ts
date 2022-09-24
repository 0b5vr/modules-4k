import { HEIGHT, WIDTH } from './constants';
import { button, canvas } from './ui';
import { playMusic } from './music';
import { render } from './render';

canvas.width = WIDTH;
canvas.height = HEIGHT;

function update(): void {
  requestAnimationFrame( update );
  render();
}

button.onclick = () => {
  canvas.requestFullscreen();
  playMusic();
  update();
};
