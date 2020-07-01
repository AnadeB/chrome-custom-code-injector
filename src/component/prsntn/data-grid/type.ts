import { ReactElement } from "react";
import * as clpsType from '../../../service/handle/collapse/type';
import * as pgnType from '../../../service/handle/paginate/type';
import { PgnOption } from '../../../service/handle/paginate';

//// Props
export interface IProps extends React.HTMLAttributes<HTMLElement> {
    data: any[];
    rows: IRow[];
    type?: TGridType;
    header?: IHeaderOption[];
    nesting?: INestOption;
    sort?: ISortOption;
    paginate?: IPgnOption;
}

export type TCmpCls = React.FC<any> | React.ComponentClass<any>;

export type TGridType = 'table' | 'list';

export interface IPgnOption extends Partial<PgnOption> {}

export interface ISortOption {
    key: string;
    isAsc?: boolean;
}

export interface INestOption {
    showInitial?: clpsType.TVisibleNestablePath;
    showOnePerLvl?: boolean;
}

export interface IRow extends Array<any> {
    0: string | TCmpCls;
    1?: TCmpCls;
}

export interface IHeaderOption {
    title: string;
    subHeader?: IHeaderOption[]
}

//// State
export interface IState {
    nestState: TNestState;
    sortState: ISortState;
    pgnState: IPgnState;
}

export type TNestState = Record<string, boolean>;

export interface ISortState {
    option: ISortOption;
    data: any[];
}

export interface IPgnState {
    option: PgnOption;
    status: pgnType.IPgnState;
}

export interface INestedRowProps extends React.HTMLAttributes<HTMLElement> {
    item: {[k: string]: any};
    nestedRow?: ReactElement;
}

/// Method Params
export interface ITbHeaderRowInfo {
    title: string;
    ownColSum?: number;
}

export interface ITbHeaderRowInfoCache {
    slots: ITbHeaderRowInfo[][];
    grossColSum: number;
}

//// Internal Component Props
export type TFn = (...args: any[]) => any;

export interface IClpsProps {
    isNestedOpen?: boolean;
    onCollapseChanged?: TFn;
}

//// Reexport
export {PgnOption as PgnOption};
export {pgnType as pgnType};
export {clpsType as clpsType};