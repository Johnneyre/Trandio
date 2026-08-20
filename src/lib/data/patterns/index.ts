import type { Pattern } from '$lib/types';
import { aceleracion } from './aceleracion';
import { bandera } from './banderas';
import { canalAlcista, canalBajista, canalLateral } from './canal';
import { cunaAscendente, cunaDescendente } from './cuna';
import { dobleSuelo } from './dobleSuelo';
import { dobleTecho } from './dobleTecho';
import { envolventeAlcista, envolventeBajista } from './envolvente';
import { hch, hchInvertido } from './hch';
import { mediasMoviles } from './mediasMoviles';
import { pitchfork, pitchforkSchiff, pitchforkSchiffMod } from './pitchfork';
import { soporteResistencia } from './soporteResistencia';
import { trianguloAscendente, trianguloDescendente, trianguloSimetrico } from './triangulos';
import { doji, estrellaFugaz, martillo } from './velasSimples';

export const PATTERNS: Pattern[] = [
  dobleTecho,
  dobleSuelo,
  hch,
  hchInvertido,
  cunaAscendente,
  cunaDescendente,
  canalAlcista,
  canalBajista,
  canalLateral,
  trianguloAscendente,
  trianguloDescendente,
  trianguloSimetrico,
  bandera,
  aceleracion,
  pitchfork,
  pitchforkSchiff,
  pitchforkSchiffMod,
  envolventeAlcista,
  envolventeBajista,
  martillo,
  estrellaFugaz,
  doji,
  mediasMoviles,
  soporteResistencia,
];
