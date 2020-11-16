import { IAppProps } from '../../../service/handle/state/type';
import { AppState } from '../../../service/model/app-state';
import { IStateHandler } from '../../../service/state-handler/root/type';

export type IProps = IAppProps<AppState, IStateHandler>;