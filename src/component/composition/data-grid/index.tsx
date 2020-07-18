import React, { Component, memo, ReactElement } from "react";

import { ThHandle } from '../../../service/handle/table-header';
import { SortHandle } from '../../../service/handle/sort';
import { RowHandle } from '../../../service/handle/row'
import { PgnHandle } from '../../../service/handle/pagination';

import { SortBtn } from '../../prsntn/sort-btn';
import { Pagination } from '../../prsntn-grp/pagination';

// TODO: clean
import {
    IProps, IState,
    IRow, TRowCmpCls, TFn, TRowKeyPipeFn,
    rowHandleType,
} from './type';

// TODO: Move, typing
class ExpandableWrapper extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            isExpd: props.isExpdByDef
        };
    }

    onExpdChange() {
        const isExpd: boolean = !this.state.isExpd;
        this.setState({isExpd});
    }

    render() {
        const { Cmp, isExpdByDef, ...spareProps } = this.props;
        const { isExpd } = this.state;
        const cmpProps = {
            ...spareProps,
            isExpd,
            onExpdChange: this.onExpdChange.bind(this)
        };
        return <Cmp {...cmpProps} />;
    }
}

export class _DataGrid extends Component<IProps, IState> {
    readonly thHandle = new ThHandle();
    readonly pgnHandle: PgnHandle = new PgnHandle();
    readonly sortHandle: SortHandle = new SortHandle();
    readonly rowHandle: RowHandle = new RowHandle();
    readonly BASE_TB_CLS: string = 'kz-datagrid__table';

    //// Builtin API
    constructor(props: IProps) {
        super(props);
        this.state = this.createState(props);
    }

    render() {
        const { BASE_TB_CLS } = this;
        const { data: rawData, expand } = this.props;
        const { thState, sortState, sortOption, pgnOption, pgnState, rowOption } = this.state;
        const { showInitial: visiblePath } = expand;

        const data: any[] = sortState?.data || rawData;
        const onOptionChange = this.onOptionChange.bind(this);

        // Pagination
        const pgnCmpAttr = pgnOption ? this.pgnHandle.createGenericCmpAttr({
            data,
            option: pgnOption,
            state: pgnState,
            callback: onOptionChange
        }) : null;

        // Table Rows
        const { startIdx, endIdx } = pgnOption ? pgnState : {} as any;
        const tbodyTrElem: ReactElement[] = this.rowHandle.createState({
            data: pgnOption ? data.slice(startIdx, endIdx) : data,
            rows: rowOption,
            visiblePath
        });

        return (
            <div className="kz-datagrid">
                {pgnOption && <Pagination {...pgnState} {...pgnCmpAttr} />}
                <table className={`${BASE_TB_CLS} ${BASE_TB_CLS}--root`}>
                    {/* TODO: make this a component group? */}
                    {thState && <thead>
                        {thState.map((thCtxs, trIdx: number) => (
                            <tr key={trIdx}>
                                {/* TODO: make this a component group? */}
                                {thCtxs.map(({ title, sortKey, ...thProps }, thIdx: number) => {
                                    const { sortBtnAttr }: any = sortKey ? this.sortHandle.createGenericCmpAttr({
                                        data,
                                        option: sortOption,
                                        callback: onOptionChange
                                    }, sortKey) : {};
                                    return (
                                        <th key={thIdx} {...thProps}>
                                            <span>{title}</span>
                                            { sortKey && <SortBtn {...sortBtnAttr} /> }
                                        </th>
                                    );
                                })}
                            </tr>))}
                    </thead>}
                    <tbody>
                        {tbodyTrElem}
                    </tbody>
                </table>
            </div>
        );
    }

    //// Core
    // TODO: Move to Row Handle - createState ?
    transformRowOption(rows: IRow[], rowKey: string | TRowKeyPipeFn): rowHandleType.IRawRowConfig[] {
        return rows.map((row: IRow, idx: number) => {
            const is1stRowConfig: boolean = idx === 0 && typeof row[0] === 'function';
            const transformFnIdx: number = is1stRowConfig ? 0 : 1;
            const transformFn = this.getCmpTransformFn(row[transformFnIdx], rowKey);
            return (is1stRowConfig ? [transformFn] : [row[0], transformFn]) as rowHandleType.IRawRowConfig;
        });
    }

    getCmpTransformFn(RowCmp: TRowCmpCls, rowKey: string | TRowKeyPipeFn): TFn {
        const { BASE_TB_CLS } = this;

        return (itemCtx: rowHandleType.IItemCtx) => {
            const { item, itemLvl, isExpdByDef, nestedItems } = itemCtx;

            const rowProps = {
                ...itemCtx,
                key: typeof rowKey === 'string' ? item[rowKey] : rowKey(itemCtx),
                nestedTb: nestedItems ?
                    (<table className={`${BASE_TB_CLS} ${BASE_TB_CLS}--nest-${itemLvl+1}`} >
                        <tbody>{nestedItems}</tbody>
                    </table>) :
                    null
            };

            return nestedItems ?
                <ExpandableWrapper
                    isExpdByDef={isExpdByDef}
                    Cmp={RowCmp}
                    {...rowProps}
                /> :
                <RowCmp {...rowProps} />;
        };
    }

    createState(props: IProps): IState {
        const { rows, rowKey, data, sort, paginate, header } = props;
        const rowOption = rows ? this.transformRowOption(rows, rowKey ? rowKey : 'id') : null;
        const sortOption = sort ? this.sortHandle.createOption(sort) : null;
        const sortState = sort ? this.sortHandle.createState(data, sortOption) : null;
        const pgnOption = paginate ? this.pgnHandle.createOption(paginate) : null;
        const pgnState = paginate ? this.pgnHandle.createState(data, paginate) : null;
        const thState = header ? this.thHandle.createState(header) : null;

        return {
            // TODO: make option & state in one call?
            rowOption,
            sortOption,
            sortState,
            pgnOption,
            pgnState,
            thState,
        };
    }

    onOptionChange(modState): void {
        // TODO: add diff. callback
        this.setState({ ...this.state, ...modState });
    }
}

export const DataGrid = memo(_DataGrid);