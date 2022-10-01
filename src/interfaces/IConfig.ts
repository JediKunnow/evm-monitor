import { INetwork, IResolverOptions } from './';
import { DBCredentials } from '../class/base';

export interface IConfig {
    log: boolean,
    resolver: IResolverOptions,
    db: DBCredentials,
    network: string,
    networks: Array<INetwork>,
    bscscan_key: string
}