import { Token, Pair, MasterChef } from '../entities';
import { IToken, IPair, UniqueID, IMasterChef } from '../shapes';

export class EntityFactory {
    static issue(type: UniqueID, data: IToken | IPair | IMasterChef) {
        switch(type) {
            case 'Token':
                return new Token(data);
            case 'Pair':
                return new Pair(data);
            case 'MasterChef':
                return new MasterChef(data);
        }
    }
}