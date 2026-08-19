import type { Pattern } from '../../types';
import { aceleracion } from './aceleracion';
import { bandera } from './banderas';
import { canalAlcista, canalBajista, canalLateral } from './canal';
import { cunaAscendente, cunaDescendente } from './cuna';
import { dobleSuelo } from './dobleSuelo';
import { dobleTecho } from './dobleTecho';
import { envolventeAlcista, envolventeBajista } from './envolvente';
import { hch, hchInvertido } from './hch';
import { mediasMoviles } from './mediasMoviles';
import { pitchfork } from './pitchfork';
import { soporteResistencia } from './soporteResistencia';
import { trianguloAscendente, trianguloDescendente, trianguloSimetrico } from './triangulos';
import { doji, estrellaFugaz, martillo } from './velasSimples';

/** Diccionario completo de patrones de la app (vive solo en el front). */
export const PATTERNS: Pattern[] = [
  // Reversión
  dobleTecho,
  dobleSuelo,
  hch,
  hchInvertido,
  cunaAscendente,
  cunaDescendente,
  // Continuación
  canalAlcista,
  canalBajista,
  canalLateral,
  trianguloAscendente,
  trianguloDescendente,
  trianguloSimetrico,
  bandera,
  aceleracion,
  pitchfork,
  // Velas
  envolventeAlcista,
  envolventeBajista,
  martillo,
  estrellaFugaz,
  doji,
  // Indicadores y niveles
  mediasMoviles,
  soporteResistencia,
];
