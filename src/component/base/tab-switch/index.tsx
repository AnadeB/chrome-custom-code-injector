import React, { ReactElement } from "react";
import { MemoComponent } from '../../extendable/memo-component';
import { inclStaticIcon } from '../../static/icon';
import { IProps, IState, ITabItem } from './type';



export class TabSwitch extends MemoComponent<IProps, IState> {
    readonly powerIcon: ReactElement = inclStaticIcon('power');
    readonly liBaseCls: string = 'tab-switch__item';
    readonly rdoCls: string = 'tab-switch__rdo';
    readonly cbCls: string = 'tab-switch__checkbox';

    constructor(props: IProps) {
        super(props);
        const { list, activeIdx } = props;
        this.state = this.getInitialState(list, activeIdx);
        this.onRdoChecked = this.onRdoChecked.bind(this);
        this.onCheckboxChanged = this.onCheckboxChanged.bind(this);
    }

    render() {
        const { liBaseCls, rdoCls, cbCls, powerIcon } = this;
        const { id, list, activeIdx } = this.props;
        const { hsList, hsAtvIdx, activeTab } = this.state;
        const liAtvCls: string = `${liBaseCls} ${liBaseCls}--active`;

        return hsList ?
            <ul className="tab-switch">
                {list.map((tab: ITabItem, idx: number) => {
                    // Use `activeIdx` if it is provided/valid  to compare if Tab is active
                    const isRowAtv: boolean = hsAtvIdx ? (activeIdx === idx) : (tab === activeTab);
                    const rowId: string = `${id}-${idx}`;
                    const rowCls: string = isRowAtv ? liAtvCls : liBaseCls;
                    const rowRdoId: string = `rdo-${rowId}`;
                    const rowCbId: string = `checkbox-${rowId}`;

                    return (
                        <li key={rowId} className={rowCls}>
                            <input
                                type="radio"
                                name={id}
                                id={rowRdoId}
                                defaultChecked={isRowAtv}
                                onChange={(e) => this.onRdoChecked(e, tab, idx)}
                                />
                            <label htmlFor={rowRdoId} className={rdoCls}>{tab.name}</label>
                            <input
                                type="checkbox"
                                id={rowCbId}
                                defaultChecked={tab.isEnable}
                                onChange={(e) => this.onCheckboxChanged(e, tab, idx)}
                                />
                            <label htmlFor={rowCbId} className={cbCls}>{powerIcon}</label>
                        </li>
                    );

                })}
            </ul> :
            null;
    }

    getInitialState(list: ITabItem[], activeIdx: number): IState {
        const hsList: boolean = typeof list !== 'undefined' && !!list.length;
        const hsAtvIdx: boolean = typeof activeIdx !== 'undefined' && !!list[activeIdx];
        return {
            hsList,
            hsAtvIdx,
            activeTab: hsList ? (hsAtvIdx ? list[activeIdx] : list[0]) : null
        };
    }

    onRdoChecked(evt: React.ChangeEvent<HTMLInputElement>, activeTab: ITabItem, idx: number): void {
        const isActive: boolean = this.state.activeTab === activeTab;
        if (!isActive) this.setState({activeTab});
        this.props.onTabActive?.({evt, activeTab, idx, isActive});
    }

    onCheckboxChanged(evt: React.ChangeEvent<HTMLInputElement>, tab: ITabItem, idx: number): void {
        const isActive: boolean = this.state.activeTab === tab;
        const isEnable: boolean = !tab.isEnable;
        this.props.onTabEnable?.({evt, tab, idx, isEnable, isActive});
    }

}