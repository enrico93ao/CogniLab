import catalog from '@/public/exercises/shared/catalog.json';
import {normalizeResult as validate} from '@/public/exercises/shared/result-validation.mjs';
export function normalizeResult(input:unknown){return validate(input,catalog);}
