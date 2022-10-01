import { PairShape } from './PairShape';
import { TokenShape } from './TokenShape';
import { MasterChefShape } from './MasterChefShape';

export type UniqueID = "Token" | "Pair" | "MasterChef";
export type Shape = TokenShape | MasterChefShape | PairShape;